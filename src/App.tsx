/**
// ============================================================
// STV CLOSER SYSTEM — ADVANCED ENGINEERING WORKSTATION
// DIGITAL STRUCTURAL TWIN INTERFACE
// ============================================================
 */

import React, { useState, useMemo } from 'react';
import { DSTProject, TrussType, SectionProfile } from './dst/dst.schema';
import { buildCompleteDSTProject } from './dst/project-builder';
import { updateAuditStatus } from './dst/design-engine';
import { DSTViewport } from './components/dst/DSTViewport';
import { STVWorkstationHeader } from './components/dst/STVWorkstationHeader';
import { StructuralNavigator } from './components/dst/StructuralNavigator';
import { ElementInspector } from './components/dst/ElementInspector';
import { BottomDock } from './components/dst/BottomDock';
import { DossierWorkstationModal } from './components/dst/DossierWorkstationModal';
import { GoogleSheetsModal } from './components/dst/GoogleSheetsModal';
import { Screen1Workspace } from './components/dst/screen1/Screen1Workspace';
import { Screen2Workspace } from './components/dst/screen2/Screen2Workspace';

export default function App() {
  // 1. Parametric State for the Digital Structural Twin
  const [params, setParams] = useState({
    spanM: 14.0,
    lengthM: 24.0,
    heightM: 6.0,
    framesCount: 5,
    roofRiseM: 2.2,
    trussType: 'WARREN' as TrussType,
    columnInclinationDeg: 8,
    purlinSpacingM: 1.25,
    columnProfile: {
      family: 'HSS',
      designation: 'HSS 8x8x1/4" (200x200x6.3)',
      depth: { value: 0.20, unit: 'm' },
      width: { value: 0.20, unit: 'm' },
      thickness: { value: 0.00635, unit: 'm' },
      gauge: 11
    } as SectionProfile,
    chordProfile: {
      family: 'PTR',
      designation: 'PTR 4x4 Cal 11',
      depth: { value: 0.10, unit: 'm' },
      width: { value: 0.10, unit: 'm' },
      thickness: { value: 0.00318, unit: 'm' },
      gauge: 11
    } as SectionProfile,
    webProfile: {
      family: 'PTR',
      designation: 'PTR 2x2 Cal 11',
      depth: { value: 0.05, unit: 'm' },
      width: { value: 0.05, unit: 'm' },
      thickness: { value: 0.00318, unit: 'm' },
      gauge: 11
    } as SectionProfile,
    purlinProfile: {
      family: 'C',
      designation: 'MONTEN C 6x2 Cal 14',
      depth: { value: 0.15, unit: 'm' },
      width: { value: 0.075, unit: 'm' },
      thickness: { value: 0.0025, unit: 'm' },
      gauge: 14
    } as SectionProfile
  });

  // 2. Deterministic DST Generation & Real-Time AISC 360-22 Structural Audit
  const dstResult = useMemo(() => {
    const built = buildCompleteDSTProject({
      spanM: params.spanM,
      lengthM: params.lengthM,
      heightM: params.heightM,
      framesCount: params.framesCount,
      roofRiseM: params.roofRiseM,
      trussType: params.trussType,
      columnProfile: params.columnProfile,
      chordProfile: params.chordProfile,
      webProfile: params.webProfile,
      purlinProfile: params.purlinProfile,
      columnInclinationDeg: params.columnInclinationDeg,
      purlinSpacingM: params.purlinSpacingM
    });

    // Run AISC 360-22 design engine traversal to evaluate D/C ratios, slenderness & update project.audit
    const auditedProject = updateAuditStatus(built.project, built.graph);

    return {
      ...built,
      project: auditedProject
    };
  }, [params]);

  // 3. UI Interaction State & Screen Mode
  const [viewLayout, setViewLayout] = useState<'SCREEN_01_COLUMNS' | 'SCREEN_02_TRUSSES' | 'WORKSTATION_CAD'>('SCREEN_01_COLUMNS');
  const [activeMode, setActiveMode] = useState<'ALL' | 'COLUMNS' | 'ROOF' | 'FOUNDATION' | 'CONNECTIONS' | 'FABRICATION' | 'AUDIT'>('ALL');
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<'MEMBER' | 'NODE' | 'FOUNDATION' | 'CONNECTION'>('MEMBER');
  const [isDossierOpen, setIsDossierOpen] = useState(false);
  const [isGoogleSheetsOpen, setIsGoogleSheetsOpen] = useState(false);

  const handleSelectElement = (id: string | null, type: 'MEMBER' | 'NODE' | 'FOUNDATION' | 'CONNECTION') => {
    setSelectedElementId(id);
    setSelectedType(type);
  };

  const handleUpdateParams = (updated: Partial<typeof params>) => {
    setParams((prev) => ({
      ...prev,
      ...updated
    }));
  };

  // Handle stage navigation from stage bars
  const handleNavigateStage = (stageId: string) => {
    if (stageId === '01') setViewLayout('SCREEN_01_COLUMNS');
    else if (stageId === '02') setViewLayout('SCREEN_02_TRUSSES');
    else setViewLayout('WORKSTATION_CAD');
  };

  // Handle truss transfer from Screen 02 into Digital Structural Twin
  const handleSendToDigitalTwin = (generated: {
    trussType: TrussType;
    spanM: number;
    roofRiseM: number;
    framesCount?: number;
  }) => {
    handleUpdateParams({
      trussType: generated.trussType,
      spanM: generated.spanM,
      roofRiseM: generated.roofRiseM
    });
    setViewLayout('WORKSTATION_CAD');
  };

  // Export handlers
  const handleExportDXF = () => {
    const jsonStr = JSON.stringify(dstResult.project, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${dstResult.project.id}_CAD_GEOMETRY.json`;
    a.click();
  };

  const handleExportJSON = () => {
    const jsonStr = JSON.stringify(dstResult.project, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${dstResult.project.id}_DST_TWIN.json`;
    a.click();
  };

  const handleExportCSV = () => {
    let csv = 'MARCA,ROL,PERFIL,LONGITUD_M,CORTE_INI,CORTE_FIN,SOLDADURA_M,GRUPO\n';
    dstResult.project.members.forEach((m) => {
      csv += `${m.id},${m.role},"${m.section.designation}",${m.geometry.length.value.toFixed(3)},${m.geometry.cutAngleStart},${m.geometry.cutAngleEnd},${m.fabrication?.weldLength.value || 0},${m.fabrication?.assemblyGroup || ''}\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${dstResult.project.id}_CUT_LIST.csv`;
    a.click();
  };

  const totalLinearMeters = (Array.from(dstResult.linearMetersSummary.values()) as number[]).reduce((a: number, b: number) => a + b, 0);

  return (
    <div className="relative w-screen h-screen bg-[#020307] text-[#F2F7F7] overflow-hidden flex flex-col font-mono-tech select-none">
      {/* Floating Layout Mode Switcher (Discrete in Top Right) */}
      <div className="absolute top-2 right-4 sm:right-64 z-50 flex items-center gap-1 bg-[#030911]/85 border border-[#00E5FF]/40 rounded px-1.5 py-0.5 text-[8px] font-orbitron">
        <button
          type="button"
          onClick={() => setViewLayout('SCREEN_01_COLUMNS')}
          className={`px-2 py-0.5 rounded transition-all ${
            viewLayout === 'SCREEN_01_COLUMNS'
              ? 'bg-[#00E5FF] text-black font-bold shadow-[0_0_8px_#00E5FF]'
              : 'text-[#8A949D] hover:text-white'
          }`}
        >
          01 COLUMNAS
        </button>
        <button
          type="button"
          onClick={() => setViewLayout('SCREEN_02_TRUSSES')}
          className={`px-2 py-0.5 rounded transition-all ${
            viewLayout === 'SCREEN_02_TRUSSES'
              ? 'bg-[#00E5FF] text-black font-bold shadow-[0_0_8px_#00E5FF]'
              : 'text-[#8A949D] hover:text-white'
          }`}
        >
          02 CERCHAS & TECHOS
        </button>
        <button
          type="button"
          onClick={() => setViewLayout('WORKSTATION_CAD')}
          className={`px-2 py-0.5 rounded transition-all ${
            viewLayout === 'WORKSTATION_CAD'
              ? 'bg-[#00E5FF] text-black font-bold shadow-[0_0_8px_#00E5FF]'
              : 'text-[#8A949D] hover:text-white'
          }`}
        >
          CAD TWIN
        </button>
      </div>

      {/* SCREEN 01: LIVING HUBS & COLUMN / FOUNDATION ENGINE */}
      {viewLayout === 'SCREEN_01_COLUMNS' ? (
        <Screen1Workspace
          project={dstResult.project}
          graph={dstResult.graph}
          linearMetersSummary={dstResult.linearMetersSummary}
          totalSteelWeightKg={dstResult.totalSteelWeightKg}
          params={params}
          onUpdateParams={handleUpdateParams}
          onOpenDossier={() => setIsDossierOpen(true)}
          onOpenGoogleSheets={() => setIsGoogleSheetsOpen(true)}
          onExportDXF={handleExportDXF}
          onNavigateStage={handleNavigateStage}
        />
      ) : viewLayout === 'SCREEN_02_TRUSSES' ? (
        /* SCREEN 02: ROOFS / TRUSSES — TYPOLOGY GATEWAY & PARAMETRIC ARCHIVE */
        <Screen2Workspace
          initialSpanM={params.spanM}
          initialRiseM={params.roofRiseM}
          initialDepthM={1.2}
          initialTrussType={params.trussType}
          topChordProfile={params.chordProfile}
          bottomChordProfile={params.chordProfile}
          webProfile={params.webProfile}
          onSendToDigitalTwin={handleSendToDigitalTwin}
          onNavigateStage={handleNavigateStage}
          onOpenDossier={() => setIsDossierOpen(true)}
          onOpenGoogleSheets={() => setIsGoogleSheetsOpen(true)}
        />
      ) : (
        /* ALTERNATE VIEW: CAD WORKSTATION WITH THREE-PANE INSPECTOR */
        <>
          {/* 1. TOP ENGINEERING WORKSTATION HEADER */}
          <STVWorkstationHeader
            project={dstResult.project}
            activeMode={activeMode}
            onSelectMode={setActiveMode}
            totalLinearMeters={totalLinearMeters}
            totalSteelWeightKg={dstResult.totalSteelWeightKg}
            onOpenDossier={() => setIsDossierOpen(true)}
            onOpenGoogleSheets={() => setIsGoogleSheetsOpen(true)}
            onExportDXF={handleExportDXF}
            onExportJSON={handleExportJSON}
            onExportCSV={handleExportCSV}
          />

          {/* 2. CENTRAL WORKSTATION GRID */}
          <div className="flex-1 w-full h-[calc(100vh-14rem)] flex relative overflow-hidden">
            <StructuralNavigator
              project={dstResult.project}
              selectedElementId={selectedElementId}
              onSelectElement={handleSelectElement}
            />

            <main className="flex-1 h-full relative">
              <DSTViewport
                project={dstResult.project}
                graph={dstResult.graph}
                selectedElementId={selectedElementId}
                onSelectElement={handleSelectElement}
                activeMode={activeMode}
              />
            </main>

            <ElementInspector
              project={dstResult.project}
              selectedElementId={selectedElementId}
              selectedType={selectedType}
              onUpdateParams={handleUpdateParams}
            />
          </div>

          {/* 3. DOCKABLE BOTTOM PARAMETRIC & AUDIT CONTROLS */}
          <BottomDock
            project={dstResult.project}
            graph={dstResult.graph}
            linearMetersSummary={dstResult.linearMetersSummary}
            totalSteelWeightKg={dstResult.totalSteelWeightKg}
            onUpdateParams={handleUpdateParams}
            selectedElementId={selectedElementId}
            onSelectElement={handleSelectElement}
          />
        </>
      )}

      {/* TECHNICAL DOSSIER & PRINT MEMORY MODAL */}
      <DossierWorkstationModal
        isOpen={isDossierOpen}
        onClose={() => setIsDossierOpen(false)}
        project={dstResult.project}
        graph={dstResult.graph}
        linearMetersSummary={dstResult.linearMetersSummary}
        totalSteelWeightKg={dstResult.totalSteelWeightKg}
        onOpenGoogleSheets={() => setIsGoogleSheetsOpen(true)}
      />

      {/* GOOGLE SHEETS WORKSPACE INTEGRATION MODAL */}
      <GoogleSheetsModal
        isOpen={isGoogleSheetsOpen}
        onClose={() => setIsGoogleSheetsOpen(false)}
        project={dstResult.project}
        graph={dstResult.graph}
        linearMetersSummary={dstResult.linearMetersSummary}
        totalSteelWeightKg={dstResult.totalSteelWeightKg}
      />
    </div>
  );
}

