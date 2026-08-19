// ============================================================
// STV CLOSER — ROOF & TRUSS TYPOLOGY DATABASE (ONTOLOGY)
// truss-typologies.ts
// Screen 02 Structural Grammar, Roof Database, Truss DNA & Schemas
// ============================================================

export type RoofFamily =
  | 'FLAT'
  | 'SINGLE_SLOPE'
  | 'DOUBLE_SLOPE'
  | 'ASYMMETRIC_DOUBLE_SLOPE'
  | 'BUTTERFLY'
  | 'SAWTOOTH'
  | 'BARREL'
  | 'GABLE'
  | 'HIP'
  | 'CURVED'
  | 'SHED'
  | 'CUSTOM';

export type TrussFamily =
  | 'FLAT_TRUSS'
  | 'ROOF_TRUSS'
  | 'SPACE_STRUCTURE'
  | 'CURVED_STRUCTURE'
  | 'SPECIAL';

export type ParameterState = 'LOCKED' | 'EDITABLE' | 'DERIVED';

export interface ParameterDefinition {
  key: string;
  label: string;
  unit: string;
  defaultValue: number;
  min: number;
  max: number;
  step: number;
  state: ParameterState;
  description: string;
  isDerivedCandidate?: boolean;
}

export interface TrussDNA {
  topology: string;
  chordCount: number;
  webPattern: string;
  verticals: boolean | 'OPTIONAL';
  symmetry: 'BILATERAL' | 'NONE' | 'PARAMETRIC' | 'RADIAL' | 'SPHERICAL_ICOSAHEDRAL' | 'AXISYMMETRIC';
  panelization: 'UNIFORM' | 'VARIABLE' | 'PARAMETRIC';
  depth: 'PARAMETRIC' | 'FIXED';
  span: 'PARAMETRIC' | 'FIXED';
  supportModel: string;
  connectionModel: string;
  notes: string;
}

export interface TrussTypologyDefinition {
  id: string;
  code: string;
  name: string;
  family: TrussFamily;
  shortDesc: string;
  dna: TrussDNA;
  parameterSchema: ParameterDefinition[];
  supportedSupports: ('PINNED' | 'ROLLER' | 'FIXED' | 'CANTILEVER' | 'ELASTIC')[];
  supportedRoofFamilies: RoofFamily[];
  fabricationRules: string[];
  auditRules: string[];
  svgIcon: string;
}

export interface RoofTypologyDefinition {
  id: string;
  code: string;
  name: string;
  family: RoofFamily;
  shortDesc: string;
  typicalSlopeDeg: number;
  drainageType: 'CENTRAL' | 'PERIMETER' | 'ONE_SIDE' | 'GUTTER_VALLEY';
  geometryRules: string[];
  maxRecommendedSpanM: number;
}

// ============================================================
// 1. ROOF TYPOLOGY DATABASE (ROOF-01 to ROOF-12)
// ============================================================

export const ROOF_CATALOG: RoofTypologyDefinition[] = [
  {
    id: 'ROOF-01',
    code: 'FLAT',
    name: 'Cubierta Plana / Horizontal',
    family: 'FLAT',
    shortDesc: 'Pendiente mínima hidrófuga (1-3%) para naves industriales y bodegas comerciales.',
    typicalSlopeDeg: 2,
    drainageType: 'PERIMETER',
    geometryRules: ['Pendiente mínima recomendada 2%', 'Requiere contraflecha para evitar empozamiento'],
    maxRecommendedSpanM: 30
  },
  {
    id: 'ROOF-02',
    code: 'SINGLE_SLOPE',
    name: 'Cubierta Monopendiente (Shed)',
    family: 'SINGLE_SLOPE',
    shortDesc: 'Una sola vertiente continua con evacuación pluvial unilateral optimizada.',
    typicalSlopeDeg: 8,
    drainageType: 'ONE_SIDE',
    geometryRules: ['Desnivel constante entre apoyos', 'Excelente para captación solar en orientación sur'],
    maxRecommendedSpanM: 24
  },
  {
    id: 'ROOF-03',
    code: 'DOUBLE_SLOPE',
    name: 'Cubierta Dos Aguas Simétrica (Gable)',
    family: 'DOUBLE_SLOPE',
    shortDesc: 'Cumbrera central simétrica con pendientes iguales a ambos costados.',
    typicalSlopeDeg: 12,
    drainageType: 'PERIMETER',
    geometryRules: ['Cumbrera en x = L / 2', 'Simetría bilateral de cargas gravitacionales'],
    maxRecommendedSpanM: 40
  },
  {
    id: 'ROOF-04',
    code: 'ASYMMETRIC_DOUBLE_SLOPE',
    name: 'Dos Aguas Asimétrica',
    family: 'ASYMMETRIC_DOUBLE_SLOPE',
    shortDesc: 'Cumbrera desplazada lateralmente para naves con mezanines o iluminación lateral.',
    typicalSlopeDeg: 14,
    drainageType: 'PERIMETER',
    geometryRules: ['Cumbrera descentrada (x != L/2)', 'Requiere verificación de empujes asimétricos'],
    maxRecommendedSpanM: 32
  },
  {
    id: 'ROOF-05',
    code: 'BUTTERFLY',
    name: 'Cubierta Mariposa (V Invertida)',
    family: 'BUTTERFLY',
    shortDesc: 'Pendientes convergentes hacia un canal central de drenaje para captación de agua.',
    typicalSlopeDeg: 10,
    drainageType: 'CENTRAL',
    geometryRules: ['Punto más bajo en el centro', 'Canalón central de alta capacidad pluviométrica'],
    maxRecommendedSpanM: 22
  },
  {
    id: 'ROOF-06',
    code: 'SAWTOOTH',
    name: 'Cubierta Diente de Sierra (Sawtooth)',
    family: 'SAWTOOTH',
    shortDesc: 'Módulos repetitivos con vertiente vertical vidriada para iluminación natural cenital.',
    typicalSlopeDeg: 25,
    drainageType: 'GUTTER_VALLEY',
    geometryRules: ['Caras verticales orientadas preferentemente al Norte', 'Múltiples canalones intermedios'],
    maxRecommendedSpanM: 36
  },
  {
    id: 'ROOF-07',
    code: 'BARREL',
    name: 'Cubierta Cañón Corrido (Bóveda)',
    family: 'BARREL',
    shortDesc: 'Superficie cilíndrica de curvatura continua con gran eficiencia aerodinámica.',
    typicalSlopeDeg: 15,
    drainageType: 'PERIMETER',
    geometryRules: ['Generatriz en arco circular o parabólico', 'Tirantes de borde para empuje horizontal'],
    maxRecommendedSpanM: 48
  },
  {
    id: 'ROOF-08',
    code: 'GABLE',
    name: 'Gable Tradicional Reforzado',
    family: 'GABLE',
    shortDesc: 'Dos vertientes con aleros extendidos y ventilación tipo cumbrera monitor.',
    typicalSlopeDeg: 15,
    drainageType: 'PERIMETER',
    geometryRules: ['Aleros estructurales parametrables', 'Caballete con opción de ventilador lineal'],
    maxRecommendedSpanM: 38
  },
  {
    id: 'ROOF-09',
    code: 'HIP',
    name: 'Cubierta a Cuatro Aguas (Hip Roof)',
    family: 'HIP',
    shortDesc: 'Cuatro vertientes inclinadas que reducen considerablemente la succión de viento en bordes.',
    typicalSlopeDeg: 14,
    drainageType: 'PERIMETER',
    geometryRules: ['Cerchas esquineras limahoyas/limatesas', 'Máxima rigidez torsional frente a viento'],
    maxRecommendedSpanM: 30
  },
  {
    id: 'ROOF-10',
    code: 'CURVED',
    name: 'Cubierta Curva Parabólica Libre',
    family: 'CURVED',
    shortDesc: 'Arco rebajado o funicular de momentos para grandes luces sin apoyos intermedios.',
    typicalSlopeDeg: 18,
    drainageType: 'PERIMETER',
    geometryRules: ['Ecuación parabólica y = 4·f·x·(L-x)/L²', 'Minimiza momentos flectores en cuerdas'],
    maxRecommendedSpanM: 60
  },
  {
    id: 'ROOF-11',
    code: 'SHED',
    name: 'Cobertizo Inclinado / Canopia',
    family: 'SHED',
    shortDesc: 'Estructura ligera de protección solar y lluvia con vuelos libres voladizos.',
    typicalSlopeDeg: 6,
    drainageType: 'ONE_SIDE',
    geometryRules: ['Apoyo articulado + puntal tensor posterior', 'Pendiente suave para cubiertas translúcidas'],
    maxRecommendedSpanM: 18
  },
  {
    id: 'ROOF-12',
    code: 'CUSTOM',
    name: 'Cubierta Geométrica Especial (Custom)',
    family: 'CUSTOM',
    shortDesc: 'Generatriz definida mediante polilíneas, splines o nodos geométricos personalizados.',
    typicalSlopeDeg: 10,
    drainageType: 'PERIMETER',
    geometryRules: ['Geometría libre validada por el motor topológico', 'Malla de nodos no estándar'],
    maxRecommendedSpanM: 100
  }
];

// ============================================================
// 2. TRUSS TYPOLOGY DATABASE (TR-01 to TR-18)
// ============================================================

