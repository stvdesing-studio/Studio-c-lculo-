import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Maximize2, Minimize2, CheckCircle2, Sliders, ShieldAlert } from 'lucide-react';

export type BreakoutQuadrant = 'BASE_PLATE' | 'ANCHOR_BOLTS' | 'PEDESTAL' | 'WELDS';

interface HolographicBreakoutHubProps {
  basePlateWidthMm?: number;
  basePlateThickMm?: number;
  anchorCount?: number;
  anchorDiamMm?: number;
  onUpdateParams?: (updates: { basePlateThickMm?: number; anchorCount?: number }) => void;
}

export const HolographicBreakoutHub: React.FC<HolographicBreakoutHubProps> = ({
  basePlateWidthMm = 400,
  basePlateThickMm = 25,
  anchorCount = 6,
  anchorDiamMm = 24,
  onUpdateParams
}) => {
  const [activeQuadrant, setActiveQuadrant] = useState<BreakoutQuadrant>('BASE_PLATE');
  const [isExpanded, setIsExpanded] = useState(false);
  const [isExploded, setIsExploded] = useState(false);

  return (
    <div className="relative select-none pointer-events-auto">
      {/* 1. Holographic Breakout HUD Ring Container */}
      <div className="relative w-56 h-56 sm:w-64 sm:h-64 rounded-full flex items-center justify-center">
        {/* Outer Glowing Cyan Reticle */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 240 240">
          {/* Circular Frame */}
          <circle
            cx="120"
            cy="120"
            r="110"
            fill="none"
            stroke="rgba(0, 229, 255, 0.4)"
            strokeWidth="1.2"
            strokeDasharray="4 8"
          />
          <circle
            cx="120"
            cy="120"
            r="102"
            fill="none"
            stroke="rgba(0, 229, 255, 0.2)"
            strokeWidth="1"
          />

          {/* Crosshairs & Tick Marks */}
          <line x1="120" y1="5" x2="120" y2="25" stroke="#00E5FF" strokeWidth="2" />
          <line x1="120" y1="215" x2="120" y2="235" stroke="#00E5FF" strokeWidth="2" />
          <line x1="5" y1="120" x2="25" y2="120" stroke="#00E5FF" strokeWidth="2" />
          <line x1="215" y1="120" x2="235" y2="120" stroke="#00E5FF" strokeWidth="2" />

          {/* Precision Corner Brackets [ L & J ] */}
          <path d="M 30 50 L 20 50 L 20 70" fill="none" stroke="rgba(140, 255, 255, 0.6)" strokeWidth="1.5" />
          <path d="M 210 50 L 220 50 L 220 70" fill="none" stroke="rgba(140, 255, 255, 0.6)" strokeWidth="1.5" />
          <path d="M 30 190 L 20 190 L 20 170" fill="none" stroke="rgba(140, 255, 255, 0.6)" strokeWidth="1.5" />
          <path d="M 210 190 L 220 190 L 220 170" fill="none" stroke="rgba(140, 255, 255, 0.6)" strokeWidth="1.5" />

          {/* Active Quadrant Highlight Arc (Yellow) */}
          {activeQuadrant === 'BASE_PLATE' && (
            <path
              d="M 120 18 A 102 102 0 0 1 222 120 L 120 120 Z"
              fill="rgba(255, 214, 0, 0.08)"
              stroke="#FFD600"
              strokeWidth="2.5"
              strokeDasharray="4 2"
              filter="drop-shadow(0 0 8px #FFD600)"
            />
          )}
          {activeQuadrant === 'ANCHOR_BOLTS' && (
            <path
              d="M 222 120 A 102 102 0 0 1 120 222 L 120 120 Z"
              fill="rgba(255, 214, 0, 0.08)"
              stroke="#FFD600"
              strokeWidth="2.5"
              strokeDasharray="4 2"
              filter="drop-shadow(0 0 8px #FFD600)"
            />
          )}
          {activeQuadrant === 'PEDESTAL' && (
            <path
              d="M 120 222 A 102 102 0 0 1 18 120 L 120 120 Z"
              fill="rgba(255, 214, 0, 0.08)"
              stroke="#FFD600"
              strokeWidth="2.5"
              strokeDasharray="4 2"
              filter="drop-shadow(0 0 8px #FFD600)"
            />
          )}
          {activeQuadrant === 'WELDS' && (
            <path
              d="M 18 120 A 102 102 0 0 1 120 18 L 120 120 Z"
              fill="rgba(255, 214, 0, 0.08)"
              stroke="#FFD600"
              strokeWidth="2.5"
              strokeDasharray="4 2"
              filter="drop-shadow(0 0 8px #FFD600)"
            />
          )}
        </svg>

        {/* 2. Center 3D Isometric Detail Blueprint Drawing (Interactive SVG) */}
        <div className="relative w-40 h-40 rounded-full bg-[#02050B]/85 border border-[#00E5FF]/50 backdrop-blur-md overflow-hidden flex items-center justify-center group shadow-[0_0_30px_rgba(0,229,255,0.2)]">
          <svg
            className={`w-32 h-32 transition-transform duration-500 ${
              isExploded ? 'scale-110 -translate-y-1' : 'scale-95'
            }`}
            viewBox="0 0 160 160"
            fill="none"
          >
            {/* Concrete Pedestal Block */}
            <path
              d="M 30 115 L 80 135 L 130 115 L 80 95 Z"
              fill="rgba(10, 25, 38, 0.8)"
              stroke="#00E5FF"
              strokeWidth="1.2"
            />
            <path
              d="M 30 115 L 30 135 L 80 155 L 80 135 Z"
              fill="rgba(6, 18, 28, 0.9)"
              stroke="#00E5FF"
              strokeWidth="1.2"
            />
            <path
              d="M 80 135 L 80 155 L 130 135 L 130 115 Z"
              fill="rgba(4, 12, 20, 0.9)"
              stroke="#00E5FF"
              strokeWidth="1.2"
            />

            {/* Base Plate (Thick Metallic Plate) */}
            <path
              d="M 42 100 L 80 115 L 118 100 L 80 85 Z"
              fill={activeQuadrant === 'BASE_PLATE' ? 'rgba(255, 214, 0, 0.25)' : 'rgba(0, 229, 255, 0.15)'}
              stroke={activeQuadrant === 'BASE_PLATE' ? '#FFD600' : '#00E5FF'}
              strokeWidth="1.8"
            />
            <path
              d="M 42 100 L 42 105 L 80 120 L 80 115 Z"
              fill="rgba(0, 229, 255, 0.3)"
              stroke={activeQuadrant === 'BASE_PLATE' ? '#FFD600' : '#00E5FF'}
              strokeWidth="1.5"
            />
            <path
              d="M 80 115 L 80 120 L 118 105 L 118 100 Z"
              fill="rgba(0, 229, 255, 0.3)"
              stroke={activeQuadrant === 'BASE_PLATE' ? '#FFD600' : '#00E5FF'}
              strokeWidth="1.5"
            />

            {/* 6 Anchor Bolt Studs & Hex Nuts */}
            {/* Left front */}
            <circle cx="52" cy="100" r="3" fill="#FFD600" stroke="#020307" strokeWidth="1" />
            {/* Left mid */}
            <circle cx="62" cy="94" r="2.5" fill="#FFD600" stroke="#020307" strokeWidth="1" />
            {/* Left back */}
            <circle cx="72" cy="89" r="2.5" fill="#FFD600" stroke="#020307" strokeWidth="1" />
            {/* Right front */}
            <circle cx="108" cy="100" r="3" fill="#FFD600" stroke="#020307" strokeWidth="1" />
            {/* Right mid */}
            <circle cx="98" cy="94" r="2.5" fill="#FFD600" stroke="#020307" strokeWidth="1" />
            {/* Right back */}
            <circle cx="88" cy="89" r="2.5" fill="#FFD600" stroke="#020307" strokeWidth="1" />

            {/* Column Steel HSS/PTR Shaft Extrusion */}
            <path
              d="M 65 92 L 80 98 L 95 92 L 80 86 Z"
              fill="rgba(0, 229, 255, 0.4)"
              stroke="#8CFFFF"
              strokeWidth="1.5"
            />
            <path
              d="M 65 92 L 65 30 L 80 36 L 80 98 Z"
              fill="rgba(0, 229, 255, 0.2)"
              stroke="#8CFFFF"
              strokeWidth="1.5"
            />
            <path
              d="M 80 98 L 80 36 L 95 30 L 95 92 Z"
              fill="rgba(0, 229, 255, 0.1)"
              stroke="#8CFFFF"
              strokeWidth="1.5"
            />
            <path
              d="M 65 30 L 80 36 L 95 30 L 80 24 Z"
              fill="rgba(0, 229, 255, 0.6)"
              stroke="#8CFFFF"
              strokeWidth="1.5"
            />

            {/* Triangular Stiffener Gussets */}
            <polygon points="65,92 65,75 54,97" fill="rgba(255, 214, 0, 0.2)" stroke="#FFD600" strokeWidth="1.2" />
            <polygon points="95,92 95,75 106,97" fill="rgba(255, 214, 0, 0.2)" stroke="#FFD600" strokeWidth="1.2" />
          </svg>

          {/* Action Overlay inside Lens */}
          <div className="absolute inset-0 bg-transparent flex flex-col justify-between p-2">
            <div className="flex justify-between items-center text-[8px] font-orbitron text-[#00E5FF]">
              <span>MAGNIFIER: 2.5X</span>
              <button
                type="button"
                onClick={() => setIsExploded(!isExploded)}
                className="px-1 py-0.5 bg-[#00E5FF]/20 border border-[#00E5FF] text-[7px] text-[#8CFFFF] hover:bg-[#00E5FF] hover:text-black font-bold tracking-tighter"
              >
                {isExploded ? 'COLLAPSE' : 'EXPLODED'}
              </button>
            </div>

            <div className="text-center">
              <span className="text-[10px] font-orbitron font-bold text-[#FFD600] tracking-wider block">
                {activeQuadrant}
              </span>
              <span className="text-[8px] font-mono-tech text-[#8CFFFF]">
                {activeQuadrant === 'BASE_PLATE' && `PL ${basePlateWidthMm}×${basePlateWidthMm}×${basePlateThickMm}mm`}
                {activeQuadrant === 'ANCHOR_BOLTS' && `${anchorCount}x Ø${anchorDiamMm}mm A325`}
                {activeQuadrant === 'PEDESTAL' && `500×500mm f'c=250`}
                {activeQuadrant === 'WELDS' && `CJP + Filete 8mm`}
              </span>
            </div>

            <div className="flex justify-center gap-1">
              {(['BASE_PLATE', 'ANCHOR_BOLTS', 'PEDESTAL', 'WELDS'] as BreakoutQuadrant[]).map((q) => (
                <button
                  key={q}
                  type="button"
                  onClick={() => setActiveQuadrant(q)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    activeQuadrant === q ? 'bg-[#FFD600] scale-125 shadow-[0_0_6px_#FFD600]' : 'bg-[#00E5FF]/30'
                  }`}
                  title={q}
                />
              ))}
            </div>
          </div>
        </div>

        {/* 4. Radial Quadrant Trigger Buttons around Lens */}
        <button
          type="button"
          onClick={() => setActiveQuadrant('BASE_PLATE')}
          className={`absolute top-2 right-2 px-2 py-0.5 rounded text-[8px] font-orbitron font-bold border transition-all ${
            activeQuadrant === 'BASE_PLATE'
              ? 'bg-[#FFD600] text-black border-[#FFD600] shadow-[0_0_8px_#FFD600]'
              : 'bg-[#030911]/90 text-[#8CFFFF] border-[#00E5FF]/40 hover:border-[#00E5FF]'
          }`}
        >
          PLACA BASE
        </button>

        <button
          type="button"
          onClick={() => setActiveQuadrant('ANCHOR_BOLTS')}
          className={`absolute bottom-2 right-2 px-2 py-0.5 rounded text-[8px] font-orbitron font-bold border transition-all ${
            activeQuadrant === 'ANCHOR_BOLTS'
              ? 'bg-[#FFD600] text-black border-[#FFD600] shadow-[0_0_8px_#FFD600]'
              : 'bg-[#030911]/90 text-[#8CFFFF] border-[#00E5FF]/40 hover:border-[#00E5FF]'
          }`}
        >
          ANCLAS (6x)
        </button>

        <button
          type="button"
          onClick={() => setActiveQuadrant('PEDESTAL')}
          className={`absolute bottom-2 left-2 px-2 py-0.5 rounded text-[8px] font-orbitron font-bold border transition-all ${
            activeQuadrant === 'PEDESTAL'
              ? 'bg-[#FFD600] text-black border-[#FFD600] shadow-[0_0_8px_#FFD600]'
              : 'bg-[#030911]/90 text-[#8CFFFF] border-[#00E5FF]/40 hover:border-[#00E5FF]'
          }`}
        >
          PEDESTAL
        </button>

        <button
          type="button"
          onClick={() => setActiveQuadrant('WELDS')}
          className={`absolute top-2 left-2 px-2 py-0.5 rounded text-[8px] font-orbitron font-bold border transition-all ${
            activeQuadrant === 'WELDS'
              ? 'bg-[#FFD600] text-black border-[#FFD600] shadow-[0_0_8px_#FFD600]'
              : 'bg-[#030911]/90 text-[#8CFFFF] border-[#00E5FF]/40 hover:border-[#00E5FF]'
          }`}
        >
          CARTELAS
        </button>
      </div>

      {/* 5. Detail Quick Adjuster Flyout */}
      <div className="mt-1.5 p-2 bg-[#02070E]/90 border border-[#00E5FF]/30 backdrop-blur-md rounded max-w-xs text-[10px] font-mono-tech">
        <div className="flex justify-between items-center text-[#8A949D] mb-1">
          <span className="text-[#FFD600] font-orbitron font-bold">DETALLE COL-BASE 01</span>
          <span className="text-[#00E5FF]">ASTM A36 / A572</span>
        </div>
        <div className="grid grid-cols-2 gap-1 text-[9px]">
          <div className="text-[#849492]">ESPESOR PL: <strong className="text-white">{basePlateThickMm} mm</strong></div>
          <div className="text-[#849492]">ANCLAS: <strong className="text-white">{anchorCount}x M{anchorDiamMm}</strong></div>
          <div className="text-[#849492]">DISTANCIA e: <strong className="text-white">150 mm</strong></div>
          <div className="text-[#849492]">APLASTAMIENTO: <strong className="text-[#00E5FF]">0.42 OK</strong></div>
        </div>
      </div>
    </div>
  );
};
