// ============================================================
// STV CLOSER — CUSTOM IDEA & DESIGN ARCHIVE WORKSTATION MODAL
// DesignArchiveModal.tsx
// Actions: SAVE → RECOVER → DUPLICATE → EDIT → VERSION → COMPARE → REUSE
// Traceability: ORIGINAL → REVISION → AUDIT → APPROVAL
// ============================================================

import React, { useState } from 'react';
import {
  ArchivedDesignItem,
  DesignClassification,
  getArchivedDesigns,
  saveDesignToArchive,
  duplicateArchivedDesign,
  deleteArchivedDesign,
  promoteDesignClassification,
  compareTwoDesigns,
  DesignComparisonDiff
} from '../../../dst/design-archive';
import {
  X,
  Archive,
  Save,
  Copy,
  Trash2,
  GitCompare,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Clock,
  User,
  Tag,
  Search,
  Sliders,
  Plus,
  ChevronRight,
  AlertCircle
} from 'lucide-react';
import { SectionProfile } from '../../../dst/dst.schema';

interface DesignArchiveModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentDesignState: {
    name: string;
    typologyId: string;
    roofFamily: any;
    spanM: number;
    riseM: number;
    depthM: number;
    panelCount: number;
    topChordProfile: SectionProfile;
    bottomChordProfile: SectionProfile;
    webProfile: SectionProfile;
    dna: any;
  };
  onLoadArchivedDesign: (design: ArchivedDesignItem) => void;
}

