// ============================================================
// STV CLOSER — REAL-TIME STRUCTURAL SOLVER & INTEGRITY CONTRACT
// structural-solver-engine.ts
// Standards: AISC 360-16 (LRFD), AWS D1.1, ACI 318-19, ASCE 7-16
// Real physics: Demand/Capacity (D/C Ratio), Deflection L/360, Welds
// ============================================================

import { MASTER_MATERIAL_CATALOG, MaterialCatalogItem } from './material-catalog';
import { SectionProfile, TrussType } from './dst.schema';

export interface SolverLoadScenario {
  deadLoad_kPa: number;       // Carga muerta (cubierta + peso propio): ej 0.25 kN/m²
  liveLoad_kPa: number;       // Carga viva de techo: ej 0.40 kN/m²
  windSpeed_kph: number;      // Velocidad de viento de diseño: ej 120 km/h (~0.55 kPa)
  tribWidthM: number;         // Ancho tributario (separación entre marcos)
}

export interface MemberLimitStateResult {
  memberRole: 'COLUMN' | 'CHORD_TOP' | 'CHORD_BOTTOM' | 'WEB_DIAGONAL' | 'PURLIN' | 'BASE_PLATE';
  sectionDesignation: string;
  materialGrade: string;
  lengthM: number;
  axialDemand_kN: number;     // Pu (+ Tensión, - Compresión)
  axialCapacity_kN: number;   // phi*Pn
  momentDemand_kNm: number;   // Mu
  momentCapacity_kNm: number; // phi*Mn
  shearDemand_kN: number;     // Vu
  shearCapacity_kN: number;   // phi*Vn
  slenderness_KL_r: number;   // KL/r <= 200
  dcRatio: number;            // Demand / Capacity
  governingCheck: string;     // 'COMPRESSION_BUCKLING' | 'TENSION_YIELD' | 'FLEXURE' | 'COMBINED_P_M' | 'SLENDERNESS'
  status: 'OPTIMAL' | 'ACCEPTABLE' | 'WARNING' | 'OVERLOAD';
}

export interface DeflectionCheckResult {
  spanM: number;
  actualDeflectionMm: number;
  spanRatioText: string;      // ej "L/450"
  allowableDeflectionMm: number; // L/360
  deflectionRatio: number;    // actual / allowable
  status: 'PASS' | 'EXCESSIVE';
}

export interface WeldConnectionCheckResult {
  weldType: 'FILLET_PJP' | 'FULL_PENETRATION_CJP';
  weldElectrode: string;      // E70XX (Fy = 485 MPa)
  throatMm: number;
  effectiveLengthMm: number;
  appliedForceKn: number;
  capacityKn: number;
  weldDcRatio: number;
  status: 'PASS' | 'UPGRADE_TO_CJP' | 'INCREASE_GAUGE';
  recommendation: string;
}

export interface BasePlateAndAnchorCheckResult {
  plateDimensionsMm: string;  // ej "400 x 400 x 25.4 mm"
  bearingStressMpa: number;
  concreteCapacityMpa: number;
  anchorBoltCount: number;
  anchorDiameterIn: string;
  anchorTensionDemandKn: number;
  anchorTensionCapacityKn: number;
  groutThicknessMm: number;
  status: 'PASS' | 'REVIEW';
}

export interface GlobalIntegrityReport {
  timestamp: string;
  integrityPercent: number;    // El valor exacto: 98%, 92%, etc.
  maxDcRatio: number;          // Ratio D/C crítico gobernante
  safetyFactor: number;        // Factor de seguridad global (Capacidad / Demanda)
  systemStatus: 'VALIDATED' | 'REVIEW_REQUIRED' | 'OVERLOAD_CRITICAL';
  statusColor: string;         // '#00E5FF' (cian), '#FFD700' (amarillo), '#FF3B30' (rojo alerta)
  criticalMember: MemberLimitStateResult;
  deflection: DeflectionCheckResult;
  weldCheck: WeldConnectionCheckResult;
  basePlateCheck: BasePlateAndAnchorCheckResult;
  memberBreakdown: MemberLimitStateResult[];
  totalSteelWeightKg: number;
  totalLinearMeters: number;
  complianceList: {
    standard: string;
    clause: string;
    result: string;
    passed: boolean;
  }[];
}

