// ============================================================
// STV CLOSER — HOLOGRAPHIC PARAMETRIC DIALS & ARC GLYPH SELECTOR
// HolographicParametricDials.tsx
// Contract 31.1 to 31.5: Touch/Stylus Holographic Control Loop
// ============================================================

import React from 'react';
import {
  Lock,
  Unlock,
  Settings,
  ChevronLeft,
  ChevronRight,
  RotateCw,
  Sliders,
  Triangle,
  Columns,
  Grid,
  Maximize2
} from 'lucide-react';
import { TrussType, SectionProfile } from '../../../dst/dst.schema';

export type ParamConstraintState = 'EDITABLE' | 'LOCKED' | 'DERIVED';

interface HolographicParametricDialsProps {
  spanM: number;
  heightM: number;
  roofRiseM: number;
  framesCount: number;
  purlinSpacingM: number;
  columnInclinationDeg: number;
  trussType: TrussType;
  columnProfile: SectionProfile;
  chordProfile: SectionProfile;
  webProfile: SectionProfile;
  purlinProfile: SectionProfile;
  constraintStates: {
    span: ParamConstraintState;
    height: ParamConstraintState;
    roofRise: ParamConstraintState;
    framesCount: ParamConstraintState;
    purlinSpacing: ParamConstraintState;
  };
  conflictWarning: string | null;
  onUpdateParam: (key: string, value: any) => void;
  onToggleConstraint: (key: string) => void;
}

const TRUSS_TYPOLOGIES: { type: TrussType; name: string; iconShape: string }[] = [
  { type: 'WARREN', name: 'WARREN EQUILATERAL', iconShape: 'W' },
  { type: 'PRATT', name: 'PRATT TENSION WEB', iconShape: 'P' },
  { type: 'HOWE', name: 'HOWE COMPRESSION WEB', iconShape: 'H' },
  { type: 'FINK', name: 'FINK MULTI-PANEL', iconShape: 'F' },
  { type: 'BOWSTRING', name: 'BOWSTRING ARCHED', iconShape: 'B' },
  { type: 'SCISSORS', name: 'SCISSOR CATENARY', iconShape: 'S' },
  { type: 'VIERENDEEL', name: 'VIERENDEEL RIGID', iconShape: 'V' },
  { type: 'SHED', name: 'SHED MONOSLOPE', iconShape: 'M' }
];

const COLUMN_PRESETS: { designation: string; family: string; d: number; w: number; t: number }[] = [
  { designation: 'HSS 8x8x1/4" (200x200x6.3)', family: 'HSS', d: 0.20, w: 0.20, t: 0.0063 },
  { designation: 'HSS 10x10x3/8" (250x250x9.5)', family: 'HSS', d: 0.25, w: 0.25, t: 0.0095 },
  { designation: 'W 10x33 (IPR 254x49.1)', family: 'IPR', d: 0.247, w: 0.202, t: 0.011 },
  { designation: 'PIPE Ø8" SCH 40 (219x8.2)', family: 'PIPE', d: 0.219, w: 0.219, t: 0.0082 },
  { designation: '4L 3x3x1/4" LATTICED BOX', family: 'LATTICED', d: 0.35, w: 0.35, t: 0.0063 }
];

