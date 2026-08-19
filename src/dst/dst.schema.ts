// ============================================================
// STV CLOSER — DIGITAL STRUCTURAL TWIN
// dst.schema.ts
// ============================================================

export type ID = string;

export type LengthUnit = "m" | "cm" | "mm";

export interface Length {
  value: number;
  unit: LengthUnit;
}

export interface Point3D {
  x: number;
  y: number;
  z: number;
}

export interface Vector3D {
  x: number;
  y: number;
  z: number;
}

export interface Rotation3D {
  x: number;
  y: number;
  z: number;
}

// ============================================================
// PROJECT
// ============================================================

export interface DSTProject {
  id: ID;
  name: string;

  units: {
    length: LengthUnit;
  };

  geometry: ProjectGeometry;
  structuralSystem: StructuralSystem;

  columns?: ColumnDefinition[];
  roof?: RoofSystem;
  foundation?: FoundationSystem;

  members: StructuralMember[];
  nodes: StructuralNode[];
  connections: StructuralConnection[];

  audit: AuditState;
}

// ============================================================
// PROJECT GEOMETRY
// ============================================================

export interface ProjectGeometry {
  origin: Point3D;

  length: Length;
  width: Length;
  height: Length;

  grid?: StructuralGrid;
}

export interface StructuralGrid {
  axesX: string[];
  axesY: string[];

  spacingX: Length[];
  spacingY: Length[];
}

// ============================================================
// STRUCTURAL SYSTEM
// ============================================================

export interface StructuralSystem {
  columns: ColumnSystem;
  roof?: RoofSystem;
  bracing?: BracingSystem;
}

// ============================================================
// COLUMN
// ============================================================

export interface ColumnSystem {
  columns: ColumnDefinition[];
}

export interface ColumnDefinition {
  id: ID;

  base: Point3D;
  top: Point3D;

  section: SectionProfile;
  material: MaterialDefinition;

  catalogItemId?: string;
  inclination?: number;

  connectionBase?: ID;
  connectionTop?: ID;
}

// ============================================================
// ROOF
// ============================================================

export type RoofType =
  | "FLAT"
  | "SINGLE_SLOPE"
  | "DOUBLE_SLOPE"
  | "ASYMMETRIC_DOUBLE_SLOPE"
  | "BUTTERFLY"
  | "SAWTOOTH"
  | "BARREL"
  | "GABLE"
  | "HIP"
  | "CURVED"
  | "SHED"
  | "CUSTOM";

export interface RoofSystem {
  id: ID;

  type: RoofType;

  span: Length;
  width: Length;

  slope?: number;

  trusses: TrussDefinition[];
  purlins?: PurlinDefinition[];
}

// ============================================================
// TRUSS
// ============================================================

export type TrussType =
  | "WARREN"
  | "PRATT"
  | "HOWE"
  | "FINK"
  | "K_TRUSS"
  | "N_TRUSS"
  | "W_TRUSS"
  | "BALTIMORE"
  | "VIERENDEEL"
  | "POLONCEAU"
  | "BOWSTRING"
  | "SCISSORS"
  | "THREE_CHORD"
  | "SPACE_TRUSS"
  | "SPACE_TRUSS_MERO"
  | "SAWTOOTH"
  | "SHED"
  | "CANTILEVER"
  | "CUSTOM";

export interface TrussDefinition {
  id: ID;

  type: TrussType;

  span: Length;
  rise: Length;
  depth: Length;

  panelCount: number;

  panelLength?: Length;

  slope?: number;

  web: WebSystem;

  supports: SupportCondition;

  symmetry: boolean;

  zigzagDirection?: ZigzagDirection;

  curvature?: CurvatureDefinition;

  members: ID[];
  nodes: ID[];
}

// ============================================================
// WEB / ARMATURE
// ============================================================

export type WebPattern =
  | "WARREN"
  | "PRATT"
  | "HOWE"
  | "FINK"
  | "K"
  | "N"
  | "W"
  | "CUSTOM";

export type WebDistribution =
  | "UNIFORM"
  | "SYMMETRIC"
  | "ASYMMETRIC"
  | "CENTER_DENSE"
  | "EDGE_DENSE"
  | "CUSTOM";

export interface WebSystem {
  pattern: WebPattern;

  distribution: WebDistribution;

  density: number;

  angle?: number;

  verticals: boolean;
  diagonals: boolean;
  centralNode?: boolean;
}

// ============================================================
// ZIGZAG
// ============================================================

export type ZigzagDirection =
  | "LEFT_TO_RIGHT"
  | "RIGHT_TO_LEFT"
  | "SYMMETRIC"
  | "REVERSE_AT_RIDGE"
  | "CUSTOM";

// ============================================================
// CURVATURE
// ============================================================

export type CurveType =
  | "CIRCULAR"
  | "PARABOLIC"
  | "SPLINE"
  | "CUSTOM";

export interface CurvatureDefinition {
  type: CurveType;

  rise: Length;

  maximumRisePosition: number;

  controlPoints?: Point3D[];
}