export const TRUSS_CATALOG: TrussTypologyDefinition[] = [
  {
    id: 'TR-01',
    code: 'WARREN',
    name: 'Warren Clásica',
    family: 'FLAT_TRUSS',
    shortDesc: 'Diagonales alternadas en zigzag formando triángulos equiláteros/isósceles continuos.',
    dna: {
      topology: 'Alternating diagonals with equal inclination angles',
      chordCount: 2,
      webPattern: 'DIAGONAL_ZIGZAG',
      verticals: 'OPTIONAL',
      symmetry: 'BILATERAL',
      panelization: 'UNIFORM',
      depth: 'PARAMETRIC',
      span: 'PARAMETRIC',
      supportModel: '2_POINT_END_BEARING',
      connectionModel: 'NODE_GUSSET_WELDED',
      notes: 'Excelente relación rigidez-peso; las diagonales alternan tensión y compresión.'
    },
    parameterSchema: [
      { key: 'span', label: 'Claro (Span)', unit: 'm', defaultValue: 14.0, min: 4.0, max: 50.0, step: 0.5, state: 'EDITABLE', description: 'Longitud entre ejes de apoyo.' },
      { key: 'depth', label: 'Peralte (Depth)', unit: 'm', defaultValue: 1.2, min: 0.4, max: 5.0, step: 0.05, state: 'EDITABLE', description: 'Altura constante entre cuerdas.' },
      { key: 'panelCount', label: 'Cantidad de Paneles', unit: 'uds', defaultValue: 10, min: 4, max: 32, step: 2, state: 'EDITABLE', description: 'Número total de divisiones en cuerda inferior.' },
      { key: 'panelLength', label: 'Longitud de Panel', unit: 'm', defaultValue: 1.4, min: 0.5, max: 4.0, step: 0.05, state: 'DERIVED', description: 'Longitud calculada: Span / PanelCount.', isDerivedCandidate: true },
      { key: 'verticals', label: 'Montantes Verticales', unit: 'bool', defaultValue: 1, min: 0, max: 1, step: 1, state: 'EDITABLE', description: 'Añadir montantes para reducir longitud de pandeo en cuerda superior.' }
    ],
    supportedSupports: ['PINNED', 'ROLLER', 'FIXED'],
    supportedRoofFamilies: ['FLAT', 'SINGLE_SLOPE', 'DOUBLE_SLOPE', 'CUSTOM'],
    fabricationRules: ['Ángulos de corte uniformes en extremos de diagonales', 'Fabricable en tramos modulares de 6m y 12m'],
    auditRules: ['Relación L/d recomendada entre 10 y 16', 'Ángulo de diagonales entre 40° y 60°'],
    svgIcon: 'warren'
  },
  {
    id: 'TR-02',
    code: 'PRATT',
    name: 'Pratt (Diagonales en Tensión)',
    family: 'ROOF_TRUSS',
    shortDesc: 'Montantes verticales en compresión y diagonales inclinadas hacia el centro en tensión.',
    dna: {
      topology: 'Vertical posts + inward-sloping tension diagonals',
      chordCount: 2,
      webPattern: 'PRATT_INWARD_TENSION',
      verticals: true,
      symmetry: 'BILATERAL',
      panelization: 'UNIFORM',
      depth: 'PARAMETRIC',
      span: 'PARAMETRIC',
      supportModel: '2_POINT_END_BEARING',
      connectionModel: 'NODE_GUSSET_BOLTED_WELDED',
      notes: 'Diseño altamente eficiente en acero: las diagonales más largas trabajan a tracción pura.'
    },
    parameterSchema: [
      { key: 'span', label: 'Claro (Span)', unit: 'm', defaultValue: 16.0, min: 4.0, max: 45.0, step: 0.5, state: 'EDITABLE', description: 'Longitud entre apoyos.' },
      { key: 'rise', label: 'Flecha / Peralte Cumbrera', unit: 'm', defaultValue: 2.0, min: 0.5, max: 6.0, step: 0.1, state: 'EDITABLE', description: 'Altura total en la cumbrera o centro.' },
      { key: 'panelCount', label: 'Número de Paneles', unit: 'uds', defaultValue: 8, min: 4, max: 24, step: 2, state: 'EDITABLE', description: 'Número de paneles pares.' },
      { key: 'panelLength', label: 'Longitud de Panel', unit: 'm', defaultValue: 2.0, min: 0.6, max: 3.5, step: 0.05, state: 'DERIVED', description: 'Span / PanelCount.', isDerivedCandidate: true },
      { key: 'roofSlope', label: 'Pendiente de Techo', unit: '°', defaultValue: 14, min: 3, max: 35, step: 0.5, state: 'DERIVED', description: 'arctan(2·Rise / Span).', isDerivedCandidate: true }
    ],
    supportedSupports: ['PINNED', 'ROLLER', 'FIXED'],
    supportedRoofFamilies: ['DOUBLE_SLOPE', 'GABLE', 'SINGLE_SLOPE', 'FLAT'],
    fabricationRules: ['Identificación clara de montantes vs diagonales', 'Placas de nodo estandarizadas en cumbrera y apoyos'],
    auditRules: ['Verificar que las diagonales trabajen a tracción bajo carga gravitacional dominante', 'L/h en cumbrera entre 6 y 10'],
    svgIcon: 'pratt'
  },
  {
    id: 'TR-03',
    code: 'HOWE',
    name: 'Howe (Montantes en Tensión)',
    family: 'ROOF_TRUSS',
    shortDesc: 'Montantes verticales en tracción y diagonales inclinadas hacia el exterior en compresión.',
    dna: {
      topology: 'Vertical tension ties + outward compression diagonals',
      chordCount: 2,
      webPattern: 'HOWE_OUTWARD_COMPRESSION',
      verticals: true,
      symmetry: 'BILATERAL',
      panelization: 'UNIFORM',
      depth: 'PARAMETRIC',
      span: 'PARAMETRIC',
      supportModel: '2_POINT_END_BEARING',
      connectionModel: 'NODE_GUSSET_WELDED',
      notes: 'Ideal cuando se busca que los montantes verticales sean tensores redondos esbeltos.'
    },
    parameterSchema: [
      { key: 'span', label: 'Claro (Span)', unit: 'm', defaultValue: 14.0, min: 4.0, max: 40.0, step: 0.5, state: 'EDITABLE', description: 'Longitud total de la cercha.' },
      { key: 'rise', label: 'Flecha Central', unit: 'm', defaultValue: 1.8, min: 0.5, max: 5.0, step: 0.1, state: 'EDITABLE', description: 'Altura en la cumbrera.' },
      { key: 'panelCount', label: 'Cantidad de Paneles', unit: 'uds', defaultValue: 8, min: 4, max: 20, step: 2, state: 'EDITABLE', description: 'Divisiones simétricas.' },
      { key: 'panelLength', label: 'Longitud de Panel', unit: 'm', defaultValue: 1.75, min: 0.5, max: 3.0, step: 0.05, state: 'DERIVED', description: 'Span / PanelCount.', isDerivedCandidate: true }
    ],
    supportedSupports: ['PINNED', 'ROLLER'],
    supportedRoofFamilies: ['DOUBLE_SLOPE', 'GABLE', 'SINGLE_SLOPE'],
    fabricationRules: ['Verificar esbeltez de diagonales comprimidas'],
    auditRules: ['Pandeo por compresión en diagonales exteriores'],
    svgIcon: 'howe'
  },
  {
    id: 'TR-04',
    code: 'FINK',
    name: 'Fink (Subdivisión Triangular)',
    family: 'ROOF_TRUSS',
    shortDesc: 'Subdivisión fractal perpendicular a la cuerda superior; reduce la longitud no arriostrada.',
    dna: {
      topology: 'Hierarchical triangular subdivision perpendicular to rafters',
      chordCount: 2,
      webPattern: 'FINK_SUBDIVIDED',
      verticals: 'OPTIONAL',
      symmetry: 'BILATERAL',
      panelization: 'PARAMETRIC',
      depth: 'PARAMETRIC',
      span: 'PARAMETRIC',
      supportModel: '2_POINT_END_BEARING',
      connectionModel: 'PINNED_RIDGE_AND_HEEL',
      notes: 'La cercha más popular para techos inclinados de 12 a 24m. Diagonales cortas y rígidas.'
    },
    parameterSchema: [
      { key: 'span', label: 'Claro (Span)', unit: 'm', defaultValue: 18.0, min: 6.0, max: 36.0, step: 0.5, state: 'EDITABLE', description: 'Distancia entre apoyos principales.' },
      { key: 'rise', label: 'Flecha (Rise)', unit: 'm', defaultValue: 2.4, min: 0.8, max: 6.0, step: 0.1, state: 'EDITABLE', description: 'Altura en el nodo cumbrera.' },
      { key: 'panelCount', label: 'Subdivisiones (Paneles)', unit: 'uds', defaultValue: 12, min: 6, max: 24, step: 2, state: 'EDITABLE', description: 'Grado de subdivisión del ala.' },
      { key: 'panelLength', label: 'Longitud Panel Inclinado', unit: 'm', defaultValue: 1.55, min: 0.5, max: 2.5, step: 0.05, state: 'DERIVED', description: 'Hipotenusa / paneles.', isDerivedCandidate: true },
      { key: 'centralNode', label: 'Nodo Central Tirante', unit: 'bool', defaultValue: 1, min: 0, max: 1, step: 1, state: 'LOCKED', description: 'Tirante vertical central de soporte.' }
    ],
    supportedSupports: ['PINNED', 'ROLLER', 'FIXED'],
    supportedRoofFamilies: ['DOUBLE_SLOPE', 'GABLE', 'ASYMMETRIC_DOUBLE_SLOPE'],
    fabricationRules: ['Nodos de talón (heel joints) con cortantes concentrados', 'Empalme de cuerda inferior atornillado'],
    auditRules: ['Pendiente mínima recomendada ≥ 10° para evitar empujes excesivos en talón'],
    svgIcon: 'fink'
  },
  {
    id: 'TR-05',
    code: 'K_TRUSS',
    name: 'K-Truss (Diagonales en K)',
    family: 'FLAT_TRUSS',
    shortDesc: 'Pares de diagonales en forma de K que bisecan los montantes para acortar longitudes de pandeo.',
    dna: {
      topology: 'K-shaped diagonal pairs intersecting vertical members at mid-height',
      chordCount: 2,
      webPattern: 'K_PATTERN',
      verticals: true,
      symmetry: 'BILATERAL',
      panelization: 'UNIFORM',
      depth: 'PARAMETRIC',
      span: 'PARAMETRIC',
      supportModel: '2_POINT_END_BEARING',
      connectionModel: 'GUSSET_WELDED',
      notes: 'Especialmente efectiva para peraltes altos (d > 2.5m) donde diagonales simples serían muy largas.'
    },
    parameterSchema: [
      { key: 'span', label: 'Claro (Span)', unit: 'm', defaultValue: 20.0, min: 10.0, max: 60.0, step: 1.0, state: 'EDITABLE', description: 'Claro total.' },
      { key: 'depth', label: 'Peralte (Depth)', unit: 'm', defaultValue: 2.5, min: 1.2, max: 6.0, step: 0.1, state: 'EDITABLE', description: 'Peralte constante.' },
      { key: 'panelCount', label: 'Paneles K', unit: 'uds', defaultValue: 8, min: 4, max: 16, step: 2, state: 'EDITABLE', description: 'Cantidad de bahías en K.' }
    ],
    supportedSupports: ['PINNED', 'ROLLER'],
    supportedRoofFamilies: ['FLAT', 'DOUBLE_SLOPE'],
    fabricationRules: ['Nodos intermedios soldados en el punto medio del montante vertical'],
    auditRules: ['Revisión de flexocompresión en nodos medios de montantes'],
    svgIcon: 'ktruss'
  },
  {
    id: 'TR-06',
    code: 'BALTIMORE',
    name: 'Baltimore (Sub-Panelizada)',
    family: 'ROOF_TRUSS',
    shortDesc: 'Cercha Pratt modificada con sub-diagonales y sub-montantes para claros muy profundos.',
    dna: {
      topology: 'Sub-panelized Pratt truss with secondary bracing ties',
      chordCount: 2,
      webPattern: 'BALTIMORE_SUBPANEL',
      verticals: true,
      symmetry: 'BILATERAL',
      panelization: 'VARIABLE',
      depth: 'PARAMETRIC',
      span: 'PARAMETRIC',
      supportModel: '2_POINT_END_BEARING',
      connectionModel: 'HEAVY_GUSSET_BOLTED',
      notes: 'Permite largueros de techo a menor espaciamiento sin aumentar el ángulo de las diagonales.'
    },
    parameterSchema: [
      { key: 'span', label: 'Claro (Span)', unit: 'm', defaultValue: 24.0, min: 12.0, max: 60.0, step: 1.0, state: 'EDITABLE', description: 'Claro estructural.' },
      { key: 'rise', label: 'Flecha / Peralte', unit: 'm', defaultValue: 3.0, min: 1.5, max: 7.0, step: 0.1, state: 'EDITABLE', description: 'Peralte en cumbrera.' },
      { key: 'panelCount', label: 'Paneles Principales', unit: 'uds', defaultValue: 8, min: 4, max: 16, step: 2, state: 'EDITABLE', description: 'Paneles mayores.' }
    ],
    supportedSupports: ['PINNED', 'ROLLER'],
    supportedRoofFamilies: ['DOUBLE_SLOPE', 'GABLE', 'FLAT'],
    fabricationRules: ['Estandarización de sub-piezas'],
    auditRules: ['Cálculo de pandeo local en sub-miembros'],
    svgIcon: 'baltimore'
  },
  {
    id: 'TR-07',
    code: 'N_TRUSS',
    name: 'N-Truss (Monodireccional)',
    family: 'FLAT_TRUSS',
    shortDesc: 'Diagonales orientadas en una sola dirección continua a lo largo de toda la semi-luz.',
    dna: {
      topology: 'Uniform single-directional diagonal slant per half-span',
      chordCount: 2,
      webPattern: 'N_MONODIRECTIONAL',
      verticals: true,
      symmetry: 'BILATERAL',
      panelization: 'UNIFORM',
      depth: 'PARAMETRIC',
      span: 'PARAMETRIC',
      supportModel: '2_POINT',
      connectionModel: 'GUSSET',
      notes: 'Patrón limpio y regular con fácil corte automatizado.'
    },
    parameterSchema: [
      { key: 'span', label: 'Claro (Span)', unit: 'm', defaultValue: 15.0, min: 6.0, max: 35.0, step: 0.5, state: 'EDITABLE', description: 'Claro.' },
      { key: 'depth', label: 'Peralte', unit: 'm', defaultValue: 1.3, min: 0.5, max: 3.5, step: 0.05, state: 'EDITABLE', description: 'Peralte.' },
      { key: 'panelCount', label: 'Paneles', unit: 'uds', defaultValue: 10, min: 4, max: 20, step: 2, state: 'EDITABLE', description: 'Cantidad de paneles.' }
    ],
    supportedSupports: ['PINNED', 'ROLLER'],
    supportedRoofFamilies: ['FLAT', 'SINGLE_SLOPE'],
    fabricationRules: ['Diagonales con mismo ángulo en toda la cercha'],
    auditRules: ['Relación de esbeltez de diagonales'],
    svgIcon: 'ntruss'
  },
  {
    id: 'TR-08',
    code: 'W_TRUSS',
    name: 'W-Truss (Doble Triángulo W)',
    family: 'ROOF_TRUSS',
    shortDesc: 'Configuración clásica de 4 paneles en W para techos residenciales e industriales ligeros.',
    dna: {
      topology: 'W-chord web configuration with 4-6 primary strut panels',
      chordCount: 2,
      webPattern: 'W_CHORD_PATTERN',
      verticals: false,
      symmetry: 'BILATERAL',
      panelization: 'UNIFORM',
      depth: 'PARAMETRIC',
      span: 'PARAMETRIC',
      supportModel: '2_POINT',
      connectionModel: 'NAIL_PLATE_OR_GUSSET',
      notes: 'Mínimo número de elementos para claros ligeros de 8 a 16m.'
    },
    parameterSchema: [
      { key: 'span', label: 'Claro (Span)', unit: 'm', defaultValue: 12.0, min: 6.0, max: 20.0, step: 0.5, state: 'EDITABLE', description: 'Claro.' },
      { key: 'rise', label: 'Flecha', unit: 'm', defaultValue: 1.8, min: 0.8, max: 4.0, step: 0.1, state: 'EDITABLE', description: 'Flecha en cumbrera.' },
      { key: 'panelCount', label: 'Paneles', unit: 'uds', defaultValue: 4, min: 4, max: 8, step: 2, state: 'LOCKED', description: 'Típico 4 paneles.' }
    ],
    supportedSupports: ['PINNED', 'ROLLER'],
    supportedRoofFamilies: ['DOUBLE_SLOPE', 'GABLE'],
    fabricationRules: ['Nodos de cumbrera y talón simplificados'],
    auditRules: ['Longitud no arriostrada de cuerda superior'],
    svgIcon: 'wtruss'
  },
  {
    id: 'TR-09',
    code: 'VIERENDEEL',
    name: 'Vierendeel (Marco Rígido Sin Diagonales)',
    family: 'SPECIAL',
    shortDesc: 'Sin diagonales triangulares; transmite cargas puramente por flexión y cortante en nudos rígidos.',
    dna: {
      topology: 'Rigid rectangular framed bays without diagonal web members',
      chordCount: 2,
      webPattern: 'FRAME_RIGID_JOINTS',
      verticals: true,
      symmetry: 'BILATERAL',
      panelization: 'UNIFORM',
      depth: 'PARAMETRIC',
      span: 'PARAMETRIC',
      supportModel: '2_POINT_FIXED_JOINTS',
      connectionModel: 'FULL_PENETRATION_MOMENT_WELDS',
      notes: 'Permite paso libre peatonal o ductos de ventilación en el interior de la viga.'
    },
    parameterSchema: [
      { key: 'span', label: 'Claro (Span)', unit: 'm', defaultValue: 12.0, min: 4.0, max: 30.0, step: 0.5, state: 'EDITABLE', description: 'Claro.' },
      { key: 'depth', label: 'Peralte (Depth)', unit: 'm', defaultValue: 1.5, min: 0.8, max: 4.0, step: 0.1, state: 'EDITABLE', description: 'Peralte constante.' },
      { key: 'panelCount', label: 'Cantidad de Marcos', unit: 'uds', defaultValue: 6, min: 3, max: 16, step: 1, state: 'EDITABLE', description: 'Número de vanos rectangulares.' }
    ],
    supportedSupports: ['PINNED', 'FIXED'],
    supportedRoofFamilies: ['FLAT', 'CUSTOM'],
    fabricationRules: ['Nodos rígidos resistentes a momento soldados a penetración completa (CJP AWS D1.1)'],
    auditRules: ['Auditoría estricta de deflexión y momentos en esquinas de vanos'],
    svgIcon: 'vierendeel'
  },
  {
    id: 'TR-10',
    code: 'BOWSTRING',
    name: 'Bowstring (Arco y Tirante)',
    family: 'CURVED_STRUCTURE',
    shortDesc: 'Cuerda superior curva en arco parabólico con cuerda inferior recta actuando como tirante horizontal.',
    dna: {
      topology: 'Parabolic top chord arch + horizontal tie bottom chord with radial/vertical web',
      chordCount: 2,
      webPattern: 'RADIAL_OR_VERTICAL_WEB',
      verticals: true,
      symmetry: 'BILATERAL',
      panelization: 'UNIFORM',
      depth: 'PARAMETRIC',
      span: 'PARAMETRIC',
      supportModel: '2_POINT_PINNED_ROLLER',
      connectionModel: 'HEEL_GUSSET_TIE_ANCHOR',
      notes: 'Funicular de cargas gravitacionales uniformes: cuerda superior en compresión casi pura.'
    },
    parameterSchema: [
      { key: 'span', label: 'Claro (Span)', unit: 'm', defaultValue: 24.0, min: 10.0, max: 70.0, step: 1.0, state: 'EDITABLE', description: 'Claro.' },
      { key: 'rise', label: 'Flecha del Arco', unit: 'm', defaultValue: 3.5, min: 1.5, max: 12.0, step: 0.2, state: 'EDITABLE', description: 'Altura máxima del arco en el centro.' },
      { key: 'panelCount', label: 'Número de Paneles', unit: 'uds', defaultValue: 12, min: 6, max: 28, step: 2, state: 'EDITABLE', description: 'Puntos en el arco.' },
      { key: 'curveType', label: 'Curvatura (0:Parab / 1:Circ)', unit: 'tipo', defaultValue: 0, min: 0, max: 1, step: 1, state: 'EDITABLE', description: '0=Parábola, 1=Arco Circular.' }
    ],
    supportedSupports: ['PINNED', 'ROLLER'],
    supportedRoofFamilies: ['BARREL', 'CURVED', 'DOUBLE_SLOPE'],
    fabricationRules: ['Rolado en frío o calor de perfiles para cuerda superior', 'Tirante inferior con pretensado opcional'],
    auditRules: ['Verificación de empuje horizontal en talones y pandeo fuera del plano'],
    svgIcon: 'bowstring'
  },
  {
    id: 'TR-11',
    code: 'POLONCEAU',
    name: 'Polonceau (Cercha Compuesta)',
    family: 'ROOF_TRUSS',
    shortDesc: 'Cercha francesa articulada con sub-cerchas invertidas; cuerda inferior quebrada para mayor gálibo.',
    dna: {
      topology: 'Compound inverted-king-post sub-trusses articulated on top chords',
      chordCount: 2,
      webPattern: 'COMPOUND_SUBTRUSS',
      verticals: true,
      symmetry: 'BILATERAL',
      panelization: 'PARAMETRIC',
      depth: 'PARAMETRIC',
      span: 'PARAMETRIC',
      supportModel: '2_POINT_ARTICULATED',
      connectionModel: 'PINNED_TENSION_RODS',
      notes: 'Gran estética monumental del siglo XIX con máxima altura libre interior.'
    },
    parameterSchema: [
      { key: 'span', label: 'Claro (Span)', unit: 'm', defaultValue: 20.0, min: 8.0, max: 40.0, step: 1.0, state: 'EDITABLE', description: 'Claro.' },
      { key: 'rise', label: 'Flecha Exterior', unit: 'm', defaultValue: 3.0, min: 1.2, max: 6.0, step: 0.1, state: 'EDITABLE', description: 'Altura en cumbrera.' },
      { key: 'bottomRise', label: 'Elevación Cuerda Inferior', unit: 'm', defaultValue: 1.0, min: 0.2, max: 3.0, step: 0.1, state: 'EDITABLE', description: 'Gálibo central interior.' },
      { key: 'panelCount', label: 'Paneles', unit: 'uds', defaultValue: 8, min: 4, max: 16, step: 2, state: 'EDITABLE', description: 'Subdivisiones.' }
    ],
    supportedSupports: ['PINNED', 'ROLLER'],
    supportedRoofFamilies: ['DOUBLE_SLOPE', 'GABLE'],
    fabricationRules: ['Tirantes inferiores de redondo macizo roscado'],
    auditRules: ['Desplazamiento horizontal en apoyos'],
    svgIcon: 'polonceau'
  },
  {
    id: 'TR-12',
    code: 'SCISSORS',
    name: 'Scissors (Cercha Tijera Vaulted)',
    family: 'ROOF_TRUSS',
    shortDesc: 'Cuerdas inferiores inclinadas que se cruzan para crear techos abovedados con pendiente interior.',
    dna: {
      topology: 'Incline intersecting bottom chords creating cathedral interior clearance',
      chordCount: 2,
      webPattern: 'SCISSOR_INTERSECTING',
      verticals: true,
      symmetry: 'BILATERAL',
      panelization: 'UNIFORM',
      depth: 'PARAMETRIC',
      span: 'PARAMETRIC',
      supportModel: '2_POINT_HORIZ_SLIDE_ALLOWED',
      connectionModel: 'GUSSET_INTERSECTION',
      notes: 'Aumenta el volumen libre interior; genera empujes laterales significativos en muros.'
    },
    parameterSchema: [
      { key: 'span', label: 'Claro (Span)', unit: 'm', defaultValue: 14.0, min: 6.0, max: 25.0, step: 0.5, state: 'EDITABLE', description: 'Claro.' },
      { key: 'rise', label: 'Flecha Exterior', unit: 'm', defaultValue: 2.8, min: 1.2, max: 5.0, step: 0.1, state: 'EDITABLE', description: 'Pico exterior.' },
      { key: 'innerRise', label: 'Flecha Interior (Bóveda)', unit: 'm', defaultValue: 1.4, min: 0.4, max: 3.0, step: 0.1, state: 'EDITABLE', description: 'Altura central de la cuerda inferior.' },
      { key: 'panelCount', label: 'Paneles', unit: 'uds', defaultValue: 8, min: 4, max: 12, step: 2, state: 'EDITABLE', description: 'Paneles.' }
    ],
    supportedSupports: ['PINNED', 'ROLLER'],
    supportedRoofFamilies: ['DOUBLE_SLOPE', 'GABLE'],
    fabricationRules: ['Nodo de cruce central reforzado con cartabón doble'],
    auditRules: ['Auditoría obligatoria de empuje lateral en apoyos (Spread Force)'],
    svgIcon: 'scissors'
  },
  {
    id: 'TR-13',
    code: 'THREE_CHORD',
    name: 'Three-Chord (Triangular Espacial)',
    family: 'SPACE_STRUCTURE',
    shortDesc: 'Viga celosía tridimensional de 3 cuerdas longitudinales con sección transversal triangular.',
    dna: {
      topology: '3D tubular truss with 1 apex chord + 2 base chords laced in 3 planes',
      chordCount: 3,
      webPattern: '3D_TRIANGULAR_LACED',
      verticals: 'OPTIONAL',
      symmetry: 'BILATERAL',
      panelization: 'UNIFORM',
      depth: 'PARAMETRIC',
      span: 'PARAMETRIC',
      supportModel: '2_POINT_OR_4_POINT',
      connectionModel: 'TUBULAR_CLUSTER_NODES',
      notes: 'Excepcional rigidez torsional y resistencia al viento lateral sin necesidad de arriostramiento secundario.'
    },
    parameterSchema: [
      { key: 'span', label: 'Claro (Span)', unit: 'm', defaultValue: 18.0, min: 8.0, max: 45.0, step: 1.0, state: 'EDITABLE', description: 'Claro longitudinal.' },
      { key: 'depth', label: 'Peralte (Altura Triángulo)', unit: 'm', defaultValue: 1.2, min: 0.6, max: 3.0, step: 0.1, state: 'EDITABLE', description: 'Altura.' },
      { key: 'width', label: 'Ancho Base', unit: 'm', defaultValue: 1.0, min: 0.5, max: 2.5, step: 0.1, state: 'EDITABLE', description: 'Distancia entre cuerdas inferiores.' },
      { key: 'panelCount', label: 'Paneles Longitudinales', unit: 'uds', defaultValue: 12, min: 6, max: 24, step: 2, state: 'EDITABLE', description: 'Módulos.' }
    ],
    supportedSupports: ['PINNED', 'FIXED'],
    supportedRoofFamilies: ['FLAT', 'BARREL', 'CUSTOM'],
    fabricationRules: ['Corte CNC tubular robotizado de bocas de pescado en diagonales'],
    auditRules: ['Rigidez torsional y estabilidad aeroelástica'],
    svgIcon: 'threechord'
  },
  {
    id: 'TR-14',
    code: 'SPACE_TRUSS',
    name: 'Space Truss (Malla Espacial 3D)',
    family: 'SPACE_STRUCTURE',
    shortDesc: 'Estructura espacial bidireccional de doble capa modular piramidal/octaédrica con nudos esféricos.',
    dna: {
      topology: 'Double-layer 3D space grid with orthogonal/diagonal pyramidal modules',
      chordCount: 4,
      webPattern: '3D_PYRAMIDAL_SPACE_GRID',
      verticals: false,
      symmetry: 'BILATERAL',
      panelization: 'UNIFORM',
      depth: 'PARAMETRIC',
      span: 'PARAMETRIC',
      supportModel: 'MULTI_COLUMN_PERIMETER_OR_CORNERS',
      connectionModel: 'MERO_SPHERICAL_NODES_BOLTED',
      notes: 'Permite cubrir claros colosales de hasta 100m con distribución bidireccional de esfuerzos.'
    },
    parameterSchema: [
      { key: 'spanX', label: 'Dimensión X (Claro)', unit: 'm', defaultValue: 20.0, min: 10.0, max: 80.0, step: 2.0, state: 'EDITABLE', description: 'Longitud en X.' },
      { key: 'spanY', label: 'Dimensión Y (Ancho)', unit: 'm', defaultValue: 20.0, min: 10.0, max: 80.0, step: 2.0, state: 'EDITABLE', description: 'Longitud en Y.' },
      { key: 'depth', label: 'Peralte Capa', unit: 'm', defaultValue: 1.5, min: 0.8, max: 4.0, step: 0.1, state: 'EDITABLE', description: 'Espesor de la malla.' },
      { key: 'moduleSize', label: 'Tamaño de Módulo', unit: 'm', defaultValue: 2.0, min: 1.0, max: 4.0, step: 0.25, state: 'EDITABLE', description: 'Lado del módulo piramidal.' }
    ],
    supportedSupports: ['PINNED', 'ROLLER', 'ELASTIC'],
    supportedRoofFamilies: ['FLAT', 'CURVED', 'BARREL'],
    fabricationRules: ['Esferas de nudo mecanizadas CNC con roscas interiores forjadas'],
    auditRules: ['Pandeo global de la malla y deflexión central máxima L/400'],
    svgIcon: 'spacetruss'
  },
  {
    id: 'TR-15',
    code: 'SAWTOOTH',
    name: 'Sawtooth Truss (Diente de Sierra)',
    family: 'ROOF_TRUSS',
    shortDesc: 'Cercha asimétrica con montante vertical alto para ventanales de iluminación cenital.',
    dna: {
      topology: 'Asymmetric sawtooth frame with steep vertical glazed face and inclined slope',
      chordCount: 2,
      webPattern: 'SAWTOOTH_ASYMMETRIC',
      verticals: true,
      symmetry: 'NONE',
      panelization: 'VARIABLE',
      depth: 'PARAMETRIC',
      span: 'PARAMETRIC',
      supportModel: '2_POINT',
      connectionModel: 'GUSSET_WELDED',
      notes: 'La clásica cercha industrial textil para luz diurna difusa sin radiación solar directa.'
    },
    parameterSchema: [
      { key: 'span', label: 'Claro (Span)', unit: 'm', defaultValue: 12.0, min: 6.0, max: 25.0, step: 0.5, state: 'EDITABLE', description: 'Ancho del diente.' },
      { key: 'windowHeight', label: 'Altura Ventanal Vertical', unit: 'm', defaultValue: 2.0, min: 1.0, max: 4.0, step: 0.1, state: 'EDITABLE', description: 'Pared vertical translúcida.' },
      { key: 'slopeAngle', label: 'Ángulo Cubierta', unit: '°', defaultValue: 22, min: 10, max: 45, step: 1, state: 'EDITABLE', description: 'Inclinación de la vertiente.' },
      { key: 'panelCount', label: 'Paneles', unit: 'uds', defaultValue: 6, min: 3, max: 12, step: 1, state: 'EDITABLE', description: 'Divisiones.' }
    ],
    supportedSupports: ['PINNED', 'ROLLER'],
    supportedRoofFamilies: ['SAWTOOTH', 'SINGLE_SLOPE'],
    fabricationRules: ['Soportes para marcos de ventanería integrados'],
    auditRules: ['Comportamiento frente a acumulación de agua y nieve en canalón interior'],
    svgIcon: 'sawtooth'
  },
  {
    id: 'TR-16',
    code: 'SHED',
    name: 'Shed Truss (Cercha Monopendiente)',
    family: 'ROOF_TRUSS',
    shortDesc: 'Cercha triangular monopendiente con apoyo alto en un extremo y talón bajo en el opuesto.',
    dna: {
      topology: 'Right-triangle mono-slope truss with vertical heel/post',
      chordCount: 2,
      webPattern: 'PRATT_OR_WARREN_SHED',
      verticals: true,
      symmetry: 'NONE',
      panelization: 'UNIFORM',
      depth: 'PARAMETRIC',
      span: 'PARAMETRIC',
      supportModel: '2_POINT',
      connectionModel: 'GUSSET',
      notes: 'Perfecta para adosamientos, naves laterales o módulos fotovoltaicos orientados.'
    },
    parameterSchema: [
      { key: 'span', label: 'Claro (Span)', unit: 'm', defaultValue: 10.0, min: 4.0, max: 24.0, step: 0.5, state: 'EDITABLE', description: 'Claro horizontal.' },
      { key: 'maxHeight', label: 'Altura Mayor', unit: 'm', defaultValue: 1.8, min: 0.6, max: 4.5, step: 0.1, state: 'EDITABLE', description: 'Peralte en extremo alto.' },
      { key: 'minHeight', label: 'Altura Menor (Talón)', unit: 'm', defaultValue: 0.4, min: 0.2, max: 2.0, step: 0.05, state: 'EDITABLE', description: 'Peralte en extremo bajo.' },
      { key: 'panelCount', label: 'Paneles', unit: 'uds', defaultValue: 6, min: 3, max: 16, step: 1, state: 'EDITABLE', description: 'Paneles.' }
    ],
    supportedSupports: ['PINNED', 'ROLLER'],
    supportedRoofFamilies: ['SINGLE_SLOPE', 'SHED'],
    fabricationRules: ['Detalle de talón articulado bajo con transferencia de cortante'],
    auditRules: ['Succión de viento ascendente en voladizo'],
    svgIcon: 'shed'
  },
  {
    id: 'TR-17',
    code: 'CANTILEVER',
    name: 'Cantilever (Cercha en Voladizo)',
    family: 'SPECIAL',
    shortDesc: 'Cercha con apoyo empotrado/doble apoyo en raíz y extremo libre en voladizo para marquesinas.',
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
      notes: 'Cuerda superior trabaja a tracción pura bajo cargas gravitacionales; cuerda inferior comprimida.'
    },
    parameterSchema: [
      { key: 'overhang', label: 'Vuelo / Voladizo (Length)', unit: 'm', defaultValue: 8.0, min: 3.0, max: 25.0, step: 0.5, state: 'EDITABLE', description: 'Longitud del vuelo libre.' },
      { key: 'rootDepth', label: 'Peralte en Empotramiento (Raíz)', unit: 'm', defaultValue: 1.8, min: 0.8, max: 4.0, step: 0.1, state: 'EDITABLE', description: 'Peralte en el apoyo.' },
      { key: 'tipDepth', label: 'Peralte en Punta (Extremo)', unit: 'm', defaultValue: 0.4, min: 0.2, max: 1.5, step: 0.05, state: 'EDITABLE', description: 'Peralte en punta.' },
      { key: 'panelCount', label: 'Paneles', unit: 'uds', defaultValue: 6, min: 3, max: 14, step: 1, state: 'EDITABLE', description: 'Divisiones.' }
    ],
    supportedSupports: ['FIXED', 'CANTILEVER'],
    supportedRoofFamilies: ['SINGLE_SLOPE', 'SHED', 'FLAT'],
    fabricationRules: ['Conexión de momento de alta resistencia en columna principal'],
    auditRules: ['Deflexión en punta (frecuencia propia y vibraciones por viento)'],
    svgIcon: 'cantilever'
  },
  {
    id: 'TR-18',
    code: 'CUSTOM',
    name: 'Custom Grammar / Topología Libre',
    family: 'SPECIAL',
    shortDesc: 'Generador de gramática libre con nodos, barras, coordenadas y patrones definidos por el usuario.',
    dna: {
      topology: 'User-authored topological graph validated against structural graph continuum rules',
      chordCount: 2,
      webPattern: 'USER_CUSTOM',
      verticals: 'OPTIONAL',
      symmetry: 'PARAMETRIC',
      panelization: 'PARAMETRIC',
      depth: 'PARAMETRIC',
      span: 'PARAMETRIC',
      supportModel: 'CONFIGURABLE',
      connectionModel: 'CUSTOM_NODE_SYSTEM',
      notes: 'Permite innovar tipologías no catalogadas sometidas al pipeline de validación y archivo.'
    },
    parameterSchema: [
      { key: 'span', label: 'Claro General (Span)', unit: 'm', defaultValue: 16.0, min: 4.0, max: 80.0, step: 1.0, state: 'EDITABLE', description: 'Claro de referencia.' },
      { key: 'depth', label: 'Peralte Referencial', unit: 'm', defaultValue: 1.8, min: 0.4, max: 8.0, step: 0.1, state: 'EDITABLE', description: 'Peralte.' },
      { key: 'customNodesCount', label: 'Nodos Personalizados', unit: 'uds', defaultValue: 14, min: 3, max: 150, step: 1, state: 'EDITABLE', description: 'Conteo de nodos del grafo.' },
      { key: 'customMembersCount', label: 'Barras Personalizadas', unit: 'uds', defaultValue: 25, min: 2, max: 300, step: 1, state: 'EDITABLE', description: 'Conteo de barras.' }
    ],
    supportedSupports: ['PINNED', 'ROLLER', 'FIXED', 'CANTILEVER', 'ELASTIC'],
    supportedRoofFamilies: ['CUSTOM', 'DOUBLE_SLOPE', 'FLAT', 'CURVED'],
    fabricationRules: ['Inspección dimensional individual por barra'],
    auditRules: ['Validación estricta de mecanismos cinemáticos y continuidad de carga'],
    svgIcon: 'custom'
  }
];

