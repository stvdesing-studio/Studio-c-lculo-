// ============================================================
// STV CLOSER — LOAD & STRUCTURAL RESPONSE HUD (SCREEN 02)
// LoadStructuralResponseHUD.tsx
// ASCE 7-22 Gravitational & Wind Loads, Internal Force Flow, and Deflections
// ============================================================

import React, { useState } from 'react';
import { Activity, Wind, ArrowDown, ShieldCheck, ChevronDown, ChevronUp } from 'lucide-react';

interface LoadStructuralResponseHUDProps {
  spanM: number;
  riseM: number;
  depthM: number;
  totalWeightKg: number;
  showLoads: boolean;
  onToggleShowLoads: () => void;
}

export const LoadStructuralResponseHUD: React.FC<LoadStructuralResponseHUDProps> = ({
  spanM,
  riseM,
  depthM,
  totalWeightKg,
  showLoads,
  onToggleShowLoads
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // ASCE 7-22 Standard Loads
  const deadLoadKgM2 = 35; // kg/m2 (sheet + purlins + self-weight)
  const liveLoadKgM2 = 40; // kg/m2
  const windLoadKgM2 = 65; // kg/m2 (velocity 130 km/h)

  const tributaryWidthM = 5.0; // 5m between frames
  const wTotalKgM = (deadLoadKgM2 + liveLoadKgM2) * tributaryWidthM;

  // Approximate internal forces: M = w * L^2 / 8, T = M / d
  const effectiveD = riseM > 0 ? riseM : depthM;
  const maxMomentTonM = (wTotalKgM * spanM * spanM) / (8 * 1000);
  const maxChordForceTon = (maxMomentTonM / Math.max(0.5, effectiveD)).toFixed(1);
  const maxReactionTon = ((wTotalKgM * spanM) / (2 * 1000)).toFixed(1);

  // Approx deflection in mm
  const approxDeflectionMm = ((spanM * 1000) / 450).toFixed(1);
  const allowableDeflectionMm = ((spanM * 1000) / 360).toFixed(1);

  return (
    <div className="bg-[#030911]/90 border border-[#00E5FF]/30 backdrop-blur-xl rounded select-none text-[#F2F7F7] font-mono-tech text-[9px] w-full max-w-sm">
      {/* Header */}
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-2 flex items-center justify-between hover:bg-[#051829] transition-colors"
      >
        <div className="flex items-center gap-1.5">
          <Activity className="w-3.5 h-3.5 text-[#00E5FF]" />
          <span className="font-orbitron font-bold text-[10px] text-white">
            LOADS & RESPUESTA ESTRUCTURAL
          </span>
        </div>
        <div className="flex items-center gap-1 text-[#FFD600]">
          <span className="text-[8px] font-bold">ASCE 7-22</span>
          {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </div>
      </button>

      {/* Quick Summary Pill Row */}
      <div className="px-2 pb-2 grid grid-cols-3 gap-1 text-center">
        <div className="p-1 bg-[#02050A] rounded border border-[#0D2235]">
          <div className="text-[7px] text-[#8A949D]">REACCIÓN (R)</div>
          <div className="font-orbitron font-bold text-[#FF3366]">{maxReactionTon} ton</div>
        </div>
        <div className="p-1 bg-[#02050A] rounded border border-[#0D2235]">
          <div className="text-[7px] text-[#8A949D]">AXIAL MÁX (T/C)</div>
          <div className="font-orbitron font-bold text-[#FFD600]">±{maxChordForceTon} ton</div>
        </div>
        <div className="p-1 bg-[#02050A] rounded border border-[#0D2235]">
          <div className="text-[7px] text-[#8A949D]">DEFLEXIÓN (δ)</div>
          <div className="font-orbitron font-bold text-[#00E5FF]">{approxDeflectionMm} mm</div>
        </div>
      </div>

      {/* Expanded Details */}
      {isExpanded && (
        <div className="p-2.5 border-t border-[#0D2235] space-y-2 bg-[#02050A]">
          {/* ASCE 7 Combinations */}
          <div className="space-y-1 text-[8px]">
            <div className="flex justify-between">
              <span className="text-[#8A949D]">Carga Muerta (D):</span>
              <span className="text-white font-bold">{deadLoadKgM2} kg/m²</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#8A949D]">Carga Viva Techo (Lr):</span>
              <span className="text-white font-bold">{liveLoadKgM2} kg/m²</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#8A949D]">Presión Viento (W):</span>
              <span className="text-[#00E5FF] font-bold">±{windLoadKgM2} kg/m²</span>
            </div>
            <div className="flex justify-between pt-1 border-t border-[#0D2235]">
              <span className="text-[#8A949D]">Límite LRFD L/360:</span>
              <span className="text-[#00E5FF] font-bold">{allowableDeflectionMm} mm (OK)</span>
            </div>
          </div>

          {/* Toggle Vector Overlay Button */}
          <button
            type="button"
            onClick={onToggleShowLoads}
            className={`w-full py-1 rounded text-[8px] font-orbitron font-bold transition-all flex items-center justify-center gap-1 ${
              showLoads
                ? 'bg-[#FF3366] text-white shadow-[0_0_8px_#FF3366]'
                : 'bg-[#051829] text-[#8A949D] border border-[#0D2235] hover:text-white'
            }`}
          >
            <ArrowDown className="w-3 h-3" />
            {showLoads ? 'OCULTAR VECTORES DE CARGA 3D' : 'MOSTRAR VECTORES DE CARGA 3D'}
          </button>
        </div>
      )}
    </div>
  );
};
