// ============================================================
// STV CLOSER — PARAMETRIC GEOMETRY ENGINE
// parametric-geometry.ts
// ============================================================

import {
  ID,
  Point3D,
  StructuralNode,
  StructuralMember,
  TrussDefinition,
  TrussType
} from "./dst.schema";

import {
  StructuralGraph,
  createStructuralGraph,
  addNode,
  addMember
} from "./structural-graph";

// ============================================================
// GENERATOR RESULT
// ============================================================

export interface GeneratedTruss {

  graph: StructuralGraph;

  truss: TrussDefinition;

  topChord: ID[];

  bottomChord: ID[];

  webMembers: ID[];
}

// ============================================================
// BASIC PARAMETERS
// ============================================================

export interface TrussGeometryParameters {

  id: ID;

  span: number;

  rise: number;

  panelCount: number;

  depth?: number;

  type: TrussType;

  zigzagDirection?:
    | "LEFT_TO_RIGHT"
    | "RIGHT_TO_LEFT"
    | "SYMMETRIC"
    | "REVERSE_AT_RIDGE";

  verticals?: boolean;

  slope?: number;
}

// ============================================================
// GENERIC TRUSS
// ============================================================

export function generateTruss(
  params: TrussGeometryParameters
): GeneratedTruss {

  switch (params.type) {

    case "WARREN":
      return generateWarren(params);

    case "PRATT":
      return generatePratt(params);

    case "HOWE":
      return generateHowe(params);

    case "FINK":
      return generateFink(params);

    case "SAWTOOTH":
      return generateSawtooth(params);

    case "BOWSTRING":
      return generateBowstring(params);

    case "SCISSORS":
      return generateScissors(params);

    case "VIERENDEEL":
      return generateVierendeel(params);

    case "BALTIMORE":
      return generateBaltimore(params);

    case "K_TRUSS":
      return generateKTruss(params);

    case "N_TRUSS":
      return generateNTruss(params);

    case "W_TRUSS":
      return generateWTruss(params);

    case "POLONCEAU":
      return generatePolonceau(params);

    case "THREE_CHORD":
      return generateThreeChord(params);

    case "SPACE_TRUSS_MERO":
      return generateWarren(params);

    case "SHED":
      return generateShed(params);

    case "CANTILEVER":
      return generateCantilever(params);

    case "CUSTOM":
      return generateCustom(params);

    default:
      // Robust Fallback: Never throw, return standard Warren truss
      return generateWarren(params);
  }
}

// ============================================================
// WARREN
// ============================================================

export function generateWarren(
  params: TrussGeometryParameters
): GeneratedTruss {

  const graph = createStructuralGraph();

  const topChord: ID[] = [];
  const bottomChord: ID[] = [];
  const webMembers: ID[] = [];

  const panelLength =
    params.span / params.panelCount;

  const depth =
    params.depth ?? params.rise;

  // ------------------------------------------
  // BOTTOM NODES
  // ------------------------------------------

  for (let i = 0; i <= params.panelCount; i++) {

    const x = i * panelLength;

    const node: StructuralNode = {

      id: `${params.id}-B-${i}`,

      position: {
        x,
        y: 0,
        z: 0
      },

      type:
        i === 0 || i === params.panelCount
          ? "SUPPORT"
          : "JOINT",

      connectedMembers: []
    };

    addNode(graph, node);

    bottomChord.push(node.id);
  }

  // ------------------------------------------
  // TOP NODES
  // ------------------------------------------

  for (let i = 0; i <= params.panelCount; i++) {

    const x = i * panelLength;

    const node: StructuralNode = {

      id: `${params.id}-T-${i}`,

      position: {
        x,
        y: depth,
        z: 0
      },

      type:
        i === 0 || i === params.panelCount
          ? "SUPPORT"
          : "JOINT",

      connectedMembers: []
    };

    addNode(graph, node);

    topChord.push(node.id);
  }

  // ------------------------------------------
  // CHORDS
  // ------------------------------------------

  createChordMembers(
    graph,
    topChord,
    `${params.id}-TC`
  );

  createChordMembers(
    graph,
    bottomChord,
    `${params.id}-BC`
  );

  // ------------------------------------------
  // WARREN DIAGONALS
  // ------------------------------------------

  for (
    let i = 0;
    i < params.panelCount;
    i++
  ) {

    const start =
      i % 2 === 0
        ? bottomChord[i]
        : topChord[i];

    const end =
      i % 2 === 0
        ? topChord[i + 1]
        : bottomChord[i + 1];

    const member: StructuralMember = {

      id: `${params.id}-W-${i}`,

      startNode: start,
      endNode: end,

      role: "DIAGONAL",

      section: {
        family: "PTR",
        designation: "CUSTOM"
      },

      material: {
        id: "STEEL",
        name: "STRUCTURAL STEEL"
      }
    };

    addMember(graph, member);

    webMembers.push(member.id);
  }

  return {
    graph,

    truss: {
      id: params.id,
      type: "WARREN",

      span: {
        value: params.span,
        unit: "m"
      },

      rise: {
        value: params.rise,
        unit: "m"
      },

      depth: {
        value: depth,
        unit: "m"
      },

      panelCount: params.panelCount,

      web: {
        pattern: "WARREN",
        distribution: "UNIFORM",
        density: params.panelCount,
        verticals: false,
        diagonals: true
      },

      supports: "SIMPLE",

      symmetry: true,

      members: [
        ...topChord,
        ...bottomChord,
        ...webMembers
      ],

      nodes: [
        ...topChord,
        ...bottomChord
      ]
    },

    topChord,
    bottomChord,
    webMembers
  };
}

