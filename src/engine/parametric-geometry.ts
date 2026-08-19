/**
 * STV CLOSER — PARAMETRIC GEOMETRY GENERATOR
 * Generates StructuralGraphs from mathematical parameters, not static models.
 * 
 * "PARAMETERS -> GENERATOR -> NODES -> MEMBERS -> CONNECTIONS -> 3D GEOMETRY"
 */

import {
  TrussTypology,
  MemberFamily,
  StructuralNode,
  StructuralMember,
  MemberProfile,
  MemberMaterial
} from "../types/dst.schema";
import { StructuralGraph } from "./structural-graph";

export interface CustomNodeDefinition {
  id: string;
  x: number;
  y: number;
  z: number;
  isSupport?: boolean;
}

export interface CustomMemberDefinition {
  id: string;
  start: string;
  end: string;
  role: StructuralMember["role"];
  family?: MemberFamily;
  profile?: Partial<MemberProfile>;
}

export interface TrussParameters {
  span: number;             // Claro total (m)
  depth: number;            // Peralte / Altura de cercha (m)
  panelCount: number;       // Número de paneles / divisiones
  rise?: number;            // Flecha en cumbrera o arco (m)
  slope?: number;           // Pendiente (%)
  webAngle?: number;        // Ángulo de inclinación de diagonales (grados)
  baysCount?: number;       // Número de marcos / cerchas en el eje longitudinal
  baySpacing?: number;      // Separación entre cerchas (m)
  chordProfile?: {
    family: MemberFamily;
    designation: string;
    thicknessMm?: number;
    linearWeightKgM?: number;
  };
  webProfile?: {
    family: MemberFamily;
    designation: string;
    thicknessMm?: number;
    linearWeightKgM?: number;
  };
  purlinProfile?: {
    family: MemberFamily;
    designation: string;
    spacingM?: number;
  };
  zigzagDirection?:
    | "LEFT_TO_RIGHT"
    | "RIGHT_TO_LEFT"
    | "SYMMETRIC"
    | "REVERSE_AT_RIDGE";
  distribution?:
    | "UNIFORM"
    | "VARIABLE"
    | "CUSTOM";
  arch?: {
    enabled: boolean;
    curve: "CIRCULAR" | "PARABOLIC" | "SPLINE" | "CUSTOM";
    rise: number;
    peakPosition: number; // 0.5 = centro
  };
}

const DEFAULT_STEEL_MATERIAL: MemberMaterial = {
  specification: "ASTM A500 Grado B",
  FyMPa: 317,
  FuMPa: 400,
  elasticModulusGPa: 200,
  shearModulusGPa: 77.2,
  densityKgM3: 7850,
  poissonRatio: 0.3
};

/**
 * 1. WARREN TRUSS GENERATOR (Paramétrico)
 */
export function generateWarren(params: TrussParameters): StructuralGraph {
  const graph = new StructuralGraph();
  const span = Math.max(2, params.span);
  const depth = Math.max(0.3, params.depth);
  const panelCount = Math.max(2, Math.floor(params.panelCount));
  const panelWidth = span / panelCount;

  const chordProfile: MemberProfile = {
    designation: params.chordProfile?.designation || "HSS 6x4x1/4\"",
    family: params.chordProfile?.family || "HSS",
    linearWeightKgM: params.chordProfile?.linearWeightKgM || 23.9
  };

  const webProfile: MemberProfile = {
    designation: params.webProfile?.designation || "PTR 2x2 Cal 11",
    family: params.webProfile?.family || "PTR",
    linearWeightKgM: params.webProfile?.linearWeightKgM || 4.70
  };

  // Crear nodos inferiores (Bottom Chord) y superiores (Top Chord)
  for (let i = 0; i <= panelCount; i++) {
    const x = i * panelWidth - span / 2;

    // Nodo Inferior (N_i)
    graph.addNode({
      id: `N${i}`,
      position: { x, y: 0, z: 0 },
      support: i === 0 
        ? { type: "PIN", restraints: { x: true, y: true, z: true, rx: false, ry: false, rz: false } }
        : i === panelCount 
        ? { type: "ROLLER", restraints: { x: false, y: true, z: true, rx: false, ry: false, rz: false } }
        : undefined,
      tags: ["BOTTOM_CHORD", i === 0 || i === panelCount ? "SUPPORT" : "INNER_NODE"]
    });

    // Nodo Superior (T_i)
    graph.addNode({
      id: `T${i}`,
      position: { x, y: depth, z: 0 },
      tags: ["TOP_CHORD"]
    });
  }

  // Generar Miembros de Cuerdas
  for (let i = 0; i < panelCount; i++) {
    // Cuerda Superior
    graph.addMember({
      id: `TC-${i}`,
      startNode: `T${i}`,
      endNode: `T${i + 1}`,
      family: chordProfile.family || "HSS",
      role: "TOP_CHORD",
      profile: chordProfile,
      material: DEFAULT_STEEL_MATERIAL,
      fabrication: {
        cutAngleStartDeg: 0,
        cutAngleEndDeg: 0,
        bevelType: "SQUARE"
      }
    });

    // Cuerda Inferior
    graph.addMember({
      id: `BC-${i}`,
      startNode: `N${i}`,
      endNode: `N${i + 1}`,
      family: chordProfile.family || "HSS",
      role: "BOTTOM_CHORD",
      profile: chordProfile,
      material: DEFAULT_STEEL_MATERIAL,
      fabrication: {
        cutAngleStartDeg: 0,
        cutAngleEndDeg: 0,
        bevelType: "SQUARE"
      }
    });
  }

  // Generar Diagonales Warren en Zigzag
  for (let i = 0; i < panelCount; i++) {
    const isEven = i % 2 === 0;
    const start = isEven ? `N${i}` : `T${i}`;
    const end = isEven ? `T${i + 1}` : `N${i + 1}`;

    const angleDeg = Math.round(Math.atan2(depth, panelWidth) * (180 / Math.PI));

    graph.addMember({
      id: `WEB-${i}`,
      startNode: start,
      endNode: end,
      family: webProfile.family || "PTR",
      role: "WEB",
      profile: webProfile,
      material: DEFAULT_STEEL_MATERIAL,
      fabrication: {
        cutAngleStartDeg: angleDeg,
        cutAngleEndDeg: angleDeg,
        bevelType: "MITER_45"
      }
    });
  }

  return graph;
}

