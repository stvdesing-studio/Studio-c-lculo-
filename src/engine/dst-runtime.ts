/**
 * STV CLOSER — DIGITAL STRUCTURAL TWIN (DST) RUNTIME ENGINE
 * Unified orchestration runtime for STV CLOSER.
 * 
 * Flow:
 * PARAMETERS -> GENERATOR -> STRUCTURAL GRAPH -> LOADS & REACTIONS ->
 * AUDIT ENGINE -> FABRICATION TAKE-OFF -> SPATIAL HUBS -> EXPORT
 */

import {
  TrussTypology,
  SupportReaction,
  MemberScheduleItem
} from "../types/dst.schema";
import { StructuralGraph } from "./structural-graph";
import { TrussParameters, generateTrussByTypology } from "./parametric-geometry";
import { EnvironmentalParameters } from "./engineering/load-cases";
import { computeSupportReactions, ReactionAnalysisResult } from "./engineering/reaction-engine";
import { StructuralAuditEngine, StructuralAuditReport } from "./engineering/structural-audit";
import { FabricationEngine, WorkshopSummary } from "./fabrication/cut-list";
import { ConnectionScheduleEngine, NodeConnectionItem } from "./fabrication/connection-schedule";
import { SpatialHubEngine, SpatialHubAnchor } from "./spatial-hub-engine";
import { CadExporter } from "./export/cad-exporter";

export interface DSTRuntimeState {
  graph: StructuralGraph;
  reactionsResult: ReactionAnalysisResult;
  auditReport: StructuralAuditReport;
  workshopSummary: WorkshopSummary;
  memberSchedule: MemberScheduleItem[];
  connections: NodeConnectionItem[];
  spatialHubs: SpatialHubAnchor[];
  timestamp: string;
}

export class DSTRuntime {
  private currentParams: TrussParameters;
  private currentEnv: EnvironmentalParameters;
  private currentTypology: TrussTypology;
  private state: DSTRuntimeState | null = null;

  constructor(
    typology: TrussTypology = "WARREN",
    params: Partial<TrussParameters> = {},
    env: Partial<EnvironmentalParameters> = {}
  ) {
    this.currentTypology = typology;
    this.currentParams = {
      span: 12.0,
      depth: 1.5,
      panelCount: 6,
      rise: 0.6,
      chordProfile: {
        family: "HSS",
        designation: "HSS 6x4x1/4\"",
        thicknessMm: 6.35,
        linearWeightKgM: 23.9
      },
      webProfile: {
        family: "PTR",
        designation: "PTR 2x2 Cal 11",
        thicknessMm: 3.04,
        linearWeightKgM: 4.70
      },
      ...params
    };

    this.currentEnv = {
      windSpeedKmH: 45,
      roofDeadLoadKgM2: 25,
      roofLiveLoadKgM2: 40,
      tributaryWidthM: 4.0,
      ...env
    };

    this.recompute();
  }

  /**
   * Recomputes the whole structural pipeline deterministically
   */
  public recompute(): DSTRuntimeState {
    // 1. Parametric Geometry -> Structural Graph
    const graph = generateTrussByTypology(this.currentTypology, this.currentParams);

    // 2. Loads & Support Reactions
    const reactionsResult = computeSupportReactions(graph, this.currentEnv);

    // 3. AISC / RCDF Structural Audit
    const auditReport = StructuralAuditEngine.auditGraph(graph, this.currentEnv);

    // 4. Fabrication Engine & Workshop Cut-List
    const workshopSummary = FabricationEngine.generateCutList(graph);
    const memberSchedule = graph.generateMemberSchedule();
    const connections = ConnectionScheduleEngine.generateConnectionSchedule(graph);

    // 5. 3D Spatial Holographic Hubs
    const spatialHubs = SpatialHubEngine.generateSpatialHubs(graph, reactionsResult.reactions);

    this.state = {
      graph,
      reactionsResult,
      auditReport,
      workshopSummary,
      memberSchedule,
      connections,
      spatialHubs,
      timestamp: new Date().toISOString()
    };

    return this.state;
  }

  public getState(): DSTRuntimeState {
    if (!this.state) {
      return this.recompute();
    }
    return this.state;
  }

  public updateParameters(updated: Partial<TrussParameters>): DSTRuntimeState {
    this.currentParams = { ...this.currentParams, ...updated };
    return this.recompute();
  }

  public updateEnvironmental(updated: Partial<EnvironmentalParameters>): DSTRuntimeState {
    this.currentEnv = { ...this.currentEnv, ...updated };
    return this.recompute();
  }

  public setTypology(typology: TrussTypology): DSTRuntimeState {
    this.currentTypology = typology;
    return this.recompute();
  }

  // Export methods
  public exportDXF(): string {
    return CadExporter.exportDXF(this.getState().graph);
  }

  public exportDSTJSON(): string {
    return CadExporter.exportDSTJSON(this.getState().graph);
  }

  public exportCutListCSV(): string {
    return CadExporter.exportCutListCSV(this.getState().graph);
  }
}
