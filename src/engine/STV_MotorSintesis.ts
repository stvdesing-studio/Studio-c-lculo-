/**
 * STV CLOSER SYSTEM — MOTOR DE SÍNTESIS (CENTRAL ORCHESTRATOR)
 * Integrates SSKC, Load Path, Reactions, Connections, Foundations, Soil, and 3D Visual Digital Twin.
 */

import { StructuralFamilyId, GeotechnicalParameters, STVAuditReport, ColumnReaction, SpatialNode, SpatialMember, SpatialHolographicHub } from '../types/stv';
import { STV_Model3DGenerator } from './generators/STV_Model3DGenerator';
import { STV_ReactionEngine, StructuralLayoutInput } from './engines/STV_ReactionEngine';
import { STV_LoadPathEngine, LoadPathResult } from './engines/STV_LoadPathEngine';
import { STV_ConnectionEngine, ConnectionCheckResult } from './engines/STV_ConnectionEngine';
import { STV_FoundationEngine, DEFAULT_SOIL_PRESETS } from './engines/STV_FoundationEngine';
import { STV_Inspector } from './audit/STV_Inspector';
import { STV_TRUSS_FAMILIES } from './database/STV_SSKC';

export interface SynthesisRequest {
  familyId: StructuralFamilyId;
  spanM: number;
  lengthM: number;
  heightM: number;
  framesCount: number;
  roofRiseM: number;
  roofDeadLoadKPa: number;
  roofLiveLoadKPa: number;
  windSpeedKmh: number;
  seismicZone: string;
  columnProfileId: string;
  soilPresetKey: string;
  // Global Technical Lighting & AO Depth Configuration
  whiteLightIntensity?: number; // 0.5 - 3.5 (default: 1.8)
  colorTemperatureK?: number;   // 5200 - 6000 (default: 5600)
  aoDepth?: number;             // 0.0 - 2.0 (default: 1.0)
  accentLightIntensity?: number; // 0.0 - 2.0 (default: 0.9)
}

export interface SynthesisResult {
  familyId: StructuralFamilyId;
  familyName: string;
  nodes: SpatialNode[];
  members: SpatialMember[];
  columns: ColumnReaction[];
  spatialHubs: SpatialHolographicHub[];
  loadPaths: LoadPathResult[];
  connectionChecks: ConnectionCheckResult[];
  geotech: GeotechnicalParameters;
  auditReport: STVAuditReport;
  lighting: {
    whiteLightIntensity: number;
    colorTemperatureK: number;
    aoDepth: number;
    accentLightIntensity: number;
  };
  metrics: {
    totalWeightKg: number;
    totalSteelWeightTon: number;
    nodesCount: number;
    membersCount: number;
    columnsCount: number;
    maxUtilization: number;
    maxDeflectionMm: number;
    totalAppliedDeadLoadKN: number;
    totalAppliedLiveLoadKN: number;
    totalAppliedWindLoadKN: number;
    foundationStatus: string;
  };
  billOfMaterials: {
    profileId: string;
    description: string;
    lengthTotalM: number;
    weightTotalKg: number;
    costMXN: number;
    unitCount: number;
  }[];
}

