import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { DSTProject, SectionProfile } from '../../../dst/dst.schema';
import { StructuralGraph } from '../../../dst/structural-graph';
import { HolographicBreakoutHub } from './HolographicBreakoutHub';
import { HolographicBucklingCard } from './HolographicBucklingCard';
import { HolographicMaterialCard } from './HolographicMaterialCard';
import {
  bindMeshCatalogMetadata,
  getMaterialCatalogItem,
  MaterialCatalogItem
} from '../../../dst/material-catalog';

interface Screen1Viewport3DProps {
  project: DSTProject;
  graph: StructuralGraph;
  currentProfile: SectionProfile;
  columnInclinationDeg: number;
  showHolograms: boolean;
  basePlateWidthMm?: number;
  basePlateThickMm?: number;
  anchorCount?: number;
  onSelectElement?: (id: string | null, type: string) => void;
  onSelectProfile?: (profile: SectionProfile) => void;
  onUpdateBasePlate?: (updates: { basePlateThickMm?: number; anchorCount?: number }) => void;
}

export const Screen1Viewport3D: React.FC<Screen1Viewport3DProps> = ({
  project,
  graph,
  currentProfile,
  columnInclinationDeg = 0,
  showHolograms = true,
  basePlateWidthMm = 400,
  basePlateThickMm = 25,
  anchorCount = 6,
  onSelectElement,
  onSelectProfile,
  onUpdateBasePlate
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const clickableMeshesRef = useRef<THREE.Mesh[]>([]);
  const reqIdRef = useRef<number>(0);

  // Screen Coordinates for anchored 2D/3D overlays
  const [hub2DPos, setHub2DPos] = useState<{ x: number; y: number } | null>(null);
  const [buckling2DPos, setBuckling2DPos] = useState<{ x: number; y: number } | null>(null);

  // Selected Material Registry Query State
  const [selectedMaterialItem, setSelectedMaterialItem] = useState<{
    catalogItemId: string;
    memberId?: string;
    memberRole?: string;
    screenPos?: { x: number; y: number };
  } | null>(null);

  // Initialize Three.js Scene
  useEffect(() => {
    if (!containerRef.current || !canvasRef.current) return;

    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;

    // 1. Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#020307');
    scene.fog = new THREE.FogExp2(new THREE.Color('#020307'), 0.015);
    sceneRef.current = scene;

    // 2. Camera: Isometric Front-Left Perspective framing the Pergola
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 500);
    camera.position.set(-8, 10, -11);
    cameraRef.current = camera;

    // 3. Renderer
    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      antialias: true,
      alpha: false,
      powerPreference: 'high-performance'
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;
    rendererRef.current = renderer;

    // 4. Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI / 2 + 0.02;
    controls.target.set(project.geometry.width.value / 2, 3.2, project.geometry.length.value / 2);
    controls.update();
    controlsRef.current = controls;

    // 5. Lighting Setup
    // Key Sun Light
    const dirLight = new THREE.DirectionalLight(0xF4FAFA, 2.4);
    dirLight.position.set(25, 35, 20);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 2048;
    dirLight.shadow.mapSize.height = 2048;
    dirLight.shadow.bias = -0.0003;
    scene.add(dirLight);

    // Cyan Rim Light
    const rimLight = new THREE.DirectionalLight(0x00E5FF, 1.8);
    rimLight.position.set(-20, 15, -20);
    scene.add(rimLight);

    // Gold Secondary Light
    const goldLight = new THREE.DirectionalLight(0xFFD600, 0.8);
    goldLight.position.set(15, -5, 25);
    scene.add(goldLight);

    // Ambient Specular
    const hemiLight = new THREE.HemisphereLight(0x0D2235, 0x020307, 1.2);
    scene.add(hemiLight);

    // 6. Floor Grid & Reflection Plane
    const floorGeo = new THREE.PlaneGeometry(80, 80);
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0x03060A,
      roughness: 0.85,
      metalness: 0.2
    });
    const floorMesh = new THREE.Mesh(floorGeo, floorMat);
    floorMesh.rotation.x = -Math.PI / 2;
    floorMesh.position.y = -0.05;
    floorMesh.receiveShadow = true;
    scene.add(floorMesh);

    // Engineering Spatial Grid Lines
    const gridHelper = new THREE.GridHelper(50, 50, 0x00E5FF, 0x081C2A);
    gridHelper.position.y = 0;
    scene.add(gridHelper);

    // 7. Animation Loop with Screen Projector for Hubs
    const targetAnchorPos = new THREE.Vector3(0, 0.4, 0);
    const targetBucklingPos = new THREE.Vector3(-1.2, 3.2, -0.8);

    const animate = () => {
      reqIdRef.current = requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);

      // Project 3D column anchor to 2D screen space
      if (containerRef.current && camera) {
        const cWidth = containerRef.current.clientWidth;
        const cHeight = containerRef.current.clientHeight;

        // Hub 1: Base Plate Magnifier
        const temp1 = targetAnchorPos.clone().project(camera);
        const x1 = (temp1.x * 0.5 + 0.5) * cWidth;
        const y1 = (-(temp1.y * 0.5) + 0.5) * cHeight;
        if (temp1.z < 1) {
          setHub2DPos({ x: x1, y: y1 });
        }

        // Hub 2: Buckling Diagram
        const temp2 = targetBucklingPos.clone().project(camera);
        const x2 = (temp2.x * 0.5 + 0.5) * cWidth;
        const y2 = (-(temp2.y * 0.5) + 0.5) * cHeight;
        if (temp2.z < 1) {
          setBuckling2DPos({ x: x2, y: y2 });
        }
      }
    };
    animate();

    // 8. Resize Observer
    const handleResize = () => {
      if (!containerRef.current || !rendererRef.current || !cameraRef.current) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;
      cameraRef.current.aspect = w / h;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(reqIdRef.current);
      renderer.dispose();
    };
  }, []);

  // Re-build 3D Structural Geometry when project/params change
  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;

    // Clear previous model objects
    const toRemove: THREE.Object3D[] = [];
    scene.traverse((obj) => {
      if (obj.userData && obj.userData.isStructuralModel) {
        toRemove.push(obj);
      }
    });
    toRemove.forEach((o) => {
      if (o.parent) o.parent.remove(o);
    });

    clickableMeshesRef.current = [];

    const modelGroup = new THREE.Group();
    modelGroup.userData.isStructuralModel = true;

    // Materials
    const steelPbrMat = new THREE.MeshStandardMaterial({
      color: 0x182430,
      metalness: 0.9,
      roughness: 0.35,
      envMapIntensity: 1.2
    });

    const cyanEdgeMat = new THREE.LineBasicMaterial({
      color: 0x00E5FF,
      linewidth: 1.5,
      transparent: true,
      opacity: 0.8
    });

    const concreteMat = new THREE.MeshStandardMaterial({
      color: 0x1E2B38,
      roughness: 0.95,
      metalness: 0.05
    });

    const goldAccentMat = new THREE.MeshStandardMaterial({
      color: 0xFFD600,
      metalness: 0.8,
      roughness: 0.3
    });

    const spanM = project.geometry.width.value;
    const lengthM = project.geometry.length.value;
    const heightM = project.geometry.height.value;
    const framesCount = 4;
    const baySpacingM = lengthM / (framesCount - 1);

    const columnCatalogId = currentProfile.catalogItemId || 'prod-mx-hss-6x4-14';

    // 1. V-BRANCHED COLUMNS & PEDESTALS GENERATION (Matching exact Pergola Geometry)
    const inclineRad = (columnInclinationDeg * Math.PI) / 180;
    const inclineOffsetX = Math.sin(inclineRad) * heightM;

    // Foundation Base Slab (Large monolithic architectural concrete plinth)
    const baseSlabGeo = new THREE.BoxGeometry(spanM + 4, 0.25, lengthM + 4);
    const baseSlabMesh = new THREE.Mesh(baseSlabGeo, concreteMat);
    baseSlabMesh.position.set(spanM / 2, 0.125, lengthM / 2);
    baseSlabMesh.receiveShadow = true;
    bindMeshCatalogMetadata(baseSlabMesh, 'prod-mx-pedestal-fpc250', {
      id: 'SLAB-01',
      role: 'SLAB',
      name: 'LOSA DE CIMENTACIÓN MONOLÍTICA'
    });
    modelGroup.add(baseSlabMesh);
    clickableMeshesRef.current.push(baseSlabMesh);

    // Glowing Neon Floor Strip Lights (Front and rear edges)
    const stripGeo = new THREE.BoxGeometry(spanM + 6, 0.04, 0.08);
    const stripMat = new THREE.MeshBasicMaterial({ color: 0xF4FAFA });
    const frontStrip = new THREE.Mesh(stripGeo, stripMat);
    frontStrip.position.set(spanM / 2, 0.26, -1.2);
    modelGroup.add(frontStrip);

    const rearStrip = new THREE.Mesh(stripGeo, stripMat);
    rearStrip.position.set(spanM / 2, 0.26, lengthM + 1.2);
    modelGroup.add(rearStrip);

    // 4 Main Bents / Portal Frames with V-Columns
    for (let f = 0; f < framesCount; f++) {
      const z = f * baySpacingM;
      const frameMark = `FRAME-${f + 1}`;

      // Base nodes (Left & Right)
      const basePosL = new THREE.Vector3(0, 0.25, z);
      const basePosR = new THREE.Vector3(spanM, 0.25, z);

      // Top V-Branch Nodes (Left twin branch, Right twin branch)
      const topPosL1 = new THREE.Vector3(-inclineOffsetX * 0.8, heightM, z - baySpacingM * 0.25);
      const topPosL2 = new THREE.Vector3(-inclineOffsetX * 1.2, heightM, z + baySpacingM * 0.25);

      const topPosR1 = new THREE.Vector3(spanM + inclineOffsetX * 0.8, heightM, z - baySpacingM * 0.25);
      const topPosR2 = new THREE.Vector3(spanM + inclineOffsetX * 1.2, heightM, z + baySpacingM * 0.25);

      // Left Column Support & V-Branches
      buildPhysicalColumn(
        basePosL,
        topPosL1,
        modelGroup,
        steelPbrMat,
        cyanEdgeMat,
        goldAccentMat,
        concreteMat,
        columnCatalogId,
        `COL-L${f + 1}`,
        clickableMeshesRef.current
      );

      buildHollowBeam(
        basePosL,
        topPosL2,
        modelGroup,
        steelPbrMat,
        cyanEdgeMat,
        0.18,
        0.18,
        columnCatalogId,
        `BRANCH-L${f + 1}`,
        'V_BRANCH',
        clickableMeshesRef.current
      );

      // Right Column Support & V-Branches
      buildPhysicalColumn(
        basePosR,
        topPosR1,
        modelGroup,
        steelPbrMat,
        cyanEdgeMat,
        goldAccentMat,
        concreteMat,
        columnCatalogId,
        `COL-R${f + 1}`,
        clickableMeshesRef.current
      );

      buildHollowBeam(
        basePosR,
        topPosR2,
        modelGroup,
        steelPbrMat,
        cyanEdgeMat,
        0.18,
        0.18,
        columnCatalogId,
        `BRANCH-R${f + 1}`,
        'V_BRANCH',
        clickableMeshesRef.current
      );

      // Main Transverse Pergola Girders
      buildHollowBeam(
        topPosL1,
        topPosR1,
        modelGroup,
        steelPbrMat,
        cyanEdgeMat,
        0.22,
        0.28,
        'prod-mx-ipr-w10x19',
        `GIRDER-1-${f + 1}`,
        'MAIN_GIRDER',
        clickableMeshesRef.current
      );

      buildHollowBeam(
        topPosL2,
        topPosR2,
        modelGroup,
        steelPbrMat,
        cyanEdgeMat,
        0.22,
        0.28,
        'prod-mx-ipr-w10x19',
        `GIRDER-2-${f + 1}`,
        'MAIN_GIRDER',
        clickableMeshesRef.current
      );
    }

    // 2. LONGITUDINAL PERGOLA BEAMS & RAFTERS GRID
    const rafterCount = 9;
    for (let r = 0; r < rafterCount; r++) {
      const alpha = r / (rafterCount - 1);
      const xPos = -inclineOffsetX * 1.1 + alpha * (spanM + 2.2 * inclineOffsetX);
      const start = new THREE.Vector3(xPos, heightM + 0.15, -baySpacingM * 0.3);
      const end = new THREE.Vector3(xPos, heightM + 0.15, lengthM + baySpacingM * 0.3);
      buildHollowBeam(
        start,
        end,
        modelGroup,
        steelPbrMat,
        cyanEdgeMat,
        0.12,
        0.14,
        'prod-mx-ptr-4x4-cal11',
        `RAFTER-${r + 1}`,
        'RAFTER',
        clickableMeshesRef.current
      );
    }

    // Top Perimeter Ring Beams
    const p1 = new THREE.Vector3(-inclineOffsetX * 1.2, heightM + 0.1, -baySpacingM * 0.35);
    const p2 = new THREE.Vector3(spanM + inclineOffsetX * 1.2, heightM + 0.1, -baySpacingM * 0.35);
    const p3 = new THREE.Vector3(spanM + inclineOffsetX * 1.2, heightM + 0.1, lengthM + baySpacingM * 0.35);
    const p4 = new THREE.Vector3(-inclineOffsetX * 1.2, heightM + 0.1, lengthM + baySpacingM * 0.35);

    buildHollowBeam(p1, p2, modelGroup, steelPbrMat, cyanEdgeMat, 0.2, 0.22, 'prod-mx-hss-6x4-14', 'RING-1', 'PERIMETER_RING', clickableMeshesRef.current);
    buildHollowBeam(p2, p3, modelGroup, steelPbrMat, cyanEdgeMat, 0.2, 0.22, 'prod-mx-hss-6x4-14', 'RING-2', 'PERIMETER_RING', clickableMeshesRef.current);
    buildHollowBeam(p3, p4, modelGroup, steelPbrMat, cyanEdgeMat, 0.2, 0.22, 'prod-mx-hss-6x4-14', 'RING-3', 'PERIMETER_RING', clickableMeshesRef.current);
    buildHollowBeam(p4, p1, modelGroup, steelPbrMat, cyanEdgeMat, 0.2, 0.22, 'prod-mx-hss-6x4-14', 'RING-4', 'PERIMETER_RING', clickableMeshesRef.current);

    // 3. DIMENSION LINES & GRID CALLOUT AXES (A, B, 1, 2, S, T)
    buildGridDimensionOverlay(modelGroup, spanM, lengthM, heightM);

    scene.add(modelGroup);
  }, [project, currentProfile, columnInclinationDeg, basePlateWidthMm, basePlateThickMm, anchorCount]);

  // Raycasting Click Handler: Query Material Registry on Component Click
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current || !sceneRef.current || !cameraRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(new THREE.Vector2(x, y), cameraRef.current);

    const intersects = raycaster.intersectObjects(clickableMeshesRef.current, true);

    if (intersects.length > 0) {
      const hit = intersects[0].object as THREE.Mesh;
      if (hit && hit.userData && hit.userData.catalogItemId) {
        const catalogItemId = hit.userData.catalogItemId;
        const memberId = hit.userData.id;
        const memberRole = hit.userData.role || hit.userData.nombreComercial;

        setSelectedMaterialItem({
          catalogItemId,
          memberId,
          memberRole,
          screenPos: { x: e.clientX - rect.left, y: e.clientY - rect.top }
        });

        if (onSelectElement) {
          onSelectElement(memberId || catalogItemId, 'MEMBER');
        }
        return;
      }
    }

    // If clicked empty space, close selection HUD
    setSelectedMaterialItem(null);
  };

  const handleApplyProfileFromCard = (item: MaterialCatalogItem) => {
    if (onSelectProfile) {
      onSelectProfile({
        family: item.geometriaSeccion.tipoPerfil as any,
        designation: item.metadatos.nombreComercial,
        catalogItemId: item.metadatos.id,
        depth: { value: item.geometriaSeccion.altoTotal_mm / 1000, unit: 'm' },
        width: { value: item.geometriaSeccion.anchoTotal_mm / 1000, unit: 'm' },
        thickness: { value: item.geometriaSeccion.espesorPared_mm / 1000, unit: 'm' },
        weightKgM: item.geometriaSeccion.pesoLineal_kg_m
      });
    }
  };

  return (
    <div ref={containerRef} className="relative w-full h-full overflow-hidden select-none bg-[#020307]">
      {/* Three.js Canvas */}
      <canvas
        ref={canvasRef}
        onClick={handleCanvasClick}
        className="w-full h-full block cursor-grab active:cursor-grabbing"
      />

      {/* Instant Material Registry Query HUD on Component Click */}
      {selectedMaterialItem && (
        <HolographicMaterialCard
          catalogItemId={selectedMaterialItem.catalogItemId}
          memberId={selectedMaterialItem.memberId}
          memberRole={selectedMaterialItem.memberRole}
          position={selectedMaterialItem.screenPos}
          onClose={() => setSelectedMaterialItem(null)}
          onSelectForApplication={handleApplyProfileFromCard}
        />
      )}

      {/* Living Spatial Holographic Hub 1: Base Plate Magnifier Breakout Hub */}
      {showHolograms && hub2DPos && !selectedMaterialItem && (
        <div
          style={{
            position: 'absolute',
            left: `${Math.max(60, Math.min(hub2DPos.x - 110, (typeof window !== 'undefined' ? window.innerWidth : 1200) - 320))}px`,
            top: `${Math.max(80, Math.min(hub2DPos.y - 110, (typeof window !== 'undefined' ? window.innerHeight : 800) - 300))}px`,
            zIndex: 25
          }}
        >
          <HolographicBreakoutHub
            basePlateWidthMm={basePlateWidthMm}
            basePlateThickMm={basePlateThickMm}
            anchorCount={anchorCount}
            onUpdateParams={onUpdateBasePlate}
          />
        </div>
      )}

      {/* Living Spatial Holographic Hub 2: Buckling Curve Card */}
      {showHolograms && buckling2DPos && !selectedMaterialItem && (
        <div
          style={{
            position: 'absolute',
            left: `${Math.max(40, Math.min(buckling2DPos.x - 140, (typeof window !== 'undefined' ? window.innerWidth : 1200) - 360))}px`,
            top: `${Math.max(100, Math.min(buckling2DPos.y - 140, (typeof window !== 'undefined' ? window.innerHeight : 800) - 280))}px`,
            zIndex: 24
          }}
        >
          <HolographicBucklingCard
            columnMark="COL-01"
            designation={currentProfile.designation}
            lengthM={project.geometry.height.value}
          />
        </div>
      )}
    </div>
  );
};

