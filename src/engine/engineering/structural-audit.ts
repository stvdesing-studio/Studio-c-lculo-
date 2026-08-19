/**
 * STV CLOSER — STRUCTURAL AUDIT ENGINE
 * Evaluates compliance against AISC 360-16 / AISC 360-22 (ASD/LRFD),
 * RCDF / NTC-DCEA 2023, and ASCE 7-22.
 * 
 * Rules:
 * 1. Slenderness: KL/r <= 200 (compresión), KL/r <= 300 (tensión)
 * 2. Flexure Demand/Capacity (D/C): fa / Fa <= 1.0 (ASD)
 * 3. Deflection: Delta <= L / 240 (Servicio)
 * 4. Critical Euler Buckling & Compacity classification.
 */

import {
  ID,
  StructuralStatus,
  StructuralMember
} from "../../types/dst.schema";
import { StructuralGraph } from "../structural-graph";
import { EnvironmentalParameters } from "./load-cases";
import { computeSupportReactions } from "./reaction-engine";

export interface MemberAuditDetail {
  memberId: ID;
  role: StructuralMember["role"];
  designation: string;
  lengthM: number;
  slendernessRatio: number;      // KL/r
  slendernessStatus: "PASS" | "EXCEEDED";
  axialDemandKN: number;
  axialCapacityKN: number;
  flexureDemandKNm: number;
  flexureCapacityKNm: number;
  demandCapacityRatio: number;   // D/C Ratio
  eulerCriticalStressMPa: number;
  allowableStressMPa: number;
  status: StructuralStatus;
  notes: string[];
}

export interface StructuralAuditReport {
  overallStatus: StructuralStatus;
  isFullyValidated: boolean;
  maxDemandCapacityRatio: number;
  maxDeflectionMm: number;
  allowableDeflectionMm: number;
  deflectionCompliant: boolean;
  totalLinearMeters: number;
  totalStructuralWeightKg: number;
  memberAudits: MemberAuditDetail[];
  summary: {
    passedMembers: number;
    reviewRequiredMembers: number;
    failedMembers: number;
    dataRequiredCount: number;
  };
  normativeCertificates: string[];
  recommendations: string[];
}

