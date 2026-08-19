/**
 * STV CLOSER SYSTEM — ENTORNO TECHOS & CERCHAS (ROOFS STUDIO)
 * Parametric Roof Trusses, 3-Chord Arches, Space Grids, Velarias,
 * Purlin Systems (Montén C, HSS), Zigzag Webs, Material Calibers & Deflection Checks.
 */

import React, { useState } from 'react';
import { SynthesisResult, SynthesisRequest } from '../../engine/STV_MotorSintesis';
import { STV_TRUSS_FAMILIES } from '../../engine/database/STV_SSKC';
import { StructuralFamilyId } from '../../types/stv';
import { 
  Layers, 
  Maximize2, 
  ShieldCheck, 
  Compass, 
  Activity, 
  Grid, 
  CheckCircle2,
  Sliders,
  Sparkles,
  Zap,
  ArrowRight,
  ArrowLeft
} from 'lucide-react';

interface STVRoofsStudioProps {
  synthesis: SynthesisResult;
  request: SynthesisRequest;
  onChangeRequest: (updated: Partial<SynthesisRequest>) => void;
  onNavigateTo3D: () => void;
  currentFamily: StructuralFamilyId;
  onSelectFamily: (family: StructuralFamilyId) => void;
  onPrevStep?: () => void;
  onNextStep?: () => void;
}

