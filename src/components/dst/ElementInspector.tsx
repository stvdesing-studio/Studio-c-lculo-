// ============================================================
// STV CLOSER — ELEMENT PROPERTY INSPECTOR COMPONENT (LIVING HUB)
// ElementInspector.tsx
// Comprehensive Structural Engineering Telemetry, Material Swapper & CAD Inspector
// Dynamically fetches and displays full MaterialRecord from registry
// ============================================================

import React, { useState, useMemo } from 'react';
import {
  DSTProject,
  StructuralMember,
  StructuralNode,
  FoundationElement,
  StructuralConnection,
  SectionProfile
} from '../../dst/dst.schema';
import {
  getMaterialCatalogItem,
  MaterialRecord,
  getAllMaterialCatalogItems,
  getCatalogItemsByRole
} from '../../dst/material-catalog';
import {
  checkMemberCapacity,
  generateOptimizationRecommendation,
  OptimizationRecommendation
} from '../../dst/design-engine';
import { SectionViewer } from './SectionViewer';
import {
  Layers,
  Box,
  Cpu,
  Info,
  ShieldCheck,
  Zap,
  Wrench,
  Compass,
  Tag,
  DollarSign,
  Activity,
  ChevronDown,
  ChevronUp,
  Copy,
  Check,
  BarChart2,
  Atom,
  X,
  RefreshCw,
  TrendingUp,
  AlertTriangle,
  Sliders,
  Sparkles,
  ArrowRight
} from 'lucide-react';

export interface ElementInspectorProps {
  project: DSTProject;
  selectedElementId: string | null;
  selectedType: 'MEMBER' | 'NODE' | 'FOUNDATION' | 'CONNECTION';
  onClose?: () => void;
  onUpdateParams?: (updated: Record<string, any>) => void;
}

type InspectorTab = 'ALL' | 'MATERIAL' | 'SECTION' | 'STABILITY' | 'FABRICATION';

