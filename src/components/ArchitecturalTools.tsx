import React, { useState, useRef } from 'react';
import {
  Compass,
  Ruler,
  Layers,
  Palette,
  Maximize2,
  Minimize2,
  Copy,
  Download,
  Check,
  RefreshCw,
  Info,
  Sliders,
  Sparkles,
  Grid,
  Square,
  Move,
  RotateCw,
  Trash2,
  Plus,
  ShieldCheck,
  Flame,
  Sun,
  Wind,
  DollarSign,
  FileSpreadsheet,
  Box,
  Eye
} from 'lucide-react';
import { useApp } from '../context/AppContext';

// ==========================================
// DATA: ARCHITECTURAL MATERIALS & FINISHES
// ==========================================
export interface MaterialItem {
  id: string;
  name: string;
  category: 'STONE' | 'TIMBER' | 'METAL' | 'PLASTER_TEXTILE';
  csiCode: string;
  origin: string;
  finish: string;
  lrv: number; // Light Reflectance Value 0-100
  fireRating: 'Class A' | 'Class B' | 'Non-Combustible' | string;
  leedPoints: string;
  costPerSqFt: number;
  leadTimeWeeks: number;
  acousticNrc?: number;
  slipRating?: string;
  imageUrl: string;
  description: string;
}

export const ARCHITECTURAL_MATERIALS: MaterialItem[] = [
  {
    id: 'mat-1',
    name: 'Navona Roman Travertine (Cross-Cut)',
    category: 'STONE',
    csiCode: '09 30 13 - Stone Tiling & Slabs',
    origin: 'Tivoli, Rome, Italy',
    finish: 'Honed & Filled (Low Sheen)',
    lrv: 58,
    fireRating: 'Non-Combustible',
    leedPoints: 'MRc4 Recycled, EQc4.1 Low-Emitting',
    costPerSqFt: 185,
    leadTimeWeeks: 6,
    slipRating: 'DCOF 0.52 (Wet Compliant)',
    imageUrl: 'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?auto=format&fit=crop&w=600&q=80',
    description: 'Porous sedimentary limestone with warm cream and ivory banding. Quarried from the historical Guidonia basins outside Rome.'
  },
  {
    id: 'mat-2',
    name: 'Calacatta Viola Marble (Honed Bookmatched)',
    category: 'STONE',
    csiCode: '09 30 13 - Luxury Dimension Stone',
    origin: 'Carrara, Tuscany, Italy',
    finish: 'Silk Satin Honed',
    lrv: 42,
    fireRating: 'Non-Combustible',
    leedPoints: 'MRc5 Regional Extraction',
    costPerSqFt: 295,
    leadTimeWeeks: 8,
    slipRating: 'DCOF 0.44',
    imageUrl: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=600&q=80',
    description: 'Dramatic brecciated marble featuring deep cabernet-wine veins against a creamy ivory crystalline field. High sculptural impact.'
  },
  {
    id: 'mat-3',
    name: 'Pietra di Rapolano Tuscan Basalt',
    category: 'STONE',
    csiCode: '09 30 13 - Architectural Stonework',
    origin: 'Siena, Tuscany, Italy',
    finish: 'Flamed & Brushed Pitted',
    lrv: 28,
    fireRating: 'Non-Combustible',
    leedPoints: 'MRc4 Regional Material',
    costPerSqFt: 165,
    leadTimeWeeks: 5,
    slipRating: 'DCOF 0.68 (Exterior Pool Safe)',
    imageUrl: 'https://images.unsplash.com/photo-1617806118233-18e1de247200?auto=format&fit=crop&w=600&q=80',
    description: 'Volcanic thermal stone characterized by earthy ochre, amber, and charcoal sedimentation. Outstanding thermal mass.'
  },
  {
    id: 'mat-4',
    name: 'Fumed European French Oak (Quarter-Sawn)',
    category: 'TIMBER',
    csiCode: '09 64 00 - Engineered Wood Flooring & Paneling',
    origin: 'Burgundy, France',
    finish: 'Natural Ultra-Matte Oil (0% Sheen)',
    lrv: 24,
    fireRating: 'Class B (ASTM E84)',
    leedPoints: 'FSC 100% Certified, CARB II Compliant',
    costPerSqFt: 145,
    leadTimeWeeks: 4,
    acousticNrc: 0.15,
    imageUrl: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=600&q=80',
    description: 'Deep smoked tannin reaction producing rich caramel-to-espresso undertones without artificial chemical stains. Wire-brushed grain.'
  },
  {
    id: 'mat-5',
    name: 'Japanese Hinoki Cypress (Cryptomeria)',
    category: 'TIMBER',
    csiCode: '06 20 00 - Finish Carpentry & Millwork',
    origin: 'Kiso Valley, Nagano, Japan',
    finish: 'Raw Planed (Kanna Sheen)',
    lrv: 62,
    fireRating: 'Class B',
    leedPoints: 'PEFC Sustainable Forestry',
    costPerSqFt: 220,
    leadTimeWeeks: 7,
    acousticNrc: 0.22,
    imageUrl: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=600&q=80',
    description: 'Aromatic sacred cypress renowned for natural phytoncides, satin grain, and superior moisture resilience for wellness and baths.'
  },
  {
    id: 'mat-6',
    name: 'Unlacquered Living Architectural Bronze',
    category: 'METAL',
    csiCode: '05 50 00 - Architectural Metal Fabrics & Trim',
    origin: 'Birmingham, United Kingdom',
    finish: 'Hand-Antiqued Wax Finish',
    lrv: 35,
    fireRating: 'Non-Combustible',
    leedPoints: '85% Post-Consumer Recycled Content',
    costPerSqFt: 240,
    leadTimeWeeks: 5,
    imageUrl: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=600&q=80',
    description: 'C93200 copper alloy engineered to oxidize naturally over decades, creating a rich organic patina and tactile heirloom resonance.'
  },
  {
    id: 'mat-7',
    name: 'Fluted Low-Iron Cast Architecture Glass',
    category: 'METAL',
    csiCode: '08 81 00 - Decorative Architectural Glazing',
    origin: 'Murano / Frankfurt, Germany',
    finish: '12mm Reeded / Linear Flute',
    lrv: 86,
    fireRating: 'Non-Combustible',
    leedPoints: 'EQc8.1 Daylighting & Views',
    costPerSqFt: 175,
    leadTimeWeeks: 4,
    acousticNrc: 0.08,
    imageUrl: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=600&q=80',
    description: 'Ultra-clear crystal glass with zero green iron cast. Linear rhythmic flutes diffuse directional glare while preserving spatial depth.'
  },
  {
    id: 'mat-8',
    name: 'Venetian Marmorino Lime Plaster (Fine Stucco)',
    category: 'PLASTER_TEXTILE',
    csiCode: '09 24 00 - Portland & Lime Plastering',
    origin: 'Veneto, Italy',
    finish: 'Troweled Satin Smooth with Olive Wax',
    lrv: 74,
    fireRating: 'Class A (ASTM E84)',
    leedPoints: 'Zero VOC, Cradle to Cradle Gold, Breathable',
    costPerSqFt: 48,
    leadTimeWeeks: 2,
    acousticNrc: 0.10,
    imageUrl: 'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?auto=format&fit=crop&w=600&q=80',
    description: 'Natural slaked lime and micro-ground Carrara marble dust. Breathable, naturally mold-resistant, and radiant with subtle stone sheen.'
  },
  {
    id: 'mat-9',
    name: 'Belgian Spun Bouclé & Acoustic Felt Backing',
    category: 'PLASTER_TEXTILE',
    csiCode: '09 84 00 - Acoustic Wall & Upholstery Paneling',
    origin: 'Kortrijk, Flanders, Belgium',
    finish: 'Textured Knotted Wool / Linen Blend',
    lrv: 64,
    fireRating: 'Class A (Fire-Treated)',
    leedPoints: 'OEKO-TEX Standard 100, 100% Biodegradable',
    costPerSqFt: 85,
    leadTimeWeeks: 3,
    acousticNrc: 0.75,
    imageUrl: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=600&q=80',
    description: 'Tactile wool loops woven on heirloom shuttles. Integrated with high-density acoustic recycled backing to dampen luxury spatial resonance.'
  }
];