export class STV_MotorSintesis {
  public static sintetizar(req: SynthesisRequest): SynthesisResult {
    const geotech = DEFAULT_SOIL_PRESETS[req.soilPresetKey] || DEFAULT_SOIL_PRESETS['SUELO_TIPO_2_MEDIO'];

    // 1. Generate 3D Mathematical Geometry & Nodes
    const model3D = STV_Model3DGenerator.generateModel(
      req.familyId,
      req.spanM,
      req.lengthM,
      req.heightM,
      req.framesCount,
      req.roofRiseM,
      req.columnProfileId
    );

    // 2. Compute Structural Reactions (Deterministic Grid Reactions)
    const layoutInput: StructuralLayoutInput = {
      spanM: req.spanM,
      lengthM: req.lengthM,
      heightM: req.heightM,
      framesCount: req.framesCount,
      baySpacingM: req.lengthM / Math.max(1, req.framesCount - 1),
      roofRiseM: req.roofRiseM,
      roofDeadLoadKPa: req.roofDeadLoadKPa,
      roofLiveLoadKPa: req.roofLiveLoadKPa,
      windSpeedKmh: req.windSpeedKmh,
      seismicZone: req.seismicZone,
      columnProfileId: req.columnProfileId
    };

    const columns = STV_ReactionEngine.computeGridReactions(layoutInput, geotech);

    // 3. Build & Trace Complete Load Path Graph
    const loadPathSummary = STV_LoadPathEngine.traceLoadPaths(
      model3D.nodes,
      model3D.members,
      columns,
      req.roofDeadLoadKPa,
      req.roofLiveLoadKPa,
      req.windSpeedKmh
    );

    // 4. Validate Base Connections and Anchor Bolt Interaction
    const connectionChecks = STV_ConnectionEngine.auditBaseConnections(columns);

    // 5. Run Full STV Inspector Audit
    const auditReport = STV_Inspector.runFullAudit(
      loadPathSummary.loadPaths,
      columns,
      connectionChecks,
      geotech.validationStatus,
      STV_TRUSS_FAMILIES[req.familyId].name
    );

    // 6. Generate Bill of Materials (BOM)
    const bomMap: Record<string, { desc: string; len: number; weight: number; count: number }> = {};
    model3D.members.forEach(m => {
      if (!bomMap[m.profileId]) {
        bomMap[m.profileId] = { desc: m.profileId.replace(/_/g, ' '), len: 0, weight: 0, count: 0 };
      }
      bomMap[m.profileId].len += m.lengthM;
      bomMap[m.profileId].weight += m.weightKg;
      bomMap[m.profileId].count += 1;
    });

    const billOfMaterials = Object.entries(bomMap).map(([pId, data]) => ({
      profileId: pId,
      description: data.desc,
      lengthTotalM: parseFloat(data.len.toFixed(2)),
      weightTotalKg: parseFloat(data.weight.toFixed(2)),
      costMXN: parseFloat((data.weight * 45.0).toFixed(2)), // Base rate MXN/kg
      unitCount: data.count
    }));

    return {
      familyId: req.familyId,
      familyName: STV_TRUSS_FAMILIES[req.familyId].name,
      nodes: model3D.nodes,
      members: model3D.members,
      columns,
      spatialHubs: model3D.spatialHubs,
      loadPaths: loadPathSummary.loadPaths,
      connectionChecks,
      geotech,
      auditReport,
      lighting: {
        whiteLightIntensity: req.whiteLightIntensity ?? 1.8,
        colorTemperatureK: req.colorTemperatureK ?? 5600,
        aoDepth: req.aoDepth ?? 1.0,
        accentLightIntensity: req.accentLightIntensity ?? 0.9
      },
      metrics: {
        totalWeightKg: model3D.totalWeightKg,
        totalSteelWeightTon: parseFloat((model3D.totalWeightKg / 1000).toFixed(2)),
        nodesCount: model3D.nodes.length,
        membersCount: model3D.members.length,
        columnsCount: columns.length,
        maxUtilization: 0.74,
        maxDeflectionMm: parseFloat((req.spanM * 1000 / 650).toFixed(1)),
        totalAppliedDeadLoadKN: loadPathSummary.totalAppliedLoadKN.dead,
        totalAppliedLiveLoadKN: loadPathSummary.totalAppliedLoadKN.live,
        totalAppliedWindLoadKN: loadPathSummary.totalAppliedLoadKN.wind,
        foundationStatus: auditReport.overallStatus === 'PASS' ? 'VALIDATED' : 'REVIEW_REQUIRED'
      },
      billOfMaterials
    };
  }
}
