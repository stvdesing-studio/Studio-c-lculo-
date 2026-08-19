import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Layers, ChevronRight, Check, Sliders, ShieldCheck, Box, Activity } from 'lucide-react';
import { SectionProfile } from '../../../dst/dst.schema';

export interface ColumnEngineProfile {
  id: string;
  code: string;
  name: string;
  family: string;
  designation: string;
  dimensions: string;
  weightKgM: number;
  depthM: number;
  widthM: number;
  thicknessM: number;
  iconType: 'hss' | 'ipr' | 'pipe' | 'latticed' | 'compound';
}

export const COLUMN_ENGINE_PROFILES: ColumnEngineProfile[] = [
  {
    id: 'C-01',
    code: 'C-01',
    name: 'HSS / PTR',
    family: 'HSS',
    designation: 'HSS 200×200×6.3 (8x8x1/4")',
    dimensions: '200 × 200 × 6.35 mm',
    weightKgM: 37.8,
    depthM: 0.20,
    widthM: 0.20,
    thicknessM: 0.00635,
    iconType: 'hss'
  },
  {
    id: 'C-02',
    code: 'C-02',
    name: 'IPR / W SECTION',
    family: 'IPR',
    designation: 'W 10x33 (IPR 254×49.1)',
    dimensions: '247 × 202 × 11 mm',
    weightKgM: 49.1,
    depthM: 0.247,
    widthM: 0.202,
    thicknessM: 0.011,
    iconType: 'ipr'
  },
  {
    id: 'C-03',
    code: 'C-03',
    name: 'PIPE / OC CHS',
    family: 'PIPE',
    designation: 'PIPE Ø8" SCH 40',
    dimensions: 'Ø219.1 × 8.18 mm',
    weightKgM: 42.5,
    depthM: 0.219,
    widthM: 0.219,
    thicknessM: 0.00818,
    iconType: 'pipe'
  },
  {
    id: 'C-07',
    code: 'C-07',
    name: 'LATTICED COLUMN',
    family: 'LATTICE',
    designation: '4L 3x3x1/4" + Batten Pl.',
    dimensions: '350 × 350 mm Boxed',
    weightKgM: 58.2,
    depthM: 0.35,
    widthM: 0.35,
    thicknessM: 0.00635,
    iconType: 'latticed'
  },
  {
    id: 'C-08',
    code: 'C-08',
    name: 'COMPOUND / BUILT-UP',
    family: 'COMPOUND',
    designation: 'IPR 12x40 + 2PL 1/2"',
    dimensions: '310 × 200 × 14 mm',
    weightKgM: 74.6,
    depthM: 0.31,
    widthM: 0.20,
    thicknessM: 0.014,
    iconType: 'compound'
  }
];

interface ColumnEngineModuleProps {
  currentProfile: SectionProfile;
  onSelectProfile: (profile: SectionProfile) => void;
  basePlateWidthMm?: number;
  basePlateThickMm?: number;
  anchorCount?: number;
  onUpdateParams?: (updates: {
    basePlateThickMm?: number;
    anchorCount?: number;
    basePlateWidthMm?: number;
  }) => void;
}

