import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Layers, ChevronDown, Check, Sparkles } from 'lucide-react';
import { SectionProfile } from '../../../dst/dst.schema';

export interface SatelliteProfile {
  id: string;
  code: string;
  name: string;
  family: string;
  designation: string;
  dimensions: string;
  iconPath: string;
}

export const SATELLITE_PROFILES: SatelliteProfile[] = [
  {
    id: 'C-04',
    code: 'C-04',
    name: 'C-CHANNEL',
    family: 'C',
    designation: 'MONTEN C 8x2 3/4 Cal 12',
    dimensions: '203 × 70 × 2.7 mm',
    iconPath: 'M6 4h12v4H10v8h8v4H6z'
  },
  {
    id: 'C-05',
    code: 'C-05',
    name: 'ANGLE BUILT-UP',
    family: 'L',
    designation: '2L 4x4x3/8" Star',
    dimensions: '102 × 102 × 9.5 mm',
    iconPath: 'M6 4h4v12h10v4H6z'
  },
  {
    id: 'C-06',
    code: 'C-06',
    name: 'BOX BUILT-UP',
    family: 'BOX',
    designation: 'BOX 300x300 PL 1/2"',
    dimensions: '300 × 300 × 12.7 mm',
    iconPath: 'M4 4h16v16H4z M7 7h10v10H7z'
  },
  {
    id: 'C-07',
    code: 'C-07',
    name: 'LATTICED',
    family: 'LATTICE',
    designation: '4L 3x3x1/4 + Celosía',
    dimensions: '350 × 350 mm Mod',
    iconPath: 'M4 4h4v16H4z M16 4h4v16h-4z M8 6l8 6M8 18l8-6'
  },
  {
    id: 'C-08',
    code: 'C-08',
    name: 'COMPOUND',
    family: 'COMPOUND',
    designation: 'IPR 12x40 + 2 Placas 1/2"',
    dimensions: '310 × 200 × 14 mm',
    iconPath: 'M4 4h16v3h-6v10h6v3H4v-3h6V7H4z'
  },
  {
    id: 'C-09',
    code: 'C-09',
    name: 'TAPERED',
    family: 'TAPERED',
    designation: 'COL Acartelada 600/300mm',
    dimensions: 'Var 600→300 × 250 mm',
    iconPath: 'M5 4h14l-3 16H8z'
  }
];

interface RadialSatelliteHubProps {
  currentProfile: SectionProfile;
  efficiencyPercent?: number;
  auditStatus?: string;
  onSelectSatellite: (profile: SatelliteProfile) => void;
}

