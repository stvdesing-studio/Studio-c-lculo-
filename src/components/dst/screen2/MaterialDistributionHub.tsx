// ============================================================
// STV CLOSER — MATERIAL, DISTRIBUTION & GAUGE CONTROL HUB
// MaterialDistributionHub.tsx
// Interactive Panel for Material Types, Role Mapping, Zone Distribution,
// Cold-Formed Gauges, Plate Thicknesses & Parametric Locks
// ============================================================

import React, { useState } from 'react';
import {
  Layers,
  Shield,
  Sliders,
  Lock,
  Unlock,
  Cpu,
  Boxes,
  HelpCircle,
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  Info,
  ChevronRight,
  Sparkles,
  Zap,
  Target
} from 'lucide-react';
import {
  MASTER_MATERIALS,
  COLD_FORMED_GAUGES,
  STRUCTURAL_PLATE_THICKNESSES,
  STRUCTURAL_ZONES,
  MemberStructuralRole,
  DistributionMode,
  StructuralZone,
  MemberRoleDistributionConfig,
  MaterialSpecification
} from '../../../dst/material-distribution';
import { SectionProfile } from '../../../dst/dst.schema';

interface MaterialDistributionHubProps {
  activeMaterialId: string;
  onSelectMaterial: (materialId: string) => void;
  roleDistributions: Record<MemberStructuralRole, MemberRoleDistributionConfig>;
  onUpdateRoleConfig: (role: MemberStructuralRole, updates: Partial<MemberRoleDistributionConfig>) => void;
  distributionMode: DistributionMode;
  onSelectDistributionMode: (mode: DistributionMode) => void;
  activeZoneId: StructuralZone;
  onSelectZone: (zoneId: StructuralZone) => void;
  isMixedModeEnabled: boolean;
  onToggleMixedMode: () => void;
}

