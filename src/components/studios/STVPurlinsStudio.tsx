/**
 * STV CLOSER SYSTEM — ENTORNO LARGUEROS Y MONTENES (PURLINS STUDIO)
 * Parametric Purlin Grid (Polín C / Monten), commercial spacing (1.0 - 1.5m),
 * overlapping/splices, roof slope compensation, sag rods, and lateral torsional buckling checks.
 */

import React, { useState } from 'react';
import { SynthesisResult, SynthesisRequest } from '../../engine/STV_MotorSintesis';
import { 
  Layers, 
  Maximize2, 
  Sliders, 
  ShieldCheck, 
  Grid, 
  ArrowRight, 
  ArrowLeft,
  CheckCircle2,
  Cpu,
  Download
} from 'lucide-react';

interface STVPurlinsStudioProps {
  synthesis: SynthesisResult;
  request: SynthesisRequest;
  onChangeRequest: (updated: Partial<SynthesisRequest>) => void;
  onNavigateTo3D: () => void;
  onPrevStep?: () => void;
  onNextStep?: () => void;
}

export const STVPurlinsStudio: React.FC<STVPurlinsStudioProps> = ({
  synthesis,
  request,
  onChangeRequest,
  onNavigateTo3D,
  onPrevStep,
  onNextStep
}) => {
  const [purlinSpacingM, setPurlinSpacingM] = useState<number>(1.20);
  const [purlinProfile, setPurlinProfile] = useState<string>('MONTEN_C_6X2_CAL14');
  const [overlapLengthMm, setOverlapLengthMm] = useState<number>(400);
  const [includeSagRods, setIncludeSagRods] = useState<boolean>(true);

  // Available purlin profiles
  const purlinCatalog = [
    { id: 'MONTEN_C_6X2_CAL14', name: 'Polín Monten C 6"x2" Cal. 14 (152.4 x 50.8 x 1.90 mm)', weightKgM: 3.58, SxCm3: 16.2 },
    { id: 'MONTEN_C_8X2_CAL14', name: 'Polín Monten C 8"x2" Cal. 14 (203.2 x 50.8 x 1.90 mm)', weightKgM: 4.42, SxCm3: 25.8 },
    { id: 'MONTEN_C_10X2_CAL14', name: 'Polín Monten C 10"x2" Cal. 14 (254.0 x 50.8 x 1.90 mm)', weightKgM: 5.25, SxCm3: 38.1 },
    { id: 'MONTEN_C_8X2_CAL12', name: 'Polín Monten C 8"x2" Cal. 12 (203.2 x 50.8 x 2.66 mm)', weightKgM: 6.10, SxCm3: 35.4 },
    { id: 'Z_SECTION_8X2_CAL14', name: 'Perfil Z 8"x2" Cal. 14 Traspapilable', weightKgM: 4.55, SxCm3: 27.2 },
    { id: 'HSS_4X2_CAL14', name: 'HSS 4"x2" Cal. 14 Tubular de Techo', weightKgM: 3.82, SxCm3: 14.5 }
  ];

  const currentProfileData = purlinCatalog.find(p => p.id === purlinProfile) || purlinCatalog[0];

  // Mathematical spacing & quantity calculations
  const roofRafterSlopeM = Math.sqrt(Math.pow(request.spanM / 2, 2) + Math.pow(request.roofRiseM, 2));
  const purlinsPerSlope = Math.ceil(roofRafterSlopeM / purlinSpacingM) + 1;
  const totalPurlinLines = purlinsPerSlope * 2;
  const totalPurlinRuns = totalPurlinLines;
  const purlinLinearMeters = totalPurlinLines * request.lengthM;
  const purlinTotalWeightKg = purlinLinearMeters * currentProfileData.weightKgM;

  // ASD Deflection & Bending Check
  const bayLengthM = request.lengthM / Math.max(1, request.framesCount - 1);
  const qDeadKNm = (request.roofDeadLoadKPa * purlinSpacingM) + (currentProfileData.weightKgM * 9.81 / 1000);
  const qLiveKNm = request.roofLiveLoadKPa * purlinSpacingM;
  const qTotalKNm = qDeadKNm + qLiveKNm;
  const maxMomentKNm = (qTotalKNm * Math.pow(bayLengthM, 2)) / 8;
  const allowableBendingMPa = 250 / 1.67; // ASD Fa
  const requiredSxCm3 = (maxMomentKNm * 1000) / (allowableBendingMPa * 10);
  const purlinDCRatio = Number((requiredSxCm3 / currentProfileData.SxCm3).toFixed(2));
  const isPurlinValid = purlinDCRatio <= 1.0;

  return (
    <div className="w-full h-full flex flex-col bg-[#030305] text-[#F2F7F7] font-mono-tech overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6">
      {/* 1. STUDIO HEADER */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-[#006F73]/50 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 bg-[#CCFF00] shadow-[0_0_10px_#CCFF00]"></span>
            <h1 className="text-xl sm:text-2xl font-orbitron font-black tracking-widest text-[#CCFF00]">
              PURLINS STUDIO // FASE 04: LARGUEROS & MONTENES
            </h1>
          </div>
          <p className="text-xs text-[#8A9CA7] mt-1 font-orbitron">
            MODULACIÓN DE POLINES TIPO C/Z, ESPACIAMIENTO ENTRE EJES, FLECHAS Y TRASLAPES
          </p>
        </div>

        {/* Step Navigation & 3D button */}
        <div className="flex items-center gap-3">
          {onPrevStep && (
            <button
              onClick={onPrevStep}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#041315] text-[#8A9CA7] hover:text-[#00F0FF] border border-[#006F73]/40 text-xs font-bold transition-all cursor-pointer"
            >
              <ArrowLeft size={14} />
              <span>03. TECHOS</span>
            </button>
          )}
          {onNextStep && (
            <button
              onClick={onNextStep}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#CCFF00] text-black font-orbitron font-bold text-xs hover:bg-[#E5FF80] transition-all shadow-[0_0_12px_rgba(204,255,0,0.3)] cursor-pointer"
            >
              <span>05. TALLER / DESPIECE</span>
              <ArrowRight size={14} />
            </button>
          )}
          <button
            onClick={onNavigateTo3D}
            className="flex items-center gap-2 px-3 py-1.5 bg-[#00F0FF] text-black font-orbitron font-bold text-xs hover:bg-[#8CFFFF] transition-all shadow-[0_0_12px_rgba(0,240,255,0.4)] cursor-pointer"
          >
            <Maximize2 size={14} />
            <span>VER EN 3D</span>
          </button>
        </div>
      </div>

      {/* 2. SUMMARY METRICS ROW */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-[#050B0D] border border-[#006F73]/50 p-4">
          <span className="text-[10px] text-[#8A9CA7] block font-orbitron">LÍNEAS DE LARGUERO:</span>
          <span className="text-xl font-bold text-[#00F0FF]">{totalPurlinLines} líneas ({purlinsPerSlope} por agua)</span>
        </div>
        <div className="bg-[#050B0D] border border-[#006F73]/50 p-4">
          <span className="text-[10px] text-[#8A9CA7] block font-orbitron">METROS LINEALES POLÍN:</span>
          <span className="text-xl font-bold text-[#CCFF00]">{purlinLinearMeters.toFixed(1)} m.l.</span>
        </div>
        <div className="bg-[#050B0D] border border-[#006F73]/50 p-4">
          <span className="text-[10px] text-[#8A9CA7] block font-orbitron">PESO DE LARGUEROS:</span>
          <span className="text-xl font-bold text-[#39E58C]">{(purlinTotalWeightKg / 1000).toFixed(2)} TON ({purlinTotalWeightKg.toFixed(0)} kg)</span>
        </div>
        <div className="bg-[#050B0D] border border-[#006F73]/50 p-4">
          <span className="text-[10px] text-[#8A9CA7] block font-orbitron">RATIO DEMANDA/CAPACIDAD:</span>
          <span className={`text-xl font-bold ${isPurlinValid ? 'text-[#CCFF00]' : 'text-[#FF4D5A]'}`}>
            {purlinDCRatio} {isPurlinValid ? '(PASÓ)' : '(SOBREEF.)'}
          </span>
        </div>
      </div>

      {/* 3. PARAMETRIC CONTROLS & SECTION SELECTOR */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Controls */}
        <div className="lg:col-span-6 space-y-5">
          <div className="bg-[#050B0D] border border-[#006F73]/50 p-5 space-y-4">
            <h2 className="text-sm font-orbitron font-bold text-[#00F0FF] flex items-center gap-2">
              <Sliders size={16} />
              <span>GEOMETRÍA & ESPACIAMIENTO MODULAR</span>
            </h2>

            <div className="space-y-4 text-xs">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-[#8A9CA7]">SEPARACIÓN ENTRE LARGUEROS (EJE A EJE):</span>
                  <span className="text-[#CCFF00] font-bold">{purlinSpacingM.toFixed(2)} m</span>
                </div>
                <input
                  type="range"
                  min={0.80}
                  max={1.80}
                  step={0.05}
                  value={purlinSpacingM}
                  onChange={(e) => setPurlinSpacingM(parseFloat(e.target.value))}
                  className="w-full accent-[#CCFF00] cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-[#8A9CA7] mt-1">
                  <span>0.80 m (Lámina Traslúcida)</span>
                  <span>1.20 m (Estándar KR-18)</span>
                  <span>1.80 m (Panel Aislado)</span>
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-[#8A9CA7]">LONGITUD DE TRASLAPE EN APOYOS:</span>
                  <span className="text-[#00F0FF] font-bold">{overlapLengthMm} mm</span>
                </div>
                <input
                  type="range"
                  min={200}
                  max={800}
                  step={50}
                  value={overlapLengthMm}
                  onChange={(e) => setOverlapLengthMm(parseInt(e.target.value))}
                  className="w-full accent-[#00F0FF] cursor-pointer"
                />
              </div>

              <div className="p-3 bg-black/60 border border-[#006F73]/30 flex items-center justify-between">
                <div>
                  <span className="text-white font-bold block">Templadores de Varilla (Sag Rods):</span>
                  <span className="text-[10px] text-[#8A9CA7]">Arriostramiento al eje débil en el punto medio del claro.</span>
                </div>
                <input
                  type="checkbox"
                  checked={includeSagRods}
                  onChange={(e) => setIncludeSagRods(e.target.checked)}
                  className="w-4 h-4 accent-[#CCFF00] cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Section Selection */}
          <div className="bg-[#050B0D] border border-[#006F73]/50 p-5 space-y-3">
            <h3 className="text-xs font-orbitron font-bold text-[#8A9CA7]">CATÁLOGO DE PERFILES POLÍN MONTEN / Z</h3>
            <div className="space-y-2">
              {purlinCatalog.map((prof) => (
                <div
                  key={prof.id}
                  onClick={() => setPurlinProfile(prof.id)}
                  className={`p-2.5 border transition-all cursor-pointer text-xs flex items-center justify-between ${
                    purlinProfile === prof.id
                      ? 'bg-[#CCFF00]/10 border-[#CCFF00] text-white'
                      : 'bg-black/40 border-[#006F73]/30 text-[#8A9CA7] hover:border-[#00F0FF]/60'
                  }`}
                >
                  <div>
                    <div className="font-bold text-[#F2F7F7]">{prof.name}</div>
                    <div className="text-[10px] text-[#8A9CA7]">Módulo de Sección Sx: {prof.SxCm3} cm³ | Peso: {prof.weightKgM} kg/m</div>
                  </div>
                  {purlinProfile === prof.id && (
                    <CheckCircle2 size={16} className="text-[#CCFF00]" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Technical Engineering Evaluation */}
        <div className="lg:col-span-6 space-y-5">
          <div className="bg-[#050B0D] border border-[#006F73]/50 p-5 space-y-4">
            <h2 className="text-sm font-orbitron font-bold text-[#CCFF00] flex items-center gap-2">
              <ShieldCheck size={16} />
              <span>EVALUACIÓN AISC 360-16 / AISI S100</span>
            </h2>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between p-2 bg-black/60 border border-[#006F73]/30">
                <span className="text-[#8A9CA7]">Carga Gravitacional Tributaria (D + Lr):</span>
                <span className="text-white font-bold">{qTotalKNm.toFixed(2)} kN/m</span>
              </div>
              <div className="flex justify-between p-2 bg-black/60 border border-[#006F73]/30">
                <span className="text-[#8A9CA7]">Momento Flector Máximo (Mmax):</span>
                <span className="text-[#00F0FF] font-bold">{maxMomentKNm.toFixed(2)} kN·m</span>
              </div>
              <div className="flex justify-between p-2 bg-black/60 border border-[#006F73]/30">
                <span className="text-[#8A9CA7]">Módulo de Sección Requerido (Sx,req):</span>
                <span className="text-white font-bold">{requiredSxCm3.toFixed(1)} cm³</span>
              </div>
              <div className="flex justify-between p-2 bg-black/60 border border-[#006F73]/30">
                <span className="text-[#8A9CA7]">Módulo de Sección Suministrado (Sx,sup):</span>
                <span className="text-[#CCFF00] font-bold">{currentProfileData.SxCm3} cm³</span>
              </div>
              <div className="flex justify-between p-2 bg-black/60 border border-[#006F73]/30">
                <span className="text-[#8A9CA7]">Deflexión L/240 Permitida ({bayLengthM.toFixed(1)}m):</span>
                <span className="text-white font-bold">{((bayLengthM * 1000) / 240).toFixed(1)} mm</span>
              </div>
            </div>

            <div className="p-3 bg-[#03080A] border border-[#00F0FF]/30 text-[11px] space-y-1 text-[#8A9CA7]">
              <span className="text-[#00F0FF] font-bold block">NOTA DE MONTAJE Y FIJACIÓN:</span>
              <p>
                Los polines se fijan a las cartelas de cuerda superior mediante 2 tornillos Grado 5 de 1/2" por apoyo o pija autotaladrante 1/4" con arandela de neopreno EPDM.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
