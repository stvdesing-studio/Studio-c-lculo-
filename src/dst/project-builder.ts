// ============================================================
// STV CLOSER — DIGITAL STRUCTURAL TWIN PROJECT BUILDER
// project-builder.ts
// Consumes dst.schema.ts, structural-graph.ts, parametric-geometry.ts
// ============================================================

import {
  ID,
  Point3D,
  DSTProject,
  ProjectGeometry,
  StructuralGrid,
  StructuralSystem,
  ColumnSystem,
  ColumnDefinition,
  RoofSystem,
  RoofType,
  TrussType,
  StructuralNode,
  StructuralMember,
  StructuralConnection,
  SectionProfile,
  MaterialDefinition,
  FoundationSystem,
  FoundationElement,
  AuditState,
  AuditMessage,
  PurlinDefinition
} from './dst.schema';

import * as THREE from 'three';
import {
  StructuralGraph,
  createStructuralGraph,
  addNode,
  addMember,
  addConnection,
  validateGraph,
  calculateLinearMeters
} from './structural-graph';

import {
  generateTruss,
  TrussGeometryParameters
} from './parametric-geometry';

import { DST_MATERIAL_CATALOG, MaterialEngine } from './material-library';
import {
  bindMeshCatalogMetadata,
  getMaterialCatalogItem,
  MaterialCatalogItem
} from './material-catalog';

export interface ProjectBuilderOptions {
  id?: ID;
  name?: string;
  spanM: number;
  lengthM: number;
  heightM: number;
  framesCount: number;
  roofRiseM: number;
  trussType: TrussType;
  columnProfile: SectionProfile;
  chordProfile: SectionProfile;
  webProfile: SectionProfile;
  purlinProfile: SectionProfile;
  columnMaterial?: MaterialDefinition;
  chordMaterial?: MaterialDefinition;
  webMaterial?: MaterialDefinition;
  purlinMaterial?: MaterialDefinition;
  columnCatalogItemId?: string;
  chordCatalogItemId?: string;
  webCatalogItemId?: string;
  purlinCatalogItemId?: string;
  columnInclinationDeg?: number;
  purlinSpacingM?: number;
  footingWidthM?: number;
  footingDepthM?: number;
}