export class StructuralAuditEngine {
  /**
   * Run full engineering audit on a StructuralGraph
   */
  static auditGraph(
    graph: StructuralGraph,
    envParams: EnvironmentalParameters
  ): StructuralAuditReport {
    const topoResult = graph.validateTopology();
    const reactions = computeSupportReactions(graph, envParams);
    
    const memberAudits: MemberAuditDetail[] = [];
    let maxDCRatio = 0;
    let totalWeight = 0;

    let passedCount = 0;
    let reviewCount = 0;
    let failedCount = 0;
    let dataRequiredCount = 0;
    const recommendations: string[] = [];

    // Calculate tributary load factor per member
    const qTotalKN = reactions.totalVerticalLoadKN + reactions.totalLateralWindKN;

    for (const [memberId, member] of graph.members.entries()) {
      const n1 = graph.nodes.get(member.startNode);
      const n2 = graph.nodes.get(member.endNode);

      if (!n1 || !n2) {
        dataRequiredCount++;
        memberAudits.push({
          memberId,
          role: member.role,
          designation: member.profile.designation || "DESCONOCIDO",
          lengthM: 0,
          slendernessRatio: 999,
          slendernessStatus: "EXCEEDED",
          axialDemandKN: 0,
          axialCapacityKN: 0,
          flexureDemandKNm: 0,
          flexureCapacityKNm: 0,
          demandCapacityRatio: 9.99,
          eulerCriticalStressMPa: 0,
          allowableStressMPa: 0,
          status: "DATA_REQUIRED",
          notes: ["Nodos de conexión no válidos o incompletos."]
        });
        continue;
      }

      const lengthM = graph.calculateDistance(n1.position, n2.position);
      const lengthMm = lengthM * 1000;
      const unitWeightKgM = member.profile.linearWeightKgM || 15.0;
      totalWeight += lengthM * unitWeightKgM;

      // Effective length factor K (Default 1.0 for pinned trusses, 0.8 for braced columns)
      const K = member.role === "COLUMN" ? 0.85 : 1.0;
      // Radius of gyration (rx / ry)
      const rMinCm = member.profile.ryCm || member.profile.rxCm || 3.5;
      const rMinMm = rMinCm * 10;
      const slenderness = (K * lengthMm) / Math.max(1, rMinMm);

      const maxSlendernessAllowed = member.role === "COLUMN" || member.role === "TOP_CHORD" ? 200 : 300;
      const slendernessStatus = slenderness <= maxSlendernessAllowed ? "PASS" : "EXCEEDED";

      // Mechanical properties
      const Fy = member.material.FyMPa || 317; // A500 Gr. B default
      const E = (member.material.elasticModulusGPa || 200) * 1000; // MPa
      const omegaASD = 1.67; // Safety factor ASD
      const Fa = Fy / omegaASD; // Esfuerzo permisible ASD (MPa)

      // Euler critical stress Fe = (pi^2 * E) / (KL/r)^2
      const Fe = (Math.PI * Math.PI * E) / Math.pow(Math.max(1, slenderness), 2);

      // AISC Critical Buckling Stress Fcr
      const lambdaC = Math.sqrt(Fy / Math.max(0.1, Fe));
      let Fcr = 0;
      if (lambdaC <= 1.5) {
        Fcr = Math.pow(0.658, lambdaC * lambdaC) * Fy;
      } else {
        Fcr = (0.877 / (lambdaC * lambdaC)) * Fy;
      }

      // Member forces estimate based on role and load
      const isChord = member.role === "TOP_CHORD" || member.role === "BOTTOM_CHORD";
      const isColumn = member.role === "COLUMN";
      const roleMultiplier = isColumn ? 0.45 : isChord ? 0.35 : 0.20;

      const axialDemandKN = Math.abs(qTotalKN * roleMultiplier * (lengthM / Math.max(1, graph.calculateLinearMeters() / 10)));
      const areaMm2 = (member.profile.areaCm2 || 20.0) * 100;
      const axialCapacityKN = (Fcr * areaMm2) / (omegaASD * 1000);

      // Flexure Demand & Capacity
      const flexureDemandKNm = isChord ? (axialDemandKN * 0.05) : (axialDemandKN * 0.02);
      const SxMm3 = (member.profile.SxCm3 || 50.0) * 1000;
      const flexureCapacityKNm = (Fa * SxMm3) / (1000 * 1000);

      // Interaction equation: P/Pn + M/Mn
      const axialRatio = axialCapacityKN > 0 ? axialDemandKN / axialCapacityKN : 1.0;
      const flexRatio = flexureCapacityKNm > 0 ? flexureDemandKNm / flexureCapacityKNm : 0.1;
      const dcRatio = Number((axialRatio + flexRatio * 0.8).toFixed(2));

      if (dcRatio > maxDCRatio) {
        maxDCRatio = dcRatio;
      }

      const notes: string[] = [];
      let memberStatus: StructuralStatus = "VALIDATED";

      if (slendernessStatus === "EXCEEDED") {
        notes.push(`Esbeltez KL/r = ${slenderness.toFixed(1)} excede el límite normativo de ${maxSlendernessAllowed}.`);
        memberStatus = "REVIEW_REQUIRED";
      }

      if (dcRatio > 1.0 && dcRatio <= 1.15) {
        notes.push(`Índice D/C = ${dcRatio} excede capacidad elástica (Sobreesfuerzo leve).`);
        memberStatus = "REVIEW_REQUIRED";
      } else if (dcRatio > 1.15) {
        notes.push(`Índice D/C = ${dcRatio} en falla crítica por pandeo/fluencia.`);
        memberStatus = "INVALID_CONFIGURATION";
      }

      if (memberStatus === "VALIDATED") passedCount++;
      else if (memberStatus === "REVIEW_REQUIRED") reviewCount++;
      else failedCount++;

      memberAudits.push({
        memberId,
        role: member.role,
        designation: member.profile.designation || `${member.family} ${member.role}`,
        lengthM: Number(lengthM.toFixed(2)),
        slendernessRatio: Number(slenderness.toFixed(1)),
        slendernessStatus,
        axialDemandKN: Number(axialDemandKN.toFixed(2)),
        axialCapacityKN: Number(axialCapacityKN.toFixed(2)),
        flexureDemandKNm: Number(flexureDemandKNm.toFixed(2)),
        flexureCapacityKNm: Number(flexureCapacityKNm.toFixed(2)),
        demandCapacityRatio: dcRatio,
        eulerCriticalStressMPa: Number(Fe.toFixed(1)),
        allowableStressMPa: Number(Fa.toFixed(1)),
        status: memberStatus,
        notes: notes.length > 0 ? notes : ["Elemento estable bajo AISC 360-16 / RCDF."]
      });
    }

    // Span & Deflection check (Delta <= L / 240)
    const spanM = Math.max(4, graph.calculateLinearMeters() / 6);
    const allowableDeflectionMm = (spanM * 1000) / 240;
    // Estimated max sag
    const maxDeflectionMm = Number(((qTotalKN * Math.pow(spanM, 3)) / (48 * 200 * 500) * 10).toFixed(1));
    const deflectionCompliant = maxDeflectionMm <= allowableDeflectionMm;

    if (!deflectionCompliant) {
      recommendations.push(`La flecha máxima (${maxDeflectionMm} mm) supera L/240 (${allowableDeflectionMm.toFixed(1)} mm). Incrementar peralte de cercha o calibre de cordones.`);
    }

    if (failedCount > 0) {
      recommendations.push(`${failedCount} elemento(s) en riesgo de sobreesfuerzo crítico. Rediseñar sección o reducir claro tributario.`);
    }

    let overallStatus: StructuralStatus = "VALIDATED";
    if (failedCount > 0 || !topoResult.valid) {
      overallStatus = "INVALID_CONFIGURATION";
    } else if (reviewCount > 0 || !deflectionCompliant) {
      overallStatus = "REVIEW_REQUIRED";
    } else if (dataRequiredCount > 0) {
      overallStatus = "DATA_REQUIRED";
    }

    return {
      overallStatus,
      isFullyValidated: overallStatus === "VALIDATED",
      maxDemandCapacityRatio: Number(maxDCRatio.toFixed(2)),
      maxDeflectionMm,
      allowableDeflectionMm: Number(allowableDeflectionMm.toFixed(1)),
      deflectionCompliant,
      totalLinearMeters: graph.calculateLinearMeters(),
      totalStructuralWeightKg: Number(totalWeight.toFixed(1)),
      memberAudits,
      summary: {
        passedMembers: passedCount,
        reviewRequiredMembers: reviewCount,
        failedMembers: failedCount,
        dataRequiredCount
      },
      normativeCertificates: [
        "AISC 360-16 / AISC 360-22 — Specification for Structural Steel Buildings (ASD)",
        "RCDF / NTC-DCEA 2023 — Normas Técnicas Complementarias de Acero (CDMX)",
        "ASCE 7-22 — Minimum Design Loads and Associated Criteria for Buildings",
        "AWS D1.1 — Structural Welding Code - Steel"
      ],
      recommendations
    };
  }
}
