/**
 * STV CLOSER — FABRICATION: CONNECTION SCHEDULE
 * Details noded connections, gusset plates, anchor bolts (A325 / F1554),
 * and weld specifications (AWS D1.1 E70XX).
 */

import { ID, StructuralConnection } from "../../types/dst.schema";
import { StructuralGraph } from "../structural-graph";

export interface NodeConnectionItem {
  nodeId: ID;
  connectionId: string;
  type: "BOLTED" | "WELDED" | "BASE_PLATE" | "HYBRID";
  connectedMembersCount: number;
  connectedMemberIds: string[];
  plateSpec?: string;
  boltsSpec?: string;
  weldsSpec?: string;
  position: { x: number; y: number; z: number };
}

export class ConnectionScheduleEngine {
  static generateConnectionSchedule(graph: StructuralGraph): NodeConnectionItem[] {
    const items: NodeConnectionItem[] = [];

    for (const [nodeId, node] of graph.nodes.entries()) {
      const connectedMembers = graph.getConnectedMembers(nodeId);
      if (connectedMembers.length === 0) continue;

      const isSupport = node.support && node.support.type !== "FREE";
      let type: NodeConnectionItem["type"] = "WELDED";
      let plateSpec: string | undefined = undefined;
      let boltsSpec: string | undefined = undefined;
      let weldsSpec: string | undefined = "Cordón E7018 Filete 3/16\" (AWS D1.1)";

      if (isSupport) {
        type = "BASE_PLATE";
        plateSpec = 'Placa Base 300x300x19mm (3/4") ASTM A36 con 4 Barrenos';
        boltsSpec = '4 Pernos de Anclaje M20 (5/8") x 400mm ASTM A325 / F1554';
        weldsSpec = 'Soldadura Perimetral a Tope y Filete 1/4" E70XX';
      } else if (connectedMembers.length >= 4) {
        type = "HYBRID";
        plateSpec = 'Cartela de Nudo Acero A36 e=9.5mm (3/8")';
        weldsSpec = 'Soldadura Continua en Taller E70XX';
      }

      items.push({
        nodeId,
        connectionId: `CONN-${nodeId}`,
        type,
        connectedMembersCount: connectedMembers.length,
        connectedMemberIds: connectedMembers.map((m) => m.id),
        plateSpec,
        boltsSpec,
        weldsSpec,
        position: node.position
      });
    }

    return items;
  }
}