export const HolographicParametricDials: React.FC<HolographicParametricDialsProps> = ({
  spanM,
  heightM,
  roofRiseM,
  framesCount,
  purlinSpacingM,
  columnInclinationDeg,
  trussType,
  columnProfile,
  chordProfile,
  webProfile,
  purlinProfile,
  constraintStates,
  conflictWarning,
  onUpdateParam,
  onToggleConstraint
}) => {
  return (
    <div className="absolute inset-x-0 bottom-6 z-30 pointer-events-none flex flex-col items-center gap-3">
      {/* 1. CONFLICT WARNING HOLOGRAM IF IMPOSSIBLE PARAMETER ENCOUNTERED */}
      {conflictWarning && (
        <div className="pointer-events-auto px-4 py-1.5 bg-[#FF3B30]/20 border border-[#FF3B30] text-[#FF3B30] text-[10px] font-orbitron font-bold flex items-center gap-2 animate-bounce shadow-[0_0_20px_rgba(255,59,48,0.5)]">
          <div className="w-2 h-2 rounded-full bg-[#FF3B30] animate-ping" />
          <span>CONFLICTO DE RESTRICCIÓN: {conflictWarning}</span>
        </div>
      )}

      {/* 2. MAIN FLOATING HOLOGRAPHIC CONSOLE (100% TRANSPARENT BACKDROP, GLOWING EDGES) */}
      <div className="pointer-events-auto flex flex-wrap items-center justify-center gap-2 max-w-5xl px-4 py-2 bg-[#02050B]/75 backdrop-blur-md border border-[#00E5FF]/40 shadow-[0_0_30px_rgba(0,229,255,0.15)] rounded-xl">
        
        {/* PARAMETER 1: CLARO (SPAN) */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[#030812]/80 border border-[#00E5FF]/30 rounded-lg group hover:border-[#00E5FF]">
          <div className="flex flex-col">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[8px] font-orbitron text-[#8A949D]">01 CLARO (L)</span>
              <button
                onClick={() => onToggleConstraint('span')}
                title="Cambiar estado: 🔓 Editable / 🔒 Fijo / ⚙️ Calculado"
                className="text-[#00E5FF] hover:text-[#FFD700]"
              >
                {constraintStates.span === 'LOCKED' ? (
                  <Lock size={10} className="text-[#FFD700]" />
                ) : constraintStates.span === 'DERIVED' ? (
                  <Settings size={10} className="text-[#00E5FF] animate-spin" />
                ) : (
                  <Unlock size={10} className="text-[#39E58C]" />
                )}
              </button>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => onUpdateParam('spanM', Math.max(6, spanM - 1))}
                disabled={constraintStates.span === 'LOCKED'}
                className="w-5 h-5 bg-[#0A1424] hover:bg-[#00E5FF]/20 text-[#00E5FF] text-[11px] font-bold rounded flex items-center justify-center disabled:opacity-30"
              >
                -
              </button>
              <span className="text-sm font-orbitron font-black text-[#F2F7F7] tracking-wider min-w-[55px] text-center">
                {spanM.toFixed(1)} <span className="text-[9px] text-[#00E5FF]">m</span>
              </span>
              <button
                onClick={() => onUpdateParam('spanM', Math.min(36, spanM + 1))}
                disabled={constraintStates.span === 'LOCKED'}
                className="w-5 h-5 bg-[#0A1424] hover:bg-[#00E5FF]/20 text-[#00E5FF] text-[11px] font-bold rounded flex items-center justify-center disabled:opacity-30"
              >
                +
              </button>
            </div>
          </div>
        </div>

        {/* PARAMETER 2: ALTURA COLUMNA (HEIGHT) */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[#030812]/80 border border-[#00E5FF]/30 rounded-lg group hover:border-[#00E5FF]">
          <div className="flex flex-col">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[8px] font-orbitron text-[#8A949D]">02 ALTURA (H)</span>
              <button
                onClick={() => onToggleConstraint('height')}
                className="text-[#00E5FF] hover:text-[#FFD700]"
              >
                {constraintStates.height === 'LOCKED' ? (
                  <Lock size={10} className="text-[#FFD700]" />
                ) : (
                  <Unlock size={10} className="text-[#39E58C]" />
                )}
              </button>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => onUpdateParam('heightM', Math.max(3, heightM - 0.5))}
                disabled={constraintStates.height === 'LOCKED'}
                className="w-5 h-5 bg-[#0A1424] hover:bg-[#00E5FF]/20 text-[#00E5FF] text-[11px] font-bold rounded flex items-center justify-center disabled:opacity-30"
              >
                -
              </button>
              <span className="text-sm font-orbitron font-black text-[#F2F7F7] tracking-wider min-w-[50px] text-center">
                {heightM.toFixed(1)} <span className="text-[9px] text-[#00E5FF]">m</span>
              </span>
              <button
                onClick={() => onUpdateParam('heightM', Math.min(14, heightM + 0.5))}
                disabled={constraintStates.height === 'LOCKED'}
                className="w-5 h-5 bg-[#0A1424] hover:bg-[#00E5FF]/20 text-[#00E5FF] text-[11px] font-bold rounded flex items-center justify-center disabled:opacity-30"
              >
                +
              </button>
            </div>
          </div>
        </div>

        {/* PARAMETER 3: FLECHA / PERALTE (ROOF RISE) */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[#030812]/80 border border-[#00E5FF]/30 rounded-lg group hover:border-[#00E5FF]">
          <div className="flex flex-col">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[8px] font-orbitron text-[#8A949D]">03 PERALTE (f)</span>
              <button
                onClick={() => onToggleConstraint('roofRise')}
                className="text-[#00E5FF] hover:text-[#FFD700]"
              >
                {constraintStates.roofRise === 'LOCKED' ? (
                  <Lock size={10} className="text-[#FFD700]" />
                ) : (
                  <Unlock size={10} className="text-[#39E58C]" />
                )}
              </button>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => onUpdateParam('roofRiseM', Math.max(0.4, roofRiseM - 0.2))}
                disabled={constraintStates.roofRise === 'LOCKED'}
                className="w-5 h-5 bg-[#0A1424] hover:bg-[#00E5FF]/20 text-[#00E5FF] text-[11px] font-bold rounded flex items-center justify-center disabled:opacity-30"
              >
                -
              </button>
              <span className="text-sm font-orbitron font-black text-[#F2F7F7] tracking-wider min-w-[50px] text-center">
                {roofRiseM.toFixed(1)} <span className="text-[9px] text-[#00E5FF]">m</span>
              </span>
              <button
                onClick={() => onUpdateParam('roofRiseM', Math.min(5.0, roofRiseM + 0.2))}
                disabled={constraintStates.roofRise === 'LOCKED'}
                className="w-5 h-5 bg-[#0A1424] hover:bg-[#00E5FF]/20 text-[#00E5FF] text-[11px] font-bold rounded flex items-center justify-center disabled:opacity-30"
              >
                +
              </button>
            </div>
          </div>
        </div>

        {/* PARAMETER 4: MARCOS ESTRUCTURALES (FRAMES) */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[#030812]/80 border border-[#00E5FF]/30 rounded-lg group hover:border-[#00E5FF]">
          <div className="flex flex-col">
            <span className="text-[8px] font-orbitron text-[#8A949D]">04 MARCOS (N)</span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => onUpdateParam('framesCount', Math.max(2, framesCount - 1))}
                className="w-5 h-5 bg-[#0A1424] hover:bg-[#00E5FF]/20 text-[#00E5FF] text-[11px] font-bold rounded flex items-center justify-center"
              >
                -
              </button>
              <span className="text-sm font-orbitron font-black text-[#F2F7F7] tracking-wider min-w-[45px] text-center">
                {framesCount}
              </span>
              <button
                onClick={() => onUpdateParam('framesCount', Math.min(16, framesCount + 1))}
                className="w-5 h-5 bg-[#0A1424] hover:bg-[#00E5FF]/20 text-[#00E5FF] text-[11px] font-bold rounded flex items-center justify-center"
              >
                +
              </button>
            </div>
          </div>
        </div>

        {/* PARAMETER 5: INCLINACIÓN DE COLUMNAS (GIZMO DEG) */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[#030812]/80 border border-[#00E5FF]/30 rounded-lg group hover:border-[#00E5FF]">
          <div className="flex flex-col">
            <span className="text-[8px] font-orbitron text-[#8A949D]">05 INCLINACIÓN (θ)</span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => onUpdateParam('columnInclinationDeg', Math.max(0, columnInclinationDeg - 5))}
                className="w-5 h-5 bg-[#0A1424] hover:bg-[#00E5FF]/20 text-[#00E5FF] text-[11px] font-bold rounded flex items-center justify-center"
              >
                -
              </button>
              <span className="text-sm font-orbitron font-black text-[#FFD700] tracking-wider min-w-[45px] text-center">
                {columnInclinationDeg}°
              </span>
              <button
                onClick={() => onUpdateParam('columnInclinationDeg', Math.min(30, columnInclinationDeg + 5))}
                className="w-5 h-5 bg-[#0A1424] hover:bg-[#00E5FF]/20 text-[#00E5FF] text-[11px] font-bold rounded flex items-center justify-center"
              >
                +
              </button>
            </div>
          </div>
        </div>

        {/* 3. ARC TYPOLOGY QUICK SELECTOR */}
        <div className="flex items-center gap-1 pl-2 border-l border-[#00E5FF]/30">
          {TRUSS_TYPOLOGIES.slice(0, 4).map((t) => {
            const isSelected = trussType === t.type;
            return (
              <button
                key={t.type}
                onClick={() => onUpdateParam('trussType', t.type)}
                className={`px-2 py-1 text-[9px] font-orbitron font-bold rounded transition-all ${
                  isSelected
                    ? 'bg-[#FFD700] text-black shadow-[0_0_10px_#FFD700]'
                    : 'bg-[#0A1424] text-[#8A949D] hover:text-[#00E5FF] hover:bg-[#00E5FF]/20'
                }`}
              >
                {t.name.split(' ')[0]}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
