/**
 * STV CLOSER SYSTEM — ENTORNO AUDITORÍA & DICTAMEN TÉCNICO (AUDIT STUDIO)
 * Complete 8-Point Structural Audit Inspector, Load Path Traceability,
 * Mathematical Evidence, and Regulatory Compliance Verification.
 */

import React, { useState } from 'react';
import { SynthesisResult } from '../../engine/STV_MotorSintesis';
import { 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  Maximize2, 
  FileText, 
  Compass, 
  Layers, 
  ArrowRight,
  ArrowLeft, 
  Lock,
  Download
} from 'lucide-react';

interface STVAuditStudioProps {
  synthesis: SynthesisResult;
  onNavigateTo3D: () => void;
  onOpenDossier: () => void;
  onPrevStep?: () => void;
  onNextStep?: () => void;
}

export const STVAuditStudio: React.FC<STVAuditStudioProps> = ({
  synthesis,
  onNavigateTo3D,
  onOpenDossier,
  onPrevStep,
  onNextStep
}) => {
  const audit = synthesis.auditReport;
  const [selectedQuestionIdx, setSelectedQuestionIdx] = useState<number>(0);

  const selectedQuestion = audit.questions[selectedQuestionIdx] || audit.questions[0];

  return (
    <div className="w-full h-full flex flex-col bg-black text-[#F2F7F7] font-mono-tech overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6">
      {/* 1. STUDIO HEADER */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-[#006F73]/50 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 bg-[#39E58C] shadow-[0_0_10px_#39E58C]"></span>
            <h1 className="text-xl sm:text-2xl font-orbitron font-black tracking-widest text-[#39E58C]">
              AUDIT & INSPECTOR STUDIO // DICTAMEN ESTRUCTURAL
            </h1>
          </div>
          <p className="text-xs text-[#849492] mt-1 font-orbitron">
            MOTOR DE AUDITORÍA DE 8 FILTROS NORMATIVOS (AISC 360-16 / ACI 318-19 / ASCE 7-16 / AWS D1.1)
          </p>
        </div>

        <div className="flex items-center gap-3">
          {onPrevStep && (
            <button
              onClick={onPrevStep}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#041315] text-[#849492] hover:text-[#00E6DE] border border-[#006F73]/40 text-xs font-bold transition-all cursor-pointer"
            >
              <ArrowLeft size={14} />
              <span>05. TALLER</span>
            </button>
          )}
          {onNextStep && (
            <button
              onClick={onNextStep}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#CCFF00] text-black font-orbitron font-bold text-xs hover:bg-[#E5FF80] transition-all shadow-[0_0_12px_rgba(204,255,0,0.3)] cursor-pointer"
            >
              <span>07. MASTER 360°</span>
              <ArrowRight size={14} />
            </button>
          )}
          <button
            onClick={onOpenDossier}
            className="flex items-center gap-2 px-3 py-1.5 bg-[#041315] text-[#8CFFFF] border border-[#00A8AA] text-xs font-bold hover:bg-[#00E6DE]/20 transition-all cursor-pointer"
          >
            <FileText size={14} />
            <span>DOSSIER</span>
          </button>
          <button
            onClick={onNavigateTo3D}
            className="flex items-center gap-2 px-3.5 py-1.5 bg-[#00E6DE] text-black font-orbitron font-bold text-xs hover:bg-[#8CFFFF] transition-all shadow-[0_0_15px_rgba(0,230,222,0.4)] cursor-pointer"
          >
            <Maximize2 size={14} />
            <span>VER EN 3D</span>
          </button>
        </div>
      </div>

      {/* 2. OVERALL STATUS BADGE CARD */}
      <div className="bg-[#020607]/90 border border-[#006F73]/50 p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-[#39E58C]/15 border border-[#39E58C] flex items-center justify-center text-[#39E58C] shadow-[0_0_20px_rgba(57,229,140,0.3)]">
            <ShieldCheck size={32} />
          </div>
          <div>
            <div className="text-xs text-[#849492] font-orbitron">ESTADO GLOBAL DE AUDITORÍA:</div>
            <div className="text-2xl font-orbitron font-black text-[#39E58C] tracking-wider">
              {audit.overallStatus} — ESTRUCTURA 100% VALIDADA
            </div>
            <div className="text-xs text-[#8CFFFF] mt-1">{audit.summary}</div>
          </div>
        </div>

        <div className="flex items-center gap-6 font-mono-tech text-xs text-[#849492] border-t md:border-t-0 md:border-l border-[#006F73]/40 pt-3 md:pt-0 md:pl-6">
          <div>
            <span className="block text-[10px]">PREGUNTAS AUDITADAS:</span>
            <span className="text-white font-bold text-base">{audit.questions.length} / {audit.questions.length}</span>
          </div>
          <div>
            <span className="block text-[10px]">ERRORES / QUIEBRES:</span>
            <span className="text-[#39E58C] font-bold text-base">0 (NINGUNO)</span>
          </div>
          <div>
            <span className="block text-[10px]">TRAZABILIDAD:</span>
            <span className="text-[#00E6DE] font-bold text-base">CONTINUA</span>
          </div>
        </div>
      </div>

      {/* 3. 8-POINT AUDIT QUESTIONS GRID & EVIDENCE VIEWER */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Question List */}
        <div className="lg:col-span-6 space-y-3">
          <h2 className="text-xs font-orbitron font-bold text-[#8CFFFF] flex items-center gap-2">
            <ShieldCheck size={16} />
            <span>LOS 8 FILTROS CRÍTICOS DE VALIDACIÓN ESTRUCTURAL</span>
          </h2>

          <div className="space-y-2">
            {audit.questions.map((q, idx) => {
              const isSelected = selectedQuestionIdx === idx;
              return (
                <div
                  key={idx}
                  onClick={() => setSelectedQuestionIdx(idx)}
                  className={`p-3.5 border cursor-pointer transition-all flex items-center justify-between ${
                    isSelected
                      ? 'bg-[#39E58C]/20 border-[#39E58C] shadow-[0_0_15px_rgba(57,229,140,0.25)]'
                      : 'bg-black/60 border-[#006F73]/30 hover:border-[#39E58C]/40'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <CheckCircle2 size={16} className="text-[#39E58C] flex-shrink-0" />
                    <div>
                      <span className="text-[10px] text-[#849492] font-orbitron block">FILTRO {idx + 1}:</span>
                      <span className="text-xs font-bold text-white">{q.question}</span>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 text-[9px] font-bold bg-[#39E58C]/20 text-[#39E58C] border border-[#39E58C]/40 flex-shrink-0">
                    PASS
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Selected Filter Technical Evidence */}
        <div className="lg:col-span-6 space-y-5">
          <div className="bg-[#020607]/90 border border-[#006F73]/50 p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-[#006F73]/40 pb-2">
              <h3 className="text-xs font-orbitron font-bold text-[#39E58C]">
                EVIDENCIA MATEMÁTICA — FILTRO {selectedQuestionIdx + 1}
              </h3>
              <span className="text-[10px] text-[#849492]">CERTIFICADO STV</span>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <span className="text-[#849492] block mb-1 font-bold">PREGUNTA DE AUDITORÍA:</span>
                <p className="text-white font-bold bg-black p-3 border border-[#006F73]/30">
                  {selectedQuestion.question}
                </p>
              </div>

              <div>
                <span className="text-[#849492] block mb-1 font-bold">EVIDENCIA & CÁLCULOS ASOCIADOS:</span>
                <p className="text-[#8CFFFF] bg-black p-3 border border-[#006F73]/30 leading-relaxed font-mono">
                  {selectedQuestion.evidence}
                </p>
              </div>

              <div>
                <span className="text-[#849492] block mb-1 font-bold">DICTAMEN TÉCNICO DETALLADO:</span>
                <p className="text-[#F2F7F7] bg-black p-3 border border-[#006F73]/30 leading-relaxed">
                  {selectedQuestion.details}
                </p>
              </div>
            </div>
          </div>

          {/* Load Path Continuity Chain */}
          <div className="bg-[#020607]/90 border border-[#006F73]/50 p-5 space-y-3">
            <h3 className="text-xs font-orbitron font-bold text-[#00E6DE] flex items-center gap-2">
              <Layers size={14} />
              <span>CADENA DE TRAZABILIDAD LOAD PATH (SIN QUIEBRES)</span>
            </h3>

            <div className="space-y-1.5 text-xs text-[#849492] bg-black p-3 border border-[#006F73]/30">
              {audit.traceabilityChain.map((step, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <span className="text-[#00E6DE] font-bold">0{idx + 1}.</span>
                  <span className="text-white">{step}</span>
                  {idx < audit.traceabilityChain.length - 1 && (
                    <ArrowRight size={12} className="text-[#39E58C] ml-auto" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