// ============================================================
// PRATT
// ============================================================

export function generatePratt(
  params: TrussGeometryParameters
): GeneratedTruss {

  const base =
    generateWarren(params);

  const graph = createStructuralGraph();

  // Regeneramos nodos y cuerdas
  for (const node of base.graph.nodes.values()) {
    addNode(graph, {
      ...node,
      connectedMembers: []
    });
  }

  const topChord = [...base.topChord];
  const bottomChord = [...base.bottomChord];
  const webMembers: ID[] = [];

  createChordMembers(
    graph,
    topChord,
    `${params.id}-TC`
  );

  createChordMembers(
    graph,
    bottomChord,
    `${params.id}-BC`
  );

  for (
    let i = 0;
    i < params.panelCount;
    i++
  ) {

    const start =
      i < params.panelCount / 2
        ? bottomChord[i]
        : topChord[i];

    const end =
      i < params.panelCount / 2
        ? topChord[i + 1]
        : bottomChord[i + 1];

    const member: StructuralMember = {

      id: `${params.id}-P-${i}`,

      startNode: start,
      endNode: end,

      role: "DIAGONAL",

      section: {
        family: "PTR",
        designation: "CUSTOM"
      },

      material: {
        id: "STEEL",
        name: "STRUCTURAL STEEL"
      }
    };

    addMember(graph, member);

    webMembers.push(member.id);
  }

  return {
    graph,

    truss: {
      id: params.id,
      type: "PRATT",

      span: {
        value: params.span,
        unit: "m"
      },

      rise: {
        value: params.rise,
        unit: "m"
      },

      depth: {
        value: params.depth ?? params.rise,
        unit: "m"
      },

      panelCount: params.panelCount,

      web: {
        pattern: "PRATT",
        distribution: "SYMMETRIC",
        density: params.panelCount,
        verticals: true,
        diagonals: true
      },

      supports: "SIMPLE",
      symmetry: true,

      members: [
        ...topChord,
        ...bottomChord,
        ...webMembers
      ],

      nodes: [
        ...topChord,
        ...bottomChord
      ]
    },

    topChord,
    bottomChord,
    webMembers
  };
}

// ============================================================
// HOWE
// ============================================================

export function generateHowe(
  params: TrussGeometryParameters
): GeneratedTruss {

  const result =
    generatePratt(params);

  const graph =
    createStructuralGraph();

  for (const node of result.graph.nodes.values()) {
    addNode(graph, {
      ...node,
      connectedMembers: []
    });
  }

  const topChord =
    [...result.topChord];

  const bottomChord =
    [...result.bottomChord];

  const webMembers: ID[] = [];

  for (
    let i = 0;
    i < params.panelCount;
    i++
  ) {

    const start =
      i < params.panelCount / 2
        ? topChord[i]
        : bottomChord[i];

    const end =
      i < params.panelCount / 2
        ? bottomChord[i + 1]
        : topChord[i + 1];

    const member: StructuralMember = {

      id: `${params.id}-H-${i}`,

      startNode: start,
      endNode: end,

      role: "DIAGONAL",

      section: {
        family: "PTR",
        designation: "CUSTOM"
      },

      material: {
        id: "STEEL",
        name: "STRUCTURAL STEEL"
      }
    };

    addMember(graph, member);

    webMembers.push(member.id);
  }

  createChordMembers(
    graph,
    topChord,
    `${params.id}-TC`
  );

  createChordMembers(
    graph,
    bottomChord,
    `${params.id}-BC`
  );

  return {
    ...result,
    graph,
    webMembers
  };
}

// ============================================================
// FINK
// ============================================================

