// ============================================================
// STV CLOSER — MASTER MATERIAL CATALOG & SECTION REPRESENTATION
// material-catalog.ts
// Contract: Complete 33+ Mexican & International Structural Materials
// Single Source of Truth for Geometry Engine, Solver & Fabrication HUD
// ============================================================

import * as THREE from 'three';

export interface CatalogMetadata {
  id: string;
  sku: string;
  nombreComercial: string;
  categoria:
    | 'TUBULAR_RECTANGULAR'
    | 'TUBULAR_CUADRADO'
    | 'TUBULAR_REDONDO'
    | 'VIGA_IPR'
    | 'PERFIL_C_MONTEN'
    | 'PLACA_ESTRUCTURAL'
    | 'LAMINA_ACANALADA'
    | 'TORNILLERIA_ANCLAJE'
    | 'CABLE_TENSOR'
    | 'VARILLA_CORRUGADA'
    | 'GROUT_CONCRETO';
  fabricanteOProveedor: string;
  paisOrigen: string;
  normasCumplidas: string[];
  unidadVenta: 'TRAMO_6M' | 'TRAMO_12M' | 'KG' | 'PIEZA' | 'M2' | 'ML' | 'SACO_25KG';
  precioUnitarioEstimadoMXN: number;
}

export interface CatalogSectionGeometry {
  tipoPerfil: 'HSS' | 'PTR' | 'IPR' | 'MONTEN_C' | 'LAMINA' | 'PLACA' | 'TUBO' | 'VARILLA' | 'CABLE' | 'ANCLAJE' | 'ANGULO';
  altoTotal_mm: number;
  anchoTotal_mm: number;
  espesorPared_mm: number;
  espesorAlma_mm?: number;
  espesorPatin_mm?: number;
  longitudLabio_mm?: number;
  radioGiroInterior_mm?: number;
  radioGiroExterior_mm?: number;
  areaSeccion_cm2: number;
  pesoLineal_kg_m: number;
}

export interface CatalogMechanicalProperties {
  tipoAcero: string;
  limiteFluencia_Fy_MPa: number;
  resistenciaTraccion_Fu_MPa: number;
  moduloElasticidad_E_GPa: number;
  moduloCortante_G_GPa: number;
  coeficientePoisson: number;
  elongacionMinima_porcentaje: number;
}

export interface CatalogSectionProperties {
  momentoInercia_Ix_cm4: number;
  momentoInercia_Iy_cm4: number;
  moduloSeccionElastico_Sx_cm3: number;
  moduloSeccionElastico_Sy_cm3: number;
  moduloSeccionPlastico_Zx_cm3: number;
  moduloSeccionPlastico_Zy_cm3: number;
  radioGiro_rx_cm: number;
  radioGiro_ry_cm: number;
  constanteTorsion_J_cm4?: number;
  constanteAlabeo_Cw_cm6?: number;
}

export interface CatalogStabilityClassification {
  relacion_b_t?: number;
  relacion_h_t?: number;
  relacion_bf_2tf?: number;
  relacion_h_tw?: number;
  relacion_D_t?: number;
  clasificacionSeccionAISC: 'COMPACTA' | 'NO_COMPACTA' | 'ESBELTA';
  comportamientoCompresion?: string;
  comportamientoFlexion?: string;
}

export interface MaterialCatalogItem {
  metadatos: CatalogMetadata;
  geometriaSeccion: CatalogSectionGeometry;
  propiedadesMecanicas: CatalogMechanicalProperties;
  propiedadesEstructuralesSeccion: CatalogSectionProperties;
  estabilidadYEsbeltez?: CatalogStabilityClassification;
  aplicacionRecomendada: string[];
}

export type MaterialRecord = MaterialCatalogItem;

// ============================================================
// 1. MASTER 33+ STRUCTURAL MATERIAL REGISTRY (FULL CONTRACT)
// ============================================================

