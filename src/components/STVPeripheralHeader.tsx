/**
 * STV CLOSER SYSTEM — PERIPHERAL TOP HEADER
 * Strict Rule: UI occupies < 5% of visual area.
 * Provides high-density status, active family switch, audit badge, and quick tools.
 */

import React from 'react';
import { StructuralFamilyId, WorkspaceScreenId } from '../types/stv';
import { STV_TRUSS_FAMILIES } from '../engine/database/STV_SSKC';
import { SynthesisResult } from '../engine/STV_MotorSintesis';
import { 
  ShieldCheck, 
  Layers, 
  FileText, 
  SlidersHorizontal, 
  Eye, 
  Compass, 
  Share2, 
  Download, 
  FileCheck,
  Maximize2,
  Grid,
  Hammer,
  Columns,
  Sparkles
} from 'lucide-react';

interface STVPeripheralHeaderProps {
  currentFamily: StructuralFamilyId;
  onSelectFamily: (family: StructuralFamilyId) => void;
  activeWorkspace: WorkspaceScreenId;
  onSelectWorkspace: (workspace: WorkspaceScreenId) => void;
  synthesis: SynthesisResult;
  onOpenAudit: () => void;
  onOpenDossier: () => void;
  onToggleDrawer: () => void;
  isDrawerOpen: boolean;
  showDimensions: boolean;
  onToggleDimensions: () => void;
  showLoadVectors: boolean;
  onToggleLoadVectors: () => void;
  showFoundation: boolean;
  onToggleFoundation: () => void;
  showGrid: boolean;
  onToggleGrid: () => void;
  onExportGoogleDocs: () => void;
  isExportingDocs: boolean;
}

