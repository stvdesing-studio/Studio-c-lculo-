// ============================================================
// STV CLOSER — SCREEN 02 3D VIEWPORT (CYBER-BLUEPRINT)
// Screen2Viewport3D.tsx
// Three.js Wireframe & Volumetric Rendering of Parametric Truss with
// Dimensions, Load Vectors, Node Highlights, and Joint Breakdowns
// ============================================================

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GeneratedTrussStructure } from '../../../dst/parametric-truss-engine';
import { StructuralNode, StructuralMember } from '../../../dst/dst.schema';

interface Screen2Viewport3DProps {
  trussData: GeneratedTrussStructure;
  spanM: number;
  riseM: number;
  depthM: number;
  panelCount: number;
  showLoads?: boolean;
  showDimensions?: boolean;
  showNodes?: boolean;
  showJointCallouts?: boolean;
  selectedElementId?: string | null;
  onSelectElement?: (id: string, type: 'MEMBER' | 'NODE') => void;
}

export const Screen2Viewport3D: React.FC<Screen2Viewport3DProps> = ({
  trussData,
  spanM,
  riseM,
  depthM,
  panelCount,
  showLoads = true,
  showDimensions = true,
  showNodes = true,
  showJointCallouts = true,
  selectedElementId,
  onSelectElement
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [hoveredInfo, setHoveredInfo] = useState<{ id: string; role: string; length?: number } | null>(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // 1. Three.js Scene, Camera, Renderer
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x020307);
    scene.fog = new THREE.FogExp2(0x020307, 0.025);

    const width = container.clientWidth;
    const height = container.clientHeight;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(spanM * 0.5, (depthM || riseM) * 1.5, spanM * 1.1);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    container.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.target.set(spanM * 0.5, (depthM || riseM) * 0.5, 0);
    controls.maxPolarAngle = Math.PI / 2 + 0.05; // allow slight under-view

    // 2. Cyber Blueprint Lighting
    const ambientLight = new THREE.AmbientLight(0x0a2233, 2.5);
    scene.add(ambientLight);

    const cyanDirLight = new THREE.DirectionalLight(0x00e5ff, 2.0);
    cyanDirLight.position.set(20, 40, 20);
    scene.add(cyanDirLight);

    const goldDirLight = new THREE.DirectionalLight(0xffd600, 1.2);
    goldDirLight.position.set(-20, 20, -20);
    scene.add(goldDirLight);

    // 3. Grid & Ground Plane
    const gridHelper = new THREE.GridHelper(Math.max(40, spanM * 2), 40, 0x00e5ff, 0x0b1f33);
    gridHelper.position.y = -0.05;
    scene.add(gridHelper);

    // Group for all dynamic truss objects
    const trussGroup = new THREE.Group();
    scene.add(trussGroup);

    // Material definitions
    const topChordMat = new THREE.MeshStandardMaterial({
      color: 0x00e5ff,
      emissive: 0x004466,
      roughness: 0.3,
      metalness: 0.8
    });

    const bottomChordMat = new THREE.MeshStandardMaterial({
      color: 0x00b4d8,
      emissive: 0x003355,
      roughness: 0.3,
      metalness: 0.8
    });

    const diagonalMat = new THREE.MeshStandardMaterial({
      color: 0xffd600,
      emissive: 0x554400,
      roughness: 0.4,
      metalness: 0.7
    });

    const verticalMat = new THREE.MeshStandardMaterial({
      color: 0xff9100,
      emissive: 0x552200,
      roughness: 0.4,
      metalness: 0.7
    });

    const nodeMat = new THREE.MeshStandardMaterial({
      color: 0x00e5ff,
      emissive: 0x00ffee,
      roughness: 0.1,
      metalness: 0.9
    });

    const supportNodeMat = new THREE.MeshStandardMaterial({
      color: 0xff3366,
      emissive: 0x660022,
      roughness: 0.2,
      metalness: 0.8
    });

    // Create node mesh lookup
    const nodePositionMap = new Map<string, THREE.Vector3>();
    trussData.nodes.forEach((n: any) => {
      const px = n.position?.x ?? n.coordinates?.x ?? 0;
      const py = n.position?.y ?? n.coordinates?.y ?? 0;
      const pz = n.position?.z ?? n.coordinates?.z ?? 0;
      const pos = new THREE.Vector3(px, py, pz);
      nodePositionMap.set(n.id, pos);

      if (showNodes) {
        const isSupport = n.type === 'SUPPORT';
        const geo = new THREE.SphereGeometry(isSupport ? 0.12 : 0.08, 16, 16);
        const mesh = new THREE.Mesh(geo, isSupport ? supportNodeMat : nodeMat);
        mesh.position.copy(pos);
        mesh.userData = { id: n.id, type: 'NODE', role: n.structuralRole || n.type };
        trussGroup.add(mesh);
      }
    });

    // Render Members as 3D Cylinders / Tubes
    const allMembers: StructuralMember[] = [
      ...trussData.topChords,
      ...trussData.bottomChords,
      ...trussData.webMembers
    ];

    allMembers.forEach((m) => {
      const start = nodePositionMap.get(m.startNode);
      const end = nodePositionMap.get(m.endNode);
      if (!start || !end) return;

      const dir = new THREE.Vector3().subVectors(end, start);
      const len = dir.length();
      if (len < 0.001) return;

      const radius = m.role === 'TOP_CHORD' || m.role === 'BOTTOM_CHORD' ? 0.045 : 0.03;
      const geo = new THREE.CylinderGeometry(radius, radius, len, 8);
      geo.translate(0, len / 2, 0);
      geo.rotateX(Math.PI / 2);

      let mat = diagonalMat;
      if (m.role === 'TOP_CHORD') mat = topChordMat;
      else if (m.role === 'BOTTOM_CHORD') mat = bottomChordMat;
      else if (m.role === 'VERTICAL') mat = verticalMat;

      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.copy(start);
      mesh.lookAt(end);
      mesh.userData = { id: m.id, type: 'MEMBER', role: m.role, length: len };
      trussGroup.add(mesh);
    });

    // Render Dimension Lines & Callouts
    if (showDimensions) {
      const dimMat = new THREE.LineBasicMaterial({ color: 0x00e5ff, transparent: true, opacity: 0.8 });

      // Span dimension line under bottom chord
      const dimY = -0.4;
      const spanLineGeo = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(0, dimY, 0),
        new THREE.Vector3(spanM, dimY, 0)
      ]);
      const spanLine = new THREE.Line(spanLineGeo, dimMat);
      trussGroup.add(spanLine);

      // Ticks
      const tick1 = new THREE.Line(
        new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0, dimY - 0.1, 0), new THREE.Vector3(0, dimY + 0.1, 0)]),
        dimMat
      );
      const tick2 = new THREE.Line(
        new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(spanM, dimY - 0.1, 0), new THREE.Vector3(spanM, dimY + 0.1, 0)]),
        dimMat
      );
      trussGroup.add(tick1);
      trussGroup.add(tick2);

      // Rise / Depth vertical dimension on side
      const dimX = spanM + 0.5;
      const maxH = Math.max(riseM, depthM);
      const riseLineGeo = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(dimX, 0, 0),
        new THREE.Vector3(dimX, maxH, 0)
      ]);
      const riseLine = new THREE.Line(riseLineGeo, dimMat);
      trussGroup.add(riseLine);
    }

    // Render ASCE 7 Load Vector Arrows (Dead Load + Wind)
    if (showLoads) {
      trussData.topChords.forEach((m, idx) => {
        const start = nodePositionMap.get(m.startNode);
        if (start && idx % 2 === 0) {
          // Gravitational Dead Load Vector (Red/Orange down arrow)
          const arrowDir = new THREE.Vector3(0, -1, 0);
          const arrowPos = new THREE.Vector3(start.x, start.y + 0.6, start.z);
          const arrowHelper = new THREE.ArrowHelper(arrowDir, arrowPos, 0.5, 0xff3366, 0.15, 0.08);
          trussGroup.add(arrowHelper);
        }
      });
    }

    // Raycaster for Hover & Selection
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const handlePointerMove = (e: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(trussGroup.children);

      if (intersects.length > 0) {
        const hit = intersects[0].object;
        if (hit.userData?.id) {
          setHoveredInfo({
            id: hit.userData.id,
            role: hit.userData.role || hit.userData.type,
            length: hit.userData.length
          });
          return;
        }
      }
      setHoveredInfo(null);
    };

    const handleClick = () => {
      if (hoveredInfo && onSelectElement) {
        onSelectElement(hoveredInfo.id, hoveredInfo.role.includes('CHORD') || hoveredInfo.role.includes('DIAGONAL') ? 'MEMBER' : 'NODE');
      }
    };

    renderer.domElement.addEventListener('mousemove', handlePointerMove);
    renderer.domElement.addEventListener('click', handleClick);

    // Animation Loop
    let reqId: number;
    const animate = () => {
      reqId = requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    // Resize Handler
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      renderer.domElement.removeEventListener('mousemove', handlePointerMove);
      renderer.domElement.removeEventListener('click', handleClick);
      cancelAnimationFrame(reqId);
      if (renderer.domElement.parentNode) {
        renderer.domElement.parentNode.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [trussData, spanM, riseM, depthM, panelCount, showLoads, showDimensions, showNodes]);

  return (
    <div className="relative w-full h-full bg-[#020307] overflow-hidden select-none">
      {/* Three.js Render Target */}
      <div ref={mountRef} className="w-full h-full" />

      {/* Floating Blueprint HUD Callouts */}
      <div className="absolute top-4 left-4 z-20 pointer-events-none flex flex-col gap-1.5 font-mono-tech text-[10px]">
        <div className="px-2.5 py-1 bg-[#030911]/85 border border-[#00E5FF]/40 rounded backdrop-blur-md flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#00E5FF] shadow-[0_0_8px_#00E5FF]" />
          <span className="font-orbitron text-white tracking-wider">3D STRUCTURAL GRAPH</span>
          <span className="text-[#8A949D]">|</span>
          <span className="text-[#FFD600] font-bold">L = {spanM.toFixed(2)}m</span>
          <span className="text-[#00E5FF]">H = {(riseM || depthM).toFixed(2)}m</span>
        </div>

        {hoveredInfo && (
          <div className="px-2.5 py-1.5 bg-[#03080E]/95 border border-[#FFD600] rounded text-[#FFD600] flex flex-col gap-0.5 shadow-[0_0_15px_rgba(255,214,0,0.3)]">
            <div className="font-orbitron font-bold text-xs">{hoveredInfo.id}</div>
            <div className="text-[9px] text-[#F2F7F7]">ROL: {hoveredInfo.role}</div>
            {hoveredInfo.length && (
              <div className="text-[8px] text-[#00E5FF]">LONGITUD: {hoveredInfo.length.toFixed(3)} m</div>
            )}
          </div>
        )}
      </div>

      {/* Floating Coordinate Origin Badge */}
      <div className="absolute bottom-4 right-4 z-20 pointer-events-none flex items-center gap-2 text-[9px] font-mono-tech text-[#8A949D] bg-[#030911]/80 border border-[#00E5FF]/20 px-2 py-1 rounded">
        <span>X: [0.00 → {spanM.toFixed(2)}m]</span>
        <span>Y: [0.00 → {(riseM || depthM).toFixed(2)}m]</span>
        <span>Z: 0.00m (PLANAR)</span>
      </div>
    </div>
  );
};