export const MASTER_MATERIAL_CATALOG: Record<string, MaterialCatalogItem> = {
  // 1. Anclaje Expansivo Cuña 3/8" x 3-1/2"
  'prod-mx-anclaje-exp-38-12': {
    metadatos: {
      id: 'prod-mx-anclaje-exp-38-12',
      sku: 'ANC-EXP-3/8X3-1/2-ZINC',
      nombreComercial: 'Anclaje Expansivo Tipo Cuña 3/8" x 3-1/2" (9.52 x 88.9 mm)',
      categoria: 'TORNILLERIA_ANCLAJE',
      fabricanteOProveedor: 'Hilti / Rawlplug / Sujetadores Industriales',
      paisOrigen: 'México',
      normasCumplidas: ['ACI 318-19 Cap. 17', 'ASTM A307', 'ICC-ES ESR'],
      unidadVenta: 'PIEZA',
      precioUnitarioEstimadoMXN: 38.50
    },
    geometriaSeccion: {
      tipoPerfil: 'ANCLAJE',
      altoTotal_mm: 88.9,
      anchoTotal_mm: 9.52,
      espesorPared_mm: 9.52,
      areaSeccion_cm2: 0.71,
      pesoLineal_kg_m: 0.56
    },
    propiedadesMecanicas: {
      tipoAcero: 'Acero Grado 2 Zincado / Grado 5',
      limiteFluencia_Fy_MPa: 310.0,
      resistenciaTraccion_Fu_MPa: 415.0,
      moduloElasticidad_E_GPa: 200.0,
      moduloCortante_G_GPa: 77.2,
      coeficientePoisson: 0.30,
      elongacionMinima_porcentaje: 18.0
    },
    propiedadesEstructuralesSeccion: {
      momentoInercia_Ix_cm4: 0.04,
      momentoInercia_Iy_cm4: 0.04,
      moduloSeccionElastico_Sx_cm3: 0.08,
      moduloSeccionElastico_Sy_cm3: 0.08,
      moduloSeccionPlastico_Zx_cm3: 0.14,
      moduloSeccionPlastico_Zy_cm3: 0.14,
      radioGiro_rx_cm: 0.238,
      radioGiro_ry_cm: 0.238
    },
    estabilidadYEsbeltez: {
      clasificacionSeccionAISC: 'COMPACTA'
    },
    aplicacionRecomendada: ['Fijación de placas de desplante a losas de concreto existentes', 'Anclaje no sísmico']
  },

  // 2. Cable Tensor Acero Inoxidable 1/4"
  'prod-mx-cable-inox-14in': {
    metadatos: {
      id: 'prod-mx-cable-inox-14in',
      sku: 'CAB-INOX-316-7X19-1/4',
      nombreComercial: 'Cable Tensor Acero Inoxidable AISI 316 1/4" (6.35 mm) 7x19',
      categoria: 'CABLE_TENSOR',
      fabricanteOProveedor: 'Deacero / Continental Wire Rope',
      paisOrigen: 'México',
      normasCumplidas: ['ASTM A492', 'AISI 316', 'ASCE 19-16'],
      unidadVenta: 'ML',
      precioUnitarioEstimadoMXN: 68.00
    },
    geometriaSeccion: {
      tipoPerfil: 'CABLE',
      altoTotal_mm: 6.35,
      anchoTotal_mm: 6.35,
      espesorPared_mm: 6.35,
      areaSeccion_cm2: 0.316,
      pesoLineal_kg_m: 0.17
    },
    propiedadesMecanicas: {
      tipoAcero: 'Acero Inoxidable Austenítico AISI 316',
      limiteFluencia_Fy_MPa: 750.0,
      resistenciaTraccion_Fu_MPa: 1450.0,
      moduloElasticidad_E_GPa: 155.0,
      moduloCortante_G_GPa: 60.0,
      coeficientePoisson: 0.30,
      elongacionMinima_porcentaje: 5.0
    },
    propiedadesEstructuralesSeccion: {
      momentoInercia_Ix_cm4: 0.008,
      momentoInercia_Iy_cm4: 0.008,
      moduloSeccionElastico_Sx_cm3: 0.025,
      moduloSeccionElastico_Sy_cm3: 0.025,
      moduloSeccionPlastico_Zx_cm3: 0.045,
      moduloSeccionPlastico_Zy_cm3: 0.045,
      radioGiro_rx_cm: 0.158,
      radioGiro_ry_cm: 0.158
    },
    estabilidadYEsbeltez: {
      clasificacionSeccionAISC: 'COMPACTA',
      comportamientoCompresion: 'Elemento exclusivo a tensión pura (cables y contravientos).'
    },
    aplicacionRecomendada: ['Contravientos en cruz tipo San Andrés para marcos y tensores de pérgola']
  },

  // 3. HSS 4" x 4" Cal. 1/4"
  'prod-mx-hss-4x4-14': {
    metadatos: {
      id: 'prod-mx-hss-4x4-14',
      sku: 'HSS-CUA-101.6X101.6X6.35-A500B',
      nombreComercial: 'HSS 4" x 4" Cal. 1/4" (101.6 x 101.6 x 6.35 mm)',
      categoria: 'TUBULAR_CUADRADO',
      fabricanteOProveedor: 'Ternium / PROLAMSA',
      paisOrigen: 'México',
      normasCumplidas: ['AISC 360-22', 'ASTM A500 Grado B', 'NTC-DCEA 2023'],
      unidadVenta: 'TRAMO_6M',
      precioUnitarioEstimadoMXN: 3890.00
    },
    geometriaSeccion: {
      tipoPerfil: 'HSS',
      altoTotal_mm: 101.6,
      anchoTotal_mm: 101.6,
      espesorPared_mm: 6.35,
      radioGiroExterior_mm: 9.5,
      areaSeccion_cm2: 23.1,
      pesoLineal_kg_m: 18.15
    },
    propiedadesMecanicas: {
      tipoAcero: 'ASTM A500 Grado B',
      limiteFluencia_Fy_MPa: 317.0,
      resistenciaTraccion_Fu_MPa: 400.0,
      moduloElasticidad_E_GPa: 200.0,
      moduloCortante_G_GPa: 77.2,
      coeficientePoisson: 0.30,
      elongacionMinima_porcentaje: 23.0
    },
    propiedadesEstructuralesSeccion: {
      momentoInercia_Ix_cm4: 340.0,
      momentoInercia_Iy_cm4: 340.0,
      moduloSeccionElastico_Sx_cm3: 66.9,
      moduloSeccionElastico_Sy_cm3: 66.9,
      moduloSeccionPlastico_Zx_cm3: 79.5,
      moduloSeccionPlastico_Zy_cm3: 79.5,
      radioGiro_rx_cm: 3.84,
      radioGiro_ry_cm: 3.84,
      constanteTorsion_J_cm4: 538.0
    },
    estabilidadYEsbeltez: {
      relacion_b_t: 13.0,
      clasificacionSeccionAISC: 'COMPACTA'
    },
    aplicacionRecomendada: ['Columnas principales de pérgolas de claro medio y marcos estructurales']
  },

  // 4. HSS 4" x 4" Cal. 9
  'prod-mx-hss-4x4-cal9': {
    metadatos: {
      id: 'prod-mx-hss-4x4-cal9',
      sku: 'HSS-CUA-101.6X101.6X3.80-A500B',
      nombreComercial: 'HSS 4" x 4" Cal. 9 (101.6 x 101.6 x 3.80 mm)',
      categoria: 'TUBULAR_CUADRADO',
      fabricanteOProveedor: 'Ternium / Nacional',
      paisOrigen: 'México',
      normasCumplidas: ['AISC 360-22', 'ASTM A500 Grado B'],
      unidadVenta: 'TRAMO_6M',
      precioUnitarioEstimadoMXN: 2450.00
    },
    geometriaSeccion: {
      tipoPerfil: 'HSS',
      altoTotal_mm: 101.6,
      anchoTotal_mm: 101.6,
      espesorPared_mm: 3.80,
      radioGiroExterior_mm: 6.0,
      areaSeccion_cm2: 14.5,
      pesoLineal_kg_m: 11.4
    },
    propiedadesMecanicas: {
      tipoAcero: 'ASTM A500 Grado B',
      limiteFluencia_Fy_MPa: 317.0,
      resistenciaTraccion_Fu_MPa: 400.0,
      moduloElasticidad_E_GPa: 200.0,
      moduloCortante_G_GPa: 77.2,
      coeficientePoisson: 0.30,
      elongacionMinima_porcentaje: 23.0
    },
    propiedadesEstructuralesSeccion: {
      momentoInercia_Ix_cm4: 226.0,
      momentoInercia_Iy_cm4: 226.0,
      moduloSeccionElastico_Sx_cm3: 44.5,
      moduloSeccionElastico_Sy_cm3: 44.5,
      moduloSeccionPlastico_Zx_cm3: 52.8,
      moduloSeccionPlastico_Zy_cm3: 52.8,
      radioGiro_rx_cm: 3.95,
      radioGiro_ry_cm: 3.95
    },
    estabilidadYEsbeltez: {
      relacion_b_t: 23.7,
      clasificacionSeccionAISC: 'COMPACTA'
    },
    aplicacionRecomendada: ['Columnas esbeltas y cuerdas intermedias']
  },

  // 5. HSS 6" x 4" Cal. 1/4"
  'prod-mx-hss-6x4-14': {
    metadatos: {
      id: 'prod-mx-hss-6x4-14',
      sku: 'HSS-REC-152.4X101.6X6.35-A500B',
      nombreComercial: 'HSS 6" x 4" Cal. 1/4" (152.4 x 101.6 x 6.35 mm)',
      categoria: 'TUBULAR_RECTANGULAR',
      fabricanteOProveedor: 'Ternium / PROLAMSA',
      paisOrigen: 'México',
      normasCumplidas: ['AISC 360-22', 'ASTM A500 Grado B', 'NTC-DCEA 2023'],
      unidadVenta: 'TRAMO_6M',
      precioUnitarioEstimadoMXN: 5120.00
    },
    geometriaSeccion: {
      tipoPerfil: 'HSS',
      altoTotal_mm: 152.4,
      anchoTotal_mm: 101.6,
      espesorPared_mm: 6.35,
      radioGiroExterior_mm: 12.0,
      areaSeccion_cm2: 29.5,
      pesoLineal_kg_m: 23.2
    },
    propiedadesMecanicas: {
      tipoAcero: 'ASTM A500 Grado B',
      limiteFluencia_Fy_MPa: 317.0,
      resistenciaTraccion_Fu_MPa: 400.0,
      moduloElasticidad_E_GPa: 200.0,
      moduloCortante_G_GPa: 77.2,
      coeficientePoisson: 0.30,
      elongacionMinima_porcentaje: 23.0
    },
    propiedadesEstructuralesSeccion: {
      momentoInercia_Ix_cm4: 928.0,
      momentoInercia_Iy_cm4: 495.0,
      moduloSeccionElastico_Sx_cm3: 121.8,
      moduloSeccionElastico_Sy_cm3: 97.4,
      moduloSeccionPlastico_Zx_cm3: 149.0,
      moduloSeccionPlastico_Zy_cm3: 112.0,
      radioGiro_rx_cm: 5.61,
      radioGiro_ry_cm: 4.10,
      constanteTorsion_J_cm4: 1010.0
    },
    estabilidadYEsbeltez: {
      relacion_h_t: 21.0,
      relacion_b_t: 13.0,
      clasificacionSeccionAISC: 'COMPACTA'
    },
    aplicacionRecomendada: ['Columnas principales con eje fuerte orientado al viento sismo y vigas perimetrales']
  },

  // 6. HSS 6" x 4" Cal. 3/16"
  'prod-mx-hss-6x4-316': {
    metadatos: {
      id: 'prod-mx-hss-6x4-316',
      sku: 'HSS-REC-152.4X101.6X4.76-A500B',
      nombreComercial: 'HSS 6" x 4" Cal. 3/16" (152.4 x 101.6 x 4.76 mm)',
      categoria: 'TUBULAR_RECTANGULAR',
      fabricanteOProveedor: 'Ternium / PROLAMSA',
      paisOrigen: 'México',
      normasCumplidas: ['AISC 360-22', 'ASTM A500 Grado B'],
      unidadVenta: 'TRAMO_6M',
      precioUnitarioEstimadoMXN: 3980.00
    },
    geometriaSeccion: {
      tipoPerfil: 'HSS',
      altoTotal_mm: 152.4,
      anchoTotal_mm: 101.6,
      espesorPared_mm: 4.76,
      radioGiroExterior_mm: 9.0,
      areaSeccion_cm2: 22.8,
      pesoLineal_kg_m: 17.9
    },
    propiedadesMecanicas: {
      tipoAcero: 'ASTM A500 Grado B',
      limiteFluencia_Fy_MPa: 317.0,
      resistenciaTraccion_Fu_MPa: 400.0,
      moduloElasticidad_E_GPa: 200.0,
      moduloCortante_G_GPa: 77.2,
      coeficientePoisson: 0.30,
      elongacionMinima_porcentaje: 23.0
    },
    propiedadesEstructuralesSeccion: {
      momentoInercia_Ix_cm4: 736.0,
      momentoInercia_Iy_cm4: 395.0,
      moduloSeccionElastico_Sx_cm3: 96.6,
      moduloSeccionElastico_Sy_cm3: 77.8,
      moduloSeccionPlastico_Zx_cm3: 117.0,
      moduloSeccionPlastico_Zy_cm3: 88.5,
      radioGiro_rx_cm: 5.68,
      radioGiro_ry_cm: 4.16
    },
    estabilidadYEsbeltez: {
      relacion_h_t: 29.0,
      clasificacionSeccionAISC: 'COMPACTA'
    },
    aplicacionRecomendada: ['Vigas de borde y montantes de carga en pórticos ligeros']
  },

  // 7. HSS 6" x 6" Cal. 1/4"
  'prod-mx-hss-6x6-14': {
    metadatos: {
      id: 'prod-mx-hss-6x6-14',
      sku: 'HSS-CUA-152.4X152.4X6.35-A500B',
      nombreComercial: 'HSS 6" x 6" Cal. 1/4" (152.4 x 152.4 x 6.35 mm)',
      categoria: 'TUBULAR_CUADRADO',
      fabricanteOProveedor: 'Ternium / Tubacero',
      paisOrigen: 'México',
      normasCumplidas: ['AISC 360-22', 'ASTM A500 Grado B', 'NTC-DCEA 2023'],
      unidadVenta: 'TRAMO_6M',
      precioUnitarioEstimadoMXN: 6240.00
    },
    geometriaSeccion: {
      tipoPerfil: 'HSS',
      altoTotal_mm: 152.4,
      anchoTotal_mm: 152.4,
      espesorPared_mm: 6.35,
      radioGiroExterior_mm: 12.5,
      areaSeccion_cm2: 36.0,
      pesoLineal_kg_m: 28.3
    },
    propiedadesMecanicas: {
      tipoAcero: 'ASTM A500 Grado B',
      limiteFluencia_Fy_MPa: 317.0,
      resistenciaTraccion_Fu_MPa: 400.0,
      moduloElasticidad_E_GPa: 200.0,
      moduloCortante_G_GPa: 77.2,
      coeficientePoisson: 0.30,
      elongacionMinima_porcentaje: 23.0
    },
    propiedadesEstructuralesSeccion: {
      momentoInercia_Ix_cm4: 1280.0,
      momentoInercia_Iy_cm4: 1280.0,
      moduloSeccionElastico_Sx_cm3: 168.0,
      moduloSeccionElastico_Sy_cm3: 168.0,
      moduloSeccionPlastico_Zx_cm3: 198.0,
      moduloSeccionPlastico_Zy_cm3: 198.0,
      radioGiro_rx_cm: 5.96,
      radioGiro_ry_cm: 5.96,
      constanteTorsion_J_cm4: 2050.0
    },
    estabilidadYEsbeltez: {
      relacion_b_t: 21.0,
      clasificacionSeccionAISC: 'COMPACTA'
    },
    aplicacionRecomendada: ['Columnas estructurales principales simétricas biaxiales']
  },

  // 8. HSS 6" x 6" Cal. 3/8"
  'prod-mx-hss-6x6-38': {
    metadatos: {
      id: 'prod-mx-hss-6x6-38',
      sku: 'HSS-CUA-152.4X152.4X9.53-A500B',
      nombreComercial: 'HSS 6" x 6" Cal. 3/8" (152.4 x 152.4 x 9.53 mm)',
      categoria: 'TUBULAR_CUADRADO',
      fabricanteOProveedor: 'Ternium / Tubacero',
      paisOrigen: 'México',
      normasCumplidas: ['AISC 360-22', 'ASTM A500 Grado B', 'NTC-DCEA 2023'],
      unidadVenta: 'TRAMO_6M',
      precioUnitarioEstimadoMXN: 8960.00
    },
    geometriaSeccion: {
      tipoPerfil: 'HSS',
      altoTotal_mm: 152.4,
      anchoTotal_mm: 152.4,
      espesorPared_mm: 9.53,
      radioGiroExterior_mm: 15.0,
      areaSeccion_cm2: 51.5,
      pesoLineal_kg_m: 40.5
    },
    propiedadesMecanicas: {
      tipoAcero: 'ASTM A500 Grado B',
      limiteFluencia_Fy_MPa: 317.0,
      resistenciaTraccion_Fu_MPa: 400.0,
      moduloElasticidad_E_GPa: 200.0,
      moduloCortante_G_GPa: 77.2,
      coeficientePoisson: 0.30,
      elongacionMinima_porcentaje: 23.0
    },
    propiedadesEstructuralesSeccion: {
      momentoInercia_Ix_cm4: 1720.0,
      momentoInercia_Iy_cm4: 1720.0,
      moduloSeccionElastico_Sx_cm3: 226.0,
      moduloSeccionElastico_Sy_cm3: 226.0,
      moduloSeccionPlastico_Zx_cm3: 274.0,
      moduloSeccionPlastico_Zy_cm3: 274.0,
      radioGiro_rx_cm: 5.78,
      radioGiro_ry_cm: 5.78,
      constanteTorsion_J_cm4: 2850.0
    },
    estabilidadYEsbeltez: {
      relacion_b_t: 13.0,
      clasificacionSeccionAISC: 'COMPACTA'
    },
    aplicacionRecomendada: ['Columnas de alta capacidad sísmica y cargas concentradas']
  },

  // 9. HSS 8" x 4" Cal. 1/4"
  'prod-mx-hss-8x4-14': {
    metadatos: {
      id: 'prod-mx-hss-8x4-14',
      sku: 'HSS-REC-203.2X101.6X6.35-A500B',
      nombreComercial: 'HSS 8" x 4" Cal. 1/4" (203.2 x 101.6 x 6.35 mm)',
      categoria: 'TUBULAR_RECTANGULAR',
      fabricanteOProveedor: 'Ternium / PROLAMSA',
      paisOrigen: 'México',
      normasCumplidas: ['AISC 360-22', 'ASTM A500 Grado B'],
      unidadVenta: 'TRAMO_6M',
      precioUnitarioEstimadoMXN: 6850.00
    },
    geometriaSeccion: {
      tipoPerfil: 'HSS',
      altoTotal_mm: 203.2,
      anchoTotal_mm: 101.6,
      espesorPared_mm: 6.35,
      radioGiroExterior_mm: 14.0,
      areaSeccion_cm2: 36.0,
      pesoLineal_kg_m: 28.3
    },
    propiedadesMecanicas: {
      tipoAcero: 'ASTM A500 Grado B',
      limiteFluencia_Fy_MPa: 317.0,
      resistenciaTraccion_Fu_MPa: 400.0,
      moduloElasticidad_E_GPa: 200.0,
      moduloCortante_G_GPa: 77.2,
      coeficientePoisson: 0.30,
      elongacionMinima_porcentaje: 23.0
    },
    propiedadesEstructuralesSeccion: {
      momentoInercia_Ix_cm4: 1890.0,
      momentoInercia_Iy_cm4: 630.0,
      moduloSeccionElastico_Sx_cm3: 186.0,
      moduloSeccionElastico_Sy_cm3: 124.0,
      moduloSeccionPlastico_Zx_cm3: 235.0,
      moduloSeccionPlastico_Zy_cm3: 145.0,
      radioGiro_rx_cm: 7.25,
      radioGiro_ry_cm: 4.18
    },
    estabilidadYEsbeltez: {
      relacion_h_t: 29.0,
      clasificacionSeccionAISC: 'COMPACTA'
    },
    aplicacionRecomendada: ['Vigas de marco perimetral y trabes de claro libre mayor a 8 metros']
  },

  // 10. HSS 8" x 4" Cal. 3/8"
  'prod-mx-hss-8x4-38': {
    metadatos: {
      id: 'prod-mx-hss-8x4-38',
      sku: 'HSS-REC-203.2X101.6X9.53-A500B',
      nombreComercial: 'HSS 8" x 4" Cal. 3/8" (203.2 x 101.6 x 9.53 mm)',
      categoria: 'TUBULAR_RECTANGULAR',
      fabricanteOProveedor: 'Ternium / Tubacero',
      paisOrigen: 'México',
      normasCumplidas: ['AISC 360-22', 'ASTM A500 Grado B'],
      unidadVenta: 'TRAMO_6M',
      precioUnitarioEstimadoMXN: 9850.00
    },
    geometriaSeccion: {
      tipoPerfil: 'HSS',
      altoTotal_mm: 203.2,
      anchoTotal_mm: 101.6,
      espesorPared_mm: 9.53,
      radioGiroExterior_mm: 16.0,
      areaSeccion_cm2: 51.5,
      pesoLineal_kg_m: 40.5
    },
    propiedadesMecanicas: {
      tipoAcero: 'ASTM A500 Grado B',
      limiteFluencia_Fy_MPa: 317.0,
      resistenciaTraccion_Fu_MPa: 400.0,
      moduloElasticidad_E_GPa: 200.0,
      moduloCortante_G_GPa: 77.2,
      coeficientePoisson: 0.30,
      elongacionMinima_porcentaje: 23.0
    },
    propiedadesEstructuralesSeccion: {
      momentoInercia_Ix_cm4: 2580.0,
      momentoInercia_Iy_cm4: 865.0,
      moduloSeccionElastico_Sx_cm3: 254.0,
      moduloSeccionElastico_Sy_cm3: 170.0,
      moduloSeccionPlastico_Zx_cm3: 328.0,
      moduloSeccionPlastico_Zy_cm3: 205.0,
      radioGiro_rx_cm: 7.08,
      radioGiro_ry_cm: 4.10
    },
    estabilidadYEsbeltez: {
      relacion_h_t: 18.0,
      clasificacionSeccionAISC: 'COMPACTA'
    },
    aplicacionRecomendada: ['Vigas de carga pesada y columnas de portal asimétricas']
  },

  // 11. Viga IPR W 10" x 19 lb/ft
  'prod-mx-ipr-w10x19': {
    metadatos: {
      id: 'prod-mx-ipr-w10x19',
      sku: 'IPR-W10X19-A992',
      nombreComercial: 'Viga IPR W 10" x 19 lb/ft (260 x 102 x 6.35x10 mm)',
      categoria: 'VIGA_IPR',
      fabricanteOProveedor: 'Gerdau Corsa / AHMSA',
      paisOrigen: 'México',
      normasCumplidas: ['AISC 360-22', 'ASTM A992 Grado 50', 'NTC-DCEA 2023'],
      unidadVenta: 'TRAMO_12M',
      precioUnitarioEstimadoMXN: 5943.00
    },
    geometriaSeccion: {
      tipoPerfil: 'IPR',
      altoTotal_mm: 260.0,
      anchoTotal_mm: 102.0,
      espesorPared_mm: 6.35,
      espesorAlma_mm: 6.35,
      espesorPatin_mm: 10.0,
      radioGiroInterior_mm: 10.2,
      areaSeccion_cm2: 36.1,
      pesoLineal_kg_m: 28.30
    },
    propiedadesMecanicas: {
      tipoAcero: 'ASTM A992 Grado 50',
      limiteFluencia_Fy_MPa: 345.0,
      resistenciaTraccion_Fu_MPa: 450.0,
      moduloElasticidad_E_GPa: 200.0,
      moduloCortante_G_GPa: 77.2,
      coeficientePoisson: 0.30,
      elongacionMinima_porcentaje: 21.0
    },
    propiedadesEstructuralesSeccion: {
      momentoInercia_Ix_cm4: 4010.0,
      momentoInercia_Iy_cm4: 180.0,
      moduloSeccionElastico_Sx_cm3: 308.0,
      moduloSeccionElastico_Sy_cm3: 35.3,
      moduloSeccionPlastico_Zx_cm3: 354.0,
      moduloSeccionPlastico_Zy_cm3: 56.5,
      radioGiro_rx_cm: 10.5,
      radioGiro_ry_cm: 2.23,
      constanteTorsion_J_cm4: 8.5,
      constanteAlabeo_Cw_cm6: 28500.0
    },
    estabilidadYEsbeltez: {
      relacion_bf_2tf: 5.1,
      relacion_h_tw: 37.8,
      clasificacionSeccionAISC: 'COMPACTA'
    },
    aplicacionRecomendada: ['Vigas de marco rígido y trabes de flexión pura']
  },

  // 12. Viga IPR W 6" x 16 lb/ft
  'prod-mx-ipr-w6x16': {
    metadatos: {
      id: 'prod-mx-ipr-w6x16',
      sku: 'IPR-W6X16-A992',
      nombreComercial: 'Viga IPR W 6" x 16 lb/ft (160 x 102 x 6.6x10.3 mm)',
      categoria: 'VIGA_IPR',
      fabricanteOProveedor: 'Gerdau Corsa / AHMSA',
      paisOrigen: 'México',
      normasCumplidas: ['AISC 360-22', 'ASTM A992 Grado 50'],
      unidadVenta: 'TRAMO_12M',
      precioUnitarioEstimadoMXN: 5120.00
    },
    geometriaSeccion: {
      tipoPerfil: 'IPR',
      altoTotal_mm: 160.0,
      anchoTotal_mm: 102.0,
      espesorPared_mm: 6.6,
      espesorAlma_mm: 6.6,
      espesorPatin_mm: 10.3,
      areaSeccion_cm2: 30.5,
      pesoLineal_kg_m: 23.8
    },
    propiedadesMecanicas: {
      tipoAcero: 'ASTM A992 Grado 50',
      limiteFluencia_Fy_MPa: 345.0,
      resistenciaTraccion_Fu_MPa: 450.0,
      moduloElasticidad_E_GPa: 200.0,
      moduloCortante_G_GPa: 77.2,
      coeficientePoisson: 0.30,
      elongacionMinima_porcentaje: 21.0
    },
    propiedadesEstructuralesSeccion: {
      momentoInercia_Ix_cm4: 1340.0,
      momentoInercia_Iy_cm4: 184.0,
      moduloSeccionElastico_Sx_cm3: 167.5,
      moduloSeccionElastico_Sy_cm3: 36.1,
      moduloSeccionPlastico_Zx_cm3: 191.0,
      moduloSeccionPlastico_Zy_cm3: 56.0,
      radioGiro_rx_cm: 6.63,
      radioGiro_ry_cm: 2.46
    },
    estabilidadYEsbeltez: {
      clasificacionSeccionAISC: 'COMPACTA'
    },
    aplicacionRecomendada: ['Vigas de entrepiso y columnas cortas']
  },

  // 13. Viga IPR W 6" x 9 lb/ft
  'prod-mx-ipr-w6x9': {
    metadatos: {
      id: 'prod-mx-ipr-w6x9',
      sku: 'IPR-W6X9-A992',
      nombreComercial: 'Viga IPR W 6" x 9 lb/ft (150 x 100 x 4.3x5.5 mm)',
      categoria: 'VIGA_IPR',
      fabricanteOProveedor: 'Gerdau Corsa',
      paisOrigen: 'México',
      normasCumplidas: ['AISC 360-22', 'ASTM A992 Grado 50'],
      unidadVenta: 'TRAMO_12M',
      precioUnitarioEstimadoMXN: 3150.00
    },
    geometriaSeccion: {
      tipoPerfil: 'IPR',
      altoTotal_mm: 150.0,
      anchoTotal_mm: 100.0,
      espesorPared_mm: 4.3,
      espesorAlma_mm: 4.3,
      espesorPatin_mm: 5.5,
      areaSeccion_cm2: 17.3,
      pesoLineal_kg_m: 13.5
    },
    propiedadesMecanicas: {
      tipoAcero: 'ASTM A992 Grado 50',
      limiteFluencia_Fy_MPa: 345.0,
      resistenciaTraccion_Fu_MPa: 450.0,
      moduloElasticidad_E_GPa: 200.0,
      moduloCortante_G_GPa: 77.2,
      coeficientePoisson: 0.30,
      elongacionMinima_porcentaje: 21.0
    },
    propiedadesEstructuralesSeccion: {
      momentoInercia_Ix_cm4: 685.0,
      momentoInercia_Iy_cm4: 91.5,
      moduloSeccionElastico_Sx_cm3: 91.3,
      moduloSeccionElastico_Sy_cm3: 18.3,
      moduloSeccionPlastico_Zx_cm3: 102.0,
      moduloSeccionPlastico_Zy_cm3: 28.5,
      radioGiro_rx_cm: 6.29,
      radioGiro_ry_cm: 2.30
    },
    estabilidadYEsbeltez: {
      clasificacionSeccionAISC: 'COMPACTA'
    },
    aplicacionRecomendada: ['Vigas ligeras secundarias y travesaños de cubierta']
  },

  // 14. Viga IPR W 8" x 18 lb/ft
  'prod-mx-ipr-w8x18': {
    metadatos: {
      id: 'prod-mx-ipr-w8x18',
      sku: 'IPR-W8X18-A992',
      nombreComercial: 'Viga IPR W 8" x 18 lb/ft (207 x 133 x 5.8x8.4 mm)',
      categoria: 'VIGA_IPR',
      fabricanteOProveedor: 'Gerdau Corsa / AHMSA',
      paisOrigen: 'México',
      normasCumplidas: ['AISC 360-22', 'ASTM A992 Grado 50'],
      unidadVenta: 'TRAMO_12M',
      precioUnitarioEstimadoMXN: 5780.00
    },
    geometriaSeccion: {
      tipoPerfil: 'IPR',
      altoTotal_mm: 207.0,
      anchoTotal_mm: 133.0,
      espesorPared_mm: 5.8,
      espesorAlma_mm: 5.8,
      espesorPatin_mm: 8.4,
      areaSeccion_cm2: 34.0,
      pesoLineal_kg_m: 26.8
    },
    propiedadesMecanicas: {
      tipoAcero: 'ASTM A992 Grado 50',
      limiteFluencia_Fy_MPa: 345.0,
      resistenciaTraccion_Fu_MPa: 450.0,
      moduloElasticidad_E_GPa: 200.0,
      moduloCortante_G_GPa: 77.2,
      coeficientePoisson: 0.30,
      elongacionMinima_porcentaje: 21.0
    },
    propiedadesEstructuralesSeccion: {
      momentoInercia_Ix_cm4: 2570.0,
      momentoInercia_Iy_cm4: 330.0,
      moduloSeccionElastico_Sx_cm3: 248.0,
      moduloSeccionElastico_Sy_cm3: 49.6,
      moduloSeccionPlastico_Zx_cm3: 279.0,
      moduloSeccionPlastico_Zy_cm3: 76.5,
      radioGiro_rx_cm: 8.69,
      radioGiro_ry_cm: 3.12
    },
    estabilidadYEsbeltez: {
      clasificacionSeccionAISC: 'COMPACTA'
    },
    aplicacionRecomendada: ['Trabes de carga para claros de 6m a 10m']
  },

  // 15. Lámina Galvanizada Cal. 22
  'prod-mx-lamina-galv-cal22': {
    metadatos: {
      id: 'prod-mx-lamina-galv-cal22',
      sku: 'LAM-R101-CAL22-GALV',
      nombreComercial: 'Lámina Acanalada Perfil R-101 Cal. 22 (0.76 mm)',
      categoria: 'LAMINA_ACANALADA',
      fabricanteOProveedor: 'Ternium Pintro / Galvak',
      paisOrigen: 'México',
      normasCumplidas: ['AISI S100-16', 'NTC-DCEA 2023', 'ASTM A653 Grado 33'],
      unidadVenta: 'M2',
      precioUnitarioEstimadoMXN: 245.00
    },
    geometriaSeccion: {
      tipoPerfil: 'LAMINA',
      altoTotal_mm: 25.4,
      anchoTotal_mm: 1010.0,
      espesorPared_mm: 0.76,
      areaSeccion_cm2: 9.63,
      pesoLineal_kg_m: 7.56
    },
    propiedadesMecanicas: {
      tipoAcero: 'ASTM A653 G90 Grado 33',
      limiteFluencia_Fy_MPa: 230.0,
      resistenciaTraccion_Fu_MPa: 310.0,
      moduloElasticidad_E_GPa: 200.0,
      moduloCortante_G_GPa: 77.2,
      coeficientePoisson: 0.30,
      elongacionMinima_porcentaje: 20.0
    },
    propiedadesEstructuralesSeccion: {
      momentoInercia_Ix_cm4: 8.9,
      momentoInercia_Iy_cm4: 1200.0,
      moduloSeccionElastico_Sx_cm3: 5.2,
      moduloSeccionElastico_Sy_cm3: 21.0,
      moduloSeccionPlastico_Zx_cm3: 6.8,
      moduloSeccionPlastico_Zy_cm3: 28.0,
      radioGiro_rx_cm: 0.96,
      radioGiro_ry_cm: 11.2
    },
    estabilidadYEsbeltez: {
      clasificacionSeccionAISC: 'ESBELTA'
    },
    aplicacionRecomendada: ['Techumbres industriales y cubiertas de agua con pendientes > 10%']
  },

  // 16. Polín Monten C 4" x 2" Cal. 14
  'prod-mx-monten-4x2-cal14': {
    metadatos: {
      id: 'prod-mx-monten-4x2-cal14',
      sku: 'MONTEN-C-101.6X50.8X1.90-A653',
      nombreComercial: 'Polín Monten C 4" x 2" Cal. 14 (101.6 x 50.8 x 1.90 mm)',
      categoria: 'PERFIL_C_MONTEN',
      fabricanteOProveedor: 'PROLAMSA / Villacero',
      paisOrigen: 'México',
      normasCumplidas: ['AISI S100-16', 'ASTM A653 Grado 50'],
      unidadVenta: 'TRAMO_6M',
      precioUnitarioEstimadoMXN: 540.00
    },
    geometriaSeccion: {
      tipoPerfil: 'MONTEN_C',
      altoTotal_mm: 101.6,
      anchoTotal_mm: 50.8,
      espesorPared_mm: 1.90,
      longitudLabio_mm: 12.0,
      areaSeccion_cm2: 3.85,
      pesoLineal_kg_m: 3.02
    },
    propiedadesMecanicas: {
      tipoAcero: 'ASTM A653 Galvanizado Grado 50',
      limiteFluencia_Fy_MPa: 345.0,
      resistenciaTraccion_Fu_MPa: 450.0,
      moduloElasticidad_E_GPa: 200.0,
      moduloCortante_G_GPa: 77.2,
      coeficientePoisson: 0.30,
      elongacionMinima_porcentaje: 18.0
    },
    propiedadesEstructuralesSeccion: {
      momentoInercia_Ix_cm4: 64.0,
      momentoInercia_Iy_cm4: 13.5,
      moduloSeccionElastico_Sx_cm3: 12.6,
      moduloSeccionElastico_Sy_cm3: 3.9,
      moduloSeccionPlastico_Zx_cm3: 15.2,
      moduloSeccionPlastico_Zy_cm3: 6.2,
      radioGiro_rx_cm: 4.08,
      radioGiro_ry_cm: 1.87
    },
    estabilidadYEsbeltez: {
      clasificacionSeccionAISC: 'ESBELTA'
    },
    aplicacionRecomendada: ['Largueros de fachada y correas de claros hasta 4.5m']
  },

  // 17. Polín Monten C 6" x 2" Cal. 14
  'prod-mx-monten-6x2-cal14': {
    metadatos: {
      id: 'prod-mx-monten-6x2-cal14',
      sku: 'MONTEN-C-152.4X50.8X1.90-A653',
      nombreComercial: 'Polín Monten C 6" x 2" Cal. 14 (152.4 x 50.8 x 1.90 mm)',
      categoria: 'PERFIL_C_MONTEN',
      fabricanteOProveedor: 'PROLAMSA / Villacero / Ternium',
      paisOrigen: 'México',
      normasCumplidas: ['AISI S100-16', 'NTC-DCEA 2023', 'ASTM A653 Grado 50'],
      unidadVenta: 'TRAMO_6M',
      precioUnitarioEstimadoMXN: 793.80
    },
    geometriaSeccion: {
      tipoPerfil: 'MONTEN_C',
      altoTotal_mm: 152.4,
      anchoTotal_mm: 50.8,
      espesorPared_mm: 1.90,
      longitudLabio_mm: 15.0,
      radioGiroInterior_mm: 3.2,
      areaSeccion_cm2: 4.82,
      pesoLineal_kg_m: 3.78
    },
    propiedadesMecanicas: {
      tipoAcero: 'ASTM A653 Galvanizado Grado 50',
      limiteFluencia_Fy_MPa: 345.0,
      resistenciaTraccion_Fu_MPa: 450.0,
      moduloElasticidad_E_GPa: 200.0,
      moduloCortante_G_GPa: 77.2,
      coeficientePoisson: 0.30,
      elongacionMinima_porcentaje: 18.0
    },
    propiedadesEstructuralesSeccion: {
      momentoInercia_Ix_cm4: 168.0,
      momentoInercia_Iy_cm4: 18.5,
      moduloSeccionElastico_Sx_cm3: 22.0,
      moduloSeccionElastico_Sy_cm3: 5.4,
      moduloSeccionPlastico_Zx_cm3: 26.5,
      moduloSeccionPlastico_Zy_cm3: 8.2,
      radioGiro_rx_cm: 5.9,
      radioGiro_ry_cm: 1.96,
      constanteTorsion_J_cm4: 0.58
    },
    estabilidadYEsbeltez: {
      relacion_h_t: 76.2,
      clasificacionSeccionAISC: 'ESBELTA',
      comportamientoFlexion: 'Sujeto a pandeo distorsional y flexotorsional regulado por AISI S100-16.'
    },
    aplicacionRecomendada: ['Largueros de cubierta (correas) con claros entre marcos de 4m a 6m']
  },

  // 18. Perno Estructural Alta Resistencia M30 Grado 8.8
  'prod-mx-perno-m30-88': {
    metadatos: {
      id: 'prod-mx-perno-m30-88',
      sku: 'BOLT-M30X120-GR8.8-HDG',
      nombreComercial: 'Perno Estructural Alta Resistencia M30 x 120 mm Grado 8.8',
      categoria: 'TORNILLERIA_ANCLAJE',
      fabricanteOProveedor: 'Sujetadores Industriales / Fabrimex',
      paisOrigen: 'México',
      normasCumplidas: ['ISO 898-1', 'ASTM A325M', 'AISC 360-22'],
      unidadVenta: 'PIEZA',
      precioUnitarioEstimadoMXN: 145.00
    },
    geometriaSeccion: {
      tipoPerfil: 'ANCLAJE',
      altoTotal_mm: 120.0,
      anchoTotal_mm: 30.0,
      espesorPared_mm: 30.0,
      areaSeccion_cm2: 7.07,
      pesoLineal_kg_m: 5.55
    },
    propiedadesMecanicas: {
      tipoAcero: 'Acero Aleado Tratado Térmicamente Grado 8.8',
      limiteFluencia_Fy_MPa: 640.0,
      resistenciaTraccion_Fu_MPa: 800.0,
      moduloElasticidad_E_GPa: 205.0,
      moduloCortante_G_GPa: 79.0,
      coeficientePoisson: 0.30,
      elongacionMinima_porcentaje: 12.0
    },
    propiedadesEstructuralesSeccion: {
      momentoInercia_Ix_cm4: 3.98,
      momentoInercia_Iy_cm4: 3.98,
      moduloSeccionElastico_Sx_cm3: 2.65,
      moduloSeccionElastico_Sy_cm3: 2.65,
      moduloSeccionPlastico_Zx_cm3: 4.50,
      moduloSeccionPlastico_Zy_cm3: 4.50,
      radioGiro_rx_cm: 0.75,
      radioGiro_ry_cm: 0.75
    },
    estabilidadYEsbeltez: {
      clasificacionSeccionAISC: 'COMPACTA'
    },
    aplicacionRecomendada: ['Conexiones a momento viga-columna y empalmes de alta solicitación']
  },

  // 19. Placa Estructural ASTM A36 Espesor 1/2" (12.7 mm)
  'prod-mx-placa-a36-12in': {
    metadatos: {
      id: 'prod-mx-placa-a36-12in',
      sku: 'PL-A36-12.7MM-1/2',
      nombreComercial: 'Placa Estructural ASTM A36 Espesor 1/2" (12.7 mm)',
      categoria: 'PLACA_ESTRUCTURAL',
      fabricanteOProveedor: 'Altos Hornos de México / Ternium',
      paisOrigen: 'México',
      normasCumplidas: ['AISC 360-22', 'ASTM A36/A36M', 'NTC-DCEA 2023'],
      unidadVenta: 'KG',
      precioUnitarioEstimadoMXN: 38.50
    },
    geometriaSeccion: {
      tipoPerfil: 'PLACA',
      altoTotal_mm: 400.0,
      anchoTotal_mm: 400.0,
      espesorPared_mm: 12.7,
      areaSeccion_cm2: 50.8,
      pesoLineal_kg_m: 99.6
    },
    propiedadesMecanicas: {
      tipoAcero: 'ASTM A36 Carbon Steel',
      limiteFluencia_Fy_MPa: 250.0,
      resistenciaTraccion_Fu_MPa: 400.0,
      moduloElasticidad_E_GPa: 200.0,
      moduloCortante_G_GPa: 77.2,
      coeficientePoisson: 0.30,
      elongacionMinima_porcentaje: 23.0
    },
    propiedadesEstructuralesSeccion: {
      momentoInercia_Ix_cm4: 68.2,
      momentoInercia_Iy_cm4: 6770.0,
      moduloSeccionElastico_Sx_cm3: 10.7,
      moduloSeccionElastico_Sy_cm3: 338.0,
      moduloSeccionPlastico_Zx_cm3: 16.1,
      moduloSeccionPlastico_Zy_cm3: 508.0,
      radioGiro_rx_cm: 0.366,
      radioGiro_ry_cm: 11.5
    },
    estabilidadYEsbeltez: {
      clasificacionSeccionAISC: 'COMPACTA'
    },
    aplicacionRecomendada: ['Placas de base para columnas, placas cartabón y conexiones empernadas']
  },

  // 20. Placa Estructural ASTM A36 Espesor 1/4" (6.35 mm)
  'prod-mx-placa-a36-14in': {
    metadatos: {
      id: 'prod-mx-placa-a36-14in',
      sku: 'PL-A36-6.35MM-1/4',
      nombreComercial: 'Placa Estructural ASTM A36 Espesor 1/4" (6.35 mm)',
      categoria: 'PLACA_ESTRUCTURAL',
      fabricanteOProveedor: 'Ternium / AHMSA',
      paisOrigen: 'México',
      normasCumplidas: ['AISC 360-22', 'ASTM A36'],
      unidadVenta: 'KG',
      precioUnitarioEstimadoMXN: 37.00
    },
    geometriaSeccion: {
      tipoPerfil: 'PLACA',
      altoTotal_mm: 300.0,
      anchoTotal_mm: 300.0,
      espesorPared_mm: 6.35,
      areaSeccion_cm2: 19.05,
      pesoLineal_kg_m: 49.8
    },
    propiedadesMecanicas: {
      tipoAcero: 'ASTM A36 Carbon Steel',
      limiteFluencia_Fy_MPa: 250.0,
      resistenciaTraccion_Fu_MPa: 400.0,
      moduloElasticidad_E_GPa: 200.0,
      moduloCortante_G_GPa: 77.2,
      coeficientePoisson: 0.30,
      elongacionMinima_porcentaje: 23.0
    },
    propiedadesEstructuralesSeccion: {
      momentoInercia_Ix_cm4: 6.4,
      momentoInercia_Iy_cm4: 1420.0,
      moduloSeccionElastico_Sx_cm3: 2.01,
      moduloSeccionElastico_Sy_cm3: 95.0,
      moduloSeccionPlastico_Zx_cm3: 3.02,
      moduloSeccionPlastico_Zy_cm3: 142.0,
      radioGiro_rx_cm: 0.183,
      radioGiro_ry_cm: 8.65
    },
    estabilidadYEsbeltez: {
      clasificacionSeccionAISC: 'COMPACTA'
    },
    aplicacionRecomendada: ['Cartabones de refuerzo, clips angulares y placas de unión ligera']
  },

  // 21. Placa de Acero Corten ASTM A588 Espesor 10 mm
  'prod-mx-placa-corten-p10': {
    metadatos: {
      id: 'prod-mx-placa-corten-p10',
      sku: 'PL-A588-CORTEN-10MM',
      nombreComercial: 'Placa de Acero Intemperizado Cor-Ten ASTM A588 10 mm',
      categoria: 'PLACA_ESTRUCTURAL',
      fabricanteOProveedor: 'Ternium / AHMSA',
      paisOrigen: 'México',
      normasCumplidas: ['ASTM A588 Grado A', 'AISC 360-22'],
      unidadVenta: 'KG',
      precioUnitarioEstimadoMXN: 54.00
    },
    geometriaSeccion: {
      tipoPerfil: 'PLACA',
      altoTotal_mm: 350.0,
      anchoTotal_mm: 350.0,
      espesorPared_mm: 10.0,
      areaSeccion_cm2: 35.0,
      pesoLineal_kg_m: 78.5
    },
    propiedadesMecanicas: {
      tipoAcero: 'ASTM A588 Acero Autoprotector (Pátina)',
      limiteFluencia_Fy_MPa: 345.0,
      resistenciaTraccion_Fu_MPa: 485.0,
      moduloElasticidad_E_GPa: 200.0,
      moduloCortante_G_GPa: 77.2,
      coeficientePoisson: 0.30,
      elongacionMinima_porcentaje: 21.0
    },
    propiedadesEstructuralesSeccion: {
      momentoInercia_Ix_cm4: 29.1,
      momentoInercia_Iy_cm4: 3570.0,
      moduloSeccionElastico_Sx_cm3: 5.83,
      moduloSeccionElastico_Sy_cm3: 204.0,
      moduloSeccionPlastico_Zx_cm3: 8.75,
      moduloSeccionPlastico_Zy_cm3: 306.0,
      radioGiro_rx_cm: 0.288,
      radioGiro_ry_cm: 10.1
    },
    estabilidadYEsbeltez: {
      clasificacionSeccionAISC: 'COMPACTA'
    },
    aplicacionRecomendada: ['Pérgolas arquitectónicas de exterior sin recubrimiento de pintura']
  },

  // 22. PTR 1" x 1" Cal. 14
  'prod-mx-ptr-1x1-cal14': {
    metadatos: {
      id: 'prod-mx-ptr-1x1-cal14',
      sku: 'PTR-CUA-25.4X25.4X1.90-A500B',
      nombreComercial: 'PTR 1" x 1" Cal. 14 (25.4 x 25.4 x 1.90 mm)',
      categoria: 'TUBULAR_CUADRADO',
      fabricanteOProveedor: 'Ternium / Nacional',
      paisOrigen: 'México',
      normasCumplidas: ['ASTM A500 Grado B'],
      unidadVenta: 'TRAMO_6M',
      precioUnitarioEstimadoMXN: 310.00
    },
    geometriaSeccion: {
      tipoPerfil: 'PTR',
      altoTotal_mm: 25.4,
      anchoTotal_mm: 25.4,
      espesorPared_mm: 1.90,
      areaSeccion_cm2: 1.63,
      pesoLineal_kg_m: 1.28
    },
    propiedadesMecanicas: {
      tipoAcero: 'ASTM A500 Grado B',
      limiteFluencia_Fy_MPa: 317.0,
      resistenciaTraccion_Fu_MPa: 400.0,
      moduloElasticidad_E_GPa: 200.0,
      moduloCortante_G_GPa: 77.2,
      coeficientePoisson: 0.30,
      elongacionMinima_porcentaje: 23.0
    },
    propiedadesEstructuralesSeccion: {
      momentoInercia_Ix_cm4: 1.45,
      momentoInercia_Iy_cm4: 1.45,
      moduloSeccionElastico_Sx_cm3: 1.14,
      moduloSeccionElastico_Sy_cm3: 1.14,
      moduloSeccionPlastico_Zx_cm3: 1.40,
      moduloSeccionPlastico_Zy_cm3: 1.40,
      radioGiro_rx_cm: 0.94,
      radioGiro_ry_cm: 0.94
    },
    estabilidadYEsbeltez: {
      clasificacionSeccionAISC: 'COMPACTA'
    },
    aplicacionRecomendada: ['Enrejados secundarios, celosías de sombreado y pasamanos']
  },

  // 23. PTR 2" x 2" Cal. 11
  'prod-mx-ptr-2x2-cal11': {
    metadatos: {
      id: 'prod-mx-ptr-2x2-cal11',
      sku: 'PTR-CUA-50.8X50.8X3.18-A500B',
      nombreComercial: 'PTR 2" x 2" Cal. 11 (50.8 x 50.8 x 3.18 mm)',
      categoria: 'TUBULAR_CUADRADO',
      fabricanteOProveedor: 'Ternium / PROLAMSA',
      paisOrigen: 'México',
      normasCumplidas: ['AISC 360-22', 'ASTM A500 Grado B', 'NTC-DCEA 2023'],
      unidadVenta: 'TRAMO_6M',
      precioUnitarioEstimadoMXN: 945.00
    },
    geometriaSeccion: {
      tipoPerfil: 'PTR',
      altoTotal_mm: 50.8,
      anchoTotal_mm: 50.8,
      espesorPared_mm: 3.18,
      radioGiroExterior_mm: 3.8,
      areaSeccion_cm2: 5.64,
      pesoLineal_kg_m: 4.43
    },
    propiedadesMecanicas: {
      tipoAcero: 'ASTM A500 Grado B',
      limiteFluencia_Fy_MPa: 317.0,
      resistenciaTraccion_Fu_MPa: 400.0,
      moduloElasticidad_E_GPa: 200.0,
      moduloCortante_G_GPa: 77.2,
      coeficientePoisson: 0.30,
      elongacionMinima_porcentaje: 23.0
    },
    propiedadesEstructuralesSeccion: {
      momentoInercia_Ix_cm4: 19.8,
      momentoInercia_Iy_cm4: 19.8,
      moduloSeccionElastico_Sx_cm3: 7.8,
      moduloSeccionElastico_Sy_cm3: 7.8,
      moduloSeccionPlastico_Zx_cm3: 9.3,
      moduloSeccionPlastico_Zy_cm3: 9.3,
      radioGiro_rx_cm: 1.87,
      radioGiro_ry_cm: 1.87
    },
    estabilidadYEsbeltez: {
      relacion_b_t: 13.0,
      clasificacionSeccionAISC: 'COMPACTA'
    },
    aplicacionRecomendada: ['Diagonales y montantes (almas) de armaduras de gran rigidez']
  },

  // 24. PTR 4" x 4" Cal. 11
  'prod-mx-ptr-4x4-cal11': {
    metadatos: {
      id: 'prod-mx-ptr-4x4-cal11',
      sku: 'PTR-CUA-101.6X101.6X3.18-A500B',
      nombreComercial: 'PTR 4" x 4" Cal. 11 (101.6 x 101.6 x 3.18 mm)',
      categoria: 'TUBULAR_CUADRADO',
      fabricanteOProveedor: 'Ternium / PROLAMSA',
      paisOrigen: 'México',
      normasCumplidas: ['AISC 360-22', 'ASTM A500 Grado B'],
      unidadVenta: 'TRAMO_6M',
      precioUnitarioEstimadoMXN: 2032.80
    },
    geometriaSeccion: {
      tipoPerfil: 'PTR',
      altoTotal_mm: 101.6,
      anchoTotal_mm: 101.6,
      espesorPared_mm: 3.18,
      radioGiroExterior_mm: 3.8,
      areaSeccion_cm2: 12.33,
      pesoLineal_kg_m: 9.68
    },
    propiedadesMecanicas: {
      tipoAcero: 'ASTM A500 Grado B',
      limiteFluencia_Fy_MPa: 317.0,
      resistenciaTraccion_Fu_MPa: 400.0,
      moduloElasticidad_E_GPa: 200.0,
      moduloCortante_G_GPa: 77.2,
      coeficientePoisson: 0.30,
      elongacionMinima_porcentaje: 23.0
    },
    propiedadesEstructuralesSeccion: {
      momentoInercia_Ix_cm4: 191.0,
      momentoInercia_Iy_cm4: 191.0,
      moduloSeccionElastico_Sx_cm3: 37.6,
      moduloSeccionElastico_Sy_cm3: 37.6,
      moduloSeccionPlastico_Zx_cm3: 44.5,
      moduloSeccionPlastico_Zy_cm3: 44.5,
      radioGiro_rx_cm: 3.93,
      radioGiro_ry_cm: 3.93
    },
    estabilidadYEsbeltez: {
      relacion_b_t: 28.9,
      clasificacionSeccionAISC: 'COMPACTA'
    },
    aplicacionRecomendada: ['Cuerdas de armadura estándar de 12 a 20m']
  },

  // 25. PTR 4" x 4" Cal. 14
  'prod-mx-ptr-4x4-cal14': {
    metadatos: {
      id: 'prod-mx-ptr-4x4-cal14',
      sku: 'PTR-CUA-101.6X101.6X1.90-A500B',
      nombreComercial: 'PTR 4" x 4" Cal. 14 (101.6 x 101.6 x 1.90 mm)',
      categoria: 'TUBULAR_CUADRADO',
      fabricanteOProveedor: 'Ternium / Nacional',
      paisOrigen: 'México',
      normasCumplidas: ['AISC 360-22', 'ASTM A500 Grado B'],
      unidadVenta: 'TRAMO_6M',
      precioUnitarioEstimadoMXN: 1243.20
    },
    geometriaSeccion: {
      tipoPerfil: 'PTR',
      altoTotal_mm: 101.6,
      anchoTotal_mm: 101.6,
      espesorPared_mm: 1.90,
      radioGiroExterior_mm: 3.8,
      areaSeccion_cm2: 7.54,
      pesoLineal_kg_m: 5.92
    },
    propiedadesMecanicas: {
      tipoAcero: 'ASTM A500 Grado B',
      limiteFluencia_Fy_MPa: 317.0,
      resistenciaTraccion_Fu_MPa: 400.0,
      moduloElasticidad_E_GPa: 200.0,
      moduloCortante_G_GPa: 77.2,
      coeficientePoisson: 0.30,
      elongacionMinima_porcentaje: 23.0
    },
    propiedadesEstructuralesSeccion: {
      momentoInercia_Ix_cm4: 121.0,
      momentoInercia_Iy_cm4: 121.0,
      moduloSeccionElastico_Sx_cm3: 23.8,
      moduloSeccionElastico_Sy_cm3: 23.8,
      moduloSeccionPlastico_Zx_cm3: 27.8,
      moduloSeccionPlastico_Zy_cm3: 27.8,
      radioGiro_rx_cm: 4.01,
      radioGiro_ry_cm: 4.01
    },
    estabilidadYEsbeltez: {
      relacion_b_t: 50.4,
      clasificacionSeccionAISC: 'ESBELTA'
    },
    aplicacionRecomendada: ['Estructuras ligeras no portantes y pérgolas decorativas']
  },

  // 26. HSS 8" x 8" Cal. 1/4"
  'prod-mx-hss-8x8-14': {
    metadatos: {
      id: 'prod-mx-hss-8x8-14',
      sku: 'HSS-CUA-203.2X203.2X6.35-A500B',
      nombreComercial: 'HSS 8" x 8" Cal. 1/4" (203.2 x 203.2 x 6.35 mm)',
      categoria: 'TUBULAR_CUADRADO',
      fabricanteOProveedor: 'Ternium / Tubacero / Nacional',
      paisOrigen: 'México',
      normasCumplidas: ['AISC 360-22', 'ASTM A500 Grado B', 'NTC-DCEA 2023'],
      unidadVenta: 'TRAMO_12M',
      precioUnitarioEstimadoMXN: 8190.00
    },
    geometriaSeccion: {
      tipoPerfil: 'HSS',
      altoTotal_mm: 203.2,
      anchoTotal_mm: 203.2,
      espesorPared_mm: 6.35,
      radioGiroExterior_mm: 15.8,
      areaSeccion_cm2: 48.9,
      pesoLineal_kg_m: 38.4
    },
    propiedadesMecanicas: {
      tipoAcero: 'ASTM A500 Grado B',
      limiteFluencia_Fy_MPa: 317.0,
      resistenciaTraccion_Fu_MPa: 400.0,
      moduloElasticidad_E_GPa: 200.0,
      moduloCortante_G_GPa: 77.2,
      coeficientePoisson: 0.30,
      elongacionMinima_porcentaje: 23.0
    },
    propiedadesEstructuralesSeccion: {
      momentoInercia_Ix_cm4: 3180.0,
      momentoInercia_Iy_cm4: 3180.0,
      moduloSeccionElastico_Sx_cm3: 313.0,
      moduloSeccionElastico_Sy_cm3: 313.0,
      moduloSeccionPlastico_Zx_cm3: 367.0,
      moduloSeccionPlastico_Zy_cm3: 367.0,
      radioGiro_rx_cm: 8.06,
      radioGiro_ry_cm: 8.06,
      constanteTorsion_J_cm4: 5120.0
    },
    estabilidadYEsbeltez: {
      relacion_b_t: 29.0,
      clasificacionSeccionAISC: 'COMPACTA',
      comportamientoCompresion: 'Máxima resistencia axial y capacidad a flexo-compresión biaxial para marcos rígidos.'
    },
    aplicacionRecomendada: ['Columnas estructurales de naves industriales, claros de hasta 30m']
  },

  // 27. Ancla Estructural ASTM F1554 Grado 55 M24 / Ø1"
  'prod-mx-anclaje-f1554-gr55': {
    metadatos: {
      id: 'prod-mx-anclaje-f1554-gr55',
      sku: 'ANC-F1554-GR55-M24',
      nombreComercial: 'Ancla Estructural ASTM F1554 Grado 55 Ø1" (25.4 mm)',
      categoria: 'TORNILLERIA_ANCLAJE',
      fabricanteOProveedor: 'Fabrimex / Sujetadores Industriales',
      paisOrigen: 'México',
      normasCumplidas: ['ACI 318-19 Cap. 17', 'ASTM F1554 Grado 55', 'AISC 360-22'],
      unidadVenta: 'PIEZA',
      precioUnitarioEstimadoMXN: 310.00
    },
    geometriaSeccion: {
      tipoPerfil: 'ANCLAJE',
      altoTotal_mm: 600.0,
      anchoTotal_mm: 25.4,
      espesorPared_mm: 25.4,
      areaSeccion_cm2: 5.07,
      pesoLineal_kg_m: 3.98
    },
    propiedadesMecanicas: {
      tipoAcero: 'ASTM F1554 Grado 55 Soldable',
      limiteFluencia_Fy_MPa: 380.0,
      resistenciaTraccion_Fu_MPa: 517.0,
      moduloElasticidad_E_GPa: 200.0,
      moduloCortante_G_GPa: 77.2,
      coeficientePoisson: 0.30,
      elongacionMinima_porcentaje: 21.0
    },
    propiedadesEstructuralesSeccion: {
      momentoInercia_Ix_cm4: 2.04,
      momentoInercia_Iy_cm4: 2.04,
      moduloSeccionElastico_Sx_cm3: 1.61,
      moduloSeccionElastico_Sy_cm3: 1.61,
      moduloSeccionPlastico_Zx_cm3: 2.80,
      moduloSeccionPlastico_Zy_cm3: 2.80,
      radioGiro_rx_cm: 0.635,
      radioGiro_ry_cm: 0.635
    },
    estabilidadYEsbeltez: {
      clasificacionSeccionAISC: 'COMPACTA'
    },
    aplicacionRecomendada: ['Anclaje a dados de concreto con gancho estándar a 90°']
  },

  // 28. Ancla Estructural ASTM F1554 Grado 55 Ø3/4"
  'prod-mx-perno-f1554-34': {
    metadatos: {
      id: 'prod-mx-perno-f1554-34',
      sku: 'ANC-F1554-GR55-3/4',
      nombreComercial: 'Ancla Estructural ASTM F1554 Grado 55 Ø3/4" (19.05 mm)',
      categoria: 'TORNILLERIA_ANCLAJE',
      fabricanteOProveedor: 'Fabrimex / Sujetadores Industriales',
      paisOrigen: 'México',
      normasCumplidas: ['ACI 318-19 Cap. 17', 'ASTM F1554 Grado 55', 'AISC Design Guide 1'],
      unidadVenta: 'PIEZA',
      precioUnitarioEstimadoMXN: 245.00
    },
    geometriaSeccion: {
      tipoPerfil: 'ANCLAJE',
      altoTotal_mm: 500.0,
      anchoTotal_mm: 19.05,
      espesorPared_mm: 19.05,
      areaSeccion_cm2: 2.85,
      pesoLineal_kg_m: 2.24
    },
    propiedadesMecanicas: {
      tipoAcero: 'ASTM F1554 Grado 55 Soldable',
      limiteFluencia_Fy_MPa: 380.0,
      resistenciaTraccion_Fu_MPa: 517.0,
      moduloElasticidad_E_GPa: 200.0,
      moduloCortante_G_GPa: 77.2,
      coeficientePoisson: 0.30,
      elongacionMinima_porcentaje: 21.0
    },
    propiedadesEstructuralesSeccion: {
      momentoInercia_Ix_cm4: 0.645,
      momentoInercia_Iy_cm4: 0.645,
      moduloSeccionElastico_Sx_cm3: 0.677,
      moduloSeccionElastico_Sy_cm3: 0.677,
      moduloSeccionPlastico_Zx_cm3: 1.18,
      moduloSeccionPlastico_Zy_cm3: 1.18,
      radioGiro_rx_cm: 0.476,
      radioGiro_ry_cm: 0.476
    },
    estabilidadYEsbeltez: {
      clasificacionSeccionAISC: 'COMPACTA'
    },
    aplicacionRecomendada: ['Anclaje sísmico en pedestales de concreto reforzado con gancho estándar a 90°']
  },

  // 29. Placa Estructural ASTM A36 Espesor 3/4" (19.05 mm)
  'prod-mx-placa-a36-34': {
    metadatos: {
      id: 'prod-mx-placa-a36-34',
      sku: 'PL-A36-19.05MM-3/4',
      nombreComercial: 'Placa Estructural ASTM A36 Espesor 3/4" (19.05 mm)',
      categoria: 'PLACA_ESTRUCTURAL',
      fabricanteOProveedor: 'Altos Hornos de México / Ternium',
      paisOrigen: 'México',
      normasCumplidas: ['AISC 360-22', 'ASTM A36/A36M', 'NTC-DCEA 2023', 'AISC DG-01'],
      unidadVenta: 'KG',
      precioUnitarioEstimadoMXN: 42.50
    },
    geometriaSeccion: {
      tipoPerfil: 'PLACA',
      altoTotal_mm: 400.0,
      anchoTotal_mm: 400.0,
      espesorPared_mm: 19.05,
      areaSeccion_cm2: 76.2,
      pesoLineal_kg_m: 149.4
    },
    propiedadesMecanicas: {
      tipoAcero: 'ASTM A36 Carbon Steel',
      limiteFluencia_Fy_MPa: 250.0,
      resistenciaTraccion_Fu_MPa: 400.0,
      moduloElasticidad_E_GPa: 200.0,
      moduloCortante_G_GPa: 77.2,
      coeficientePoisson: 0.30,
      elongacionMinima_porcentaje: 23.0
    },
    propiedadesEstructuralesSeccion: {
      momentoInercia_Ix_cm4: 230.1,
      momentoInercia_Iy_cm4: 10150.0,
      moduloSeccionElastico_Sx_cm3: 24.1,
      moduloSeccionElastico_Sy_cm3: 507.0,
      moduloSeccionPlastico_Zx_cm3: 36.2,
      moduloSeccionPlastico_Zy_cm3: 761.0,
      radioGiro_rx_cm: 0.55,
      radioGiro_ry_cm: 11.5
    },
    estabilidadYEsbeltez: {
      clasificacionSeccionAISC: 'COMPACTA',
      comportamientoFlexion: 'Rigidez torsional y flexionante óptima para distribución uniforme de esfuerzos en base.'
    },
    aplicacionRecomendada: ['Placas de base rígidas para columnas de marco y momentos flectores elevados']
  },

  // 30. Pedestal & Zapata de Concreto f'c=250 kg/cm²
  'prod-mx-pedestal-fpc250': {
    metadatos: {
      id: 'prod-mx-pedestal-fpc250',
      sku: 'CONC-FPC250-PEDESTAL',
      nombreComercial: 'Pedestal & Zapata de Concreto f\'c=250 kg/cm²',
      categoria: 'GROUT_CONCRETO',
      fabricanteOProveedor: 'CEMEX / Holcim / Moctezuma',
      paisOrigen: 'México',
      normasCumplidas: ['ACI 318-19', 'NTC-Concreto 2023', 'NMX-C-414'],
      unidadVenta: 'PIEZA',
      precioUnitarioEstimadoMXN: 3850.00
    },
    geometriaSeccion: {
      tipoPerfil: 'PLACA',
      altoTotal_mm: 500.0,
      anchoTotal_mm: 500.0,
      espesorPared_mm: 500.0,
      areaSeccion_cm2: 2500.0,
      pesoLineal_kg_m: 600.0
    },
    propiedadesMecanicas: {
      tipoAcero: 'Concreto Clase 1 f\'c=250 kg/cm² + Acero Grado 42',
      limiteFluencia_Fy_MPa: 24.5,
      resistenciaTraccion_Fu_MPa: 3.1,
      moduloElasticidad_E_GPa: 23.5,
      moduloCortante_G_GPa: 9.8,
      coeficientePoisson: 0.20,
      elongacionMinima_porcentaje: 0.3
    },
    propiedadesEstructuralesSeccion: {
      momentoInercia_Ix_cm4: 520833.0,
      momentoInercia_Iy_cm4: 520833.0,
      moduloSeccionElastico_Sx_cm3: 20833.0,
      moduloSeccionElastico_Sy_cm3: 20833.0,
      moduloSeccionPlastico_Zx_cm3: 31250.0,
      moduloSeccionPlastico_Zy_cm3: 31250.0,
      radioGiro_rx_cm: 14.43,
      radioGiro_ry_cm: 14.43
    },
    estabilidadYEsbeltez: {
      clasificacionSeccionAISC: 'COMPACTA',
      comportamientoCompresion: 'Capacidad de soporte por contacto y aplastamiento según ACI 318.'
    },
    aplicacionRecomendada: ['Dados y zapatas aisladas para cimentación superficial']
  },

  // 31. Grout No Retráctil ASTM C1107
  'prod-mx-grout-c1107': {
    metadatos: {
      id: 'prod-mx-grout-c1107',
      sku: 'GROUT-C1107-600K',
      nombreComercial: 'Mortero Grout No Retráctil ASTM C1107 (600 kg/cm²)',
      categoria: 'GROUT_CONCRETO',
      fabricanteOProveedor: 'Sika / Fester / MAPEI',
      paisOrigen: 'México',
      normasCumplidas: ['ASTM C1107', 'CRD C621', 'ACI 351.1R'],
      unidadVenta: 'SACO_25KG',
      precioUnitarioEstimadoMXN: 395.00
    },
    geometriaSeccion: {
      tipoPerfil: 'PLACA',
      altoTotal_mm: 450.0,
      anchoTotal_mm: 450.0,
      espesorPared_mm: 30.0,
      areaSeccion_cm2: 2025.0,
      pesoLineal_kg_m: 46.5
    },
    propiedadesMecanicas: {
      tipoAcero: 'Mortero Hidráulico Expansivo Controlado f\'c=60 MPa',
      limiteFluencia_Fy_MPa: 58.8,
      resistenciaTraccion_Fu_MPa: 4.5,
      moduloElasticidad_E_GPa: 28.0,
      moduloCortante_G_GPa: 11.5,
      coeficientePoisson: 0.20,
      elongacionMinima_porcentaje: 0.1
    },
    propiedadesEstructuralesSeccion: {
      momentoInercia_Ix_cm4: 15187.0,
      momentoInercia_Iy_cm4: 15187.0,
      moduloSeccionElastico_Sx_cm3: 675.0,
      moduloSeccionElastico_Sy_cm3: 675.0,
      moduloSeccionPlastico_Zx_cm3: 1012.0,
      moduloSeccionPlastico_Zy_cm3: 1012.0,
      radioGiro_rx_cm: 2.74,
      radioGiro_ry_cm: 2.74
    },
    estabilidadYEsbeltez: {
      clasificacionSeccionAISC: 'COMPACTA'
    },
    aplicacionRecomendada: ['Relleno de nivelación bajo placas base de columna y transmisión de esfuerzos axiales']
  },

  // 32. Tubo Redondo Estructural Ø2" Cédula 40 (60.3 x 3.91 mm)
  'prod-mx-tubo-2in-ced40': {
    metadatos: {
      id: 'prod-mx-tubo-2in-ced40',
      sku: 'TUBO-OC-60.3X3.91-A53B',
      nombreComercial: 'Tubo Redondo Estructural Ø2" Cédula 40 (60.3 x 3.91 mm)',
      categoria: 'TUBULAR_REDONDO',
      fabricanteOProveedor: 'Ternium / Tubacero / PROLAMSA',
      paisOrigen: 'México',
      normasCumplidas: ['AISC 360-22', 'ASTM A53 Grado B', 'ASTM A500 Grado B'],
      unidadVenta: 'TRAMO_6M',
      precioUnitarioEstimadoMXN: 1180.00
    },
    geometriaSeccion: {
      tipoPerfil: 'TUBO',
      altoTotal_mm: 60.3,
      anchoTotal_mm: 60.3,
      espesorPared_mm: 3.91,
      areaSeccion_cm2: 6.93,
      pesoLineal_kg_m: 5.44
    },
    propiedadesMecanicas: {
      tipoAcero: 'ASTM A53 Grado B / A500',
      limiteFluencia_Fy_MPa: 240.0,
      resistenciaTraccion_Fu_MPa: 415.0,
      moduloElasticidad_E_GPa: 200.0,
      moduloCortante_G_GPa: 77.2,
      coeficientePoisson: 0.30,
      elongacionMinima_porcentaje: 23.0
    },
    propiedadesEstructuralesSeccion: {
      momentoInercia_Ix_cm4: 27.6,
      momentoInercia_Iy_cm4: 27.6,
      moduloSeccionElastico_Sx_cm3: 9.15,
      moduloSeccionElastico_Sy_cm3: 9.15,
      moduloSeccionPlastico_Zx_cm3: 12.4,
      moduloSeccionPlastico_Zy_cm3: 12.4,
      radioGiro_rx_cm: 2.00,
      radioGiro_ry_cm: 2.00,
      constanteTorsion_J_cm4: 55.2
    },
    estabilidadYEsbeltez: {
      relacion_D_t: 15.4,
      clasificacionSeccionAISC: 'COMPACTA'
    },
    aplicacionRecomendada: ['Diagonales tubulares, celosías espaciales, barandales y pérgolas de tubo']
  },

  // 33. Tubo Redondo Estructural Ø4" Cédula 40 (114.3 x 6.02 mm)
  'prod-mx-tubo-4in-ced40': {
    metadatos: {
      id: 'prod-mx-tubo-4in-ced40',
      sku: 'TUBO-OC-114.3X6.02-A53B',
      nombreComercial: 'Tubo Redondo Estructural Ø4" Cédula 40 (114.3 x 6.02 mm)',
      categoria: 'TUBULAR_REDONDO',
      fabricanteOProveedor: 'Ternium / Tubacero',
      paisOrigen: 'México',
      normasCumplidas: ['AISC 360-22', 'ASTM A53 Grado B', 'ASTM A500 Grado B'],
      unidadVenta: 'TRAMO_6M',
      precioUnitarioEstimadoMXN: 3250.00
    },
    geometriaSeccion: {
      tipoPerfil: 'TUBO',
      altoTotal_mm: 114.3,
      anchoTotal_mm: 114.3,
      espesorPared_mm: 6.02,
      areaSeccion_cm2: 20.48,
      pesoLineal_kg_m: 16.08
    },
    propiedadesMecanicas: {
      tipoAcero: 'ASTM A53 Grado B / A500',
      limiteFluencia_Fy_MPa: 240.0,
      resistenciaTraccion_Fu_MPa: 415.0,
      moduloElasticidad_E_GPa: 200.0,
      moduloCortante_G_GPa: 77.2,
      coeficientePoisson: 0.30,
      elongacionMinima_porcentaje: 23.0
    },
    propiedadesEstructuralesSeccion: {
      momentoInercia_Ix_cm4: 301.0,
      momentoInercia_Iy_cm4: 301.0,
      moduloSeccionElastico_Sx_cm3: 52.7,
      moduloSeccionElastico_Sy_cm3: 52.7,
      moduloSeccionPlastico_Zx_cm3: 71.0,
      moduloSeccionPlastico_Zy_cm3: 71.0,
      radioGiro_rx_cm: 3.84,
      radioGiro_ry_cm: 3.84,
      constanteTorsion_J_cm4: 602.0
    },
    estabilidadYEsbeltez: {
      relacion_D_t: 19.0,
      clasificacionSeccionAISC: 'COMPACTA'
    },
    aplicacionRecomendada: ['Columnas cilíndricas de pérgola y puntales principales']
  },

  // 34. Varilla Corrugada Grado 42 No. 3 (3/8" - 9.52 mm)
  'prod-mx-varilla-no3-38in': {
    metadatos: {
      id: 'prod-mx-varilla-no3-38in',
      sku: 'VAR-CORR-GR42-NO3-3/8',
      nombreComercial: 'Varilla Corrugada Grado 42 No. 3 Ø3/8" (9.52 mm)',
      categoria: 'VARILLA_CORRUGADA',
      fabricanteOProveedor: 'Deacero / Simec / ArcelorMittal',
      paisOrigen: 'México',
      normasCumplidas: ['NMX-B-506-CANACERO', 'ASTM A615 Grado 60', 'NTC-Concreto 2023'],
      unidadVenta: 'TRAMO_12M',
      precioUnitarioEstimadoMXN: 185.00
    },
    geometriaSeccion: {
      tipoPerfil: 'VARILLA',
      altoTotal_mm: 9.52,
      anchoTotal_mm: 9.52,
      espesorPared_mm: 9.52,
      areaSeccion_cm2: 0.71,
      pesoLineal_kg_m: 0.56
    },
    propiedadesMecanicas: {
      tipoAcero: 'Acero de Refuerzo Grado 42 (Fy=4200 kg/cm²)',
      limiteFluencia_Fy_MPa: 420.0,
      resistenciaTraccion_Fu_MPa: 630.0,
      moduloElasticidad_E_GPa: 200.0,
      moduloCortante_G_GPa: 77.2,
      coeficientePoisson: 0.30,
      elongacionMinima_porcentaje: 9.0
    },
    propiedadesEstructuralesSeccion: {
      momentoInercia_Ix_cm4: 0.04,
      momentoInercia_Iy_cm4: 0.04,
      moduloSeccionElastico_Sx_cm3: 0.08,
      moduloSeccionElastico_Sy_cm3: 0.08,
      moduloSeccionPlastico_Zx_cm3: 0.15,
      moduloSeccionPlastico_Zy_cm3: 0.15,
      radioGiro_rx_cm: 0.238,
      radioGiro_ry_cm: 0.238
    },
    estabilidadYEsbeltez: {
      clasificacionSeccionAISC: 'COMPACTA'
    },
    aplicacionRecomendada: ['Estribos en pedestales, armaduras de zapatas y bastones de refuerzo']
  }
};

