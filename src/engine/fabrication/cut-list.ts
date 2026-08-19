/**
 * STV CLOSER — FABRICATION: CUT LIST & WORKSHOP ENGINE
 * Generates exact workshop cut pieces, bevel preparation (AWS D1.1),
 * 45° miters, hole drillings, and linear meter summaries without pricing.
 */

import { ID, MemberFamily, StructuralMember } from "../../types/dst.schema";
import { StructuralGraph } from "../structural-graph";

export interface CutListItem {
  pieceId: string;
  memberId: ID;
  family: MemberFamily;
  designation: string;
  role: StructuralMember["role"];
  cutLengthM: number;
  cutLengthMm: number;
  cutAngleStartDeg: number;
  cutAngleEndDeg: number;
  bevelType: string;
  holesCount: number;
  assemblyMark: string;
  unitWeightKgM: number;
  totalWeightKg: number;
}

export interface WorkshopSummary {
  totalPieces: number;
  totalLinearMeters: number;
  totalWeightKg: number;
  familyBreakdown: {
    family: MemberFamily;
    linearMeters: number;
    weightKg: number;
    pieceCount: number;
  }[];
  cutList: CutListItem[];
}

export class FabricationEngine {
  /**
   * Generates detailed workshop cut list and fabrication schedule from a StructuralGraph
   */
  static generateCutList(graph: StructuralGraph): WorkshopSummary {
    const cutList: CutListItem[] = [];
    const familyMap = new Map<MemberFamily, { linearMeters: number; weightKg: number; pieceCount: number }>();

    let pieceIndex = 1;
    let grandTotalLinearMeters = 0;
    let grandTotalWeightKg = 0;

    for (const [memberId, member] of graph.members.entries()) {
      const n1 = graph.nodes.get(member.startNode);
      const n2 = graph.nodes.get(member.endNode);

      const lengthM = n1 && n2 ? graph.calculateDistance(n1.position, n2.position) : 0;
      const lengthMm = Math.round(lengthM * 1000);
      const unitWeight = member.profile.linearWeightKgM || 15.0;
      const pieceWeight = Number((lengthM * unitWeight).toFixed(2));

      // Calculate cut angle based on relative node vector
      let startAngle = member.fabrication?.cutAngleStartDeg ?? 0;
      let endAngle = member.fabrication?.cutAngleEndDeg ?? 0;

      if (n1 && n2 && member.role === "WEB") {
        const dx = Math.abs(n2.position.x - n1.position.x);
        const dy = Math.abs(n2.position.y - n1.position.y);
        const angle = Math.round(Math.atan2(dy, Math.max(0.01, dx)) * (180 / Math.PI));
        startAngle = angle;
        endAngle = angle;
      } else if (member.role === "COLUMN") {
        startAngle = 0; // Flat base
        endAngle = 0;
      }

      const bevelType = member.role === "WEB" ? "CORTE A BISEL (AWS D1.1)" : "CORTE RECTO A 90°";
      const assemblyMark = `${member.role.substring(0, 3)}-${String(pieceIndex).padStart(3, '0')}`;

      const item: CutListItem = {
        pieceId: `P-${String(pieceIndex).padStart(4, '0')}`,
        memberId,
        family: member.family,
        designation: member.profile.designation || `${member.family} ${member.role}`,
        role: member.role,
        cutLengthM: Number(lengthM.toFixed(3)),
        cutLengthMm: lengthMm,
        cutAngleStartDeg: startAngle,
        cutAngleEndDeg: endAngle,
        bevelType,
        holesCount: member.role === "COLUMN" ? 4 : 0,
        assemblyMark,
        unitWeightKgM: unitWeight,
        totalWeightKg: pieceWeight
      };

      cutList.push(item);
      pieceIndex++;
      grandTotalLinearMeters += lengthM;
      grandTotalWeightKg += pieceWeight;

      // Group by family
      const famData = familyMap.get(member.family) || { linearMeters: 0, weightKg: 0, pieceCount: 0 };
      famData.linearMeters += lengthM;
      famData.weightKg += pieceWeight;
      famData.pieceCount += 1;
      familyMap.set(member.family, famData);
    }

    const familyBreakdown = Array.from(familyMap.entries()).map(([family, data]) => ({
      family,
      linearMeters: Number(data.linearMeters.toFixed(2)),
      weightKg: Number(data.weightKg.toFixed(2)),
      pieceCount: data.pieceCount
    }));

    return {
      totalPieces: cutList.length,
      totalLinearMeters: Number(grandTotalLinearMeters.toFixed(2)),
      totalWeightKg: Number(grandTotalWeightKg.toFixed(2)),
      familyBreakdown,
      cutList
    };
  }
}