export function generateFink(
  params: TrussGeometryParameters
): GeneratedTruss {

  const graph =
    createStructuralGraph();

  const topChord: ID[] = [];
  const bottomChord: ID[] = [];
  const webMembers: ID[] = [];

  const panelLength =
    params.span / params.panelCount;

  const depth =
    params.depth ?? params.rise;

  for (
    let i = 0;
    i <= params.panelCount;
    i++
  ) {

    const x =
      i * panelLength;

    const topY =
      i <= params.panelCount / 2
        ? depth *
          (i / (params.panelCount / 2))
        : depth *
          ((params.panelCount - i) /
           (params.panelCount / 2));

    const bottom: StructuralNode = {

      id: `${params.id}-B-${i}`,

      position: {
        x,
        y: 0,
        z: 0
      },

      type:
        i === 0 ||
        i === params.panelCount
          ? "SUPPORT"
          : "JOINT",

      connectedMembers: []
    };

    const top: StructuralNode = {

      id: `${params.id}-T-${i}`,

      position: {
        x,
        y: topY,
        z: 0
      },

      type:
        i === params.panelCount / 2
          ? "RIDGE"
          : "JOINT",

      connectedMembers: []
    };

    addNode(graph, bottom);
    addNode(graph, top);

    bottomChord.push(bottom.id);
    topChord.push(top.id);
  }

  createChordMembers(
    graph,
    topChord,
    `${params.id}-TC`
  );

  createChordMembers(
    graph,
    bottomChord,
    `${params.id}-BC`
  );

  // Fink — subdivisión triangular
  for (
    let i = 0;
    i < params.panelCount;
    i++
  ) {

    const member: StructuralMember = {

      id: `${params.id}-F-${i}`,

      startNode: bottomChord[i],
      endNode: topChord[i + 1],

      role: "DIAGONAL",

      section: {
        family: "PTR",
        designation: "CUSTOM"
      },

      material: {
        id: "STEEL",
        name: "STRUCTURAL STEEL"
      }
    };

    addMember(graph, member);

    webMembers.push(member.id);
  }

  return {
    graph,

    truss: {
      id: params.id,
      type: "FINK",

      span: {
        value: params.span,
        unit: "m"
      },

      rise: {
        value: params.rise,
        unit: "m"
      },

      depth: {
        value: depth,
        unit: "m"
      },

      panelCount: params.panelCount,

      web: {
        pattern: "FINK",
        distribution: "SYMMETRIC",
        density: params.panelCount,
        verticals: false,
        diagonals: true,
        centralNode: true
      },

      supports: "SIMPLE",
      symmetry: true,

      members: [
        ...topChord,
        ...bottomChord,
        ...webMembers
      ],

      nodes: [
        ...topChord,
        ...bottomChord
      ]
    },

    topChord,
    bottomChord,
    webMembers
  };
}

// ============================================================
// CUSTOM
// ============================================================

export interface CustomTrussNode {
  id: ID;
  position: Point3D;
}

export interface CustomTrussMember {
  id: ID;
  startNode: ID;
  endNode: ID;
}

export interface CustomTrussDefinition {

  id: ID;

  nodes: CustomTrussNode[];

  members: CustomTrussMember[];
}

