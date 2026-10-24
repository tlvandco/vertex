import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import {
  StudioElement,
  ViewportMode,
  ActiveTool,
  DEFAULT_STUDIO_ELEMENTS,
  ElementType,
  FurnitureCategory,
  StudioMaterialType
} from './types';
import { EngineeringConfig, DEFAULT_ENGINEERING_CONFIG } from '../tools/types';
import { CAD2DCanvas } from './CAD2DCanvas';
import { BIM3DWorkspace } from './BIM3DWorkspace';
import { LayoutGeneratorModal } from './LayoutGeneratorModal';
import { OpenMarketModal } from './OpenMarketModal';
import { CivilStructuralStudio } from '../tools/CivilStructuralStudio';
import { InteriorDesignStudio } from '../tools/InteriorDesignStudio';
import { ArchitectZoningStudio } from '../tools/ArchitectZoningStudio';
import { EngineeringConfigPanel } from '../tools/EngineeringConfigPanel';
import {
  Box,
  Compass,
  Layers,
  Sparkles,
  Sliders,
  Maximize2,
  Minimize2,
  Columns,
  Download,
  Upload,
  RotateCw,
  RotateCcw,
  Trash2,
  Copy,
  FolderOpen,
  CheckCircle2,
  HardHat,
  Building,
  Palette,
  FileSpreadsheet,
  FileCode,
  Shield,
  HelpCircle,
  Eye,
  Grid,
  Store,
  Undo2,
  Redo2,
  Globe,
  Sun,
  Trees,
  Waves,
  ChevronDown,
  ChevronRight,
  Disc,
  ArrowUpRight,
  AlignJustify,
  Check,
  Lock,
  Unlock,
  Type,
  Square,
  Plus,
  BookOpen
} from 'lucide-react';
import { DesignGuidelineAndTutorialModal } from './DesignGuidelineAndTutorialModal';

// Curated Architectural Swatches for Interior & Exterior
const COLOR_SWATCHES = [
  { name: 'Warm Alabaster', hex: '#F4F1EA', mat: 'plaster' as StudioMaterialType },
  { name: 'French Grey', hex: '#8E8D8A', mat: 'concrete' as StudioMaterialType },
  { name: 'Smoked Oak', hex: '#5C4834', mat: 'oak' as StudioMaterialType },
  { name: 'American Walnut', hex: '#3B2F2F', mat: 'walnut' as StudioMaterialType },
  { name: 'Navona Travertine', hex: '#D4CBB8', mat: 'travertine' as StudioMaterialType },
  { name: 'Calacatta Vagli', hex: '#F5F5F3', mat: 'marble' as StudioMaterialType },
  { name: 'Siena Terracotta', hex: '#B85D3A', mat: 'ceramic' as StudioMaterialType },
  { name: 'Nordic Sage', hex: '#7C8B7A', mat: 'plaster' as StudioMaterialType },
  { name: 'Cognac Leather', hex: '#653B20', mat: 'leather' as StudioMaterialType },
  { name: 'Architectural Bronze', hex: '#9C7A3C', mat: 'bronze' as StudioMaterialType },
  { name: 'Matte Obsidian', hex: '#1C1A17', mat: 'matte_black' as StudioMaterialType },
  { name: 'Azure Pool Water', hex: '#2EA5A8', mat: 'water' as StudioMaterialType },
  { name: 'Ipe Sun Decking', hex: '#5C3E28', mat: 'timber_deck' as StudioMaterialType },
  { name: 'Biophilic Foliage', hex: '#2D4E2A', mat: 'grass' as StudioMaterialType }
];

// Comprehensive Object Creation Catalog for Interior & Exterior
interface CatalogCategory {
  title: string;
  domain: 'interior' | 'exterior';
  items: {
    name: string;
    type: ElementType;
    furnitureCategory?: FurnitureCategory;
    domain: 'interior' | 'exterior';
    layer: 'architecture' | 'structure' | 'furniture' | 'annotation';
    width: number;
    length: number;
    height: number;
    color: string;
    materialName: string;
    materialType: StudioMaterialType;
    cost: number;
    csiCode: string;
  }[];
}

