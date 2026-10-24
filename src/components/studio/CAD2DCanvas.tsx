import React, { useRef, useState, useEffect, useCallback, useMemo } from 'react';
import {
  StudioElement,
  ActiveTool,
  ElementType,
  FurnitureCategory,
  StudioMaterialType
} from './types';
import { EngineeringConfig } from '../tools/types';
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2,
  RotateCw,
  RotateCcw,
  Trash2,
  Copy,
  Move,
  Grid,
  Eye,
  Check,
  Ruler,
  MousePointer,
  Square,
  DoorOpen,
  Box,
  Layers,
  Sparkles,
  Lock,
  Unlock,
  Type,
  Palette,
  Columns,
  SplitSquareVertical,
  FlipHorizontal,
  Compass,
  Plus,
  Sliders,
  Sun,
  Trees,
  Waves,
  ArrowUpRight,
  Disc,
  ArrowRight,
  AlignJustify,
  Maximize,
  Minimize
} from 'lucide-react';

interface CAD2DCanvasProps {
  elements: StudioElement[];
  selectedElementId: string | null;
  onSelectElement: (id: string | null) => void;
  onUpdateElement: (id: string, updates: Partial<StudioElement>) => void;
  onAddElement: (elem: StudioElement) => void;
  onDeleteElement: (id: string) => void;
  activeTool: ActiveTool;
  setActiveTool: (tool: ActiveTool) => void;
  roomWidthFt: number;
  roomLengthFt: number;
  config: EngineeringConfig;
  showClearances: boolean;
  showDimensions: boolean;
  activeLayers: {
    architecture: boolean;
    structure: boolean;
    furniture: boolean;
    annotation: boolean;
  };
  isMaximized?: boolean;
  onToggleMaximize?: () => void;
}

