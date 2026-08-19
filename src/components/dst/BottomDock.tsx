// ============================================================
// STV CLOSER — BOTTOM WORKSTATION DOCK COMPONENT
// BottomDock.tsx
// Graph Topology, Parametric Engine, Fabrication Cut-List & Audit Hub
// ============================================================

import React, { useState, useMemo } from 'react';
import { DSTProject, TrussType, ID } from '../../dst/dst.schema';
import { StructuralGraph } from '../../dst/structural-graph';
import {
  Sliders,
  Layers,
  Wrench,
  ShieldCheck,
  ChevronUp,
  ChevronDown,
  Table,
  CheckCircle2,
  AlertTriangle,
  AlertOctagon,
  FileSpreadsheet,
  Activity,
  Sparkles,
  Info
} from 'lucide-react';
import { checkMemberCapacity } from '../../dst/design-engine';
import { AuditSummary } from './AuditSummary';

export interface BottomDockProps {
  project: DSTProject;
  graph: StructuralGraph;
  linearMetersSummary: Map<string, number>;
  totalSteelWeightKg: number;
  onUpdateParams: (params: {
    spanM?: number;
    lengthM?: number;
    heightM?: number;
    roofRiseM?: number;
    trussType?: TrussType;
    columnInclinationDeg?: number;
  }) => void;
  selectedElementId: string | null;
  onSelectElement: (id: string | null, type: 'MEMBER' | 'NODE' | 'FOUNDATION' | 'CONNECTION') => void;
}

