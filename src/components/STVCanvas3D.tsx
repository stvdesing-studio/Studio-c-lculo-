/**
 * STV CLOSER SYSTEM — 3D SPATIAL ENGINEERING ENGINE
 * Full-canvas Three.js WebGL Spatial Visualization
 * Strict Compliance: 100% Wireframe Projections, Piano Black Reflective Floor,
 * Matte Yellow Grid, Dynamic Holographic Objects with Concentric Technical Circles,
 * Vector Projections, and Spatial Text Integrated into Wireframe Geometry.
 */

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { SynthesisResult } from '../engine/STV_MotorSintesis';
import { SpatialHolographicHub } from '../types/stv';

/**
 * Converts color temperature in Kelvin (5200K - 6000K) to THREE.Color (Blackbody radiation approximation)
 */
export function kelvinToThreeColor(kelvin: number): THREE.Color {
  const temp = Math.max(1000, Math.min(40000, kelvin)) / 100;
  let r: number, g: number, b: number;

  if (temp <= 66) {
    r = 255;
    g = Math.max(0, Math.min(255, 99.4708025861 * Math.log(temp) - 161.1195681661));
  } else {
    r = Math.max(0, Math.min(255, 329.698727446 * Math.pow(temp - 60, -0.1332047592)));
    g = Math.max(0, Math.min(255, 288.1221695283 * Math.pow(temp - 60, -0.0755148492)));
  }

  if (temp >= 66) {
    b = 255;
  } else if (temp <= 19) {
    b = 0;
  } else {
    b = Math.max(0, Math.min(255, 138.5177312231 * Math.log(temp) - 305.0447927307));
  }

  return new THREE.Color(r / 255, g / 255, b / 255);
}

/**
 * Creates ultra high-resolution SVG vector projection textures containing technical monospace metadata,
 * concentric technical reticles, wireframe framing brackets, and structural status readouts for spatial 3D rendering.
 */