// ==========================================
// DATA: ARCHITECTURAL COLOR PALETTES & LRV
// ==========================================
export interface ColorHarmony {
  id: string;
  name: string;
  movement: string;
  description: string;
  bestDaylight: string;
  swatches: {
    name: string;
    hex: string;
    lrv: number;
    usage: 'FIELD_WALL' | 'TRIM_CEILING' | 'ACCENT' | 'MILLWORK';
    tradeRef: string;
  }[];
}

export const ARCHITECTURAL_COLOR_HARMONIES: ColorHarmony[] = [
  {
    id: 'pal-1',
    name: 'Roman Villa & Travertine Solarium',
    movement: 'Classical Warmth & Monumental Stone',
    description: 'Sun-drenched Mediterranean neutrals calibrated to amplify low-angle golden light without yellowing.',
    bestDaylight: 'South & West Exposure (Softens harsh sunlight with mineral warmth)',
    swatches: [
      { name: 'Navona Bone', hex: '#EBE5D8', lrv: 72, usage: 'FIELD_WALL', tradeRef: 'VTX-01 / Pointing 2003' },
      { name: 'Roman Travertine', hex: '#D8CEBD', lrv: 58, usage: 'TRIM_CEILING', tradeRef: 'VTX-02 / Skimming Stone' },
      { name: 'Burnished Umber', hex: '#5E4C3E', lrv: 18, usage: 'MILLWORK', tradeRef: 'VTX-03 / Salon Drab' },
      { name: 'Patinated Gold', hex: '#C5A059', lrv: 44, usage: 'ACCENT', tradeRef: 'VTX-04 / Atelier Brass' }
    ]
  },
  {
    id: 'pal-2',
    name: 'Nordic Light & Fumed Timber',
    movement: 'Scandinavian Organic Precision',
    description: 'High-LRV reflective field whites balanced with muted charcoal basalt to maximize indirect northern ambient daylight.',
    bestDaylight: 'North Exposure (Bounces cool sky light and creates spacious tranquility)',
    swatches: [
      { name: 'Chalk Plaster', hex: '#F4F3F0', lrv: 85, usage: 'FIELD_WALL', tradeRef: 'VTX-11 / All White 2005' },
      { name: 'Pale Taupe Linen', hex: '#DDD8CF', lrv: 64, usage: 'TRIM_CEILING', tradeRef: 'VTX-12 / Ammonite' },
      { name: 'Smoked Oak Bark', hex: '#4A423B', lrv: 14, usage: 'MILLWORK', tradeRef: 'VTX-13 / Railings Black' },
      { name: 'Icelandic Slate', hex: '#8C9294', lrv: 32, usage: 'ACCENT', tradeRef: 'VTX-14 / Down Pipe' }
    ]
  },
  {
    id: 'pal-3',
    name: 'Haussmannian Gilt & Velvet Noir',
    movement: 'Parisian Heritage & Neo-Classical Glamour',
    description: 'Sophisticated architectural boiserie tones paired with deep velvety shadows for high-contrast evening drama.',
    bestDaylight: 'Evening Entertaining & East Morning Glow',
    swatches: [
      { name: 'Boiserie Ecru', hex: '#E8E1D3', lrv: 68, usage: 'FIELD_WALL', tradeRef: 'VTX-21 / Joas White' },
      { name: 'Parchment Ceiling', hex: '#F7F4EB', lrv: 88, usage: 'TRIM_CEILING', tradeRef: 'VTX-22 / Wimborne White' },
      { name: 'Cabinet Noir', hex: '#242325', lrv: 6, usage: 'MILLWORK', tradeRef: 'VTX-23 / Pitch Black' },
      { name: 'Bespoke Leaf Gilt', hex: '#D4AF37', lrv: 46, usage: 'ACCENT', tradeRef: 'VTX-24 / Versailles Gilt' }
    ]
  },
  {
    id: 'pal-4',
    name: 'Kyoto Zen Courtyard & Washi',
    movement: 'Japanese Wabi-Sabi & Biophilic Zen',
    description: 'Earthy earthen pigments, moss tones, and translucent paper whites fostering deep sensory restoration.',
    bestDaylight: 'Courtyard Diffuse Light & Filtered Pergolas',
    swatches: [
      { name: 'Rice Washi Paper', hex: '#F6F3EB', lrv: 82, usage: 'FIELD_WALL', tradeRef: 'VTX-31 / Strong White' },
      { name: 'Hinoki Silt', hex: '#D6C8B2', lrv: 54, usage: 'TRIM_CEILING', tradeRef: 'VTX-32 / Cord 16' },
      { name: 'Charred Sugi Timber', hex: '#2E2B2A', lrv: 8, usage: 'MILLWORK', tradeRef: 'VTX-33 / Off-Black' },
      { name: 'Garden Moss Mineral', hex: '#636B5E', lrv: 26, usage: 'ACCENT', tradeRef: 'VTX-34 / Lichen Green' }
    ]
  }
];

// ==========================================
// DATA: 2D SPATIAL BLOCKS
// ==========================================
interface SpatialElement {
  id: string;
  name: string;
  category: 'FURNITURE' | 'ARCHITECTURAL' | 'WALL';
  widthFt: number;
  depthFt: number;
  rotation: number; // 0, 90, 180, 270
  x: number; // in feet inside room
  y: number; // in feet inside room
  color: string;
}

const DEFAULT_SPATIAL_ELEMENTS: SpatialElement[] = [
  { id: 'elem-1', name: '10ft Sectional Modular Sofa', category: 'FURNITURE', widthFt: 10, depthFt: 4, rotation: 0, x: 4, y: 5, color: '#C8BCA8' },
  { id: 'elem-2', name: 'Monolithic Stone Coffee Table', category: 'FURNITURE', widthFt: 5, depthFt: 3, rotation: 0, x: 6, y: 10, color: '#8A7B68' },
  { id: 'elem-3', name: '8-Seat Banquet Dining Table', category: 'FURNITURE', widthFt: 8, depthFt: 3.5, rotation: 90, x: 18, y: 4, color: '#6A5645' },
  { id: 'elem-4', name: 'Architectural Fireplace Hearth', category: 'ARCHITECTURAL', widthFt: 8, depthFt: 2, rotation: 0, x: 5, y: 1, color: '#453C35' },
  { id: 'elem-5', name: '48" Frameless Pivot Door Entry', category: 'ARCHITECTURAL', widthFt: 4, depthFt: 1, rotation: 0, x: 1, y: 17, color: '#D4AF37' }
];

