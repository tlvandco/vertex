import { OpenMarketItem, StudioElement, StudioMaterialType } from './types';

// Curated Open Market Architecture, Furniture & BIM Catalog
export const OPEN_MARKET_CATALOG: OpenMarketItem[] = [
  // 1. Living & Lounge
  {
    id: 'mkt-minotti-connery',
    name: 'Connery Modular Seating System',
    category: 'FURNITURE',
    furnitureCategory: 'SOFA',
    manufacturer: 'Minotti SpA',
    collection: 'Connery 2024 Collection',
    originCountry: 'Meda, Italy',
    dimensions: { widthFt: 12.0, lengthFt: 4.5, heightFt: 2.7 },
    materialName: 'Loro Piana Bouclé & Saddle Flap',
    materialType: 'boucle',
    color: '#E8E5DF',
    lrv: 72,
    cost: 18400,
    csiCode: '12 51 00',
    clearanceRadiusFt: 3.0,
    description: 'Architectural horizontal seating system featuring square marble top trays and tailored saddle-leather flanged trim.',
    lod: 'LOD_300',
    leadTimeWeeks: 10
  },
  {
    id: 'mkt-bbitalia-camaleonda',
    name: 'Camaleonda Modular Sofa (Mario Bellini)',
    category: 'FURNITURE',
    furnitureCategory: 'SOFA',
    manufacturer: 'B&B Italia',
    collection: 'Bellini Archives',
    originCountry: 'Novedrate, Italy',
    dimensions: { widthFt: 9.5, lengthFt: 3.8, heightFt: 2.4 },
    materialName: 'Cognac Saddle Leather',
    materialType: 'leather',
    color: '#7B4A2D',
    lrv: 26,
    cost: 15200,
    csiCode: '12 51 00',
    clearanceRadiusFt: 2.8,
    description: 'Iconic capitonné modular sofa with tie-rods and rings, enabling endless geometric interior reconfigurations.',
    lod: 'LOD_300',
    leadTimeWeeks: 8
  },
  {
    id: 'mkt-poliform-mad-chair',
    name: 'Mad Joker Lounge Armchair',
    category: 'FURNITURE',
    furnitureCategory: 'ARMCHAIR',
    manufacturer: 'Poliform',
    collection: 'Marcel Wanders Studio',
    originCountry: 'Inverigo, Italy',
    dimensions: { widthFt: 3.2, lengthFt: 3.3, heightFt: 3.5 },
    materialName: 'Dedar Milan Wool & Spun Bronze Base',
    materialType: 'bronze',
    color: '#4A4036',
    lrv: 24,
    cost: 5900,
    csiCode: '12 51 00',
    clearanceRadiusFt: 2.5,
    description: 'High-back enveloping lounge armchair with swivel die-cast bronze base and hand-stitched inner shell.',
    lod: 'LOD_300',
    leadTimeWeeks: 6
  },
  {
    id: 'mkt-cassina-veliero',
    name: 'Veliero Tensile Architectural Bookcase',
    category: 'FURNITURE',
    furnitureCategory: 'BOOKSHELF',
    manufacturer: 'Cassina',
    collection: 'I Maestri (Franco Albini)',
    originCountry: 'Meda, Italy',
    dimensions: { widthFt: 7.2, lengthFt: 1.8, heightFt: 8.5 },
    materialName: 'Natural Ash & Stainless Steel Cables',
    materialType: 'oak',
    color: '#D4CBB8',
    lrv: 55,
    cost: 24500,
    csiCode: '12 35 59',
    clearanceRadiusFt: 2.0,
    description: 'Tension-rigged nautical architectural shelving suspended by steel cables and tempered glass shelves.',
    lod: 'LOD_400',
    leadTimeWeeks: 12
  },

  // 2. Dining & Entertaining
  {
    id: 'mkt-salvatori-taula',
    name: 'Taula Monolithic Dining Table',
    category: 'FURNITURE',
    furnitureCategory: 'DINING_TABLE',
    manufacturer: 'Salvatori',
    collection: 'Patricia Urquiola Stone Design',
    originCountry: 'Querceta, Italy',
    dimensions: { widthFt: 9.8, lengthFt: 4.2, heightFt: 2.5 },
    materialName: 'Honed Pietra d’Avola Limestone',
    materialType: 'travertine',
    color: '#383431',
    lrv: 18,
    cost: 19800,
    csiCode: '12 51 00',
    clearanceRadiusFt: 3.5,
    description: 'Monolithic carved limestone dining table exploring shifting cantilever masses and tactile textured surfaces.',
    lod: 'LOD_300',
    leadTimeWeeks: 9
  },
  {
    id: 'mkt-rimadesio-manta',
    name: 'Manta Architectural Dining / Conference Table',
    category: 'FURNITURE',
    furnitureCategory: 'DINING_TABLE',
    manufacturer: 'Rimadesio',
    collection: 'Giuseppe Bavuso Engineering',
    originCountry: 'Giussano, Italy',
    dimensions: { widthFt: 10.5, lengthFt: 4.0, heightFt: 2.5 },
    materialName: 'Sahara Noir Marble & Black Anodized Aluminum',
    materialType: 'marble',
    color: '#1E1E1E',
    lrv: 12,
    cost: 16800,
    csiCode: '12 51 00',
    clearanceRadiusFt: 3.5,
    description: 'High-pressure die-cast aluminum frame supporting an ultra-slim monolithic marble top.',
    lod: 'LOD_300',
    leadTimeWeeks: 7
  },
  {
    id: 'mkt-knoll-saarinen',
    name: 'Saarinen Executive Dining Chairs (Set of 6)',
    category: 'FURNITURE',
    furnitureCategory: 'CHAIR',
    manufacturer: 'Knoll International',
    collection: 'Eero Saarinen Archive',
    originCountry: 'East Greenville, USA',
    dimensions: { widthFt: 5.5, lengthFt: 2.2, heightFt: 2.7 },
    materialName: 'Bouclé Fabric & Polished Chrome Legs',
    materialType: 'boucle',
    color: '#F0ECE1',
    lrv: 78,
    cost: 8400,
    csiCode: '12 51 00',
    clearanceRadiusFt: 2.0,
    description: 'Sculptural molded fiberglass shell chair with seamless foam cushion and slender tubular legs.',
    lod: 'LOD_200',
    leadTimeWeeks: 4
  },
  {
    id: 'mkt-poliform-concorde',
    name: 'Concorde Low Cocktail Table',
    category: 'FURNITURE',
    furnitureCategory: 'COFFEE_TABLE',
    manufacturer: 'Poliform',
    collection: 'Emmanuel Gallina',
    originCountry: 'Inverigo, Italy',
    dimensions: { widthFt: 5.8, lengthFt: 3.2, heightFt: 1.3 },
    materialName: 'Calacatta Gold Marble & Spessart Oak',
    materialType: 'marble',
    color: '#F7F5F0',
    lrv: 82,
    cost: 7200,
    csiCode: '12 51 00',
    clearanceRadiusFt: 2.0,
    description: 'Aero-form tapered solid wood trestle base with recessed inset honed marble slab.',
    lod: 'LOD_300',
    leadTimeWeeks: 6
  },

  // 3. Bedroom & Private Sanctuary
  {
    id: 'mkt-b-and-b-husk-bed',
    name: 'Husk King Platform Bed with Tufted Headboard',
    category: 'FURNITURE',
    furnitureCategory: 'BED',
    manufacturer: 'B&B Italia',
    collection: 'Patricia Urquiola',
    originCountry: 'Novedrate, Italy',
    dimensions: { widthFt: 7.2, lengthFt: 7.8, heightFt: 3.8 },
    materialName: 'Textured Melange Linen & Bronzed Base',
    materialType: 'boucle',
    color: '#D8D4CA',
    lrv: 62,
    cost: 13600,
    csiCode: '12 51 00',
    clearanceRadiusFt: 3.0,
    description: 'Soft geometric tufted headboard evoking playful comfort, mounted onto a floating architectural steel frame.',
    lod: 'LOD_300',
    leadTimeWeeks: 8
  },
  {
    id: 'mkt-poliform-kelly-dresser',
    name: 'Kelly Architectural 6-Drawer Dresser',
    category: 'FURNITURE',
    furnitureCategory: 'CREDENZA',
    manufacturer: 'Poliform',
    collection: 'Emmanuel Gallina',
    originCountry: 'Inverigo, Italy',
    dimensions: { widthFt: 6.2, lengthFt: 2.0, heightFt: 2.8 },
    materialName: 'Black Elm & Saddle Leather Fronts',
    materialType: 'walnut',
    color: '#2B2620',
    lrv: 16,
    cost: 9800,
    csiCode: '12 35 59',
    clearanceRadiusFt: 2.5,
    description: 'Curved perimeter joinery with hand-wrapped saddle leather drawer fronts and hidden soft-close slides.',
    lod: 'LOD_300',
    leadTimeWeeks: 7
  },

  // 4. Executive Office & Tech Workstation
  {
    id: 'mkt-vitra-eames-desk',
    name: 'Segmented Executive Conference & Drafting Desk',
    category: 'FURNITURE',
    furnitureCategory: 'DESK',
    manufacturer: 'Vitra',
    collection: 'Charles & Ray Eames Studio',
    originCountry: 'Weil am Rhein, Germany',
    dimensions: { widthFt: 7.5, lengthFt: 3.5, heightFt: 2.5 },
    materialName: 'American Walnut & Polished Die-Cast Aluminum',
    materialType: 'walnut',
    color: '#423326',
    lrv: 22,
    cost: 11500,
    csiCode: '12 51 00',
    clearanceRadiusFt: 3.0,
    description: 'Solid oiled American walnut slab with integrated power pass-through and modular aluminum segmented base.',
    lod: 'LOD_300',
    leadTimeWeeks: 5
  },
  {
    id: 'mkt-hermanmiller-aeron',
    name: 'Aeron Remastered Mineral Executive Chair',
    category: 'FURNITURE',
    furnitureCategory: 'CHAIR',
    manufacturer: 'Herman Miller',
    collection: 'Bill Stumpf & Don Chadwick',
    originCountry: 'Zeeland, USA',
    dimensions: { widthFt: 2.3, lengthFt: 2.3, heightFt: 3.5 },
    materialName: 'Pellicle Elastomeric Suspension & Satin Aluminum',
    materialType: 'steel',
    color: '#D1CDC7',
    lrv: 64,
    cost: 1850,
    csiCode: '12 51 00',
    clearanceRadiusFt: 2.5,
    description: 'Ergonomic task chair with PostureFit SL sacral support and harmonic tilt mechanism.',
    lod: 'LOD_300',
    leadTimeWeeks: 2
  },

  // 5. Kitchen, Bath & Wellness
  {
    id: 'mkt-antoniolupi-reflex',
    name: 'Reflex Freestanding Cristalmood Oval Bathtub',
    category: 'BATH_KITCHEN',
    furnitureCategory: 'BATHTUB',
    manufacturer: 'antoniolupi',
    collection: 'AL Studio Design',
    originCountry: 'Stabbia, Italy',
    dimensions: { widthFt: 5.8, lengthFt: 3.0, heightFt: 2.0 },
    materialName: 'Translucent Cristalmood Resin (Amber Bronze)',
    materialType: 'glass',
    color: '#A06D3B',
    lrv: 35,
    cost: 17900,
    csiCode: '22 41 00',
    clearanceRadiusFt: 3.0,
    description: 'Seamless oval freestanding soaking tub cast from patented Cristalmood transparent architectural resin.',
    lod: 'LOD_400',
    leadTimeWeeks: 9
  },
  {
    id: 'mkt-salvatori-balnea',
    name: 'Balnea Monolithic Stone Vanity & Vessel Basin',
    category: 'BATH_KITCHEN',
    furnitureCategory: 'SANITARY',
    manufacturer: 'Salvatori',
    collection: 'Elisa Ossino Studio',
    originCountry: 'Querceta, Italy',
    dimensions: { widthFt: 4.5, lengthFt: 2.0, heightFt: 2.8 },
    materialName: 'Bianco Carrara Fluted Marble',
    materialType: 'marble',
    color: '#EEEEEE',
    lrv: 85,
    cost: 12400,
    csiCode: '22 41 00',
    clearanceRadiusFt: 2.5,
    description: 'Ribbed textured marble vanity unit with integrated drain block and wall-hung concealed brass brackets.',
    lod: 'LOD_300',
    leadTimeWeeks: 8
  },
  {
    id: 'mkt-poliform-kitchen-island',
    name: 'Alea Pro Monolithic Marble Culinary Island',
    category: 'BATH_KITCHEN',
    furnitureCategory: 'KITCHEN_ISLAND',
    manufacturer: 'Poliform Varenna',
    collection: 'Paolo Piva & R&D Poliform',
    originCountry: 'Inverigo, Italy',
    dimensions: { widthFt: 11.0, lengthFt: 4.0, heightFt: 3.0 },
    materialName: 'Ceppo di Gré Stone & Fumed Oak Inset',
    materialType: 'travertine',
    color: '#7A7670',
    lrv: 40,
    cost: 32000,
    csiCode: '12 35 30',
    clearanceRadiusFt: 4.0,
    description: 'Linear architectural kitchen island with 45° beveled edge mitered joints and flush induction integration.',
    lod: 'LOD_400',
    leadTimeWeeks: 12
  },

  // 6. Architectural Lighting & Sculptural Fixtures
  {
    id: 'mkt-flos-arrangements',
    name: 'Arrangements Geometric Chandelier Cluster',
    category: 'LIGHTING',
    furnitureCategory: 'LAMP',
    manufacturer: 'FLOS',
    collection: 'Michael Anastassiades',
    originCountry: 'Bovezzo, Italy',
    dimensions: { widthFt: 5.5, lengthFt: 2.5, heightFt: 6.0 },
    materialName: 'Matte Black Extruded Aluminum & Optical Silicone',
    materialType: 'matte_black',
    color: '#1C1A17',
    lrv: 10,
    cost: 8900,
    csiCode: '26 51 00',
    description: 'Modular geometric lighting elements linked together like illuminated jewelry in architectural voids.',
    lod: 'LOD_300',
    leadTimeWeeks: 4
  },
  {
    id: 'mkt-artemide-nh',
    name: 'nh S3 Suspended Brass Spherical Chandelier',
    category: 'LIGHTING',
    furnitureCategory: 'LAMP',
    manufacturer: 'Artemide',
    collection: 'Neri&Hu Design',
    originCountry: 'Pregnana Milanese, Italy',
    dimensions: { widthFt: 4.8, lengthFt: 1.5, heightFt: 4.0 },
    materialName: 'Blown Glass Sphere & Brushed Brass Rings',
    materialType: 'bronze',
    color: '#D4AF37',
    lrv: 58,
    cost: 4800,
    csiCode: '26 51 00',
    description: 'Movable illuminated white blown-glass spheres resting on dynamic brushed brass cantilever rings.',
    lod: 'LOD_300',
    leadTimeWeeks: 3
  },

  // 7. Architectural Openings & Structure
  {
    id: 'mkt-rimadesio-velaria',
    name: 'Velaria Sliding Architectural Glass Partitions',
    category: 'ARCHITECTURAL',
    furnitureCategory: 'CUSTOM',
    manufacturer: 'Rimadesio',
    collection: 'Custom Made Systems',
    originCountry: 'Giussano, Italy',
    dimensions: { widthFt: 8.0, lengthFt: 0.4, heightFt: 11.0 },
    materialName: 'Bronze Fluted Glass & Bronzed Metal Profiles',
    materialType: 'glass',
    color: '#7A6B56',
    lrv: 45,
    cost: 14500,
    csiCode: '08 44 00',
    description: 'Ceiling-recessed motorized sliding acoustic glass doors dividing spaces while maintaining transparency.',
    lod: 'LOD_400',
    leadTimeWeeks: 10
  },
  {
    id: 'mkt-travertine-column',
    name: 'Fluted Navona Travertine Structural Column Clad',
    category: 'STRUCTURAL',
    furnitureCategory: 'CUSTOM',
    manufacturer: 'Salvatori Tuscany',
    collection: 'Architectural Surfaces',
    originCountry: 'Querceta, Italy',
    dimensions: { widthFt: 2.0, lengthFt: 2.0, heightFt: 11.0 },
    materialName: 'Honed Navona Travertine (Fluted)',
    materialType: 'travertine',
    color: '#D9D1C1',
    lrv: 62,
    cost: 6500,
    csiCode: '04 42 00',
    description: 'Precision CNC fluted curved stone cladding wrap designed for load-bearing circular columns.',
    lod: 'LOD_400',
    leadTimeWeeks: 6
  },

  // 8. Landscape & Interior Art
  {
    id: 'mkt-ficus-monolithic-planter',
    name: 'Ficus Lyrata in Hand-Hammered Bronze Planter',
    category: 'DECOR',
    furnitureCategory: 'PLANT',
    manufacturer: 'Botanica Atelier Milan',
    collection: 'High-Altitude Biophilic Specimen',
    originCountry: 'Milan, Italy',
    dimensions: { widthFt: 3.5, lengthFt: 3.5, heightFt: 8.0 },
    materialName: 'Living Specimen & Patinated Bronze Vessel',
    materialType: 'bronze',
    color: '#2D4A2B',
    lrv: 25,
    cost: 3400,
    csiCode: '12 93 00',
    clearanceRadiusFt: 2.0,
    description: 'Architectural multi-stem fiddle leaf fig potted in an artisan heavy bronze conical planter.',
    lod: 'LOD_200',
    leadTimeWeeks: 2
  }
];

