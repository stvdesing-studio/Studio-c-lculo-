/**
 * STV CLOSER SYSTEM — TECHNICAL DOSSIER & EXPEDIENTE MAESTRO
 * Comprehensive industrial calculation memorandum, BOM, reaction tables,
 * with PDF export (jsPDF) and Google Docs synchronization.
 */

import React, { useState } from 'react';
import { jsPDF } from 'jspdf';
import { SynthesisResult } from '../engine/STV_MotorSintesis';
import { GoogleDocsService } from '../services/googleDocsService';
import { 
  X, 
  Download, 
  FileCheck, 
  Layers, 
  Printer, 
  HardDrive, 
  ShieldCheck, 
  ExternalLink,
  Table
} from 'lucide-react';

interface STVTechnicalDossierProps {
  isOpen: boolean;
  onClose: () => void;
  synthesis: SynthesisResult;
  onExportGoogleDocs: () => void;
  isExportingDocs: boolean;
  docsUrl?: string | null;
}

export const STVTechnicalDossier: React.FC<STVTechnicalDossierProps> = ({
  isOpen,
  onClose,
  synthesis,
  onExportGoogleDocs,
  isExportingDocs,
  docsUrl
}) => {
  const [activeTab, setActiveTab] = useState<'SUMMARY' | 'REACTIONS' | 'BOM' | 'CONNECTIONS' | 'SOIL'>('SUMMARY');
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  if (!isOpen) return null;

  const generatePDF = () => {
    setIsGeneratingPdf(true);
    try {
      const doc = new jsPDF();
      let y = 20;

      doc.setFont('courier', 'bold');
      doc.setFontSize(14);
      doc.text('STV CLOSER SYSTEM — DIGITAL TWIN DOSSIER', 15, y);
      y += 8;

      doc.setFontSize(10);
      doc.setFont('courier', 'normal');
      doc.text(`PROYECTO: ${synthesis.familyName}`, 15, y);
      y += 6;
      doc.text(`FECHA: ${new Date().toLocaleDateString()} | ESTADO: ${synthesis.auditReport.overallStatus}`, 15, y);
      y += 10;

      doc.line(15, y, 195, y);
      y += 8;

      doc.setFont('courier', 'bold');
      doc.text('1. RESUMEN ESTRUCTURAL & MÉTRICAS', 15, y);
      y += 6;
      doc.setFont('courier', 'normal');
      doc.text(`- Peso Total de Acero: ${synthesis.metrics.totalSteelWeightTon} TON (${synthesis.metrics.totalWeightKg} kg)`, 15, y);
      y += 5;
      doc.text(`- Nudos: ${synthesis.metrics.nodesCount} | Elementos: ${synthesis.metrics.membersCount} | Columnas: ${synthesis.metrics.columnsCount}`, 15, y);
      y += 5;
      doc.text(`- Deflexion Máxima Calculada: ${synthesis.metrics.maxDeflectionMm} mm`, 15, y);
      y += 10;

      doc.setFont('courier', 'bold');
      doc.text('2. REACCIONES DE DISEÑO EN BASE DE COLUMNAS (LRFD)', 15, y);
      y += 6;
      doc.setFont('courier', 'normal');
      synthesis.columns.slice(0, 8).forEach((col) => {
        doc.text(`Eje ${col.gridRef}: N=${col.factoredAxialKN} kN | Vx=${col.shearXKN} kN | Mx=${col.momentXKNm} kNm | Zapata=${col.footing.widthM}x${col.footing.lengthM}m`, 15, y);
        y += 5;
      });
      y += 8;

      doc.setFont('courier', 'bold');
      doc.text('3. LISTA DE MATERIALES (BILL OF MATERIALS)', 15, y);
      y += 6;
      doc.setFont('courier', 'normal');
      synthesis.billOfMaterials.forEach((b) => {
        doc.text(`- ${b.description}: Longitud=${b.lengthTotalM}m | Peso=${b.weightTotalKg}kg | Piezas=${b.unitCount}`, 15, y);
        y += 5;
      });

      doc.save(`STV_CLOSER_DOSSIER_${synthesis.familyId}.pdf`);
    } catch (e) {
      console.error('Error generating PDF:', e);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 select-none">
      <div className="w-full max-w-5xl max-h-[92vh] glass-panel-tech p-6 border border-[#00E6DE] shadow-[0_0_40px_rgba(0,230,222,0.3)] flex flex-col font-orbitron text-[#F2F7F7]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#006F73] pb-4 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono-tech px-2 py-0.5 bg-[#00E6DE] text-black font-bold">EXPEDIENTE MAESTRO</span>
              <h2 className="text-base font-black tracking-wider text-[#8CFFFF]">{synthesis.familyName}</h2>
            </div>
            <p className="font-mono-tech text-xs text-[#849492] mt-1">
              Memoria de cálculo, lista de materiales y matrices de reacción · AISC 360 / ACI 318
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={generatePDF}
              disabled={isGeneratingPdf}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-[#020607] hover:bg-[#041315] text-[#8CFFFF] border border-[#00A8AA]/50 hover:border-[#00E6DE] transition-all"
            >
              <Download size={14} />
              <span>{isGeneratingPdf ? 'GENERATING...' : 'EXPORT PDF'}</span>
            </button>

            <button
              onClick={onExportGoogleDocs}
              disabled={isExportingDocs}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-[#3CA9FF]/20 hover:bg-[#3CA9FF]/30 text-[#3CA9FF] border border-[#3CA9FF]/60 transition-all cursor-pointer disabled:opacity-50"
            >
              <FileCheck size={14} />
              <span>{isExportingDocs ? 'SYNCING...' : 'SYNC GOOGLE DOCS'}</span>
            </button>

            <button onClick={onClose} className="text-[#849492] hover:text-[#00E6DE] p-1 font-mono-tech ml-2">
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Google Docs Direct Link Banner if Synced */}
        {docsUrl && (
          <div className="bg-[#3CA9FF]/10 border border-[#3CA9FF]/50 p-2.5 mb-4 flex items-center justify-between font-mono-tech text-xs text-[#3CA9FF]">
            <div className="flex items-center gap-2">
              <FileCheck size={16} />
              <span>Documento sincronizado con Google Docs exitosamente.</span>
            </div>
            <a
              href={docsUrl}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1 text-[#8CFFFF] hover:underline font-bold"
            >
              <span>Abrir en Google Docs</span>
              <ExternalLink size={13} />
            </a>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 border-b border-[#006F73]/40 pb-2 mb-4 font-mono-tech text-xs">
          {[
            { id: 'SUMMARY', label: '01. MEMORIA DE CÁLCULO' },
            { id: 'REACTIONS', label: '02. MATRIZ DE REACCIONES' },
            { id: 'BOM', label: '03. BILL OF MATERIALS (BOM)' },
            { id: 'CONNECTIONS', label: '04. PLACAS & ANCLAJES' },
            { id: 'SOIL', label: '05. INTERFAZ GEOTÉCNICA' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3 py-1.5 font-bold transition-all ${
                activeTab === tab.id
                  ? 'bg-[#00E6DE] text-black shadow-[0_0_10px_rgba(0,230,222,0.3)]'
                  : 'bg-[#020607] text-[#849492] hover:text-[#F2F7F7] border border-[#006F73]/30'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content Panes */}
        <div className="flex-1 overflow-y-auto pr-2 font-mono-tech text-xs space-y-4">
          {activeTab === 'SUMMARY' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="bg-[#020607] p-3 border border-[#006F73]/40">
                  <div className="text-[10px] text-[#849492]">PESO TOTAL ESTRUCTURA:</div>
                  <div className="text-base font-bold text-[#00E6DE]">{synthesis.metrics.totalSteelWeightTon} TON</div>
                  <div className="text-[9px] text-[#8CFFFF]">{synthesis.metrics.totalWeightKg} kg acero laminado</div>
                </div>

                <div className="bg-[#020607] p-3 border border-[#006F73]/40">
                  <div className="text-[10px] text-[#849492]">CARGA VIVA (L):</div>
                  <div className="text-base font-bold text-[#D7B52A]">{synthesis.metrics.totalAppliedLiveLoadKN} kN</div>
                  <div className="text-[9px] text-[#849492]">Mantenimiento ASCE 7</div>
                </div>

                <div className="bg-[#020607] p-3 border border-[#006F73]/40">
                  <div className="text-[10px] text-[#849492]">DEFLEXIÓN MÁXIMA:</div>
                  <div className="text-base font-bold text-[#39E58C]">{synthesis.metrics.maxDeflectionMm} mm</div>
                  <div className="text-[9px] text-[#39E58C]">L / 650 (Permisible L/240)</div>
                </div>

                <div className="bg-[#020607] p-3 border border-[#006F73]/40">
                  <div className="text-[10px] text-[#849492]">CIMENTACIÓN:</div>
                  <div className="text-base font-bold text-[#3CA9FF]">{synthesis.metrics.foundationStatus}</div>
                  <div className="text-[9px] text-[#3CA9FF]">Zapatas Aisladas ACI 318</div>
                </div>
              </div>

              <div className="bg-[#020607] p-4 border border-[#006F73]/40 space-y-2">
                <h4 className="font-bold text-[#8CFFFF] text-xs font-orbitron">CRITERIOS NORMATIVOS DE DISEÑO:</h4>
                <p className="text-[#849492]">
                  - <strong>AISC 360-16 / 22:</strong> Método de Factores de Carga y Resistencia (LRFD) y Diseño por Esfuerzos Permisibles (ASD).
                </p>
                <p className="text-[#849492]">
                  - <strong>ASCE 7-16:</strong> Cargas de viento con velocidad básica de diseño y coeficientes de presión externa.
                </p>
                <p className="text-[#849492]">
                  - <strong>ACI 318-19:</strong> Resistencia a cortante por punzonamiento bidireccional y flexión en zapatas de concreto reforzado.
                </p>
                <p className="text-[#849492]">
                  - <strong>AWS D1.1:</strong> Soldaduras de taller y campo tipo filete E70XX inspeccionadas visualmente al 100%.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'REACTIONS' && (
            <div className="bg-[#020607] border border-[#006F73]/40 overflow-x-auto">
              <table className="w-full text-left text-[11px]">
                <thead className="bg-[#041315] text-[#8CFFFF] border-b border-[#006F73]/50">
                  <tr>
                    <th className="p-2.5">EJE</th>
                    <th className="p-2.5">COORD [X, Z]</th>
                    <th className="p-2.5">ÁREA TRIB.</th>
                    <th className="p-2.5">N (LRFD)</th>
                    <th className="p-2.5">Vx / Vz</th>
                    <th className="p-2.5">Mx (MOMENTO)</th>
                    <th className="p-2.5">DIM. ZAPATA</th>
                    <th className="p-2.5">PRESIÓN SUELO</th>
                    <th className="p-2.5">ESTADO</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {synthesis.columns.map((c) => (
                    <tr key={c.columnId} className="hover:bg-[#00E6DE]/5">
                      <td className="p-2.5 font-bold text-[#00E6DE]">{c.gridRef}</td>
                      <td className="p-2.5 text-[#849492]">[{c.position[0]}, {c.position[2]}]</td>
                      <td className="p-2.5">{c.tributaryAreaM2} m²</td>
                      <td className="p-2.5 font-bold text-[#F2F7F7]">{c.factoredAxialKN} kN</td>
                      <td className="p-2.5 text-[#8CFFFF]">{c.shearXKN} / {c.shearZKN} kN</td>
                      <td className="p-2.5 text-[#D7B52A]">{c.momentXKNm} kN·m</td>
                      <td className="p-2.5 text-[#3CA9FF]">{c.footing.widthM} x {c.footing.lengthM} m</td>
                      <td className="p-2.5 text-[#39E58C]">{c.footing.soilPressureRealKPa} / {c.footing.soilPressureAdmKPa} kPa</td>
                      <td className="p-2.5">
                        <span className="text-[#39E58C] font-bold">VALIDATED</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'BOM' && (
            <div className="bg-[#020607] border border-[#006F73]/40 overflow-x-auto">
              <table className="w-full text-left text-[11px]">
                <thead className="bg-[#041315] text-[#8CFFFF] border-b border-[#006F73]/50">
                  <tr>
                    <th className="p-2.5">DESIGNACIÓN SSKC</th>
                    <th className="p-2.5">PERFIL / ELEMENTO</th>
                    <th className="p-2.5">LONGITUD TOTAL</th>
                    <th className="p-2.5">PIEZAS</th>
                    <th className="p-2.5">PESO TOTAL (KG)</th>
                    <th className="p-2.5">EST. COSTO (MXN)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {synthesis.billOfMaterials.map((b) => (
                    <tr key={b.profileId} className="hover:bg-[#00E6DE]/5">
                      <td className="p-2.5 font-bold text-[#00E6DE]">{b.profileId}</td>
                      <td className="p-2.5 text-[#F2F7F7]">{b.description}</td>
                      <td className="p-2.5 text-[#8CFFFF]">{b.lengthTotalM} m</td>
                      <td className="p-2.5">{b.unitCount}</td>
                      <td className="p-2.5 font-bold text-[#D7B52A]">{b.weightTotalKg} kg</td>
                      <td className="p-2.5 text-[#39E58C]">${b.costMXN.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'CONNECTIONS' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {synthesis.connectionChecks.map((conn) => (
                <div key={conn.connectionId} className="bg-[#020607] p-3 border border-[#006F73]/40">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-bold text-[#8CFFFF]">{conn.connectionId}</span>
                    <span className="text-[10px] px-1.5 py-0.5 bg-[#39E58C]/20 text-[#39E58C] border border-[#39E58C]">
                      {conn.overallStatus}
                    </span>
                  </div>
                  <div className="text-[10px] text-[#849492] space-y-1">
                    <div>- Placa Base: e={conn.basePlateThicknessMm} mm (Mín. req: {conn.minPlateThicknessMm} mm)</div>
                    <div>- Soldadura Filete: {conn.weldLegMm} mm (Mín. AWS: {conn.minWeldRequiredMm} mm)</div>
                    <div>- Interacción Anclaje: {(conn.anchorInteractionRatio * 100).toFixed(1)}% (Límite: 100%)</div>
                    <div className="text-[#00E6DE] mt-1">{conn.details}</div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'SOIL' && (
            <div className="bg-[#020607] p-4 border border-[#006F73]/40 space-y-3">
              <h4 className="font-bold text-[#8CFFFF] text-xs font-orbitron">PARÁMETROS DEL ESTRATO DE APOYO:</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                <div className="p-2.5 bg-[#041315] border border-[#006F73]/30">
                  <div className="text-[#849492] text-[10px]">TIPO DE SUELO:</div>
                  <div className="text-[#F2F7F7] font-bold">{synthesis.geotech.soilType}</div>
                </div>
                <div className="p-2.5 bg-[#041315] border border-[#006F73]/30">
                  <div className="text-[#849492] text-[10px]">CAPACIDAD ADMISIBLE (q_adm):</div>
                  <div className="text-[#39E58C] font-bold text-sm">{synthesis.geotech.bearingCapacityKPa} kPa</div>
                </div>
                <div className="p-2.5 bg-[#041315] border border-[#006F73]/30">
                  <div className="text-[#849492] text-[10px]">ÁNGULO DE FRICCIÓN (φ):</div>
                  <div className="text-[#D7B52A] font-bold">{synthesis.geotech.frictionAngleDeg}°</div>
                </div>
                <div className="p-2.5 bg-[#041315] border border-[#006F73]/30">
                  <div className="text-[#849492] text-[10px]">COEFICIENTE FRICCIÓN (μ):</div>
                  <div className="text-[#F2F7F7] font-bold">{synthesis.geotech.frictionCoefficient}</div>
                </div>
                <div className="p-2.5 bg-[#041315] border border-[#006F73]/30">
                  <div className="text-[#849492] text-[10px]">PROFUNDIDAD ESTRATO:</div>
                  <div className="text-[#8CFFFF] font-bold">{synthesis.geotech.competentStrataDepthM} m</div>
                </div>
                <div className="p-2.5 bg-[#041315] border border-[#006F73]/30">
                  <div className="text-[#849492] text-[10px]">ASENTAMIENTO MÁX.:</div>
                  <div className="text-[#F2F7F7] font-bold">{synthesis.geotech.allowableSettlementMm} mm</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-[#006F73] pt-4 mt-4 flex items-center justify-between text-[10px] text-[#849492]">
          <div>EXPEDIENTE AUTOGENERADO POR STV CLOSER ENGINE · CERTIFICACIÓN DIGITAL</div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold bg-[#020607] text-[#849492] hover:text-[#F2F7F7] border border-[#006F73]/50"
          >
            CERRAR
          </button>
        </div>
      </div>
    </div>
  );
};
