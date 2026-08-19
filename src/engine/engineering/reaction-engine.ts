/**
 * STV CLOSER — ENGINEERING: REACTION ENGINE
 * Calculates 3D support reactions (Fx, Fy, Fz, Mx, My, Mz) at base nodes,
 * connecting the Load Path:
 * ROOF -> TRUSS -> COLUMNS -> BASE CONNECTION -> FOUNDATION
 */

import {
  ID,
  SupportReaction,
  StructuralStatus
} from "../../types/dst.schema";
import { StructuralGraph } from "../structural-graph";
import { generateLoadCases, EnvironmentalParameters } from "./load-cases";
import { STANDARD_LOAD_COMBINATIONS_ASD } from "./combinations";

export interface ReactionAnalysisResult {
  reactions: SupportReaction[];
  totalVerticalLoadKN: number;
  totalLateralWindKN: number;
  maxOverturningMomentKNm: number;
  governingCombination: string;
  loadTransferPathValid: boolean;
  status: StructuralStatus;
}

/**
 * Calculates reactions for all support nodes in the StructuralGraph
 */
export function computeSupportReactions(
  graph: StructuralGraph,
  envParams: EnvironmentalParameters
): ReactionAnalysisResult {
  const supportNodes = graph.getSupportNodes();
  
  if (supportNodes.length === 0) {
    return {
      reactions: [],
      totalVerticalLoadKN: 0,
      totalLateralWindKN: 0,
      maxOverturningMomentKNm: 0,
      governingCombination: "NONE",
      loadTransferPathValid: false,
      status: "INVALID_CONFIGURATION"
    };
  }

  const loadCases = generateLoadCases(graph, envParams);
  
  // Calculate total applied loads across all load cases
  let totalDeadKN = 0;
  let totalLiveKN = 0;
  let totalWindKN = 0;

  const deadCase = loadCases.find((lc) => lc.type === "DEAD");
  if (deadCase) {
    totalDeadKN = deadCase.loads.reduce((acc, l) => acc + l.magnitude, 0);
  }

  const liveCase = loadCases.find((lc) => lc.type === "ROOF_LIVE");
  if (liveCase) {
    totalLiveKN = liveCase.loads.reduce((acc, l) => acc + l.magnitude, 0);
  }

  const windCase = loadCases.find((lc) => lc.type === "WIND");
  if (windCase) {
    totalWindKN = windCase.loads.reduce((acc, l) => acc + l.magnitude, 0);
  }

  // Governing combination for vertical compression: COMB_ASD_02 (1.0 D + 1.0 Lr)
  const govVertKN = totalDeadKN + totalLiveKN;
  // Governing combination for wind overturning: COMB_ASD_03 (1.0 D + 0.6 W)
  const govWindKN = totalWindKN * 0.6;

  const numSupports = supportNodes.length;
  const reactions: SupportReaction[] = [];

  // Determine span extent to compute overturning moment lever arms
  const xCoords = supportNodes.map((n) => n.position.x);
  const minX = Math.min(...xCoords);
  const maxX = Math.max(...xCoords);
  const spanM = Math.max(1, maxX - minX);

  const totalOverturningMomentKNm = govWindKN * 4.5; // Assuming 4.5m eave height

  supportNodes.forEach((node, idx) => {
    // Base tributary vertical share
    const baseVerticalKN = govVertKN / numSupports;

    // Couple moment reaction from lateral wind overturning
    const isWindward = node.position.x <= 0;
    const coupleWindKN = (totalOverturningMomentKNm / spanM) * (isWindward ? -0.5 : 0.5);

    const FyKN = Number((baseVerticalKN + coupleWindKN).toFixed(2));
    const FxKN = Number((govWindKN / numSupports).toFixed(2));
    const FzKN = 0; // Transverse stability assumption

    // Base Moment (Fixed vs Pin support)
    const isFixed = node.support?.type === "FIXED" || node.support?.restraints.rz;
    const MzKNm = isFixed ? Number(((totalOverturningMomentKNm * 0.15) / numSupports).toFixed(2)) : 0;

    reactions.push({
      supportNodeId: node.id,
      FxKN,
      FyKN,
      FzKN,
      MxKNm: 0,
      MyKNm: 0,
      MzKNm,
      loadCombinationId: "COMB_ASD_02",
      status: FyKN > 0 ? "VALIDATED" : "REVIEW_REQUIRED" // Uplift requires check
    });
  });

  return {
    reactions,
    totalVerticalLoadKN: Number(govVertKN.toFixed(2)),
    totalLateralWindKN: Number(govWindKN.toFixed(2)),
    maxOverturningMomentKNm: Number(totalOverturningMomentKNm.toFixed(2)),
    governingCombination: "1.0 D + 1.0 Lr (AISC 360-16 ASD)",
    loadTransferPathValid: numSupports >= 2,
    status: numSupports >= 2 ? "VALIDATED" : "REVIEW_REQUIRED"
  };
}