/**
 * Returns all available material catalog items as an array
 */
export function getAllMaterialCatalogItems(): MaterialCatalogItem[] {
  return Object.values(MASTER_MATERIAL_CATALOG);
}

/**
 * Returns catalog items filtered by role or profile family
 */
export function getCatalogItemsByRole(role: string): MaterialCatalogItem[] {
  const all = Object.values(MASTER_MATERIAL_CATALOG);
  if (role === 'COLUMN') {
    return all.filter(
      (i) =>
        i.metadatos.categoria === 'TUBULAR_RECTANGULAR' ||
        i.metadatos.categoria === 'TUBULAR_CUADRADO' ||
        i.metadatos.categoria === 'TUBULAR_REDONDO' ||
        i.metadatos.categoria === 'VIGA_IPR'
    );
  }
  if (role === 'TOP_CHORD' || role === 'BOTTOM_CHORD') {
    return all.filter(
      (i) =>
        i.metadatos.categoria === 'TUBULAR_CUADRADO' ||
        i.metadatos.categoria === 'TUBULAR_RECTANGULAR' ||
        i.metadatos.categoria === 'TUBULAR_REDONDO'
    );
  }
  if (role === 'DIAGONAL' || role === 'VERTICAL') {
    return all.filter(
      (i) =>
        i.metadatos.categoria === 'TUBULAR_CUADRADO' ||
        i.metadatos.categoria === 'TUBULAR_RECTANGULAR' ||
        i.metadatos.categoria === 'TUBULAR_REDONDO' ||
        i.metadatos.categoria === 'CABLE_TENSOR'
    );
  }
  if (role === 'PURLIN') {
    return all.filter(
      (i) => i.metadatos.categoria === 'PERFIL_C_MONTEN' || i.metadatos.categoria === 'LAMINA_ACANALADA'
    );
  }
  if (role === 'BASE_PLATE' || role === 'GUSSET') {
    return all.filter((i) => i.metadatos.categoria === 'PLACA_ESTRUCTURAL');
  }
  if (role === 'ANCHOR') {
    return all.filter((i) => i.metadatos.categoria === 'TORNILLERIA_ANCLAJE');
  }
  return all;
}

