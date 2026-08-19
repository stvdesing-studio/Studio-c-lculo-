// ============================================================
// STV CLOSER — HOLOGRAPHIC INTEGRITY HUD & LIVE D/C SOLVER PANEL
// HolographicIntegrityHUD.tsx
// Translates real physics & AISC 360-16 into 98% Integrity Indicator
// ============================================================

import React from 'react';
import {
  ShieldCheck,
  AlertTriangle,
  Flame,
  Activity,
  CheckCircle2,
  FileSpreadsheet,
  Download,
  Maximize2,
  Cpu,
  Layers,
  Sparkles
} from 'lucide-react';
import { GlobalIntegrityReport } from '../../../dst/structural-solver-engine';
import { CategoryHubId } from './HolographicOrbitalRing';

interface HolographicIntegrityHUDProps {
  report: GlobalIntegrityReport;
  activeCategory: CategoryHubId;
  onOpenDossier: () => void;
  onOpenGoogleSheets: () => void;
  onExportDXF: () => void;
  onOpenOptimizer?: () => void;
}

export const HolographicIntegrityHUD: React.FC<HolographicIntegrityHUDProps> = ({
  report,
  activeCategory,
  onOpenDossier,
  onOpenGoogleSheets,
  onExportDXF,
  onOpenOptimizer
}) => {
  const isOverloaded = report.maxDcRatio > 1.0;
  const isHighUtil = report.maxDcRatio >= 0.85 && !isOverloaded;

  return (
    <div className="absolute inset-0 pointer-events-none z-20 flex flex-col justify-between p-4">
      
      {/* 1. TOP STATS BAR: LIVE 98% INTEGRITY & AISC RATIO */}
      <div className="flex items-start justify-between w-full pointer-events-auto">
        
        {/* Left Widget: SYSTEM BRANDING & PROTOCOL */}
        <div className="flex items-center gap-3 bg-[#02050B]/85 backdrop-blur-md border border-[#00E5FF]/40 px-3.5 py-2 rounded-xl shadow-[0_0_25px_rgba(0,229,255,0.15)]">
          <div className="w-7 h-7 rounded-lg bg-[#00E5FF]/20 border border-[#00E5FF] flex items-center justify-center font-orbitron font-black text-xs text-[#00E5FF]">
            STV
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-orbitron font-black text-[#F2F7F7] tracking-wider">
                STV CLOSER · OVERDRIVE
              </span>
              <span className="px-1.5 py-0.2 bg-[#00E5FF]/20 text-[#00E5FF] text-[8px] font-mono font-bold rounded">
                AISC 360-16
              </span>
            </div>
            <span className="text-[9px] text-[#8A949D] font-mono">
              MOTOR INDUSTRIAL V6.0 · SOLVER EN TIEMPO REAL
            </span>
          </div>
        </div>

        {/* Center / Right Widget: LIVE INTEGRITY INDICATOR & DEMAND/CAPACITY */}
        <div className="flex items-center gap-3">
          
          {/* THE MASTER INTEGRITY DIAL / BADGE */}
          <div
            className={`flex items-center gap-3 px-4 py-2 rounded-xl backdrop-blur-md border transition-all duration-300 ${
              isOverloaded
                ? 'bg-[#FF3B30]/20 border-[#FF3B30] shadow-[0_0_30px_rgba(255,59,48,0.7)] animate-pulse'
                : isHighUtil
                ? 'bg-[#02050B]/90 border-[#FFD700] shadow-[0_0_30px_rgba(255,215,0,0.5)]'
                : 'bg-[#02050B]/90 border-[#00E5FF] shadow-[0_0_30px_rgba(0,229,255,0.4)]'
            }`}
          >
            {/* The Percentage Big Callout */}
            <div className="flex flex-col items-center">
              <div className="flex items-baseline gap-1">
                <span
                  className={`text-2xl sm:text-3xl font-orbitron font-black leading-none ${
                    isOverloaded
                      ? 'text-[#FF3B30]'
                      : isHighUtil
                      ? 'text-[#FFD700]'
                      : 'text-[#00E5FF]'
                  }`}
                >
                  {isOverloaded ? 'OVERLOAD' : `${report.integrityPercent}%`}
                </span>
                {!isOverloaded && (
                  <span className="text-[10px] font-orbitron text-[#8A949D]">INTEGRITY</span>
                )}
              </div>
              <span className="text-[8px] font-mono text-[#8A949D] tracking-wider">
                D/C: {report.maxDcRatio.toFixed(2)} · SF: {report.safetyFactor}x
              </span>
            </div>

            <div className="h-8 w-[1px] bg-[#00E5FF]/30" />

            {/* Governing Limit State Details */}
            <div className="flex flex-col text-left">
              <div className="flex items-center gap-1.5">
                {isOverloaded ? (
                  <AlertTriangle size={12} className="text-[#FF3B30] animate-bounce" />
                ) : (
                  <ShieldCheck size={12} className="text-[#39E58C]" />
                )}
                <span
                  className={`text-[9px] font-orbitron font-bold ${
                    isOverloaded ? 'text-[#FF3B30]' : 'text-[#39E58C]'
                  }`}
                >
                  {report.systemStatus}
                </span>
              </div>
              <span className="text-[8px] font-mono text-[#F2F7F7] max-w-[150px] truncate">
                {report.criticalMember.memberRole}: {report.criticalMember.governingCheck}
              </span>
              <span className="text-[8px] font-mono text-[#00E5FF]">
                Δ Flecha: {report.deflection.actualDeflectionMm} mm ({report.deflection.spanRatioText})
              </span>
            </div>
          </div>

          {/* QUICK EXPORT & OPTIMIZER ACTIONS */}
          <div className="flex items-center gap-1.5 bg-[#02050B]/85 backdrop-blur-md border border-[#00E5FF]/30 p-1.5 rounded-xl">
            {onOpenOptimizer && (
              <button
                onClick={onOpenOptimizer}
                title="Optimización de Perfiles AISC 360-22"
                className={`p-2 rounded-lg transition-all flex items-center gap-1 text-[9px] font-orbitron font-bold border ${
                  isOverloaded
                    ? 'bg-[#FF3B30] text-white border-[#FF3B30] shadow-[0_0_15px_rgba(255,59,48,0.7)] animate-pulse'
                    : 'bg-[#00E5FF]/15 hover:bg-[#00E5FF]/30 text-[#00E5FF] border-[#00E5FF]/40'
                }`}
              >
                <Sparkles size={13} />
                <span className="hidden sm:inline">OPTIMIZAR</span>
              </button>
            )}
            <button
              onClick={onOpenGoogleSheets}
              title="Sincronizar con Google Sheets (6 Pestañas)"
              className="p-2 bg-[#0A1424] hover:bg-[#39E58C]/20 text-[#39E58C] hover:text-white rounded-lg transition-colors border border-[#39E58C]/40 flex items-center gap-1 text-[9px] font-orbitron font-bold"
            >
              <FileSpreadsheet size={13} />
              <span className="hidden sm:inline">SHEETS</span>
            </button>
            <button
              onClick={onOpenDossier}
              title="Abrir Dossier Técnico Ejecutivo"
              className="p-2 bg-[#FFD700] hover:bg-[#FFD700]/80 text-black rounded-lg transition-all shadow-[0_0_15px_#FFD700] flex items-center gap-1 text-[9px] font-orbitron font-black"
            >
              <Download size={13} />
              <span className="hidden sm:inline">DOSSIER</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. FLOATING RIGHT TELEMETRY CARD: DETAILED SOLVER HANDSHAKE */}
      <div className="self-end pointer-events-auto max-w-xs bg-[#02050B]/80 backdrop-blur-md border border-[#00E5FF]/40 rounded-xl p-3 shadow-[0_0_25px_rgba(0,229,255,0.15)] flex flex-col gap-2.5">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#00E5FF]/30 pb-1.5">
          <div className="flex items-center gap-1.5">
            <Cpu size={13} className="text-[#00E5FF]" />
            <span className="text-[10px] font-orbitron font-black text-[#F2F7F7]">
              SOLVER AUDIT
            </span>
          </div>
          <span className="text-[8px] font-mono text-[#00E5FF]">
            {activeCategory}
          </span>
        </div>

        {/* Member Limit Breakdown */}
        <div className="space-y-1.5">
          {report.memberBreakdown.map((m, idx) => {
            const isCrit = m.memberRole === report.criticalMember.memberRole;
            return (
              <div
                key={idx}
                className={`flex items-center justify-between px-2 py-1 rounded text-[9px] font-mono border ${
                  isCrit
                    ? 'bg-[#FFD700]/15 border-[#FFD700] text-[#FFD700]'
                    : 'bg-[#030812]/60 border-[#00E5FF]/20 text-[#8A949D]'
                }`}
              >
                <div className="flex flex-col">
                  <span className="font-bold text-[#F2F7F7]">{m.memberRole}</span>
                  <span className="text-[8px] text-[#8A949D]">{m.sectionDesignation}</span>
                </div>
                <div className="text-right">
                  <div className={`font-black ${m.dcRatio > 1.0 ? 'text-[#FF3B30]' : m.dcRatio > 0.85 ? 'text-[#FFD700]' : 'text-[#00E5FF]'}`}>
                    D/C {(m.dcRatio * 100).toFixed(0)}%
                  </div>
                  <div className="text-[7px] text-[#8A949D]">KL/r: {m.slenderness_KL_r}</div>
                </div>
              </div>
            );
          })}
        </div>

        {/* AWS D1.1 Weld Joint & ACI 318 Status */}
        <div className="pt-1 border-t border-[#00E5FF]/20 flex flex-col gap-1 text-[8px] font-mono">
          <div className="flex justify-between text-[#8A949D]">
            <span>AWS D1.1 WELD:</span>
            <span className="text-[#39E58C] font-bold">{report.weldCheck.weldType} ({report.weldCheck.status})</span>
          </div>
          <div className="flex justify-between text-[#8A949D]">
            <span>ACI 318 BASE:</span>
            <span className="text-[#00E5FF]">{report.basePlateCheck.plateDimensionsMm}</span>
          </div>
          <div className="flex justify-between text-[#8A949D]">
            <span>PESO ACERO:</span>
            <span className="text-[#FFD700] font-bold">{report.totalSteelWeightKg} kg</span>
          </div>
        </div>
      </div>
    </div>
  );
};