// Helper functions to get definitions
export function getTrussTypology(idOrCode: string): TrussTypologyDefinition {
  const found = TRUSS_CATALOG.find(
    (t) => t.id.toUpperCase() === idOrCode.toUpperCase() || t.code.toUpperCase() === idOrCode.toUpperCase()
  );
  if (found) return found;

  // Search in extended 53 catalog
  const found53 = MASTER_53_TRUSS_CATALOG.find(
    (t) => t.id.toUpperCase() === idOrCode.toUpperCase() || t.code.toUpperCase() === idOrCode.toUpperCase()
  );
  if (found53) return found53;

  return TRUSS_CATALOG[0];
}

export function getRoofTypology(idOrCode: string): RoofTypologyDefinition {
  const found = ROOF_CATALOG.find(
    (r) => r.id.toUpperCase() === idOrCode.toUpperCase() || r.code.toUpperCase() === idOrCode.toUpperCase()
  );
  return found || ROOF_CATALOG[2]; // Default to DOUBLE_SLOPE
}

export function getTrussesByFamily(family: TrussFamily): TrussTypologyDefinition[] {
  return MASTER_53_TRUSS_CATALOG.filter((t) => t.family === family);
}

// ============================================================
// 3. MASTER 53-TYPOLOGY COMPREHENSIVE ONTOLOGY
// Families: A (Planas), B (Inclinadas), C (Espaciales), D (Curvas), E (Especiales)
// ============================================================

export interface Master53TypologyItem extends TrussTypologyDefinition {
  itemNumber: number;
  familyCategory: 'A — Cerchas planas' | 'B — Cerchas de cubierta inclinada' | 'C — Sistemas espaciales' | 'D — Sistemas curvos' | 'E — Sistemas especiales';
  recommendedSpanM: { min: number; max: number };
  typicalLdRatio: string;
  loadBehavior: string;
  connectionNotes: string;
}

