// ============================================================
// STV CLOSER — CUSTOM IDEA & DESIGN ARCHIVE SYSTEM
// design-archive.ts
// Lifecycle: SAVE → RECOVER → DUPLICATE → EDIT → VERSION → COMPARE → REUSE
// Classifications: CUSTOM, PROJECT, CANDIDATE, CATALOG
// Life-cycle Traceability: ORIGINAL → REVISION → AUDIT → APPROVAL
// ============================================================

import { TrussDNA, RoofFamily } from './truss-typologies';
import { AuditStatus, ComprehensiveAuditReport } from './structural-audit';
import { SectionProfile } from './dst.schema';

export type DesignClassification = 'CUSTOM' | 'PROJECT' | 'CANDIDATE' | 'CATALOG';

export type DesignLifecycleStatus =
  | 'DRAFT'
  | 'ORIGINAL'
  | 'REVISION'
  | 'UNDER_AUDIT'
  | 'APPROVED'
  | 'ARCHIVED';

export type CreationPath = 'CATALOG' | 'PARAMETRIC' | 'CUSTOM';

export interface ArchivedCustomNode {
  id: string;
  x: number;
  y: number;
  z: number;
  role?: 'CHORD_TOP' | 'CHORD_BOTTOM' | 'RIDGE' | 'SUPPORT' | 'HEEL' | 'WEB_NODE';
  restraints?: { fx?: boolean; fy?: boolean; fz?: boolean; mx?: boolean; my?: boolean; mz?: boolean };
}

export interface ArchivedCustomMember {
  id: string;
  startNodeId: string;
  endNodeId: string;
  role: 'CHORD_TOP' | 'CHORD_BOTTOM' | 'DIAGONAL' | 'VERTICAL' | 'STRUT' | 'TIE' | 'CUSTOM';
  sectionFamily?: string;
  sectionDesignation?: string;
  cutAngleStart?: number;
  cutAngleEnd?: number;
}

export interface ArchivedDesignItem {
  id: string;
  name: string;
  code: string;
  description: string;
  typologyId: string;
  roofFamily: RoofFamily;
  creationPath: CreationPath;
  classification: DesignClassification;
  lifecycleStatus: DesignLifecycleStatus;
  version: string;
  originId?: string; // If cloned/duplicated from another design
  versionHistory: {
    version: string;
    timestamp: string;
    author: string;
    changeNote: string;
    auditStatus?: AuditStatus;
  }[];

  parameters: {
    spanM: number;
    riseM: number;
    depthM: number;
    panelCount: number;
    roofSlopeDeg?: number;
    symmetry?: string;
    panelDistribution?: 'UNIFORM' | 'VARIABLE' | 'SYMMETRIC' | 'CENTER_DENSE' | 'EDGE_DENSE' | 'CUSTOM';
    zigzagVector?: 'LEFT_TO_RIGHT' | 'RIGHT_TO_LEFT' | 'SYMMETRIC' | 'REVERSE_AT_RIDGE' | 'CUSTOM';
    customParameters?: Record<string, number | string | boolean>;
  };

  dna: TrussDNA;

  // Custom node/member graph (optional if parametric, required if custom)
  customGraph?: {
    nodes: ArchivedCustomNode[];
    members: ArchivedCustomMember[];
  };

  profiles: {
    topChord: SectionProfile;
    bottomChord: SectionProfile;
    web: SectionProfile;
  };

  lastAudit?: {
    status: AuditStatus;
    timestamp: string;
    summary: string;
  };

  author: string;
  organization: string;
  createdAt: string;
  updatedAt: string;
  tags: string[];
}

const STORAGE_KEY = 'STV_CLOSER_DESIGN_ARCHIVE_v1';