export const MaterialDistributionHub: React.FC<MaterialDistributionHubProps> = ({
  activeMaterialId,
  onSelectMaterial,
  roleDistributions,
  onUpdateRoleConfig,
  distributionMode,
  onSelectDistributionMode,
  activeZoneId,
  onSelectZone,
  isMixedModeEnabled,
  onToggleMixedMode
}) => {
  const [activeTab, setActiveTab] = useState<'MATERIALS' | 'ROLES' | 'ZONES' | 'GAUGES'>('MATERIALS');
  const [selectedRoleForDetail, setSelectedRoleForDetail] = useState<MemberStructuralRole>('TOP_CHORD');

  const currentMat = MASTER_MATERIALS[activeMaterialId] || MASTER_MATERIALS.A500_B;
  const currentRoleConfig = roleDistributions[selectedRoleForDetail];

  return (
    <div
      id="material-distribution-hub"
      className="bg-[#0B101B]/95 border border-[#1E293B] rounded-xl p-4 flex flex-col gap-4 text-slate-200 shadow-2xl backdrop-blur-md"
    >
      {/* Header & Tabs */}
      <div className="flex items-center justify-between border-b border-[#1E293B] pb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#00E5FF]/10 border border-[#00E5FF]/30 flex items-center justify-center text-[#00E5FF]">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-100 flex items-center gap-2">
              Distribución de Materiales & Calibres
              <span className="px-1.5 py-0.5 rounded text-[9px] bg-[#00E5FF]/10 text-[#00E5FF] font-mono border border-[#00E5FF]/30">
                AISC / AISI
              </span>
            </h3>
            <p className="text-[11px] text-slate-400">
              Gramática de sección, calibres en frío, zonas y bloqueos paramétricos
            </p>
          </div>
        </div>

        {/* Mixed Mode Toggle */}
        <button
          id="toggle-mixed-materials-mode-btn"
          onClick={onToggleMixedMode}
          className={`px-2.5 py-1 rounded text-[11px] font-medium flex items-center gap-1.5 transition-all border ${
            isMixedModeEnabled
              ? 'bg-[#FF9100]/20 text-[#FFB74D] border-[#FF9100]/40 shadow-[0_0_12px_rgba(255,145,0,0.2)]'
              : 'bg-[#131C2E] text-slate-400 border-slate-700 hover:text-slate-200'
          }`}
          title="Permite asignar diferentes grados y perfiles a cada zona y miembro"
        >
          <Sparkles className="w-3 h-3" />
          {isMixedModeEnabled ? 'Modo Mixto: ACTIVO' : 'Modo Homogéneo'}
        </button>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="grid grid-cols-4 gap-1 p-1 bg-[#060A11] rounded-lg border border-[#1E293B]/70">
        <button
          id="tab-materials-btn"
          onClick={() => setActiveTab('MATERIALS')}
          className={`py-1.5 px-2 rounded text-[11px] font-semibold transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'MATERIALS'
              ? 'bg-[#00E5FF]/15 text-[#00E5FF] border border-[#00E5FF]/40 shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
          }`}
        >
          <Shield className="w-3.5 h-3.5" />
          01. Materiales
        </button>
        <button
          id="tab-roles-btn"
          onClick={() => setActiveTab('ROLES')}
          className={`py-1.5 px-2 rounded text-[11px] font-semibold transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'ROLES'
              ? 'bg-[#00E5FF]/15 text-[#00E5FF] border border-[#00E5FF]/40 shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
          }`}
        >
          <Boxes className="w-3.5 h-3.5" />
          02. Por Función
        </button>
        <button
          id="tab-zones-btn"
          onClick={() => setActiveTab('ZONES')}
          className={`py-1.5 px-2 rounded text-[11px] font-semibold transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'ZONES'
              ? 'bg-[#00E5FF]/15 text-[#00E5FF] border border-[#00E5FF]/40 shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
          }`}
        >
          <Target className="w-3.5 h-3.5" />
          03. Por Zonas
        </button>
        <button
          id="tab-gauges-btn"
          onClick={() => setActiveTab('GAUGES')}
          className={`py-1.5 px-2 rounded text-[11px] font-semibold transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'GAUGES'
              ? 'bg-[#00E5FF]/15 text-[#00E5FF] border border-[#00E5FF]/40 shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          04. Calibres
        </button>
      </div>

      {/* TAB 1: MASTER MATERIALS & MECHANICAL MATRIX */}
      {activeTab === 'MATERIALS' && (
        <div className="flex flex-col gap-3">
          <div className="text-[11px] text-slate-400 flex items-center justify-between">
            <span>Catálogo Metalúrgico Físico Real (Propiedades sin aproximaciones)</span>
            <span className="text-[#00E5FF] font-mono">10 Especificaciones Activas</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
            {Object.values(MASTER_MATERIALS).map((mat) => {
              const isSelected = mat.id === activeMaterialId;
              return (
                <button
                  key={mat.id}
                  id={`mat-select-${mat.id}`}
                  onClick={() => onSelectMaterial(mat.id)}
                  className={`p-2 rounded-lg border text-left flex flex-col justify-between transition-all ${
                    isSelected
                      ? 'bg-[#00E5FF]/15 border-[#00E5FF] text-white shadow-[0_0_15px_rgba(0,229,255,0.15)]'
                      : 'bg-[#131C2E] border-[#1E293B] text-slate-300 hover:border-slate-600 hover:bg-[#1A263D]'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-bold font-mono px-1 rounded bg-[#060A11] border border-slate-700 text-[#00E5FF]">
                        {mat.id}
                      </span>
                      {mat.isComplete ? (
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" title="Matriz de datos completa" />
                      ) : (
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400" title="Requiere datos" />
                      )}
                    </div>
                    <p className="text-[11px] font-semibold leading-tight line-clamp-1">{mat.name}</p>
                    <p className="text-[9px] text-slate-400 mt-0.5">{mat.grade}</p>
                  </div>

                  {mat.properties && (
                    <div className="mt-2 pt-1 border-t border-slate-700/50 flex justify-between text-[9px] font-mono text-slate-300">
                      <span>Fy: {mat.properties.fyMpa} MPa</span>
                      <span>E: {mat.properties.eGpa} GPa</span>
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Active Material Spec Sheet Card */}
          {currentMat.properties && (
            <div className="bg-[#080D17] border border-[#00E5FF]/30 rounded-lg p-3 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-[#00E5FF]" />
                  <h4 className="text-xs font-bold text-slate-100">{currentMat.name}</h4>
                </div>
                <span className="text-[10px] font-mono text-[#00E5FF] px-2 py-0.5 bg-[#00E5FF]/10 rounded border border-[#00E5FF]/30">
                  {currentMat.properties.standard}
                </span>
              </div>

              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 text-center text-[10px] font-mono mt-1">
                <div className="bg-[#111927] p-1.5 rounded border border-slate-800">
                  <div className="text-slate-400 text-[8px] uppercase">Límite Fluencia (Fy)</div>
                  <div className="text-emerald-400 font-bold mt-0.5">{currentMat.properties.fyMpa} MPa</div>
                </div>
                <div className="bg-[#111927] p-1.5 rounded border border-slate-800">
                  <div className="text-slate-400 text-[8px] uppercase">Resist. Última (Fu)</div>
                  <div className="text-[#00E5FF] font-bold mt-0.5">{currentMat.properties.fuMpa} MPa</div>
                </div>
                <div className="bg-[#111927] p-1.5 rounded border border-slate-800">
                  <div className="text-slate-400 text-[8px] uppercase">Módulo Elast. (E)</div>
                  <div className="text-amber-300 font-bold mt-0.5">{currentMat.properties.eGpa} GPa</div>
                </div>
                <div className="bg-[#111927] p-1.5 rounded border border-slate-800">
                  <div className="text-slate-400 text-[8px] uppercase">Módulo Corte (G)</div>
                  <div className="text-indigo-300 font-bold mt-0.5">{currentMat.properties.gGpa} GPa</div>
                </div>
                <div className="bg-[#111927] p-1.5 rounded border border-slate-800">
                  <div className="text-slate-400 text-[8px] uppercase">Densidad (ρ)</div>
                  <div className="text-slate-200 font-bold mt-0.5">{currentMat.properties.densityKgM3} kg/m³</div>
                </div>
                <div className="bg-[#111927] p-1.5 rounded border border-slate-800">
                  <div className="text-slate-400 text-[8px] uppercase">Poisson (ν)</div>
                  <div className="text-slate-200 font-bold mt-0.5">{currentMat.properties.poissonNu}</div>
                </div>
              </div>

              <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-800/80">
                <span>
                  <strong>Forma de producto:</strong> {currentMat.properties.productForm}
                </span>
                <span className="italic text-slate-500">{currentMat.notes}</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: STRUCTURAL ROLES & PARAMETRIC LOCKS */}
      {activeTab === 'ROLES' && (
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <span>Mapeo por Función Estructural & Bloqueos de Parámetros</span>
            <div className="flex items-center gap-2 text-[10px]">
              <span className="flex items-center gap-1 text-amber-400">
                <Lock className="w-2.5 h-2.5" /> Bloqueado
              </span>
              <span className="flex items-center gap-1 text-[#00E5FF]">
                <Unlock className="w-2.5 h-2.5" /> Paramétrico
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* Left: Role List */}
            <div className="flex flex-col gap-1.5 max-h-64 overflow-y-auto pr-1">
              {(Object.keys(roleDistributions) as MemberStructuralRole[]).map((role) => {
                const config = roleDistributions[role];
                const isSelected = selectedRoleForDetail === role;
                return (
                  <div
                    key={role}
                    id={`role-item-${role}`}
                    role="button"
                    tabIndex={0}
                    onClick={() => setSelectedRoleForDetail(role)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        setSelectedRoleForDetail(role);
                      }
                    }}
                    className={`p-2 rounded-lg border text-left flex items-center justify-between transition-all cursor-pointer select-none ${
                      isSelected
                        ? 'bg-[#00E5FF]/15 border-[#00E5FF] text-white shadow-sm'
                        : 'bg-[#131C2E] border-[#1E293B] text-slate-300 hover:border-slate-600'
                    }`}
                  >
                    <div className="flex flex-col">
                      <span className="text-[11px] font-semibold">{config.label}</span>
                      <span className="text-[9px] font-mono text-slate-400 mt-0.5">
                        {config.defaultProfile.designation}
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        id={`lock-toggle-${role}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          onUpdateRoleConfig(role, { isLocked: !config.isLocked });
                        }}
                        className={`p-1 rounded transition-colors ${
                          config.isLocked
                            ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                            : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                        }`}
                        title={config.isLocked ? 'Parámetro Bloqueado (Inmune a recalculo global)' : 'Parámetro Editable / Derivado'}
                      >
                        {config.isLocked ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
                      </button>
                      <ChevronRight className={`w-3.5 h-3.5 ${isSelected ? 'text-[#00E5FF]' : 'text-slate-600'}`} />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Right: Detailed Config for Selected Role */}
            <div className="md:col-span-2 bg-[#080D17] border border-slate-800 rounded-lg p-3 flex flex-col gap-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <div>
                  <h4 className="text-xs font-bold text-slate-100">{currentRoleConfig.label}</h4>
                  <p className="text-[10px] text-slate-400">
                    Modo: <span className="text-[#00E5FF] font-mono">{currentRoleConfig.distributionMode}</span> |
                    Material: <span className="text-emerald-400 font-mono">{currentRoleConfig.defaultMaterialId}</span>
                  </p>
                </div>

                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] text-slate-400">Estado Bloqueo:</span>
                  <button
                    onClick={() =>
                      onUpdateRoleConfig(selectedRoleForDetail, { isLocked: !currentRoleConfig.isLocked })
                    }
                    className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold flex items-center gap-1 border ${
                      currentRoleConfig.isLocked
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                        : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                    }`}
                  >
                    {currentRoleConfig.isLocked ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
                    {currentRoleConfig.isLocked ? 'LOCKED' : 'PARAMETRIC'}
                  </button>
                </div>
              </div>

              {/* Profile Details Matrix */}
              <div className="grid grid-cols-2 gap-2 text-[10px]">
                <div className="bg-[#111927] p-2 rounded border border-slate-800">
                  <div className="text-slate-400 text-[9px]">Designación Oficial</div>
                  <div className="text-slate-100 font-semibold mt-0.5">
                    {currentRoleConfig.defaultProfile.designation}
                  </div>
                </div>

                <div className="bg-[#111927] p-2 rounded border border-slate-800">
                  <div className="text-slate-400 text-[9px]">Tipo de Sección</div>
                  <div className="text-[#00E5FF] font-mono mt-0.5">
                    {currentRoleConfig.defaultProfile.type}
                  </div>
                </div>

                <div className="bg-[#111927] p-2 rounded border border-slate-800">
                  <div className="text-slate-400 text-[9px]">Dimensiones (B x H x t)</div>
                  <div className="text-slate-200 font-mono mt-0.5">
                    {currentRoleConfig.defaultProfile.dimensions.width} x{' '}
                    {currentRoleConfig.defaultProfile.dimensions.height} x{' '}
                    {currentRoleConfig.defaultProfile.dimensions.thickness} mm
                  </div>
                </div>

                <div className="bg-[#111927] p-2 rounded border border-slate-800">
                  <div className="text-slate-400 text-[9px]">Peso Lineal</div>
                  <div className="text-emerald-400 font-mono font-bold mt-0.5">
                    {currentRoleConfig.defaultProfile.properties.weightPerMeter} kg/m
                  </div>
                </div>
              </div>

              {/* Material Assignment Override */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-[11px]">
                <span className="text-slate-400">Asignar Grado Específico:</span>
                <select
                  value={currentRoleConfig.defaultMaterialId}
                  onChange={(e) =>
                    onUpdateRoleConfig(selectedRoleForDetail, { defaultMaterialId: e.target.value })
                  }
                  className="bg-[#131C2E] border border-slate-700 text-slate-200 text-[11px] rounded px-2 py-1 focus:outline-none focus:border-[#00E5FF]"
                >
                  {Object.values(MASTER_MATERIALS).map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name} ({m.id})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: STRUCTURAL ZONES (ZONE-BASED DISTRIBUTION) */}
      {activeTab === 'ZONES' && (
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <span>Distribución por Zonas Longitudinales del Claro (AISC LRFD)</span>
            <div className="flex gap-1">
              {(['UNIFORM', 'ZONE_BASED', 'SYMMETRIC', 'OPTIMIZED'] as DistributionMode[]).map((mode) => (
                <button
                  key={mode}
                  onClick={() => onSelectDistributionMode(mode)}
                  className={`px-2 py-0.5 rounded text-[10px] font-mono transition-all border ${
                    distributionMode === mode
                      ? 'bg-[#00E5FF]/20 text-[#00E5FF] border-[#00E5FF]/40 font-bold'
                      : 'bg-[#131C2E] text-slate-400 border-slate-800 hover:text-slate-200'
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
            {STRUCTURAL_ZONES.map((zone) => {
              const isSelected = zone.zoneId === activeZoneId;
              return (
                <button
                  key={zone.zoneId}
                  id={`zone-btn-${zone.zoneId}`}
                  onClick={() => onSelectZone(zone.zoneId)}
                  className={`p-2 rounded-lg border text-left flex flex-col justify-between transition-all ${
                    isSelected
                      ? 'bg-[#00E5FF]/15 border-[#00E5FF] text-white shadow-md'
                      : 'bg-[#131C2E] border-[#1E293B] text-slate-300 hover:border-slate-600'
                  }`}
                >
                  <div>
                    <div className="text-[9px] font-mono text-[#00E5FF] font-bold">
                      {Math.round(zone.ratioStart * 100)}% - {Math.round(zone.ratioEnd * 100)}% L
                    </div>
                    <div className="text-[11px] font-bold mt-0.5 leading-tight">{zone.zoneName.split('—')[1]}</div>
                    <p className="text-[9px] text-slate-400 mt-1 line-clamp-2">{zone.description}</p>
                  </div>

                  <div className="mt-2 pt-1 border-t border-slate-700/60 text-[9px] font-mono text-emerald-400">
                    {zone.defaultProfile.designation.split('(')[0]}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Span Zone Visualizer Bar */}
          <div className="bg-[#080D17] border border-slate-800 rounded-lg p-2.5 flex flex-col gap-1.5">
            <div className="flex justify-between text-[10px] text-slate-400 font-mono">
              <span>Apoyo Izq (0.0L)</span>
              <span>Cuarto de Luz (0.25L)</span>
              <span>Centro de Luz (0.50L)</span>
              <span>Cuarto de Luz (0.75L)</span>
              <span>Apoyo Der (1.0L)</span>
            </div>
            <div className="h-5 w-full bg-[#111927] rounded-md overflow-hidden flex border border-slate-800">
              <div
                className="h-full bg-cyan-600/60 hover:bg-cyan-500/80 border-r border-slate-900 flex items-center justify-center text-[8px] font-bold text-white transition-all cursor-pointer"
                style={{ width: '20%' }}
                title="Zona 01: Apoyo Izquierdo (HSS 8x4x3/8)"
                onClick={() => onSelectZone('ZONE_01_SUPPORT')}
              >
                Z1 APOYO
              </div>
              <div
                className="h-full bg-blue-600/60 hover:bg-blue-500/80 border-r border-slate-900 flex items-center justify-center text-[8px] font-bold text-white transition-all cursor-pointer"
                style={{ width: '25%' }}
                title="Zona 02: Campo Intermedio (HSS 6x4x1/4)"
                onClick={() => onSelectZone('ZONE_02_FIELD')}
              >
                Z2 VANO
              </div>
              <div
                className="h-full bg-amber-500/60 hover:bg-amber-400/80 border-r border-slate-900 flex items-center justify-center text-[8px] font-bold text-white transition-all cursor-pointer"
                style={{ width: '10%' }}
                title="Zona 04: Cumbrera (HSS 8x4x1/4)"
                onClick={() => onSelectZone('ZONE_04_RIDGE')}
              >
                Z4 RIDGE
              </div>
              <div
                className="h-full bg-blue-600/60 hover:bg-blue-500/80 border-r border-slate-900 flex items-center justify-center text-[8px] font-bold text-white transition-all cursor-pointer"
                style={{ width: '25%' }}
                title="Zona 02: Campo Intermedio (HSS 6x4x1/4)"
                onClick={() => onSelectZone('ZONE_02_FIELD')}
              >
                Z2 VANO
              </div>
              <div
                className="h-full bg-cyan-600/60 hover:bg-cyan-500/80 flex items-center justify-center text-[8px] font-bold text-white transition-all cursor-pointer"
                style={{ width: '20%' }}
                title="Zona 01: Apoyo Derecho (HSS 8x4x3/8)"
                onClick={() => onSelectZone('ZONE_01_SUPPORT')}
              >
                Z1 APOYO
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: GAUGE & THICKNESS ENGINE */}
      {activeTab === 'GAUGES' && (
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <span>Matriz de Calibres en Frío (AISI S100) y Espesores de Placa (ASTM A36)</span>
            <span className="text-[#00E5FF] font-mono">Calibres 10 a 18 | Placas 3/16" a 1"</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Cold Formed Gauges Table */}
            <div className="bg-[#080D17] border border-slate-800 rounded-lg p-2.5 flex flex-col gap-2">
              <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
                <span className="text-[11px] font-bold text-[#00E5FF] flex items-center gap-1">
                  <FileSpreadsheet className="w-3 h-3" /> Calibres Conformados en Frío (Montenes C)
                </span>
                <span className="text-[9px] font-mono text-slate-400">AISI S100</span>
              </div>

              <div className="flex flex-col gap-1">
                {COLD_FORMED_GAUGES.map((g) => (
                  <div
                    key={g.gaugeNumber}
                    className="flex items-center justify-between p-1.5 rounded bg-[#111927] border border-slate-800/80 text-[10px] font-mono hover:border-slate-600"
                  >
                    <span className="font-bold text-slate-200">Calibre {g.gaugeNumber}</span>
                    <span className="text-[#00E5FF]">{g.thicknessMm} mm</span>
                    <span className="text-slate-400">{g.thicknessInch}</span>
                    <span className="text-emerald-400">{g.weightFactorKgM2} kg/m²</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Structural Plates Table */}
            <div className="bg-[#080D17] border border-slate-800 rounded-lg p-2.5 flex flex-col gap-2">
              <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
                <span className="text-[11px] font-bold text-amber-400 flex items-center gap-1">
                  <Boxes className="w-3 h-3" /> Espesores de Placa para Cartabones
                </span>
                <span className="text-[9px] font-mono text-slate-400">ASTM A36 / A572</span>
              </div>

              <div className="flex flex-col gap-1">
                {STRUCTURAL_PLATE_THICKNESSES.map((p) => (
                  <div
                    key={p.nominalInch}
                    className="flex items-center justify-between p-1.5 rounded bg-[#111927] border border-slate-800/80 text-[10px] font-mono hover:border-slate-600"
                  >
                    <span className="font-bold text-amber-300">{p.nominalInch}</span>
                    <span className="text-slate-200">{p.thicknessMm} mm</span>
                    <span className="text-[9px] text-slate-400 truncate max-w-[140px]">{p.typicalUse}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
