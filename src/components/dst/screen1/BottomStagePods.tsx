import React, { useState } from 'react';
import { motion } from 'motion/react';
import { FileText, Download, CheckCircle2, ChevronRight, Sparkles } from 'lucide-react';
import { ColumnCompassWidget } from './ColumnCompassWidget';

export interface StagePodItem {
  id: string;
  code: string;
  name: string;
  sub: string;
  status: 'ACTIVE' | 'READY' | 'LOCKED';
}

export const STAGE_PODS: StagePodItem[] = [
  { id: '01', code: '01', name: 'COLUMN ENGINE & FABRICATION', sub: 'HSS / IPR / BUILT-UP', status: 'ACTIVE' },
  { id: '02', code: '02', name: 'ROOF & TRUSS ENGINE', sub: 'PERGOLA / WARREN', status: 'READY' },
  { id: '03', code: '03', name: 'FOUNDATION & BASE PLATES', sub: 'PEDESTALS & ANCHORS', status: 'READY' },
  { id: '04', code: '04', name: 'AUDIT & STRUCTURAL GRAPH', sub: 'AISC 360-22 CHECK', status: 'READY' }
];

interface BottomStagePodsProps {
  activeStageId: string;
  onSelectStage: (stageId: string) => void;
  onOpenDossier: () => void;
  onExportHub: () => void;
  columnInclinationDeg: number;
  onUpdateInclination: (deg: number) => void;
}

export const BottomStagePods: React.FC<BottomStagePodsProps> = ({
  activeStageId = '01',
  onSelectStage,
  onOpenDossier,
  onExportHub,
  columnInclinationDeg,
  onUpdateInclination
}) => {
  const [hoveredStage, setHoveredStage] = useState<StagePodItem | null>(null);

  return (
    <div className="w-full select-none z-30 pointer-events-none flex items-end justify-between px-3 sm:px-6 pb-3">
      {/* 1. Left Side: EXPORT DOSSIER / MASTER_BLUEPRINT.PDF Launch Badge */}
      <div className="pointer-events-auto flex flex-col items-start gap-1">
        <button
          type="button"
          onClick={onOpenDossier}
          className="px-3.5 py-1.5 bg-[#030911]/90 border border-[#00E5FF]/50 backdrop-blur-xl rounded-sm hover:border-[#FFD600] group flex items-center gap-2.5 transition-all shadow-[0_0_20px_rgba(0,229,255,0.2)] hover:shadow-[0_0_25px_rgba(255,214,0,0.4)]"
        >
          <FileText className="w-4 h-4 text-[#FFD600] group-hover:scale-110 transition-transform" />
          <div className="text-left">
            <div className="text-[9px] font-orbitron font-bold text-[#00E5FF] group-hover:text-[#FFD600] tracking-widest leading-none">
              EXPORT DOSSIER
            </div>
            <div className="text-[7px] font-mono-tech text-[#8A949D] tracking-tighter mt-0.5">
              MASTER_BLUEPRINT.PDF
            </div>
          </div>
        </button>

        {/* Floating Stage Dial Pods Row */}
        <div className="flex items-center gap-2 sm:gap-3 mt-2">
          {STAGE_PODS.map((pod) => {
            const isActive = pod.id === activeStageId;
            return (
              <button
                key={pod.id}
                type="button"
                onClick={() => onSelectStage(pod.id)}
                onMouseEnter={() => setHoveredStage(pod)}
                onMouseLeave={() => setHoveredStage(null)}
                className={`relative w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center transition-all ${
                  isActive
                    ? 'scale-110 shadow-[0_0_20px_rgba(0,229,255,0.4)]'
                    : 'hover:scale-105 opacity-85 hover:opacity-100'
                }`}
              >
                {/* SVG Dial Rings */}
                <svg className="absolute inset-0 w-full h-full" viewBox="0 0 60 60">
                  <circle
                    cx="30"
                    cy="30"
                    r="27"
                    fill="none"
                    stroke={isActive ? '#00E5FF' : 'rgba(0, 229, 255, 0.25)'}
                    strokeWidth={isActive ? '2' : '1'}
                    strokeDasharray={isActive ? '4 3' : '2 4'}
                  />
                  <circle
                    cx="30"
                    cy="30"
                    r="23"
                    fill="#03080E"
                    stroke={isActive ? '#FFD600' : 'rgba(140, 255, 255, 0.3)'}
                    strokeWidth={isActive ? '2.5' : '1'}
                  />
                </svg>

                {/* Inner Number */}
                <span
                  className={`relative text-sm sm:text-base font-orbitron font-bold tracking-wider ${
                    isActive ? 'text-[#FFD600]' : 'text-[#8CFFFF]'
                  }`}
                >
                  {pod.code}
                </span>

                {/* Active Pulse Point */}
                {isActive && (
                  <span className="absolute -top-0.5 right-1 w-2 h-2 rounded-full bg-[#00E5FF] animate-ping" />
                )}
              </button>
            );
          })}

          {/* 5th Export Hub Pod */}
          <button
            type="button"
            onClick={onExportHub}
            className="relative w-16 h-12 sm:w-20 sm:h-14 rounded-full bg-[#02050A]/95 border-2 border-[#00E5FF] hover:border-[#FFD600] flex flex-col items-center justify-center p-1 group shadow-[0_0_20px_rgba(0,229,255,0.3)] transition-all hover:scale-105"
          >
            <span className="text-[7px] sm:text-[8px] font-orbitron font-bold text-[#FFD600] tracking-wider leading-none">
              EXPORT HUB
            </span>
            <span className="text-[6px] sm:text-[7px] font-mono-tech text-[#8CFFFF] group-hover:text-white leading-tight mt-0.5 text-center">
              FABRICATION DATA READY
            </span>
          </button>
        </div>
      </div>

      {/* 2. Center: 3D Column Inclination & Compass Dial Widget */}
      <div className="pointer-events-auto hidden md:flex items-center justify-center">
        <ColumnCompassWidget
          inclinationDeg={columnInclinationDeg}
          onUpdateInclination={onUpdateInclination}
        />
      </div>

      {/* Stage Preview Tooltip on Hover */}
      {hoveredStage && (
        <div className="absolute left-6 bottom-24 bg-[#030911]/95 border border-[#00E5FF] px-3 py-1.5 rounded text-[10px] font-orbitron text-white shadow-2xl pointer-events-none">
          <span className="text-[#FFD600] font-bold mr-1.5">STAGE {hoveredStage.code}:</span>
          <span>{hoveredStage.name}</span>
          <div className="text-[8px] font-mono-tech text-[#8A949D]">{hoveredStage.sub}</div>
        </div>
      )}
    </div>
  );
};