export const CAD2DCanvas: React.FC<CAD2DCanvasProps> = ({
  elements,
  selectedElementId,
  onSelectElement,
  onUpdateElement,
  onAddElement,
  onDeleteElement,
  activeTool,
  setActiveTool,
  roomWidthFt,
  roomLengthFt,
  config,
  showClearances,
  showDimensions,
  activeLayers,
  isMaximized,
  onToggleMaximize
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Canvas Viewport Transforms (Pan & Zoom)
  const [zoom, setZoom] = useState<number>(18); // Pixels per foot (default 18px = 1ft)
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 40, y: 40 });
  const [isPanning, setIsPanning] = useState<boolean>(false);
  const [panStart, setPanStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Dragging / Resizing State
  const [isDraggingElement, setIsDraggingElement] = useState<boolean>(false);
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Rotating Handle Dragging State
  const [isRotatingElement, setIsRotatingElement] = useState<boolean>(false);
  const [rotatingElemId, setRotatingElemId] = useState<string | null>(null);

  // Design Pane Active Tab (Blender/AutoCAD controls)
  const [activePaneTab, setActivePaneTab] = useState<'ROTATE' | 'COLOR' | 'GAPS'>('ROTATE');
  const [activeToolCategory, setActiveToolCategory] = useState<'ARCHITECTURE' | 'EXTERIOR' | 'MEASURE'>('ARCHITECTURE');

  // Drawing State (Wall, Room, Glass Wall)
  const [drawStart, setDrawStart] = useState<{ x: number; y: number } | null>(null);
  const [currentMouseFt, setCurrentMouseFt] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [measurementDist, setMeasurementDist] = useState<number | null>(null);

  // Active Painter Material
  const [activeMaterial, setActiveMaterial] = useState<{ type: StudioMaterialType; name: string; color: string }>({
    type: 'travertine',
    name: 'Navona Travertine',
    color: '#D4CBB8'
  });

  // Snap to Grid calculation
  const snapToGrid = useCallback((val: number): number => {
    const snapInches = config.cadSnapGridInches || 6;
    const snapFt = snapInches / 12;
    return Math.round(val / snapFt) * snapFt;
  }, [config.cadSnapGridInches]);

  // Convert client mouse coordinates to CAD world feet
  const clientToWorldFt = useCallback((clientX: number, clientY: number) => {
    if (!containerRef.current) return { x: 0, y: 0 };
    const rect = containerRef.current.getBoundingClientRect();
    const relX = clientX - rect.left - pan.x;
    const relY = clientY - rect.top - pan.y;
    return {
      x: snapToGrid(relX / zoom),
      y: snapToGrid(relY / zoom)
    };
  }, [pan, zoom, snapToGrid]);

  // Handle Zoom
  const handleZoomIn = () => setZoom(prev => Math.min(prev * 1.25, 45));
  const handleZoomOut = () => setZoom(prev => Math.max(prev / 1.25, 8));
  const handleFitView = () => {
    if (!containerRef.current) return;
    const { clientWidth, clientHeight } = containerRef.current;
    const scaleX = (clientWidth - 80) / roomLengthFt;
    const scaleY = (clientHeight - 80) / roomWidthFt;
    const newZoom = Math.min(scaleX, scaleY, 24);
    setZoom(newZoom);
    setPan({
      x: (clientWidth - roomLengthFt * newZoom) / 2,
      y: (clientHeight - roomWidthFt * newZoom) / 2
    });
  };

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedElementId) {
        e.preventDefault();
        onDeleteElement(selectedElementId);
        onSelectElement(null);
      } else if (e.key === 'r' || e.key === 'R') {
        if (selectedElementId) {
          e.preventDefault();
          const elem = elements.find(el => el.id === selectedElementId);
          if (elem) {
            onUpdateElement(selectedElementId, { rotation: (elem.rotation + (e.shiftKey ? -15 : 15)) % 360 });
          }
        }
      } else if (e.key === 'Escape') {
        setDrawStart(null);
        setActiveTool('SELECT');
        onSelectElement(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedElementId, elements, onDeleteElement, onSelectElement, onUpdateElement, setActiveTool]);

  // Canvas Mouse Down
  const handleMouseDown = (e: React.MouseEvent) => {
    // Middle click or space+click for pan
    if (e.button === 1 || (e.button === 0 && e.shiftKey)) {
      setIsPanning(true);
      setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
      return;
    }

    if (e.button !== 0) return;

    const mouseFt = clientToWorldFt(e.clientX, e.clientY);

    // 1. Two-point drawing tools (Wall, Glass Wall, Room, Measure)
    if (activeTool === 'DRAW_WALL' || activeTool === 'DRAW_GLASS_WALL' || activeTool === 'DRAW_ROOM' || activeTool === 'MEASURE') {
      if (!drawStart) {
        setDrawStart(mouseFt);
      } else {
        // Complete the drawing
        if (activeTool === 'DRAW_WALL' || activeTool === 'DRAW_GLASS_WALL') {
          const dx = Math.abs(mouseFt.x - drawStart.x);
          const dy = Math.abs(mouseFt.y - drawStart.y);
          const isHorizontal = dx >= dy;
          const isGlass = activeTool === 'DRAW_GLASS_WALL';

          const newWall: StudioElement = {
            id: `wall-${Date.now()}`,
            name: isGlass ? 'Floor-to-Ceiling Glazing Wall' : 'Interior Partition Wall',
            type: 'WALL',
            layer: 'architecture',
            x: isHorizontal ? (drawStart.x + mouseFt.x) / 2 : drawStart.x,
            y: isHorizontal ? drawStart.y : (drawStart.y + mouseFt.y) / 2,
            z: 0,
            width: isHorizontal ? Math.max(dx, 1) : 0.5,
            length: isHorizontal ? 0.5 : Math.max(dy, 1),
            height: 11,
            rotation: 0,
            isWallSegment: true,
            thickness: 0.5,
            color: isGlass ? '#B0C4DE' : '#D4CBB8',
            materialName: isGlass ? 'Acoustic Architectural Glazing' : 'Venetian Plaster Partition',
            materialType: isGlass ? 'glass' : 'plaster',
            lrv: isGlass ? 85 : 70,
            cost: Math.round((isHorizontal ? dx : dy) * (isGlass ? 220 : 95)),
            csiCode: isGlass ? '08 44 00' : '09 22 16'
          };
          onAddElement(newWall);
          onSelectElement(newWall.id);
        } else if (activeTool === 'DRAW_ROOM') {
          const x = Math.min(drawStart.x, mouseFt.x);
          const y = Math.min(drawStart.y, mouseFt.y);
          const width = Math.max(Math.abs(mouseFt.x - drawStart.x), 4);
          const length = Math.max(Math.abs(mouseFt.y - drawStart.y), 4);

          const newRoom: StudioElement = {
            id: `room-${Date.now()}`,
            name: 'Architectural Zone',
            type: 'ROOM',
            layer: 'architecture',
            x: x + width / 2,
            y: y + length / 2,
            z: 0,
            width,
            length,
            height: 11,
            rotation: 0,
            color: '#F4F1EA',
            materialName: 'Navona Travertine & Plaster',
            materialType: 'travertine',
            lrv: 75,
            cost: Math.round(width * length * 65),
            roomName: 'Custom Space'
          };
          onAddElement(newRoom);
          onSelectElement(newRoom.id);
        }
        setDrawStart(null);
        setActiveTool('SELECT');
      }
    } 
    // 2. Single-Click Placement Tools
    else if (activeTool === 'ADD_DOOR') {
      const newDoor: StudioElement = {
        id: `door-${Date.now()}`,
        name: 'Pivot Architectural Door',
        type: 'DOOR',
        layer: 'architecture',
        x: mouseFt.x,
        y: mouseFt.y,
        z: 0,
        width: 3.5,
        length: 0.5,
        height: 9.0,
        rotation: 0,
        color: '#4A3B2C',
        materialName: 'Quarter-Sawn Smoked Oak',
        materialType: 'oak',
        lrv: 22,
        cost: 2800,
        csiCode: '08 14 00',
        clearanceRadiusFt: 3.5,
        doorSwing: 'RIGHT'
      };
      onAddElement(newDoor);
      onSelectElement(newDoor.id);
      setActiveTool('SELECT');
    } else if (activeTool === 'ADD_WINDOW') {
      const newWin: StudioElement = {
        id: `window-${Date.now()}`,
        name: 'Floor-to-Ceiling Ribbon Window',
        type: 'WINDOW',
        layer: 'architecture',
        x: mouseFt.x,
        y: mouseFt.y,
        z: 3,
        width: 6.0,
        length: 0.5,
        height: 5.0,
        rotation: 0,
        color: '#87CEEB',
        materialName: 'Double-Glazed Low-E Glass',
        materialType: 'glass',
        lrv: 88,
        cost: 3200,
        csiCode: '08 51 00',
        windowType: 'FIXED'
      };
      onAddElement(newWin);
      onSelectElement(newWin.id);
      setActiveTool('SELECT');
    } else if (activeTool === 'ADD_COLUMN') {
      const newCol: StudioElement = {
        id: `col-${Date.now()}`,
        name: 'Reinforced Concrete Structural Column',
        type: 'COLUMN',
        layer: 'structure',
        x: mouseFt.x,
        y: mouseFt.y,
        z: 0,
        width: 1.5,
        length: 1.5,
        height: 11,
        rotation: 0,
        color: '#A09C94',
        materialName: 'Architectural Fair-Faced Concrete',
        materialType: 'concrete',
        lrv: 45,
        cost: 2100,
        csiCode: '03 30 00',
        columnType: 'ROUND'
      };
      onAddElement(newCol);
      onSelectElement(newCol.id);
      setActiveTool('SELECT');
    } else if (activeTool === 'ADD_ANNOTATION') {
      const newAnno: StudioElement = {
        id: `anno-${Date.now()}`,
        name: 'Spatial Note',
        type: 'ANNOTATION',
        layer: 'annotation',
        x: mouseFt.x,
        y: mouseFt.y,
        z: 0,
        width: 4.0,
        length: 1.5,
        height: 0,
        rotation: 0,
        color: '#D4AF37',
        materialName: 'Annotation Tag',
        materialType: 'plaster',
        lrv: 80,
        cost: 0,
        annotationText: 'CLEARANCE REQ. 36" MIN.'
      };
      onAddElement(newAnno);
      onSelectElement(newAnno.id);
      setActiveTool('SELECT');
    } else if (activeTool === 'ADD_EXTERIOR_POOL') {
      const newPool: StudioElement = {
        id: `pool-${Date.now()}`,
        name: 'Infinity Lap Pool',
        type: 'EXTERIOR_POOL',
        furnitureCategory: 'POOL',
        domain: 'exterior',
        layer: 'architecture',
        x: mouseFt.x,
        y: mouseFt.y,
        z: 0,
        width: 14.0,
        length: 8.0,
        height: 4.5,
        rotation: 0,
        color: '#2EA5A8',
        materialName: 'Travertine Rim & Azure Water',
        materialType: 'water',
        lrv: 55,
        cost: 38000,
        csiCode: '13 11 00'
      };
      onAddElement(newPool);
      onSelectElement(newPool.id);
      setActiveTool('SELECT');
    } else if (activeTool === 'ADD_EXTERIOR_DECK') {
      const newDeck: StudioElement = {
        id: `deck-${Date.now()}`,
        name: 'Ipe Hardwood Sun Deck',
        type: 'EXTERIOR_DECK',
        furnitureCategory: 'DECKING',
        domain: 'exterior',
        layer: 'architecture',
        x: mouseFt.x,
        y: mouseFt.y,
        z: 0,
        width: 16.0,
        length: 10.0,
        height: 0.5,
        rotation: 0,
        color: '#5C3E28',
        materialName: 'Brazilian Ipe Hardwood',
        materialType: 'timber_deck',
        lrv: 30,
        cost: 14500,
        csiCode: '06 15 00'
      };
      onAddElement(newDeck);
      onSelectElement(newDeck.id);
      setActiveTool('SELECT');
    } else if (activeTool === 'ADD_EXTERIOR_TREE') {
      const newTree: StudioElement = {
        id: `tree-${Date.now()}`,
        name: 'Japanese Acer Specimen Tree',
        type: 'EXTERIOR_TREE',
        furnitureCategory: 'TREE',
        domain: 'exterior',
        layer: 'furniture',
        x: mouseFt.x,
        y: mouseFt.y,
        z: 0,
        width: 6.0,
        length: 6.0,
        height: 12.0,
        rotation: 0,
        color: '#2D4E2A',
        materialName: 'Biophilic Deciduous Tree',
        materialType: 'grass',
        lrv: 35,
        cost: 4200,
        csiCode: '32 93 00'
      };
      onAddElement(newTree);
      onSelectElement(newTree.id);
      setActiveTool('SELECT');
    } else if (activeTool === 'ADD_EXTERIOR_PERGOLA') {
      const newPergola: StudioElement = {
        id: `pergola-${Date.now()}`,
        name: 'Architectural Louver Pergola',
        type: 'EXTERIOR_PERGOLA',
        furnitureCategory: 'PERGOLA',
        domain: 'exterior',
        layer: 'architecture',
        x: mouseFt.x,
        y: mouseFt.y,
        z: 0,
        width: 14.0,
        length: 10.0,
        height: 9.5,
        rotation: 0,
        color: '#1C1A17',
        materialName: 'Matte Black Anodized Aluminium & Teak',
        materialType: 'matte_black',
        lrv: 12,
        cost: 18500,
        csiCode: '10 73 16'
      };
      onAddElement(newPergola);
      onSelectElement(newPergola.id);
      setActiveTool('SELECT');
    } else if (activeTool === 'ADD_STAIRS') {
      const newStairs: StudioElement = {
        id: `stairs-${Date.now()}`,
        name: 'Floating Architectural Staircase',
        type: 'STAIRS',
        furnitureCategory: 'STAIRCASE',
        domain: 'interior',
        layer: 'architecture',
        x: mouseFt.x,
        y: mouseFt.y,
        z: 0,
        width: 4.0,
        length: 10.0,
        height: 10.0,
        rotation: 0,
        color: '#5C4834',
        materialName: 'Smoked Oak Treads & Steel Stringer',
        materialType: 'oak',
        lrv: 25,
        cost: 16000,
        csiCode: '05 51 00'
      };
      onAddElement(newStairs);
      onSelectElement(newStairs.id);
      setActiveTool('SELECT');
    } else if (activeTool === 'ADD_PRIMITIVE') {
      const newPrim: StudioElement = {
        id: `mesh-${Date.now()}`,
        name: 'Mesh Primitive Cube',
        type: 'PRIMITIVE_CUBE',
        furnitureCategory: 'PRIMITIVE_CUBE',
        domain: 'interior',
        layer: 'furniture',
        x: mouseFt.x,
        y: mouseFt.y,
        z: 0,
        width: 3.0,
        length: 3.0,
        height: 3.0,
        rotation: 0,
        color: '#D4AF37',
        materialName: 'Custom Shader Mesh',
        materialType: 'bronze',
        lrv: 60,
        cost: 500
      };
      onAddElement(newPrim);
      onSelectElement(newPrim.id);
      setActiveTool('SELECT');
    } else if (activeTool === 'GAP_TOOL') {
      // Find element under cursor or nearest element
      const clicked = elements.find(el => {
        const left = el.x - el.width / 2;
        const right = el.x + el.width / 2;
        const top = el.y - el.length / 2;
        const bottom = el.y + el.length / 2;
        return mouseFt.x >= left && mouseFt.x <= right && mouseFt.y >= top && mouseFt.y <= bottom;
      });
      if (clicked) {
        onSelectElement(clicked.id);
        setActivePaneTab('GAPS');
      } else {
        onSelectElement(null);
      }
    } else {
      // Clicked on empty canvas in SELECT mode -> deselect
      onSelectElement(null);
    }
  };

  // Canvas Mouse Move
  const handleMouseMove = (e: React.MouseEvent) => {
    if (isPanning) {
      setPan({
        x: e.clientX - panStart.x,
        y: e.clientY - panStart.y
      });
      return;
    }

    const mouseFt = clientToWorldFt(e.clientX, e.clientY);
    setCurrentMouseFt(mouseFt);

    if (drawStart && activeTool === 'MEASURE') {
      const dist = Math.sqrt(
        Math.pow(mouseFt.x - drawStart.x, 2) + Math.pow(mouseFt.y - drawStart.y, 2)
      );
      setMeasurementDist(dist);
    }

    // Dragging element position
    if (isDraggingElement && selectedElementId) {
      const targetElem = elements.find(el => el.id === selectedElementId);
      if (targetElem && !targetElem.isLocked) {
        const newX = snapToGrid(mouseFt.x - dragOffset.x);
        const newY = snapToGrid(mouseFt.y - dragOffset.y);
        onUpdateElement(selectedElementId, { x: newX, y: newY });
      }
    }

    // Dragging rotation knob
    if (isRotatingElement && rotatingElemId && containerRef.current) {
      const elem = elements.find(el => el.id === rotatingElemId);
      if (elem) {
        const rect = containerRef.current.getBoundingClientRect();
        const elemScreenX = rect.left + pan.x + elem.x * zoom;
        const elemScreenY = rect.top + pan.y + elem.y * zoom;
        const dx = e.clientX - elemScreenX;
        const dy = e.clientY - elemScreenY;
        let deg = Math.round((Math.atan2(dy, dx) * 180 / Math.PI + 90 + 360) % 360);
        if (e.shiftKey) deg = Math.round(deg / 15) * 15;
        onUpdateElement(rotatingElemId, { rotation: deg });
      }
    }
  };

  // Canvas Mouse Up
  const handleMouseUp = () => {
    setIsPanning(false);
    setIsDraggingElement(false);
    setIsRotatingElement(false);
    setRotatingElemId(null);
  };

  // Element Mouse Down (Select, Paint, Drag)
  const handleElementMouseDown = (e: React.MouseEvent, elem: StudioElement) => {
    e.stopPropagation();

    if (activeTool === 'PAINT_MATERIAL') {
      onUpdateElement(elem.id, {
        materialType: activeMaterial.type,
        materialName: activeMaterial.name,
        color: activeMaterial.color
      });
      onSelectElement(elem.id);
      return;
    }

    if (activeTool === 'GAP_TOOL') {
      onSelectElement(elem.id);
      setActivePaneTab('GAPS');
      return;
    }

    if (activeTool !== 'SELECT') return;

    onSelectElement(elem.id);

    if (!elem.isLocked) {
      const mouseFt = clientToWorldFt(e.clientX, e.clientY);
      setDragOffset({
        x: mouseFt.x - elem.x,
        y: mouseFt.y - elem.y
      });
      setIsDraggingElement(true);
    }
  };

  // Start rotation via knob
  const handleRotateKnobStart = (e: React.MouseEvent, elem: StudioElement) => {
    e.stopPropagation();
    setIsRotatingElement(true);
    setRotatingElemId(elem.id);
    onSelectElement(elem.id);
  };

  const selectedElement = elements.find(el => el.id === selectedElementId);

  // Compute live distance gaps to the 4 perimeter walls
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

  return (
    <div className="relative w-full h-full bg-[#1A1815] rounded-2xl overflow-hidden border border-[#2C2416] select-none flex flex-col">
      {/* 2D HUD Top Toolbar */}
      <div className="bg-[#24201A] px-4 py-2 border-b border-[#3A332A] flex flex-col gap-2 z-20">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          {/* Tool Category Selector */}
          <div className="flex items-center gap-1 bg-black/40 p-1 rounded-xl border border-white/10 text-xs font-mono">
            {[
              { id: 'ARCHITECTURE' as const, label: 'Interior / Arch', icon: Box },
              { id: 'EXTERIOR' as const, label: 'Exterior / Site', icon: Sun },
              { id: 'MEASURE' as const, label: 'Gaps & Tools', icon: Ruler }
            ].map(cat => {
              const Icon = cat.icon;
              const isCatActive = activeToolCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setActiveToolCategory(cat.id)}
                  className={`px-2.5 py-1 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
                    isCatActive ? 'bg-white/20 text-[#D4AF37] font-bold shadow-xs' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>

          {/* Contextual Tools for Selected Category */}
          <div className="flex items-center gap-1 overflow-x-auto scrollbar-none py-0.5">
            {activeToolCategory === 'ARCHITECTURE' && [
              { id: 'SELECT' as ActiveTool, label: 'Select (V)', icon: MousePointer },
              { id: 'DRAW_WALL' as ActiveTool, label: 'Wall (W)', icon: Box },
              { id: 'DRAW_GLASS_WALL' as ActiveTool, label: 'Glazing (G)', icon: SplitSquareVertical },
              { id: 'DRAW_ROOM' as ActiveTool, label: 'Zone (Z)', icon: Square },
              { id: 'ADD_DOOR' as ActiveTool, label: 'Door (D)', icon: DoorOpen },
              { id: 'ADD_WINDOW' as ActiveTool, label: 'Window (O)', icon: Eye },
              { id: 'ADD_COLUMN' as ActiveTool, label: 'Column (C)', icon: Columns },
              { id: 'ADD_STAIRS' as ActiveTool, label: 'Stairs', icon: ArrowUpRight }
            ].map(tool => {
              const Icon = tool.icon;
              const isActive = activeTool === tool.id;
              return (
                <button
                  key={tool.id}
                  type="button"
                  onClick={() => {
                    setActiveTool(tool.id);
                    setDrawStart(null);
                  }}
                  className={`px-2.5 py-1 rounded-lg text-xs font-mono font-medium flex items-center gap-1 transition-all cursor-pointer whitespace-nowrap ${
                    isActive ? 'bg-[#D4AF37] text-black font-bold shadow-md' : 'text-gray-300 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <Icon className="w-3 h-3" />
                  <span>{tool.label}</span>
                </button>
              );
            })}

            {activeToolCategory === 'EXTERIOR' && [
              { id: 'SELECT' as ActiveTool, label: 'Select (V)', icon: MousePointer },
              { id: 'ADD_EXTERIOR_POOL' as ActiveTool, label: 'Infinity Pool', icon: Waves },
              { id: 'ADD_EXTERIOR_DECK' as ActiveTool, label: 'Timber Deck', icon: AlignJustify },
              { id: 'ADD_EXTERIOR_TREE' as ActiveTool, label: 'Specimen Tree', icon: Trees },
              { id: 'ADD_EXTERIOR_PERGOLA' as ActiveTool, label: 'Louver Pergola', icon: Grid },
              { id: 'ADD_PRIMITIVE' as ActiveTool, label: 'Primitive Mesh', icon: Disc }
            ].map(tool => {
              const Icon = tool.icon;
              const isActive = activeTool === tool.id;
              return (
                <button
                  key={tool.id}
                  type="button"
                  onClick={() => {
                    setActiveTool(tool.id);
                    setDrawStart(null);
                  }}
                  className={`px-2.5 py-1 rounded-lg text-xs font-mono font-medium flex items-center gap-1 transition-all cursor-pointer whitespace-nowrap ${
                    isActive ? 'bg-[#D4AF37] text-black font-bold shadow-md' : 'text-gray-300 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <Icon className="w-3 h-3" />
                  <span>{tool.label}</span>
                </button>
              );
            })}

            {activeToolCategory === 'MEASURE' && [
              { id: 'SELECT' as ActiveTool, label: 'Select (V)', icon: MousePointer },
              { id: 'GAP_TOOL' as ActiveTool, label: 'Gap & Offset Tool', icon: Sliders },
              { id: 'MEASURE' as ActiveTool, label: 'Tape Measure', icon: Ruler },
              { id: 'PAINT_MATERIAL' as ActiveTool, label: 'Finish Painter', icon: Palette },
              { id: 'ADD_ANNOTATION' as ActiveTool, label: 'Text Note', icon: Type }
            ].map(tool => {
              const Icon = tool.icon;
              const isActive = activeTool === tool.id;
              return (
                <button
                  key={tool.id}
                  type="button"
                  onClick={() => {
                    setActiveTool(tool.id);
                    setDrawStart(null);
                  }}
                  className={`px-2.5 py-1 rounded-lg text-xs font-mono font-medium flex items-center gap-1 transition-all cursor-pointer whitespace-nowrap ${
                    isActive ? 'bg-[#D4AF37] text-black font-bold shadow-md' : 'text-gray-300 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <Icon className="w-3 h-3" />
                  <span>{tool.label}</span>
                </button>
              );
            })}
          </div>

          {/* Viewport Zoom, Precision, and Maximize Window Controls */}
          <div className="flex items-center gap-2 text-xs font-mono text-gray-300">
            <div className="flex items-center bg-black/40 rounded-xl p-0.5 border border-white/10">
              <button
                type="button"
                onClick={handleZoomOut}
                className="p-1.5 hover:bg-white/10 text-gray-300 hover:text-white rounded-lg cursor-pointer"
                title="Zoom Out (-)"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <span className="px-2 text-[11px] text-[#D4AF37] font-bold">
                {Math.round((zoom / 18) * 100)}%
              </span>
              <button
                type="button"
                onClick={handleZoomIn}
                className="p-1.5 hover:bg-white/10 text-gray-300 hover:text-white rounded-lg cursor-pointer"
                title="Zoom In (+)"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
            </div>

            <button
              type="button"
              onClick={handleFitView}
              className="p-1.5 bg-black/40 hover:bg-white/10 text-gray-300 hover:text-white rounded-xl border border-white/10 cursor-pointer"
              title="Fit to Screen"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>

            {/* Maximize Window Toggle Button */}
            {onToggleMaximize && (
              <button
                type="button"
                onClick={onToggleMaximize}
                className={`px-2.5 py-1.5 rounded-xl border flex items-center gap-1.5 text-xs font-bold transition-all cursor-pointer ${
                  isMaximized
                    ? 'bg-[#D4AF37] text-black border-[#D4AF37] shadow-md'
                    : 'bg-black/40 hover:bg-white/10 text-[#D4AF37] border-white/10'
                }`}
                title={isMaximized ? 'Minimize Window (Ctrl+Space)' : 'Maximize Window (Ctrl+Space)'}
              >
                {isMaximized ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
                <span className="hidden sm:inline">{isMaximized ? 'Minimize' : 'Maximize'}</span>
              </button>
            )}

            {/* Snap Pitch Indicator */}
            <div className="hidden sm:flex items-center gap-1 px-2 py-1 bg-black/40 rounded-xl border border-white/10 text-[11px]">
              <Grid className="w-3 h-3 text-[#D4AF37]" />
              <span>Snap: {config.cadSnapGridInches}"</span>
            </div>
          </div>
        </div>

        {/* Quick Finish Painter Swatches Ribbon (Visible when Finish Painter active) */}
        {activeTool === 'PAINT_MATERIAL' && (
          <div className="flex items-center gap-2 pt-1 border-t border-white/5 overflow-x-auto text-[11px] font-mono text-gray-300">
            <span className="text-amber-400 font-bold shrink-0">Click any element to paint finish:</span>
            {[
              { type: 'travertine' as StudioMaterialType, name: 'Navona Travertine', color: '#D4CBB8' },
              { type: 'marble' as StudioMaterialType, name: 'Calacatta Marble', color: '#F4F4F2' },
              { type: 'oak' as StudioMaterialType, name: 'Smoked Oak', color: '#4A3B2C' },
              { type: 'walnut' as StudioMaterialType, name: 'American Walnut', color: '#362A1F' },
              { type: 'boucle' as StudioMaterialType, name: 'Wool Bouclé', color: '#E5E2DC' },
              { type: 'leather' as StudioMaterialType, name: 'Saddle Leather', color: '#7B4A2D' },
              { type: 'bronze' as StudioMaterialType, name: 'Patinated Bronze', color: '#9C7A3C' },
              { type: 'matte_black' as StudioMaterialType, name: 'Matte Black', color: '#1E1E1E' },
              { type: 'concrete' as StudioMaterialType, name: 'Fair-Faced Concrete', color: '#9C9890' },
              { type: 'glass' as StudioMaterialType, name: 'Architectural Glazing', color: '#B0C4DE' }
            ].map(m => (
              <button
                key={m.name}
                type="button"
                onClick={() => setActiveMaterial(m)}
                className={`px-2 py-0.5 rounded-lg border flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
                  activeMaterial.name === m.name ? 'border-[#D4AF37] bg-white/15 text-white font-bold' : 'border-white/10 bg-black/30 hover:bg-white/5'
                }`}
              >
                <span className="w-2.5 h-2.5 rounded-full border border-black/40" style={{ backgroundColor: m.color }} />
                <span>{m.name}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Main Interactive CAD Canvas Stage */}
      <div
        ref={containerRef}
        className="relative flex-1 w-full h-[520px] bg-[#151310] overflow-hidden cursor-crosshair"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        style={{
          // Subtle CAD architectural blueprint grid
          backgroundImage: `
            linear-gradient(to right, rgba(212, 175, 55, 0.08) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(212, 175, 55, 0.08) 1px, transparent 1px),
            linear-gradient(to right, rgba(255, 255, 255, 0.03) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255, 255, 255, 0.03) 1px, transparent 1px)
          `,
          backgroundSize: `${zoom * 5}px ${zoom * 5}px, ${zoom * 5}px ${zoom * 5}px, ${zoom}px ${zoom}px, ${zoom}px ${zoom}px`,
          backgroundPosition: `${pan.x}px ${pan.y}px`
        }}
      >
        {/* World Coordinate Transform Wrapper */}
        <div
          className="absolute origin-top-left pointer-events-none"
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px)`
          }}
        >
          {/* Room Boundary Floor Slab */}
          <div
            className="absolute rounded-md border-2 border-[#D4AF37]/50 shadow-2xl pointer-events-none"
            style={{
              left: 0,
              top: 0,
              width: roomLengthFt * zoom,
              height: roomWidthFt * zoom,
              backgroundColor: 'rgba(28, 25, 20, 0.85)',
              boxShadow: '0 0 60px rgba(0,0,0,0.8)'
            }}
          >
            {/* Perimeter Dimension Annotations */}
            {showDimensions && (
              <>
                <div className="absolute -top-7 left-0 right-0 flex items-center justify-center text-[11px] font-mono text-[#D4AF37] font-bold">
                  <span>← {roomLengthFt}'-0" Length ({Math.round(roomLengthFt * 0.3048 * 10) / 10}m) →</span>
                </div>
                <div
                  className="absolute top-0 bottom-0 -left-10 flex items-center justify-center text-[11px] font-mono text-[#D4AF37] font-bold"
                  style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}
                >
                  <span>← {roomWidthFt}'-0" Width ({Math.round(roomWidthFt * 0.3048 * 10) / 10}m) →</span>
                </div>
              </>
            )}

            {/* Total Area Stamp */}
            <div className="absolute bottom-3 right-3 bg-black/80 px-3 py-1.5 rounded-lg border border-[#D4AF37]/30 text-[10px] font-mono text-gray-300">
              Gross Area: <strong className="text-[#D4AF37]">{roomLengthFt * roomWidthFt} sq.ft</strong> ({Math.round(roomLengthFt * roomWidthFt * 0.0929)} m²)
            </div>
          </div>

          {/* Render All Studio Elements */}
          {elements.map(elem => {
            // Respect Layer visibility toggles
            if (!activeLayers[elem.layer]) return null;

            const isSelected = elem.id === selectedElementId;
            const elemLeft = (elem.x - elem.width / 2) * zoom;
            const elemTop = (elem.y - elem.length / 2) * zoom;
            const elemWidthPx = elem.width * zoom;
            const elemHeightPx = elem.length * zoom;

            return (
              <div
                key={elem.id}
                onMouseDown={e => handleElementMouseDown(e, elem)}
                className={`absolute pointer-events-auto cursor-grab active:cursor-grabbing transition-shadow ${
                  isSelected ? 'ring-2 ring-[#D4AF37] shadow-lg z-30' : 'hover:ring-1 hover:ring-white/40 z-10'
                }`}
                style={{
                  left: elemLeft,
                  top: elemTop,
                  width: elemWidthPx,
                  height: elemHeightPx,
                  transform: `rotate(${elem.rotation}deg)`,
                  transformOrigin: 'center center'
                }}
              >
                {/* Visual Representation based on element type */}
                {elem.type === 'WALL' && (
                  <div
                    className="w-full h-full flex items-center justify-center border border-gray-400"
                    style={{
                      backgroundColor: elem.color || '#E8E5DF',
                      backgroundImage: elem.materialType === 'glass'
                        ? 'linear-gradient(135deg, rgba(255,255,255,0.4) 0%, rgba(135,206,235,0.3) 100%)'
                        : 'repeating-linear-gradient(45deg, transparent, transparent 4px, rgba(0,0,0,0.15) 4px, rgba(0,0,0,0.15) 8px)'
                    }}
                  >
                    {elemWidthPx > 40 && (
                      <span className="text-[9px] font-mono font-bold text-gray-800 truncate px-1">
                        {elem.width}ft {elem.materialType === 'glass' ? 'Glazing' : 'Wall'}
                      </span>
                    )}
                  </div>
                )}

                {elem.type === 'ROOM' && (
                  <div
                    className="w-full h-full border-2 border-dashed border-[#D4AF37]/60 flex flex-col items-center justify-center p-2 rounded-lg"
                    style={{ backgroundColor: 'rgba(212, 175, 55, 0.05)' }}
                  >
                    <span className="text-xs font-serif font-bold text-[#D4AF37] truncate text-center">
                      {elem.name}
                    </span>
                    <span className="text-[10px] font-mono text-gray-400">
                      {Math.round(elem.width * elem.length)} sq.ft
                    </span>
                  </div>
                )}

                {elem.type === 'DOOR' && (
                  <div className="w-full h-full relative flex items-center justify-center">
                    {/* Door Frame & Swing Arc */}
                    <div className="w-full h-full border border-amber-600 bg-amber-900/40 rounded-sm flex items-center justify-center">
                      <span className="text-[9px] font-mono font-bold text-amber-300">
                        DOOR {elem.width}'
                      </span>
                    </div>
                    {/* Architectural Swing Arc */}
                    <svg
                      className="absolute -bottom-[100%] left-0 w-[200%] h-[200%] pointer-events-none opacity-40"
                      viewBox="0 0 100 100"
                    >
                      <path
                        d="M 0,0 A 100,100 0 0,1 100,100"
                        fill="none"
                        stroke="#D4AF37"
                        strokeWidth="2"
                        strokeDasharray="4 2"
                      />
                    </svg>
                  </div>
                )}

                {elem.type === 'WINDOW' && (
                  <div className="w-full h-full border-2 border-sky-400 bg-sky-200/30 flex items-center justify-center">
                    <span className="text-[8px] font-mono font-bold text-sky-200">
                      GLAZING {elem.width}'
                    </span>
                  </div>
                )}

                {elem.type === 'COLUMN' && (
                  <div className="w-full h-full bg-gray-300 border-2 border-gray-600 rounded-full flex items-center justify-center shadow-md">
                    <span className="text-[9px] font-mono font-bold text-black">COL</span>
                  </div>
                )}

                {elem.type === 'EXTERIOR_POOL' && (
                  <div className="w-full h-full border-2 border-cyan-400 bg-cyan-700/40 rounded-lg flex flex-col items-center justify-center p-2 relative shadow-lg">
                    <span className="text-[10px] font-serif font-bold text-cyan-200">
                      {elem.name}
                    </span>
                    <span className="text-[9px] font-mono text-cyan-300">
                      {elem.width}' × {elem.length}' (Depth {elem.height}')
                    </span>
                  </div>
                )}

                {elem.type === 'EXTERIOR_PERGOLA' && (
                  <div
                    className="w-full h-full border-2 border-dashed border-amber-600/80 bg-amber-900/15 rounded-md flex flex-col items-center justify-center p-1"
                    style={{
                      backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 10px, rgba(212,175,55,0.2) 10px, rgba(212,175,55,0.2) 12px)'
                    }}
                  >
                    <span className="text-[9px] font-mono font-bold text-amber-300">PERGOLA CANOPY</span>
                  </div>
                )}

                {elem.type === 'EXTERIOR_DECK' && (
                  <div
                    className="w-full h-full border border-amber-800 bg-[#4A3319]/40 rounded-sm flex items-center justify-center"
                    style={{
                      backgroundImage: 'repeating-linear-gradient(90deg, transparent, transparent 8px, rgba(255,255,255,0.1) 8px, rgba(255,255,255,0.1) 9px)'
                    }}
                  >
                    <span className="text-[9px] font-mono font-bold text-amber-200">DECKING PLATFORM</span>
                  </div>
                )}

                {elem.type === 'EXTERIOR_TREE' && (
                  <div className="w-full h-full rounded-full border-2 border-emerald-500/80 bg-emerald-900/40 flex items-center justify-center shadow-lg relative">
                    <div className="w-2.5 h-2.5 rounded-full bg-amber-800 border border-amber-600" />
                    <span className="absolute bottom-1 text-[8px] font-mono font-bold text-emerald-300">TREE</span>
                  </div>
                )}

                {elem.type === 'STAIRS' && (
                  <div
                    className="w-full h-full border border-gray-400 bg-black/40 rounded-sm flex flex-col items-center justify-center"
                    style={{
                      backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 12px, rgba(255,255,255,0.25) 12px, rgba(255,255,255,0.25) 14px)'
                    }}
                  >
                    <span className="text-[9px] font-mono font-bold text-gray-200">STAIRS ↑</span>
                  </div>
                )}

                {(elem.type === 'PRIMITIVE_CUBE' || elem.type === 'PRIMITIVE_CYLINDER') && (
                  <div className={`w-full h-full border border-[#D4AF37] bg-[#D4AF37]/20 flex items-center justify-center ${elem.type === 'PRIMITIVE_CYLINDER' ? 'rounded-full' : 'rounded-sm'}`}>
                    <span className="text-[9px] font-mono font-bold text-[#D4AF37]">
                      {elem.type === 'PRIMITIVE_CYLINDER' ? 'CYL' : 'CUBE'}
                    </span>
                  </div>
                )}

                {elem.type === 'ANNOTATION' && (
                  <div className="w-full h-full border border-amber-400/40 bg-black/60 rounded px-1.5 py-0.5 flex items-center justify-center text-[10px] font-mono text-amber-300 font-bold">
                    <span>{elem.annotationText || elem.name}</span>
                  </div>
                )}

                {(elem.type === 'FURNITURE' || elem.type === 'IMPORTED_OBJECT') && (
                  <div
                    className="w-full h-full rounded-md border border-gray-700/80 flex flex-col items-center justify-center p-1 relative shadow-md overflow-hidden"
                    style={{ backgroundColor: elem.color || '#333' }}
                  >
                    {elem.isImported && (
                      <span className="absolute top-0.5 right-0.5 text-[8px] font-mono bg-black/70 text-[#D4AF37] px-1 rounded">
                        MKT
                      </span>
                    )}
                    <span className="text-[10px] font-serif font-bold text-gray-100 truncate w-full text-center px-1">
                      {elem.name}
                    </span>
                    <span className="text-[9px] font-mono text-gray-300">
                      {elem.width}' × {elem.length}'
                    </span>

                    {/* Architectural Icon / Silhouette */}
                    {elem.furnitureCategory === 'SOFA' && (
                      <div className="absolute top-0 left-0 right-0 h-1.5 bg-black/30 rounded-t-sm" />
                    )}
                    {elem.furnitureCategory === 'DINING_TABLE' && (
                      <div className="absolute inset-1 border border-dashed border-white/30 rounded-md" />
                    )}
                  </div>
                )}

                {/* ADA / IBC 36-Inch Clearance Envelope Ring */}
                {showClearances && (elem.clearanceRadiusFt || elem.type === 'DOOR') && (
                  <div
                    className="absolute rounded-full border border-dashed border-amber-400/50 pointer-events-none -z-10 animate-pulse"
                    style={{
                      left: -((elem.clearanceRadiusFt || 3.0) * zoom) / 2,
                      top: -((elem.clearanceRadiusFt || 3.0) * zoom) / 2,
                      width: elemWidthPx + (elem.clearanceRadiusFt || 3.0) * zoom,
                      height: elemHeightPx + (elem.clearanceRadiusFt || 3.0) * zoom,
                      backgroundColor: 'rgba(212, 175, 55, 0.04)'
                    }}
                  />
                )}

                {/* Selected Bounding Dimension HUD */}
                {isSelected && showDimensions && (
                  <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 bg-black/90 px-2 py-0.5 rounded text-[10px] font-mono text-[#D4AF37] whitespace-nowrap border border-[#D4AF37]/40 pointer-events-none shadow-md">
                    {elem.width}' × {elem.length}' @ {elem.rotation}°
                  </div>
                )}

                {/* Interactive Rotation Knob (Top Handle - Blender & AutoCAD Style) */}
                {isSelected && !elem.isLocked && (
                  <div
                    className="absolute -top-7 left-1/2 -translate-x-1/2 flex flex-col items-center cursor-grab active:cursor-grabbing z-30 group"
                    onMouseDown={(e) => handleRotateKnobStart(e, elem)}
                    title={`Drag to Rotate Element (${elem.rotation}°). Hold Shift for 15° snap.`}
                  >
                    <div className="w-4 h-4 rounded-full bg-[#D4AF37] border-2 border-black flex items-center justify-center shadow-lg group-hover:scale-125 transition-transform">
                      <RotateCw className="w-2.5 h-2.5 text-black" />
                    </div>
                    <div className="w-0.5 h-3 bg-[#D4AF37]" />
                  </div>
                )}
              </div>
            );
          })}

          {/* Dynamic Gap Dimension Line to Nearest Perimeter Wall */}
          {selectedElement && wallGapInfo && (
            <svg className="absolute top-0 left-0 w-full h-full pointer-events-none z-30 overflow-visible">
              {wallGapInfo.nearestSide === 'North' && (
                <>
                  <line
                    x1={selectedElement.x * zoom}
                    y1={0}
                    x2={selectedElement.x * zoom}
                    y2={(selectedElement.y - selectedElement.length / 2) * zoom}
                    stroke="#D4AF37"
                    strokeWidth="1.5"
                    strokeDasharray="4 3"
                  />
                  <rect
                    x={selectedElement.x * zoom - 32}
                    y={((selectedElement.y - selectedElement.length / 2) * zoom) / 2 - 9}
                    width="64"
                    height="18"
                    rx="4"
                    fill="#1C1814"
                    stroke="#D4AF37"
                    strokeWidth="1"
                  />
                  <text
                    x={selectedElement.x * zoom}
                    y={((selectedElement.y - selectedElement.length / 2) * zoom) / 2 + 4}
                    textAnchor="middle"
                    fill="#D4AF37"
                    fontSize="10"
                    fontFamily="monospace"
                    fontWeight="bold"
                  >
                    {wallGapInfo.minGap.toFixed(1)}' Gap
                  </text>
                </>
              )}
              {wallGapInfo.nearestSide === 'South' && (
                <>
                  <line
                    x1={selectedElement.x * zoom}
                    y1={(selectedElement.y + selectedElement.length / 2) * zoom}
                    x2={selectedElement.x * zoom}
                    y2={roomWidthFt * zoom}
                    stroke="#D4AF37"
                    strokeWidth="1.5"
                    strokeDasharray="4 3"
                  />
                  <rect
                    x={selectedElement.x * zoom - 32}
                    y={((selectedElement.y + selectedElement.length / 2 + roomWidthFt) * zoom) / 2 - 9}
                    width="64"
                    height="18"
                    rx="4"
                    fill="#1C1814"
                    stroke="#D4AF37"
                    strokeWidth="1"
                  />
                  <text
                    x={selectedElement.x * zoom}
                    y={((selectedElement.y + selectedElement.length / 2 + roomWidthFt) * zoom) / 2 + 4}
                    textAnchor="middle"
                    fill="#D4AF37"
                    fontSize="10"
                    fontFamily="monospace"
                    fontWeight="bold"
                  >
                    {wallGapInfo.minGap.toFixed(1)}' Gap
                  </text>
                </>
              )}
              {wallGapInfo.nearestSide === 'West' && (
                <>
                  <line
                    x1={0}
                    y1={selectedElement.y * zoom}
                    x2={(selectedElement.x - selectedElement.width / 2) * zoom}
                    y2={selectedElement.y * zoom}
                    stroke="#D4AF37"
                    strokeWidth="1.5"
                    strokeDasharray="4 3"
                  />
                  <rect
                    x={((selectedElement.x - selectedElement.width / 2) * zoom) / 2 - 32}
                    y={selectedElement.y * zoom - 9}
                    width="64"
                    height="18"
                    rx="4"
                    fill="#1C1814"
                    stroke="#D4AF37"
                    strokeWidth="1"
                  />
                  <text
                    x={((selectedElement.x - selectedElement.width / 2) * zoom) / 2}
                    y={selectedElement.y * zoom + 4}
                    textAnchor="middle"
                    fill="#D4AF37"
                    fontSize="10"
                    fontFamily="monospace"
                    fontWeight="bold"
                  >
                    {wallGapInfo.minGap.toFixed(1)}' Gap
                  </text>
                </>
              )}
              {wallGapInfo.nearestSide === 'East' && (
                <>
                  <line
                    x1={(selectedElement.x + selectedElement.width / 2) * zoom}
                    y1={selectedElement.y * zoom}
                    x2={roomLengthFt * zoom}
                    y2={selectedElement.y * zoom}
                    stroke="#D4AF37"
                    strokeWidth="1.5"
                    strokeDasharray="4 3"
                  />
                  <rect
                    x={((selectedElement.x + selectedElement.width / 2 + roomLengthFt) * zoom) / 2 - 32}
                    y={selectedElement.y * zoom - 9}
                    width="64"
                    height="18"
                    rx="4"
                    fill="#1C1814"
                    stroke="#D4AF37"
                    strokeWidth="1"
                  />
                  <text
                    x={((selectedElement.x + selectedElement.width / 2 + roomLengthFt) * zoom) / 2}
                    y={selectedElement.y * zoom + 4}
                    textAnchor="middle"
                    fill="#D4AF37"
                    fontSize="10"
                    fontFamily="monospace"
                    fontWeight="bold"
                  >
                    {wallGapInfo.minGap.toFixed(1)}' Gap
                  </text>
                </>
              )}
            </svg>
          )}

          {/* Active Drawing Preview (Wall, Glass Wall, Room, or Measure Line) */}
          {drawStart && (
            <>
              {(activeTool === 'DRAW_WALL' || activeTool === 'DRAW_GLASS_WALL') && (
                <div
                  className={`absolute border-2 pointer-events-none z-40 ${
                    activeTool === 'DRAW_GLASS_WALL'
                      ? 'border-sky-400 bg-sky-500/20'
                      : 'border-emerald-400 bg-emerald-500/20'
                  }`}
                  style={{
                    left: Math.min(drawStart.x, currentMouseFt.x) * zoom,
                    top: Math.min(drawStart.y, currentMouseFt.y) * zoom,
                    width: Math.max(Math.abs(currentMouseFt.x - drawStart.x), 0.5) * zoom,
                    height: Math.max(Math.abs(currentMouseFt.y - drawStart.y), 0.5) * zoom
                  }}
                >
                  <div className="absolute -top-6 left-0 bg-black text-amber-300 font-mono text-[10px] px-1.5 py-0.5 rounded border border-amber-500">
                    L: {Math.round(Math.hypot(currentMouseFt.x - drawStart.x, currentMouseFt.y - drawStart.y) * 10) / 10}ft
                  </div>
                </div>
              )}

              {activeTool === 'DRAW_ROOM' && (
                <div
                  className="absolute border-2 border-dashed border-[#D4AF37] bg-[#D4AF37]/10 pointer-events-none z-40"
                  style={{
                    left: Math.min(drawStart.x, currentMouseFt.x) * zoom,
                    top: Math.min(drawStart.y, currentMouseFt.y) * zoom,
                    width: Math.abs(currentMouseFt.x - drawStart.x) * zoom,
                    height: Math.abs(currentMouseFt.y - drawStart.y) * zoom
                  }}
                >
                  <div className="absolute top-2 left-2 bg-black/80 text-[#D4AF37] font-mono text-[10px] px-2 py-1 rounded">
                    Room: {Math.round(Math.abs(currentMouseFt.x - drawStart.x) * Math.abs(currentMouseFt.y - drawStart.y))} sq.ft
                  </div>
                </div>
              )}

              {activeTool === 'MEASURE' && (
                <svg
                  className="absolute top-0 left-0 w-full h-full pointer-events-none z-50 overflow-visible"
                >
                  <line
                    x1={drawStart.x * zoom}
                    y1={drawStart.y * zoom}
                    x2={currentMouseFt.x * zoom}
                    y2={currentMouseFt.y * zoom}
                    stroke="#D4AF37"
                    strokeWidth="2"
                    strokeDasharray="4 3"
                  />
                  <circle cx={drawStart.x * zoom} cy={drawStart.y * zoom} r="4" fill="#D4AF37" />
                  <circle cx={currentMouseFt.x * zoom} cy={currentMouseFt.y * zoom} r="4" fill="#D4AF37" />
                </svg>
              )}
            </>
          )}
        </div>

        {/* Live Cursor Coordinate HUD */}
        <div className="absolute bottom-3 left-3 bg-[#24201A]/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10 text-[11px] font-mono text-gray-300 pointer-events-none z-20 flex items-center gap-3">
          <div>
            X: <span className="text-[#D4AF37] font-bold">{currentMouseFt.x.toFixed(1)}'</span> Y:{' '}
            <span className="text-[#D4AF37] font-bold">{currentMouseFt.y.toFixed(1)}'</span>
          </div>
          {measurementDist !== null && activeTool === 'MEASURE' && (
            <div className="text-emerald-400 font-bold border-l border-white/10 pl-2">
              Dist: {measurementDist.toFixed(2)}ft ({Math.round(measurementDist * 0.3048 * 100) / 100}m)
            </div>
          )}
        </div>

        {/* Comprehensive Design Controls Pane (Blender & AutoCAD Style) */}
        {selectedElement && (
          <div className="absolute top-4 right-4 bg-[#1C1814]/95 backdrop-blur-md p-3.5 rounded-2xl border border-[#D4AF37]/50 shadow-2xl text-xs space-y-3 z-30 w-80 animate-in fade-in-50 max-h-[85vh] overflow-y-auto scrollbar-thin">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
              <div className="truncate pr-2">
                <span className="font-serif font-bold text-white truncate block text-sm">
                  {selectedElement.name}
                </span>
                <span className="text-[10px] font-mono text-gray-400">
                  {selectedElement.width}' × {selectedElement.length}' × {selectedElement.height}' • Elev: +{selectedElement.z}'
                </span>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#D4AF37]/20 text-[#D4AF37] font-bold border border-[#D4AF37]/30 shrink-0">
                {selectedElement.type}
              </span>
            </div>

            {/* Blender-Style Control Tabs */}
            <div className="flex items-center bg-black/50 p-1 rounded-xl border border-white/10">
              {[
                { id: 'ROTATE' as const, label: 'Rotation', icon: RotateCw },
                { id: 'COLOR' as const, label: 'Color / Fin', icon: Palette },
                { id: 'GAPS' as const, label: 'Gaps / Offsets', icon: Sliders }
              ].map(tab => {
                const Icon = tab.icon;
                const isActive = activePaneTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActivePaneTab(tab.id)}
                    className={`flex-1 py-1 text-[11px] font-mono font-medium rounded-lg flex items-center justify-center gap-1 transition-all cursor-pointer ${
                      isActive ? 'bg-[#D4AF37] text-black font-bold shadow-xs' : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    <Icon className="w-3 h-3" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Tab 1: Precise Rotation Controls */}
            {activePaneTab === 'ROTATE' && (
              <div className="space-y-2.5 font-mono">
                {/* Direct Numeric Degree Input + Stepper */}
                <div>
                  <div className="flex justify-between items-center mb-1 text-[11px] text-gray-300">
                    <span>Rotation Angle (Z):</span>
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        min="0"
                        max="360"
                        step="1"
                        value={selectedElement.rotation}
                        onChange={e => onUpdateElement(selectedElement.id, { rotation: ((Number(e.target.value) % 360) + 360) % 360 })}
                        className="w-16 px-1.5 py-0.5 bg-black/60 border border-[#D4AF37]/60 rounded text-right font-bold text-[#D4AF37] text-xs focus:outline-none"
                      />
                      <span className="text-[#D4AF37] font-bold">°</span>
                    </div>
                  </div>

                  {/* Interactive Range Slider */}
                  <input
                    type="range"
                    min="0"
                    max="360"
                    step="1"
                    value={selectedElement.rotation}
                    onChange={e => onUpdateElement(selectedElement.id, { rotation: Number(e.target.value) })}
                    className="w-full accent-[#D4AF37] cursor-pointer h-1.5 bg-gray-700 rounded-lg"
                  />
                </div>

                {/* Quick Angle Presets */}
                <div>
                  <span className="text-[10px] text-gray-400 block mb-1">Preset Angles:</span>
                  <div className="grid grid-cols-6 gap-1">
                    {[0, 45, 90, 135, 180, 270].map(deg => (
                      <button
                        key={deg}
                        type="button"
                        onClick={() => onUpdateElement(selectedElement.id, { rotation: deg })}
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

                {/* Increment Stepper Buttons */}
                <div className="flex items-center justify-between gap-1 pt-0.5">
                  {[-90, -45, -15, +15, +45, +90].map(delta => (
                    <button
                      key={delta}
                      type="button"
                      onClick={() => onUpdateElement(selectedElement.id, { rotation: ((selectedElement.rotation + delta) % 360 + 360) % 360 })}
                      className="flex-1 py-1 rounded bg-black/40 hover:bg-white/15 text-gray-300 hover:text-white border border-white/10 text-[10px] cursor-pointer"
                      title={`Rotate ${delta > 0 ? '+' : ''}${delta}°`}
                    >
                      {delta > 0 ? `+${delta}°` : `${delta}°`}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Tab 2: Color Picker & Architectural Finishes */}
            {activePaneTab === 'COLOR' && (
              <div className="space-y-2.5">
                {/* Native Color Picker + Hex */}
                <div className="flex items-center justify-between gap-2">
                  <label className="text-[11px] text-gray-300 font-mono">Custom Color:</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={selectedElement.color || '#D4AF37'}
                      onChange={e => onUpdateElement(selectedElement.id, { color: e.target.value })}
                      className="w-7 h-7 rounded-lg border border-white/20 cursor-pointer bg-transparent"
                    />
                    <input
                      type="text"
                      value={selectedElement.color || '#D4AF37'}
                      onChange={e => onUpdateElement(selectedElement.id, { color: e.target.value })}
                      className="w-20 px-2 py-1 bg-black/60 border border-white/20 rounded font-mono text-[11px] text-gray-200"
                    />
                  </div>
                </div>

                {/* Architectural Swatch Chips */}
                <div>
                  <span className="text-[10px] font-mono text-gray-400 block mb-1">Architectural Palette:</span>
                  <div className="grid grid-cols-5 gap-1.5">
                    {[
                      { name: 'Alabaster', hex: '#F4F1EA', mat: 'plaster' },
                      { name: 'Smoked Oak', hex: '#5C4834', mat: 'oak' },
                      { name: 'Walnut', hex: '#3B2F2F', mat: 'walnut' },
                      { name: 'Travertine', hex: '#D4CBB8', mat: 'travertine' },
                      { name: 'Calacatta', hex: '#F5F5F3', mat: 'marble' },
                      { name: 'Terracotta', hex: '#B85D3A', mat: 'ceramic' },
                      { name: 'Sage', hex: '#7C8B7A', mat: 'plaster' },
                      { name: 'Cognac', hex: '#653B20', mat: 'leather' },
                      { name: 'Obsidian', hex: '#1C1A17', mat: 'matte_black' },
                      { name: 'Pool Cyan', hex: '#2EA5A8', mat: 'water' }
                    ].map(swatch => (
                      <button
                        key={swatch.name}
                        type="button"
                        onClick={() => onUpdateElement(selectedElement.id, {
                          color: swatch.hex,
                          materialType: swatch.mat as any,
                          materialName: swatch.name
                        })}
                        className="h-6 rounded border border-white/20 hover:scale-105 transition-transform flex items-center justify-center cursor-pointer shadow-xs"
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

                {/* Material Finish Preset */}
                <div>
                  <label className="text-[10px] font-mono text-gray-400 block mb-1">Shader Preset:</label>
                  <select
                    value={selectedElement.materialType}
                    onChange={e => onUpdateElement(selectedElement.id, { materialType: e.target.value as any })}
                    className="w-full px-2.5 py-1.5 bg-black/60 border border-white/20 rounded-xl font-mono text-xs text-gray-200"
                  >
                    <option value="plaster">Venetian Plaster</option>
                    <option value="oak">Quarter-Sawn Smoked Oak</option>
                    <option value="walnut">American Black Walnut</option>
                    <option value="travertine">Navona Travertine</option>
                    <option value="marble">Calacatta Vagli Marble</option>
                    <option value="boucle">Wool Bouclé</option>
                    <option value="leather">Cognac Saddle Leather</option>
                    <option value="bronze">Architectural Bronze</option>
                    <option value="matte_black">Matte Black Anodized</option>
                    <option value="steel">Brushed Steel</option>
                    <option value="terrazzo">Architectural Terrazzo</option>
                    <option value="glass">Low-E Architectural Glazing</option>
                    <option value="concrete">Fair-Faced Concrete</option>
                    <option value="ceramic">Artisan Ceramic</option>
                    <option value="water">Azure Pool Water</option>
                    <option value="timber_deck">Timber Sun Decking</option>
                    <option value="grass">Biophilic Greenery</option>
                  </select>
                </div>
              </div>
            )}

            {/* Tab 3: Gaps, Spacing & Margins (AutoCAD / Blender Precision) */}
            {activePaneTab === 'GAPS' && (
              <div className="space-y-2.5 font-mono">
                {/* Nearest Wall Gap HUD */}
                {wallGapInfo && (
                  <div className="p-2 bg-black/60 rounded-xl border border-white/10 flex items-center justify-between">
                    <span className="text-gray-400 text-[11px]">Nearest ({wallGapInfo.nearestSide} Wall):</span>
                    <span className="text-[#D4AF37] font-bold text-xs">{wallGapInfo.minGap.toFixed(2)} ft</span>
                  </div>
                )}

                {/* Quick Gap Alignment Buttons */}
                <div>
                  <span className="text-[10px] text-gray-400 block mb-1">Snap with Set Gap to Wall:</span>
                  <div className="grid grid-cols-2 gap-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        if (wallGapInfo?.nearestSide === 'West') onUpdateElement(selectedElement.id, { x: 2 + selectedElement.width / 2 });
                        else if (wallGapInfo?.nearestSide === 'East') onUpdateElement(selectedElement.id, { x: roomLengthFt - 2 - selectedElement.width / 2 });
                        else if (wallGapInfo?.nearestSide === 'North') onUpdateElement(selectedElement.id, { y: 2 + selectedElement.length / 2 });
                        else if (wallGapInfo?.nearestSide === 'South') onUpdateElement(selectedElement.id, { y: roomWidthFt - 2 - selectedElement.length / 2 });
                      }}
                      className="py-1 px-2 bg-white/5 hover:bg-white/15 text-gray-200 rounded border border-white/10 text-[10px] text-center cursor-pointer"
                    >
                      Align 2.0ft Gap
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (wallGapInfo?.nearestSide === 'West') onUpdateElement(selectedElement.id, { x: 4 + selectedElement.width / 2 });
                        else if (wallGapInfo?.nearestSide === 'East') onUpdateElement(selectedElement.id, { x: roomLengthFt - 4 - selectedElement.width / 2 });
                        else if (wallGapInfo?.nearestSide === 'North') onUpdateElement(selectedElement.id, { y: 4 + selectedElement.length / 2 });
                        else if (wallGapInfo?.nearestSide === 'South') onUpdateElement(selectedElement.id, { y: roomWidthFt - 4 - selectedElement.length / 2 });
                      }}
                      className="py-1 px-2 bg-white/5 hover:bg-white/15 text-gray-200 rounded border border-white/10 text-[10px] text-center cursor-pointer"
                    >
                      Align 4.0ft Corridor
                    </button>
                  </div>
                </div>

                {/* Clearance Buffer Radius */}
                <div>
                  <div className="flex justify-between items-center text-[10px] text-gray-400 mb-1">
                    <span>IBC Clearance Radius:</span>
                    <span className="text-white font-bold">{selectedElement.clearanceRadiusFt || 3.0} ft</span>
                  </div>
                  <input
                    type="range"
                    min="1.0"
                    max="6.0"
                    step="0.5"
                    value={selectedElement.clearanceRadiusFt || 3.0}
                    onChange={e => onUpdateElement(selectedElement.id, { clearanceRadiusFt: Number(e.target.value) })}
                    className="w-full accent-[#D4AF37] cursor-pointer h-1.5 bg-gray-700 rounded-lg"
                  />
                </div>

                {/* Array Spacing Gap Tool */}
                <div className="pt-1 border-t border-white/10 flex items-center justify-between gap-2">
                  <div className="text-[10px] text-gray-400">
                    <span>Repetition Gap:</span>
                    <input
                      type="number"
                      min="1"
                      max="20"
                      step="1"
                      defaultValue={selectedElement.arraySpacingFt || 4}
                      onChange={e => onUpdateElement(selectedElement.id, { arraySpacingFt: Number(e.target.value) })}
                      className="w-12 ml-1 px-1 bg-black/60 border border-white/20 rounded text-[#D4AF37] text-right font-bold"
                    />
                    <span className="ml-0.5">ft</span>
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
                      onAddElement(dup);
                      onSelectElement(dup.id);
                    }}
                    className="py-1 px-2.5 rounded bg-[#D4AF37]/20 hover:bg-[#D4AF37]/40 text-[#D4AF37] font-bold border border-[#D4AF37]/40 text-[10px] cursor-pointer"
                  >
                    + Array Duplicate
                  </button>
                </div>
              </div>
            )}

            {/* Bottom Actions Ribbon */}
            <div className="flex items-center gap-1.5 pt-2 border-t border-white/10">
              <button
                type="button"
                onClick={() => onUpdateElement(selectedElement.id, { isLocked: !selectedElement.isLocked })}
                className={`flex-1 py-1.5 rounded-lg flex items-center justify-center gap-1 text-[11px] font-mono cursor-pointer transition-colors ${
                  selectedElement.isLocked ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' : 'bg-white/10 text-gray-300 hover:text-white'
                }`}
                title={selectedElement.isLocked ? 'Unlock Position' : 'Lock Position'}
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
                  onAddElement(dup);
                  onSelectElement(dup.id);
                }}
                className="flex-1 py-1.5 bg-white/10 hover:bg-white/20 text-gray-200 rounded-lg flex items-center justify-center gap-1 text-[11px] font-mono cursor-pointer"
                title="Duplicate (Ctrl+D)"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>Duplicate</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  onDeleteElement(selectedElement.id);
                  onSelectElement(null);
                }}
                className="p-1.5 bg-red-900/40 hover:bg-red-900/70 text-red-200 rounded-lg cursor-pointer"
                title="Delete (Del)"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