const OBJECT_CREATION_CATALOG: CatalogCategory[] = [
  {
    title: 'Interior Architecture',
    domain: 'interior',
    items: [
      {
        name: 'Interior Partition Wall',
        type: 'WALL',
        domain: 'interior',
        layer: 'architecture',
        width: 12,
        length: 0.5,
        height: 11,
        color: '#E4DFD5',
        materialName: 'Venetian Plaster Partition',
        materialType: 'plaster',
        cost: 1140,
        csiCode: '09 22 16'
      },
      {
        name: 'Floor-to-Ceiling Glazed Wall',
        type: 'WALL',
        domain: 'interior',
        layer: 'architecture',
        width: 12,
        length: 0.5,
        height: 11,
        color: '#B0C4DE',
        materialName: 'Acoustic Architectural Glazing',
        materialType: 'glass',
        cost: 2640,
        csiCode: '08 44 00'
      },
      {
        name: 'Pivot Architectural Door',
        type: 'DOOR',
        domain: 'interior',
        layer: 'architecture',
        width: 3.5,
        length: 0.5,
        height: 9.0,
        color: '#4A3B2C',
        materialName: 'Quarter-Sawn Smoked Oak',
        materialType: 'oak',
        cost: 2800,
        csiCode: '08 14 00'
      },
      {
        name: 'Ribbon Architectural Window',
        type: 'WINDOW',
        domain: 'interior',
        layer: 'architecture',
        width: 8.0,
        length: 0.5,
        height: 5.0,
        color: '#87CEEB',
        materialName: 'Double-Glazed Low-E Glass',
        materialType: 'glass',
        cost: 3800,
        csiCode: '08 51 00'
      },
      {
        name: 'Concrete Structural Column',
        type: 'COLUMN',
        domain: 'interior',
        layer: 'structure',
        width: 1.5,
        length: 1.5,
        height: 11,
        color: '#A09C94',
        materialName: 'Fair-Faced Concrete Column',
        materialType: 'concrete',
        cost: 2100,
        csiCode: '03 30 00'
      },
      {
        name: 'Floating Architectural Staircase',
        type: 'STAIRS',
        furnitureCategory: 'STAIRCASE',
        domain: 'interior',
        layer: 'architecture',
        width: 4.0,
        length: 12.0,
        height: 10.0,
        color: '#5C4834',
        materialName: 'Smoked Oak Treads & Steel Stringer',
        materialType: 'oak',
        cost: 16500,
        csiCode: '05 51 00'
      }
    ]
  },
  {
    title: 'Interior Furniture & FF&E',
    domain: 'interior',
    items: [
      {
        name: 'Minotti Connery Sectional Sofa',
        type: 'FURNITURE',
        furnitureCategory: 'SOFA',
        domain: 'interior',
        layer: 'furniture',
        width: 11.5,
        length: 5.5,
        height: 2.8,
        color: '#DDD7CC',
        materialName: 'Loro Piana Wool Bouclé',
        materialType: 'boucle',
        cost: 24500,
        csiCode: '12 52 00'
      },
      {
        name: 'Eames Lounge Armchair & Ottoman',
        type: 'FURNITURE',
        furnitureCategory: 'ARMCHAIR',
        domain: 'interior',
        layer: 'furniture',
        width: 3.2,
        length: 3.2,
        height: 2.7,
        color: '#653B20',
        materialName: 'Cognac Saddle Leather & Walnut',
        materialType: 'leather',
        cost: 7200,
        csiCode: '12 52 13'
      },
      {
        name: 'Poliform Concorde Dining Table',
        type: 'FURNITURE',
        furnitureCategory: 'DINING_TABLE',
        domain: 'interior',
        layer: 'furniture',
        width: 9.0,
        length: 4.0,
        height: 2.5,
        color: '#F5F5F3',
        materialName: 'Calacatta Vagli Marble & Walnut',
        materialType: 'marble',
        cost: 16800,
        csiCode: '12 51 16'
      },
      {
        name: 'Cassina Executive Desk',
        type: 'FURNITURE',
        furnitureCategory: 'DESK',
        domain: 'interior',
        layer: 'furniture',
        width: 6.5,
        length: 3.2,
        height: 2.5,
        color: '#3B2F2F',
        materialName: 'American Black Walnut & Leather',
        materialType: 'walnut',
        cost: 9800,
        csiCode: '12 51 16'
      },
      {
        name: 'B&B Italia Tufty King Platform Bed',
        type: 'FURNITURE',
        furnitureCategory: 'BED',
        domain: 'interior',
        layer: 'furniture',
        width: 7.2,
        length: 7.5,
        height: 3.0,
        color: '#CCC7BF',
        materialName: 'Tufted Belgian Linen',
        materialType: 'boucle',
        cost: 15400,
        csiCode: '12 54 00'
      },
      {
        name: 'antoniolupi Freestanding Soaking Tub',
        type: 'FURNITURE',
        furnitureCategory: 'BATHTUB',
        domain: 'interior',
        layer: 'furniture',
        width: 5.8,
        length: 3.0,
        height: 2.0,
        color: '#FFFFFF',
        materialName: 'Cristalmood Translucent Resin',
        materialType: 'ceramic',
        cost: 18200,
        csiCode: '22 41 16'
      },
      {
        name: 'Monolithic Stone Kitchen Island',
        type: 'FURNITURE',
        furnitureCategory: 'KITCHEN_ISLAND',
        domain: 'interior',
        layer: 'furniture',
        width: 12.0,
        length: 4.2,
        height: 3.0,
        color: '#D4CBB8',
        materialName: 'Navona Travertine Monolith',
        materialType: 'travertine',
        cost: 28500,
        csiCode: '12 36 00'
      },
      {
        name: 'Flos Arco Floor Lamp',
        type: 'LIGHT',
        furnitureCategory: 'LAMP',
        domain: 'interior',
        layer: 'furniture',
        width: 2.0,
        length: 6.5,
        height: 7.8,
        color: '#9C7A3C',
        materialName: 'Carrera Base & Polished Bronze',
        materialType: 'bronze',
        cost: 4100,
        csiCode: '26 51 00'
      }
    ]
  },
  {
    title: 'Exterior Architecture & Landscape',
    domain: 'exterior',
    items: [
      {
        name: 'Resort Infinity Lap Pool',
        type: 'EXTERIOR_POOL',
        furnitureCategory: 'POOL',
        domain: 'exterior',
        layer: 'architecture',
        width: 18.0,
        length: 9.0,
        height: 4.5,
        color: '#2EA5A8',
        materialName: 'Travertine Rim & Azure Basin',
        materialType: 'water',
        cost: 48000,
        csiCode: '13 11 00'
      },
      {
        name: 'Brazilian Ipe Hardwood Sun Deck',
        type: 'EXTERIOR_DECK',
        furnitureCategory: 'DECKING',
        domain: 'exterior',
        layer: 'architecture',
        width: 20.0,
        length: 12.0,
        height: 0.5,
        color: '#5C3E28',
        materialName: 'Brazilian Ipe Hardwood Decking',
        materialType: 'timber_deck',
        cost: 16500,
        csiCode: '06 15 00'
      },
      {
        name: 'Cantilevered Louver Pergola',
        type: 'EXTERIOR_PERGOLA',
        furnitureCategory: 'PERGOLA',
        domain: 'exterior',
        layer: 'architecture',
        width: 16.0,
        length: 12.0,
        height: 9.5,
        color: '#1C1A17',
        materialName: 'Matte Black Anodized Aluminium',
        materialType: 'matte_black',
        cost: 21500,
        csiCode: '10 73 16'
      },
      {
        name: 'Specimen Acer Japanese Maple',
        type: 'EXTERIOR_TREE',
        furnitureCategory: 'TREE',
        domain: 'exterior',
        layer: 'furniture',
        width: 6.5,
        length: 6.5,
        height: 14.0,
        color: '#2D4E2A',
        materialName: 'Mature Japanese Red Maple',
        materialType: 'grass',
        cost: 5800,
        csiCode: '32 93 00'
      },
      {
        name: 'Exterior Teak Double Sun Lounger',
        type: 'FURNITURE',
        furnitureCategory: 'EXTERIOR_LOUNGER',
        domain: 'exterior',
        layer: 'furniture',
        width: 6.5,
        length: 6.5,
        height: 1.5,
        color: '#776655',
        materialName: 'Natural Teak & Sunbrella Fabric',
        materialType: 'timber_deck',
        cost: 6400,
        csiCode: '12 52 00'
      }
    ]
  },
  {
    title: 'Mesh Primitives',
    domain: 'interior',
    items: [
      {
        name: 'Mesh Primitive Cube',
        type: 'PRIMITIVE_CUBE',
        furnitureCategory: 'PRIMITIVE_CUBE',
        domain: 'interior',
        layer: 'furniture',
        width: 3.0,
        length: 3.0,
        height: 3.0,
        color: '#D4AF37',
        materialName: 'PBR Cube Primitive',
        materialType: 'bronze',
        cost: 500,
        csiCode: '00 00 00'
      },
      {
        name: 'Mesh Primitive Cylinder',
        type: 'PRIMITIVE_CYLINDER',
        furnitureCategory: 'PRIMITIVE_CYLINDER',
        domain: 'interior',
        layer: 'furniture',
        width: 3.0,
        length: 3.0,
        height: 4.0,
        color: '#9C7A3C',
        materialName: 'PBR Cylinder Primitive',
        materialType: 'bronze',
        cost: 500,
        csiCode: '00 00 00'
      }
    ]
  }
];

