/**
 * STV CLOSER — DIGITAL STRUCTURAL TWIN (DST) MASTER SCHEMA CONTRACT
 * Standardized data contracts for Structural Nodes, Members, Connections,
 * Engineering Loads, Support Reactions, and Fabrication Metadata.
 * 
 * "El DST no guarda solamente una imagen de la estructura. Guarda su identidad estructural."
 */

export type ID = string;

export interface Vec3 {
  x: number;
  y: number;
  z: number;
}

export type StructuralStatus =
  | "VALIDATED"
  | "REVIEW_REQUIRED"
  | "DATA_REQUIRED"
  | "FABRICATION_REVIEW"
  | "ENGINEERING_REVIEW"
  | "INVALID_CONFIGURATION";

export type MemberFamily =
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

export type TrussTypology =
  | "WARREN"
  | "PRATT"
  | "HOWE"
  | "FINK"
  | "K"
  | "N"
  | "W"
  | "BALTIMORE"
  | "VIERENDEEL"
  | "POLONCEAU"
  | "BOWSTRING"
  | "SCISSORS"
  | "THREE_CHORD"
  | "SPACE_TRUSS"
  | "CANTILEVER"
  | "CUSTOM";

export interface SupportCondition {
  type: "PIN" | "ROLLER" | "FIXED" | "FREE" | "CUSTOM";
  restraints: {
    x: boolean;
    y: boolean;
    z: boolean;
    rx: boolean;
    ry: boolean;
    rz: boolean;
  };
}

export interface StructuralNode {
  id: ID;
  position: Vec3;
  support?: SupportCondition;
  tags?: string[];
  connectedMembers?: ID[];
  status?: StructuralStatus;
}

export interface MemberProfile {
  designation: string;
  family?: MemberFamily;
  depthMm?: number;
  widthMm?: number;
  thicknessMm?: number;
  areaCm2?: number;
  linearWeightKgM?: number;
  IxCm4?: number;
  IyCm4?: number;
  SxCm3?: number;
  SyCm3?: number;
  ZxCm3?: number;
  ZyCm3?: number;
  rxCm?: number;
  ryCm?: number;
  JCm4?: number;
}

export interface MemberMaterial {
  specification: string;
  FyMPa?: number;
  FuMPa?: number;
  elasticModulusGPa?: number;
  shearModulusGPa?: number;
  densityKgM3?: number;
  poissonRatio?: number;
}

export interface MemberFabrication {
  cutLengthM?: number;
  cutAngleStartDeg?: number;
  cutAngleEndDeg?: number;
  bevelType?: "SQUARE" | "SINGLE_BEVEL" | "DOUBLE_BEVEL" | "MITER_45";
  holesCount?: number;
  weldRequired?: boolean;
  assemblyMark?: string;
  notes?: string;
}

export interface StructuralMember {
  id: ID;
  startNode: ID;
  endNode: ID;
  family: MemberFamily;
  profile: MemberProfile;
  material: MemberMaterial;
  role:
    | "TOP_CHORD"
    | "BOTTOM_CHORD"
    | "WEB"
    | "VERTICAL"
    | "BRACING"
    | "COLUMN"
    | "PURLIN"
    | "BEAM"
    | "OTHER";
  fabrication?: MemberFabrication;
  status?: StructuralStatus;
  demandCapacityRatio?: number;
}

export interface StructuralConnection {
  id: ID;
  nodeId: ID;
  type: "BOLTED" | "WELDED" | "HYBRID";
  connectedMembers: ID[];
  plates?: {
    id: string;
    thicknessMm: number;
    widthMm: number;
    lengthMm: number;
    materialSpec: string;
  }[];
  bolts?: {
    diameterMm: number;
    quantity: number;
    grade: string;
    lengthMm?: number;
    pattern?: "2x2" | "2x4" | "CIRCULAR" | "LINEAR";
  }[];
  welds?: {
    type: "FILLET" | "GROOVE" | "BEVEL";
    sizeMm?: number;
    lengthMm?: number;
    electrode?: "E70XX" | "E60XX" | "E7018";
  }[];
  status?: StructuralStatus;
}

export type LoadCaseType =
  | "DEAD"
  | "LIVE"
  | "ROOF_LIVE"
  | "WIND"
  | "SEISMIC"
  | "SNOW"
  | "OTHER";

export interface LoadItem {
  nodeId?: ID;
  memberId?: ID;
  direction: Vec3;
  magnitude: number;
  units: "kN" | "kN/m" | "kg/m2" | "N";
}

export interface LoadCase {
  id: string;
  type: LoadCaseType;
  description: string;
  loads: LoadItem[];
}

export interface LoadCombinationFactor {
  loadCaseId: string;
  factor: number;
}

export interface LoadCombination {
  id: string;
  name: string;
  factors: LoadCombinationFactor[];
  normativeReference: "ASCE 7-22" | "AISC 360-16 ASD" | "AISC 360-16 LRFD" | "RCDF/NTC 2023";
}

export interface SupportReaction {
  supportNodeId: ID;
  FxKN: number;
  FyKN: number; // Vertical reaction (gravity or uplift)
  FzKN: number;
  MxKNm: number;
  MyKNm: number;
  MzKNm: number;
  loadCombinationId: string;
  status: StructuralStatus;
}

export interface MaterialSelectorHub {
  elementId: string;
  selectedFamily: MemberFamily;
  selectedDesignation: string;
  availableGauges: {
    label: string;
    thicknessMm: number;
    weightPerMeter: number;
  }[];
  activeGaugeIndex: number;
  cutAngleStartDeg: number;
  cutAngleEndDeg: number;
}

export interface MemberScheduleItem {
  code: string;
  role: StructuralMember["role"];
  family: MemberFamily;
  designation: string;
  quantity: number;
  unitLengthM: number;
  totalLinearMeters: number;
  unitWeightKgM: number;
  totalWeightKg: number;
  cutStartDeg: number;
  cutEndDeg: number;
  connectionType: string;
}

export interface DSTProject {
  id: string;
  title: string;
  typology: TrussTypology;
  status: StructuralStatus;
  createdAt: string;
  updatedAt: string;
}