// ============================================================
// 2. SECTION REPRESENTATION RESOLVER & 2D SHAPES
// ============================================================

export interface SectionRepresentationData {
  catalogItemId: string;
  catalogItem?: MaterialCatalogItem;
  materialMetadata?: CatalogMetadata;
  shape2D: THREE.Shape;
  holes2D?: THREE.Path[];
  meshGeometry: THREE.BufferGeometry;
  svgPath: string;
  nominalDimensions: {
    depthM: number;
    widthM: number;
    thicknessM: number;
    flangeThicknessM?: number;
    webThicknessM?: number;
  };
}

/**
 * Retrieves a material catalog item by ID with fallback support
 */
export function getMaterialCatalogItem(catalogItemId?: string): MaterialCatalogItem {
  if (catalogItemId && MASTER_MATERIAL_CATALOG[catalogItemId]) {
    return MASTER_MATERIAL_CATALOG[catalogItemId];
  }
  // Fallback to standard HSS 6x4x1/4
  return MASTER_MATERIAL_CATALOG['prod-mx-hss-6x4-14'];
}

/**
 * Resolves 2D cross-section Shape and 3D extrusion geometry according
 * to the Material Catalog & Section Representation Contract.
 * Ensures mesh geometry is explicitly tagged with catalogItemId metadata.
 */
