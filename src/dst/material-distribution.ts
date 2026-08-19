// ============================================================
// STV CLOSER — MATERIAL / DISTRIBUTION / GAUGE ENGINE
// material-distribution.ts
// Ontological Layer: Material Types, Section Families, Calibres,
// Zone-Based Distribution, Mixed Assemblies & Parametric Locks
// ============================================================

import { SectionProfile } from './dst.schema';

export type MaterialCategory = 'STEEL' | 'CONCRETE' | 'ALUMINUM' | 'STAINLESS' | 'CUSTOM';

export interface MechanicalProperties {
  fyMpa: number; // Yield Strength (Fy)
  fuMpa: number; // Ultimate Tensile Strength (Fu)
  eGpa: number;  // Modulus of Elasticity (E)
  gGpa: number;  // Shear Modulus (G)
  densityKgM3: number; // Density (rho)
  poissonNu: number;   // Poisson's Ratio (nu)
  standard: string;    // e.g. ASTM A36 / ASTM A992 / AISI 304
  productForm: string; // e.g. Structural Tubing, Wide Flange, Sheet, Plate
  availability: 'IMMEDIATE' | 'COMMON' | 'SPECIAL_ORDER' | 'CUSTOM';
}

export interface MaterialSpecification {
  id: string;
  name: string;
  category: MaterialCategory;
  grade: string;
  properties?: MechanicalProperties;
  notes: string;
  isComplete: boolean; // if false -> triggers 'DATA_REQUIRED' audit
}

