// ============================================================
// STV CLOSER — STRUCTURAL GRAPH
// structural-graph.ts
// ============================================================

import {
  ID,
  Point3D,
  StructuralNode,
  StructuralMember,
  StructuralConnection,
  StructuralMember as Member,
  AuditMessage
} from "./dst.schema";

export interface StructuralGraph {
  nodes: Map<ID, StructuralNode>;
  members: Map<ID, StructuralMember>;
  connections: Map<ID, StructuralConnection>;
}

// ============================================================
// GRAPH CREATION
// ============================================================

export function createStructuralGraph(): StructuralGraph {
  return {
    nodes: new Map(),
    members: new Map(),
    connections: new Map()
  };
}

// ============================================================
// NODE
// ============================================================

export function addNode(
  graph: StructuralGraph,
  node: StructuralNode
): void {

  if (graph.nodes.has(node.id)) {
    throw new Error(`Node already exists: ${node.id}`);
  }

  graph.nodes.set(node.id, node);
}

// ============================================================
// MEMBER
// ============================================================

export function addMember(
  graph: StructuralGraph,
  member: StructuralMember
): void {

  if (!graph.nodes.has(member.startNode)) {
    throw new Error(
      `Start node does not exist: ${member.startNode}`
    );
  }

  if (!graph.nodes.has(member.endNode)) {
    throw new Error(
      `End node does not exist: ${member.endNode}`
    );
  }

  if (graph.members.has(member.id)) {
    throw new Error(`Member already exists: ${member.id}`);
  }

  graph.members.set(member.id, member);

  connectNode(
    graph,
    member.startNode,
    member.id
  );

  connectNode(
    graph,
    member.endNode,
    member.id
  );
}

// ============================================================
// NODE CONNECTION
// ============================================================

function connectNode(
  graph: StructuralGraph,
  nodeId: ID,
  memberId: ID
): void {

  const node = graph.nodes.get(nodeId);

  if (!node) {
    throw new Error(`Node not found: ${nodeId}`);
  }

  if (!node.connectedMembers.includes(memberId)) {
    node.connectedMembers.push(memberId);
  }
}

// ============================================================
// CONNECTION
// ============================================================

export function addConnection(
  graph: StructuralGraph,
  connection: StructuralConnection
): void {

  if (!graph.nodes.has(connection.nodeId)) {
    throw new Error(
      `Connection node does not exist: ${connection.nodeId}`
    );
  }

  for (const memberId of connection.members) {

    if (!graph.members.has(memberId)) {
      throw new Error(
        `Connection member does not exist: ${memberId}`
      );
    }
  }

  graph.connections.set(
    connection.id,
    connection
  );
}

// ============================================================
// MEMBER LENGTH
// ============================================================

export function getMemberLength(
  graph: StructuralGraph,
  memberId: ID
): number {

  const member = graph.members.get(memberId);

  if (!member) {
    throw new Error(`Member not found: ${memberId}`);
  }

  const start = graph.nodes.get(member.startNode);
  const end = graph.nodes.get(member.endNode);

  if (!start || !end) {
    throw new Error("Member references invalid nodes");
  }

  const dx = end.position.x - start.position.x;
  const dy = end.position.y - start.position.y;
  const dz = end.position.z - start.position.z;

  return Math.sqrt(
    dx * dx +
    dy * dy +
    dz * dz
  );
}

// ============================================================
// LINEAR METERS
// ============================================================

export function calculateLinearMeters(
  graph: StructuralGraph
): Map<string, number> {

  const quantities = new Map<string, number>();

  for (const member of graph.members.values()) {

    const length = getMemberLength(
      graph,
      member.id
    );

    const key =
      `${member.section.family}:${member.section.designation}`;

    quantities.set(
      key,
      (quantities.get(key) ?? 0) + length
    );
  }

  return quantities;
}

// ============================================================
// GRAPH VALIDATION
// ============================================================

export function validateGraph(
  graph: StructuralGraph
): AuditMessage[] {

  const errors: AuditMessage[] = [];

  for (const member of graph.members.values()) {

    if (!graph.nodes.has(member.startNode)) {
      errors.push({
        severity: "ERROR",
        code: "MISSING_START_NODE",
        message: `Member ${member.id} has no valid start node`,
        elementIds: [member.id]
      });
    }

    if (!graph.nodes.has(member.endNode)) {
      errors.push({
        severity: "ERROR",
        code: "MISSING_END_NODE",
        message: `Member ${member.id} has no valid end node`,
        elementIds: [member.id]
      });
    }
  }

  for (const node of graph.nodes.values()) {

    if (
      node.type !== "JOINT" &&
      node.connectedMembers.length === 0
    ) {
      errors.push({
        severity: "ERROR",
        code: "ISOLATED_NODE",
        message: `Node ${node.id} is isolated`,
        elementIds: [node.id]
      });
    }
  }

  return errors;
}
