// ============================================================
// STV CLOSER — SCREEN 01 COLUMN & CAD TWIN SPATIAL WORKSPACE
// Screen1Workspace.tsx
// Exact Reproduction of STV Design Studio Mk1 Screen 01 Architecture
// Fused with AISC 360-16 LRFD / AWS D1.1 / ACI 318 Structural Solver
// ============================================================

import React, { useState, useMemo } from 'react';
import { DSTProject, SectionProfile, TrussType } from '../../../dst/dst.schema';
import { StructuralGraph } from '../../../dst/structural-graph';
import { runStructuralIntegritySolver } from '../../../dst/structural-solver-engine';
import { TopSystemBar, StructuralTypology } from './TopSystemBar';
import { LeftCadToolbar, CadToolMode } from './LeftCadToolbar';
import { ColumnEngineModule } from './ColumnEngineModule';
import { BottomStagePods } from './BottomStagePods';
import { Screen1Viewport3D } from './Screen1Viewport3D';
import { SatelliteProfile } from './RadialSatelliteHub';
import { FoundationTypeItem } from './RadialFoundationDial';
import { CreationGatewayModal } from './CreationGatewayModal';
import { HolographicOrbitalRing, CategoryHubId } from './HolographicOrbitalRing';
import { HolographicParametricDials, ParamConstraintState } from './HolographicParametricDials';
import { HolographicIntegrityHUD } from './HolographicIntegrityHUD';
import { OptimizationRecommendationModal } from './OptimizationRecommendationModal';
import {
  validateProjectStructuralDesign,
  generateStructuralOptimizationPlan,
  OptimizationPlan,
  OptimizationRecommendation
} from '../../../dst/design-engine';
import { Eye, Layers, Sparkles, Orbit, Compass, Cpu, Zap, ArrowUpRight } from 'lucide-react';

interface Screen1WorkspaceProps {
  project: DSTProject;
  graph: StructuralGraph;
  linearMetersSummary: Map<string, number>;
  totalSteelWeightKg: number;
  params: {
    spanM: number;
    lengthM: number;
    heightM: number;
    framesCount: number;
    roofRiseM: number;
    trussType: TrussType;
    columnInclinationDeg: number;
    purlinSpacingM: number;
    columnProfile: SectionProfile;
    chordProfile: SectionProfile;
    webProfile: SectionProfile;
    purlinProfile: SectionProfile;
  };
  onUpdateParams: (updated: Partial<Screen1WorkspaceProps['params']>) => void;
  onOpenDossier: () => void;
  onOpenGoogleSheets?: () => void;
  onExportDXF?: () => void;
  onNavigateStage?: (stageId: string) => void;
}