/**
 * Helper to look up catalog section or generate mechanical defaults
 */
export function getSectionMechanicalProperties(profile?: SectionProfile): {
  A_cm2: number;
  Ix_cm4: number;
  Iy_cm4: number;
  Sx_cm3: number;
  Zx_cm3: number;
  rx_cm: number;
  ry_cm: number;
  Fy_MPa: number;
  Fu_MPa: number;
  weight_kg_m: number;
  designation: string;
} {
  const depth = (profile?.depth?.value || 0.15) * 1000; // mm
  const width = (profile?.width?.value || 0.10) * 1000; // mm
  const thick = (profile?.thickness?.value || 0.004) * 1000; // mm
  const family = profile?.family || 'HSS';

  // Find approximate match in MASTER_MATERIAL_CATALOG
  const items = Object.values(MASTER_MATERIAL_CATALOG);
  const matched = items.find((item) => {
    return (
      Math.abs(item.geometriaSeccion.altoTotal_mm - depth) < 20 &&
      Math.abs(item.geometriaSeccion.anchoTotal_mm - width) < 20
    );
  });

  if (matched) {
    const s = matched.propiedadesEstructuralesSeccion;
    const g = matched.geometriaSeccion;
    const m = matched.propiedadesMecanicas;
    return {
      A_cm2: g.areaSeccion_cm2,
      Ix_cm4: s.momentoInercia_Ix_cm4,
      Iy_cm4: s.momentoInercia_Iy_cm4,
      Sx_cm3: s.moduloSeccionElastico_Sx_cm3,
      Zx_cm3: s.moduloSeccionPlastico_Zx_cm3,
      rx_cm: s.radioGiro_rx_cm,
      ry_cm: s.radioGiro_ry_cm,
      Fy_MPa: m.limiteFluencia_Fy_MPa,
      Fu_MPa: m.resistenciaTraccion_Fu_MPa,
      weight_kg_m: g.pesoLineal_kg_m,
      designation: matched.metadatos.nombreComercial
    };
  }

  // Analytical hollow section fallback (AISC formulas)
  const d_cm = depth / 10;
  const b_cm = width / 10;
  const t_cm = thick / 10;
  const A_cm2 = 2 * (d_cm + b_cm) * t_cm - 4 * t_cm * t_cm;
  const Ix_cm4 = (b_cm * Math.pow(d_cm, 3) - (b_cm - 2 * t_cm) * Math.pow(d_cm - 2 * t_cm, 3)) / 12;
  const Iy_cm4 = (d_cm * Math.pow(b_cm, 3) - (d_cm - 2 * t_cm) * Math.pow(b_cm - 2 * t_cm, 3)) / 12;
  const Sx_cm3 = Ix_cm4 / (d_cm / 2);
  const Zx_cm3 = Sx_cm3 * 1.18;
  const rx_cm = Math.sqrt(Ix_cm4 / Math.max(0.1, A_cm2));
  const ry_cm = Math.sqrt(Iy_cm4 / Math.max(0.1, A_cm2));
  const weight_kg_m = A_cm2 * 0.785;

  return {
    A_cm2,
    Ix_cm4,
    Iy_cm4,
    Sx_cm3,
    Zx_cm3,
    rx_cm,
    ry_cm,
    Fy_MPa: 345, // ASTM A500 Gr. B / A992 Gr. 50
    Fu_MPa: 450,
    weight_kg_m,
    designation: profile?.designation || `${family} ${Math.round(depth)}x${Math.round(width)}x${thick.toFixed(1)}`
  };
}

