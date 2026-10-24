import { EngineeringConfig, DEFAULT_ENGINEERING_CONFIG, FFEItem } from '../tools/types';

export type ElementType = 
  | 'WALL'
  | 'ROOM'
  | 'DOOR'
  | 'WINDOW'
  | 'COLUMN'
  | 'FURNITURE'
  | 'LIGHT'
  | 'PLUMBING'
  | 'ANNOTATION'
  | 'IMPORTED_OBJECT'
  | 'EXTERIOR_DECK'
  | 'EXTERIOR_POOL'
  | 'EXTERIOR_TREE'
  | 'EXTERIOR_PERGOLA'
  | 'FACADE_PANEL'
  | 'STAIRS'
  | 'PRIMITIVE_CUBE'
  | 'PRIMITIVE_CYLINDER';

export type FurnitureCategory =
  | 'SOFA'
  | 'ARMCHAIR'
  | 'DINING_TABLE'
  | 'COFFEE_TABLE'
  | 'BED'
  | 'DESK'
  | 'KITCHEN_ISLAND'
  | 'CREDENZA'
  | 'BATHTUB'
  | 'LAMP'
  | 'PLANT'
  | 'CHAIR'
  | 'BOOKSHELF'
  | 'MIRROR'
  | 'SANITARY'
  | 'CABINET'
  | 'EXTERIOR_LOUNGER'
  | 'PERGOLA'
  | 'POOL'
  | 'TREE'
  | 'DECKING'
  | 'STAIRCASE'
  | 'PRIMITIVE_CUBE'
  | 'PRIMITIVE_CYLINDER'
  | 'CUSTOM';

export type StudioMaterialType = 
  | 'plaster' 
  | 'oak' 
  | 'walnut' 
  | 'travertine' 
  | 'marble' 
  | 'boucle' 
  | 'bronze' 
  | 'glass' 
  | 'concrete'
  | 'leather'
  | 'steel'
  | 'terrazzo'
  | 'velvet'
  | 'ceramic'
  | 'matte_black'
  | 'water'
  | 'grass'
  | 'timber_deck'
  | 'slate'
  | 'weathered_steel';

export interface StudioElement {
  id: string;
  name: string;
  type: ElementType;
  furnitureCategory?: FurnitureCategory;
  layer: 'architecture' | 'structure' | 'furniture' | 'annotation';
  domain?: 'interior' | 'exterior';
  
  // Spatial coordinates (stored in feet for CAD consistency)
  x: number; // Center X or start X
  y: number; // Center Y or start Y
  z: number; // Elevation off floor (ft)
  width: number; // in feet
  length: number; // in feet
  height: number; // in feet
  rotation: number; // Degrees (0, 90, 180, 270 or arbitrary floating angle like 37.5°)
  rotationX?: number; // Pitch angle (degrees)
  rotationY?: number; // Roll angle (degrees)
  
  // For Wall specific lines
  isWallSegment?: boolean;
  startX?: number;
  startY?: number;
  endX?: number;
  endY?: number;
  thickness?: number; // in feet (e.g. 0.5ft = 6 inches)

  // Finishes & Materials (Blender PBR Shader Properties)
  color: string;
  materialName: string;
  materialType: StudioMaterialType;
  lrv: number; // Light reflectance value (0-100)
  roughness?: number; // 0.0 (high gloss) to 1.0 (rough matte)
  metalness?: number; // 0.0 (dielectric) to 1.0 (metal)
  opacity?: number; // 0.0 to 1.0
  
  // Gap, Margins & CAD Spacing
  gapOffsetFt?: number; // Offset distance from adjacent walls or elements (ft)
  revealGapInches?: number; // Architectural shadowline / reveal gap (inches)
  arrayCount?: number; // Multi-element repetition
  arraySpacingFt?: number; // Spacing between arrayed elements

  // Cost & Specification
  cost: number;
  csiCode?: string;
  vendor?: string;
  roomName?: string;
  isLocked?: boolean;
  clearanceRadiusFt?: number; // For IBC clearance check

  // Specific Subtype Configurations
  doorSwing?: 'LEFT' | 'RIGHT' | 'DOUBLE' | 'SLIDING' | 'PIVOT';
  windowType?: 'FIXED' | 'CASEMENT' | 'SLIDING' | 'RIBBON';
  columnType?: 'ROUND' | 'RECTANGULAR';
  annotationText?: string;

  // Open Market / Imported 3D Data
  isImported?: boolean;
  importedSource?: string;
  importedFormat?: 'OBJ' | 'JSON' | 'DXF';
  importedRawData?: string;
  importedObjMesh?: {
    vertices: number[];
    normals?: number[];
    indices?: number[];
  };
}

export type ViewportMode = '2D_CAD' | '3D_BIM' | 'SPLIT' | 'ENGINEERING' | 'PROCUREMENT';