export const BottomDock: React.FC<BottomDockProps> = ({
  project,
  graph,
  linearMetersSummary,
  totalSteelWeightKg,
  onUpdateParams,
  selectedElementId,
  onSelectElement
}) => {
  const [isOpen, setIsOpen] = useState(true);
  const [activeTab, setActiveTab] = useState<'PARAMETRIC' | 'GRAPH' | 'FABRICATION' | 'AUDIT'>('PARAMETRIC');

  const spanM = project.geometry.width.value;
  const lengthM = project.geometry.length.value;
  const heightM = project.geometry.height.value;
  const currentTrussType = project.roof?.trusses?.[0]?.type || 'WARREN';
  const columnList = project.columns || project.structuralSystem?.columns?.columns || [];
  const colInclination = columnList[0]?.inclination ?? 0;

  // ============================================================
  // STRUCTURAL AUDIT SUMMARY CALCULATION
  // Counts components marked as REVIEW_REQUIRED or INVALID_CONFIGURATION
  // ============================================================
  const auditSummary = useMemo(() => {
    const reviewRequiredElements = new Set<ID>();
    const invalidConfigElements = new Set<ID>();

    // 1. Traverse project.audit.messages
    if (project.audit?.messages) {
      for (const msg of project.audit.messages) {
        if (msg.severity === 'WARNING' || msg.code.includes('REVIEW') || msg.code.includes('SLENDERNESS') || msg.code.includes('L360')) {
          if (msg.elementIds) {
            msg.elementIds.forEach((id) => reviewRequiredElements.add(id));
          }
        }
        if (msg.severity === 'ERROR' || msg.code.includes('INVALID') || msg.code.includes('OVERLOAD') || msg.code.includes('FAILED')) {
          if (msg.elementIds) {
            msg.elementIds.forEach((id) => invalidConfigElements.add(id));
          }
        }
      }
    }

    // 2. Member level capacity & slenderness verification
    for (const member of project.members) {
      const lenM = member.geometry?.length?.value ?? 3.0;
      const forces = {
        memberId: member.id,
        Pu_kN: member.role === 'COLUMN' ? -120 : member.role.includes('CHORD') ? 60 : -25
      };

      try {
        const check = checkMemberCapacity(member, forces, lenM);
        if (check.status === 'WARNING' || check.status === 'SERVICEABILITY_FAILED') {
          reviewRequiredElements.add(member.id);
        } else if (check.status === 'OVERLOAD' || check.status === 'DATA_REQUIRED') {
          invalidConfigElements.add(member.id);
        }
      } catch {
        // Fallback for custom sections
      }
    }

    const reviewCount = reviewRequiredElements.size;
    const invalidCount = invalidConfigElements.size;
    const totalFlagged = reviewCount + invalidCount;
    const totalComponents = project.members.length + (project.connections?.length || 0) + (project.foundations?.length || 0);
    const healthPercentage = totalComponents > 0
      ? Math.max(0, Math.min(100, Math.round(((totalComponents - totalFlagged) / totalComponents) * 100)))
      : 100;

    return {
      reviewCount,
      invalidCount,
      totalFlagged,
      totalComponents,
      healthPercentage,
      reviewElements: Array.from(reviewRequiredElements),
      invalidElements: Array.from(invalidConfigElements)
    };
  }, [project]);

  return (
    <div className="w-full bg-[#05080D] border-t border-[#0D1620] z-30 select-none flex flex-col transition-all">
      {/* 1. DOCK TAB BAR & SUMMARY WIDGET */}
      <div className="h-10 px-4 bg-[#020307] border-b border-[#0D1620] flex items-center justify-between gap-3">
        {/* Left: Tab Selectors */}
        <div className="flex items-center gap-1 overflow-x-auto custom-scrollbar">
          <button
            id="btn-dock-tab-parametric"
            onClick={() => { setActiveTab('PARAMETRIC'); setIsOpen(true); }}
            className={`px-3 py-1.5 text-[10px] font-orbitron tracking-wider flex items-center gap-1.5 transition-all rounded-sm ${
              isOpen && activeTab === 'PARAMETRIC'
                ? 'bg-[#00E5FF] text-black font-bold'
                : 'text-[#8A949D] hover:text-[#F2F7F7] hover:bg-[#0D1620]'
            }`}
          >
            <Sliders size={12} />
            <span>PARAMÉTRICO</span>
          </button>
          <button
            id="btn-dock-tab-graph"
            onClick={() => { setActiveTab('GRAPH'); setIsOpen(true); }}
            className={`px-3 py-1.5 text-[10px] font-orbitron tracking-wider flex items-center gap-1.5 transition-all rounded-sm ${
              isOpen && activeTab === 'GRAPH'
                ? 'bg-[#00E5FF] text-black font-bold'
                : 'text-[#8A949D] hover:text-[#F2F7F7] hover:bg-[#0D1620]'
            }`}
          >
            <Layers size={12} />
            <span>STRUCTURAL GRAPH</span>
          </button>
          <button
            id="btn-dock-tab-fabrication"
            onClick={() => { setActiveTab('FABRICATION'); setIsOpen(true); }}
            className={`px-3 py-1.5 text-[10px] font-orbitron tracking-wider flex items-center gap-1.5 transition-all rounded-sm ${
              isOpen && activeTab === 'FABRICATION'
                ? 'bg-[#00E5FF] text-black font-bold'
                : 'text-[#8A949D] hover:text-[#F2F7F7] hover:bg-[#0D1620]'
            }`}
          >
            <Wrench size={12} />
            <span>TALLER ({project.members.length})</span>
          </button>
          <button
            id="btn-dock-tab-audit"
            onClick={() => { setActiveTab('AUDIT'); setIsOpen(true); }}
            className={`px-3 py-1.5 text-[10px] font-orbitron tracking-wider flex items-center gap-1.5 transition-all rounded-sm ${
              isOpen && activeTab === 'AUDIT'
                ? 'bg-[#39E58C] text-black font-bold'
                : 'text-[#8A949D] hover:text-[#F2F7F7] hover:bg-[#0D1620]'
            }`}
          >
            <ShieldCheck size={12} />
            <span>AUDITORÍA AISC</span>
          </button>
        </div>

        {/* Right: Structural Audit Summary Widget & Collapse Toggle */}
        <div className="flex items-center gap-2">
          {/* STRUCTURAL AUDIT SUMMARY WIDGET */}
          <div
            id="widget-structural-audit-summary"
            onClick={() => {
              setActiveTab('AUDIT');
              setIsOpen(true);
            }}
            className={`px-2.5 py-1 rounded border flex items-center gap-2 cursor-pointer transition-all ${
              auditSummary.invalidCount > 0
                ? 'bg-[#FF3B30]/15 border-[#FF3B30] text-[#FF3B30] hover:bg-[#FF3B30]/25 shadow-[0_0_10px_rgba(255,59,48,0.25)]'
                : auditSummary.reviewCount > 0
                ? 'bg-[#FFD700]/15 border-[#FFD700]/70 text-[#FFD700] hover:bg-[#FFD700]/25 shadow-[0_0_10px_rgba(255,215,0,0.2)]'
                : 'bg-[#39E58C]/10 border-[#39E58C]/50 text-[#39E58C] hover:bg-[#39E58C]/20 shadow-[0_0_8px_rgba(57,229,140,0.15)]'
            }`}
            title="Resumen de Auditoría Estructural (Clic para ver detalles)"
          >
            <div className="flex items-center gap-1.5">
              {auditSummary.invalidCount > 0 ? (
                <AlertOctagon size={13} className="animate-pulse text-[#FF3B30]" />
              ) : auditSummary.reviewCount > 0 ? (
                <AlertTriangle size={13} className="text-[#FFD700]" />
              ) : (
                <CheckCircle2 size={13} className="text-[#39E58C]" />
              )}
              <span className="text-[9px] font-orbitron font-bold tracking-wider uppercase">
                AUDITORÍA
              </span>
            </div>

            <div className="h-3 w-px bg-current opacity-30" />

            <div className="flex items-center gap-1.5 text-[8.5px] font-mono-tech">
              {auditSummary.invalidCount > 0 && (
                <span className="px-1.5 py-0.2 bg-[#FF3B30] text-white rounded font-bold">
                  {auditSummary.invalidCount} INVÁLIDOS
                </span>
              )}
              {auditSummary.reviewCount > 0 && (
                <span className="px-1.5 py-0.2 bg-[#FFD700] text-black rounded font-bold">
                  {auditSummary.reviewCount} REVISIÓN
                </span>
              )}
              {auditSummary.totalFlagged === 0 && (
                <span className="text-[#39E58C] font-bold">
                  100% CONFORME
                </span>
              )}
            </div>
          </div>

          {/* Collapse/Expand button */}
          <button
            id="btn-toggle-bottom-dock"
            onClick={() => setIsOpen(!isOpen)}
            className="p-1 text-[#8A949D] hover:text-[#00E5FF] transition-colors rounded hover:bg-[#0D1620]"
            title={isOpen ? 'Minimizar dock' : 'Expandir dock'}
          >
            {isOpen ? <ChevronDown size={15} /> : <ChevronUp size={15} />}
          </button>
        </div>
      </div>

      {/* 2. DOCK CONTENT AREA (COLLAPSIBLE) */}
      {isOpen && (
        <div className="h-44 overflow-y-auto p-3 bg-[#05080D]">
          {/* TAB 1: PARAMETRIC CONTROLS */}
          {activeTab === 'PARAMETRIC' && (
            <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-6 gap-3 text-[10px] font-mono-tech">
              {/* Span Control */}
              <div className="p-2 bg-[#080D14] border border-[#0D1620] space-y-1">
                <div className="flex justify-between text-[#8A949D]">
                  <span className="font-orbitron text-[#00E5FF]">CLARO (SPAN)</span>
                  <span className="text-[#F2F7F7] font-bold">{spanM.toFixed(1)} m</span>
                </div>
                <input
                  type="range"
                  min={8}
                  max={28}
                  step={0.5}
                  value={spanM}
                  onChange={(e) => onUpdateParams({ spanM: parseFloat(e.target.value) })}
                  className="w-full accent-[#00E5FF] cursor-pointer"
                />
              </div>

              {/* Length Control */}
              <div className="p-2 bg-[#080D14] border border-[#0D1620] space-y-1">
                <div className="flex justify-between text-[#8A949D]">
                  <span className="font-orbitron text-[#00E5FF]">LONGITUD</span>
                  <span className="text-[#F2F7F7] font-bold">{lengthM.toFixed(1)} m</span>
                </div>
                <input
                  type="range"
                  min={12}
                  max={48}
                  step={2}
                  value={lengthM}
                  onChange={(e) => onUpdateParams({ lengthM: parseFloat(e.target.value) })}
                  className="w-full accent-[#00E5FF] cursor-pointer"
                />
              </div>

              {/* Height Control */}
              <div className="p-2 bg-[#080D14] border border-[#0D1620] space-y-1">
                <div className="flex justify-between text-[#8A949D]">
                  <span className="font-orbitron text-[#00E5FF]">ALTURA ALERO</span>
                  <span className="text-[#F2F7F7] font-bold">{heightM.toFixed(1)} m</span>
                </div>
                <input
                  type="range"
                  min={4}
                  max={10}
                  step={0.25}
                  value={heightM}
                  onChange={(e) => onUpdateParams({ heightM: parseFloat(e.target.value) })}
                  className="w-full accent-[#00E5FF] cursor-pointer"
                />
              </div>

              {/* Truss Rise Control */}
              <div className="p-2 bg-[#080D14] border border-[#0D1620] space-y-1">
                <div className="flex justify-between text-[#8A949D]">
                  <span className="font-orbitron text-[#00E5FF]">FLECHA CERCHA</span>
                  <span className="text-[#F2F7F7] font-bold">{project.roof?.trusses?.[0]?.rise?.value || 1.8} m</span>
                </div>
                <input
                  type="range"
                  min={0.8}
                  max={4.0}
                  step={0.1}
                  value={project.roof?.trusses?.[0]?.rise?.value || 1.8}
                  onChange={(e) => onUpdateParams({ roofRiseM: parseFloat(e.target.value) })}
                  className="w-full accent-[#00E5FF] cursor-pointer"
                />
              </div>

              {/* Truss Typology Selector */}
              <div className="p-2 bg-[#080D14] border border-[#0D1620] space-y-1">
                <span className="font-orbitron text-[#00E5FF] block">TIPOLOGÍA CERCHA</span>
                <select
                  value={currentTrussType}
                  onChange={(e) => onUpdateParams({ trussType: e.target.value as TrussType })}
                  className="w-full bg-[#0A1119] border border-[#111C27] text-[#F2F7F7] text-[10px] font-orbitron p-1 outline-none"
                >
                  <option value="WARREN">WARREN (STANDARD)</option>
                  <option value="PRATT">PRATT (TENSION WEBS)</option>
                  <option value="HOWE">HOWE (COMPRESSION WEBS)</option>
                  <option value="FINK">FINK (GABLE STEEP)</option>
                  <option value="CUSTOM">CUSTOM CLOSER</option>
                </select>
              </div>

              {/* Column Inclination */}
              <div className="p-2 bg-[#080D14] border border-[#0D1620] space-y-1">
                <div className="flex justify-between text-[#8A949D]">
                  <span className="font-orbitron text-[#00E5FF]">INCLINACIÓN COL</span>
                  <span className="text-[#F2F7F7] font-bold">{colInclination}°</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={15}
                  step={1}
                  value={colInclination}
                  onChange={(e) => onUpdateParams({ columnInclinationDeg: parseFloat(e.target.value) })}
                  className="w-full accent-[#00E5FF] cursor-pointer"
                />
              </div>
            </div>
          )}

          {/* TAB 2: STRUCTURAL GRAPH BREAKDOWN */}
          {activeTab === 'GRAPH' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-[10px] font-mono-tech">
              {/* Linear Meters Summary */}
              <div className="p-2.5 bg-[#080D14] border border-[#0D1620]">
                <span className="text-[10px] font-orbitron text-[#00E5FF] block border-b border-[#111C27] pb-1 mb-2">
                  METROS LINEALES POR PERFIL
                </span>
                <div className="space-y-1">
                  {Array.from(linearMetersSummary.entries()).map(([sectionKey, meters]) => (
                    <div key={sectionKey} className="flex justify-between text-[#8A949D]">
                      <span>{sectionKey}:</span>
                      <span className="text-[#F2F7F7] font-bold">{meters.toFixed(2)} m</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Graph Validation */}
              <div className="p-2.5 bg-[#080D14] border border-[#0D1620]">
                <span className="text-[10px] font-orbitron text-[#39E58C] block border-b border-[#111C27] pb-1 mb-2">
                  ESTADO DE INTEGRIDAD TOPOLÓGICA
                </span>
                <div className="space-y-1 text-[#8A949D]">
                  <div className="flex justify-between">
                    <span>TOTAL NODOS CONECTADOS:</span>
                    <span className="text-[#00E5FF] font-bold">{graph.nodes.size}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>TOTAL MIEMBROS ESTRUCTURALES:</span>
                    <span className="text-[#00E5FF] font-bold">{graph.members.size}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>PESO TOTAL ESTIMADO:</span>
                    <span className="text-[#39E58C] font-bold">{(totalSteelWeightKg / 1000).toFixed(2)} TON</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: FABRICATION CUT-LIST */}
          {activeTab === 'FABRICATION' && (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-[10px] font-mono-tech border border-[#0D1620]">
                <thead className="bg-[#080D14] text-[#00E5FF] font-orbitron border-b border-[#0D1620]">
                  <tr>
                    <th className="p-1.5">MARCA</th>
                    <th className="p-1.5">ROL</th>
                    <th className="p-1.5">PERFIL</th>
                    <th className="p-1.5">LONGITUD (m)</th>
                    <th className="p-1.5">CORTE INI/FIN</th>
                    <th className="p-1.5">SOLDADURA</th>
                    <th className="p-1.5">GRUPO</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#0D1620] text-[#8A949D]">
                  {project.members.slice(0, 30).map((m) => {
                    const isSelected = selectedElementId === m.id;
                    return (
                      <tr
                        key={m.id}
                        onClick={() => onSelectElement(m.id, 'MEMBER')}
                        className={`hover:bg-[#0D1620] cursor-pointer transition-colors ${
                          isSelected ? 'bg-[#00E5FF]/20 text-[#F2F7F7]' : ''
                        }`}
                      >
                        <td className="p-1.5 font-bold text-[#00E5FF]">{m.id}</td>
                        <td className="p-1.5">{m.role}</td>
                        <td className="p-1.5 text-[#F2F7F7]">{m.section.designation}</td>
                        <td className="p-1.5 text-[#39E58C] font-bold">{m.geometry.length.value.toFixed(3)}</td>
                        <td className="p-1.5">{m.geometry.cutAngleStart}° / {m.geometry.cutAngleEnd}°</td>
                        <td className="p-1.5">{m.fabrication?.weldLength.value} m</td>
                        <td className="p-1.5 text-[#5E6872]">{m.fabrication?.assemblyGroup}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* TAB 4: AUDIT REPORT & SUMMARY BREAKDOWN */}
          {activeTab === 'AUDIT' && (
            <div className="space-y-3">
              {/* Comprehensive Digital Twin Audit Health Dashboard Component */}
              <AuditSummary
                project={project}
                graph={graph}
                onSelectMember={(id) => onSelectElement(id, 'MEMBER')}
                selectedMemberId={selectedElementId}
              />

              {/* Audit Messages List */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[9px] font-orbitron text-[#8A949D] px-1">
                  <span>REGISTRO DE MENSAJES DE AUDITORÍA ({project.audit.messages.length})</span>
                  <span className="text-[#00E5FF]">CÓDIGO AISC / ASCE</span>
                </div>
                {project.audit.messages.map((msg, i) => (
                  <div
                    key={i}
                    className={`p-2 border flex items-center justify-between gap-2 text-[10px] font-mono-tech ${
                      msg.severity === 'ERROR'
                        ? 'bg-[#EF4444]/10 border-[#EF4444] text-[#EF4444]'
                        : msg.severity === 'WARNING'
                        ? 'bg-[#F59E0B]/10 border-[#F59E0B] text-[#F59E0B]'
                        : 'bg-[#080D14] border-[#0D1620] text-[#8A949D]'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-orbitron font-bold text-[#00E5FF]">[{msg.code}]</span>
                      <span>{msg.message}</span>
                    </div>
                    {msg.elementIds && msg.elementIds.length > 0 && (
                      <div className="flex gap-1 shrink-0">
                        {msg.elementIds.map((eid) => (
                          <button
                            key={eid}
                            onClick={() => onSelectElement(eid, 'MEMBER')}
                            className="px-1.5 py-0.2 bg-black/40 hover:bg-[#00E5FF] hover:text-black text-[8px] font-bold rounded border border-current transition-colors"
                          >
                            VER {eid}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