// ============================================================
// SUPPORT
// ============================================================

export type SupportCondition =
  | "SIMPLE"
  | "FIXED"
  | "CANTILEVER"
  | "CUSTOM";

// ============================================================
// STRUCTURAL NODE
// ============================================================

export interface StructuralNode {
  id: ID;

  position: Point3D;

  type:
    | "JOINT"
    | "SUPPORT"
    | "RIDGE"
    | "COLUMN_BASE"
    | "COLUMN_TOP"
    | "FOUNDATION"
    | "CONNECTION";

  connectedMembers: ID[];

  support?: SupportDefinition;
}

export interface SupportDefinition {
  ux: boolean;
  uy: boolean;
  uz: boolean;

  rx: boolean;
  ry: boolean;
  rz: boolean;
}

// ============================================================
// STRUCTURAL MEMBER
// ============================================================

export type MemberRole =
  | "COLUMN"
  | "TOP_CHORD"
  | "BOTTOM_CHORD"
  | "DIAGONAL"
  | "VERTICAL"
  | "BRACING"
  | "PURLIN"
  | "GIRDER"
  | "OTHER";

export interface StructuralMember {
  id: ID;

  startNode: ID;
  endNode: ID;

  role: MemberRole;

  section: SectionProfile;
  material: MaterialDefinition;

  catalogItemId?: string;

  geometry?: MemberGeometry;

  fabrication?: FabricationData;
}

// ============================================================
// MEMBER GEOMETRY
// ============================================================

export interface MemberGeometry {
  length: Length;

  start: Point3D;
  end: Point3D;

  cutAngleStart?: number;
  cutAngleEnd?: number;
}

// ============================================================
// MATERIAL
// ============================================================

export interface MaterialDefinition {
  id: ID;
  name: string;

  grade?: string;

  fy?: number;
  fu?: number;

  density?: number;
  catalogItemId?: string;
}

// ============================================================
// SECTION
// ============================================================

export type SectionFamily =
  | "HSS"
  | "PTR"
  | "IPR"
  | "W"
  | "PIPE"
  | "C"
  | "ANGLE"
  | "PLATE"
  | "BUILT_UP"
  | "CUSTOM";

export interface SectionProfile {
  family: SectionFamily;

  designation: string;

  depth?: Length;
  width?: Length;
  thickness?: Length;

  gauge?: number;
  catalogItemId?: string;
  weightKgM?: number;
}

// ============================================================
// CONNECTION
// ============================================================

export type ConnectionType =
  | "BOLTED"
  | "WELDED"
  | "HYBRID";

export interface StructuralConnection {
  id: ID;

  type: ConnectionType;

  nodeId: ID;

  members: ID[];

  plates?: PlateDefinition[];
  bolts?: BoltDefinition[];
  welds?: WeldDefinition[];
}

// ============================================================
// FABRICATION
// ============================================================

export interface FabricationData {
  memberMark: string;

  cutLength: Length;

  cutAngleStart?: number;
  cutAngleEnd?: number;

  holes?: number;

  weldLength?: Length;

  assemblyGroup?: string;
}

// ============================================================
// PLATES / BOLTS / WELDS
// ============================================================

export interface PlateDefinition {
  id: ID;

  thickness: Length;

  width: Length;
  height: Length;
  catalogItemId?: string;
}

export interface BoltDefinition {
  diameter: Length;

  quantity: number;

  grade?: string;
  catalogItemId?: string;
}

export interface WeldDefinition {
  type: "FILLET" | "GROOVE";

  size: Length;

  length: Length;
}

// ============================================================
// PURLINS
// ============================================================

export interface PurlinDefinition {
  id: ID;

  section: SectionProfile;

  spacing: Length;

  length: Length;

  count: number;
  catalogItemId?: string;
}

// ============================================================
// BRACING
// ============================================================

export interface BracingSystem {
  members: ID[];

  pattern: string;
}

// ============================================================
// FOUNDATION
// ============================================================

export interface FoundationSystem {
  type:
    | "ISOLATED_FOOTING"
    | "STRIP_FOOTING"
    | "MAT"
    | "PILE"
    | "PEDESTAL"
    | "CUSTOM";

  elements: FoundationElement[];
}

export interface FoundationElement {
  id: ID;

  position: Point3D;

  width: Length;
  length: Length;
  depth: Length;

  concreteStrength?: number;

  anchorBolts?: BoltDefinition[];

  basePlate?: PlateDefinition;
  catalogItemId?: string;
}

// ============================================================
// AUDIT
// ============================================================

export type AuditStatus =
  | "VALIDATED"
  | "FAILED"
  | "REVIEW_REQUIRED"
  | "DATA_REQUIRED"
  | "FABRICATION_REVIEW"
  | "ENGINEERING_REVIEW"
  | "INVALID_CONFIGURATION";

export interface AuditState {
  status: AuditStatus;

  messages: AuditMessage[];

  timestamp?: string;
}

export interface AuditMessage {
  severity: "INFO" | "WARNING" | "ERROR";

  code: string;

  message: string;

  elementIds?: ID[];
}
