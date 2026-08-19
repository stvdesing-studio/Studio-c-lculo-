/**
 * STV CLOSER SYSTEM — CORE TYPES & SCHEMAS
 * Structural Technical Visualization & Spatial Engineering Digital Twin
 */

export type ValidationStatus = 'SOURCE_VALIDATED' | 'PARTIAL_SOURCE' | 'PENDING_VALIDATION' | 'CALCULATING' | 'FAILED' | 'BLOCKED';

export type StructuralFamilyId = 
  | 'F01_PRATT_PLANAR'
  | 'F02_SPACE_TRUSS_3D'
  | 'F03_ARCH_THREE_CHORD'
  | 'F04_VELARIA_TENSIONED_ARCH'
  | 'F05_RIGID_FRAME_IPR';

export type LoadCaseType = 'DEAD' | 'LIVE' | 'WIND' | 'SEISMIC' | 'EQUIPMENT';

export type SupportType = 'PIN' | 'ROLLER' | 'FIXED' | 'CUSTOM';

export interface CommercialMetadata {
  sku: string;
  nombre: string;
  designacionEstandar: string;
  familia: string;
  codigoClasificacion: string;
  descripcion: string;
  unidadVenta: string;
  longitudM: number;
  pesoLinealKgM: number;
  pesoTotalTramoKg: number;
  precioUnitarioMXN: number;
  acabadoProtector: string;
}

export interface SectionGeometry {
  depthMm: number;
  widthMm: number;
  wallThicknessMm: number;
  flangeThicknessMm?: number;
  webThicknessMm?: number;
  filletRadiusMm?: number;
  kDistanceMm?: number;
  areaCm2: number;
}

export interface MechanicalProperties {
  especificacionASTM: string;
  FyMPa: number;
  FuMPa: number;
  EGPa: number;
  GGPa: number;
  poisson: number;
  densityKgM3: number;
}

export interface SectionProperties {
  IxCm4: number;
  IyCm4: number;
  SxCm3: number;
  SyCm3: number;
  ZxCm3: number;
  ZyCm3: number;
  rxCm: number;
  ryCm: number;
  JCm4: number;
  CwCm6?: number;
}

export interface StabilityClassification {
  flexion: 'Compacta' | 'No Compacta' | 'Esbelta';
  compresion: 'No esbelta' | 'Esbelta';
  lambdaFlange?: number;
  lambdaWeb?: number;
}

export interface SSKCEntity {
  id: string;
  code: string;
  designation: string;
  validationStatus: ValidationStatus;
  commercial: CommercialMetadata;
  geometry: SectionGeometry;
  material: MechanicalProperties;
  sectionProperties: SectionProperties;
  stability: StabilityClassification;
  roles: string[];
  loadModes: string[];
  connectionInterfaces: string[];
  normativeReferences: string[];
}

export interface SpatialNode {
  id: string;
  name: string;
  x: number;
  y: number;
  z: number;
  connectedElements: string[];
  supportCondition?: SupportType;
  tributaryAreaM2?: number;
  appliedLoadKN?: {
    dead: number;
    live: number;
    wind: number;
  };
}

export interface SpatialMember {
  id: string;
  name: string;
  startNodeId: string;
  endNodeId: string;
  profileId: string;
  role: 'TOP_CHORD' | 'BOTTOM_CHORD' | 'THIRD_CHORD' | 'DIAGONAL' | 'VERTICAL' | 'COLUMN' | 'MAIN_BEAM' | 'PURLIN' | 'BRACING' | 'ARCH_CHORD' | 'CABLE' | 'PEDESTAL';
  lengthM: number;
  weightKg: number;
  axialDemandKN?: number;
  axialCapacityKN?: number;
  utilizationRatio?: number;
  status?: 'VALIDATED' | 'REVIEW' | 'CRITICAL' | 'PENDING';
}

export interface ColumnReaction {
  columnId: string;
  gridRef: string;
  position: [number, number, number];
  tributaryAreaM2: number;
  deadLoadKN: number;
  liveLoadKN: number;
  windLoadKN: number;
  factoredAxialKN: number;
  shearXKN: number;
  shearZKN: number;
  momentXKNm: number;
  momentZKNm: number;
  upliftKN: number;
  basePlate: {
    dimensionsMm: [number, number];
    thicknessMm: number;
    boltCount: number;
    boltDiameterMm: number;
    boltGrade: string;
  };
  pedestal: {
    widthMm: number;
    lengthMm: number;
    heightMm: number;
    fckMPa: number;
  };
  footing: {
    type: string;
    widthM: number;
    lengthM: number;
    depthM: number;
    thicknessM: number;
    soilPressureRealKPa: number;
    soilPressureAdmKPa: number;
    slidingSafetyFactor: number;
    overturningSafetyFactor: number;
    passed: boolean;
  };
}

export interface LoadPathTransfer {
  transferId: string;
  from: string;
  throughNode: string;
  to: string;
  mechanism: 'NODAL_TRANSFER' | 'MOMENT_CONTINUITY' | 'SHEAR_TAB' | 'BASE_PLATE' | 'ANCHOR_BOLTS' | 'CONCRETE_INTERFACE' | 'CABLE_TENSION';
  actionKN: number;
  status: 'RESOLVED' | 'PENDING' | 'BROKEN' | 'UNSTABLE';
}