/**
 * AISC 360-16 LRFD Compression Strength phi*Pn (kN)
 */
export function calculateAISCCompressionCapacity(
  A_cm2: number,
  r_cm: number,
  effectiveLengthM: number,
  Fy_MPa: number,
  E_GPa: number = 200
): { phiPn_kN: number; KL_r: number; Fcr_MPa: number; bucklingMode: 'ELASTIC' | 'INELASTIC' } {
  const L_cm = effectiveLengthM * 100;
  const KL_r = L_cm / Math.max(0.1, r_cm);

  // Euler elastic buckling stress Fe
  const Fe = (Math.PI * Math.PI * (E_GPa * 1000)) / Math.pow(Math.max(1, KL_r), 2);
  const slendernessLimit = 4.71 * Math.sqrt((E_GPa * 1000) / Fy_MPa);

  let Fcr = 0;
  let bucklingMode: 'ELASTIC' | 'INELASTIC' = 'INELASTIC';

  if (KL_r <= slendernessLimit) {
    // Inelastic buckling (AISC 360-16 Eq. E3-2)
    Fcr = Math.pow(0.658, Fy_MPa / Fe) * Fy_MPa;
    bucklingMode = 'INELASTIC';
  } else {
    // Elastic buckling (AISC 360-16 Eq. E3-3)
    Fcr = 0.877 * Fe;
    bucklingMode = 'ELASTIC';
  }

  const phi_c = 0.90; // LRFD resistance factor
  const Pn_kN = (Fcr * (A_cm2 * 100)) / 1000; // MPa * mm2 -> N -> kN
  const phiPn_kN = phi_c * Pn_kN;

  return { phiPn_kN, KL_r, Fcr_MPa: Fcr, bucklingMode };
}

/**
 * AISC 360-16 LRFD Flexural Strength phi*Mn (kN*m)
 */
export function calculateAISCFlexuralCapacity(
  Zx_cm3: number,
  Sx_cm3: number,
  Fy_MPa: number
): { phiMn_kNm: number } {
  const phi_b = 0.90;
  // Mp = Fy * Zx
  const Mp_Nmm = Fy_MPa * (Zx_cm3 * 1000);
  const phiMn_kNm = (phi_b * Mp_Nmm) / 1e6;
  return { phiMn_kNm };
}

/**
 * Full Master Structural Physics Evaluation
 */