// 1. Master Material Specifications (Strictly Real Physical Values)
export const MASTER_MATERIALS: Record<string, MaterialSpecification> = {
  A36: {
    id: 'A36',
    name: 'ASTM A36 Carbon Steel',
    category: 'STEEL',
    grade: 'Standard',
    properties: {
      fyMpa: 250,
      fuMpa: 400,
      eGpa: 200,
      gGpa: 77.2,
      densityKgM3: 7850,
      poissonNu: 0.26,
      standard: 'ASTM A36 / A36M',
      productForm: 'Plates, Angles, Channels, Bars',
      availability: 'IMMEDIATE'
    },
    notes: 'Acero al carbono estándar para cartabones, placas base y perfiles laminados en caliente.',
    isComplete: true
  },
  A572_50: {
    id: 'A572_50',
    name: 'ASTM A572 Gr. 50 High-Strength Low-Alloy',
    category: 'STEEL',
    grade: 'Grade 50',
    properties: {
      fyMpa: 345,
      fuMpa: 450,
      eGpa: 200,
      gGpa: 77.2,
      densityKgM3: 7850,
      poissonNu: 0.26,
      standard: 'ASTM A572 / A572M Grade 50',
      productForm: 'Wide Flange IPR, Heavy Plates',
      availability: 'IMMEDIATE'
    },
    notes: 'Alta resistencia y soldabilidad óptima para marcos principales y columnas.',
    isComplete: true
  },
  A500_B: {
    id: 'A500_B',
    name: 'ASTM A500 Gr. B Cold-Formed Tubing',
    category: 'STEEL',
    grade: 'Grade B',
    properties: {
      fyMpa: 315,
      fuMpa: 400,
      eGpa: 200,
      gGpa: 77.2,
      densityKgM3: 7850,
      poissonNu: 0.26,
      standard: 'ASTM A500 Grade B',
      productForm: 'HSS Rectangular, Cuadrado y Redondo',
      availability: 'IMMEDIATE'
    },
    notes: 'Perfil tubular estructural conformado en frío con costura de alta resistencia.',
    isComplete: true
  },
  A500_C: {
    id: 'A500_C',
    name: 'ASTM A500 Gr. C Cold-Formed Tubing',
    category: 'STEEL',
    grade: 'Grade C',
    properties: {
      fyMpa: 345,
      fuMpa: 427,
      eGpa: 200,
      gGpa: 77.2,
      densityKgM3: 7850,
      poissonNu: 0.26,
      standard: 'ASTM A500 Grade C',
      productForm: 'HSS de alto desempeño',
      availability: 'COMMON'
    },
    notes: 'Mayor límite elástico para cerchas de gran peralte y celosías espaciales.',
    isComplete: true
  },
  A1085: {
    id: 'A1085',
    name: 'ASTM A1085 HSS High-Performance',
    category: 'STEEL',
    grade: 'Standard HSS',
    properties: {
      fyMpa: 345,
      fuMpa: 450,
      eGpa: 200,
      gGpa: 77.2,
      densityKgM3: 7850,
      poissonNu: 0.26,
      standard: 'ASTM A1085',
      productForm: 'HSS con tolerancia de espesor estricta',
      availability: 'SPECIAL_ORDER'
    },
    notes: 'Tolerancia de espesor nominal estricta (no requiere factor 0.938 en cálculo AISC).',
    isComplete: true
  },
  A992: {
    id: 'A992',
    name: 'ASTM A992 Structural Shapes (W / IPR)',
    category: 'STEEL',
    grade: 'Grade 50',
    properties: {
      fyMpa: 345,
      fuMpa: 450,
      eGpa: 200,
      gGpa: 77.2,
      densityKgM3: 7850,
      poissonNu: 0.26,
      standard: 'ASTM A992 / A992M',
      productForm: 'Perfiles IPR / W Flange',
      availability: 'IMMEDIATE'
    },
    notes: 'Estándar para vigas y columnas principales IPR en edificios y naves industriales.',
    isComplete: true
  },
  CUSTOM_STEEL: {
    id: 'CUSTOM_STEEL',
    name: 'Custom Project Steel (Acero a Medida)',
    category: 'STEEL',
    grade: 'Configurable',
    properties: {
      fyMpa: 300,
      fuMpa: 420,
      eGpa: 200,
      gGpa: 77.2,
      densityKgM3: 7850,
      poissonNu: 0.26,
      standard: 'Project Specification',
      productForm: 'Custom Mill Run',
      availability: 'CUSTOM'
    },
    notes: 'Aleación con especificación técnica particular del cliente.',
    isComplete: true
  },
  CONCRETE_250: {
    id: 'CONCRETE_250',
    name: 'Concreto Estructural f\'c 250 kg/cm²',
    category: 'CONCRETE',
    grade: 'f\'c = 25 MPa',
    properties: {
      fyMpa: 25,
      fuMpa: 25,
      eGpa: 23.5, // 4700 * sqrt(25) = 23,500 MPa
      gGpa: 9.8,
      densityKgM3: 2400,
      poissonNu: 0.20,
      standard: 'ACI 318-19 / NTC Concreto',
      productForm: 'Cast-in-place Pedestals / Footings',
      availability: 'IMMEDIATE'
    },
    notes: 'Para pedestales de columnas, dados de cimentación y zapatas de apoyo.',
    isComplete: true
  },
  ALUMINUM_6061_T6: {
    id: 'ALUMINUM_6061_T6',
    name: 'Aluminio Estructural 6061-T6',
    category: 'ALUMINUM',
    grade: 'T6 Temper',
    properties: {
      fyMpa: 240,
      fuMpa: 290,
      eGpa: 68.9,
      gGpa: 26.0,
      densityKgM3: 2700,
      poissonNu: 0.33,
      standard: 'ASTM B221 / Aluminum Design Manual',
      productForm: 'Extrusiones estructurales ligeras',
      availability: 'COMMON'
    },
    notes: 'Excelente ligereza y resistencia a la corrosión para marquesinas y canopias arquitectónicas.',
    isComplete: true
  },
  STAINLESS_304: {
    id: 'STAINLESS_304',
    name: 'Acero Inoxidable AISI 304 / 304L',
    category: 'STAINLESS',
    grade: 'Austenitic',
    properties: {
      fyMpa: 205,
      fuMpa: 515,
      eGpa: 193,
      gGpa: 75.0,
      densityKgM3: 8000,
      poissonNu: 0.29,
      standard: 'ASTM A240 / A276',
      productForm: 'Tubing, Tirantes, Pasadores, Pernos',
      availability: 'COMMON'
    },
    notes: 'Máxima durabilidad en ambientes marítimos, químicos y techos expuestos.',
    isComplete: true
  }
};

