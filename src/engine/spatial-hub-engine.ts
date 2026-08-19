/**
 * STV CLOSER — 3D SPATIAL HOLOGRAPHIC HUB ENGINE
 * Binds structural entities (Nodes, Members, Reactions) directly to 3D spatial hubs,
 * orbital rings, coordinate vectors, and zero-flat-card visual interfaces.
 * 
 * "Los hubs no contienen la estructura. La estructura contiene los hubs."
 */

import { ID, Vec3, StructuralMember, StructuralNode, SupportReaction, StructuralStatus } from "../types/dst.schema";
import { StructuralGraph } from "./structural-graph";

export interface SpatialHubAnchor {
  id: string;
  type: "NODE_HUB" | "MEMBER_MIDPOINT" | "REACTION_BASE" | "ZIGZAG_APEX";
  entityId: ID;
  worldPosition: Vec3;
  normalVector?: Vec3;
  tangentVector?: Vec3;
  status: StructuralStatus;
  primaryLabel: string;
  secondaryData: string;
  tertiaryMetric?: string;
  activeRingRadiusM: number;
}

export class SpatialHubEngine {
  /**
   * Generates real-space anchors for every significant topological entity
   */
  static generateSpatialHubs(
    graph: StructuralGraph,
    reactions: SupportReaction[] = []
  ): SpatialHubAnchor[] {
    const hubs: SpatialHubAnchor[] = [];

    // 1. Generate Hubs for Support & Key Nodes
    for (const [nodeId, node] of graph.nodes.entries()) {
      const isSupport = node.support && node.support.type !== "FREE";
      const reaction = reactions.find((r) => r.supportNodeId === nodeId);

      if (isSupport) {
        hubs.push({
          id: `HUB_SUPPORT_${nodeId}`,
          type: "REACTION_BASE",
          entityId: nodeId,
          worldPosition: node.position,
          normalVector: { x: 0, y: 1, z: 0 },
          status: reaction?.status || "VALIDATED",
          primaryLabel: `APOYO ${nodeId}`,
          secondaryData: reaction ? `Fy: ${reaction.FyKN} kN | Fx: ${reaction.FxKN} kN` : "PLACA BASE 300x300",
          tertiaryMetric: "4x PERNO M20 A325",
          activeRingRadiusM: 0.35
        });
      } else if (node.id.startsWith("T") || node.id.includes("APEX") || node.position.y > 1.5) {
        hubs.push({
          id: `HUB_NODE_${nodeId}`,
          type: "NODE_HUB",
          entityId: nodeId,
          worldPosition: node.position,
          normalVector: { x: 0, y: 1, z: 0 },
          status: "VALIDATED",
          primaryLabel: `NUDO ${nodeId}`,
          secondaryData: `[X:${node.position.x.toFixed(2)}, Y:${node.position.y.toFixed(2)}]`,
          tertiaryMetric: "UNIÓN TALLER E7018",
          activeRingRadiusM: 0.20
        });
      }
    }

    // 2. Generate Member Midpoint Hubs
    for (const [memberId, member] of graph.members.entries()) {
      const n1 = graph.nodes.get(member.startNode);
      const n2 = graph.nodes.get(member.endNode);
      if (!n1 || !n2) continue;

      const midX = (n1.position.x + n2.position.x) / 2;
      const midY = (n1.position.y + n2.position.y) / 2;
      const midZ = (n1.position.z + n2.position.z) / 2;
      const lengthM = graph.calculateDistance(n1.position, n2.position);

      if (member.role === "COLUMN" || member.role === "TOP_CHORD" || member.id.endsWith("-0") || member.id.endsWith("-2")) {
        hubs.push({
          id: `HUB_MEMBER_${memberId}`,
          type: "MEMBER_MIDPOINT",
          entityId: memberId,
          worldPosition: { x: midX, y: midY, z: midZ },
          status: member.status || "VALIDATED",
          primaryLabel: `${member.role}: ${member.profile.designation || member.family}`,
          secondaryData: `L = ${lengthM.toFixed(2)}m (m.l.)`,
          tertiaryMetric: `${member.profile.linearWeightKgM || 15} kg/m | AISC 360`,
          activeRingRadiusM: 0.28
        });
      }
    }

    return hubs;
  }
}
