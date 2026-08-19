/**
 * STV CLOSER — EXPORT: CAD & DST DATA EXPORTER
 * Exports the StructuralGraph as DXF (AutoCAD / Revit compatible),
 * standard DST JSON schema, and fabrication CSV tables.
 * 
 * "STRUCTURAL GRAPH -> THREE.JS / PDF / DXF / IFC / QUOTATION DATA"
 */

import { StructuralGraph } from "../structural-graph";
import { FabricationEngine } from "../fabrication/cut-list";

export class CadExporter {
  /**
   * Generates standard AutoCAD DXF ASCII format from the StructuralGraph
   */
  static exportDXF(graph: StructuralGraph, projectName: string = "STV_STRUCTURE"): string {
    const lines: string[] = [];

    // Header section
    lines.push("0", "SECTION", "2", "HEADER", "0", "ENDSEC");
    // Tables section (Layers)
    lines.push("0", "SECTION", "2", "TABLES", "0", "TABLE", "2", "LAYER");
    
    const layers = ["STV_COLUMNS", "STV_CHORDS", "STV_WEBS", "STV_PURLINS", "STV_SUPPORTS"];
    layers.forEach((layer) => {
      lines.push("0", "LAYER", "2", layer, "70", "0", "62", "7", "6", "CONTINUOUS");
    });
    lines.push("0", "ENDTAB", "0", "ENDSEC");

    // Entities section
    lines.push("0", "SECTION", "2", "ENTITIES");

    for (const member of graph.members.values()) {
      const n1 = graph.nodes.get(member.startNode);
      const n2 = graph.nodes.get(member.endNode);
      if (!n1 || !n2) continue;

      let layerName = "STV_CHORDS";
      if (member.role === "COLUMN") layerName = "STV_COLUMNS";
      else if (member.role === "WEB" || member.role === "VERTICAL") layerName = "STV_WEBS";
      else if (member.role === "PURLIN") layerName = "STV_PURLINS";

      // 3D LINE entity
      lines.push(
        "0", "LINE",
        "8", layerName,
        "10", n1.position.x.toFixed(4),
        "20", n1.position.z.toFixed(4),
        "30", n1.position.y.toFixed(4),
        "11", n2.position.x.toFixed(4),
        "21", n2.position.z.toFixed(4),
        "31", n2.position.y.toFixed(4)
      );
    }

    // Support Nodes as Points
    for (const node of graph.getSupportNodes()) {
      lines.push(
        "0", "POINT",
        "8", "STV_SUPPORTS",
        "10", node.position.x.toFixed(4),
        "20", node.position.z.toFixed(4),
        "30", node.position.y.toFixed(4)
      );
    }

    lines.push("0", "ENDSEC", "0", "EOF");
    return lines.join("\n");
  }

  /**
   * Exports standard DST JSON dataset
   */
  static exportDSTJSON(graph: StructuralGraph): string {
    const data = {
      format: "STV_DIGITAL_STRUCTURAL_TWIN_V1",
      timestamp: new Date().toISOString(),
      nodes: Array.from(graph.nodes.values()),
      members: Array.from(graph.members.values()),
      connections: Array.from(graph.connections.values()),
      stats: {
        totalNodes: graph.nodes.size,
        totalMembers: graph.members.size,
        totalLinearMeters: graph.calculateLinearMeters()
      }
    };
    return JSON.stringify(data, null, 2);
  }

  /**
   * Exports Workshop Fabrication Cut-List CSV
   */
  static exportCutListCSV(graph: StructuralGraph): string {
    const summary = FabricationEngine.generateCutList(graph);
    const rows = [
      "PIEZA,ROL,FAMILIA,PERFIL,LONGITUD_M,ANGULO_INI,ANGULO_FIN,PREPARACION,MARCA_TALLER,PESO_KG"
    ];

    summary.cutList.forEach((item) => {
      rows.push(
        `"${item.pieceId}","${item.role}","${item.family}","${item.designation}",${item.cutLengthM},${item.cutAngleStartDeg},${item.cutAngleEndDeg},"${item.bevelType}","${item.assemblyMark}",${item.totalWeightKg}`
      );
    });

    return rows.join("\n");
  }
}
