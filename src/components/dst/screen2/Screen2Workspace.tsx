// ============================================================
// STV CLOSER — SCREEN 02 WORKSPACE
// Screen2Workspace.tsx
// Roof / Truss Typology Gateway, Parametric Generation, and Custom Archive
// ============================================================

import React, { useState, useMemo } from 'react';
import {
  TRUSS_CATALOG,
  ROOF_CATALOG,
  TrussTypologyDefinition,
  RoofTypologyDefinition,
  getTrussTypology,
  getRoofTypology
} from '../../../dst/truss-typologies';
import { generateParametricTruss, GeneratedTrussStructure } from '../../../dst/parametric-truss-engine';
import { performStructuralAudit, ComprehensiveAuditReport } from '../../../dst/structural-audit';
import { CreationPath, ArchivedDesignItem } from '../../../dst/design-archive';
import { SectionProfile, TrussType } from '../../../dst/dst.schema';

import { Screen2Viewport3D } from './Screen2Viewport3D';
import { TrussTypologyHub } from './TrussTypologyHub';
import { GeometryControlHub } from './GeometryControlHub';
import { PanelWebDistributionHub, PanelDistributionMode, ZigzagVectorMode } from './PanelWebDistributionHub';
import { MaterialDistributionHub } from './MaterialDistributionHub';
import {
  DEFAULT_ROLE_DISTRIBUTIONS,
  MemberStructuralRole,
  DistributionMode,
  StructuralZone,
  MemberRoleDistributionConfig
} from '../../../dst/material-distribution';
import { FabricationConnectionHUD } from './FabricationConnectionHUD';
import { LoadStructuralResponseHUD } from './LoadStructuralResponseHUD';
import { SpatialActionInstrument } from './SpatialActionInstrument';
import { TrussDnaInspectorModal } from './TrussDnaInspectorModal';
import { DesignArchiveModal } from './DesignArchiveModal';
import { CustomTrussEditorModal } from './CustomTrussEditorModal';

import { Layers, ChevronRight, Activity, Shield, Sparkles, Box, FileText, FileSpreadsheet } from 'lucide-react';

interface Screen2WorkspaceProps {
  initialSpanM?: number;
  initialRiseM?: number;
  initialDepthM?: number;
  initialTrussType?: TrussType;
  topChordProfile: SectionProfile;
  bottomChordProfile: SectionProfile;
  webProfile: SectionProfile;
  onSendToDigitalTwin: (generated: {
    trussType: TrussType;
    spanM: number;
    roofRiseM: number;
    framesCount?: number;
  }) => void;
  onNavigateStage: (stageId: string) => void;
  onOpenDossier: () => void;
  onOpenGoogleSheets?: () => void;
}