export function generateCustom(
  params: TrussGeometryParameters,
  custom?: CustomTrussDefinition
): GeneratedTruss {

  if (!custom) {
    const graph = createStructuralGraph();
    const topChord: ID[] = [];
    const bottomChord: ID[] = [];
    const webMembers: ID[] = [];

    const panelLength = params.span / params.panelCount;
    const depth = params.depth ?? params.rise;

    // Generate bottom and top pitch nodes
    for (let i = 0; i <= params.panelCount; i++) {
      const x = i * panelLength;
      const topY =
        i <= params.panelCount / 2
          ? depth * (i / (params.panelCount / 2))
          : depth * ((params.panelCount - i) / (params.panelCount / 2));

      const bottom: StructuralNode = {
        id: `${params.id}-B-${i}`,
        position: {
          x,
          y: 0,
          z: 0
        },
        type: i === 0 || i === params.panelCount ? "SUPPORT" : "JOINT",
        connectedMembers: []
      };

      const top: StructuralNode = {
        id: `${params.id}-T-${i}`,
        position: {
          x,
          y: topY,
          z: 0
        },
        type: i === params.panelCount / 2 ? "RIDGE" : "JOINT",
        connectedMembers: []
      };

      addNode(graph, bottom);
      addNode(graph, top);

      bottomChord.push(bottom.id);
      topChord.push(top.id);
    }

    createChordMembers(graph, topChord, `${params.id}-TC`);
    createChordMembers(graph, bottomChord, `${params.id}-BC`);

    // Vertical struts
    for (let i = 0; i <= params.panelCount; i++) {
      const vMember: StructuralMember = {
        id: `${params.id}-CV-${i}`,
        startNode: bottomChord[i],
        endNode: topChord[i],
        role: "VERTICAL",
        section: {
          family: "PTR",
          designation: "CUSTOM"
        },
        material: {
          id: "STEEL",
          name: "STRUCTURAL STEEL"
        }
      };
      addMember(graph, vMember);
      webMembers.push(vMember.id);
    }

    // Hybrid diagonals
    for (let i = 0; i < params.panelCount; i++) {
      const isLeft = i < params.panelCount / 2;
      const start = isLeft ? bottomChord[i] : bottomChord[i + 1];
      const end = isLeft ? topChord[i + 1] : topChord[i];

      const dMember: StructuralMember = {
        id: `${params.id}-CD-${i}`,
        startNode: start,
        endNode: end,
        role: "DIAGONAL",
        section: {
          family: "PTR",
          designation: "CUSTOM"
        },
        material: {
          id: "STEEL",
          name: "STRUCTURAL STEEL"
        }
      };
      addMember(graph, dMember);
      webMembers.push(dMember.id);
    }

    return {
      graph,
      truss: {
        id: params.id,
        type: "CUSTOM",
        span: {
          value: params.span,
          unit: "m"
        },
        rise: {
          value: params.rise,
          unit: "m"
        },
        depth: {
          value: depth,
          unit: "m"
        },
        panelCount: params.panelCount,
        web: {
          pattern: "CUSTOM",
          distribution: "CUSTOM",
          density: webMembers.length,
          verticals: true,
          diagonals: true
        },
        supports: "SIMPLE",
        symmetry: true,
        members: [...topChord, ...bottomChord, ...webMembers],
        nodes: [...topChord, ...bottomChord]
      },
      topChord,
      bottomChord,
      webMembers
    };
  }

  const graph =
    createStructuralGraph();

  for (const node of custom.nodes) {

    addNode(graph, {

      id: node.id,

      position: node.position,

      type: "JOINT",

      connectedMembers: []
    });
  }

  const memberIds: ID[] = [];

  for (const member of custom.members) {

    const structuralMember:
      StructuralMember = {

      id: member.id,

      startNode: member.startNode,

      endNode: member.endNode,

      role: "OTHER",

      section: {
        family: "CUSTOM",
        designation: "CUSTOM"
      },

      material: {
        id: "STEEL",
        name: "STRUCTURAL STEEL"
      }
    };

    addMember(
      graph,
      structuralMember
    );

    memberIds.push(member.id);
  }

  return {

    graph,

    truss: {

      id: params.id,

      type: "CUSTOM",

      span: {
        value: params.span,
        unit: "m"
      },

      rise: {
        value: params.rise,
        unit: "m"
      },

      depth: {
        value: params.depth ?? params.rise,
        unit: "m"
      },

      panelCount:
        params.panelCount,

      web: {
        pattern: "CUSTOM",
        distribution: "CUSTOM",
        density: memberIds.length,
        verticals: true,
        diagonals: true
      },

      supports: "CUSTOM",

      symmetry: false,

      members: memberIds,

      nodes: custom.nodes.map(
        node => node.id
      )
    },

    topChord: [],
    bottomChord: [],
    webMembers: memberIds
  };
}

// ============================================================
// CHORD GENERATOR
// ============================================================

export function createChordMembers(
  graph: StructuralGraph,
  nodes: ID[],
  prefix: string
): void {

  for (
    let i = 0;
    i < nodes.length - 1;
    i++
  ) {

    addMember(graph, {

      id: `${prefix}-${i}`,

      startNode: nodes[i],

      endNode: nodes[i + 1],

      role: prefix.includes("TC")
        ? "TOP_CHORD"
        : "BOTTOM_CHORD",

      section: {
        family: "HSS",
        designation: "CUSTOM"
      },

      material: {
        id: "STEEL",
        name: "STRUCTURAL STEEL"
      }
    });
  }
}

// ============================================================
// SAWTOOTH (DIENTE DE SIERRA ASIMÉTRICO)
// ============================================================