export const ElementInspector: React.FC<ElementInspectorProps> = ({
  project,
  selectedElementId,
  selectedType,
  onClose,
  onUpdateParams
}) => {
  const [activeTab, setActiveTab] = useState<InspectorTab>('ALL');
  const [copiedSku, setCopiedSku] = useState<string | null>(null);
  const [previewOverrideCatalogId, setPreviewOverrideCatalogId] = useState<string | null>(null);

  const [expandedSections, setExpandedSections] = useState<{
    materialRecord: boolean;
    mechanicalProps: boolean;
    sectionProperties: boolean;
    stability: boolean;
    capacity: boolean;
    fabrication: boolean;
    connectivity: boolean;
  }>({
    materialRecord: true,
    mechanicalProps: true,
    sectionProperties: true,
    stability: true,
    capacity: true,
    fabrication: true,
    connectivity: true
  });

  const toggleSection = (sectionKey: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({ ...prev, [sectionKey]: !prev[sectionKey] }));
  };

  // Find selected item in project
  const member = project.members.find((m) => m.id === selectedElementId);
  const node = project.nodes.find((n) => n.id === selectedElementId);
  const foundation = project.foundation?.elements.find((f) => f.id === selectedElementId);
  const connection = project.connections.find((c) => c.id === selectedElementId);

  // Copy helper
  const handleCopySku = (sku: string) => {
    navigator.clipboard.writeText(sku);
    setCopiedSku(sku);
    setTimeout(() => setCopiedSku(null), 2000);
  };

  // If nothing is selected, display System Overview Inspector
  if (!selectedElementId || (!member && !node && !foundation && !connection)) {
    return (
      <aside className="w-88 h-full bg-[#04070C] border-l border-[#0D1620] flex flex-col z-30 select-none overflow-hidden text-[#8A949D]">
        <div className="p-3 border-b border-[#0D1620] bg-[#020307] flex items-center justify-between">
          <span className="text-[11px] font-orbitron font-bold text-[#F2F7F7] tracking-wider flex items-center gap-1.5">
            <Info size={13} className="text-[#00E5FF]" />
            PROPIEDADES GLOBALES (LIVING HUB)
          </span>
          <span className="text-[8.5px] font-mono-tech px-1.5 py-0.5 bg-[#39E58C]/15 text-[#39E58C] border border-[#39E58C]/30 font-bold">
            SISTEMA ACTIVO
          </span>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-3.5 text-[10px] font-mono-tech custom-scrollbar">
          {/* General Specs */}
          <div className="p-2.5 bg-[#070D16] border border-[#0D1E30] space-y-2">
            <span className="text-[10px] font-orbitron text-[#4CC9FF] block border-b border-[#112338] pb-1 flex items-center justify-between">
              <span>GEOMETRÍA PRINCIPAL</span>
              <span className="text-[8px] text-[#8A949D]">PARAMÉTRICO 3D</span>
            </span>
            <div className="grid grid-cols-2 gap-1.5 text-[8.5px] text-[#8A949D]">
              <div>CLARO (SPAN):</div>
              <div className="text-[#F2F7F7] font-bold text-right">{project.geometry.width.value} m</div>
              <div>LONGITUD TOTAL:</div>
              <div className="text-[#F2F7F7] font-bold text-right">{project.geometry.length.value} m</div>
              <div>ALTURA ALERO:</div>
              <div className="text-[#F2F7F7] font-bold text-right">{project.geometry.height.value} m</div>
              <div>CERCHAS:</div>
              <div className="text-[#00E5FF] font-bold text-right">{project.roof?.trusses.length || 0} MARCOS</div>
              <div>TOTAL MIEMBROS:</div>
              <div className="text-[#39E58C] font-bold text-right">{project.members.length} ELEMENTOS</div>
            </div>
          </div>

          {/* Prompt to select element */}
          <div className="p-4 bg-[#08101A] border border-dashed border-[#00E5FF]/40 text-center space-y-2.5 shadow-[0_0_15px_rgba(0,229,255,0.05)]">
            <Cpu size={26} className="mx-auto text-[#00E5FF] animate-pulse" />
            <div className="text-[11px] font-orbitron font-bold text-[#F2F7F7]">
              LIVING HUB TELEMETRY READY
            </div>
            <p className="text-[8.5px] text-[#8A949D] leading-relaxed">
              Selecciona cualquier elemento en el árbol de navegación o en el visor 3D para activar la telemetría viva de materiales, normas ASTM/AISC, capacidades plásticas, cálculo de esbeltez y orden de fabricación CNC.
            </p>
          </div>
        </div>
      </aside>
    );
  }

  // ============================================================
  // RENDER MEMBER INSPECTION
  // ============================================================
  if (member) {
    const startNodeObj = project.nodes.find((n) => n.id === member.startNode);
    const endNodeObj = project.nodes.find((n) => n.id === member.endNode);

    // Resolve bound catalog item ID from member or temporary preview override
    const defaultCatalogItemId =
      member.catalogItemId ||
      member.material?.catalogItemId ||
      member.section?.catalogItemId ||
      (member.role === 'COLUMN' ? 'prod-mx-hss-6x4-14' : member.role === 'PURLIN' ? 'prod-mx-monten-c-6x2-cal14' : 'prod-mx-ptr-4x4-cal11');

    const activeCatalogItemId = previewOverrideCatalogId || defaultCatalogItemId;

    // Dynamically fetch full MaterialRecord from registry
    const materialRecord: MaterialRecord = getMaterialCatalogItem(activeCatalogItemId);

    const isCompact = materialRecord.estabilidadYEsbeltez?.clasificacionSeccionAISC === 'COMPACTA';
    const isOverridden = previewOverrideCatalogId !== null && previewOverrideCatalogId !== defaultCatalogItemId;

    // Calculated Structural Capacities (AISC 360 LRFD)
    const lengthM = member.geometry?.length?.value || 1;
    const fyMPa = materialRecord.propiedadesMecanicas.limiteFluencia_Fy_MPa;
    const agCm2 = materialRecord.geometriaSeccion.areaSeccion_cm2;
    const zxCm3 = materialRecord.propiedadesEstructuralesSeccion.moduloSeccionPlastico_Zx_cm3;
    const sxCm3 = materialRecord.propiedadesEstructuralesSeccion.moduloSeccionElastico_Sx_cm3;
    const rxCm = materialRecord.propiedadesEstructuralesSeccion.radioGiro_rx_cm;
    const ryCm = materialRecord.propiedadesEstructuralesSeccion.radioGiro_ry_cm;
    const rMinCm = Math.min(rxCm, ryCm || rxCm);

    // Axial nominal yield capacity Pn = Fy * Ag (kN)
    const pnYieldKn = Math.round((fyMPa * agCm2 * 100) / 1000);
    // Plastic flexural capacity Mp = Fy * Zx (kN·m)
    const mpKnM = Math.round((fyMPa * zxCm3 * 1e-3 * 10) / 10);
    // Elastic flexural capacity My = Fy * Sx (kN·m)
    const myKnM = Math.round((fyMPa * sxCm3 * 1e-3 * 10) / 10);
    // Slenderness kL/r
    const slenderness = Math.round((lengthM * 100) / (rMinCm || 1));
    const slendernessStatus = slenderness <= 200 ? 'ADMISIBLE (≤ 200)' : 'EXCEDE LÍMITE (> 200)';

    // Piece Total Weight & Estimated Cost
    const totalPieceWeightKg = (materialRecord.geometriaSeccion.pesoLineal_kg_m * lengthM).toFixed(1);
    const unitPrice = materialRecord.metadatos.precioUnitarioEstimadoMXN;
    const estimatedPieceCost = Math.round(
      materialRecord.metadatos.unidadVenta === 'TRAMO_12M'
        ? (lengthM / 12) * unitPrice
        : materialRecord.metadatos.unidadVenta === 'TRAMO_6M'
        ? (lengthM / 6) * unitPrice
        : materialRecord.metadatos.unidadVenta === 'KG'
        ? parseFloat(totalPieceWeightKg) * unitPrice
        : (lengthM / 6) * unitPrice
    );

    // Dynamic AISC 360-22 Capacity Check & Optimization Recommendation for this member
    const memberForces = {
      memberId: member.id,
      Pu_kN: member.forces?.axialKn ?? (member.role === 'COLUMN' ? -120 : member.role.includes('CHORD') ? 65 : -25),
      Mux_kNm: member.forces?.momentKnM ?? (member.role === 'COLUMN' ? 18.5 : 0),
      Vx_kN: member.forces?.shearKn ?? (member.role === 'COLUMN' ? 12.0 : 0)
    };
    const memberCheck = checkMemberCapacity(member, memberForces, lengthM);
    const optimizationRec = generateOptimizationRecommendation(member, memberCheck);

    // Performance Color Coding
    const dcRatioValue = memberCheck.dcRatio;
    const isOverloaded = dcRatioValue > 1.0;
    const isModerateDemand = dcRatioValue >= 0.70 && dcRatioValue <= 1.0;
    const isOptimal = dcRatioValue < 0.70;

    const performanceColor = isOverloaded
      ? '#FF3B30'
      : isModerateDemand
      ? '#FFD700'
      : '#39E58C';

    const performanceLabel = isOverloaded
      ? 'SOBRECARGA (> 1.00)'
      : dcRatioValue > 0.95
      ? 'LÍMITE (0.95 - 1.00)'
      : isModerateDemand
      ? 'UTILIZACIÓN (0.70 - 0.95)'
      : 'ÓPTIMO (< 0.70)';

    // Alternative Catalog Profiles for Living Swapper
    const alternativeProfiles = getCatalogItemsByRole(member.role);

    return (
      <aside className="w-88 h-full bg-[#04070C] border-l border-[#0D1620] flex flex-col z-30 select-none overflow-hidden text-[#8A949D]">
        {/* Header */}
        <div className="p-3 border-b border-[#0D1620] bg-[#020307] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div
              className="w-2.5 h-2.5"
              style={{
                backgroundColor: performanceColor,
                boxShadow: `0 0 8px ${performanceColor}`
              }}
            />
            <div className="flex flex-col">
              <span className="text-[11px] font-orbitron font-black text-[#F2F7F7] tracking-wider">
                {member.id}
              </span>
              <span className="text-[8.5px] font-mono-tech text-[#00E5FF] font-bold">{member.role}</span>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <span
              className="text-[8px] font-orbitron px-2 py-0.5 font-bold rounded border"
              style={{
                color: performanceColor,
                borderColor: `${performanceColor}50`,
                backgroundColor: `${performanceColor}15`
              }}
            >
              D/C: {dcRatioValue.toFixed(2)}
            </span>
            <span className="text-[7.5px] font-orbitron px-1.5 py-0.5 bg-[#0A1626] text-[#00E5FF] border border-[#00E5FF]/30 font-bold">
              AISC 360
            </span>
            {onClose && (
              <button
                onClick={onClose}
                className="p-1 hover:bg-[#111C27] text-[#8A949D] hover:text-[#F2F7F7] transition-colors"
              >
                <X size={13} />
              </button>
            )}
          </div>
        </div>

        {/* Tab Filters */}
        <div className="flex border-b border-[#0D1620] bg-[#03060B] text-[8px] font-orbitron">
          {(['ALL', 'MATERIAL', 'SECTION', 'STABILITY', 'FABRICATION'] as InspectorTab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-1.5 px-1 text-center transition-colors border-b-2 ${
                activeTab === tab
                  ? 'border-[#00E5FF] text-[#00E5FF] bg-[#00E5FF]/10 font-bold'
                  : 'border-transparent text-[#8A949D] hover:text-[#F2F7F7]'
              }`}
            >
              {tab === 'ALL' ? 'TODOS' : tab === 'MATERIAL' ? 'MAT' : tab === 'SECTION' ? 'SEC' : tab === 'STABILITY' ? 'ESTAB' : 'FAB'}
            </button>
          ))}
        </div>

        {/* Scrollable Data Body */}
        <div className="flex-1 overflow-y-auto p-3 space-y-3 text-[10px] font-mono-tech custom-scrollbar">
          {/* ============================================================ */}
          {/* 0. REAL-TIME D/C RATIO METER (DEMAND / CAPACITY AISC 360-22) */}
          {/* ============================================================ */}
          {(() => {
            const dc = memberCheck.dcRatio;
            let statusColor = '#39E58C';
            let statusBg = 'bg-[#39E58C]';
            let statusBorder = 'border-[#39E58C]/40';
            let statusText = 'text-[#39E58C]';
            let statusLabel = 'ÓPTIMO (< 0.70)';
            let glowShadow = 'shadow-[0_0_15px_rgba(57,229,140,0.15)]';

            if (dc > 1.0) {
              statusColor = '#FF3B30';
              statusBg = 'bg-[#FF3B30]';
              statusBorder = 'border-[#FF3B30]';
              statusText = 'text-[#FF3B30]';
              statusLabel = 'SOBRECARGA AISC (> 1.00)';
              glowShadow = 'shadow-[0_0_20px_rgba(255,59,48,0.35)]';
            } else if (dc >= 0.95) {
              statusColor = '#FF9900';
              statusBg = 'bg-[#FF9900]';
              statusBorder = 'border-[#FF9900]/70';
              statusText = 'text-[#FF9900]';
              statusLabel = 'LÍMITE CRÍTICO (0.95 - 1.00)';
              glowShadow = 'shadow-[0_0_15px_rgba(255,153,0,0.25)]';
            } else if (dc >= 0.70) {
              statusColor = '#FFD700';
              statusBg = 'bg-[#FFD700]';
              statusBorder = 'border-[#FFD700]/60';
              statusText = 'text-[#FFD700]';
              statusLabel = 'ALTA UTILIZACIÓN (0.70 - 0.95)';
              glowShadow = 'shadow-[0_0_15px_rgba(255,215,0,0.2)]';
            }

            // Calculate percentage width for visual gauge (capped at 100%, scaling 0 to 1.20)
            const gaugePercentage = Math.min(100, Math.max(4, (dc / 1.20) * 100));

            return (
              <div
                id={`meter-dc-ratio-${member.id}`}
                className={`p-3 bg-[#050B14] border ${statusBorder} rounded-lg ${glowShadow} space-y-2.5 transition-all`}
              >
                {/* Meter Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Activity size={13} className={statusText} />
                    <span className="text-[10px] font-orbitron font-black text-white tracking-wider">
                      RATIO D/C EN TIEMPO REAL
                    </span>
                  </div>
                  <div className={`px-2 py-0.5 rounded text-[10px] font-orbitron font-black text-black ${statusBg}`}>
                    D/C: {dc.toFixed(2)}
                  </div>
                </div>

                {/* Progress Bar Gauge */}
                <div className="space-y-1">
                  <div className="relative w-full h-3 bg-[#02050A] rounded-full overflow-hidden border border-[#0D1C2E]">
                    {/* Background Zone Markers */}
                    <div className="absolute inset-0 flex text-[6.5px] font-mono pointer-events-none opacity-30">
                      <div className="w-[58.3%] border-r border-[#39E58C]/50" title="Zona Verde: < 0.70" />
                      <div className="w-[20.8%] border-r border-[#FFD700]/50" title="Zona Amarilla: 0.70 - 0.95" />
                      <div className="w-[4.2%] border-r border-[#FF9900]/50" title="Zona Naranja: 0.95 - 1.00" />
                      <div className="flex-1 bg-[#FF3B30]/10" title="Zona Roja: > 1.00" />
                    </div>

                    {/* Active Fill Bar */}
                    <div
                      className="h-full rounded-full transition-all duration-300 relative"
                      style={{
                        width: `${gaugePercentage}%`,
                        backgroundColor: statusColor,
                        boxShadow: `0 0 10px ${statusColor}`
                      }}
                    />
                  </div>

                  {/* Marker Legend Scale */}
                  <div className="flex justify-between text-[7.5px] font-mono text-[#5E6872] px-0.5">
                    <span>0.00</span>
                    <span className="text-[#39E58C]">0.70</span>
                    <span className="text-[#FFD700]">0.95</span>
                    <span className="text-[#FF3B30] font-bold">1.00 (LÍMITE)</span>
                    <span>1.20+</span>
                  </div>
                </div>

                {/* Performance Status & Limit State Readout */}
                <div className="p-2 bg-[#02050A] border border-[#0D1C2E] rounded space-y-1.5 text-[8.5px]">
                  <div className="flex items-center justify-between">
                    <span className="text-[#8A949D]">ESTADO DE EFICIENCIA:</span>
                    <span className={`font-orbitron font-bold ${statusText}`}>
                      {statusLabel}
                    </span>
                  </div>

                  <div className="flex items-center justify-between border-t border-[#0D1C2E] pt-1 text-[#8A949D]">
                    <span>ESTADO LÍMITE GOBERNANTE:</span>
                    <span className="text-[#00E5FF] font-bold truncate max-w-[170px]" title={memberCheck.governingLimitState}>
                      {memberCheck.governingLimitState}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-1.5 border-t border-[#0D1C2E] pt-1 text-[8px]">
                    <div className="flex justify-between">
                      <span className="text-[#5E6872]">Pu SOLICITANTE:</span>
                      <span className="text-[#F2F7F7] font-bold">{Math.abs(memberForces.Pu_kN).toFixed(1)} kN</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#5E6872]">phi*Pn DISEÑO:</span>
                      <span className="text-[#39E58C] font-bold">{memberCheck.phi_Pn_kN.toFixed(1)} kN</span>
                    </div>
                    {memberCheck.deflectionRatio !== undefined && (
                      <div className="col-span-2 flex justify-between pt-0.5 border-t border-[#0D1C2E]/60 text-[7.5px]">
                        <span className="text-[#5E6872]">FLECHA SERVICIO (L/360):</span>
                        <span className={`font-bold ${memberCheck.deflectionRatio <= 1.0 ? 'text-[#39E58C]' : 'text-[#FFD700]'}`}>
                          {memberCheck.deflectionRatio <= 1.0 ? 'CUMPLE RIGIDEZ' : 'FALLO FLECHA L/360'} (D/C: {memberCheck.deflectionRatio.toFixed(2)})
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })()}

          {/* ============================================================ */}
          {/* 0.1 STRUCTURAL OPTIMIZATION RECOMMENDATION (D/C > 1.0)       */}
          {/* ============================================================ */}
          {optimizationRec && (
            <div
              id={`opt-recommendation-${member.id}`}
              className="p-3 bg-[#FF3B30]/10 border border-[#FF3B30] rounded-lg shadow-[0_0_20px_rgba(255,59,48,0.3)] space-y-2.5"
            >
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-[10px] font-orbitron font-black text-[#FF3B30]">
                  <AlertTriangle size={13} className="text-[#FF3B30] animate-pulse" />
                  PROPUESTA DE OPTIMIZACIÓN DE CALIBRE
                </span>
                <span className="text-[8px] font-mono font-bold px-1.5 py-0.5 bg-[#FF3B30] text-white rounded">
                  D/C: {optimizationRec.currentDcRatio.toFixed(2)} &gt; 1.00
                </span>
              </div>

              <p className="text-[8.5px] text-[#F2F7F7] leading-relaxed">
                {optimizationRec.reason}
              </p>

              <div className="p-2.5 bg-[#000000]/80 border border-[#FF3B30]/40 rounded space-y-2 text-[8px]">
                {/* Current Gauge vs Proposed Upgrade */}
                <div className="grid grid-cols-2 gap-1.5 pb-2 border-b border-[#FF3B30]/20">
                  <div className="flex flex-col">
                    <span className="text-[#8A949D] text-[7.5px]">CALIBRE ACTUAL:</span>
                    <span className="text-white font-bold">{optimizationRec.currentGaugeOrThickness || 'Estándar'}</span>
                    <span className="text-[#5E6872] text-[7px] truncate">{optimizationRec.currentProfileDesignation}</span>
                  </div>
                  <div className="flex flex-col border-l border-[#FF3B30]/30 pl-2">
                    <span className="text-[#FFD700] text-[7.5px] flex items-center gap-0.5">
                      <Sparkles size={9} className="text-[#FFD700]" />
                      CALIBRE PROPUESTO:
                    </span>
                    <span className="text-[#FFD700] font-bold text-[8.5px]">{optimizationRec.recommendedGaugeOrThickness}</span>
                    <span className="text-[#00E5FF] text-[7px] truncate">{optimizationRec.recommendedProfile.designation}</span>
                  </div>
                </div>

                {/* Capacity Gain and Projected D/C */}
                <div className="grid grid-cols-3 gap-1 text-[7.5px] text-[#8A949D]">
                  <div className="flex flex-col">
                    <span>GANANCIA CAPACIDAD:</span>
                    <span className="text-[#39E58C] font-bold text-[8.5px]">+{optimizationRec.capacityGainPct}%</span>
                  </div>
                  <div className="flex flex-col border-x border-[#FF3B30]/20 px-1">
                    <span>INCREMENTO PESO:</span>
                    <span className="text-[#F2F7F7] font-bold text-[8.5px]">+{optimizationRec.weightDeltaKgM} kg/m</span>
                  </div>
                  <div className="flex flex-col text-right">
                    <span>D/C PROYECTADO:</span>
                    <span className="text-[#39E58C] font-bold text-[8.5px]">~{optimizationRec.expectedDcRatio.toFixed(2)} (OK)</span>
                  </div>
                </div>
              </div>

              {onUpdateParams && (
                <button
                  id="btn-apply-opt-recommendation"
                  onClick={() => {
                    if (optimizationRec.suggestedParamKey) {
                      onUpdateParams({
                        [optimizationRec.suggestedParamKey]: optimizationRec.recommendedProfile
                      });
                    }
                  }}
                  className="w-full py-2 px-3 bg-gradient-to-r from-[#FF3B30] via-[#E02424] to-[#C81E1E] hover:from-[#FF5347] hover:to-[#FF3B30] active:scale-98 text-white font-orbitron font-bold text-[9px] rounded flex items-center justify-center gap-1.5 shadow-[0_0_15px_rgba(255,59,48,0.7)] transition-all cursor-pointer border border-[#FF8888]/40"
                >
                  <Sparkles size={12} className="text-[#FFD700] animate-spin" />
                  <span>APLICAR MEJORA DE CALIBRE (1-CLIC)</span>
                  <ArrowRight size={12} />
                </button>
              )}
            </div>
          )}

          {/* ============================================================ */}
          {/* 1. LIVING PROFILE SWAPPER & REGISTRY COMPARATOR MATRIX       */}
          {/* ============================================================ */}
          <div className="p-2.5 bg-[#060D17] border border-[#00E5FF]/40 space-y-2 shadow-[0_0_12px_rgba(0,229,255,0.06)]">
            <div className="flex items-center justify-between text-[9.5px] font-orbitron text-[#00E5FF] border-b border-[#0E2032] pb-1">
              <span className="flex items-center gap-1 font-bold">
                <Sliders size={11} className="text-[#00E5FF]" />
                INTERCAMBIADOR VIVO DE PERFIL
              </span>
              {isOverridden && (
                <button
                  onClick={() => setPreviewOverrideCatalogId(null)}
                  className="text-[7.5px] px-1 py-0.2 bg-[#EAB308]/20 text-[#EAB308] border border-[#EAB308]/40 hover:bg-[#EAB308]/30 font-mono-tech flex items-center gap-0.5"
                >
                  <RefreshCw size={9} /> REESTABLECER
                </button>
              )}
            </div>

            <div className="space-y-1">
              <label className="text-[8px] text-[#5E6872] block">SELECCIONAR PERFIL DEL CATÁLOGO VIVO:</label>
              <select
                value={activeCatalogItemId}
                onChange={(e) => setPreviewOverrideCatalogId(e.target.value)}
                className="w-full bg-[#09121E] border border-[#142A42] text-[#F2F7F7] text-[9px] font-mono-tech px-2 py-1 outline-none focus:border-[#00E5FF]"
              >
                {alternativeProfiles.map((item) => (
                  <option key={item.metadatos.id} value={item.metadatos.id}>
                    {item.metadatos.nombreComercial} ({item.geometriaSeccion.pesoLineal_kg_m} kg/m)
                  </option>
                ))}
              </select>
            </div>

            {/* Quick Delta Comparison Badges */}
            <div className="grid grid-cols-3 gap-1 text-[8px] bg-[#02050A] p-1.5 border border-[#0D1A29]">
              <div className="flex flex-col">
                <span className="text-[#5E6872]">PESO PIEZA</span>
                <span className="text-[#00E5FF] font-bold">{totalPieceWeightKg} kg</span>
              </div>
              <div className="flex flex-col border-x border-[#0D1A29] px-1">
                <span className="text-[#5E6872]">INERCIA Ix</span>
                <span className="text-[#F2F7F7] font-bold">{materialRecord.propiedadesEstructuralesSeccion.momentoInercia_Ix_cm4} cm⁴</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[#5E6872]">COSTO EST.</span>
                <span className="text-[#39E58C] font-bold">${estimatedPieceCost.toLocaleString('es-MX')} MXN</span>
              </div>
            </div>
          </div>

          {/* 2. 2D Section Profile Visualization */}
          {(activeTab === 'ALL' || activeTab === 'SECTION') && (
            <SectionViewer section={member.section} />
          )}

          {/* ============================================================ */}
          {/* 3. DYNAMIC FULL MATERIAL RECORD (FROM REGISTRY)               */}
          {/* ============================================================ */}
          {(activeTab === 'ALL' || activeTab === 'MATERIAL') && (
            <div className="p-2.5 bg-[#070D16] border border-[#00E5FF]/30 space-y-2 shadow-[0_0_10px_rgba(0,229,255,0.06)]">
              <div
                onClick={() => toggleSection('materialRecord')}
                className="cursor-pointer flex items-center justify-between border-b border-[#0E2032] pb-1 text-[10px] font-orbitron text-[#00E5FF]"
              >
                <span className="flex items-center gap-1.5 font-bold">
                  <Tag size={12} className="text-[#00E5FF]" />
                  REGISTRO DE MATERIAL AISC / ASTM
                </span>
                <div className="flex items-center gap-1">
                  <span
                    className={`text-[7.5px] font-bold px-1 py-0.2 border ${
                      isCompact
                        ? 'bg-[#39E58C]/15 text-[#39E58C] border-[#39E58C]/30'
                        : 'bg-[#EAB308]/15 text-[#EAB308] border-[#EAB308]/30'
                    }`}
                  >
                    {materialRecord.estabilidadYEsbeltez?.clasificacionSeccionAISC || 'COMPACTA'}
                  </span>
                  {expandedSections.materialRecord ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                </div>
              </div>

              {expandedSections.materialRecord && (
                <div className="space-y-2 pt-0.5">
                  <div>
                    <div className="text-[10.5px] font-orbitron font-bold text-[#F2F7F7] leading-tight">
                      {materialRecord.metadatos.nombreComercial}
                    </div>
                    <div className="flex items-center justify-between text-[8px] text-[#8A949D] mt-0.5">
                      <div className="flex items-center gap-1">
                        <span>SKU: <span className="text-[#00E5FF] font-bold">{materialRecord.metadatos.sku}</span></span>
                        <button
                          onClick={() => handleCopySku(materialRecord.metadatos.sku)}
                          className="hover:text-white"
                          title="Copiar SKU"
                        >
                          {copiedSku === materialRecord.metadatos.sku ? <Check size={10} className="text-[#39E58C]" /> : <Copy size={10} />}
                        </button>
                      </div>
                      <span className="text-[#39E58C] font-bold">{materialRecord.metadatos.categoria}</span>
                    </div>
                  </div>

                  {/* Commercial & Supplier Metadata */}
                  <div className="grid grid-cols-2 gap-1 text-[8px] pt-1.5 border-t border-[#0E2032]">
                    <span className="text-[#5E6872]">PROVEEDOR:</span>
                    <span className="text-[#F2F7F7] text-right truncate font-bold">
                      {materialRecord.metadatos.fabricanteOProveedor}
                    </span>
                    <span className="text-[#5E6872]">PAÍS ORIGEN:</span>
                    <span className="text-[#F2F7F7] text-right font-bold">
                      {materialRecord.metadatos.paisOrigen}
                    </span>
                    <span className="text-[#5E6872]">UNIDAD VENTA:</span>
                    <span className="text-[#00E5FF] text-right font-bold">
                      {materialRecord.metadatos.unidadVenta}
                    </span>
                    <span className="text-[#5E6872]">PRECIO UNITARIO:</span>
                    <span className="text-[#39E58C] font-bold text-right">
                      ${materialRecord.metadatos.precioUnitarioEstimadoMXN.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN
                    </span>
                  </div>

                  {/* Certified Standards */}
                  <div className="pt-1.5 border-t border-[#0E2032]">
                    <div className="text-[7.5px] text-[#5E6872] mb-1">NORMAS & ESPECIFICACIONES CUMPLIDAS:</div>
                    <div className="flex flex-wrap gap-1">
                      {materialRecord.metadatos.normasCumplidas.map((norm, idx) => (
                        <span
                          key={idx}
                          className="text-[7px] px-1 py-0.5 bg-[#081524] text-[#4CC9FF] border border-[#0F2844]"
                        >
                          {norm}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ============================================================ */}
          {/* 4. MECHANICAL PROPERTIES (ASTM Standards)                    */}
          {/* ============================================================ */}
          {(activeTab === 'ALL' || activeTab === 'MATERIAL') && (
            <div className="p-2.5 bg-[#070D16] border border-[#0D1620] space-y-1.5">
              <div
                onClick={() => toggleSection('mechanicalProps')}
                className="cursor-pointer flex items-center justify-between border-b border-[#0E2032] pb-1 text-[10px] font-orbitron text-[#4CC9FF]"
              >
                <span className="flex items-center gap-1.5 font-bold">
                  <Atom size={12} className="text-[#4CC9FF]" />
                  PROPIEDADES MECÁNICAS (ASTM)
                </span>
                <div className="flex items-center gap-1">
                  <span className="text-[#8A949D] text-[8px]">
                    {materialRecord.propiedadesMecanicas.tipoAcero}
                  </span>
                  {expandedSections.mechanicalProps ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                </div>
              </div>

              {expandedSections.mechanicalProps && (
                <div className="grid grid-cols-2 gap-1.5 text-[8px] text-[#8A949D] pt-0.5">
                  <span>ESFUERZO FLUENCIA (Fy):</span>
                  <span className="text-[#00E5FF] font-bold text-right">
                    {materialRecord.propiedadesMecanicas.limiteFluencia_Fy_MPa} MPa
                  </span>
                  <span>ESFUERZO TRACCIÓN (Fu):</span>
                  <span className="text-[#F2F7F7] font-bold text-right">
                    {materialRecord.propiedadesMecanicas.resistenciaTraccion_Fu_MPa} MPa
                  </span>
                  <span>MÓDULO ELASTICIDAD (E):</span>
                  <span className="text-[#F2F7F7] text-right font-bold">
                    {materialRecord.propiedadesMecanicas.moduloElasticidad_E_GPa} GPa
                  </span>
                  <span>MÓDULO CORTANTE (G):</span>
                  <span className="text-[#F2F7F7] text-right font-bold">
                    {materialRecord.propiedadesMecanicas.moduloCortante_G_GPa} GPa
                  </span>
                  <span>COEFICIENTE POISSON (ν):</span>
                  <span className="text-[#F2F7F7] text-right">
                    {materialRecord.propiedadesMecanicas.coeficientePoisson}
                  </span>
                  <span>ELONGACIÓN MÍNIMA:</span>
                  <span className="text-[#39E58C] font-bold text-right">
                    {materialRecord.propiedadesMecanicas.elongacionMinima_porcentaje}%
                  </span>
                </div>
              )}
            </div>
          )}

          {/* ============================================================ */}
          {/* 5. STRUCTURAL SECTION PROPERTIES (Inertia, Moduli, Radii)     */}
          {/* ============================================================ */}
          {(activeTab === 'ALL' || activeTab === 'SECTION') && (
            <div className="p-2.5 bg-[#070D16] border border-[#0D1620] space-y-1.5">
              <div
                onClick={() => toggleSection('sectionProperties')}
                className="cursor-pointer flex items-center justify-between border-b border-[#0E2032] pb-1 text-[10px] font-orbitron text-[#00E5FF]"
              >
                <span className="flex items-center gap-1.5 font-bold">
                  <BarChart2 size={12} className="text-[#00E5FF]" />
                  PROPIEDADES DE SECCIÓN & INERCIA
                </span>
                <div className="flex items-center gap-1">
                  <span className="text-[7.5px] text-[#39E58C] font-bold">
                    {materialRecord.geometriaSeccion.areaSeccion_cm2} cm²
                  </span>
                  {expandedSections.sectionProperties ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                </div>
              </div>

              {expandedSections.sectionProperties && (
                <div className="space-y-1.5 pt-0.5">
                  {/* Geometric dimensions */}
                  <div className="grid grid-cols-2 gap-1 text-[8px] text-[#8A949D]">
                    <span>ALTO TOTAL (d):</span>
                    <span className="text-[#F2F7F7] text-right font-bold">{materialRecord.geometriaSeccion.altoTotal_mm} mm</span>
                    <span>ANCHO TOTAL (b):</span>
                    <span className="text-[#F2F7F7] text-right font-bold">{materialRecord.geometriaSeccion.anchoTotal_mm} mm</span>
                    <span>ESPESOR PARED / ALMA (t):</span>
                    <span className="text-[#F2F7F7] text-right font-bold">{materialRecord.geometriaSeccion.espesorPared_mm} mm</span>
                    <span>PESO LINEAL (w):</span>
                    <span className="text-[#39E58C] font-bold text-right">{materialRecord.geometriaSeccion.pesoLineal_kg_m} kg/m</span>
                    <span>ÁREA SECCIÓN (Ag):</span>
                    <span className="text-[#00E5FF] font-bold text-right">{materialRecord.geometriaSeccion.areaSeccion_cm2} cm²</span>
                  </div>

                  {/* Structural Inertial Engineering Values */}
                  <div className="grid grid-cols-2 gap-1 text-[8px] pt-1.5 border-t border-[#0E2032] text-[#8A949D]">
                    <span>INERCIA Ix (EJE FUERTE):</span>
                    <span className="text-[#00E5FF] font-bold text-right">
                      {materialRecord.propiedadesEstructuralesSeccion.momentoInercia_Ix_cm4} cm⁴
                    </span>
                    <span>INERCIA Iy (EJE DÉBIL):</span>
                    <span className="text-[#00E5FF] font-bold text-right">
                      {materialRecord.propiedadesEstructuralesSeccion.momentoInercia_Iy_cm4} cm⁴
                    </span>
                    <span>MÓDULO ELÁSTICO Sx:</span>
                    <span className="text-[#F2F7F7] text-right font-bold">
                      {materialRecord.propiedadesEstructuralesSeccion.moduloSeccionElastico_Sx_cm3} cm³
                    </span>
                    <span>MÓDULO PLÁSTICO Zx:</span>
                    <span className="text-[#39E58C] font-bold text-right">
                      {materialRecord.propiedadesEstructuralesSeccion.moduloSeccionPlastico_Zx_cm3} cm³
                    </span>
                    <span>RADIO GIRO rx:</span>
                    <span className="text-[#F2F7F7] text-right font-bold">
                      {materialRecord.propiedadesEstructuralesSeccion.radioGiro_rx_cm} cm
                    </span>
                    <span>RADIO GIRO ry:</span>
                    <span className="text-[#F2F7F7] text-right font-bold">
                      {materialRecord.propiedadesEstructuralesSeccion.radioGiro_ry_cm} cm
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ============================================================ */}
          {/* 6. STRUCTURAL CAPACITY & RESISTANCE HUD GAUGE                */}
          {/* ============================================================ */}
          {(activeTab === 'ALL' || activeTab === 'STABILITY') && (
            <div className="p-2.5 bg-[#070D16] border border-[#0D1620] space-y-1.5">
              <div
                onClick={() => toggleSection('capacity')}
                className="cursor-pointer flex items-center justify-between border-b border-[#0E2032] pb-1 text-[10px] font-orbitron text-[#39E58C]"
              >
                <span className="flex items-center gap-1.5 font-bold">
                  <TrendingUp size={12} className="text-[#39E58C]" />
                  CAPACIDAD RESISTENTE (AISC 360)
                </span>
                {expandedSections.capacity ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
              </div>

              {expandedSections.capacity && (
                <div className="space-y-2 pt-0.5 text-[8px] text-[#8A949D]">
                  <div className="grid grid-cols-2 gap-1">
                    <span>CAPACIDAD AXIAL FLUENCIA (Pn):</span>
                    <span className="text-[#00E5FF] font-bold text-right">{pnYieldKn} kN</span>
                    <span>MOMENTO PLÁSTICO (Mp):</span>
                    <span className="text-[#39E58C] font-bold text-right">{mpKnM} kN·m</span>
                    <span>MOMENTO ELÁSTICO (My):</span>
                    <span className="text-[#F2F7F7] font-bold text-right">{myKnM} kN·m</span>
                    <span>ESBELTEZ GLOBAL (kL/r):</span>
                    <span className="text-[#00E5FF] font-bold text-right">{slenderness}</span>
                  </div>

                  {/* Slenderness Status Bar */}
                  <div className="p-1.5 bg-[#03060A] border border-[#0D1E30] flex items-center justify-between">
                    <span>ESTADO ESBELTEZ GLOBAL:</span>
                    <span className={`font-bold ${slenderness <= 200 ? 'text-[#39E58C]' : 'text-[#EAB308]'}`}>
                      {slendernessStatus}
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ============================================================ */}
          {/* 7. LOCAL STABILITY & AISC SLENDERNESS CLASSIFICATION         */}
          {/* ============================================================ */}
          {(activeTab === 'ALL' || activeTab === 'STABILITY') && (
            <div className="p-2.5 bg-[#070D16] border border-[#0D1620] space-y-1.5">
              <div
                onClick={() => toggleSection('stability')}
                className="cursor-pointer flex items-center justify-between border-b border-[#0E2032] pb-1 text-[10px] font-orbitron text-[#39E58C]"
              >
                <span className="flex items-center gap-1.5 font-bold">
                  <ShieldCheck size={12} className="text-[#39E58C]" />
                  ESTABILIDAD LOCAL AISC 360
                </span>
                {expandedSections.stability ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
              </div>

              {expandedSections.stability && (
                <div className="space-y-1.5 text-[8px] text-[#8A949D] pt-0.5">
                  <div className="grid grid-cols-2 gap-1">
                    {materialRecord.estabilidadYEsbeltez.relacion_b_t !== undefined && (
                      <>
                        <span>RELACIÓN b/t (PATÍN/ALA):</span>
                        <span className="text-[#F2F7F7] text-right font-bold">
                          {materialRecord.estabilidadYEsbeltez.relacion_b_t.toFixed(2)}
                        </span>
                      </>
                    )}
                    {materialRecord.estabilidadYEsbeltez.relacion_h_t !== undefined && (
                      <>
                        <span>RELACIÓN h/t (ALMA):</span>
                        <span className="text-[#F2F7F7] text-right font-bold">
                          {materialRecord.estabilidadYEsbeltez.relacion_h_t.toFixed(2)}
                        </span>
                      </>
                    )}
                    <span>CLASIFICACIÓN LOCAL:</span>
                    <span className="text-[#39E58C] font-bold text-right">
                      {materialRecord.estabilidadYEsbeltez.clasificacionSeccionAISC || 'COMPACTA'}
                    </span>
                  </div>

                  {materialRecord.estabilidadYEsbeltez.comportamientoCompresion && (
                    <div className="p-1.5 bg-[#040810] border border-[#0D1A29] text-[7.5px] text-[#8A949D] leading-tight">
                      <div className="text-[#4CC9FF] font-bold mb-0.5">COMPORTAMIENTO ANTE COMPRESIÓN:</div>
                      {materialRecord.estabilidadYEsbeltez.comportamientoCompresion}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ============================================================ */}
          {/* 8. FABRICATION & CUTTING TICKET                             */}
          {/* ============================================================ */}
          {(activeTab === 'ALL' || activeTab === 'FABRICATION') && (
            <div className="p-2.5 bg-[#070D16] border border-[#0D1620] space-y-1.5">
              <div
                onClick={() => toggleSection('fabrication')}
                className="cursor-pointer flex items-center justify-between border-b border-[#0E2032] pb-1 text-[10px] font-orbitron text-[#EAB308]"
              >
                <span className="flex items-center gap-1.5 font-bold">
                  <Wrench size={12} className="text-[#EAB308]" />
                  TICKET DE FABRICACIÓN CNC
                </span>
                <div className="flex items-center gap-1">
                  <span className="text-[#8A949D] text-[8px]">
                    {member.fabrication?.assemblyGroup || 'ENSAMBLE'}
                  </span>
                  {expandedSections.fabrication ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                </div>
              </div>

              {expandedSections.fabrication && (
                <div className="grid grid-cols-2 gap-1.5 text-[8px] text-[#8A949D] pt-0.5">
                  <span>MARCA DE PIEZA:</span>
                  <span className="text-[#00E5FF] font-bold text-right">{member.fabrication?.memberMark || member.id}</span>
                  <span>LONGITUD DE CORTE:</span>
                  <span className="text-[#39E58C] font-bold text-right">
                    {member.geometry.length.value.toFixed(3)} m
                  </span>
                  <span>ÁNGULO INICIAL:</span>
                  <span className="text-[#F2F7F7] text-right font-bold">{member.geometry.cutAngleStart ?? 90}°</span>
                  <span>ÁNGULO FINAL:</span>
                  <span className="text-[#F2F7F7] text-right font-bold">{member.geometry.cutAngleEnd ?? 90}°</span>
                  <span>BARRENOS / PERFORACIONES:</span>
                  <span className="text-[#F2F7F7] text-right font-bold">{member.fabrication?.holes ?? 0} BARRENOS</span>
                  <span>LONGITUD SOLDADURA:</span>
                  <span className="text-[#F2F7F7] text-right font-bold">
                    {member.fabrication?.weldLength.value || '0.25'} m (AWS D1.1)
                  </span>
                </div>
              )}
            </div>
          )}

          {/* ============================================================ */}
          {/* 9. GRAPH CONNECTIVITY COORDINATES                            */}
          {/* ============================================================ */}
          {(activeTab === 'ALL' || activeTab === 'SECTION') && (
            <div className="p-2.5 bg-[#070D16] border border-[#0D1620] space-y-1.5">
              <div
                onClick={() => toggleSection('connectivity')}
                className="cursor-pointer flex items-center justify-between border-b border-[#0E2032] pb-1 text-[10px] font-orbitron text-[#00E5FF]"
              >
                <span className="flex items-center gap-1.5 font-bold">
                  <Compass size={12} className="text-[#00E5FF]" />
                  CONECTIVIDAD EN EL GRAFO
                </span>
                {expandedSections.connectivity ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
              </div>

              {expandedSections.connectivity && (
                <div className="space-y-1 text-[8px] text-[#8A949D] pt-0.5">
                  <div className="flex justify-between">
                    <span>NODO INICIO [{member.startNode}]:</span>
                    <span className="text-[#F2F7F7] font-bold">
                      ({startNodeObj?.position.x.toFixed(2)}, {startNodeObj?.position.y.toFixed(2)}, {startNodeObj?.position.z.toFixed(2)})
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>NODO FINAL [{member.endNode}]:</span>
                    <span className="text-[#F2F7F7] font-bold">
                      ({endNodeObj?.position.x.toFixed(2)}, {endNodeObj?.position.y.toFixed(2)}, {endNodeObj?.position.z.toFixed(2)})
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </aside>
    );
  }

  // ============================================================
  // RENDER FOUNDATION ELEMENT INSPECTION
  // ============================================================
  if (foundation) {
    const basePlateCatalog = getMaterialCatalogItem(foundation.basePlate?.catalogItemId || 'prod-mx-placa-a36-34');
    const boltCatalog = getMaterialCatalogItem(foundation.anchorBolts?.[0]?.catalogItemId || 'prod-mx-perno-f1554-34');

    return (
      <aside className="w-88 h-full bg-[#04070C] border-l border-[#0D1620] flex flex-col z-30 select-none overflow-hidden text-[#8A949D]">
        <div className="p-3 border-b border-[#0D1620] bg-[#020307] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 bg-[#39E58C] shadow-[0_0_8px_#39E58C]" />
            <div className="flex flex-col">
              <span className="text-[11px] font-orbitron font-black text-[#F2F7F7] tracking-wider">
                {foundation.id}
              </span>
              <span className="text-[8.5px] font-mono-tech text-[#39E58C] font-bold">ZAPATA AISLADA + PEDESTAL</span>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-[7.5px] font-orbitron px-2 py-0.5 bg-[#39E58C]/15 text-[#39E58C] border border-[#39E58C]/30 font-bold">
              VERIFICADO
            </span>
            {onClose && (
              <button
                onClick={onClose}
                className="p-1 hover:bg-[#111C27] text-[#8A949D] hover:text-[#F2F7F7] transition-colors"
              >
                <X size={13} />
              </button>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-3 text-[10px] font-mono-tech custom-scrollbar">
          {/* Concrete Geometry */}
          <div className="p-2.5 bg-[#070D16] border border-[#0D1620] space-y-1.5">
            <span className="text-[10px] font-orbitron text-[#39E58C] block border-b border-[#0E2032] pb-1 flex items-center justify-between">
              <span className="font-bold">GEOMETRÍA DE CIMENTACIÓN</span>
              <span className="text-[8px] text-[#8A949D]">ACI 318</span>
            </span>
            <div className="grid grid-cols-2 gap-1.5 text-[8px] text-[#8A949D]">
              <span>DIMENSIONES (B × L):</span>
              <span className="text-[#F2F7F7] font-bold text-right">{foundation.width.value} × {foundation.length.value} m</span>
              <span>PERALTE TOTAL (H):</span>
              <span className="text-[#F2F7F7] font-bold text-right">{foundation.depth.value} m</span>
              <span>RESISTENCIA CONCRETO f'c:</span>
              <span className="text-[#00E5FF] font-bold text-right">{foundation.concreteStrength} kg/cm²</span>
              <span>VOLUMEN CONCRETO:</span>
              <span className="text-[#39E58C] font-bold text-right">
                {(foundation.width.value * foundation.length.value * foundation.depth.value).toFixed(2)} m³
              </span>
            </div>
          </div>

          {/* Base Plate Material Record */}
          <div className="p-2.5 bg-[#070D16] border border-[#00E5FF]/30 space-y-1.5 shadow-[0_0_12px_rgba(0,229,255,0.06)]">
            <span className="text-[10px] font-orbitron text-[#00E5FF] block border-b border-[#0E2032] pb-1 flex items-center justify-between">
              <span className="font-bold flex items-center gap-1">
                <Tag size={11} className="text-[#00E5FF]" />
                PLACA BASE ASTM A36
              </span>
              <span className="text-[7.5px] text-[#39E58C] font-bold px-1 bg-[#39E58C]/15 border border-[#39E58C]/30">
                AISC DG-01
              </span>
            </span>
            <div className="text-[9.5px] font-bold text-[#F2F7F7]">
              {basePlateCatalog.metadatos.nombreComercial}
            </div>
            <div className="grid grid-cols-2 gap-1 text-[8px] text-[#8A949D]">
              <span>DIMENSIÓN PLANTA:</span>
              <span className="text-[#F2F7F7] font-bold text-right">
                {foundation.basePlate ? `${foundation.basePlate.width.value * 100} × ${foundation.basePlate.height.value * 100} cm` : '35 × 35 cm'}
              </span>
              <span>ESPESOR NOMINAL:</span>
              <span className="text-[#F2F7F7] font-bold text-right">
                {foundation.basePlate ? `${(foundation.basePlate.thickness.value * 1000).toFixed(0)} mm (3/4")` : '19 mm (3/4")'}
              </span>
              <span>LÍMITE FLUENCIA (Fy):</span>
              <span className="text-[#00E5FF] font-bold text-right">{basePlateCatalog.propiedadesMecanicas.limiteFluencia_Fy_MPa} MPa</span>
              <span>PROVEEDOR:</span>
              <span className="text-[#F2F7F7] text-right truncate">{basePlateCatalog.metadatos.fabricanteOProveedor}</span>
              <span>PRECIO ESTIMADO:</span>
              <span className="text-[#39E58C] font-bold text-right">${basePlateCatalog.metadatos.precioUnitarioEstimadoMXN.toLocaleString('es-MX')} MXN</span>
            </div>
          </div>

          {/* Anchor Bolts Material Record */}
          <div className="p-2.5 bg-[#070D16] border border-[#0D1620] space-y-1.5">
            <span className="text-[10px] font-orbitron text-[#EAB308] block border-b border-[#0E2032] pb-1 flex items-center justify-between">
              <span className="font-bold flex items-center gap-1">
                <Wrench size={11} className="text-[#EAB308]" />
                PERNOS DE ANCLAJE ASTM F1554
              </span>
              <span className="text-[7.5px] text-[#EAB308] font-bold">Gr. 55</span>
            </span>
            <div className="grid grid-cols-2 gap-1 text-[8px] text-[#8A949D]">
              <span>CANTIDAD & DIÁMETRO:</span>
              <span className="text-[#00E5FF] font-bold text-right">
                {foundation.anchorBolts?.[0] ? `${foundation.anchorBolts[0].quantity}x Ø${(foundation.anchorBolts[0].diameter.value * 1000).toFixed(0)}mm (3/4")` : '4x Ø19mm (3/4")'}
              </span>
              <span>ESPECIFICACIÓN:</span>
              <span className="text-[#F2F7F7] font-bold text-right">{boltCatalog.metadatos.nombreComercial}</span>
              <span>ESFUERZO FLUENCIA:</span>
              <span className="text-[#00E5FF] font-bold text-right">{boltCatalog.propiedadesMecanicas.limiteFluencia_Fy_MPa} MPa</span>
              <span>PRECIO ESTIMADO/PZA:</span>
              <span className="text-[#39E58C] font-bold text-right">${boltCatalog.metadatos.precioUnitarioEstimadoMXN.toLocaleString('es-MX')} MXN</span>
            </div>
          </div>
        </div>
      </aside>
    );
  }

  // ============================================================
  // RENDER NODE / CONNECTION INSPECTION
  // ============================================================
  return (
    <aside className="w-88 h-full bg-[#04070C] border-l border-[#0D1620] flex flex-col z-30 select-none overflow-hidden text-[#8A949D]">
      <div className="p-3 border-b border-[#0D1620] bg-[#020307] flex items-center justify-between">
        <span className="text-[11px] font-orbitron font-bold text-[#F2F7F7]">
          ELEMENTO: {selectedElementId}
        </span>
        {onClose && (
          <button
            onClick={onClose}
            className="p-1 hover:bg-[#111C27] text-[#8A949D] hover:text-[#F2F7F7] transition-colors"
          >
            <X size={13} />
          </button>
        )}
      </div>
      <div className="p-3 text-[10px] font-mono-tech text-[#8A949D] space-y-2">
        <div className="p-2.5 bg-[#070D16] border border-[#0D1620]">
          <div className="text-[#00E5FF] font-bold mb-1">TIPO: {selectedType}</div>
          <div className="text-[8.5px]">
            Nodo estructural analítico y restricciones cinemáticas vinculadas en el grafo estructural.
          </div>
        </div>
      </div>
    </aside>
  );
};