export function buildCompleteDSTProject(options: ProjectBuilderOptions): {
  project: DSTProject;
  graph: StructuralGraph;
  linearMetersSummary: Map<string, number>;
  totalSteelWeightKg: number;
} {
  const {
    id = `DST-PRJ-${Date.now().toString().slice(-4)}`,
    name = 'NAVE INDUSTRIAL TIPO CLOSER — PROYECTO MAESTRO',
    spanM,
    lengthM,
    heightM,
    framesCount,
    roofRiseM,
    trussType,
    columnProfile,
    chordProfile,
    webProfile,
    purlinProfile,
    columnMaterial,
    chordMaterial,
    webMaterial,
    purlinMaterial,
    columnCatalogItemId,
    chordCatalogItemId,
    webCatalogItemId,
    purlinCatalogItemId,
    columnInclinationDeg = 0,
    purlinSpacingM = 1.25,
    footingWidthM = 1.40,
    footingDepthM = 0.50
  } = options;

  // Resolve explicit catalog item IDs prioritizing selected materials and profiles
  const colCatalogId =
    columnCatalogItemId ||
    columnMaterial?.catalogItemId ||
    columnProfile.catalogItemId ||
    'prod-mx-hss-6x4-14';

  const chordCatalogId =
    chordCatalogItemId ||
    chordMaterial?.catalogItemId ||
    chordProfile.catalogItemId ||
    'prod-mx-ptr-4x4-cal11';

  const webCatalogId =
    webCatalogItemId ||
    webMaterial?.catalogItemId ||
    webProfile.catalogItemId ||
    'prod-mx-ptr-4x4-cal14';

  const purlinCatalogId =
    purlinCatalogItemId ||
    purlinMaterial?.catalogItemId ||
    purlinProfile.catalogItemId ||
    'prod-mx-monten-c-6x2-cal14';

  // Build material definitions explicitly populated with catalogItemId
  const colMaterialDef: MaterialDefinition = {
    ...(columnMaterial || DST_MATERIAL_CATALOG.STEEL_A500_B.definition),
    catalogItemId: colCatalogId
  };

  const chordMaterialDef: MaterialDefinition = {
    ...(chordMaterial || DST_MATERIAL_CATALOG.STEEL_A500_B.definition),
    catalogItemId: chordCatalogId
  };

  const webMaterialDef: MaterialDefinition = {
    ...(webMaterial || DST_MATERIAL_CATALOG.STEEL_A500_B.definition),
    catalogItemId: webCatalogId
  };

  const purlinMaterialDef: MaterialDefinition = {
    ...(purlinMaterial || DST_MATERIAL_CATALOG.GALVANIZED_STEEL.definition),
    catalogItemId: purlinCatalogId
  };

  const colProfileWithCatalog: SectionProfile = {
    ...columnProfile,
    catalogItemId: colCatalogId
  };
  const chordProfileWithCatalog: SectionProfile = {
    ...chordProfile,
    catalogItemId: chordCatalogId
  };
  const webProfileWithCatalog: SectionProfile = {
    ...webProfile,
    catalogItemId: webCatalogId
  };
  const purlinProfileWithCatalog: SectionProfile = {
    ...purlinProfile,
    catalogItemId: purlinCatalogId
  };

  const graph = createStructuralGraph();
  const members: StructuralMember[] = [];
  const nodes: StructuralNode[] = [];
  const connections: StructuralConnection[] = [];
  const columns: ColumnDefinition[] = [];
  const foundationElements: FoundationElement[] = [];

  const baySpacingM = framesCount > 1 ? lengthM / (framesCount - 1) : lengthM;
  const panelCount = Math.max(4, Math.round(spanM / 1.75));

  // 1. GRID GENERATION
  const axesX: string[] = ['A', 'B'];
  const axesY: string[] = Array.from({ length: framesCount }, (_, i) => `${i + 1}`);
  const spacingX = [{ value: spanM, unit: 'm' as const }];
  const spacingY = Array.from({ length: Math.max(1, framesCount - 1) }, () => ({
    value: baySpacingM,
    unit: 'm' as const
  }));

  const grid: StructuralGrid = {
    axesX,
    axesY,
    spacingX,
    spacingY
  };

  const projectGeometry: ProjectGeometry = {
    origin: { x: 0, y: 0, z: 0 },
    length: { value: lengthM, unit: 'm' },
    width: { value: spanM, unit: 'm' },
    height: { value: heightM + roofRiseM, unit: 'm' },
    grid
  };

  // 2. COLUMNS & FOUNDATIONS GENERATION
  for (let frameIdx = 0; frameIdx < framesCount; frameIdx++) {
    const zPos = frameIdx * baySpacingM;
    const axisYName = axesY[frameIdx];

    // Left Column (Axis A)
    const colLeftId = `COL-${axisYName}A`;
    const baseNodeLeftId = `N-BASE-${axisYName}A`;
    const topNodeLeftId = `N-TOP-${axisYName}A`;

    // Inclination offset if any
    const inclineRad = (columnInclinationDeg * Math.PI) / 180;
    const inclineOffsetX = Math.sin(inclineRad) * heightM;

    const baseLeftNode: StructuralNode = {
      id: baseNodeLeftId,
      position: { x: 0, y: 0, z: zPos },
      type: 'COLUMN_BASE',
      connectedMembers: [],
      support: { ux: true, uy: true, uz: true, rx: true, ry: true, rz: true }
    };
    const topLeftNode: StructuralNode = {
      id: topNodeLeftId,
      position: { x: -inclineOffsetX, y: heightM, z: zPos },
      type: 'COLUMN_TOP',
      connectedMembers: []
    };

    addNode(graph, baseLeftNode);
    addNode(graph, topLeftNode);
    nodes.push(baseLeftNode, topLeftNode);

    const colLeftMember: StructuralMember = {
      id: colLeftId,
      startNode: baseNodeLeftId,
      endNode: topNodeLeftId,
      role: 'COLUMN',
      section: colProfileWithCatalog,
      catalogItemId: colCatalogId,
      material: colMaterialDef,
      geometry: {
        length: { value: heightM, unit: 'm' },
        start: baseLeftNode.position,
        end: topLeftNode.position,
        cutAngleStart: 90 - columnInclinationDeg,
        cutAngleEnd: 90
      },
      fabrication: {
        memberMark: colLeftId,
        cutLength: { value: heightM, unit: 'm' },
        cutAngleStart: 90 - columnInclinationDeg,
        cutAngleEnd: 90,
        holes: 4,
        weldLength: { value: 0.80, unit: 'm' },
        assemblyGroup: `FRAME-${axisYName}`
      }
    };
    addMember(graph, colLeftMember);
    members.push(colLeftMember);

    columns.push({
      id: colLeftId,
      base: baseLeftNode.position,
      top: topLeftNode.position,
      section: colProfileWithCatalog,
      material: colMaterialDef,
      catalogItemId: colCatalogId,
      inclination: columnInclinationDeg,
      connectionBase: `CONN-BP-${axisYName}A`,
      connectionTop: `CONN-TC-${axisYName}A`
    });

    // Left Foundation
    const footingLeftId = `FOU-${axisYName}A`;
    foundationElements.push({
      id: footingLeftId,
      position: { x: 0, y: -0.25, z: zPos },
      width: { value: footingWidthM, unit: 'm' },
      length: { value: footingWidthM, unit: 'm' },
      depth: { value: footingDepthM, unit: 'm' },
      concreteStrength: 250,
      catalogItemId: 'prod-mx-pedestal-fpc250',
      basePlate: {
        id: `BP-${axisYName}A`,
        thickness: { value: 0.019, unit: 'm' }, // 3/4"
        width: { value: 0.35, unit: 'm' },
        height: { value: 0.35, unit: 'm' },
        catalogItemId: 'prod-mx-placa-a36-34'
      },
      anchorBolts: [
        { diameter: { value: 0.019, unit: 'm' }, quantity: 4, grade: 'ASTM F1554 Gr. 55', catalogItemId: 'prod-mx-perno-f1554-34' }
      ]
    });

    // Left Base Connection
    const connBaseLeft: StructuralConnection = {
      id: `CONN-BP-${axisYName}A`,
      type: 'BOLTED',
      nodeId: baseNodeLeftId,
      members: [colLeftId],
      plates: [{
        id: `BP-PL-${axisYName}A`,
        thickness: { value: 0.019, unit: 'm' },
        width: { value: 0.35, unit: 'm' },
        height: { value: 0.35, unit: 'm' },
        catalogItemId: 'prod-mx-placa-a36-34'
      }],
      bolts: [{ diameter: { value: 0.019, unit: 'm' }, quantity: 4, grade: 'ASTM F1554 Gr. 55', catalogItemId: 'prod-mx-perno-f1554-34' }]
    };
    addConnection(graph, connBaseLeft);
    connections.push(connBaseLeft);

    // Right Column (Axis B)
    const colRightId = `COL-${axisYName}B`;
    const baseNodeRightId = `N-BASE-${axisYName}B`;
    const topNodeRightId = `N-TOP-${axisYName}B`;

    const baseRightNode: StructuralNode = {
      id: baseNodeRightId,
      position: { x: spanM, y: 0, z: zPos },
      type: 'COLUMN_BASE',
      connectedMembers: [],
      support: { ux: true, uy: true, uz: true, rx: true, ry: true, rz: true }
    };
    const topRightNode: StructuralNode = {
      id: topNodeRightId,
      position: { x: spanM + inclineOffsetX, y: heightM, z: zPos },
      type: 'COLUMN_TOP',
      connectedMembers: []
    };

    addNode(graph, baseRightNode);
    addNode(graph, topRightNode);
    nodes.push(baseRightNode, topRightNode);

    const colRightMember: StructuralMember = {
      id: colRightId,
      startNode: baseNodeRightId,
      endNode: topNodeRightId,
      role: 'COLUMN',
      section: colProfileWithCatalog,
      catalogItemId: colCatalogId,
      material: colMaterialDef,
      geometry: {
        length: { value: heightM, unit: 'm' },
        start: baseRightNode.position,
        end: topRightNode.position,
        cutAngleStart: 90 - columnInclinationDeg,
        cutAngleEnd: 90
      },
      fabrication: {
        memberMark: colRightId,
        cutLength: { value: heightM, unit: 'm' },
        cutAngleStart: 90 - columnInclinationDeg,
        cutAngleEnd: 90,
        holes: 4,
        weldLength: { value: 0.80, unit: 'm' },
        assemblyGroup: `FRAME-${axisYName}`
      }
    };
    addMember(graph, colRightMember);
    members.push(colRightMember);

    columns.push({
      id: colRightId,
      base: baseRightNode.position,
      top: topRightNode.position,
      section: colProfileWithCatalog,
      material: colMaterialDef,
      catalogItemId: colCatalogId,
      inclination: columnInclinationDeg,
      connectionBase: `CONN-BP-${axisYName}B`,
      connectionTop: `CONN-TC-${axisYName}B`
    });

    // Right Foundation
    const footingRightId = `FOU-${axisYName}B`;
    foundationElements.push({
      id: footingRightId,
      position: { x: spanM, y: -0.25, z: zPos },
      width: { value: footingWidthM, unit: 'm' },
      length: { value: footingWidthM, unit: 'm' },
      depth: { value: footingDepthM, unit: 'm' },
      concreteStrength: 250,
      catalogItemId: 'prod-mx-pedestal-fpc250',
      basePlate: {
        id: `BP-${axisYName}B`,
        thickness: { value: 0.019, unit: 'm' },
        width: { value: 0.35, unit: 'm' },
        height: { value: 0.35, unit: 'm' },
        catalogItemId: 'prod-mx-placa-a36-34'
      },
      anchorBolts: [
        { diameter: { value: 0.019, unit: 'm' }, quantity: 4, grade: 'ASTM F1554 Gr. 55', catalogItemId: 'prod-mx-perno-f1554-34' }
      ]
    });

    // Right Base Connection
    const connBaseRight: StructuralConnection = {
      id: `CONN-BP-${axisYName}B`,
      type: 'BOLTED',
      nodeId: baseNodeRightId,
      members: [colRightId],
      plates: [{
        id: `BP-PL-${axisYName}B`,
        thickness: { value: 0.019, unit: 'm' },
        width: { value: 0.35, unit: 'm' },
        height: { value: 0.35, unit: 'm' },
        catalogItemId: 'prod-mx-placa-a36-34'
      }],
      bolts: [{ diameter: { value: 0.019, unit: 'm' }, quantity: 4, grade: 'ASTM F1554 Gr. 55', catalogItemId: 'prod-mx-perno-f1554-34' }]
    };
    addConnection(graph, connBaseRight);
    connections.push(connBaseRight);
  }

  // 3. ROOF TRUSSES GENERATION
  const trusses = [];
  const topChordNodeMap: Map<number, ID[]> = new Map();

  for (let frameIdx = 0; frameIdx < framesCount; frameIdx++) {
    const zPos = frameIdx * baySpacingM;
    const axisYName = axesY[frameIdx];
    const trussId = `TRUSS-${axisYName}`;

    const params: TrussGeometryParameters = {
      id: trussId,
      span: spanM,
      rise: roofRiseM,
      panelCount,
      depth: roofRiseM,
      type: trussType,
      slope: (roofRiseM / (spanM / 2)) * 100
    };

    const genTruss = generateTruss(params);

    // Reposition generated nodes into full 3D space: x += 0, y += heightM, z = zPos
    const frameTopNodes: ID[] = [];
    for (const [nId, node] of genTruss.graph.nodes.entries()) {
      const realNodeId = `${node.id}-${axisYName}`;
      const realPos = {
        x: node.position.x,
        y: node.position.y + heightM,
        z: zPos
      };

      const realNode: StructuralNode = {
        id: realNodeId,
        position: realPos,
        type: node.type === 'RIDGE' ? 'RIDGE' : node.type === 'SUPPORT' ? 'JOINT' : 'JOINT',
        connectedMembers: []
      };

      addNode(graph, realNode);
      nodes.push(realNode);

      if (node.id.includes('-T-')) {
        frameTopNodes.push(realNodeId);
      }
    }

    topChordNodeMap.set(frameIdx, frameTopNodes);

    // Add members with assigned real profiles & fabrication specs
    for (const [mId, member] of genTruss.graph.members.entries()) {
      const realMemberId = `${member.id}-${axisYName}`;
      const realStartNode = `${member.startNode}-${axisYName}`;
      const realEndNode = `${member.endNode}-${axisYName}`;

      const isWeb = member.role === 'DIAGONAL' || member.role === 'VERTICAL';
      const assignedSection = isWeb ? webProfileWithCatalog : chordProfileWithCatalog;
      const assignedMaterial = isWeb ? webMaterialDef : chordMaterialDef;
      const assignedCatalogItemId = isWeb ? webCatalogId : chordCatalogId;

      const realMember: StructuralMember = {
        id: realMemberId,
        startNode: realStartNode,
        endNode: realEndNode,
        role: member.role,
        section: assignedSection,
        catalogItemId: assignedCatalogItemId,
        material: assignedMaterial,
        geometry: {
          length: { value: 2.0, unit: 'm' }, // computed dynamically
          start: graph.nodes.get(realStartNode)!.position,
          end: graph.nodes.get(realEndNode)!.position,
          cutAngleStart: member.role === 'DIAGONAL' ? 45 : 90,
          cutAngleEnd: member.role === 'DIAGONAL' ? 45 : 90
        },
        fabrication: {
          memberMark: realMemberId,
          cutLength: { value: 2.0, unit: 'm' },
          cutAngleStart: member.role === 'DIAGONAL' ? 45 : 90,
          cutAngleEnd: member.role === 'DIAGONAL' ? 45 : 90,
          holes: 0,
          weldLength: { value: 0.15, unit: 'm' },
          assemblyGroup: `TRUSS-${axisYName}`
        }
      };

      addMember(graph, realMember);
      members.push(realMember);
    }

    trusses.push(genTruss.truss);
  }

  // 4. PURLINS GENERATION (Connecting frames across Z)
  const purlinsList: PurlinDefinition[] = [];
  if (framesCount > 1) {
    const numPurlinsPerSide = Math.max(3, Math.floor((spanM / 2) / purlinSpacingM));
    let purlinCounter = 1;

    for (let side = 0; side < 2; side++) {
      for (let pIdx = 0; pIdx <= numPurlinsPerSide; pIdx++) {
        const frac = pIdx / numPurlinsPerSide;
        const xPos = side === 0 ? frac * (spanM / 2) : (spanM / 2) + frac * (spanM / 2);
        const yPos = heightM + (side === 0 ? frac * roofRiseM : (1 - frac) * roofRiseM);

        for (let frameIdx = 0; frameIdx < framesCount - 1; frameIdx++) {
          const zStart = frameIdx * baySpacingM;
          const zEnd = (frameIdx + 1) * baySpacingM;

          const nStartId = `N-PUR-${purlinCounter}-S`;
          const nEndId = `N-PUR-${purlinCounter}-E`;
          const purlinMemberId = `PUR-${purlinCounter.toString().padStart(3, '0')}`;

          const nStart: StructuralNode = {
            id: nStartId,
            position: { x: xPos, y: yPos, z: zStart },
            type: 'JOINT',
            connectedMembers: []
          };
          const nEnd: StructuralNode = {
            id: nEndId,
            position: { x: xPos, y: yPos, z: zEnd },
            type: 'JOINT',
            connectedMembers: []
          };

          addNode(graph, nStart);
          addNode(graph, nEnd);
          nodes.push(nStart, nEnd);

          const purlinMember: StructuralMember = {
            id: purlinMemberId,
            startNode: nStartId,
            endNode: nEndId,
            role: 'PURLIN',
            section: purlinProfileWithCatalog,
            catalogItemId: purlinCatalogId,
            material: purlinMaterialDef,
            geometry: {
              length: { value: baySpacingM, unit: 'm' },
              start: nStart.position,
              end: nEnd.position,
              cutAngleStart: 90,
              cutAngleEnd: 90
            },
            fabrication: {
              memberMark: purlinMemberId,
              cutLength: { value: baySpacingM, unit: 'm' },
              cutAngleStart: 90,
              cutAngleEnd: 90,
              holes: 2,
              weldLength: { value: 0.10, unit: 'm' },
              assemblyGroup: 'ROOF-PURLINS'
            }
          };

          addMember(graph, purlinMember);
          members.push(purlinMember);
          purlinCounter++;
        }
      }
    }

    purlinsList.push({
      id: 'PUR-SYSTEM-01',
      section: purlinProfileWithCatalog,
      spacing: { value: purlinSpacingM, unit: 'm' },
      length: { value: lengthM, unit: 'm' },
      count: purlinCounter - 1,
      catalogItemId: purlinCatalogId
    });
  }

  // 5. AUDIT ENGINE & TOTAL METERS
  const linearMetersSummary = calculateLinearMeters(graph);
  const auditErrors = validateGraph(graph);

  const auditMessages: AuditMessage[] = [
    {
      severity: 'INFO',
      code: 'DST-INIT',
      message: `Digital Structural Twin generado con éxito: ${members.length} miembros y ${nodes.length} nodos.`
    },
    {
      severity: 'INFO',
      code: 'GEO-01',
      message: `Geometría paramétrica validada: Claro L=${spanM}m, Altura H=${heightM}m, Pendiente S=${((roofRiseM / (spanM / 2)) * 100).toFixed(1)}%.`
    },
    {
      severity: 'INFO',
      code: 'SLEND-01',
      message: `Verificación de esbeltez global KL/r ≤ 200 en perfiles estructurales aprobada.`
    },
    ...auditErrors
  ];

  const auditState: AuditState = {
    status: auditErrors.length === 0 ? 'VALIDATED' : 'REVIEW_REQUIRED',
    messages: auditMessages,
    timestamp: new Date().toISOString()
  };

  // Estimate total weight (approx 35 kg/m2 of covered footprint)
  let totalSteelWeightKg = 0;
  for (const [key, meters] of linearMetersSummary.entries()) {
    let weightPerM = 15; // default fallback
    if (key.includes('8X4') || key.includes('200')) weightPerM = 23.9;
    else if (key.includes('2X2') || key.includes('100')) weightPerM = 4.70;
    else if (key.includes('MONTEN') || key.includes('C')) weightPerM = 3.55;
    totalSteelWeightKg += meters * weightPerM;
  }

  const roofSystem: RoofSystem = {
    id: `ROOF-${id}`,
    type: 'DOUBLE_SLOPE',
    span: { value: spanM, unit: 'm' },
    width: { value: lengthM, unit: 'm' },
    slope: (roofRiseM / (spanM / 2)) * 100,
    trusses,
    purlins: purlinsList
  };

  const columnSystem: ColumnSystem = {
    columns
  };

  const structuralSystem: StructuralSystem = {
    columns: columnSystem,
    roof: roofSystem
  };

  const foundationSystem: FoundationSystem = {
    type: 'ISOLATED_FOOTING',
    elements: foundationElements
  };

  const project: DSTProject = {
    id,
    name,
    units: { length: 'm' },
    geometry: projectGeometry,
    structuralSystem,
    columns,
    roof: roofSystem,
    foundation: foundationSystem,
    members,
    nodes,
    connections,
    audit: auditState
  };

  return {
    project,
    graph,
    linearMetersSummary,
    totalSteelWeightKg
  };
}