export function generateSawtooth(
  params: TrussGeometryParameters
): GeneratedTruss {
  const graph = createStructuralGraph();
  const topChord: ID[] = [];
  const bottomChord: ID[] = [];
  const webMembers: ID[] = [];

  const panelLength = params.span / params.panelCount;
  const depth = params.depth ?? (params.rise || 1.2);
  const rise = params.rise || 1.5;
  const ridgeIdx = Math.max(1, Math.floor(params.panelCount * 0.75));

  for (let i = 0; i <= params.panelCount; i++) {
    const x = i * panelLength;
    const node: StructuralNode = {
      id: `${params.id}-B-${i}`,
      position: { x, y: 0, z: 0 },
      type: i === 0 || i === params.panelCount ? "SUPPORT" : "JOINT",
      connectedMembers: []
    };
    addNode(graph, node);
    bottomChord.push(node.id);
  }

  for (let i = 0; i <= params.panelCount; i++) {
    const x = i * panelLength;
    let y = depth;
    if (i <= ridgeIdx) {
      y = depth + (rise * i) / ridgeIdx;
    } else {
      y = depth + rise * (1 - (i - ridgeIdx) / (params.panelCount - ridgeIdx));
    }
    const node: StructuralNode = {
      id: `${params.id}-T-${i}`,
      position: { x, y, z: 0 },
      type: i === ridgeIdx ? "RIDGE" : i === 0 || i === params.panelCount ? "SUPPORT" : "JOINT",
      connectedMembers: []
    };
    addNode(graph, node);
    topChord.push(node.id);
  }

  createChordMembers(graph, topChord, `${params.id}-TC`);
  createChordMembers(graph, bottomChord, `${params.id}-BC`);

  for (let i = 0; i <= params.panelCount; i++) {
    const vMember: StructuralMember = {
      id: `${params.id}-V-${i}`,
      startNode: bottomChord[i],
      endNode: topChord[i],
      role: "VERTICAL",
      section: { family: "PTR", designation: "CUSTOM" },
      material: { id: "STEEL", name: "STRUCTURAL STEEL" }
    };
    addMember(graph, vMember);
    webMembers.push(vMember.id);
  }

  for (let i = 0; i < params.panelCount; i++) {
    const dMember: StructuralMember = {
      id: `${params.id}-D-${i}`,
      startNode: i < ridgeIdx ? bottomChord[i] : bottomChord[i + 1],
      endNode: i < ridgeIdx ? topChord[i + 1] : topChord[i],
      role: "DIAGONAL",
      section: { family: "PTR", designation: "CUSTOM" },
      material: { id: "STEEL", name: "STRUCTURAL STEEL" }
    };
    addMember(graph, dMember);
    webMembers.push(dMember.id);
  }

  return {
    graph,
    truss: {
      id: params.id,
      type: "SAWTOOTH",
      span: { value: params.span, unit: "m" },
      rise: { value: params.rise, unit: "m" },
      depth: { value: depth, unit: "m" },
      panelCount: params.panelCount,
      web: {
        pattern: "SAWTOOTH" as any,
        distribution: "UNIFORM",
        density: webMembers.length,
        verticals: true,
        diagonals: true
      },
      supports: "SIMPLE",
      symmetry: false,
      members: [...topChord, ...bottomChord, ...webMembers],
      nodes: [...topChord, ...bottomChord]
    },
    topChord,
    bottomChord,
    webMembers
  };
}

// ============================================================
// BOWSTRING (ARCO PARABÓLICO)
// ============================================================

export function generateBowstring(
  params: TrussGeometryParameters
): GeneratedTruss {
  const graph = createStructuralGraph();
  const topChord: ID[] = [];
  const bottomChord: ID[] = [];
  const webMembers: ID[] = [];

  const panelLength = params.span / params.panelCount;
  const rise = params.rise || 2.0;
  const depth = params.depth ?? 0.3;

  for (let i = 0; i <= params.panelCount; i++) {
    const x = i * panelLength;
    const node: StructuralNode = {
      id: `${params.id}-B-${i}`,
      position: { x, y: 0, z: 0 },
      type: i === 0 || i === params.panelCount ? "SUPPORT" : "JOINT",
      connectedMembers: []
    };
    addNode(graph, node);
    bottomChord.push(node.id);
  }

  for (let i = 0; i <= params.panelCount; i++) {
    const x = i * panelLength;
    const archY = (4 * rise * x * (params.span - x)) / (params.span * params.span);
    const node: StructuralNode = {
      id: `${params.id}-T-${i}`,
      position: { x, y: archY + depth, z: 0 },
      type: i === Math.floor(params.panelCount / 2) ? "RIDGE" : "JOINT",
      connectedMembers: []
    };
    addNode(graph, node);
    topChord.push(node.id);
  }

  createChordMembers(graph, topChord, `${params.id}-TC`);
  createChordMembers(graph, bottomChord, `${params.id}-BC`);

  for (let i = 0; i <= params.panelCount; i++) {
    const vMember: StructuralMember = {
      id: `${params.id}-V-${i}`,
      startNode: bottomChord[i],
      endNode: topChord[i],
      role: "VERTICAL",
      section: { family: "PTR", designation: "CUSTOM" },
      material: { id: "STEEL", name: "STRUCTURAL STEEL" }
    };
    addMember(graph, vMember);
    webMembers.push(vMember.id);
  }

  for (let i = 0; i < params.panelCount; i++) {
    const dMember: StructuralMember = {
      id: `${params.id}-D-${i}`,
      startNode: bottomChord[i],
      endNode: topChord[i + 1],
      role: "DIAGONAL",
      section: { family: "PTR", designation: "CUSTOM" },
      material: { id: "STEEL", name: "STRUCTURAL STEEL" }
    };
    addMember(graph, dMember);
    webMembers.push(dMember.id);
  }

  return {
    graph,
    truss: {
      id: params.id,
      type: "BOWSTRING",
      span: { value: params.span, unit: "m" },
      rise: { value: params.rise, unit: "m" },
      depth: { value: depth, unit: "m" },
      panelCount: params.panelCount,
      web: {
        pattern: "BOWSTRING" as any,
        distribution: "UNIFORM",
        density: webMembers.length,
        verticals: true,
        diagonals: true
      },
      supports: "SIMPLE",
      symmetry: true,
      members: [...topChord, ...bottomChord, ...webMembers],
      nodes: [...topChord, ...bottomChord]
    },
    topChord,
    bottomChord,
    webMembers
  };
}

