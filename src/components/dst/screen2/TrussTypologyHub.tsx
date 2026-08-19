// ============================================================
// STV CLOSER — TRUSS TYPOLOGY HUB (SCREEN 02)
// TrussTypologyHub.tsx
// Radial & Orbital Typology Selector with SVG glyphs for Featured 18
// & Full 53 Master Structural Grammar Ontology Explorer
// Creation Paths: CATALOG, PARAMETRIC, CUSTOM
// ============================================================

import React, { useState } from 'react';
import {
  TRUSS_CATALOG,
  ROOF_CATALOG,
  MASTER_53_TRUSS_CATALOG,
  TrussTypologyDefinition,
  RoofTypologyDefinition,
  TrussFamily
} from '../../../dst/truss-typologies';
import { CreationPath } from '../../../dst/design-archive';
import {
  Dna,
  Sliders,
  Box,
  Layers,
  Sparkles,
  ChevronRight,
  Info,
  Eye,
  Search,
  CheckCircle2,
  FolderOpen,
  PenTool
} from 'lucide-react';

interface TrussTypologyHubProps {
  selectedTruss: TrussTypologyDefinition;
  onSelectTruss: (truss: TrussTypologyDefinition) => void;
  selectedRoof: RoofTypologyDefinition;
  onSelectRoof: (roof: RoofTypologyDefinition) => void;
  creationPath: CreationPath;
  onSelectCreationPath: (path: CreationPath) => void;
  onOpenDnaModal: () => void;
  onOpenArchiveModal: () => void;
  onOpenCustomEditor: () => void;
}

