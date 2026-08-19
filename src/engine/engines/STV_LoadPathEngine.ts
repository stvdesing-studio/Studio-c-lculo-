/**
 * STV CLOSER SYSTEM — LOAD PATH ENGINE
 * Explicit, auditable graph of force transmission from load origin to soil interface.
 * "Ninguna carga puede desaparecer, aparecer espontáneamente ni saltar sin relación explícita."
 */

import { LoadPathTransfer, SpatialNode, SpatialMember, ColumnReaction } from '../../types/stv';

export interface LoadOrigin {
  id: string;
  type: 'ROOF' | 'CLADDING' | 'EQUIPMENT' | 'WIND_PRESSURE' | 'SEISMIC_LATERAL';
  loadCase: 'DEAD' | 'LIVE' | 'WIND' | 'SEISMIC';
  magnitudeKPa: number;
  tributaryAreaM2: number;
  totalForceKN: number;
}

export interface LoadPathResult {
  loadPathId: string;
  origin: LoadOrigin;
  elementsInvolved: string[];
  nodesInvolved: string[];
  transfers: LoadPathTransfer[];
  terminalSupport: string;
  status: 'RESOLVED' | 'PENDING' | 'BROKEN' | 'UNSTABLE';
  blockingReason?: string;
}

export class STV_LoadPathEngine {
  /**
   * Builds the comprehensive load path graph for the structural system
   */
  public static traceLoadPaths(
    nodes: SpatialNode[],
    members: SpatialMember[],
    columns: ColumnReaction[],
    deadLoadKPa: number = 0.35, // 35 kg/m2 standard roof
    liveLoadKPa: number = 0.40, // 40 kg/m2 maintenance live load
    windSpeedKmh: number = 120   // 120 km/h wind design
  ): {
    loadPaths: LoadPathResult[];
    totalAppliedLoadKN: { dead: number; live: number; wind: number };
    totalReactionsKN: { dead: number; live: number; wind: number };
    isEquilibriumSatisfied: boolean;
    unresolvedCount: number;
  } {
    const loadPaths: LoadPathResult[] = [];
    let totalDeadApplied = 0;
    let totalLiveApplied = 0;
    let totalWindApplied = 0;

    // Wind pressure by ASCE 7-16 simplified: qz = 0.0000613 * V^2 (kN/m2)
    const windPressureKPa = (0.0000613 * Math.pow(windSpeedKmh, 2) * 1.15); // ~ 1.01 kPa

    // For each column / support tributary zone, trace the full continuous load path
    columns.forEach((col, idx) => {
      const colTribArea = col.tributaryAreaM2;
      const deadForce = colTribArea * deadLoadKPa;
      const liveForce = colTribArea * liveLoadKPa;
      const windForce = colTribArea * windPressureKPa * 0.75; // shape factor

      totalDeadApplied += deadForce;
      totalLiveApplied += liveForce;
      totalWindApplied += windForce;

      const pathId = `LP-TRUSS-COL-${String(idx + 1).padStart(3, '0')}`;
      const colNode = nodes.find(n => Math.abs(n.x - col.position[0]) < 0.1 && Math.abs(n.z - col.position[2]) < 0.1 && n.y > 0.5);
      const baseNode = nodes.find(n => Math.abs(n.x - col.position[0]) < 0.1 && Math.abs(n.z - col.position[2]) < 0.1 && n.y <= 0.1);

      const topNodeId = colNode ? colNode.id : `N-ROOF-${idx + 1}`;
      const baseNodeId = baseNode ? baseNode.id : `N-BASE-${idx + 1}`;

      const transfers: LoadPathTransfer[] = [
        {
          transferId: `TR-${idx}-01`,
          from: 'CUBIERTA_LAMINA',
          throughNode: topNodeId,
          to: 'CORREAS_MONTEN_C',
          mechanism: 'NODAL_TRANSFER',
          actionKN: parseFloat((deadForce + liveForce).toFixed(2)),
          status: 'RESOLVED'
        },
        {
          transferId: `TR-${idx}-02`,
          from: 'CORREAS_MONTEN_C',
          throughNode: topNodeId,
          to: 'CERCHA_CORDONES_DIAGONALES',
          mechanism: 'NODAL_TRANSFER',
          actionKN: parseFloat((deadForce + liveForce).toFixed(2)),
          status: 'RESOLVED'
        },
        {
          transferId: `TR-${idx}-03`,
          from: 'CERCHA_CORDONES_DIAGONALES',
          throughNode: topNodeId,
          to: col.columnId,
          mechanism: 'MOMENT_CONTINUITY',
          actionKN: parseFloat((deadForce + liveForce + windForce * 0.3).toFixed(2)),
          status: 'RESOLVED'
        },
        {
          transferId: `TR-${idx}-04`,
          from: col.columnId,
          throughNode: baseNodeId,
          to: 'PLACA_BASE_A36',
          mechanism: 'BASE_PLATE',
          actionKN: col.factoredAxialKN,
          status: 'RESOLVED'
        },
        {
          transferId: `TR-${idx}-05`,
          from: 'PLACA_BASE_A36',
          throughNode: baseNodeId,
          to: 'PERNOS_ANCLAJE_M20',
          mechanism: 'ANCHOR_BOLTS',
          actionKN: parseFloat((col.shearXKN + col.upliftKN).toFixed(2)),
          status: 'RESOLVED'
        },
        {
          transferId: `TR-${idx}-06`,
          from: 'PLACA_BASE_A36',
          throughNode: baseNodeId,
          to: 'PEDESTAL_CONCRETO_F250',
          mechanism: 'CONCRETE_INTERFACE',
          actionKN: col.factoredAxialKN,
          status: 'RESOLVED'
        },
        {
          transferId: `TR-${idx}-07`,
          from: 'PEDESTAL_CONCRETO_F250',
          throughNode: `ZAPATA-${col.gridRef}`,
          to: 'ESTRATO_COMPETENTE_SUELO',
          mechanism: 'CONCRETE_INTERFACE',
          actionKN: col.factoredAxialKN,
          status: col.footing.passed ? 'RESOLVED' : 'PENDING'
        }
      ];

      loadPaths.push({
        loadPathId: pathId,
        origin: {
          id: `ORIGIN-ZONE-${col.gridRef}`,
          type: 'ROOF',
          loadCase: 'DEAD',
          magnitudeKPa: deadLoadKPa + liveLoadKPa,
          tributaryAreaM2: colTribArea,
          totalForceKN: parseFloat((deadForce + liveForce).toFixed(2))
        },
        elementsInvolved: ['CUBIERTA', 'MONTEN_C', 'TRUSS_SYSTEM', col.columnId, 'BASE_PLATE', 'PEDESTAL', `ZAPATA_${col.gridRef}`],
        nodesInvolved: [topNodeId, baseNodeId, `FOOTING_${col.gridRef}`],
        transfers,
        terminalSupport: `SUPPORT_${col.gridRef}`,
        status: col.footing.passed ? 'RESOLVED' : 'PENDING'
      });
    });

    const totalDeadReactions = columns.reduce((sum, c) => sum + c.deadLoadKN, 0);
    const totalLiveReactions = columns.reduce((sum, c) => sum + c.liveLoadKN, 0);
    const totalWindReactions = columns.reduce((sum, c) => sum + c.windLoadKN, 0);

    const isEquilibriumSatisfied = Math.abs(totalDeadApplied - totalDeadReactions) < 2.0;

    return {
      loadPaths,
      totalAppliedLoadKN: {
        dead: parseFloat(totalDeadApplied.toFixed(2)),
        live: parseFloat(totalLiveApplied.toFixed(2)),
        wind: parseFloat(totalWindApplied.toFixed(2))
      },
      totalReactionsKN: {
        dead: parseFloat(totalDeadReactions.toFixed(2)),
        live: parseFloat(totalLiveReactions.toFixed(2)),
        wind: parseFloat(totalWindReactions.toFixed(2))
      },
      isEquilibriumSatisfied,
      unresolvedCount: loadPaths.filter(lp => lp.status !== 'RESOLVED').length
    };
  }
}
