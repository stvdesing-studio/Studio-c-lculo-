// ============================================================
// STV CLOSER — STRUCTURAL NAVIGATOR COMPONENT (LIVING HUB)
// StructuralNavigator.tsx
// Dynamic Tree Hierarchy, Real-Time Catalog Telemetry & Living Hub Card
// ============================================================

import React, { useState, useMemo } from 'react';
import { DSTProject, StructuralMember, StructuralNode, FoundationElement } from '../../dst/dst.schema';
import {
  getMaterialCatalogItem,
  MaterialRecord,
  getAllMaterialCatalogItems
} from '../../dst/material-catalog';
import {
  Layers,
  ChevronRight,
  ChevronDown,
  Search,
  Box,
  Cpu,
  ShieldCheck,
  Zap,
  Tag,
  DollarSign,
  Activity,
  Copy,
  Check,
  Filter,
  Eye,
  Crosshair,
  Maximize2
} from 'lucide-react';

export interface StructuralNavigatorProps {
  project: DSTProject;
  selectedElementId: string | null;
  onSelectElement: (id: string | null, type: 'MEMBER' | 'NODE' | 'FOUNDATION' | 'CONNECTION') => void;
}

type MaterialFilterCategory = 'ALL' | 'HSS' | 'PTR' | 'MONTEN' | 'IPR' | 'FOUNDATION' | 'CONNECTION';

