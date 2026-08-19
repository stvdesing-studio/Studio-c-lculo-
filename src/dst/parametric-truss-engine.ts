// ============================================================
// STV CLOSER — ADVANCED PARAMETRIC TRUSS ENGINE (SCREEN 02)
// parametric-truss-engine.ts
// Deterministic Geometric Generation for 18 Typologies & 12 Roof Families
// ============================================================

import {
  Point3D,
  StructuralNode,
  StructuralMember,
  MemberRole,
  SectionProfile,
  TrussDefinition,
  WebDistribution
} from './dst.schema';

import {
  StructuralGraph,
  createStructuralGraph,
  addNode,
  addMember
} from './structural-graph';

import { TrussTypologyDefinition, RoofTypologyDefinition } from './truss-typologies';

export interface ParametricTrussInput {
  typology: TrussTypologyDefinition;
  roof: RoofTypologyDefinition;
  spanM: number;
  riseM: number;
  depthM: number;
  panelCount: number;
  panelDistribution?: 'UNIFORM' | 'VARIABLE' | 'SYMMETRIC' | 'CENTER_DENSE' | 'EDGE_DENSE' | 'CUSTOM';
  zigzagVector?: 'LEFT_TO_RIGHT' | 'RIGHT_TO_LEFT' | 'SYMMETRIC' | 'REVERSE_AT_RIDGE' | 'CUSTOM';
  addVerticals?: boolean;
  columnHeightM?: number;
  topChordProfile: SectionProfile;
  bottomChordProfile: SectionProfile;
  webProfile: SectionProfile;
  customNodes?: { id: string; x: number; y: number; z: number }[];
  customMembers?: { id: string; startNodeId: string; endNodeId: string; role: any }[];
}

export interface GeneratedTrussStructure {
  graph: StructuralGraph;
  truss: TrussDefinition;
  topChords: StructuralMember[];
  bottomChords: StructuralMember[];
  webMembers: StructuralMember[];
  nodes: StructuralNode[];
  summary: {
    totalLengthM: number;
    totalSteelWeightKg: number;
    nodesCount: number;
    membersCount: number;
    cutAnglesSummary: { minDeg: number; maxDeg: number };
  };
}

