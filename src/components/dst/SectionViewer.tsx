// ============================================================
// STV CLOSER — PARAMETRIC 2D CROSS SECTION VIEWER
// SectionViewer.tsx
// Renders vector SVG cross-sections computed from SectionProfile
// ============================================================

import React from 'react';
import { SectionProfile } from '../../dst/dst.schema';

interface SectionViewerProps {
  section: SectionProfile;
  className?: string;
  width?: number;
  height?: number;
}

export const SectionViewer: React.FC<SectionViewerProps> = ({
  section,
  className = '',
  width = 240,
  height = 180
}) => {
  const family = section.family;
  const des = section.designation.toUpperCase();

  // Parsing rough dimensions in mm
  let b = 200; // width mm
  let d = 200; // depth mm
  let t = 6.35; // thickness mm
  let tw = 6.35; // web thickness
  let tf = 9.50; // flange thickness

  if (family === 'HSS' || family === 'PTR') {
    if (des.includes('8X4') || des.includes('200X100')) {
      b = 100;
      d = 200;
      t = 6.35;
    } else if (des.includes('6X4')) {
      b = 100;
      d = 150;
      t = 6.35;
    } else if (des.includes('4X4') || des.includes('100X100')) {
      b = 100;
      d = 100;
      t = 4.76;
    } else if (des.includes('2X2') || des.includes('50X50')) {
      b = 50;
      d = 50;
      t = 3.18;
    }
  } else if (family === 'IPR' || family === 'W') {
    b = 150;
    d = 250;
    tw = 6.0;
    tf = 9.0;
  } else if (family === 'C') {
    b = 75;
    d = 150;
    t = 2.5; // Cal. 14
  } else if (family === 'PIPE') {
    d = 168; // 6" pipe
    b = 168;
    t = 7.11;
  }

  const cx = width / 2;
  const cy = height / 2;
  const scale = Math.min((width - 60) / Math.max(b, 100), (height - 60) / Math.max(d, 100)) * 0.85;

  const renderSectionShape = () => {
    const sw = b * scale;
    const sh = d * scale;
    const st = Math.max(2, t * scale);
    const stw = Math.max(2, tw * scale);
    const stf = Math.max(3, tf * scale);

    if (family === 'HSS' || family === 'PTR') {
      return (
        <g>
          {/* Outer Box */}
          <rect
            x={cx - sw / 2}
            y={cy - sh / 2}
            width={sw}
            height={sh}
            rx={st * 0.8}
            fill="#0A1622"
            stroke="#00E5FF"
            strokeWidth={1.8}
          />
          {/* Inner Void */}
          <rect
            x={cx - (sw / 2 - st)}
            y={cy - (sh / 2 - st)}
            width={sw - st * 2}
            height={sh - st * 2}
            rx={st * 0.4}
            fill="#020508"
            stroke="#00A8FF"
            strokeWidth={1}
            strokeDasharray="2 2"
          />
          {/* Centerlines */}
          <line x1={cx} y1={cy - sh / 2 - 12} x2={cx} y2={cy + sh / 2 + 12} stroke="#00E5FF" strokeWidth={0.5} strokeDasharray="3 3" opacity={0.6} />
          <line x1={cx - sw / 2 - 12} y1={cy} x2={cx + sw / 2 + 12} y2={cy} stroke="#00E5FF" strokeWidth={0.5} strokeDasharray="3 3" opacity={0.6} />
        </g>
      );
    }

    if (family === 'IPR' || family === 'W') {
      return (
        <g>
          {/* Top Flange */}
          <rect x={cx - sw / 2} y={cy - sh / 2} width={sw} height={stf} fill="#0A1622" stroke="#00E5FF" strokeWidth={1.5} />
          {/* Web */}
          <rect x={cx - stw / 2} y={cy - sh / 2 + stf} width={stw} height={sh - stf * 2} fill="#0A1622" stroke="#00E5FF" strokeWidth={1.5} />
          {/* Bottom Flange */}
          <rect x={cx - sw / 2} y={cy + sh / 2 - stf} width={sw} height={stf} fill="#0A1622" stroke="#00E5FF" strokeWidth={1.5} />
          {/* Centerlines */}
          <line x1={cx} y1={cy - sh / 2 - 12} x2={cx} y2={cy + sh / 2 + 12} stroke="#00E5FF" strokeWidth={0.5} strokeDasharray="3 3" opacity={0.6} />
          <line x1={cx - sw / 2 - 12} y1={cy} x2={cx + sw / 2 + 12} y2={cy} stroke="#00E5FF" strokeWidth={0.5} strokeDasharray="3 3" opacity={0.6} />
        </g>
      );
    }

    if (family === 'C') {
      return (
        <g>
          {/* C-Channel / Monten */}
          <path
            d={`
              M ${cx + sw / 2 - 8} ${cy - sh / 2 + 10}
              L ${cx + sw / 2} ${cy - sh / 2}
              L ${cx - sw / 2} ${cy - sh / 2}
              L ${cx - sw / 2} ${cy + sh / 2}
              L ${cx + sw / 2} ${cy + sh / 2}
              L ${cx + sw / 2 - 8} ${cy + sh / 2 - 10}
            `}
            fill="none"
            stroke="#00E5FF"
            strokeWidth={st}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>
      );
    }

    if (family === 'PIPE') {
      return (
        <g>
          <circle cx={cx} cy={cy} r={sw / 2} fill="#0A1622" stroke="#00E5FF" strokeWidth={1.8} />
          <circle cx={cx} cy={cy} r={sw / 2 - st} fill="#020508" stroke="#00A8FF" strokeWidth={1} strokeDasharray="2 2" />
        </g>
      );
    }

    // Default Fallback
    return (
      <rect x={cx - sw / 2} y={cy - sh / 2} width={sw} height={sh} fill="#0A1622" stroke="#00E5FF" strokeWidth={1.5} />
    );
  };

  return (
    <div className={`flex flex-col items-center bg-[#050B10] border border-[#0D2433] p-2.5 ${className}`}>
      <div className="w-full flex items-center justify-between text-[10px] text-[#4CC9FF] font-orbitron pb-1.5 border-b border-[#0D2433] mb-2">
        <span className="tracking-widest">PERFIL: {section.family}</span>
        <span className="text-[#8A949D]">{section.designation}</span>
      </div>

      <svg width={width} height={height} className="overflow-visible">
        {/* Background CAD Grid */}
        <defs>
          <pattern id={`sec-grid-${section.designation}`} width="15" height="15" patternUnits="userSpaceOnUse">
            <path d="M 15 0 L 0 0 0 15" fill="none" stroke="#0D2433" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width={width} height={height} fill={`url(#sec-grid-${section.designation})`} opacity={0.4} />

        {/* Render Geometry */}
        {renderSectionShape()}

        {/* Dimension Callouts */}
        {/* Width Dimension Top */}
        <line x1={cx - (b * scale) / 2} y1={cy - (d * scale) / 2 - 16} x2={cx + (b * scale) / 2} y2={cy - (d * scale) / 2 - 16} stroke="#4CC9FF" strokeWidth={1} />
        <line x1={cx - (b * scale) / 2} y1={cy - (d * scale) / 2 - 20} x2={cx - (b * scale) / 2} y2={cy - (d * scale) / 2 - 12} stroke="#4CC9FF" strokeWidth={1} />
        <line x1={cx + (b * scale) / 2} y1={cy - (d * scale) / 2 - 20} x2={cx + (b * scale) / 2} y2={cy - (d * scale) / 2 - 12} stroke="#4CC9FF" strokeWidth={1} />
        <text x={cx} y={cy - (d * scale) / 2 - 22} fill="#00E5FF" fontSize={9} fontFamily="Orbitron, monospace" textAnchor="middle" fontWeight="bold">
          {b} mm
        </text>

        {/* Depth Dimension Right */}
        <line x1={cx + (b * scale) / 2 + 16} y1={cy - (d * scale) / 2} x2={cx + (b * scale) / 2 + 16} y2={cy + (d * scale) / 2} stroke="#4CC9FF" strokeWidth={1} />
        <line x1={cx + (b * scale) / 2 + 12} y1={cy - (d * scale) / 2} x2={cx + (b * scale) / 2 + 20} y2={cy - (d * scale) / 2} stroke="#4CC9FF" strokeWidth={1} />
        <line x1={cx + (b * scale) / 2 + 12} y1={cy + (d * scale) / 2} x2={cx + (b * scale) / 2 + 20} y2={cy + (d * scale) / 2} stroke="#4CC9FF" strokeWidth={1} />
        <text x={cx + (b * scale) / 2 + 24} y={cy + 3} fill="#00E5FF" fontSize={9} fontFamily="Orbitron, monospace" textAnchor="start" fontWeight="bold">
          {d} mm
        </text>

        {/* Thickness indicator */}
        <text x={cx} y={cy + (d * scale) / 2 + 20} fill="#8A949D" fontSize={9} fontFamily="Orbitron, monospace" textAnchor="middle">
          t = {t.toFixed(2)} mm (Cal. {section.gauge ?? 11})
        </text>
      </svg>
    </div>
  );
};