// Helper: Builds physical column with base plate, anchor bolts, concrete pedestal
function buildPhysicalColumn(
  base: THREE.Vector3,
  top: THREE.Vector3,
  group: THREE.Group,
  steelMat: THREE.Material,
  edgeMat: THREE.Material,
  goldMat: THREE.Material,
  concreteMat: THREE.Material,
  columnCatalogId: string,
  columnId: string,
  clickableList: THREE.Mesh[]
) {
  // 1. Concrete Pedestal
  const pedGeo = new THREE.BoxGeometry(0.7, 0.4, 0.7);
  const pedMesh = new THREE.Mesh(pedGeo, concreteMat);
  pedMesh.position.set(base.x, base.y + 0.2, base.z);
  pedMesh.castShadow = true;
  pedMesh.receiveShadow = true;
  bindMeshCatalogMetadata(pedMesh, 'prod-mx-pedestal-fpc250', {
    id: `PED-${columnId}`,
    role: 'PEDESTAL'
  });
  group.add(pedMesh);
  clickableList.push(pedMesh);

  // 2. Base Plate
  const bpGeo = new THREE.BoxGeometry(0.45, 0.03, 0.45);
  const bpMesh = new THREE.Mesh(bpGeo, steelMat);
  bpMesh.position.set(base.x, base.y + 0.415, base.z);
  bpMesh.castShadow = true;
  bindMeshCatalogMetadata(bpMesh, 'prod-mx-placa-a36-34', {
    id: `BP-${columnId}`,
    role: 'BASE_PLATE'
  });
  group.add(bpMesh);
  clickableList.push(bpMesh);

  // 3. Anchor Bolts (4x)
  const offsets = [-0.16, 0.16];
  offsets.forEach((ox) => {
    offsets.forEach((oz) => {
      const boltGeo = new THREE.CylinderGeometry(0.015, 0.015, 0.08, 12);
      const boltMesh = new THREE.Mesh(boltGeo, goldMat);
      boltMesh.position.set(base.x + ox, base.y + 0.44, base.z + oz);
      bindMeshCatalogMetadata(boltMesh, 'prod-mx-perno-f1554-34', {
        id: `BOLT-${columnId}`,
        role: 'ANCHOR_BOLT'
      });
      group.add(boltMesh);
      clickableList.push(boltMesh);
    });
  });

  // 4. Column Shaft (HSS Box)
  const colBase = new THREE.Vector3(base.x, base.y + 0.43, base.z);
  const length = colBase.distanceTo(top);
  const colGeo = new THREE.BoxGeometry(0.2, length, 0.2);
  const colMesh = new THREE.Mesh(colGeo, steelMat);

  const mid = colBase.clone().add(top).multiplyScalar(0.5);
  colMesh.position.copy(mid);

  const dir = top.clone().sub(colBase).normalize();
  const up = new THREE.Vector3(0, 1, 0);
  const quaternion = new THREE.Quaternion().setFromUnitVectors(up, dir);
  colMesh.setRotationFromQuaternion(quaternion);
  colMesh.castShadow = true;

  bindMeshCatalogMetadata(colMesh, columnCatalogId, {
    id: columnId,
    role: 'COLUMN'
  });

  group.add(colMesh);
  clickableList.push(colMesh);

  // Wireframe / Structural Graph Line Overlay
  const edges = new THREE.EdgesGeometry(colGeo);
  const line = new THREE.LineSegments(edges, edgeMat);
  colMesh.add(line);
}

