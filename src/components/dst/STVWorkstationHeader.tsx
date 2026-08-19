// ============================================================
// STV CLOSER — WORKSTATION HEADER COMPONENT
// STVWorkstationHeader.tsx
// High-Density Engineering Branding, Twin Modes, Units & Export Hub
// ============================================================

import React from 'react';
import { DSTProject } from '../../dst/dst.schema';
import {
  Layers,
  Box,
  FileText,
  Download,
  Share2,
  Cpu,
  ShieldCheck,
  Zap,
  Activity,
  Sliders,
  CheckCircle2,
  FileSpreadsheet
} from 'lucide-react';

export interface STVWorkstationHeaderProps {
  project: DSTProject;
  activeMode: string;
  onSelectMode: (mode: any) => void;
  totalLinearMeters: number;
  totalSteelWeightKg: number;
  onOpenDossier: () => void;
  onOpenGoogleSheets?: () => void;
  onExportDXF: () => void;
  onExportJSON: () => void;
  onExportCSV: () => void;
}

export const STVWorkstationHeader: React.FC<STVWorkstationHeaderProps> = ({
  project,
  activeMode,
  onSelectMode,
  totalLinearMeters,
  totalSteelWeightKg,
  onOpenDossier,
  onOpenGoogleSheets,
  onExportDXF,
  onExportJSON,
  onExportCSV
}) => {
  const modes = [
    { id: 'ALL', label: '3D TWIN' },
    { id: 'COLUMNS', label: 'COLUMNAS' },
    { id: 'ROOF', label: 'CERCHAS' },
    { id: 'FOUNDATION', label: 'CIMENTACIÓN' },
    { id: 'CONNECTIONS', label: 'CONEXIONES' },
    { id: 'FABRICATION', label: 'TALLER / CNC' },
    { id: 'AUDIT', label: 'AUDITORÍA' }
  ];

  return (
    <header className="w-full h-14 bg-[#05080D] border-b border-[#0D1620] flex items-center justify-between px-4 z-40 select-none">
      {/* 1. BRANDING & PROJECT IDENTITY */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 bg-[#00E5FF]/10 border border-[#00E5FF] flex items-center justify-center text-[#00E5FF]">
            <Cpu size={18} className="animate-pulse" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="font-orbitron font-black text-sm tracking-wider text-[#F2F7F7]">
                STV CLOSER
              </span>
              <span className="text-[9px] font-orbitron px-1.5 py-0.2 bg-[#00E5FF]/15 text-[#00E5FF] border border-[#00E5FF]/40 tracking-widest">
                DST v2.4
              </span>
            </div>
            <span className="text-[9px] font-mono-tech text-[#8A949D] tracking-tight">
              DIGITAL STRUCTURAL TWIN // WORKSTATION
            </span>
          </div>
        </div>

        <div className="h-6 w-px bg-[#111C27] mx-1" />

        {/* Project Metadata */}
        <div className="hidden lg:flex flex-col">
          <div className="text-[11px] font-orbitron font-bold text-[#F2F7F7] truncate max-w-[240px]">
            {project.name}
          </div>
          <div className="text-[9px] font-mono-tech text-[#5E6872] flex items-center gap-2">
            <span>ID: {project.id}</span>
            <span>•</span>
            <span className="text-[#00E5FF]">UNITS: METRIC (m)</span>
          </div>
        </div>
      </div>

      {/* 2. CENTRAL WORKSPACE MODES SELECTOR */}
      <nav className="flex items-center bg-[#080D14] border border-[#111C27] p-0.5">
        {modes.map((m) => {
          const isActive = activeMode === m.id;
          return (
            <button
              key={m.id}
              onClick={() => onSelectMode(m.id)}
              className={`px-3 py-1.5 text-[11px] font-orbitron tracking-wider transition-all whitespace-nowrap ${
                isActive
                  ? 'bg-[#00E5FF] text-black font-bold shadow-[0_0_12px_rgba(0,229,255,0.4)]'
                  : 'text-[#8A949D] hover:text-[#F2F7F7] hover:bg-[#0D1620]'
              }`}
            >
              {m.label}
            </button>
          );
        })}
      </nav>

      {/* 3. STRUCTURAL TELEMETRY & EXPORT HUB */}
      <div className="flex items-center gap-3">
        {/* KPI: Total Steel Mass & Linear Meters */}
        <div className="hidden xl:flex items-center gap-3 px-3 py-1 bg-[#080D14] border border-[#111C27] text-[10px] font-mono-tech">
          <div className="flex flex-col">
            <span className="text-[#5E6872] text-[8px] font-orbitron">METROS LINEALES</span>
            <span className="text-[#00E5FF] font-bold">{totalLinearMeters.toFixed(1)} m</span>
          </div>
          <div className="w-px h-5 bg-[#111C27]" />
          <div className="flex flex-col">
            <span className="text-[#5E6872] text-[8px] font-orbitron">PESO ACERO</span>
            <span className="text-[#39E58C] font-bold">{(totalSteelWeightKg / 1000).toFixed(2)} TON</span>
          </div>
        </div>

        {/* Audit Status Indicator */}
        <div
          className={`flex items-center gap-1.5 px-2.5 py-1 bg-[#080D14] border text-[10px] font-orbitron transition-all ${
            project.audit?.status === 'FAILED'
              ? 'border-[#FF3B30] text-[#FF3B30] shadow-[0_0_10px_rgba(255,59,48,0.3)] animate-pulse'
              : project.audit?.status === 'REVIEW_REQUIRED' || project.audit?.status === 'ENGINEERING_REVIEW'
              ? 'border-[#FFD600] text-[#FFD600]'
              : 'border-[#00E5FF]/30 text-[#39E58C]'
          }`}
          title={project.audit?.messages?.[0]?.message || 'AISC 360-22 Audit Active'}
        >
          {project.audit?.status === 'FAILED' ? (
            <Zap size={13} className="text-[#FF3B30]" />
          ) : (
            <ShieldCheck size={13} className={project.audit?.status === 'REVIEW_REQUIRED' ? 'text-[#FFD600]' : 'text-[#39E58C]'} />
          )}
          <span className="hidden sm:inline tracking-wider font-bold">
            {project.audit?.status === 'FAILED'
              ? 'AISC OVERLOAD'
              : project.audit?.status === 'REVIEW_REQUIRED'
              ? 'AISC REVIEW'
              : 'AISC VALIDATED'}
          </span>
        </div>

        {/* Export Triggers */}
        <div className="flex items-center gap-1">
          {onOpenGoogleSheets && (
            <button
              onClick={onOpenGoogleSheets}
              className="px-2.5 py-1.5 bg-[#03151E] border border-[#00E5FF]/60 hover:border-[#00E5FF] text-[#00E5FF] hover:bg-[#00E5FF]/20 text-[10px] font-orbitron font-bold flex items-center gap-1.5 transition-all shadow-[0_0_10px_rgba(0,229,255,0.25)]"
              title="Sincronizar y Exportar a Google Sheets"
            >
              <FileSpreadsheet size={13} className="text-[#39E58C]" />
              <span className="hidden sm:inline">SHEETS</span>
            </button>
          )}
          <button
            onClick={onExportDXF}
            className="px-2.5 py-1.5 bg-[#080D14] border border-[#111C27] hover:border-[#00E5FF] text-[#8A949D] hover:text-[#00E5FF] text-[10px] font-orbitron transition-all"
            title="Export DXF CAD Geometry"
          >
            DXF
          </button>
          <button
            onClick={onExportCSV}
            className="px-2.5 py-1.5 bg-[#080D14] border border-[#111C27] hover:border-[#00E5FF] text-[#8A949D] hover:text-[#00E5FF] text-[10px] font-orbitron transition-all"
            title="Export Workshop Cut-List CSV"
          >
            CSV
          </button>
          <button
            onClick={onOpenDossier}
            className="px-3 py-1.5 bg-[#00E5FF] hover:bg-[#4CC9FF] text-black font-orbitron font-bold text-[11px] flex items-center gap-1.5 transition-all shadow-[0_0_12px_rgba(0,229,255,0.3)]"
          >
            <FileText size={13} />
            <span>DOSSIER</span>
          </button>
        </div>
      </div>
    </header>
  );
};