export const MASTER_53_TRUSS_CATALOG: Master53TypologyItem[] = [
  // ----------------------------------------------------
  // A — CERCHAS PLANAS (1 - 14)
  // ----------------------------------------------------
  {
    ...TRUSS_CATALOG[0], // Warren
    itemNumber: 1,
    familyCategory: 'A — Cerchas planas',
    recommendedSpanM: { min: 6, max: 40 },
    typicalLdRatio: 'L/10 - L/16',
    loadBehavior: 'Diagonales alternan compresión y tracción pura; cuerdas absorben flexión global.',
    connectionNotes: 'Nudos atornillados o soldados con cartabón central plano.'
  },
  {
    id: 'TR-01B',
    code: 'WARREN_MODIFIED',
    name: 'Warren Modificada (Con Montantes)',
    family: 'FLAT_TRUSS',
    shortDesc: 'Warren clásica con montantes verticales añadidos en nudos para apoyar correas intermedias.',
    dna: {
      topology: 'Alternating diagonals + intermediate vertical struts',
      chordCount: 2,
      webPattern: 'WARREN_WITH_VERTICALS',
      verticals: true,
      symmetry: 'BILATERAL',
      panelization: 'UNIFORM',
      depth: 'PARAMETRIC',
      span: 'PARAMETRIC',
      supportModel: '2_POINT_END_BEARING',
      connectionModel: 'GUSSET_PLATE',
      notes: 'Reduce la longitud de pandeo en cuerda superior y subdivide la luz de correas.'
    },
    parameterSchema: [
      { key: 'span', label: 'Claro (Span)', unit: 'm', defaultValue: 16.0, min: 6.0, max: 45.0, step: 0.5, state: 'EDITABLE', description: 'Claro libre.' },
      { key: 'depth', label: 'Peralte (Depth)', unit: 'm', defaultValue: 1.4, min: 0.6, max: 4.0, step: 0.05, state: 'EDITABLE', description: 'Peralte entre ejes.' },
      { key: 'panelCount', label: 'Número de Paneles', unit: 'uds', defaultValue: 12, min: 4, max: 28, step: 2, state: 'EDITABLE', description: 'Divisiones.' }
    ],
    supportedSupports: ['PINNED', 'ROLLER', 'FIXED'],
    supportedRoofFamilies: ['FLAT', 'SINGLE_SLOPE', 'DOUBLE_SLOPE'],
    fabricationRules: ['Montantes verticales con cortes a 90°'],
    auditRules: ['Esbeltez kL/r en montantes < 200'],
    svgIcon: 'warren',
    itemNumber: 2,
    familyCategory: 'A — Cerchas planas',
    recommendedSpanM: { min: 8, max: 45 },
    typicalLdRatio: 'L/12 - L/16',
    loadBehavior: 'Montantes transmiten cargas de correas directamente a los nudos sin flexión local.',
    connectionNotes: 'Cartabones dobles simétricos.'
  },
  {
    ...TRUSS_CATALOG[1], // Pratt
    itemNumber: 3,
    familyCategory: 'A — Cerchas planas',
    recommendedSpanM: { min: 8, max: 40 },
    typicalLdRatio: 'L/10 - L/15',
    loadBehavior: 'Diagonales en tracción pura bajo cargas gravitatorias; montantes en compresión corta.',
    connectionNotes: 'Ideal para perfiles HSS / PTR con placas de nudo ranuradas.'
  },
  {
    ...TRUSS_CATALOG[2], // Howe
    itemNumber: 4,
    familyCategory: 'A — Cerchas planas',
    recommendedSpanM: { min: 6, max: 35 },
    typicalLdRatio: 'L/10 - L/14',
    loadBehavior: 'Diagonales comprimidas hacia apoyos; montantes en tracción (aptos para redondos macizos).',
    connectionNotes: 'Tensores roscados en montantes verticales.'
  },
  {
    id: 'TR-04B',
    code: 'FINK_FLAT',
    name: 'Fink de Cuerdas Paralelas',
    family: 'FLAT_TRUSS',
    shortDesc: 'Subdivisión tipo Fink adaptada a cuerdas horizontales para forjados y pisos técnicos.',
    dna: {
      topology: 'Subdivided V-webbing in parallel horizontal chord matrix',
      chordCount: 2,
      webPattern: 'FINK_PARALLEL',
      verticals: true,
      symmetry: 'BILATERAL',
      panelization: 'PARAMETRIC',
      depth: 'PARAMETRIC',
      span: 'PARAMETRIC',
      supportModel: '2_POINT',
      connectionModel: 'WELDED_NODES',
      notes: 'Alta densidad de nudos en cuerda superior para cargas distribuidas densas.'
    },
    parameterSchema: [
      { key: 'span', label: 'Claro', unit: 'm', defaultValue: 14.0, min: 6.0, max: 30.0, step: 0.5, state: 'EDITABLE', description: 'Claro horizontal.' },
      { key: 'depth', label: 'Peralte', unit: 'm', defaultValue: 1.2, min: 0.5, max: 3.0, step: 0.05, state: 'EDITABLE', description: 'Peralte.' },
      { key: 'panelCount', label: 'Paneles', unit: 'uds', defaultValue: 8, min: 4, max: 16, step: 2, state: 'EDITABLE', description: 'Divisiones.' }
    ],
    supportedSupports: ['PINNED', 'ROLLER'],
    supportedRoofFamilies: ['FLAT'],
    fabricationRules: ['Estandarización de diagonales secundarias'],
    auditRules: ['Control de deflexión viva L/360'],
    svgIcon: 'fink',
    itemNumber: 5,
    familyCategory: 'A — Cerchas planas',
    recommendedSpanM: { min: 8, max: 32 },
    typicalLdRatio: 'L/12 - L/18',
    loadBehavior: 'Subdivisión triangular rígida con baja deformación elástica.',
    connectionNotes: 'Soldaduras de filete continuas.'
  },
  {
    ...TRUSS_CATALOG[5], // Baltimore
    itemNumber: 6,
    familyCategory: 'A — Cerchas planas',
    recommendedSpanM: { min: 14, max: 60 },
    typicalLdRatio: 'L/10 - L/14',
    loadBehavior: 'Sub-panelizado para reducir longitud de pandeo de cuerda superior y diagonales.',
    connectionNotes: 'Empalmes de taller a 1/3 de la luz con pernos A325 / A490.'
  },
  {
    ...TRUSS_CATALOG[4], // K-Truss
    itemNumber: 7,
    familyCategory: 'A — Cerchas planas',
    recommendedSpanM: { min: 16, max: 70 },
    typicalLdRatio: 'L/8 - L/12',
    loadBehavior: 'Diagonales divididas en K minimizan longitud de pandeo en cerchas muy altas.',
    connectionNotes: 'Nodo central bisecado en montante vertical.'
  },
  {
    ...TRUSS_CATALOG[6], // N-Truss
    itemNumber: 8,
    familyCategory: 'A — Cerchas planas',
    recommendedSpanM: { min: 8, max: 36 },
    typicalLdRatio: 'L/10 - L/15',
    loadBehavior: 'Patrón monodireccional constante por semi-vano.',
    connectionNotes: 'Fácil modulación en corte y armado en banco.'
  },
  {
    ...TRUSS_CATALOG[7], // W-Truss
    itemNumber: 9,
    familyCategory: 'A — Cerchas planas',
    recommendedSpanM: { min: 6, max: 22 },
    typicalLdRatio: 'L/10 - L/16',
    loadBehavior: 'Geometría mínima de 4 a 6 barras para montajes rápidos y ligeros.',
    connectionNotes: 'Placas dentadas o cartabones de 6 mm.'
  },
  {
    ...TRUSS_CATALOG[8], // Vierendeel
    itemNumber: 10,
    familyCategory: 'A — Cerchas planas',
    recommendedSpanM: { min: 8, max: 32 },
    typicalLdRatio: 'L/6 - L/10',
    loadBehavior: 'Transmisión puramente por flexión y cortante en marcos rígidos ortogonales.',
    connectionNotes: 'Soldaduras a penetración completa (CJP) en esquinas.'
  },
  {
    ...TRUSS_CATALOG[12], // Three-Chord (TR-13)
    itemNumber: 11,
    familyCategory: 'A — Cerchas planas',
    recommendedSpanM: { min: 10, max: 50 },
    typicalLdRatio: 'L/12 - L/18',
    loadBehavior: 'Rigidez espacial tridimensional triangular auto-arriostrada.',
    connectionNotes: 'Nudos tubulares con soldadura robotizada.'
  },
  {
    id: 'TR-16B',
    code: 'DOUBLE_PITCH_FLAT_CHORD',
    name: 'Truss de Doble Pendiente con Cuerda Plana',
    family: 'FLAT_TRUSS',
    shortDesc: 'Cuerda inferior horizontal continua y cuerda superior a dos vertientes simétricas.',
    dna: {
      topology: 'Pitched top chord with flat horizontal bottom chord',
      chordCount: 2,
      webPattern: 'PRATT_OR_WARREN_GABLE',
      verticals: true,
      symmetry: 'BILATERAL',
      panelization: 'UNIFORM',
      depth: 'PARAMETRIC',
      span: 'PARAMETRIC',
      supportModel: '2_POINT_PINNED',
      connectionModel: 'GUSSET_PLATE',
      notes: 'La clásica cercha industrial para naves a dos aguas con falso plafón horizontal.'
    },
    parameterSchema: [
      { key: 'span', label: 'Claro (Span)', unit: 'm', defaultValue: 18.0, min: 6.0, max: 40.0, step: 0.5, state: 'EDITABLE', description: 'Luz entre columnas.' },
      { key: 'rise', label: 'Flecha en Cumbrera', unit: 'm', defaultValue: 2.4, min: 0.8, max: 5.0, step: 0.1, state: 'EDITABLE', description: 'Altura en vértice.' },
      { key: 'panelCount', label: 'Paneles', unit: 'uds', defaultValue: 10, min: 4, max: 20, step: 2, state: 'EDITABLE', description: 'Divisiones.' }
    ],
    supportedSupports: ['PINNED', 'ROLLER'],
    supportedRoofFamilies: ['DOUBLE_SLOPE', 'GABLE'],
    fabricationRules: ['Talón biselado en extremo para apoyo en placa'],
    auditRules: ['Pendiente de techo > 8°'],
    svgIcon: 'pratt',
    itemNumber: 12,
    familyCategory: 'A — Cerchas planas',
    recommendedSpanM: { min: 10, max: 40 },
    typicalLdRatio: 'L/7 - L/12',
    loadBehavior: 'Fuerte tracción en cuerda inferior horizontal; compresión biaxial en cumbrera.',
    connectionNotes: 'Placa de talón con pernos ranurados para dilatación térmica.'
  },
  {
    id: 'TR-13B',
    code: 'PARALLEL_CHORD',
    name: 'Truss de Cuerda Paralela (Parallel Chord)',
    family: 'FLAT_TRUSS',
    shortDesc: 'Cuerdas superior e inferior perfectamente paralelas con diagonales de pendiente constante.',
    dna: {
      topology: 'Parallel equal chords with constant depth throughout span',
      chordCount: 2,
      webPattern: 'WARREN_PARALLEL',
      verticals: true,
      symmetry: 'BILATERAL',
      panelization: 'UNIFORM',
      depth: 'PARAMETRIC',
      span: 'PARAMETRIC',
      supportModel: '2_POINT',
      connectionModel: 'STANDARD_GUSSET',
      notes: 'Máxima facilidad de estandarización y apilamiento para transporte carretero.'
    },
    parameterSchema: [
      { key: 'span', label: 'Claro (Span)', unit: 'm', defaultValue: 15.0, min: 6.0, max: 35.0, step: 0.5, state: 'EDITABLE', description: 'Claro.' },
      { key: 'depth', label: 'Peralte', unit: 'm', defaultValue: 1.2, min: 0.5, max: 3.0, step: 0.05, state: 'EDITABLE', description: 'Peralte constante.' },
      { key: 'panelCount', label: 'Paneles', unit: 'uds', defaultValue: 10, min: 4, max: 20, step: 2, state: 'EDITABLE', description: 'Divisiones.' }
    ],
    supportedSupports: ['PINNED', 'ROLLER'],
    supportedRoofFamilies: ['FLAT', 'SINGLE_SLOPE'],
    fabricationRules: ['Corte repetitivo idéntico para todas las diagonales'],
    auditRules: ['Deflexión central L/300'],
    svgIcon: 'warren',
    itemNumber: 13,
    familyCategory: 'A — Cerchas planas',
    recommendedSpanM: { min: 8, max: 35 },
    typicalLdRatio: 'L/12 - L/16',
    loadBehavior: 'Momento flector máximo en centro de vano; cortante puro absorbido en extremos.',
    connectionNotes: 'Conexión de asiento sobre ménsula de columna.'
  },
  {
    id: 'TR-14B',
    code: 'VARIABLE_DEPTH_FLAT',
    name: 'Truss de Peralte Variable (Fishbelly / Trapezoidal)',
    family: 'FLAT_TRUSS',
    shortDesc: 'Peralte mayor en centro de luz adaptándose a la envolvente parabólica de momentos.',
    dna: {
      topology: 'Tapered bottom chord creating polygonal moment envelope',
      chordCount: 2,
      webPattern: 'TAPERED_WARREN',
      verticals: true,
      symmetry: 'BILATERAL',
      panelization: 'VARIABLE',
      depth: 'PARAMETRIC',
      span: 'PARAMETRIC',
      supportModel: '2_POINT',
      connectionModel: 'GUSSET_WELDED',
      notes: 'Optimiza el volumen de acero eliminando masa en los extremos de bajo momento.'
    },
    parameterSchema: [
      { key: 'span', label: 'Claro (Span)', unit: 'm', defaultValue: 22.0, min: 10.0, max: 50.0, step: 1.0, state: 'EDITABLE', description: 'Claro total.' },
      { key: 'centerDepth', label: 'Peralte Central', unit: 'm', defaultValue: 2.2, min: 1.0, max: 4.5, step: 0.1, state: 'EDITABLE', description: 'Altura en el centro.' },
      { key: 'endDepth', label: 'Peralte en Apoyo', unit: 'm', defaultValue: 0.8, min: 0.3, max: 2.0, step: 0.05, state: 'EDITABLE', description: 'Altura en talón.' },
      { key: 'panelCount', label: 'Paneles', unit: 'uds', defaultValue: 12, min: 6, max: 24, step: 2, state: 'EDITABLE', description: 'Paneles.' }
    ],
    supportedSupports: ['PINNED', 'ROLLER'],
    supportedRoofFamilies: ['FLAT', 'CUSTOM'],
    fabricationRules: ['Nodos angulados variables en cuerda inferior'],
    auditRules: ['Pandeo lateral torsional en cuerdas'],
    svgIcon: 'custom',
    itemNumber: 14,
    familyCategory: 'A — Cerchas planas',
    recommendedSpanM: { min: 12, max: 50 },
    typicalLdRatio: 'L/10 - L/14',
    loadBehavior: 'Brazo de palanca interno variable proporcional al momento flector $M(x)$.',
    connectionNotes: 'Placa de continuidad en vértice inferior.'
  },

  // ----------------------------------------------------
  // B — CERCHAS DE CUBIERTA INCLINADA (15 - 28)
  // ----------------------------------------------------
  {
    id: 'TR-15P',
    code: 'PRATT_PITCHED',
    name: 'Pratt Inclinada (Pitched Pratt)',
    family: 'ROOF_TRUSS',
    shortDesc: 'Cercha a dos aguas con montantes verticales y diagonales que traccionan hacia cumbrera.',
    dna: {
      topology: 'Double-slope top chords + vertical compression posts + tension diagonals',
      chordCount: 2,
      webPattern: 'PITCHED_PRATT',
      verticals: true,
      symmetry: 'BILATERAL',
      panelization: 'UNIFORM',
      depth: 'PARAMETRIC',
      span: 'PARAMETRIC',
      supportModel: '2_POINT',
      connectionModel: 'GUSSET',
      notes: 'La reina de las cerchas industriales inclinadas para climas con lluvia moderada.'
    },
    parameterSchema: [
      { key: 'span', label: 'Claro (Span)', unit: 'm', defaultValue: 18.0, min: 8.0, max: 36.0, step: 0.5, state: 'EDITABLE', description: 'Claro.' },
      { key: 'rise', label: 'Flecha Cumbrera', unit: 'm', defaultValue: 2.5, min: 1.0, max: 5.0, step: 0.1, state: 'EDITABLE', description: 'Altura en cumbrera.' },
      { key: 'panelCount', label: 'Paneles', unit: 'uds', defaultValue: 10, min: 4, max: 20, step: 2, state: 'EDITABLE', description: 'Divisiones.' }
    ],
    supportedSupports: ['PINNED', 'ROLLER'],
    supportedRoofFamilies: ['DOUBLE_SLOPE', 'GABLE'],
    fabricationRules: ['Cartabón triangular en nodo de cumbrera'],
    auditRules: ['Verificación de tracción en diagonales'],
    svgIcon: 'pratt',
    itemNumber: 15,
    familyCategory: 'B — Cerchas de cubierta inclinada',
    recommendedSpanM: { min: 8, max: 36 },
    typicalLdRatio: 'L/6 - L/10',
    loadBehavior: 'Fuerte componente horizontal de tracción en la cuerda inferior.',
    connectionNotes: 'Placas de talón con rigidizadores laterales.'
  },
  {
    id: 'TR-16P',
    code: 'HOWE_PITCHED',
    name: 'Howe Inclinada (Pitched Howe)',
    family: 'ROOF_TRUSS',
    shortDesc: 'Cercha inclinada con diagonales comprimidas hacia el centro y montantes verticales en tensión.',
    dna: {
      topology: 'Double-slope top chords + vertical tension ties + compression diagonals',
      chordCount: 2,
      webPattern: 'PITCHED_HOWE',
      verticals: true,
      symmetry: 'BILATERAL',
      panelization: 'UNIFORM',
      depth: 'PARAMETRIC',
      span: 'PARAMETRIC',
      supportModel: '2_POINT',
      connectionModel: 'GUSSET',
      notes: 'Adecuada para estructuras mixtas acero-madera o tensores circulares esbeltos.'
    },
    parameterSchema: [
      { key: 'span', label: 'Claro (Span)', unit: 'm', defaultValue: 16.0, min: 6.0, max: 32.0, step: 0.5, state: 'EDITABLE', description: 'Claro.' },
      { key: 'rise', label: 'Flecha', unit: 'm', defaultValue: 2.2, min: 0.8, max: 4.5, step: 0.1, state: 'EDITABLE', description: 'Altura en cumbrera.' },
      { key: 'panelCount', label: 'Paneles', unit: 'uds', defaultValue: 8, min: 4, max: 16, step: 2, state: 'EDITABLE', description: 'Divisiones.' }
    ],
    supportedSupports: ['PINNED', 'ROLLER'],
    supportedRoofFamilies: ['DOUBLE_SLOPE', 'GABLE'],
    fabricationRules: ['Diagonales con perfiles robustos para evitar pandeo'],
    auditRules: ['Pandeo por flexión kL/r en diagonales'],
    svgIcon: 'howe',
    itemNumber: 16,
    familyCategory: 'B — Cerchas de cubierta inclinada',
    recommendedSpanM: { min: 8, max: 32 },
    typicalLdRatio: 'L/6 - L/10',
    loadBehavior: 'Montantes en tracción simple con fácil tensado mecánico.',
    connectionNotes: 'Cartabones soldados estándar.'
  },
  {
    ...TRUSS_CATALOG[3], // Fink
    itemNumber: 17,
    familyCategory: 'B — Cerchas de cubierta inclinada',
    recommendedSpanM: { min: 10, max: 35 },
    typicalLdRatio: 'L/5 - L/8',
    loadBehavior: 'Subdivisión jerárquica que mantiene las diagonales cortas y resistentes al pandeo.',
    connectionNotes: 'Nodo de talón con cortante combinado.'
  },
  {
    id: 'TR-18P',
    code: 'FAN_FINK',
    name: 'Fink Modificada (Fan Fink / Double Fink)',
    family: 'ROOF_TRUSS',
    shortDesc: 'Cercha Fink con sub-diagonales en abanico para soportar vanos muy amplios.',
    dna: {
      topology: 'Fan-subdivided Fink truss with multi-tier rafter supports',
      chordCount: 2,
      webPattern: 'FAN_FINK_SUBDIVIDED',
      verticals: true,
      symmetry: 'BILATERAL',
      panelization: 'PARAMETRIC',
      depth: 'PARAMETRIC',
      span: 'PARAMETRIC',
      supportModel: '2_POINT',
      connectionModel: 'GUSSET',
      notes: 'Permite claros de hasta 40m sin sobrecargar la esbeltez de los pares superiores.'
    },
    parameterSchema: [
      { key: 'span', label: 'Claro (Span)', unit: 'm', defaultValue: 24.0, min: 12.0, max: 42.0, step: 1.0, state: 'EDITABLE', description: 'Claro.' },
      { key: 'rise', label: 'Flecha', unit: 'm', defaultValue: 3.5, min: 1.5, max: 6.5, step: 0.1, state: 'EDITABLE', description: 'Flecha en cumbrera.' },
      { key: 'panelCount', label: 'Paneles', unit: 'uds', defaultValue: 16, min: 8, max: 24, step: 4, state: 'EDITABLE', description: 'Divisiones.' }
    ],
    supportedSupports: ['PINNED', 'ROLLER'],
    supportedRoofFamilies: ['DOUBLE_SLOPE', 'GABLE'],
    fabricationRules: ['Nodos radiales convergentes en tercio inferior'],
    auditRules: ['Esbeltez de cuerda inferior'],
    svgIcon: 'fink',
    itemNumber: 18,
    familyCategory: 'B — Cerchas de cubierta inclinada',
    recommendedSpanM: { min: 12, max: 42 },
    typicalLdRatio: 'L/6 - L/9',
    loadBehavior: 'Múltiples puntales perpendiculares al faldón para reducir flexión en correas.',
    connectionNotes: 'Nudo de abanico con 4 a 5 barras concurrentes.'
  },
  {
    ...TRUSS_CATALOG[10], // Polonceau
    itemNumber: 19,
    familyCategory: 'B — Cerchas de cubierta inclinada',
    recommendedSpanM: { min: 12, max: 45 },
    typicalLdRatio: 'L/6 - L/9',
    loadBehavior: 'Sub-cerchas invertidas que descargan en tirantes principales.',
    connectionNotes: 'Tirantes de acero forjado con tensores de botella roscados.'
  },
  {
    id: 'TR-20P',
    code: 'BOWSTRING_PITCHED',
    name: 'Bowstring Inclinada (Curved Rafters)',
    family: 'ROOF_TRUSS',
    shortDesc: 'Cuerda superior abovedada con pendiente perimetral acentuada para drenaje pluvial rápido.',
    dna: {
      topology: 'Parabolic top chords + segmented bottom chord',
      chordCount: 2,
      webPattern: 'RADIAL_WARREN',
      verticals: true,
      symmetry: 'BILATERAL',
      panelization: 'UNIFORM',
      depth: 'PARAMETRIC',
      span: 'PARAMETRIC',
      supportModel: '2_POINT',
      connectionModel: 'GUSSET',
      notes: 'Combina la estética del arco con la facilidad constructiva de una cercha perimetral.'
    },
    parameterSchema: [
      { key: 'span', label: 'Claro (Span)', unit: 'm', defaultValue: 20.0, min: 8.0, max: 48.0, step: 1.0, state: 'EDITABLE', description: 'Claro.' },
      { key: 'rise', label: 'Flecha', unit: 'm', defaultValue: 3.0, min: 1.2, max: 6.0, step: 0.1, state: 'EDITABLE', description: 'Flecha.' },
      { key: 'panelCount', label: 'Paneles', unit: 'uds', defaultValue: 12, min: 6, max: 24, step: 2, state: 'EDITABLE', description: 'Paneles.' }
    ],
    supportedSupports: ['PINNED', 'ROLLER'],
    supportedRoofFamilies: ['BARREL', 'CURVED', 'DOUBLE_SLOPE'],
    fabricationRules: ['Curvado de tubos HSS en curvadora de 3 rodillos'],
    auditRules: ['Ovalización de perfiles tubulares curvados'],
    svgIcon: 'bowstring',
    itemNumber: 20,
    familyCategory: 'B — Cerchas de cubierta inclinada',
    recommendedSpanM: { min: 12, max: 48 },
    typicalLdRatio: 'L/7 - L/10',
    loadBehavior: 'Excelente funicularidad gravitacional; mínimas flexiones residuales.',
    connectionNotes: 'Empalmes de cuerda curva con casquillos interiores.'
  },
  {
    id: 'TR-21P',
    code: 'GAMBREL',
    name: 'Gambrel (Mansarda Holandesa)',
    family: 'ROOF_TRUSS',
    shortDesc: 'Doble quiebre en cada vertiente: pendiente suave en cumbrera y pendiente pronunciada en aleros.',
    dna: {
      topology: 'Two-pitch broken gable maximizing attic usable volume',
      chordCount: 2,
      webPattern: 'GAMBREL_WARREN',
      verticals: true,
      symmetry: 'BILATERAL',
      panelization: 'PARAMETRIC',
      depth: 'PARAMETRIC',
      span: 'PARAMETRIC',
      supportModel: '2_POINT',
      connectionModel: 'GUSSET',
      notes: 'Maximiza el espacio habitable bajo cubierta para bodegas de dos niveles o graneros.'
    },
    parameterSchema: [
      { key: 'span', label: 'Claro (Span)', unit: 'm', defaultValue: 14.0, min: 6.0, max: 28.0, step: 0.5, state: 'EDITABLE', description: 'Claro.' },
      { key: 'ridgeRise', label: 'Altura Cumbrera', unit: 'm', defaultValue: 4.2, min: 2.0, max: 7.0, step: 0.1, state: 'EDITABLE', description: 'Altura total.' },
      { key: 'breakHeight', label: 'Altura Quiebre (Knee)', unit: 'm', defaultValue: 2.8, min: 1.2, max: 4.5, step: 0.1, state: 'EDITABLE', description: 'Altura del quiebre.' },
      { key: 'panelCount', label: 'Paneles', unit: 'uds', defaultValue: 8, min: 4, max: 16, step: 2, state: 'EDITABLE', description: 'Divisiones.' }
    ],
    supportedSupports: ['PINNED', 'ROLLER'],
    supportedRoofFamilies: ['DOUBLE_SLOPE', 'GABLE'],
    fabricationRules: ['Refuerzo de nudo de quiebre (knee joint) con cartabón angular'],
    auditRules: ['Empuje lateral en nudo de quiebre'],
    svgIcon: 'custom',
    itemNumber: 21,
    familyCategory: 'B — Cerchas de cubierta inclinada',
    recommendedSpanM: { min: 8, max: 28 },
    typicalLdRatio: 'L/3 - L/5',
    loadBehavior: 'Grandes momentos en el vértice de quiebre transferidos a montantes verticales.',
    connectionNotes: 'Cartabón trapezoidal reforzado en el quiebre.'
  },
  {
    id: 'TR-22P',
    code: 'STRUCTURAL_MANSARD',
    name: 'Mansarda Estructural',
    family: 'ROOF_TRUSS',
    shortDesc: 'Cercha con faldones casi verticales en el perímetro y techo superior plano o de muy suave pendiente.',
    dna: {
      topology: 'Steep outer perimeter slopes + near-flat upper deck',
      chordCount: 2,
      webPattern: 'MANSARD_FRAME',
      verticals: true,
      symmetry: 'BILATERAL',
      panelization: 'PARAMETRIC',
      depth: 'PARAMETRIC',
      span: 'PARAMETRIC',
      supportModel: '2_POINT_RIGID',
      connectionModel: 'MOMENT_CORNER',
      notes: 'Típica en arquitectura urbana francesa para ocultar pisos de maquinaria o áticos.'
    },
    parameterSchema: [
      { key: 'span', label: 'Claro (Span)', unit: 'm', defaultValue: 16.0, min: 8.0, max: 30.0, step: 0.5, state: 'EDITABLE', description: 'Claro.' },
      { key: 'totalHeight', label: 'Altura Total', unit: 'm', defaultValue: 3.8, min: 2.0, max: 6.0, step: 0.1, state: 'EDITABLE', description: 'Altura total.' },
      { key: 'panelCount', label: 'Paneles', unit: 'uds', defaultValue: 10, min: 4, max: 18, step: 2, state: 'EDITABLE', description: 'Divisiones.' }
    ],
    supportedSupports: ['PINNED', 'FIXED'],
    supportedRoofFamilies: ['DOUBLE_SLOPE', 'GABLE', 'FLAT'],
    fabricationRules: ['Esquinas de mansarda rigidizadas con cartabones dobles'],
    auditRules: ['Presión lateral de viento en caras casi verticales'],
    svgIcon: 'custom',
    itemNumber: 22,
    familyCategory: 'B — Cerchas de cubierta inclinada',
    recommendedSpanM: { min: 8, max: 30 },
    typicalLdRatio: 'L/4 - L/6',
    loadBehavior: 'Cargas de viento dominantes sobre los faldones perimetrales empinados.',
    connectionNotes: 'Cartabones soldados de esquina rígida.'
  },
  {
    ...TRUSS_CATALOG[14], // Sawtooth
    itemNumber: 23,
    familyCategory: 'B — Cerchas de cubierta inclinada',
    recommendedSpanM: { min: 8, max: 26 },
    typicalLdRatio: 'L/6 - L/9',
    loadBehavior: 'Asimetría geométrica con vertiente iluminada cenital y canalón de desagüe integrado.',
    connectionNotes: 'Soportes de carpintería metálica de ventanería incorporados.'
  },
  {
    ...TRUSS_CATALOG[15], // Shed
    itemNumber: 24,
    familyCategory: 'B — Cerchas de cubierta inclinada',
    recommendedSpanM: { min: 6, max: 24 },
    typicalLdRatio: 'L/6 - L/10',
    loadBehavior: 'Monopendiente unilateral con apoyo alto rígido y apoyo bajo articulado.',
    connectionNotes: 'Cartabón de talón bajo con ranura horizontal para dilatación.'
  },
  {
    id: 'TR-25P',
    code: 'MONO_SLOPE_TRUSS',
    name: 'Monopendiente Reforzada',
    family: 'ROOF_TRUSS',
    shortDesc: 'Cercha triangular rectangular con cordón inferior continuo horizontal y diagonal única.',
    dna: {
      topology: 'Right-angled single slope truss with vertical support at tall end',
      chordCount: 2,
      webPattern: 'WARREN_SHED',
      verticals: true,
      symmetry: 'NONE',
      panelization: 'UNIFORM',
      depth: 'PARAMETRIC',
      span: 'PARAMETRIC',
      supportModel: '2_POINT',
      connectionModel: 'GUSSET',
      notes: 'Para adosamientos, marquesinas de descarga y naves industriales con drenaje a un solo lado.'
    },
    parameterSchema: [
      { key: 'span', label: 'Claro (Span)', unit: 'm', defaultValue: 12.0, min: 4.0, max: 24.0, step: 0.5, state: 'EDITABLE', description: 'Claro.' },
      { key: 'highDepth', label: 'Peralte Extremo Alto', unit: 'm', defaultValue: 2.0, min: 0.8, max: 4.5, step: 0.1, state: 'EDITABLE', description: 'Peralte en cumbrera.' },
      { key: 'lowDepth', label: 'Peralte Extremo Bajo', unit: 'm', defaultValue: 0.5, min: 0.2, max: 1.5, step: 0.05, state: 'EDITABLE', description: 'Peralte en talón.' },
      { key: 'panelCount', label: 'Paneles', unit: 'uds', defaultValue: 8, min: 4, max: 16, step: 2, state: 'EDITABLE', description: 'Divisiones.' }
    ],
    supportedSupports: ['PINNED', 'ROLLER'],
    supportedRoofFamilies: ['SINGLE_SLOPE', 'SHED'],
    fabricationRules: ['Talón bajo con cartabón de alta resistencia'],
    auditRules: ['Succión ascendente por viento lateral'],
    svgIcon: 'shed',
    itemNumber: 25,
    familyCategory: 'B — Cerchas de cubierta inclinada',
    recommendedSpanM: { min: 6, max: 24 },
    typicalLdRatio: 'L/6 - L/10',
    loadBehavior: 'Evacuación continua de agua hacia el costado bajo; requiere canalón perimetral amplio.',
    connectionNotes: 'Placas base ranuradas en apoyo bajo.'
  },
  {
    id: 'TR-26P',
    code: 'DOUBLE_PITCH_SYMMETRIC',
    name: 'Doble Pendiente Clásica (Gable Truss)',
    family: 'ROOF_TRUSS',
    shortDesc: 'Cercha simétrica a dos aguas con cumbrera central en x = L/2 y pendientes de 10% a 35%.',
    dna: {
      topology: 'Symmetric dual pitched chords with central apex joint',
      chordCount: 2,
      webPattern: 'WARREN_GABLE',
      verticals: true,
      symmetry: 'BILATERAL',
      panelization: 'UNIFORM',
      depth: 'PARAMETRIC',
      span: 'PARAMETRIC',
      supportModel: '2_POINT',
      connectionModel: 'GUSSET',
      notes: 'La tipología más instalada en Latinoamérica para bodegas y naves logísticas.'
    },
    parameterSchema: [
      { key: 'span', label: 'Claro (Span)', unit: 'm', defaultValue: 20.0, min: 8.0, max: 40.0, step: 0.5, state: 'EDITABLE', description: 'Claro entre columnas.' },
      { key: 'rise', label: 'Flecha en Cumbrera', unit: 'm', defaultValue: 2.5, min: 1.0, max: 6.0, step: 0.1, state: 'EDITABLE', description: 'Altura en vértice.' },
      { key: 'panelCount', label: 'Paneles', unit: 'uds', defaultValue: 12, min: 6, max: 24, step: 2, state: 'EDITABLE', description: 'Divisiones.' }
    ],
    supportedSupports: ['PINNED', 'ROLLER'],
    supportedRoofFamilies: ['DOUBLE_SLOPE', 'GABLE'],
    fabricationRules: ['Cartabón de cumbrera atornillado en taller o campo'],
    auditRules: ['Verificación de empuje lateral y flecha en cumbrera'],
    svgIcon: 'pratt',
    itemNumber: 26,
    familyCategory: 'B — Cerchas de cubierta inclinada',
    recommendedSpanM: { min: 8, max: 40 },
    typicalLdRatio: 'L/7 - L/12',
    loadBehavior: 'Simetría perfecta de reacciones verticales bajo carga muerta y viva uniforme.',
    connectionNotes: 'Cartabón central con pernos A325.'
  },
  {
    id: 'TR-27P',
    code: 'HIP_TRUSS_STRUCTURAL',
    name: 'Cuatro Aguas Estructural (Hip Roof Truss)',
    family: 'ROOF_TRUSS',
    shortDesc: 'Conjunto de cercha principal truncada + cerchas limahoyas/limatesas para remates a 4 vertientes.',
    dna: {
      topology: 'Truncated flat-top main girder + diagonal corner hip rafters',
      chordCount: 2,
      webPattern: 'TRUNCATED_HIP_GIRDER',
      verticals: true,
      symmetry: 'BILATERAL',
      panelization: 'PARAMETRIC',
      depth: 'PARAMETRIC',
      span: 'PARAMETRIC',
      supportModel: 'MULTI_POINT_PERIMETER',
      connectionModel: 'SPECIAL_ANGLED_CLIPS',
      notes: 'Resistencia aeroelástica superior frente a huracanes y vientos extremos de cualquier dirección.'
    },
    parameterSchema: [
      { key: 'span', label: 'Claro (Span)', unit: 'm', defaultValue: 18.0, min: 8.0, max: 36.0, step: 0.5, state: 'EDITABLE', description: 'Claro.' },
      { key: 'rise', label: 'Flecha', unit: 'm', defaultValue: 2.8, min: 1.2, max: 5.5, step: 0.1, state: 'EDITABLE', description: 'Flecha.' },
      { key: 'panelCount', label: 'Paneles', unit: 'uds', defaultValue: 10, min: 6, max: 20, step: 2, state: 'EDITABLE', description: 'Divisiones.' }
    ],
    supportedSupports: ['PINNED', 'ROLLER'],
    supportedRoofFamilies: ['HIP', 'DOUBLE_SLOPE'],
    fabricationRules: ['Conexiones a inglete en cerchas esquineras limahoyas'],
    auditRules: ['Distribución de carga triaxial en limatesas'],
    svgIcon: 'custom',
    itemNumber: 27,
    familyCategory: 'B — Cerchas de cubierta inclinada',
    recommendedSpanM: { min: 8, max: 36 },
    typicalLdRatio: 'L/6 - L/10',
    loadBehavior: 'Reducción drástica de coeficientes de presión de viento en esquinas.',
    connectionNotes: 'Herrajes angulados a 45° en nudos de limatesa.'
  },
  {
    ...TRUSS_CATALOG[11], // Scissors
    itemNumber: 28,
    familyCategory: 'B — Cerchas de cubierta inclinada',
    recommendedSpanM: { min: 8, max: 26 },
    typicalLdRatio: 'L/5 - L/8',
    loadBehavior: 'Genera empujes horizontales expansivos en apoyos (Spread Force) que requieren atiesado de columnas.',
    connectionNotes: 'Cartabón central de cruce con doble placa de refuerzo.'
  },

  // ----------------------------------------------------
  // C — SISTEMAS ESPACIALES (29 - 36)
  // ----------------------------------------------------
  {
    id: 'TR-29S',
    code: 'SPACE_FRAME_3D',
    name: 'Space Frame (Malla Espacial Tridimensional)',
    family: 'SPACE_STRUCTURE',
    shortDesc: 'Estructura reticular tridimensional de doble capa con nudos esféricos y barras tubulares.',
    dna: {
      topology: '3D double-layer orthogonal octahedral-tetrahedral space lattice',
      chordCount: 4,
      webPattern: 'OCTAHEDRAL_SPACE_GRID',
      verticals: false,
      symmetry: 'BILATERAL',
      panelization: 'UNIFORM',
      depth: 'PARAMETRIC',
      span: 'PARAMETRIC',
      supportModel: 'CORNER_OR_PERIMETER_COLUMNS',
      connectionModel: 'MERO_SOLID_SPHERES',
      notes: 'La solución óptima para coliseos, aeropuertos y naves de más de 60 metros sin apoyos intermedios.'
    },
    parameterSchema: [
      { key: 'spanX', label: 'Dimensión en X', unit: 'm', defaultValue: 30.0, min: 12.0, max: 90.0, step: 2.0, state: 'EDITABLE', description: 'Luz libre en X.' },
      { key: 'spanY', label: 'Dimensión en Y', unit: 'm', defaultValue: 30.0, min: 12.0, max: 90.0, step: 2.0, state: 'EDITABLE', description: 'Luz libre en Y.' },
      { key: 'depth', label: 'Peralte de Malla', unit: 'm', defaultValue: 1.8, min: 0.9, max: 4.0, step: 0.1, state: 'EDITABLE', description: 'Espesor de la malla.' },
      { key: 'moduleSize', label: 'Módulo de Celosía', unit: 'm', defaultValue: 2.4, min: 1.2, max: 4.5, step: 0.2, state: 'EDITABLE', description: 'Lado del módulo.' }
    ],
    supportedSupports: ['PINNED', 'ELASTIC'],
    supportedRoofFamilies: ['FLAT', 'BARREL', 'CURVED'],
    fabricationRules: ['Mecanizado CNC de precisión micrométrica en esferas de nudo'],
    auditRules: ['Pandeo elasto-plástico no lineal global de la malla'],
    svgIcon: 'spacetruss',
    itemNumber: 29,
    familyCategory: 'C — Sistemas espaciales',
    recommendedSpanM: { min: 15, max: 100 },
    typicalLdRatio: 'L/15 - L/25',
    loadBehavior: 'Comportamiento en placa anisótropa con distribución bidireccional de esfuerzos.',
    connectionNotes: 'Nudos MERO con conos forjados y pernos interiores de alta resistencia (Grado 10.9).'
  },
  {
    id: 'TR-30S',
    code: 'DOUBLE_LAYER_GRID',
    name: 'Double Layer Grid (Malla de Doble Capa)',
    family: 'SPACE_STRUCTURE',
    shortDesc: 'Dos capas reticulares paralelas conectadas por un sistema continuo de diagonales piramidales.',
    dna: {
      topology: 'Two parallel square grids offset by half-module with pyramidal diagonals',
      chordCount: 4,
      webPattern: 'SQUARE_ON_SQUARE_OFFSET',
      verticals: false,
      symmetry: 'BILATERAL',
      panelization: 'UNIFORM',
      depth: 'PARAMETRIC',
      span: 'PARAMETRIC',
      supportModel: 'PERIMETER_BEARING',
      connectionModel: 'BOLTED_NODE_CLUSTERS',
      notes: 'Alta hiperestaticidad: la falla de una barra individual no causa colapso progresivo.'
    },
    parameterSchema: [
      { key: 'spanX', label: 'Claro X', unit: 'm', defaultValue: 24.0, min: 10.0, max: 80.0, step: 2.0, state: 'EDITABLE', description: 'Claro X.' },
      { key: 'spanY', label: 'Claro Y', unit: 'm', defaultValue: 24.0, min: 10.0, max: 80.0, step: 2.0, state: 'EDITABLE', description: 'Claro Y.' },
      { key: 'depth', label: 'Peralte', unit: 'm', defaultValue: 1.5, min: 0.8, max: 3.5, step: 0.1, state: 'EDITABLE', description: 'Peralte.' }
    ],
    supportedSupports: ['PINNED', 'ROLLER'],
    supportedRoofFamilies: ['FLAT', 'CURVED'],
    fabricationRules: ['Estandarización de tubos con casquillos cónicos soldables'],
    auditRules: ['Deflexión central L/400'],
    svgIcon: 'spacetruss',
    itemNumber: 30,
    familyCategory: 'C — Sistemas espaciales',
    recommendedSpanM: { min: 14, max: 80 },
    typicalLdRatio: 'L/16 - L/22',
    loadBehavior: 'Redundancia estructural extrema; disipación tridimensional de cargas.',
    connectionNotes: 'Nodos de tambor o esferas de acero forjado.'
  },
  {
    id: 'TR-31S',
    code: 'TRIPLE_LAYER_GRID',
    name: 'Triple Layer Grid (Malla de Triple Capa)',
    family: 'SPACE_STRUCTURE',
    shortDesc: 'Tres niveles de mallas ortogonales para claros monumentales mayores a 80 metros con sobrecargas pesadas.',
    dna: {
      topology: 'Three-layer spatial truss with top, intermediate, and bottom chord meshes',
      chordCount: 6,
      webPattern: 'TRIPLE_LAYER_COMPLEX',
      verticals: true,
      symmetry: 'BILATERAL',
      panelization: 'UNIFORM',
      depth: 'PARAMETRIC',
      span: 'PARAMETRIC',
      supportModel: 'HEAVY_CORNER_PYLONS',
      connectionModel: 'CAST_STEEL_MULTI_LUG_NODES',
      notes: 'Para hangares de aviación de fuselaje ancho (Boeing 777 / Airbus A380).'
    },
    parameterSchema: [
      { key: 'spanX', label: 'Claro Hangar (X)', unit: 'm', defaultValue: 60.0, min: 30.0, max: 150.0, step: 5.0, state: 'EDITABLE', description: 'Claro principal.' },
      { key: 'depth', label: 'Peralte Total', unit: 'm', defaultValue: 4.5, min: 2.5, max: 8.0, step: 0.2, state: 'EDITABLE', description: 'Peralte.' }
    ],
    supportedSupports: ['PINNED', 'FIXED'],
    supportedRoofFamilies: ['FLAT', 'BARREL'],
    fabricationRules: ['Nodos de fundición de acero nodular de alta tenacidad'],
    auditRules: ['Análisis dinámico modal y vibraciones inducidas por viento'],
    svgIcon: 'spacetruss',
    itemNumber: 31,
    familyCategory: 'C — Sistemas espaciales',
    recommendedSpanM: { min: 50, max: 150 },
    typicalLdRatio: 'L/12 - L/18',
    loadBehavior: 'Capacidad de soportar puentes grúa suspendidos de 20 toneladas en la capa inferior.',
    connectionNotes: 'Pernos M36 / M42 grado 10.9 pretensados con llave dinamométrica calibrada.'
  },
  {
    id: 'TR-32S',
    code: 'GRID_DOME',
    name: 'Grid Dome (Cúpula Reticular)',
    family: 'SPACE_STRUCTURE',
    shortDesc: 'Cúpula semiesférica reticulada formada por meridianos, paralelos y diagonales en anillo.',
    dna: {
      topology: 'Hemispherical single or double layer reticulated dome with tension ring beam',
      chordCount: 2,
      webPattern: 'SCHWEDLER_OR_RIBBED_DOME',
      verticals: true,
      symmetry: 'RADIAL',
      panelization: 'PARAMETRIC',
      depth: 'PARAMETRIC',
      span: 'PARAMETRIC',
      supportModel: 'CONTINUOUS_RING_BEAM',
      connectionModel: 'STAR_NODE_CONNECTORS',
      notes: 'Grandes estadios y planetarios. La viga de borde inferior absorbe todo el empuje radial.'
    },
    parameterSchema: [
      { key: 'diameter', label: 'Diámetro Base', unit: 'm', defaultValue: 40.0, min: 15.0, max: 120.0, step: 2.0, state: 'EDITABLE', description: 'Diámetro en el anillo de base.' },
      { key: 'apexHeight', label: 'Altura en Cúpula', unit: 'm', defaultValue: 12.0, min: 4.0, max: 40.0, step: 1.0, state: 'EDITABLE', description: 'Altura en el cenit.' },
      { key: 'ringCount', label: 'Anillos Paralelos', unit: 'uds', defaultValue: 6, min: 3, max: 16, step: 1, state: 'EDITABLE', description: 'Niveles de anillos.' }
    ],
    supportedSupports: ['PINNED', 'ELASTIC'],
    supportedRoofFamilies: ['CURVED', 'BARREL'],
    fabricationRules: ['Viga de anillo perimetral con alta capacidad a tracción circular'],
    auditRules: ['Pandeo por chasquido (Snap-Through Buckling) en el vértice'],
    svgIcon: 'spacetruss',
    itemNumber: 32,
    familyCategory: 'C — Sistemas espaciales',
    recommendedSpanM: { min: 20, max: 120 },
    typicalLdRatio: 'f/D = 1/5 - 1/3',
    loadBehavior: 'Compresión en anillos superiores; tracción anular fuerte en anillo basal.',
    connectionNotes: 'Nodos tipo estrella con placas de unión mecanizadas en ángulo 3D.'
  },
  {
    id: 'TR-33S',
    code: 'GEODESIC_DOME',
    name: 'Geodésica (Fuller Geodesic Dome)',
    family: 'SPACE_STRUCTURE',
    shortDesc: 'Subdivisión icosaédrica con barras de longitudes casi iguales moduladas por frecuencias (2V, 3V, 4V, 6V).',
    dna: {
      topology: 'Icosahedral geodesic triangular division with frequency indexing',
      chordCount: 1,
      webPattern: 'GEODESIC_TRIANGULAR',
      verticals: false,
      symmetry: 'SPHERICAL_ICOSAHEDRAL',
      panelization: 'PARAMETRIC',
      depth: 'FIXED',
      span: 'PARAMETRIC',
      supportModel: 'PERIMETER_STANCHIONS',
      connectionModel: 'HUB_AND_STRUT_ALUMINUM_STEEL',
      notes: 'La máxima relación de volumen cubierto por peso propio de material estructural.'
    },
    parameterSchema: [
      { key: 'diameter', label: 'Diámetro Base', unit: 'm', defaultValue: 25.0, min: 8.0, max: 60.0, step: 1.0, state: 'EDITABLE', description: 'Diámetro.' },
      { key: 'frequency', label: 'Frecuencia Geodésica (2V-6V)', unit: 'V', defaultValue: 4, min: 2, max: 8, step: 1, state: 'EDITABLE', description: 'Grado de subdivisión.' }
    ],
    supportedSupports: ['PINNED'],
    supportedRoofFamilies: ['CURVED'],
    fabricationRules: ['Tubos aplastados en extremos o con tapones mecanizados ranurados'],
    auditRules: ['Estabilidad elástica de nudos poligonales de 5 y 6 barras'],
    svgIcon: 'spacetruss',
    itemNumber: 33,
    familyCategory: 'C — Sistemas espaciales',
    recommendedSpanM: { min: 10, max: 70 },
    typicalLdRatio: 'Hemisférica / Parcial',
    loadBehavior: 'Tensión y compresión distribuidas uniformemente en la cáscara facetada.',
    connectionNotes: 'Nudos tipo estrella de 6 vías en aluminio extruido o acero inoxidable.'
  },
  {
    id: 'TR-34S',
    code: 'SPATIAL_LATTICE',
    name: 'Reticulado Espacial Cilíndrico',
    family: 'SPACE_STRUCTURE',
    shortDesc: 'Estructura cilíndrica de curvatura simple rigidizada por celosías espaciales diagonales.',
    dna: {
      topology: 'Single/double curvature barrel lattice with cross-braced diamonds',
      chordCount: 2,
      webPattern: 'DIAMOND_SPATIAL_LATTICE',
      verticals: false,
      symmetry: 'BILATERAL',
      panelization: 'UNIFORM',
      depth: 'PARAMETRIC',
      span: 'PARAMETRIC',
      supportModel: 'LONGITUDINAL_EDGE_BEAMS',
      connectionModel: 'CLAMPED_TUBULAR_NODES',
      notes: 'Ideal para pasarelas peatonales cubiertas, túneles de metro y naves arqueadas.'
    },
    parameterSchema: [
      { key: 'span', label: 'Claro Longitudinal', unit: 'm', defaultValue: 28.0, min: 10.0, max: 60.0, step: 1.0, state: 'EDITABLE', description: 'Luz longitudinal.' },
      { key: 'radius', label: 'Radio de Bóveda', unit: 'm', defaultValue: 8.0, min: 3.0, max: 20.0, step: 0.5, state: 'EDITABLE', description: 'Radio de curvatura.' }
    ],
    supportedSupports: ['PINNED', 'ROLLER'],
    supportedRoofFamilies: ['BARREL', 'CURVED'],
    fabricationRules: ['Arqueado en frío de tubos longitudinales'],
    auditRules: ['Pandeo fuera de plano de la bóveda'],
    svgIcon: 'spacetruss',
    itemNumber: 34,
    familyCategory: 'C — Sistemas espaciales',
    recommendedSpanM: { min: 12, max: 60 },
    typicalLdRatio: 'L/12 - L/18',
    loadBehavior: 'Efecto diafragma en arco con transferencia longitudinal a tímpanos testeros.',
    connectionNotes: 'Abrazaderas forjadas exteriores.'
  },
  {
    ...TRUSS_CATALOG[13], // Space Truss Mero (TR-14)
    itemNumber: 35,
    familyCategory: 'C — Sistemas espaciales',
    recommendedSpanM: { min: 16, max: 90 },
    typicalLdRatio: 'L/15 - L/25',
    loadBehavior: 'Distribución ortogonal pura de momentos en $M_{xx}$ y $M_{yy}$.',
    connectionNotes: 'Nudos esféricos MERO con roscas forjadas interiores.'
  },
  {
    id: 'TR-36S',
    code: 'GRIDSHELL_TRUSS',
    name: 'Gridshell (Cáscara Reticular Conformada)',
    family: 'SPACE_STRUCTURE',
    shortDesc: 'Malla reticular de doble curvatura continua que adquiere rigidez mediante su geometría sinclástica o anticlástica.',
    dna: {
      topology: 'Freeform double-curved lattice shell with diagonal shear bracing',
      chordCount: 1,
      webPattern: 'QUAD_TRIANGULATED_GRIDSHELL',
      verticals: false,
      symmetry: 'PARAMETRIC',
      panelization: 'PARAMETRIC',
      depth: 'FIXED',
      span: 'PARAMETRIC',
      supportModel: 'CONTINUOUS_GROUND_ARCHES',
      connectionModel: 'MOMENT_ROTATIONAL_CLAMP_JOINTS',
      notes: 'Altamente vanguardista; emula las estructuras orgánicas de Frei Otto y Zaha Hadid.'
    },
    parameterSchema: [
      { key: 'spanX', label: 'Luz Mayor', unit: 'm', defaultValue: 35.0, min: 15.0, max: 80.0, step: 1.0, state: 'EDITABLE', description: 'Luz mayor.' },
      { key: 'height', label: 'Altura Libre', unit: 'm', defaultValue: 8.5, min: 3.5, max: 20.0, step: 0.5, state: 'EDITABLE', description: 'Altura en vértice.' }
    ],
    supportedSupports: ['FIXED', 'PINNED'],
    supportedRoofFamilies: ['CURVED', 'CUSTOM'],
    fabricationRules: ['Nudos con capacidad de rotación angular biaxial'],
    auditRules: ['Verificación de pandeo no lineal por grandes deformaciones'],
    svgIcon: 'custom',
    itemNumber: 36,
    familyCategory: 'C — Sistemas espaciales',
    recommendedSpanM: { min: 15, max: 80 },
    typicalLdRatio: 'Forma libre funicular',
    loadBehavior: 'Funicularidad de membrana tridimensional: mínimo esfuerzo de flexión residual.',
    connectionNotes: 'Abrazaderas rotacionales CNC de aluminio o acero inoxidable.'
  },

  // ----------------------------------------------------
  // D — SISTEMAS CURVOS (37 - 43)
  // ----------------------------------------------------
  {
    ...TRUSS_CATALOG[9], // Bowstring Truss
    itemNumber: 37,
    familyCategory: 'D — Sistemas curvos',
    recommendedSpanM: { min: 14, max: 70 },
    typicalLdRatio: 'L/6 - L/10',
    loadBehavior: 'La cuerda superior en arco parabólico trabaja en compresión casi pura; la cuerda inferior es un tirante horizontal puro.',
    connectionNotes: 'Placas de talón masivas con pernos de anclaje de alta capacidad.'
  },
  {
    id: 'TR-38C',
    code: 'STRUCTURAL_ARCH',
    name: 'Arco Estructural (Solid / Built-up Arch)',
    family: 'CURVED_STRUCTURE',
    shortDesc: 'Arco continuo de sección llena (IPR / Cajón soldado) biarticulado o triarticulado.',
    dna: {
      topology: 'Continuous curved primary beam with 2 or 3 hinges',
      chordCount: 1,
      webPattern: 'SOLID_RIB',
      verticals: false,
      symmetry: 'BILATERAL',
      panelization: 'PARAMETRIC',
      depth: 'PARAMETRIC',
      span: 'PARAMETRIC',
      supportModel: '2_POINT_THRUST_BEARING',
      connectionModel: 'PINNED_BASE_SHOES',
      notes: 'Transfiere el peso directamente por compresión axial funicular a las zapatas.'
    },
    parameterSchema: [
      { key: 'span', label: 'Claro (Span)', unit: 'm', defaultValue: 30.0, min: 12.0, max: 80.0, step: 1.0, state: 'EDITABLE', description: 'Claro entre zapatas.' },
      { key: 'rise', label: 'Flecha del Arco', unit: 'm', defaultValue: 6.0, min: 2.5, max: 20.0, step: 0.2, state: 'EDITABLE', description: 'Flecha central.' }
    ],
    supportedSupports: ['PINNED', 'FIXED'],
    supportedRoofFamilies: ['BARREL', 'CURVED'],
    fabricationRules: ['Rolado en caliente de perfiles IPR o armado de vigas cajón en gajos'],
    auditRules: ['Empuje horizontal masivo en cimentación ($H = wL^2 / 8f$)'],
    svgIcon: 'bowstring',
    itemNumber: 38,
    familyCategory: 'D — Sistemas curvos',
    recommendedSpanM: { min: 15, max: 80 },
    typicalLdRatio: 'f/L = 1/5 - 1/7',
    loadBehavior: 'Compresión dominante; requiere zapatas inclinadas o tensores enterrados.',
    connectionNotes: 'Rótula de base de acero fundido con pasador macizo Ø 100mm.'
  },
  {
    id: 'TR-39C',
    code: 'LATTICE_ARCH',
    name: 'Arco de Celosía (Trussed Arch)',
    family: 'CURVED_STRUCTURE',
    shortDesc: 'Arco conformado por dos cuerdas concéntricas en arco unidas por diagonales en celosía.',
    dna: {
      topology: 'Concentric curved chords laced with diagonal web trussing',
      chordCount: 2,
      webPattern: 'CURVED_WARREN_LATTICE',
      verticals: true,
      symmetry: 'BILATERAL',
      panelization: 'UNIFORM',
      depth: 'PARAMETRIC',
      span: 'PARAMETRIC',
      supportModel: '2_POINT_THRUST',
      connectionModel: 'GUSSET_WELDED',
      notes: 'Extrema ligereza para claros de 40 a 90 metros en estadios techados y centros deportivos.'
    },
    parameterSchema: [
      { key: 'span', label: 'Claro (Span)', unit: 'm', defaultValue: 45.0, min: 20.0, max: 90.0, step: 2.0, state: 'EDITABLE', description: 'Claro.' },
      { key: 'rise', label: 'Flecha del Arco', unit: 'm', defaultValue: 9.0, min: 4.0, max: 22.0, step: 0.5, state: 'EDITABLE', description: 'Flecha.' },
      { key: 'depth', label: 'Peralte de la Celosía', unit: 'm', defaultValue: 1.8, min: 0.9, max: 3.5, step: 0.1, state: 'EDITABLE', description: 'Espesor entre cuerdas.' }
    ],
    supportedSupports: ['PINNED'],
    supportedRoofFamilies: ['BARREL', 'CURVED'],
    fabricationRules: ['Fabricación en tramos modulares transportables de 12 metros con empalmes atornillados'],
    auditRules: ['Pandeo en el plano y fuera del plano del arco de celosía'],
    svgIcon: 'bowstring',
    itemNumber: 39,
    familyCategory: 'D — Sistemas curvos',
    recommendedSpanM: { min: 20, max: 90 },
    typicalLdRatio: 'f/L = 1/5, d = L/25',
    loadBehavior: 'Combina la funicularidad del arco con la resistencia a flexión de la viga celosía.',
    connectionNotes: 'Empalmes embridados con pernos A490.'
  },
  {
    id: 'TR-40C',
    code: 'TIED_ARCH',
    name: 'Tied Arch (Arco con Tirante Inferior)',
    family: 'CURVED_STRUCTURE',
    shortDesc: 'Arco superior que descarga su empuje horizontal en un tirante inferior pretensado o viga cajón.',
    dna: {
      topology: 'Thrust-neutralized arch with tension tie and vertical hanger cables',
      chordCount: 2,
      webPattern: 'VERTICAL_HANGERS',
      verticals: true,
      symmetry: 'BILATERAL',
      panelization: 'UNIFORM',
      depth: 'PARAMETRIC',
      span: 'PARAMETRIC',
      supportModel: '2_POINT_VERTICAL_ONLY',
      connectionModel: 'CABLE_SOCKETS_AND_PINS',
      notes: 'No transmite empujes horizontales a las columnas; actúa exteriormente como viga simplemente apoyada.'
    },
    parameterSchema: [
      { key: 'span', label: 'Claro (Span)', unit: 'm', defaultValue: 36.0, min: 15.0, max: 80.0, step: 1.0, state: 'EDITABLE', description: 'Claro.' },
      { key: 'rise', label: 'Flecha', unit: 'm', defaultValue: 6.0, min: 2.5, max: 15.0, step: 0.2, state: 'EDITABLE', description: 'Flecha del arco.' }
    ],
    supportedSupports: ['PINNED', 'ROLLER'],
    supportedRoofFamilies: ['BARREL', 'CURVED'],
    fabricationRules: ['Tirante inferior con anclajes de cuñas o tensores roscados pretensables'],
    auditRules: ['Fatiga en cables péndolas verticales'],
    svgIcon: 'bowstring',
    itemNumber: 40,
    familyCategory: 'D — Sistemas curvos',
    recommendedSpanM: { min: 16, max: 80 },
    typicalLdRatio: 'f/L = 1/6',
    loadBehavior: 'Reacciones puramente verticales en los apoyos de columna.',
    connectionNotes: 'Terminales de horquilla con pasadores de acero inoxidable en péndolas.'
  },
  {
    id: 'TR-41C',
    code: 'CURVED_CHORD_TRUSS',
    name: 'Curved Chord Truss (Celosía de Cuerda Curva)',
    family: 'CURVED_STRUCTURE',
    shortDesc: 'Cercha con cuerda superior curva poligonalizada y cuerda inferior horizontal recta con diagonales Warren.',
    dna: {
      topology: 'Segmented curved top chord + horizontal bottom tie with web lattice',
      chordCount: 2,
      webPattern: 'WARREN_OR_PRATT_CURVED',
      verticals: true,
      symmetry: 'BILATERAL',
      panelization: 'UNIFORM',
      depth: 'PARAMETRIC',
      span: 'PARAMETRIC',
      supportModel: '2_POINT',
      connectionModel: 'GUSSET',
      notes: 'Fácil de techar con láminas curvadas continuas tipo KR-18 sin traslapes.'
    },
    parameterSchema: [
      { key: 'span', label: 'Claro (Span)', unit: 'm', defaultValue: 24.0, min: 10.0, max: 55.0, step: 1.0, state: 'EDITABLE', description: 'Claro.' },
      { key: 'centerRise', label: 'Flecha Central', unit: 'm', defaultValue: 3.2, min: 1.2, max: 8.0, step: 0.1, state: 'EDITABLE', description: 'Flecha.' },
      { key: 'panelCount', label: 'Paneles', unit: 'uds', defaultValue: 12, min: 6, max: 24, step: 2, state: 'EDITABLE', description: 'Divisiones.' }
    ],
    supportedSupports: ['PINNED', 'ROLLER'],
    supportedRoofFamilies: ['CURVED', 'BARREL'],
    fabricationRules: ['Segmentación de cuerda en tramos rectos entre nudos'],
    auditRules: ['Excentricidad de nudos poligonales'],
    svgIcon: 'bowstring',
    itemNumber: 41,
    familyCategory: 'D — Sistemas curvos',
    recommendedSpanM: { min: 12, max: 55 },
    typicalLdRatio: 'L/7 - L/11',
    loadBehavior: 'Excelente aerodinámica frente a vientos transversales.',
    connectionNotes: 'Cartabones dobles de nudo con corte CNC.'
  },
  {
    id: 'TR-42C',
    code: 'BARREL_VAULT_TRUSS',
    name: 'Barrel Vault (Bóveda de Cañón Reticulada)',
    family: 'CURVED_STRUCTURE',
    shortDesc: 'Serie de arcos paralelos arriostrados diagonalmente formando un túnel cilíndrico continuo.',
    dna: {
      topology: 'Parallel semi-circular or parabolic vaulted truss ribs with diagonal purlin bracing',
      chordCount: 2,
      webPattern: 'BARREL_RIB_LATTICE',
      verticals: true,
      symmetry: 'BILATERAL',
      panelization: 'UNIFORM',
      depth: 'PARAMETRIC',
      span: 'PARAMETRIC',
      supportModel: 'CONTINUOUS_SPRINGING_LINE',
      connectionModel: 'GUSSET',
      notes: 'Para naves de almacenamiento a granel (grano, clinker, fertilizantes) que siguen el talud natural del material.'
    },
    parameterSchema: [
      { key: 'span', label: 'Claro (Span)', unit: 'm', defaultValue: 30.0, min: 12.0, max: 70.0, step: 1.0, state: 'EDITABLE', description: 'Claro del cañón.' },
      { key: 'rise', label: 'Flecha', unit: 'm', defaultValue: 7.5, min: 3.0, max: 18.0, step: 0.2, state: 'EDITABLE', description: 'Altura máxima.' },
      { key: 'length', label: 'Longitud del Cañón', unit: 'm', defaultValue: 60.0, min: 12.0, max: 200.0, step: 6.0, state: 'EDITABLE', description: 'Longitud total nave.' }
    ],
    supportedSupports: ['PINNED', 'FIXED'],
    supportedRoofFamilies: ['BARREL'],
    fabricationRules: ['Arcos modulares idénticos repetitivos'],
    auditRules: ['Efecto de cargas asimétricas de nieve o viento'],
    svgIcon: 'bowstring',
    itemNumber: 42,
    familyCategory: 'D — Sistemas curvos',
    recommendedSpanM: { min: 14, max: 70 },
    typicalLdRatio: 'f/L = 1/4 - 1/2',
    loadBehavior: 'Capacidad volumétrica máxima de acopio interior.',
    connectionNotes: 'Placas base fijadas sobre muros de contención de concreto.'
  },
  {
    id: 'TR-43C',
    code: 'RETICULATED_ARCH',
    name: 'Arco Reticulado Autoportante',
    family: 'CURVED_STRUCTURE',
    shortDesc: 'Arco con celosía cruzada en diamante auto-portante sin correas intermedias.',
    dna: {
      topology: 'Diamond reticulated single-layer or double-layer self-supporting arch',
      chordCount: 2,
      webPattern: 'DIAMOND_GRID_ARCH',
      verticals: false,
      symmetry: 'BILATERAL',
      panelization: 'UNIFORM',
      depth: 'PARAMETRIC',
      span: 'PARAMETRIC',
      supportModel: 'PINNED_HEEL_SHOES',
      connectionModel: 'BOLTED_FLANGE_CLUSTERS',
      notes: 'Cubiertas de montaje veloz sin andamiaje pesado.'
    },
    parameterSchema: [
      { key: 'span', label: 'Claro (Span)', unit: 'm', defaultValue: 28.0, min: 12.0, max: 60.0, step: 1.0, state: 'EDITABLE', description: 'Claro.' },
      { key: 'rise', label: 'Flecha', unit: 'm', defaultValue: 5.5, min: 2.5, max: 14.0, step: 0.2, state: 'EDITABLE', description: 'Flecha.' }
    ],
    supportedSupports: ['PINNED'],
    supportedRoofFamilies: ['BARREL', 'CURVED'],
    fabricationRules: ['Barras tubulares de longitud modular estandarizada'],
    auditRules: ['Rigidez torsional frente a viento oblicuo'],
    svgIcon: 'bowstring',
    itemNumber: 43,
    familyCategory: 'D — Sistemas curvos',
    recommendedSpanM: { min: 12, max: 60 },
    typicalLdRatio: 'f/L = 1/5 - 1/6',
    loadBehavior: 'Distribuido de membrana cilíndrica.',
    connectionNotes: 'Nudos empernados de rápido montaje.'
  },

  // ----------------------------------------------------
  // E — SISTEMAS ESPECIALES (44 - 53)
  // ----------------------------------------------------
  {
    ...TRUSS_CATALOG[16], // Cantilever Truss
    itemNumber: 44,
    familyCategory: 'E — Sistemas especiales',
    recommendedSpanM: { min: 4, max: 25 },
    typicalLdRatio: 'L/4 - L/7',
    loadBehavior: 'Cuerda superior en tracción pura bajo carga de gravedad; cuerda inferior fuertemente comprimida.',
    connectionNotes: 'Conexión de momento masiva con pernos A490 pretensados y atiesadores de columna.'
  },
  {
    id: 'TR-45E',
    code: 'GERBER_TRUSS',
    name: 'Gerber Truss (Viga Continua Articulada)',
    family: 'SPECIAL',
    shortDesc: 'Viga continua de múltiples vanos con articulaciones intermedias (rótulas Gerber) en puntos de momento cero.',
    dna: {
      topology: 'Multi-span cantilever and suspended span system with Gerber internal hinges',
      chordCount: 2,
      webPattern: 'GERBER_WARREN',
      verticals: true,
      symmetry: 'PARAMETRIC',
      panelization: 'UNIFORM',
      depth: 'PARAMETRIC',
      span: 'PARAMETRIC',
      supportModel: 'MULTI_COLUMN_CONTINUOUS',
      connectionModel: 'INTERNAL_PINNED_GERBER_JOINTS',
      notes: 'Permite salvar claros muy extensos igualando los momentos positivos y negativos.'
    },
    parameterSchema: [
      { key: 'mainSpan', label: 'Vano Principal', unit: 'm', defaultValue: 24.0, min: 12.0, max: 60.0, step: 1.0, state: 'EDITABLE', description: 'Luz central.' },
      { key: 'cantileverLength', label: 'Vuelo Articulado', unit: 'm', defaultValue: 4.5, min: 2.0, max: 12.0, step: 0.5, state: 'EDITABLE', description: 'Longitud del voladizo.' }
    ],
    supportedSupports: ['PINNED', 'ROLLER'],
    supportedRoofFamilies: ['FLAT', 'SINGLE_SLOPE'],
    fabricationRules: ['Rótula interna de neopreno o pasador de acero inoxidable'],
    auditRules: ['Asentamientos diferenciales en apoyos intermedios'],
    svgIcon: 'cantilever',
    itemNumber: 45,
    familyCategory: 'E — Sistemas especiales',
    recommendedSpanM: { min: 20, max: 80 },
    typicalLdRatio: 'L/16 - L/20',
    loadBehavior: 'Isostática frente a asentamientos de suelo sin inducir esfuerzos parásitos.',
    connectionNotes: 'Articulación de horquilla con pasador templado.'
  },
  {
    id: 'TR-46E',
    code: 'SUSPENDED_CABLE_TRUSS',
    name: 'Truss Suspendida (Catenaria / Cable Truss)',
    family: 'SPECIAL',
    shortDesc: 'Cercha sostenida por cables de catenaria superiores con mástiles exteriores de soporte.',
    dna: {
      topology: 'Suspension catenary cables supporting rigid deck truss via vertical stays',
      chordCount: 2,
      webPattern: 'CABLE_STAYED_LATTICE',
      verticals: true,
      symmetry: 'BILATERAL',
      panelization: 'PARAMETRIC',
      depth: 'PARAMETRIC',
      span: 'PARAMETRIC',
      supportModel: 'TENSION_PYLONS_AND_DEADMAN_ANCHORS',
      connectionModel: 'HIGH_STRENGTH_CABLE_SOCKETS',
      notes: 'Grandes estadios y tribunas olímpicas con vuelos de más de 40 metros.'
    },
    parameterSchema: [
      { key: 'span', label: 'Claro (Span)', unit: 'm', defaultValue: 50.0, min: 25.0, max: 120.0, step: 5.0, state: 'EDITABLE', description: 'Claro.' },
      { key: 'mastHeight', label: 'Altura del Mástil', unit: 'm', defaultValue: 15.0, min: 8.0, max: 35.0, step: 1.0, state: 'EDITABLE', description: 'Altura de pilones.' }
    ],
    supportedSupports: ['PINNED', 'ELASTIC'],
    supportedRoofFamilies: ['FLAT', 'CURVED', 'CUSTOM'],
    fabricationRules: ['Cables de acero estructural galvanizado con casquillos rellenos de resina/zinc fundido'],
    auditRules: ['Aleteo aeroelástico (Flutter) y vibración dinámica por ráfagas de viento'],
    svgIcon: 'custom',
    itemNumber: 46,
    familyCategory: 'E — Sistemas especiales',
    recommendedSpanM: { min: 30, max: 120 },
    typicalLdRatio: 'Mástil H = L/3 - L/4',
    loadBehavior: 'El 80% de la carga es transferida por tracción axial en cables a los mástiles.',
    connectionNotes: 'Cabezales de anclaje orientables de acero forjado.'
  },
  {
    id: 'TR-47E',
    code: 'INVERTED_KING_POST',
    name: 'Truss Invertida (Inverted King / Queen Post)',
    family: 'SPECIAL',
    shortDesc: 'Viga horizontal superior con puntal descendente y cable tensor inferior que provee contraflecha.',
    dna: {
      topology: 'Top compression beam + downward king post strut + tension cable belly',
      chordCount: 2,
      webPattern: 'INVERTED_KING_POST',
      verticals: true,
      symmetry: 'BILATERAL',
      panelization: 'UNIFORM',
      depth: 'PARAMETRIC',
      span: 'PARAMETRIC',
      supportModel: '2_POINT',
      connectionModel: 'TENSION_ROD_CLEVIS',
      notes: 'Elegancia arquitectónica minimalista para puentes peatonales y marquesinas esbeltas.'
    },
    parameterSchema: [
      { key: 'span', label: 'Claro (Span)', unit: 'm', defaultValue: 18.0, min: 8.0, max: 35.0, step: 1.0, state: 'EDITABLE', description: 'Claro.' },
      { key: 'postDepth', label: 'Largo del Puntal', unit: 'm', defaultValue: 1.8, min: 0.8, max: 3.5, step: 0.1, state: 'EDITABLE', description: 'Puntal descendente.' }
    ],
    supportedSupports: ['PINNED', 'ROLLER'],
    supportedRoofFamilies: ['FLAT', 'CUSTOM'],
    fabricationRules: ['Pretensado controlado del tirante inferior mediante gata hidráulica'],
    auditRules: ['Pérdida de tensión en el cable bajo inversión de carga por viento (succión)'],
    svgIcon: 'custom',
    itemNumber: 47,
    familyCategory: 'E — Sistemas especiales',
    recommendedSpanM: { min: 10, max: 35 },
    typicalLdRatio: 'L/10 - L/14',
    loadBehavior: 'El pretensado introduce contraflecha inicial anulando la deflexión por peso propio.',
    connectionNotes: 'Terminales roscados de alta precisión AISI 316.'
  },
  {
    id: 'TR-48E',
    code: 'HYBRID_TENSIONED',
    name: 'Truss Híbrida (Acero - Cable Pretensado)',
    family: 'SPECIAL',
    shortDesc: 'Combina perfiles de acero rígidos en compresión con tendones de alta resistencia en tracción.',
    dna: {
      topology: 'Rigid HSS compression chords + prestressed active steel cables in web/tie',
      chordCount: 2,
      webPattern: 'HYBRID_CABLE_ACTIVE',
      verticals: true,
      symmetry: 'BILATERAL',
      panelization: 'PARAMETRIC',
      depth: 'PARAMETRIC',
      span: 'PARAMETRIC',
      supportModel: '2_POINT',
      connectionModel: 'PRESTRESSED_ANCHOR_BLOCKS',
      notes: 'Máxima relación resistencia/peso; disminuye el tonelaje total de acero hasta un 35%.'
    },
    parameterSchema: [
      { key: 'span', label: 'Claro (Span)', unit: 'm', defaultValue: 24.0, min: 12.0, max: 60.0, step: 1.0, state: 'EDITABLE', description: 'Claro.' },
      { key: 'depth', label: 'Peralte', unit: 'm', defaultValue: 2.0, min: 1.0, max: 4.0, step: 0.1, state: 'EDITABLE', description: 'Peralte.' }
    ],
    supportedSupports: ['PINNED', 'ROLLER'],
    supportedRoofFamilies: ['FLAT', 'DOUBLE_SLOPE', 'CURVED'],
    fabricationRules: ['Monitoreo con celdas de carga durante el proceso de tensado'],
    auditRules: ['Relajación de esfuerzos en cables a largo plazo'],
    svgIcon: 'custom',
    itemNumber: 48,
    familyCategory: 'E — Sistemas especiales',
    recommendedSpanM: { min: 14, max: 60 },
    typicalLdRatio: 'L/12 - L/18',
    loadBehavior: 'Auto-equilibrada internamente con esfuerzos iniciales controlados.',
    connectionNotes: 'Bloques de anclaje mecanizados con tuercas esféricas de ajuste.'
  },
  {
    id: 'TR-49E',
    code: 'TIE_ROD_TRUSS',
    name: 'Truss con Tirante (Tie-Rod Reinforced)',
    family: 'SPECIAL',
    shortDesc: 'Cercha con tirante inferior reforzado mediante varilla sólida roscada para eliminar flechas.',
    dna: {
      topology: 'Standard truss augmented with heavy horizontal tie rod',
      chordCount: 2,
      webPattern: 'TIED_PRATT',
      verticals: true,
      symmetry: 'BILATERAL',
      panelization: 'UNIFORM',
      depth: 'PARAMETRIC',
      span: 'PARAMETRIC',
      supportModel: '2_POINT',
      connectionModel: 'CLEVIS_AND_PIN',
      notes: 'Muy utilizada en la rehabilitación y refuerzo de naves históricas o industriales existentes.'
    },
    parameterSchema: [
      { key: 'span', label: 'Claro (Span)', unit: 'm', defaultValue: 20.0, min: 10.0, max: 45.0, step: 1.0, state: 'EDITABLE', description: 'Claro.' },
      { key: 'rise', label: 'Flecha', unit: 'm', defaultValue: 2.5, min: 1.0, max: 5.0, step: 0.1, state: 'EDITABLE', description: 'Flecha.' }
    ],
    supportedSupports: ['PINNED', 'ROLLER'],
    supportedRoofFamilies: ['DOUBLE_SLOPE', 'GABLE'],
    fabricationRules: ['Varillas roscadas de redondo macizo A36 / A572'],
    auditRules: ['Elongación elástica del tirante'],
    svgIcon: 'pratt',
    itemNumber: 49,
    familyCategory: 'E — Sistemas especiales',
    recommendedSpanM: { min: 10, max: 45 },
    typicalLdRatio: 'L/8 - L/12',
    loadBehavior: 'Concentración de la tracción en el tirante inferior protegiendo los apoyos de empujes.',
    connectionNotes: 'Horquillas roscadas con tuerca de seguridad y contratuerca.'
  },
  {
    id: 'TR-50E',
    code: 'CABLE_STAYED_TRUSS',
    name: 'Truss con Tensor (Stayed Truss)',
    family: 'SPECIAL',
    shortDesc: 'Cercha atirantada desde un poste vertical superior que reduce drásticamente el momento flector central.',
    dna: {
      topology: 'Truss supported by diagonal stays radiating from central upright post',
      chordCount: 2,
      webPattern: 'CABLE_STAYED_FAN',
      verticals: true,
      symmetry: 'BILATERAL',
      panelization: 'PARAMETRIC',
      depth: 'PARAMETRIC',
      span: 'PARAMETRIC',
      supportModel: '2_POINT_WITH_PYLON',
      connectionModel: 'STAY_PIN_SOCKETS',
      notes: 'Permite reducir la sección de perfiles a la mitad al crear apoyos elásticos intermedios.'
    },
    parameterSchema: [
      { key: 'span', label: 'Claro (Span)', unit: 'm', defaultValue: 28.0, min: 14.0, max: 70.0, step: 1.0, state: 'EDITABLE', description: 'Claro.' },
      { key: 'pylonHeight', label: 'Altura Poste Central', unit: 'm', defaultValue: 4.5, min: 2.0, max: 10.0, step: 0.2, state: 'EDITABLE', description: 'Altura pilar.' }
    ],
    supportedSupports: ['PINNED', 'ROLLER'],
    supportedRoofFamilies: ['FLAT', 'DOUBLE_SLOPE'],
    fabricationRules: ['Poste central reforzado a compresión axial'],
    auditRules: ['Comprobación de rigidez de los tirantes inclinados'],
    svgIcon: 'custom',
    itemNumber: 50,
    familyCategory: 'E — Sistemas especiales',
    recommendedSpanM: { min: 16, max: 70 },
    typicalLdRatio: 'L/14 - L/20',
    loadBehavior: 'Los tirantes diagonales absorben el 60% del cortante y momento positivo.',
    connectionNotes: 'Placa en cabeza de mástil con pasadores de ojo.'
  },
  {
    id: 'TR-51E',
    code: 'MODULAR_SEGMENTAL',
    name: 'Truss Modular (Segmentada de Rápido Ensamble)',
    family: 'SPECIAL',
    shortDesc: 'Cercha subdividida en módulos idénticos de 3m o 6m transportables en camión convencional y ensamblables en obra.',
    dna: {
      topology: 'Repetitive standardized modular segments joined by heavy end-plate bolts',
      chordCount: 2,
      webPattern: 'MODULAR_WARREN',
      verticals: true,
      symmetry: 'BILATERAL',
      panelization: 'UNIFORM',
      depth: 'PARAMETRIC',
      span: 'PARAMETRIC',
      supportModel: '2_POINT',
      connectionModel: 'SPLICE_END_PLATES_A325',
      notes: 'Diseñada para rápida logística, obras remotas y exportación en contenedores de 40 pies.'
    },
    parameterSchema: [
      { key: 'span', label: 'Claro (Span)', unit: 'm', defaultValue: 24.0, min: 12.0, max: 48.0, step: 3.0, state: 'EDITABLE', description: 'Claro total múltiplo del módulo.' },
      { key: 'moduleLength', label: 'Longitud Módulo', unit: 'm', defaultValue: 6.0, min: 3.0, max: 6.0, step: 3.0, state: 'EDITABLE', description: 'Largo módulo.' },
      { key: 'depth', label: 'Peralte', unit: 'm', defaultValue: 1.5, min: 0.8, max: 3.0, step: 0.1, state: 'EDITABLE', description: 'Peralte.' }
    ],
    supportedSupports: ['PINNED', 'ROLLER'],
    supportedRoofFamilies: ['FLAT', 'DOUBLE_SLOPE'],
    fabricationRules: ['Plantillas de barrenado CNC de precisión en placas de empalme'],
    auditRules: ['Resistencia al cortante y deslizamiento en empalmes atornillados (Slip-Critical)'],
    svgIcon: 'warren',
    itemNumber: 51,
    familyCategory: 'E — Sistemas especiales',
    recommendedSpanM: { min: 12, max: 48 },
    typicalLdRatio: 'L/12 - L/16',
    loadBehavior: 'Comportamiento equivalente a viga continua mediante juntas resistentes a tracción completa.',
    connectionNotes: 'Empalmes a tope con 8 a 12 pernos A325 de 3/4" pretensados.'
  },
  {
    id: 'TR-52E',
    code: 'PIN_DEMOUNTABLE',
    name: 'Truss Desmontable (Eventos y Pabellones)',
    family: 'SPECIAL',
    shortDesc: 'Cercha con nudos articulados mediante pasadores y chavetas de seguridad para armado y desarme reiterado.',
    dna: {
      topology: 'Pin-connected rapid assembly truss with aluminum/steel light tubing',
      chordCount: 2,
      webPattern: 'PIN_LATTICE',
      verticals: true,
      symmetry: 'BILATERAL',
      panelization: 'UNIFORM',
      depth: 'PARAMETRIC',
      span: 'PARAMETRIC',
      supportModel: '2_POINT_PINNED',
      connectionModel: 'QUICK_PINS_WITH_COTTERS',
      notes: 'Para carpas monumentales de eventos, pabellones de exposiciones y estructuras militares temporales.'
    },
    parameterSchema: [
      { key: 'span', label: 'Claro (Span)', unit: 'm', defaultValue: 18.0, min: 6.0, max: 36.0, step: 1.0, state: 'EDITABLE', description: 'Claro.' },
      { key: 'depth', label: 'Peralte', unit: 'm', defaultValue: 1.2, min: 0.5, max: 2.5, step: 0.05, state: 'EDITABLE', description: 'Peralte.' }
    ],
    supportedSupports: ['PINNED'],
    supportedRoofFamilies: ['DOUBLE_SLOPE', 'GABLE', 'CURVED'],
    fabricationRules: ['Bujes de acero inoxidable tratados térmicamente'],
    auditRules: ['Holguras acumuladas en pasadores y fatiga de ciclos de montaje'],
    svgIcon: 'custom',
    itemNumber: 52,
    familyCategory: 'E — Sistemas especiales',
    recommendedSpanM: { min: 8, max: 36 },
    typicalLdRatio: 'L/12 - L/16',
    loadBehavior: 'Estructura ligera de gran ductilidad y tolerancia a vibraciones.',
    connectionNotes: 'Pasadores cónicos con pasadores de aleta de seguridad.'
  },
  {
    id: 'TR-53E',
    code: 'HEAVY_LONG_SPAN',
    name: 'Truss para Grandes Claros (Heavy Transfer Truss)',
    family: 'SPECIAL',
    shortDesc: 'Cercha de transferencia de peralte monumental (3 a 8 metros) fabricada con perfiles IPR y cartabones gruesos.',
    dna: {
      topology: 'Deep transfer truss carrying multiple floor columns or massive roof spans',
      chordCount: 2,
      webPattern: 'HEAVY_PRATT_OR_WARREN',
      verticals: true,
      symmetry: 'BILATERAL',
      panelization: 'UNIFORM',
      depth: 'PARAMETRIC',
      span: 'PARAMETRIC',
      supportModel: 'HEAVY_BEARING_SHOES',
      connectionModel: 'HEAVY_GUSSET_A490_BOLTS_AND_WELDS',
      notes: 'Para auditorios bajo torres de oficinas, estadios techados y centros de convenciones de más de 60 metros.'
    },
    parameterSchema: [
      { key: 'span', label: 'Claro (Span)', unit: 'm', defaultValue: 48.0, min: 25.0, max: 100.0, step: 2.0, state: 'EDITABLE', description: 'Claro monumental.' },
      { key: 'depth', label: 'Peralte de la Cercha', unit: 'm', defaultValue: 4.8, min: 2.5, max: 10.0, step: 0.2, state: 'EDITABLE', description: 'Peralte entre ejes.' },
      { key: 'panelCount', label: 'Paneles', unit: 'uds', defaultValue: 16, min: 8, max: 32, step: 2, state: 'EDITABLE', description: 'Divisiones.' }
    ],
    supportedSupports: ['PINNED', 'ROLLER', 'FIXED'],
    supportedRoofFamilies: ['FLAT', 'DOUBLE_SLOPE', 'BARREL'],
    fabricationRules: ['Ensayos no destructivos (NDT) por ultrasonido en el 100% de las soldaduras de nudo'],
    auditRules: ['Pandeo lateral torsional LTB de cuerdas y pandeo de cartabones'],
    svgIcon: 'custom',
    itemNumber: 53,
    familyCategory: 'E — Sistemas especiales',
    recommendedSpanM: { min: 30, max: 100 },
    typicalLdRatio: 'L/8 - L/12',
    loadBehavior: 'Capacidad de transferir miles de kilonewtons de cargas concentradas de columnas superiores.',
    connectionNotes: 'Cartabones de 25.4mm (1") con pernos A490 de 1-1/8" en doble cortante.'
  }
];