// ============================================================
// 2. GAUGE / THICKNESS ONTOLOGY
// ============================================================

export interface ColdFormedGaugeRecord {
  gaugeNumber: number; // e.g. 10, 12, 14, 16, 18
  thicknessMm: number; // e.g. 3.42, 2.66, 1.90, 1.52, 1.21
  thicknessInch: string;
  weightFactorKgM2: number;
  standard: 'AISI S100 / ASTM A1011';
}

export const COLD_FORMED_GAUGES: ColdFormedGaugeRecord[] = [
  { gaugeNumber: 10, thicknessMm: 3.42, thicknessInch: '0.1345"', weightFactorKgM2: 26.85, standard: 'AISI S100 / ASTM A1011' },
  { gaugeNumber: 11, thicknessMm: 3.04, thicknessInch: '0.1196"', weightFactorKgM2: 23.86, standard: 'AISI S100 / ASTM A1011' },
  { gaugeNumber: 12, thicknessMm: 2.66, thicknessInch: '0.1046"', weightFactorKgM2: 20.88, standard: 'AISI S100 / ASTM A1011' },
  { gaugeNumber: 14, thicknessMm: 1.90, thicknessInch: '0.0747"', weightFactorKgM2: 14.91, standard: 'AISI S100 / ASTM A1011' },
  { gaugeNumber: 16, thicknessMm: 1.52, thicknessInch: '0.0598"', weightFactorKgM2: 11.93, standard: 'AISI S100 / ASTM A1011' },
  { gaugeNumber: 18, thicknessMm: 1.21, thicknessInch: '0.0478"', weightFactorKgM2: 9.50, standard: 'AISI S100 / ASTM A1011' }
];

export interface PlateThicknessRecord {
  thicknessMm: number;
  nominalInch: string;
  typicalUse: string;
}

export const STRUCTURAL_PLATE_THICKNESSES: PlateThicknessRecord[] = [
  { thicknessMm: 4.76, nominalInch: '3/16"', typicalUse: 'Cartabones secundarios y atiesadores ligeros' },
  { thicknessMm: 6.35, nominalInch: '1/4"', typicalUse: 'Cartabones de nudo estándar para cerchas' },
  { thicknessMm: 9.53, nominalInch: '3/8"', typicalUse: 'Placas de cumbrera, talón y empalmes mayores' },
  { thicknessMm: 12.70, nominalInch: '1/2"', typicalUse: 'Placas base de columnas y empalmes de momento' },
  { thicknessMm: 15.88, nominalInch: '5/8"', typicalUse: 'Placas base para cargas pesadas y anclajes mayores' },
  { thicknessMm: 19.05, nominalInch: '3/4"', typicalUse: 'Conexiones de momento pesadas y zapatas continuas' },
  { thicknessMm: 25.40, nominalInch: '1.0"', typicalUse: 'Bases de columnas de gran tonelaje e infraestructura' }
];

// ============================================================
// 3. MEMBER DISTRIBUTION BY ROLE & ZONES
// ============================================================

export type MemberStructuralRole =
  | 'TOP_CHORD'
  | 'BOTTOM_CHORD'
  | 'DIAGONAL'
  | 'VERTICAL'
  | 'BRACING'
  | 'PURLIN'
  | 'GIRT'
  | 'COLUMN'
  | 'BEAM'
  | 'CONNECTION_PLATE'
  | 'ANCHORAGE';

export type DistributionMode =
  | 'UNIFORM'
  | 'VARIABLE'
  | 'ZONE_BASED'
  | 'MEMBER_BASED'
  | 'SYMMETRIC'
  | 'ASYMMETRIC'
  | 'OPTIMIZED'
  | 'CUSTOM';

export type StructuralZone =
  | 'ZONE_01_SUPPORT'
  | 'ZONE_02_FIELD'
  | 'ZONE_03_MIDSPAN'
  | 'ZONE_04_RIDGE'
  | 'ZONE_05_CANTILEVER';

