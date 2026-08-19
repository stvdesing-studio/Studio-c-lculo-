import React, { useState } from 'react';
import { Layers, ChevronDown, Activity, Shield, Sparkles } from 'lucide-react';
import { RadialFoundationDial, FoundationTypeItem } from './RadialFoundationDial';
import { RadialSatelliteHub, SatelliteProfile } from './RadialSatelliteHub';
import { SectionProfile } from '../../../dst/dst.schema';

export type StructuralTypology = 'PERGOLA' | 'INDUSTRIAL PORTAL' | 'CANTILEVER CANOPY' | 'CURVED ARCH';

interface TopSystemBarProps {
  currentTypology: StructuralTypology;
  onSelectTypology: (type: StructuralTypology) => void;
  currentProfile: SectionProfile;
  efficiencyPercent?: number;
  auditStatus?: string;
  onSelectSatellite: (sat: SatelliteProfile) => void;
  selectedFoundationId: string;
  onSelectFoundation: (found: FoundationTypeItem) => void;
}

export const TopSystemBar: React.FC<TopSystemBarProps> = ({
  currentTypology = 'PERGOLA',
  onSelectTypology,
  currentProfile,
  efficiencyPercent = 98,
  auditStatus = 'VALIDATED',
  onSelectSatellite,
  selectedFoundationId,
  onSelectFoundation
}) => {
  const [isTypologyOpen, setIsTypologyOpen] = useState(false);

  const typologies: StructuralTypology[] = [
    'PERGOLA',
    'INDUSTRIAL PORTAL',
    'CANTILEVER CANOPY',
    'CURVED ARCH'
  ];

  return (
    <header className="w-full select-none z-30 pointer-events-none flex items-start justify-between px-3 sm:px-6 pt-3">
      {/* 1. Left: Radial Satellite Hub with 98% Gauge & DESIGN | STUDIO */}
      <div className="pointer-events-auto">
        <RadialSatelliteHub
          currentProfile={currentProfile}
          efficiencyPercent={efficiencyPercent}
          auditStatus={auditStatus}
          onSelectSatellite={onSelectSatellite}
        />
      </div>

      {/* 2. Center: Large Glowing STRUCTURAL SYSTEM / PERGOLA Headline with Slider Track */}
      <div className="pointer-events-auto flex flex-col items-center relative mt-1 flex-1 max-w-xl mx-4">
        {/* Top Slider Track & Status */}
        <div className="w-full flex items-center justify-between text-[9px] font-orbitron tracking-widest text-[#8A949D] mb-1">
          <div className="flex items-center gap-1.5">
            <span className="text-[#FFD600] font-bold">STRUCTURAL SYSTEM</span>
            <span className="text-[7px] text-[#00E5FF] px-1 bg-[#00E5FF]/15 border border-[#00E5FF]/30">TECHNICAL</span>
          </div>

          {/* Glowing Slider Track Line */}
          <div className="flex-1 mx-4 relative h-[2px] bg-[#0D2235]">
            <div className="absolute left-1/3 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-[#00E5FF] shadow-[0_0_10px_#00E5FF]" />
            <div className="h-full bg-gradient-to-r from-transparent via-[#00E5FF] to-transparent w-1/2" />
          </div>
        </div>

        {/* Big Orbitron Typology Name with Clickable Switcher */}
        <div className="relative flex items-center justify-center">
          <button
            type="button"
            onClick={() => setIsTypologyOpen(!isTypologyOpen)}
            className="flex items-center gap-3 text-3xl sm:text-5xl md:text-6xl font-orbitron font-black text-white hover:text-[#00E5FF] tracking-wider transition-colors drop-shadow-[0_0_25px_rgba(0,229,255,0.6)]"
          >
            <span>{currentTypology}</span>
            <ChevronDown className="w-6 h-6 text-[#FFD600] opacity-80" />
          </button>

          {/* Typology Dropdown */}
          {isTypologyOpen && (
            <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 bg-[#030911]/95 border border-[#00E5FF] p-2 rounded shadow-2xl z-50 min-w-[220px] space-y-1">
              {typologies.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => {
                    onSelectTypology(t);
                    setIsTypologyOpen(false);
                  }}
                  className={`w-full text-left px-3 py-1.5 text-xs font-orbitron font-bold rounded transition-colors ${
                    t === currentTypology
                      ? 'bg-[#00E5FF] text-black font-bold'
                      : 'text-[#8A949D] hover:bg-[#050C16] hover:text-white'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 3. Stacked Technical Keywords (NODE, PRECISION, AUTHORITY, STEEL) */}
      <div className="hidden lg:flex flex-col items-start justify-center text-[10px] font-orbitron tracking-widest space-y-1 text-[#8A949D] border-l border-[#0D1C2A] pl-3">
        <span className="hover:text-[#00E5FF] transition-colors cursor-default">NODE</span>
        <span className="hover:text-[#00E5FF] transition-colors cursor-default">PRECISION</span>
        <span className="hover:text-[#00E5FF] transition-colors cursor-default">AUTHORITY</span>
        <span className="text-[#FFD600] font-bold">STEEL</span>
      </div>

      {/* 4. Right: Radial Foundation Multi-Ring HUD Dial */}
      <div className="pointer-events-auto ml-2">
        <RadialFoundationDial
          selectedFoundationId={selectedFoundationId}
          onSelectFoundation={onSelectFoundation}
        />
      </div>
    </header>
  );
};
