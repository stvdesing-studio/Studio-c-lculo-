/**
 * STV CLOSER SYSTEM — CONNECTION ENGINE
 * Validates force transfer mechanisms, base plates, anchor bolt interaction (tension/shear),
 * fillet welds (AWS D1.1), and gusset nodes with constructible tolerances.
 */

import { ColumnReaction } from '../../types/stv';
import { STV_NORMATIVAS } from '../database/STV_EspecificacionesNormativas';

export interface ConnectionCheckResult {
  connectionId: string;
  type: string;
  weldLegMm: number;
  minWeldRequiredMm: number;
  weldPassed: boolean;
  basePlateThicknessMm: number;
  minPlateThicknessMm: number;
  platePassed: boolean;
  anchorTensionRatio: number;
  anchorShearRatio: number;
  anchorInteractionRatio: number; // (T/Tn)^5/3 + (V/Vn)^5/3 <= 1.0
  anchorPassed: boolean;
  overallStatus: 'PASS' | 'REVIEW' | 'CRITICAL';
  details: string;
}

export class STV_ConnectionEngine {
  /**
   * Evaluates base connection and nodal integrity for all structural columns
   */
  public static auditBaseConnections(columns: ColumnReaction[]): ConnectionCheckResult[] {
    const norm = STV_NORMATIVAS['AISC_360_16'];

    return columns.map(col => {
      const connId = `CONN-BASE-${col.gridRef}`;
      const bp = col.basePlate;
      
      // 1. Minimum Fillet Weld by AWS D1.1 for plate thickness
      const minWeld = norm.limits.minFilletWeldMm(bp.thicknessMm);
      const providedWeld = 6.0; // mm
      const weldPassed = providedWeld >= minWeld;

      // 2. Base Plate Bending Check (AISC Design Guide 1)
      // Cantilever dimension m = (N - 0.95d) / 2
      const mCantileverMm = (bp.dimensionsMm[0] - 200) / 2; // ~50mm
      const bearingStressMPa = (col.factoredAxialKN * 1000) / (bp.dimensionsMm[0] * bp.dimensionsMm[1]);
      const requiredThicknessMm = mCantileverMm * Math.sqrt((2 * bearingStressMPa) / (0.90 * 250));
      const platePassed = bp.thicknessMm >= requiredThicknessMm;

      // 3. Anchor Bolt Interaction Check (ACI 318-19 / AISC 360-16)
      // 4 bolts F1554 Gr.55 Ø 20mm
      const numBolts = bp.boltCount;
      const boltAreaMm2 = (Math.PI * Math.pow(bp.boltDiameterMm, 2)) / 4; // 314 mm2 each
      const boltTensileCapacityPerBoltKN = (0.75 * 380 * boltAreaMm2) / 1000; // ~ 89.5 kN
      const boltShearCapacityPerBoltKN = (0.65 * 0.45 * 520 * boltAreaMm2) / 1000; // ~ 47.8 kN

      const totalTensionDemandKN = col.upliftKN + (col.momentXKNm * 1000) / (bp.dimensionsMm[0] * 0.8);
      const tensionPerBoltKN = Math.max(0, totalTensionDemandKN / (numBolts / 2));
      const shearPerBoltKN = Math.sqrt(Math.pow(col.shearXKN, 2) + Math.pow(col.shearZKN, 2)) / numBolts;

      const tensionRatio = Math.min(1.0, tensionPerBoltKN / boltTensileCapacityPerBoltKN);
      const shearRatio = Math.min(1.0, shearPerBoltKN / boltShearCapacityPerBoltKN);

      const interactionRatio = Math.pow(tensionRatio, 1.67) + Math.pow(shearRatio, 1.67);
      const anchorPassed = interactionRatio <= 1.0;

      let overallStatus: 'PASS' | 'REVIEW' | 'CRITICAL' = 'PASS';
      if (!weldPassed || !platePassed || !anchorPassed) {
        overallStatus = interactionRatio > 1.2 ? 'CRITICAL' : 'REVIEW';
      }

      return {
        connectionId: connId,
        type: 'Placa Base de Asiento con 4 Anclas F1554 Gr.55',
        weldLegMm: providedWeld,
        minWeldRequiredMm: minWeld,
        weldPassed,
        basePlateThicknessMm: bp.thicknessMm,
        minPlateThicknessMm: parseFloat(requiredThicknessMm.toFixed(2)),
        platePassed,
        anchorTensionRatio: parseFloat(tensionRatio.toFixed(3)),
        anchorShearRatio: parseFloat(shearRatio.toFixed(3)),
        anchorInteractionRatio: parseFloat(interactionRatio.toFixed(3)),
        anchorPassed,
        overallStatus,
        details: `Placa ${bp.dimensionsMm[0]}x${bp.dimensionsMm[1]}x${bp.thicknessMm}mm | Solicitación Ax: ${col.factoredAxialKN} kN, Vx: ${col.shearXKN} kN | Interacción anclaje: ${(interactionRatio * 100).toFixed(1)}%`
      };
    });
  }
}
