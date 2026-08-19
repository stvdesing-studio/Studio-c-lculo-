import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Activity, TrendingUp, HelpCircle, Eye } from 'lucide-react';

interface HolographicBucklingCardProps {
  columnMark?: string;
  designation?: string;
  lengthM?: number;
  factoredAxialKN?: number;
  criticalBucklingKN?: number;
  slendernessRatio?: number;
}

export const HolographicBucklingCard: React.FC<HolographicBucklingCardProps> = ({
  columnMark = 'C-01',
  designation = 'HSS 200×200×6.3',
  lengthM = 6.0,
  factoredAxialKN = 463,
  criticalBucklingKN = 4526,
  slendernessRatio = 42.8
}) => {
  const [activeAxis, setActiveAxis] = useState<'XY' | 'ZZ'>('XY');
  const [hoveredPoint, setHoveredPoint] = useState<{ x: number; y: number; val: string } | null>(null);

  // Generate parametric SVG curve points
  // Euler Buckling Curve: P_cr = (pi^2 * E * I) / (K * L)^2
  const points = [
    { l: 2.0, p: 4526, label: '4526kN @ 2.0m' },
    { l: 4.0, p: 2150, label: '2150kN @ 4.0m' },
    { l: 6.0, p: 1240, label: '1240kN @ 6.0m' },
    { l: 8.0, p: 780, label: '780kN @ 8.0m' },
    { l: 11.48, p: 463, label: '463kN @ 11.48m' },
    { l: 14.0, p: 310, label: '310kN @ 14.0m' }
  ];

  // Map to SVG coordinates: 0..220 width, 0..120 height
  const maxP = 5000;
  const maxL = 16;
  const svgPoints = points.map((pt) => ({
    x: 25 + (pt.l / maxL) * 180,
    y: 110 - (pt.p / maxP) * 90,
    pt
  }));

  const pathD = svgPoints.reduce((acc, curr, idx) => {
    return idx === 0 ? `M ${curr.x} ${curr.y}` : `${acc} L ${curr.x} ${curr.y}`;
  }, '');

  // Secondary curve (b Buckling Curve)
  const pathD2 = svgPoints.reduce((acc, curr, idx) => {
    const y2 = curr.y + 12;
    return idx === 0 ? `M ${curr.x} ${y2}` : `${acc} L ${curr.x} ${y2}`;
  }, '');

  return (
    <div className="relative select-none pointer-events-auto max-w-[280px]">
      {/* Holographic Leader Line Indicator */}
      <div className="hidden sm:block absolute -right-6 top-8 w-6 h-[1px] bg-gradient-to-r from-[#00E5FF] to-transparent" />

      {/* Main Floating Glass HUD Card */}
      <div className="p-3 bg-[#03070E]/85 border border-[#00E5FF]/40 rounded-sm backdrop-blur-xl shadow-[0_0_25px_rgba(0,229,255,0.15)] relative overflow-hidden">
        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-[#0D1C2A] pb-1.5 mb-2">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#FFD600] animate-ping" />
            <span className="font-orbitron text-xs font-bold text-[#F2F7F7] tracking-wider">
              Buckling Curve
            </span>
          </div>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setActiveAxis('XY')}
              className={`px-1.5 py-0.5 text-[8px] font-orbitron font-bold border ${
                activeAxis === 'XY' ? 'bg-[#00E5FF] text-black border-[#00E5FF]' : 'bg-[#050C16] text-[#8CFFFF] border-[#0D1C2A]'
              }`}
            >
              XY
            </button>
            <button
              type="button"
              onClick={() => setActiveAxis('ZZ')}
              className={`px-1.5 py-0.5 text-[8px] font-orbitron font-bold border ${
                activeAxis === 'ZZ' ? 'bg-[#00E5FF] text-black border-[#00E5FF]' : 'bg-[#050C16] text-[#8CFFFF] border-[#0D1C2A]'
              }`}
            >
              ZZ
            </button>
          </div>
        </div>

        {/* Member Telemetry Callout */}
        <div className="flex justify-between items-baseline text-[9px] font-mono-tech text-[#8A949D] mb-1">
          <span className="text-[#00E5FF] font-bold">{columnMark} • {designation}</span>
          <span>λ = <strong className="text-[#FFD600]">{slendernessRatio}</strong></span>
        </div>

        {/* Interactive SVG Buckling Plot */}
        <div className="relative w-full h-32 bg-[#02050A] border border-[#0D1C2A] rounded p-1">
          <svg className="w-full h-full" viewBox="0 0 220 120" fill="none">
            {/* Grid Lines */}
            <line x1="25" y1="20" x2="210" y2="20" stroke="rgba(0,229,255,0.08)" strokeDasharray="2 4" />
            <line x1="25" y1="50" x2="210" y2="50" stroke="rgba(0,229,255,0.08)" strokeDasharray="2 4" />
            <line x1="25" y1="80" x2="210" y2="80" stroke="rgba(0,229,255,0.08)" strokeDasharray="2 4" />
            <line x1="25" y1="110" x2="210" y2="110" stroke="rgba(0,229,255,0.2)" />
            <line x1="25" y1="10" x2="25" y2="110" stroke="rgba(0,229,255,0.2)" />

            {/* Axes Labels */}
            <text x="5" y="20" fill="#849492" fontSize="7" fontFamily="monospace">kN</text>
            <text x="200" y="118" fill="#849492" fontSize="7" fontFamily="monospace">m</text>

            {/* Inelastic/Elastic Curves */}
            <path d={pathD} stroke="#00E5FF" strokeWidth="2" fill="none" />
            <path d={pathD2} stroke="#FFD600" strokeWidth="1.5" strokeDasharray="3 3" fill="none" />

            {/* Critical Data Points */}
            {/* Point 1: 4526kN */}
            <circle cx={svgPoints[0].x} cy={svgPoints[0].y} r="3" fill="#FFD600" />
            <text x={svgPoints[0].x + 4} y={svgPoints[0].y - 2} fill="#FFD600" fontSize="8" fontFamily="Orbitron" fontWeight="bold">
              4526kN
            </text>

            {/* Point 2: Design Demand 463kN */}
            <circle cx={svgPoints[4].x} cy={svgPoints[4].y} r="3.5" fill="#00E5FF" stroke="#F2F7F7" strokeWidth="1" />
            <text x={svgPoints[4].x - 30} y={svgPoints[4].y - 6} fill="#00E5FF" fontSize="8" fontFamily="Orbitron" fontWeight="bold">
              463kN
            </text>
            <text x={svgPoints[4].x - 20} y={svgPoints[4].y + 10} fill="#8A949D" fontSize="7" fontFamily="monospace">
              11.48m
            </text>

            {/* Origin & max markers */}
            <text x="26" y="118" fill="#5E6872" fontSize="6" fontFamily="monospace">0</text>
            <text x="180" y="118" fill="#5E6872" fontSize="6" fontFamily="monospace">7u6m</text>
          </svg>

          {/* Holographic Tooltip on hover */}
          {hoveredPoint && (
            <div className="absolute top-2 right-2 bg-[#00E5FF] text-black text-[8px] font-orbitron font-bold px-1.5 py-0.5 rounded shadow">
              {hoveredPoint.val}
            </div>
          )}
        </div>

        {/* Footer Ratios */}
        <div className="mt-2 grid grid-cols-2 gap-1 text-[8px] font-mono-tech border-t border-[#0D1C2A] pt-1 text-[#8A949D]">
          <div>SOLICITACIÓN Pu: <span className="text-[#00E5FF] font-bold">{factoredAxialKN} kN</span></div>
          <div className="text-right">CAPACIDAD φPn: <span className="text-[#FFD600] font-bold">1,840 kN</span></div>
          <div>RATIO PANDEO: <span className="text-[#00E5FF] font-bold">25.1% OK</span></div>
          <div className="text-right">NORMA: <span className="text-white">AISC 360-22</span></div>
        </div>
      </div>
    </div>
  );
};