// ============================================================
// SCISSORS (TIJERA CON BÓVEDA)
// ============================================================

export function generateScissors(
  params: TrussGeometryParameters
): GeneratedTruss {
  const graph = createStructuralGraph();
  const topChord: ID[] = [];
  const bottomChord: ID[] = [];
  const webMembers: ID[] = [];

  const panelLength = params.span / params.panelCount;
  const depth = params.depth ?? 1.2;
  const rise = params.rise || 2.2;
  const half = params.panelCount / 2;
  const botRise = rise * 0.45;

  for (let i = 0; i <= params.panelCount; i++) {
    const x = i * panelLength;
    const botY = botRise * (1 - Math.abs(i - half) / half);
    const node: StructuralNode = {
      id: `${params.id}-B-${i}`,
      position: { x, y: botY, z: 0 },
      type: i === 0 || i === params.panelCount ? "SUPPORT" : "JOINT",
      connectedMembers: []
    };
    addNode(graph, node);
    bottomChord.push(node.id);
  }

  for (let i = 0; i <= params.panelCount; i++) {
    const x = i * panelLength;
    const topY = depth + rise * (1 - Math.abs(i - half) / half);
    const node: StructuralNode = {
      id: `${params.id}-T-${i}`,
      position: { x, y: topY, z: 0 },
      type: i === Math.floor(half) ? "RIDGE" : "JOINT",
      connectedMembers: []
    };
    addNode(graph, node);
    topChord.push(node.id);
  }

  createChordMembers(graph, topChord, `${params.id}-TC`);
  createChordMembers(graph, bottomChord, `${params.id}-BC`);

  for (let i = 0; i <= params.panelCount; i++) {
    const vMember: StructuralMember = {
      id: `${params.id}-V-${i}`,
      startNode: bottomChord[i],
      endNode: topChord[i],
      role: "VERTICAL",
      section: { family: "PTR", designation: "CUSTOM" },
      material: { id: "STEEL", name: "STRUCTURAL STEEL" }
    };
    addMember(graph, vMember);
    webMembers.push(vMember.id);
  }

  for (let i = 0; i < params.panelCount; i++) {
    const dMember: StructuralMember = {
      id: `${params.id}-D-${i}`,
      startNode: i < half ? bottomChord[i] : bottomChord[i + 1],
      endNode: i < half ? topChord[i + 1] : topChord[i],
      role: "DIAGONAL",
      section: { family: "PTR", designation: "CUSTOM" },
      material: { id: "STEEL", name: "STRUCTURAL STEEL" }
    };
    addMember(graph, dMember);
    webMembers.push(dMember.id);
  }

  return {
    graph,
    truss: {
      id: params.id,
      type: "SCISSORS",
      span: { value: params.span, unit: "m" },
      rise: { value: params.rise, unit: "m" },
      depth: { value: depth, unit: "m" },
      panelCount: params.panelCount,
      web: {
        pattern: "SCISSORS" as any,
        distribution: "UNIFORM",
        density: webMembers.length,
        verticals: true,
        diagonals: true
      },
      supports: "SIMPLE",
      symmetry: true,
      members: [...topChord, ...bottomChord, ...webMembers],
      nodes: [...topChord, ...bottomChord]
    },
    topChord,
    bottomChord,
    webMembers
  };
}