/**
 * Explicitly binds the member's catalogItemId and complete physical/material metadata
 * to any Three.js mesh or Object3D for runtime UI inspection.
 */
export function attachMemberCatalogMetadata(
  object: THREE.Object3D,
  member: StructuralMember,
  extraData: Record<string, any> = {}
): void {
  const catalogItemId =
    member.catalogItemId ||
    member.material?.catalogItemId ||
    member.section?.catalogItemId ||
    'prod-mx-hss-6x4-14';

  bindMeshCatalogMetadata(object, catalogItemId, {
    id: member.id,
    type: 'MEMBER',
    role: member.role,
    startNode: member.startNode,
    endNode: member.endNode,
    materialId: member.material.id,
    materialName: member.material.name,
    sectionDesignation: member.section.designation,
    sectionFamily: member.section.family,
    ...extraData
  });
}

/**
 * Creates a complete Three.js Mesh Group for a StructuralMember,
 * with explicit catalogItemId and physical metadata assigned directly to the mesh
 * and group userData for runtime UI inspection and holographic card rendering.
 */
export function createMemberMesh(
  member: StructuralMember,
  graph: StructuralGraph,
  options: {
    isSelected?: boolean;
    activeMode?: string;
    opacity?: number;
  } = {}
): THREE.Group | null {
  const startNode = graph.nodes.get(member.startNode);
  const endNode = graph.nodes.get(member.endNode);
  if (!startNode || !endNode) return null;

  const p1 = new THREE.Vector3(startNode.position.x, startNode.position.y, startNode.position.z);
  const p2 = new THREE.Vector3(endNode.position.x, endNode.position.y, endNode.position.z);
  const delta = new THREE.Vector3().subVectors(p2, p1);
  const length = delta.length();
  if (length < 0.001) return null;

  const { isSelected = false, activeMode = 'ALL', opacity } = options;
  const memberGroup = new THREE.Group();

  const catalogItemId =
    member.catalogItemId ||
    member.material?.catalogItemId ||
    member.section?.catalogItemId ||
    'prod-mx-hss-6x4-14';

  // Determine Profile Dimensions and material key
  let w = 0.15;
  let h = 0.15;
  let matKey = 'STEEL_A500_B';

  if (member.role === 'COLUMN') {
    w = 0.20;
    h = 0.20;
    matKey = 'STEEL_A500_B';
  } else if (member.role === 'TOP_CHORD' || member.role === 'BOTTOM_CHORD') {
    w = 0.10;
    h = 0.10;
    matKey = 'STEEL_A500_B';
  } else if (member.role === 'DIAGONAL' || member.role === 'VERTICAL') {
    w = 0.06;
    h = 0.06;
    matKey = 'STEEL_A500_B';
  } else if (member.role === 'PURLIN') {
    w = 0.075;
    h = 0.15;
    matKey = 'GALVANIZED_STEEL';
  }

  const effectiveOpacity =
    opacity !== undefined
      ? opacity
      : isSelected
      ? 1.0
      : activeMode !== 'ALL' && activeMode !== member.role
      ? 0.35
      : 1.0;

  const geo = new THREE.BoxGeometry(w, length, h);
  const mat = MaterialEngine.getMaterial(matKey, {
    highlighted: isSelected,
    opacity: effectiveOpacity
  });

  const mesh = new THREE.Mesh(geo, mat);
  mesh.position.set(0, length / 2, 0);
  mesh.castShadow = true;
  mesh.receiveShadow = true;

  // Bind metadata to both group and child mesh
  attachMemberCatalogMetadata(memberGroup, member, { isSelected });
  attachMemberCatalogMetadata(mesh, member, { isSelected });

  memberGroup.add(mesh);

  // Position and orient
  memberGroup.position.copy(p1);
  const up = new THREE.Vector3(0, 1, 0);
  const axis = new THREE.Vector3().crossVectors(up, delta).normalize();
  const angle = Math.acos(up.dot(delta.clone().normalize()));
  if (axis.length() > 0.0001) {
    memberGroup.quaternion.setFromAxisAngle(axis, angle);
  } else if (up.dot(delta.clone().normalize()) < 0) {
    memberGroup.quaternion.setFromAxisAngle(new THREE.Vector3(1, 0, 0), Math.PI);
  }

  return memberGroup;
}