export const UnifiedStudioWorkstation: React.FC = () => {
  const { projects, addToast } = useApp();
  const [selectedProjectId, setSelectedProjectId] = useState<string>(projects[0]?.id || 'proj-default');

  // Active Project Context
  const activeProject = useMemo(() => {
    return projects.find(p => p.id === selectedProjectId) || projects[0] || {
      id: 'proj-default',
      name: 'Beverly Hills Penthouse Salon',
      clientName: 'Sterling Heritage Trust',
      budget: 185000
    };
  }, [projects, selectedProjectId]);

  // Spatial Dimensions for Active Workstation
  const [roomLengthFt, setRoomLengthFt] = useState<number>(36);
  const [roomWidthFt, setRoomWidthFt] = useState<number>(28);
  const [ceilingHeightFt, setCeilingHeightFt] = useState<number>(11);

  // Active Elements State with Undo/Redo History
  const [elements, setElements] = useState<StudioElement[]>(DEFAULT_STUDIO_ELEMENTS);
  const [history, setHistory] = useState<StudioElement[][]>([DEFAULT_STUDIO_ELEMENTS]);
  const [historyIndex, setHistoryIndex] = useState<number>(0);

  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);

  // Workspace Viewport Mode
  const [viewportMode, setViewportMode] = useState<ViewportMode>('2D_CAD');
  const [activeTool, setActiveTool] = useState<ActiveTool>('SELECT');

  // Maximize / Minimize Window State (Blender Mode)
  const [isMaximized, setIsMaximized] = useState<boolean>(false);

  // Domain Filter (Interior, Exterior, All)
  const [activeDomain, setActiveDomain] = useState<'all' | 'interior' | 'exterior'>('all');

  // Inspector Tabs (Blender N-Panel tabs)
  const [activeSidebarTab, setActiveSidebarTab] = useState<'TRANSFORM' | 'GAPS' | 'SHADING' | 'OUTLINER' | 'SYSTEM'>('TRANSFORM');

  // Add Object Menu dropdown
  const [isAddMenuOpen, setIsAddMenuOpen] = useState<boolean>(false);

  // Engineering Config & Modals
  const [config, setConfig] = useState<EngineeringConfig>(DEFAULT_ENGINEERING_CONFIG);
  const [isConfigDrawerOpen, setIsConfigDrawerOpen] = useState<boolean>(false);
  const [isLayoutGeneratorOpen, setIsLayoutGeneratorOpen] = useState<boolean>(false);
  const [isOpenMarketModalOpen, setIsOpenMarketModalOpen] = useState<boolean>(false);
  const [isTutorialModalOpen, setIsTutorialModalOpen] = useState<boolean>(false);

  // Overlays & Layers
  const [showClearances, setShowClearances] = useState<boolean>(true);
  const [showDimensions, setShowDimensions] = useState<boolean>(true);
  const [activeLayers, setActiveLayers] = useState({
    architecture: true,
    structure: true,
    furniture: true,
    annotation: true
  });

  // Hotkey: Ctrl+Space toggles window maximize/minimize (Official Blender Shortcut!)
  useEffect(() => {
    const handleGlobalKeys = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if ((e.ctrlKey || e.metaKey) && e.code === 'Space') {
        e.preventDefault();
        setIsMaximized(prev => {
          const next = !prev;
          addToast('info', next ? 'Window Maximized (Blender Pro View)' : 'Window Restored');
          return next;
        });
      }
    };
    window.addEventListener('keydown', handleGlobalKeys);
    return () => window.removeEventListener('keydown', handleGlobalKeys);
  }, [addToast]);

  // Push State to History
  const pushState = (newElements: StudioElement[]) => {
    const nextHistory = history.slice(0, historyIndex + 1);
    nextHistory.push(newElements);
    setHistory(nextHistory);
    setHistoryIndex(nextHistory.length - 1);
    setElements(newElements);
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      const prevIdx = historyIndex - 1;
      setHistoryIndex(prevIdx);
      setElements(history[prevIdx]);
      addToast('info', 'Undo action');
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const nextIdx = historyIndex + 1;
      setHistoryIndex(nextIdx);
      setElements(history[nextIdx]);
      addToast('info', 'Redo action');
    }
  };

  // Keyboard shortcut for Undo/Redo
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        e.preventDefault();
        if (e.shiftKey) handleRedo();
        else handleUndo();
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
        e.preventDefault();
        handleRedo();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [historyIndex, history]);

  // CRUD Operations on Elements
  const handleUpdateElement = (id: string, updates: Partial<StudioElement>) => {
    const updated = elements.map(el => (el.id === id ? { ...el, ...updates } : el));
    pushState(updated);
  };

  const handleAddElement = (newElem: StudioElement) => {
    const next = [...elements, newElem];
    pushState(next);
    setSelectedElementId(newElem.id);
    addToast('success', `Added ${newElem.name} to workspace`);
  };

  const handleDeleteElement = (id: string) => {
    const next = elements.filter(el => el.id !== id);
    pushState(next);
    if (selectedElementId === id) setSelectedElementId(null);
    addToast('info', 'Removed element');
  };

  // 1-Click insertion from Object Creation Catalog
  const handleInsertFromCatalog = (item: CatalogCategory['items'][0]) => {
    const newElem: StudioElement = {
      id: `${item.type.toLowerCase()}-${Date.now()}`,
      name: item.name,
      type: item.type,
      furnitureCategory: item.furnitureCategory,
      domain: item.domain,
      layer: item.layer,
      x: roomLengthFt / 2,
      y: roomWidthFt / 2,
      z: 0,
      width: item.width,
      length: item.length,
      height: item.height,
      rotation: 0,
      color: item.color,
      materialName: item.materialName,
      materialType: item.materialType,
      cost: item.cost,
      csiCode: item.csiCode,
      lrv: 50,
      clearanceRadiusFt: 3.0
    };
    handleAddElement(newElem);
    setIsAddMenuOpen(false);
  };

  // Algorithmic Layout Application
  const handleApplyLayout = (
    newElements: StudioElement[],
    widthFt: number,
    lengthFt: number,
    ceilingFt: number,
    layoutTitle: string
  ) => {
    setRoomLengthFt(widthFt);
    setRoomWidthFt(lengthFt);
    setCeilingHeightFt(ceilingFt);
    setElements(newElements);
    setSelectedElementId(null);
    addToast('success', `Populated ${layoutTitle} into project`);
  };

  // Industry Export Handlers
  const handleExportDXF = () => {
    let dxfContent = '0\nSECTION\n2\nHEADER\n0\nENDSEC\n0\nSECTION\n2\nENTITIES\n';
    elements.forEach(elem => {
      if (elem.type === 'WALL') {
        const x1 = (elem.x - elem.width / 2) * 12;
        const y1 = (elem.y - elem.length / 2) * 12;
        const x2 = (elem.x + elem.width / 2) * 12;
        const y2 = (elem.y + elem.length / 2) * 12;
        dxfContent += `0\nLINE\n8\nA-WALL\n10\n${x1}\n20\n${y1}\n30\n0.0\n11\n${x2}\n21\n${y2}\n31\n0.0\n`;
      } else if (elem.type === 'DOOR') {
        dxfContent += `0\nPOINT\n8\nA-DOOR\n10\n${elem.x * 12}\n20\n${elem.y * 12}\n30\n0.0\n`;
      } else {
        dxfContent += `0\nTEXT\n8\nI-FURN\n10\n${elem.x * 12}\n20\n${elem.y * 12}\n30\n0.0\n40\n6.0\n1\n${elem.name}\n`;
      }
    });
    dxfContent += '0\nENDSEC\n0\nEOF\n';
    const blob = new Blob([dxfContent], { type: 'application/dxf' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `project_${selectedProjectId}_draft.dxf`;
    a.click();
    addToast('success', 'Exported AutoCAD Drawing (.DXF)');
  };

  const handleExportOBJ = () => {
    let obj = `# StudioCAD BIM 4.0 Wavefront 3D OBJ Export\n# Project: ${activeProject.name}\n`;
    let vOffset = 1;
    elements.forEach(elem => {
      const halfW = elem.width / 2;
      const halfL = elem.length / 2;
      const h = elem.height;
      obj += `o ${elem.name.replace(/\s+/g, '_')}\n`;
      const corners = [
        [-halfW, 0, -halfL],
        [halfW, 0, -halfL],
        [halfW, 0, halfL],
        [-halfW, 0, halfL],
        [-halfW, h, -halfL],
        [halfW, h, -halfL],
        [halfW, h, halfL],
        [-halfW, h, halfL]
      ];
      corners.forEach(([cx, cy, cz]) => {
        const rad = (elem.rotation * Math.PI) / 180;
        const rx = cx * Math.cos(rad) - cz * Math.sin(rad);
        const rz = cx * Math.sin(rad) + cz * Math.cos(rad);
        obj += `v ${(elem.x + rx).toFixed(3)} ${(elem.z + cy).toFixed(3)} ${(elem.y + rz).toFixed(3)}\n`;
      });
      obj += `f ${vOffset} ${vOffset + 1} ${vOffset + 2} ${vOffset + 3}\n`;
      obj += `f ${vOffset + 4} ${vOffset + 5} ${vOffset + 6} ${vOffset + 7}\n`;
      obj += `f ${vOffset} ${vOffset + 4} ${vOffset + 7} ${vOffset + 3}\n`;
      obj += `f ${vOffset + 1} ${vOffset + 5} ${vOffset + 6} ${vOffset + 2}\n`;
      obj += `f ${vOffset + 3} ${vOffset + 2} ${vOffset + 6} ${vOffset + 7}\n`;
      obj += `f ${vOffset} ${vOffset + 1} ${vOffset + 5} ${vOffset + 4}\n`;
      vOffset += 8;
    });
    const blob = new Blob([obj], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `project_${selectedProjectId}_mesh.obj`;
    a.click();
    addToast('success', 'Exported 3D Wavefront Mesh (.OBJ)');
  };

  const handleExportJSON = () => {
    const data = {
      project: activeProject,
      dimensions: { widthFt: roomWidthFt, lengthFt: roomLengthFt, ceilingHeightFt },
      config,
      elements
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `project_${selectedProjectId}_bim.json`;
    a.click();
    addToast('success', 'Exported Project BIM JSON');
  };

  const totalAreaSqFt = roomLengthFt * roomWidthFt;
  const totalEstimatedCost = elements.reduce((acc, el) => acc + (el.cost || 0), 0);
  const selectedElement = elements.find(el => el.id === selectedElementId);

  // Compute live distance gaps to the 4 perimeter walls for selected element
  const wallGapInfo = useMemo(() => {
    if (!selectedElement) return null;
    const halfW = selectedElement.width / 2;
    const halfL = selectedElement.length / 2;
    const gapWest = Math.max(0, selectedElement.x - halfW);
    const gapEast = Math.max(0, roomLengthFt - (selectedElement.x + halfW));
    const gapNorth = Math.max(0, selectedElement.y - halfL);
    const gapSouth = Math.max(0, roomWidthFt - (selectedElement.y + halfL));

    const minGap = Math.min(gapWest, gapEast, gapNorth, gapSouth);
    let nearestSide: 'North' | 'South' | 'West' | 'East' = 'North';
    if (minGap === gapWest) nearestSide = 'West';
    else if (minGap === gapEast) nearestSide = 'East';
    else if (minGap === gapSouth) nearestSide = 'South';

    return { gapWest, gapEast, gapNorth, gapSouth, minGap, nearestSide };
  }, [selectedElement, roomLengthFt, roomWidthFt]);

  // Filter elements by active domain
  const visibleElements = useMemo(() => {
    if (activeDomain === 'interior') return elements.filter(el => el.domain !== 'exterior');
    if (activeDomain === 'exterior') return elements.filter(el => el.domain === 'exterior' || el.type.startsWith('EXTERIOR_'));
    return elements;
  }, [elements, activeDomain]);

  return (
    <div className={isMaximized ? "fixed inset-0 z-50 bg-[#161412] text-gray-200 flex flex-col h-screen w-screen overflow-hidden select-none" : "space-y-6 select-none"}>
      {/* 1. Header / Blender Menubar */}
      <div className={`bg-[#201C18] border border-white/10 ${isMaximized ? 'rounded-none border-x-0 border-t-0 p-2' : 'rounded-3xl p-5 shadow-sm'}`}>
        <div className="flex items-center justify-between gap-4 flex-wrap pb-2 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-amber-500 to-[#D4AF37] flex items-center justify-center text-black font-bold shadow-md">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-serif font-bold text-white text-base">
                  StudioCAD BIM 4.0
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#D4AF37]/20 text-[#D4AF37] font-bold border border-[#D4AF37]/40">
                  {isMaximized ? 'BLENDER PRO MAXIMIZED' : 'STANDARD WORKSPACE'}
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 font-bold border border-emerald-800">
                  {config.designCode}
                </span>
              </div>
              <p className="text-xs text-gray-400 flex items-center gap-2 mt-0.5">
                <span>Footprint: <strong className="text-white font-mono">{totalAreaSqFt} sq.ft</strong> ({roomLengthFt}' × {roomWidthFt}', {ceilingHeightFt}' Clg)</span>
                <span>•</span>
                <span>FF&E Commitment: <strong className="text-[#D4AF37] font-mono">${totalEstimatedCost.toLocaleString()}</strong></span>
              </p>
            </div>
          </div>

          {/* Quick Actions & Maximize Window Ribbon */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Undo / Redo */}
            <div className="flex items-center gap-0.5 bg-black/40 p-1 rounded-xl border border-white/10">
              <button
                type="button"
                onClick={handleUndo}
                disabled={historyIndex <= 0}
                className="p-1.5 rounded-lg hover:bg-white/10 disabled:opacity-30 text-gray-300 hover:text-white cursor-pointer"
                title="Undo (Ctrl+Z)"
              >
                <Undo2 className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={handleRedo}
                disabled={historyIndex >= history.length - 1}
                className="p-1.5 rounded-lg hover:bg-white/10 disabled:opacity-30 text-gray-300 hover:text-white cursor-pointer"
                title="Redo (Ctrl+Y)"
              >
                <Redo2 className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Object Creation Dropdown (Blender Shift+A style) */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsAddMenuOpen(!isAddMenuOpen)}
                className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white text-xs font-bold shadow-md flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Add Object</span>
                <ChevronDown className="w-3 h-3 ml-0.5" />
              </button>

              {isAddMenuOpen && (
                <div className="absolute top-full mt-2 left-0 w-72 bg-[#1C1814] border border-[#D4AF37]/50 rounded-2xl shadow-2xl z-50 p-2 text-xs space-y-2 animate-in fade-in-50 max-h-96 overflow-y-auto">
                  <div className="px-2 py-1 text-[10px] font-mono text-gray-400 uppercase tracking-wider border-b border-white/10">
                    Add Primitive / Architectural Mesh
                  </div>
                  {OBJECT_CREATION_CATALOG.map(cat => (
                    <div key={cat.title} className="space-y-1">
                      <span className="text-[10px] font-bold text-[#D4AF37] px-2 block">{cat.title}</span>
                      <div className="space-y-0.5">
                        {cat.items.map(item => (
                          <button
                            key={item.name}
                            type="button"
                            onClick={() => handleInsertFromCatalog(item)}
                            className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-white/10 text-gray-200 hover:text-white flex items-center justify-between text-[11px] cursor-pointer"
                          >
                            <span className="truncate">{item.name}</span>
                            <span className="text-[10px] font-mono text-gray-400 shrink-0 ml-2">${item.cost.toLocaleString()}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Open Market & 3D Object Importer Button */}
            <button
              type="button"
              onClick={() => setIsOpenMarketModalOpen(true)}
              className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-[#D4AF37] hover:from-amber-600 hover:to-amber-500 text-black text-xs font-bold shadow-md flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Store className="w-3.5 h-3.5 text-black" />
              <span>Open Market & 3D Import</span>
            </button>

            {/* Algorithmic Floorplan Generator Button */}
            <button
              type="button"
              onClick={() => setIsLayoutGeneratorOpen(true)}
              className="px-3 py-1.5 rounded-xl bg-black/60 hover:bg-black text-[#D4AF37] border border-[#D4AF37]/40 text-xs font-bold shadow-md flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>Generate Layout</span>
            </button>

            {/* Design Guidelines & Interactive Tutorial Button */}
            <button
              type="button"
              onClick={() => setIsTutorialModalOpen(true)}
              className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-blue-900/60 to-indigo-900/60 hover:from-blue-900 hover:to-indigo-900 text-blue-200 border border-blue-500/40 text-xs font-bold shadow-md flex items-center gap-1.5 transition-all cursor-pointer"
              title="Design Guidelines, Blender Controls & Downloadable Manual"
            >
              <BookOpen className="w-3.5 h-3.5 text-blue-300" />
              <span>Guidelines & Tutorial</span>
            </button>

            {/* Export Dropdown / Buttons */}
            <div className="flex items-center gap-1 bg-black/40 p-1 rounded-xl border border-white/10 text-xs">
              <button
                type="button"
                onClick={handleExportDXF}
                className="px-2 py-1 rounded-lg hover:bg-white/10 text-gray-300 font-mono font-bold cursor-pointer"
                title="Export AutoCAD DXF"
              >
                .DXF
              </button>
              <button
                type="button"
                onClick={handleExportOBJ}
                className="px-2 py-1 rounded-lg hover:bg-white/10 text-gray-300 font-mono font-bold cursor-pointer"
                title="Export 3D OBJ Mesh"
              >
                .OBJ
              </button>
              <button
                type="button"
                onClick={handleExportJSON}
                className="px-2 py-1 rounded-lg hover:bg-white/10 text-gray-300 font-mono font-bold cursor-pointer"
                title="Export Project BIM JSON"
              >
                .JSON
              </button>
            </div>

            {/* Maximize / Minimize Window Button */}
            <button
              type="button"
              onClick={() => setIsMaximized(!isMaximized)}
              className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-md ${
                isMaximized
                  ? 'bg-[#D4AF37] text-black border-[#D4AF37]'
                  : 'bg-black/60 text-[#D4AF37] border-[#D4AF37]/60 hover:bg-white/10'
              }`}
              title={isMaximized ? 'Restore Window (Ctrl+Space)' : 'Maximize Window (Ctrl+Space)'}
            >
              {isMaximized ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
              <span>{isMaximized ? 'Minimize' : 'Maximize'}</span>
            </button>
          </div>
        </div>

        {/* Viewport Modes & Domain Filters */}
        <div className="flex items-center justify-between pt-2.5 flex-wrap gap-2 text-xs">
          <div className="flex items-center gap-1 bg-black/40 p-1 rounded-2xl border border-white/10">
            {[
              { id: '2D_CAD' as ViewportMode, label: '2D Drafting CAD', icon: Grid },
              { id: '3D_BIM' as ViewportMode, label: '3D BIM Workspace', icon: Box },
              { id: 'SPLIT' as ViewportMode, label: 'Dual Split View (2D+3D)', icon: Columns },
              { id: 'ENGINEERING' as ViewportMode, label: 'AISC / IBC Solvers', icon: HardHat },
              { id: 'PROCUREMENT' as ViewportMode, label: 'FF&E Matrix & BoQ', icon: Palette }
            ].map(tab => {
              const Icon = tab.icon;
              const isActive = viewportMode === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setViewportMode(tab.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                    isActive
                      ? 'bg-[#D4AF37] text-black font-bold shadow-sm'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Interior vs Exterior Domain Switcher */}
          <div className="flex items-center gap-1 bg-black/40 p-1 rounded-2xl border border-white/10">
            <span className="text-[10px] font-mono text-gray-400 px-2">Scope:</span>
            {[
              { id: 'all' as const, label: 'All (Master)' },
              { id: 'interior' as const, label: 'Interior Only' },
              { id: 'exterior' as const, label: 'Exterior / Site' }
            ].map(d => (
              <button
                key={d.id}
                type="button"
                onClick={() => setActiveDomain(d.id)}
                className={`px-2.5 py-1 rounded-xl text-xs font-mono transition-all cursor-pointer ${
                  activeDomain === d.id
                    ? 'bg-white/20 text-[#D4AF37] font-bold'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {d.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 2. Main Workstation Body: Viewport Canvas + Side Inspector */}
      {(viewportMode === '2D_CAD' || viewportMode === '3D_BIM' || viewportMode === 'SPLIT') && (
        <div className={`grid grid-cols-1 lg:grid-cols-12 gap-4 ${isMaximized ? 'flex-1 overflow-hidden p-2' : ''}`}>
          {/* Main Interactive Stage */}
          <div className={`${viewportMode === 'SPLIT' ? 'lg:col-span-8' : 'lg:col-span-8'} ${isMaximized ? 'h-full flex flex-col' : 'space-y-4'}`}>
            {/* 2D CAD Viewport */}
            {viewportMode === '2D_CAD' && (
              <div className={isMaximized ? "h-full w-full flex-1" : "h-[620px] w-full"}>
                <CAD2DCanvas
                  elements={visibleElements}
                  selectedElementId={selectedElementId}
                  onSelectElement={setSelectedElementId}
                  onUpdateElement={handleUpdateElement}
                  onAddElement={handleAddElement}
                  onDeleteElement={handleDeleteElement}
                  activeTool={activeTool}
                  setActiveTool={setActiveTool}
                  roomWidthFt={roomWidthFt}
                  roomLengthFt={roomLengthFt}
                  config={config}
                  showClearances={showClearances}
                  showDimensions={showDimensions}
                  activeLayers={activeLayers}
                  isMaximized={isMaximized}
                  onToggleMaximize={() => setIsMaximized(!isMaximized)}
                />
              </div>
            )}

            {/* 3D BIM Viewport */}
            {viewportMode === '3D_BIM' && (
              <div className={isMaximized ? "h-full w-full flex-1" : "h-[620px] w-full"}>
                <BIM3DWorkspace
                  elements={visibleElements}
                  selectedElementId={selectedElementId}
                  onSelectElement={setSelectedElementId}
                  roomWidthFt={roomWidthFt}
                  roomLengthFt={roomLengthFt}
                  ceilingHeightFt={ceilingHeightFt}
                  config={config}
                  activeLayers={activeLayers}
                  isMaximized={isMaximized}
                  onToggleMaximize={() => setIsMaximized(!isMaximized)}
                />
              </div>
            )}

            {/* Split View: 2D & 3D Side-by-Side Synced */}
            {viewportMode === 'SPLIT' && (
              <div className={`grid grid-cols-1 xl:grid-cols-2 gap-3 ${isMaximized ? 'h-full flex-1' : 'h-[620px]'}`}>
                <div className="h-full w-full">
                  <CAD2DCanvas
                    elements={visibleElements}
                    selectedElementId={selectedElementId}
                    onSelectElement={setSelectedElementId}
                    onUpdateElement={handleUpdateElement}
                    onAddElement={handleAddElement}
                    onDeleteElement={handleDeleteElement}
                    activeTool={activeTool}
                    setActiveTool={setActiveTool}
                    roomWidthFt={roomWidthFt}
                    roomLengthFt={roomLengthFt}
                    config={config}
                    showClearances={showClearances}
                    showDimensions={showDimensions}
                    activeLayers={activeLayers}
                    isMaximized={isMaximized}
                    onToggleMaximize={() => setIsMaximized(!isMaximized)}
                  />
                </div>
                <div className="h-full w-full">
                  <BIM3DWorkspace
                    elements={visibleElements}
                    selectedElementId={selectedElementId}
                    onSelectElement={setSelectedElementId}
                    roomWidthFt={roomWidthFt}
                    roomLengthFt={roomLengthFt}
                    ceilingHeightFt={ceilingHeightFt}
                    config={config}
                    activeLayers={activeLayers}
                    isMaximized={isMaximized}
                    onToggleMaximize={() => setIsMaximized(!isMaximized)}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Right Inspector & Modular Properties Dock (Blender N-Panel) */}
          <div className={`${viewportMode === 'SPLIT' ? 'lg:col-span-4' : 'lg:col-span-4'} ${isMaximized ? 'h-full overflow-y-auto' : 'space-y-4'}`}>
            <div className="bg-[#201C18] rounded-3xl border border-white/10 shadow-xl overflow-hidden flex flex-col h-full text-xs">
              {/* Blender N-Panel Tabs */}
              <div className="flex items-center border-b border-white/10 bg-black/40 p-1 text-[11px] font-mono">
                {[
                  { id: 'TRANSFORM' as const, label: 'Transform' },
                  { id: 'GAPS' as const, label: 'Gaps / Offsets' },
                  { id: 'SHADING' as const, label: 'Color / PBR' },
                  { id: 'OUTLINER' as const, label: 'Outliner' },
                  { id: 'SYSTEM' as const, label: 'Bounds' }
                ].map(tab => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveSidebarTab(tab.id)}
                    className={`flex-1 py-1.5 text-center font-bold rounded-xl transition-all cursor-pointer ${
                      activeSidebarTab === tab.id
                        ? 'bg-[#D4AF37] text-black shadow-xs'
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Tab 1: Transform & Numeric Rotation */}
              {activeSidebarTab === 'TRANSFORM' && (
                <div className="p-4 space-y-4 font-mono">
                  {selectedElement ? (
                    <div className="space-y-4">
                      <div>
                        <span className="text-[10px] uppercase text-gray-400 block mb-1">
                          Element Name & Classification
                        </span>
                        <input
                          type="text"
                          value={selectedElement.name}
                          onChange={e => handleUpdateElement(selectedElement.id, { name: e.target.value })}
                          className="w-full px-3 py-1.5 bg-black/60 border border-white/15 rounded-xl font-bold text-white text-xs"
                        />
                      </div>

                      {/* Precise Rotation Controls (0-360° Numeric Input, Steppers, Presets) */}
                      <div className="p-3 bg-black/40 rounded-2xl border border-[#D4AF37]/30 space-y-2.5">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] text-[#D4AF37] font-bold flex items-center gap-1">
                            <RotateCw className="w-3.5 h-3.5" />
                            <span>Rotation Angle (Z-Axis):</span>
                          </span>
                          <div className="flex items-center gap-1">
                            <input
                              type="number"
                              min="0"
                              max="360"
                              step="0.5"
                              value={selectedElement.rotation}
                              onChange={e => handleUpdateElement(selectedElement.id, { rotation: ((Number(e.target.value) % 360) + 360) % 360 })}
                              className="w-20 px-2 py-0.5 bg-black border border-[#D4AF37]/60 rounded text-right font-bold text-[#D4AF37] text-xs"
                            />
                            <span className="text-[#D4AF37] font-bold">°</span>
                          </div>
                        </div>

                        {/* Interactive Degree Slider */}
                        <input
                          type="range"
                          min="0"
                          max="360"
                          step="1"
                          value={selectedElement.rotation}
                          onChange={e => handleUpdateElement(selectedElement.id, { rotation: Number(e.target.value) })}
                          className="w-full accent-[#D4AF37] cursor-pointer h-1.5 bg-gray-700 rounded-lg"
                        />

                        {/* Preset Angle Buttons */}
                        <div>
                          <span className="text-[10px] text-gray-400 block mb-1">Quick Angle Snaps:</span>
                          <div className="grid grid-cols-6 gap-1">
                            {[0, 45, 90, 135, 180, 270].map(deg => (
                              <button
                                key={deg}
                                type="button"
                                onClick={() => handleUpdateElement(selectedElement.id, { rotation: deg })}
                                className={`py-1 rounded text-[10px] border transition-colors cursor-pointer ${
                                  selectedElement.rotation === deg
                                    ? 'bg-[#D4AF37] text-black font-bold border-[#D4AF37]'
                                    : 'bg-white/5 hover:bg-white/15 text-gray-300 border-white/10'
                                }`}
                              >
                                {deg}°
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Relative Angle Increment Steppers */}
                        <div className="flex items-center justify-between gap-1 pt-1 border-t border-white/10">
                          {[-90, -45, -15, +15, +45, +90].map(delta => (
                            <button
                              key={delta}
                              type="button"
                              onClick={() => handleUpdateElement(selectedElement.id, { rotation: ((selectedElement.rotation + delta) % 360 + 360) % 360 })}
                              className="flex-1 py-1 rounded bg-black hover:bg-white/15 text-gray-300 hover:text-white border border-white/10 text-[10px] cursor-pointer"
                            >
                              {delta > 0 ? `+${delta}°` : `${delta}°`}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Dimensions (W, L, H in ft) */}
                      <div>
                        <span className="text-[10px] uppercase text-gray-400 block mb-1.5">
                          Bounding Dimensions (ft)
                        </span>
                        <div className="grid grid-cols-3 gap-2 font-mono">
                          <div>
                            <label className="text-[10px] text-gray-400 block">Width</label>
                            <input
                              type="number"
                              step="0.5"
                              value={selectedElement.width}
                              onChange={e => handleUpdateElement(selectedElement.id, { width: Math.max(0.5, Number(e.target.value)) })}
                              className="w-full px-2 py-1 bg-black/60 border border-white/15 rounded-lg text-white"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] text-gray-400 block">Length</label>
                            <input
                              type="number"
                              step="0.5"
                              value={selectedElement.length}
                              onChange={e => handleUpdateElement(selectedElement.id, { length: Math.max(0.5, Number(e.target.value)) })}
                              className="w-full px-2 py-1 bg-black/60 border border-white/15 rounded-lg text-white"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] text-gray-400 block">Height</label>
                            <input
                              type="number"
                              step="0.5"
                              value={selectedElement.height}
                              onChange={e => handleUpdateElement(selectedElement.id, { height: Math.max(0.5, Number(e.target.value)) })}
                              className="w-full px-2 py-1 bg-black/60 border border-white/15 rounded-lg text-white"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Coordinates (X, Y, Elevation Z in ft) */}
                      <div>
                        <span className="text-[10px] uppercase text-gray-400 block mb-1.5">
                          Location Coordinates (ft)
                        </span>
                        <div className="grid grid-cols-3 gap-2 font-mono">
                          <div>
                            <label className="text-[10px] text-gray-400 block">X Pos</label>
                            <input
                              type="number"
                              step="0.5"
                              value={selectedElement.x}
                              onChange={e => handleUpdateElement(selectedElement.id, { x: Number(e.target.value) })}
                              className="w-full px-2 py-1 bg-black/60 border border-white/15 rounded-lg text-white"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] text-gray-400 block">Y Pos</label>
                            <input
                              type="number"
                              step="0.5"
                              value={selectedElement.y}
                              onChange={e => handleUpdateElement(selectedElement.id, { y: Number(e.target.value) })}
                              className="w-full px-2 py-1 bg-black/60 border border-white/15 rounded-lg text-white"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] text-gray-400 block">Z Elev</label>
                            <input
                              type="number"
                              step="0.5"
                              value={selectedElement.z}
                              onChange={e => handleUpdateElement(selectedElement.id, { z: Number(e.target.value) })}
                              className="w-full px-2 py-1 bg-black/60 border border-white/15 rounded-lg text-white"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Lock, Duplicate, Delete */}
                      <div className="flex items-center gap-2 pt-2 border-t border-white/10">
                        <button
                          type="button"
                          onClick={() => handleUpdateElement(selectedElement.id, { isLocked: !selectedElement.isLocked })}
                          className={`flex-1 py-1.5 rounded-xl border flex items-center justify-center gap-1.5 font-bold cursor-pointer ${
                            selectedElement.isLocked ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' : 'bg-white/10 text-gray-300'
                          }`}
                        >
                          {selectedElement.isLocked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                          <span>{selectedElement.isLocked ? 'Locked' : 'Lock'}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            const dup: StudioElement = {
                              ...selectedElement,
                              id: `${selectedElement.type.toLowerCase()}-${Date.now()}`,
                              name: `${selectedElement.name} (Copy)`,
                              x: Math.min(roomLengthFt - 2, selectedElement.x + 2),
                              y: Math.min(roomWidthFt - 2, selectedElement.y + 2)
                            };
                            handleAddElement(dup);
                          }}
                          className="flex-1 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-xl border border-white/10 flex items-center justify-center gap-1.5 font-bold cursor-pointer"
                        >
                          <Copy className="w-3.5 h-3.5" />
                          <span>Duplicate</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDeleteElement(selectedElement.id)}
                          className="p-2 bg-red-900/40 hover:bg-red-900/70 text-red-200 rounded-xl cursor-pointer"
                          title="Delete Element"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="py-12 text-center text-gray-400 space-y-2">
                      <Box className="w-8 h-8 mx-auto text-gray-500" />
                      <p className="font-serif text-white">No Element Selected</p>
                      <p className="text-[11px] text-gray-400 max-w-[200px] mx-auto">
                        Click any element in the CAD drafting canvas or 3D view to inspect properties.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Tab 2: Gaps, Margins & Offsets */}
              {activeSidebarTab === 'GAPS' && (
                <div className="p-4 space-y-4 font-mono">
                  {selectedElement ? (
                    <div className="space-y-4">
                      {/* Nearest Wall Gap Info */}
                      {wallGapInfo && (
                        <div className="p-3 bg-black/50 rounded-2xl border border-[#D4AF37]/40 space-y-2">
                          <span className="text-[10px] text-gray-400 block uppercase">
                            Distance to Enclosure Walls:
                          </span>
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div>West: <strong className="text-white">{wallGapInfo.gapWest.toFixed(1)}'</strong></div>
                            <div>East: <strong className="text-white">{wallGapInfo.gapEast.toFixed(1)}'</strong></div>
                            <div>North: <strong className="text-white">{wallGapInfo.gapNorth.toFixed(1)}'</strong></div>
                            <div>South: <strong className="text-white">{wallGapInfo.gapSouth.toFixed(1)}'</strong></div>
                          </div>
                          <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs">
                            <span className="text-[#D4AF37] font-bold">Nearest ({wallGapInfo.nearestSide} Wall):</span>
                            <span className="text-emerald-400 font-bold">{wallGapInfo.minGap.toFixed(2)} ft</span>
                          </div>
                        </div>
                      )}

                      {/* Snap with set gap */}
                      <div>
                        <span className="text-[10px] text-gray-400 block mb-1.5 uppercase">
                          Align with Set Wall Gap:
                        </span>
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              if (!wallGapInfo) return;
                              if (wallGapInfo.nearestSide === 'West') handleUpdateElement(selectedElement.id, { x: 2 + selectedElement.width / 2 });
                              else if (wallGapInfo.nearestSide === 'East') handleUpdateElement(selectedElement.id, { x: roomLengthFt - 2 - selectedElement.width / 2 });
                              else if (wallGapInfo.nearestSide === 'North') handleUpdateElement(selectedElement.id, { y: 2 + selectedElement.length / 2 });
                              else if (wallGapInfo.nearestSide === 'South') handleUpdateElement(selectedElement.id, { y: roomWidthFt - 2 - selectedElement.length / 2 });
                            }}
                            className="py-1.5 px-2 bg-white/5 hover:bg-white/15 text-gray-200 rounded-xl border border-white/15 text-[11px] text-center cursor-pointer"
                          >
                            Set 2.0ft Gap
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              if (!wallGapInfo) return;
                              if (wallGapInfo.nearestSide === 'West') handleUpdateElement(selectedElement.id, { x: 4 + selectedElement.width / 2 });
                              else if (wallGapInfo.nearestSide === 'East') handleUpdateElement(selectedElement.id, { x: roomLengthFt - 4 - selectedElement.width / 2 });
                              else if (wallGapInfo.nearestSide === 'North') handleUpdateElement(selectedElement.id, { y: 4 + selectedElement.length / 2 });
                              else if (wallGapInfo.nearestSide === 'South') handleUpdateElement(selectedElement.id, { y: roomWidthFt - 4 - selectedElement.length / 2 });
                            }}
                            className="py-1.5 px-2 bg-white/5 hover:bg-white/15 text-gray-200 rounded-xl border border-white/15 text-[11px] text-center cursor-pointer"
                          >
                            Set 4.0ft Corridor
                          </button>
                        </div>
                      </div>

                      {/* IBC Clearance Radius */}
                      <div>
                        <div className="flex justify-between items-center text-[11px] text-gray-300 mb-1">
                          <span>IBC Clearance Radius:</span>
                          <span className="text-[#D4AF37] font-bold">{selectedElement.clearanceRadiusFt || 3.0} ft</span>
                        </div>
                        <input
                          type="range"
                          min="1.0"
                          max="8.0"
                          step="0.5"
                          value={selectedElement.clearanceRadiusFt || 3.0}
                          onChange={e => handleUpdateElement(selectedElement.id, { clearanceRadiusFt: Number(e.target.value) })}
                          className="w-full accent-[#D4AF37] cursor-pointer h-1.5 bg-gray-700 rounded-lg"
                        />
                      </div>

                      {/* Shadowline Reveal Gap */}
                      <div>
                        <div className="flex justify-between items-center text-[11px] text-gray-300 mb-1">
                          <span>Shadowline Reveal Gap:</span>
                          <span className="text-white font-bold">{selectedElement.revealGapInches || 0.5} in</span>
                        </div>
                        <div className="grid grid-cols-4 gap-1.5">
                          {[0.25, 0.5, 0.75, 1.0].map(val => (
                            <button
                              key={val}
                              type="button"
                              onClick={() => handleUpdateElement(selectedElement.id, { revealGapInches: val })}
                              className={`py-1 rounded-lg border text-[10px] cursor-pointer ${
                                (selectedElement.revealGapInches || 0.5) === val
                                  ? 'bg-[#D4AF37] text-black font-bold border-[#D4AF37]'
                                  : 'bg-white/5 text-gray-300 border-white/15'
                              }`}
                            >
                              {val}"
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Array Repetition Gap */}
                      <div className="p-3 bg-black/40 rounded-2xl border border-white/10 space-y-2">
                        <span className="text-[10px] text-gray-400 block uppercase">
                          Repetition / Array Spacing Gap:
                        </span>
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs text-gray-300">Gap Distance:</span>
                          <input
                            type="number"
                            min="1"
                            max="30"
                            step="1"
                            defaultValue={selectedElement.arraySpacingFt || 4}
                            onChange={e => handleUpdateElement(selectedElement.id, { arraySpacingFt: Number(e.target.value) })}
                            className="w-16 px-2 py-0.5 bg-black border border-white/20 rounded font-bold text-[#D4AF37] text-right"
                          />
                          <span className="text-gray-400">ft</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            const gap = selectedElement.arraySpacingFt || 4;
                            const dup: StudioElement = {
                              ...selectedElement,
                              id: `${selectedElement.type.toLowerCase()}-${Date.now()}`,
                              name: `${selectedElement.name} (Array)`,
                              x: Math.min(roomLengthFt - selectedElement.width / 2, selectedElement.x + selectedElement.width + gap),
                              y: selectedElement.y
                            };
                            handleAddElement(dup);
                          }}
                          className="w-full py-1.5 rounded-xl bg-[#D4AF37]/20 hover:bg-[#D4AF37]/40 text-[#D4AF37] font-bold border border-[#D4AF37]/40 text-xs cursor-pointer"
                        >
                          + Duplicate with Gap Spacing
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="py-12 text-center text-gray-400">Select an element to view and configure gap spacing.</div>
                  )}
                </div>
              )}

              {/* Tab 3: Color, Materials & Shading */}
              {activeSidebarTab === 'SHADING' && (
                <div className="p-4 space-y-4">
                  {selectedElement ? (
                    <div className="space-y-4">
                      {/* Live Color Picker */}
                      <div>
                        <label className="text-[10px] uppercase font-mono text-gray-400 block mb-1.5">
                          Base Color & Hex
                        </label>
                        <div className="flex items-center gap-3">
                          <input
                            type="color"
                            value={selectedElement.color || '#D4AF37'}
                            onChange={e => handleUpdateElement(selectedElement.id, { color: e.target.value })}
                            className="w-9 h-9 rounded-xl border border-white/20 cursor-pointer bg-transparent"
                          />
                          <input
                            type="text"
                            value={selectedElement.color || '#D4AF37'}
                            onChange={e => handleUpdateElement(selectedElement.id, { color: e.target.value })}
                            className="flex-1 px-3 py-1.5 bg-black/60 border border-white/15 rounded-xl font-mono text-xs font-bold text-white"
                          />
                        </div>
                      </div>

                      {/* Curated Swatches */}
                      <div>
                        <span className="text-[10px] uppercase font-mono text-gray-400 block mb-1.5">
                          Architectural Palette Swatches
                        </span>
                        <div className="grid grid-cols-7 gap-1.5">
                          {COLOR_SWATCHES.map(swatch => (
                            <button
                              key={swatch.name}
                              type="button"
                              onClick={() => handleUpdateElement(selectedElement.id, {
                                color: swatch.hex,
                                materialType: swatch.mat,
                                materialName: swatch.name
                              })}
                              className="h-7 rounded-lg border border-white/20 hover:scale-110 transition-transform flex items-center justify-center cursor-pointer shadow-xs"
                              style={{ backgroundColor: swatch.hex }}
                              title={`${swatch.name} (${swatch.hex})`}
                            >
                              {selectedElement.color?.toLowerCase() === swatch.hex.toLowerCase() && (
                                <Check className="w-3 h-3 text-black mix-blend-difference" />
                              )}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Material Shader Preset */}
                      <div>
                        <label className="text-[10px] uppercase font-mono text-gray-400 block mb-1.5">
                          Material & Architectural Finish
                        </label>
                        <select
                          value={selectedElement.materialType}
                          onChange={e => handleUpdateElement(selectedElement.id, { materialType: e.target.value as any })}
                          className="w-full px-3 py-2 bg-black/60 border border-white/15 rounded-xl font-medium text-white"
                        >
                          <option value="plaster">Venetian Plaster / Drywall</option>
                          <option value="oak">Quarter-Sawn Smoked Oak</option>
                          <option value="walnut">American Black Walnut</option>
                          <option value="travertine">Navona Travertine</option>
                          <option value="marble">Calacatta Vagli Marble</option>
                          <option value="boucle">Loro Piana Wool Bouclé</option>
                          <option value="leather">Cognac Saddle Leather</option>
                          <option value="bronze">Patinated Architectural Bronze</option>
                          <option value="matte_black">Matte Black Anodized</option>
                          <option value="steel">Brushed Architectural Steel</option>
                          <option value="terrazzo">Architectural Terrazzo</option>
                          <option value="glass">Low-E Architectural Glazing</option>
                          <option value="concrete">Fair-Faced Concrete</option>
                          <option value="ceramic">Glazed Artisan Ceramic</option>
                          <option value="water">Azure Pool Water</option>
                          <option value="timber_deck">Brazilian Ipe Decking</option>
                          <option value="grass">Biophilic Grass / Foliage</option>
                        </select>
                      </div>

                      {/* Cost & CSI */}
                      <div className="grid grid-cols-2 gap-3 pt-2 border-t border-white/10 font-mono">
                        <div>
                          <label className="text-[10px] text-gray-400 block">Cost ($)</label>
                          <input
                            type="number"
                            value={selectedElement.cost}
                            onChange={e => handleUpdateElement(selectedElement.id, { cost: Number(e.target.value) })}
                            className="w-full px-2.5 py-1.5 bg-black/60 border border-white/15 rounded-xl text-white font-bold"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-gray-400 block">CSI Code</label>
                          <input
                            type="text"
                            value={selectedElement.csiCode || '09 20 00'}
                            onChange={e => handleUpdateElement(selectedElement.id, { csiCode: e.target.value })}
                            className="w-full px-2.5 py-1.5 bg-black/60 border border-white/15 rounded-xl text-gray-300"
                          />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="py-12 text-center text-gray-400">Select an element to edit shaders and colors.</div>
                  )}
                </div>
              )}

              {/* Tab 4: Outliner / Scene Hierarchy Tree */}
              {activeSidebarTab === 'OUTLINER' && (
                <div className="p-4 space-y-3 font-mono">
                  <div className="flex items-center justify-between text-[11px] text-gray-400 pb-1 border-b border-white/10">
                    <span>Scene Objects ({elements.length}):</span>
                    <span>Action</span>
                  </div>
                  <div className="space-y-1 max-h-80 overflow-y-auto scrollbar-thin">
                    {elements.map(el => {
                      const isSelected = el.id === selectedElementId;
                      return (
                        <div
                          key={el.id}
                          onClick={() => setSelectedElementId(el.id)}
                          className={`p-2 rounded-xl flex items-center justify-between cursor-pointer transition-all ${
                            isSelected ? 'bg-[#D4AF37]/20 border border-[#D4AF37]/50 text-white' : 'hover:bg-white/5 text-gray-300'
                          }`}
                        >
                          <div className="flex items-center gap-2 truncate">
                            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: el.color || '#D4AF37' }} />
                            <span className="text-xs truncate">{el.name}</span>
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleUpdateElement(el.id, { isLocked: !el.isLocked });
                              }}
                              className="p-1 hover:text-white text-gray-400"
                              title={el.isLocked ? "Unlock" : "Lock"}
                            >
                              {el.isLocked ? <Lock className="w-3 h-3 text-amber-400" /> : <Unlock className="w-3 h-3" />}
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteElement(el.id);
                              }}
                              className="p-1 hover:text-red-400 text-gray-400"
                              title="Delete"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Tab 5: Spatial Bounds Enclosure */}
              {activeSidebarTab === 'SYSTEM' && (
                <div className="p-4 space-y-4 font-mono">
                  <span className="text-[10px] uppercase text-gray-400 block mb-1">
                    Space Enclosure Geometry (ft)
                  </span>

                  <div className="space-y-3">
                    <div>
                      <label className="text-[11px] text-gray-300 block mb-1">Length (X-Axis ft)</label>
                      <input
                        type="number"
                        min="16"
                        max="120"
                        value={roomLengthFt}
                        onChange={e => setRoomLengthFt(Math.max(16, Number(e.target.value)))}
                        className="w-full px-3 py-1.5 bg-black/60 border border-white/15 rounded-xl text-white font-bold"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-gray-300 block mb-1">Width (Y-Axis ft)</label>
                      <input
                        type="number"
                        min="16"
                        max="120"
                        value={roomWidthFt}
                        onChange={e => setRoomWidthFt(Math.max(16, Number(e.target.value)))}
                        className="w-full px-3 py-1.5 bg-black/60 border border-white/15 rounded-xl text-white font-bold"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-gray-300 block mb-1">Ceiling Height (Z-Axis ft)</label>
                      <input
                        type="number"
                        step="0.5"
                        min="8"
                        max="30"
                        value={ceilingHeightFt}
                        onChange={e => setCeilingHeightFt(Math.max(8, Number(e.target.value)))}
                        className="w-full px-3 py-1.5 bg-black/60 border border-white/15 rounded-xl text-white font-bold"
                      />
                    </div>
                  </div>

                  <div className="p-3 bg-black/50 rounded-xl border border-[#D4AF37]/30 text-gray-300 space-y-1">
                    <span className="font-bold text-white block">Gross Enclosure Volume:</span>
                    <p className="text-xs font-bold text-[#D4AF37]">
                      {roomLengthFt * roomWidthFt * ceilingHeightFt} cu.ft ({Math.round(roomLengthFt * roomWidthFt * ceilingHeightFt * 0.0283)} m³)
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 3. Consolidated Viewport Mode: Civil & Structural Solvers */}
      {viewportMode === 'ENGINEERING' && (
        <CivilStructuralStudio config={config} />
      )}

      {/* 4. Consolidated Viewport Mode: Interior FF&E BoQ Matrix */}
      {viewportMode === 'PROCUREMENT' && (
        <InteriorDesignStudio config={config} />
      )}

      {/* Algorithmic Layout Generator Modal */}
      <LayoutGeneratorModal
        isOpen={isLayoutGeneratorOpen}
        onClose={() => setIsLayoutGeneratorOpen(false)}
        onApplyLayout={handleApplyLayout}
      />

      {/* Open Market & 3D Object Importer Modal */}
      <OpenMarketModal
        isOpen={isOpenMarketModalOpen}
        onClose={() => setIsOpenMarketModalOpen(false)}
        onInsertElement={handleAddElement}
        roomWidthFt={roomWidthFt}
        roomLengthFt={roomLengthFt}
      />

      {/* Design Guidelines & Interactive Tutorial Modal */}
      <DesignGuidelineAndTutorialModal
        isOpen={isTutorialModalOpen}
        onClose={() => setIsTutorialModalOpen(false)}
      />
    </div>
  );
};