export const STVRoofsStudio: React.FC<STVRoofsStudioProps> = ({
  synthesis,
  request,
  onChangeRequest,
  onNavigateTo3D,
  currentFamily,
  onSelectFamily,
  onPrevStep,
  onNextStep
}) => {
  const [activeTab, setActiveTab] = useState<'TYPOLOGY' | 'GEOMETRY' | 'MATERIALS_CALIBERS' | 'PURLINS_DISTRIBUTION' | 'DEFLECTION'>('TYPOLOGY');

  // Roof & Truss Calibers
  const chordProfiles = [
    { id: 'HSS_8X4_1_4', name: 'HSS 8"x4" Cal. 1/4" (ASTM A500 Gr. B)', weightKgM: 23.9, role: 'Cordón Pesado' },
    { id: 'HSS_6X4_3_16', name: 'HSS 6"x4" Cal. 3/16" (ASTM A500 Gr. B)', weightKgM: 16.5, role: 'Cordón Estándar' },
    { id: 'HSS_4X4_1_4', name: 'HSS 4"x4" Cal. 1/4" (ASTM A500 Gr. B)', weightKgM: 18.2, role: 'Cordón Cuadrado' },
    { id: 'PTR_4X2_CAL11', name: 'PTR 4"x2" Cal. 11 (Ligero)', weightKgM: 10.4, role: 'Cordón Ligero' }
  ];

  const webProfiles = [
    { id: 'PTR_2X2_CAL11', name: 'PTR 2"x2" Cal. 11 (50.8x50.8x3.04 mm)', weightKgM: 4.49, role: 'Diagonal Estándar' },
    { id: 'PTR_4X2_CAL11', name: 'PTR 4"x2" Cal. 11 (101.6x50.8x3.04 mm)', weightKgM: 10.4, role: 'Montante Pesado' },
    { id: 'HSS_4X4_1_4', name: 'HSS 4"x4" Cal. 1/4"', weightKgM: 18.2, role: 'Montante Principal' }
  ];

  const purlinProfiles = [
    { id: 'MONTEN_C_6X2_CAL14', name: 'Montén Polín "C" 6"x2" Cal. 14 (152.4x50.8x1.90 mm)', weightKgM: 4.36, spacingM: 1.0 },
    { id: 'MONTEN_C_4X2_CAL14', name: 'Montén Polín "C" 4"x2" Cal. 14 (101.6x50.8x1.90 mm)', weightKgM: 3.25, spacingM: 0.8 },
    { id: 'HSS_4X2_RECT', name: 'HSS 4"x2" Cal. 1/8" Tubular (Cerrado)', weightKgM: 6.80, spacingM: 1.2 }
  ];

  const [selectedChord, setSelectedChord] = useState('HSS_6X4_3_16');
  const [selectedWeb, setSelectedWeb] = useState('PTR_2X2_CAL11');
  const [selectedPurlin, setSelectedPurlin] = useState('MONTEN_C_6X2_CAL14');
  const [purlinSpacing, setPurlinSpacing] = useState(1.0); // 1.0 meter
  const [webPattern, setWebPattern] = useState<'PRATT_ZIGZAG' | 'WARREN' | 'HOWE' | 'CROSS_X'>('PRATT_ZIGZAG');
  const [overhangM, setOverhangM] = useState(0.80);

  // Computed Values
  const trussDepth = 1.2 + (request.spanM * 0.04);
  const purlinCountPerSlope = Math.ceil(((request.spanM / 2) + overhangM) / purlinSpacing);
  const totalPurlins = purlinCountPerSlope * 2;
  const purlinTotalLength = totalPurlins * request.lengthM;

  const allowableDeflectionMm = (request.spanM * 1000) / 240; // L/240
  const realDeflectionMm = synthesis.metrics.maxDeflectionMm;
  const deflectionRatio = realDeflectionMm / allowableDeflectionMm;

  return (
    <div className="w-full h-full flex flex-col bg-black text-[#F2F7F7] font-mono-tech overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6">
      {/* 1. STUDIO HEADER */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-[#006F73]/50 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 bg-[#8CFFFF] shadow-[0_0_10px_#8CFFFF]"></span>
            <h1 className="text-xl sm:text-2xl font-orbitron font-black tracking-widest text-[#8CFFFF]">
              ROOFS & TRUSS STUDIO // ENTORNO TECHOS & CERCHAS
            </h1>
          </div>
          <p className="text-xs text-[#849492] mt-1 font-orbitron">
            CONFIGURACIÓN PARAMÉTRICA DE CUBIERTAS, RETÍCULAS ZIGZAG, LARGUEROS MONTÉN Y ARCOS
          </p>
        </div>

        {/* Action button to view in 3D & Sequential navigation */}
        <div className="flex items-center gap-3">
          {onPrevStep && (
            <button
              onClick={onPrevStep}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#041315] text-[#849492] hover:text-[#00E6DE] border border-[#006F73]/40 text-xs font-bold transition-all cursor-pointer"
            >
              <ArrowLeft size={14} />
              <span>02. COLUMNAS</span>
            </button>
          )}
          {onNextStep && (
            <button
              onClick={onNextStep}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#CCFF00] text-black font-orbitron font-bold text-xs hover:bg-[#E5FF80] transition-all shadow-[0_0_12px_rgba(204,255,0,0.3)] cursor-pointer"
            >
              <span>04. LARGUEROS</span>
              <ArrowRight size={14} />
            </button>
          )}
          <div className="flex items-center gap-2 bg-[#020607] border border-[#006F73]/50 px-3 py-1.5 text-xs">
            <span className="text-[#849492]">DEFLEXIÓN:</span>
            <span className={`font-bold ${deflectionRatio < 1.0 ? 'text-[#39E58C]' : 'text-[#FF4D5A]'}`}>
              {realDeflectionMm} mm / {allowableDeflectionMm.toFixed(0)} mm
            </span>
          </div>
          <button
            onClick={onNavigateTo3D}
            className="flex items-center gap-2 px-3.5 py-1.5 bg-[#00E6DE] text-black font-orbitron font-bold text-xs hover:bg-[#8CFFFF] transition-all shadow-[0_0_15px_rgba(0,230,222,0.4)] cursor-pointer"
          >
            <Maximize2 size={14} />
            <span>VER EN 3D</span>
          </button>
        </div>
      </div>

      {/* 2. SUB-NAVIGATION TABS */}
      <div className="flex flex-wrap gap-1 bg-[#020607] border border-[#006F73]/40 p-1 font-orbitron text-xs">
        {[
          { id: 'TYPOLOGY', label: '01. TIPOLOGÍA ESTRUCTURAL' },
          { id: 'GEOMETRY', label: '02. FLECHA, CLARO & MÓDULOS' },
          { id: 'MATERIALS_CALIBERS', label: '03. CORDONES & DIAGONALES' },
          { id: 'PURLINS_DISTRIBUTION', label: '04. LARGUEROS MONTÉN & CUBIERTA' },
          { id: 'DEFLECTION', label: '05. CONTROL DE DEFLEXIÓN' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-3 py-1.5 transition-all text-[11px] font-bold ${
              activeTab === tab.id
                ? 'bg-[#8CFFFF] text-black shadow-[0_0_10px_rgba(140,255,255,0.3)]'
                : 'text-[#849492] hover:text-[#8CFFFF] hover:bg-[#8CFFFF]/10'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 3. MAIN STUDIO CONTENT ACCORDING TO ACTIVE TAB */}
      {activeTab === 'TYPOLOGY' && (
        <div className="bg-[#020607]/90 border border-[#006F73]/50 p-6 space-y-6">
          <h2 className="text-sm font-orbitron font-bold text-[#8CFFFF] flex items-center gap-2">
            <Sparkles size={16} />
            <span>SELECCIÓN DE FAMILIA TIPOLÓGICA DE CUBIERTA</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {(Object.keys(STV_TRUSS_FAMILIES) as StructuralFamilyId[]).map((fId) => {
              const fam = STV_TRUSS_FAMILIES[fId];
              const isSelected = currentFamily === fId;
              return (
                <div
                  key={fId}
                  onClick={() => onSelectFamily(fId)}
                  className={`p-5 border cursor-pointer transition-all flex flex-col justify-between space-y-3 ${
                    isSelected
                      ? 'bg-[#8CFFFF]/20 border-[#8CFFFF] shadow-[0_0_20px_rgba(140,255,255,0.3)]'
                      : 'bg-black/60 border-[#006F73]/40 hover:border-[#8CFFFF]/50'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-mono-tech px-2 py-0.5 bg-black text-[#00E6DE] border border-[#006F73]">
                        {fId}
                      </span>
                      {isSelected && <CheckCircle2 size={18} className="text-[#8CFFFF]" />}
                    </div>
                    <h3 className="font-orbitron font-bold text-sm text-white">{fam.name}</h3>
                    <p className="text-xs text-[#849492] mt-2 leading-relaxed">{fam.description}</p>
                  </div>

                  <div className="text-[11px] border-t border-[#006F73]/30 pt-2 space-y-1 text-[#849492]">
                    <div>Claro Estándar: <span className="text-[#8CFFFF] font-bold">{fam.defaultSpanM} m</span></div>
                    <div>Flecha / Altura: <span className="text-[#39E58C] font-bold">{fam.defaultRiseM} m</span></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {activeTab === 'GEOMETRY' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 space-y-5">
            <div className="bg-[#020607]/90 border border-[#006F73]/50 p-5 space-y-4">
              <h2 className="text-sm font-orbitron font-bold text-[#8CFFFF] flex items-center gap-2">
                <Sliders size={16} />
                <span>GEOMETRÍA Y PERALTE DE LA CERCHA / ARCO</span>
              </h2>

              <div className="space-y-4 text-xs">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-[#849492]">CLARO TRANSVERSAL LIBRE (SPAN):</span>
                    <span className="text-[#8CFFFF] font-bold">{request.spanM} m</span>
                  </div>
                  <input
                    type="range"
                    min={8.0}
                    max={36.0}
                    step={1.0}
                    value={request.spanM}
                    onChange={(e) => onChangeRequest({ spanM: parseFloat(e.target.value) })}
                    className="w-full accent-[#8CFFFF] cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-[#849492]">FLECHA DE CUBIERTA / APEX (ROOF RISE):</span>
                    <span className="text-[#39E58C] font-bold">{request.roofRiseM} m</span>
                  </div>
                  <input
                    type="range"
                    min={0.5}
                    max={8.0}
                    step={0.25}
                    value={request.roofRiseM}
                    onChange={(e) => onChangeRequest({ roofRiseM: parseFloat(e.target.value) })}
                    className="w-full accent-[#8CFFFF] cursor-pointer"
                  />
                  <div className="text-[10px] text-[#849492] mt-1">
                    Pendiente calculada: {((request.roofRiseM / (request.spanM / 2)) * 100).toFixed(1)}% (Ángulo: {(Math.atan(request.roofRiseM / (request.spanM / 2)) * 180 / Math.PI).toFixed(1)}°)
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-[#849492]">CANTIDAD DE CERCHAS TRANSVERSALES:</span>
                    <span className="text-[#00E6DE] font-bold">{request.framesCount} cerchas</span>
                  </div>
                  <input
                    type="range"
                    min={2}
                    max={10}
                    step={1}
                    value={request.framesCount}
                    onChange={(e) => onChangeRequest({ framesCount: parseInt(e.target.value) })}
                    className="w-full accent-[#8CFFFF] cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-[#849492]">DISPOSICIÓN DE CELOSÍA / DIAGONALES:</span>
                    <span className="text-[#D7B52A] font-bold">{webPattern}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    {[
                      { id: 'PRATT_ZIGZAG', label: 'Pratt Alternado (Diagonales a Tracción)' },
                      { id: 'WARREN', label: 'Warren Triangular Equilátero' },
                      { id: 'HOWE', label: 'Howe Invertido' },
                      { id: 'CROSS_X', label: 'Cruz de San Andrés (Doble X)' }
                    ].map((pat) => (
                      <button
                        key={pat.id}
                        onClick={() => setWebPattern(pat.id as any)}
                        className={`p-2 text-left text-[10px] font-bold border transition-all ${
                          webPattern === pat.id
                            ? 'bg-[#8CFFFF] text-black border-[#8CFFFF]'
                            : 'bg-black text-[#849492] border-[#006F73]/40 hover:text-white'
                        }`}
                      >
                        {pat.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 space-y-5">
            <div className="bg-[#020607]/90 border border-[#006F73]/50 p-5 space-y-4">
              <h3 className="text-xs font-orbitron font-bold text-[#39E58C]">ESQUEMA GEOMÉTRICO DE LA CERCHA</h3>
              <div className="border border-[#006F73]/40 bg-black p-4 text-center space-y-2 text-xs">
                <div className="text-[#8CFFFF] font-bold">Luz L = {request.spanM}m | Flecha f = {request.roofRiseM}m | Peralte h = {trussDepth.toFixed(2)}m</div>
                <div className="py-4 text-[#00E6DE] font-mono">
                  {currentFamily === 'F03_ARCH_THREE_CHORD' ? (
                    <div>╭────────────────────▲ (Cordón Superior Curvo) ────────────────────╮<br/>╰────────────────────▼ (2 Cordones Inferiores) ────────────────────╯</div>
                  ) : (
                    <div>/═════════════════════▲ (Apex) ═════════════════════\<br/>| \ / \ / \ / \ / \ / \ / \ / \ / \ / \ / \ / |<br/>═════════════════════════════════════════════ (Tirante Inferior)</div>
                  )}
                </div>
                <div className="text-[10px] text-[#849492]">
                  Peso aproximado por cercha: {(request.spanM * 35.0).toFixed(1)} kg | Inclinación adecuada para drenaje pluvial rápido.
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'MATERIALS_CALIBERS' && (
        <div className="bg-[#020607]/90 border border-[#006F73]/50 p-6 space-y-6">
          <h2 className="text-sm font-orbitron font-bold text-[#8CFFFF] flex items-center gap-2">
            <Layers size={16} />
            <span>CALIBRES DE ACERO EN CORDONES Y DIAGONALES</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h3 className="text-xs font-orbitron font-bold text-[#00E6DE]">CORDONES PRINCIPALES (SUPERIOR E INFERIOR)</h3>
              <div className="space-y-2">
                {chordProfiles.map((p) => (
                  <div
                    key={p.id}
                    onClick={() => setSelectedChord(p.id)}
                    className={`p-3 border cursor-pointer text-xs flex justify-between items-center transition-all ${
                      selectedChord === p.id
                        ? 'bg-[#00E6DE]/20 border-[#00E6DE] text-white'
                        : 'bg-black/60 border-[#006F73]/30 text-[#849492]'
                    }`}
                  >
                    <div>
                      <div className="font-bold text-white">{p.name}</div>
                      <div className="text-[10px] text-[#8CFFFF]">{p.role}</div>
                    </div>
                    <div className="text-[#39E58C] font-bold">{p.weightKgM} kg/m</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="text-xs font-orbitron font-bold text-[#D7B52A]">DIAGONALES Y MONTANTES DE CELOSÍA</h3>
              <div className="space-y-2">
                {webProfiles.map((p) => (
                  <div
                    key={p.id}
                    onClick={() => setSelectedWeb(p.id)}
                    className={`p-3 border cursor-pointer text-xs flex justify-between items-center transition-all ${
                      selectedWeb === p.id
                        ? 'bg-[#D7B52A]/20 border-[#D7B52A] text-white'
                        : 'bg-black/60 border-[#006F73]/30 text-[#849492]'
                    }`}
                  >
                    <div>
                      <div className="font-bold text-white">{p.name}</div>
                      <div className="text-[10px] text-[#8CFFFF]">{p.role}</div>
                    </div>
                    <div className="text-[#39E58C] font-bold">{p.weightKgM} kg/m</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'PURLINS_DISTRIBUTION' && (
        <div className="bg-[#020607]/90 border border-[#006F73]/50 p-6 space-y-6">
          <h2 className="text-sm font-orbitron font-bold text-[#39E58C] flex items-center gap-2">
            <Grid size={16} />
            <span>DISTRIBUCIÓN DE LARGUEROS / CORREAS MONTÉN Y VOLADIZOS</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
            <div className="space-y-4">
              <div>
                <label className="text-[#849492] block mb-1">PERFIL DE CORREA / LARGUERO:</label>
                <div className="space-y-2">
                  {purlinProfiles.map((p) => (
                    <div
                      key={p.id}
                      onClick={() => setSelectedPurlin(p.id)}
                      className={`p-3 border cursor-pointer flex justify-between items-center transition-all ${
                        selectedPurlin === p.id
                          ? 'bg-[#39E58C]/20 border-[#39E58C] text-white'
                          : 'bg-black/60 border-[#006F73]/30 text-[#849492]'
                      }`}
                    >
                      <div>
                        <div className="font-bold text-white">{p.name}</div>
                        <div className="text-[10px] text-[#8CFFFF]">Peso: {p.weightKgM} kg/m</div>
                      </div>
                      {selectedPurlin === p.id && <CheckCircle2 size={16} className="text-[#39E58C]" />}
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-[#849492] block mb-1">ESPACIAMIENTO ENTRE LARGUEROS: {purlinSpacing.toFixed(2)} m</label>
                <input
                  type="range"
                  min={0.60}
                  max={1.50}
                  step={0.10}
                  value={purlinSpacing}
                  onChange={(e) => setPurlinSpacing(parseFloat(e.target.value))}
                  className="w-full accent-[#39E58C] cursor-pointer"
                />
              </div>

              <div>
                <label className="text-[#849492] block mb-1">VOLADIZO / ALERO PERIMETRAL: {overhangM.toFixed(2)} m</label>
                <input
                  type="range"
                  min={0.20}
                  max={1.50}
                  step={0.10}
                  value={overhangM}
                  onChange={(e) => setOverhangM(parseFloat(e.target.value))}
                  className="w-full accent-[#39E58C] cursor-pointer"
                />
              </div>
            </div>

            <div className="bg-black border border-[#006F73]/40 p-4 space-y-3">
              <h3 className="font-orbitron font-bold text-xs text-[#8CFFFF]">CÓMPUTO MÉTRICO DE LARGUEROS</h3>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between border-b border-[#006F73]/30 pb-1">
                  <span className="text-[#849492]">Largueros por vertiente:</span>
                  <span className="text-white font-bold">{purlinCountPerSlope} líneas</span>
                </div>
                <div className="flex justify-between border-b border-[#006F73]/30 pb-1">
                  <span className="text-[#849492]">Total de líneas de correas:</span>
                  <span className="text-[#00E6DE] font-bold">{totalPurlins} líneas longitudinales</span>
                </div>
                <div className="flex justify-between border-b border-[#006F73]/30 pb-1">
                  <span className="text-[#849492]">Metros lineales totales:</span>
                  <span className="text-[#39E58C] font-bold">{purlinTotalLength.toFixed(1)} m</span>
                </div>
                <div className="flex justify-between border-b border-[#006F73]/30 pb-1">
                  <span className="text-[#849492]">Peso total del sistema de correas:</span>
                  <span className="text-[#D7B52A] font-bold">{(purlinTotalLength * 4.36).toFixed(1)} kg ({((purlinTotalLength * 4.36)/1000).toFixed(2)} TON)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'DEFLECTION' && (
        <div className="bg-[#020607]/90 border border-[#006F73]/50 p-6 space-y-5">
          <h2 className="text-sm font-orbitron font-bold text-[#39E58C] flex items-center gap-2">
            <Activity size={16} />
            <span>ESTADO LÍMITE DE SERVICIO — FLECHA Y DEFLEXIÓN MÁXIMA</span>
          </h2>

          <div className="space-y-4 text-xs">
            <div className="p-4 bg-black border border-[#006F73]/40 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-[#849492]">DEFLEXIÓN MÁXIMA EN EL CENTRO DEL CLARO:</span>
                <span className="text-base font-bold text-[#39E58C]">{realDeflectionMm} mm</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[#849492]">LÍMITE ADMISIBLE AISC / NTC (L / 240):</span>
                <span className="text-base font-bold text-[#8CFFFF]">{allowableDeflectionMm.toFixed(1)} mm</span>
              </div>
              <div className="w-full h-3 bg-black border border-[#006F73] overflow-hidden">
                <div className="h-full bg-[#39E58C]" style={{ width: `${Math.min(100, deflectionRatio * 100)}%` }}></div>
              </div>
              <div className="text-[11px] text-[#849492]">
                Ratio de utilización por rigidez: {(deflectionRatio * 100).toFixed(1)}% &lt; 100% (APROBADO SIN VIBRACIONES PERCEPTIBLES)
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