// Seed initial default archive items representing industrial design precedents
const INITIAL_ARCHIVE: ArchivedDesignItem[] = [
  {
    id: 'ARC-001',
    name: 'Cercha Nave Logística Querétaro 24M',
    code: 'WAR-24M-LOG',
    description: 'Warren simétrica optimizada para claro de 24.0m con montantes verticales para reducción de pandeo en PTR 4x4.',
    typologyId: 'TR-01',
    roofFamily: 'DOUBLE_SLOPE',
    creationPath: 'PARAMETRIC',
    classification: 'PROJECT',
    lifecycleStatus: 'APPROVED',
    version: 'v1.2',
    versionHistory: [
      { version: 'v1.0', timestamp: '2026-01-15T10:00:00Z', author: 'Ing. R. Morales', changeNote: 'Geometría inicial paramétrica 24m' },
      { version: 'v1.1', timestamp: '2026-01-20T14:30:00Z', author: 'Ing. R. Morales', changeNote: 'Ajuste de flecha a 2.4m para cumplir L/10' },
      { version: 'v1.2', timestamp: '2026-02-02T09:15:00Z', author: 'Arq. V. STV', changeNote: 'Aprobación final de taller y soldadura AWS D1.1' }
    ],
    parameters: {
      spanM: 24.0,
      riseM: 2.4,
      depthM: 1.5,
      panelCount: 12,
      roofSlopeDeg: 11.3,
      panelDistribution: 'UNIFORM',
      zigzagVector: 'SYMMETRIC'
    },
    dna: {
      topology: 'Alternating diagonals with equal inclination angles',
      chordCount: 2,
      webPattern: 'DIAGONAL_ZIGZAG',
      verticals: true,
      symmetry: 'BILATERAL',
      panelization: 'UNIFORM',
      depth: 'PARAMETRIC',
      span: 'PARAMETRIC',
      supportModel: '2_POINT_END_BEARING',
      connectionModel: 'NODE_GUSSET_WELDED',
      notes: 'Optimizada para fabricación modular en 2 tramos de 12m'
    },
    profiles: {
      topChord: { family: 'PTR', designation: 'PTR 4x4 Cal 11', depth: { value: 0.10, unit: 'm' }, width: { value: 0.10, unit: 'm' }, thickness: { value: 0.00318, unit: 'm' }, gauge: 11 },
      bottomChord: { family: 'PTR', designation: 'PTR 4x4 Cal 11', depth: { value: 0.10, unit: 'm' }, width: { value: 0.10, unit: 'm' }, thickness: { value: 0.00318, unit: 'm' }, gauge: 11 },
      web: { family: 'PTR', designation: 'PTR 2x2 Cal 11', depth: { value: 0.05, unit: 'm' }, width: { value: 0.05, unit: 'm' }, thickness: { value: 0.00318, unit: 'm' }, gauge: 11 }
    },
    lastAudit: {
      status: 'VALIDATED',
      timestamp: '2026-02-02T09:15:00Z',
      summary: 'Todos los criterios geométricos y de taller AISC 360 validados.'
    },
    author: 'Ing. R. Morales',
    organization: 'STV Industrial Structures',
    createdAt: '2026-01-15T10:00:00Z',
    updatedAt: '2026-02-02T09:15:00Z',
    tags: ['Logística', '24M', 'Warren', 'PTR', 'Aprobado']
  },
  {
    id: 'ARC-002',
    name: 'Canopia Voladizo Aeropuerto Toluca 10M',
    code: 'CAN-10M-AERO',
    description: 'Cercha en voladizo ahusada con apoyo empotrado en columna principal y cuerdas en sección IPR.',
    typologyId: 'TR-17',
    roofFamily: 'SINGLE_SLOPE',
    creationPath: 'CUSTOM',
    classification: 'CANDIDATE',
    lifecycleStatus: 'UNDER_AUDIT',
    version: 'v2.0',
    versionHistory: [
      { version: 'v1.0', timestamp: '2026-01-28T16:00:00Z', author: 'Ing. M. Torres', changeNote: 'Propuesta preliminar 10m de vuelo libre' },
      { version: 'v2.0', timestamp: '2026-02-10T11:00:00Z', author: 'Ing. M. Torres', changeNote: 'Revisión de deflexión dinámica por succión de viento' }
    ],
    parameters: {
      spanM: 10.0,
      riseM: 1.8,
      depthM: 1.8,
      panelCount: 6,
      roofSlopeDeg: 6.0,
      panelDistribution: 'VARIABLE',
      zigzagVector: 'LEFT_TO_RIGHT'
    },
    dna: {
      topology: 'Tapered cantilever truss with high moment capacity at root and minimal tip depth',
      chordCount: 2,
      webPattern: 'TAPERED_WARREN_OR_PRATT',
      verticals: true,
      symmetry: 'NONE',
      panelization: 'VARIABLE',
      depth: 'PARAMETRIC',
      span: 'PARAMETRIC',
      supportModel: 'FIXED_ROOT_OR_DOUBLE_PINNED_MAST',
      connectionModel: 'MOMENT_FLANGE_BOLTED_CONNECTION',
      notes: 'Candidata a estandarización de canopias'
    },
    profiles: {
      topChord: { family: 'IPR', designation: 'IPR 10x4 1/4" (254x108x22.3)', depth: { value: 0.254, unit: 'm' }, width: { value: 0.108, unit: 'm' }, thickness: { value: 0.00635, unit: 'm' } },
      bottomChord: { family: 'IPR', designation: 'IPR 10x4 1/4" (254x108x22.3)', depth: { value: 0.254, unit: 'm' }, width: { value: 0.108, unit: 'm' }, thickness: { value: 0.00635, unit: 'm' } },
      web: { family: 'HSS', designation: 'HSS 4x4x1/4" (100x100x6.3)', depth: { value: 0.10, unit: 'm' }, width: { value: 0.10, unit: 'm' }, thickness: { value: 0.00635, unit: 'm' } }
    },
    lastAudit: {
      status: 'ENGINEERING_REVIEW',
      timestamp: '2026-02-10T11:00:00Z',
      summary: 'Pendiente verificación de frecuencia propia frente a ráfagas de viento ASCE 7.'
    },
    author: 'Ing. M. Torres',
    organization: 'AeroStructures Hub',
    createdAt: '2026-01-28T16:00:00Z',
    updatedAt: '2026-02-10T11:00:00Z',
    tags: ['Voladizo', 'Aeropuerto', 'IPR', 'Auditoría']
  },
  {
    id: 'ARC-003',
    name: 'Cercha Fink 18M Estándar STV',
    code: 'CAT-FINK-18M',
    description: 'Tipología Fink catalogada oficial con diagonales cortas y nudos estandarizados de placa estampada.',
    typologyId: 'TR-04',
    roofFamily: 'DOUBLE_SLOPE',
    creationPath: 'CATALOG',
    classification: 'CATALOG',
    lifecycleStatus: 'APPROVED',
    version: 'v3.0',
    versionHistory: [
      { version: 'v1.0', timestamp: '2025-06-01T08:00:00Z', author: 'STV Engineering Board', changeNote: 'Creación de catálogo maestro' },
      { version: 'v3.0', timestamp: '2026-01-10T08:00:00Z', author: 'STV Engineering Board', changeNote: 'Calibración con AISC 360-22' }
    ],
    parameters: {
      spanM: 18.0,
      riseM: 2.2,
      depthM: 1.2,
      panelCount: 12,
      roofSlopeDeg: 13.7,
      panelDistribution: 'UNIFORM',
      zigzagVector: 'SYMMETRIC'
    },
    dna: {
      topology: 'Hierarchical triangular subdivision perpendicular to rafters',
      chordCount: 2,
      webPattern: 'FINK_SUBDIVIDED',
      verticals: true,
      symmetry: 'BILATERAL',
      panelization: 'PARAMETRIC',
      depth: 'PARAMETRIC',
      span: 'PARAMETRIC',
      supportModel: '2_POINT_END_BEARING',
      connectionModel: 'PINNED_RIDGE_AND_HEEL',
      notes: 'Producto estandarizado oficial STV'
    },
    profiles: {
      topChord: { family: 'PTR', designation: 'PTR 4x4 Cal 11', depth: { value: 0.10, unit: 'm' }, width: { value: 0.10, unit: 'm' }, thickness: { value: 0.00318, unit: 'm' }, gauge: 11 },
      bottomChord: { family: 'PTR', designation: 'PTR 4x4 Cal 11', depth: { value: 0.10, unit: 'm' }, width: { value: 0.10, unit: 'm' }, thickness: { value: 0.00318, unit: 'm' }, gauge: 11 },
      web: { family: 'PTR', designation: 'PTR 2x2 Cal 11', depth: { value: 0.05, unit: 'm' }, width: { value: 0.05, unit: 'm' }, thickness: { value: 0.00318, unit: 'm' }, gauge: 11 }
    },
    lastAudit: {
      status: 'VALIDATED',
      timestamp: '2026-01-10T08:00:00Z',
      summary: 'Tipología certificada en catálogo oficial.'
    },
    author: 'STV Engineering Board',
    organization: 'STV Master Catalog',
    createdAt: '2025-06-01T08:00:00Z',
    updatedAt: '2026-01-10T08:00:00Z',
    tags: ['Catálogo', 'Fink', '18M', 'Certificada']
  }
];