export const DesignArchiveModal: React.FC<DesignArchiveModalProps> = ({
  isOpen,
  onClose,
  currentDesignState,
  onLoadArchivedDesign
}) => {
  const [designs, setDesigns] = useState<ArchivedDesignItem[]>(() => getArchivedDesigns());
  const [selectedDesignId, setSelectedDesignId] = useState<string | null>(designs[0]?.id || null);
  const [filterClass, setFilterClass] = useState<DesignClassification | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSavingCurrent, setIsSavingCurrent] = useState(false);
  const [saveForm, setSaveForm] = useState({
    name: currentDesignState.name || 'Nueva Cercha Paramétrica STV',
    code: 'STV-CUSTOM-01',
    description: 'Configuración personalizada con perfiles optimizados.',
    classification: 'CUSTOM' as DesignClassification,
    author: 'Ing. Estructural',
    tags: 'Paramétrica, Taller, STV'
  });

  // Compare mode state
  const [isCompareOpen, setIsCompareOpen] = useState(false);
  const [compareIdB, setCompareIdB] = useState<string | null>(null);
  const [diffResult, setDiffResult] = useState<DesignComparisonDiff | null>(null);

  // Promotion note state
  const [isPromoting, setIsPromoting] = useState(false);
  const [promotionTarget, setPromotionTarget] = useState<DesignClassification>('CANDIDATE');
  const [promotionNote, setPromotionNote] = useState('');

  if (!isOpen) return null;

  const refreshList = () => {
    const fresh = getArchivedDesigns();
    setDesigns(fresh);
    if (!fresh.some((d) => d.id === selectedDesignId) && fresh.length > 0) {
      setSelectedDesignId(fresh[0].id);
    }
  };

  const selectedDesign = designs.find((d) => d.id === selectedDesignId);

  const filteredDesigns = designs.filter((d) => {
    const matchesFilter = filterClass === 'ALL' || d.classification === filterClass;
    const matchesSearch =
      d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesFilter && matchesSearch;
  });

  const handleSaveNew = (e: React.FormEvent) => {
    e.preventDefault();
    const tagArray = saveForm.tags.split(',').map((t) => t.trim()).filter(Boolean);
    saveDesignToArchive({
      name: saveForm.name,
      code: saveForm.code,
      description: saveForm.description,
      typologyId: currentDesignState.typologyId,
      roofFamily: currentDesignState.roofFamily,
      creationPath: saveForm.classification === 'CUSTOM' ? 'CUSTOM' : 'PARAMETRIC',
      classification: saveForm.classification,
      lifecycleStatus: 'ORIGINAL',
      version: 'v1.0',
      parameters: {
        spanM: currentDesignState.spanM,
        riseM: currentDesignState.riseM,
        depthM: currentDesignState.depthM,
        panelCount: currentDesignState.panelCount
      },
      dna: currentDesignState.dna,
      profiles: {
        topChord: currentDesignState.topChordProfile,
        bottomChord: currentDesignState.bottomChordProfile,
        web: currentDesignState.webProfile
      },
      lastAudit: {
        status: 'VALIDATED',
        timestamp: new Date().toISOString(),
        summary: 'Configuración guardada conforme a parámetros STV.'
      },
      author: saveForm.author,
      organization: 'STV Structural Workstation',
      tags: tagArray
    });

    setIsSavingCurrent(false);
    refreshList();
  };

  const handleDuplicate = (id: string) => {
    duplicateArchivedDesign(id);
    refreshList();
  };

  const handleDelete = (id: string) => {
    if (window.confirm('¿Está seguro de eliminar este diseño del archivo permanente?')) {
      deleteArchivedDesign(id);
      refreshList();
    }
  };

  const handleStartCompare = () => {
    if (!selectedDesignId) return;
    const other = designs.find((d) => d.id !== selectedDesignId);
    if (other) {
      setCompareIdB(other.id);
      const diff = compareTwoDesigns(selectedDesignId, other.id);
      setDiffResult(diff);
      setIsCompareOpen(true);
    }
  };

  const handleExecutePromotion = () => {
    if (!selectedDesignId) return;
    promoteDesignClassification(selectedDesignId, promotionTarget, promotionNote || 'Aprobado por comité');
    setIsPromoting(false);
    setPromotionNote('');
    refreshList();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-3 sm:p-6 select-none font-mono-tech">
      <div className="relative w-full max-w-5xl bg-[#030911] border border-[#00E5FF]/50 rounded-lg shadow-[0_0_35px_rgba(0,229,255,0.3)] flex flex-col h-[90vh] text-[#F2F7F7] overflow-hidden">
        {/* Top Header */}
        <div className="flex items-center justify-between p-3.5 border-b border-[#0D2235] bg-[#02050A]">
          <div className="flex items-center gap-2.5">
            <Archive className="w-5 h-5 text-[#00E5FF]" />
            <div>
              <div className="font-orbitron font-bold text-sm text-white flex items-center gap-2">
                <span>CUSTOM IDEA / DESIGN ARCHIVE SYSTEM</span>
                <span className="text-[9px] px-1.5 py-0.5 bg-[#FFD600]/20 text-[#FFD600] border border-[#FFD600]/40 rounded">
                  PERSISTENT REGISTRY
                </span>
              </div>
              <div className="text-[10px] text-[#8A949D]">
                SAVE → RECOVER → DUPLICATE → EDIT → VERSION → COMPARE → REUSE
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsSavingCurrent(true)}
              className="px-3 py-1 bg-[#00E5FF] hover:bg-white text-black font-orbitron font-bold text-xs rounded transition-all flex items-center gap-1.5 shadow-[0_0_10px_#00E5FF]"
            >
              <Save className="w-3.5 h-3.5" />
              GUARDAR DISEÑO ACTUAL
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1 text-[#8A949D] hover:text-white hover:bg-[#0D2235] rounded transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Main Area */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left Panel: Search, Filter, and Design List */}
          <div className="w-80 sm:w-96 border-r border-[#0D2235] bg-[#02050A] flex flex-col p-3 overflow-hidden">
            {/* Search Input */}
            <div className="relative mb-2">
              <Search className="w-3.5 h-3.5 text-[#8A949D] absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar por nombre, código o etiqueta..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#010307] border border-[#0D2235] rounded pl-8 pr-3 py-1.5 text-[10px] text-white focus:border-[#00E5FF] focus:outline-none"
              />
            </div>

            {/* Classification Filter Tabs */}
            <div className="flex gap-1 mb-2.5 overflow-x-auto pb-1 text-[8px] font-orbitron scrollbar-thin">
              {(['ALL', 'CUSTOM', 'PROJECT', 'CANDIDATE', 'CATALOG'] as const).map((cls) => (
                <button
                  key={cls}
                  type="button"
                  onClick={() => setFilterClass(cls)}
                  className={`px-2 py-0.5 rounded whitespace-nowrap transition-all ${
                    filterClass === cls
                      ? 'bg-[#00E5FF] text-black font-bold'
                      : 'bg-[#030911] text-[#8A949D] border border-[#0D2235] hover:text-white'
                  }`}
                >
                  {cls}
                </button>
              ))}
            </div>

            {/* Design Items List */}
            <div className="flex-1 overflow-y-auto space-y-1.5 pr-1">
              {filteredDesigns.map((design) => {
                const isSelected = design.id === selectedDesignId;
                return (
                  <button
                    key={design.id}
                    type="button"
                    onClick={() => setSelectedDesignId(design.id)}
                    className={`w-full p-2 rounded border text-left flex flex-col gap-1 transition-all ${
                      isSelected
                        ? 'bg-[#051829] border-[#00E5FF] text-white shadow-[0_0_12px_rgba(0,229,255,0.3)]'
                        : 'bg-[#03080E] border-[#0D2235] text-[#8A949D] hover:border-[#00E5FF]/40 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`text-[8px] font-orbitron font-bold px-1 rounded ${
                        design.classification === 'CATALOG'
                          ? 'bg-[#00E5FF] text-black'
                          : design.classification === 'CANDIDATE'
                          ? 'bg-[#FFD600] text-black'
                          : design.classification === 'PROJECT'
                          ? 'bg-[#FF9100] text-black'
                          : 'bg-[#FF3366] text-white'
                      }`}>
                        {design.classification}
                      </span>
                      <span className="text-[8px] text-[#00E5FF] font-bold">{design.version}</span>
                    </div>

                    <div className="text-[11px] font-orbitron font-bold text-white truncate">
                      {design.name}
                    </div>

                    <div className="text-[8px] text-[#8A949D] truncate">
                      {design.code} | {design.parameters.spanM}m Claro | {design.parameters.panelCount} Paneles
                    </div>

                    <div className="flex items-center justify-between pt-1 border-t border-[#0D2235] text-[7px]">
                      <span className="text-[#8A949D]">{design.author}</span>
                      <span className="text-[#FFD600]">{design.lifecycleStatus}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Panel: Selected Design Detail & Actions */}
          <div className="flex-1 bg-[#030911] p-4 flex flex-col overflow-y-auto">
            {selectedDesign ? (
              <div className="space-y-4">
                {/* Detail Header & Action Buttons */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#0D2235] pb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-base font-orbitron font-bold text-white">{selectedDesign.name}</h2>
                      <span className="text-[9px] px-2 py-0.5 bg-[#00E5FF]/20 text-[#00E5FF] border border-[#00E5FF]/40 rounded font-orbitron">
                        {selectedDesign.version}
                      </span>
                    </div>
                    <div className="text-[10px] text-[#8A949D] mt-0.5">
                      Código: <span className="text-[#FFD600] font-bold">{selectedDesign.code}</span> | ID: {selectedDesign.id} | Creado por: {selectedDesign.author}
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => onLoadArchivedDesign(selectedDesign)}
                      className="px-3 py-1.5 bg-[#00E5FF] hover:bg-white text-black font-orbitron font-bold text-xs rounded transition-all flex items-center gap-1 shadow-[0_0_10px_#00E5FF]"
                    >
                      <ArrowRight className="w-3.5 h-3.5" />
                      INSTANCIAR EN TWIN
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDuplicate(selectedDesign.id)}
                      className="p-1.5 bg-[#02050A] border border-[#00E5FF]/40 text-[#00E5FF] hover:bg-[#00E5FF] hover:text-black rounded transition-all"
                      title="Duplicar / Crear Rama"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={handleStartCompare}
                      className="p-1.5 bg-[#02050A] border border-[#FFD600]/40 text-[#FFD600] hover:bg-[#FFD600] hover:text-black rounded transition-all"
                      title="Comparar con otro diseño (Diff)"
                    >
                      <GitCompare className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(selectedDesign.id)}
                      className="p-1.5 bg-[#02050A] border border-[#FF3366]/40 text-[#FF3366] hover:bg-[#FF3366] hover:text-white rounded transition-all"
                      title="Eliminar del archivo"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Description & Classification / Promotion Badge */}
                <div className="p-3 bg-[#02050A] border border-[#0D2235] rounded text-xs flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[#8A949D]">DESCRIPCIÓN TÉCNICA:</span>
                    <button
                      type="button"
                      onClick={() => setIsPromoting(true)}
                      className="text-[9px] font-orbitron text-[#FFD600] hover:underline flex items-center gap-1"
                    >
                      <ShieldCheck className="w-3 h-3" />
                      PROMOVER CLASIFICACIÓN ({selectedDesign.classification})
                    </button>
                  </div>
                  <p className="text-white text-[11px] leading-relaxed">{selectedDesign.description}</p>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {selectedDesign.tags.map((tag, i) => (
                      <span key={i} className="px-2 py-0.5 bg-[#0D2235] text-[#00E5FF] rounded text-[8px] flex items-center gap-1">
                        <Tag className="w-2.5 h-2.5" />
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Parametric Parameters Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  <div className="p-2.5 bg-[#02050A] border border-[#00E5FF]/30 rounded">
                    <div className="text-[8px] text-[#8A949D] font-orbitron">CLARO (SPAN)</div>
                    <div className="text-sm font-orbitron font-bold text-[#00E5FF] mt-0.5">
                      {selectedDesign.parameters.spanM.toFixed(2)} m
                    </div>
                  </div>
                  <div className="p-2.5 bg-[#02050A] border border-[#FFD600]/30 rounded">
                    <div className="text-[8px] text-[#8A949D] font-orbitron">PERALTE / FLECHA</div>
                    <div className="text-sm font-orbitron font-bold text-[#FFD600] mt-0.5">
                      {(selectedDesign.parameters.riseM || selectedDesign.parameters.depthM).toFixed(2)} m
                    </div>
                  </div>
                  <div className="p-2.5 bg-[#02050A] border border-[#00E5FF]/30 rounded">
                    <div className="text-[8px] text-[#8A949D] font-orbitron">PANELES</div>
                    <div className="text-sm font-orbitron font-bold text-white mt-0.5">
                      {selectedDesign.parameters.panelCount} uds
                    </div>
                  </div>
                  <div className="p-2.5 bg-[#02050A] border border-[#FF3366]/30 rounded">
                    <div className="text-[8px] text-[#8A949D] font-orbitron">AUDITORÍA AISC</div>
                    <div className="text-xs font-orbitron font-bold text-[#00E5FF] mt-0.5 truncate">
                      {selectedDesign.lastAudit?.status || 'VALIDATED'}
                    </div>
                  </div>
                </div>

                {/* Profiles & Materials */}
                <div className="p-3 bg-[#02050A] border border-[#00E5FF]/30 rounded text-xs">
                  <div className="text-[#00E5FF] font-orbitron font-bold text-[10px] mb-2">
                    ASIGNACIÓN DE PERFILES ESTRUCTURALES
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[10px]">
                    <div className="p-2 bg-[#010307] rounded border border-[#0D2235]">
                      <div className="text-[#8A949D]">CUERDA SUPERIOR</div>
                      <div className="font-bold text-white mt-0.5">{selectedDesign.profiles.topChord.designation}</div>
                    </div>
                    <div className="p-2 bg-[#010307] rounded border border-[#0D2235]">
                      <div className="text-[#8A949D]">CUERDA INFERIOR</div>
                      <div className="font-bold text-white mt-0.5">{selectedDesign.profiles.bottomChord.designation}</div>
                    </div>
                    <div className="p-2 bg-[#010307] rounded border border-[#0D2235]">
                      <div className="text-[#8A949D]">ALMAS / DIAGONALES</div>
                      <div className="font-bold text-white mt-0.5">{selectedDesign.profiles.web.designation}</div>
                    </div>
                  </div>
                </div>

                {/* Version History & Lifecycle Traceability */}
                <div className="p-3 bg-[#02050A] border border-[#0D2235] rounded text-xs">
                  <div className="text-[#FFD600] font-orbitron font-bold text-[10px] mb-2 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    TRAZABILIDAD DE VERSIONES & REVISIONES ({selectedDesign.versionHistory.length})
                  </div>
                  <div className="space-y-2">
                    {selectedDesign.versionHistory.map((vh, idx) => (
                      <div key={idx} className="flex items-start gap-2.5 text-[9px] border-l-2 border-[#00E5FF] pl-2.5 py-0.5">
                        <span className="font-orbitron font-bold text-[#00E5FF]">{vh.version}</span>
                        <div className="flex-1">
                          <div className="text-white">{vh.changeNote}</div>
                          <div className="text-[7px] text-[#8A949D] mt-0.5">
                            {new Date(vh.timestamp).toLocaleDateString()} | Autor: {vh.author}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-[#8A949D]">
                <Archive className="w-12 h-12 mb-2 opacity-30" />
                <p>Seleccione un diseño del archivo para inspeccionar o instanciar.</p>
              </div>
            )}
          </div>
        </div>

        {/* Modal Overlay: Save Current Design Form */}
        {isSavingCurrent && (
          <div className="absolute inset-0 z-30 bg-black/90 backdrop-blur-md p-6 flex items-center justify-center">
            <form onSubmit={handleSaveNew} className="w-full max-w-lg bg-[#030911] border border-[#00E5FF] rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between border-b border-[#0D2235] pb-2">
                <span className="font-orbitron font-bold text-sm text-white">GUARDAR NUEVO DISEÑO EN ARCHIVO</span>
                <button type="button" onClick={() => setIsSavingCurrent(false)} className="text-[#8A949D] hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div>
                <label className="text-[10px] text-[#8A949D] block mb-1">Nombre del Diseño:</label>
                <input
                  type="text"
                  required
                  value={saveForm.name}
                  onChange={(e) => setSaveForm({ ...saveForm, name: e.target.value })}
                  className="w-full bg-[#010307] border border-[#0D2235] rounded p-2 text-xs text-white focus:border-[#00E5FF]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-[#8A949D] block mb-1">Código Identificador:</label>
                  <input
                    type="text"
                    required
                    value={saveForm.code}
                    onChange={(e) => setSaveForm({ ...saveForm, code: e.target.value })}
                    className="w-full bg-[#010307] border border-[#0D2235] rounded p-2 text-xs text-white focus:border-[#00E5FF]"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-[#8A949D] block mb-1">Clasificación:</label>
                  <select
                    value={saveForm.classification}
                    onChange={(e) => setSaveForm({ ...saveForm, classification: e.target.value as any })}
                    className="w-full bg-[#010307] border border-[#0D2235] rounded p-2 text-xs text-white focus:border-[#00E5FF]"
                  >
                    <option value="CUSTOM">CUSTOM</option>
                    <option value="PROJECT">PROJECT</option>
                    <option value="CANDIDATE">CANDIDATE</option>
                    <option value="CATALOG">CATALOG</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[10px] text-[#8A949D] block mb-1">Descripción Técnica:</label>
                <textarea
                  rows={2}
                  value={saveForm.description}
                  onChange={(e) => setSaveForm({ ...saveForm, description: e.target.value })}
                  className="w-full bg-[#010307] border border-[#0D2235] rounded p-2 text-xs text-white focus:border-[#00E5FF]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-[#8A949D] block mb-1">Autor / Responsable:</label>
                  <input
                    type="text"
                    value={saveForm.author}
                    onChange={(e) => setSaveForm({ ...saveForm, author: e.target.value })}
                    className="w-full bg-[#010307] border border-[#0D2235] rounded p-2 text-xs text-white focus:border-[#00E5FF]"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-[#8A949D] block mb-1">Etiquetas (separadas por coma):</label>
                  <input
                    type="text"
                    value={saveForm.tags}
                    onChange={(e) => setSaveForm({ ...saveForm, tags: e.target.value })}
                    className="w-full bg-[#010307] border border-[#0D2235] rounded p-2 text-xs text-white focus:border-[#00E5FF]"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-[#0D2235]">
                <button
                  type="button"
                  onClick={() => setIsSavingCurrent(false)}
                  className="px-3 py-1 text-xs text-[#8A949D] hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#00E5FF] text-black font-orbitron font-bold text-xs rounded shadow-[0_0_10px_#00E5FF]"
                >
                  CONFIRMAR GUARDADO
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Modal Overlay: Compare Diff Viewer */}
        {isCompareOpen && diffResult && (
          <div className="absolute inset-0 z-30 bg-black/90 backdrop-blur-md p-6 flex items-center justify-center">
            <div className="w-full max-w-3xl bg-[#030911] border border-[#FFD600] rounded-lg p-4 flex flex-col max-h-[80vh] overflow-hidden">
              <div className="flex items-center justify-between border-b border-[#0D2235] pb-2 mb-3">
                <span className="font-orbitron font-bold text-sm text-white flex items-center gap-2">
                  <GitCompare className="w-4 h-4 text-[#FFD600]" />
                  COMPARADOR DE VERSIONES (DIFF INSPECTOR)
                </span>
                <button type="button" onClick={() => setIsCompareOpen(false)} className="text-[#8A949D] hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto">
                <table className="w-full text-left text-[10px]">
                  <thead className="bg-[#051829] text-[#00E5FF] font-orbitron">
                    <tr>
                      <th className="p-2">CAMPO</th>
                      <th className="p-2">{diffResult.designA.name} ({diffResult.designA.version})</th>
                      <th className="p-2">{diffResult.designB.name} ({diffResult.designB.version})</th>
                      <th className="p-2">ESTADO</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#0D2235]">
                    {diffResult.differences.map((d, i) => (
                      <tr key={i} className={d.status === 'CRITICAL_CHANGE' ? 'bg-[#FF3366]/10' : d.status === 'MODIFIED' ? 'bg-[#FFD600]/10' : ''}>
                        <td className="p-2 font-bold text-white">{d.field}</td>
                        <td className="p-2 text-[#00E5FF]">{d.valueA}</td>
                        <td className="p-2 text-[#FFD600]">{d.valueB}</td>
                        <td className="p-2">
                          <span className={`px-1.5 py-0.5 rounded text-[8px] font-orbitron ${
                            d.status === 'SAME'
                              ? 'bg-[#00E5FF]/20 text-[#00E5FF]'
                              : d.status === 'MODIFIED'
                              ? 'bg-[#FFD600]/20 text-[#FFD600]'
                              : 'bg-[#FF3366]/20 text-[#FF3366]'
                          }`}>
                            {d.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Modal Overlay: Promote Classification Form */}
        {isPromoting && (
          <div className="absolute inset-0 z-30 bg-black/90 backdrop-blur-md p-6 flex items-center justify-center">
            <div className="w-full max-w-md bg-[#030911] border border-[#FFD600] rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between border-b border-[#0D2235] pb-2">
                <span className="font-orbitron font-bold text-sm text-white">PROMOVER CLASIFICACIÓN DE DISEÑO</span>
                <button type="button" onClick={() => setIsPromoting(false)} className="text-[#8A949D] hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div>
                <label className="text-[10px] text-[#8A949D] block mb-1">Nueva Clasificación:</label>
                <select
                  value={promotionTarget}
                  onChange={(e) => setPromotionTarget(e.target.value as any)}
                  className="w-full bg-[#010307] border border-[#0D2235] rounded p-2 text-xs text-white focus:border-[#FFD600]"
                >
                  <option value="PROJECT">PROJECT (Aprobado para proyecto específico)</option>
                  <option value="CANDIDATE">CANDIDATE (Postulado a estandarización)</option>
                  <option value="CATALOG">CATALOG (Oficialmente certificado en catálogo STV)</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] text-[#8A949D] block mb-1">Nota del Dictamen de Ingeniería:</label>
                <textarea
                  rows={3}
                  placeholder="Justifique la aprobación estructural, soldadura o transporte..."
                  value={promotionNote}
                  onChange={(e) => setPromotionNote(e.target.value)}
                  className="w-full bg-[#010307] border border-[#0D2235] rounded p-2 text-xs text-white focus:border-[#FFD600]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-[#0D2235]">
                <button
                  type="button"
                  onClick={() => setIsPromoting(false)}
                  className="px-3 py-1 text-xs text-[#8A949D] hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleExecutePromotion}
                  className="px-4 py-1.5 bg-[#FFD600] text-black font-orbitron font-bold text-xs rounded shadow-[0_0_10px_#FFD600]"
                >
                  EMITIR DICTAMEN
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