export const Screen1Workspace: React.FC<Screen1WorkspaceProps> = ({
  project,
  graph,
  linearMetersSummary,
  totalSteelWeightKg,
  params,
  onUpdateParams,
  onOpenDossier,
  onOpenGoogleSheets,
  onExportDXF,
  onNavigateStage
}) => {
  // 1. Core Workspace Navigation & Typology
  const [typology, setTypology] = useState<StructuralTypology>('PERGOLA');
  const [activeCadTool, setActiveCadTool] = useState<CadToolMode>('SELECT');
  const [showHolograms, setShowHolograms] = useState(true);
  const [activeStageId, setActiveStageId] = useState('01');
  const [selectedFoundationId, setSelectedFoundationId] = useState('F-02');
  const [isCreationGatewayOpen, setIsCreationGatewayOpen] = useState(false);

  // 2. HUD Mode: "STUDIO_MK1" (Image Layout) vs "ORBITAL_12" (Radial Ring Hubs)
  const [hudMode, setHudMode] = useState<'STUDIO_MK1' | 'ORBITAL_12'>('STUDIO_MK1');
  const [activeCategory, setActiveCategory] = useState<CategoryHubId>('01_COLUMNS');
  const [isOptimizationModalOpen, setIsOptimizationModalOpen] = useState(false);

  // 3. Connection & Base Plate Fabrication Parameters
  const [basePlateWidthMm, setBasePlateWidthMm] = useState(400);
  const [basePlateThickMm, setBasePlateThickMm] = useState(25);
  const [anchorCount, setAnchorCount] = useState(6);

  // 4. Constraint States for Parametric Dials
  const [constraintStates, setConstraintStates] = useState<{
    span: ParamConstraintState;
    height: ParamConstraintState;
    roofRise: ParamConstraintState;
    framesCount: ParamConstraintState;
    purlinSpacing: ParamConstraintState;
  }>({
    span: 'EDITABLE',
    height: 'EDITABLE',
    roofRise: 'EDITABLE',
    framesCount: 'EDITABLE',
    purlinSpacing: 'EDITABLE'
  });

  const [conflictWarning, setConflictWarning] = useState<string | null>(null);

  // 5. Real-time AISC 360-16 LRFD / AWS D1.1 / ACI 318 Structural Integrity Engine (Computes 98% Integrity)
  const integrityReport = useMemo(() => {
    return runStructuralIntegritySolver({
      spanM: params.spanM,
      lengthM: params.lengthM,
      heightM: params.heightM,
      roofRiseM: params.roofRiseM,
      framesCount: params.framesCount,
      trussType: params.trussType,
      columnProfile: params.columnProfile,
      chordProfile: params.chordProfile,
      webProfile: params.webProfile,
      purlinProfile: params.purlinProfile,
      purlinSpacingM: params.purlinSpacingM,
      columnInclinationDeg: params.columnInclinationDeg
    });
  }, [params]);

  // 6. AISC 360-22 Structural Optimization & Section Upgrade Recommender
  const optimizationEvaluation = useMemo(() => {
    return validateProjectStructuralDesign(project, graph);
  }, [project, graph]);

  const optimizationPlan = useMemo(() => {
    return generateStructuralOptimizationPlan(project, optimizationEvaluation.evaluation);
  }, [project, optimizationEvaluation]);

  // Handle Satellite Selection from Top Left Hub
  const handleSelectSatellite = (sat: SatelliteProfile) => {
    const updatedProfile: SectionProfile = {
      family: (sat.family as any) || 'HSS',
      designation: sat.designation || sat.name
    };
    onUpdateParams({ columnProfile: updatedProfile });
  };

  // Handle Foundation Selection from Top Right Dial
  const handleSelectFoundation = (found: FoundationTypeItem) => {
    setSelectedFoundationId(found.id);
  };

  // Handle Stage Selection from Bottom Pods
  const handleSelectStage = (stageId: string) => {
    setActiveStageId(stageId);
    if (stageId === '02') {
      onNavigateStage?.('SCREEN_02_TRUSSES');
    } else if (stageId === '04') {
      onNavigateStage?.('WORKSTATION_CAD');
    }
  };

  // Handle Parameter Update from Dials
  const handleUpdateParam = (key: string, value: any) => {
    setConflictWarning(null);
    if (key === 'spanM' && (value < 4 || value > 40)) {
      setConflictWarning('El claro debe situarse entre 4m y 40m según AISC 360.');
      return;
    }
    onUpdateParams({ [key]: value });
  };

  const handleToggleConstraint = (paramKey: string) => {
    setConstraintStates((prev) => {
      const current = (prev as any)[paramKey];
      const next: ParamConstraintState =
        current === 'EDITABLE' ? 'LOCKED' : current === 'LOCKED' ? 'DERIVED' : 'EDITABLE';
      return { ...prev, [paramKey]: next };
    });
  };

  return (
    <div className="relative w-full h-full bg-[#000000] text-[#F2F7F7] overflow-hidden select-none font-mono-tech flex flex-col justify-between">
      
      {/* 1. CENTRAL 3D CAD TWIN VIEWPORT (100% FULLSCREEN BACKGROUND) */}
      <div className="absolute inset-0 z-0">
        <Screen1Viewport3D
          project={project}
          graph={graph}
          currentProfile={params.columnProfile}
          columnInclinationDeg={params.columnInclinationDeg}
          showHolograms={showHolograms}
          basePlateWidthMm={basePlateWidthMm}
          basePlateThickMm={basePlateThickMm}
          anchorCount={anchorCount}
          onSelectProfile={(prof) => onUpdateParams({ columnProfile: prof })}
          onUpdateBasePlate={(updates) => {
            if (updates.basePlateThickMm) setBasePlateThickMm(updates.basePlateThickMm);
            if (updates.anchorCount) setAnchorCount(updates.anchorCount);
          }}
        />
      </div>

      {/* 2. HUD MODE TOGGLE (STUDIO MK1 vs 12-ORBITAL RING) + STRUCTURAL OPTIMIZATION TRIGGER */}
      <div className="absolute top-3 left-1/2 -translate-x-1/2 z-40 flex items-center gap-1.5 bg-[#030911]/90 border border-[#00E5FF]/40 rounded-full px-2.5 py-0.5 shadow-[0_0_15px_rgba(0,229,255,0.25)]">
        <button
          type="button"
          onClick={() => setHudMode('STUDIO_MK1')}
          className={`flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[8px] font-orbitron transition-all ${
            hudMode === 'STUDIO_MK1'
              ? 'bg-[#00E5FF] text-black font-bold shadow-[0_0_8px_#00E5FF]'
              : 'text-[#8A949D] hover:text-white'
          }`}
        >
          <Layers className="w-2.5 h-2.5" />
          STUDIO MK1 HUD
        </button>
        <button
          type="button"
          onClick={() => setHudMode('ORBITAL_12')}
          className={`flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[8px] font-orbitron transition-all ${
            hudMode === 'ORBITAL_12'
              ? 'bg-[#FFD600] text-black font-bold shadow-[0_0_8px_#FFD600]'
              : 'text-[#8A949D] hover:text-white'
          }`}
        >
          <Orbit className="w-2.5 h-2.5" />
          12-ORBITAL RING
        </button>

        <div className="w-px h-3.5 bg-[#122538] mx-0.5" />

        {/* Structural Optimization Recommendation Trigger Button */}
        <button
          type="button"
          onClick={() => setIsOptimizationModalOpen(true)}
          className={`flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[8px] font-orbitron transition-all ${
            optimizationPlan.status === 'RECOMMENDATIONS_AVAILABLE'
              ? 'bg-[#FF3B30] hover:bg-[#FF5347] text-white font-bold animate-pulse shadow-[0_0_10px_#FF3B30]'
              : 'bg-[#00E5FF]/10 text-[#00E5FF] hover:bg-[#00E5FF]/20 border border-[#00E5FF]/30'
          }`}
          title="Optimización de Perfil AISC 360-22"
        >
          <Zap className="w-2.5 h-2.5" />
          <span>
            {optimizationPlan.status === 'RECOMMENDATIONS_AVAILABLE'
              ? `OPTIMIZAR (${optimizationPlan.recommendations.length} SUGERENCIAS)`
              : 'OPTIMIZADOR'}
          </span>
        </button>
      </div>

      {/* 3. CONDITIONAL RENDERING BASED ON HUD MODE */}
      {hudMode === 'STUDIO_MK1' ? (
        <>
          {/* TOP BAR: DESIGN STUDIO + 98% GAUGE + STRUCTURAL SYSTEM / PERGOLA + RADIAL FOUNDATION DIAL */}
          <TopSystemBar
            currentTypology={typology}
            onSelectTypology={setTypology}
            currentProfile={params.columnProfile}
            efficiencyPercent={integrityReport.globalIntegrityPct}
            auditStatus={project.audit?.status}
            onSelectSatellite={handleSelectSatellite}
            selectedFoundationId={selectedFoundationId}
            onSelectFoundation={handleSelectFoundation}
          />

          {/* LEFT CAD TOOLBAR & FLOATING BUCKLING CURVES */}
          <div className="absolute left-0 top-20 bottom-24 z-20 flex items-center pointer-events-none">
            <LeftCadToolbar
              activeTool={activeCadTool}
              onSelectTool={setActiveCadTool}
              showHolograms={showHolograms}
              onToggleHolograms={() => setShowHolograms(!showHolograms)}
            />
          </div>

          {/* RIGHT COLUMN ENGINE MODULE: 01 MODULE, 4 PIPELINE STEPS, BASE PLATE & PROFILE CAROUSEL */}
          <div className="absolute right-0 top-16 bottom-24 z-20 flex items-center pointer-events-none">
            <ColumnEngineModule
              currentProfile={params.columnProfile}
              onSelectProfile={(prof) => onUpdateParams({ columnProfile: prof })}
              basePlateWidthMm={basePlateWidthMm}
              basePlateThickMm={basePlateThickMm}
              anchorCount={anchorCount}
              onUpdateBasePlate={(updates) => {
                if (updates.basePlateThickMm) setBasePlateThickMm(updates.basePlateThickMm);
                if (updates.anchorCount) setAnchorCount(updates.anchorCount);
              }}
              onLaunchCreationGateway={() => setIsCreationGatewayOpen(true)}
              onValidateEngine={() => {
                alert(`STV SOLVER VALIDATED:\nD/C Ratio: ${integrityReport.governingDcRatio.toFixed(3)}\nIntegrity: ${(integrityReport.globalIntegrityPct).toFixed(1)}%\nSafety Factor: ${integrityReport.safetyFactor.toFixed(2)}x\nGoverning Limit: ${integrityReport.governingLimitState}`);
              }}
            />
          </div>

          {/* BOTTOM BAR: EXPORT DOSSIER + 01..04 PODS + 3D COLUMN COMPASS WIDGET */}
          <BottomStagePods
            activeStageId={activeStageId}
            onSelectStage={handleSelectStage}
            onOpenDossier={onOpenDossier}
            onExportHub={() => {
              if (onOpenGoogleSheets) onOpenGoogleSheets();
              else onOpenDossier();
            }}
            columnInclinationDeg={params.columnInclinationDeg}
            onUpdateInclination={(deg) => onUpdateParams({ columnInclinationDeg: deg })}
          />
        </>
      ) : (
        /* ORBITAL 12-CATEGORY RADIAL HUBS + REAL-TIME PARAMETRIC DIALS */
        <>
          {/* Floating Holographic 12-Category Orbital Ring */}
          <HolographicOrbitalRing
            activeCategory={activeCategory}
            onSelectCategory={(cat) => setActiveCategory(cat)}
            rotationOffsetDeg={0}
          />

          {/* Floating Integrity HUD (98% LRFD Solver) */}
          <HolographicIntegrityHUD
            report={integrityReport}
            activeCategory={activeCategory}
            onOpenDossier={onOpenDossier}
            onOpenGoogleSheets={onOpenGoogleSheets || onOpenDossier}
            onExportDXF={onExportDXF || onOpenDossier}
            onOpenOptimizer={() => setIsOptimizationModalOpen(true)}
          />

          {/* Bottom Continuous Parametric Dials */}
          <HolographicParametricDials
            spanM={params.spanM}
            heightM={params.heightM}
            roofRiseM={params.roofRiseM}
            framesCount={params.framesCount}
            purlinSpacingM={params.purlinSpacingM}
            columnInclinationDeg={params.columnInclinationDeg}
            trussType={params.trussType}
            columnProfile={params.columnProfile}
            chordProfile={params.chordProfile}
            webProfile={params.webProfile}
            purlinProfile={params.purlinProfile}
            constraintStates={constraintStates}
            conflictWarning={conflictWarning}
            onUpdateParam={handleUpdateParam}
            onToggleConstraint={handleToggleConstraint}
          />
        </>
      )}

      {/* CREATION GATEWAY MODAL */}
      <CreationGatewayModal
        isOpen={isCreationGatewayOpen}
        onClose={() => setIsCreationGatewayOpen(false)}
        onSelectTypology={(typ) => {
          setIsCreationGatewayOpen(false);
        }}
      />

      {/* STRUCTURAL OPTIMIZATION RECOMMENDATIONS MODAL */}
      <OptimizationRecommendationModal
        isOpen={isOptimizationModalOpen}
        onClose={() => setIsOptimizationModalOpen(false)}
        plan={optimizationPlan}
        onApplyRecommendation={(key, profile) => {
          onUpdateParams({ [key]: profile } as any);
        }}
        onApplyAllRecommendations={(recs) => {
          const updates: Partial<Screen1WorkspaceProps['params']> = {};
          for (const r of recs) {
            updates[r.suggestedParamKey] = r.recommendedProfile;
          }
          onUpdateParams(updates);
          setIsOptimizationModalOpen(false);
        }}
      />
    </div>
  );
};
