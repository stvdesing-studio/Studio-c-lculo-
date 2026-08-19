// ============================================================
// STV CLOSER — DIGITAL STRUCTURAL TWIN 3D VIEWPORT ENGINE
// DSTViewport.tsx
// High-Fidelity WebGL2 PBR, Structural Graph, Holographic Hubs & Camera System
// ============================================================

import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { DSTProject, StructuralMember, StructuralNode, FoundationElement } from '../../dst/dst.schema';
import { StructuralGraph } from '../../dst/structural-graph';
import { MaterialEngine, DST_MATERIAL_CATALOG } from '../../dst/material-library';
import { bindMeshCatalogMetadata } from '../../dst/material-catalog';
import { createMemberMesh } from '../../dst/project-builder';
import {
  Eye,
  Layers,
  Box,
  Compass,
  Maximize2,
  ZoomIn,
  RefreshCw,
  Cpu,
  Target,
  Sparkles,
  Grid
} from 'lucide-react';

export interface DSTViewportProps {
  project: DSTProject;
  graph: StructuralGraph;
  selectedElementId: string | null;
  onSelectElement: (id: string | null, type: 'MEMBER' | 'NODE' | 'FOUNDATION' | 'CONNECTION') => void;
  activeMode?: 'ALL' | 'COLUMNS' | 'ROOF' | 'FOUNDATION' | 'CONNECTIONS' | 'FABRICATION';
}