export interface MaterialProfileSpec {
  type: string;
  designation: string;
  dimensions: { width: number; height: number; thickness: number };
  properties: { area: number; weightPerMeter: number; momentOfInertiaX: number; momentOfInertiaY: number };
}

export interface ZoneDistributionAssignment {
  zoneId: StructuralZone;
  zoneName: string;
  description: string;
  defaultProfile: MaterialProfileSpec;
  assignedMaterialId: string;
  ratioStart: number; // 0.0 to 1.0 along span
  ratioEnd: number;   // 0.0 to 1.0 along span
}

export interface MemberRoleDistributionConfig {
  role: MemberStructuralRole;
  label: string;
  defaultMaterialId: string;
  defaultProfile: MaterialProfileSpec;
  gaugeNumber?: number; // if cold-formed
  plateThicknessMm?: number; // if plate
  distributionMode: DistributionMode;
  zoneOverrides?: Partial<Record<StructuralZone, MaterialProfileSpec>>;
  isLocked: boolean; // Parametric Lock
}

// 4. Default Role Assignment Registry
export const DEFAULT_ROLE_DISTRIBUTIONS: Record<MemberStructuralRole, MemberRoleDistributionConfig> = {
  TOP_CHORD: {
    role: 'TOP_CHORD',
    label: 'Cuerda Superior (Top Chord)',
    defaultMaterialId: 'A500_B',
    defaultProfile: {
      type: 'HSS_RECT',
      designation: 'HSS 8x4x1/4 (203x102x6.4mm)',
      dimensions: { width: 102, height: 203, thickness: 6.35 },
      properties: { area: 35.2, weightPerMeter: 27.6, momentOfInertiaX: 1980, momentOfInertiaY: 650 }
    },
    distributionMode: 'UNIFORM',
    isLocked: false
  },
  BOTTOM_CHORD: {
    role: 'BOTTOM_CHORD',
    label: 'Cuerda Inferior (Bottom Chord / Tie)',
    defaultMaterialId: 'A500_B',
    defaultProfile: {
      type: 'HSS_RECT',
      designation: 'HSS 6x4x1/4 (152x102x6.4mm)',
      dimensions: { width: 102, height: 152, thickness: 6.35 },
      properties: { area: 28.8, weightPerMeter: 22.6, momentOfInertiaX: 980, momentOfInertiaY: 520 }
    },
    distributionMode: 'UNIFORM',
    isLocked: false
  },
  DIAGONAL: {
    role: 'DIAGONAL',
    label: 'Diagonales de Alma (Web Diagonals)',
    defaultMaterialId: 'A500_B',
    defaultProfile: {
      type: 'HSS_SQUARE',
      designation: 'HSS 3x3x3/16 (76x76x4.8mm)',
      dimensions: { width: 76, height: 76, thickness: 4.76 },
      properties: { area: 13.1, weightPerMeter: 10.3, momentOfInertiaX: 110, momentOfInertiaY: 110 }
    },
    distributionMode: 'UNIFORM',
    isLocked: false
  },
  VERTICAL: {
    role: 'VERTICAL',
    label: 'Montantes Verticales (Web Verticals)',
    defaultMaterialId: 'A500_B',
    defaultProfile: {
      type: 'HSS_SQUARE',
      designation: 'HSS 3x3x3/16 (76x76x4.8mm)',
      dimensions: { width: 76, height: 76, thickness: 4.76 },
      properties: { area: 13.1, weightPerMeter: 10.3, momentOfInertiaX: 110, momentOfInertiaY: 110 }
    },
    distributionMode: 'UNIFORM',
    isLocked: false
  },
  BRACING: {
    role: 'BRACING',
    label: 'Arriostramiento Cruz de San Andrés',
    defaultMaterialId: 'A36',
    defaultProfile: {
      type: 'L_EQUAL',
      designation: 'L 2x2x1/4 (51x51x6.4mm)',
      dimensions: { width: 51, height: 51, thickness: 6.35 },
      properties: { area: 6.0, weightPerMeter: 4.75, momentOfInertiaX: 14.5, momentOfInertiaY: 14.5 }
    },
    distributionMode: 'UNIFORM',
    isLocked: false
  },
  PURLIN: {
    role: 'PURLIN',
    label: 'Largueros de Cubierta / Costaneras (C-Purlins)',
    defaultMaterialId: 'A36',
    defaultProfile: {
      type: 'C_CHANNEL',
      designation: 'Montén C 8x2.75x14G (203x70x1.9mm)',
      dimensions: { width: 70, height: 203, thickness: 1.90 },
      properties: { area: 7.2, weightPerMeter: 5.65, momentOfInertiaX: 430, momentOfInertiaY: 42 }
    },
    gaugeNumber: 14,
    distributionMode: 'UNIFORM',
    isLocked: false
  },
  GIRT: {
    role: 'GIRT',
    label: 'Largueros Laterales de Muro (Girts)',
    defaultMaterialId: 'A36',
    defaultProfile: {
      type: 'C_CHANNEL',
      designation: 'Montén C 6x2x14G (152x51x1.9mm)',
      dimensions: { width: 51, height: 152, thickness: 1.90 },
      properties: { area: 5.4, weightPerMeter: 4.25, momentOfInertiaX: 180, momentOfInertiaY: 22 }
    },
    gaugeNumber: 14,
    distributionMode: 'UNIFORM',
    isLocked: false
  },
  COLUMN: {
    role: 'COLUMN',
    label: 'Columnas Principales (Main Columns)',
    defaultMaterialId: 'A992',
    defaultProfile: {
      type: 'IPR_W',
      designation: 'IPR W12x26 (310x165mm - 38.7 kg/m)',
      dimensions: { width: 165, height: 310, thickness: 9.7 },
      properties: { area: 49.3, weightPerMeter: 38.7, momentOfInertiaX: 8490, momentOfInertiaY: 720 }
    },
    distributionMode: 'UNIFORM',
    isLocked: false
  },
  BEAM: {
    role: 'BEAM',
    label: 'Vigas de Amarre y Corona (Tie Beams)',
    defaultMaterialId: 'A992',
    defaultProfile: {
      type: 'IPR_W',
      designation: 'IPR W10x19 (254x102mm - 28.3 kg/m)',
      dimensions: { width: 102, height: 254, thickness: 6.8 },
      properties: { area: 36.1, weightPerMeter: 28.3, momentOfInertiaX: 4010, momentOfInertiaY: 180 }
    },
    distributionMode: 'UNIFORM',
    isLocked: false
  },
  CONNECTION_PLATE: {
    role: 'CONNECTION_PLATE',
    label: 'Cartabones y Placas de Conexión',
    defaultMaterialId: 'A36',
    defaultProfile: {
      type: 'PLATE',
      designation: 'Placa A36 t = 9.53 mm (3/8")',
      dimensions: { width: 300, height: 300, thickness: 9.53 },
      properties: { area: 28.6, weightPerMeter: 22.4, momentOfInertiaX: 21, momentOfInertiaY: 21 }
    },
    plateThicknessMm: 9.53,
    distributionMode: 'UNIFORM',
    isLocked: false
  },
  ANCHORAGE: {
    role: 'ANCHORAGE',
    label: 'Pernos de Anclaje ASTM F1554 Gr. 55',
    defaultMaterialId: 'A36',
    defaultProfile: {
      type: 'ROD_ROUND',
      designation: 'Perno Anclaje Ø 3/4" (19.05 mm) x 450 mm',
      dimensions: { width: 19.05, height: 19.05, thickness: 19.05 },
      properties: { area: 2.85, weightPerMeter: 2.24, momentOfInertiaX: 0.64, momentOfInertiaY: 0.64 }
    },
    distributionMode: 'UNIFORM',
    isLocked: false
  }
};