export const TrussTypologyHub: React.FC<TrussTypologyHubProps> = ({
  selectedTruss,
  onSelectTruss,
  selectedRoof,
  onSelectRoof,
  creationPath,
  onSelectCreationPath,
  onOpenDnaModal,
  onOpenArchiveModal,
  onOpenCustomEditor
}) => {
  const [selectedFamilyFilter, setSelectedFamilyFilter] = useState<
    'ALL' | 'FLAT_TRUSS' | 'ROOF_TRUSS' | 'SPACE_STRUCTURE' | 'CURVED_STRUCTURE' | 'SPECIAL'
  >('ALL');
  const [activeTab, setActiveTab] = useState<'FEATURED' | 'MASTER_53' | 'ROOFS'>('FEATURED');
  const [searchQuery, setSearchQuery] = useState('');

  // Filter 53 catalog by family and search query
  const filtered53List = MASTER_53_TRUSS_CATALOG.filter((item) => {
    const matchesFamily =
      selectedFamilyFilter === 'ALL' || item.family === selectedFamilyFilter;
    const matchesSearch =
      searchQuery.trim() === '' ||
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.id.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFamily && matchesSearch;
  });

  // Render dynamic SVG icon for a truss code
  const renderTrussSvgGlyph = (code: string, isSelected: boolean) => {
    const strokeColor = isSelected ? '#00E5FF' : '#94A3B8';
    const webColor = isSelected ? '#38BDF8' : '#475569';

    switch (code) {
      case 'WARREN':
        return (
          <svg className="w-10 h-5" viewBox="0 0 100 40">
            <line x1="10" y1="30" x2="90" y2="30" stroke={strokeColor} strokeWidth="2.5" />
            <line x1="10" y1="10" x2="90" y2="10" stroke={strokeColor} strokeWidth="2.5" />
            <polyline points="10,30 25,10 40,30 55,10 70,30 85,10 90,30" fill="none" stroke={webColor} strokeWidth="1.5" />
          </svg>
        );
      case 'PRATT':
        return (
          <svg className="w-10 h-5" viewBox="0 0 100 40">
            <line x1="10" y1="30" x2="90" y2="30" stroke={strokeColor} strokeWidth="2.5" />
            <polyline points="10,30 50,10 90,30" fill="none" stroke={strokeColor} strokeWidth="2.5" />
            <line x1="30" y1="30" x2="30" y2="20" stroke={webColor} strokeWidth="1.5" />
            <line x1="50" y1="30" x2="50" y2="10" stroke={webColor} strokeWidth="1.5" />
            <line x1="70" y1="30" x2="70" y2="20" stroke={webColor} strokeWidth="1.5" />
            <line x1="10" y1="30" x2="30" y2="20" stroke={webColor} strokeWidth="1.5" />
            <line x1="30" y1="30" x2="50" y2="10" stroke={webColor} strokeWidth="1.5" />
            <line x1="90" y1="30" x2="70" y2="20" stroke={webColor} strokeWidth="1.5" />
            <line x1="70" y1="30" x2="50" y2="10" stroke={webColor} strokeWidth="1.5" />
          </svg>
        );
      case 'HOWE':
        return (
          <svg className="w-10 h-5" viewBox="0 0 100 40">
            <line x1="10" y1="30" x2="90" y2="30" stroke={strokeColor} strokeWidth="2.5" />
            <polyline points="10,30 50,10 90,30" fill="none" stroke={strokeColor} strokeWidth="2.5" />
            <line x1="30" y1="30" x2="30" y2="20" stroke={webColor} strokeWidth="1.5" />
            <line x1="50" y1="30" x2="50" y2="10" stroke={webColor} strokeWidth="1.5" />
            <line x1="70" y1="30" x2="70" y2="20" stroke={webColor} strokeWidth="1.5" />
            <line x1="50" y1="10" x2="30" y2="30" stroke={webColor} strokeWidth="1.5" />
            <line x1="30" y1="20" x2="10" y2="30" stroke={webColor} strokeWidth="1.5" />
            <line x1="50" y1="10" x2="70" y2="30" stroke={webColor} strokeWidth="1.5" />
            <line x1="70" y1="20" x2="90" y2="30" stroke={webColor} strokeWidth="1.5" />
          </svg>
        );
      case 'FINK':
        return (
          <svg className="w-10 h-5" viewBox="0 0 100 40">
            <line x1="10" y1="30" x2="90" y2="30" stroke={strokeColor} strokeWidth="2.5" />
            <polyline points="10,30 50,8 90,30" fill="none" stroke={strokeColor} strokeWidth="2.5" />
            <line x1="50" y1="8" x2="50" y2="30" stroke={webColor} strokeWidth="1.5" />
            <line x1="30" y1="19" x2="50" y2="30" stroke={webColor} strokeWidth="1.5" />
            <line x1="70" y1="19" x2="50" y2="30" stroke={webColor} strokeWidth="1.5" />
            <line x1="30" y1="19" x2="25" y2="30" stroke={webColor} strokeWidth="1.5" />
            <line x1="70" y1="19" x2="75" y2="30" stroke={webColor} strokeWidth="1.5" />
          </svg>
        );
      case 'K_TRUSS':
        return (
          <svg className="w-10 h-5" viewBox="0 0 100 40">
            <line x1="10" y1="30" x2="90" y2="30" stroke={strokeColor} strokeWidth="2.5" />
            <line x1="10" y1="10" x2="90" y2="10" stroke={strokeColor} strokeWidth="2.5" />
            <line x1="30" y1="10" x2="30" y2="30" stroke={webColor} strokeWidth="1.5" />
            <line x1="50" y1="10" x2="50" y2="30" stroke={webColor} strokeWidth="1.5" />
            <line x1="70" y1="10" x2="70" y2="30" stroke={webColor} strokeWidth="1.5" />
            <polyline points="30,10 40,20 30,30" fill="none" stroke={webColor} strokeWidth="1.5" />
            <polyline points="50,10 60,20 50,30" fill="none" stroke={webColor} strokeWidth="1.5" />
            <polyline points="70,10 80,20 70,30" fill="none" stroke={webColor} strokeWidth="1.5" />
          </svg>
        );
      case 'BALTIMORE':
        return (
          <svg className="w-10 h-5" viewBox="0 0 100 40">
            <line x1="10" y1="30" x2="90" y2="30" stroke={strokeColor} strokeWidth="2.5" />
            <polyline points="10,30 25,10 75,10 90,30" fill="none" stroke={strokeColor} strokeWidth="2.5" />
            <line x1="25" y1="10" x2="25" y2="30" stroke={webColor} strokeWidth="1.5" />
            <line x1="50" y1="10" x2="50" y2="30" stroke={webColor} strokeWidth="1.5" />
            <line x1="75" y1="10" x2="75" y2="30" stroke={webColor} strokeWidth="1.5" />
            <line x1="25" y1="10" x2="50" y2="30" stroke={webColor} strokeWidth="1.5" />
            <line x1="75" y1="10" x2="50" y2="30" stroke={webColor} strokeWidth="1.5" />
            <line x1="37.5" y1="20" x2="37.5" y2="30" stroke={webColor} strokeWidth="1.5" />
            <line x1="62.5" y1="20" x2="62.5" y2="30" stroke={webColor} strokeWidth="1.5" />
          </svg>
        );
      case 'BOWSTRING':
        return (
          <svg className="w-10 h-5" viewBox="0 0 100 40">
            <line x1="10" y1="30" x2="90" y2="30" stroke={strokeColor} strokeWidth="2.5" />
            <path d="M 10,30 Q 50,6 90,30" fill="none" stroke={strokeColor} strokeWidth="2.5" />
            <line x1="30" y1="30" x2="30" y2="17" stroke={webColor} strokeWidth="1.5" />
            <line x1="50" y1="30" x2="50" y2="12" stroke={webColor} strokeWidth="1.5" />
            <line x1="70" y1="30" x2="70" y2="17" stroke={webColor} strokeWidth="1.5" />
            <line x1="10" y1="30" x2="30" y2="17" stroke={webColor} strokeWidth="1.5" />
            <line x1="30" y1="30" x2="50" y2="12" stroke={webColor} strokeWidth="1.5" />
            <line x1="70" y1="17" x2="90" y2="30" stroke={webColor} strokeWidth="1.5" />
            <line x1="50" y1="12" x2="70" y2="30" stroke={webColor} strokeWidth="1.5" />
          </svg>
        );
      case 'SCISSORS':
        return (
          <svg className="w-10 h-5" viewBox="0 0 100 40">
            <polyline points="10,30 50,6 90,30" fill="none" stroke={strokeColor} strokeWidth="2.5" />
            <line x1="10" y1="30" x2="50" y2="18" stroke={strokeColor} strokeWidth="2.5" />
            <line x1="90" y1="30" x2="50" y2="18" stroke={strokeColor} strokeWidth="2.5" />
            <line x1="50" y1="6" x2="50" y2="18" stroke={webColor} strokeWidth="1.5" />
            <line x1="30" y1="18" x2="50" y2="18" stroke={webColor} strokeWidth="1.5" />
            <line x1="70" y1="18" x2="50" y2="18" stroke={webColor} strokeWidth="1.5" />
          </svg>
        );
      default:
        return (
          <svg className="w-10 h-5" viewBox="0 0 100 40">
            <line x1="10" y1="30" x2="90" y2="30" stroke={strokeColor} strokeWidth="2" />
            <line x1="10" y1="10" x2="90" y2="10" stroke={strokeColor} strokeWidth="2" />
            <line x1="10" y1="30" x2="50" y2="10" stroke={webColor} strokeWidth="1.5" />
            <line x1="50" y1="10" x2="90" y2="30" stroke={webColor} strokeWidth="1.5" />
          </svg>
        );
    }
  };

  return (
    <div
      id="truss-typology-hub"
      className="bg-[#0B101B]/95 border border-[#1E293B] rounded-xl p-4 flex flex-col gap-4 text-slate-200 shadow-2xl backdrop-blur-md"
    >
      {/* Header & Creation Paths */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#1E293B] pb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#00E5FF]/10 border border-[#00E5FF]/30 flex items-center justify-center text-[#00E5FF]">
            <Dna className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-100 flex items-center gap-2">
              Gramática de Tipologías
              <span className="px-1.5 py-0.5 rounded text-[9px] bg-[#00E5FF]/10 text-[#00E5FF] font-mono border border-[#00E5FF]/30">
                53 Tipologías
              </span>
            </h3>
            <p className="text-[11px] text-slate-400">
              Selección estructurada por familias A-E, parámetros geométricos y reglas de validación
            </p>
          </div>
        </div>

        {/* Creation Paths (CATALOG / PARAMETRIC / CUSTOM) */}
        <div className="flex items-center gap-1 bg-[#060A11] p-1 rounded-lg border border-[#1E293B]">
          <button
            id="creation-path-catalog-btn"
            onClick={() => onSelectCreationPath('CATALOG')}
            className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-all flex items-center gap-1.5 ${
              creationPath === 'CATALOG'
                ? 'bg-[#00E5FF]/15 text-[#00E5FF] border border-[#00E5FF]/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <FolderOpen className="w-3 h-3" />
            Catálogo
          </button>
          <button
            id="creation-path-parametric-btn"
            onClick={() => onSelectCreationPath('PARAMETRIC')}
            className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-all flex items-center gap-1.5 ${
              creationPath === 'PARAMETRIC'
                ? 'bg-[#00E5FF]/15 text-[#00E5FF] border border-[#00E5FF]/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sliders className="w-3 h-3" />
            Paramétrico
          </button>
          <button
            id="creation-path-custom-btn"
            onClick={() => {
              onSelectCreationPath('CUSTOM');
              onOpenCustomEditor();
            }}
            className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-all flex items-center gap-1.5 ${
              creationPath === 'CUSTOM'
                ? 'bg-[#FF9100]/20 text-[#FFB74D] border border-[#FF9100]/40 shadow-[0_0_12px_rgba(255,145,0,0.2)]'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <PenTool className="w-3 h-3" />
            TR-18 Custom
          </button>
        </div>
      </div>

      {/* Main Navigation Tabs */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex gap-1">
          <button
            id="tab-featured-trusses-btn"
            onClick={() => setActiveTab('FEATURED')}
            className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'FEATURED'
                ? 'bg-[#00E5FF]/15 text-[#00E5FF] border border-[#00E5FF]/40'
                : 'bg-[#131C2E] text-slate-400 hover:text-slate-200 border border-[#1E293B]'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            18 Destacadas (TR-01 a TR-18)
          </button>
          <button
            id="tab-master-53-btn"
            onClick={() => setActiveTab('MASTER_53')}
            className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'MASTER_53'
                ? 'bg-[#00E5FF]/15 text-[#00E5FF] border border-[#00E5FF]/40'
                : 'bg-[#131C2E] text-slate-400 hover:text-slate-200 border border-[#1E293B]'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            Ontología Completa 53 Tipologías
          </button>
          <button
            id="tab-roofs-btn"
            onClick={() => setActiveTab('ROOFS')}
            className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'ROOFS'
                ? 'bg-[#00E5FF]/15 text-[#00E5FF] border border-[#00E5FF]/40'
                : 'bg-[#131C2E] text-slate-400 hover:text-slate-200 border border-[#1E293B]'
            }`}
          >
            <Box className="w-3.5 h-3.5" />
            Tipologías de Cubierta (12)
          </button>
        </div>

        {/* DNA Inspector Button */}
        <button
          id="open-dna-modal-btn"
          onClick={onOpenDnaModal}
          className="px-2.5 py-1.5 rounded-lg bg-[#0E1726] border border-slate-700 text-slate-300 hover:text-[#00E5FF] hover:border-[#00E5FF]/50 text-[11px] font-medium flex items-center gap-1.5 transition-all"
        >
          <Eye className="w-3.5 h-3.5 text-[#00E5FF]" />
          Inspeccionar ADN Estructural
        </button>
      </div>

      {/* TAB 1: FEATURED TRUSS GRID (TR-01 to TR-18) */}
      {activeTab === 'FEATURED' && (
        <div className="flex flex-col gap-3">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
            {TRUSS_CATALOG.map((truss) => {
              const isSelected = selectedTruss.id === truss.id;
              return (
                <button
                  key={truss.id}
                  id={`truss-card-${truss.id}`}
                  onClick={() => onSelectTruss(truss)}
                  className={`p-2.5 rounded-xl border text-left flex flex-col justify-between transition-all group ${
                    isSelected
                      ? 'bg-[#00E5FF]/15 border-[#00E5FF] text-white shadow-[0_0_20px_rgba(0,229,255,0.15)] ring-1 ring-[#00E5FF]/50'
                      : 'bg-[#131C2E] border-[#1E293B] text-slate-300 hover:border-slate-600 hover:bg-[#1A263D]'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[10px] font-bold font-mono px-1.5 py-0.5 rounded bg-[#060A11] border border-slate-800 text-[#00E5FF]">
                        {truss.id}
                      </span>
                      <span className="text-[8px] uppercase tracking-wider text-slate-400 font-medium">
                        {truss.family.replace('_TRUSS', '').replace('_STRUCTURE', '')}
                      </span>
                    </div>

                    <div className="h-9 flex items-center justify-center my-1">
                      {renderTrussSvgGlyph(truss.code, isSelected)}
                    </div>

                    <h4 className="text-[11px] font-bold mt-1 line-clamp-1 group-hover:text-[#00E5FF] transition-colors">
                      {truss.name}
                    </h4>
                    <p className="text-[9px] text-slate-400 mt-0.5 line-clamp-2 leading-tight">
                      {truss.shortDesc}
                    </p>
                  </div>

                  <div className="mt-2 pt-1.5 border-t border-slate-700/60 flex items-center justify-between text-[8px] font-mono text-slate-400">
                    <span>{truss.dna.webPattern}</span>
                    <span className="text-[#00E5FF] font-bold">{truss.dna.chordCount} Cuerdas</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: MASTER 53 ONTOLOGY EXPLORER */}
      {activeTab === 'MASTER_53' && (
        <div className="flex flex-col gap-3">
          {/* Filter Bar & Search */}
          <div className="flex flex-wrap items-center justify-between gap-2 bg-[#060A11] p-2 rounded-lg border border-[#1E293B]">
            {/* Family Buttons */}
            <div className="flex flex-wrap gap-1 text-[10px]">
              <button
                onClick={() => setSelectedFamilyFilter('ALL')}
                className={`px-2 py-1 rounded font-medium transition-all ${
                  selectedFamilyFilter === 'ALL'
                    ? 'bg-[#00E5FF]/20 text-[#00E5FF] font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Todas (53)
              </button>
              <button
                onClick={() => setSelectedFamilyFilter('FLAT_TRUSS')}
                className={`px-2 py-1 rounded font-medium transition-all ${
                  selectedFamilyFilter === 'FLAT_TRUSS'
                    ? 'bg-[#00E5FF]/20 text-[#00E5FF] font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                A — Planas (14)
              </button>
              <button
                onClick={() => setSelectedFamilyFilter('ROOF_TRUSS')}
                className={`px-2 py-1 rounded font-medium transition-all ${
                  selectedFamilyFilter === 'ROOF_TRUSS'
                    ? 'bg-[#00E5FF]/20 text-[#00E5FF] font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                B — Inclinadas (14)
              </button>
              <button
                onClick={() => setSelectedFamilyFilter('SPACE_STRUCTURE')}
                className={`px-2 py-1 rounded font-medium transition-all ${
                  selectedFamilyFilter === 'SPACE_STRUCTURE'
                    ? 'bg-[#00E5FF]/20 text-[#00E5FF] font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                C — Espaciales (8)
              </button>
              <button
                onClick={() => setSelectedFamilyFilter('CURVED_STRUCTURE')}
                className={`px-2 py-1 rounded font-medium transition-all ${
                  selectedFamilyFilter === 'CURVED_STRUCTURE'
                    ? 'bg-[#00E5FF]/20 text-[#00E5FF] font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                D — Curvas (7)
              </button>
              <button
                onClick={() => setSelectedFamilyFilter('SPECIAL')}
                className={`px-2 py-1 rounded font-medium transition-all ${
                  selectedFamilyFilter === 'SPECIAL'
                    ? 'bg-[#00E5FF]/20 text-[#00E5FF] font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                E — Especiales (10)
              </button>
            </div>

            {/* Search Input */}
            <div className="relative w-48">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar tipología..."
                className="w-full bg-[#131C2E] border border-slate-700 rounded-md pl-8 pr-2.5 py-1 text-[11px] text-slate-200 focus:outline-none focus:border-[#00E5FF]"
              />
            </div>
          </div>

          {/* 53 Typologies Detailed Table / Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5 max-h-96 overflow-y-auto pr-1">
            {filtered53List.map((item) => {
              const isSelected = selectedTruss.id === item.id || selectedTruss.code === item.code;
              return (
                <button
                  key={`m53-${item.itemNumber}-${item.id}`}
                  id={`master-53-item-${item.id}`}
                  onClick={() => onSelectTruss(item)}
                  className={`p-3 rounded-lg border text-left flex flex-col justify-between transition-all ${
                    isSelected
                      ? 'bg-[#00E5FF]/15 border-[#00E5FF] text-white shadow-md'
                      : 'bg-[#131C2E] border-[#1E293B] text-slate-300 hover:border-slate-600 hover:bg-[#1A263D]'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-bold font-mono px-1.5 py-0.5 rounded bg-[#060A11] border border-slate-800 text-[#00E5FF]">
                          #{item.itemNumber} {item.id}
                        </span>
                        <span className="text-[9px] text-slate-400 font-mono">{item.code}</span>
                      </div>
                      <span className="text-[9px] font-mono text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                        {item.typicalLdRatio}
                      </span>
                    </div>

                    <h4 className="text-xs font-bold text-slate-100 mt-1.5">{item.name}</h4>
                    <p className="text-[10px] text-slate-400 mt-0.5 line-clamp-2">{item.shortDesc}</p>
                  </div>

                  <div className="mt-2 pt-2 border-t border-slate-800 flex flex-col gap-1 text-[9px]">
                    <div className="flex justify-between text-slate-400">
                      <span>Claro recomendado:</span>
                      <span className="text-slate-200 font-mono">
                        {item.recommendedSpanM.min}m – {item.recommendedSpanM.max}m
                      </span>
                    </div>
                    <div className="text-slate-400 italic line-clamp-1">
                      <strong>Comportamiento:</strong> {item.loadBehavior}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: ROOF TYPOLOGY DATABASE */}
      {activeTab === 'ROOFS' && (
        <div className="flex flex-col gap-3">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
            {ROOF_CATALOG.map((roof) => {
              const isSelected = selectedRoof.id === roof.id;
              return (
                <button
                  key={roof.id}
                  id={`roof-card-${roof.id}`}
                  onClick={() => onSelectRoof(roof)}
                  className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all ${
                    isSelected
                      ? 'bg-[#00E5FF]/15 border-[#00E5FF] text-white shadow-md ring-1 ring-[#00E5FF]/50'
                      : 'bg-[#131C2E] border-[#1E293B] text-slate-300 hover:border-slate-600 hover:bg-[#1A263D]'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-bold font-mono px-1.5 py-0.5 rounded bg-[#060A11] border border-slate-800 text-[#00E5FF]">
                        {roof.id}
                      </span>
                      <span className="text-[9px] font-mono text-emerald-400">{roof.typicalSlopeDeg}°</span>
                    </div>

                    <h4 className="text-xs font-bold mt-1 text-slate-100">{roof.name}</h4>
                    <p className="text-[9px] text-slate-400 mt-1 line-clamp-2 leading-tight">
                      {roof.shortDesc}
                    </p>
                  </div>

                  <div className="mt-2 pt-1.5 border-t border-slate-700/60 flex items-center justify-between text-[8px] font-mono text-slate-400">
                    <span>Drenaje: {roof.drainageType}</span>
                    <span>Max {roof.maxRecommendedSpanM}m</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