export const STVPeripheralHeader: React.FC<STVPeripheralHeaderProps> = ({
  currentFamily,
  onSelectFamily,
  activeWorkspace,
  onSelectWorkspace,
  synthesis,
  onOpenAudit,
  onOpenDossier,
  onToggleDrawer,
  isDrawerOpen,
  showDimensions,
  onToggleDimensions,
  showLoadVectors,
  onToggleLoadVectors,
  showFoundation,
  onToggleFoundation,
  showGrid,
  onToggleGrid,
  onExportGoogleDocs,
  isExportingDocs
}) => {
  const auditStatus = synthesis.auditReport.overallStatus;

  const workspaces: { id: WorkspaceScreenId; step: string; label: string; icon: React.ReactNode }[] = [
    { id: 'WORKSPACE_FOUNDATION', step: '01', label: 'CIMENTACIÓN', icon: <Layers size={12} /> },
    { id: 'WORKSPACE_COLUMNS', step: '02', label: 'COLUMNAS', icon: <Columns size={12} /> },
    { id: 'WORKSPACE_ROOFS', step: '03', label: 'TECHOS', icon: <Sparkles size={12} /> },
    { id: 'WORKSPACE_PURLINS', step: '04', label: 'LARGUEROS', icon: <Grid size={12} /> },
    { id: 'WORKSPACE_FABRICATION', step: '05', label: 'TALLER / CORTE', icon: <Hammer size={12} /> },
    { id: 'WORKSPACE_AUDIT', step: '06', label: 'AUDITORÍA', icon: <ShieldCheck size={12} /> },
    { id: 'WORKSPACE_3D_VIEW', step: '07', label: 'MASTER 360°', icon: <Maximize2 size={12} /> }
  ];

  return (
    <header className="sticky top-0 left-0 right-0 z-30 flex flex-wrap items-center justify-between px-3 py-2 bg-black/90 backdrop-blur-md border-b border-[#006F73]/50 font-orbitron select-none text-[#F2F7F7] gap-2">
      {/* Brand Identity & Main Workspace Switcher */}
      <div className="flex items-center gap-3">
        <div 
          onClick={() => onSelectWorkspace('WORKSPACE_3D_VIEW')}
          className="flex items-center gap-2 cursor-pointer group"
        >
          <div className="w-3 h-3 bg-[#00E6DE] shadow-[0_0_8px_#00E6DE] group-hover:rotate-45 transition-all"></div>
          <span className="text-sm font-black tracking-widest text-[#00E6DE]">STV CLOSER</span>
          <span className="text-[9px] font-mono-tech px-1.5 py-0.5 bg-[#041315] text-[#8CFFFF] border border-[#00A8AA]/40 hidden sm:inline">
            v2.4
          </span>
        </div>

        {/* WORKSPACE SCREENS NAVIGATOR */}
        <div className="flex items-center gap-1 bg-[#020607] border border-[#006F73]/50 p-0.5 rounded-sm">
          {workspaces.map((ws) => {
            const isActive = activeWorkspace === ws.id;
            return (
              <button
                key={ws.id}
                onClick={() => onSelectWorkspace(ws.id)}
                className={`flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-bold tracking-wider transition-all duration-150 uppercase ${
                  isActive
                    ? 'bg-[#00E6DE] text-black shadow-[0_0_10px_rgba(0,230,222,0.4)]'
                    : 'text-[#849492] hover:text-[#00E6DE] hover:bg-[#00E6DE]/10'
                }`}
              >
                {ws.icon}
                <span className="hidden md:inline font-mono-tech">{ws.step}.</span>
                <span className="hidden md:inline">{ws.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Center High-Density Metrics Bar */}
      <div className="hidden xl:flex items-center gap-5 font-mono-tech text-[11px] text-[#849492]">
        <div>
          SPAN: <span className="text-[#8CFFFF] font-bold">{synthesis.columns[0]?.tributaryAreaM2 ? (synthesis.columns[0].tributaryAreaM2 * 0.4).toFixed(1) : '12.0'} m</span>
        </div>
        <div>
          WEIGHT: <span className="text-[#00E6DE] font-bold">{synthesis.metrics.totalSteelWeightTon} TON</span>
        </div>
        <div>
          ELEMENTS: <span className="text-[#F2F7F7] font-bold">{synthesis.metrics.membersCount}</span>
        </div>
        <div>
          SOIL: <span className="text-[#D7B52A] font-bold">{synthesis.geotech.bearingCapacityKPa} kPa</span>
        </div>
      </div>

      {/* Right Action Tools & Audit Badge */}
      <div className="flex items-center gap-2">
        {/* Layer Visibility Toggles (active only in 3D view) */}
        {activeWorkspace === 'WORKSPACE_3D_VIEW' && (
          <div className="hidden sm:flex items-center gap-1 bg-[#020607] border border-[#006F73]/40 p-0.5">
            <button
              onClick={onToggleGrid}
              title="Toggle Engineering Grid"
              className={`p-1.5 text-xs ${showGrid ? 'text-[#D7B52A] bg-[#D7B52A]/15' : 'text-[#849492] hover:text-[#F2F7F7]'}`}
            >
              <Compass size={13} />
            </button>
            <button
              onClick={onToggleLoadVectors}
              title="Toggle Load Vectors"
              className={`p-1.5 text-xs ${showLoadVectors ? 'text-[#3CA9FF] bg-[#3CA9FF]/15' : 'text-[#849492] hover:text-[#F2F7F7]'}`}
            >
              <Eye size={13} />
            </button>
            <button
              onClick={onToggleFoundation}
              title="Toggle Foundations"
              className={`p-1.5 text-xs ${showFoundation ? 'text-[#39E58C] bg-[#39E58C]/15' : 'text-[#849492] hover:text-[#F2F7F7]'}`}
            >
              <Layers size={13} />
            </button>
          </div>
        )}

        {/* Parametric Drawer Button */}
        <button
          onClick={onToggleDrawer}
          className={`flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-semibold border transition-all ${
            isDrawerOpen
              ? 'bg-[#00E6DE]/20 text-[#00E6DE] border-[#00E6DE]'
              : 'bg-[#020607] text-[#849492] hover:text-[#00E6DE] border-[#006F73]/50'
          }`}
        >
          <SlidersHorizontal size={13} />
          <span className="hidden lg:inline">PARAMETRIC</span>
        </button>

        {/* Audit Report Button */}
        <button
          onClick={onOpenAudit}
          className={`flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-bold border transition-all ${
            auditStatus === 'PASS'
              ? 'bg-[#39E58C]/15 text-[#39E58C] border-[#39E58C]/50 hover:bg-[#39E58C]/25'
              : 'bg-[#FF4D5A]/15 text-[#FF4D5A] border-[#FF4D5A]/50 hover:bg-[#FF4D5A]/25'
          }`}
        >
          <ShieldCheck size={13} />
          <span>{auditStatus}</span>
        </button>

        {/* Technical Dossier Button */}
        <button
          onClick={onOpenDossier}
          className="flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-semibold bg-[#020607] text-[#8CFFFF] hover:text-white border border-[#00A8AA]/50 hover:border-[#00E6DE] transition-all"
        >
          <FileText size={13} />
          <span className="hidden md:inline">DOSSIER</span>
        </button>

        {/* Google Docs Sync Button */}
        <button
          onClick={onExportGoogleDocs}
          disabled={isExportingDocs}
          title="Sync directly to Google Docs"
          className="flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-bold bg-[#3CA9FF]/20 text-[#3CA9FF] hover:bg-[#3CA9FF]/30 border border-[#3CA9FF]/60 transition-all cursor-pointer disabled:opacity-50"
        >
          <FileCheck size={13} />
          <span className="hidden sm:inline">{isExportingDocs ? 'SYNCING...' : 'DOCS'}</span>
        </button>
      </div>
    </header>
  );
};

