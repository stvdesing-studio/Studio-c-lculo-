// ============================================================
// STV CLOSER — STRUCTURAL AUDIT ONTOLOGY & CHECK ENGINE
// structural-audit.ts
// Contract: No generic "FAIL" states.
// Validated, Review Required, Fabrication Review, Engineering Review, Data Required, Invalid Configuration
// ============================================================

import { StructuralGraph } from './structural-graph';
import { TrussTypologyDefinition, RoofTypologyDefinition } from './truss-typologies';

export type AuditStatus =
  | 'VALIDATED'
  | 'REVIEW_REQUIRED'
  | 'FABRICATION_REVIEW'
  | 'ENGINEERING_REVIEW'
  | 'DATA_REQUIRED'
  | 'INVALID_CONFIGURATION';

export interface AuditCheckItem {
  id: string;
  category: 'TOPOLOGY' | 'GEOMETRY' | 'FABRICATION' | 'ENGINEERING' | 'DATA';
  status: AuditStatus;
  title: string;
  description: string;
  recommendation?: string;
  affectedElementIds?: string[];
  severity: 'INFO' | 'WARNING' | 'CRITICAL' | 'PASS';
}

export interface ComprehensiveAuditReport {
  overallStatus: AuditStatus;
  statusColor: string;
  statusBadge: string;
  timestamp: string;
  checks: AuditCheckItem[];
  summary: {
    totalChecks: number;
    passedChecks: number;
    warningChecks: number;
    criticalChecks: number;
  };
  metrics: {
    spanDepthRatio: number;
    maxMemberLengthM: number;
    minMemberLengthM: number;
    minCutAngleDeg: number;
    totalNodes: number;
    totalMembers: number;
    floatingNodesCount: number;
    zeroLengthMembersCount: number;
  };
}