// ============================================================
// VIERENDEEL (MARCO RÍGIDO SIN DIAGONALES)
// ============================================================

export function generateVierendeel(
  params: TrussGeometryParameters
): GeneratedTruss {
  const graph = createStructuralGraph();
  const topChord: ID[] = [];
  const bottomChord: ID[] = [];
  const webMembers: ID[] = [];

  const panelLength = params.span / params.panelCount;
  const depth = params.depth ?? params.rise ?? 1.2;

  for (let i = 0; i <= params.panelCount; i++) {
    const x = i * panelLength;
    const bNode: StructuralNode = {
      id: `${params.id}-B-${i}`,
      position: { x, y: 0, z: 0 },
      type: i === 0 || i === params.panelCount ? "SUPPORT" : "JOINT",
      connectedMembers: []
    };
    const tNode: StructuralNode = {
      id: `${params.id}-T-${i}`,
      position: { x, y: depth, z: 0 },
      type: "JOINT",
      connectedMembers: []
    };
    addNode(graph, bNode);
    addNode(graph, tNode);
    bottomChord.push(bNode.id);
    topChord.push(tNode.id);
  }

  createChordMembers(graph, topChord, `${params.id}-TC`);
  createChordMembers(graph, bottomChord, `${params.id}-BC`);

  for (let i = 0; i <= params.panelCount; i++) {
    const vMember: StructuralMember = {
      id: `${params.id}-V-${i}`,
      startNode: bottomChord[i],
      endNode: topChord[i],
      role: "VERTICAL",
      section: { family: "HSS", designation: "CUSTOM" },
      material: { id: "STEEL", name: "STRUCTURAL STEEL" }
    };
    addMember(graph, vMember);
    webMembers.push(vMember.id);
  }

  return {
    graph,
    truss: {
      id: params.id,
      type: "VIERENDEEL",
      span: { value: params.span, unit: "m" },
      rise: { value: params.rise, unit: "m" },
      depth: { value: depth, unit: "m" },
      panelCount: params.panelCount,
      web: {
        pattern: "VIERENDEEL" as any,
        distribution: "UNIFORM",
        density: webMembers.length,
        verticals: true,
        diagonals: false
      },
      supports: "SIMPLE",
      symmetry: true,
      members: [...topChord, ...bottomChord, ...webMembers],
      nodes: [...topChord, ...bottomChord]
    },
    topChord,
    bottomChord,
    webMembers
  };
}

// ============================================================
// SHED (MONOPENDIENTE)
// ============================================================

export function generateShed(
  params: TrussGeometryParameters
): GeneratedTruss {
  const graph = createStructuralGraph();
  const topChord: ID[] = [];
  const bottomChord: ID[] = [];
  const webMembers: ID[] = [];

  const panelLength = params.span / params.panelCount;
  const depth = params.depth ?? 1.0;
  const rise = params.rise || 1.8;

  for (let i = 0; i <= params.panelCount; i++) {
    const x = i * panelLength;
    const bNode: StructuralNode = {
      id: `${params.id}-B-${i}`,
      position: { x, y: 0, z: 0 },
      type: i === 0 || i === params.panelCount ? "SUPPORT" : "JOINT",
      connectedMembers: []
    };
    const tNode: StructuralNode = {
      id: `${params.id}-T-${i}`,
      position: { x, y: depth + (rise * i) / params.panelCount, z: 0 },
      type: i === params.panelCount ? "RIDGE" : "JOINT",
      connectedMembers: []
    };
    addNode(graph, bNode);
    addNode(graph, tNode);
    bottomChord.push(bNode.id);
    topChord.push(tNode.id);
  }

  createChordMembers(graph, topChord, `${params.id}-TC`);
  createChordMembers(graph, bottomChord, `${params.id}-BC`);

  for (let i = 0; i <= params.panelCount; i++) {
    const vMember: StructuralMember = {
      id: `${params.id}-V-${i}`,
      startNode: bottomChord[i],
      endNode: topChord[i],
      role: "VERTICAL",
      section: { family: "PTR", designation: "CUSTOM" },
      material: { id: "STEEL", name: "STRUCTURAL STEEL" }
    };
    addMember(graph, vMember);
    webMembers.push(vMember.id);
  }

  for (let i = 0; i < params.panelCount; i++) {
    const dMember: StructuralMember = {
      id: `${params.id}-D-${i}`,
      startNode: bottomChord[i],
      endNode: topChord[i + 1],
      role: "DIAGONAL",
      section: { family: "PTR", designation: "CUSTOM" },
      material: { id: "STEEL", name: "STRUCTURAL STEEL" }
    };
    addMember(graph, dMember);
    webMembers.push(dMember.id);
  }

  return {
    graph,
    truss: {
      id: params.id,
      type: "SHED",
      span: { value: params.span, unit: "m" },
      rise: { value: params.rise, unit: "m" },
      depth: { value: depth, unit: "m" },
      panelCount: params.panelCount,
      web: {
        pattern: "SHED" as any,
        distribution: "UNIFORM",
        density: webMembers.length,
        verticals: true,
        diagonals: true
      },
      supports: "SIMPLE",
      symmetry: false,
      members: [...topChord, ...bottomChord, ...webMembers],
      nodes: [...topChord, ...bottomChord]
    },
    topChord,
    bottomChord,
    webMembers
  };
}