export const DSTViewport: React.FC<DSTViewportProps> = ({
  project,
  graph,
  selectedElementId,
  onSelectElement,
  activeMode = 'ALL'
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Layer Toggles
  const [showPBRSolid, setShowPBRSolid] = useState(true);
  const [showStructuralGraph, setShowStructuralGraph] = useState(true);
  const [showMaterialProjection, setShowMaterialProjection] = useState(false);
  const [showStructuralHubs, setShowStructuralHubs] = useState(true);
  const [showDimensions, setShowDimensions] = useState(true);
  const [showSpatialGrid, setShowSpatialGrid] = useState(true);
  const [isOrthographic, setIsOrthographic] = useState(false);

  // Internal Three.js Scene References
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const perspCameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const orthoCameraRef = useRef<THREE.OrthographicCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const interactiveObjectsRef = useRef<Map<string, THREE.Object3D>>(new Map());
  const reqIdRef = useRef<number>(0);

  // Initialize Three.js Engine
  useEffect(() => {
    if (!containerRef.current || !canvasRef.current) return;

    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;

    // 1. SCENE SETUP
    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#020307');
    scene.fog = new THREE.FogExp2(new THREE.Color('#020307'), 0.012);
    sceneRef.current = scene;

    // 2. CAMERAS
    const aspect = width / height;
    const perspCamera = new THREE.PerspectiveCamera(45, aspect, 0.1, 500);
    perspCamera.position.set(22, 16, 28);
    perspCameraRef.current = perspCamera;

    const frustumSize = 25;
    const orthoCamera = new THREE.OrthographicCamera(
      (-frustumSize * aspect) / 2,
      (frustumSize * aspect) / 2,
      frustumSize / 2,
      -frustumSize / 2,
      0.1,
      500
    );
    orthoCamera.position.set(22, 16, 28);
    orthoCameraRef.current = orthoCamera;

    // 3. RENDERER
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
    renderer.toneMappingExposure = 1.15;
    rendererRef.current = renderer;

    // 4. CONTROLS
    const controls = new OrbitControls(perspCamera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI / 2 + 0.05; // allow slightly below horizon
    controls.target.set(project.geometry.width.value / 2, project.geometry.height.value / 3, project.geometry.length.value / 2);
    controls.update();
    controlsRef.current = controls;

    // 5. LIGHTING RIG
    // Key Sun Light
    const dirLight = new THREE.DirectionalLight(0xF2F8FA, 2.2);
    dirLight.position.set(30, 45, 25);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 2048;
    dirLight.shadow.mapSize.height = 2048;
    dirLight.shadow.camera.near = 0.5;
    dirLight.shadow.camera.far = 150;
    const d = 35;
    dirLight.shadow.camera.left = -d;
    dirLight.shadow.camera.right = d;
    dirLight.shadow.camera.top = d;
    dirLight.shadow.camera.bottom = -d;
    dirLight.shadow.bias = -0.0003;
    scene.add(dirLight);

    // Blue Holographic Rim Light
    const rimLight = new THREE.DirectionalLight(0x00E5FF, 1.4);
    rimLight.position.set(-25, 20, -25);
    scene.add(rimLight);

    // Ambient Specular Fill
    const hemiLight = new THREE.HemisphereLight(0x112233, 0x020307, 1.0);
    scene.add(hemiLight);

    // 6. ANIMATION LOOP
    const animate = () => {
      reqIdRef.current = requestAnimationFrame(animate);
      const activeCam = isOrthographic ? orthoCameraRef.current! : perspCameraRef.current!;
      controls.update();
      renderer.render(scene, activeCam);
    };
    animate();

    // 7. RESIZE LISTENER
    const handleResize = () => {
      if (!containerRef.current || !rendererRef.current) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;
      const asp = w / h;

      if (perspCameraRef.current) {
        perspCameraRef.current.aspect = asp;
        perspCameraRef.current.updateProjectionMatrix();
      }
      if (orthoCameraRef.current) {
        orthoCameraRef.current.left = (-frustumSize * asp) / 2;
        orthoCameraRef.current.right = (frustumSize * asp) / 2;
        orthoCameraRef.current.top = frustumSize / 2;
        orthoCameraRef.current.bottom = -frustumSize / 2;
        orthoCameraRef.current.updateProjectionMatrix();
      }
      rendererRef.current.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(reqIdRef.current);
      renderer.dispose();
    };
  }, []);

  // Re-build 3D Model whenever project or layer state changes
  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;

    // Clear previous model objects (keep lights)
    const toRemove: THREE.Object3D[] = [];
    scene.traverse((child) => {
      if (child !== scene && !child.isLight) {
        toRemove.push(child);
      }
    });
    toRemove.forEach((obj) => scene.remove(obj));
    interactiveObjectsRef.current.clear();

    const rootGroup = new THREE.Group();
    rootGroup.name = 'DST_ROOT_GROUP';

    const spanM = project.geometry.width.value;
    const lengthM = project.geometry.length.value;
    const heightM = project.geometry.height.value;

    // ==========================================
    // 1. REFLECTIVE GROUND & SPATIAL CAD GRID
    // ==========================================
    if (showSpatialGrid) {
      // Ground Mirror Plane
      const groundGeo = new THREE.PlaneGeometry(100, 100);
      const groundMat = new THREE.MeshStandardMaterial({
        color: 0x03070A,
        metalness: 0.85,
        roughness: 0.35
      });
      const groundMesh = new THREE.Mesh(groundGeo, groundMat);
      groundMesh.rotation.x = -Math.PI / 2;
      groundMesh.position.y = -0.55;
      groundMesh.receiveShadow = true;
      rootGroup.add(groundMesh);

      // Technical 1m & 5m Grid
      const gridHelper = new THREE.GridHelper(80, 80, 0x00E5FF, 0x0D2433);
      gridHelper.position.y = -0.54;
      rootGroup.add(gridHelper);

      // Axis Origin Triad
      const originTriad = new THREE.AxesHelper(3.0);
      originTriad.position.set(0, 0, 0);
      rootGroup.add(originTriad);

      // Axis Labels (A, B / 1, 2, 3...)
      if (project.geometry.grid) {
        const gridX = project.geometry.grid.axesX;
        const gridY = project.geometry.grid.axesY;

        // Draw Axis Lines in X & Y
        gridY.forEach((axisName, yIdx) => {
          const zPos = (yIdx / (gridY.length - 1)) * lengthM;
          const axisLineGeo = new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3(-4, 0, zPos),
            new THREE.Vector3(spanM + 4, 0, zPos)
          ]);
          const axisLine = new THREE.Line(axisLineGeo, new THREE.LineDashedMaterial({
            color: 0x4CC9FF,
            dashSize: 0.6,
            gapSize: 0.3,
            transparent: true,
            opacity: 0.45
          }));
          axisLine.computeLineDistances();
          rootGroup.add(axisLine);
        });
      }
    }

    // ==========================================
    // 2. FOUNDATIONS & PEDESTALS
    // ==========================================
    if (project.foundation && (activeMode === 'ALL' || activeMode === 'FOUNDATION' || activeMode === 'COLUMNS')) {
      project.foundation.elements.forEach((fElem) => {
        const isSelected = selectedElementId === fElem.id;
        const isModeFocus = activeMode === 'FOUNDATION';

        const fGroup = new THREE.Group();
        fGroup.position.set(fElem.position.x, fElem.position.y, fElem.position.z);
        fGroup.userData = { id: fElem.id, type: 'FOUNDATION' };

        // Spread Footing (Zapata Aislada)
        const fw = fElem.width.value;
        const fl = fElem.length.value;
        const fd = fElem.depth.value;

        const footingGeo = new THREE.BoxGeometry(fw, fd, fl);
        const footingMat = MaterialEngine.getMaterial('CONCRETE_FC250', {
          highlighted: isSelected,
          opacity: isModeFocus ? 1.0 : 0.85
        });
        const footingMesh = new THREE.Mesh(footingGeo, footingMat);
        footingMesh.position.y = -fd / 2;
        footingMesh.castShadow = true;
        footingMesh.receiveShadow = true;
        fGroup.add(footingMesh);

        // Pedestal (Dado de Concreto)
        const pedW = 0.45;
        const pedH = 0.35;
        const pedGeo = new THREE.BoxGeometry(pedW, pedH, pedW);
        const pedMat = MaterialEngine.getMaterial('CONCRETE_FC250', { highlighted: isSelected });
        const pedMesh = new THREE.Mesh(pedGeo, pedMat);
        pedMesh.position.y = pedH / 2;
        pedMesh.castShadow = true;
        fGroup.add(pedMesh);

        // Grout leveling bed (25mm)
        const groutGeo = new THREE.BoxGeometry(0.38, 0.025, 0.38);
        const groutMat = MaterialEngine.getMaterial('GROUT_NON_SHRINK');
        const groutMesh = new THREE.Mesh(groutGeo, groutMat);
        groutMesh.position.y = pedH + 0.0125;
        fGroup.add(groutMesh);

        // Base Plate (Placa Base A36)
        if (fElem.basePlate) {
          const bpW = fElem.basePlate.width.value;
          const bpH = fElem.basePlate.thickness.value;
          const bpGeo = new THREE.BoxGeometry(bpW, bpH, bpW);
          const bpMat = MaterialEngine.getMaterial('STEEL_A36', { highlighted: isSelected });
          const bpMesh = new THREE.Mesh(bpGeo, bpMat);
          bpMesh.position.y = pedH + 0.025 + bpH / 2;
          bpMesh.castShadow = true;
          fGroup.add(bpMesh);
        }

        // 4 Anchor Bolts F1554 (Heavy hex nuts + washers)
        const boltOffset = 0.12;
        const boltH = 0.12;
        const boltGeo = new THREE.CylinderGeometry(0.012, 0.012, boltH, 12);
        const boltMat = MaterialEngine.getMaterial('ANCHOR_BOLT_F1554');

        const nutGeo = new THREE.CylinderGeometry(0.022, 0.022, 0.018, 6); // hexagonal nut

        [-boltOffset, boltOffset].forEach((bx) => {
          [-boltOffset, boltOffset].forEach((bz) => {
            const boltMesh = new THREE.Mesh(boltGeo, boltMat);
            boltMesh.position.set(bx, pedH + 0.025 + boltH / 2, bz);
            fGroup.add(boltMesh);

            const nutMesh = new THREE.Mesh(nutGeo, boltMat);
            nutMesh.position.set(bx, pedH + 0.025 + 0.03, bz);
            fGroup.add(nutMesh);
          });
        });

        rootGroup.add(fGroup);
        interactiveObjectsRef.current.set(fElem.id, fGroup);
      });
    }

    // ==========================================
    // 3. STRUCTURAL MEMBERS (COLUMNS, CHORDS, WEBS, PURLINS)
    // ==========================================
    if (showPBRSolid) {
      project.members.forEach((member) => {
        // Filter by active mode
        if (activeMode === 'COLUMNS' && member.role !== 'COLUMN') return;
        if (activeMode === 'ROOF' && member.role === 'COLUMN') return;

        const isSelected = selectedElementId === member.id;
        const memberGroup = createMemberMesh(member, graph, {
          isSelected,
          activeMode
        });

        if (memberGroup) {
          rootGroup.add(memberGroup);
          interactiveObjectsRef.current.set(member.id, memberGroup);
        }
      });
    }

    // ==========================================
    // 4. STRUCTURAL GRAPH ANALYTICAL OVERLAY
    // ==========================================
    if (showStructuralGraph) {
      const graphOverlayGroup = new THREE.Group();
      graphOverlayGroup.name = 'STRUCTURAL_GRAPH_OVERLAY';

      // Graph Nodes (Glowing Spheres at Joints)
      const nodeGeo = new THREE.SphereGeometry(0.065, 16, 16);
      const nodeMatNormal = new THREE.MeshBasicMaterial({ color: 0x00E5FF });
      const nodeMatSelected = new THREE.MeshBasicMaterial({ color: 0xFF0055 });
      const nodeMatSupport = new THREE.MeshBasicMaterial({ color: 0x39E58C });

      for (const [nodeId, node] of graph.nodes.entries()) {
        const isSelected = selectedElementId === nodeId;
        const isSupport = node.type === 'SUPPORT' || node.type === 'COLUMN_BASE';

        const nodeMesh = new THREE.Mesh(nodeGeo, isSelected ? nodeMatSelected : isSupport ? nodeMatSupport : nodeMatNormal);
        nodeMesh.position.set(node.position.x, node.position.y, node.position.z);
        nodeMesh.userData = { id: nodeId, type: 'NODE' };

        graphOverlayGroup.add(nodeMesh);
        interactiveObjectsRef.current.set(nodeId, nodeMesh);
      }

      // Graph Centerline Members (Thin Cyan Lines)
      const linePositions: number[] = [];
      for (const member of graph.members.values()) {
        const s = graph.nodes.get(member.startNode);
        const e = graph.nodes.get(member.endNode);
        if (s && e) {
          linePositions.push(s.position.x, s.position.y, s.position.z);
          linePositions.push(e.position.x, e.position.y, e.position.z);
        }
      }

      const lineGeo = new THREE.BufferGeometry();
      lineGeo.setAttribute('position', new THREE.Float32BufferAttribute(linePositions, 3));
      const lineMat = new THREE.LineBasicMaterial({
        color: 0x00E5FF,
        transparent: true,
        opacity: 0.75
      });
      const linesMesh = new THREE.LineSegments(lineGeo, lineMat);
      graphOverlayGroup.add(linesMesh);

      rootGroup.add(graphOverlayGroup);
    }

    // ==========================================
    // 5. 3D STRUCTURAL HUBS
    // ==========================================
    if (showStructuralHubs) {
      const hubsGroup = new THREE.Group();
      hubsGroup.name = 'STRUCTURAL_HUBS_GROUP';

      // Place Hubs at key strategic structural points: Column bases, Ridge apex, Eaves joints
      const hubLocations: { pos: THREE.Vector3; title: string; tag: string; type: string; id: string }[] = [];

      // Base Hubs
      const columnDefs = project.columns || project.structuralSystem?.columns?.columns || [];
      columnDefs.forEach((col: any) => {
        if (col.base) {
          hubLocations.push({
            pos: new THREE.Vector3(col.base.x ?? 0, col.base.y ?? 0, col.base.z ?? 0),
            title: `BASE ${col.id}`,
            tag: 'ANCHOR & BASE PLATE',
            type: 'CONNECTION',
            id: col.connectionBase || col.id
          });
        }
        if (col.top) {
          hubLocations.push({
            pos: new THREE.Vector3(col.top.x ?? 0, col.top.y ?? 0, col.top.z ?? 0),
            title: `EAVE JOINT ${col.id}`,
            tag: 'COL-TO-TRUSS MOMENT',
            type: 'CONNECTION',
            id: col.connectionTop || col.id
          });
        }
      });

      // Ridge Apex Hubs
      const roofRiseVal = project.roof?.trusses?.[0]?.rise?.value ?? 1.8;
      hubLocations.push({
        pos: new THREE.Vector3(spanM / 2, heightM + roofRiseVal, 0),
        title: 'RIDGE APEX TR-01',
        tag: 'CHORD SPLICE CJP',
        type: 'NODE',
        id: 'HUB-RIDGE-01'
      });

      hubLocations.forEach((hub) => {
        const isSelected = selectedElementId === hub.id;
        const ringGeo = new THREE.RingGeometry(0.18, 0.22, 32);
        const ringMat = new THREE.MeshBasicMaterial({
          color: isSelected ? 0xFF0055 : 0x00E5FF,
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.9
        });
        const ringMesh = new THREE.Mesh(ringGeo, ringMat);
        ringMesh.position.copy(hub.pos);
        ringMesh.position.y += 0.05;
        ringMesh.rotation.x = -Math.PI / 2;
        ringMesh.userData = { id: hub.id, type: hub.type };

        // Dash Leader Line upwards
        const leaderGeo = new THREE.BufferGeometry().setFromPoints([
          hub.pos,
          new THREE.Vector3(hub.pos.x, hub.pos.y + 0.75, hub.pos.z)
        ]);
        const leaderLine = new THREE.Line(leaderGeo, new THREE.LineBasicMaterial({
          color: isSelected ? 0xFF0055 : 0x4CC9FF,
          transparent: true,
          opacity: 0.8
        }));

        hubsGroup.add(ringMesh);
        hubsGroup.add(leaderLine);
        interactiveObjectsRef.current.set(hub.id, ringMesh);
      });

      rootGroup.add(hubsGroup);
    }

    // ==========================================
    // 6. 3D DIMENSION CALLOUTS
    // ==========================================
    if (showDimensions) {
      const dimGroup = new THREE.Group();
      dimGroup.name = 'DIMENSIONS_GROUP';

      // Width Dimension (Span)
      const spanLineGeo = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(0, -0.4, -2.5),
        new THREE.Vector3(spanM, -0.4, -2.5)
      ]);
      const spanLine = new THREE.Line(spanLineGeo, new THREE.LineBasicMaterial({ color: 0x4CC9FF }));
      dimGroup.add(spanLine);

      // Height Dimension (Eaves)
      const hLineGeo = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(-2.0, 0, 0),
        new THREE.Vector3(-2.0, heightM, 0)
      ]);
      const hLine = new THREE.Line(hLineGeo, new THREE.LineBasicMaterial({ color: 0x4CC9FF }));
      dimGroup.add(hLine);

      rootGroup.add(dimGroup);
    }

    scene.add(rootGroup);
  }, [
    project,
    graph,
    selectedElementId,
    showPBRSolid,
    showStructuralGraph,
    showMaterialProjection,
    showStructuralHubs,
    showDimensions,
    showSpatialGrid,
    activeMode
  ]);

  // Raycasting for Element Selection
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current || !sceneRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

    const raycaster = new THREE.Raycaster();
    const camera = isOrthographic ? orthoCameraRef.current! : perspCameraRef.current!;
    raycaster.setFromCamera(new THREE.Vector2(x, y), camera);

    const checkObjects: THREE.Object3D[] = [];
    interactiveObjectsRef.current.forEach((obj) => {
      checkObjects.push(obj);
      obj.traverse((child) => {
        if (child !== obj) checkObjects.push(child);
      });
    });

    const intersects = raycaster.intersectObjects(checkObjects, true);

    if (intersects.length > 0) {
      let hit = intersects[0].object;
      while (hit && !hit.userData?.id && hit.parent && hit.parent !== sceneRef.current) {
        hit = hit.parent;
      }
      if (hit && hit.userData?.id) {
        onSelectElement(hit.userData.id, hit.userData.type || 'MEMBER');
        return;
      }
    }

    onSelectElement(null, 'MEMBER');
  };

  // Camera Presets
  const setCameraView = (view: 'ISO' | 'TOP' | 'FRONT' | 'SIDE' | 'FIT') => {
    const camera = isOrthographic ? orthoCameraRef.current! : perspCameraRef.current!;
    const controls = controlsRef.current;
    if (!camera || !controls) return;

    const spanM = project.geometry.width.value;
    const lengthM = project.geometry.length.value;
    const heightM = project.geometry.height.value;
    const target = new THREE.Vector3(spanM / 2, heightM / 2, lengthM / 2);

    controls.target.copy(target);

    if (view === 'ISO') {
      camera.position.set(spanM * 1.5, heightM * 2.2, lengthM * 1.6);
    } else if (view === 'TOP') {
      camera.position.set(spanM / 2, heightM + 25, lengthM / 2);
    } else if (view === 'FRONT') {
      camera.position.set(spanM / 2, heightM / 2, -25);
    } else if (view === 'SIDE') {
      camera.position.set(-25, heightM / 2, lengthM / 2);
    } else if (view === 'FIT') {
      camera.position.set(spanM * 1.3, heightM * 1.8, lengthM * 1.4);
    }

    camera.lookAt(target);
    controls.update();
  };

  return (
    <div ref={containerRef} className="relative w-full h-full bg-[#020307] overflow-hidden select-none">
      {/* 3D Canvas */}
      <canvas
        ref={canvasRef}
        onClick={handleCanvasClick}
        className="w-full h-full block cursor-crosshair"
      />

      {/* Floating 3D HUD: Top-Left Viewport Mode & Layer Controls */}
      <div className="absolute top-4 left-4 flex flex-col gap-2 z-20">
        {/* Layer Toggles Pill */}
        <div className="flex items-center gap-1.5 p-1 bg-[#0A1119]/90 border border-[#00E5FF]/30 backdrop-blur-md text-[11px] font-orbitron">
          <button
            onClick={() => setShowPBRSolid(!showPBRSolid)}
            className={`px-2.5 py-1 flex items-center gap-1.5 transition-all ${
              showPBRSolid ? 'bg-[#00E5FF] text-black font-bold' : 'text-[#8A949D] hover:text-[#00E5FF]'
            }`}
            title="Toggle PBR Solid Rendering"
          >
            <Box size={13} />
            <span>PBR MODEL</span>
          </button>
          <button
            onClick={() => setShowStructuralGraph(!showStructuralGraph)}
            className={`px-2.5 py-1 flex items-center gap-1.5 transition-all ${
              showStructuralGraph ? 'bg-[#00A8FF] text-black font-bold' : 'text-[#8A949D] hover:text-[#00E5FF]'
            }`}
            title="Toggle Structural Graph Overlay"
          >
            <Layers size={13} />
            <span>GRAPH</span>
          </button>
          <button
            onClick={() => setShowStructuralHubs(!showStructuralHubs)}
            className={`px-2.5 py-1 flex items-center gap-1.5 transition-all ${
              showStructuralHubs ? 'bg-[#00E5FF] text-black font-bold' : 'text-[#8A949D] hover:text-[#00E5FF]'
            }`}
            title="Toggle Structural Hubs"
          >
            <Cpu size={13} />
            <span>HUBS</span>
          </button>
          <button
            onClick={() => setShowDimensions(!showDimensions)}
            className={`px-2.5 py-1 flex items-center gap-1.5 transition-all ${
              showDimensions ? 'bg-[#4CC9FF] text-black font-bold' : 'text-[#8A949D] hover:text-[#00E5FF]'
            }`}
            title="Toggle 3D Dimensions"
          >
            <Target size={13} />
            <span>COTAS</span>
          </button>
          <button
            onClick={() => setShowSpatialGrid(!showSpatialGrid)}
            className={`px-2.5 py-1 flex items-center gap-1.5 transition-all ${
              showSpatialGrid ? 'bg-[#00E5FF] text-black font-bold' : 'text-[#8A949D] hover:text-[#00E5FF]'
            }`}
            title="Toggle Ground Grid"
          >
            <Grid size={13} />
            <span>GRID</span>
          </button>
        </div>

        {/* Camera Projection & Presets */}
        <div className="flex items-center gap-1.5 p-1 bg-[#0A1119]/80 border border-[#0D1620] backdrop-blur-md text-[10px] font-orbitron">
          <button
            onClick={() => setIsOrthographic(!isOrthographic)}
            className={`px-2 py-0.5 border ${
              isOrthographic ? 'border-[#00E5FF] text-[#00E5FF]' : 'border-transparent text-[#8A949D]'
            }`}
          >
            {isOrthographic ? 'ORTHO' : 'PERSP'}
          </button>
          <div className="w-px h-3.5 bg-[#111C27]" />
          <button onClick={() => setCameraView('ISO')} className="px-2 py-0.5 text-[#8A949D] hover:text-[#00E5FF]">ISO</button>
          <button onClick={() => setCameraView('TOP')} className="px-2 py-0.5 text-[#8A949D] hover:text-[#00E5FF]">PLAN</button>
          <button onClick={() => setCameraView('FRONT')} className="px-2 py-0.5 text-[#8A949D] hover:text-[#00E5FF]">ELEV</button>
          <button onClick={() => setCameraView('SIDE')} className="px-2 py-0.5 text-[#8A949D] hover:text-[#00E5FF]">LAT</button>
          <button onClick={() => setCameraView('FIT')} className="px-2 py-0.5 text-[#00E5FF] hover:bg-[#00E5FF]/20 flex items-center gap-1">
            <Maximize2 size={10} />
            <span>FIT</span>
          </button>
        </div>
      </div>

      {/* Floating 3D HUD: Bottom-Left Spatial Coordinates Readout */}
      <div className="absolute bottom-4 left-4 p-2 bg-[#0A1119]/90 border border-[#00E5FF]/20 backdrop-blur-md text-[10px] font-mono-tech text-[#8A949D] flex items-center gap-4 z-20">
        <div>
          <span className="text-[#00E5FF] font-bold font-orbitron">DST STATUS: </span>
          <span className="text-[#39E58C]">PHYSICAL SYNC VALIDATED</span>
        </div>
        <div>
          <span className="text-[#8A949D]">DIM: </span>
          <span className="text-[#F2F7F7]">{project.geometry.width.value}m × {project.geometry.length.value}m × {project.geometry.height.value}m</span>
        </div>
        <div>
          <span className="text-[#8A949D]">GRAPH NODES: </span>
          <span className="text-[#00E5FF]">{graph.nodes.size}</span>
        </div>
        <div>
          <span className="text-[#8A949D]">MEMBERS: </span>
          <span className="text-[#00E5FF]">{graph.members.size}</span>
        </div>
      </div>
    </div>
  );
};
