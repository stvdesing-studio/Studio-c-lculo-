// ============================================================
// STV CLOSER — TECHNICAL DOSSIER MODAL COMPONENT
// DossierWorkstationModal.tsx
// Comprehensive Structural Calculation Memory, BOM & Export
// ============================================================

import React, { useState } from 'react';
import { DSTProject } from '../../dst/dst.schema';
import { StructuralGraph } from '../../dst/structural-graph';
import {
  X,
  FileText,
  Download,
  Share2,
  CheckCircle2,
  ShieldCheck,
  Cpu,
  Layers,
  Printer,
  FileSpreadsheet
} from 'lucide-react';

export interface DossierWorkstationModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: DSTProject;
  graph: StructuralGraph;
  linearMetersSummary: Map<string, number>;
  totalSteelWeightKg: number;
  onOpenGoogleSheets?: () => void;
}

export const DossierWorkstationModal: React.FC<DossierWorkstationModalProps> = ({
  isOpen,
  onClose,
  project,
  graph,
  linearMetersSummary,
  totalSteelWeightKg,
  onOpenGoogleSheets
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 select-none">
      <div className="w-full max-w-4xl max-h-[88vh] bg-[#05080D] border border-[#00E5FF]/40 flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="p-4 bg-[#020307] border-b border-[#0D1620] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[#00E5FF]/10 border border-[#00E5FF] flex items-center justify-center text-[#00E5FF]">
              <FileText size={18} />
            </div>
            <div>
              <h2 className="text-sm font-orbitron font-black text-[#F2F7F7] tracking-wider">
                MEMORIA TÉCNICA Y DOSSIER ESTRUCTURAL
              </h2>
              <span className="text-[10px] font-mono-tech text-[#8A949D]">
                PROYECTO: {project.name} // REVISIÓN R-0 // AISC 360-16 & RCDF
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-[#8A949D] hover:text-[#00E5FF] transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-[11px] font-mono-tech text-[#8A949D]">
          {/* Section 1: Executive Summary */}
          <div className="p-4 bg-[#080D14] border border-[#0D1620] space-y-3">
            <span className="text-xs font-orbitron font-bold text-[#00E5FF] block border-b border-[#111C27] pb-1">
              1. RESUMEN EJECUTIVO DEL DIGITAL STRUCTURAL TWIN
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
              <div className="p-3 bg-[#0A1119] border border-[#111C27]">
                <div className="text-[9px] text-[#5E6872] font-orbitron">CLARO PRINCIPAL</div>
                <div className="text-base font-bold text-[#F2F7F7] font-orbitron">{project.geometry.width.value} m</div>
              </div>
              <div className="p-3 bg-[#0A1119] border border-[#111C27]">
                <div className="text-[9px] text-[#5E6872] font-orbitron">LONGITUD TOTAL</div>
                <div className="text-base font-bold text-[#F2F7F7] font-orbitron">{project.geometry.length.value} m</div>
              </div>
              <div className="p-3 bg-[#0A1119] border border-[#111C27]">
                <div className="text-[9px] text-[#5E6872] font-orbitron">TOTAL METROS LINEALES</div>
                <div className="text-base font-bold text-[#00E5FF] font-orbitron">
                  {(Array.from(linearMetersSummary.values()) as number[]).reduce((a: number, b: number) => a + b, 0).toFixed(1)} m
                </div>
              </div>
              <div className="p-3 bg-[#0A1119] border border-[#111C27]">
                <div className="text-[9px] text-[#5E6872] font-orbitron">TONELAJE DE ACERO</div>
                <div className="text-base font-bold text-[#39E58C] font-orbitron">
                  {(totalSteelWeightKg / 1000).toFixed(2)} TON
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Bill of Materials (BOM) */}
          <div className="p-4 bg-[#080D14] border border-[#0D1620] space-y-3">
            <span className="text-xs font-orbitron font-bold text-[#4CC9FF] block border-b border-[#111C27] pb-1">
              2. CATÁLOGO DE MATERIALES & DESGLOSE LINEAL (BOM)
            </span>
            <table className="w-full text-left text-[10px] border border-[#111C27]">
              <thead className="bg-[#020307] text-[#00E5FF] font-orbitron">
                <tr>
                  <th className="p-2">PERFIL ESTRUCTURAL</th>
                  <th className="p-2">ESPECIFICACIÓN / ASTM</th>
                  <th className="p-2 text-right">METROS LINEALES</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#111C27]">
                {Array.from(linearMetersSummary.entries()).map(([sec, meters]) => (
                  <tr key={sec} className="hover:bg-[#0A1119]">
                    <td className="p-2 font-bold text-[#F2F7F7]">{sec}</td>
                    <td className="p-2">ASTM A500 Gr. B / A992 Gr. 50</td>
                    <td className="p-2 text-right text-[#00E5FF] font-bold">{(meters as number).toFixed(2)} m</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Section 3: Normative Codes & Standards */}
          <div className="p-4 bg-[#080D14] border border-[#0D1620] space-y-2">
            <span className="text-xs font-orbitron font-bold text-[#39E58C] block border-b border-[#111C27] pb-1">
              3. BASES DE DISEÑO & NORMAS APLICADAS
            </span>
            <ul className="list-disc list-inside space-y-1 text-[#8A949D]">
              <li><strong className="text-[#F2F7F7]">AISC 360-16:</strong> Specification for Structural Steel Buildings (LRFD Method).</li>
              <li><strong className="text-[#F2F7F7]">AWS D1.1:</strong> Structural Welding Code — Steel (Electrode E70XX).</li>
              <li><strong className="text-[#F2F7F7]">ASTM F1554:</strong> Standard Specification for Anchor Bolts, Steel, 36, 55, and 105-ksi.</li>
              <li><strong className="text-[#F2F7F7]">ACI 318-19:</strong> Building Code Requirements for Structural Concrete (f'c = 250 kg/cm²).</li>
            </ul>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-[#020307] border-t border-[#0D1620] flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-[10px] text-[#39E58C] font-orbitron">
            <ShieldCheck size={14} />
            <span>DST CONTRACTS VALIDATED — READY FOR FABRICATION</span>
          </div>
          <div className="flex items-center gap-2">
            {onOpenGoogleSheets && (
              <button
                onClick={() => {
                  onClose();
                  onOpenGoogleSheets();
                }}
                className="px-3 py-2 bg-[#03151E] border border-[#00E5FF] hover:bg-[#00E5FF]/20 text-[#00E5FF] font-orbitron font-bold text-xs flex items-center gap-2 transition-all shadow-[0_0_10px_rgba(0,229,255,0.2)]"
              >
                <FileSpreadsheet size={14} className="text-[#39E58C]" />
                <span>EXPORTAR A GOOGLE SHEETS</span>
              </button>
            )}
            <button
              onClick={() => window.print()}
              className="px-4 py-2 bg-[#00E5FF] hover:bg-[#4CC9FF] text-black font-orbitron font-bold text-xs flex items-center gap-2 transition-all"
            >
              <Printer size={14} />
              <span>IMPRIMIR / EXPORTAR PDF</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