// Helper: Builds hollow beam between two points
function buildHollowBeam(
  p1: THREE.Vector3,
  p2: THREE.Vector3,
  group: THREE.Group,
  mat: THREE.Material,
  edgeMat: THREE.Material,
  w = 0.2,
  h = 0.25,
  catalogItemId: string = 'prod-mx-hss-6x4-14',
  id: string = 'BEAM-01',
  role: string = 'BEAM',
  clickableList?: THREE.Mesh[]
) {
  const len = p1.distanceTo(p2);
  const geo = new THREE.BoxGeometry(w, h, len);
  const mesh = new THREE.Mesh(geo, mat);

  const mid = p1.clone().add(p2).multiplyScalar(0.5);
  mesh.position.copy(mid);

  const dir = p2.clone().sub(p1).normalize();
  const forward = new THREE.Vector3(0, 0, 1);
  const quaternion = new THREE.Quaternion().setFromUnitVectors(forward, dir);
  mesh.setRotationFromQuaternion(quaternion);
  mesh.castShadow = true;

  bindMeshCatalogMetadata(mesh, catalogItemId, {
    id,
    role
  });

  group.add(mesh);
  if (clickableList) {
    clickableList.push(mesh);
  }

  const edges = new THREE.EdgesGeometry(geo);
  const line = new THREE.LineSegments(edges, edgeMat);
  mesh.add(line);
}

