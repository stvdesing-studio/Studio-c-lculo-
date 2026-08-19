// ============================================================
// STV CLOSER — HOLOGRAPHIC ORBITAL RING & 12-CATEGORY RADIAL HUB
// HolographicOrbitalRing.tsx
// Pure Sci-Fi HUD: Deep Black Void, Dual Counter-Rotating Bioluminescent Dials
// ============================================================

import React, { useState } from 'react';
import {
  Columns,
  Square,
  Anchor,
  Box,
  GitBranch,
  Home,
  Triangle,
  AlignJustify,
  Cpu,
  Layers,
  ShieldAlert,
  Sparkles,
  Lock,
  Unlock,
  Settings
} from 'lucide-react';

export type CategoryHubId =
  | '01_COLUMNS'
  | '02_BASE_PLATES'
  | '03_ANCHOR_BOLTS'
  | '04_BEAMS'
  | '05_BRACING'
  | '06_ROOFS'
  | '07_TRUSSES'
  | '08_PURLINS'
  | '09_CONNECTIONS'
  | '10_FOUNDATIONS'
  | '11_PLATES_GUSSETS'
  | '12_CUSTOM_STRUCTURE';

export interface CategoryHubItem {
  id: CategoryHubId;
  num: string;
  label: string;
  sublabel: string;
  icon: React.ReactNode;
  angleDeg: number;
}

export const CATEGORY_HUBS: CategoryHubItem[] = [
  { id: '01_COLUMNS', num: '01', label: 'COLUMNS', sublabel: 'IPR / HSS / CHS', icon: <Columns size={16} />, angleDeg: 270 },
  { id: '02_BASE_PLATES', num: '02', label: 'BASE PLATES', sublabel: 'PL 1" A36', icon: <Square size={16} />, angleDeg: 300 },
  { id: '03_ANCHOR_BOLTS', num: '03', label: 'ANCHOR BOLTS', sublabel: '4x F1554 Gr.55', icon: <Anchor size={16} />, angleDeg: 330 },
  { id: '04_BEAMS', num: '04', label: 'BEAMS / GIRDERS', sublabel: 'MOMENT DIAGRAMS', icon: <Box size={16} />, angleDeg: 0 },
  { id: '05_BRACING', num: '05', label: 'BRACING', sublabel: 'X / K / CHEVRON', icon: <GitBranch size={16} />, angleDeg: 30 },
  { id: '06_ROOFS', num: '06', label: 'ROOFS', sublabel: 'TECTONIC LAYERS', icon: <Home size={16} />, angleDeg: 60 },
  { id: '07_TRUSSES', num: '07', label: 'TRUSSES', sublabel: 'PRATT / WARREN / FINK', icon: <Triangle size={16} />, angleDeg: 90 },
  { id: '08_PURLINS', num: '08', label: 'PURLINS / GIRTS', sublabel: 'MONTEN C / Z', icon: <AlignJustify size={16} />, angleDeg: 120 },
  { id: '09_CONNECTIONS', num: '09', label: 'CONNECTIONS', sublabel: 'AWS D1.1 WELDED', icon: <Cpu size={16} />, angleDeg: 150 },
  { id: '10_FOUNDATIONS', num: '10', label: 'FOUNDATIONS', sublabel: 'ZAPATA / PEDESTAL', icon: <Layers size={16} />, angleDeg: 180 },
  { id: '11_PLATES_GUSSETS', num: '11', label: 'PLATES / GUSSETS', sublabel: 'PARAMETRIC GUSSET', icon: <ShieldAlert size={16} />, angleDeg: 210 },
  { id: '12_CUSTOM_STRUCTURE', num: '12', label: 'CUSTOM STRUCTURE', sublabel: 'RECURSIVE TWIN', icon: <Sparkles size={16} />, angleDeg: 240 }
];

interface HolographicOrbitalRingProps {
  activeCategory: CategoryHubId;
  onSelectCategory: (cat: CategoryHubId) => void;
  rotationOffsetDeg: number;
}