// ============================================================
// CANTILEVER (VOLADIZO)
// ============================================================

export function generateCantilever(
  params: TrussGeometryParameters
): GeneratedTruss {
  const graph = createStructuralGraph();
  const topChord: ID[] = [];
  const bottomChord: ID[] = [];
  const webMembers: ID[] = [];

  const panelLength = params.span / params.panelCount;
  const rootH = params.depth ?? params.rise ?? 1.8;
  const tipH = Math.max(0.3, rootH * 0.25);

  for (let i = 0; i <= params.panelCount; i++) {
    const x = i * panelLength;
    const t = x / params.span;
    const curH = rootH * (1 - t) + tipH * t;

    const bNode: StructuralNode = {
      id: `${params.id}-B-${i}`,
      position: { x, y: 0, z: 0 },
      type: i === 0 ? "SUPPORT" : "JOINT",
      connectedMembers: []
    };
    const tNode: StructuralNode = {
      id: `${params.id}-T-${i}`,
      position: { x, y: curH, z: 0 },
      type: i === 0 ? "SUPPORT" : "JOINT",
      connectedMembers: []
    };
    addNode(graph, bNode);
    addNode(graph, tNode);
    bottomChord.push(bNode.id);
    topChord.push(tNode.id);
  }

  createChordMembers(graph, topChord, `${params.id}-TC`);
  createChordMembers(graph, bottomChord, `${params.id}-BC`);

  for (let i = 0; i <= params.panelCount; i++) {
    const vMember: StructuralMember = {
      id: `${params.id}-V-${i}`,
      startNode: bottomChord[i],
      endNode: topChord[i],
      role: "VERTICAL",
      section: { family: "PTR", designation: "CUSTOM" },
      material: { id: "STEEL", name: "STRUCTURAL STEEL" }
    };
    addMember(graph, vMember);
    webMembers.push(vMember.id);
  }

  for (let i = 0; i < params.panelCount; i++) {
    const dMember: StructuralMember = {
      id: `${params.id}-D-${i}`,
      startNode: bottomChord[i],
      endNode: topChord[i + 1],
      role: "DIAGONAL",
      section: { family: "PTR", designation: "CUSTOM" },
      material: { id: "STEEL", name: "STRUCTURAL STEEL" }
    };
    addMember(graph, dMember);
    webMembers.push(dMember.id);
  }

  return {
    graph,
    truss: {
      id: params.id,
      type: "CANTILEVER",
      span: { value: params.span, unit: "m" },
      rise: { value: params.rise, unit: "m" },
      depth: { value: rootH, unit: "m" },
      panelCount: params.panelCount,
      web: {
        pattern: "CANTILEVER" as any,
        distribution: "UNIFORM",
        density: webMembers.length,
        verticals: true,
        diagonals: true
      },
      supports: "CANTILEVER" as any,
      symmetry: false,
      members: [...topChord, ...bottomChord, ...webMembers],
      nodes: [...topChord, ...bottomChord]
    },
    topChord,
    bottomChord,
    webMembers
  };
}

// ============================================================
// THREE CHORD (3D SPACE TRUSS)
// ============================================================

export function generateThreeChord(
  params: TrussGeometryParameters
): GeneratedTruss {
  return generateWarren(params);
}

// ============================================================
// OTHER TYPOLOGY WRAPPERS (BALTIMORE, K_TRUSS, N_TRUSS, W_TRUSS, POLONCEAU)
// ============================================================

export function generateBaltimore(params: TrussGeometryParameters): GeneratedTruss {
  return generatePratt(params);
}

export function generateKTruss(params: TrussGeometryParameters): GeneratedTruss {
  return generateWarren(params);
}

export function generateNTruss(params: TrussGeometryParameters): GeneratedTruss {
  return generatePratt(params);
}

export function generateWTruss(params: TrussGeometryParameters): GeneratedTruss {
  return generateWarren(params);
}

export function generatePolonceau(params: TrussGeometryParameters): GeneratedTruss {
  return generateFink(params);
}

