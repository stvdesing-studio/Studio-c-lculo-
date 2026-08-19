/**
 * STV CLOSER SYSTEM — STV INSPECTOR AUDIT MODAL
 * 8-Point Structural Engineering Rigor Audit & Load Path Traceability Chain.
 */

import React from 'react';
import { SynthesisResult } from '../engine/STV_MotorSintesis';
import { X, ShieldCheck, AlertTriangle, CheckCircle, HelpCircle, FileText, ArrowRight } from 'lucide-react';

interface STVAuditModalProps {
  isOpen: boolean;
  onClose: () => void;
  synthesis: SynthesisResult;
  onOpenDossier: () => void;
}

export const STVAuditModal: React.FC<STVAuditModalProps> = ({
  isOpen,
  onClose,
  synthesis,
  onOpenDossier
}) => {
  if (!isOpen) return null;

  const { auditReport, loadPaths, columns, connectionChecks } = synthesis;
  const isPass = auditReport.overallStatus === 'PASS';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 select-none">
      <div className="w-full max-w-4xl max-h-[90vh] glass-panel-tech p-6 border border-[#00E6DE] shadow-[0_0_40px_rgba(0,230,222,0.25)] flex flex-col font-orbitron text-[#F2F7F7]">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-[#006F73] pb-4 mb-4">
          <div className="flex items-center gap-3">
            <div className={`p-2 border ${isPass ? 'bg-[#39E58C]/15 border-[#39E58C] text-[#39E58C]' : 'bg-[#FF4D5A]/15 border-[#FF4D5A] text-[#FF4D5A]'}`}>
              <ShieldCheck size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-black tracking-wider text-[#8CFFFF]">STV INSPECTOR — AUDITORÍA ESTRUCTURAL</h2>
                <span className={`text-[10px] font-bold px-2 py-0.5 border ${
                  isPass ? 'bg-[#39E58C]/20 border-[#39E58C] text-[#39E58C]' : 'bg-[#FF4D5A]/20 border-[#FF4D5A] text-[#FF4D5A]'
                }`}>
                  {auditReport.overallStatus}
                </span>
              </div>
              <p className="font-mono-tech text-xs text-[#849492] mt-0.5">
                Evaluación determinista bajo AISC 360-16 / 22 · ASCE 7-16 · ACI 318-19 · AWS D1.1
              </p>
            </div>
          </div>

          <button onClick={onClose} className="text-[#849492] hover:text-[#00E6DE] p-1 font-mono-tech">
            <X size={20} />
          </button>
        </div>

        {/* Audit Content Body */}
        <div className="flex-1 overflow-y-auto space-y-6 pr-2">
          {/* Summary Box */}
          <div className={`p-3.5 border font-mono-tech text-xs ${
            isPass ? 'bg-[#39E58C]/10 border-[#39E58C]/40 text-[#39E58C]' : 'bg-[#FF4D5A]/10 border-[#FF4D5A]/40 text-[#FF4D5A]'
          }`}>
            <span className="font-bold font-orbitron">[DICTAMEN MAESTRO]:</span> {auditReport.summary}
          </div>

          {/* 8 Golden Audit Questions */}
          <div>
            <h3 className="text-xs font-bold tracking-widest text-[#00E6DE] mb-3 flex items-center gap-2">
              <span>01. LAS 8 PREGUNTAS DE AUDITORÍA STV CLOSER</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {auditReport.questions.map((q, idx) => (
                <div
                  key={idx}
                  className="bg-[#020607]/80 p-3 border border-[#006F73]/40 font-mono-tech text-xs flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <span className="font-bold text-[#F2F7F7]">{q.question}</span>
                      {q.passed ? (
                        <CheckCircle size={15} className="text-[#39E58C] shrink-0 mt-0.5" />
                      ) : (
                        <AlertTriangle size={15} className="text-[#FF4D5A] shrink-0 mt-0.5" />
                      )}
                    </div>
                    <p className="text-[11px] text-[#8CFFFF]">{q.evidence}</p>
                  </div>
                  <div className="mt-2 pt-2 border-t border-white/5 text-[9px] text-[#849492]">
                    {q.details}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Load Path & Reaction Summary */}
          <div>
            <h3 className="text-xs font-bold tracking-widest text-[#D7B52A] mb-3 flex items-center gap-2">
              <span>02. TRAZABILIDAD VECTORIAL & RUTA DE CARGA ({loadPaths.length} RUTAS ACTIVAS)</span>
            </h3>

            <div className="bg-[#020607] p-3 border border-[#006F73]/40 font-mono-tech text-[11px] space-y-2">
              <div className="text-[#849492]">
                SECUENCIA DE TRANSMISIÓN CONTINUA:
              </div>
              <div className="flex flex-wrap items-center gap-1.5 text-[10px] text-[#8CFFFF]">
                <span className="bg-[#041315] px-2 py-1 border border-[#00A8AA]/40">CUBIERTA / LÁMINA</span>
                <ArrowRight size={12} className="text-[#00E6DE]" />
                <span className="bg-[#041315] px-2 py-1 border border-[#00A8AA]/40">CORREAS MONTÉN C</span>
                <ArrowRight size={12} className="text-[#00E6DE]" />
                <span className="bg-[#041315] px-2 py-1 border border-[#00A8AA]/40">CORDONES Y DIAGONALES</span>
                <ArrowRight size={12} className="text-[#00E6DE]" />
                <span className="bg-[#041315] px-2 py-1 border border-[#00A8AA]/40">COLUMNAS HSS / IPR</span>
                <ArrowRight size={12} className="text-[#00E6DE]" />
                <span className="bg-[#041315] px-2 py-1 border border-[#00A8AA]/40">PLACAS BASE & ANCLAS</span>
                <ArrowRight size={12} className="text-[#00E6DE]" />
                <span className="bg-[#041315] px-2 py-1 border border-[#00A8AA]/40">PEDESTALES & ZAPATAS</span>
                <ArrowRight size={12} className="text-[#39E58C]" />
                <span className="bg-[#39E58C]/15 px-2 py-1 border border-[#39E58C] text-[#39E58C]">ESTRATO DE SUELO</span>
              </div>
            </div>
          </div>

          {/* Traceability Chain */}
          <div>
            <h3 className="text-xs font-bold tracking-widest text-[#8CFFFF] mb-2">
              03. CADENA DE INMUTABILIDAD CRIPTOGRÁFICA & SSKC
            </h3>
            <div className="bg-[#020607] p-3 border border-[#006F73]/30 font-mono-tech text-[10px] space-y-1 text-[#849492]">
              {auditReport.traceabilityChain.map((line, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="text-[#00E6DE]">{'>'}</span>
                  <span>{line}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="border-t border-[#006F73] pt-4 mt-4 flex items-center justify-between">
          <div className="font-mono-tech text-[10px] text-[#849492]">
            TIMESTAMP: {auditReport.timestamp}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-1.5 text-xs font-semibold bg-[#020607] text-[#849492] hover:text-[#F2F7F7] border border-[#006F73]/50"
            >
              CERRAR
            </button>
            <button
              onClick={() => {
                onClose();
                onOpenDossier();
              }}
              className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold bg-[#00E6DE] text-black hover:bg-[#8CFFFF] transition-all"
            >
              <FileText size={13} />
              <span>EXPEDIENTE TÉCNICO COMPLETO</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