// Read from storage or initialize
export function getArchivedDesigns(): ArchivedDesignItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_ARCHIVE));
      return INITIAL_ARCHIVE;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Error reading design archive:', e);
    return INITIAL_ARCHIVE;
  }
}

// Save design to archive
export function saveDesignToArchive(item: Omit<ArchivedDesignItem, 'id' | 'createdAt' | 'updatedAt' | 'versionHistory'> & { id?: string }): ArchivedDesignItem {
  const list = getArchivedDesigns();
  const now = new Date().toISOString();
  const existingIdx = item.id ? list.findIndex((x) => x.id === item.id) : -1;

  if (existingIdx >= 0) {
    // Update existing
    const existing = list[existingIdx];
    const newVersion = bumpVersion(existing.version);
    const updated: ArchivedDesignItem = {
      ...existing,
      ...item,
      id: existing.id,
      version: newVersion,
      updatedAt: now,
      versionHistory: [
        ...existing.versionHistory,
        {
          version: newVersion,
          timestamp: now,
          author: item.author || 'Current User',
          changeNote: `Actualización de diseño y parámetros (${newVersion})`,
          auditStatus: item.lastAudit?.status
        }
      ]
    };
    list[existingIdx] = updated;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    return updated;
  } else {
    // Create new
    const newId = `ARC-${String(Date.now()).slice(-6)}`;
    const newItem: ArchivedDesignItem = {
      ...item,
      id: newId,
      version: 'v1.0',
      createdAt: now,
      updatedAt: now,
      versionHistory: [
        {
          version: 'v1.0',
          timestamp: now,
          author: item.author || 'Current User',
          changeNote: 'Creación inicial en archivo de diseños STV',
          auditStatus: item.lastAudit?.status
        }
      ]
    };
    list.unshift(newItem);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    return newItem;
  }
}