export interface GeotechnicalParameters {
  soilType: string;
  bearingCapacityKPa: number;
  soilUnitWeightKNm3: number;
  frictionAngleDeg: number;
  cohesionKPa: number;
  frictionCoefficient: number;
  groundwaterDepthM: number;
  allowableSettlementMm: number;
  competentStrataDepthM: number;
  validationStatus: 'VALIDATED' | 'PENDING_SURVEY' | 'ESTIMATED';
}

export interface STVAuditReport {
  timestamp: string;
  overallStatus: 'PASS' | 'PENDING' | 'FAIL' | 'BLOCKED';
  summary: string;
  questions: {
    question: string;
    passed: boolean;
    evidence: string;
    details: string;
  }[];
  errors: string[];
  warnings: string[];
  pendingItems: string[];
  traceabilityChain: string[];
}

export type WorkspaceScreenId = 
  | 'WORKSPACE_3D_VIEW'
  | 'WORKSPACE_FOUNDATION'
  | 'WORKSPACE_COLUMNS'
  | 'WORKSPACE_ROOFS'
  | 'WORKSPACE_PURLINS'
  | 'WORKSPACE_FABRICATION'
  | 'WORKSPACE_AUDIT';

export interface MaterialSelectorHub {
  elementId: string;
  selectedFamily: 'HSS' | 'PTR' | 'IPR' | 'CHANNEL_C' | 'ANGLE';
  selectedDesignation: string;
  availableGauges: {
    label: string;
    thicknessMm: number;
    weightPerMeter: number;
  }[];
  activeGaugeIndex: number;
  cutAngleStart: number;
  cutAngleEnd: number;
}

export interface ColumnStudioConfig {
  countX: number;
  countY: number;
  spacingXM: number;
  spacingYM: number;
  heightM: number;
  profileId: string;
  gauge: string;
  supportCondition: SupportType;
  tiltAngleDeg: number; // For sculptural / V-shape inclined columns
  columnOrientationDeg: number; // 0 or 90 rotation of HSS/IPR
  basePlateGrade: string;
  anchorDiameterMm: number;
  anchorCount: number;
  pedestalHeightM: number;
}

export interface RoofTrussStudioConfig {
  familyId: StructuralFamilyId;
  spanM: number;
  riseM: number;
  depthM: number;
  modulesCount: number;
  trussCount: number;
  trussSpacingM: number;
  chordProfileId: string;
  chordGauge: string;
  webProfileId: string;
  webGauge: string;
  purlinProfileId: string;
  purlinGauge: string;
  purlinSpacingM: number;
  inclinationAngleDeg: number;
  webPattern: 'PRATT_ZIGZAG' | 'WARREN' | 'HOWE' | 'CROSS_X' | 'THREE_CHORD_SPACE';
  overhangM: number;
}

export interface FoundationStudioConfig {
  normativeCode: 'ACI_318_19' | 'NTC_CONCRETO_2023' | 'EUROCODE_2' | 'ASCE_7_16';
  footingType: 'ISOLATED_SQUARE' | 'ISOLATED_RECTANGULAR' | 'COMBINED_FOOTING' | 'MAT_FOUNDATION' | 'DRILLED_PILES';
  concreteFckMPa: number;
  rebarFyMPa: number;
  soilBearingCapacityKPa: number;
  soilUnitWeightKNm3: number;
  frictionAngleDeg: number;
  groundwaterDepthM: number;
  embedmentDepthM: number;
  footingThicknessM: number;
  pedestalWidthMm: number;
  pedestalLengthMm: number;
  pedestalRebarConfig: string;
  safetyFactorOverturning: number;
  safetyFactorSliding: number;
}

export interface FabricationPiece {
  id: string;
  tag: string;
  assembly: string;
  role: string;
  profileCode: string;
  profileName: string;
  gaugeOrThickness: string;
  lengthMm: number;
  weightKg: number;
  leftMiterCutDeg: number;
  rightMiterCutDeg: number;
  bevelRequired: boolean;
  weldType: 'AWS_D1_1_FILLET' | 'AWS_D1_1_CJP' | 'AWS_D1_1_PJP' | 'BOLTED';
  weldSizeMm: number;
  quantity: number;
  totalWeightKg: number;
  stockBar6mAllocation: string;
  lossPercentage: number;
}

export interface SpatialHolographicHub {
  id: string;
  hubType: 'SYSTEM' | 'ANALYSIS' | 'MATERIAL' | 'LOAD' | 'CONNECTION' | 'BASE_PLATE' | 'FABRICATION' | 'NORMATIVE' | 'WEIGHT';
  title: string;
  position: [number, number, number];
  nodeAttachmentId?: string;
  memberAttachmentId?: string;
  radius: number;
  status: 'VALIDATED' | 'REVIEW' | 'PENDING' | 'CRITICAL';
  data: Record<string, string | number | boolean | null | undefined>;
}
