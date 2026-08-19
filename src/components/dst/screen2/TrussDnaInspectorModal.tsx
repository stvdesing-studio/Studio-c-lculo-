// ============================================================
// STV CLOSER — TRUSS STRUCTURAL DNA INSPECTOR MODAL
// TrussDnaInspectorModal.tsx
// Machine-readable DNA, Mathematical Grammar, and AISC Rules Inspector
// ============================================================

import React from 'react';
import { X, Dna, FileCode, CheckCircle2, Shield, AlertTriangle, Layers, BookOpen } from 'lucide-react';
import { TrussTypologyDefinition, RoofTypologyDefinition } from '../../../dst/truss-typologies';

interface TrussDnaInspectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  truss: TrussTypologyDefinition;
  roof: RoofTypologyDefinition;
}

export const TrussDnaInspectorModal: React.FC<TrussDnaInspectorModalProps> = ({
  isOpen,
  onClose,
  truss,
  roof
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 select-none font-mono-tech">
      <div className="relative w-full max-w-3xl bg-[#030911] border border-[#00E5FF]/50 rounded-lg shadow-[0_0_30px_rgba(0,229,255,0.3)] flex flex-col max-h-[85vh] text-[#F2F7F7] overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#0D2235] bg-[#02050A]">
          <div className="flex items-center gap-2.5">
            <Dna className="w-5 h-5 text-[#FFD600]" />
            <div>
              <div className="font-orbitron font-bold text-sm text-white flex items-center gap-2">
                <span>STRUCTURAL DNA & GRAMMAR INSPECTOR</span>
                <span className="text-[9px] px-1.5 py-0.5 bg-[#00E5FF]/20 text-[#00E5FF] border border-[#00E5FF]/40 rounded">
                  {truss.id} : {truss.code}
                </span>
              </div>
              <div className="text-[10px] text-[#8A949D]">
                Ontología formal de instanciación topológica y validación paramétrica
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-[#8A949D] hover:text-white hover:bg-[#0D2235] rounded transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 overflow-y-auto space-y-4 text-xs">
          {/* 1. STRUCTURAL DNA RECORD (JSON FORMAT) */}
          <div className="bg-[#02050A] border border-[#00E5FF]/30 rounded p-3">
            <div className="flex items-center justify-between text-[#00E5FF] font-orbitron font-bold text-[11px] mb-2">
              <span className="flex items-center gap-1.5">
                <FileCode className="w-4 h-4" />
                MACHINE-READABLE STRUCTURAL DNA
              </span>
              <span className="text-[8px] text-[#FFD600]">JSON ONTOLOGY</span>
            </div>
            <pre className="text-[10px] text-[#A0B0C0] bg-[#010307] p-2.5 rounded border border-[#0D2235] overflow-x-auto">
              {JSON.stringify(
                {
                  id: truss.id,
                  code: truss.code,
                  family: truss.family,
                  dna: truss.dna,
                  supportedSupports: truss.supportedSupports,
                  compatibleRoofs: truss.supportedRoofFamilies
                },
                null,
                2
              )}
            </pre>
          </div>

          {/* 2. PARAMETER SCHEMA TABLE */}
          <div className="bg-[#02050A] border border-[#00E5FF]/30 rounded p-3">
            <div className="text-[#00E5FF] font-orbitron font-bold text-[11px] mb-2 flex items-center gap-1.5">
              <Layers className="w-4 h-4" />
              ESQUEMA FORMAL DE PARÁMETROS ({truss.parameterSchema.length})
            </div>
            <div className="border border-[#0D2235] rounded overflow-hidden">
              <table className="w-full text-left text-[10px]">
                <thead className="bg-[#051829] text-[#00E5FF] font-orbitron">
                  <tr>
                    <th className="p-2">CLAVE</th>
                    <th className="p-2">PARÁMETRO</th>
                    <th className="p-2">ESTADO</th>
                    <th className="p-2">RANGO</th>
                    <th className="p-2">DESCRIPCIÓN</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#0D2235]">
                  {truss.parameterSchema.map((param) => (
                    <tr key={param.key} className="hover:bg-[#030911]">
                      <td className="p-2 font-bold text-[#FFD600]">{param.key}</td>
                      <td className="p-2 text-white">{param.label}</td>
                      <td className="p-2">
                        <span
                          className={`px-1.5 py-0.5 rounded text-[8px] font-orbitron ${
                            param.state === 'LOCKED'
                              ? 'bg-[#FF3366]/20 text-[#FF3366] border border-[#FF3366]'
                              : param.state === 'DERIVED'
                              ? 'bg-[#00E5FF]/20 text-[#00E5FF] border border-[#00E5FF]'
                              : 'bg-[#FFD600]/20 text-[#FFD600] border border-[#FFD600]'
                          }`}
                        >
                          {param.state}
                        </span>
                      </td>
                      <td className="p-2 text-[#8A949D]">
                        {param.min} - {param.max} {param.unit}
                      </td>
                      <td className="p-2 text-[#A0B0C0]">{param.description}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* 3. FABRICATION & AUDIT RULES */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Fabrication Rules */}
            <div className="bg-[#02050A] border border-[#FFD600]/30 rounded p-3">
              <div className="text-[#FFD600] font-orbitron font-bold text-[10px] mb-2 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                REGLAS DE TALLER Y FABRICACIÓN
              </div>
              <ul className="space-y-1.5 text-[9px] text-[#A0B0C0]">
                {truss.fabricationRules.map((rule, idx) => (
                  <li key={idx} className="flex items-start gap-1.5">
                    <span className="text-[#FFD600] font-bold">›</span>
                    <span>{rule}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Audit Rules */}
            <div className="bg-[#02050A] border border-[#00E5FF]/30 rounded p-3">
              <div className="text-[#00E5FF] font-orbitron font-bold text-[10px] mb-2 flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5" />
                CRITERIOS DE AUDITORÍA AISC 360
              </div>
              <ul className="space-y-1.5 text-[9px] text-[#A0B0C0]">
                {truss.auditRules.map((rule, idx) => (
                  <li key={idx} className="flex items-start gap-1.5">
                    <span className="text-[#00E5FF] font-bold">›</span>
                    <span>{rule}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-3 border-t border-[#0D2235] bg-[#02050A] flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-[#00E5FF] hover:bg-white text-black font-orbitron font-bold text-xs rounded transition-all shadow-[0_0_10px_#00E5FF]"
          >
            CERRAR INSPECTOR
          </button>
        </div>
      </div>
    </div>
  );
};