export const Screen2Workspace: React.FC<Screen2WorkspaceProps> = ({
  initialSpanM = 14.0,
  initialRiseM = 2.2,
  initialDepthM = 1.2,
  initialTrussType = 'WARREN',
  topChordProfile,
  bottomChordProfile,
  webProfile,
  onSendToDigitalTwin,
  onNavigateStage,
  onOpenDossier,
  onOpenGoogleSheets
}) => {
  // 1. Typology & Family Selection State
  const [selectedTruss, setSelectedTruss] = useState<TrussTypologyDefinition>(() =>
    getTrussTypology(initialTrussType as string)
  );
  const [selectedRoof, setSelectedRoof] = useState<RoofTypologyDefinition>(() =>
    getRoofTypology('DOUBLE_SLOPE')
  );
  const [creationPath, setCreationPath] = useState<CreationPath>('PARAMETRIC');

  // 2. Parametric Dimensions & Parameter States
  const [spanM, setSpanM] = useState<number>(initialSpanM);
  const [riseM, setRiseM] = useState<number>(initialRiseM);
  const [depthM, setDepthM] = useState<number>(initialDepthM);
  const [panelCount, setPanelCount] = useState<number>(10);
  const [lockedParams, setLockedParams] = useState<Record<string, boolean>>({
    span: false,
    rise: false,
    depth: false,
    panels: false
  });

  // 3. Web & Zigzag Distribution Controls
  const [distributionMode, setDistributionMode] = useState<PanelDistributionMode>('UNIFORM');
  const [zigzagMode, setZigzagMode] = useState<ZigzagVectorMode>('SYMMETRIC');
  const [addVerticals, setAddVerticals] = useState<boolean>(true);

  // 4. Material & Role Distribution States
  const [activeMaterialId, setActiveMaterialId] = useState<string>('A500_B');
  const [roleDistributions, setRoleDistributions] = useState<Record<MemberStructuralRole, MemberRoleDistributionConfig>>(
    DEFAULT_ROLE_DISTRIBUTIONS
  );
  const [materialDistMode, setMaterialDistMode] = useState<DistributionMode>('UNIFORM');
  const [activeZoneId, setActiveZoneId] = useState<StructuralZone>('ZONE_01_SUPPORT');
  const [isMixedModeEnabled, setIsMixedModeEnabled] = useState<boolean>(false);
  const [activeRightHub, setActiveRightHub] = useState<'GEOMETRY' | 'MATERIALS'>('GEOMETRY');

  const handleUpdateRoleConfig = (role: MemberStructuralRole, updates: Partial<MemberRoleDistributionConfig>) => {
    setRoleDistributions((prev) => ({
      ...prev,
      [role]: {
        ...prev[role],
        ...updates
      }
    }));
  };

  // 5. Viewport Overlays & HUDs
  const [showLoads, setShowLoads] = useState<boolean>(true);
  const [showDimensions, setShowDimensions] = useState<boolean>(true);
  const [showNodes, setShowNodes] = useState<boolean>(true);
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);

  // 6. Custom Graph Nodes & Members for TR-18 / Custom Mode
  const [customNodes, setCustomNodes] = useState<any[]>([]);
  const [customMembers, setCustomMembers] = useState<any[]>([]);

  // 7. Modals
  const [isDnaModalOpen, setIsDnaModalOpen] = useState(false);
  const [isArchiveModalOpen, setIsArchiveModalOpen] = useState(false);
  const [isCustomEditorOpen, setIsCustomEditorOpen] = useState(false);

  // Recalculate Roof Slope in Degrees: theta = arctan(2 * rise / span)
  const roofSlopeDeg = useMemo(() => {
    const angleRad = Math.atan((2 * (riseM || depthM)) / spanM);
    return parseFloat(((angleRad * 180) / Math.PI).toFixed(1));
  }, [riseM, depthM, spanM]);

  // Handle Locking / Unlocking
  const handleToggleLock = (key: string) => {
    setLockedParams((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // Handle Parameter Changes
  const handleChangeParam = (key: string, val: number) => {
    if (key === 'span') setSpanM(val);
    else if (key === 'rise') setRiseM(val);
    else if (key === 'depth') setDepthM(val);
    else if (key === 'panelCount') setPanelCount(val);
  };

  const handleResetDefaults = () => {
    setSpanM(14.0);
    setRiseM(2.2);
    setDepthM(1.2);
    setPanelCount(10);
    setDistributionMode('UNIFORM');
    setZigzagMode('SYMMETRIC');
    setAddVerticals(true);
  };

  // Generate Deterministic Parametric Truss
  const trussData: GeneratedTrussStructure = useMemo(() => {
    return generateParametricTruss({
      typology: selectedTruss,
      roof: selectedRoof,
      spanM,
      riseM,
      depthM,
      panelCount,
      panelDistribution: distributionMode,
      zigzagVector: zigzagMode,
      addVerticals,
      topChordProfile,
      bottomChordProfile,
      webProfile,
      customNodes: creationPath === 'CUSTOM' ? customNodes : undefined,
      customMembers: creationPath === 'CUSTOM' ? customMembers : undefined
    });
  }, [
    selectedTruss,
    selectedRoof,
    spanM,
    riseM,
    depthM,
    panelCount,
    distributionMode,
    zigzagMode,
    addVerticals,
    topChordProfile,
    bottomChordProfile,
    webProfile,
    creationPath,
    customNodes,
    customMembers
  ]);

  // Perform Real-Time Structural Audit
  const auditReport: ComprehensiveAuditReport = useMemo(() => {
    return performStructuralAudit(trussData.graph, selectedTruss, selectedRoof, {
      spanM,
      riseM,
      depthM,
      panelCount,
      maxTransportLengthM: 12.0
    });
  }, [trussData, selectedTruss, selectedRoof, spanM, riseM, depthM, panelCount]);

  // Apply Archived Design to Current Screen
  const handleLoadArchivedDesign = (design: ArchivedDesignItem) => {
    const foundTruss = getTrussTypology(design.typologyId);
    const foundRoof = getRoofTypology(design.roofFamily);
    setSelectedTruss(foundTruss);
    setSelectedRoof(foundRoof);
    setSpanM(design.parameters.spanM);
    if (design.parameters.riseM) setRiseM(design.parameters.riseM);
    if (design.parameters.depthM) setDepthM(design.parameters.depthM);
    setPanelCount(design.parameters.panelCount);
    if (design.parameters.panelDistribution) setDistributionMode(design.parameters.panelDistribution);
    if (design.parameters.zigzagVector) setZigzagMode(design.parameters.zigzagVector);
    setCreationPath(design.creationPath);
    if (design.customGraph) {
      setCustomNodes(design.customGraph.nodes);
      setCustomMembers(design.customGraph.members);
    }
    setIsArchiveModalOpen(false);
  };

  const handleApplyCustomGraph = (nodes: any[], members: any[]) => {
    setCustomNodes(nodes);
    setCustomMembers(members);
    setSelectedTruss(getTrussTypology('CUSTOM'));
    setCreationPath('CUSTOM');
  };

  const handleSendToTwin = () => {
    onSendToDigitalTwin({
      trussType: (selectedTruss.code as any) || 'WARREN',
      spanM,
      roofRiseM: riseM
    });
  };

  const stages = [
    { id: '01', code: '01', name: 'COLUMNAS & TALLER' },
    { id: '02', code: '02', name: '3D TWIN & TECHOS / CERCHAS', active: true },
    { id: '03', code: '03', name: 'CIMENTACIÓN & REACCIONES' },
    { id: '04', code: '04', name: 'AUDITORÍA & AISC' },
    { id: '05', code: '05', name: 'RENDER & DOSSIER MASTER' }
  ];

  return (
    <div className="relative w-screen h-screen bg-[#020307] text-[#F2F7F7] overflow-hidden flex flex-col font-mono-tech select-none">
      {/* 1. TOP STAGE WORKSTATION NAVIGATION BAR */}
      <header className="w-full bg-[#02050A] border-b border-[#00E5FF]/30 px-4 py-2 z-40 flex items-center justify-between">
        {/* Left Brand */}
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-[#00E5FF] flex items-center justify-center text-black font-orbitron font-black text-xs shadow-[0_0_10px_#00E5FF]">
            S
          </div>
          <div>
            <div className="font-orbitron font-bold text-xs text-white tracking-widest flex items-center gap-1.5">
              <span>STV CLOSER</span>
              <span className="text-[8px] px-1 py-0.2 bg-[#00E5FF]/20 text-[#00E5FF] border border-[#00E5FF]/40 rounded">
                TRUSS DESIGNER v1.0
              </span>
            </div>
          </div>
        </div>

        {/* Center 5-Stage Stepper */}
        <div className="hidden md:flex items-center gap-1">
          {stages.map((st) => (
            <button
              key={st.id}
              type="button"
              onClick={() => onNavigateStage(st.id)}
              className={`px-3 py-1 text-[9px] font-orbitron rounded transition-all flex items-center gap-1.5 ${
                st.active
                  ? 'bg-[#00E5FF] text-black font-bold shadow-[0_0_12px_#00E5FF]'
                  : 'text-[#8A949D] hover:text-white hover:bg-[#051829]'
              }`}
            >
              <span className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[8px] font-bold ${
                st.active ? 'bg-black text-[#00E5FF]' : 'bg-[#0D2235] text-[#8A949D]'
              }`}>
                {st.code}
              </span>
              <span>{st.name}</span>
            </button>
          ))}
        </div>

        {/* Right Action Icons */}
        <div className="flex items-center gap-2">
          {onOpenGoogleSheets && (
            <button
              type="button"
              onClick={onOpenGoogleSheets}
              className="px-2.5 py-1 bg-[#03151E] border border-[#00E5FF]/60 hover:bg-[#00E5FF]/20 text-[#00E5FF] font-orbitron text-[9px] rounded transition-all flex items-center gap-1.5 shadow-[0_0_10px_rgba(0,229,255,0.25)]"
              title="Exportar y sincronizar con Google Sheets"
            >
              <FileSpreadsheet className="w-3 h-3 text-[#39E58C]" />
              <span>GOOGLE SHEETS</span>
            </button>
          )}
          <button
            type="button"
            onClick={onOpenDossier}
            className="px-2.5 py-1 bg-[#030911] border border-[#FFD600]/50 hover:bg-[#FFD600] hover:text-black text-[#FFD600] font-orbitron text-[9px] rounded transition-all flex items-center gap-1 shadow-[0_0_10px_rgba(255,214,0,0.2)]"
          >
            <FileText className="w-3 h-3" />
            DOSSIER MEMORIA
          </button>
        </div>
      </header>

      {/* 2. MAIN 3-PANE WORKSPACE */}
      <div className="flex-1 w-full flex relative overflow-hidden">
        {/* Left: Typology & Roof Gateway Hub */}
        <TrussTypologyHub
          selectedTruss={selectedTruss}
          onSelectTruss={setSelectedTruss}
          selectedRoof={selectedRoof}
          onSelectRoof={setSelectedRoof}
          creationPath={creationPath}
          onSelectCreationPath={setCreationPath}
          onOpenDnaModal={() => setIsDnaModalOpen(true)}
          onOpenArchiveModal={() => setIsArchiveModalOpen(true)}
          onOpenCustomEditor={() => setIsCustomEditorOpen(true)}
        />

        {/* Center: Live 3D Interactive Cyber-Blueprint Viewport with Floating HUDs */}
        <main className="flex-1 h-full relative overflow-hidden bg-[#020307]">
          {/* Top Center Floating Panel: Web & Zigzag Distribution Hub */}
          <div className="absolute top-3 left-1/2 -translate-x-1/2 z-20 pointer-events-auto">
            <PanelWebDistributionHub
              distributionMode={distributionMode}
              onSelectDistributionMode={setDistributionMode}
              zigzagMode={zigzagMode}
              onSelectZigzagMode={setZigzagMode}
              addVerticals={addVerticals}
              onToggleVerticals={() => setAddVerticals(!addVerticals)}
              topChordCount={trussData.topChords.length}
              bottomChordCount={trussData.bottomChords.length}
              webCount={trussData.webMembers.length}
            />
          </div>

          {/* Center 3D Canvas */}
          <Screen2Viewport3D
            trussData={trussData}
            spanM={spanM}
            riseM={riseM}
            depthM={depthM}
            panelCount={panelCount}
            showLoads={showLoads}
            showDimensions={showDimensions}
            showNodes={showNodes}
            selectedElementId={selectedElementId}
            onSelectElement={(id) => setSelectedElementId(id)}
          />

          {/* Floating Bottom Left & Right HUDs inside Canvas */}
          <div className="absolute bottom-16 left-4 z-20 pointer-events-auto hidden sm:block">
            <FabricationConnectionHUD trussData={trussData} spanM={spanM} />
          </div>

          <div className="absolute bottom-16 right-4 z-20 pointer-events-auto hidden sm:block">
            <LoadStructuralResponseHUD
              spanM={spanM}
              riseM={riseM}
              depthM={depthM}
              totalWeightKg={trussData.summary.totalSteelWeightKg}
              showLoads={showLoads}
              onToggleShowLoads={() => setShowLoads(!showLoads)}
            />
          </div>
        </main>

        {/* Right: Dual Engine Panel (Geometry vs Materials) */}
        <aside className="w-80 md:w-96 h-full flex flex-col bg-[#050B14] border-l border-[#00E5FF]/20 overflow-y-auto shrink-0 shadow-2xl">
          {/* Header Switcher */}
          <div className="p-2 border-b border-slate-800 bg-[#080E1A] flex items-center justify-between gap-1">
            <button
              id="switch-to-geometry-hub-btn"
              onClick={() => setActiveRightHub('GEOMETRY')}
              className={`flex-1 py-1.5 px-2 rounded text-[11px] font-bold transition-all flex items-center justify-center gap-1.5 ${
                activeRightHub === 'GEOMETRY'
                  ? 'bg-[#00E5FF] text-black shadow-[0_0_12px_rgba(0,229,255,0.4)]'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              01. Geometría
            </button>
            <button
              id="switch-to-materials-hub-btn"
              onClick={() => setActiveRightHub('MATERIALS')}
              className={`flex-1 py-1.5 px-2 rounded text-[11px] font-bold transition-all flex items-center justify-center gap-1.5 ${
                activeRightHub === 'MATERIALS'
                  ? 'bg-[#00E5FF] text-black shadow-[0_0_12px_rgba(0,229,255,0.4)]'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              02. Materiales & Zonas
            </button>
          </div>

          <div className="flex-1 p-2">
            {activeRightHub === 'GEOMETRY' ? (
              <GeometryControlHub
                spanM={spanM}
                riseM={riseM}
                depthM={depthM}
                panelCount={panelCount}
                roofSlopeDeg={roofSlopeDeg}
                lockedParams={lockedParams}
                onToggleLock={handleToggleLock}
                onChangeParam={handleChangeParam}
                onResetDefaults={handleResetDefaults}
              />
            ) : (
              <MaterialDistributionHub
                activeMaterialId={activeMaterialId}
                onSelectMaterial={setActiveMaterialId}
                roleDistributions={roleDistributions}
                onUpdateRoleConfig={handleUpdateRoleConfig}
                distributionMode={materialDistMode}
                onSelectDistributionMode={setMaterialDistMode}
                activeZoneId={activeZoneId}
                onSelectZone={setActiveZoneId}
                isMixedModeEnabled={isMixedModeEnabled}
                onToggleMixedMode={() => setIsMixedModeEnabled(!isMixedModeEnabled)}
              />
            )}
          </div>
        </aside>
      </div>

      {/* 3. BOTTOM SPATIAL ACTION INSTRUMENT (AUDIT STATUS & STAGE GATING) */}
      <SpatialActionInstrument
        auditReport={auditReport}
        onRunAudit={() => {}}
        onSendToTwin={handleSendToTwin}
        onProceedToNextStage={() => onNavigateStage('03')}
        onOpenDossier={onOpenDossier}
        totalLinearM={trussData.summary.totalLengthM}
        totalWeightKg={trussData.summary.totalSteelWeightKg}
      />

      {/* 4. MODALS */}
      <TrussDnaInspectorModal
        isOpen={isDnaModalOpen}
        onClose={() => setIsDnaModalOpen(false)}
        truss={selectedTruss}
        roof={selectedRoof}
      />

      <DesignArchiveModal
        isOpen={isArchiveModalOpen}
        onClose={() => setIsArchiveModalOpen(false)}
        currentDesignState={{
          name: `${selectedTruss.name} ${spanM.toFixed(1)}m (${selectedRoof.name})`,
          typologyId: selectedTruss.id,
          roofFamily: selectedRoof.family,
          spanM,
          riseM,
          depthM,
          panelCount,
          topChordProfile,
          bottomChordProfile,
          webProfile,
          dna: selectedTruss.dna
        }}
        onLoadArchivedDesign={handleLoadArchivedDesign}
      />

      <CustomTrussEditorModal
        isOpen={isCustomEditorOpen}
        onClose={() => setIsCustomEditorOpen(false)}
        initialNodes={customNodes}
        initialMembers={customMembers}
        onApplyCustomGraph={handleApplyCustomGraph}
      />
    </div>
  );
};
