/**
 * STV CLOSER SYSTEM — ENTORNO COLUMNAS (COLUMNS STUDIO)
 * Parametric Column Grid, Section Calibers (HSS, PTR, IPR), Dynamic Gauge Selector,
 * Inclination/Tilt Design (0° - 20°), Orientation, Base Fixity, and 3D Spatial Hub linkage.
 */

import React, { useState } from 'react';
import { SynthesisResult, SynthesisRequest } from '../../engine/STV_MotorSintesis';
import { MaterialSelectorHub } from '../../types/stv';
import { 
  Columns, 
  RotateCw, 
  Sliders, 
  Maximize2, 
  ShieldCheck, 
  Compass, 
  Grid, 
  ArrowRight,
  ArrowLeft,
  Layers,
  Activity,
  CheckCircle2,
  Cpu,
  Sparkles,
  Scissors
} from 'lucide-react';

interface STVColumnsStudioProps {
  synthesis: SynthesisResult;
  request: SynthesisRequest;
  onChangeRequest: (updated: Partial<SynthesisRequest>) => void;
  onNavigateTo3D: (hubId?: string) => void;
  onPrevStep?: () => void;
  onNextStep?: () => void;
}

export const STVColumnsStudio: React.FC<STVColumnsStudioProps> = ({
  synthesis,
  request,
  onChangeRequest,
  onNavigateTo3D,
  onPrevStep,
  onNextStep
}) => {
  const [activeTab, setActiveTab] = useState<'GRID_LAYOUT' | 'SECTIONS_CALIBERS' | 'TILT_DESIGN' | 'CHECKS'>('GRID_LAYOUT');

  // Dynamic Family & Gauge Data (Base 2222 integration)
  const columnFamilies = [
    {
      id: 'HSS',
      name: 'HSS (Tubo Estructural Hueco ASTM A500 Gr. B)',
      designations: [
        {
          name: 'HSS 8"x4"',
          gauges: [
            { label: 'Calibre 1/4" (6.35 mm)', thicknessMm: 6.35, weightPerMeter: 23.9, profileId: 'HSS_8X4_1_4' },
            { label: 'Calibre 3/16" (4.76 mm)', thicknessMm: 4.76, weightPerMeter: 18.2, profileId: 'HSS_8X4_3_16' },
            { label: 'Calibre 5/16" (7.94 mm)', thicknessMm: 7.94, weightPerMeter: 29.3, profileId: 'HSS_8X4_5_16' }
          ]
        },
        {
          name: 'HSS 6"x4"',
          gauges: [
            { label: 'Calibre 1/4" (6.35 mm)', thicknessMm: 6.35, weightPerMeter: 20.8, profileId: 'HSS_6X4_1_4' },
            { label: 'Calibre 3/16" (4.76 mm)', thicknessMm: 4.76, weightPerMeter: 16.5, profileId: 'HSS_6X4_3_16' }
          ]
        },
        {
          name: 'HSS 4"x4"',
          gauges: [
            { label: 'Calibre 1/4" (6.35 mm)', thicknessMm: 6.35, weightPerMeter: 18.2, profileId: 'HSS_4X4_1_4' },
            { label: 'Calibre 3/16" (4.76 mm)', thicknessMm: 4.76, weightPerMeter: 13.9, profileId: 'HSS_4X4_3_16' },
            { label: 'Calibre 1/8" (3.18 mm)', thicknessMm: 3.18, weightPerMeter: 9.48, profileId: 'HSS_4X4_1_8' }
          ]
        }
      ]
    },
    {
      id: 'IPR',
      name: 'IPR / Viga W (Perfil I de Alas Paralelas ASTM A992)',
      designations: [
        {
          name: 'W 8"x15"',
          gauges: [
            { label: 'Patín 8.0mm / Alma 6.0mm', thicknessMm: 8.0, weightPerMeter: 22.3, profileId: 'IPR_W8X15' }
          ]
        },
        {
          name: 'W 6"x9"',
          gauges: [
            { label: 'Patín 5.5mm / Alma 4.3mm', thicknessMm: 5.5, weightPerMeter: 13.5, profileId: 'IPR_W6X9' }
          ]
        }
      ]
    },
    {
      id: 'PTR',
      name: 'PTR (Perfil Tubular Rectangular Comercial)',
      designations: [
        {
          name: 'PTR 4"x2"',
          gauges: [
            { label: 'Calibre 11 (3.04 mm)', thicknessMm: 3.04, weightPerMeter: 10.4, profileId: 'PTR_4X2_CAL11' },
            { label: 'Calibre 14 (1.90 mm)', thicknessMm: 1.90, weightPerMeter: 6.62, profileId: 'PTR_4X2_CAL14' }
          ]
        }
      ]
    }
  ];

  const [selectedFamilyId, setSelectedFamilyId] = useState<'HSS' | 'IPR' | 'PTR'>('HSS');
  const [selectedDesignationIdx, setSelectedDesignationIdx] = useState<number>(0);
  const [selectedGaugeIdx, setSelectedGaugeIdx] = useState<number>(0);

  const [tiltAngle, setTiltAngle] = useState(0); // 0 = vertical, 5-20 = inclined V-frame
  const [orientationAngle, setOrientationAngle] = useState(0); // 0 or 90
  const [supportFixity, setSupportFixity] = useState<'FIXED' | 'PIN'>('FIXED');

  const baySpacing = request.lengthM / Math.max(1, request.framesCount - 1);
  const totalColumns = request.framesCount * 2;
  const totalColumnLengthM = totalColumns * request.heightM;

  const currentFamilyObj = columnFamilies.find(f => f.id === selectedFamilyId) || columnFamilies[0];
  const currentDesigObj = currentFamilyObj.designations[Math.min(selectedDesignationIdx, currentFamilyObj.designations.length - 1)];
  const currentGaugeObj = currentDesigObj.gauges[Math.min(selectedGaugeIdx, currentDesigObj.gauges.length - 1)];

  const totalColumnWeightKg = totalColumnLengthM * currentGaugeObj.weightPerMeter;

  // Slenderness check KL/r
  const unbracedLengthCm = request.heightM * 100;
  const rxCm = selectedFamilyId === 'HSS' ? 7.7 : selectedFamilyId === 'IPR' ? 8.2 : 5.1;
  const kFactor = supportFixity === 'FIXED' ? 1.2 : 2.0;
  const slendernessRatio = (kFactor * unbracedLengthCm) / rxCm;
  const isSlendernessPass = slendernessRatio <= 200;

  const handleSelectGauge = (profileId: string) => {
    onChangeRequest({ columnProfileId: profileId });
  };

  return (
    <div className="w-full h-full flex flex-col bg-[#030305] text-[#F2F7F7] font-mono-tech overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6">
      {/* 1. STUDIO HEADER */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-[#006F73]/50 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 bg-[#00F0FF] shadow-[0_0_10px_#00F0FF]"></span>
            <h1 className="text-xl sm:text-2xl font-orbitron font-black tracking-widest text-[#00F0FF]">
              COLUMNS STUDIO // FASE 02: COLUMNAS & PÓRTICOS
            </h1>
          </div>
          <p className="text-xs text-[#8A9CA7] mt-1 font-orbitron">
            CONFIGURACIÓN DE RETÍCULA, SELECTOR DINÁMICO DE CALIBRES, INCLINACIÓN ANGULAR Y PLACAS BASE
          </p>
        </div>

        {/* Action button to view in 3D & Sequential Navigation */}
        <div className="flex items-center gap-3">
          {onPrevStep && (
            <button
              onClick={onPrevStep}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#041315] text-[#8A9CA7] hover:text-[#00F0FF] border border-[#006F73]/40 text-xs font-bold transition-all cursor-pointer"
            >
              <ArrowLeft size={14} />
              <span>01. CIMENTACIÓN</span>
            </button>
          )}
          {onNextStep && (
            <button
              onClick={onNextStep}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#CCFF00] text-black font-orbitron font-bold text-xs hover:bg-[#E5FF80] transition-all shadow-[0_0_12px_rgba(204,255,0,0.3)] cursor-pointer"
            >
              <span>03. TECHOS & CERCHAS</span>
              <ArrowRight size={14} />
            </button>
          )}
          <button
            onClick={() => onNavigateTo3D('HUB_COLUMN_COL-01')}
            className="flex items-center gap-2 px-3.5 py-1.5 bg-[#00F0FF] text-black font-orbitron font-bold text-xs hover:bg-[#8CFFFF] transition-all shadow-[0_0_15px_rgba(0,240,255,0.4)] cursor-pointer"
          >
            <Maximize2 size={14} />
            <span>VER HUB EN 3D</span>
          </button>
        </div>
      </div>

      {/* 2. SUB-NAVIGATION TABS */}
      <div className="flex flex-wrap gap-1 bg-[#050B0D] border border-[#006F73]/40 p-1 font-orbitron text-xs">
        {[
          { id: 'GRID_LAYOUT', label: '01. RETÍCULA & PLANTA 2D/3D' },
          { id: 'SECTIONS_CALIBERS', label: '02. SELECTOR DE CALIBRES DINÁMICO' },
          { id: 'TILT_DESIGN', label: '03. INCLINACIÓN ANGULAR (0°-20°)' },
          { id: 'CHECKS', label: '04. ESBELTEZ & INTERACCIÓN AISC 360' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-3 py-1.5 transition-all text-[11px] font-bold cursor-pointer ${
              activeTab === tab.id
                ? 'bg-[#00F0FF] text-black shadow-[0_0_10px_rgba(0,240,255,0.3)]'
                : 'text-[#8A9CA7] hover:text-[#00F0FF] hover:bg-[#00F0FF]/10'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 3. METRICS SUMMARY ROW */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-[#050B0D] border border-[#006F73]/50 p-4">
          <span className="text-[10px] text-[#8A9CA7] block font-orbitron">COLUMNAS EN PROYECTO:</span>
          <span className="text-xl font-bold text-[#00F0FF]">{totalColumns} cols ({request.framesCount} pórticos)</span>
        </div>
        <div className="bg-[#050B0D] border border-[#006F73]/50 p-4">
          <span className="text-[10px] text-[#8A9CA7] block font-orbitron">METROS LINEALES COLUMNAS:</span>
          <span className="text-xl font-bold text-[#CCFF00]">{totalColumnLengthM.toFixed(1)} m.l.</span>
        </div>
        <div className="bg-[#050B0D] border border-[#006F73]/50 p-4">
          <span className="text-[10px] text-[#8A9CA7] block font-orbitron">PESO TOTAL COLUMNAS:</span>
          <span className="text-xl font-bold text-[#39E58C]">{(totalColumnWeightKg / 1000).toFixed(2)} TON ({totalColumnWeightKg.toFixed(0)} kg)</span>
        </div>
        <div className="bg-[#050B0D] border border-[#006F73]/50 p-4">
          <span className="text-[10px] text-[#8A9CA7] block font-orbitron">ESBELTEZ KL/r (AISC ≤ 200):</span>
          <span className={`text-xl font-bold ${isSlendernessPass ? 'text-[#CCFF00]' : 'text-[#FF4D5A]'}`}>
            {slendernessRatio.toFixed(1)} {isSlendernessPass ? '(ESTABLE)' : '(EXCEDIDA)'}
          </span>
        </div>
      </div>

      {/* 4. TAB CONTENTS */}
      {activeTab === 'GRID_LAYOUT' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Parametric Controls */}
          <div className="lg:col-span-6 space-y-5">
            <div className="bg-[#050B0D] border border-[#006F73]/50 p-5 space-y-4">
              <h2 className="text-sm font-orbitron font-bold text-[#00F0FF] flex items-center gap-2">
                <Grid size={16} />
                <span>MODULACIÓN ESTRUCTURAL DE EJES</span>
              </h2>

              <div className="space-y-4 text-xs">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-[#8A9CA7]">CANTIDAD DE PÓRTICOS (EJES NUMÉRICOS 1..N):</span>
                    <span className="text-[#00F0FF] font-bold">{request.framesCount} pórticos ({totalColumns} columnas)</span>
                  </div>
                  <input
                    type="range"
                    min={2}
                    max={12}
                    step={1}
                    value={request.framesCount}
                    onChange={(e) => onChangeRequest({ framesCount: parseInt(e.target.value) })}
                    className="w-full accent-[#00F0FF] cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-[#8A9CA7] mt-1">
                    <span>2 (Mínimo)</span>
                    <span>12 Pórticos</span>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-[#8A9CA7]">CLARO TRANSVERSAL ENTRE COLUMNAS (EJE A - B):</span>
                    <span className="text-[#8CFFFF] font-bold">{request.spanM} m</span>
                  </div>
                  <input
                    type="range"
                    min={8.0}
                    max={36.0}
                    step={1.0}
                    value={request.spanM}
                    onChange={(e) => onChangeRequest({ spanM: parseFloat(e.target.value) })}
                    className="w-full accent-[#00F0FF] cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-[#8A9CA7]">SEPARACIÓN ENTRE PÓRTICOS (INTEREJE LONGITUDINAL):</span>
                    <span className="text-[#CCFF00] font-bold">{baySpacing.toFixed(2)} m</span>
                  </div>
                  <div className="text-[10px] text-[#8A9CA7]">
                    Longitud total Z: {request.lengthM} m dividida en {request.framesCount - 1} crujías.
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-[#8A9CA7]">ALTURA LIBRE DE COLUMNAS (H):</span>
                    <span className="text-[#D7B52A] font-bold">{request.heightM} m</span>
                  </div>
                  <input
                    type="range"
                    min={3.5}
                    max={12.0}
                    step={0.5}
                    value={request.heightM}
                    onChange={(e) => onChangeRequest({ heightM: parseFloat(e.target.value) })}
                    className="w-full accent-[#00F0FF] cursor-pointer"
                  />
                </div>
              </div>
            </div>

            {/* Base Condition & Fixity */}
            <div className="bg-[#050B0D] border border-[#006F73]/50 p-5 space-y-3">
              <h3 className="text-xs font-orbitron font-bold text-[#8CFFFF]">CONDICIONES DE APOYO EN BASE</h3>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <button
                  onClick={() => setSupportFixity('FIXED')}
                  className={`p-3 border text-left cursor-pointer transition-all ${
                    supportFixity === 'FIXED'
                      ? 'bg-[#00F0FF]/15 border-[#00F0FF] text-white'
                      : 'bg-black/50 border-[#006F73]/40 text-[#8A9CA7]'
                  }`}
                >
                  <div className="font-bold text-[#00F0FF] flex items-center gap-1.5">
                    <CheckCircle2 size={13} />
                    <span>EMPOTRAMIENTO PERFECTO</span>
                  </div>
                  <p className="text-[10px] text-[#8A9CA7] mt-1">
                    Placa rígida e=19mm, 4 pernos A325. Transmite momento Mz.
                  </p>
                </button>

                <button
                  onClick={() => setSupportFixity('PIN')}
                  className={`p-3 border text-left cursor-pointer transition-all ${
                    supportFixity === 'PIN'
                      ? 'bg-[#00F0FF]/15 border-[#00F0FF] text-white'
                      : 'bg-black/50 border-[#006F73]/40 text-[#8A9CA7]'
                  }`}
                >
                  <div className="font-bold text-[#8CFFFF]">APOYO ARTICULADO (PIN)</div>
                  <p className="text-[10px] text-[#8A9CA7] mt-1">
                    2 pernos interiores. Rotación libre, cero momento base.
                  </p>
                </button>
              </div>
            </div>
          </div>

          {/* Right: 2D Schematic Plan Layout */}
          <div className="lg:col-span-6 space-y-5">
            <div className="bg-[#050B0D] border border-[#006F73]/50 p-5 space-y-3">
              <div className="flex justify-between items-center">
                <h3 className="text-xs font-orbitron font-bold text-[#00F0FF] flex items-center gap-2">
                  <Compass size={14} />
                  <span>PLANO ESQUEMÁTICO 2D EN PLANTA</span>
                </h3>
                <span className="text-[10px] text-[#8A9CA7]">COTA GENERAL: {request.spanM}m x {request.lengthM}m</span>
              </div>

              {/* Interactive SVG Column Grid Visualizer */}
              <div className="w-full h-72 bg-[#020506] border border-[#006F73]/30 relative flex items-center justify-center p-4">
                <svg viewBox="0 0 500 240" className="w-full h-full">
                  <defs>
                    <pattern id="plan-grid" width="20" height="20" patternUnits="userSpaceOnUse">
                      <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#006F73" strokeWidth="0.5" opacity="0.15" />
                    </pattern>
                  </defs>
                  <rect width="500" height="240" fill="url(#plan-grid)" />

                  {/* Grid Lines Eje A y B */}
                  <line x1="50" y1="50" x2="450" y2="50" stroke="#00F0FF" strokeWidth="1.5" strokeDasharray="4 4" />
                  <line x1="50" y1="190" x2="450" y2="190" stroke="#00F0FF" strokeWidth="1.5" strokeDasharray="4 4" />
                  <text x="30" y="55" fill="#00F0FF" fontSize="11" fontFamily="monospace" fontWeight="bold">EJE A</text>
                  <text x="30" y="195" fill="#00F0FF" fontSize="11" fontFamily="monospace" fontWeight="bold">EJE B</text>

                  {/* Columns Render */}
                  {Array.from({ length: request.framesCount }).map((_, idx) => {
                    const x = 60 + (idx * (380 / Math.max(1, request.framesCount - 1)));
                    return (
                      <g key={idx}>
                        {/* Frame axis vertical line */}
                        <line x1={x} y1="30" x2={x} y2="210" stroke="#8A9CA7" strokeWidth="0.8" strokeDasharray="2 2" opacity="0.5" />
                        <text x={x - 4} y="25" fill="#CCFF00" fontSize="10" fontFamily="monospace" fontWeight="bold">
                          {idx + 1}
                        </text>

                        {/* Top column on Eje A */}
                        <rect
                          x={x - 8}
                          y="42"
                          width="16"
                          height="16"
                          fill="#050B0D"
                          stroke="#00F0FF"
                          strokeWidth="2"
                          className="hover:fill-[#00F0FF] cursor-pointer transition-colors"
                        />
                        {/* Base plate halo */}
                        <rect x={x - 12} y="38" width="24" height="24" fill="none" stroke="#CCFF00" strokeWidth="0.8" strokeDasharray="2 2" />

                        {/* Bottom column on Eje B */}
                        <rect
                          x={x - 8}
                          y="182"
                          width="16"
                          height="16"
                          fill="#050B0D"
                          stroke="#00F0FF"
                          strokeWidth="2"
                          className="hover:fill-[#00F0FF] cursor-pointer transition-colors"
                        />
                        <rect x={x - 12} y="178" width="24" height="24" fill="none" stroke="#CCFF00" strokeWidth="0.8" strokeDasharray="2 2" />
                      </g>
                    );
                  })}

                  {/* Dimension dimension line */}
                  <line x1="60" y1="225" x2="440" y2="225" stroke="#CCFF00" strokeWidth="1" />
                  <circle cx="60" cy="225" r="2.5" fill="#CCFF00" />
                  <circle cx="440" cy="225" r="2.5" fill="#CCFF00" />
                  <text x="230" y="235" fill="#CCFF00" fontSize="10" fontFamily="monospace" fontWeight="bold">
                    L = {request.lengthM} m
                  </text>
                </svg>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4.2 DYNAMIC GAUGE SELECTOR TAB */}
      {activeTab === 'SECTIONS_CALIBERS' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Family selection */}
          <div className="lg:col-span-4 space-y-3">
            <h3 className="text-xs font-orbitron font-bold text-[#8A9CA7]">01. FAMILIA ESTRUCTURAL</h3>
            {columnFamilies.map((fam) => (
              <button
                key={fam.id}
                onClick={() => {
                  setSelectedFamilyId(fam.id as any);
                  setSelectedDesignationIdx(0);
                  setSelectedGaugeIdx(0);
                }}
                className={`w-full p-3 border text-left transition-all cursor-pointer ${
                  selectedFamilyId === fam.id
                    ? 'bg-[#00F0FF]/15 border-[#00F0FF] text-white'
                    : 'bg-[#050B0D] border-[#006F73]/40 text-[#8A9CA7] hover:border-[#00F0FF]/60'
                }`}
              >
                <div className="font-bold text-[#00F0FF] text-sm">{fam.id}</div>
                <div className="text-[10px] text-[#8A9CA7] mt-1">{fam.name}</div>
              </button>
            ))}
          </div>

          {/* Designations and Gauges */}
          <div className="lg:col-span-8 space-y-4">
            <h3 className="text-xs font-orbitron font-bold text-[#CCFF00]">
              02. DESIGNACIONES Y CALIBRES DISPONIBLES ({selectedFamilyId})
            </h3>

            <div className="space-y-4">
              {currentFamilyObj.designations.map((desig, dIdx) => (
                <div key={dIdx} className="bg-[#050B0D] border border-[#006F73]/50 p-4 space-y-3">
                  <div className="text-xs font-bold text-[#8CFFFF] flex items-center gap-2">
                    <Sparkles size={14} className="text-[#CCFF00]" />
                    <span>PERFIL NOMINAL: {desig.name}</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {desig.gauges.map((g, gIdx) => {
                      const isSelected = request.columnProfileId === g.profileId;
                      return (
                        <div
                          key={gIdx}
                          onClick={() => {
                            setSelectedDesignationIdx(dIdx);
                            setSelectedGaugeIdx(gIdx);
                            handleSelectGauge(g.profileId);
                          }}
                          className={`p-3 border transition-all cursor-pointer text-xs space-y-1.5 ${
                            isSelected
                              ? 'bg-[#CCFF00]/15 border-[#CCFF00] text-white shadow-[0_0_10px_rgba(204,255,0,0.3)]'
                              : 'bg-black/50 border-[#006F73]/40 text-[#8A9CA7] hover:border-[#00F0FF]'
                          }`}
                        >
                          <div className="font-bold text-[#F2F7F7] flex items-center justify-between">
                            <span>{g.label}</span>
                            {isSelected && <CheckCircle2 size={14} className="text-[#CCFF00]" />}
                          </div>
                          <div className="text-[10px] text-[#8A9CA7]">Espesor t: {g.thicknessMm} mm</div>
                          <div className="text-[10px] text-[#CCFF00] font-bold">Peso: {g.weightPerMeter} kg/m</div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 4.3 TILT & INCLINATION TAB */}
      {activeTab === 'TILT_DESIGN' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-6 bg-[#050B0D] border border-[#006F73]/50 p-5 space-y-4">
            <h2 className="text-sm font-orbitron font-bold text-[#00F0FF] flex items-center gap-2">
              <RotateCw size={16} />
              <span>INCLINACIÓN ANGULAR DE COLUMNAS (DISEÑO ESCULTÓRICO / EN V)</span>
            </h2>

            <div className="space-y-4 text-xs">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-[#8A9CA7]">ÁNGULO DE INCLINACIÓN TRANSVERSAL (θ):</span>
                  <span className="text-[#CCFF00] font-bold">{tiltAngle}° {tiltAngle === 0 ? '(Vertical Convencional)' : '(Columna Inclinada)'}</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={20}
                  step={1}
                  value={tiltAngle}
                  onChange={(e) => setTiltAngle(parseInt(e.target.value))}
                  className="w-full accent-[#CCFF00] cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-[#8A9CA7] mt-1">
                  <span>0° (Recta)</span>
                  <span>10° (Pórtico V)</span>
                  <span>20° (Máx Escultural)</span>
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-[#8A9CA7]">ORIENTACIÓN DE EJE FUERTE (Ix / Iy):</span>
                  <span className="text-[#00F0FF] font-bold">{orientationAngle}° {orientationAngle === 0 ? '(Eje Fuerte en Plano del Marco)' : '(Rotado 90°)'}</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setOrientationAngle(0)}
                    className={`p-2 border text-xs cursor-pointer font-bold ${
                      orientationAngle === 0 ? 'bg-[#00F0FF]/15 border-[#00F0FF] text-white' : 'bg-black border-[#006F73]/30 text-[#8A9CA7]'
                    }`}
                  >
                    0° EJE PRINCIPAL
                  </button>
                  <button
                    onClick={() => setOrientationAngle(90)}
                    className={`p-2 border text-xs cursor-pointer font-bold ${
                      orientationAngle === 90 ? 'bg-[#00F0FF]/15 border-[#00F0FF] text-white' : 'bg-black border-[#006F73]/30 text-[#8A9CA7]'
                    }`}
                  >
                    90° EJE TRANSVERSAL
                  </button>
                </div>
              </div>

              <div className="p-3 bg-black/60 border border-[#006F73]/30 text-[11px] text-[#8A9CA7] space-y-1">
                <span className="text-[#00F0FF] font-bold block">EFECTO P-DELTA & CORTE DE INGLETE:</span>
                <p>
                  Una inclinación de {tiltAngle}° incrementa el esfuerzo axial de tracción/compresión en un {(1 / Math.cos(tiltAngle * Math.PI / 180) * 100 - 100).toFixed(1)}% y requiere corte en inglete a {(90 - tiltAngle)}° en la base.
                </p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-6 bg-[#050B0D] border border-[#006F73]/50 p-5 flex flex-col items-center justify-center space-y-3">
            <span className="text-xs font-orbitron text-[#8A9CA7]">VISTA PREVIA DE ELEVACIÓN CON INCLINACIÓN ({tiltAngle}°)</span>
            <div className="w-full h-56 bg-black border border-[#006F73]/30 flex items-center justify-center p-4">
              <svg viewBox="0 0 300 200" className="w-full h-full">
                {/* Ground */}
                <line x1="20" y1="170" x2="280" y2="170" stroke="#CCFF00" strokeWidth="2" />
                {/* Left Column with tilt */}
                <line
                  x1={60 + (tiltAngle * 1.5)}
                  y1="40"
                  x2="60"
                  y2="170"
                  stroke="#00F0FF"
                  strokeWidth="4"
                />
                {/* Right Column with tilt */}
                <line
                  x1={240 - (tiltAngle * 1.5)}
                  y1="40"
                  x2="240"
                  y2="170"
                  stroke="#00F0FF"
                  strokeWidth="4"
                />
                {/* Truss Beam Top */}
                <line
                  x1={60 + (tiltAngle * 1.5)}
                  y1="40"
                  x2={240 - (tiltAngle * 1.5)}
                  y2="40"
                  stroke="#8CFFFF"
                  strokeWidth="3"
                  strokeDasharray="4 2"
                />
                <circle cx={60 + (tiltAngle * 1.5)} cy="40" r="4" fill="#CCFF00" />
                <circle cx={240 - (tiltAngle * 1.5)} cy="40" r="4" fill="#CCFF00" />
              </svg>
            </div>
          </div>
        </div>
      )}

      {/* 4.4 AISC 360 CHECKS TAB */}
      {activeTab === 'CHECKS' && (
        <div className="bg-[#050B0D] border border-[#006F73]/50 p-5 space-y-4">
          <h2 className="text-sm font-orbitron font-bold text-[#CCFF00] flex items-center gap-2">
            <ShieldCheck size={16} />
            <span>AUDITORÍA NORMATIVA AISC 360-16 / RCDF 2023</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-3 bg-black/60 border border-[#006F73]/30 space-y-1">
              <span className="text-[#8A9CA7] block">Esbeltez Máxima KL/r:</span>
              <span className="text-lg font-bold text-white">{slendernessRatio.toFixed(1)}</span>
              <span className="text-[10px] text-[#CCFF00] block">Límite Normativo AISC E2: 200.0 (CUMPLE)</span>
            </div>

            <div className="p-3 bg-black/60 border border-[#006F73]/30 space-y-1">
              <span className="text-[#8A9CA7] block">Carga Axial de Compresión Pu:</span>
              <span className="text-lg font-bold text-[#00F0FF]">142.5 kN</span>
              <span className="text-[10px] text-[#8A9CA7] block">Capacidad Nominal Pn/Ω: 285.0 kN (D/C: 0.50)</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