// 3D Wavefront .OBJ Parser for importing 3D models without flaws
export interface ParsedObjResult {
  name: string;
  vertices: number[]; // Flat array of [x, y, z, x, y, z, ...]
  normals?: number[];
  indices?: number[];
  bounds: {
    minX: number;
    maxX: number;
    minY: number;
    maxY: number;
    minZ: number;
    maxZ: number;
    widthFt: number;
    heightFt: number;
    lengthFt: number;
  };
}

export function parseObjFile(objText: string, modelName: string = 'Imported 3D Model', unitScale: number = 1.0): ParsedObjResult {
  const rawVertices: number[][] = [];
  const rawNormals: number[][] = [];
  const faceVertices: number[] = [];
  const faceNormals: number[] = [];

  const lines = objText.split('\n');

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line || line.startsWith('#')) continue;

    const parts = line.split(/\s+/);
    const command = parts[0];

    if (command === 'v') {
      const x = parseFloat(parts[1]) * unitScale;
      const y = parseFloat(parts[2]) * unitScale;
      const z = parseFloat(parts[3]) * unitScale;
      if (!isNaN(x) && !isNaN(y) && !isNaN(z)) {
        rawVertices.push([x, y, z]);
      }
    } else if (command === 'vn') {
      const nx = parseFloat(parts[1]);
      const ny = parseFloat(parts[2]);
      const nz = parseFloat(parts[3]);
      if (!isNaN(nx) && !isNaN(ny) && !isNaN(nz)) {
        rawNormals.push([nx, ny, nz]);
      }
    } else if (command === 'f') {
      // Faces can be triangles or quads: v or v/vt or v/vt/vn or v//vn
      const vIndices: number[] = [];
      const nIndices: number[] = [];

      for (let j = 1; j < parts.length; j++) {
        const segs = parts[j].split('/');
        const vIdx = parseInt(segs[0], 10);
        if (!isNaN(vIdx)) {
          // OBJ indices are 1-based, or negative relative
          const resolvedV = vIdx > 0 ? vIdx - 1 : rawVertices.length + vIdx;
          vIndices.push(resolvedV);
        }
        if (segs.length >= 3 && segs[2]) {
          const nIdx = parseInt(segs[2], 10);
          if (!isNaN(nIdx)) {
            const resolvedN = nIdx > 0 ? nIdx - 1 : rawNormals.length + nIdx;
            nIndices.push(resolvedN);
          }
        }
      }

      // Triangulate if polygon with 3 or more vertices (fan triangulation)
      if (vIndices.length >= 3) {
        for (let k = 1; k < vIndices.length - 1; k++) {
          const i0 = vIndices[0];
          const i1 = vIndices[k];
          const i2 = vIndices[k + 1];

          if (rawVertices[i0] && rawVertices[i1] && rawVertices[i2]) {
            faceVertices.push(...rawVertices[i0], ...rawVertices[i1], ...rawVertices[i2]);
          }

          if (nIndices.length > 0) {
            const n0 = nIndices[0];
            const n1 = nIndices[k];
            const n2 = nIndices[k + 1];
            if (rawNormals[n0] && rawNormals[n1] && rawNormals[n2]) {
              faceNormals.push(...rawNormals[n0], ...rawNormals[n1], ...rawNormals[n2]);
            }
          }
        }
      }
    }
  }

  // Calculate Bounding Box
  let minX = Infinity, maxX = -Infinity;
  let minY = Infinity, maxY = -Infinity;
  let minZ = Infinity, maxZ = -Infinity;

  for (let i = 0; i < faceVertices.length; i += 3) {
    const x = faceVertices[i];
    const y = faceVertices[i + 1];
    const z = faceVertices[i + 2];

    if (x < minX) minX = x;
    if (x > maxX) maxX = x;
    if (y < minY) minY = y;
    if (y > maxY) maxY = y;
    if (z < minZ) minZ = z;
    if (z > maxZ) maxZ = z;
  }

  if (minX === Infinity) {
    // Fallback if empty mesh
    minX = -1; maxX = 1; minY = 0; maxY = 2; minZ = -1; maxZ = 1;
  }

  const widthFt = Math.max(0.5, Math.round((maxX - minX) * 10) / 10);
  const heightFt = Math.max(0.5, Math.round((maxY - minY) * 10) / 10);
  const lengthFt = Math.max(0.5, Math.round((maxZ - minZ) * 10) / 10);

  // Center vertices along X and Z, and place base at Y = 0
  const centerX = (minX + maxX) / 2;
  const centerZ = (minZ + maxZ) / 2;
  const baseY = minY;

  const centeredVertices: number[] = [];
  for (let i = 0; i < faceVertices.length; i += 3) {
    centeredVertices.push(
      faceVertices[i] - centerX,
      faceVertices[i + 1] - baseY,
      faceVertices[i + 2] - centerZ
    );
  }

  return {
    name: modelName,
    vertices: centeredVertices,
    normals: faceNormals.length > 0 ? faceNormals : undefined,
    bounds: {
      minX, maxX, minY, maxY, minZ, maxZ,
      widthFt,
      heightFt,
      lengthFt
    }
  };
}

