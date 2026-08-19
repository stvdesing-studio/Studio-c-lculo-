// ============================================================
// STV CLOSER — FABRICATION & CONNECTION HUD (SCREEN 02)
// FabricationConnectionHUD.tsx
// Joint Breakdown, AWS D1.1 Welds, Gusset Plates, Cut Angles, and Transport
// ============================================================

import React, { useState } from 'react';
import { Hammer, Wrench, Scissors, Truck, ShieldAlert, ChevronDown, ChevronUp } from 'lucide-react';
import { GeneratedTrussStructure } from '../../../dst/parametric-truss-engine';

interface FabricationConnectionHUDProps {
  trussData: GeneratedTrussStructure;
  spanM: number;
}

export const FabricationConnectionHUD: React.FC<FabricationConnectionHUDProps> = ({
  trussData,
  spanM
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const totalMembers = trussData.summary.membersCount;
  const totalLength = trussData.summary.totalLengthM;
  const totalWeight = trussData.summary.totalSteelWeightKg;
  const minCut = trussData.summary.cutAnglesSummary.minDeg;

  // Approx weld meters ~ 0.3m per member joint
  const totalWeldMeters = (totalMembers * 0.35).toFixed(1);
  const requiresSplice = spanM > 12.0;

  return (
    <div className="bg-[#030911]/90 border border-[#00E5FF]/30 backdrop-blur-xl rounded select-none text-[#F2F7F7] font-mono-tech text-[9px] w-full max-w-sm">
      {/* Header */}
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-2 flex items-center justify-between hover:bg-[#051829] transition-colors"
      >
        <div className="flex items-center gap-1.5">
          <Hammer className="w-3.5 h-3.5 text-[#FFD600]" />
          <span className="font-orbitron font-bold text-[10px] text-white">
            FABRICATION & CONEXIONES HUD
          </span>
        </div>
        <div className="flex items-center gap-1 text-[#00E5FF]">
          <span className="text-[8px] font-bold">AWS D1.1</span>
          {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </div>
      </button>

      {/* Quick Summary Pill Row */}
      <div className="px-2 pb-2 grid grid-cols-3 gap-1 text-center">
        <div className="p-1 bg-[#02050A] rounded border border-[#0D2235]">
          <div className="text-[7px] text-[#8A949D]">SOLDADURA</div>
          <div className="font-orbitron font-bold text-[#00E5FF]">{totalWeldMeters} m</div>
        </div>
        <div className="p-1 bg-[#02050A] rounded border border-[#0D2235]">
          <div className="text-[7px] text-[#8A949D]">CORTE MÍN</div>
          <div className="font-orbitron font-bold text-[#FFD600]">{minCut}°</div>
        </div>
        <div className="p-1 bg-[#02050A] rounded border border-[#0D2235]">
          <div className="text-[7px] text-[#8A949D]">TRANSPORTE</div>
          <div className={`font-orbitron font-bold ${requiresSplice ? 'text-[#FF9100]' : 'text-[#00E5FF]'}`}>
            {requiresSplice ? '2 TRAMOS' : 'DIRECTO'}
          </div>
        </div>
      </div>

      {/* Expanded Details */}
      {isExpanded && (
        <div className="p-2.5 border-t border-[#0D2235] space-y-2 bg-[#02050A]">
          {/* Joint Detail Breakdown */}
          <div className="text-[8px] text-[#8A949D] flex items-center justify-between">
            <span>DETALLE TÍPICO DE NUDO:</span>
            <span className="text-[#00E5FF] font-bold">CARTABÓN t = 3/8" (9.5mm)</span>
          </div>

          <div className="p-2 bg-[#010307] rounded border border-[#0D2235] space-y-1 text-[8px]">
            <div className="flex justify-between">
              <span className="text-[#8A949D]">Cordón de Soldadura:</span>
              <span className="text-white font-bold">Filete E70XX de 3/16" continuo</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#8A949D]">Bisel de Extremos:</span>
              <span className="text-white font-bold">Corte plasma CNC 45° / 90°</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#8A949D]">Tolerancia de Taller:</span>
              <span className="text-[#00E5FF] font-bold">± 1.5 mm (AISC Code of Standard Practice)</span>
            </div>
          </div>

          {/* Transport Splice Note */}
          {requiresSplice && (
            <div className="p-1.5 bg-[#181203] border border-[#FFD600]/40 rounded text-[7px] text-[#FFD600] flex items-start gap-1.5">
              <Truck className="w-3 h-3 shrink-0 mt-0.5" />
              <div>
                <b>EMPALME DE OBRA REQUERIDO:</b> Para claros mayores a 12m se define junta empernada en cuartos de luz con placas cubre-juntas A325.
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
