// ============================================================
// STV CLOSER — PANEL & WEB DISTRIBUTION HUB (SCREEN 02)
// PanelWebDistributionHub.tsx
// Panel Spacing Modes & Zigzag Vector Direction Selector
// ============================================================

import React from 'react';
import { ArrowRightLeft, GitFork, Split, Hash, CheckSquare, Square } from 'lucide-react';

export type PanelDistributionMode =
  | 'UNIFORM'
  | 'VARIABLE'
  | 'SYMMETRIC'
  | 'CENTER_DENSE'
  | 'EDGE_DENSE'
  | 'CUSTOM';

export type ZigzagVectorMode =
  | 'LEFT_TO_RIGHT'
  | 'RIGHT_TO_LEFT'
  | 'SYMMETRIC'
  | 'REVERSE_AT_RIDGE'
  | 'CUSTOM';

interface PanelWebDistributionHubProps {
  distributionMode: PanelDistributionMode;
  onSelectDistributionMode: (mode: PanelDistributionMode) => void;
  zigzagMode: ZigzagVectorMode;
  onSelectZigzagMode: (mode: ZigzagVectorMode) => void;
  addVerticals: boolean;
  onToggleVerticals: () => void;
  topChordCount: number;
  bottomChordCount: number;
  webCount: number;
}

export const PanelWebDistributionHub: React.FC<PanelWebDistributionHubProps> = ({
  distributionMode = 'UNIFORM',
  onSelectDistributionMode,
  zigzagMode = 'SYMMETRIC',
  onSelectZigzagMode,
  addVerticals = true,
  onToggleVerticals,
  topChordCount,
  bottomChordCount,
  webCount
}) => {
  const distributionOptions: { id: PanelDistributionMode; label: string; desc: string }[] = [
    { id: 'UNIFORM', label: 'UNIFORME', desc: 'Espaciamiento modular equidistante constante.' },
    { id: 'SYMMETRIC', label: 'SIMÉTRICO', desc: 'Gradación simétrica desde cumbrera a apoyos.' },
    { id: 'CENTER_DENSE', label: 'CENTRO DENSO', desc: 'Mayor densidad de almas en el vano central.' },
    { id: 'EDGE_DENSE', label: 'BORDES DENSOS', desc: 'Mayor densidad en apoyos para resistir cortante.' },
    { id: 'VARIABLE', label: 'VARIABLE', desc: 'Paneles con progresión geométrica personalizada.' }
  ];

  const zigzagOptions: { id: ZigzagVectorMode; label: string; desc: string }[] = [
    { id: 'SYMMETRIC', label: 'SIMÉTRICO', desc: 'Inclinación convergente hacia el centro.' },
    { id: 'REVERSE_AT_RIDGE', label: 'INVERSIÓN CUMBRERA', desc: 'Invierte orientación en el vértice superior.' },
    { id: 'LEFT_TO_RIGHT', label: 'IZQ → DER', desc: 'Sentido continuo hacia la derecha.' },
    { id: 'RIGHT_TO_LEFT', label: 'DER → IZQ', desc: 'Sentido continuo hacia la izquierda.' }
  ];

  return (
    <div className="flex flex-col bg-[#030911]/90 border border-[#00E5FF]/30 backdrop-blur-xl p-2.5 rounded select-none text-[#F2F7F7] font-mono-tech text-[9px] w-full max-w-xl">
      {/* 1. TOP HEADER */}
      <div className="flex items-center justify-between border-b border-[#0D2235] pb-1.5 mb-2">
        <div className="flex items-center gap-1.5">
          <Split className="w-3.5 h-3.5 text-[#00E5FF]" />
          <span className="font-orbitron font-bold text-[10px] text-white">
            DISTRIBUCIÓN DE PANELES & VECTOR WEB
          </span>
        </div>
        {/* Toggle Verticals Checkbox */}
        <button
          type="button"
          onClick={onToggleVerticals}
          className="flex items-center gap-1 text-[#FFD600] hover:text-white transition-colors"
        >
          {addVerticals ? (
            <CheckSquare className="w-3.5 h-3.5 text-[#00E5FF]" />
          ) : (
            <Square className="w-3.5 h-3.5 text-[#8A949D]" />
          )}
          <span>MONTANTES VERTICALES</span>
        </button>
      </div>

      {/* 2. DUAL ROW: PANEL DISTRIBUTION & ZIGZAG VECTOR */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-2">
        {/* Panel Distribution Chips */}
        <div>
          <div className="text-[8px] font-orbitron text-[#8A949D] mb-1">
            DISTRIBUCIÓN DE VANOS:
          </div>
          <div className="flex flex-wrap gap-1">
            {distributionOptions.map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => onSelectDistributionMode(opt.id)}
                className={`px-2 py-0.5 rounded text-[8px] font-orbitron transition-all ${
                  distributionMode === opt.id
                    ? 'bg-[#00E5FF] text-black font-bold shadow-[0_0_8px_#00E5FF]'
                    : 'bg-[#02050A] text-[#8A949D] border border-[#0D2235] hover:text-white'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Zigzag Vector Chips */}
        <div>
          <div className="text-[8px] font-orbitron text-[#8A949D] mb-1">
            VECTOR CELOSÍA / ZIGZAG:
          </div>
          <div className="flex flex-wrap gap-1">
            {zigzagOptions.map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => onSelectZigzagMode(opt.id)}
                className={`px-2 py-0.5 rounded text-[8px] font-orbitron transition-all ${
                  zigzagMode === opt.id
                    ? 'bg-[#FFD600] text-black font-bold shadow-[0_0_8px_#FFD600]'
                    : 'bg-[#02050A] text-[#8A949D] border border-[#0D2235] hover:text-white'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 3. STRUCTURAL MEMBER INVENTORY SUMMARY PILLS */}
      <div className="flex items-center justify-between bg-[#02050A] p-1.5 border border-[#0D2235] rounded text-[8px]">
        <span className="text-[#8A949D]">INVENTARIO GRAFO:</span>
        <div className="flex items-center gap-2">
          <span className="text-[#00E5FF]">CUERDA SUP: <b className="text-white">{topChordCount}</b></span>
          <span className="text-[#00B4D8]">CUERDA INF: <b className="text-white">{bottomChordCount}</b></span>
          <span className="text-[#FFD600]">ALMAS (WEBS): <b className="text-white">{webCount}</b></span>
          <span className="text-[#FF3366]">TOTAL: <b className="text-white">{topChordCount + bottomChordCount + webCount}</b></span>
        </div>
      </div>
    </div>
  );
};