// 5. Zone Mapping for Advanced Zone-Based Distribution
export const STRUCTURAL_ZONES: ZoneDistributionAssignment[] = [
  {
    zoneId: 'ZONE_01_SUPPORT',
    zoneName: 'Zona 01 — Apoyo / Talón (Heel Support)',
    description: 'Máximo cortante y reacciones de apoyo; requiere sección robusta.',
    defaultProfile: {
      type: 'HSS_RECT',
      designation: 'HSS 8x4x3/8 (203x102x9.5mm)',
      dimensions: { width: 102, height: 203, thickness: 9.53 },
      properties: { area: 50.2, weightPerMeter: 39.4, momentOfInertiaX: 2650, momentOfInertiaY: 880 }
    },
    assignedMaterialId: 'A500_B',
    ratioStart: 0.0,
    ratioEnd: 0.2
  },
  {
    zoneId: 'ZONE_02_FIELD',
    zoneName: 'Zona 02 — Vano Intermedio (Field)',
    description: 'Zona de transición con esfuerzos moderados de corte y flexión.',
    defaultProfile: {
      type: 'HSS_RECT',
      designation: 'HSS 6x4x1/4 (152x102x6.4mm)',
      dimensions: { width: 102, height: 152, thickness: 6.35 },
      properties: { area: 28.8, weightPerMeter: 22.6, momentOfInertiaX: 980, momentOfInertiaY: 520 }
    },
    assignedMaterialId: 'A500_B',
    ratioStart: 0.2,
    ratioEnd: 0.4
  },
  {
    zoneId: 'ZONE_03_MIDSPAN',
    zoneName: 'Zona 03 — Centro de Luz (Midspan)',
    description: 'Máximo momento flector positivo; cuerdas en máxima tracción/compresión axial pura.',
    defaultProfile: {
      type: 'HSS_RECT',
      designation: 'HSS 6x4x1/4 (152x102x6.4mm)',
      dimensions: { width: 102, height: 152, thickness: 6.35 },
      properties: { area: 28.8, weightPerMeter: 22.6, momentOfInertiaX: 980, momentOfInertiaY: 520 }
    },
    assignedMaterialId: 'A500_B',
    ratioStart: 0.4,
    ratioEnd: 0.6
  },
  {
    zoneId: 'ZONE_04_RIDGE',
    zoneName: 'Zona 04 — Cumbrera / Vértice (Ridge Apex)',
    description: 'Concentración angular de empujes de cuerda superior.',
    defaultProfile: {
      type: 'HSS_RECT',
      designation: 'HSS 8x4x1/4 (203x102x6.4mm)',
      dimensions: { width: 102, height: 203, thickness: 6.35 },
      properties: { area: 35.2, weightPerMeter: 27.6, momentOfInertiaX: 1980, momentOfInertiaY: 650 }
    },
    assignedMaterialId: 'A500_B',
    ratioStart: 0.45,
    ratioEnd: 0.55
  },
  {
    zoneId: 'ZONE_05_CANTILEVER',
    zoneName: 'Zona 05 — Alero / Voladizo (Cantilever)',
    description: 'Vuelo exterior sometido a succión de viento ascendente.',
    defaultProfile: {
      type: 'HSS_RECT',
      designation: 'HSS 6x4x3/16 (152x102x4.8mm)',
      dimensions: { width: 102, height: 152, thickness: 4.76 },
      properties: { area: 22.1, weightPerMeter: 17.3, momentOfInertiaX: 770, momentOfInertiaY: 410 }
    },
    assignedMaterialId: 'A500_B',
    ratioStart: 0.9,
    ratioEnd: 1.0
  }
];

// Helper: Determine zone for a normalized position (0.0 to 1.0) along the span
export function getZoneForPosition(normalizedX: number): StructuralZone {
  if (normalizedX <= 0.2 || normalizedX >= 0.8) return 'ZONE_01_SUPPORT';
  if (normalizedX >= 0.45 && normalizedX <= 0.55) return 'ZONE_04_RIDGE';
  if (normalizedX >= 0.35 && normalizedX <= 0.65) return 'ZONE_03_MIDSPAN';
  return 'ZONE_02_FIELD';
}