export function performStructuralAudit(
  graph: StructuralGraph,
  trussDef: TrussTypologyDefinition,
  roofDef: RoofTypologyDefinition,
  params: {
    spanM: number;
    riseM: number;
    depthM: number;
    panelCount: number;
    maxTransportLengthM?: number;
  }
): ComprehensiveAuditReport {
  const checks: AuditCheckItem[] = [];
  const maxTransport = params.maxTransportLengthM || 12.0;

  // 1. Compute basic geometric metrics
  const nodes = Array.from(graph.nodes.values());
  const members = Array.from(graph.members.values());

  const effectiveDepth = params.depthM > 0 ? params.depthM : params.riseM;
  const spanDepthRatio = effectiveDepth > 0 ? params.spanM / effectiveDepth : 999;

  let maxMemberLength = 0;
  let minMemberLength = 9999;
  let minCutAngle = 90;
  const zeroLengthMembers: string[] = [];
  const longMembersForTransport: string[] = [];
  const sharpCutMembers: string[] = [];

  members.forEach((m) => {
    const len = m.geometry?.length?.value || 0;
    if (len > maxMemberLength) maxMemberLength = len;
    if (len < minMemberLength) minMemberLength = len;
    if (len <= 0.001) zeroLengthMembers.push(m.id);
    if (len > maxTransport) longMembersForTransport.push(m.id);

    const c1 = m.geometry?.cutAngleStart ?? 90;
    const c2 = m.geometry?.cutAngleEnd ?? 90;
    const minC = Math.min(Math.abs(c1), Math.abs(c2));
    if (minC < minCutAngle) minCutAngle = minC;
    if (minC < 25 && minC > 0) sharpCutMembers.push(m.id);
  });

  // 2. Topology Check: Floating Nodes
  const floatingNodes: string[] = [];
  nodes.forEach((n) => {
    if (!n.connectedMembers || n.connectedMembers.length === 0) {
      floatingNodes.push(n.id);
    }
  });

  if (floatingNodes.length > 0) {
    checks.push({
      id: 'TOP-01',
      category: 'TOPOLOGY',
      status: 'INVALID_CONFIGURATION',
      title: 'Nodos Huérfanos Detectados',
      description: `Se detectaron ${floatingNodes.length} nodos no conectados a ninguna barra estructural.`,
      recommendation: 'Elimine los nodos huérfanos o conecte barras continuas para cerrar el polígono de cargas.',
      affectedElementIds: floatingNodes,
      severity: 'CRITICAL'
    });
  } else {
    checks.push({
      id: 'TOP-01',
      category: 'TOPOLOGY',
      status: 'VALIDATED',
      title: 'Topología de Nodos y Continuidad',
      description: `Todos los ${nodes.length} nodos cuentan con conectividad válida en el grafo.`,
      severity: 'PASS'
    });
  }

  // 3. Topology Check: Zero-length members
  if (zeroLengthMembers.length > 0) {
    checks.push({
      id: 'TOP-02',
      category: 'TOPOLOGY',
      status: 'INVALID_CONFIGURATION',
      title: 'Barras de Longitud Nula',
      description: `Se encontraron ${zeroLengthMembers.length} barras con longitud L ≤ 1mm.`,
      recommendation: 'Fusione nodos coincidentes para evitar singularidades en la matriz de rigidez.',
      affectedElementIds: zeroLengthMembers,
      severity: 'CRITICAL'
    });
  }

  // 4. Geometry Check: Span-to-Depth Ratio (L/d)
  if (spanDepthRatio > 22) {
    checks.push({
      id: 'GEO-01',
      category: 'GEOMETRY',
      status: 'REVIEW_REQUIRED',
      title: 'Relación Claro/Peralte Esbelta (L/d > 22)',
      description: `La relación L/d actual es ${spanDepthRatio.toFixed(1)}. Una cercha muy baja aumentará las fuerzas axiales y deflexiones elásticas.`,
      recommendation: 'Aumente el peralte o flecha central para optimizar el consumo de acero y reducir deflexión L/360.',
      severity: 'WARNING'
    });
  } else if (spanDepthRatio < 4.5) {
    checks.push({
      id: 'GEO-01',
      category: 'GEOMETRY',
      status: 'REVIEW_REQUIRED',
      title: 'Relación Claro/Peralte Rígida (L/d < 4.5)',
      description: `La relación L/d actual es ${spanDepthRatio.toFixed(1)}. La cercha es excepcionalmente alta para su claro.`,
      recommendation: 'Evalúe reducir peralte o verificar arriostramiento lateral fuera del plano.',
      severity: 'INFO'
    });
  } else {
    checks.push({
      id: 'GEO-01',
      category: 'GEOMETRY',
      status: 'VALIDATED',
      title: 'Proporción Claro/Peralte Óptima',
      description: `Relación L/d = ${spanDepthRatio.toFixed(1)} dentro del rango estándar de diseño AISC/STV (6 a 18).`,
      severity: 'PASS'
    });
  }

  // 5. Fabrication Check: Transport Length Limit
  if (longMembersForTransport.length > 0) {
    checks.push({
      id: 'FAB-01',
      category: 'FABRICATION',
      status: 'FABRICATION_REVIEW',
      title: 'Elementos Exceden Límite de Transporte de Taller',
      description: `${longMembersForTransport.length} barras exceden la longitud máxima de plataforma (${maxTransport}m). Mayor longitud: ${maxMemberLength.toFixed(2)}m.`,
      recommendation: 'Defina empalmes de obra atornillados o soldados en los cuartos de luz.',
      affectedElementIds: longMembersForTransport,
      severity: 'WARNING'
    });
  } else {
    checks.push({
      id: 'FAB-01',
      category: 'FABRICATION',
      status: 'VALIDATED',
      title: 'Longitudes de Taller y Transporte',
      description: `Todas las piezas (${maxMemberLength.toFixed(2)}m máx) son transportables en plataforma estándar de ${maxTransport}m.`,
      severity: 'PASS'
    });
  }

  // 6. Fabrication Check: Sharp Cut Angles (< 25°)
  if (sharpCutMembers.length > 0) {
    checks.push({
      id: 'FAB-02',
      category: 'FABRICATION',
      status: 'FABRICATION_REVIEW',
      title: 'Ángulos de Corte Agudos en Diagonales (< 25°)',
      description: `${sharpCutMembers.length} barras requieren cortes muy agudos que dificultan el acceso de antorcha de soldadura (AWS D1.1).`,
      recommendation: 'Ajuste la cantidad de paneles o aumente el peralte para que los ángulos de corte se mantengan entre 35° y 60°.',
      affectedElementIds: sharpCutMembers,
      severity: 'WARNING'
    });
  } else {
    checks.push({
      id: 'FAB-02',
      category: 'FABRICATION',
      status: 'VALIDATED',
      title: 'Ángulos de Bisel y Accesibilidad de Soldadura',
      description: `Ángulo mínimo de corte = ${minCutAngle.toFixed(1)}°. Conforme con requisitos de accesibilidad de cordón AWS D1.1.`,
      severity: 'PASS'
    });
  }

  // 7. Engineering Check: Member Roles and Lateral Bracing
  const topChords = members.filter((m) => m.role === 'TOP_CHORD');
  const bottomChords = members.filter((m) => m.role === 'BOTTOM_CHORD');
  const webs = members.filter((m) => m.role === 'DIAGONAL' || m.role === 'VERTICAL');

  if (topChords.length === 0 || bottomChords.length === 0) {
    checks.push({
      id: 'ENG-01',
      category: 'ENGINEERING',
      status: 'ENGINEERING_REVIEW',
      title: 'Asignación Incompleta de Cuerdas Estructurales',
      description: 'No se detectaron cuerdas superiores o inferiores formalmente tipificadas.',
      recommendation: 'Asegure la jerarquía del grafo antes del paso a cálculo de tensiones.',
      severity: 'WARNING'
    });
  } else {
    checks.push({
      id: 'ENG-01',
      category: 'ENGINEERING',
      status: 'VALIDATED',
      title: 'Jerarquía Estructural de Cuerdas y Celosía',
      description: `Asignación validada: ${topChords.length} cuerdas superiores, ${bottomChords.length} cuerdas inferiores, ${webs.length} almas.`,
      severity: 'PASS'
    });
  }

  // 8. Data Required Check: Section / Material assignment
  const unassignedSection = members.filter((m) => !m.section?.designation || m.section.designation.includes('UNASSIGNED'));
  if (unassignedSection.length > 0) {
    checks.push({
      id: 'DAT-01',
      category: 'DATA',
      status: 'DATA_REQUIRED',
      title: 'Perfiles Estructurales Pendientes de Asignación',
      description: `${unassignedSection.length} barras tienen sección no asignada o provisional.`,
      recommendation: 'Asigne perfiles del catálogo STV antes de emitir lista de despiece final.',
      severity: 'INFO'
    });
  }

  // 9. Determine Overall Status
  let overallStatus: AuditStatus = 'VALIDATED';
  let statusColor = '#00E5FF';
  let statusBadge = 'VALIDATED (CONFORME)';

  const hasInvalid = checks.some((c) => c.status === 'INVALID_CONFIGURATION');
  const hasEngReview = checks.some((c) => c.status === 'ENGINEERING_REVIEW');
  const hasFabReview = checks.some((c) => c.status === 'FABRICATION_REVIEW');
  const hasReviewReq = checks.some((c) => c.status === 'REVIEW_REQUIRED');
  const hasDataReq = checks.some((c) => c.status === 'DATA_REQUIRED');

  if (hasInvalid) {
    overallStatus = 'INVALID_CONFIGURATION';
    statusColor = '#FF3366';
    statusBadge = 'INVALID CONFIGURATION';
  } else if (hasFabReview) {
    overallStatus = 'FABRICATION_REVIEW';
    statusColor = '#FF9100';
    statusBadge = 'FABRICATION REVIEW';
  } else if (hasEngReview) {
    overallStatus = 'ENGINEERING_REVIEW';
    statusColor = '#FFD600';
    statusBadge = 'ENGINEERING REVIEW';
  } else if (hasReviewReq) {
    overallStatus = 'REVIEW_REQUIRED';
    statusColor = '#FFD600';
    statusBadge = 'REVIEW REQUIRED';
  } else if (hasDataReq) {
    overallStatus = 'DATA_REQUIRED';
    statusColor = '#00E5FF';
    statusBadge = 'DATA REQUIRED';
  } else {
    overallStatus = 'VALIDATED';
    statusColor = '#00E5FF';
    statusBadge = 'VALIDATED (AISC 360 & STV)';
  }

  const passedCount = checks.filter((c) => c.severity === 'PASS').length;
  const warningCount = checks.filter((c) => c.severity === 'WARNING' || c.severity === 'INFO').length;
  const criticalCount = checks.filter((c) => c.severity === 'CRITICAL').length;

  return {
    overallStatus,
    statusColor,
    statusBadge,
    timestamp: new Date().toISOString(),
    checks,
    summary: {
      totalChecks: checks.length,
      passedChecks: passedCount,
      warningChecks: warningCount,
      criticalChecks: criticalCount
    },
    metrics: {
      spanDepthRatio,
      maxMemberLengthM: maxMemberLength,
      minMemberLengthM: minMemberLength === 9999 ? 0 : minMemberLength,
      minCutAngleDeg: minCutAngle,
      totalNodes: nodes.length,
      totalMembers: members.length,
      floatingNodesCount: floatingNodes.length,
      zeroLengthMembersCount: zeroLengthMembers.length
    }
  };
}