export type ActiveTool = 
  | 'SELECT' 
  | 'DRAW_WALL' 
  | 'DRAW_GLASS_WALL'
  | 'DRAW_ROOM' 
  | 'ADD_DOOR' 
  | 'ADD_WINDOW' 
  | 'ADD_COLUMN'
  | 'ADD_FURNITURE' 
  | 'PAINT_MATERIAL'
  | 'ADD_ANNOTATION'
  | 'MEASURE'
  | 'GAP_TOOL'
  | 'ADD_EXTERIOR_POOL'
  | 'ADD_EXTERIOR_DECK'
  | 'ADD_EXTERIOR_TREE'
  | 'ADD_EXTERIOR_PERGOLA'
  | 'ADD_STAIRS'
  | 'ADD_PRIMITIVE';

export interface OpenMarketItem {
  id: string;
  name: string;
  category: 'FURNITURE' | 'LIGHTING' | 'BATH_KITCHEN' | 'ARCHITECTURAL' | 'DECOR' | 'STRUCTURAL';
  furnitureCategory: FurnitureCategory;
  manufacturer: string;
  collection: string;
  originCountry: string;
  dimensions: {
    widthFt: number;
    lengthFt: number;
    heightFt: number;
  };
  materialName: string;
  materialType: StudioMaterialType;
  color: string;
  lrv: number;
  cost: number;
  csiCode: string;
  clearanceRadiusFt?: number;
  description: string;
  lod: 'LOD_200' | 'LOD_300' | 'LOD_400';
  leadTimeWeeks: number;
  customObjSnippet?: string;
}

export interface StudioProjectSpace {
  id: string;
  projectId: string;
  name: string;
  widthFt: number; // Room width (e.g. 28)
  lengthFt: number; // Room length (e.g. 36)
  ceilingHeightFt: number; // e.g. 11
  elements: StudioElement[];
  config: EngineeringConfig;
}