export const HolographicOrbitalRing: React.FC<HolographicOrbitalRingProps> = ({
  activeCategory,
  onSelectCategory,
  rotationOffsetDeg
}) => {
  return (
    <div className="absolute inset-0 pointer-events-none flex items-center justify-center select-none overflow-hidden">
      {/* 1. OUTER BLACK LACQUER MECHANICAL BEZEL WITH METRIC NOTCHES */}
      <div className="relative w-[700px] h-[700px] rounded-full flex items-center justify-center pointer-events-none">
        
        {/* Outer Shadow & Arc Rails */}
        <div className="absolute inset-0 rounded-full border-[1.5px] border-[#00E5FF]/20 shadow-[0_0_80px_rgba(0,229,255,0.08)_inset]" />

        {/* Counter-Rotating Outer Cyan Bioluminescent Ring */}
        <svg
          className="absolute inset-0 w-full h-full animate-[spin_120s_linear_infinite]"
          viewBox="0 0 700 700"
          fill="none"
        >
          {/* Tick marks around perimeter */}
          {Array.from({ length: 72 }).map((_, i) => {
            const angle = (i * 360) / 72;
            const rad = (angle * Math.PI) / 180;
            const r1 = i % 6 === 0 ? 336 : 342;
            const r2 = 348;
            const x1 = 350 + r1 * Math.cos(rad);
            const y1 = 350 + r1 * Math.sin(rad);
            const x2 = 350 + r2 * Math.cos(rad);
            const y2 = 350 + r2 * Math.sin(rad);
            return (
              <line
                key={i}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke={i % 6 === 0 ? '#00E5FF' : '#00E5FF33'}
                strokeWidth={i % 6 === 0 ? 1.5 : 0.8}
              />
            );
          })}
          {/* Segmented glowing arcs */}
          <circle
            cx="350"
            cy="350"
            r="330"
            stroke="#00E5FF"
            strokeWidth="1.2"
            strokeDasharray="40 180 80 120"
            opacity="0.4"
          />
        </svg>

        {/* Inner Counter-Rotating Golden Ring */}
        <svg
          className="absolute inset-[40px] w-[620px] h-[620px] animate-[spin_90s_linear_infinite_reverse]"
          viewBox="0 0 620 620"
          fill="none"
        >
          <circle
            cx="310"
            cy="310"
            r="290"
            stroke="#FFD700"
            strokeWidth="1.5"
            strokeDasharray="60 90 20 150"
            opacity="0.6"
          />
          <circle
            cx="310"
            cy="310"
            r="265"
            stroke="#00E5FF"
            strokeWidth="0.8"
            strokeDasharray="4 8"
            opacity="0.3"
          />
        </svg>

        {/* Inner Central Hologram Viewing Port Ring */}
        <div className="absolute w-[440px] h-[440px] rounded-full border border-[#00E5FF]/40 bg-radial from-transparent to-black/40 shadow-[0_0_40px_rgba(0,229,255,0.15)] flex items-center justify-center">
          {/* Subtle crosshair grid */}
          <div className="absolute w-full h-[1px] bg-gradient-to-r from-transparent via-[#00E5FF]/25 to-transparent" />
          <div className="absolute h-full w-[1px] bg-gradient-to-b from-transparent via-[#00E5FF]/25 to-transparent" />
          <div className="absolute w-24 h-24 rounded-full border border-dashed border-[#00E5FF]/20 animate-[spin_40s_linear_infinite]" />
        </div>

        {/* 2. 12 RADIAL INTERACTIVE CATEGORY HUBS (POSITIONED PRECISELY IN POLAR ORBITS) */}
        {CATEGORY_HUBS.map((hub) => {
          const isActive = activeCategory === hub.id;
          const rad = ((hub.angleDeg + rotationOffsetDeg) * Math.PI) / 180;
          const radiusPx = 295; // Orbit radius
          const x = 350 + radiusPx * Math.cos(rad) - 50; // Center offset
          const y = 350 + radiusPx * Math.sin(rad) - 30;

          return (
            <button
              key={hub.id}
              type="button"
              onClick={() => onSelectCategory(hub.id)}
              style={{
                left: `${x}px`,
                top: `${y}px`
              }}
              className={`absolute w-[100px] h-[60px] pointer-events-auto rounded-lg backdrop-blur-md transition-all duration-300 flex flex-col items-center justify-center gap-1 group z-20 ${
                isActive
                  ? 'bg-[#02050B]/90 border-2 border-[#FFD700] shadow-[0_0_25px_rgba(255,215,0,0.6)] scale-110'
                  : 'bg-[#03070E]/60 border border-[#00E5FF]/30 hover:border-[#00E5FF] hover:bg-[#06101E]/80 hover:shadow-[0_0_15px_rgba(0,229,255,0.4)]'
              }`}
            >
              {/* Active Indicator Pip */}
              {isActive && (
                <div className="absolute -top-1 w-2 h-2 rounded-full bg-[#FFD700] shadow-[0_0_8px_#FFD700] animate-ping" />
              )}

              {/* Number & Icon */}
              <div className="flex items-center gap-1.5">
                <span
                  className={`text-[9px] font-orbitron font-black ${
                    isActive ? 'text-[#FFD700]' : 'text-[#00E5FF]/70 group-hover:text-[#00E5FF]'
                  }`}
                >
                  {hub.num}
                </span>
                <div
                  className={`${
                    isActive ? 'text-[#FFD700]' : 'text-[#00E5FF] group-hover:text-white'
                  }`}
                >
                  {hub.icon}
                </div>
              </div>

              {/* Label */}
              <div
                className={`text-[8px] font-orbitron font-bold tracking-wider leading-none text-center px-1 truncate w-full ${
                  isActive ? 'text-white' : 'text-[#8A949D] group-hover:text-[#F2F7F7]'
                }`}
              >
                {hub.label}
              </div>

              {/* Thin Connection Vector pointing to center */}
              <div
                className={`absolute w-3 h-[1px] -z-10 transition-colors ${
                  isActive ? 'bg-[#FFD700] shadow-[0_0_6px_#FFD700]' : 'bg-[#00E5FF]/30'
                }`}
                style={{
                  transform: `rotate(${hub.angleDeg + 90}deg)`,
                  transformOrigin: 'center'
                }}
              />
            </button>
          );
        })}
      </div>
    </div>
  );
};
