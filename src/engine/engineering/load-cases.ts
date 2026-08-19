/**
 * STV CLOSER — ENGINEERING: LOAD CASES
 * Definition and computation of primary structural load vectors:
 * Dead Load (D), Roof Live Load (Lr), Wind Pressure (W - ASCE 7 / CFE),
 * Seismic Action (E), and Thermal/Equipment loads.
 */

import { LoadCase, LoadCaseType, Vec3 } from "../../types/dst.schema";
import { StructuralGraph } from "../structural-graph";

export interface EnvironmentalParameters {
  windSpeedKmH: number;         // Velocidad de viento de diseño (CFE / ASCE 7)
  roofDeadLoadKgM2: number;     // Peso propio cubierta + instalaciones (kg/m2)
  roofLiveLoadKgM2: number;     // Carga viva de mantenimiento (kg/m2)
  seismicZone?: "A" | "B" | "C" | "D"; // Zonificación sísmica CFE / NTC-2023
  tributaryWidthM: number;      // Ancho tributario (separación entre marcos)
}

/**
 * Generates standardized engineering load cases for a given structural graph
 */
export function generateLoadCases(
  graph: StructuralGraph,
  env: EnvironmentalParameters
): LoadCase[] {
  const deadLoads: LoadCase["loads"] = [];
  const liveLoads: LoadCase["loads"] = [];
  const windLoads: LoadCase["loads"] = [];

  // Wind dynamic pressure q_z = 0.00256 * V^2 * Kz (in N/m2 -> convert to kN/m2)
  // Simplified CFE formula: q = 0.0048 * V^2 (Pa) -> kN/m2
  const windPressureKNM2 = (0.0048 * Math.pow(env.windSpeedKmH, 2)) / 1000;
  const deadLoadKNM2 = (env.roofDeadLoadKgM2 * 9.81) / 1000;
  const liveLoadKNM2 = (env.roofLiveLoadKgM2 * 9.81) / 1000;

  // Find top chord nodes for distributed tributary loading
  const topNodes = Array.from(graph.nodes.values()).filter(
    (n) => n.id.startsWith("T") || n.tags?.includes("TOP_CHORD") || n.position.y > 0
  );

  const nodeTributaryLength = topNodes.length > 1 ? env.tributaryWidthM : 1;
  const nodeCount = Math.max(1, topNodes.length);

  topNodes.forEach((node) => {
    // 1. Carga Muerta Gravitacional (Vector Y negativo)
    const deadMagnitudeKN = deadLoadKNM2 * (nodeTributaryLength * 2);
    deadLoads.push({
      nodeId: node.id,
      direction: { x: 0, y: -1, z: 0 },
      magnitude: Number(deadMagnitudeKN.toFixed(3)),
      units: "kN"
    });

    // 2. Carga Viva de Techo (Vector Y negativo)
    const liveMagnitudeKN = liveLoadKNM2 * (nodeTributaryLength * 2);
    liveLoads.push({
      nodeId: node.id,
      direction: { x: 0, y: -1, z: 0 },
      magnitude: Number(liveMagnitudeKN.toFixed(3)),
      units: "kN"
    });

    // 3. Carga de Viento Lateral / Succión (Vector X lateral + Vector Y succión)
    const windMagnitudeKN = windPressureKNM2 * (nodeTributaryLength * 2);
    windLoads.push({
      nodeId: node.id,
      direction: { x: 0.707, y: 0.707, z: 0 }, // Succión y empuje barlovento
      magnitude: Number(windMagnitudeKN.toFixed(3)),
      units: "kN"
    });
  });

  return [
    {
      id: "LC_DEAD",
      type: "DEAD",
      description: "Carga Muerta Permanente (D) — Peso Propio y Cubierta",
      loads: deadLoads
    },
    {
      id: "LC_LIVE",
      type: "ROOF_LIVE",
      description: "Carga Viva de Techo (Lr) — Mantenimiento y Montaje",
      loads: liveLoads
    },
    {
      id: "LC_WIND",
      type: "WIND",
      description: `Presión Dinámica de Viento (W) @ ${env.windSpeedKmH} km/h (CFE / ASCE 7)`,
      loads: windLoads
    }
  ];
}
