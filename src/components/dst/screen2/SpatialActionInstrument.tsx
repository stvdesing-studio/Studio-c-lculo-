// ============================================================
// STV CLOSER — SPATIAL ACTION INSTRUMENT & AUDIT BAR (SCREEN 02)
// SpatialActionInstrument.tsx
// Audit Ontology Status, Real-Time Validation Trigger, and Stage Gating
// ============================================================

import React from 'react';
import { ShieldCheck, ArrowRight, Play, CheckCircle2, AlertTriangle, FileText, Send } from 'lucide-react';
import { AuditStatus, ComprehensiveAuditReport } from '../../../dst/structural-audit';

interface SpatialActionInstrumentProps {
  auditReport: ComprehensiveAuditReport;
  onRunAudit: () => void;
  onSendToTwin: () => void;
  onProceedToNextStage: () => void;
  onOpenDossier: () => void;
  totalLinearM: number;
  totalWeightKg: number;
}

export const SpatialActionInstrument: React.FC<SpatialActionInstrumentProps> = ({
  auditReport,
  onRunAudit,
  onSendToTwin,
  onProceedToNextStage,
  onOpenDossier,
  totalLinearM,
  totalWeightKg
}) => {
  const isCompliant =
    auditReport.overallStatus === 'VALIDATED' ||
    auditReport.overallStatus === 'REVIEW_REQUIRED' ||
    auditReport.overallStatus === 'FABRICATION_REVIEW';

  return (
    <footer className="w-full select-none z-30 pointer-events-none flex items-end justify-between px-3 sm:px-6 pb-3 text-[#F2F7F7] font-mono-tech">
      {/* 1. Left Side: Material Takeoff Rollup & Dossier Link */}
      <div className="pointer-events-auto flex items-center gap-2">
        <div className="px-3 py-1.5 bg-[#030911]/90 border border-[#00E5FF]/40 backdrop-blur-xl rounded flex items-center gap-3 text-[9px] shadow-[0_0_15px_rgba(0,229,255,0.2)]">
          <div className="flex flex-col">
            <span className="text-[#8A949D] text-[7px]">PESO TOTAL ACERO:</span>
            <span className="font-orbitron font-bold text-white text-xs">{totalWeightKg} kg</span>
          </div>
          <div className="h-5 w-[1px] bg-[#0D2235]" />
          <div className="flex flex-col">
            <span className="text-[#8A949D] text-[7px]">LONGITUD LINEAL:</span>
            <span className="font-orbitron font-bold text-[#00E5FF] text-xs">{totalLinearM.toFixed(1)} m</span>
          </div>
          <div className="h-5 w-[1px] bg-[#0D2235]" />
          <div className="flex flex-col">
            <span className="text-[#8A949D] text-[7px]">NODOS / BARRAS:</span>
            <span className="font-orbitron font-bold text-[#FFD600] text-xs">
              {auditReport.metrics.totalNodes}N / {auditReport.metrics.totalMembers}M
            </span>
          </div>
        </div>
      </div>

      {/* 2. Center: Audit Status Pill & Validation Button */}
      <div className="pointer-events-auto flex items-center gap-2 bg-[#030911]/95 border border-[#00E5FF]/50 backdrop-blur-xl px-3 py-1.5 rounded-full shadow-[0_0_20px_rgba(0,229,255,0.3)]">
        {/* Dynamic Status Pill */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9px] font-orbitron font-bold" style={{ backgroundColor: `${auditReport.statusColor}22`, color: auditReport.statusColor, border: `1px solid ${auditReport.statusColor}` }}>
          <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: auditReport.statusColor }} />
          <span>{auditReport.statusBadge}</span>
        </div>

        {/* Re-validate Trigger */}
        <button
          type="button"
          onClick={onRunAudit}
          className="px-2.5 py-1 bg-[#051829] hover:bg-[#00E5FF] hover:text-black border border-[#00E5FF]/40 text-[#00E5FF] rounded-full text-[8px] font-orbitron font-bold transition-all flex items-center gap-1"
        >
          <ShieldCheck className="w-3 h-3" />
          AUDITAR GRAMÁTICA
        </button>
      </div>

      {/* 3. Right Side: Gating Progression Actions */}
      <div className="pointer-events-auto flex items-center gap-2">
        <button
          type="button"
          onClick={onSendToTwin}
          className="px-3.5 py-2 bg-[#030911]/90 hover:bg-[#00E5FF] hover:text-black border border-[#00E5FF]/60 text-[#00E5FF] font-orbitron font-bold text-[10px] rounded transition-all flex items-center gap-1.5 shadow-[0_0_15px_rgba(0,229,255,0.2)]"
        >
          <Send className="w-3.5 h-3.5" />
          ENVIAR A DIGITAL TWIN
        </button>

        <button
          type="button"
          onClick={onProceedToNextStage}
          disabled={!isCompliant}
          className={`px-4 py-2 font-orbitron font-bold text-[10px] rounded transition-all flex items-center gap-2 ${
            isCompliant
              ? 'bg-[#FFD600] text-black hover:bg-white shadow-[0_0_20px_rgba(255,214,0,0.5)] cursor-pointer'
              : 'bg-[#181203] text-[#8A949D] border border-[#FFD600]/30 cursor-not-allowed'
          }`}
        >
          <span>CONTINUAR A CIMENTACIÓN (03)</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </footer>
  );
};