export const DEFAULT_STUDIO_ELEMENTS: StudioElement[] = [
  // Outer boundary walls
  {
    id: 'wall-north',
    name: 'North Perimeter Wall',
    type: 'WALL',
    layer: 'architecture',
    x: 18,
    y: 0.25,
    z: 0,
    width: 36,
    length: 0.5,
    height: 11,
    rotation: 0,
    isWallSegment: true,
    startX: 0,
    startY: 0.25,
    endX: 36,
    endY: 0.25,
    thickness: 0.5,
    color: '#E8E5DF',
    materialName: 'Navona Venetian Plaster',
    materialType: 'plaster',
    lrv: 74,
    cost: 4500,
    csiCode: '09 26 00'
  },
  {
    id: 'wall-south',
    name: 'South Perimeter Wall',
    type: 'WALL',
    layer: 'architecture',
    x: 18,
    y: 27.75,
    z: 0,
    width: 36,
    length: 0.5,
    height: 11,
    rotation: 0,
    isWallSegment: true,
    startX: 0,
    startY: 27.75,
    endX: 36,
    endY: 27.75,
    thickness: 0.5,
    color: '#E8E5DF',
    materialName: 'Navona Venetian Plaster',
    materialType: 'plaster',
    lrv: 74,
    cost: 4500,
    csiCode: '09 26 00'
  },
  {
    id: 'wall-west',
    name: 'West Perimeter Wall',
    type: 'WALL',
    layer: 'architecture',
    x: 0.25,
    y: 14,
    z: 0,
    width: 0.5,
    length: 28,
    height: 11,
    rotation: 0,
    isWallSegment: true,
    startX: 0.25,
    startY: 0,
    endX: 0.25,
    endY: 28,
    thickness: 0.5,
    color: '#E8E5DF',
    materialName: 'Navona Venetian Plaster',
    materialType: 'plaster',
    lrv: 74,
    cost: 3800,
    csiCode: '09 26 00'
  },
  {
    id: 'wall-east',
    name: 'East Curtain Wall (Glazing)',
    type: 'WALL',
    layer: 'architecture',
    x: 35.75,
    y: 14,
    z: 0,
    width: 0.5,
    length: 28,
    height: 11,
    rotation: 0,
    isWallSegment: true,
    startX: 35.75,
    startY: 0,
    endX: 35.75,
    endY: 28,
    thickness: 0.5,
    color: '#B0C4DE',
    materialName: 'Acoustic Low-E Floor-to-Ceiling Glazing',
    materialType: 'glass',
    lrv: 85,
    cost: 12500,
    csiCode: '08 44 00'
  },

  // Interior Dividing Wall
  {
    id: 'wall-interior-1',
    name: 'Salon / Suite Partition Wall',
    type: 'WALL',
    layer: 'architecture',
    x: 22,
    y: 10,
    z: 0,
    width: 0.5,
    length: 20,
    height: 11,
    rotation: 0,
    isWallSegment: true,
    startX: 22,
    startY: 0,
    endX: 22,
    endY: 20,
    thickness: 0.5,
    color: '#D8D3C8',
    materialName: 'Fumed White Oak Architectural Slats',
    materialType: 'oak',
    lrv: 38,
    cost: 5800,
    csiCode: '06 41 00'
  },

  // Architectural Opening: Pivot Door
  {
    id: 'door-main',
    name: 'Frameless Flush Pivot Door',
    type: 'DOOR',
    layer: 'architecture',
    x: 22,
    y: 15,
    z: 0,
    width: 3.5,
    length: 0.5,
    height: 9.5,
    rotation: 0,
    color: '#3A2E20',
    materialName: 'Quarter-Sawn Smoked Oak',
    materialType: 'oak',
    lrv: 22,
    cost: 3200,
    csiCode: '08 14 00',
    clearanceRadiusFt: 3.5
  },

  // Architectural Window
  {
    id: 'window-west',
    name: 'Clerestory Architectural Ribbon Window',
    type: 'WINDOW',
    layer: 'architecture',
    x: 0.25,
    y: 8,
    z: 6,
    width: 0.5,
    length: 8,
    height: 3,
    rotation: 0,
    color: '#87CEEB',
    materialName: 'Acoustic Structural Glass',
    materialType: 'glass',
    lrv: 88,
    cost: 2900,
    csiCode: '08 51 00'
  },

  // Structural Column
  {
    id: 'col-1',
    name: 'Architectural Concrete Column',
    type: 'COLUMN',
    layer: 'structure',
    x: 12,
    y: 14,
    z: 0,
    width: 1.5,
    length: 1.5,
    height: 11,
    rotation: 0,
    color: '#A09C94',
    materialName: 'Fair-Faced Architectural Concrete',
    materialType: 'concrete',
    lrv: 45,
    cost: 2100,
    csiCode: '03 30 00'
  },

  // Furniture & Fixtures
  {
    id: 'furn-sofa-main',
    name: 'Minotti Modular Sectional Sofa',
    type: 'FURNITURE',
    furnitureCategory: 'SOFA',
    layer: 'furniture',
    x: 10,
    y: 8,
    z: 0,
    width: 11,
    length: 4.5,
    height: 2.5,
    rotation: 0,
    color: '#E0DDD5',
    materialName: 'Italian Loro Piana Wool Bouclé',
    materialType: 'boucle',
    lrv: 68,
    cost: 16500,
    vendor: 'Minotti SpA, Milan',
    roomName: 'Main Salon',
    clearanceRadiusFt: 3.0
  },
  {
    id: 'furn-coffee-table',
    name: 'Monolithic Navona Travertine Cocktail Table',
    type: 'FURNITURE',
    furnitureCategory: 'COFFEE_TABLE',
    layer: 'furniture',
    x: 10,
    y: 13,
    z: 0,
    width: 5.5,
    length: 3.5,
    height: 1.2,
    rotation: 0,
    color: '#D4CBB8',
    materialName: 'Filled & Honed Navona Travertine',
    materialType: 'travertine',
    lrv: 58,
    cost: 6800,
    vendor: 'Salvatori Tuscany',
    roomName: 'Main Salon'
  },
  {
    id: 'furn-armchair-1',
    name: 'Lounge Armchair (Pair A)',
    type: 'FURNITURE',
    furnitureCategory: 'ARMCHAIR',
    layer: 'furniture',
    x: 5,
    y: 13,
    z: 0,
    width: 3.2,
    length: 3.2,
    height: 2.7,
    rotation: 45,
    color: '#3B332A',
    materialName: 'Saddle Leather & Patinated Bronze Frame',
    materialType: 'bronze',
    lrv: 20,
    cost: 4400,
    vendor: 'B&B Italia',
    roomName: 'Main Salon'
  },
  {
    id: 'furn-credenza',
    name: 'Floating Architectural AV Credenza',
    type: 'FURNITURE',
    furnitureCategory: 'CREDENZA',
    layer: 'furniture',
    x: 10,
    y: 26.5,
    z: 0.5,
    width: 12,
    length: 2.0,
    height: 2.2,
    rotation: 0,
    color: '#28231D',
    materialName: 'Ebonized Quarter-Sawn White Oak',
    materialType: 'oak',
    lrv: 12,
    cost: 8200,
    vendor: 'Studio Liaigre Paris',
    roomName: 'Main Salon'
  },
  {
    id: 'furn-dining-table',
    name: 'Oval Calacatta Marble Dining Table (8 Seater)',
    type: 'FURNITURE',
    furnitureCategory: 'DINING_TABLE',
    layer: 'furniture',
    x: 29,
    y: 10,
    z: 0,
    width: 9.0,
    length: 4.5,
    height: 2.5,
    rotation: 90,
    color: '#F4F4F2',
    materialName: 'Honed Calacatta Vagli Marble Slab',
    materialType: 'marble',
    lrv: 82,
    cost: 14200,
    vendor: 'Antolini Italy',
    roomName: 'Dining Salon',
    clearanceRadiusFt: 3.5
  },
  {
    id: 'furn-lamp-pendant',
    name: 'Sculptural Brass Linear Chandelier',
    type: 'FURNITURE',
    furnitureCategory: 'LAMP',
    layer: 'furniture',
    x: 29,
    y: 10,
    z: 7.5,
    width: 7.0,
    length: 1.5,
    height: 1.0,
    rotation: 90,
    color: '#C5A059',
    materialName: 'Hand-Rubbed Unlacquered Burnished Brass',
    materialType: 'bronze',
    lrv: 55,
    cost: 5400,
    vendor: 'Apparatus Studio NY',
    roomName: 'Dining Salon'
  }
];