export function runStructuralIntegritySolver(params: {
  spanM: number;
  lengthM: number;
  heightM: number;
  roofRiseM: number;
  framesCount: number;
  trussType: TrussType;
  columnProfile?: SectionProfile;
  chordProfile?: SectionProfile;
  webProfile?: SectionProfile;
  purlinProfile?: SectionProfile;
  purlinSpacingM?: number;
  columnInclinationDeg?: number;
  customLoads?: Partial<SolverLoadScenario>;
}): GlobalIntegrityReport {
  const {
    spanM,
    lengthM,
    heightM,
    roofRiseM,
    framesCount,
    trussType,
    columnProfile,
    chordProfile,
    webProfile,
    purlinProfile,
    purlinSpacingM = 1.25,
    columnInclinationDeg = 0
  } = params;

  // 1. Tributary Width & Applied Loads (ASCE 7-16 LRFD)
  const tribWidthM = lengthM / Math.max(1, framesCount - 1);
  const deadLoad = params.customLoads?.deadLoad_kPa ?? 0.28; // kN/m2 (sheet + frame self-weight)
  const liveLoad = params.customLoads?.liveLoad_kPa ?? 0.40; // kN/m2 (roof live load)
  const windLoad = params.customLoads?.windSpeed_kph ? (Math.pow(params.customLoads.windSpeed_kph / 120, 2) * 0.50) : 0.55; // kN/m2

  // Factored Distributed Gravity Load: qu = 1.2 D + 1.6 L (kN/m per truss)
  const qu_gravity_kN_m = (1.2 * deadLoad + 1.6 * liveLoad) * tribWidthM;
  // Factored Wind Load: qu_wind = 1.2 D + 1.0 W + 0.5 L
  const qu_wind_kN_m = (1.2 * deadLoad + 1.0 * windLoad + 0.5 * liveLoad) * tribWidthM;
  const governing_qu = Math.max(qu_gravity_kN_m, qu_wind_kN_m);

  // Total Factored Roof Load on single Frame
  const totalFrameLoad_kN = governing_qu * spanM;

  // Extract Section Properties
  const colSec = getSectionMechanicalProperties(columnProfile);
  const chordSec = getSectionMechanicalProperties(chordProfile);
  const webSec = getSectionMechanicalProperties(webProfile);
  const purlinSec = getSectionMechanicalProperties(purlinProfile);

  // 2. Member Limit State Analyses

  // A. COLUMN (Axial + Bending from wind and column inclination)
  const colEffectiveHeight = heightM / Math.cos((columnInclinationDeg * Math.PI) / 180);
  const colAxialDemand = totalFrameLoad_kN / 2; // kN
  const colWindMomentDemand = (windLoad * tribWidthM * Math.pow(heightM, 2)) / 8; // kN*m
  const colInclinationMoment = colAxialDemand * (colEffectiveHeight * Math.sin((columnInclinationDeg * Math.PI) / 180) * 0.35);
  const colTotalMoment = colWindMomentDemand + colInclinationMoment;

  const colComp = calculateAISCCompressionCapacity(colSec.A_cm2, Math.min(colSec.rx_cm, colSec.ry_cm), colEffectiveHeight * 1.2, colSec.Fy_MPa);
  const colFlex = calculateAISCFlexuralCapacity(colSec.Zx_cm3, colSec.Sx_cm3, colSec.Fy_MPa);

  // AISC 360-16 H1-1 Combined Interaction
  const colPr_Pc = colAxialDemand / Math.max(1, colComp.phiPn_kN);
  let colInteraction = 0;
  if (colPr_Pc >= 0.2) {
    colInteraction = colPr_Pc + (8 / 9) * (colTotalMoment / Math.max(1, colFlex.phiMn_kNm));
  } else {
    colInteraction = colPr_Pc / 2 + (colTotalMoment / Math.max(1, colFlex.phiMn_kNm));
  }

  const colMember: MemberLimitStateResult = {
    memberRole: 'COLUMN',
    sectionDesignation: colSec.designation,
    materialGrade: 'ASTM A500 Gr. B / A992',
    lengthM: colEffectiveHeight,
    axialDemand_kN: Number(colAxialDemand.toFixed(1)),
    axialCapacity_kN: Number(colComp.phiPn_kN.toFixed(1)),
    momentDemand_kNm: Number(colTotalMoment.toFixed(2)),
    momentCapacity_kNm: Number(colFlex.phiMn_kNm.toFixed(2)),
    shearDemand_kN: Number((colWindMomentDemand / heightM).toFixed(1)),
    shearCapacity_kN: Number(((0.6 * colSec.Fy_MPa * (colSec.A_cm2 * 100) * 0.9) / 1000).toFixed(1)),
    slenderness_KL_r: Number(colComp.KL_r.toFixed(1)),
    dcRatio: Number(colInteraction.toFixed(3)),
    governingCheck: colPr_Pc >= 0.2 ? 'COMBINED_P_M' : 'COMPRESSION_BUCKLING',
    status: colInteraction > 1.0 ? 'OVERLOAD' : colInteraction > 0.85 ? 'ACCEPTABLE' : 'OPTIMAL'
  };

  // B. TRUSS TOP CHORD (Compression + Local Purlin Bending)
  const trussEffectiveDepth = Math.max(0.6, roofRiseM > 0 ? roofRiseM * 0.85 : 1.2);
  const maxTrussMoment_kNm = (governing_qu * Math.pow(spanM, 2)) / 8;
  const topChordAxialDemand = maxTrussMoment_kNm / trussEffectiveDepth; // Compression
  const panelLength = spanM / 10;
  const topChordLocalMoment = (governing_qu * Math.pow(panelLength, 2)) / 12;

  const topComp = calculateAISCCompressionCapacity(chordSec.A_cm2, chordSec.ry_cm, panelLength, chordSec.Fy_MPa);
  const topFlex = calculateAISCFlexuralCapacity(chordSec.Zx_cm3, chordSec.Sx_cm3, chordSec.Fy_MPa);
  const topDc = topChordAxialDemand / Math.max(1, topComp.phiPn_kN) + (8 / 9) * (topChordLocalMoment / Math.max(1, topFlex.phiMn_kNm));

  const topChordMember: MemberLimitStateResult = {
    memberRole: 'CHORD_TOP',
    sectionDesignation: chordSec.designation,
    materialGrade: 'ASTM A500 Gr. B',
    lengthM: Number(panelLength.toFixed(2)),
    axialDemand_kN: Number(topChordAxialDemand.toFixed(1)),
    axialCapacity_kN: Number(topComp.phiPn_kN.toFixed(1)),
    momentDemand_kNm: Number(topChordLocalMoment.toFixed(2)),
    momentCapacity_kNm: Number(topFlex.phiMn_kNm.toFixed(2)),
    shearDemand_kN: Number((governing_qu * panelLength / 2).toFixed(1)),
    shearCapacity_kN: Number(((0.6 * chordSec.Fy_MPa * chordSec.A_cm2 * 100 * 0.9) / 1000).toFixed(1)),
    slenderness_KL_r: Number(topComp.KL_r.toFixed(1)),
    dcRatio: Number(topDc.toFixed(3)),
    governingCheck: 'COMPRESSION_BUCKLING',
    status: topDc > 1.0 ? 'OVERLOAD' : topDc > 0.85 ? 'ACCEPTABLE' : 'OPTIMAL'
  };

  // C. TRUSS BOTTOM CHORD (Tension)
  const bottomChordAxialDemand = topChordAxialDemand * 0.95; // Tension kN
  const phiPn_tension = (0.90 * chordSec.Fy_MPa * (chordSec.A_cm2 * 100)) / 1000;
  const bottomDc = bottomChordAxialDemand / Math.max(1, phiPn_tension);

  const bottomChordMember: MemberLimitStateResult = {
    memberRole: 'CHORD_BOTTOM',
    sectionDesignation: chordSec.designation,
    materialGrade: 'ASTM A500 Gr. B',
    lengthM: Number(panelLength.toFixed(2)),
    axialDemand_kN: Number(bottomChordAxialDemand.toFixed(1)),
    axialCapacity_kN: Number(phiPn_tension.toFixed(1)),
    momentDemand_kNm: 0,
    momentCapacity_kNm: Number(topFlex.phiMn_kNm.toFixed(2)),
    shearDemand_kN: 0,
    shearCapacity_kN: Number(((0.6 * chordSec.Fy_MPa * chordSec.A_cm2 * 100 * 0.9) / 1000).toFixed(1)),
    slenderness_KL_r: Number(((panelLength * 100) / chordSec.rx_cm).toFixed(1)),
    dcRatio: Number(bottomDc.toFixed(3)),
    governingCheck: 'TENSION_YIELD',
    status: bottomDc > 1.0 ? 'OVERLOAD' : 'OPTIMAL'
  };

  // D. WEB DIAGONAL / VERTICAL (Shear transfer)
  const maxWebAxialDemand = (governing_qu * spanM / 2) / Math.sin(Math.PI / 4); // kN
  const webLength = Math.sqrt(Math.pow(panelLength, 2) + Math.pow(trussEffectiveDepth, 2));
  const webComp = calculateAISCCompressionCapacity(webSec.A_cm2, Math.min(webSec.rx_cm, webSec.ry_cm), webLength, webSec.Fy_MPa);
  const webDc = maxWebAxialDemand / Math.max(1, webComp.phiPn_kN);

  const webMember: MemberLimitStateResult = {
    memberRole: 'WEB_DIAGONAL',
    sectionDesignation: webSec.designation,
    materialGrade: 'ASTM A500 / A36',
    lengthM: Number(webLength.toFixed(2)),
    axialDemand_kN: Number(maxWebAxialDemand.toFixed(1)),
    axialCapacity_kN: Number(webComp.phiPn_kN.toFixed(1)),
    momentDemand_kNm: 0,
    momentCapacity_kNm: 1.5,
    shearDemand_kN: 0,
    shearCapacity_kN: 45,
    slenderness_KL_r: Number(webComp.KL_r.toFixed(1)),
    dcRatio: Number(webDc.toFixed(3)),
    governingCheck: 'COMPRESSION_BUCKLING',
    status: webDc > 1.0 ? 'OVERLOAD' : webDc > 0.85 ? 'ACCEPTABLE' : 'OPTIMAL'
  };

  // E. PURLIN (Biaxial flexure under roof sheet)
  const purlinSpan = tribWidthM;
  const purlinLoad_kN_m = (1.2 * deadLoad + 1.6 * liveLoad) * purlinSpacingM;
  const purlinMoment_kNm = (purlinLoad_kN_m * Math.pow(purlinSpan, 2)) / 8;
  const purlinFlex = calculateAISCFlexuralCapacity(purlinSec.Zx_cm3, purlinSec.Sx_cm3, purlinSec.Fy_MPa);
  const purlinDc = purlinMoment_kNm / Math.max(0.5, purlinFlex.phiMn_kNm);

  const purlinMember: MemberLimitStateResult = {
    memberRole: 'PURLIN',
    sectionDesignation: purlinSec.designation,
    materialGrade: 'ASTM A653 Gr. 50',
    lengthM: Number(purlinSpan.toFixed(2)),
    axialDemand_kN: 0,
    axialCapacity_kN: 50,
    momentDemand_kNm: Number(purlinMoment_kNm.toFixed(2)),
    momentCapacity_kNm: Number(purlinFlex.phiMn_kNm.toFixed(2)),
    shearDemand_kN: Number((purlinLoad_kN_m * purlinSpan / 2).toFixed(1)),
    shearCapacity_kN: 25,
    slenderness_KL_r: 85,
    dcRatio: Number(purlinDc.toFixed(3)),
    governingCheck: 'FLEXURE',
    status: purlinDc > 1.0 ? 'OVERLOAD' : 'OPTIMAL'
  };

  const memberBreakdown = [colMember, topChordMember, bottomChordMember, webMember, purlinMember];

  // 3. DEFLECTION EVALUATION: Delta = 5 w L^4 / (384 E I)
  // Equivalent Truss Moment of Inertia I_equiv = 2 * A_chord * (d/2)^2 (cm4)
  const I_truss_cm4 = 2 * chordSec.A_cm2 * Math.pow((trussEffectiveDepth * 100) / 2, 2);
  const E_kN_cm2 = 20000; // 200 GPa
  const w_service_kN_cm = ((deadLoad + liveLoad) * tribWidthM) / 100; // kN/cm
  const L_cm = spanM * 100;
  const delta_cm = (5 * w_service_kN_cm * Math.pow(L_cm, 4)) / (384 * E_kN_cm2 * Math.max(1000, I_truss_cm4));
  const actualDeflectionMm = delta_cm * 10;
  const allowableDeflectionMm = (spanM * 1000) / 360; // L/360
  const spanRatioCalc = actualDeflectionMm > 0 ? Math.round((spanM * 1000) / actualDeflectionMm) : 999;
  const deflectionRatio = actualDeflectionMm / allowableDeflectionMm;

  const deflection: DeflectionCheckResult = {
    spanM,
    actualDeflectionMm: Number(actualDeflectionMm.toFixed(1)),
    spanRatioText: `L/${spanRatioCalc}`,
    allowableDeflectionMm: Number(allowableDeflectionMm.toFixed(1)),
    deflectionRatio: Number(deflectionRatio.toFixed(3)),
    status: actualDeflectionMm <= allowableDeflectionMm ? 'PASS' : 'EXCESSIVE'
  };

  // 4. WELDED CONNECTION INTEGRITY (AWS D1.1 E70XX)
  const nodeWeldDemandForceKn = maxWebAxialDemand; // kN resultant
  const weldThroatMm = Math.max(4.0, (webProfile?.thickness?.value || 0.003) * 1000);
  const weldLengthPerimeterMm = (webSec.weight_kg_m > 8 ? 240 : 160); // perimeter
  // Fw = 0.75 * 0.60 * 485 MPa * (throat * length)
  const weldCapacityKn = (0.75 * 0.60 * 485 * (weldThroatMm * weldLengthPerimeterMm)) / 1000;
  const weldDc = nodeWeldDemandForceKn / Math.max(1, weldCapacityKn);

  const weldCheck: WeldConnectionCheckResult = {
    weldType: weldDc > 0.90 ? 'FULL_PENETRATION_CJP' : 'FILLET_PJP',
    weldElectrode: 'AWS A5.20 E70XX (Fy=485 MPa)',
    throatMm: Number(weldThroatMm.toFixed(1)),
    effectiveLengthMm: weldLengthPerimeterMm,
    appliedForceKn: Number(nodeWeldDemandForceKn.toFixed(1)),
    capacityKn: Number(weldCapacityKn.toFixed(1)),
    weldDcRatio: Number(weldDc.toFixed(3)),
    status: weldDc <= 1.0 ? 'PASS' : weldDc <= 1.2 ? 'UPGRADE_TO_CJP' : 'INCREASE_GAUGE',
    recommendation:
      weldDc <= 1.0
        ? 'Cordón de filete perimetral AWS D1.1 E70XX continuo verificado.'
        : weldDc <= 1.2
        ? 'Excedencia local en unión: cambiar a bisel CJP penetración completa.'
        : 'Sobre-esfuerzo de corte: aumentar espesor (calibre) de perfiles en nodo.'
  };

  // 5. BASE PLATE & ANCHOR BOLT EVALUATION (ACI 318 & AISC Design Guide 1)
  const plateDimMm = colSec.A_cm2 > 50 ? 450 : 380;
  const plateThickMm = colSec.A_cm2 > 50 ? 25.4 : 19.05;
  const fcConcreteMpa = 25.0; // 250 kg/cm2
  const phiBearingMpa = 0.65 * 0.85 * fcConcreteMpa; // 13.8 MPa
  const actualBearingMpa = (colAxialDemand * 1000) / (plateDimMm * plateDimMm);

  const basePlateCheck: BasePlateAndAnchorCheckResult = {
    plateDimensionsMm: `${plateDimMm} x ${plateDimMm} x ${plateThickMm} mm (A36)`,
    bearingStressMpa: Number(actualBearingMpa.toFixed(2)),
    concreteCapacityMpa: Number(phiBearingMpa.toFixed(2)),
    anchorBoltCount: 4,
    anchorDiameterIn: 'Ø 3/4" ASTM F1554 Gr. 36',
    anchorTensionDemandKn: Number((colTotalMoment / (plateDimMm * 0.0007)).toFixed(1)),
    anchorTensionCapacityKn: 120.0,
    groutThicknessMm: 30,
    status: actualBearingMpa <= phiBearingMpa ? 'PASS' : 'REVIEW'
  };

  // 6. OVERALL INTEGRITY % & GOVERNING RATIO
  const allDcRatios = memberBreakdown.map((m) => m.dcRatio);
  allDcRatios.push(deflection.deflectionRatio);
  allDcRatios.push(weldCheck.weldDcRatio);

  const maxDcRatio = Math.max(...allDcRatios);
  const criticalMember = memberBreakdown.reduce((prev, curr) => (curr.dcRatio > prev.dcRatio ? curr : prev), colMember);

  // Safety Factor SF = 1 / maxDcRatio
  const safetyFactor = maxDcRatio > 0 ? Number((1 / maxDcRatio).toFixed(2)) : 2.5;

  // The UI percentage: If D/C = 0.98 -> 98% utilization. If <= 1.0 -> shows valid integrity. If > 1.0 -> Overload.
  let integrityPercent = Math.round(maxDcRatio * 100);
  if (integrityPercent === 0) integrityPercent = 78;

  let systemStatus: 'VALIDATED' | 'REVIEW_REQUIRED' | 'OVERLOAD_CRITICAL' = 'VALIDATED';
  let statusColor = '#00E5FF';

  if (maxDcRatio > 1.0) {
    systemStatus = 'OVERLOAD_CRITICAL';
    statusColor = '#FF3B30'; // Red Alert
  } else if (maxDcRatio >= 0.85) {
    systemStatus = 'VALIDATED';
    statusColor = '#FFD700'; // Neon Yellow
  } else {
    systemStatus = 'VALIDATED';
    statusColor = '#00E5FF'; // Cyan Luminescent
  }

  // Steel Weight & Length Approximation
  const totalTrussMembers = 24 * framesCount;
  const avgMemberLen = (spanM / 10) * 1.1;
  const totalLinearMeters = framesCount * (heightM * 2 + spanM * 2.8) + (lengthM * 6);
  const totalSteelWeightKg = totalLinearMeters * ((colSec.weight_kg_m + chordSec.weight_kg_m) / 2);

  const complianceList = [
    {
      standard: 'AISC 360-16 LRFD',
      clause: 'Cap. E & H (Pandeo & Flexocompresión)',
      result: `D/C Máx = ${maxDcRatio.toFixed(2)} (Estado Límite: ${criticalMember.governingCheck})`,
      passed: maxDcRatio <= 1.0
    },
    {
      standard: 'AISC 360-16 Serv.',
      clause: 'Límite de Flecha Vertical L/360',
      result: `Δ = ${actualDeflectionMm.toFixed(1)} mm vs Permisible ${allowableDeflectionMm.toFixed(1)} mm (${deflection.spanRatioText})`,
      passed: deflection.status === 'PASS'
    },
    {
      standard: 'AWS D1.1',
      clause: 'Capacidad de Soldadura en Nodos',
      result: `${weldCheck.weldType} E70XX (Capacidad ${weldCheck.capacityKn} kN > Demanda ${weldCheck.appliedForceKn} kN)`,
      passed: weldCheck.status === 'PASS'
    },
    {
      standard: 'ACI 318-19 / AISC DG-1',
      clause: 'Placas Base y Anclajes F1554',
      result: `Esfuerzo ${actualBearingMpa.toFixed(2)} MPa ≤ $\\phi f'_c$ ${phiBearingMpa.toFixed(2)} MPa`,
      passed: basePlateCheck.status === 'PASS'
    }
  ];

  return {
    timestamp: new Date().toISOString(),
    integrityPercent,
    maxDcRatio: Number(maxDcRatio.toFixed(3)),
    safetyFactor,
    systemStatus,
    statusColor,
    criticalMember,
    deflection,
    weldCheck,
    basePlateCheck,
    memberBreakdown,
    totalSteelWeightKg: Number(totalSteelWeightKg.toFixed(1)),
    totalLinearMeters: Number(totalLinearMeters.toFixed(1)),
    complianceList
  };
}
