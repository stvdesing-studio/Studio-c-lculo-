/**
 * STV CLOSER — ENGINEERING: LOAD COMBINATIONS
 * Standardized combinations under ASCE 7-22, AISC 360-16 (ASD / LRFD) and RCDF / NTC-2023.
 */

import { LoadCombination } from "../../types/dst.schema";

export const STANDARD_LOAD_COMBINATIONS_ASD: LoadCombination[] = [
  {
    id: "COMB_ASD_01",
    name: "1.0 D (Servicio Gravitacional Base)",
    normativeReference: "AISC 360-16 ASD",
    factors: [
      { loadCaseId: "LC_DEAD", factor: 1.0 }
    ]
  },
  {
    id: "COMB_ASD_02",
    name: "1.0 D + 1.0 Lr (Carga Máxima de Servicio)",
    normativeReference: "AISC 360-16 ASD",
    factors: [
      { loadCaseId: "LC_DEAD", factor: 1.0 },
      { loadCaseId: "LC_LIVE", factor: 1.0 }
    ]
  },
  {
    id: "COMB_ASD_03",
    name: "1.0 D + 0.6 W (Viento de Servicio / Deriva)",
    normativeReference: "AISC 360-16 ASD",
    factors: [
      { loadCaseId: "LC_DEAD", factor: 1.0 },
      { loadCaseId: "LC_WIND", factor: 0.6 }
    ]
  },
  {
    id: "COMB_ASD_04",
    name: "1.0 D + 0.75 Lr + 0.45 W (Combinación Triaxial)",
    normativeReference: "AISC 360-16 ASD",
    factors: [
      { loadCaseId: "LC_DEAD", factor: 1.0 },
      { loadCaseId: "LC_LIVE", factor: 0.75 },
      { loadCaseId: "LC_WIND", factor: 0.45 }
    ]
  },
  {
    id: "COMB_ASD_05",
    name: "0.6 D + 0.6 W (Levantamiento por Succión)",
    normativeReference: "AISC 360-16 ASD",
    factors: [
      { loadCaseId: "LC_DEAD", factor: 0.6 },
      { loadCaseId: "LC_WIND", factor: 0.6 }
    ]
  }
];

export const STANDARD_LOAD_COMBINATIONS_LRFD: LoadCombination[] = [
  {
    id: "COMB_LRFD_01",
    name: "1.4 D (Resistencia Última Pura)",
    normativeReference: "AISC 360-16 LRFD",
    factors: [
      { loadCaseId: "LC_DEAD", factor: 1.4 }
    ]
  },
  {
    id: "COMB_LRFD_02",
    name: "1.2 D + 1.6 Lr + 0.5 W (Carga Gravitacional Dominante)",
    normativeReference: "AISC 360-16 LRFD",
    factors: [
      { loadCaseId: "LC_DEAD", factor: 1.2 },
      { loadCaseId: "LC_LIVE", factor: 1.6 },
      { loadCaseId: "LC_WIND", factor: 0.5 }
    ]
  },
  {
    id: "COMB_LRFD_03",
    name: "1.2 D + 1.0 W + 0.5 Lr (Viento Dominante)",
    normativeReference: "AISC 360-16 LRFD",
    factors: [
      { loadCaseId: "LC_DEAD", factor: 1.2 },
      { loadCaseId: "LC_WIND", factor: 1.0 },
      { loadCaseId: "LC_LIVE", factor: 0.5 }
    ]
  }
];
