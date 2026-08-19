/**
 * STV CLOSER SYSTEM — ESPECIFICACIONES NORMATIVAS
 * Fórmulas de ingeniería, factores de seguridad y criterios normativos
 */

export interface NormativeStandard {
  id: string;
  name: string;
  scope: string;
  edition: string;
  safetyFactors: {
    asd: number;
    lrfd: {
      flexure: number;
      shear: number;
      compression: number;
      tensionYield: number;
      tensionRupture: number;
    };
  };
  limits: {
    maxSlendernessCompression: number;
    maxSlendernessTension: number;
    deflectionDeadLive: number; // e.g. L/240
    deflectionLive: number; // e.g. L/360
    minFilletWeldMm: (thicknessMm: number) => number;
  };
  concrete: {
    fckMinMPa: number;
    rebarYieldFyMPa: number;
    minCoverMm: number;
  };
  geotechnics: {
    defaultBearingCapacityKPa: number;
    slidingSafetyFactor: number;
    overturningSafetyFactor: number;
  };
}

export const STV_NORMATIVAS: Record<string, NormativeStandard> = {
  'AISC_360_16': {
    id: 'AISC_360_16',
    name: 'American Institute of Steel Construction 360-16',
    scope: 'Specification for Structural Steel Buildings',
    edition: '2016 / 2022',
    safetyFactors: {
      asd: 1.67,
      lrfd: {
        flexure: 0.90,
        shear: 0.90,
        compression: 0.90,
        tensionYield: 0.90,
        tensionRupture: 0.75
      }
    },
    limits: {
      maxSlendernessCompression: 200,
      maxSlendernessTension: 300,
      deflectionDeadLive: 240, // L / 240
      deflectionLive: 360,     // L / 360
      minFilletWeldMm: (t: number) => {
        if (t <= 6.0) return 3.0;
        if (t <= 12.5) return 5.0;
        if (t <= 19.0) return 6.0;
        return 8.0;
      }
    },
    concrete: {
      fckMinMPa: 25.0, // 250 kg/cm2
      rebarYieldFyMPa: 420.0, // Grado 60
      minCoverMm: 50.0
    },
    geotechnics: {
      defaultBearingCapacityKPa: 200.0,
      slidingSafetyFactor: 1.5,
      overturningSafetyFactor: 1.5
    }
  },

  'NTC_DCEA_2023': {
    id: 'NTC_DCEA_2023',
    name: 'Normas Técnicas Complementarias CDMX - Acero 2023',
    scope: 'Diseño y Construcción de Estructuras de Acero en México',
    edition: '2023',
    safetyFactors: {
      asd: 1.67,
      lrfd: {
        flexure: 0.90,
        shear: 0.90,
        compression: 0.90,
        tensionYield: 0.90,
        tensionRupture: 0.75
      }
    },
    limits: {
      maxSlendernessCompression: 200,
      maxSlendernessTension: 300,
      deflectionDeadLive: 240,
      deflectionLive: 360,
      minFilletWeldMm: (t: number) => (t <= 6.0 ? 3.0 : 5.0)
    },
    concrete: {
      fckMinMPa: 25.0,
      rebarYieldFyMPa: 420.0,
      minCoverMm: 50.0
    },
    geotechnics: {
      defaultBearingCapacityKPa: 180.0,
      slidingSafetyFactor: 1.5,
      overturningSafetyFactor: 1.5
    }
  }
};
