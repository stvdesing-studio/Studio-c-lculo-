/**
 * STV CLOSER — STRUCTURAL GRAPH ENGINE
 * Pure Topological and Mathematical Representation of the Digital Structural Twin.
 * Handles topological validation, connectivity trees, 3D Euclidean distances,
 * and linear meter takeoff directly from node coordinates.
 */

import {
  ID,
  Vec3,
  StructuralNode,
  StructuralMember,
  StructuralConnection,
  StructuralStatus,
  MemberScheduleItem
} from "../types/dst.schema";

export interface TopologyValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  stats: {
    nodeCount: number;
    memberCount: number;
    connectionCount: number;
    supportCount: number;
    isolatedNodes: string[];
    zeroLengthMembers: string[];
    totalLinearMeters: number;
  };
}

export class StructuralGraph {
  nodes = new Map<ID, StructuralNode>();
  members = new Map<ID, StructuralMember>();
  connections = new Map<ID, StructuralConnection>();
  metadata: {
    title?: string;
    version?: string;
    globalStatus?: StructuralStatus;
  } = {
    title: "STV Structural Graph",
    version: "1.0",
    globalStatus: "VALIDATED"
  };

  /**
   * Add or register a structural node with validation
   */
  addNode(node: StructuralNode): void {
    if (this.nodes.has(node.id)) {
      throw new Error(`[StructuralGraph] Duplicate node identifier: ${node.id}`);
    }
    this.nodes.set(node.id, {
      ...node,
      connectedMembers: node.connectedMembers || []
    });
  }

  /**
   * Add a structural member connecting startNode and endNode
   */
  addMember(member: StructuralMember): void {
    if (!this.nodes.has(member.startNode)) {
      throw new Error(`[StructuralGraph] Missing start node: ${member.startNode} for member ${member.id}`);
    }
    if (!this.nodes.has(member.endNode)) {
      throw new Error(`[StructuralGraph] Missing end node: ${member.endNode} for member ${member.id}`);
    }
    if (this.members.has(member.id)) {
      throw new Error(`[StructuralGraph] Duplicate member identifier: ${member.id}`);
    }

    // Calculate length automatically if not provided
    const pStart = this.nodes.get(member.startNode)!.position;
    const pEnd = this.nodes.get(member.endNode)!.position;
    const length = this.calculateDistance(pStart, pEnd);

    const enrichedMember: StructuralMember = {
      ...member,
      fabrication: {
        ...member.fabrication,
        cutLengthM: member.fabrication?.cutLengthM ?? length
      }
    };

    this.members.set(member.id, enrichedMember);

    // Register bidirectional connectivity
    const startNode = this.nodes.get(member.startNode)!;
    if (!startNode.connectedMembers?.includes(member.id)) {
      startNode.connectedMembers = [...(startNode.connectedMembers || []), member.id];
    }

    const endNode = this.nodes.get(member.endNode)!;
    if (!endNode.connectedMembers?.includes(member.id)) {
      endNode.connectedMembers = [...(endNode.connectedMembers || []), member.id];
    }
  }

  /**
   * Add a structural connection at a node
   */
  addConnection(connection: StructuralConnection): void {
    if (!this.nodes.has(connection.nodeId)) {
      throw new Error(`[StructuralGraph] Missing connection node: ${connection.nodeId}`);
    }
    this.connections.set(connection.id, connection);
  }

  /**
   * Get all members connected to a given node
   */
  getConnectedMembers(nodeId: ID): StructuralMember[] {
    return Array.from(this.members.values()).filter(
      (m) => m.startNode === nodeId || m.endNode === nodeId
    );
  }

  /**
   * Get all nodes that have support conditions
   */
  getSupportNodes(): StructuralNode[] {
    return Array.from(this.nodes.values()).filter(
      (n) => n.support && n.support.type !== "FREE"
    );
  }

  /**
   * Calculate 3D Euclidean distance between two points
   */
  calculateDistance(p1: Vec3, p2: Vec3): number {
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    const dz = p2.z - p1.z;
    return Math.sqrt(dx * dx + dy * dy + dz * dz);
  }

  /**
   * Calculate total linear meters of the graph, optionally grouped by family or role
   */
  calculateLinearMeters(filterFamily?: string): number {
    let total = 0;
    for (const member of this.members.values()) {
      if (filterFamily && member.family !== filterFamily) continue;
      const n1 = this.nodes.get(member.startNode);
      const n2 = this.nodes.get(member.endNode);
      if (n1 && n2) {
        total += this.calculateDistance(n1.position, n2.position);
      }
    }
    return Number(total.toFixed(2));
  }