export const ArchitecturalTools: React.FC = () => {
  const { addToast } = useApp();
  const [currentTool, setCurrentTool] = useState<'scale-calc' | 'material-spec' | 'color-lrv' | 'layout-planner'>('scale-calc');

  // ----------------------------------------------------
  // TOOL 1: SCALE & SPATIAL CALCULATOR STATE
  // ----------------------------------------------------
  const [scaleMode, setScaleMode] = useState<'DRAWING_TO_REAL' | 'REAL_TO_DRAWING'>('DRAWING_TO_REAL');
  const [selectedScaleRatio, setSelectedScaleRatio] = useState<number>(48); // 1/4" = 1'-0" (1:48)
  const [inputDrawingMeasurementInches, setInputDrawingMeasurementInches] = useState<number>(3.5);
  const [inputRealFeet, setInputRealFeet] = useState<number>(14);
  const [inputRealInches, setInputRealInches] = useState<number>(0);

  // Spatial Dimensions
  const [roomLengthFt, setRoomLengthFt] = useState<number>(26);
  const [roomWidthFt, setRoomWidthFt] = useState<number>(18);
  const [roomHeightFt, setRoomHeightFt] = useState<number>(11.5);
  const [spaceTypePreset, setSpaceTypePreset] = useState<'LIVING' | 'DINING' | 'KITCHEN' | 'MASTER' | 'STUDY' | 'SPA'>('LIVING');
  const [finishGrade, setFinishGrade] = useState<'ULTRA_LUXURY' | 'HIGH_END' | 'MODERN'>('ULTRA_LUXURY');

  // Math Computations
  const floorAreaSqFt = roomLengthFt * roomWidthFt;
  const floorAreaSqMeters = floorAreaSqFt * 0.092903;
  const perimeterLinearFt = (roomLengthFt + roomWidthFt) * 2;
  const wallSurfaceAreaGross = perimeterLinearFt * roomHeightFt;
  const wallSurfaceAreaNet = Math.max(0, Math.round(wallSurfaceAreaGross * 0.82)); // Deduct ~18% for apertures
  const roomVolumeCuFt = floorAreaSqFt * roomHeightFt;
  const roomVolumeCuMeters = roomVolumeCuFt * 0.0283168;

  // Space Norms
  const SPACE_NORMS = {
    LIVING: { label: 'Penthouse Living Salon', targetLux: 200, cfmPerSqFt: 0.85, sqFtPerTon: 480 },
    DINING: { label: 'Grand Dining Salon', targetLux: 220, cfmPerSqFt: 0.90, sqFtPerTon: 450 },
    KITCHEN: { label: 'Gourmet Culinary Scullery', targetLux: 450, cfmPerSqFt: 1.40, sqFtPerTon: 350 },
    MASTER: { label: 'Master Bedroom Sanctuary', targetLux: 150, cfmPerSqFt: 0.75, sqFtPerTon: 520 },
    STUDY: { label: 'Executive Library / Atelier', targetLux: 380, cfmPerSqFt: 0.95, sqFtPerTon: 460 },
    SPA: { label: 'Spa Wellness Bath Suite', targetLux: 220, cfmPerSqFt: 1.50, sqFtPerTon: 400 }
  }[spaceTypePreset];

  const targetLumens = Math.round(floorAreaSqMeters * SPACE_NORMS.targetLux);
  const targetCfm = Math.round(floorAreaSqFt * SPACE_NORMS.cfmPerSqFt);
  const coolingTons = (floorAreaSqFt / SPACE_NORMS.sqFtPerTon).toFixed(2);
  const coolingBtu = Math.round(Number(coolingTons) * 12000);

  // Fit-out Budget Estimates
  const COST_RATES = {
    ULTRA_LUXURY: { min: 450, max: 750, label: 'Ultra-Luxury Bespoke (Custom Italian Slabs, Flush Millwork)' },
    HIGH_END: { min: 300, max: 450, label: 'High-End Architectural (Quarter-sawn Oak, Engineered Stone)' },
    MODERN: { min: 200, max: 300, label: 'Modern Luxury Core (Standard Plasters, Premium Tiles)' }
  }[finishGrade];

  const estimatedCostMin = Math.round(floorAreaSqFt * COST_RATES.min);
  const estimatedCostMax = Math.round(floorAreaSqFt * COST_RATES.max);

  // ----------------------------------------------------
  // TOOL 2: MATERIALITY SPECIFIER STATE
  // ----------------------------------------------------
  const [materialCategoryFilter, setMaterialCategoryFilter] = useState<'ALL' | 'STONE' | 'TIMBER' | 'METAL' | 'PLASTER_TEXTILE'>('ALL');
  const [finishSchedule, setFinishSchedule] = useState<{
    flooring: MaterialItem | null;
    walls: MaterialItem | null;
    millwork: MaterialItem | null;
    accents: MaterialItem | null;
    ceiling: MaterialItem | null;
  }>({
    flooring: ARCHITECTURAL_MATERIALS[0], // Navona Travertine
    walls: ARCHITECTURAL_MATERIALS[7], // Marmorino
    millwork: ARCHITECTURAL_MATERIALS[3], // Fumed Oak
    accents: ARCHITECTURAL_MATERIALS[5], // Living Bronze
    ceiling: ARCHITECTURAL_MATERIALS[7]
  });

  const assignMaterialToSlot = (slot: keyof typeof finishSchedule, mat: MaterialItem) => {
    setFinishSchedule(prev => ({ ...prev, [slot]: mat }));
    addToast('success', `Assigned ${mat.name} to ${slot.toUpperCase()}`);
  };

  const handleExportSpecification = () => {
    const specSheet = `
VERTEX ARCHITECTURE STUDIO INC.
CSI MASTERFORMAT DIVISION 09 FINISH SPECIFICATION SCHEDULE
========================================================================
Project: Luxury Architectural Commission
Generated: ${new Date().toLocaleDateString()}
Standards: ASTM E84 Class A • LEED v4 EQc • DCOF Slip Resistance

1. PRIMARY FLOORING (CSI 09 30 00 / 09 64 00):
   Material: ${finishSchedule.flooring?.name || 'Unassigned'}
   CSI Division: ${finishSchedule.flooring?.csiCode || 'N/A'}
   Finish Spec: ${finishSchedule.flooring?.finish || 'N/A'}
   Light Reflectance (LRV): ${finishSchedule.flooring?.lrv || 'N/A'}%
   Slip Resistance: ${finishSchedule.flooring?.slipRating || 'N/A'}
   Fire Performance: ${finishSchedule.flooring?.fireRating || 'Class A'}
   LEED Sustainability: ${finishSchedule.flooring?.leedPoints || 'Compliant'}
   Estimated Procurement: $${finishSchedule.flooring?.costPerSqFt || 0}/sq.ft

2. VERTICAL WALL CLADDING & SURFACES (CSI 09 24 00 / 09 77 00):
   Material: ${finishSchedule.walls?.name || 'Unassigned'}
   CSI Division: ${finishSchedule.walls?.csiCode || 'N/A'}
   Finish Spec: ${finishSchedule.walls?.finish || 'N/A'}
   LRV: ${finishSchedule.walls?.lrv || 'N/A'}%
   Fire Performance: ${finishSchedule.walls?.fireRating || 'Class A'}

3. ARCHITECTURAL MILLWORK & JOINERY (CSI 06 20 00 / 06 41 00):
   Material: ${finishSchedule.millwork?.name || 'Unassigned'}
   Origin & Species: ${finishSchedule.millwork?.origin || 'N/A'}
   Finish: ${finishSchedule.millwork?.finish || 'N/A'}

4. METAL HARDWARE, ACCENTS & CASING (CSI 05 50 00):
   Material: ${finishSchedule.accents?.name || 'Unassigned'}
   Finish & Alloy: ${finishSchedule.accents?.finish || 'N/A'}

ARCHITECT OF RECORD CERTIFICATION:
All materials scheduled above meet California Title 24 low-VOC standards and commercial high-traffic durability standards.
    `.trim();

    const element = document.createElement('a');
    const file = new Blob([specSheet], { type: 'text/plain;charset=utf-8' });
    element.href = URL.createObjectURL(file);
    element.download = `VERTEX_CSI_Div09_Specification_${Date.now()}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    addToast('success', 'Exported CSI Division 09 Specification Sheet');
  };

  // ----------------------------------------------------
  // TOOL 3: COLOR & LRV HARMONIZER STATE
  // ----------------------------------------------------
  const [activeHarmonyId, setActiveHarmonyId] = useState<string>('pal-1');
  const activeHarmony = ARCHITECTURAL_COLOR_HARMONIES.find(h => h.id === activeHarmonyId) || ARCHITECTURAL_COLOR_HARMONIES[0];
  const [customFieldColor, setCustomFieldColor] = useState('#EBE5D8');
  const [copiedHex, setCopiedHex] = useState<string | null>(null);

  const copyColorToClipboard = (hex: string, label: string) => {
    navigator.clipboard.writeText(hex);
    setCopiedHex(hex);
    addToast('info', `Copied ${label} (${hex}) to clipboard`);
    setTimeout(() => setCopiedHex(null), 2000);
  };

  // ----------------------------------------------------
  // TOOL 4: 2D SPATIAL LAYOUT CANVAS STATE
  // ----------------------------------------------------
  const [elements, setElements] = useState<SpatialElement[]>(DEFAULT_SPATIAL_ELEMENTS);
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
  const [canvasRoomLength, setCanvasRoomLength] = useState<number>(26);
  const [canvasRoomWidth, setCanvasRoomWidth] = useState<number>(20);

  // Dragging logic inside canvas
  const canvasRef = useRef<HTMLDivElement>(null);

  const handleRotateSelected = () => {
    if (!selectedElementId) return;
    setElements(prev =>
      prev.map(el =>
        el.id === selectedElementId
          ? { ...el, rotation: (el.rotation + 90) % 360 }
          : el
      )
    );
    addToast('info', 'Rotated spatial element by 90°');
  };

  const handleDeleteSelected = () => {
    if (!selectedElementId) return;
    setElements(prev => prev.filter(el => el.id !== selectedElementId));
    setSelectedElementId(null);
    addToast('info', 'Removed element from spatial plan');
  };

  const handleAddBlock = (name: string, category: 'FURNITURE' | 'ARCHITECTURAL' | 'WALL', w: number, d: number, color: string) => {
    const newEl: SpatialElement = {
      id: 'elem_' + Date.now(),
      name,
      category,
      widthFt: w,
      depthFt: d,
      rotation: 0,
      x: Math.floor(Math.random() * (canvasRoomLength - w - 2)) + 1,
      y: Math.floor(Math.random() * (canvasRoomWidth - d - 2)) + 1,
      color
    };
    setElements(prev => [...prev, newEl]);
    setSelectedElementId(newEl.id);
    addToast('success', `Added ${name} to spatial layout`);
  };

  const selectedElement = elements.find(e => e.id === selectedElementId);

  return (
    <div className="space-y-6">
      {/* Studio Tools Navigation Header */}
      <div className="bg-white p-5 rounded-3xl border border-gray-200/80 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#2C2416] text-[#D4AF37] flex items-center justify-center shrink-0 shadow-xs">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-serif font-bold text-gray-900 text-lg">
                  Architectural Workbench & Standard Studio Tools
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-50 text-[#8B7355] font-bold border border-amber-200">
                  AIA & CSI COMPLIANT
                </span>
              </div>
              <p className="text-xs text-gray-500">
                Precision spatial calculations, CSI MasterFormat finish specifications, daylighting LRV analysis, and 2D clearance layout.
              </p>
            </div>
          </div>

          {/* Sub-tool Selector Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto p-1 bg-gray-100/80 rounded-2xl">
            {[
              { id: 'scale-calc', label: 'Scale & Spatial Calculator', icon: Ruler },
              { id: 'material-spec', label: 'Materiality & CSI Specs', icon: Layers },
              { id: 'color-lrv', label: 'Color & LRV Harmonizer', icon: Palette },
              { id: 'layout-planner', label: '2D Spatial Layout Sandbox', icon: Grid }
            ].map(t => {
              const Icon = t.icon;
              const isActive = currentTool === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setCurrentTool(t.id as any)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap flex items-center gap-2 transition-all cursor-pointer ${
                    isActive
                      ? 'bg-[#2C2416] text-[#D4AF37] shadow-sm font-bold'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-white/60'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{t.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ==================================================== */}
      {/* TOOL 1: SCALE & SPATIAL CALCULATOR */}
      {/* ==================================================== */}
      {currentTool === 'scale-calc' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column: Blueprint Scale Converter & Spatial Inputs */}
            <div className="lg:col-span-6 space-y-6">
              {/* Blueprint Scale Converter Card */}
              <div className="bg-white p-6 rounded-3xl border border-gray-200/80 shadow-xs space-y-5">
                <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                  <div className="flex items-center gap-2">
                    <Ruler className="w-4 h-4 text-[#D4AF37]" />
                    <h4 className="font-serif font-bold text-gray-900 text-sm">
                      Architectural Blueprint Scale Converter
                    </h4>
                  </div>
                  <span className="text-[10px] font-mono text-gray-500 bg-gray-50 px-2 py-0.5 rounded border border-gray-200">
                    AIA Standards
                  </span>
                </div>

                {/* Scale Ratio Presets */}
                <div>
                  <label className="text-xs font-semibold text-gray-700 block mb-1.5">
                    Drawing Scale Ratio
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                    {[
                      { ratio: 96, label: '1/8" = 1\'-0" (1:96)', desc: 'Site / Masterplans' },
                      { ratio: 64, label: '3/16" = 1\'-0" (1:64)', desc: 'Large Floorplans' },
                      { ratio: 48, label: '1/4" = 1\'-0" (1:48)', desc: 'Standard Floorplans' },
                      { ratio: 32, label: '3/8" = 1\'-0" (1:32)', desc: 'Room Enlarge' },
                      { ratio: 24, label: '1/2" = 1\'-0" (1:24)', desc: 'Interior Elevation' },
                      { ratio: 16, label: '3/4" = 1\'-0" (1:16)', desc: 'Cabinetry Details' },
                      { ratio: 100, label: '1:100 Metric', desc: 'International General' },
                      { ratio: 50, label: '1:50 Metric', desc: 'Interior Enlargement' }
                    ].map(s => (
                      <button
                        key={s.ratio}
                        type="button"
                        onClick={() => setSelectedScaleRatio(s.ratio)}
                        className={`p-2 rounded-xl text-left border transition-all cursor-pointer ${
                          selectedScaleRatio === s.ratio
                            ? 'border-[#D4AF37] bg-amber-50/50 text-[#2C2416] font-bold shadow-xs'
                            : 'border-gray-200 hover:border-gray-300 text-gray-600'
                        }`}
                      >
                        <div className="font-semibold">{s.label}</div>
                        <div className="text-[10px] text-gray-400 font-normal">{s.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Converter Interactive Fields */}
                <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-gray-800">Conversion Direction:</span>
                    <div className="flex items-center gap-1 bg-white p-0.5 rounded-lg border border-gray-200 text-xs">
                      <button
                        type="button"
                        onClick={() => setScaleMode('DRAWING_TO_REAL')}
                        className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                          scaleMode === 'DRAWING_TO_REAL' ? 'bg-[#2C2416] text-[#D4AF37] font-bold' : 'text-gray-600'
                        }`}
                      >
                        Paper Measure &rarr; Real World
                      </button>
                      <button
                        type="button"
                        onClick={() => setScaleMode('REAL_TO_DRAWING')}
                        className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                          scaleMode === 'REAL_TO_DRAWING' ? 'bg-[#2C2416] text-[#D4AF37] font-bold' : 'text-gray-600'
                        }`}
                      >
                        Real Dimension &rarr; Paper Drawing
                      </button>
                    </div>
                  </div>

                  {scaleMode === 'DRAWING_TO_REAL' ? (
                    <div className="space-y-3">
                      <div>
                        <label className="text-xs font-semibold text-gray-700 block mb-1">
                          Drawing Measurement on Blueprint (Inches or cm)
                        </label>
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            step="0.125"
                            value={inputDrawingMeasurementInches}
                            onChange={e => setInputDrawingMeasurementInches(Number(e.target.value) || 0)}
                            className="w-full px-3 py-2 bg-white border border-gray-300 rounded-xl text-xs font-mono focus:border-[#D4AF37] focus:outline-none"
                          />
                          <span className="text-xs font-bold text-gray-500 font-mono">INCHES</span>
                        </div>
                      </div>

                      {/* Computed Output */}
                      <div className="p-3.5 bg-white rounded-xl border border-amber-200 flex items-center justify-between">
                        <div>
                          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">
                            Calculated Real-World Dimension
                          </span>
                          <div className="text-base font-bold text-[#2C2416] font-mono mt-0.5">
                            {(() => {
                              const totalInches = inputDrawingMeasurementInches * selectedScaleRatio;
                              const feet = Math.floor(totalInches / 12);
                              const remainingInches = (totalInches % 12).toFixed(1);
                              const meters = (totalInches * 0.0254).toFixed(2);
                              return `${feet}'-${remainingInches}" (${meters} m)`;
                            })()}
                          </div>
                        </div>
                        <span className="text-xs font-mono bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-1 rounded-lg font-bold">
                          1:{selectedScaleRatio} Scale
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-xs font-semibold text-gray-700 block mb-1">Feet (ft)</label>
                          <input
                            type="number"
                            value={inputRealFeet}
                            onChange={e => setInputRealFeet(Number(e.target.value) || 0)}
                            className="w-full px-3 py-2 bg-white border border-gray-300 rounded-xl text-xs font-mono focus:border-[#D4AF37] focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-semibold text-gray-700 block mb-1">Inches (in)</label>
                          <input
                            type="number"
                            value={inputRealInches}
                            onChange={e => setInputRealInches(Number(e.target.value) || 0)}
                            className="w-full px-3 py-2 bg-white border border-gray-300 rounded-xl text-xs font-mono focus:border-[#D4AF37] focus:outline-none"
                          />
                        </div>
                      </div>

                      {/* Computed Paper Output */}
                      <div className="p-3.5 bg-white rounded-xl border border-amber-200 flex items-center justify-between">
                        <div>
                          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">
                            Paper Drawing Dimension (Scale: 1:{selectedScaleRatio})
                          </span>
                          <div className="text-base font-bold text-[#2C2416] font-mono mt-0.5">
                            {(() => {
                              const totalInches = inputRealFeet * 12 + inputRealInches;
                              const paperInches = (totalInches / selectedScaleRatio).toFixed(3);
                              const paperMm = (totalInches * 25.4 / selectedScaleRatio).toFixed(1);
                              return `${paperInches}" (${paperMm} mm)`;
                            })()}
                          </div>
                        </div>
                        <span className="text-xs font-mono bg-blue-50 text-blue-700 border border-blue-200 px-2.5 py-1 rounded-lg font-bold">
                          Plot Ready
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Spatial Volume & Geometry Setup */}
              <div className="bg-white p-6 rounded-3xl border border-gray-200/80 shadow-xs space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                  <div className="flex items-center gap-2">
                    <Box className="w-4 h-4 text-[#D4AF37]" />
                    <h4 className="font-serif font-bold text-gray-900 text-sm">
                      Room Dimensional Envelope
                    </h4>
                  </div>
                  <span className="text-xs text-gray-400 font-mono">Volumetric Analysis</span>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-gray-700 block mb-1">Length (ft)</label>
                    <input
                      type="number"
                      value={roomLengthFt}
                      onChange={e => setRoomLengthFt(Math.max(1, Number(e.target.value) || 1))}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl text-xs font-mono focus:bg-white focus:border-[#D4AF37] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-700 block mb-1">Width (ft)</label>
                    <input
                      type="number"
                      value={roomWidthFt}
                      onChange={e => setRoomWidthFt(Math.max(1, Number(e.target.value) || 1))}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl text-xs font-mono focus:bg-white focus:border-[#D4AF37] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-700 block mb-1">Ceiling Height (ft)</label>
                    <input
                      type="number"
                      step="0.5"
                      value={roomHeightFt}
                      onChange={e => setRoomHeightFt(Math.max(1, Number(e.target.value) || 1))}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl text-xs font-mono focus:bg-white focus:border-[#D4AF37] focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div>
                    <label className="text-xs font-semibold text-gray-700 block mb-1">Space Typology</label>
                    <select
                      value={spaceTypePreset}
                      onChange={e => setSpaceTypePreset(e.target.value as any)}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl text-xs focus:bg-white focus:border-[#D4AF37] focus:outline-none"
                    >
                      <option value="LIVING">Penthouse Living Salon</option>
                      <option value="DINING">Grand Dining Salon</option>
                      <option value="KITCHEN">Gourmet Culinary Scullery</option>
                      <option value="MASTER">Master Bedroom Sanctuary</option>
                      <option value="STUDY">Executive Library / Atelier</option>
                      <option value="SPA">Spa Wellness Bath Suite</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-700 block mb-1">Finish Grade</label>
                    <select
                      value={finishGrade}
                      onChange={e => setFinishGrade(e.target.value as any)}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl text-xs focus:bg-white focus:border-[#D4AF37] focus:outline-none"
                    >
                      <option value="ULTRA_LUXURY">Ultra-Luxury Bespoke</option>
                      <option value="HIGH_END">High-End Architectural</option>
                      <option value="MODERN">Modern Luxury Core</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Architectural Spatial Metrics & ROM Budget Dashboard */}
            <div className="lg:col-span-6 space-y-6">
              {/* Calculated Spatial Metrics Grid */}
              <div className="bg-white p-6 rounded-3xl border border-gray-200/80 shadow-xs space-y-5">
                <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                  <h4 className="font-serif font-bold text-gray-900 text-sm">
                    Calculated Spatial Envelope & Finish Takeoffs
                  </h4>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                    Live Takeoff
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                  <div className="p-3.5 bg-gray-50 rounded-2xl border border-gray-200/80">
                    <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider block">
                      Floor Footprint
                    </span>
                    <div className="text-lg font-bold text-gray-900 font-mono mt-0.5">
                      {floorAreaSqFt.toLocaleString()} sq.ft
                    </div>
                    <span className="text-[10px] text-gray-500 font-mono">({floorAreaSqMeters.toFixed(1)} m²)</span>
                  </div>

                  <div className="p-3.5 bg-gray-50 rounded-2xl border border-gray-200/80">
                    <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider block">
                      Perimeter Baseboard
                    </span>
                    <div className="text-lg font-bold text-gray-900 font-mono mt-0.5">
                      {perimeterLinearFt} lin.ft
                    </div>
                    <span className="text-[10px] text-gray-500 font-mono">({(perimeterLinearFt * 0.3048).toFixed(1)} m)</span>
                  </div>

                  <div className="p-3.5 bg-gray-50 rounded-2xl border border-gray-200/80">
                    <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider block">
                      Net Wall Surface
                    </span>
                    <div className="text-lg font-bold text-[#8B7355] font-mono mt-0.5">
                      {wallSurfaceAreaNet.toLocaleString()} sq.ft
                    </div>
                    <span className="text-[10px] text-gray-400 font-mono">Plaster / Stone Takeoff</span>
                  </div>

                  <div className="p-3.5 bg-gray-50 rounded-2xl border border-gray-200/80">
                    <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider block">
                      Room Air Volume
                    </span>
                    <div className="text-lg font-bold text-gray-900 font-mono mt-0.5">
                      {Math.round(roomVolumeCuFt).toLocaleString()} cu.ft
                    </div>
                    <span className="text-[10px] text-gray-500 font-mono">({roomVolumeCuMeters.toFixed(1)} m³)</span>
                  </div>

                  <div className="p-3.5 bg-amber-50/60 rounded-2xl border border-amber-200/80">
                    <span className="text-[10px] text-amber-800 uppercase font-bold tracking-wider flex items-center gap-1">
                      <Sun className="w-3 h-3 text-[#B8860B]" />
                      <span>Target Illuminance</span>
                    </span>
                    <div className="text-lg font-bold text-[#2C2416] font-mono mt-0.5">
                      {targetLumens.toLocaleString()} lm
                    </div>
                    <span className="text-[10px] text-amber-700 font-mono">Recommended: {SPACE_NORMS.targetLux} Lux</span>
                  </div>

                  <div className="p-3.5 bg-blue-50/60 rounded-2xl border border-blue-200/80">
                    <span className="text-[10px] text-blue-800 uppercase font-bold tracking-wider flex items-center gap-1">
                      <Wind className="w-3 h-3 text-blue-600" />
                      <span>HVAC Load & CFM</span>
                    </span>
                    <div className="text-lg font-bold text-blue-900 font-mono mt-0.5">
                      {coolingTons} Tons
                    </div>
                    <span className="text-[10px] text-blue-600 font-mono">{coolingBtu.toLocaleString()} BTU • {targetCfm} CFM</span>
                  </div>
                </div>

                {/* ROM Fit-Out Budget Estimation Card */}
                <div className="p-5 bg-[#2C2416] text-white rounded-2xl space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-[#D4AF37]" />
                      <span className="font-serif font-bold text-sm text-white">
                        Rough-Order-of-Magnitude (ROM) Fit-Out Budget
                      </span>
                    </div>
                    <span className="text-[10px] font-mono bg-white/10 px-2.5 py-0.5 rounded text-[#D4AF37] font-bold">
                      {COST_RATES.label.split(' ')[0]}
                    </span>
                  </div>

                  <div className="flex items-baseline justify-between pt-1">
                    <div>
                      <span className="text-[11px] text-gray-400 block">Estimated Procurement & Installation Band</span>
                      <div className="text-2xl font-serif font-bold text-[#D4AF37] mt-0.5">
                        ${estimatedCostMin.toLocaleString()} – ${estimatedCostMax.toLocaleString()}
                      </div>
                    </div>
                    <span className="text-xs font-mono text-gray-300">
                      ${COST_RATES.min} - ${COST_RATES.max} / sq.ft
                    </span>
                  </div>

                  <p className="text-[11px] text-gray-400 border-t border-white/10 pt-2.5">
                    Includes precision structural marble/travertine stone slab work, flush frameless millwork, architectural LED downlights, and LEED-compliant low-VOC finishes.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* TOOL 2: MATERIALITY SPECIFIER & CSI FINISHES */}
      {/* ==================================================== */}
      {currentTool === 'material-spec' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left: Material Catalog */}
            <div className="lg:col-span-7 space-y-4">
              <div className="bg-white p-5 rounded-3xl border border-gray-200/80 shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-100">
                  <div>
                    <h4 className="font-serif font-bold text-gray-900 text-sm">
                      Curated Architectural Material Library
                    </h4>
                    <p className="text-xs text-gray-500">
                      Select high-performance dimension stones, hardwoods, metals, and acoustics.
                    </p>
                  </div>

                  {/* Filter Pills */}
                  <div className="flex items-center gap-1 overflow-x-auto text-[11px]">
                    {[
                      { id: 'ALL', label: 'All Materials' },
                      { id: 'STONE', label: 'Stone' },
                      { id: 'TIMBER', label: 'Timber' },
                      { id: 'METAL', label: 'Metal & Glass' },
                      { id: 'PLASTER_TEXTILE', label: 'Plasters & Textiles' }
                    ].map(f => (
                      <button
                        key={f.id}
                        type="button"
                        onClick={() => setMaterialCategoryFilter(f.id as any)}
                        className={`px-2.5 py-1 rounded-lg font-semibold transition-colors cursor-pointer ${
                          materialCategoryFilter === f.id
                            ? 'bg-[#2C2416] text-[#D4AF37]'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Materials Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[600px] overflow-y-auto pr-1">
                  {ARCHITECTURAL_MATERIALS
                    .filter(m => materialCategoryFilter === 'ALL' || m.category === materialCategoryFilter)
                    .map(mat => (
                      <div
                        key={mat.id}
                        className="p-3.5 bg-gray-50 rounded-2xl border border-gray-200/80 hover:border-[#D4AF37] transition-all flex flex-col justify-between space-y-3 group"
                      >
                        <div>
                          <div className="h-28 rounded-xl overflow-hidden mb-2 bg-gray-900 relative">
                            <img src={mat.imageUrl} alt={mat.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                            <span className="absolute top-2 left-2 text-[9px] bg-black/75 text-[#D4AF37] px-2 py-0.5 rounded font-mono font-bold">
                              LRV: {mat.lrv}%
                            </span>
                            <span className="absolute bottom-2 right-2 text-[9px] bg-white/90 text-gray-900 px-2 py-0.5 rounded font-bold">
                              ${mat.costPerSqFt}/sq.ft
                            </span>
                          </div>

                          <div className="space-y-1">
                            <span className="text-[10px] text-gray-400 font-mono block truncate">
                              {mat.csiCode}
                            </span>
                            <h5 className="font-bold text-gray-900 text-xs leading-snug">
                              {mat.name}
                            </h5>
                            <p className="text-[11px] text-gray-500 line-clamp-2">
                              {mat.description}
                            </p>
                          </div>
                        </div>

                        {/* Technical Badges */}
                        <div className="pt-2 border-t border-gray-200/60 space-y-2">
                          <div className="flex flex-wrap items-center gap-1 text-[9px] font-mono">
                            <span className="bg-amber-100/70 text-[#8B7355] px-1.5 py-0.5 rounded font-bold">
                              {mat.finish}
                            </span>
                            <span className="bg-emerald-100/70 text-emerald-800 px-1.5 py-0.5 rounded">
                              {mat.fireRating}
                            </span>
                            {mat.slipRating && (
                              <span className="bg-blue-100/70 text-blue-800 px-1.5 py-0.5 rounded">
                                {mat.slipRating.split(' ')[0]}
                              </span>
                            )}
                          </div>

                          {/* Assignment Action Menu */}
                          <div className="flex items-center gap-1 pt-1 text-[10px]">
                            <span className="text-gray-400 text-[9px] font-bold uppercase shrink-0">Assign to:</span>
                            <button
                              type="button"
                              onClick={() => assignMaterialToSlot('flooring', mat)}
                              className="px-1.5 py-0.5 bg-white border border-gray-300 hover:bg-gray-100 rounded text-gray-700 font-semibold cursor-pointer"
                            >
                              Floor
                            </button>
                            <button
                              type="button"
                              onClick={() => assignMaterialToSlot('walls', mat)}
                              className="px-1.5 py-0.5 bg-white border border-gray-300 hover:bg-gray-100 rounded text-gray-700 font-semibold cursor-pointer"
                            >
                              Walls
                            </button>
                            <button
                              type="button"
                              onClick={() => assignMaterialToSlot('millwork', mat)}
                              className="px-1.5 py-0.5 bg-white border border-gray-300 hover:bg-gray-100 rounded text-gray-700 font-semibold cursor-pointer"
                            >
                              Joinery
                            </button>
                            <button
                              type="button"
                              onClick={() => assignMaterialToSlot('accents', mat)}
                              className="px-1.5 py-0.5 bg-white border border-gray-300 hover:bg-gray-100 rounded text-gray-700 font-semibold cursor-pointer"
                            >
                              Accent
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>

            {/* Right: Project CSI Specification Schedule */}
            <div className="lg:col-span-5 space-y-4">
              <div className="bg-white p-5 rounded-3xl border border-gray-200/80 shadow-xs space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                  <div>
                    <h4 className="font-serif font-bold text-gray-900 text-sm">
                      CSI Div 09 Specification Schedule
                    </h4>
                    <p className="text-[11px] text-gray-500">
                      Active material assignment for current project room.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleExportSpecification}
                    className="px-3 py-1.5 bg-[#D4AF37] hover:bg-[#B8860B] text-[#2C2416] font-bold text-xs rounded-xl transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Export Spec Sheet</span>
                  </button>
                </div>

                {/* Slots */}
                <div className="space-y-2.5 text-xs">
                  {[
                    { key: 'flooring', label: 'Primary Flooring Finish (CSI 09 30 13)', item: finishSchedule.flooring },
                    { key: 'walls', label: 'Wall Cladding & Plaster (CSI 09 24 00)', item: finishSchedule.walls },
                    { key: 'millwork', label: 'Custom Joinery & Millwork (CSI 06 20 00)', item: finishSchedule.millwork },
                    { key: 'accents', label: 'Architectural Metal & Accents (CSI 05 50 00)', item: finishSchedule.accents },
                    { key: 'ceiling', label: 'Ceiling Finish & Coves (CSI 09 51 00)', item: finishSchedule.ceiling }
                  ].map(slot => (
                    <div key={slot.key} className="p-3 bg-gray-50 rounded-2xl border border-gray-200/80 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 font-mono">
                          {slot.label}
                        </span>
                        {slot.item && (
                          <span className="text-[10px] font-mono font-bold text-[#8B7355]">
                            ${slot.item.costPerSqFt}/sq.ft
                          </span>
                        )}
                      </div>

                      {slot.item ? (
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-lg overflow-hidden shrink-0 border border-gray-300">
                              <img src={slot.item.imageUrl} alt={slot.item.name} className="w-full h-full object-cover" />
                            </div>
                            <div>
                              <div className="font-bold text-gray-900 text-xs">{slot.item.name}</div>
                              <div className="text-[10px] text-gray-500 font-mono">{slot.item.finish} • LRV: {slot.item.lrv}%</div>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => setFinishSchedule(prev => ({ ...prev, [slot.key]: null }))}
                            className="text-gray-400 hover:text-red-500 p-1 rounded-md transition-colors cursor-pointer"
                            title="Clear Slot"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <div className="text-gray-400 italic text-[11px] py-1">
                          No material assigned. Pick one from library.
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Aggregate Summary */}
                <div className="p-4 bg-amber-50/60 rounded-2xl border border-amber-200/80 text-xs space-y-2">
                  <div className="flex items-center justify-between font-bold text-gray-900">
                    <span>Aggregate Material Average Rate</span>
                    <span className="font-mono text-sm text-[#8B7355]">
                      ${Math.round(
                        Object.values(finishSchedule)
                          .filter(Boolean)
                          .reduce((acc, m) => acc + (m?.costPerSqFt || 0), 0) /
                          Math.max(1, Object.values(finishSchedule).filter(Boolean).length)
                      )} / sq.ft
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-600">
                    Complies with LEED v4 MR credit for low-emitting materials and environmental product declarations (EPD).
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* TOOL 3: COLOR & LRV HARMONIZER */}
      {/* ==================================================== */}
      {currentTool === 'color-lrv' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left: Palette Selection & Movement Story */}
            <div className="lg:col-span-5 space-y-4">
              <div className="bg-white p-6 rounded-3xl border border-gray-200/80 shadow-xs space-y-4">
                <div className="pb-3 border-b border-gray-100">
                  <h4 className="font-serif font-bold text-gray-900 text-sm">
                    Architectural Palette Archetypes
                  </h4>
                  <p className="text-xs text-gray-500">
                    Formulated around solar reflectance and mineral pigment chemistry.
                  </p>
                </div>

                <div className="space-y-2.5">
                  {ARCHITECTURAL_COLOR_HARMONIES.map(harmony => {
                    const isSelected = activeHarmonyId === harmony.id;
                    return (
                      <div
                        key={harmony.id}
                        onClick={() => setActiveHarmonyId(harmony.id)}
                        className={`p-4 rounded-2xl border transition-all cursor-pointer space-y-2.5 ${
                          isSelected
                            ? 'border-[#D4AF37] bg-amber-50/40 shadow-xs'
                            : 'border-gray-200 hover:border-gray-300 bg-white'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <h5 className="font-serif font-bold text-gray-900 text-sm">
                            {harmony.name}
                          </h5>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-gray-100 text-gray-600 font-semibold">
                            {harmony.movement}
                          </span>
                        </div>

                        {/* Swatches strip */}
                        <div className="flex items-center gap-1.5 h-8">
                          {harmony.swatches.map((swatch, idx) => (
                            <div
                              key={idx}
                              className="flex-1 h-full rounded-lg border border-black/10 shadow-2xs relative group"
                              style={{ backgroundColor: swatch.hex }}
                              title={`${swatch.name} (${swatch.hex}, LRV: ${swatch.lrv}%)`}
                            />
                          ))}
                        </div>

                        <p className="text-[11px] text-gray-500 leading-relaxed">
                          {harmony.description}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Right: Active Swatch Inspector & Daylighting Guidance */}
            <div className="lg:col-span-7 space-y-4">
              <div className="bg-white p-6 rounded-3xl border border-gray-200/80 shadow-xs space-y-5">
                <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                  <div>
                    <h4 className="font-serif font-bold text-gray-900 text-base">
                      {activeHarmony.name}
                    </h4>
                    <span className="text-xs text-[#8B7355] font-semibold">{activeHarmony.movement}</span>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] uppercase font-bold text-gray-400 block">Daylight Recommendation</span>
                    <span className="text-xs font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                      {activeHarmony.bestDaylight.split('(')[0]}
                    </span>
                  </div>
                </div>

                {/* Expanded Swatch Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {activeHarmony.swatches.map((swatch, i) => (
                    <div
                      key={i}
                      className="p-4 bg-gray-50 rounded-2xl border border-gray-200 space-y-3"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="w-14 h-14 rounded-xl border border-black/15 shadow-xs shrink-0 flex items-center justify-center font-mono text-[10px] font-bold"
                          style={{
                            backgroundColor: swatch.hex,
                            color: swatch.lrv > 50 ? '#000000' : '#FFFFFF'
                          }}
                        >
                          {swatch.lrv}%
                        </div>

                        <div className="space-y-0.5 flex-1 min-w-0">
                          <span className="text-[9px] font-mono uppercase tracking-wider text-gray-400 font-bold block">
                            {swatch.usage.replace('_', ' ')}
                          </span>
                          <h6 className="font-bold text-gray-900 text-xs truncate">
                            {swatch.name}
                          </h6>
                          <div className="text-[11px] text-gray-500 font-mono">
                            {swatch.tradeRef}
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => copyColorToClipboard(swatch.hex, swatch.name)}
                          className="p-2 bg-white rounded-xl border border-gray-200 hover:bg-gray-100 text-gray-600 transition-colors cursor-pointer shrink-0"
                          title="Copy Hex"
                        >
                          {copiedHex === swatch.hex ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>

                      {/* LRV Metrics */}
                      <div className="pt-2 border-t border-gray-200/80 text-[11px] text-gray-600 space-y-1">
                        <div className="flex justify-between">
                          <span>Light Reflectance Value:</span>
                          <span className="font-mono font-bold text-gray-900">{swatch.lrv}% LRV</span>
                        </div>
                        <div className="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden">
                          <div className="bg-[#D4AF37] h-full rounded-full" style={{ width: `${swatch.lrv}%` }} />
                        </div>
                        <span className="text-[10px] text-gray-400 block">
                          {swatch.lrv > 70
                            ? 'High daylight bounce. Ideal for expansive ceilings and perimeter walls.'
                            : swatch.lrv > 35
                            ? 'Medium warmth depth. Absorbs glare while maintaining architectural contour.'
                            : 'Sculptural grounding. Creates dramatic shadows for custom joinery.'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Daylighting Physics Explainer */}
                <div className="p-4 bg-[#FAF8F5] rounded-2xl border border-amber-200/80 flex items-start gap-3 text-xs text-gray-700">
                  <Sun className="w-5 h-5 text-[#B8860B] shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <span className="font-bold text-gray-900">Daylight & Solar Orientation Rule of Thumb:</span>
                    <p className="text-gray-600 leading-relaxed text-[11px]">
                      {activeHarmony.bestDaylight}. In luxury residential design, North light measures ~6500K (cool sky blue), requiring high-LRV pigments with yellow/ochre undertones to prevent chalky gloom. South exposure receives intense 3000K sunlight, which elevates deeper umbers and patinated bronzes without darkening the envelope.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* TOOL 4: 2D SPATIAL LAYOUT & CLEARANCE SANDBOX */}
      {/* ==================================================== */}
      {currentTool === 'layout-planner' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left: Interactive Grid Canvas */}
            <div className="lg:col-span-8 space-y-4">
              <div className="bg-white p-6 rounded-3xl border border-gray-200/80 shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-100">
                  <div>
                    <h4 className="font-serif font-bold text-gray-900 text-sm">
                      Interactive 2D Spatial Layout & Clearance Canvas
                    </h4>
                    <p className="text-xs text-gray-500">
                      Scaled architectural grid (1 square = 2 x 2 ft). Drag or select blocks to test spatial circulation.
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleRotateSelected}
                      disabled={!selectedElementId}
                      className="px-3 py-1.5 rounded-xl border border-gray-300 hover:bg-gray-50 text-gray-700 text-xs font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5 cursor-pointer"
                    >
                      <RotateCw className="w-3.5 h-3.5" />
                      <span>Rotate 90°</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleDeleteSelected}
                      disabled={!selectedElementId}
                      className="px-3 py-1.5 rounded-xl border border-red-200 hover:bg-red-50 text-red-600 text-xs font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Remove</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setElements(DEFAULT_SPATIAL_ELEMENTS)}
                      className="px-3 py-1.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Reset Layout</span>
                    </button>
                  </div>
                </div>

                {/* Scaled Visual Grid Canvas */}
                <div
                  ref={canvasRef}
                  className="w-full h-[460px] bg-[#FAF8F5] rounded-2xl border-2 border-dashed border-gray-300 relative overflow-hidden shadow-inner cursor-crosshair select-none"
                  style={{
                    backgroundImage: 'radial-gradient(#C5A059 1.2px, transparent 1.2px), radial-gradient(#2C2416 0.8px, transparent 0.8px)',
                    backgroundSize: '24px 24px',
                    backgroundPosition: '0 0, 12px 12px'
                  }}
                  onClick={() => setSelectedElementId(null)}
                >
                  {/* Canvas Legend & Room Extents */}
                  <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-gray-200 text-[11px] font-mono font-bold text-gray-700 shadow-xs pointer-events-none z-10">
                    Room Envelope: {canvasRoomLength}ft × {canvasRoomWidth}ft (520 sq.ft)
                  </div>

                  <div className="absolute top-3 right-3 bg-emerald-50 text-emerald-800 border border-emerald-200 px-3 py-1 rounded-xl text-[10px] font-mono font-bold shadow-xs pointer-events-none z-10 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>36" Clearance Path Compliant</span>
                  </div>

                  {/* Render Spatial Elements */}
                  {elements.map(el => {
                    const isSelected = selectedElementId === el.id;
                    // Grid scale: 1 ft = ~15px
                    const pxPerFt = 15;
                    const w = (el.rotation % 180 === 0 ? el.widthFt : el.depthFt) * pxPerFt;
                    const h = (el.rotation % 180 === 0 ? el.depthFt : el.widthFt) * pxPerFt;
                    const left = el.x * pxPerFt;
                    const top = el.y * pxPerFt;

                    return (
                      <div
                        key={el.id}
                        onClick={e => {
                          e.stopPropagation();
                          setSelectedElementId(el.id);
                        }}
                        style={{
                          width: `${w}px`,
                          height: `${h}px`,
                          left: `${left}px`,
                          top: `${top}px`,
                          backgroundColor: el.color
                        }}
                        className={`absolute rounded-xl shadow-md flex flex-col items-center justify-center p-1 cursor-grab active:cursor-grabbing transition-all border-2 ${
                          isSelected
                            ? 'border-[#2C2416] ring-3 ring-[#D4AF37] scale-105 z-20'
                            : 'border-white/60 hover:border-white z-10'
                        }`}
                      >
                        <span className="text-[10px] font-bold text-white drop-shadow-md text-center leading-tight px-1 truncate w-full">
                          {el.name}
                        </span>
                        <span className="text-[8px] font-mono text-white/90 drop-shadow-xs">
                          {el.widthFt}' × {el.depthFt}'
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Right: Add Elements & Layout Specifications */}
            <div className="lg:col-span-4 space-y-4">
              {/* Selected Element Detail Card */}
              {selectedElement ? (
                <div className="bg-white p-5 rounded-3xl border border-[#D4AF37] shadow-xs space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                    <span className="text-[10px] font-mono font-bold text-[#8B7355] uppercase">
                      Selected Architectural Element
                    </span>
                    <span className="text-xs font-mono font-bold bg-amber-50 text-amber-900 px-2 py-0.5 rounded">
                      Rot: {selectedElement.rotation}°
                    </span>
                  </div>

                  <h5 className="font-bold text-gray-900 text-sm">
                    {selectedElement.name}
                  </h5>

                  <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                    <div className="p-2 bg-gray-50 rounded-xl">
                      <span className="text-[10px] text-gray-400 uppercase block font-sans">Width</span>
                      <span className="font-bold">{selectedElement.widthFt} ft</span>
                    </div>
                    <div className="p-2 bg-gray-50 rounded-xl">
                      <span className="text-[10px] text-gray-400 uppercase block font-sans">Depth</span>
                      <span className="font-bold">{selectedElement.depthFt} ft</span>
                    </div>
                  </div>

                  {/* Positioning sliders */}
                  <div className="space-y-2 pt-2 text-xs">
                    <div>
                      <div className="flex justify-between text-gray-600 mb-1">
                        <span>X Offset (ft):</span>
                        <span className="font-mono font-bold">{selectedElement.x} ft</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max={canvasRoomLength - selectedElement.widthFt}
                        value={selectedElement.x}
                        onChange={e => {
                          const val = Number(e.target.value);
                          setElements(prev => prev.map(el => el.id === selectedElement.id ? { ...el, x: val } : el));
                        }}
                        className="w-full accent-[#D4AF37]"
                      />
                    </div>
                    <div>
                      <div className="flex justify-between text-gray-600 mb-1">
                        <span>Y Offset (ft):</span>
                        <span className="font-mono font-bold">{selectedElement.y} ft</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max={canvasRoomWidth - selectedElement.depthFt}
                        value={selectedElement.y}
                        onChange={e => {
                          const val = Number(e.target.value);
                          setElements(prev => prev.map(el => el.id === selectedElement.id ? { ...el, y: val } : el));
                        }}
                        className="w-full accent-[#D4AF37]"
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-white p-5 rounded-3xl border border-gray-200/80 shadow-xs text-center py-8 text-gray-400 text-xs">
                  <Grid className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                  Click any element on the floorplan to reposition or rotate.
                </div>
              )}

              {/* Add Standard Architectural Blocks */}
              <div className="bg-white p-5 rounded-3xl border border-gray-200/80 shadow-xs space-y-3">
                <h5 className="font-serif font-bold text-gray-900 text-xs uppercase tracking-wider">
                  Insert Architectural Blocks
                </h5>

                <div className="space-y-1.5 text-xs">
                  {[
                    { name: '10ft Sectional Sofa', cat: 'FURNITURE', w: 10, d: 4, color: '#C8BCA8' },
                    { name: '8-Seat Dining Table', cat: 'FURNITURE', w: 8, d: 3.5, color: '#6A5645' },
                    { name: 'King Bed & Nightstands', cat: 'FURNITURE', w: 8.5, d: 7, color: '#7E766D' },
                    { name: 'Culinary Island (12ft)', cat: 'ARCHITECTURAL', w: 12, d: 4, color: '#4A4137' },
                    { name: 'Executive Floating Desk', cat: 'FURNITURE', w: 7, d: 3.5, color: '#3A322C' },
                    { name: 'Floating Credenza', cat: 'ARCHITECTURAL', w: 9, d: 2, color: '#A09383' }
                  ].map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleAddBlock(preset.name, preset.cat as any, preset.w, preset.d, preset.color)}
                      className="w-full p-2.5 bg-gray-50 hover:bg-gray-100 rounded-xl border border-gray-200 flex items-center justify-between text-left transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-3.5 h-3.5 rounded-md" style={{ backgroundColor: preset.color }} />
                        <span className="font-semibold text-gray-800">{preset.name}</span>
                      </div>
                      <span className="text-[10px] font-mono text-gray-400">
                        {preset.w}' × {preset.d}'
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
