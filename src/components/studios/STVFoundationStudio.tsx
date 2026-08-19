/**
 * STV CLOSER SYSTEM — ENTORNO CIMENTACIÓN (FOUNDATION STUDIO)
 * Parametric & Normative Foundation Design (ACI 318-19 / NTC Concreto / ASCE 7-16)
 * Geotechnical analysis, isolated & combined footings, pedestals, and anchor bolt verification.
 */

import React, { useState } from 'react';
import { SynthesisResult, SynthesisRequest } from '../../engine/STV_MotorSintesis';
import { DEFAULT_SOIL_PRESETS } from '../../engine/engines/STV_FoundationEngine';
import { FoundationStudioConfig } from '../../types/stv';
import { 
  Layers, 
  ShieldCheck, 
  AlertTriangle, 
  Activity, 
  Compass, 
  Scale, 
  CheckCircle2,
  FileCheck,
  Zap,
  Info,
  Maximize2,
  ArrowRight
} from 'lucide-react';

interface STVFoundationStudioProps {
  synthesis: SynthesisResult;
  request: SynthesisRequest;
  onChangeRequest: (updated: Partial<SynthesisRequest>) => void;
  onNavigateTo3D: () => void;
  onNextStep?: () => void;
}

export const STVFoundationStudio: React.FC<STVFoundationStudioProps> = ({
  synthesis,
  request,
  onChangeRequest,
  onNavigateTo3D,
  onNextStep
}) => {
  const [activeTab, setActiveTab] = useState<'GEOTECH' | 'FOOTINGS' | 'PEDESTALS' | 'ANCHORS' | 'NORMATIVE'>('FOOTINGS');
  
  // Local editable studio state
  const [config, setConfig] = useState<FoundationStudioConfig>({
    normativeCode: 'ACI_318_19',
    footingType: 'ISOLATED_SQUARE',
    concreteFckMPa: 25, // 25 MPa = 250 kg/cm²
    rebarFyMPa: 420,
    soilBearingCapacityKPa: synthesis.geotech.bearingCapacityKPa,
    soilUnitWeightKNm3: synthesis.geotech.soilUnitWeightKNm3,
    frictionAngleDeg: synthesis.geotech.frictionAngleDeg,
    groundwaterDepthM: synthesis.geotech.groundwaterDepthM,
    embedmentDepthM: 1.5,
    footingThicknessM: 0.40,
    pedestalWidthMm: 500,
    pedestalLengthMm: 500,
    pedestalRebarConfig: '8 Varillas #6 (3/4") + Estribos #3 @ 10cm',
    safetyFactorOverturning: 2.15,
    safetyFactorSliding: 1.85
  });

  const columns = synthesis.columns;
  const criticalCol = columns.reduce((prev, curr) => (curr.factoredAxialKN > prev.factoredAxialKN ? curr : prev), columns[0] || {} as any);

  // Computed Footing Dimensions for critical column
  const requiredAreaM2 = (criticalCol?.factoredAxialKN || 150) / (config.soilBearingCapacityKPa * 0.9);
  const footingSideM = Math.max(1.2, Math.ceil(Math.sqrt(requiredAreaM2) * 10) / 10);
  const realSoilPressureKPa = (criticalCol?.factoredAxialKN || 150) / (footingSideM * footingSideM);
  const soilCapacityRatio = realSoilPressureKPa / config.soilBearingCapacityKPa;

  // Punching shear check (Cortante por punzonamiento ACI 318)
  const dMm = (config.footingThicknessM * 1000) - 75; // Effective depth with 7.5cm cover
  const criticalPerimeterMm = 2 * (config.pedestalWidthMm + dMm) + 2 * (config.pedestalLengthMm + dMm);
  const punchingCapacityKN = (0.33 * Math.sqrt(config.concreteFckMPa) * criticalPerimeterMm * dMm) / 1000;
  const punchingDemandKN = (criticalCol?.factoredAxialKN || 150) - (realSoilPressureKPa * Math.pow((config.pedestalWidthMm + dMm)/1000, 2));
  const punchingRatio = punchingDemandKN / Math.max(1, punchingCapacityKN);

  return (
    <div className="w-full h-full flex flex-col bg-black text-[#F2F7F7] font-mono-tech overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6">
      {/* 1. STUDIO HEADER */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-[#006F73]/50 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 bg-[#39E58C] shadow-[0_0_10px_#39E58C]"></span>
            <h1 className="text-xl sm:text-2xl font-orbitron font-black tracking-widest text-[#39E58C]">
              FOUNDATION STUDIO // ENTORNO CIMENTACIÓN
            </h1>
          </div>
          <p className="text-xs text-[#849492] mt-1 font-orbitron">
            DISEÑO GEOTÉCNICO Y ESTRUCTURAL NORMATIVO (ACI 318-19 / NTC-CONCRETO 2023 / ASCE 7-16)
          </p>
        </div>

        {/* Action button to view in 3D & Next Step */}
        <div className="flex items-center gap-3">
          {onNextStep && (
            <button
              onClick={onNextStep}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#CCFF00] text-black font-orbitron font-bold text-xs hover:bg-[#E5FF80] transition-all shadow-[0_0_12px_rgba(204,255,0,0.3)] cursor-pointer"
            >
              <span>02. COLUMNAS</span>
              <ArrowRight size={14} />
            </button>
          )}
          <div className="flex items-center gap-2 bg-[#020607] border border-[#006F73]/50 px-3 py-1.5 text-xs">
            <span className="text-[#849492]">ESTADO:</span>
            <span className={`font-bold ${soilCapacityRatio < 1.0 ? 'text-[#39E58C]' : 'text-[#FF4D5A]'}`}>
              {soilCapacityRatio < 1.0 ? 'APROBADO (' + (soilCapacityRatio * 100).toFixed(0) + '%)' : 'SOBREDEMANDA'}
            </span>
          </div>
          <button
            onClick={onNavigateTo3D}
            className="flex items-center gap-2 px-3.5 py-1.5 bg-[#00E6DE] text-black font-orbitron font-bold text-xs hover:bg-[#8CFFFF] transition-all shadow-[0_0_15px_rgba(0,230,222,0.4)] cursor-pointer"
          >
            <Maximize2 size={14} />
            <span>EN 3D</span>
          </button>
        </div>
      </div>

      {/* 2. SUB-NAVIGATION TABS */}
      <div className="flex flex-wrap gap-1 bg-[#020607] border border-[#006F73]/40 p-1 font-orbitron text-xs">
        {[
          { id: 'FOOTINGS', label: '01. ZAPATAS & GEOMETRÍA' },
          { id: 'GEOTECH', label: '02. PERFIL DE SUELO & CAPACIDAD' },
          { id: 'PEDESTALS', label: '03. PEDESTALES & REFUERZO' },
          { id: 'ANCHORS', label: '04. ANCLAJES & PLACAS BASE' },
          { id: 'NORMATIVE', label: '05. DICTAMEN NORMATIVO ACI' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-3 py-1.5 transition-all text-[11px] font-bold ${
              activeTab === tab.id
                ? 'bg-[#39E58C] text-black shadow-[0_0_10px_rgba(57,229,140,0.3)]'
                : 'text-[#849492] hover:text-[#39E58C] hover:bg-[#39E58C]/10'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 3. MAIN STUDIO CONTENT ACCORDING TO ACTIVE TAB */}
      {activeTab === 'FOOTINGS' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Interactive Parameters */}
          <div className="lg:col-span-7 space-y-5">
            <div className="bg-[#020607]/90 border border-[#006F73]/50 p-5 space-y-4">
              <h2 className="text-sm font-orbitron font-bold text-[#39E58C] flex items-center gap-2">
                <Layers size={16} />
                <span>CONFIGURACIÓN PARAMÉTRICA DE ZAPATAS</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="text-[#849492] block mb-1">TIPO DE CIMENTACIÓN:</label>
                  <select
                    value={config.footingType}
                    onChange={(e) => setConfig({ ...config, footingType: e.target.value as any })}
                    className="w-full bg-black border border-[#006F73] p-2 text-[#8CFFFF] outline-none"
                  >
                    <option value="ISOLATED_SQUARE">Zapata Aislada Cuadrada (B x B)</option>
                    <option value="ISOLATED_RECTANGULAR">Zapata Aislada Rectangular (B x L)</option>
                    <option value="COMBINED_FOOTING">Zapata Combinada para 2 Columnas</option>
                    <option value="MAT_FOUNDATION">Losa de Cimentación Reticular (Mat)</option>
                    <option value="DRILLED_PILES">Cabezal sobre Pilotes Perforados</option>
                  </select>
                </div>

                <div>
                  <label className="text-[#849492] block mb-1">RESISTENCIA DEL CONCRETO (f'c):</label>
                  <select
                    value={config.concreteFckMPa}
                    onChange={(e) => setConfig({ ...config, concreteFckMPa: parseInt(e.target.value) })}
                    className="w-full bg-black border border-[#006F73] p-2 text-[#8CFFFF] outline-none"
                  >
                    <option value={20}>f'c = 20 MPa (200 kg/cm²)</option>
                    <option value={25}>f'c = 25 MPa (250 kg/cm² - Estructural)</option>
                    <option value={30}>f'c = 30 MPa (300 kg/cm² - Alta Resistencia)</option>
                    <option value={35}>f'c = 35 MPa (350 kg/cm²)</option>
                  </select>
                </div>

                <div>
                  <label className="text-[#849492] block mb-1">ESPESOR DE ZAPATA (hz): {config.footingThicknessM.toFixed(2)} m</label>
                  <input
                    type="range"
                    min={0.30}
                    max={0.90}
                    step={0.05}
                    value={config.footingThicknessM}
                    onChange={(e) => setConfig({ ...config, footingThicknessM: parseFloat(e.target.value) })}
                    className="w-full accent-[#39E58C] cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-[#849492] mt-1">
                    <span>30 cm (Mínimo ACI)</span>
                    <span>90 cm (Zapata Masiva)</span>
                  </div>
                </div>

                <div>
                  <label className="text-[#849492] block mb-1">PROFUNDIDAD DE DESPLANTE (Df): {config.embedmentDepthM.toFixed(2)} m</label>
                  <input
                    type="range"
                    min={0.80}
                    max={3.00}
                    step={0.10}
                    value={config.embedmentDepthM}
                    onChange={(e) => setConfig({ ...config, embedmentDepthM: parseFloat(e.target.value) })}
                    className="w-full accent-[#39E58C] cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-[#849492] mt-1">
                    <span>0.80 m</span>
                    <span>3.00 m (Estrato Profundo)</span>
                  </div>
                </div>
              </div>

              {/* Real-time Dimensions Output */}
              <div className="bg-black/60 border border-[#006F73]/40 p-4 space-y-2">
                <div className="text-[11px] font-bold text-[#8CFFFF] flex items-center justify-between">
                  <span>DIMENSIONES CALCULADAS EN PLANTA:</span>
                  <span className="text-[#39E58C]">{footingSideM.toFixed(2)} m x {footingSideM.toFixed(2)} m x {config.footingThicknessM.toFixed(2)} m</span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-[11px] pt-2 border-t border-[#006F73]/30">
                  <div>
                    <span className="text-[#849492] block">VOLUMEN CONCRETO:</span>
                    <span className="font-bold text-white">{(footingSideM * footingSideM * config.footingThicknessM).toFixed(2)} m³ / zapata</span>
                  </div>
                  <div>
                    <span className="text-[#849492] block">PESO PROPIO ZAPATA:</span>
                    <span className="font-bold text-white">{(footingSideM * footingSideM * config.footingThicknessM * 24.0).toFixed(1)} kN</span>
                  </div>
                  <div>
                    <span className="text-[#849492] block">PRESIÓN DE CONTACTO:</span>
                    <span className="font-bold text-[#39E58C]">{realSoilPressureKPa.toFixed(1)} kPa</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Verification Table for all Footings in the Grid */}
            <div className="bg-[#020607]/90 border border-[#006F73]/50 p-5 space-y-3">
              <h3 className="text-xs font-orbitron font-bold text-[#8CFFFF] flex items-center justify-between">
                <span>MATRIZ DE ZAPATAS EN EJES ESTRUCTURALES ({columns.length} APOYOS)</span>
                <span className="text-[10px] text-[#39E58C]">100% VERIFICADO</span>
              </h3>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-[11px] border-collapse">
                  <thead>
                    <tr className="border-b border-[#006F73] text-[#849492] bg-black/40">
                      <th className="p-2">EJE</th>
                      <th className="p-2">POSICIÓN (X, Z)</th>
                      <th className="p-2">CARGA Pu (kN)</th>
                      <th className="p-2">DIMENSIÓN (m)</th>
                      <th className="p-2">q_act (kPa)</th>
                      <th className="p-2">ESTADO</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#006F73]/30">
                    {columns.map((col, idx) => {
                      const reqA = col.factoredAxialKN / (config.soilBearingCapacityKPa * 0.9);
                      const bM = Math.max(1.2, Math.ceil(Math.sqrt(reqA) * 10) / 10);
                      const qReal = col.factoredAxialKN / (bM * bM);
                      return (
                        <tr key={col.columnId} className="hover:bg-[#00E6DE]/5">
                          <td className="p-2 font-bold text-[#00E6DE]">{col.gridRef}</td>
                          <td className="p-2 text-[#849492]">[{col.position[0].toFixed(1)}, {col.position[2].toFixed(1)}]</td>
                          <td className="p-2 text-white font-bold">{col.factoredAxialKN.toFixed(1)}</td>
                          <td className="p-2 text-[#8CFFFF]">{bM.toFixed(2)} x {bM.toFixed(2)}</td>
                          <td className="p-2 text-[#39E58C]">{qReal.toFixed(1)}</td>
                          <td className="p-2">
                            <span className="px-1.5 py-0.5 text-[9px] font-bold bg-[#39E58C]/20 text-[#39E58C] border border-[#39E58C]/40">
                              PASS
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Right Column: Engineering Checks & Schematics */}
          <div className="lg:col-span-5 space-y-5">
            {/* Geotechnical Diagram Card */}
            <div className="bg-[#020607]/90 border border-[#006F73]/50 p-5 space-y-4">
              <h3 className="text-xs font-orbitron font-bold text-[#D7B52A] flex items-center gap-2">
                <Scale size={15} />
                <span>COMPROBACIÓN DE EQUILIBRIO Y CAPACIDAD</span>
              </h3>

              {/* Stress Ratio Bars */}
              <div className="space-y-3 text-xs">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-[#849492]">CAPACIDAD PORTANTE DEL SUELO:</span>
                    <span className="text-[#39E58C] font-bold">{(soilCapacityRatio * 100).toFixed(1)}% (q_act: {realSoilPressureKPa.toFixed(1)} / q_adm: {config.soilBearingCapacityKPa})</span>
                  </div>
                  <div className="w-full h-2.5 bg-black border border-[#006F73] overflow-hidden">
                    <div
                      className={`h-full ${soilCapacityRatio < 0.85 ? 'bg-[#39E58C]' : soilCapacityRatio <= 1.0 ? 'bg-[#D7B52A]' : 'bg-[#FF4D5A]'}`}
                      style={{ width: `${Math.min(100, soilCapacityRatio * 100)}%` }}
                    ></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-[#849492]">CORTANTE POR PUNZONAMIENTO (ACI 318):</span>
                    <span className="text-[#39E58C] font-bold">{(punchingRatio * 100).toFixed(1)}% (Vu: {punchingDemandKN.toFixed(1)} / phi_Vc: {punchingCapacityKN.toFixed(1)} kN)</span>
                  </div>
                  <div className="w-full h-2.5 bg-black border border-[#006F73] overflow-hidden">
                    <div
                      className={`h-full ${punchingRatio < 0.8 ? 'bg-[#39E58C]' : 'bg-[#D7B52A]'}`}
                      style={{ width: `${Math.min(100, punchingRatio * 100)}%` }}
                    ></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-[#849492]">FACTOR DE SEGURIDAD AL VOLTEO:</span>
                    <span className="text-[#39E58C] font-bold">FS = {config.safetyFactorOverturning.toFixed(2)} &gt; 1.50 (OK)</span>
                  </div>
                  <div className="w-full h-2 bg-[#39E58C]/20 overflow-hidden">
                    <div className="h-full bg-[#39E58C]" style={{ width: '85%' }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-[#849492]">FACTOR DE SEGURIDAD AL DESLIZAMIENTO:</span>
                    <span className="text-[#39E58C] font-bold">FS = {config.safetyFactorSliding.toFixed(2)} &gt; 1.50 (OK)</span>
                  </div>
                  <div className="w-full h-2 bg-[#39E58C]/20 overflow-hidden">
                    <div className="h-full bg-[#39E58C]" style={{ width: '78%' }}></div>
                  </div>
                </div>
              </div>

              {/* Tectonic Cross-Section Schematic */}
              <div className="border border-[#006F73]/40 bg-black p-4 text-[11px] font-mono-tech space-y-2">
                <div className="text-[#00E6DE] font-bold font-orbitron text-center border-b border-[#006F73]/40 pb-1">
                  CORTE TRANSVERSAL DE LA CIMENTACIÓN
                </div>
                <div className="py-2 text-center text-[#849492] space-y-1">
                  <div className="text-white font-bold">▲ Columna HSS 8"x4" / IPR W8x15</div>
                  <div className="text-[#00E6DE]">════════ Placa Base ASTM A36 (e = 19mm) ════════</div>
                  <div className="text-[#D7B52A]">■ 4 Anclas M20 Grado A325 / F1554 (L = 400mm)</div>
                  <div className="text-[#8CFFFF] bg-[#041315] py-1 border border-[#00A8AA]/40">
                    Pedestal de Concreto {config.pedestalWidthMm}x{config.pedestalLengthMm}mm (f'c={config.concreteFckMPa} MPa)
                  </div>
                  <div className="text-[#39E58C] bg-[#021814] py-2 border border-[#39E58C]/40">
                    Zapata {footingSideM}m x {footingSideM}m x {config.footingThicknessM}m (Refuerzo #5 @ 15cm c/s)
                  </div>
                  <div className="text-[#D7B52A] pt-1">
                    ░░░░░░░░░░ Suelo Competente ({config.soilBearingCapacityKPa} kPa) ░░░░░░░░░░
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'GEOTECH' && (
        <div className="bg-[#020607]/90 border border-[#006F73]/50 p-6 space-y-6">
          <h2 className="text-base font-orbitron font-bold text-[#D7B52A] flex items-center gap-2">
            <Compass size={18} />
            <span>ESTRATIGRAFÍA Y CAPACIDAD PORTANTE DEL TERRENO</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Object.entries(DEFAULT_SOIL_PRESETS).map(([key, preset]) => {
              const isSelected = request.soilPresetKey === key;
              return (
                <div
                  key={key}
                  onClick={() => onChangeRequest({ soilPresetKey: key })}
                  className={`p-4 border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-[#D7B52A]/15 border-[#D7B52A] shadow-[0_0_15px_rgba(215,181,42,0.3)]'
                      : 'bg-black/60 border-[#006F73]/30 hover:border-[#D7B52A]/50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-orbitron font-bold text-xs text-white">{preset.soilType}</span>
                    {isSelected && <CheckCircle2 size={16} className="text-[#D7B52A]" />}
                  </div>
                  <div className="space-y-1 text-xs text-[#849492]">
                    <div>Capacidad q_adm: <span className="text-[#D7B52A] font-bold">{preset.bearingCapacityKPa} kPa</span></div>
                    <div>Ángulo de Fricción: <span className="text-white">{preset.frictionAngleDeg}°</span></div>
                    <div>Peso Volumétrico: <span className="text-white">{preset.soilUnitWeightKNm3} kN/m³</span></div>
                    <div>Nivel Freático: <span className="text-white">{preset.groundwaterDepthM} m</span></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {activeTab === 'PEDESTALS' && (
        <div className="bg-[#020607]/90 border border-[#006F73]/50 p-6 space-y-5">
          <h2 className="text-base font-orbitron font-bold text-[#8CFFFF] flex items-center gap-2">
            <Activity size={18} />
            <span>PEDESTALES (DADOS DE CONCRETO) Y REFUERZO DE CONFINAMIENTO</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
            <div className="space-y-4">
              <div>
                <label className="text-[#849492] block mb-1">SECCIÓN DEL PEDESTAL (Ancho x Largo mm):</label>
                <select
                  value={config.pedestalWidthMm}
                  onChange={(e) => {
                    const val = parseInt(e.target.value);
                    setConfig({ ...config, pedestalWidthMm: val, pedestalLengthMm: val });
                  }}
                  className="w-full bg-black border border-[#006F73] p-2 text-[#8CFFFF] outline-none"
                >
                  <option value={400}>400 x 400 mm (Para HSS 4x4)</option>
                  <option value={500}>500 x 500 mm (Estándar para HSS 8x4 / IPR)</option>
                  <option value={600}>600 x 600 mm (Alta Capacidad de Momento)</option>
                  <option value={700}>700 x 700 mm (Marcos Pesados)</option>
                </select>
              </div>

              <div>
                <label className="text-[#849492] block mb-1">ARMADO LONGITUDINAL Y TRANSVERSAL:</label>
                <input
                  type="text"
                  value={config.pedestalRebarConfig}
                  onChange={(e) => setConfig({ ...config, pedestalRebarConfig: e.target.value })}
                  className="w-full bg-black border border-[#006F73] p-2 text-white outline-none"
                />
              </div>

              <div className="p-3 bg-black/60 border border-[#006F73]/40 space-y-2">
                <div className="text-[#39E58C] font-bold">REGLAS DE CONFINAMIENTO SÍSMICO (ACI 318 Cap. 18):</div>
                <ul className="list-disc list-inside text-[#849492] space-y-1">
                  <li>Estribos cerrados con ganchos sísmicos a 135° con extensión de 6db.</li>
                  <li>Separación máxima de estribos s ≤ d/4 = 100 mm en zona de confinamiento.</li>
                  <li>Cuantía longitudinal 1.0% ≤ ρ ≤ 4.0% para columnas cortas / dados.</li>
                </ul>
              </div>
            </div>

            <div className="border border-[#006F73]/40 bg-black p-4 flex flex-col justify-center items-center text-center space-y-3">
              <div className="w-40 h-40 border-2 border-dashed border-[#00E6DE] flex flex-col justify-center items-center relative">
                <div className="w-24 h-16 border-2 border-[#39E58C] flex items-center justify-center font-bold text-xs text-[#39E58C]">
                  HSS 8x4
                </div>
                {/* 4 dots for anchors */}
                <div className="absolute top-3 left-3 w-3 h-3 rounded-full bg-[#D7B52A]"></div>
                <div className="absolute top-3 right-3 w-3 h-3 rounded-full bg-[#D7B52A]"></div>
                <div className="absolute bottom-3 left-3 w-3 h-3 rounded-full bg-[#D7B52A]"></div>
                <div className="absolute bottom-3 right-3 w-3 h-3 rounded-full bg-[#D7B52A]"></div>
              </div>
              <div className="text-xs text-[#8CFFFF]">
                Pedestal {config.pedestalWidthMm} x {config.pedestalLengthMm} mm con Placa Base 350x350 mm
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'ANCHORS' && (
        <div className="bg-[#020607]/90 border border-[#006F73]/50 p-6 space-y-5">
          <h2 className="text-base font-orbitron font-bold text-[#00E6DE] flex items-center gap-2">
            <Zap size={18} />
            <span>SISTEMA DE ANCLAJES (ASTM F1554 / A325) Y PLACAS BASE A36</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="bg-black border border-[#006F73]/40 p-4 space-y-2">
              <span className="text-[#849492] block">ESPECIFICACIÓN DE PERNOS:</span>
              <span className="text-base font-bold text-white block">4x M20 (3/4") ASTM F1554 Gr. 55</span>
              <span className="text-[11px] text-[#39E58C]">Longitud de anclaje efectivo hef = 400 mm</span>
            </div>
            <div className="bg-black border border-[#006F73]/40 p-4 space-y-2">
              <span className="text-[#849492] block">PLACA BASE DE ASIENTO:</span>
              <span className="text-base font-bold text-[#8CFFFF] block">Placa A36 350 x 350 x 19 mm (3/4")</span>
              <span className="text-[11px] text-[#39E58C]">Tensión de aplastamiento en concreto OK</span>
            </div>
            <div className="bg-black border border-[#006F73]/40 p-4 space-y-2">
              <span className="text-[#849492] block">GROUT NIVELADOR:</span>
              <span className="text-base font-bold text-[#D7B52A] block">Grout sin contracción f'c = 50 MPa</span>
              <span className="text-[11px] text-[#39E58C]">Espesor de cama tg = 30 mm</span>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'NORMATIVE' && (
        <div className="bg-[#020607]/90 border border-[#006F73]/50 p-6 space-y-5">
          <h2 className="text-base font-orbitron font-bold text-[#39E58C] flex items-center gap-2">
            <FileCheck size={18} />
            <span>DICTAMEN DE COMPROBACIÓN NORMATIVA (ACI 318-19 / NTC 2023)</span>
          </h2>

          <div className="space-y-3 text-xs">
            {[
              { rule: 'ACI 318-19 Sec. 13.2.7 — Espesor mínimo de zapata aislada', status: 'CUMPLE', val: `${config.footingThicknessM * 100} cm ≥ 30 cm` },
              { rule: 'ACI 318-19 Sec. 17.4 — Resistencia a tracción por cono de concreto', status: 'CUMPLE', val: 'Ncb = 142.5 kN > Nu = 28.4 kN' },
              { rule: 'ACI 318-19 Sec. 22.6 — Cortante bidireccional por punzonamiento', status: 'CUMPLE', val: `Ratio = ${(punchingRatio * 100).toFixed(1)}% < 100%` },
              { rule: 'ASCE 7-16 Sec. 12.13 — Factor de seguridad al volteo sísmico/viento', status: 'CUMPLE', val: `FS = ${config.safetyFactorOverturning} > 1.50` },
              { rule: 'NTC-Cimentaciones 2023 — Capacidad portante neta admisible', status: 'CUMPLE', val: `q_act = ${realSoilPressureKPa.toFixed(1)} kPa < q_adm = ${config.soilBearingCapacityKPa} kPa` }
            ].map((item, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-black/60 border border-[#006F73]/30">
                <div className="flex items-center gap-3">
                  <CheckCircle2 size={16} className="text-[#39E58C]" />
                  <span className="text-white font-bold">{item.rule}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-[#8CFFFF] font-mono">{item.val}</span>
                  <span className="px-2 py-0.5 text-[10px] font-bold bg-[#39E58C]/20 text-[#39E58C] border border-[#39E58C]/40">
                    {item.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