function createSVGSpatialProjectionTexture(hub: SpatialHolographicHub, isSelected: boolean): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 1200;
  canvas.height = 640;
  const ctx = canvas.getContext('2d');

  const isPass = hub.status === 'VALIDATED';
  const primaryCyan = isSelected ? '#8CFFFF' : hub.hubType === 'ANALYSIS' ? '#00E6DE' : hub.hubType === 'LOAD' ? '#D7B52A' : '#3CA9FF';
  const accentColor = isPass ? '#39E58C' : '#FF4D5A';
  const bgOpacity = isSelected ? '0.92' : '0.85';

  // Format tabular key-value entries
  const entries = Object.entries(hub.data);
  const leftEntries = entries.slice(0, Math.ceil(entries.length / 2));
  const rightEntries = entries.slice(Math.ceil(entries.length / 2));

  const renderRows = (items: [string, unknown][], xOffset: number) => {
    return items
      .map(([k, v], i) => {
        const y = 200 + i * 44;
        return `
          <g transform="translate(${xOffset}, ${y})">
            <text x="0" y="0" font-family="'Courier New', monospace" font-size="20" font-weight="bold" fill="#849492">${k}:</text>
            <text x="240" y="0" font-family="'Courier New', monospace" font-size="22" font-weight="bold" fill="#F2F7F7">${String(v)}</text>
            <line x1="0" y1="12" x2="480" y2="12" stroke="#006F73" stroke-width="1" stroke-dasharray="4 4" opacity="0.4" />
          </g>
        `;
      })
      .join('');
  };

  const svgString = `
    <svg xmlns="http://www.w3.org/2000/svg" width="1200" height="640" viewBox="0 0 1200 640">
      <defs>
        <pattern id="blueprint-grid" width="30" height="30" patternUnits="userSpaceOnUse">
          <path d="M 30 0 L 0 0 0 30" fill="none" stroke="#00E6DE" stroke-width="0.5" opacity="0.12"/>
        </pattern>
        <linearGradient id="header-grad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stop-color="${primaryCyan}" stop-opacity="0.95"/>
          <stop offset="100%" stop-color="${primaryCyan}" stop-opacity="0.75"/>
        </linearGradient>
      </defs>

      <!-- Background Spatial Plate -->
      <rect x="24" y="24" width="1152" height="592" rx="4" fill="rgba(2, 8, 10, ${bgOpacity})" stroke="${primaryCyan}" stroke-width="${isSelected ? '3' : '1.5'}"/>
      <rect x="24" y="24" width="1152" height="592" fill="url(#blueprint-grid)"/>

      <!-- Corner Brackets -->
      <path d="M 24 64 L 24 24 L 64 24" fill="none" stroke="#8CFFFF" stroke-width="4"/>
      <path d="M 1136 24 L 1176 24 L 1176 64" fill="none" stroke="#8CFFFF" stroke-width="4"/>
      <path d="M 24 576 L 24 616 L 64 616" fill="none" stroke="#8CFFFF" stroke-width="4"/>
      <path d="M 1136 616 L 1176 616 L 1176 576" fill="none" stroke="#8CFFFF" stroke-width="4"/>

      <!-- Header Banner -->
      <rect x="24" y="24" width="1152" height="64" fill="url(#header-grad)"/>
      <text x="48" y="64" font-family="'Courier New', monospace" font-size="28" font-weight="900" fill="#000000" letter-spacing="2">// SPATIAL HUB: ${hub.title.toUpperCase()}</text>
      
      <!-- Status Badge -->
      <rect x="940" y="38" width="210" height="36" fill="#02080A" stroke="${accentColor}" stroke-width="2" rx="2"/>
      <circle cx="960" cy="56" r="6" fill="${accentColor}"/>
      <text x="978" y="62" font-family="'Courier New', monospace" font-size="18" font-weight="bold" fill="${accentColor}" letter-spacing="1">[${hub.status}]</text>

      <!-- Subheader Technical Bar -->
      <text x="48" y="125" font-family="'Courier New', monospace" font-size="18" font-weight="bold" fill="#849492">ID: ${hub.id} | TYPE: ${hub.hubType} | 3D POS: [${hub.position.map(p => p.toFixed(1)).join(', ')}]m</text>
      <text x="1152" y="125" text-anchor="end" font-family="'Courier New', monospace" font-size="18" font-weight="bold" fill="#00E6DE">ATTACHMENT: ${hub.nodeAttachmentId || 'GLOBAL AXIS'}</text>
      <line x1="48" y1="145" x2="1152" y2="145" stroke="#00E6DE" stroke-width="1.5" opacity="0.4"/>

      <!-- Tabular Metadata Key-Value Columns -->
      ${renderRows(leftEntries, 48)}
      ${renderRows(rightEntries, 620)}

      <!-- Calibration & Normative References Footer -->
      <line x1="48" y1="560" x2="1152" y2="560" stroke="#00E6DE" stroke-width="1" opacity="0.3"/>
      <text x="48" y="592" font-family="'Courier New', monospace" font-size="16" font-weight="bold" fill="#00E6DE">AISC 360-16 / ACI 318-19 / AWS D1.1 // SSKC TRACEABLE ENGINE</text>
      <text x="1152" y="592" text-anchor="end" font-family="'Courier New', monospace" font-size="16" font-weight="bold" fill="#D7B52A">VECTOR PROJECTION ACTIVE ⌖</text>
    </svg>
  `;

  const texture = new THREE.CanvasTexture(canvas);
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.anisotropy = 16;

  const img = new Image();
  img.crossOrigin = 'anonymous';
  const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(svgBlob);

  img.onload = () => {
    if (ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
      texture.needsUpdate = true;
      URL.revokeObjectURL(url);
    }
  };
  img.src = url;

  return texture;
}

/**
 * Builds concentric technical dials and circular reticles with graduation tick marks.
 */
function createConcentricTechnicalReticle(radius: number, color: number): THREE.Group {
  const reticleGroup = new THREE.Group();

  // 1. Outer Concentric Ring
  const ring1Geo = new THREE.RingGeometry(radius * 0.95, radius * 1.0, 64);
  const ring1Mat = new THREE.MeshBasicMaterial({
    color,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.65
  });
  const ring1 = new THREE.Mesh(ring1Geo, ring1Mat);
  ring1.userData = { isOrbitalRing: true, speed: 0.25, axisRotate: false };
  reticleGroup.add(ring1);

  // 2. Middle Dashed / Segmented Ring
  const ring2Geo = new THREE.RingGeometry(radius * 0.75, radius * 0.78, 48);
  const ring2Mat = new THREE.MeshBasicMaterial({
    color,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.45
  });
  const ring2 = new THREE.Mesh(ring2Geo, ring2Mat);
  ring2.rotation.x = Math.PI / 3;
  ring2.userData = { isOrbitalRing: true, speed: -0.35, axisRotate: true };
  reticleGroup.add(ring2);

  // 3. Inner Radial Dial Graduation Ticks (12 major ticks at 30° intervals)
  const ticksGeo = new THREE.BufferGeometry();
  const tickPoints: THREE.Vector3[] = [];
  const numTicks = 24;
  for (let i = 0; i < numTicks; i++) {
    const angle = (i / numTicks) * Math.PI * 2;
    const isMajor = i % 2 === 0;
    const rIn = isMajor ? radius * 0.82 : radius * 0.88;
    const rOut = radius * 0.95;

    tickPoints.push(new THREE.Vector3(Math.cos(angle) * rIn, Math.sin(angle) * rIn, 0));
    tickPoints.push(new THREE.Vector3(Math.cos(angle) * rOut, Math.sin(angle) * rOut, 0));
  }
  ticksGeo.setFromPoints(tickPoints);
  const ticksMat = new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.8, linewidth: 1.5 });
  const ticksLine = new THREE.LineSegments(ticksGeo, ticksMat);
  ticksLine.userData = { isOrbitalRing: true, speed: 0.15, axisRotate: false };
  reticleGroup.add(ticksLine);

  // 4. Central 3D Coordinate Reticle / Dynamic Octahedron Node
  const coreGeo = new THREE.OctahedronGeometry(radius * 0.25, 0);
  const coreEdges = new THREE.EdgesGeometry(coreGeo);
  const coreMat = new THREE.LineBasicMaterial({ color: 0x8CFFFF, linewidth: 1.8 });
  const coreWire = new THREE.LineSegments(coreEdges, coreMat);
  coreWire.userData = { isPulsing: true, offset: 0 };
  reticleGroup.add(coreWire);

  // 5. Four-Axis Orthogonal Targeting Crosshairs
  const crossGeo = new THREE.BufferGeometry();
  const crossPts = [
    new THREE.Vector3(-radius * 1.15, 0, 0), new THREE.Vector3(-radius * 0.4, 0, 0),
    new THREE.Vector3(radius * 0.4, 0, 0), new THREE.Vector3(radius * 1.15, 0, 0),
    new THREE.Vector3(0, -radius * 1.15, 0), new THREE.Vector3(0, -radius * 0.4, 0),
    new THREE.Vector3(0, radius * 0.4, 0), new THREE.Vector3(0, radius * 1.15, 0)
  ];
  crossGeo.setFromPoints(crossPts);
  const crossLine = new THREE.LineSegments(crossGeo, new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.6 }));
  reticleGroup.add(crossLine);

  return reticleGroup;
}

