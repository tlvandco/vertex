import React, { useRef, useEffect, useState, useCallback } from 'react';
import * as THREE from 'three';
import { StudioElement } from './types';
import { EngineeringConfig } from '../tools/types';
import {
  RotateCcw,
  Sun,
  Eye,
  Camera,
  Layers,
  Sparkles,
  Maximize2,
  Minimize2,
  Box,
  Sliders,
  Download
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface BIM3DWorkspaceProps {
  elements: StudioElement[];
  selectedElementId: string | null;
  onSelectElement: (id: string | null) => void;
  roomWidthFt: number;
  roomLengthFt: number;
  ceilingHeightFt: number;
  config: EngineeringConfig;
  activeLayers: {
    architecture: boolean;
    structure: boolean;
    furniture: boolean;
    annotation: boolean;
  };
  isMaximized?: boolean;
  onToggleMaximize?: () => void;
}

export const BIM3DWorkspace: React.FC<BIM3DWorkspaceProps> = ({
  elements,
  selectedElementId,
  onSelectElement,
  roomWidthFt,
  roomLengthFt,
  ceilingHeightFt,
  config,
  activeLayers,
  isMaximized,
  onToggleMaximize
}) => {
  const { addToast } = useApp();
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const animFrameIdRef = useRef<number | null>(null);
  const sunLightRef = useRef<THREE.DirectionalLight | null>(null);

  // 3D Controls State
  const [shadingMode, setShadingMode] = useState<'REALISTIC' | 'CLAY' | 'WIREFRAME'>('REALISTIC');
  const [timeOfDay, setTimeOfDay] = useState<number>(14); // 14:00 (2 PM)
  const [cutawayHeightRatio, setCutawayHeightRatio] = useState<number>(0.65); // 65% wall cutaway height for interior visibility
  const [cameraPreset, setCameraPreset] = useState<'ISOMETRIC' | 'TOP' | 'EYE_LEVEL' | 'FRONT'>('ISOMETRIC');

  // Mouse Orbit/Pan State
  const isDraggingRef = useRef<boolean>(false);
  const isPanningRef = useRef<boolean>(false);
  const prevMousePosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const cameraSphericalRef = useRef<{ radius: number; theta: number; phi: number }>({
    radius: 48,
    theta: Math.PI / 4,
    phi: Math.PI / 3.2
  });
  const cameraTargetRef = useRef<THREE.Vector3>(new THREE.Vector3(roomLengthFt / 2, 0, roomWidthFt / 2));

  // Initialize Three.js WebGL Scene
  useEffect(() => {
    if (!mountRef.current) return;
    const container = mountRef.current;
    const width = container.clientWidth || 800;
    const height = container.clientHeight || 520;

    // 1. Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#14120E');
    scene.fog = new THREE.FogExp2('#14120E', 0.008);
    sceneRef.current = scene;

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.5, 500);
    cameraRef.current = camera;

    // 3. Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    rendererRef.current = renderer;

    container.replaceChildren(renderer.domElement);

    // 4. Lighting Rig
    const ambientLight = new THREE.AmbientLight(0xfff5e6, 0.85);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xfff0d0, 2.2);
    sunLight.position.set(30, 45, 20);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    sunLight.shadow.bias = -0.0005;
    sunLight.shadow.camera.near = 1;
    sunLight.shadow.camera.far = 150;
    const d = 35;
    sunLight.shadow.camera.left = -d;
    sunLight.shadow.camera.right = d;
    sunLight.shadow.camera.top = d;
    sunLight.shadow.camera.bottom = -d;
    scene.add(sunLight);
    sunLightRef.current = sunLight;

    // Subtle warm interior accent point light
    const interiorPoint = new THREE.PointLight(0xffd599, 1.2, 40);
    interiorPoint.position.set(roomLengthFt / 2, 8, roomWidthFt / 2);
    scene.add(interiorPoint);

    // Initial Camera Positioning
    updateCameraPosition();

    // 5. Animation Loop
    const animate = () => {
      animFrameIdRef.current = requestAnimationFrame(animate);
      if (rendererRef.current && sceneRef.current && cameraRef.current) {
        rendererRef.current.render(sceneRef.current, cameraRef.current);
      }
    };
    animate();

    // Resize Observer
    const resizeObserver = new ResizeObserver(entries => {
      for (const entry of entries) {
        const { width: newW, height: newH } = entry.contentRect;
        if (newW > 0 && newH > 0 && cameraRef.current && rendererRef.current) {
          cameraRef.current.aspect = newW / newH;
          cameraRef.current.updateProjectionMatrix();
          rendererRef.current.setSize(newW, newH);
        }
      }
    });
    resizeObserver.observe(container);

    return () => {
      resizeObserver.disconnect();
      if (animFrameIdRef.current) cancelAnimationFrame(animFrameIdRef.current);
      renderer.dispose();
    };
  }, []);

  // Update Camera Spherical Coordinates to 3D Position
  const updateCameraPosition = useCallback(() => {
    if (!cameraRef.current) return;
    const { radius, theta, phi } = cameraSphericalRef.current;
    const target = cameraTargetRef.current;

    const x = target.x + radius * Math.sin(phi) * Math.sin(theta);
    const y = target.y + radius * Math.cos(phi);
    const z = target.z + radius * Math.sin(phi) * Math.cos(theta);

    cameraRef.current.position.set(x, y, z);
    cameraRef.current.lookAt(target);
  }, []);

  // Adjust Sun Angle based on Time of Day (8am - 6pm)
  useEffect(() => {
    if (!sunLightRef.current) return;
    const hour = timeOfDay; // e.g. 8 to 18
    const sunAngle = ((hour - 6) / 12) * Math.PI; // 0 at 6am to PI at 6pm
    const sunRadius = 50;

    const sunX = roomLengthFt / 2 + sunRadius * Math.cos(sunAngle);
    const sunY = Math.max(10, sunRadius * Math.sin(sunAngle));
    const sunZ = roomWidthFt / 2 + 25 * Math.sin(sunAngle);

    sunLightRef.current.position.set(sunX, sunY, sunZ);

    // Warm golden hour color tinting
    if (hour <= 9 || hour >= 16.5) {
      sunLightRef.current.color.set('#FFA74F');
      sunLightRef.current.intensity = 2.4;
    } else {
      sunLightRef.current.color.set('#FFF6E5');
      sunLightRef.current.intensity = 2.0;
    }
  }, [timeOfDay, roomLengthFt, roomWidthFt]);

  // Re-build 3D Meshes whenever elements, materials, or shading mode changes
  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;

    // Remove previously generated dynamic objects (keep lights)
    const toRemove: THREE.Object3D[] = [];
    scene.traverse(child => {
      if (child.name.startsWith('bim-')) {
        toRemove.push(child);
      }
    });
    toRemove.forEach(obj => {
      scene.remove(obj);
      if ((obj as THREE.Mesh).geometry) (obj as THREE.Mesh).geometry.dispose();
    });

    const isClay = shadingMode === 'CLAY';
    const isWire = shadingMode === 'WIREFRAME';

    // Materials Palette
    const floorMat = isClay
      ? new THREE.MeshStandardMaterial({ color: '#D6D3CD', roughness: 0.8 })
      : isWire
      ? new THREE.MeshBasicMaterial({ color: '#D4AF37', wireframe: true })
      : new THREE.MeshStandardMaterial({
          color: '#342E27',
          roughness: 0.35,
          metalness: 0.1
        });

    const wallMat = isClay
      ? new THREE.MeshStandardMaterial({ color: '#ECE9E2', roughness: 0.9 })
      : isWire
      ? new THREE.MeshBasicMaterial({ color: '#E8E5DF', wireframe: true })
      : new THREE.MeshStandardMaterial({
          color: '#E4DFD5',
          roughness: 0.85,
          metalness: 0.05
        });

    const glassMat = isClay
      ? new THREE.MeshStandardMaterial({ color: '#A0B4C8', roughness: 0.3 })
      : isWire
      ? new THREE.MeshBasicMaterial({ color: '#87CEEB', wireframe: true })
      : new THREE.MeshPhysicalMaterial({
          color: '#D8ECF8',
          transparent: true,
          opacity: 0.45,
          roughness: 0.05,
          transmission: 0.85,
          ior: 1.5
        });

    const woodOakMat = isClay
      ? new THREE.MeshStandardMaterial({ color: '#B0A89C' })
      : isWire
      ? new THREE.MeshBasicMaterial({ color: '#C5A059', wireframe: true })
      : new THREE.MeshStandardMaterial({
          color: '#5C4834',
          roughness: 0.45,
          metalness: 0.05
        });

    const marbleMat = isClay
      ? new THREE.MeshStandardMaterial({ color: '#FFFFFF' })
      : isWire
      ? new THREE.MeshBasicMaterial({ color: '#FFFFFF', wireframe: true })
      : new THREE.MeshStandardMaterial({
          color: '#F5F5F3',
          roughness: 0.15,
          metalness: 0.15
        });

    const travertineMat = isClay
      ? new THREE.MeshStandardMaterial({ color: '#D4CBB8' })
      : isWire
      ? new THREE.MeshBasicMaterial({ color: '#D4CBB8', wireframe: true })
      : new THREE.MeshStandardMaterial({
          color: '#D4CBB8',
          roughness: 0.6,
          metalness: 0.05
        });

    const fabricMat = isClay
      ? new THREE.MeshStandardMaterial({ color: '#CCC7BF' })
      : isWire
      ? new THREE.MeshBasicMaterial({ color: '#E0DDD5', wireframe: true })
      : new THREE.MeshStandardMaterial({
          color: '#DDD7CC',
          roughness: 0.95
        });

    const bronzeMat = isClay
      ? new THREE.MeshStandardMaterial({ color: '#665544' })
      : isWire
      ? new THREE.MeshBasicMaterial({ color: '#D4AF37', wireframe: true })
      : new THREE.MeshStandardMaterial({
          color: '#9C7A3C',
          roughness: 0.3,
          metalness: 0.85
        });

    const leatherMat = isClay
      ? new THREE.MeshStandardMaterial({ color: '#886644' })
      : isWire
      ? new THREE.MeshBasicMaterial({ color: '#8B4513', wireframe: true })
      : new THREE.MeshStandardMaterial({
          color: '#653B20',
          roughness: 0.45,
          metalness: 0.05
        });

    const matteBlackMat = isClay
      ? new THREE.MeshStandardMaterial({ color: '#333333' })
      : isWire
      ? new THREE.MeshBasicMaterial({ color: '#1A1A1A', wireframe: true })
      : new THREE.MeshStandardMaterial({
          color: '#1C1A17',
          roughness: 0.4,
          metalness: 0.6
        });

    const plantGreenMat = isClay
      ? new THREE.MeshStandardMaterial({ color: '#667755' })
      : isWire
      ? new THREE.MeshBasicMaterial({ color: '#2E8B57', wireframe: true })
      : new THREE.MeshStandardMaterial({
          color: '#2D4E2A',
          roughness: 0.6
        });

    const waterMat = isClay
      ? new THREE.MeshStandardMaterial({ color: '#558899', roughness: 0.2 })
      : isWire
      ? new THREE.MeshBasicMaterial({ color: '#38A3A5', wireframe: true })
      : new THREE.MeshPhysicalMaterial({
          color: '#2EA5A8',
          transparent: true,
          opacity: 0.65,
          roughness: 0.05,
          transmission: 0.75,
          ior: 1.333
        });

    const timberDeckMat = isClay
      ? new THREE.MeshStandardMaterial({ color: '#776655' })
      : isWire
      ? new THREE.MeshBasicMaterial({ color: '#8B5A2B', wireframe: true })
      : new THREE.MeshStandardMaterial({
          color: '#5C3E28',
          roughness: 0.55,
          metalness: 0.05
        });

    // 1. Base Floor Slab
    const floorGeo = new THREE.BoxGeometry(roomLengthFt, 0.6, roomWidthFt);
    const floorMesh = new THREE.Mesh(floorGeo, floorMat);
    floorMesh.name = 'bim-floor';
    floorMesh.position.set(roomLengthFt / 2, -0.3, roomWidthFt / 2);
    floorMesh.receiveShadow = true;
    scene.add(floorMesh);

    // Architectural Ground Grid Helper
    const grid = new THREE.GridHelper(
      Math.max(roomLengthFt, roomWidthFt) * 1.5,
      Math.max(roomLengthFt, roomWidthFt),
      0xd4af37,
      0x332a1e
    );
    grid.name = 'bim-grid';
    grid.position.set(roomLengthFt / 2, 0.01, roomWidthFt / 2);
    scene.add(grid);

    // Effective wall height with cutaway ratio
    const effectiveWallHeight = ceilingHeightFt * cutawayHeightRatio;

    // 2. Generate 3D Meshes for Elements
    elements.forEach(elem => {
      if (!activeLayers[elem.layer]) return;

      const isSelected = elem.id === selectedElementId;

      if (elem.type === 'WALL') {
        const wallH = effectiveWallHeight;
        const wallGeo = new THREE.BoxGeometry(elem.width, wallH, elem.length);
        const mat = elem.materialType === 'glass' ? glassMat : wallMat;
        const wallMesh = new THREE.Mesh(wallGeo, mat);
        wallMesh.name = `bim-wall-${elem.id}`;
        wallMesh.position.set(elem.x, wallH / 2, elem.y);
        wallMesh.rotation.y = THREE.MathUtils.degToRad(-elem.rotation);
        wallMesh.castShadow = true;
        wallMesh.receiveShadow = true;

        if (isSelected) {
          const outlineGeo = new THREE.BoxGeometry(elem.width + 0.1, wallH + 0.1, elem.length + 0.1);
          const outlineMat = new THREE.MeshBasicMaterial({ color: '#D4AF37', wireframe: true });
          const outline = new THREE.Mesh(outlineGeo, outlineMat);
          wallMesh.add(outline);
        }

        scene.add(wallMesh);
      } else if (elem.type === 'COLUMN') {
        const colGeo = new THREE.CylinderGeometry(elem.width / 2, elem.width / 2, effectiveWallHeight, 16);
        const colMesh = new THREE.Mesh(colGeo, wallMat);
        colMesh.name = `bim-col-${elem.id}`;
        colMesh.position.set(elem.x, effectiveWallHeight / 2, elem.y);
        colMesh.castShadow = true;
        colMesh.receiveShadow = true;
        scene.add(colMesh);
      } else if (elem.type === 'DOOR') {
        // Door Frame + Smoked Oak Panel
        const doorH = Math.min(elem.height, effectiveWallHeight);
        const doorGeo = new THREE.BoxGeometry(elem.width, doorH, elem.length);
        const doorMesh = new THREE.Mesh(doorGeo, woodOakMat);
        doorMesh.name = `bim-door-${elem.id}`;
        doorMesh.position.set(elem.x, doorH / 2, elem.y);
        doorMesh.rotation.y = THREE.MathUtils.degToRad(-elem.rotation);
        doorMesh.castShadow = true;
        scene.add(doorMesh);
      } else if (elem.type === 'WINDOW') {
        const winH = Math.min(elem.height, effectiveWallHeight);
        const winGeo = new THREE.BoxGeometry(elem.width, winH, elem.length);
        const winMesh = new THREE.Mesh(winGeo, glassMat);
        winMesh.name = `bim-win-${elem.id}`;
        winMesh.position.set(elem.x, winH / 2 + elem.z * 0.5, elem.y);
        winMesh.rotation.y = THREE.MathUtils.degToRad(-elem.rotation);
        scene.add(winMesh);
      } else if (
        elem.type === 'FURNITURE' ||
        elem.type === 'IMPORTED_OBJECT' ||
        elem.type === 'LIGHT' ||
        elem.type === 'PLUMBING' ||
        elem.type === 'EXTERIOR_DECK' ||
        elem.type === 'EXTERIOR_POOL' ||
        elem.type === 'EXTERIOR_TREE' ||
        elem.type === 'EXTERIOR_PERGOLA' ||
        elem.type === 'FACADE_PANEL' ||
        elem.type === 'STAIRS' ||
        elem.type === 'PRIMITIVE_CUBE' ||
        elem.type === 'PRIMITIVE_CYLINDER'
      ) {
        // Parametric 3D Furniture & Imported Meshes
        const furnGroup = new THREE.Group();
        furnGroup.name = `bim-furn-${elem.id}`;
        furnGroup.position.set(elem.x, elem.z, elem.y);
        furnGroup.rotation.y = THREE.MathUtils.degToRad(-elem.rotation);
        if (elem.rotationX) furnGroup.rotation.x = THREE.MathUtils.degToRad(elem.rotationX);
        if (elem.rotationY) furnGroup.rotation.z = THREE.MathUtils.degToRad(elem.rotationY);

        // Helper to resolve element material (supports custom roughness/metalness/color from Blender PBR shader)
        const getElemMat = () => {
          if (elem.roughness !== undefined || elem.metalness !== undefined || elem.color) {
            return new THREE.MeshStandardMaterial({
              color: elem.color || '#D4AF37',
              roughness: elem.roughness ?? 0.5,
              metalness: elem.metalness ?? 0.1,
              transparent: (elem.opacity ?? 1) < 1,
              opacity: elem.opacity ?? 1
            });
          }
          switch (elem.materialType) {
            case 'water': return waterMat;
            case 'grass': return plantGreenMat;
            case 'timber_deck': return timberDeckMat;
            case 'leather': return leatherMat;
            case 'matte_black': return matteBlackMat;
            case 'travertine':
            case 'marble': return marbleMat;
            case 'bronze':
            case 'steel': return bronzeMat;
            case 'glass': return glassMat;
            case 'walnut':
            case 'oak': return woodOakMat;
            default: return fabricMat;
          }
        };

        // 1. True 3D Wavefront OBJ Mesh Render if imported
        if (elem.importedObjMesh && elem.importedObjMesh.vertices && elem.importedObjMesh.vertices.length > 0) {
          const customGeo = new THREE.BufferGeometry();
          customGeo.setAttribute('position', new THREE.Float32BufferAttribute(elem.importedObjMesh.vertices, 3));
          customGeo.computeVertexNormals();
          const customMesh = new THREE.Mesh(customGeo, getElemMat());
          customMesh.castShadow = true;
          customMesh.receiveShadow = true;
          furnGroup.add(customMesh);
        }
        // 2. Exterior Architecture Archetypes
        else if (elem.type === 'EXTERIOR_POOL' || elem.furnitureCategory === 'POOL') {
          // Pool Coping Rim
          const rimGeo = new THREE.BoxGeometry(elem.width, 0.4, elem.length);
          const rimMesh = new THREE.Mesh(rimGeo, travertineMat);
          rimMesh.position.y = 0.2;
          furnGroup.add(rimMesh);

          // Submerged Pool Water Basin
          const poolWaterGeo = new THREE.BoxGeometry(elem.width - 1.5, 0.3, elem.length - 1.5);
          const poolWaterMesh = new THREE.Mesh(poolWaterGeo, waterMat);
          poolWaterMesh.position.y = 0.15;
          furnGroup.add(poolWaterMesh);
        } else if (elem.type === 'EXTERIOR_PERGOLA' || elem.furnitureCategory === 'PERGOLA') {
          // 4 Corner Posts
          const postGeo = new THREE.BoxGeometry(0.5, elem.height, 0.5);
          const halfW = elem.width / 2 - 0.4;
          const halfL = elem.length / 2 - 0.4;
          for (let px of [-halfW, halfW]) {
            for (let pz of [-halfL, halfL]) {
              const post = new THREE.Mesh(postGeo, matteBlackMat);
              post.position.set(px, elem.height / 2, pz);
              post.castShadow = true;
              furnGroup.add(post);
            }
          }
          // Louver Rafters
          const rafterCount = 8;
          const rafterGeo = new THREE.BoxGeometry(elem.width, 0.3, 0.2);
          for (let i = 0; i < rafterCount; i++) {
            const rz = -halfL + (i / (rafterCount - 1)) * (halfL * 2);
            const rafter = new THREE.Mesh(rafterGeo, timberDeckMat);
            rafter.position.set(0, elem.height, rz);
            rafter.castShadow = true;
            furnGroup.add(rafter);
          }
        } else if (elem.type === 'EXTERIOR_DECK' || elem.furnitureCategory === 'DECKING') {
          const deckGeo = new THREE.BoxGeometry(elem.width, elem.height, elem.length);
          const deckMesh = new THREE.Mesh(deckGeo, timberDeckMat);
          deckMesh.position.y = elem.height / 2;
          deckMesh.receiveShadow = true;
          furnGroup.add(deckMesh);
        } else if (elem.type === 'EXTERIOR_TREE' || elem.furnitureCategory === 'TREE') {
          // Gnarled trunk
          const trunkGeo = new THREE.CylinderGeometry(0.4, 0.7, elem.height * 0.45, 12);
          const trunkMesh = new THREE.Mesh(trunkGeo, woodOakMat);
          trunkMesh.position.y = (elem.height * 0.45) / 2;
          trunkMesh.castShadow = true;
          furnGroup.add(trunkMesh);

          // Specimen canopy
          const canopyGeo1 = new THREE.DodecahedronGeometry(elem.width * 0.4);
          const canopyMesh1 = new THREE.Mesh(canopyGeo1, plantGreenMat);
          canopyMesh1.position.y = elem.height * 0.6;
          canopyMesh1.castShadow = true;
          furnGroup.add(canopyMesh1);

          const canopyGeo2 = new THREE.DodecahedronGeometry(elem.width * 0.3);
          const canopyMesh2 = new THREE.Mesh(canopyGeo2, plantGreenMat);
          canopyMesh2.position.set(0.6, elem.height * 0.8, 0.4);
          canopyMesh2.castShadow = true;
          furnGroup.add(canopyMesh2);
        } else if (elem.type === 'STAIRS' || elem.furnitureCategory === 'STAIRCASE') {
          // 10 Steps
          const stepCount = 10;
          const stepDepth = elem.length / stepCount;
          const stepHeight = elem.height / stepCount;
          for (let s = 0; s < stepCount; s++) {
            const stepGeo = new THREE.BoxGeometry(elem.width, stepHeight, stepDepth);
            const stepMesh = new THREE.Mesh(stepGeo, woodOakMat);
            stepMesh.position.set(
              0,
              s * stepHeight + stepHeight / 2,
              -elem.length / 2 + s * stepDepth + stepDepth / 2
            );
            stepMesh.castShadow = true;
            furnGroup.add(stepMesh);
          }
        } else if (elem.type === 'PRIMITIVE_CUBE' || elem.furnitureCategory === 'PRIMITIVE_CUBE') {
          const cubeGeo = new THREE.BoxGeometry(elem.width, elem.height, elem.length);
          const cubeMesh = new THREE.Mesh(cubeGeo, getElemMat());
          cubeMesh.position.y = elem.height / 2;
          cubeMesh.castShadow = true;
          cubeMesh.receiveShadow = true;
          furnGroup.add(cubeMesh);
        } else if (elem.type === 'PRIMITIVE_CYLINDER' || elem.furnitureCategory === 'PRIMITIVE_CYLINDER') {
          const cylGeo = new THREE.CylinderGeometry(elem.width / 2, elem.width / 2, elem.height, 32);
          const cylMesh = new THREE.Mesh(cylGeo, getElemMat());
          cylMesh.position.y = elem.height / 2;
          cylMesh.castShadow = true;
          cylMesh.receiveShadow = true;
          furnGroup.add(cylMesh);
        }
        // 3. High-Fidelity Parametric Architectural Archetypes
        else if (elem.furnitureCategory === 'SOFA') {
          // Base Seat cushion
          const seatGeo = new THREE.BoxGeometry(elem.width, 1.2, elem.length);
          const seatMesh = new THREE.Mesh(seatGeo, elem.materialType === 'leather' ? leatherMat : fabricMat);
          seatMesh.position.y = 0.6;
          seatMesh.castShadow = true;
          furnGroup.add(seatMesh);

          // Backrest
          const backGeo = new THREE.BoxGeometry(elem.width, 1.4, 0.8);
          const backMesh = new THREE.Mesh(backGeo, elem.materialType === 'leather' ? leatherMat : fabricMat);
          backMesh.position.set(0, 1.5, -elem.length / 2 + 0.4);
          backMesh.castShadow = true;
          furnGroup.add(backMesh);

          // Armrest left & right
          const armGeo = new THREE.BoxGeometry(0.6, 1.1, elem.length);
          const armLeft = new THREE.Mesh(armGeo, elem.materialType === 'leather' ? leatherMat : fabricMat);
          armLeft.position.set(-elem.width / 2 + 0.3, 0.8, 0);
          furnGroup.add(armLeft);
          const armRight = new THREE.Mesh(armGeo, elem.materialType === 'leather' ? leatherMat : fabricMat);
          armRight.position.set(elem.width / 2 - 0.3, 0.8, 0);
          furnGroup.add(armRight);
        } else if (elem.furnitureCategory === 'BED') {
          // Wooden platform frame
          const platGeo = new THREE.BoxGeometry(elem.width, 0.6, elem.length);
          const platMesh = new THREE.Mesh(platGeo, woodOakMat);
          platMesh.position.y = 0.3;
          platMesh.castShadow = true;
          furnGroup.add(platMesh);

          // Mattress
          const matGeo = new THREE.BoxGeometry(elem.width - 0.4, 0.8, elem.length - 0.4);
          const matMesh = new THREE.Mesh(matGeo, fabricMat);
          matMesh.position.y = 1.0;
          matMesh.castShadow = true;
          furnGroup.add(matMesh);

          // Headboard
          const hbGeo = new THREE.BoxGeometry(elem.width, 3.2, 0.6);
          const hbMesh = new THREE.Mesh(hbGeo, elem.materialType === 'leather' ? leatherMat : fabricMat);
          hbMesh.position.set(0, 1.6, -elem.length / 2 + 0.3);
          hbMesh.castShadow = true;
          furnGroup.add(hbMesh);

          // Pillows
          const pillowGeo = new THREE.BoxGeometry(1.8, 0.3, 1.2);
          const pLeft = new THREE.Mesh(pillowGeo, fabricMat);
          pLeft.position.set(-elem.width / 4, 1.5, -elem.length / 2 + 1.2);
          furnGroup.add(pLeft);
          const pRight = new THREE.Mesh(pillowGeo, fabricMat);
          pRight.position.set(elem.width / 4, 1.5, -elem.length / 2 + 1.2);
          furnGroup.add(pRight);
        } else if (elem.furnitureCategory === 'DESK') {
          // Desktop slab
          const topGeo = new THREE.BoxGeometry(elem.width, 0.2, elem.length);
          const topMesh = new THREE.Mesh(topGeo, woodOakMat);
          topMesh.position.y = elem.height - 0.1;
          topMesh.castShadow = true;
          furnGroup.add(topMesh);

          // Metal trestle legs
          const legGeo = new THREE.BoxGeometry(0.1, elem.height - 0.2, elem.length - 0.4);
          const leg1 = new THREE.Mesh(legGeo, matteBlackMat);
          leg1.position.set(-elem.width / 2 + 0.3, (elem.height - 0.2) / 2, 0);
          furnGroup.add(leg1);
          const leg2 = new THREE.Mesh(legGeo, matteBlackMat);
          leg2.position.set(elem.width / 2 - 0.3, (elem.height - 0.2) / 2, 0);
          furnGroup.add(leg2);

          // Desktop Laptop / Monitor display
          const monGeo = new THREE.BoxGeometry(2.0, 1.2, 0.1);
          const monMesh = new THREE.Mesh(monGeo, matteBlackMat);
          monMesh.position.set(0, elem.height + 0.6, 0);
          furnGroup.add(monMesh);
        } else if (elem.furnitureCategory === 'BATHTUB') {
          // Freestanding soaking oval tub
          const tubOuter = new THREE.CylinderGeometry(elem.width / 2, elem.width / 2.2, elem.height, 32);
          const tubMesh = new THREE.Mesh(tubOuter, marbleMat);
          tubMesh.position.y = elem.height / 2;
          tubMesh.castShadow = true;
          furnGroup.add(tubMesh);

          // Inner water pool
          const waterGeo = new THREE.CylinderGeometry(elem.width / 2 - 0.3, elem.width / 2.5, 0.1, 32);
          const waterMesh = new THREE.Mesh(waterGeo, glassMat);
          waterMesh.position.y = elem.height * 0.8;
          furnGroup.add(waterMesh);

          // Floor-standing chrome mixer spout
          const spoutGeo = new THREE.CylinderGeometry(0.08, 0.08, elem.height * 1.3, 16);
          const spoutMesh = new THREE.Mesh(spoutGeo, bronzeMat);
          spoutMesh.position.set(elem.width / 2 + 0.4, (elem.height * 1.3) / 2, 0);
          furnGroup.add(spoutMesh);
        } else if (elem.furnitureCategory === 'SANITARY') {
          // Floating stone vanity block
          const blockGeo = new THREE.BoxGeometry(elem.width, 1.2, elem.length);
          const blockMesh = new THREE.Mesh(blockGeo, marbleMat);
          blockMesh.position.y = elem.height - 0.6;
          blockMesh.castShadow = true;
          furnGroup.add(blockMesh);

          // Vessel basin
          const basinGeo = new THREE.CylinderGeometry(0.9, 0.8, 0.6, 24);
          const basinMesh = new THREE.Mesh(basinGeo, marbleMat);
          basinMesh.position.y = elem.height + 0.3;
          furnGroup.add(basinMesh);
        } else if (elem.furnitureCategory === 'KITCHEN_ISLAND') {
          // Monolithic stone island
          const islGeo = new THREE.BoxGeometry(elem.width, elem.height, elem.length);
          const islMesh = new THREE.Mesh(islGeo, marbleMat);
          islMesh.position.y = elem.height / 2;
          islMesh.castShadow = true;
          furnGroup.add(islMesh);

          // Recessed oak breakfast plinth
          const plinthGeo = new THREE.BoxGeometry(elem.width - 0.8, 0.3, elem.length + 0.8);
          const plinthMesh = new THREE.Mesh(plinthGeo, woodOakMat);
          plinthMesh.position.set(0, elem.height - 0.15, 0);
          furnGroup.add(plinthMesh);
        } else if (elem.furnitureCategory === 'PLANT') {
          // Artisan bronze or ceramic pot
          const potGeo = new THREE.CylinderGeometry(elem.width / 2.5, elem.width / 3.5, 2.2, 24);
          const potMesh = new THREE.Mesh(potGeo, bronzeMat);
          potMesh.position.y = 1.1;
          potMesh.castShadow = true;
          furnGroup.add(potMesh);

          // Trunk stem
          const trunkGeo = new THREE.CylinderGeometry(0.12, 0.18, 4.0, 12);
          const trunkMesh = new THREE.Mesh(trunkGeo, woodOakMat);
          trunkMesh.position.y = 4.0;
          furnGroup.add(trunkMesh);

          // Foliage foliage spheres
          const leaf1 = new THREE.Mesh(new THREE.DodecahedronGeometry(elem.width / 2.2), plantGreenMat);
          leaf1.position.set(0, 5.0, 0);
          furnGroup.add(leaf1);
          const leaf2 = new THREE.Mesh(new THREE.DodecahedronGeometry(elem.width / 2.8), plantGreenMat);
          leaf2.position.set(0.4, 6.2, 0.2);
          furnGroup.add(leaf2);
        } else if (elem.furnitureCategory === 'BOOKSHELF') {
          // Architectural open shelving
          const shelfGeo = new THREE.BoxGeometry(elem.width, elem.height, elem.length);
          const shelfMesh = new THREE.Mesh(shelfGeo, woodOakMat);
          shelfMesh.position.y = elem.height / 2;
          shelfMesh.castShadow = true;
          furnGroup.add(shelfMesh);
        } else if (elem.furnitureCategory === 'CHAIR' || elem.furnitureCategory === 'EXTERIOR_LOUNGER') {
          // Dining or task chair or lounger
          const seatGeo = new THREE.BoxGeometry(elem.width, 0.2, elem.length);
          const seatMesh = new THREE.Mesh(seatGeo, fabricMat);
          seatMesh.position.y = 1.2;
          seatMesh.castShadow = true;
          furnGroup.add(seatMesh);

          const backGeo = new THREE.BoxGeometry(elem.width, 1.2, 0.2);
          const backMesh = new THREE.Mesh(backGeo, woodOakMat);
          backMesh.position.set(0, 1.8, -elem.length / 2 + 0.1);
          furnGroup.add(backMesh);

          // Legs
          const legGeo = new THREE.CylinderGeometry(0.05, 0.04, 1.2);
          for (let dx of [-elem.width / 2 + 0.2, elem.width / 2 - 0.2]) {
            for (let dz of [-elem.length / 2 + 0.2, elem.length / 2 - 0.2]) {
              const leg = new THREE.Mesh(legGeo, matteBlackMat);
              leg.position.set(dx, 0.6, dz);
              furnGroup.add(leg);
            }
          }
        } else if (elem.furnitureCategory === 'DINING_TABLE' || elem.furnitureCategory === 'COFFEE_TABLE') {
          const isCoffee = elem.furnitureCategory === 'COFFEE_TABLE';
          const topH = isCoffee ? 0.3 : 0.2;
          const tableH = elem.height;

          // Slab Top (Marble or Travertine)
          const topGeo = new THREE.CylinderGeometry(elem.width / 2, elem.width / 2, topH, 32);
          const topMesh = new THREE.Mesh(topGeo, marbleMat);
          topMesh.position.y = tableH - topH / 2;
          topMesh.castShadow = true;
          furnGroup.add(topMesh);

          // Bronze Base Plinth
          const baseGeo = new THREE.CylinderGeometry(elem.width / 4, elem.width / 3.5, tableH - topH, 24);
          const baseMesh = new THREE.Mesh(baseGeo, bronzeMat);
          baseMesh.position.y = (tableH - topH) / 2;
          baseMesh.castShadow = true;
          furnGroup.add(baseMesh);
        } else if (elem.furnitureCategory === 'ARMCHAIR') {
          const chairGeo = new THREE.BoxGeometry(elem.width, elem.height, elem.length);
          const chairMesh = new THREE.Mesh(chairGeo, elem.materialType === 'leather' ? leatherMat : woodOakMat);
          chairMesh.position.y = elem.height / 2;
          chairMesh.castShadow = true;
          furnGroup.add(chairMesh);
        } else if (elem.furnitureCategory === 'CREDENZA') {
          const credGeo = new THREE.BoxGeometry(elem.width, elem.height, elem.length);
          const credMesh = new THREE.Mesh(credGeo, woodOakMat);
          credMesh.position.y = elem.height / 2;
          credMesh.castShadow = true;
          furnGroup.add(credMesh);
        } else if (elem.furnitureCategory === 'LAMP') {
          // Pendant linear chandelier
          const rodGeo = new THREE.CylinderGeometry(0.05, 0.05, 3.5);
          const rodMesh = new THREE.Mesh(rodGeo, bronzeMat);
          rodMesh.position.y = elem.height + 1.75;
          furnGroup.add(rodMesh);

          const barGeo = new THREE.BoxGeometry(elem.width, 0.3, elem.length);
          const barMesh = new THREE.Mesh(barGeo, bronzeMat);
          barMesh.position.y = elem.height;
          furnGroup.add(barMesh);

          // Glowing point light
          const pLight = new THREE.PointLight(0xffeaad, 1.5, 15);
          pLight.position.y = elem.height - 0.5;
          furnGroup.add(pLight);
        } else {
          // Generic placeholder volume
          const genGeo = new THREE.BoxGeometry(elem.width, elem.height, elem.length);
          const genMesh = new THREE.Mesh(genGeo, getElemMat());
          genMesh.position.y = elem.height / 2;
          genMesh.castShadow = true;
          furnGroup.add(genMesh);
        }

        // Selection Wireframe Outline
        if (isSelected) {
          const outlineGeo = new THREE.BoxGeometry(elem.width + 0.15, elem.height + 0.15, elem.length + 0.15);
          const outlineMat = new THREE.MeshBasicMaterial({ color: '#D4AF37', wireframe: true });
          const outline = new THREE.Mesh(outlineGeo, outlineMat);
          outline.position.y = elem.height / 2;
          furnGroup.add(outline);
        }

        scene.add(furnGroup);
      }
    });
  }, [elements, shadingMode, cutawayHeightRatio, ceilingHeightFt, roomLengthFt, roomWidthFt, activeLayers, selectedElementId]);

  // Handle Camera Presets
  const setPresetView = (preset: 'ISOMETRIC' | 'TOP' | 'EYE_LEVEL' | 'FRONT') => {
    setCameraPreset(preset);
    const target = new THREE.Vector3(roomLengthFt / 2, 0, roomWidthFt / 2);
    cameraTargetRef.current = target;

    if (preset === 'ISOMETRIC') {
      cameraSphericalRef.current = {
        radius: Math.max(roomLengthFt, roomWidthFt) * 1.4,
        theta: Math.PI / 4,
        phi: Math.PI / 3.2
      };
    } else if (preset === 'TOP') {
      cameraSphericalRef.current = {
        radius: Math.max(roomLengthFt, roomWidthFt) * 1.5,
        theta: 0,
        phi: 0.05 // Almost direct top-down
      };
    } else if (preset === 'EYE_LEVEL') {
      cameraSphericalRef.current = {
        radius: Math.max(roomLengthFt, roomWidthFt) * 0.9,
        theta: Math.PI / 3,
        phi: Math.PI / 2.2 // Horizontal eye level
      };
    } else if (preset === 'FRONT') {
      cameraSphericalRef.current = {
        radius: Math.max(roomLengthFt, roomWidthFt) * 1.3,
        theta: 0,
        phi: Math.PI / 2.3
      };
    }
    updateCameraPosition();
  };

  // Mouse Orbit Drag Event Handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button === 0) {
      isDraggingRef.current = true;
      isPanningRef.current = e.shiftKey;
    } else if (e.button === 2) {
      isDraggingRef.current = true;
      isPanningRef.current = true;
    }
    prevMousePosRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingRef.current) return;
    const deltaX = e.clientX - prevMousePosRef.current.x;
    const deltaY = e.clientY - prevMousePosRef.current.y;
    prevMousePosRef.current = { x: e.clientX, y: e.clientY };

    if (isPanningRef.current) {
      // Pan camera target
      const factor = 0.05;
      cameraTargetRef.current.x -= deltaX * factor;
      cameraTargetRef.current.z -= deltaY * factor;
    } else {
      // Orbit rotation
      cameraSphericalRef.current.theta -= deltaX * 0.008;
      cameraSphericalRef.current.phi = Math.max(
        0.05,
        Math.min(Math.PI / 2 - 0.02, cameraSphericalRef.current.phi + deltaY * 0.008)
      );
    }
    updateCameraPosition();
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
    isPanningRef.current = false;
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const zoomDelta = e.deltaY * 0.05;
    cameraSphericalRef.current.radius = Math.max(
      10,
      Math.min(120, cameraSphericalRef.current.radius + zoomDelta)
    );
    updateCameraPosition();
  };

  // Capture High-Res Screenshot Render
  const handleTakeSnapshot = () => {
    if (!rendererRef.current) return;
    const dataUrl = rendererRef.current.domElement.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = `vertex_3d_render_${Date.now()}.png`;
    a.click();
    addToast('success', 'Captured 3D photorealistic perspective render (PNG)');
  };

  return (
    <div className="relative w-full h-full bg-[#12100D] rounded-2xl overflow-hidden border border-[#2C2416] select-none flex flex-col">
      {/* 3D Viewport Controls Ribbon */}
      <div className="bg-[#1C1814] px-4 py-2.5 border-b border-[#332A1E] flex flex-wrap items-center justify-between gap-3 z-20">
        {/* Shading & Render Archetype */}
        <div className="flex items-center gap-1.5 bg-black/40 p-1 rounded-xl border border-white/10 text-xs font-mono">
          {(['REALISTIC', 'CLAY', 'WIREFRAME'] as const).map(mode => (
            <button
              key={mode}
              type="button"
              onClick={() => setShadingMode(mode)}
              className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                shadingMode === mode
                  ? 'bg-[#D4AF37] text-black font-bold shadow-xs'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {mode === 'REALISTIC' ? 'PBR Luxury' : mode === 'CLAY' ? 'Clay Study' : 'BIM Wireframe'}
            </button>
          ))}
        </div>

        {/* Camera Views Selector */}
        <div className="flex items-center gap-1 bg-black/40 p-1 rounded-xl border border-white/10 text-xs font-mono">
          {[
            { id: 'ISOMETRIC', label: 'Iso 45°' },
            { id: 'TOP', label: 'Top Plan' },
            { id: 'EYE_LEVEL', label: 'Interior Walk' },
            { id: 'FRONT', label: 'Elevation' }
          ].map(view => (
            <button
              key={view.id}
              type="button"
              onClick={() => setPresetView(view.id as any)}
              className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                cameraPreset === view.id
                  ? 'bg-white/20 text-[#D4AF37] font-bold'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {view.label}
            </button>
          ))}
        </div>

        {/* Sunlight Simulation & Cutaway Controls */}
        <div className="flex items-center gap-4 text-xs font-mono text-gray-300">
          {/* Time of Day Slider */}
          <div className="flex items-center gap-2">
            <Sun className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span className="text-[11px] text-gray-400">
              Sun: <strong className="text-white">{timeOfDay}:00</strong>
            </span>
            <input
              type="range"
              min="8"
              max="18"
              step="0.5"
              value={timeOfDay}
              onChange={e => setTimeOfDay(Number(e.target.value))}
              className="w-20 accent-[#D4AF37] cursor-pointer"
            />
          </div>

          {/* Wall Cutaway Height */}
          <div className="flex items-center gap-2">
            <Sliders className="w-3.5 h-3.5 text-gray-400" />
            <span className="text-[11px] text-gray-400">
              Cutaway: <strong className="text-white">{Math.round(cutawayHeightRatio * 100)}%</strong>
            </span>
            <input
              type="range"
              min="0.2"
              max="1.0"
              step="0.05"
              value={cutawayHeightRatio}
              onChange={e => setCutawayHeightRatio(Number(e.target.value))}
              className="w-16 accent-[#D4AF37] cursor-pointer"
            />
          </div>

          {/* Screenshot Action */}
          <button
            type="button"
            onClick={handleTakeSnapshot}
            className="p-1.5 rounded-xl bg-black/40 hover:bg-white/10 text-gray-300 hover:text-white border border-white/10 flex items-center gap-1 cursor-pointer transition-colors"
            title="Export 3D Render Snapshot"
          >
            <Camera className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span className="text-[10px] font-mono hidden md:inline">Snapshot</span>
          </button>

          {/* Maximize Window Toggle Button */}
          {onToggleMaximize && (
            <button
              type="button"
              onClick={onToggleMaximize}
              className={`p-1.5 rounded-xl border flex items-center gap-1 font-mono text-xs cursor-pointer transition-all ${
                isMaximized
                  ? 'bg-[#D4AF37] text-black border-[#D4AF37] font-bold shadow-md'
                  : 'bg-black/40 hover:bg-white/10 text-[#D4AF37] border-white/10'
              }`}
              title={isMaximized ? 'Minimize Window (Ctrl+Space)' : 'Maximize Window (Ctrl+Space)'}
            >
              {isMaximized ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
              <span className="text-[10px] font-mono hidden md:inline">{isMaximized ? 'Minimize' : 'Maximize'}</span>
            </button>
          )}
        </div>
      </div>

      {/* WebGL Canvas Container */}
      <div
        ref={mountRef}
        className="flex-1 w-full min-h-[500px] h-full cursor-grab active:cursor-grabbing relative"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onWheel={handleWheel}
        onContextMenu={e => e.preventDefault()}
      />

      {/* 3D Workspace HUD Overlay */}
      <div className="absolute bottom-3 left-3 bg-black/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10 text-[11px] font-mono text-gray-400 pointer-events-none z-10 flex items-center gap-3">
        <span>Orbit: <strong className="text-gray-200">Left Drag</strong></span>
        <span>Pan: <strong className="text-gray-200">Right Drag / Shift+Drag</strong></span>
        <span>Zoom: <strong className="text-gray-200">Scroll</strong></span>
      </div>

      <div className="absolute bottom-3 right-3 bg-black/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-[#D4AF37]/30 text-[10px] font-mono text-[#D4AF37] pointer-events-none z-10">
        WebGL 2.0 • Hardware Accelerated PBR
      </div>
    </div>
  );
};
