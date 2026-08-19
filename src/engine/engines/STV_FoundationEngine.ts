/**
 * STV CLOSER SYSTEM — FOUNDATION & GEOTECHNICAL ENGINES
 * Converts structural column reactions and geotechnical parameters into verified foundation designs.
 * "La cimentación se decide por las reacciones del sistema y la geotecnia, no por el nombre o peso del edificio."
 */

import { ColumnReaction, GeotechnicalParameters } from '../../types/stv';

export const DEFAULT_SOIL_PRESETS: Record<string, GeotechnicalParameters> = {
  'SUELO_TIPO_1_FIRME': {
    soilType: 'Tipo I — Tepetate / Grava Compacta (Firme)',
    bearingCapacityKPa: 250.0,
    soilUnitWeightKNm3: 19.5,
    frictionAngleDeg: 34,
    cohesionKPa: 25.0,
    frictionCoefficient: 0.45,
    groundwaterDepthM: 6.0,
    allowableSettlementMm: 25.0,
    competentStrataDepthM: 1.2,
    validationStatus: 'VALIDATED'
  },
  'SUELO_TIPO_2_MEDIO': {
    soilType: 'Tipo II — Arcilla Arenosa de Rigidez Media (Estándar)',
    bearingCapacityKPa: 180.0,
    soilUnitWeightKNm3: 18.0,
    frictionAngleDeg: 28,
    cohesionKPa: 35.0,
    frictionCoefficient: 0.35,
    groundwaterDepthM: 3.5,
    allowableSettlementMm: 30.0,
    competentStrataDepthM: 1.8,
    validationStatus: 'VALIDATED'
  },
  'SUELO_TIPO_3_BLANDO': {
    soilType: 'Tipo III — Depósitos Lacustres / Arcillas Blandas',
    bearingCapacityKPa: 95.0,
    soilUnitWeightKNm3: 14.5,
    frictionAngleDeg: 12,
    cohesionKPa: 18.0,
    frictionCoefficient: 0.25,
    groundwaterDepthM: 1.2,
    allowableSettlementMm: 45.0,
    competentStrataDepthM: 8.0,
    validationStatus: 'VALIDATED'
  }
};

export class STV_FoundationEngine {
  /**
   * Recalculates foundation sizing for a given column reaction and soil profile
   */
  public static calculateFooting(
    col: ColumnReaction,
    geotech: GeotechnicalParameters,
    concreteFckMPa: number = 25.0
  ) {
    const P_service = col.deadLoadKN + col.liveLoadKN;
    const q_adm = Math.max(40, geotech.bearingCapacityKPa);
    
    // Total vertical load including estimated footing self-weight (~12-15%)
    const P_total = P_service * 1.15;
    
    // Required bearing area
    const A_req = P_total / q_adm;
    const side_m = Math.max(1.0, Math.ceil(Math.sqrt(A_req) * 10) / 10);
    const A_prov = side_m * side_m;
    const q_service = P_total / A_prov;

    // Concrete Footing Thickness based on Two-way (Punching) Shear
    // Punching perimeter bo = 2 * (c1 + d) + 2 * (c2 + d)
    const pedWidthM = col.pedestal.widthMm / 1000;
    const footingThicknessM = Math.max(0.40, Math.min(0.80, side_m * 0.25));
    const effectiveDepthM = footingThicknessM - 0.075; // 75mm clear cover

    const bo = 4 * (pedWidthM + effectiveDepthM);
    const Vu_punchingKN = col.factoredAxialKN - (col.factoredAxialKN / A_prov) * Math.pow(pedWidthM + effectiveDepthM, 2);
    const Vc_punchingKN = (0.33 * Math.sqrt(concreteFckMPa) * (bo * 1000) * (effectiveDepthM * 1000) * 0.75) / 1000;
    const punchingPassed = Vu_punchingKN <= Vc_punchingKN;

    // Stability: Sliding & Overturning
    const slidingResistanceKN = P_service * geotech.frictionCoefficient;
    const slidingFactor = col.shearXKN > 0.1 ? slidingResistanceKN / col.shearXKN : 10.0;
    
    const overturningResistanceKNm = P_service * (side_m / 2);
    const overturningFactor = col.momentXKNm > 0.1 ? overturningResistanceKNm / col.momentXKNm : 10.0;

    const passesAll = q_service <= q_adm && slidingFactor >= 1.5 && overturningFactor >= 1.5 && punchingPassed;

    return {
      sideM: side_m,
      areaM2: parseFloat(A_prov.toFixed(2)),
      thicknessM: parseFloat(footingThicknessM.toFixed(2)),
      soilPressureRealKPa: parseFloat(q_service.toFixed(2)),
      soilPressureAdmKPa: q_adm,
      punchingCapacityKN: parseFloat(Vc_punchingKN.toFixed(1)),
      punchingDemandKN: parseFloat(Vu_punchingKN.toFixed(1)),
      punchingPassed,
      slidingFactor: parseFloat(slidingFactor.toFixed(2)),
      overturningFactor: parseFloat(overturningFactor.toFixed(2)),
      passesAll
    };
  }
}
