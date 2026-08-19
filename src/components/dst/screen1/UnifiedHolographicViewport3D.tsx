// ============================================================
// STV CLOSER — UNIFIED 3D HOLOGRAPHIC STRUCTURAL TWIN VIEWPORT
// UnifiedHolographicViewport3D.tsx
// Renders Full Columns + Truss + Purlins + Base Plates + Stress Heatmap
// ============================================================

import React, { useRef, useEffect, useState, useMemo } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import {
  RotateCw,
  Eye,
  Layers,
  ZoomIn,
  ZoomOut,
  Crosshair,
  Sparkles,
  Maximize2,
  Cpu,
  Flame
} from 'lucide-react';
import { TrussType, SectionProfile } from '../../../dst/dst.schema';
import { GlobalIntegrityReport } from '../../../dst/structural-solver-engine';

interface UnifiedHolographicViewport3DProps {
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
  columnInclinationDeg?: number;
  integrityReport?: GlobalIntegrityReport;
  activeCategory?: string;
  onSelectNodeOrMember?: (id: string, name: string) => void;
}

export const UnifiedHolographicViewport3D: React.FC<UnifiedHolographicViewport3DProps> = ({
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
  columnInclinationDeg = 0,
  integrityReport,
  activeCategory,
  onSelectNodeOrMember
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const modelGroupRef = useRef<THREE.Group | null>(null);

  const [isExploded, setIsExploded] = useState(false);
  const [isStressMode, setIsStressMode] = useState(true);
  const [isWireframe, setIsWireframe] = useState(false);
  const [isAutoRotate, setIsAutoRotate] = useState(false);

  // Initialize Three.js WebGL Scene
  useEffect(() => {
    if (!containerRef.current) return;

    const width = containerRef.current.clientWidth || 800;
    const height = containerRef.current.clientHeight || 600;

    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color(0x020408);
    scene.fog = new THREE.FogExp2(0x020408, 0.015);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    cameraRef.current = camera;
    camera.position.set(spanM * 1.5, heightM * 1.4, lengthM * 1.6);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    rendererRef.current = renderer;
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.3;
    containerRef.current.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controlsRef.current = controls;
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.target.set(0, heightM * 0.6, 0);

    // Subtle Cyan Holographic Grid
    const grid = new THREE.GridHelper(Math.max(spanM, lengthM) * 3, 30, 0x00e5ff, 0x003344);
    grid.position.y = -0.01;
    (grid.material as THREE.Material).opacity = 0.25;
    (grid.material as THREE.Material).transparent = true;
    scene.add(grid);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0x0a2540, 2.5);
    scene.add(ambientLight);

    const cyanPointLight = new THREE.PointLight(0x00e5ff, 3.5, 100);
    cyanPointLight.position.set(0, heightM + 5, 0);
    scene.add(cyanPointLight);

    const goldPointLight = new THREE.PointLight(0xffd700, 2.0, 80);
    goldPointLight.position.set(-spanM, heightM * 0.5, lengthM * 0.5);
    scene.add(goldPointLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1.2);
    dirLight.position.set(20, 40, 20);
    scene.add(dirLight);

    // Structural Model Group
    const modelGroup = new THREE.Group();
    modelGroupRef.current = modelGroup;
    scene.add(modelGroup);

    // Animation Loop
    let animId: number;
    const animate = () => {
      animId = requestAnimationFrame(animate);
      if (controlsRef.current) {
        controlsRef.current.autoRotate = isAutoRotate;
        controlsRef.current.autoRotateSpeed = 0.8;
        controlsRef.current.update();
      }
      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (!containerRef.current || !renderer || !camera) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      if (containerRef.current && renderer.domElement) {
        containerRef.current.removeChild(renderer.domElement);
      }
    };
  }, []);

  // Update OrbitControls target when height changes
  useEffect(() => {
    if (controlsRef.current) {
      controlsRef.current.target.set(0, heightM * 0.5, 0);
    }
  }, [heightM]);

  // RECONSTRUCT 3D TWIN WHEN GEOMETRY CHANGES
  useEffect(() => {
    if (!modelGroupRef.current) return;
    const group = modelGroupRef.current;
    
    // Clear old geometry
    while (group.children.length > 0) {
      const obj = group.children[0];
      group.remove(obj);
      if ((obj as any).geometry) (obj as any).geometry.dispose();
    }

    const explodeFactor = isExploded ? 1.8 : 1.0;
    const dcRatio = integrityReport?.maxDcRatio ?? 0.85;

    // Materials definition
    const colColor = isStressMode
      ? dcRatio > 1.0
        ? 0xff3b30
        : dcRatio > 0.85
        ? 0xffd700
        : 0x00e5ff
      : 0x00e5ff;

    const chordColor = isStressMode
      ? dcRatio > 1.0
        ? 0xff3b30
        : 0x00e5ff
      : 0x00e5ff;

    const steelMat = new THREE.MeshStandardMaterial({
      color: colColor,
      metalness: 0.85,
      roughness: 0.25,
      wireframe: isWireframe,
      emissive: new THREE.Color(colColor),
      emissiveIntensity: 0.25
    });

    const chordMat = new THREE.MeshStandardMaterial({
      color: chordColor,
      metalness: 0.8,
      roughness: 0.3,
      wireframe: isWireframe,
      emissive: new THREE.Color(chordColor),
      emissiveIntensity: 0.2
    });

    const webMat = new THREE.MeshStandardMaterial({
      color: 0x00b4d8,
      metalness: 0.7,
      roughness: 0.35,
      wireframe: isWireframe,
      emissive: new THREE.Color(0x00b4d8),
      emissiveIntensity: 0.15
    });

    const purlinMat = new THREE.MeshStandardMaterial({
      color: 0x39e58c,
      metalness: 0.6,
      roughness: 0.4,
      wireframe: isWireframe,
      emissive: new THREE.Color(0x39e58c),
      emissiveIntensity: 0.2
    });

    const concreteMat = new THREE.MeshStandardMaterial({
      color: 0x4a5568,
      metalness: 0.1,
      roughness: 0.9,
      transparent: true,
      opacity: 0.75
    });

    const plateMat = new THREE.MeshStandardMaterial({
      color: 0xffd700,
      metalness: 0.9,
      roughness: 0.2,
      emissive: new THREE.Color(0xffd700),
      emissiveIntensity: 0.3
    });

    const halfSpan = spanM / 2;
    const halfLength = lengthM / 2;
    const frameSpacing = lengthM / Math.max(1, framesCount - 1);
    const radInc = (columnInclinationDeg * Math.PI) / 180;

    // Helper to create member box
    const createBeamMesh = (
      p1: THREE.Vector3,
      p2: THREE.Vector3,
      size: number,
      mat: THREE.Material
    ) => {
      const dir = new THREE.Vector3().subVectors(p2, p1);
      const len = dir.length();
      if (len <= 0.001) return;
      const geom = new THREE.BoxGeometry(size, len, size);
      const mesh = new THREE.Mesh(geom, mat);
      mesh.position.copy(p1).addScaledVector(dir, 0.5);
      mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.clone().normalize());
      group.add(mesh);
    };

    // GENERATE ALL FRAMES
    for (let f = 0; f < framesCount; f++) {
      const zPos = -halfLength + f * frameSpacing;
      const zExploded = zPos * (isExploded ? 1.3 : 1.0);

      // 1. Column Positions (Left & Right)
      const baseLeftX = -halfSpan;
      const baseRightX = halfSpan;
      const topLeftX = -halfSpan + heightM * Math.tan(radInc);
      const topRightX = halfSpan - heightM * Math.tan(radInc);

      const baseLeft = new THREE.Vector3(baseLeftX, 0, zExploded);
      const baseRight = new THREE.Vector3(baseRightX, 0, zExploded);
      const topLeft = new THREE.Vector3(topLeftX, heightM, zExploded);
      const topRight = new THREE.Vector3(topRightX, heightM, zExploded);

      // COLUMNS
      createBeamMesh(baseLeft, topLeft, 0.18, steelMat);
      createBeamMesh(baseRight, topRight, 0.18, steelMat);

      // BASE PLATES & PEDESTALS
      const plateGeom = new THREE.BoxGeometry(0.42, 0.03, 0.42);
      const plateL = new THREE.Mesh(plateGeom, plateMat);
      plateL.position.set(baseLeftX, (isExploded ? -0.3 : 0.015), zExploded);
      group.add(plateL);

      const plateR = new THREE.Mesh(plateGeom, plateMat);
      plateR.position.set(baseRightX, (isExploded ? -0.3 : 0.015), zExploded);
      group.add(plateR);

      const pedestalGeom = new THREE.BoxGeometry(0.60, 0.60, 0.60);
      const pedL = new THREE.Mesh(pedestalGeom, concreteMat);
      pedL.position.set(baseLeftX, -0.35 * explodeFactor, zExploded);
      group.add(pedL);

      const pedR = new THREE.Mesh(pedestalGeom, concreteMat);
      pedR.position.set(baseRightX, -0.35 * explodeFactor, zExploded);
      group.add(pedR);

      // 2. TRUSS SYSTEM
      const panelCount = 8;
      const trussApexY = heightM + roofRiseM;
      const trussApex = new THREE.Vector3(0, trussApexY, zExploded);

      // Bottom Chord (Tension tie)
      const bottomChordL = new THREE.Vector3(topLeftX, heightM, zExploded);
      const bottomChordR = new THREE.Vector3(topRightX, heightM, zExploded);
      createBeamMesh(bottomChordL, bottomChordR, 0.12, chordMat);

      // Top Chords (Gable Left & Right)
      createBeamMesh(topLeft, trussApex, 0.14, chordMat);
      createBeamMesh(topRight, trussApex, 0.14, chordMat);

      // Web Members (Warren / Pratt V-Diagonals)
      for (let p = 1; p < panelCount; p++) {
        const ratio = p / panelCount;
        const xBottom = topLeftX + (topRightX - topLeftX) * ratio;
        const ptBottom = new THREE.Vector3(xBottom, heightM, zExploded);

        let yTop = 0;
        let xTop = 0;
        if (ratio <= 0.5) {
          xTop = topLeftX + (0 - topLeftX) * (ratio / 0.5);
          yTop = heightM + roofRiseM * (ratio / 0.5);
        } else {
          xTop = 0 + (topRightX - 0) * ((ratio - 0.5) / 0.5);
          yTop = trussApexY - roofRiseM * ((ratio - 0.5) / 0.5);
        }
        const ptTop = new THREE.Vector3(xTop, yTop, zExploded);

        // Vertical strut
        createBeamMesh(ptBottom, ptTop, 0.08, webMat);

        // Diagonal bracing
        if (p < panelCount - 1) {
          const nextRatio = (p + 1) / panelCount;
          const nextXBottom = topLeftX + (topRightX - topLeftX) * nextRatio;
          const nextPtBottom = new THREE.Vector3(nextXBottom, heightM, zExploded);
          createBeamMesh(ptTop, nextPtBottom, 0.07, webMat);
        }
      }
    }

    // 3. LONGITUDINAL PURLINS & SAG RODS (Connecting all frames)
    const purlinLines = 6;
    for (let pl = 0; pl <= purlinLines; pl++) {
      const r = pl / purlinLines;
      let xPurlin = 0;
      let yPurlin = 0;

      if (r <= 0.5) {
        xPurlin = -halfSpan + (0 - -halfSpan) * (r / 0.5);
        yPurlin = heightM + roofRiseM * (r / 0.5);
      } else {
        xPurlin = 0 + (halfSpan - 0) * ((r - 0.5) / 0.5);
        yPurlin = (heightM + roofRiseM) - roofRiseM * ((r - 0.5) / 0.5);
      }

      const pStart = new THREE.Vector3(xPurlin, yPurlin + 0.08, -halfLength * (isExploded ? 1.3 : 1.0));
      const pEnd = new THREE.Vector3(xPurlin, yPurlin + 0.08, halfLength * (isExploded ? 1.3 : 1.0));
      createBeamMesh(pStart, pEnd, 0.08, purlinMat);
    }
  }, [
    spanM,
    lengthM,
    heightM,
    roofRiseM,
    framesCount,
    trussType,
    columnInclinationDeg,
    isExploded,
    isStressMode,
    isWireframe,
    integrityReport
  ]);

  return (
    <div className="relative w-full h-full min-h-[500px] flex items-center justify-center overflow-hidden">
      {/* 3D WEBGL CANVAS MOUNT */}
      <div ref={containerRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* TOP FLOATING VIEWPORT TOOLS (SCIENTIFIC HUD) */}
      <div className="absolute top-4 right-4 z-20 flex items-center gap-2 bg-[#02050B]/80 backdrop-blur-md border border-[#00E5FF]/30 px-3 py-1.5 rounded-lg shadow-[0_0_20px_rgba(0,229,255,0.15)]">
        
        {/* Stress Mode Toggle */}
        <button
          onClick={() => setIsStressMode(!isStressMode)}
          className={`flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-orbitron font-bold rounded transition-all ${
            isStressMode
              ? 'bg-[#FFD700] text-black shadow-[0_0_10px_#FFD700]'
              : 'bg-[#0A1424] text-[#8A949D] hover:text-[#00E5FF]'
          }`}
        >
          <Flame size={12} />
          <span>STRESS D/C</span>
        </button>

        {/* Exploded Mode Toggle */}
        <button
          onClick={() => setIsExploded(!isExploded)}
          className={`flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-orbitron font-bold rounded transition-all ${
            isExploded
              ? 'bg-[#00E5FF] text-black shadow-[0_0_10px_#00E5FF]'
              : 'bg-[#0A1424] text-[#8A949D] hover:text-[#00E5FF]'
          }`}
        >
          <Layers size={12} />
          <span>DESPIECE</span>
        </button>

        {/* Wireframe Mode */}
        <button
          onClick={() => setIsWireframe(!isWireframe)}
          className={`p-1.5 rounded transition-all ${
            isWireframe ? 'bg-[#00E5FF]/20 text-[#00E5FF] border border-[#00E5FF]' : 'text-[#8A949D] hover:text-white'
          }`}
          title="Modo Wireframe"
        >
          <Crosshair size={14} />
        </button>

        {/* Auto-Rotate */}
        <button
          onClick={() => setIsAutoRotate(!isAutoRotate)}
          className={`p-1.5 rounded transition-all ${
            isAutoRotate ? 'bg-[#00E5FF]/20 text-[#00E5FF] border border-[#00E5FF]' : 'text-[#8A949D] hover:text-white'
          }`}
          title="Auto Rotación 360°"
        >
          <RotateCw size={14} className={isAutoRotate ? 'animate-spin' : ''} />
        </button>
      </div>

      {/* FLOATING TOP-LEFT HUD TELEMETRY GLYPH */}
      <div className="absolute top-4 left-4 z-20 pointer-events-none flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[#00E5FF] shadow-[0_0_8px_#00E5FF] animate-pulse" />
          <span className="text-[10px] font-orbitron font-black text-[#00E5FF] tracking-widest">
            STV STRUCTURAL TWIN · 60 FPS
          </span>
        </div>
        <div className="text-[9px] font-mono text-[#8A949D]">
          {spanM}m x {lengthM}m · {framesCount} Marcos · {trussType}
        </div>
      </div>
    </div>
  );
};