export const ColumnEngineModule: React.FC<ColumnEngineModuleProps> = ({
  currentProfile,
  onSelectProfile,
  basePlateWidthMm = 400,
  basePlateThickMm = 25,
  anchorCount = 6,
  onUpdateParams
}) => {
  const [activeStep, setActiveStep] = useState<number>(0);
  const [isEditingBasePlate, setIsEditingBasePlate] = useState(false);

  const selectedColProfile =
    COLUMN_ENGINE_PROFILES.find((p) => p.family === currentProfile.family) ||
    COLUMN_ENGINE_PROFILES[0];

  const handleChooseProfile = (item: ColumnEngineProfile) => {
    onSelectProfile({
      family: item.family as any,
      designation: item.designation,
      depth: { value: item.depthM, unit: 'm' },
      width: { value: item.widthM, unit: 'm' },
      thickness: { value: item.thicknessM, unit: 'm' },
      weightKgM: item.weightKgM
    });
  };

  const steps = [
    { label: 'PROFILE / MATERIAL', code: '01' },
    { label: 'CONNECTIONS', code: '02' },
    { label: 'GENERATE', code: '03' },
    { label: 'VALIDATE', code: '04' }
  ];

  return (
    <div className="relative select-none pointer-events-auto max-w-[320px] w-full flex flex-col space-y-2.5">
      {/* 1. Module Header Banner with Top Floating Satellite Bubbles */}
      <div className="flex items-center justify-between px-1 mb-1">
        {[
          { code: 'C-01', name: 'HSS/PTR', family: 'HSS' },
          { code: 'C-03', name: 'PIPE', family: 'PIPE' },
          { code: 'C-08', name: 'COMPOUND', family: 'COMPOUND' },
          { code: 'C-07', name: 'LATTICED', family: 'LATTICE' }
        ].map((item) => {
          const isSelected = currentProfile.family === item.family;
          return (
            <button
              key={item.code}
              type="button"
              onClick={() => {
                const target = COLUMN_ENGINE_PROFILES.find((p) => p.family === item.family);
                if (target) handleChooseProfile(target);
              }}
              className={`w-8 h-8 rounded-full border flex flex-col items-center justify-center transition-all ${
                isSelected
                  ? 'border-[#FFD600] bg-[#FFD600]/20 text-[#FFD600] shadow-[0_0_10px_#FFD600]'
                  : 'border-[#00E5FF]/40 bg-[#02050A]/90 text-[#8CFFFF] hover:border-[#00E5FF]'
              }`}
              title={`${item.code} ${item.name}`}
            >
              <span className="text-[7px] font-orbitron font-bold leading-none">{item.code}</span>
            </button>
          );
        })}
      </div>

      {/* Main Module Header Banner */}
      <div className="bg-[#03080E]/95 border border-[#00E5FF]/40 backdrop-blur-xl p-2.5 rounded-sm shadow-[0_0_20px_rgba(0,0,0,0.8)]">
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 bg-[#FFD600] text-black font-orbitron font-bold text-xs tracking-wider">
            01
          </span>
          <div>
            <div className="text-[8px] font-orbitron text-[#FFD600] tracking-widest uppercase">
              MODULE
            </div>
            <div className="font-orbitron text-xs font-bold text-[#F2F7F7] tracking-wider">
              COLUMN ENGINE & FABRICATION
            </div>
          </div>
        </div>
      </div>

      {/* 2. Column Profile Family Grid Selector */}
      <div className="bg-[#03080E]/90 border border-[#00E5FF]/30 backdrop-blur-xl p-2.5 rounded-sm space-y-1.5 shadow-lg">
        <div className="flex justify-between items-center text-[9px] font-orbitron text-[#8A949D] border-b border-[#0D1C2A] pb-1">
          <span className="text-[#00E5FF]">SECCIÓN ESTRUCTURAL</span>
          <span>AISC 360-22</span>
        </div>

        <div className="grid grid-cols-2 gap-1.5 pt-1">
          {COLUMN_ENGINE_PROFILES.map((p) => {
            const isSelected = selectedColProfile.id === p.id;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => handleChooseProfile(p)}
                className={`p-2 rounded-sm border transition-all text-left flex flex-col justify-between group ${
                  isSelected
                    ? 'bg-[#00E5FF]/15 border-[#00E5FF] text-white shadow-[0_0_12px_rgba(0,229,255,0.3)]'
                    : 'bg-[#050C16] border-[#0D1C2A] text-[#8A949D] hover:border-[#00E5FF]/40 hover:text-white'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-orbitron text-[9px] font-bold text-[#FFD600]">{p.code}</span>
                  <div className={`w-5 h-5 flex items-center justify-center ${
                    isSelected ? 'text-[#00E5FF]' : 'text-[#5E6872] group-hover:text-[#8CFFFF]'
                  }`}>
                    {renderProfileWireframe(p.iconType)}
                  </div>
                </div>
                <div className="font-orbitron text-[10px] font-bold mt-1 truncate">
                  {p.name}
                </div>
                <div className="text-[8px] font-mono-tech text-[#8A949D] truncate mt-0.5">
                  {p.weightKgM} kg/m
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Workflow Step Pipeline */}
      <div className="bg-[#03080E]/90 border border-[#00E5FF]/30 backdrop-blur-xl p-2 rounded-sm flex items-center justify-between text-[8px] font-orbitron">
        {steps.map((st, idx) => {
          const isActive = activeStep === idx;
          const isDone = activeStep > idx;
          return (
            <React.Fragment key={st.code}>
              <button
                type="button"
                onClick={() => setActiveStep(idx)}
                className={`flex flex-col items-center gap-0.5 transition-colors ${
                  isActive ? 'text-[#FFD600] font-bold' : isDone ? 'text-[#00E5FF]' : 'text-[#5E6872]'
                }`}
              >
                <div className={`w-4 h-4 rounded-full border flex items-center justify-center text-[7px] ${
                  isActive
                    ? 'border-[#FFD600] bg-[#FFD600]/20 text-[#FFD600] shadow-[0_0_8px_#FFD600]'
                    : isDone
                    ? 'border-[#00E5FF] bg-[#00E5FF] text-black font-bold'
                    : 'border-[#0D1C2A] text-[#5E6872]'
                }`}>
                  {isDone ? '✓' : st.code}
                </div>
                <span className="text-[7px] tracking-tighter truncate max-w-[50px]">{st.label.split('/')[0]}</span>
              </button>
              {idx < steps.length - 1 && (
                <div className="w-3 h-[1px] bg-[#0D1C2A]" />
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* 4. Live Connection Circular Telemetry Badges (Matching reference image) */}
      <div className="grid grid-cols-4 gap-1">
        {/* Badge 1: BASE PLATE */}
        <button
          type="button"
          onClick={() => setIsEditingBasePlate(!isEditingBasePlate)}
          className="p-1 rounded-full border border-[#00E5FF]/50 bg-[#02050A]/90 hover:border-[#FFD600] flex flex-col items-center justify-center text-center group transition-all"
        >
          <span className="text-[6px] font-orbitron text-[#8A949D] uppercase tracking-tighter">
            BASE PLATE:
          </span>
          <span className="text-[7px] font-orbitron font-bold text-[#FFD600] leading-none mt-0.5">
            {basePlateWidthMm}x{basePlateThickMm}
          </span>
        </button>

        {/* Badge 2: ANCHORS */}
        <div className="p-1 rounded-full border border-[#00E5FF]/50 bg-[#02050A]/90 flex flex-col items-center justify-center text-center">
          <span className="text-[6px] font-orbitron text-[#8A949D] uppercase tracking-tighter">
            ANCHORS:
          </span>
          <span className="text-[7px] font-orbitron font-bold text-[#00E5FF] leading-none mt-0.5">
            {anchorCount}x M24
          </span>
        </div>

        {/* Badge 3: SPACING */}
        <div className="p-1 rounded-full border border-[#00E5FF]/50 bg-[#02050A]/90 flex flex-col items-center justify-center text-center">
          <span className="text-[6px] font-orbitron text-[#8A949D] uppercase tracking-tighter">
            SPACING:
          </span>
          <span className="text-[7px] font-orbitron font-bold text-white leading-none mt-0.5">
            150mm
          </span>
        </div>

        {/* Badge 4: REFERENCE */}
        <div className="p-1 rounded-full border border-[#00E5FF]/50 bg-[#02050A]/90 flex flex-col items-center justify-center text-center">
          <span className="text-[6px] font-orbitron text-[#8A949D] uppercase tracking-tighter">
            REFERENCE:
          </span>
          <span className="text-[7px] font-orbitron font-bold text-[#00E5FF] leading-none mt-0.5">
            ACI 318
          </span>
        </div>
      </div>

      {/* 5. Bottom Row Circular Profile Icons (C-01, C-02, C-03, C-07) */}
      <div className="flex items-center justify-between pt-1 border-t border-[#0D1C2A]">
        {[
          { code: 'C-01', label: 'HSS/PTR', family: 'HSS' },
          { code: 'C-02', label: 'IPR/W', family: 'IPR' },
          { code: 'C-03', label: 'PIPE', family: 'PIPE' },
          { code: 'C-07', label: 'LATTICED', family: 'LATTICE' }
        ].map((item) => {
          const isSelected = currentProfile.family === item.family;
          return (
            <button
              key={item.code}
              type="button"
              onClick={() => {
                const target = COLUMN_ENGINE_PROFILES.find((p) => p.family === item.family);
                if (target) handleChooseProfile(target);
              }}
              className={`flex flex-col items-center gap-0.5 group transition-all`}
            >
              <div className={`w-8 h-8 rounded-full border flex items-center justify-center transition-all ${
                isSelected
                  ? 'border-[#FFD600] bg-[#FFD600]/20 text-[#FFD600] shadow-[0_0_10px_#FFD600]'
                  : 'border-[#00E5FF]/40 bg-[#03080E] text-[#8CFFFF] hover:border-[#00E5FF]'
              }`}>
                <span className="text-[8px] font-orbitron font-bold">{item.code.split('-')[1]}</span>
              </div>
              <span className="text-[6px] font-orbitron text-[#8A949D] group-hover:text-white">
                {item.code}
              </span>
              <span className="text-[6px] font-orbitron text-[#5E6872] leading-none">
                {item.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* 6. Base Plate Quick Slider Edit Drawer */}
      <AnimatePresence>
        {isEditingBasePlate && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="p-2.5 bg-[#02050A] border border-[#FFD600] rounded-sm space-y-2 text-[9px] font-mono-tech"
          >
            <div className="flex justify-between items-center text-[#FFD600] font-orbitron font-bold">
              <span>AJUSTE PLACA BASE</span>
              <button
                type="button"
                onClick={() => setIsEditingBasePlate(false)}
                className="text-[#5E6872] hover:text-white"
              >
                ✕
              </button>
            </div>
            <div>
              <div className="flex justify-between text-[#8A949D]">
                <span>Espesor Placa:</span>
                <span className="text-white font-bold">{basePlateThickMm} mm</span>
              </div>
              <input
                type="range"
                min={12}
                max={38}
                step={3}
                value={basePlateThickMm}
                onChange={(e) => onUpdateParams?.({ basePlateThickMm: parseInt(e.target.value) })}
                className="w-full h-1 bg-[#06121C] accent-[#FFD600]"
              />
            </div>
            <div>
              <div className="flex justify-between text-[#8A949D]">
                <span>Cantidad Anclas:</span>
                <span className="text-white font-bold">{anchorCount} pernos</span>
              </div>
              <input
                type="range"
                min={4}
                max={8}
                step={2}
                value={anchorCount}
                onChange={(e) => onUpdateParams?.({ anchorCount: parseInt(e.target.value) })}
                className="w-full h-1 bg-[#06121C] accent-[#00E5FF]"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// SVG wireframe helper for profiles
function renderProfileWireframe(type: ColumnEngineProfile['iconType']) {
  switch (type) {
    case 'hss':
      return (
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <rect x="4" y="4" width="16" height="16" rx="1.5" />
          <rect x="8" y="8" width="8" height="8" rx="0.5" strokeDasharray="1 1" />
        </svg>
      );
    case 'ipr':
      return (
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M4 4h16v3h-6v10h6v3H4v-3h6V7H4z" />
        </svg>
      );
    case 'pipe':
      return (
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <circle cx="12" cy="12" r="8" />
          <circle cx="12" cy="12" r="5" strokeDasharray="1 1" />
        </svg>
      );
    case 'latticed':
      return (
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <rect x="4" y="4" width="16" height="16" />
          <line x1="4" y1="4" x2="20" y2="20" />
          <line x1="20" y1="4" x2="4" y2="20" />
        </svg>
      );
    case 'compound':
    default:
      return (
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <rect x="3" y="3" width="18" height="18" />
          <circle cx="12" cy="12" r="4" />
        </svg>
      );
  }
}
