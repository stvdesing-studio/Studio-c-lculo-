/**
 * STV CLOSER SYSTEM — SSKC (Structural System Knowledge Catalog)
 * Inmutable Single Source of Truth for Structural Engineering Digital Twins
 */

import { SSKCEntity, StructuralFamilyId } from '../../types/stv';

export const STV_SSKC_DATABASE: Record<string, SSKCEntity> = {
  // --- HSS (Hollow Structural Sections / Tubulares Rectangulares y Cuadrados) ---
  'HSS_8X4_1_4': {
    id: 'prod-mx-hss-8x4-14',
    code: 'HSS-8X4-CAL14-6M',
    designation: 'HSS 8x4x1/4',
    validationStatus: 'SOURCE_VALIDATED',
    commercial: {
      sku: 'HSS-8X4-CAL14-6M',
      nombre: 'HSS 8"x4" Cal. 1/4" (203.2 x 101.6 x 6.35 mm)',
      designacionEstandar: 'HSS 8x4x1/4',
      familia: 'Perfil Estructural Tubular (HSS Rectangular)',
      codigoClasificacion: 'HSS',
      descripcion: 'Perfil tubular rectangular de gran rigidez para columnas y trabes portantes en marcos rígidos e infraestructura pesada.',
      unidadVenta: 'Tramo 6.00m',
      longitudM: 6.0,
      pesoLinealKgM: 23.90,
      pesoTotalTramoKg: 143.4,
      precioUnitarioMXN: 5019.0,
      acabadoProtector: 'Acero negro estructural (RAL 9005)'
    },
    geometry: {
      depthMm: 203.2,
      widthMm: 101.6,
      wallThicknessMm: 6.35,
      flangeThicknessMm: 6.35,
      webThicknessMm: 6.35,
      filletRadiusMm: 12.7,
      kDistanceMm: 12.7,
      areaCm2: 30.5
    },
    material: {
      especificacionASTM: 'ASTM A500 Grado B',
      FyMPa: 317,
      FuMPa: 400,
      EGPa: 200,
      GGPa: 77.2,
      poisson: 0.3,
      densityKgM3: 7850
    },
    sectionProperties: {
      IxCm4: 1810.0,
      IyCm4: 574.0,
      SxCm3: 178.0,
      SyCm3: 113.0,
      ZxCm3: 224.0,
      ZyCm3: 133.0,
      rxCm: 7.70,
      ryCm: 4.34,
      JCm4: 1430.0,
      CwCm6: 0.0
    },
    stability: {
      flexion: 'Compacta',
      compresion: 'No esbelta',
      lambdaFlange: 13.0,
      lambdaWeb: 29.0
    },
    roles: ['COLUMN', 'MAIN_BEAM', 'TRUSS_CHORD', 'RIGID_FRAME'],
    loadModes: ['COMPRESSION', 'FLEXURE', 'SHEAR', 'BIAXIAL', 'TORSION'],
    connectionInterfaces: ['BASE_PLATE', 'BOLTED_END_PLATE', 'WELDED_GUSSET', 'MOMENT_FLANGE'],
    normativeReferences: ['AISC 360-16', 'AISC 360-22', 'ASTM A500/A500M', 'NTC-DCEA 2023']
  },

  'HSS_4X4_1_4': {
    id: 'prod-mx-006',
    code: 'HSS-4X4-CAL14-6M',
    designation: 'HSS 4x4x1/4',
    validationStatus: 'SOURCE_VALIDATED',
    commercial: {
      sku: 'HSS-4X4-CAL14-6M',
      nombre: 'HSS 4"x4" Cal. 1/4" (101.6 x 101.6 x 6.35 mm)',
      designacionEstandar: 'HSS 4x4x1/4',
      familia: 'Perfil Estructural Tubular (HSS Cuadrado)',
      codigoClasificacion: 'HSS',
      descripcion: 'Perfil cuadrado estructural para montantes, columnas secundarias y cordones espaciales.',
      unidadVenta: 'Tramo 6.00m',
      longitudM: 6.0,
      pesoLinealKgM: 18.20,
      pesoTotalTramoKg: 109.2,
      precioUnitarioMXN: 3820.0,
      acabadoProtector: 'Acero estructural'
    },
    geometry: {
      depthMm: 101.6,
      widthMm: 101.6,
      wallThicknessMm: 6.35,
      areaCm2: 23.2
    },
    material: {
      especificacionASTM: 'ASTM A500 Grado B',
      FyMPa: 317,
      FuMPa: 400,
      EGPa: 200,
      GGPa: 77.2,
      poisson: 0.3,
      densityKgM3: 7850
    },
    sectionProperties: {
      IxCm4: 341.0,
      IyCm4: 341.0,
      SxCm3: 67.2,
      SyCm3: 67.2,
      ZxCm3: 79.5,
      ZyCm3: 79.5,
      rxCm: 3.84,
      ryCm: 3.84,
      JCm4: 538.0
    },
    stability: {
      flexion: 'Compacta',
      compresion: 'No esbelta'
    },
    roles: ['COLUMN', 'TRUSS_CHORD', 'DIAGONAL', 'BRACING'],
    loadModes: ['COMPRESSION', 'TENSION', 'FLEXURE', 'SHEAR'],
    connectionInterfaces: ['GUSSET_PLATE', 'BASE_PLATE', 'WELDED_NODE', 'BOLTED_PLATE'],
    normativeReferences: ['AISC 360-16', 'ASTM A500']
  },

  'HSS_6X4_3_16': {
    id: 'prod-mx-hss-6x4-316',
    code: 'HSS-6X4-CAL316-6M',
    designation: 'HSS 6x4x3/16',
    validationStatus: 'SOURCE_VALIDATED',
    commercial: {
      sku: 'HSS-6X4-CAL316-6M',
      nombre: 'HSS 6"x4" Cal. 3/16" (152.4 x 101.6 x 4.76 mm)',
      designacionEstandar: 'HSS 6x4x3/16',
      familia: 'Perfil Estructural Tubular Rectangular',
      codigoClasificacion: 'HSS',
      descripcion: 'Perfil de rigidez intermedia para cordones inferiores y trabes de cerchas de gran claro.',
      unidadVenta: 'Tramo 6.00m',
      longitudM: 6.0,
      pesoLinealKgM: 16.50,
      pesoTotalTramoKg: 99.0,
      precioUnitarioMXN: 3465.0,
      acabadoProtector: 'Acero estructural'
    },
    geometry: {
      depthMm: 152.4,
      widthMm: 101.6,
      wallThicknessMm: 4.76,
      areaCm2: 21.0
    },
    material: {
      especificacionASTM: 'ASTM A500 Grado B',
      FyMPa: 317,
      FuMPa: 400,
      EGPa: 200,
      GGPa: 77.2,
      poisson: 0.3,
      densityKgM3: 7850
    },
    sectionProperties: {
      IxCm4: 735.0,
      IyCm4: 388.0,
      SxCm3: 96.5,
      SyCm3: 76.4,
      ZxCm3: 114.0,
      ZyCm3: 88.2,
      rxCm: 5.91,
      ryCm: 4.30,
      JCm4: 760.0
    },
    stability: {
      flexion: 'Compacta',
      compresion: 'No esbelta'
    },
    roles: ['TRUSS_CHORD', 'MAIN_BEAM', 'COLUMN'],
    loadModes: ['COMPRESSION', 'TENSION', 'FLEXURE'],
    connectionInterfaces: ['GUSSET_PLATE', 'BOLTED_PLATE', 'WELDED_NODE'],
    normativeReferences: ['AISC 360-16', 'ASTM A500']
  },

  // --- PTR (Perfiles Tubulares Rectangulares / Cuadrados ligeros) ---
  'PTR_4X2_CAL11': {
    id: 'prod-mx-ptr-4x2',
    code: 'PTR-4X2-CAL11-6M',
    designation: 'PTR 4x2 Cal. 11',
    validationStatus: 'SOURCE_VALIDATED',
    commercial: {
      sku: 'PTR-4X2-CAL11-6M',
      nombre: 'PTR 4"x2" Calibre 11 (101.6 x 50.8 x 3.04 mm)',
      designacionEstandar: 'PTR 4x2 Cal.11',
      familia: 'Perfil Tubular Rectangular Ligero',
      codigoClasificacion: 'PTR',
      descripcion: 'Elemento de cordones y montantes en cerchas Pratt y marcos ligeros.',
      unidadVenta: 'Tramo 6.00m',
      longitudM: 6.0,
      pesoLinealKgM: 10.40,
      pesoTotalTramoKg: 62.4,
      precioUnitarioMXN: 2080.0,
      acabadoProtector: 'Acero comercial estructural'
    },
    geometry: {
      depthMm: 101.6,
      widthMm: 50.8,
      wallThicknessMm: 3.04,
      areaCm2: 13.2
    },
    material: {
      especificacionASTM: 'ASTM A500 Grado B',
      FyMPa: 290,
      FuMPa: 400,
      EGPa: 200,
      GGPa: 77.2,
      poisson: 0.3,
      densityKgM3: 7850
    },
    sectionProperties: {
      IxCm4: 152.0,
      IyCm4: 48.0,
      SxCm3: 29.9,
      SyCm3: 18.9,
      ZxCm3: 36.2,
      ZyCm3: 22.1,
      rxCm: 3.39,
      ryCm: 1.91,
      JCm4: 110.0
    },
    stability: {
      flexion: 'Compacta',
      compresion: 'No esbelta'
    },
    roles: ['TOP_CHORD', 'BOTTOM_CHORD', 'VERTICAL', 'SECONDARY_BEAM'],
    loadModes: ['COMPRESSION', 'TENSION', 'FLEXURE'],
    connectionInterfaces: ['GUSSET_PLATE', 'WELDED_NODE', 'BOLTED_GUSSET'],
    normativeReferences: ['AISC 360-16', 'ASTM A500']
  },

  'PTR_2X2_CAL11': {
    id: 'prod-mx-ptr-2x2',
    code: 'PTR-2X2-CAL11-6M',
    designation: 'PTR 2x2 Cal. 11',
    validationStatus: 'SOURCE_VALIDATED',
    commercial: {
      sku: 'PTR-2X2-CAL11-6M',
      nombre: 'PTR 2"x2" Calibre 11 (50.8 x 50.8 x 3.04 mm)',
      designacionEstandar: 'PTR 2x2 Cal.11',
      familia: 'Perfil Tubular Cuadrado Ligero',
      codigoClasificacion: 'PTR',
      descripcion: 'Diagonales de celosía, arriostramientos transversales y pendolones.',
      unidadVenta: 'Tramo 6.00m',
      longitudM: 6.0,
      pesoLinealKgM: 4.70,
      pesoTotalTramoKg: 28.2,
      precioUnitarioMXN: 940.0,
      acabadoProtector: 'Acero comercial estructural'
    },
    geometry: {
      depthMm: 50.8,
      widthMm: 50.8,
      wallThicknessMm: 3.04,
      areaCm2: 5.98
    },
    material: {
      especificacionASTM: 'ASTM A500 / A36',
      FyMPa: 250,
      FuMPa: 400,
      EGPa: 200,
      GGPa: 77.2,
      poisson: 0.3,
      densityKgM3: 7850
    },
    sectionProperties: {
      IxCm4: 22.4,
      IyCm4: 22.4,
      SxCm3: 8.80,
      SyCm3: 8.80,
      ZxCm3: 10.4,
      ZyCm3: 10.4,
      rxCm: 1.93,
      ryCm: 1.93,
      JCm4: 34.0
    },
    stability: {
      flexion: 'Compacta',
      compresion: 'No esbelta'
    },
    roles: ['DIAGONAL', 'VERTICAL', 'BRACING'],
    loadModes: ['TENSION', 'COMPRESSION'],
    connectionInterfaces: ['GUSSET_PLATE', 'WELDED_NODE'],
    normativeReferences: ['AISC 360-16', 'ASTM A500']
  },

  // --- IPR / W-Shapes (Vigas I de Patín Ancho) ---
  'IPR_W8X15': {
    id: 'prod-mx-truss-col',
    code: 'IPR-W8X15-6M10',
    designation: 'W8x15 / IPR 8x4',
    validationStatus: 'SOURCE_VALIDATED',
    commercial: {
      sku: 'IPR-W8X15-6M10',
      nombre: 'Viga IPR 8"x4" (W8x15 lb/ft)',
      designacionEstandar: 'W8x15',
      familia: 'Perfil I de Patín Ancho (IPR / W-Shape)',
      codigoClasificacion: 'IPR',
      descripcion: 'Columnas principales y vigas maestras en marcos rígidos y soporte de armaduras.',
      unidadVenta: 'Tramo 6.10m',
      longitudM: 6.10,
      pesoLinealKgM: 22.50,
      pesoTotalTramoKg: 137.25,
      precioUnitarioMXN: 4890.0,
      acabadoProtector: 'Acero estructural negro'
    },
    geometry: {
      depthMm: 206.0,
      widthMm: 102.0,
      wallThicknessMm: 6.20,
      flangeThicknessMm: 8.00,
      webThicknessMm: 6.20,
      areaCm2: 28.6
    },
    material: {
      especificacionASTM: 'ASTM A992 / A36',
      FyMPa: 345,
      FuMPa: 450,
      EGPa: 200,
      GGPa: 77.2,
      poisson: 0.3,
      densityKgM3: 7850
    },
    sectionProperties: {
      IxCm4: 2000.0,
      IyCm4: 142.0,
      SxCm3: 194.0,
      SyCm3: 27.9,
      ZxCm3: 218.0,
      ZyCm3: 42.6,
      rxCm: 8.36,
      ryCm: 2.23,
      JCm4: 6.5
    },
    stability: {
      flexion: 'Compacta',
      compresion: 'No esbelta'
    },
    roles: ['COLUMN', 'MAIN_BEAM', 'RIGID_FRAME'],
    loadModes: ['COMPRESSION', 'FLEXURE', 'SHEAR', 'BIAXIAL'],
    connectionInterfaces: ['BASE_PLATE', 'SHEAR_TAB', 'MOMENT_CONNECTION', 'BOLTED_END_PLATE'],
    normativeReferences: ['AISC 360-16', 'ASTM A992', 'NTC-DCEA 2023']
  },

  'IPR_W6X9': {
    id: 'prod-mx-001',
    code: 'IPR-W6X9-6M',
    designation: 'W6x9 / IPR 6x4',
    validationStatus: 'SOURCE_VALIDATED',
    commercial: {
      sku: 'IPR-W6X9-6M',
      nombre: 'Viga IPR 6"x4" (W6x9 lb/ft)',
      designacionEstandar: 'W6x9',
      familia: 'Perfil I Ligero',
      codigoClasificacion: 'IPR',
      descripcion: 'Vigas secundarias y miembros de arriostramiento en marcos estructurales.',
      unidadVenta: 'Tramo 6.00m',
      longitudM: 6.0,
      pesoLinealKgM: 13.40,
      pesoTotalTramoKg: 80.4,
      precioUnitarioMXN: 2650.0,
      acabadoProtector: 'Acero estructural'
    },
    geometry: {
      depthMm: 150.0,
      widthMm: 100.0,
      wallThicknessMm: 5.46,
      flangeThicknessMm: 5.46,
      webThicknessMm: 4.32,
      areaCm2: 17.1
    },
    material: {
      especificacionASTM: 'ASTM A992 / A36',
      FyMPa: 345,
      FuMPa: 450,
      EGPa: 200,
      GGPa: 77.2,
      poisson: 0.3,
      densityKgM3: 7850
    },
    sectionProperties: {
      IxCm4: 535.0,
      IyCm4: 91.2,
      SxCm3: 71.3,
      SyCm3: 18.2,
      ZxCm3: 80.5,
      ZyCm3: 28.1,
      rxCm: 5.59,
      ryCm: 2.31,
      JCm4: 2.1
    },
    stability: {
      flexion: 'Compacta',
      compresion: 'No esbelta'
    },
    roles: ['SECONDARY_BEAM', 'BRACING', 'COLUMN'],
    loadModes: ['FLEXURE', 'SHEAR', 'COMPRESSION'],
    connectionInterfaces: ['SHEAR_TAB', 'BOLTED_CLIP', 'WELDED_SEAT'],
    normativeReferences: ['AISC 360-16', 'ASTM A992']
  },

  // --- MONTÉN (Correas C y Z conformadas en frío) ---
  'MONTEN_C_6X2_CAL14': {
    id: 'prod-mx-truss-correa',
    code: 'C-6X2-CAL14-6M',
    designation: 'Canal C 6x2 Cal. 14',
    validationStatus: 'SOURCE_VALIDATED',
    commercial: {
      sku: 'C-6X2-CAL14-6M',
      nombre: 'Polín Montén C 6"x2" Calibre 14 (152.4 x 50.8 x 1.9 mm)',
      designacionEstandar: 'C 6x2 Cal.14',
      familia: 'Perfiles Formados en Frío (Montén C)',
      codigoClasificacion: 'MONTEN',
      descripcion: 'Correas de cubierta para fijación de lámina y transmisión de cargas superficiales a nudos.',
      unidadVenta: 'Tramo 6.00m',
      longitudM: 6.0,
      pesoLinealKgM: 6.40,
      pesoTotalTramoKg: 38.4,
      precioUnitarioMXN: 1450.0,
      acabadoProtector: 'Galvanizado Z275'
    },
    geometry: {
      depthMm: 152.4,
      widthMm: 50.8,
      wallThicknessMm: 1.90,
      areaCm2: 8.15
    },
    material: {
      especificacionASTM: 'ASTM A653 Grado 33 / A1011',
      FyMPa: 230,
      FuMPa: 310,
      EGPa: 200,
      GGPa: 77.2,
      poisson: 0.3,
      densityKgM3: 7850
    },
    sectionProperties: {
      IxCm4: 210.0,
      IyCm4: 24.5,
      SxCm3: 27.6,
      SyCm3: 7.20,
      ZxCm3: 32.5,
      ZyCm3: 11.8,
      rxCm: 5.07,
      ryCm: 1.73,
      JCm4: 0.08
    },
    stability: {
      flexion: 'No Compacta',
      compresion: 'Esbelta'
    },
    roles: ['PURLIN', 'SECONDARY_MEMBER'],
    loadModes: ['FLEXURE', 'SHEAR', 'LOCAL_BUCKLING'],
    connectionInterfaces: ['CLEAT_ANGLE', 'SELF_DRILLING_SCREW', 'BOLTED_CLIP'],
    normativeReferences: ['AISI S100', 'AISC 360-16']
  },

  // --- PLACAS BASE & CONEXIÓN ---
  'PLACA_BASE_300X300X19': {
    id: 'prod-mx-truss-placa',
    code: 'PL-BASE-300X300X19-A36',
    designation: 'Placa base 300x300x19 mm A36',
    validationStatus: 'SOURCE_VALIDATED',
    commercial: {
      sku: 'PL-BASE-300X300X19-A36',
      nombre: 'Placa de Asiento y Base 300x300x19 mm con 4 barrenos',
      designacionEstandar: 'PL 3/4" x 12" x 12"',
      familia: 'Placas Estructurales de Transferencia',
      codigoClasificacion: 'PLATE',
      descripcion: 'Placa base para anclaje de columnas HSS 8x4 e IPR 8x4 a pedestales de concreto.',
      unidadVenta: 'Pieza maquinada',
      longitudM: 0.30,
      pesoLinealKgM: 44.6,
      pesoTotalTramoKg: 13.4,
      precioUnitarioMXN: 1480.0,
      acabadoProtector: 'Primer anticorrosivo zinc'
    },
    geometry: {
      depthMm: 300.0,
      widthMm: 300.0,
      wallThicknessMm: 19.05,
      areaCm2: 57.1
    },
    material: {
      especificacionASTM: 'ASTM A36',
      FyMPa: 250,
      FuMPa: 400,
      EGPa: 200,
      GGPa: 77.2,
      poisson: 0.3,
      densityKgM3: 7850
    },
    sectionProperties: {
      IxCm4: 17.2,
      IyCm4: 17.2,
      SxCm3: 18.1,
      SyCm3: 18.1,
      ZxCm3: 27.1,
      ZyCm3: 27.1,
      rxCm: 0.55,
      ryCm: 0.55,
      JCm4: 68.0
    },
    stability: {
      flexion: 'Compacta',
      compresion: 'No esbelta'
    },
    roles: ['BASE_PLATE', 'GUSSET'],
    loadModes: ['COMPRESSION', 'BEARING', 'FLEXURE'],
    connectionInterfaces: ['ANCHOR_BOLTS', 'GROUT_BED', 'PEDESTAL_INTERFACE'],
    normativeReferences: ['AISC Design Guide 1', 'ACI 318-19']
  },

  // --- PERNOS Y ANCLAJES ---
  'ANCLAJE_M20X400_A325': {
    id: 'prod-mx-truss-perno',
    code: 'ANCH-M20X400-A325',
    designation: 'Ancla M20 x 400 mm A325/F1554',
    validationStatus: 'SOURCE_VALIDATED',
    commercial: {
      sku: 'ANCH-M20X400-A325',
      nombre: 'Perno de Anclaje Roscado M20 x 400 mm Grado 55 con tuerca y arandela',
      designacionEstandar: 'F1554 Gr.55 Ø 3/4" x 16"',
      familia: 'Sistemas de Fijación y Anclaje Estructural',
      codigoClasificacion: 'BOLT',
      descripcion: 'Anclas de sujeción para cimentación con proyección de 2-3 hilos.',
      unidadVenta: 'Pieza con tuerca y arandela estructural',
      longitudM: 0.40,
      pesoLinealKgM: 2.87,
      pesoTotalTramoKg: 1.15,
      precioUnitarioMXN: 110.0,
      acabadoProtector: 'Galvanizado en caliente'
    },
    geometry: {
      depthMm: 20.0,
      widthMm: 20.0,
      wallThicknessMm: 20.0,
      areaCm2: 3.14
    },
    material: {
      especificacionASTM: 'ASTM F1554 Grado 55 / A325',
      FyMPa: 380,
      FuMPa: 520,
      EGPa: 200,
      GGPa: 77.2,
      poisson: 0.3,
      densityKgM3: 7850
    },
    sectionProperties: {
      IxCm4: 0.78,
      IyCm4: 0.78,
      SxCm3: 0.78,
      SyCm3: 0.78,
      ZxCm3: 1.33,
      ZyCm3: 1.33,
      rxCm: 0.50,
      ryCm: 0.50,
      JCm4: 1.57
    },
    stability: {
      flexion: 'Compacta',
      compresion: 'No esbelta'
    },
    roles: ['ANCHOR'],
    loadModes: ['TENSION', 'SHEAR', 'PULLOUT'],
    connectionInterfaces: ['BASE_PLATE', 'CONCRETE_PEDESTAL'],
    normativeReferences: ['ACI 318-19 Cap. 17', 'AISC 360-16']
  }
};