export function resolveSectionRepresentation(
  itemOrId: MaterialCatalogItem | string,
  lengthM: number = 1.0
): SectionRepresentationData {
  const item: MaterialCatalogItem =
    typeof itemOrId === 'string' ? getMaterialCatalogItem(itemOrId) : itemOrId;

  const catalogItemId = item.metadatos.id;
  const g = item.geometriaSeccion;
  const H = g.altoTotal_mm / 1000;
  const B = g.anchoTotal_mm / 1000;
  const t = g.espesorPared_mm / 1000;
  const tf = (g.espesorPatin_mm || g.espesorPared_mm) / 1000;
  const tw = (g.espesorAlma_mm || g.espesorPared_mm) / 1000;

  let shape = new THREE.Shape();
  let holes: THREE.Path[] = [];
  let svgPath = '';

  switch (g.tipoPerfil) {
    case 'HSS':
    case 'PTR': {
      // Outer Rectangle
      shape.moveTo(-B / 2, -H / 2);
      shape.lineTo(B / 2, -H / 2);
      shape.lineTo(B / 2, H / 2);
      shape.lineTo(-B / 2, H / 2);
      shape.closePath();

      // Inner Hole (Hollow Section)
      const hole = new THREE.Path();
      const inB = Math.max(0.001, B - 2 * t);
      const inH = Math.max(0.001, H - 2 * t);
      hole.moveTo(-inB / 2, -inH / 2);
      hole.lineTo(inB / 2, -inH / 2);
      hole.lineTo(inB / 2, inH / 2);
      hole.lineTo(-inB / 2, inH / 2);
      hole.closePath();
      holes.push(hole);
      shape.holes = holes;

      svgPath = `M ${-B / 2} ${-H / 2} L ${B / 2} ${-H / 2} L ${B / 2} ${H / 2} L ${-B / 2} ${H / 2} Z M ${-inB / 2} ${-inH / 2} L ${inB / 2} ${-inH / 2} L ${inB / 2} ${inH / 2} L ${-inB / 2} ${inH / 2} Z`;
      break;
    }

    case 'TUBO': {
      // Hollow Cylindrical Tube (Outer Circle + Inner Circle Hole)
      const rOuter = B / 2;
      const rInner = Math.max(0.001, rOuter - t);

      shape.absarc(0, 0, rOuter, 0, Math.PI * 2, false);

      const hole = new THREE.Path();
      hole.absarc(0, 0, rInner, 0, Math.PI * 2, true);
      holes.push(hole);
      shape.holes = holes;

      svgPath = `M ${rOuter} 0 A ${rOuter} ${rOuter} 0 1 0 ${-rOuter} 0 A ${rOuter} ${rOuter} 0 1 0 ${rOuter} 0 Z M ${rInner} 0 A ${rInner} ${rInner} 0 1 1 ${-rInner} 0 A ${rInner} ${rInner} 0 1 1 ${rInner} 0 Z`;
      break;
    }

    case 'VARILLA':
    case 'CABLE':
    case 'ANCLAJE': {
      // Solid Cylinder / Bar
      const r = B / 2;
      shape.absarc(0, 0, r, 0, Math.PI * 2, false);
      svgPath = `M ${r} 0 A ${r} ${r} 0 1 0 ${-r} 0 A ${r} ${r} 0 1 0 ${r} 0 Z`;
      break;
    }

    case 'IPR': {
      // True I-Beam Profile with Flanges and Web
      const halfB = B / 2;
      const halfH = H / 2;
      const halfTw = tw / 2;

      shape.moveTo(-halfB, -halfH);
      shape.lineTo(halfB, -halfH);
      shape.lineTo(halfB, -halfH + tf);
      shape.lineTo(halfTw, -halfH + tf);
      shape.lineTo(halfTw, halfH - tf);
      shape.lineTo(halfB, halfH - tf);
      shape.lineTo(halfB, halfH);
      shape.lineTo(-halfB, halfH);
      shape.lineTo(-halfB, halfH - tf);
      shape.lineTo(-halfTw, halfH - tf);
      shape.lineTo(-halfTw, -halfH + tf);
      shape.lineTo(-halfB, -halfH + tf);
      shape.closePath();

      svgPath = `M ${-halfB} ${-halfH} L ${halfB} ${-halfH} L ${halfB} ${-halfH + tf} L ${halfTw} ${-halfH + tf} L ${halfTw} ${halfH - tf} L ${halfB} ${halfH - tf} L ${halfB} ${halfH} L ${-halfB} ${halfH} L ${-halfB} ${halfH - tf} L ${-halfTw} ${halfH - tf} L ${-halfTw} ${-halfH + tf} L ${-halfB} ${-halfH + tf} Z`;
      break;
    }

    case 'MONTEN_C': {
      // Cold-Formed C-Channel with stiffening lips
      const lip = (g.longitudLabio_mm || 15) / 1000;
      const halfB = B / 2;
      const halfH = H / 2;

      shape.moveTo(-halfB + lip, -halfH);
      shape.lineTo(-halfB, -halfH);
      shape.lineTo(-halfB, halfH);
      shape.lineTo(-halfB + lip, halfH);
      shape.lineTo(-halfB + lip, halfH - t);
      shape.lineTo(-halfB + t, halfH - t);
      shape.lineTo(-halfB + t, -halfH + t);
      shape.lineTo(-halfB + lip, -halfH + t);
      shape.closePath();

      svgPath = `M ${-halfB + lip} ${-halfH} L ${-halfB} ${-halfH} L ${-halfB} ${halfH} L ${-halfB + lip} ${halfH} Z`;
      break;
    }

    case 'PLACA':
    default: {
      shape.moveTo(-B / 2, -H / 2);
      shape.lineTo(B / 2, -H / 2);
      shape.lineTo(B / 2, H / 2);
      shape.lineTo(-B / 2, H / 2);
      shape.closePath();
      svgPath = `M ${-B / 2} ${-H / 2} L ${B / 2} ${-H / 2} L ${B / 2} ${H / 2} L ${-B / 2} ${H / 2} Z`;
      break;
    }
  }

  // 3D Extrusion
  const extrudeSettings = {
    steps: 1,
    depth: lengthM,
    bevelEnabled: false
  };
  const meshGeometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);

  // Bind catalogItemId directly into the mesh geometry userData
  meshGeometry.userData = {
    catalogItemId,
    sku: item.metadatos.sku,
    nombreComercial: item.metadatos.nombreComercial,
    tipoPerfil: item.geometriaSeccion.tipoPerfil,
    pesoLineal_kg_m: item.geometriaSeccion.pesoLineal_kg_m,
    tipoAcero: item.propiedadesMecanicas.tipoAcero
  };

  return {
    catalogItemId,
    catalogItem: item,
    materialMetadata: item.metadatos,
    shape2D: shape,
    holes2D: holes,
    meshGeometry,
    svgPath,
    nominalDimensions: {
      depthM: H,
      widthM: B,
      thicknessM: t,
      flangeThicknessM: tf,
      webThicknessM: tw
    }
  };
}

