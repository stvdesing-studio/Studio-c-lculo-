// ============================================================
// STV CLOSER — MATERIAL LIBRARY & PBR SHADER SPECIFICATIONS
// material-library.ts
// ============================================================

import * as THREE from 'three';
import { MaterialDefinition } from './dst.schema';

export interface PBRMaterialSpec {
  id: string;
  name: string;
  category: 'STEEL' | 'CONCRETE' | 'GROUT' | 'FASTENER' | 'PLATE';
  color: string;
  metalness: number;
  roughness: number;
  specularColor: string;
  clearcoat?: number;
  clearcoatRoughness?: number;
  wireframeColor: string;
  definition: MaterialDefinition;
  description: string;
  surfaceFinish: string;
}

export const DST_MATERIAL_CATALOG: Record<string, PBRMaterialSpec> = {
  STEEL_A992: {
    id: 'STEEL_A992',
    name: 'ASTM A992 Gr. 50 Structural Steel',
    category: 'STEEL',
    color: '#5E6872',
    metalness: 0.92,
    roughness: 0.28,
    specularColor: '#B8C0C7',
    clearcoat: 0.2,
    clearcoatRoughness: 0.1,
    wireframeColor: '#00E5FF',
    description: 'High-strength low-alloy structural steel standard for wide flange IPR/W sections.',
    surfaceFinish: 'Mill Scale Blast Sa 2.5 / Shop Primer',
    definition: {
      id: 'STEEL_A992',
      name: 'ASTM A992 Gr. 50',
      grade: 'Grade 50',
      fy: 345, // MPa
      fu: 450, // MPa
      density: 7850, // kg/m3
      catalogItemId: 'prod-mx-ipr-w10x19'
    }
  },
  STEEL_A500_B: {
    id: 'STEEL_A500_B',
    name: 'ASTM A500 Gr. B Cold-Formed HSS/PTR',
    category: 'STEEL',
    color: '#6B7682',
    metalness: 0.90,
    roughness: 0.32,
    specularColor: '#8A949D',
    clearcoat: 0.15,
    clearcoatRoughness: 0.2,
    wireframeColor: '#00E5FF',
    description: 'Cold-formed welded carbon steel structural tubing for tubular columns and truss chords.',
    surfaceFinish: 'Smooth Cold Rolled / Oxide film',
    definition: {
      id: 'STEEL_A500_B',
      name: 'ASTM A500 Gr. B',
      grade: 'Grade B',
      fy: 317, // MPa
      fu: 400, // MPa
      density: 7850,
      catalogItemId: 'prod-mx-hss-6x4-14'
    }
  },
  STEEL_A36: {
    id: 'STEEL_A36',
    name: 'ASTM A36 Carbon Steel Plate',
    category: 'PLATE',
    color: '#525B64',
    metalness: 0.88,
    roughness: 0.38,
    specularColor: '#78828C',
    wireframeColor: '#00A8FF',
    description: 'Standard carbon structural steel for base plates, gusset plates, and connection angles.',
    surfaceFinish: 'Hot-Rolled As-Delivered',
    definition: {
      id: 'STEEL_A36',
      name: 'ASTM A36',
      grade: 'Standard',
      fy: 250,
      fu: 400,
      density: 7850,
      catalogItemId: 'prod-mx-placa-a36-34'
    }
  },
  GALVANIZED_STEEL: {
    id: 'GALVANIZED_STEEL',
    name: 'ASTM A653 G90 Galvanized Steel',
    category: 'STEEL',
    color: '#8E99A4',
    metalness: 0.94,
    roughness: 0.22,
    specularColor: '#D8DFE6',
    clearcoat: 0.3,
    wireframeColor: '#4CC9FF',
    description: 'Hot-dip zinc coated steel for roof purlins, girts, and exposed structural fasteners.',
    surfaceFinish: 'Hot-Dip Galvanized Spangle G90',
    definition: {
      id: 'GALVANIZED_STEEL',
      name: 'ASTM A653 G90',
      grade: 'Structural Grade 50',
      fy: 345,
      fu: 450,
      density: 7850,
      catalogItemId: 'prod-mx-monten-c-6x2-cal14'
    }
  },
  STAINLESS_316: {
    id: 'STAINLESS_316',
    name: 'AISI 316 Marine Grade Stainless Steel',
    category: 'STEEL',
    color: '#AAB3BD',
    metalness: 0.96,
    roughness: 0.16,
    specularColor: '#E2E8F0',
    clearcoat: 0.5,
    wireframeColor: '#FFFFFF',
    description: 'Austenitic chromium-nickel stainless steel for severe atmospheric corrosion exposure.',
    surfaceFinish: '2B Bright Annealed Finish',
    definition: {
      id: 'STAINLESS_316',
      name: 'AISI 316 Stainless',
      grade: 'Marine 316',
      fy: 290,
      fu: 580,
      density: 8000
    }
  },
  CONCRETE_FC250: {
    id: 'CONCRETE_FC250',
    name: 'Structural Concrete f\'c = 250 kg/cm²',
    category: 'CONCRETE',
    color: '#2A363B',
    metalness: 0.04,
    roughness: 0.88,
    specularColor: '#475569',
    wireframeColor: '#4CC9FF',
    description: 'Hydraulic Portland cement concrete for isolated spread footings and pedestals.',
    surfaceFinish: 'Form-Finished Smooth Rubbed',
    definition: {
      id: 'CONCRETE_FC250',
      name: 'Concrete f\'c 25 MPa',
      grade: 'Class 1 Structural',
      fy: 25, // compressive
      density: 2400
    }
  },
  GROUT_NON_SHRINK: {
    id: 'GROUT_NON_SHRINK',
    name: 'High-Strength Non-Shrink Grout',
    category: 'GROUT',
    color: '#3F4D52',
    metalness: 0.02,
    roughness: 0.92,
    specularColor: '#64748B',
    wireframeColor: '#00E5FF',
    description: 'Precision non-shrink cementitious grout under base plates (25mm leveling bed).',
    surfaceFinish: 'Dry-Pack / Fluid Flow Troweled',
    definition: {
      id: 'GROUT_NON_SHRINK',
      name: 'ASTM C1107 Non-Shrink Grout',
      grade: 'High Strength',
      fy: 55, // 55 MPa (550 kg/cm2)
      density: 2200
    }
  },
  ANCHOR_BOLT_F1554: {
    id: 'ANCHOR_BOLT_F1554',
    name: 'ASTM F1554 Grade 55 Anchor Rod',
    category: 'FASTENER',
    color: '#7D8893',
    metalness: 0.95,
    roughness: 0.24,
    specularColor: '#CBD5E1',
    wireframeColor: '#00E5FF',
    description: 'High-strength carbon and alloy steel anchor bolts with heavy hex nuts and hardened washers.',
    surfaceFinish: 'Zinc Electroplated Class Fe/Zn 12',
    definition: {
      id: 'ANCHOR_BOLT_F1554',
      name: 'ASTM F1554 Gr. 55',
      grade: 'Grade 55',
      fy: 380,
      fu: 517,
      density: 7850
    }
  }
};

