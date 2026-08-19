// ============================================================
// STV CLOSER — GOOGLE SHEETS WORKSPACE WORKSTATION MODAL
// GoogleSheetsModal.tsx
// Real-time synchronization of BOM Take-off, Cut-Lists & Reactions
// ============================================================

import React, { useState, useEffect } from 'react';
import { DSTProject } from '../../dst/dst.schema';
import { StructuralGraph } from '../../dst/structural-graph';
import {
  initAuth,
  googleSignIn,
  googleLogout,
  getAccessToken
} from '../../services/googleAuthService';
import {
  GoogleSheetsService,
  DriveSpreadsheetItem,
  GoogleSheetsExportResult
} from '../../services/googleSheetsService';
import { User } from 'firebase/auth';
import {
  X,
  FileSpreadsheet,
  ExternalLink,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  LogOut,
  Upload,
  DownloadCloud,
  FileText,
  Table,
  Layers,
  ArrowUpRight,
  ShieldCheck
} from 'lucide-react';

export interface GoogleSheetsModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: DSTProject;
  graph: StructuralGraph;
  linearMetersSummary: Map<string, number>;
  totalSteelWeightKg: number;
}

export const GoogleSheetsModal: React.FC<GoogleSheetsModalProps> = ({
  isOpen,
  onClose,
  project,
  graph,
  linearMetersSummary,
  totalSteelWeightKg
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isLoadingDrive, setIsLoadingDrive] = useState(false);
  const [lastExportResult, setLastExportResult] = useState<GoogleSheetsExportResult | null>(null);
  const [recentSheets, setRecentSheets] = useState<DriveSpreadsheetItem[]>([]);
  const [activeTab, setActiveTab] = useState<'EXPORT' | 'DRIVE_BROWSER' | 'IMPORT'>('EXPORT');
  const [confirmOverwriteOpen, setConfirmOverwriteOpen] = useState(false);
  const [manualSheetId, setManualSheetId] = useState('');
  const [readResult, setReadResult] = useState<any[][] | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Initialize auth listener
  useEffect(() => {
    const unsubscribe = initAuth(
      (authUser, authToken) => {
        setUser(authUser);
        setToken(authToken);
      },
      () => {
        setUser(null);
        setToken(null);
      }
    );
    return () => unsubscribe();
  }, []);

  // Fetch recent sheets when user signs in or opens browser tab
  useEffect(() => {
    if (user && token && isOpen) {
      loadDriveSheets();
    }
  }, [user, token, isOpen]);

  const loadDriveSheets = async () => {
    if (!token) return;
    setIsLoadingDrive(true);
    try {
      const sheets = await GoogleSheetsService.listUserSpreadsheets(token);
      setRecentSheets(sheets);
    } catch (err) {
      console.warn('Error loading recent spreadsheets:', err);
    } finally {
      setIsLoadingDrive(false);
    }
  };

  const handleSignIn = async () => {
    setIsLoggingIn(true);
    setStatusMessage(null);
    try {
      const res = await googleSignIn();
      if (res) {
        setUser(res.user);
        setToken(res.accessToken);
        setStatusMessage('Sesión iniciada con éxito en Google Workspace.');
      }
    } catch (err: any) {
      setStatusMessage(`Error de autenticación: ${err.message}`);
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleSignOut = async () => {
    await googleLogout();
    setUser(null);
    setToken(null);
    setRecentSheets([]);
    setLastExportResult(null);
    setStatusMessage('Sesión cerrada.');
  };

  const executeExport = async () => {
    if (!token) {
      await handleSignIn();
      return;
    }

    setIsExporting(true);
    setStatusMessage('Generando 6 pestañas técnicas en Google Sheets...');
    try {
      const result = await GoogleSheetsService.exportProjectToGoogleSheets(
        project,
        graph,
        linearMetersSummary,
        totalSteelWeightKg,
        token
      );
      setLastExportResult(result);
      if (result.success) {
        setStatusMessage('¡Hoja de cálculo técnica creada exitosamente en Google Drive!');
        loadDriveSheets();
      } else {
        setStatusMessage(result.message);
      }
    } catch (err: any) {
      setStatusMessage(`Error durante la exportación: ${err.message}`);
    } finally {
      setIsExporting(false);
      setConfirmOverwriteOpen(false);
    }
  };

  const handleReadSheet = async () => {
    if (!token) {
      await handleSignIn();
      return;
    }
    if (!manualSheetId.trim()) {
      setStatusMessage('Ingresa un ID o URL de Google Spreadsheet.');
      return;
    }

    // Extract ID if URL is provided
    let cleanId = manualSheetId.trim();
    const match = cleanId.match(/\/d\/([a-zA-Z0-9-_]+)/);
    if (match && match[1]) {
      cleanId = match[1];
    }

    try {
      setStatusMessage('Consultando datos de Google Sheets...');
      const data = await GoogleSheetsService.readSpreadsheetRange(cleanId, 'A1:Z50', token);
      setReadResult(data);
      setStatusMessage(`Se leyeron exitosamente ${data ? data.length : 0} filas.`);
    } catch (err: any) {
      setStatusMessage(`Error al leer hoja: ${err.message}`);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 select-none font-mono-tech">
      <div className="w-full max-w-3xl max-h-[90vh] bg-[#05080D] border border-[#00E5FF]/40 flex flex-col shadow-[0_0_50px_rgba(0,229,255,0.15)] overflow-hidden">
        {/* MODAL HEADER */}
        <div className="p-4 bg-[#020307] border-b border-[#0D1620] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[#00E5FF]/10 border border-[#00E5FF] flex items-center justify-center text-[#00E5FF]">
              <FileSpreadsheet size={18} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-orbitron font-black text-[#F2F7F7] tracking-wider">
                  GOOGLE SHEETS WORKSPACE HUB
                </h2>
                <span className="text-[9px] font-orbitron px-1.5 py-0.2 bg-[#00E5FF]/20 text-[#00E5FF] border border-[#00E5FF]/50">
                  LIVE SYNC
                </span>
              </div>
              <span className="text-[10px] text-[#8A949D]">
                Generación automática de Despiece, Cuantificación (BOM), Reacciones y Nodos 3D
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-[#8A949D] hover:text-[#00E5FF] transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* NAVIGATION TABS & USER BAR */}
        <div className="bg-[#080D14] border-b border-[#0D1620] px-4 py-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('EXPORT')}
              className={`px-3 py-1 text-[10px] font-orbitron tracking-wider transition-all ${
                activeTab === 'EXPORT'
                  ? 'bg-[#00E5FF] text-black font-bold shadow-[0_0_8px_#00E5FF]'
                  : 'text-[#8A949D] hover:text-white'
              }`}
            >
              01 EXPORTAR TWIN
            </button>
            <button
              onClick={() => setActiveTab('DRIVE_BROWSER')}
              className={`px-3 py-1 text-[10px] font-orbitron tracking-wider transition-all ${
                activeTab === 'DRIVE_BROWSER'
                  ? 'bg-[#00E5FF] text-black font-bold shadow-[0_0_8px_#00E5FF]'
                  : 'text-[#8A949D] hover:text-white'
              }`}
            >
              02 SHEETS EN DRIVE ({recentSheets.length})
            </button>
            <button
              onClick={() => setActiveTab('IMPORT')}
              className={`px-3 py-1 text-[10px] font-orbitron tracking-wider transition-all ${
                activeTab === 'IMPORT'
                  ? 'bg-[#00E5FF] text-black font-bold shadow-[0_0_8px_#00E5FF]'
                  : 'text-[#8A949D] hover:text-white'
              }`}
            >
              03 INSPECTOR & IMPORT
            </button>
          </div>

          {/* USER AUTH STATUS */}
          <div>
            {user ? (
              <div className="flex items-center gap-2 text-[10px]">
                <div className="w-2 h-2 rounded-full bg-[#39E58C] animate-pulse" />
                <span className="text-[#39E58C] font-bold truncate max-w-[150px]">{user.email}</span>
                <button
                  onClick={handleSignOut}
                  title="Cerrar sesión de Google"
                  className="p-1 hover:text-[#FF3B30] text-[#8A949D] transition-colors"
                >
                  <LogOut size={13} />
                </button>
              </div>
            ) : (
              <span className="text-[10px] text-[#FFD700]">NO AUTENTICADO</span>
            )}
          </div>
        </div>

        {/* MODAL MAIN CONTENT */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-[11px] text-[#8A949D]">
          {/* TAB 1: EXPORT DIGITAL STRUCTURAL TWIN */}
          {activeTab === 'EXPORT' && (
            <div className="space-y-5">
              {/* Not Signed In Card */}
              {!user && (
                <div className="p-4 bg-[#0B131E] border border-[#00E5FF]/30 space-y-3">
                  <div className="flex items-center gap-2 text-xs font-orbitron font-bold text-[#00E5FF]">
                    <ShieldCheck size={16} />
                    <span>CONEXIÓN CON GOOGLE WORKSPACE REQUERIDA</span>
                  </div>
                  <p className="text-[#8A949D] leading-relaxed">
                    Conecta tu cuenta de Google con permisos para Google Sheets y Google Drive para generar
                    automáticamente los libros de cálculo estructural con tablas de cuantificación, despiece para taller,
                    reacciones en zapatas y catálogo de perfiles.
                  </p>

                  {/* Standard Sign in with Google Button */}
                  <div className="pt-2">
                    <button
                      onClick={handleSignIn}
                      disabled={isLoggingIn}
                      className="inline-flex items-center gap-3 px-4 py-2.5 bg-white text-gray-800 hover:bg-gray-100 font-sans font-medium text-sm rounded shadow transition-all active:scale-95 disabled:opacity-50"
                    >
                      <svg className="w-4 h-4" viewBox="0 0 48 48">
                        <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                        <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                        <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                        <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
                      </svg>
                      <span>{isLoggingIn ? 'Iniciando sesión...' : 'Sign in with Google'}</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Breakdown of Sheets to be Created */}
              <div className="p-4 bg-[#080D14] border border-[#0D1620] space-y-3">
                <span className="text-xs font-orbitron font-bold text-[#00E5FF] block border-b border-[#111C27] pb-1">
                  ESTRUCTURA DEL LIBRO EN GOOGLE SHEETS (6 PESTAÑAS TÉCNICAS)
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-2.5 bg-[#03070D] border border-[#111C27] flex items-start gap-2.5">
                    <Table size={14} className="text-[#00E5FF] mt-0.5" />
                    <div>
                      <div className="text-[10px] font-bold text-[#F2F7F7]">01_RESUMEN_PROYECTO</div>
                      <div className="text-[9px] text-[#8A949D]">Claro, Longitud, Altura, Normas AISC/AWS, Tonalaje</div>
                    </div>
                  </div>
                  <div className="p-2.5 bg-[#03070D] border border-[#111C27] flex items-start gap-2.5">
                    <Table size={14} className="text-[#39E58C] mt-0.5" />
                    <div>
                      <div className="text-[10px] font-bold text-[#F2F7F7]">02_CUANTIFICACION_BOM</div>
                      <div className="text-[9px] text-[#8A949D]">Marcas, Roles, Perfiles, Longitudes, Pesos y Soldadura</div>
                    </div>
                  </div>
                  <div className="p-2.5 bg-[#03070D] border border-[#111C27] flex items-start gap-2.5">
                    <Table size={14} className="text-[#FFD700] mt-0.5" />
                    <div>
                      <div className="text-[10px] font-bold text-[#F2F7F7]">03_DESPIECE_TALLER</div>
                      <div className="text-[9px] text-[#8A949D]">Cortes CNC, Biseles de extremos (°), Especificación de soldador</div>
                    </div>
                  </div>
                  <div className="p-2.5 bg-[#03070D] border border-[#111C27] flex items-start gap-2.5">
                    <Table size={14} className="text-[#4CC9FF] mt-0.5" />
                    <div>
                      <div className="text-[10px] font-bold text-[#F2F7F7]">04_REACCIONES_BASES</div>
                      <div className="text-[9px] text-[#8A949D]">Axial Pu, Cortante Vu, Momento Mu, Pernos F1554 y Placa Base</div>
                    </div>
                  </div>
                  <div className="p-2.5 bg-[#03070D] border border-[#111C27] flex items-start gap-2.5">
                    <Table size={14} className="text-[#00E5FF] mt-0.5" />
                    <div>
                      <div className="text-[10px] font-bold text-[#F2F7F7]">05_NODOS_3D_TWIN</div>
                      <div className="text-[9px] text-[#8A949D]">Coordenadas espaciales X, Y, Z y conectividad de barras</div>
                    </div>
                  </div>
                  <div className="p-2.5 bg-[#03070D] border border-[#111C27] flex items-start gap-2.5">
                    <Table size={14} className="text-[#39E58C] mt-0.5" />
                    <div>
                      <div className="text-[10px] font-bold text-[#F2F7F7]">06_CATALOGO_PERFILES</div>
                      <div className="text-[9px] text-[#8A949D]">Propiedades HSS, PTR, Monten C, IPR con dimensiones reales</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Current Metrics Summary */}
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="p-2.5 bg-[#080D14] border border-[#111C27]">
                  <div className="text-[9px] text-[#5E6872]">ELEMENTOS DST</div>
                  <div className="text-sm font-bold text-[#F2F7F7]">{project.members.length} BARRAS</div>
                </div>
                <div className="p-2.5 bg-[#080D14] border border-[#111C27]">
                  <div className="text-[9px] text-[#5E6872]">PESO DE ACERO</div>
                  <div className="text-sm font-bold text-[#39E58C]">{(totalSteelWeightKg / 1000).toFixed(2)} TON</div>
                </div>
                <div className="p-2.5 bg-[#080D14] border border-[#111C27]">
                  <div className="text-[9px] text-[#5E6872]">METROS LINEALES</div>
                  <div className="text-sm font-bold text-[#00E5FF]">
                    {(Array.from(linearMetersSummary.values()) as number[]).reduce((a, b) => a + b, 0).toFixed(1)} m
                  </div>
                </div>
              </div>

              {/* Success Callout with Link to Open Google Sheets */}
              {lastExportResult && lastExportResult.success && lastExportResult.spreadsheetUrl && (
                <div className="p-4 bg-[#00E5FF]/10 border border-[#00E5FF] space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-orbitron font-bold text-[#00E5FF]">
                      <CheckCircle2 size={16} className="text-[#39E58C]" />
                      <span>HOJA DE CÁLCULO CREADA EN GOOGLE DRIVE</span>
                    </div>
                    <a
                      href={lastExportResult.spreadsheetUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1 bg-[#00E5FF] text-black font-orbitron font-bold text-[10px] flex items-center gap-1.5 hover:bg-[#4CC9FF] transition-all shadow-[0_0_10px_#00E5FF]"
                    >
                      <span>ABRIR EN GOOGLE SHEETS</span>
                      <ExternalLink size={12} />
                    </a>
                  </div>
                  <div className="text-[10px] text-[#8A949D] font-mono-tech">
                    ID: {lastExportResult.spreadsheetId}
                  </div>
                </div>
              )}

              {/* Export Trigger Button */}
              <div className="pt-2">
                <button
                  onClick={() => setConfirmOverwriteOpen(true)}
                  disabled={isExporting}
                  className="w-full py-3 bg-[#00E5FF] hover:bg-[#4CC9FF] text-black font-orbitron font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-[0_0_20px_rgba(0,229,255,0.4)] disabled:opacity-50"
                >
                  <FileSpreadsheet size={16} />
                  <span>
                    {isExporting ? 'EXPORTANDO A GOOGLE SHEETS...' : 'GENERAR & EXPORTAR A GOOGLE SHEETS'}
                  </span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: DRIVE BROWSER (RECENT USER SHEETS) */}
          {activeTab === 'DRIVE_BROWSER' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-orbitron font-bold text-[#00E5FF]">
                  HOJAS DE CÁLCULO DISPONIBLES EN GOOGLE DRIVE
                </span>
                <button
                  onClick={loadDriveSheets}
                  disabled={isLoadingDrive || !token}
                  className="px-2.5 py-1 bg-[#080D14] border border-[#111C27] hover:border-[#00E5FF] text-[10px] text-[#8A949D] hover:text-[#00E5FF] flex items-center gap-1.5 transition-all"
                >
                  <RefreshCw size={12} className={isLoadingDrive ? 'animate-spin' : ''} />
                  <span>ACTUALIZAR</span>
                </button>
              </div>

              {!user ? (
                <div className="p-6 text-center text-[#8A949D] bg-[#080D14] border border-[#111C27]">
                  Inicia sesión con Google para explorar tus hojas de cálculo en Drive.
                </div>
              ) : recentSheets.length === 0 ? (
                <div className="p-6 text-center text-[#8A949D] bg-[#080D14] border border-[#111C27]">
                  {isLoadingDrive ? 'Buscando hojas de cálculo en Google Drive...' : 'No se encontraron hojas recientes.'}
                </div>
              ) : (
                <div className="space-y-2">
                  {recentSheets.map((sh) => (
                    <div
                      key={sh.id}
                      className="p-3 bg-[#080D14] border border-[#111C27] hover:border-[#00E5FF]/60 flex items-center justify-between transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <FileSpreadsheet size={16} className="text-[#39E58C]" />
                        <div>
                          <div className="text-[11px] font-bold text-[#F2F7F7]">{sh.name}</div>
                          <div className="text-[9px] text-[#5E6872]">
                            Modificado: {new Date(sh.modifiedTime).toLocaleString()} // ID: {sh.id}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setManualSheetId(sh.id);
                            setActiveTab('IMPORT');
                          }}
                          className="px-2 py-1 bg-[#0A1119] border border-[#111C27] hover:border-[#00E5FF] text-[10px] text-[#00E5FF]"
                        >
                          INSPECCIONAR
                        </button>
                        <a
                          href={sh.webViewLink || `https://docs.google.com/spreadsheets/d/${sh.id}/edit`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 bg-[#00E5FF]/20 text-[#00E5FF] hover:bg-[#00E5FF] hover:text-black transition-all"
                          title="Abrir en Google Sheets"
                        >
                          <ExternalLink size={14} />
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: IMPORT & INSPECTOR */}
          {activeTab === 'IMPORT' && (
            <div className="space-y-4">
              <div className="p-4 bg-[#080D14] border border-[#0D1620] space-y-3">
                <span className="text-xs font-orbitron font-bold text-[#00E5FF] block border-b border-[#111C27] pb-1">
                  LEER / IMPORTAR DATOS DESDE GOOGLE SPREADSHEET
                </span>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={manualSheetId}
                    onChange={(e) => setManualSheetId(e.target.value)}
                    placeholder="Pega el Spreadsheet ID o enlace https://docs.google.com/spreadsheets/d/..."
                    className="flex-1 px-3 py-1.5 bg-[#020307] border border-[#111C27] text-white text-[10px] focus:outline-none focus:border-[#00E5FF]"
                  />
                  <button
                    onClick={handleReadSheet}
                    className="px-4 py-1.5 bg-[#00E5FF] hover:bg-[#4CC9FF] text-black font-orbitron font-bold text-[10px] flex items-center gap-1.5"
                  >
                    <Upload size={12} />
                    <span>CONSULTAR</span>
                  </button>
                </div>
              </div>

              {readResult && (
                <div className="p-4 bg-[#080D14] border border-[#0D1620] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-orbitron font-bold text-[#39E58C]">
                      VISTA PREVIA DE DATOS (PRIMERAS FILAS)
                    </span>
                    <span className="text-[9px] text-[#5E6872]">{readResult.length} registros</span>
                  </div>
                  <div className="max-h-60 overflow-x-auto overflow-y-auto border border-[#111C27]">
                    <table className="w-full text-left text-[9px] divide-y divide-[#111C27]">
                      <tbody className="divide-y divide-[#111C27]">
                        {readResult.slice(0, 15).map((row, rIdx) => (
                          <tr key={rIdx} className={rIdx === 0 ? 'bg-[#0A1119] text-[#00E5FF] font-bold' : 'hover:bg-[#060B12]'}>
                            {row.map((cell: any, cIdx: number) => (
                              <td key={cIdx} className="p-1.5 border-r border-[#111C27] whitespace-nowrap">
                                {String(cell)}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STATUS NOTIFICATION FOOTER */}
          {statusMessage && (
            <div className="p-2.5 bg-[#080D14] border border-[#00E5FF]/30 text-[10px] text-[#00E5FF] flex items-center gap-2">
              <AlertCircle size={14} className="text-[#00E5FF] shrink-0" />
              <span>{statusMessage}</span>
            </div>
          )}
        </div>

        {/* MODAL FOOTER */}
        <div className="p-4 bg-[#020307] border-t border-[#0D1620] flex items-center justify-between">
          <div className="flex items-center gap-2 text-[10px] text-[#39E58C] font-orbitron">
            <ShieldCheck size={14} />
            <span>GOOGLE SHEETS & DRIVE API v4 // LRFD COMPATIBLE</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-[#080D14] hover:bg-[#0D1620] border border-[#111C27] text-[#F2F7F7] font-orbitron text-xs transition-all"
          >
            CERRAR
          </button>
        </div>
      </div>

      {/* MANDATORY CONFIRMATION DIALOG (WORKSPACE USER CONSENT) */}
      {confirmOverwriteOpen && (
        <div className="fixed inset-0 z-60 bg-black/90 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#080D14] border border-[#00E5FF] p-6 space-y-4 shadow-2xl">
            <div className="flex items-center gap-2.5 text-[#00E5FF]">
              <FileSpreadsheet size={20} />
              <h3 className="font-orbitron font-bold text-sm text-[#F2F7F7]">
                CONFIRMAR EXPORTACIÓN A GOOGLE SHEETS
              </h3>
            </div>
            <p className="text-[11px] text-[#8A949D] leading-relaxed">
              ¿Deseas crear un nuevo libro de cálculo en tu Google Drive con el Despiece Técnico, BOM
              y Reacciones del proyecto <strong className="text-white">"{project.name}"</strong>?
            </p>
            <div className="text-[10px] text-[#00E5FF] bg-[#00E5FF]/10 p-2.5 border border-[#00E5FF]/30 space-y-1">
              <div>• Se crearán 6 hojas estructuradas (Resumen, BOM, Despiece, Reacciones, Nodos, Perfiles).</div>
              <div>• Los datos se guardarán de forma segura en tu Google Drive con tu cuenta autorizada.</div>
            </div>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setConfirmOverwriteOpen(false)}
                className="px-3 py-1.5 bg-[#05080D] border border-[#111C27] text-[#8A949D] hover:text-white text-[11px]"
              >
                CANCELAR
              </button>
              <button
                onClick={executeExport}
                className="px-4 py-1.5 bg-[#00E5FF] hover:bg-[#4CC9FF] text-black font-orbitron font-bold text-[11px] shadow-[0_0_10px_#00E5FF]"
              >
                CONFIRMAR & EXPORTAR
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
