// ============================================================
// STV CLOSER — STRUCTURAL OPTIMIZATION RECOMMENDATION MODAL
// OptimizationRecommendationModal.tsx
// Translates AISC 360-22 D/C > 1.0 Overload into Actionable Profile Upgrades
// ============================================================

import React from 'react';
import {
  AlertTriangle,
  Zap,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  X,
  Sparkles,
  TrendingUp,
  Layers
} from 'lucide-react';
import { OptimizationRecommendation, OptimizationPlan } from '../../../dst/design-engine';
import { SectionProfile } from '../../../dst/dst.schema';

interface OptimizationRecommendationModalProps {
  isOpen: boolean;
  onClose: () => void;
  plan: OptimizationPlan;
  onApplyRecommendation: (key: string, profile: SectionProfile) => void;
  onApplyAllRecommendations: (recommendations: OptimizationRecommendation[]) => void;
}

export const OptimizationRecommendationModal: React.FC<OptimizationRecommendationModalProps> = ({
  isOpen,
  onClose,
  plan,
  onApplyRecommendation,
  onApplyAllRecommendations
}) => {
  if (!isOpen) return null;

  const isFailing = plan.status === 'RECOMMENDATIONS_AVAILABLE';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in select-none">
      <div className="relative w-full max-w-2xl bg-[#030911]/95 border border-[#00E5FF]/50 rounded-xl shadow-[0_0_40px_rgba(0,229,255,0.25)] overflow-hidden flex flex-col font-mono-tech">
        
        {/* 1. HEADER BAR */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-[#050E1A] border-b border-[#0D2235]">
          <div className="flex items-center gap-2.5">
            <div className={`w-8 h-8 rounded flex items-center justify-center ${
              isFailing ? 'bg-[#FF3B30]/20 border border-[#FF3B30] text-[#FF3B30]' : 'bg-[#00E5FF]/20 border border-[#00E5FF] text-[#00E5FF]'
            }`}>
              {isFailing ? <Zap className="w-5 h-5 animate-pulse" /> : <ShieldCheck className="w-5 h-5 text-[#39E58C]" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-orbitron font-black text-sm text-[#F2F7F7] tracking-wider">
                  OPTIMIZADOR ESTRUCTURAL AISC 360-22
                </span>
                <span className={`text-[8px] font-orbitron px-1.5 py-0.2 rounded border ${
                  isFailing ? 'bg-[#FF3B30]/20 text-[#FF3B30] border-[#FF3B30]/40' : 'bg-[#39E58C]/20 text-[#39E58C] border-[#39E58C]/40'
                }`}>
                  {isFailing ? 'SOBRECARGA D/C > 1.0' : 'ESTRUCTURA ÓPTIMA'}
                </span>
              </div>
              <span className="text-[10px] text-[#8A949D]">
                RECOMENDACIÓN PARAMÉTRICA AUTOMÁTICA EN TIEMPO REAL
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded text-[#8A949D] hover:text-white hover:bg-[#0D2235] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 2. BODY CONTENT */}
        <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
          {/* Summary Alert */}
          <div className={`p-3.5 rounded-lg border flex items-start gap-3 ${
            isFailing ? 'bg-[#FF3B30]/10 border-[#FF3B30]/40 text-[#FF857D]' : 'bg-[#00E5FF]/10 border-[#00E5FF]/30 text-[#8CFFFF]'
          }`}>
            <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
            <div className="text-xs space-y-1">
              <div className="font-orbitron font-bold text-white tracking-wide">
                {plan.summaryMessage}
              </div>
              <div className="text-[11px] opacity-90">
                {isFailing
                  ? 'El motor de cálculo detectó esfuerzos solicitantes superiores a la capacidad nominal minorada (phi*Pn). Aplique las recomendaciones para restablecer la integridad estructural al 98%+.'
                  : 'Todos los elementos cumplen rigurosamente con los límites de esbeltez, pandeo y flexocompresión normativa.'}
              </div>
            </div>
          </div>

          {/* List of Recommendations */}
          {plan.recommendations.length > 0 ? (
            <div className="space-y-3">
              <div className="text-[10px] font-orbitron font-bold text-[#FFD600] tracking-widest uppercase">
                PROPUESTAS DE REEMPLAZO DE PERFIL RECOMENDADAS:
              </div>

              {plan.recommendations.map((rec) => (
                <div
                  key={rec.id}
                  className="bg-[#050D18] border border-[#0D263B] hover:border-[#00E5FF]/60 rounded-lg p-3.5 space-y-2.5 transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 bg-[#00E5FF]/15 border border-[#00E5FF]/30 text-[#00E5FF] text-[9px] font-orbitron font-bold rounded">
                        {rec.role}
                      </span>
                      <span className="text-[10px] font-mono text-[#8A949D]">
                        ID: {rec.memberId}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono text-[#FF3B30] font-bold">
                        D/C Actual: {rec.currentDcRatio.toFixed(2)}
                      </span>
                      <ArrowRight className="w-3 h-3 text-[#8A949D]" />
                      <span className="text-[10px] font-mono text-[#39E58C] font-bold">
                        D/C Proyectado: ~{rec.expectedDcRatio.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  {/* Profile Transition Display */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 bg-[#02060C] p-2.5 rounded border border-[#0A1A28] text-xs">
                    <div className="flex flex-col">
                      <span className="text-[8px] font-orbitron text-[#8A949D]">PERFIL ACTUAL (INSUFICIENTE)</span>
                      <span className="text-[#FF857D] font-bold truncate">{rec.currentProfileDesignation}</span>
                    </div>
                    <div className="flex flex-col sm:border-l sm:border-[#0D2235] sm:pl-2.5">
                      <span className="text-[8px] font-orbitron text-[#39E58C]">PERFIL SUGERIDO AISC 360-22</span>
                      <span className="text-[#00E5FF] font-bold truncate">{rec.recommendedProfile.designation}</span>
                    </div>
                  </div>

                  {/* Justification & Action */}
                  <div className="flex items-center justify-between gap-3 pt-1">
                    <span className="text-[9px] text-[#8A949D] italic flex-1">
                      {rec.reason}
                    </span>

                    <button
                      type="button"
                      onClick={() => onApplyRecommendation(rec.suggestedParamKey, rec.recommendedProfile)}
                      className="px-3 py-1.5 bg-[#00E5FF] hover:bg-[#4CC9FF] text-black font-orbitron font-bold text-[10px] rounded flex items-center gap-1.5 shadow-[0_0_10px_rgba(0,229,255,0.3)] transition-all shrink-0"
                    >
                      <Sparkles className="w-3 h-3" />
                      APLICAR ESTE PERFIL
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 text-xs text-[#8A949D]">
              <CheckCircle2 className="w-8 h-8 text-[#39E58C] mx-auto mb-2 opacity-80" />
              No se requieren ajustes de perfil en este momento.
            </div>
          )}
        </div>

        {/* 3. FOOTER ACTIONS */}
        <div className="flex items-center justify-between px-5 py-3 bg-[#050E1A] border-t border-[#0D2235]">
          <div className="text-[9px] text-[#5E6872] font-mono">
            AISC 360-22 LRFD // SECCIÓN CAPÍTULO E, D & H
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 bg-[#081320] border border-[#11263B] text-[#8A949D] hover:text-white rounded text-xs font-orbitron"
            >
              CERRAR
            </button>

            {plan.recommendations.length > 0 && (
              <button
                type="button"
                onClick={() => onApplyAllRecommendations(plan.recommendations)}
                className="px-4 py-1.5 bg-[#FFD600] hover:bg-[#FFE04D] text-black font-orbitron font-black text-xs rounded flex items-center gap-1.5 shadow-[0_0_15px_rgba(255,214,0,0.4)] transition-all"
              >
                <Zap className="w-3.5 h-3.5" />
                APLICAR TODAS LAS MEJORAS
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