/**
 * Three.js PBR Material Cache Factory
 */
class MaterialCacheManager {
  private materials = new Map<string, THREE.MeshStandardMaterial>();

  public getMaterial(id: string, options: { wireframe?: boolean; opacity?: number; highlighted?: boolean } = {}): THREE.MeshStandardMaterial {
    const key = `${id}_${options.wireframe ? 'wf' : 'sol'}_${options.highlighted ? 'hl' : 'norm'}_${options.opacity ?? 1}`;
    
    if (this.materials.has(key)) {
      return this.materials.get(key)!;
    }

    const spec = DST_MATERIAL_CATALOG[id] || DST_MATERIAL_CATALOG.STEEL_A992;
    
    let baseColor = new THREE.Color(spec.color);
    let emissive = new THREE.Color(0x000000);
    let emissiveIntensity = 0;

    if (options.highlighted) {
      baseColor = new THREE.Color('#00E5FF');
      emissive = new THREE.Color('#00E5FF');
      emissiveIntensity = 0.35;
    }

    const mat = new THREE.MeshStandardMaterial({
      color: baseColor,
      metalness: spec.metalness,
      roughness: spec.roughness,
      wireframe: options.wireframe ?? false,
      transparent: (options.opacity ?? 1) < 1,
      opacity: options.opacity ?? 1,
      emissive,
      emissiveIntensity
    });

    this.materials.set(key, mat);
    return mat;
  }

  public getEdgeMaterial(highlighted: boolean = false): THREE.LineBasicMaterial {
    return new THREE.LineBasicMaterial({
      color: highlighted ? 0x00E5FF : 0x3CA9FF,
      linewidth: 1,
      transparent: true,
      opacity: highlighted ? 0.95 : 0.4
    });
  }
}

export const MaterialEngine = new MaterialCacheManager();