/**
 * 2. PRATT TRUSS GENERATOR (Montantes verticales + diagonales en tensión hacia el centro)
 */
export function generatePratt(params: TrussParameters): StructuralGraph {
  const graph = new StructuralGraph();
  const span = Math.max(2, params.span);
  const depth = Math.max(0.3, params.depth);
  const panelCount = Math.max(4, Math.floor(params.panelCount / 2) * 2); // Par
  const panelWidth = span / panelCount;
  const mid = panelCount / 2;

  const chordProfile: MemberProfile = {
    designation: params.chordProfile?.designation || "PTR 4x2 Cal 11",
    family: params.chordProfile?.family || "PTR",
    linearWeightKgM: 10.4
  };

  const webProfile: MemberProfile = {
    designation: params.webProfile?.designation || "PTR 2x2 Cal 11",
    family: params.webProfile?.family || "PTR",
    linearWeightKgM: 4.70
  };

  // Nodos
  for (let i = 0; i <= panelCount; i++) {
    const x = i * panelWidth - span / 2;
    // Si hay pendiente a dos aguas
    const riseOffset = params.rise ? (1 - Math.abs(i - mid) / mid) * params.rise : 0;
    const topY = depth + riseOffset;

    graph.addNode({
      id: `N${i}`,
      position: { x, y: 0, z: 0 },
      support: i === 0 || i === panelCount ? {
        type: i === 0 ? "PIN" : "ROLLER",
        restraints: { x: i === 0, y: true, z: true, rx: false, ry: false, rz: false }
      } : undefined
    });

    graph.addNode({
      id: `T${i}`,
      position: { x, y: topY, z: 0 }
    });
  }

  // Cuerdas y Montantes
  for (let i = 0; i < panelCount; i++) {
    graph.addMember({
      id: `TC-${i}`,
      startNode: `T${i}`,
      endNode: `T${i + 1}`,
      family: chordProfile.family || "PTR",
      role: "TOP_CHORD",
      profile: chordProfile,
      material: DEFAULT_STEEL_MATERIAL
    });

    graph.addMember({
      id: `BC-${i}`,
      startNode: `N${i}`,
      endNode: `N${i + 1}`,
      family: chordProfile.family || "PTR",
      role: "BOTTOM_CHORD",
      profile: chordProfile,
      material: DEFAULT_STEEL_MATERIAL
    });
  }

  // Montantes verticales en cada nodo
  for (let i = 0; i <= panelCount; i++) {
    graph.addMember({
      id: `VERT-${i}`,
      startNode: `N${i}`,
      endNode: `T${i}`,
      family: webProfile.family || "PTR",
      role: "VERTICAL",
      profile: webProfile,
      material: DEFAULT_STEEL_MATERIAL
    });
  }

  // Diagonales Pratt (apuntan hacia el centro)
  for (let i = 0; i < panelCount; i++) {
    if (i < mid) {
      // Mitad izquierda: N_i -> T_{i+1}
      graph.addMember({
        id: `DIAG-${i}`,
        startNode: `N${i}`,
        endNode: `T${i + 1}`,
        family: webProfile.family || "PTR",
        role: "WEB",
        profile: webProfile,
        material: DEFAULT_STEEL_MATERIAL
      });
    } else {
      // Mitad derecha: T_i -> N_{i+1}
      graph.addMember({
        id: `DIAG-${i}`,
        startNode: `T${i}`,
        endNode: `N${i + 1}`,
        family: webProfile.family || "PTR",
        role: "WEB",
        profile: webProfile,
        material: DEFAULT_STEEL_MATERIAL
      });
    }
  }

  return graph;
}

/**
 * 3. THREE-CHORD ARCH TRUSS (Arco Tri-Cuerda Espacial STV)
 */