// Convert Open Market item to StudioElement
export function marketItemToStudioElement(
  item: OpenMarketItem,
  posX: number,
  posY: number
): StudioElement {
  let elemType: StudioElement['type'] = 'FURNITURE';
  let layer: StudioElement['layer'] = 'furniture';

  if (item.category === 'STRUCTURAL') {
    elemType = 'COLUMN';
    layer = 'structure';
  } else if (item.category === 'ARCHITECTURAL') {
    elemType = 'DOOR';
    layer = 'architecture';
  } else if (item.category === 'LIGHTING') {
    elemType = 'FURNITURE';
    layer = 'furniture';
  }

  return {
    id: `mkt-inst-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    name: item.name,
    type: elemType,
    furnitureCategory: item.furnitureCategory,
    layer,
    x: posX,
    y: posY,
    z: item.category === 'LIGHTING' ? 6.5 : 0,
    width: item.dimensions.widthFt,
    length: item.dimensions.lengthFt,
    height: item.dimensions.heightFt,
    rotation: 0,
    color: item.color,
    materialName: item.materialName,
    materialType: item.materialType,
    lrv: item.lrv,
    cost: item.cost,
    csiCode: item.csiCode,
    vendor: `${item.manufacturer} (${item.originCountry})`,
    roomName: 'Design Space',
    clearanceRadiusFt: item.clearanceRadiusFt,
    isImported: true,
    importedSource: `Open Market: ${item.manufacturer}`
  };
}