// Duplicate an existing design
export function duplicateArchivedDesign(sourceId: string, newName?: string): ArchivedDesignItem | null {
  const list = getArchivedDesigns();
  const source = list.find((x) => x.id === sourceId);
  if (!source) return null;

  const now = new Date().toISOString();
  const newId = `ARC-${String(Date.now()).slice(-6)}`;
  const duplicate: ArchivedDesignItem = {
    ...JSON.parse(JSON.stringify(source)),
    id: newId,
    name: newName || `${source.name} (Copia)`,
    code: `${source.code}-CLONE`,
    originId: source.id,
    classification: 'CUSTOM',
    lifecycleStatus: 'ORIGINAL',
    version: 'v1.0',
    createdAt: now,
    updatedAt: now,
    versionHistory: [
      {
        version: 'v1.0',
        timestamp: now,
        author: 'Current User',
        changeNote: `Duplicado a partir de ${source.name} [${source.id}]`,
        auditStatus: 'REVIEW_REQUIRED'
      }
    ]
  };

  list.unshift(duplicate);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  return duplicate;
}

// Delete design
export function deleteArchivedDesign(id: string): boolean {
  const list = getArchivedDesigns();
  const filtered = list.filter((x) => x.id !== id);
  if (filtered.length === list.length) return false;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  return true;
}

// Promote Classification (e.g. CUSTOM -> CANDIDATE -> CATALOG)
export function promoteDesignClassification(id: string, targetClass: DesignClassification, authorNote: string): ArchivedDesignItem | null {
  const list = getArchivedDesigns();
  const idx = list.findIndex((x) => x.id === id);
  if (idx < 0) return null;

  const current = list[idx];
  const now = new Date().toISOString();
  const nextVer = bumpMajorVersion(current.version);

  current.classification = targetClass;
  current.version = nextVer;
  current.updatedAt = now;
  if (targetClass === 'CATALOG') current.lifecycleStatus = 'APPROVED';
  if (targetClass === 'CANDIDATE') current.lifecycleStatus = 'UNDER_AUDIT';

  current.versionHistory.push({
    version: nextVer,
    timestamp: now,
    author: 'Engineering Reviewer',
    changeNote: `Promoción de clasificación a ${targetClass}. ${authorNote}`,
    auditStatus: current.lastAudit?.status
  });

  list[idx] = current;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  return current;
}

// Version helper
function bumpVersion(ver: string): string {
  const match = ver.match(/v(\d+)\.(\d+)/);
  if (!match) return 'v1.1';
  const major = parseInt(match[1], 10);
  const minor = parseInt(match[2], 10) + 1;
  return `v${major}.${minor}`;
}