/**
 * Utility helper to bind full catalog metadata directly to any Three.js Mesh or Object3D
 */
export function bindMeshCatalogMetadata(
  object: THREE.Object3D,
  catalogItemId: string,
  extraData: Record<string, any> = {}
): void {
  const item = getMaterialCatalogItem(catalogItemId);
  object.userData = {
    ...object.userData,
    isCatalogBound: true,
    catalogItemId: item.metadatos.id,
    sku: item.metadatos.sku,
    nombreComercial: item.metadatos.nombreComercial,
    categoria: item.metadatos.categoria,
    tipoPerfil: item.geometriaSeccion.tipoPerfil,
    tipoAcero: item.propiedadesMecanicas.tipoAcero,
    fyMpa: item.propiedadesMecanicas.limiteFluencia_Fy_MPa,
    fuMpa: item.propiedadesMecanicas.resistenciaTraccion_Fu_MPa,
    pesoLineal_kg_m: item.geometriaSeccion.pesoLineal_kg_m,
    altoTotal_mm: item.geometriaSeccion.altoTotal_mm,
    anchoTotal_mm: item.geometriaSeccion.anchoTotal_mm,
    espesorPared_mm: item.geometriaSeccion.espesorPared_mm,
    clasificacionAISC: item.estabilidadYEsbeltez?.clasificacionSeccionAISC || 'COMPACTA',
    precioUnitarioEstimadoMXN: item.metadatos.precioUnitarioEstimadoMXN,
    fabricante: item.metadatos.fabricanteOProveedor,
    ...extraData
  };
}