export const RadialSatelliteHub: React.FC<RadialSatelliteHubProps> = ({
  currentProfile,
  efficiencyPercent = 98,
  auditStatus = 'VALIDATED',
  onSelectSatellite
}) => {
  const [isOpen, setIsOpen] = useState(true);
  const [hoveredProfile, setHoveredProfile] = useState<SatelliteProfile | null>(null);

  const isFailed = auditStatus === 'FAILED';
  const isReview = auditStatus === 'REVIEW_REQUIRED';
  const strokeColor = isFailed ? '#FF3B30' : isReview ? '#FFD600' : '#00E5FF';

  return (
    <div className="relative select-none pointer-events-auto">
      {/* 1. Main Central Specimen Dial / 98% Gauge */}
      <div className="relative flex items-center gap-3">
        {/* Glowing Specimen Dial */}
        <div className="relative w-20 h-20 sm:w-24 sm:h-24 flex items-center justify-center">
          {/* Radial 98% Gauge Progress Arc */}
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100">
            {/* Background Track */}
            <circle
              cx="50"
              cy="50"
              r="44"
              fill="none"
              stroke="rgba(0, 229, 255, 0.15)"
              strokeWidth="2.5"
            />
            {/* Active Gauge Arc */}
            <circle
              cx="50"
              cy="50"
              r="44"
              fill="none"
              stroke={strokeColor}
              strokeWidth="3"
              strokeDasharray="276"
              strokeDashoffset={Math.max(0, 276 - (276 * Math.min(100, efficiencyPercent)) / 100)}
              strokeLinecap="round"
              filter={`drop-shadow(0 0 6px ${strokeColor})`}
              transform="rotate(-90 50 50)"
            />
            <circle
              cx="50"
              cy="50"
              r="38"
              fill="none"
              stroke="rgba(0, 229, 255, 0.3)"
              strokeWidth="1"
              strokeDasharray="2 4"
            />
          </svg>

          {/* Inner Specimen 3D Glyph */}
          <div
            onClick={() => setIsOpen(!isOpen)}
            className={`w-16 h-16 rounded-full bg-[#02060C]/90 border backdrop-blur-md flex flex-col items-center justify-center cursor-pointer transition-colors group ${
              isFailed
                ? 'border-[#FF3B30] shadow-[0_0_15px_rgba(255,59,48,0.5)]'
                : 'border-[#00E5FF]/50 hover:border-[#FFD600] shadow-[0_0_15px_rgba(0,229,255,0.2)]'
            }`}
          >
            <span
              className={`text-[12px] font-orbitron font-bold tracking-wider leading-none ${
                isFailed ? 'text-[#FF3B30]' : 'text-[#FFD600]'
              }`}
            >
              {isFailed ? 'FAIL' : `${efficiencyPercent.toFixed(0)}%`}
            </span>
            <span className="text-[7px] font-mono-tech text-[#8CFFFF] mt-0.5 tracking-tighter uppercase">
              {isFailed ? 'AISC OVERLOAD' : 'EFFICIENCY'}
            </span>
            <div className="w-6 h-6 mt-0.5 text-[#00E5FF] group-hover:scale-110 transition-transform">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <rect x="6" y="4" width="12" height="16" rx="1" />
                <line x1="6" y1="12" x2="18" y2="12" strokeDasharray="2 2" />
              </svg>
            </div>
          </div>
        </div>

        {/* Branding & Status Info */}
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <span className="px-1.5 py-0.5 bg-[#00E5FF]/10 border border-[#00E5FF]/40 text-[#00E5FF] font-orbitron text-[9px] font-bold tracking-wider">
              DESIGN
            </span>
            <span className="text-[#8A949D] font-orbitron text-[9px]">|</span>
            <span className="text-white font-orbitron text-[9px] font-bold">STUDIO</span>
          </div>
          <div className="text-[10px] font-mono-tech text-[#8CFFFF] mt-1 font-bold">
            {currentProfile.designation || 'HSS 8x4x1/4"'}
          </div>
          <div className="text-[8px] font-mono-tech text-[#5E6872]">
            FAMILIA: <strong className="text-white">{currentProfile.family}</strong>
          </div>
        </div>
      </div>

      {/* 2. Floating Satellite Satellite Nodes (Radiating or Stacked) */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-1.5 max-w-[290px]"
          >
            {SATELLITE_PROFILES.map((sat) => {
              const isSelected = currentProfile.family === sat.family;
              return (
                <button
                  key={sat.id}
                  type="button"
                  onClick={() => onSelectSatellite(sat)}
                  onMouseEnter={() => setHoveredProfile(sat)}
                  onMouseLeave={() => setHoveredProfile(null)}
                  className={`p-1.5 rounded-sm border transition-all text-left flex items-center gap-2 group relative overflow-hidden ${
                    isSelected
                      ? 'bg-[#00E5FF]/15 border-[#00E5FF] text-white shadow-[0_0_10px_rgba(0,229,255,0.3)]'
                      : 'bg-[#03080E]/80 border-[#0D1C2A] text-[#8A949D] hover:border-[#00E5FF]/50 hover:text-white'
                  }`}
                >
                  <div className={`w-5 h-5 flex-shrink-0 flex items-center justify-center ${
                    isSelected ? 'text-[#FFD600]' : 'text-[#8CFFFF] group-hover:text-[#00E5FF]'
                  }`}>
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                      <path d={sat.iconPath} />
                    </svg>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-[8px] font-orbitron font-bold text-[#FFD600]">{sat.code}</span>
                      {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-[#00E5FF] animate-pulse" />}
                    </div>
                    <div className="text-[8px] font-orbitron font-bold truncate leading-tight mt-0.5">
                      {sat.name}
                    </div>
                  </div>
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Tooltip info on hover */}
      {hoveredProfile && (
        <div className="absolute top-28 left-0 w-56 bg-[#02050A]/95 border border-[#00E5FF] p-2 rounded z-40 text-[9px] font-mono-tech shadow-xl">
          <div className="text-[#FFD600] font-orbitron font-bold">{hoveredProfile.name}</div>
          <div className="text-white font-bold">{hoveredProfile.designation}</div>
          <div className="text-[#849492] mt-0.5">DIM: {hoveredProfile.dimensions}</div>
        </div>
      )}
    </div>
  );
};