export function generateThreeChordArch(params: TrussParameters): StructuralGraph {
  const graph = new StructuralGraph();
  const span = Math.max(4, params.span);
  const rise = Math.max(0.5, params.rise || params.depth * 1.5);
  const panelCount = Math.max(4, params.panelCount);
  const deltaTheta = Math.PI / panelCount;
  const radius = span / (2 * Math.sin(Math.PI / 2)); // Geometría de arco circular
  const width3D = 0.6; // Ancho espacial entre cuerdas inferiores

  for (let i = 0; i <= panelCount; i++) {
    const theta = i * deltaTheta;
    const x = - (span / 2) * Math.cos(theta);
    const y = rise * Math.sin(theta);

    // Cuerda Superior Central (TC)
    graph.addNode({
      id: `TC_${i}`,
      position: { x, y, z: 0 }
    });

    // Cuerda Inferior Izquierda (BCL)
    graph.addNode({
      id: `BCL_${i}`,
      position: { x, y: Math.max(0, y - params.depth), z: -width3D / 2 },
      support: (i === 0 || i === panelCount) ? {
        type: "FIXED",
        restraints: { x: true, y: true, z: true, rx: true, ry: true, rz: true }
      } : undefined
    });

    // Cuerda Inferior Derecha (BCR)
    graph.addNode({
      id: `BCR_${i}`,
      position: { x, y: Math.max(0, y - params.depth), z: width3D / 2 },
      support: (i === 0 || i === panelCount) ? {
        type: "FIXED",
        restraints: { x: true, y: true, z: true, rx: true, ry: true, rz: true }
      } : undefined
    });
  }

  const hssProfile: MemberProfile = {
    designation: "HSS 4x4x1/4\"",
    family: "HSS",
    linearWeightKgM: 18.2
  };

  const ptrWeb: MemberProfile = {
    designation: "PTR 2x2 Cal 11",
    family: "PTR",
    linearWeightKgM: 4.7
  };

  // Cuerdas longitudinales y celosía triangular 3D
  for (let i = 0; i < panelCount; i++) {
    // Longitudinales
    graph.addMember({ id: `TC_LONG_${i}`, startNode: `TC_${i}`, endNode: `TC_${i + 1}`, family: "HSS", role: "TOP_CHORD", profile: hssProfile, material: DEFAULT_STEEL_MATERIAL });
    graph.addMember({ id: `BCL_LONG_${i}`, startNode: `BCL_${i}`, endNode: `BCL_${i + 1}`, family: "HSS", role: "BOTTOM_CHORD", profile: hssProfile, material: DEFAULT_STEEL_MATERIAL });
    graph.addMember({ id: `BCR_LONG_${i}`, startNode: `BCR_${i}`, endNode: `BCR_${i + 1}`, family: "HSS", role: "BOTTOM_CHORD", profile: hssProfile, material: DEFAULT_STEEL_MATERIAL });

    // Anillo transversal
    graph.addMember({ id: `BOT_TRANS_${i}`, startNode: `BCL_${i}`, endNode: `BCR_${i}`, family: "PTR", role: "BRACING", profile: ptrWeb, material: DEFAULT_STEEL_MATERIAL });
    graph.addMember({ id: `DIAG_L_${i}`, startNode: `BCL_${i}`, endNode: `TC_${i}`, family: "PTR", role: "WEB", profile: ptrWeb, material: DEFAULT_STEEL_MATERIAL });
    graph.addMember({ id: `DIAG_R_${i}`, startNode: `BCR_${i}`, endNode: `TC_${i}`, family: "PTR", role: "WEB", profile: ptrWeb, material: DEFAULT_STEEL_MATERIAL });
  }

  return graph;
}

/**
 * 4. CUSTOM TRUSS GENERATOR (Direct Definition)
 */
export function generateCustomTruss(
  nodes: CustomNodeDefinition[],
  members: CustomMemberDefinition[]
): StructuralGraph {
  const graph = new StructuralGraph();

  nodes.forEach((n) => {
    graph.addNode({
      id: n.id,
      position: { x: n.x, y: n.y, z: n.z },
      support: n.isSupport ? {
        type: "PIN",
        restraints: { x: true, y: true, z: true, rx: false, ry: false, rz: false }
      } : undefined
    });
  });

  members.forEach((m) => {
    graph.addMember({
      id: m.id,
      startNode: m.start,
      endNode: m.end,
      family: m.family || "HSS",
      role: m.role || "OTHER",
      profile: {
        designation: m.profile?.designation || "CUSTOM_PROFILE",
        family: m.family || "HSS",
        linearWeightKgM: m.profile?.linearWeightKgM || 15.0
      },
      material: DEFAULT_STEEL_MATERIAL
    });
  });

  return graph;
}

/**
 * Main dispatcher based on TrussTypology
 */
export function generateTrussByTypology(
  typology: TrussTypology,
  params: TrussParameters
): StructuralGraph {
  switch (typology) {
    case "WARREN":
      return generateWarren(params);
    case "PRATT":
    case "HOWE":
    case "FINK":
      return generatePratt(params);
    case "THREE_CHORD":
    case "BOWSTRING":
      return generateThreeChordArch(params);
    default:
      return generateWarren(params);
  }
}