/**
 * 4 FAMILIAS MAESTRAS DE SISTEMAS ESTRUCTURALES PARAMÉTRICOS
 */
export interface StructuralFamilyTemplate {
  id: StructuralFamilyId;
  name: string;
  category: string;
  description: string;
  defaultSpanM: number;
  defaultRiseM: number;
  defaultDepthM: number;
  defaultModules: number;
  allowedChords: string[];
  allowedWebs: string[];
  allowedColumns: string[];
  behaviorSummary: string;
  loadPathSequence: string[];
  normativeCode: string[];
}

export const STV_TRUSS_FAMILIES: Record<StructuralFamilyId, StructuralFamilyTemplate> = {
  'F01_PRATT_PLANAR': {
    id: 'F01_PRATT_PLANAR',
    name: 'Cercha Plana Industrial Tipo Pratt (Dos Aguas)',
    category: 'Cerchas Planas Modulares',
    description: 'Armadura plana bidimensional a dos aguas con cordones paralelos/inclinados, diagonales en tracción y montantes verticales en compresión.',
    defaultSpanM: 12.0,
    defaultRiseM: 1.8,
    defaultDepthM: 1.5,
    defaultModules: 6,
    allowedChords: ['PTR_4X2_CAL11', 'HSS_6X4_3_16', 'HSS_4X4_1_4'],
    allowedWebs: ['PTR_2X2_CAL11', 'PTR_4X2_CAL11'],
    allowedColumns: ['IPR_W8X15', 'HSS_8X4_1_4'],
    behaviorSummary: 'Transferencia de flexión global mediante par de cordones (superior comprimido, inferior traccionado). Diagonales trabajan a tracción bajo carga gravitacional estándar.',
    loadPathSequence: [
      'Cubierta/Lámina',
      'Correas Montén C',
      'Nudos de Cuerda Superior',
      'Triangulación Diagonales/Montantes',
      'Nudos de Apoyo Extremos',
      'Placas de Conexión en Columnas',
      'Columnas Principales',
      'Placa Base & Anclas',
      'Pedestal de Concreto',
      'Zapata Aislada',
      'Estrato Competente de Suelo'
    ],
    normativeCode: ['AISC 360-16 / 22', 'ASCE 7-16', 'AWS D1.1']
  },

  'F02_SPACE_TRUSS_3D': {
    id: 'F02_SPACE_TRUSS_3D',
    name: 'Cercha Espacial Tridimensional / Pérgola Reticular',
    category: 'Sistemas Espaciales 3D',
    description: 'Estructura espacial reticulada tridimensional modular de doble capa con nudos esféricos/placas ortogonales para grandes cubiertas y pabellones de luces libres amplias.',
    defaultSpanM: 20.0,
    defaultRiseM: 0.0,
    defaultDepthM: 1.6,
    defaultModules: 8,
    allowedChords: ['HSS_4X4_1_4', 'HSS_6X4_3_16'],
    allowedWebs: ['PTR_2X2_CAL11', 'HSS_4X4_1_4'],
    allowedColumns: ['HSS_8X4_1_4', 'IPR_W8X15'],
    behaviorSummary: 'Comportamiento de placa anisótropa 3D. Distribución multidireccional de esfuerzos axiales en mallas piramidales, reduciendo drásticamente la deflexión diferencial.',
    loadPathSequence: [
      'Entramado Superior / Pérgola',
      'Nudos Espaciales 3D Superiores',
      'Malla de Diagonales Espaciales',
      'Nudos Espaciales Inferiores',
      'Columnas Perimetrales HSS',
      'Placas Base A36',
      'Pedestales Armados',
      'Zapatas o Losa de Cimentación',
      'Suelo'
    ],
    normativeCode: ['AISC 360-16', 'ASCE 7-16', 'ACI 318-19']
  },

  'F03_ARCH_THREE_CHORD': {
    id: 'F03_ARCH_THREE_CHORD',
    name: 'Cercha de Arco Triangulada de Tres Cuerdas',
    category: 'Estructuras Curvas de Gran Claro',
    description: 'Arco estructural espacial reticulado compuesto por 3 cordones principales dispuestos en sección triangular con diafragmas y celosías curvas continuas.',
    defaultSpanM: 28.0,
    defaultRiseM: 5.5,
    defaultDepthM: 1.2,
    defaultModules: 10,
    allowedChords: ['HSS_8X4_1_4', 'HSS_6X4_3_16'],
    allowedWebs: ['PTR_2X2_CAL11', 'HSS_4X4_1_4'],
    allowedColumns: ['HSS_8X4_1_4', 'IPR_W8X15'],
    behaviorSummary: 'Empuje predominantemente axial a lo largo de la directriz funicular del arco. Genera reacciones tanto verticales como horizontales de empuje en los apoyos basales.',
    loadPathSequence: [
      'Cubierta Arqueada',
      'Correas Curvadas',
      '3 Cordones Principales del Arco',
      'Nudos de Arranque en Base',
      'Cartelas y Placas de Momento',
      'Anclajes de Alta Resistencia (Torsión/Corte H)',
      'Pedestales con Estribos Confinados',
      'Zapatas con Resistencia al Deslizamiento',
      'Suelo Cohesivo / Friccionante'
    ],
    normativeCode: ['AISC 360-16', 'ASCE 7-16', 'SMIE']
  },

  'F04_VELARIA_TENSIONED_ARCH': {
    id: 'F04_VELARIA_TENSIONED_ARCH',
    name: 'Velaria Estructural / Sistema Híbrido Arco + Cables Tensionados',
    category: 'Tensoestructuras & Híbridos',
    description: 'Sistema híbrido formado por arco metálico compresivo, cables perimetrales de acero inoxidable pretensados, mástiles tensores y membrana arquitectónica.',
    defaultSpanM: 24.0,
    defaultRiseM: 6.0,
    defaultDepthM: 1.8,
    defaultModules: 8,
    allowedChords: ['HSS_8X4_1_4', 'HSS_6X4_3_16'],
    allowedWebs: ['PTR_2X2_CAL11', 'ANCLAJE_M20X400_A325'],
    allowedColumns: ['HSS_8X4_1_4'],
    behaviorSummary: 'Equilibrio de doble curvatura (anticlástica). Los cables transfieren tracción constante a anclajes masivos de cimentación, mientras el arco absorbe compresión pura y flexión.',
    loadPathSequence: [
      'Membrana Pretensada',
      'Cables de Borde / Catenarias',
      'Nudos Articulados & Tensores',
      'Arco Compresor Principal',
      'Mástiles / Tirantes a Tracción',
      'Placas de Anclaje con Resistencia a Uplift',
      'Zapatas Masivas de Gravedad / Pilotes',
      'Terreno'
    ],
    normativeCode: ['ASCE 19-16 (Steel Cables)', 'AISC 360-16', 'ACI 318-19']
  },

  'F05_RIGID_FRAME_IPR': {
    id: 'F05_RIGID_FRAME_IPR',
    name: 'Pórtico Rígido Industrial IPR / W-Shape',
    category: 'Marcos Rígidos de Acero',
    description: 'Marco rígido ortogonal de alma llena para naves industriales con trabes de momento y conexiones apernadas de placa de extremo.',
    defaultSpanM: 18.0,
    defaultRiseM: 1.2,
    defaultDepthM: 0.45,
    defaultModules: 4,
    allowedChords: ['IPR_W8X15', 'IPR_W6X9'],
    allowedWebs: ['IPR_W6X9'],
    allowedColumns: ['IPR_W8X15'],
    behaviorSummary: 'Distribución de momentos flectores en esquinas mediante empotramiento rígido viga-columna. Alta capacidad portante a flexocompresión.',
    loadPathSequence: [
      'Cubierta',
      'Correas Montén',
      'Trabe Principal IPR',
      'Nudo Rígido de Momento',
      'Columna IPR',
      'Placa Base & 4 Anclas M20',
      'Pedestal Concreto f\'c=250',
      'Zapata Cuadrada',
      'Suelo'
    ],
    normativeCode: ['AISC 360-16', 'AISC 358-16 Prequalified Connections', 'ASCE 7-16']
  }
};