export function generateParametricTruss(input: ParametricTrussInput): GeneratedTrussStructure {
  const graph = createStructuralGraph();
  const span = Math.max(3.0, input.spanM);
  const rise = Math.max(0.2, input.riseM || input.depthM);
  const depth = Math.max(0.3, input.depthM || 1.2);
  const panels = Math.max(2, input.panelCount);
  const code = input.typology.code;

  const topChords: StructuralMember[] = [];
  const bottomChords: StructuralMember[] = [];
  const webMembers: StructuralMember[] = [];
  const nodesList: StructuralNode[] = [];

  let memberCounter = 1;
  let nodeCounter = 1;

  function registerNode(p: Point3D, isSupport = false, isRidge = false): StructuralNode {
    const id = `N-${String(nodeCounter++).padStart(3, '0')}`;
    const node: StructuralNode = {
      id,
      position: p,
      type: isSupport ? 'SUPPORT' : isRidge ? 'RIDGE' : 'JOINT',
      connectedMembers: []
    };
    addNode(graph, node);
    nodesList.push(node);
    return node;
  }

  function registerMember(
    startNode: StructuralNode,
    endNode: StructuralNode,
    role: 'TOP_CHORD' | 'BOTTOM_CHORD' | 'DIAGONAL' | 'VERTICAL' | 'BRACING' | 'OTHER',
    section: SectionProfile,
    assemblyPrefix = 'TG'
  ): StructuralMember {
    const dx = endNode.position.x - startNode.position.x;
    const dy = endNode.position.y - startNode.position.y;
    const dz = endNode.position.z - startNode.position.z;
    const length = Math.sqrt(dx * dx + dy * dy + dz * dz);

    // Compute acute cut angle relative to chord or vertical
    const angleRad = Math.atan2(Math.abs(dy), Math.abs(dx));
    const cutDeg = Math.round((angleRad * 180) / Math.PI) || 90;

    const id = `M-${String(memberCounter++).padStart(3, '0')}`;
    const member: StructuralMember = {
      id,
      startNode: startNode.id,
      endNode: endNode.id,
      role: role as MemberRole,
      section,
      material: {
        id: 'A36',
        name: 'ASTM A36 / A500 Gr. B',
        grade: 'Gr. B',
        fy: 250,
        fu: 400,
        density: 7850
      },
      geometry: {
        length: { value: length, unit: 'm' },
        start: startNode.position,
        end: endNode.position,
        cutAngleStart: cutDeg,
        cutAngleEnd: cutDeg
      },
      fabrication: {
        memberMark: `${role.slice(0, 2)}-${String(memberCounter).padStart(3, '0')}`,
        assemblyGroup: `${assemblyPrefix}-${role}`,
        cutLength: { value: length + 0.01, unit: 'm' },
        weldLength: { value: 0.15, unit: 'm' }
      }
    };

    addMember(graph, member);

    if (role === 'TOP_CHORD') topChords.push(member);
    else if (role === 'BOTTOM_CHORD') bottomChords.push(member);
    else webMembers.push(member);

    return member;
  }

  // ============================================================
  // GENERATION STRATEGY ACCORDING TO TYPOLOGY
  // ============================================================

  if (code === 'CUSTOM' && input.customNodes && input.customNodes.length > 0) {
    // Custom Node / Member Graph
    const nodeMap = new Map<string, StructuralNode>();
    input.customNodes.forEach((cn) => {
      const n = registerNode({ x: cn.x, y: cn.y, z: cn.z });
      nodeMap.set(cn.id, n);
    });

    if (input.customMembers && input.customMembers.length > 0) {
      input.customMembers.forEach((cm) => {
        const sn = nodeMap.get(cm.startNodeId);
        const en = nodeMap.get(cm.endNodeId);
        if (sn && en) {
          const profile =
            cm.role === 'CHORD_TOP' || cm.role === 'TOP_CHORD'
              ? input.topChordProfile
              : cm.role === 'CHORD_BOTTOM' || cm.role === 'BOTTOM_CHORD'
              ? input.bottomChordProfile
              : input.webProfile;
          const assignedRole =
            cm.role === 'CHORD_TOP'
              ? 'TOP_CHORD'
              : cm.role === 'CHORD_BOTTOM'
              ? 'BOTTOM_CHORD'
              : cm.role;
          registerMember(sn, en, assignedRole as any, profile);
        }
      });
    }
  } else if (code === 'WARREN') {
    // ============================================================
    // TR-01: WARREN TRUSS (FLAT OR PITCHED)
    // ============================================================
    const isPitched = input.roof.family === 'DOUBLE_SLOPE' || input.roof.family === 'GABLE';
    const numPanels = panels % 2 === 0 ? panels : panels + 1;
    const dx = span / numPanels;

    const botNodes: StructuralNode[] = [];
    const topNodes: StructuralNode[] = [];

    // Bottom chord nodes
    for (let i = 0; i <= numPanels; i++) {
      const x = i * dx;
      const n = registerNode({ x, y: 0, z: 0 }, i === 0 || i === numPanels, false);
      botNodes.push(n);
    }

    // Top chord nodes
    for (let i = 0; i <= numPanels; i++) {
      const x = i * dx;
      let y = depth;
      if (isPitched) {
        const mid = span / 2;
        y = depth + rise * (1 - Math.abs(x - mid) / mid);
      }
      const isRidge = isPitched && Math.abs(x - span / 2) < 0.01;
      const n = registerNode({ x, y, z: 0 }, false, isRidge);
      topNodes.push(n);
    }

    // Chords
    for (let i = 0; i < numPanels; i++) {
      registerMember(botNodes[i], botNodes[i + 1], 'BOTTOM_CHORD', input.bottomChordProfile);
      registerMember(topNodes[i], topNodes[i + 1], 'TOP_CHORD', input.topChordProfile);
    }

    // Web: Alternating diagonals + optional verticals
    for (let i = 0; i < numPanels; i++) {
      if (input.addVerticals !== false) {
        registerMember(botNodes[i], topNodes[i], 'VERTICAL', input.webProfile);
      }
      if (i % 2 === 0) {
        registerMember(botNodes[i], topNodes[i + 1], 'DIAGONAL', input.webProfile);
      } else {
        registerMember(topNodes[i], botNodes[i + 1], 'DIAGONAL', input.webProfile);
      }
    }
    if (input.addVerticals !== false) {
      registerMember(botNodes[numPanels], topNodes[numPanels], 'VERTICAL', input.webProfile);
    }
  } else if (code === 'PRATT' || code === 'HOWE') {
    // ============================================================
    // TR-02 & TR-03: PRATT / HOWE
    // ============================================================
    const isPitched = input.roof.family !== 'FLAT';
    const numPanels = panels % 2 === 0 ? panels : panels + 1;
    const dx = span / numPanels;
    const half = numPanels / 2;

    const botNodes: StructuralNode[] = [];
    const topNodes: StructuralNode[] = [];

    for (let i = 0; i <= numPanels; i++) {
      const x = i * dx;
      botNodes.push(registerNode({ x, y: 0, z: 0 }, i === 0 || i === numPanels, false));
    }

    for (let i = 0; i <= numPanels; i++) {
      const x = i * dx;
      let y = depth;
      if (isPitched) {
        const mid = span / 2;
        y = depth + rise * (1 - Math.abs(x - mid) / mid);
      }
      const isRidge = isPitched && i === half;
      topNodes.push(registerNode({ x, y, z: 0 }, false, isRidge));
    }

    // Chords
    for (let i = 0; i < numPanels; i++) {
      registerMember(botNodes[i], botNodes[i + 1], 'BOTTOM_CHORD', input.bottomChordProfile);
      registerMember(topNodes[i], topNodes[i + 1], 'TOP_CHORD', input.topChordProfile);
    }

    // Verticals
    for (let i = 0; i <= numPanels; i++) {
      registerMember(botNodes[i], topNodes[i], 'VERTICAL', input.webProfile);
    }

    // Diagonals
    for (let i = 0; i < numPanels; i++) {
      if (code === 'PRATT') {
        // Pratt: Diagonals lean toward center (inward tension)
        if (i < half) {
          registerMember(botNodes[i], topNodes[i + 1], 'DIAGONAL', input.webProfile);
        } else {
          registerMember(botNodes[i + 1], topNodes[i], 'DIAGONAL', input.webProfile);
        }
      } else {
        // Howe: Diagonals lean away from center (outward compression)
        if (i < half) {
          registerMember(topNodes[i], botNodes[i + 1], 'DIAGONAL', input.webProfile);
        } else {
          registerMember(topNodes[i + 1], botNodes[i], 'DIAGONAL', input.webProfile);
        }
      }
    }
  } else if (code === 'FINK') {
    // ============================================================
    // TR-04: FINK TRUSS (Hierarchical subdivision)
    // ============================================================
    const halfSpan = span / 2;
    const numSub = Math.max(2, Math.floor(panels / 2));
    const dx = halfSpan / numSub;

    const nLeft = registerNode({ x: 0, y: 0, z: 0 }, true);
    const nRight = registerNode({ x: span, y: 0, z: 0 }, true);
    const nRidge = registerNode({ x: halfSpan, y: rise, z: 0 }, false, true);
    const nCenterBot = registerNode({ x: halfSpan, y: 0, z: 0 });

    const leftTopNodes = [nLeft];
    const rightTopNodes = [nRidge];
    const leftBotNodes = [nLeft];
    const rightBotNodes = [nCenterBot];

    for (let i = 1; i < numSub; i++) {
      const x = i * dx;
      const y = (rise / halfSpan) * x;
      leftTopNodes.push(registerNode({ x, y, z: 0 }));
      leftBotNodes.push(registerNode({ x, y: 0, z: 0 }));
    }
    leftTopNodes.push(nRidge);
    leftBotNodes.push(nCenterBot);

    for (let i = 1; i < numSub; i++) {
      const x = halfSpan + i * dx;
      const y = rise - (rise / halfSpan) * (i * dx);
      rightTopNodes.push(registerNode({ x, y, z: 0 }));
      rightBotNodes.push(registerNode({ x, y: 0, z: 0 }));
    }
    rightTopNodes.push(nRight);
    rightBotNodes.push(nRight);

    // Chords
    for (let i = 0; i < leftTopNodes.length - 1; i++) {
      registerMember(leftTopNodes[i], leftTopNodes[i + 1], 'TOP_CHORD', input.topChordProfile);
      registerMember(leftBotNodes[i], leftBotNodes[i + 1], 'BOTTOM_CHORD', input.bottomChordProfile);
    }
    for (let i = 0; i < rightTopNodes.length - 1; i++) {
      registerMember(rightTopNodes[i], rightTopNodes[i + 1], 'TOP_CHORD', input.topChordProfile);
      registerMember(rightBotNodes[i], rightBotNodes[i + 1], 'BOTTOM_CHORD', input.bottomChordProfile);
    }

    // Central King Tie
    registerMember(nCenterBot, nRidge, 'VERTICAL', input.webProfile);

    // Web Fink Struts
    for (let i = 1; i < numSub; i++) {
      registerMember(leftBotNodes[i], leftTopNodes[i], 'VERTICAL', input.webProfile);
      registerMember(leftBotNodes[i], nCenterBot, 'DIAGONAL', input.webProfile);
      registerMember(rightBotNodes[i], rightTopNodes[i], 'VERTICAL', input.webProfile);
      registerMember(rightBotNodes[i], nCenterBot, 'DIAGONAL', input.webProfile);
    }
  } else if (code === 'BOWSTRING') {
    // ============================================================
    // TR-10: BOWSTRING (Parabolic Arch with horizontal tie)
    // ============================================================
    const numPanels = panels % 2 === 0 ? panels : panels + 1;
    const dx = span / numPanels;

    const botNodes: StructuralNode[] = [];
    const topNodes: StructuralNode[] = [];

    for (let i = 0; i <= numPanels; i++) {
      const x = i * dx;
      botNodes.push(registerNode({ x, y: 0, z: 0 }, i === 0 || i === numPanels));
      // Parabolic y = 4 * rise * x * (span - x) / span^2
      const archY = (4 * rise * x * (span - x)) / (span * span);
      topNodes.push(registerNode({ x, y: archY + 0.3, z: 0 }, false, i === numPanels / 2));
    }

    for (let i = 0; i < numPanels; i++) {
      registerMember(botNodes[i], botNodes[i + 1], 'BOTTOM_CHORD', input.bottomChordProfile);
      registerMember(topNodes[i], topNodes[i + 1], 'TOP_CHORD', input.topChordProfile);
      registerMember(botNodes[i], topNodes[i], 'VERTICAL', input.webProfile);
      registerMember(botNodes[i], topNodes[i + 1], 'DIAGONAL', input.webProfile);
    }
    registerMember(botNodes[numPanels], topNodes[numPanels], 'VERTICAL', input.webProfile);
  } else if (code === 'CANTILEVER') {
    // ============================================================
    // TR-17: CANTILEVER OVERHANG TRUSS
    // ============================================================
    const numPanels = Math.max(3, panels);
    const dx = span / numPanels;
    const rootH = depth;
    const tipH = Math.max(0.3, depth * 0.25);

    const botNodes: StructuralNode[] = [];
    const topNodes: StructuralNode[] = [];

    for (let i = 0; i <= numPanels; i++) {
      const x = i * dx;
      const t = x / span;
      const currentH = rootH * (1 - t) + tipH * t;

      botNodes.push(registerNode({ x, y: 0, z: 0 }, i === 0));
      topNodes.push(registerNode({ x, y: currentH, z: 0 }, i === 0));
    }

    for (let i = 0; i < numPanels; i++) {
      registerMember(botNodes[i], botNodes[i + 1], 'BOTTOM_CHORD', input.bottomChordProfile);
      registerMember(topNodes[i], topNodes[i + 1], 'TOP_CHORD', input.topChordProfile);
      registerMember(botNodes[i], topNodes[i], 'VERTICAL', input.webProfile);
      registerMember(botNodes[i], topNodes[i + 1], 'DIAGONAL', input.webProfile);
    }
    registerMember(botNodes[numPanels], topNodes[numPanels], 'VERTICAL', input.webProfile);
  } else if (code === 'VIERENDEEL') {
    // ============================================================
    // TR-09: VIERENDEEL (Rigid frame without diagonals)
    // ============================================================
    const numPanels = Math.max(3, panels);
    const dx = span / numPanels;

    const botNodes: StructuralNode[] = [];
    const topNodes: StructuralNode[] = [];

    for (let i = 0; i <= numPanels; i++) {
      const x = i * dx;
      botNodes.push(registerNode({ x, y: 0, z: 0 }, i === 0 || i === numPanels));
      topNodes.push(registerNode({ x, y: depth, z: 0 }));
    }

    for (let i = 0; i < numPanels; i++) {
      registerMember(botNodes[i], botNodes[i + 1], 'BOTTOM_CHORD', input.bottomChordProfile);
      registerMember(topNodes[i], topNodes[i + 1], 'TOP_CHORD', input.topChordProfile);
    }

    for (let i = 0; i <= numPanels; i++) {
      registerMember(botNodes[i], topNodes[i], 'VERTICAL', input.webProfile);
    }
  } else if (code === 'SAWTOOTH') {
    // ============================================================
    // TR-15: SAWTOOTH (DIENTE DE SIERRA ASIMÉTRICO)
    // ============================================================
    const numPanels = Math.max(4, panels);
    const dx = span / numPanels;
    const ridgeIdx = Math.max(1, Math.floor(numPanels * 0.75));

    const botNodes: StructuralNode[] = [];
    const topNodes: StructuralNode[] = [];

    for (let i = 0; i <= numPanels; i++) {
      const x = i * dx;
      botNodes.push(registerNode({ x, y: 0, z: 0 }, i === 0 || i === numPanels));
      let y = depth;
      if (i <= ridgeIdx) {
        y = depth + (rise * i) / ridgeIdx;
      } else {
        y = depth + rise * (1 - (i - ridgeIdx) / (numPanels - ridgeIdx));
      }
      topNodes.push(registerNode({ x, y, z: 0 }, false, i === ridgeIdx));
    }

    for (let i = 0; i < numPanels; i++) {
      registerMember(botNodes[i], botNodes[i + 1], 'BOTTOM_CHORD', input.bottomChordProfile);
      registerMember(topNodes[i], topNodes[i + 1], 'TOP_CHORD', input.topChordProfile);
      registerMember(botNodes[i], topNodes[i], 'VERTICAL', input.webProfile);
      if (i < ridgeIdx) {
        registerMember(botNodes[i], topNodes[i + 1], 'DIAGONAL', input.webProfile);
      } else {
        registerMember(botNodes[i + 1], topNodes[i], 'DIAGONAL', input.webProfile);
      }
    }
    registerMember(botNodes[numPanels], topNodes[numPanels], 'VERTICAL', input.webProfile);
  } else if (code === 'SHED') {
    // ============================================================
    // TR-16: SHED (MONOPENDIENTE UNIFORME)
    // ============================================================
    const numPanels = Math.max(3, panels);
    const dx = span / numPanels;

    const botNodes: StructuralNode[] = [];
    const topNodes: StructuralNode[] = [];

    for (let i = 0; i <= numPanels; i++) {
      const x = i * dx;
      botNodes.push(registerNode({ x, y: 0, z: 0 }, i === 0 || i === numPanels));
      const y = depth + (rise * i) / numPanels;
      topNodes.push(registerNode({ x, y, z: 0 }, false, i === numPanels));
    }

    for (let i = 0; i < numPanels; i++) {
      registerMember(botNodes[i], botNodes[i + 1], 'BOTTOM_CHORD', input.bottomChordProfile);
      registerMember(topNodes[i], topNodes[i + 1], 'TOP_CHORD', input.topChordProfile);
      registerMember(botNodes[i], topNodes[i], 'VERTICAL', input.webProfile);
      registerMember(botNodes[i], topNodes[i + 1], 'DIAGONAL', input.webProfile);
    }
    registerMember(botNodes[numPanels], topNodes[numPanels], 'VERTICAL', input.webProfile);
  } else if (code === 'SCISSORS') {
    // ============================================================
    // TR-12: SCISSORS (TIJERA CON BÓVEDA INFERIOR)
    // ============================================================
    const numPanels = panels % 2 === 0 ? panels : panels + 1;
    const dx = span / numPanels;
    const half = numPanels / 2;
    const botRise = rise * 0.45;

    const botNodes: StructuralNode[] = [];
    const topNodes: StructuralNode[] = [];

    for (let i = 0; i <= numPanels; i++) {
      const x = i * dx;
      const botY = botRise * (1 - Math.abs(i - half) / half);
      const topY = depth + rise * (1 - Math.abs(i - half) / half);
      botNodes.push(registerNode({ x, y: botY, z: 0 }, i === 0 || i === numPanels));
      topNodes.push(registerNode({ x, y: topY, z: 0 }, false, i === half));
    }

    for (let i = 0; i < numPanels; i++) {
      registerMember(botNodes[i], botNodes[i + 1], 'BOTTOM_CHORD', input.bottomChordProfile);
      registerMember(topNodes[i], topNodes[i + 1], 'TOP_CHORD', input.topChordProfile);
      registerMember(botNodes[i], topNodes[i], 'VERTICAL', input.webProfile);
      if (i < half) {
        registerMember(botNodes[i], topNodes[i + 1], 'DIAGONAL', input.webProfile);
      } else {
        registerMember(botNodes[i + 1], topNodes[i], 'DIAGONAL', input.webProfile);
      }
    }
    registerMember(botNodes[numPanels], topNodes[numPanels], 'VERTICAL', input.webProfile);
  } else if (code === 'THREE_CHORD') {
    // ============================================================
    // TR-13: THREE-CHORD 3D SPACE TRUSS
    // ============================================================
    const numPanels = Math.max(4, panels);
    const dx = span / numPanels;
    const baseW = 1.0;

    const topNodes: StructuralNode[] = [];
    const botLeftNodes: StructuralNode[] = [];
    const botRightNodes: StructuralNode[] = [];

    for (let i = 0; i <= numPanels; i++) {
      const x = i * dx;
      topNodes.push(registerNode({ x, y: depth, z: 0 }));
      botLeftNodes.push(registerNode({ x, y: 0, z: -baseW / 2 }, i === 0 || i === numPanels));
      botRightNodes.push(registerNode({ x, y: 0, z: baseW / 2 }, i === 0 || i === numPanels));
    }

    for (let i = 0; i < numPanels; i++) {
      registerMember(topNodes[i], topNodes[i + 1], 'TOP_CHORD', input.topChordProfile);
      registerMember(botLeftNodes[i], botLeftNodes[i + 1], 'BOTTOM_CHORD', input.bottomChordProfile);
      registerMember(botRightNodes[i], botRightNodes[i + 1], 'BOTTOM_CHORD', input.bottomChordProfile);

      // Bottom transverse tie
      registerMember(botLeftNodes[i], botRightNodes[i], 'VERTICAL', input.webProfile);

      // Lacing diagonals to apex
      registerMember(botLeftNodes[i], topNodes[i + 1], 'DIAGONAL', input.webProfile);
      registerMember(botRightNodes[i], topNodes[i + 1], 'DIAGONAL', input.webProfile);
    }
    registerMember(botLeftNodes[numPanels], botRightNodes[numPanels], 'VERTICAL', input.webProfile);
  } else {
    // ============================================================
    // GENERIC FALLBACK FOR OTHER ROOF / TRUSS COMBINATIONS
    // ============================================================
    const isPitched = input.roof.family === 'DOUBLE_SLOPE' || input.roof.family === 'GABLE' || input.roof.family === 'HIP';
    const numPanels = Math.max(4, panels);
    const dx = span / numPanels;

    const botNodes: StructuralNode[] = [];
    const topNodes: StructuralNode[] = [];

    for (let i = 0; i <= numPanels; i++) {
      const x = i * dx;
      botNodes.push(registerNode({ x, y: 0, z: 0 }, i === 0 || i === numPanels));
      let y = depth;
      if (isPitched) {
        const mid = span / 2;
        y = depth + rise * (1 - Math.abs(x - mid) / mid);
      }
      topNodes.push(registerNode({ x, y, z: 0 }, false, isPitched && i === Math.floor(numPanels / 2)));
    }

    for (let i = 0; i < numPanels; i++) {
      registerMember(botNodes[i], botNodes[i + 1], 'BOTTOM_CHORD', input.bottomChordProfile);
      registerMember(topNodes[i], topNodes[i + 1], 'TOP_CHORD', input.topChordProfile);
      registerMember(botNodes[i], topNodes[i], 'VERTICAL', input.webProfile);
      registerMember(botNodes[i], topNodes[i + 1], 'DIAGONAL', input.webProfile);
    }
    registerMember(botNodes[numPanels], topNodes[numPanels], 'VERTICAL', input.webProfile);
  }

  // Calculate total metrics
  let totalLen = 0;
  let minCut = 90;
  let maxCut = 0;

  const allMembers = [...topChords, ...bottomChords, ...webMembers];
  allMembers.forEach((m) => {
    const l = m.geometry?.length?.value || 0;
    totalLen += l;
    const c1 = m.geometry?.cutAngleStart || 90;
    const c2 = m.geometry?.cutAngleEnd || 90;
    if (c1 < minCut) minCut = c1;
    if (c2 < minCut) minCut = c2;
    if (c1 > maxCut) maxCut = c1;
    if (c2 > maxCut) maxCut = c2;
  });

  // Approx weight ~ 14 kg/m for chords, 8 kg/m for webs
  const approxWeightKg = Math.round(
    (topChords.length + bottomChords.length) * (span / panels) * 14 +
    webMembers.length * 1.5 * 8
  );

  const validDist: WebDistribution =
    input.panelDistribution === 'VARIABLE' ? 'ASYMMETRIC' : (input.panelDistribution || 'UNIFORM');

  const truss: TrussDefinition = {
    id: `TRUSS-${input.typology.code}-${String(Date.now()).slice(-4)}`,
    type: (input.typology.code as any) || 'WARREN',
    span: { value: span, unit: 'm' },
    rise: { value: rise, unit: 'm' },
    depth: { value: depth, unit: 'm' },
    panelCount: panels,
    web: {
      pattern: (input.typology.code as any) || 'WARREN',
      distribution: validDist,
      density: panels,
      verticals: input.addVerticals !== false,
      diagonals: true
    },
    supports: 'SIMPLE',
    symmetry: true,
    members: allMembers.map((m) => m.id),
    nodes: nodesList.map((n) => n.id)
  };

  return {
    graph,
    truss,
    topChords,
    bottomChords,
    webMembers,
    nodes: nodesList,
    summary: {
      totalLengthM: parseFloat(totalLen.toFixed(2)),
      totalSteelWeightKg: approxWeightKg,
      nodesCount: nodesList.length,
      membersCount: allMembers.length,
      cutAnglesSummary: { minDeg: minCut, maxDeg: maxCut }
    }
  };
}