function bumpMajorVersion(ver: string): string {
  const match = ver.match(/v(\d+)\.(\d+)/);
  if (!match) return 'v2.0';
  const major = parseInt(match[1], 10) + 1;
  return `v${major}.0`;
}

// Diff comparison between two designs
export interface DesignComparisonDiff {
  designA: ArchivedDesignItem;
  designB: ArchivedDesignItem;
  differences: {
    field: string;
    valueA: string | number;
    valueB: string | number;
    status: 'SAME' | 'MODIFIED' | 'CRITICAL_CHANGE';
  }[];
}

export function compareTwoDesigns(idA: string, idB: string): DesignComparisonDiff | null {
  const list = getArchivedDesigns();
  const a = list.find((x) => x.id === idA);
  const b = list.find((x) => x.id === idB);
  if (!a || !b) return null;

  const diffs: DesignComparisonDiff['differences'] = [
    { field: 'Nombre', valueA: a.name, valueB: b.name, status: a.name === b.name ? 'SAME' : 'MODIFIED' },
    { field: 'Tipología Base', valueA: a.typologyId, valueB: b.typologyId, status: a.typologyId === b.typologyId ? 'SAME' : 'CRITICAL_CHANGE' },
    { field: 'Familia Cubierta', valueA: a.roofFamily, valueB: b.roofFamily, status: a.roofFamily === b.roofFamily ? 'SAME' : 'MODIFIED' },
    { field: 'Clasificación', valueA: a.classification, valueB: b.classification, status: a.classification === b.classification ? 'SAME' : 'MODIFIED' },
    { field: 'Versión', valueA: a.version, valueB: b.version, status: a.version === b.version ? 'SAME' : 'MODIFIED' },
    { field: 'Claro (Span)', valueA: `${a.parameters.spanM} m`, valueB: `${b.parameters.spanM} m`, status: a.parameters.spanM === b.parameters.spanM ? 'SAME' : 'CRITICAL_CHANGE' },
    { field: 'Peralte / Flecha', valueA: `${a.parameters.riseM || a.parameters.depthM} m`, valueB: `${b.parameters.riseM || b.parameters.depthM} m`, status: (a.parameters.riseM || a.parameters.depthM) === (b.parameters.riseM || b.parameters.depthM) ? 'SAME' : 'MODIFIED' },
    { field: 'Paneles', valueA: `${a.parameters.panelCount} uds`, valueB: `${b.parameters.panelCount} uds`, status: a.parameters.panelCount === b.parameters.panelCount ? 'SAME' : 'MODIFIED' },
    { field: 'Distribución Web', valueA: a.parameters.panelDistribution || 'UNIFORM', valueB: b.parameters.panelDistribution || 'UNIFORM', status: (a.parameters.panelDistribution || 'UNIFORM') === (b.parameters.panelDistribution || 'UNIFORM') ? 'SAME' : 'MODIFIED' },
    { field: 'Vector Zigzag', valueA: a.parameters.zigzagVector || 'SYMMETRIC', valueB: b.parameters.zigzagVector || 'SYMMETRIC', status: (a.parameters.zigzagVector || 'SYMMETRIC') === (b.parameters.zigzagVector || 'SYMMETRIC') ? 'SAME' : 'MODIFIED' },
    { field: 'Cuerda Superior', valueA: a.profiles.topChord.designation, valueB: b.profiles.topChord.designation, status: a.profiles.topChord.designation === b.profiles.topChord.designation ? 'SAME' : 'MODIFIED' },
    { field: 'Cuerda Inferior', valueA: a.profiles.bottomChord.designation, valueB: b.profiles.bottomChord.designation, status: a.profiles.bottomChord.designation === b.profiles.bottomChord.designation ? 'SAME' : 'MODIFIED' },
    { field: 'Almas / Celosía', valueA: a.profiles.web.designation, valueB: b.profiles.web.designation, status: a.profiles.web.designation === b.profiles.web.designation ? 'SAME' : 'MODIFIED' },
    { field: 'Estado de Auditoría', valueA: a.lastAudit?.status || 'N/A', valueB: b.lastAudit?.status || 'N/A', status: (a.lastAudit?.status || 'N/A') === (b.lastAudit?.status || 'N/A') ? 'SAME' : 'MODIFIED' }
  ];

  return {
    designA: a,
    designB: b,
    differences: diffs
  };
}