interface STVCanvas3DProps {
  synthesis: SynthesisResult;
  viewMode: 'FULL_SYSTEM' | 'LOAD_PATH' | 'CONNECTION_ZOOM' | 'FOUNDATION_ISO' | 'STRESS_HEATMAP' | 'FABRICATION_SHOP';
  selectedHubId: string | null;
  onSelectHub: (hub: SpatialHolographicHub | null) => void;
  showDimensions: boolean;
  showLoadVectors: boolean;
  showFoundation: boolean;
  showGrid: boolean;
  activeAxis: string;
}

export const STVCanvas3D: React.FC<STVCanvas3DProps> = ({
  synthesis,
  viewMode,
  selectedHubId,
  onSelectHub,
  showDimensions,
  showLoadVectors,
  showFoundation,
  showGrid
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const interactiveObjectsRef = useRef<{ mesh: THREE.Object3D; hub: SpatialHolographicHub }[]>([]);
  const billboardMeshesRef = useRef<THREE.Mesh[]>([]);

  // Lighting & AO References for Real-Time Dynamic Adjustments
  const ambientLightRef = useRef<THREE.AmbientLight | null>(null);
  const dirLight1Ref = useRef<THREE.DirectionalLight | null>(null);
  const dirLight2Ref = useRef<THREE.DirectionalLight | null>(null);
  const aoMaterialsRef = useRef<THREE.MeshBasicMaterial[]>([]);

  useEffect(() => {
    if (!containerRef.current) return;

    // 1. Scene Setup - Abstract Pure Black Engineering Void
    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#000000');
    sceneRef.current = scene;

    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;

    // 2. Camera Setup - Engineering 55mm equivalent FOV (45 deg)
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(22, 16, 26);
    cameraRef.current = camera;

    // 3. High Precision WebGL Renderer (Sharpness & PBR)
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: 'high-performance',
      preserveDrawingBuffer: true
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    containerRef.current.innerHTML = '';
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // 4. OrbitControls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI / 2 + 0.02; // allow looking slightly from ground level
    controls.minDistance = 2;
    controls.maxDistance = 160;
    controls.target.set(0, 4, 0);
    controlsRef.current = controls;

    // 5. Lighting - Pure Technical White (5200K-6000K) & Cool Blue Ambient (7000K)
    const initialLighting = synthesis.lighting || {
      whiteLightIntensity: 1.8,
      colorTemperatureK: 5600,
      aoDepth: 1.0,
      accentLightIntensity: 0.9
    };

    const ambientLight = new THREE.AmbientLight(0x041315, Math.max(0.3, 2.4 - (initialLighting.aoDepth * 0.95)));
    scene.add(ambientLight);
    ambientLightRef.current = ambientLight;

    const initialWhiteColor = kelvinToThreeColor(initialLighting.colorTemperatureK);
    const dirLight1 = new THREE.DirectionalLight(initialWhiteColor, initialLighting.whiteLightIntensity);
    dirLight1.position.set(30, 40, 20);
    scene.add(dirLight1);
    dirLight1Ref.current = dirLight1;

    const dirLight2 = new THREE.DirectionalLight(0x3CA9FF, initialLighting.accentLightIntensity);
    dirLight2.position.set(-30, 20, -20);
    scene.add(dirLight2);
    dirLight2Ref.current = dirLight2;

    // 6. Handle Window Resizing via ResizeObserver
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width: newWidth, height: newHeight } = entry.contentRect;
        if (newWidth > 0 && newHeight > 0) {
          camera.aspect = newWidth / newHeight;
          camera.updateProjectionMatrix();
          renderer.setSize(newWidth, newHeight);
        }
      }
    });
    resizeObserver.observe(containerRef.current);

    // 7. Raycaster for clicking 3D Spatial Holographic Hubs
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const handleClick = (event: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(
        interactiveObjectsRef.current.map((io) => io.mesh),
        true
      );

      if (intersects.length > 0) {
        const hit = intersects[0].object;
        const found = interactiveObjectsRef.current.find((io) => io.mesh === hit || io.mesh.children.includes(hit));
        if (found) {
          onSelectHub(found.hub);

          // Smoothly look at the selected hub
          const [hx, hy, hz] = found.hub.position;
          controls.target.set(hx, hy, hz);
        }
      } else {
        // Deselect if clicked on empty space
        onSelectHub(null);
      }
    };

    renderer.domElement.addEventListener('click', handleClick);

    // 8. Animation Loop
    const clock = new THREE.Clock();
    const animate = () => {
      animationFrameRef.current = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Dynamic rotation of holographic concentric rings and reticles
      scene.traverse((obj) => {
        if (obj.userData?.isOrbitalRing) {
          obj.rotation.z = elapsedTime * obj.userData.speed;
          if (obj.userData.axisRotate) {
            obj.rotation.x = Math.sin(elapsedTime * 0.5) * 0.3;
          }
        }
        if (obj.userData?.isPulsing) {
          const s = 1 + Math.sin(elapsedTime * 2.8 + obj.userData.offset) * 0.09;
          obj.scale.set(s, s, s);
        }
      });

      // Spatial Text Panels automatically billboard towards the active camera
      billboardMeshesRef.current.forEach((mesh) => {
        mesh.quaternion.copy(camera.quaternion);
      });

      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      resizeObserver.disconnect();
      renderer.domElement.removeEventListener('click', handleClick);
      renderer.dispose();
    };
  }, []);

  // Dynamically update Global Technical Lighting & AO Depth in real time (60 FPS)
  useEffect(() => {
    if (!synthesis.lighting) return;
    const { whiteLightIntensity, colorTemperatureK, aoDepth, accentLightIntensity } = synthesis.lighting;

    if (dirLight1Ref.current) {
      dirLight1Ref.current.intensity = whiteLightIntensity;
      dirLight1Ref.current.color = kelvinToThreeColor(colorTemperatureK);
    }

    if (dirLight2Ref.current) {
      dirLight2Ref.current.intensity = accentLightIntensity ?? 0.9;
    }

    if (ambientLightRef.current) {
      // Attenuates ambient light fill to deepen crevices & high-contrast connection shadowing
      ambientLightRef.current.intensity = Math.max(0.3, 2.4 - (aoDepth * 0.95));
    }

    if (rendererRef.current) {
      rendererRef.current.toneMappingExposure = 1.05 + (whiteLightIntensity * 0.12) - (aoDepth * 0.08);
    }

    // Update AO Contact Shadow Materials opacity
    aoMaterialsRef.current.forEach((mat) => {
      mat.opacity = Math.min(0.85, aoDepth * 0.45);
      mat.needsUpdate = true;
    });
  }, [
    synthesis.lighting?.whiteLightIntensity,
    synthesis.lighting?.colorTemperatureK,
    synthesis.lighting?.aoDepth,
    synthesis.lighting?.accentLightIntensity
  ]);

  // Update Scene Contents when synthesis or view properties change
  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;

    // Reset registries
    aoMaterialsRef.current = [];
    billboardMeshesRef.current = [];
    interactiveObjectsRef.current = [];

    // Clear existing dynamic objects (retain permanent lighting)
    const objectsToRemove: THREE.Object3D[] = [];
    scene.children.forEach((child) => {
      if (child.type !== 'AmbientLight' && child.type !== 'DirectionalLight') {
        objectsToRemove.push(child);
      }
    });
    objectsToRemove.forEach((obj) => scene.remove(obj));

    // -------------------------------------------------------------
    // 01 — PIANO BLACK REFLECTIVE FLOOR
    // -------------------------------------------------------------
    const floorGeo = new THREE.PlaneGeometry(180, 180);
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0x010506,
      roughness: 0.08,
      metalness: 0.88,
      envMapIntensity: 1.2
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -0.02;
    floor.receiveShadow = true;
    scene.add(floor);

    // -------------------------------------------------------------
    // 02 — MATTE TECHNICAL YELLOW ENGINEERING GRID & AXES
    // -------------------------------------------------------------
    if (showGrid) {
      const gridGroup = new THREE.Group();
      const gridSpan = 80;
      const gridSpacing = 2.0;
      const gridMatPrimary = new THREE.LineBasicMaterial({
        color: 0xD7B52A,
        transparent: true,
        opacity: 0.38,
        linewidth: 1.2
      });
      const gridMatSecondary = new THREE.LineBasicMaterial({
        color: 0xD7B52A,
        transparent: true,
        opacity: 0.16,
        linewidth: 0.8
      });

      // Lines along X and Z
      for (let x = -gridSpan / 2; x <= gridSpan / 2; x += gridSpacing) {
        const isMajor = Math.abs(x % 10) < 0.1 || Math.abs(x) < 0.1;
        const lineGeo = new THREE.BufferGeometry().setFromPoints([
          new THREE.Vector3(x, 0.01, -gridSpan / 2),
          new THREE.Vector3(x, 0.01, gridSpan / 2)
        ]);
        const line = new THREE.Line(lineGeo, isMajor ? gridMatPrimary : gridMatSecondary);
        gridGroup.add(line);
      }

      for (let z = -gridSpan / 2; z <= gridSpan / 2; z += gridSpacing) {
        const isMajor = Math.abs(z % 10) < 0.1 || Math.abs(z) < 0.1;
        const lineGeo = new THREE.BufferGeometry().setFromPoints([
          new THREE.Vector3(-gridSpan / 2, 0.01, z),
          new THREE.Vector3(gridSpan / 2, 0.01, z)
        ]);
        const line = new THREE.Line(lineGeo, isMajor ? gridMatPrimary : gridMatSecondary);
        gridGroup.add(line);
      }

      // Principal Structural Axes Crosshairs (1, 2, 3, 4, 5 & A, B)
      const rawZ: number[] = synthesis.columns.map((c) => c.position[2]);
      const rawX: number[] = synthesis.columns.map((c) => c.position[0]);
      const zValues: number[] = Array.from(new Set<number>(rawZ)).sort((a: number, b: number) => a - b);
      const xValues: number[] = Array.from(new Set<number>(rawX)).sort((a: number, b: number) => a - b);
      const xOffset: number = (xValues[1] ?? 10) + 4.5;

      // Add Axis Markers
      zValues.forEach((zVal: number) => {
        const axisCircleGeo = new THREE.RingGeometry(0.7, 0.8, 32);
        const axisCircleMat = new THREE.MeshBasicMaterial({ color: 0xD7B52A, side: THREE.DoubleSide });
        const axisCircle = new THREE.Mesh(axisCircleGeo, axisCircleMat);
        axisCircle.rotation.x = -Math.PI / 2;
        axisCircle.position.set(-xOffset, 0.05, zVal);
        gridGroup.add(axisCircle);
      });

      scene.add(gridGroup);
    }

    // -------------------------------------------------------------
    // 03 — STRUCTURAL WIREFRAME ENGINE (NO SOLID GEOMETRY)
    // Colors: Primary Cyan #00E6DE, Highlight #8CFFFF, Secondary #00A8AA, Deep #006F73
    // -------------------------------------------------------------
    const structureGroup = new THREE.Group();

    // Map of nodes for quick coordinate lookup
    const nodeMap = new Map<string, THREE.Vector3>();
    synthesis.nodes.forEach((n) => {
      nodeMap.set(n.id, new THREE.Vector3(n.x, n.y, n.z));
    });

    // Color definitions for wireframes
    const matPrimaryEdge = new THREE.LineBasicMaterial({ color: 0x00E6DE, linewidth: 1.8 });
    const matHighlightEdge = new THREE.LineBasicMaterial({ color: 0x8CFFFF, linewidth: 2.0 });
    const matSecondaryEdge = new THREE.LineBasicMaterial({ color: 0x00A8AA, linewidth: 1.2 });
    const matDeepEdge = new THREE.LineBasicMaterial({ color: 0x006F73, linewidth: 0.8 });
    const matFoundationEdge = new THREE.LineBasicMaterial({ color: 0x3CA9FF, linewidth: 1.6 });
    const matCableEdge = new THREE.LineBasicMaterial({ color: 0x8CFFFF, linewidth: 1.5 });

    // Render Members as 3D Line Beams (Wireframe Extrusions & Centerlines)
    synthesis.members.forEach((m) => {
      const p1 = nodeMap.get(m.startNodeId);
      const p2 = nodeMap.get(m.endNodeId);
      if (!p1 || !p2) return;

      let lineMat = matPrimaryEdge;
      if (m.role === 'COLUMN' || m.role === 'ARCH_CHORD') {
        lineMat = matHighlightEdge;
      } else if (m.role === 'PURLIN' || m.role === 'BRACING') {
        lineMat = matDeepEdge;
      } else if (m.role === 'DIAGONAL' || m.role === 'VERTICAL') {
        lineMat = matSecondaryEdge;
      } else if (m.role === 'CABLE') {
        lineMat = matCableEdge;
      }

      // 1. Axial Centerline
      const lineGeo = new THREE.BufferGeometry().setFromPoints([p1, p2]);
      const centerLine = new THREE.Line(lineGeo, lineMat);
      structureGroup.add(centerLine);

      // 2. 3D Wireframe Profile Outline (Constructive Realism)
      const dir = new THREE.Vector3().subVectors(p2, p1);
      const len = dir.length();
      if (len > 0.1 && m.role !== 'CABLE') {
        const mid = new THREE.Vector3().addVectors(p1, p2).multiplyScalar(0.5);

        // Section box dimensions based on profile
        let w = 0.20;
        let d = 0.20;
        if (m.profileId.includes('8X4')) {
          w = 0.203;
          d = 0.101;
        } else if (m.profileId.includes('4X4')) {
          w = 0.101;
          d = 0.101;
        } else if (m.profileId.includes('6X4')) {
          w = 0.152;
          d = 0.101;
        } else if (m.profileId.includes('2X2')) {
          w = 0.050;
          d = 0.050;
        } else if (m.profileId.includes('W8X15')) {
          w = 0.206;
          d = 0.102;
        }

        const boxGeo = new THREE.BoxGeometry(w, len, d);
        const edgesGeo = new THREE.EdgesGeometry(boxGeo);
        const wireframeBox = new THREE.LineSegments(edgesGeo, lineMat);
        wireframeBox.position.copy(mid);

        // Orient box along the member axis
        const up = new THREE.Vector3(0, 1, 0);
        const normDir = dir.clone().normalize();
        const quat = new THREE.Quaternion().setFromUnitVectors(up, normDir);
        wireframeBox.setRotationFromQuaternion(quat);

        structureGroup.add(wireframeBox);
      }
    });

    // -------------------------------------------------------------
    // NODES (SPHERICAL RÓTULAS)
    // -------------------------------------------------------------
    const nodeGeo = new THREE.SphereGeometry(0.09, 16, 16);
    const nodeMat = new THREE.MeshBasicMaterial({ color: 0x8CFFFF, wireframe: true });
    synthesis.nodes.forEach((n) => {
      const nodeMesh = new THREE.Mesh(nodeGeo, nodeMat);
      nodeMesh.position.set(n.x, n.y, n.z);
      structureGroup.add(nodeMesh);
    });

    // -------------------------------------------------------------
    // 04 — FOUNDATION INTERFACE & BASE PLATES (ALL WIREFRAME PROJECTION)
    // -------------------------------------------------------------
    if (showFoundation) {
      const fGroup = new THREE.Group();

      synthesis.columns.forEach((col) => {
        const [cx, cy, cz] = col.position;
        const bp = col.basePlate;
        const ft = col.footing;
        const ped = col.pedestal;

        // 1. Base Plate 3D Wireframe
        const bpGeo = new THREE.BoxGeometry(bp.dimensionsMm[0] / 1000, bp.thicknessMm / 1000, bp.dimensionsMm[1] / 1000);
        const bpEdges = new THREE.EdgesGeometry(bpGeo);
        const bpMesh = new THREE.LineSegments(bpEdges, matHighlightEdge);
        bpMesh.position.set(cx, bp.thicknessMm / 2000, cz);
        fGroup.add(bpMesh);

        // AO Contact Occlusion Disc on Base Plate Interface
        const aoDiscGeo = new THREE.CircleGeometry((bp.dimensionsMm[0] / 1000) * 0.75, 24);
        const aoDiscMat = new THREE.MeshBasicMaterial({
          color: 0x000000,
          transparent: true,
          opacity: Math.min(0.85, (synthesis.lighting?.aoDepth ?? 1.0) * 0.45),
          side: THREE.DoubleSide
        });
        aoMaterialsRef.current.push(aoDiscMat);
        const aoMesh = new THREE.Mesh(aoDiscGeo, aoDiscMat);
        aoMesh.rotation.x = -Math.PI / 2;
        aoMesh.position.set(cx, 0.002, cz);
        fGroup.add(aoMesh);

        // 2. Anchor Bolt Projection Lines (4 Anclas F1554)
        const boltOffset = 0.09;
        const boltOffsets = [
          [-boltOffset, -boltOffset],
          [boltOffset, -boltOffset],
          [-boltOffset, boltOffset],
          [boltOffset, boltOffset]
        ];

        boltOffsets.forEach(([bx, bz]) => {
          const boltPts = [
            new THREE.Vector3(cx + bx, 0.12, cz + bz),
            new THREE.Vector3(cx + bx, -0.40, cz + bz)
          ];
          const boltLine = new THREE.Line(new THREE.BufferGeometry().setFromPoints(boltPts), matFoundationEdge);
          fGroup.add(boltLine);
        });

        // 3. Concrete Pedestal Wireframe
        const pedGeo = new THREE.BoxGeometry(ped.widthMm / 1000, ped.heightMm / 1000, ped.lengthMm / 1000);
        const pedEdges = new THREE.EdgesGeometry(pedGeo);
        const pedMesh = new THREE.LineSegments(pedEdges, matFoundationEdge);
        pedMesh.position.set(cx, -ped.heightMm / 2000, cz);
        fGroup.add(pedMesh);

        // 4. Reinforced Concrete Footing (Zapata Aislada)
        const zapataGeo = new THREE.BoxGeometry(ft.widthM, ft.thicknessM, ft.lengthM);
        const zapataEdges = new THREE.EdgesGeometry(zapataGeo);
        const zapataMesh = new THREE.LineSegments(zapataEdges, matFoundationEdge);
        zapataMesh.position.set(cx, -ped.heightMm / 1000 - ft.thicknessM / 2, cz);
        fGroup.add(zapataMesh);
      });

      scene.add(fGroup);
    }

    // -------------------------------------------------------------
    // 05 — LOAD VECTORS (DEAD, LIVE, WIND)
    // -------------------------------------------------------------
    if (showLoadVectors) {
      const loadGroup = new THREE.Group();

      synthesis.columns.forEach((col) => {
        const topY = 6.0; // near column apex
        const [cx, , cz] = col.position;

        // Dead Load (↓ Cyan-White)
        const arrowD = new THREE.ArrowHelper(
          new THREE.Vector3(0, -1, 0),
          new THREE.Vector3(cx, topY + 1.8, cz),
          1.4,
          0x8CFFFF,
          0.35,
          0.20
        );
        loadGroup.add(arrowD);

        // Live Load (↓ Matte Yellow)
        const arrowL = new THREE.ArrowHelper(
          new THREE.Vector3(0, -1, 0),
          new THREE.Vector3(cx + 0.3, topY + 1.8, cz + 0.3),
          1.1,
          0xD7B52A,
          0.30,
          0.18
        );
        loadGroup.add(arrowL);

        // Wind Load (→ Electric Blue)
        const arrowW = new THREE.ArrowHelper(
          new THREE.Vector3(1, 0, 0),
          new THREE.Vector3(cx - 1.8, topY, cz),
          1.6,
          0x3CA9FF,
          0.40,
          0.22
        );
        loadGroup.add(arrowW);
      });

      scene.add(loadGroup);
    }

    // -------------------------------------------------------------
    // 06 — DYNAMIC WIREFRAME HOLOGRAPHIC OBJECTS & SPATIAL TEXT PANELS
    // Concentric technical circles, vector projections & 3D integrated metadata
    // -------------------------------------------------------------
    const hubsGroup = new THREE.Group();

    synthesis.spatialHubs.forEach((hub, idx) => {
      const [hx, hy, hz] = hub.position;
      const hubEntity = new THREE.Group();
      hubEntity.position.set(hx, hy, hz);

      const isSelected = selectedHubId === hub.id;
      const primaryColor = isSelected ? 0x8CFFFF : hub.hubType === 'ANALYSIS' ? 0x00E6DE : hub.hubType === 'LOAD' ? 0xD7B52A : 0x3CA9FF;

      // 1. Concentric Technical Circles & Dial Reticle
      const reticle = createConcentricTechnicalReticle(hub.radius * 1.1, primaryColor);
      hubEntity.add(reticle);

      // 2. Vector Projections:
      // A) 3D Leader Vector to attached node / structural member with right-angle knee routing
      if (hub.nodeAttachmentId) {
        const targetNode = synthesis.nodes.find((n) => n.id === hub.nodeAttachmentId);
        if (targetNode) {
          const dx = targetNode.x - hx;
          const dy = targetNode.y - hy;
          const dz = targetNode.z - hz;

          // Dogleg orthogonal projection routing
          const midX = dx * 0.6;
          const midY = dy * 0.2;
          const midZ = dz * 0.6;

          const leaderPoints = [
            new THREE.Vector3(0, 0, 0),
            new THREE.Vector3(midX, midY, midZ),
            new THREE.Vector3(dx, dy, dz)
          ];

          const leaderGeo = new THREE.BufferGeometry().setFromPoints(leaderPoints);
          const leaderLine = new THREE.Line(
            leaderGeo,
            new THREE.LineDashedMaterial({
              color: primaryColor,
              dashSize: 0.25,
              gapSize: 0.12,
              transparent: true,
              opacity: 0.85
            })
          );
          leaderLine.computeLineDistances();
          hubEntity.add(leaderLine);

          // Target Crosshair Reticle at Node Endpoint
          const targetRingGeo = new THREE.RingGeometry(0.18, 0.22, 16);
          const targetRingMat = new THREE.MeshBasicMaterial({ color: 0x8CFFFF, side: THREE.DoubleSide });
          const targetRing = new THREE.Mesh(targetRingGeo, targetRingMat);
          targetRing.position.set(dx, dy, dz);
          targetRing.rotation.x = Math.PI / 2;
          hubEntity.add(targetRing);
        }
      }

      // B) Ground Datum Vector Drop (Vertical vector projection line to floor with concentric ground target)
      const groundDropGeo = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(0, -hy + 0.02, 0)
      ]);
      const groundDropLine = new THREE.Line(
        groundDropGeo,
        new THREE.LineDashedMaterial({
          color: 0xD7B52A,
          dashSize: 0.35,
          gapSize: 0.18,
          transparent: true,
          opacity: 0.5
        })
      );
      groundDropLine.computeLineDistances();
      hubEntity.add(groundDropLine);

      // Concentric Ground Target Disc
      const groundDiscGeo = new THREE.RingGeometry(0.35, 0.45, 24);
      const groundDiscMat = new THREE.MeshBasicMaterial({ color: 0xD7B52A, side: THREE.DoubleSide, transparent: true, opacity: 0.4 });
      const groundDisc = new THREE.Mesh(groundDiscGeo, groundDiscMat);
      groundDisc.rotation.x = -Math.PI / 2;
      groundDisc.position.set(0, -hy + 0.02, 0);
      hubEntity.add(groundDisc);

      // 3. Integrated Spatial Text SVG Projection Panel in 3D Wireframe Geometry
      const metadataTexture = createSVGSpatialProjectionTexture(hub, isSelected);
      const panelWidth = 2.6;
      const panelHeight = 1.35;
      const panelGeo = new THREE.PlaneGeometry(panelWidth, panelHeight);
      const panelMat = new THREE.MeshBasicMaterial({
        map: metadataTexture,
        transparent: true,
        opacity: isSelected ? 1.0 : 0.95,
        side: THREE.DoubleSide,
        depthWrite: false
      });
      const spatialTextMesh = new THREE.Mesh(panelGeo, panelMat);

      // Offset the spatial text panel slightly away from the reticle center in 3D space
      spatialTextMesh.position.set(1.75, 0.45, 0);
      hubEntity.add(spatialTextMesh);
      billboardMeshesRef.current.push(spatialTextMesh);

      // 4. Wireframe Leader Arm connecting Reticle to the Spatial Text Panel
      const armPts = [
        new THREE.Vector3(hub.radius * 0.95, 0, 0),
        new THREE.Vector3(1.75 - panelWidth / 2, 0.45, 0)
      ];
      const armGeo = new THREE.BufferGeometry().setFromPoints(armPts);
      const armLine = new THREE.Line(armGeo, new THREE.LineBasicMaterial({ color: primaryColor, linewidth: 1.8 }));
      hubEntity.add(armLine);

      // 5. Interactive Raycaster Hit Target (Invisible sphere surrounding the holographic cluster)
      const hitBoxGeo = new THREE.SphereGeometry(hub.radius * 2.2, 16, 16);
      const hitBoxMat = new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false });
      const hitBox = new THREE.Mesh(hitBoxGeo, hitBoxMat);
      hubEntity.add(hitBox);

      interactiveObjectsRef.current.push({ mesh: hitBox, hub });
      hubsGroup.add(hubEntity);
    });

    scene.add(hubsGroup);
    scene.add(structureGroup);
  }, [synthesis, viewMode, selectedHubId, showDimensions, showLoadVectors, showFoundation, showGrid]);

  return (
    <div className="relative w-full h-full bg-black overflow-hidden select-none">
      <div ref={containerRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Extreme Peripheral 3D Orientation Compass & Axes */}
      <div className="absolute top-4 right-4 pointer-events-none flex flex-col items-end gap-1 font-orbitron text-[10px] tracking-widest text-[#00E6DE]/70 bg-black/60 px-3 py-2 border border-[#006F73]/40">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#00E6DE] animate-pulse"></span>
          <span>DYNAMIC HOLOGRAPHIC ENGINE ACTIVE</span>
        </div>
        <div className="font-mono-tech text-[9px] text-[#D7B52A]">PROJECTION: VECTOR + CONCENTRIC RETICLES</div>
        <div className="text-[8px] text-[#8CFFFF]">SPATIAL METADATA: INTEGRATED 3D GEOMETRY</div>
      </div>
    </div>
  );
};