  /**
   * Generate complete fabrication member schedule with linear meters & weight
   */
  generateMemberSchedule(): MemberScheduleItem[] {
    const scheduleMap = new Map<string, MemberScheduleItem>();

    for (const member of this.members.values()) {
      const n1 = this.nodes.get(member.startNode);
      const n2 = this.nodes.get(member.endNode);
      const length = n1 && n2 ? this.calculateDistance(n1.position, n2.position) : 0;
      const designation = member.profile.designation || `${member.family} ${member.role}`;
      const unitWeight = member.profile.linearWeightKgM || 15.0;
      const key = `${member.family}_${designation}_${member.role}_${length.toFixed(2)}`;

      if (scheduleMap.has(key)) {
        const existing = scheduleMap.get(key)!;
        existing.quantity += 1;
        existing.totalLinearMeters = Number((existing.quantity * existing.unitLengthM).toFixed(2));
        existing.totalWeightKg = Number((existing.totalLinearMeters * existing.unitWeightKgM).toFixed(2));
      } else {
        scheduleMap.set(key, {
          code: `M-${scheduleMap.size + 1}`.padStart(5, '0'),
          role: member.role,
          family: member.family,
          designation,
          quantity: 1,
          unitLengthM: Number(length.toFixed(2)),
          totalLinearMeters: Number(length.toFixed(2)),
          unitWeightKgM: unitWeight,
          totalWeightKg: Number((length * unitWeight).toFixed(2)),
          cutStartDeg: member.fabrication?.cutAngleStartDeg ?? 0,
          cutEndDeg: member.fabrication?.cutAngleEndDeg ?? 0,
          connectionType: member.fabrication?.bevelType ?? "SQUARE"
        });
      }
    }

    return Array.from(scheduleMap.values());
  }

  /**
   * Topological & Engineering Validation of the Graph
   */
  validateTopology(): TopologyValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    const isolatedNodes: string[] = [];
    const zeroLengthMembers: string[] = [];

    // 1. Check isolated nodes
    for (const [nodeId, node] of this.nodes.entries()) {
      const connected = this.getConnectedMembers(nodeId);
      if (connected.length === 0) {
        isolatedNodes.push(nodeId);
        warnings.push(`[Topology] Node ${nodeId} has no attached structural members (isolated node).`);
      }
    }

    // 2. Check members for valid endpoints and length
    for (const [memberId, member] of this.members.entries()) {
      const n1 = this.nodes.get(member.startNode);
      const n2 = this.nodes.get(member.endNode);

      if (!n1) {
        errors.push(`[Topology] Member ${memberId} refers to non-existent start node: ${member.startNode}`);
      }
      if (!n2) {
        errors.push(`[Topology] Member ${memberId} refers to non-existent end node: ${member.endNode}`);
      }
      if (member.startNode === member.endNode) {
        zeroLengthMembers.push(memberId);
        errors.push(`[Topology] Member ${memberId} has identical start and end nodes (zero length).`);
      } else if (n1 && n2) {
        const len = this.calculateDistance(n1.position, n2.position);
        if (len < 0.001) {
          zeroLengthMembers.push(memberId);
          errors.push(`[Topology] Member ${memberId} length is under 1mm (${len.toFixed(4)}m).`);
        }
      }
    }

    // 3. Support verification
    const supports = this.getSupportNodes();
    if (supports.length < 2) {
      warnings.push(`[Engineering] Graph has only ${supports.length} support node(s). Minimum 2 supports required for static stability.`);
    }

    const totalLinearMeters = this.calculateLinearMeters();

    return {
      valid: errors.length === 0,
      errors,
      warnings,
      stats: {
        nodeCount: this.nodes.size,
        memberCount: this.members.size,
        connectionCount: this.connections.size,
        supportCount: supports.length,
        isolatedNodes,
        zeroLengthMembers,
        totalLinearMeters
      }
    };
  }

  /**
   * Clone graph
   */
  clone(): StructuralGraph {
    const next = new StructuralGraph();
    this.nodes.forEach((n) => next.addNode({ ...n }));
    this.members.forEach((m) => next.addMember({ ...m }));
    this.connections.forEach((c) => next.addConnection({ ...c }));
    next.metadata = { ...this.metadata };
    return next;
  }
}