// Helper: Adds Grid Axes (A), (B), (Γ), (1), (2), (S) and dimension callouts
function buildGridDimensionOverlay(
  group: THREE.Group,
  spanM: number,
  lengthM: number,
  heightM: number
) {
  const lineMat = new THREE.LineDashedMaterial({
    color: 0xFFD600,
    dashSize: 0.3,
    gapSize: 0.2,
    linewidth: 1.5
  });

  // Span line
  const spanPoints = [
    new THREE.Vector3(0, 0.05, -1.5),
    new THREE.Vector3(spanM, 0.05, -1.5)
  ];
  const spanGeo = new THREE.BufferGeometry().setFromPoints(spanPoints);
  const spanLine = new THREE.Line(spanGeo, lineMat);
  spanLine.computeLineDistances();
  group.add(spanLine);

  // Length line
  const lenPoints = [
    new THREE.Vector3(-1.5, 0.05, 0),
    new THREE.Vector3(-1.5, 0.05, lengthM)
  ];
  const lenGeo = new THREE.BufferGeometry().setFromPoints(lenPoints);
  const lenLine = new THREE.Line(lenGeo, lineMat);
  lenLine.computeLineDistances();
  group.add(lenLine);

  // Circular Grid Axis Markers on Floor (A, B, 1, 2, S)
  const axisBubbleMat = new THREE.MeshBasicMaterial({ color: 0xFFD600 });

  const bubblePositions = [
    { pos: new THREE.Vector3(0, 0.06, -2.2), label: 'A' },
    { pos: new THREE.Vector3(spanM, 0.06, -2.2), label: 'B' },
    { pos: new THREE.Vector3(-2.2, 0.06, 0), label: '1' },
    { pos: new THREE.Vector3(-2.2, 0.06, lengthM / 2), label: '2' },
    { pos: new THREE.Vector3(-2.2, 0.06, lengthM), label: '3' },
    { pos: new THREE.Vector3(spanM + 2.2, 0.06, lengthM / 2), label: 'S' }
  ];

  bubblePositions.forEach((b) => {
    // Outer Ring
    const ringGeo = new THREE.RingGeometry(0.35, 0.42, 24);
    const ringMesh = new THREE.Mesh(ringGeo, axisBubbleMat);
    ringMesh.rotation.x = -Math.PI / 2;
    ringMesh.position.copy(b.pos);
    group.add(ringMesh);

    // Center Node Dot
    const dotGeo = new THREE.CircleGeometry(0.12, 16);
    const dotMesh = new THREE.Mesh(dotGeo, axisBubbleMat);
    dotMesh.rotation.x = -Math.PI / 2;
    dotMesh.position.copy(b.pos);
    group.add(dotMesh);
  });
}