export const StructuralNavigator: React.FC<StructuralNavigatorProps> = ({
  project,
  selectedElementId,
  onSelectElement
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [materialFilter, setMaterialFilter] = useState<MaterialFilterCategory>('ALL');
  const [copiedSku, setCopiedSku] = useState<string | null>(null);

  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    COLUMNS: true,
    ROOF: true,
    PURLINS: false,
    FOUNDATIONS: false,
    CONNECTIONS: false
  });

  const toggleSection = (key: string) => {
    setExpandedSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // Group elements
  const columns = useMemo(() => project.members.filter((m) => m.role === 'COLUMN'), [project.members]);
  const trussMembers = useMemo(
    () => project.members.filter((m) => m.role === 'TOP_CHORD' || m.role === 'BOTTOM_CHORD' || m.role === 'DIAGONAL' || m.role === 'VERTICAL'),
    [project.members]
  );
  const purlins = useMemo(() => project.members.filter((m) => m.role === 'PURLIN'), [project.members]);
  const foundations = useMemo(() => project.foundation?.elements || [], [project.foundation]);
  const connections = useMemo(() => project.connections || [], [project.connections]);

  // Global Living Telemetry Calculations
  const telemetry = useMemo(() => {
    let totalWeightKg = 0;
    let totalLengthM = 0;
    let totalCostMxn = 0;
    let compactCount = 0;

    project.members.forEach((m) => {
      const catId = m.catalogItemId || m.section?.catalogItemId || (m.role === 'COLUMN' ? 'prod-mx-hss-6x4-14' : m.role === 'PURLIN' ? 'prod-mx-monten-c-6x2-cal14' : 'prod-mx-ptr-4x4-cal11');
      const record = getMaterialCatalogItem(catId);
      const length = m.geometry?.length?.value || 1;
      const weight = (record.geometriaSeccion?.pesoLineal_kg_m || 10) * length;
      totalWeightKg += weight;
      totalLengthM += length;

      // Estimated cost per piece
      const unitPrice = record.metadatos?.precioUnitarioEstimadoMXN || 1000;
      if (record.metadatos?.unidadVenta === 'TRAMO_12M') {
        totalCostMxn += (length / 12) * unitPrice;
      } else if (record.metadatos?.unidadVenta === 'TRAMO_6M') {
        totalCostMxn += (length / 6) * unitPrice;
      } else if (record.metadatos?.unidadVenta === 'KG') {
        totalCostMxn += weight * unitPrice;
      } else {
        totalCostMxn += (length / 6) * unitPrice;
      }

      if (record.estabilidadYEsbeltez?.clasificacionSeccionAISC === 'COMPACTA') {
        compactCount++;
      }
    });

    const compactRatio = project.members.length > 0 ? Math.round((compactCount / project.members.length) * 100) : 100;

    return {
      totalWeightKg: Math.round(totalWeightKg),
      totalLengthM: Math.round(totalLengthM * 10) / 10,
      totalCostMxn: Math.round(totalCostMxn),
      compactRatio
    };
  }, [project.members]);

  // Helper to check filter matching
  const matchesFilter = (catalogItemId?: string, designation?: string, role?: string) => {
    if (materialFilter === 'ALL') return true;
    const catId = (catalogItemId || '').toLowerCase();
    const des = (designation || '').toLowerCase();
    const r = (role || '').toLowerCase();

    if (materialFilter === 'HSS') return catId.includes('hss') || des.includes('hss');
    if (materialFilter === 'PTR') return catId.includes('ptr') || des.includes('ptr');
    if (materialFilter === 'MONTEN') return catId.includes('monten') || des.includes('monten') || des.includes(' c ') || r.includes('purlin');
    if (materialFilter === 'IPR') return catId.includes('ipr') || des.includes('ipr') || des.includes('w');
    if (materialFilter === 'FOUNDATION') return r.includes('foundation') || catId.includes('pedestal') || catId.includes('placa');
    if (materialFilter === 'CONNECTION') return r.includes('connection') || catId.includes('anclaje') || catId.includes('perno');
    return true;
  };

  const matchesSearch = (text: string) => {
    if (!searchTerm.trim()) return true;
    return text.toLowerCase().includes(searchTerm.toLowerCase().trim());
  };

  // Find active selected element record for Living Hub inline card
  const selectedMember = project.members.find((m) => m.id === selectedElementId);
  const selectedFoundation = foundations.find((f) => f.id === selectedElementId);

  const activeRecord: MaterialRecord | null = useMemo(() => {
    if (selectedMember) {
      const catId = selectedMember.catalogItemId || selectedMember.section?.catalogItemId || (selectedMember.role === 'COLUMN' ? 'prod-mx-hss-6x4-14' : selectedMember.role === 'PURLIN' ? 'prod-mx-monten-c-6x2-cal14' : 'prod-mx-ptr-4x4-cal11');
      return getMaterialCatalogItem(catId);
    }
    if (selectedFoundation) {
      return getMaterialCatalogItem('prod-mx-pedestal-fpc250');
    }
    return null;
  }, [selectedMember, selectedFoundation]);

  const handleCopySku = (sku: string) => {
    navigator.clipboard.writeText(sku);
    setCopiedSku(sku);
    setTimeout(() => setCopiedSku(null), 2000);
  };

  return (
    <aside className="w-80 h-full bg-[#04070C] border-r border-[#0D1620] flex flex-col z-30 select-none overflow-hidden text-[#8A949D]">
      {/* 1. LIVING HUB HEADER & GLOBAL ROLLUP METRICS */}
      <div className="p-3 border-b border-[#0D1620] flex flex-col gap-2.5 bg-[#020307]">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-orbitron font-bold text-[#F2F7F7] tracking-wider flex items-center gap-1.5">
            <Layers size={13} className="text-[#00E5FF]" />
            ESTRUCTURA & LIVING HUB
          </span>
          <span className="text-[8.5px] font-mono-tech px-1.5 py-0.5 bg-[#00E5FF]/10 text-[#00E5FF] border border-[#00E5FF]/30 font-bold">
            {project.members.length} ELEMENTOS
          </span>
        </div>

        {/* Live Rollup Telemetry Bar */}
        <div className="grid grid-cols-3 gap-1.5 text-center bg-[#070D16] p-1.5 border border-[#0D1E30]">
          <div className="flex flex-col">
            <span className="text-[7.5px] text-[#5E6872] font-orbitron">ACERO TOTAL</span>
            <span className="text-[10px] font-orbitron font-bold text-[#00E5FF]">{telemetry.totalWeightKg} kg</span>
          </div>
          <div className="flex flex-col border-x border-[#0D1E30]">
            <span className="text-[7.5px] text-[#5E6872] font-orbitron">LONGITUD</span>
            <span className="text-[10px] font-orbitron font-bold text-[#F2F7F7]">{telemetry.totalLengthM} m</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[7.5px] text-[#5E6872] font-orbitron">AISC COMPACTA</span>
            <span className="text-[10px] font-orbitron font-bold text-[#39E58C]">{telemetry.compactRatio}%</span>
          </div>
        </div>

        {/* Search Field */}
        <div className="relative">
          <Search size={11} className="absolute left-2.5 top-2.5 text-[#5E6872]" />
          <input
            type="text"
            placeholder="Buscar ID, marca, perfil o ASTM..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#080D14] border border-[#111C27] focus:border-[#00E5FF] text-[#F2F7F7] text-[10px] font-mono-tech pl-7 pr-2 py-1.5 outline-none transition-colors"
          />
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-1 overflow-x-auto pb-0.5 custom-scrollbar text-[7.5px] font-orbitron">
          {(['ALL', 'HSS', 'PTR', 'MONTEN', 'IPR'] as MaterialFilterCategory[]).map((cat) => (
            <button
              key={cat}
              onClick={() => setMaterialFilter(cat)}
              className={`px-1.5 py-0.5 rounded-sm whitespace-nowrap transition-all border ${
                materialFilter === cat
                  ? 'bg-[#00E5FF] text-black border-[#00E5FF] font-bold shadow-[0_0_6px_#00E5FF]'
                  : 'bg-[#060A10] text-[#8A949D] border-[#101E2E] hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* 2. HIERARCHICAL TREE CONTENT */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1.5 custom-scrollbar">
        {/* ============================================================ */}
        {/* SECTION 1: COLUMNS */}
        {/* ============================================================ */}
        <div className="border border-[#0D1620] bg-[#070C14]">
          <button
            onClick={() => toggleSection('COLUMNS')}
            className="w-full px-2.5 py-2 flex items-center justify-between text-[10px] font-orbitron text-[#00E5FF] hover:bg-[#0D1620] transition-colors"
          >
            <div className="flex items-center gap-1.5">
              {expandedSections.COLUMNS ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
              <span className="font-bold">❚❚ COLUMNAS ({columns.length})</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-[8px] font-mono-tech px-1 py-0.2 bg-[#00E5FF]/10 text-[#00E5FF] border border-[#00E5FF]/30">
                {columns[0]?.section?.designation || 'HSS'}
              </span>
            </div>
          </button>

          {expandedSections.COLUMNS && (
            <div className="p-1 space-y-1 border-t border-[#0D1620] bg-[#020307]">
              {columns
                .filter((col) => matchesFilter(col.catalogItemId, col.section?.designation, col.role))
                .filter((col) => matchesSearch(col.id) || matchesSearch(col.section?.designation) || matchesSearch(col.role))
                .map((col) => {
                  const isSelected = selectedElementId === col.id;
                  const catId = col.catalogItemId || 'prod-mx-hss-6x4-14';
                  const record = getMaterialCatalogItem(catId);
                  const isCompact = record.estabilidadYEsbeltez?.clasificacionSeccionAISC === 'COMPACTA';

                  return (
                    <div key={col.id} className="flex flex-col">
                      <button
                        onClick={() => onSelectElement(col.id, 'MEMBER')}
                        className={`w-full px-2 py-1.5 flex items-center justify-between text-[9.5px] font-mono-tech transition-all border ${
                          isSelected
                            ? 'bg-[#00E5FF] text-black font-bold border-[#00E5FF] shadow-[0_0_8px_rgba(0,229,255,0.4)]'
                            : 'bg-[#050A10] text-[#8A949D] border-[#0D1A29] hover:text-[#F2F7F7] hover:border-[#00E5FF]/40'
                        }`}
                      >
                        <div className="flex items-center gap-1.5 truncate">
                          <div className={`w-1.5 h-1.5 shrink-0 ${isSelected ? 'bg-black' : 'bg-[#00E5FF]'}`} />
                          <span className="font-bold">{col.id}</span>
                          <span className={`text-[8px] truncate ${isSelected ? 'text-black/80' : 'text-[#5E6872]'}`}>
                            {record.geometriaSeccion?.tipoPerfil} {record.geometriaSeccion?.altoTotal_mm}x{record.geometriaSeccion?.anchoTotal_mm}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <span className={`text-[7.5px] px-1 py-0.2 font-bold ${
                            isSelected
                              ? 'bg-black text-[#00E5FF]'
                              : isCompact
                              ? 'bg-[#39E58C]/15 text-[#39E58C] border border-[#39E58C]/30'
                              : 'bg-[#EAB308]/15 text-[#EAB308] border border-[#EAB308]/30'
                          }`}>
                            {isCompact ? 'COMP' : 'NO-COMP'}
                          </span>
                          <span className="text-[8.5px] opacity-80">L={col.geometry.length.value}m</span>
                        </div>
                      </button>
                    </div>
                  );
                })}
            </div>
          )}
        </div>

        {/* ============================================================ */}
        {/* SECTION 2: ROOF TRUSSES & CHORDS */}
        {/* ============================================================ */}
        <div className="border border-[#0D1620] bg-[#070C14]">
          <button
            onClick={() => toggleSection('ROOF')}
            className="w-full px-2.5 py-2 flex items-center justify-between text-[10px] font-orbitron text-[#4CC9FF] hover:bg-[#0D1620] transition-colors"
          >
            <div className="flex items-center gap-1.5">
              {expandedSections.ROOF ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
              <span className="font-bold">▲ CERCHAS & CUERDAS ({trussMembers.length})</span>
            </div>
            <span className="text-[8px] font-mono-tech text-[#5E6872]">
              {project.roof?.trusses?.length || 0} MARCOS
            </span>
          </button>

          {expandedSections.ROOF && (
            <div className="p-1 space-y-1 border-t border-[#0D1620] bg-[#020307] max-h-56 overflow-y-auto custom-scrollbar">
              {trussMembers
                .filter((m) => matchesFilter(m.catalogItemId, m.section?.designation, m.role))
                .filter((m) => matchesSearch(m.id) || matchesSearch(m.role) || matchesSearch(m.section?.designation))
                .map((member) => {
                  const isSelected = selectedElementId === member.id;
                  const catId = member.catalogItemId || 'prod-mx-ptr-4x4-cal11';
                  const record = getMaterialCatalogItem(catId);
                  const isChord = member.role.includes('CHORD');

                  return (
                    <button
                      key={member.id}
                      onClick={() => onSelectElement(member.id, 'MEMBER')}
                      className={`w-full px-2 py-1.5 flex items-center justify-between text-[9.5px] font-mono-tech transition-all border ${
                        isSelected
                          ? 'bg-[#00E5FF] text-black font-bold border-[#00E5FF] shadow-[0_0_8px_rgba(0,229,255,0.4)]'
                          : 'bg-[#050A10] text-[#8A949D] border-[#0D1A29] hover:text-[#F2F7F7] hover:border-[#4CC9FF]/40'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 truncate">
                        <div className={`w-1.5 h-1.5 shrink-0 ${
                          isSelected
                            ? 'bg-black'
                            : isChord
                            ? 'bg-[#00E5FF]'
                            : 'bg-[#4CC9FF]'
                        }`} />
                        <span className="font-bold">{member.id}</span>
                        <span className={`text-[8px] truncate ${isSelected ? 'text-black/80' : 'text-[#5E6872]'}`}>
                          {record.metadatos?.sku?.split('-')?.[0] || 'PTR'} {record.geometriaSeccion?.pesoLineal_kg_m}kg/m
                        </span>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <span className={`text-[7.5px] px-1 py-0.2 font-mono-tech ${
                          isSelected ? 'bg-black text-[#00E5FF]' : 'bg-[#0D1620] text-[#8A949D]'
                        }`}>
                          {member.role.replace('_CHORD', '')}
                        </span>
                        <span className="text-[8.5px] opacity-80">{member.geometry.length.value.toFixed(2)}m</span>
                      </div>
                    </button>
                  );
                })}
            </div>
          )}
        </div>

        {/* ============================================================ */}
        {/* SECTION 3: PURLINS & MONTEN */}
        {/* ============================================================ */}
        <div className="border border-[#0D1620] bg-[#070C14]">
          <button
            onClick={() => toggleSection('PURLINS')}
            className="w-full px-2.5 py-2 flex items-center justify-between text-[10px] font-orbitron text-[#4CC9FF] hover:bg-[#0D1620] transition-colors"
          >
            <div className="flex items-center gap-1.5">
              {expandedSections.PURLINS ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
              <span className="font-bold">━ LARGUEROS & MONTÉN ({purlins.length})</span>
            </div>
            <span className="text-[8px] font-mono-tech px-1 bg-[#39E58C]/15 text-[#39E58C] border border-[#39E58C]/30">
              G90
            </span>
          </button>

          {expandedSections.PURLINS && (
            <div className="p-1 space-y-1 border-t border-[#0D1620] bg-[#020307] max-h-44 overflow-y-auto custom-scrollbar">
              {purlins
                .filter((p) => matchesFilter(p.catalogItemId, p.section?.designation, p.role))
                .filter((p) => matchesSearch(p.id) || matchesSearch(p.section?.designation))
                .map((pur) => {
                  const isSelected = selectedElementId === pur.id;
                  return (
                    <button
                      key={pur.id}
                      onClick={() => onSelectElement(pur.id, 'MEMBER')}
                      className={`w-full px-2 py-1.5 flex items-center justify-between text-[9.5px] font-mono-tech transition-all border ${
                        isSelected
                          ? 'bg-[#00E5FF] text-black font-bold border-[#00E5FF]'
                          : 'bg-[#050A10] text-[#8A949D] border-[#0D1A29] hover:text-[#F2F7F7] hover:bg-[#0D1620]'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 truncate">
                        <div className={`w-1.5 h-1.5 shrink-0 ${isSelected ? 'bg-black' : 'bg-[#4CC9FF]'}`} />
                        <span className="font-bold">{pur.id}</span>
                        <span className={`text-[8px] ${isSelected ? 'text-black/80' : 'text-[#5E6872]'}`}>
                          MONTÉN 6"x2" Cal. 14
                        </span>
                      </div>
                      <span className="text-[8.5px] opacity-80">L={pur.geometry.length.value}m</span>
                    </button>
                  );
                })}
            </div>
          )}
        </div>

        {/* ============================================================ */}
        {/* SECTION 4: FOUNDATIONS & PEDESTALS */}
        {/* ============================================================ */}
        <div className="border border-[#0D1620] bg-[#070C14]">
          <button
            onClick={() => toggleSection('FOUNDATIONS')}
            className="w-full px-2.5 py-2 flex items-center justify-between text-[10px] font-orbitron text-[#39E58C] hover:bg-[#0D1620] transition-colors"
          >
            <div className="flex items-center gap-1.5">
              {expandedSections.FOUNDATIONS ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
              <span className="font-bold">▰ CIMENTACIÓN & PEDESTALES ({foundations.length})</span>
            </div>
            <span className="text-[8px] font-mono-tech text-[#39E58C]">f'c=250</span>
          </button>

          {expandedSections.FOUNDATIONS && (
            <div className="p-1 space-y-1 border-t border-[#0D1620] bg-[#020307]">
              {foundations
                .filter((f) => matchesSearch(f.id))
                .map((fou) => {
                  const isSelected = selectedElementId === fou.id;
                  return (
                    <button
                      key={fou.id}
                      onClick={() => onSelectElement(fou.id, 'FOUNDATION')}
                      className={`w-full px-2 py-1.5 flex items-center justify-between text-[9.5px] font-mono-tech transition-all border ${
                        isSelected
                          ? 'bg-[#39E58C] text-black font-bold border-[#39E58C] shadow-[0_0_8px_rgba(57,229,140,0.4)]'
                          : 'bg-[#050A10] text-[#8A949D] border-[#0D1A29] hover:text-[#F2F7F7] hover:bg-[#0D1620]'
                      }`}
                    >
                      <div className="flex items-center gap-1.5">
                        <div className={`w-1.5 h-1.5 shrink-0 ${isSelected ? 'bg-black' : 'bg-[#39E58C]'}`} />
                        <span className="font-bold">{fou.id}</span>
                        <span className={`text-[8px] ${isSelected ? 'text-black/80' : 'text-[#5E6872]'}`}>
                          ZAPATA + PEDESTAL
                        </span>
                      </div>
                      <span className="text-[8.5px] opacity-80">
                        {fou.width.value}x{fou.length.value}m
                      </span>
                    </button>
                  );
                })}
            </div>
          )}
        </div>

        {/* ============================================================ */}
        {/* SECTION 5: CONNECTIONS */}
        {/* ============================================================ */}
        <div className="border border-[#0D1620] bg-[#070C14]">
          <button
            onClick={() => toggleSection('CONNECTIONS')}
            className="w-full px-2.5 py-2 flex items-center justify-between text-[10px] font-orbitron text-[#EAB308] hover:bg-[#0D1620] transition-colors"
          >
            <div className="flex items-center gap-1.5">
              {expandedSections.CONNECTIONS ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
              <span className="font-bold">◫ CONEXIONES & CARTABONES ({connections.length})</span>
            </div>
            <span className="text-[8px] font-mono-tech text-[#EAB308]">AISC 360</span>
          </button>

          {expandedSections.CONNECTIONS && (
            <div className="p-1 space-y-1 border-t border-[#0D1620] bg-[#020307]">
              {connections
                .filter((c) => matchesSearch(c.id))
                .map((conn) => {
                  const isSelected = selectedElementId === conn.id;
                  return (
                    <button
                      key={conn.id}
                      onClick={() => onSelectElement(conn.id, 'CONNECTION')}
                      className={`w-full px-2 py-1.5 flex items-center justify-between text-[9.5px] font-mono-tech transition-all border ${
                        isSelected
                          ? 'bg-[#EAB308] text-black font-bold border-[#EAB308]'
                          : 'bg-[#050A10] text-[#8A949D] border-[#0D1A29] hover:text-[#F2F7F7] hover:bg-[#0D1620]'
                      }`}
                    >
                      <div className="flex items-center gap-1.5">
                        <div className={`w-1.5 h-1.5 shrink-0 ${isSelected ? 'bg-black' : 'bg-[#EAB308]'}`} />
                        <span className="font-bold">{conn.id}</span>
                      </div>
                      <span className="text-[8.5px] opacity-80">{conn.type}</span>
                    </button>
                  );
                })}
            </div>
          )}
        </div>
      </div>

      {/* 3. DYNAMIC INLINE LIVING HUB TELEMETRY PANEL (ACTIVE ELEMENT) */}
      {activeRecord && selectedElementId && (
        <div className="p-2.5 border-t border-[#0D1620] bg-[#02050A] flex flex-col gap-1.5 shadow-[0_-4px_16px_rgba(0,0,0,0.5)]">
          <div className="flex items-center justify-between text-[9px] font-orbitron border-b border-[#0D1E30] pb-1">
            <span className="text-[#00E5FF] font-bold flex items-center gap-1">
              <Zap size={11} className="text-[#00E5FF] animate-pulse" />
              LIVING TELEMETRY: {selectedElementId}
            </span>
            <button
              onClick={() => handleCopySku(activeRecord.metadatos.sku)}
              className="text-[#8A949D] hover:text-white flex items-center gap-1 text-[8px]"
              title="Copiar SKU"
            >
              {copiedSku === activeRecord.metadatos.sku ? (
                <span className="text-[#39E58C] flex items-center gap-0.5"><Check size={10} /> SKU COPIADO</span>
              ) : (
                <span className="flex items-center gap-0.5"><Copy size={10} /> {activeRecord.metadatos.sku.split('-')[0]}</span>
              )}
            </button>
          </div>

          <div className="text-[9px] font-mono-tech text-[#F2F7F7] font-bold truncate">
            {activeRecord.metadatos.nombreComercial}
          </div>

          <div className="grid grid-cols-2 gap-1 text-[8px] text-[#8A949D] bg-[#060B12] p-1.5 border border-[#0D1A29]">
            <div>ACERO: <span className="text-[#00E5FF] font-bold">{activeRecord.propiedadesMecanicas.tipoAcero}</span></div>
            <div>FLUENCIA: <span className="text-[#F2F7F7] font-bold">{activeRecord.propiedadesMecanicas.limiteFluencia_Fy_MPa} MPa</span></div>
            <div>PESO/m: <span className="text-[#39E58C] font-bold">{activeRecord.geometriaSeccion.pesoLineal_kg_m} kg/m</span></div>
            <div>ESTABILIDAD: <span className="text-[#39E58C] font-bold">{activeRecord.estabilidadYEsbeltez.clasificacionSeccionAISC || 'COMPACTA'}</span></div>
          </div>
        </div>
      )}
    </aside>
  );
};
