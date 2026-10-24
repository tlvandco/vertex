import React, { useState } from 'react';
import { StudioElement, ElementType, FurnitureCategory, StudioMaterialType } from './types';
import {
  Box,
  Square,
  DoorOpen,
  Eye,
  Columns,
  Sparkles,
  TreePine,
  Waves,
  Sun,
  Flame,
  LayoutGrid,
  Maximize,
  Sliders,
  Plus,
  Search,
  X
} from 'lucide-react';

export interface ObjectPreset {
  id: string;
  name: string;
  type: ElementType;
  category?: FurnitureCategory;
  domain: 'interior' | 'exterior' | 'architecture' | 'primitives';
  dimensions: { width: number; length: number; height: number };
  color: string;
  materialName: string;
  materialType: StudioMaterialType;
  cost: number;
  csiCode: string;
  roughness: number;
  metalness: number;
  description: string;
}

export const OBJECT_PRESETS: ObjectPreset[] = [
  // 1. Exterior & Landscape Presets
  {
    id: 'ext-infinity-pool',
    name: 'Infinity Lap Pool & Water Basin',
    type: 'EXTERIOR_POOL',
    category: 'POOL',
    domain: 'exterior',
    dimensions: { width: 14.0, length: 28.0, height: 4.5 },
    color: '#38A3A5',
    materialName: 'Acoustic Blue Mosaic & Crystalline Water',
    materialType: 'water',
    cost: 45000,
    csiCode: '13 11 00',
    roughness: 0.1,
    metalness: 0.1,
    description: 'Submerged infinity-edge pool with concealed perimeter gutter and underwater LED illumination.'
  },
  {
    id: 'ext-timber-pergola',
    name: 'Architectural Louvered Timber Pergola',
    type: 'EXTERIOR_PERGOLA',
    category: 'PERGOLA',
    domain: 'exterior',
    dimensions: { width: 16.0, length: 14.0, height: 10.0 },
    color: '#3B2F2F',
    materialName: 'Thermo-Treated Ash Rafters & Black Steel Posts',
    materialType: 'timber_deck',
    cost: 16500,
    csiCode: '10 73 16',
    roughness: 0.6,
    metalness: 0.2,
    description: 'Modular cantilever pergola with motorized acoustic solar louvers and hidden drainage.'
  },
  {
    id: 'ext-ipe-decking',
    name: 'Floating Ipe Hardwood Terrace Deck',
    type: 'EXTERIOR_DECK',
    category: 'DECKING',
    domain: 'exterior',
    dimensions: { width: 18.0, length: 16.0, height: 0.8 },
    color: '#654321',
    materialName: 'FSC-Certified Brazilian Ipe Hardwood Slats',
    materialType: 'timber_deck',
    cost: 12000,
    csiCode: '06 15 00',
    roughness: 0.5,
    metalness: 0.05,
    description: 'Pedestal-supported exterior deck with concealed clips and perimeter reveal gaps.'
  },
  {
    id: 'ext-specimen-olive',
    name: 'Century Tuscan Olive Specimen Tree',
    type: 'EXTERIOR_TREE',
    category: 'TREE',
    domain: 'exterior',
    dimensions: { width: 8.0, length: 8.0, height: 12.0 },
    color: '#4B6B40',
    materialName: 'Ancient Twisted Trunk & Silvery-Green Foliage',
    materialType: 'grass',
    cost: 8500,
    csiCode: '32 93 00',
    roughness: 0.8,
    metalness: 0.0,
    description: 'Mature architectural specimen olive tree with sculptural trunk form and root ball base.'
  },
  {
    id: 'ext-linear-firepit',
    name: 'Monolithic Concrete Linear Fire Pit',
    type: 'FURNITURE',
    category: 'CUSTOM',
    domain: 'exterior',
    dimensions: { width: 8.0, length: 2.5, height: 1.5 },
    color: '#55524F',
    materialName: 'Board-Formed Charcoal Concrete & Lava Rock',
    materialType: 'concrete',
    cost: 5400,
    csiCode: '12 93 00',
    roughness: 0.7,
    metalness: 0.1,
    description: 'Gas-plumbed linear architectural fire table with lava stone burner bed.'
  },
  {
    id: 'ext-sun-lounger',
    name: 'Tribù Teak & Mesh Minimalist Sun Lounger',
    type: 'FURNITURE',
    category: 'EXTERIOR_LOUNGER',
    domain: 'exterior',
    dimensions: { width: 3.0, length: 7.0, height: 1.2 },
    color: '#A08264',
    materialName: 'Weathered Plantation Teak & Batyline Mesh',
    materialType: 'timber_deck',
    cost: 3200,
    csiCode: '12 51 00',
    roughness: 0.4,
    metalness: 0.05,
    description: 'Multi-position outdoor chaise lounge with integrated low-profile wheels.'
  },

  // 2. Interior Presets
  {
    id: 'int-modular-sectional',
    name: 'Minotti Connery Sectional Sofa',
    type: 'FURNITURE',
    category: 'SOFA',
    domain: 'interior',
    dimensions: { width: 12.0, length: 4.5, height: 2.6 },
    color: '#E0DDD5',
    materialName: 'Italian Bouclé & Saddle Flap',
    materialType: 'boucle',
    cost: 17500,
    csiCode: '12 51 00',
    roughness: 0.9,
    metalness: 0.05,
    description: 'Low-slung Italian modular lounge system with wide armrests and feather cushions.'
  },
  {
    id: 'int-platform-bed',
    name: 'B&B Italia Husk King Platform Bed',
    type: 'FURNITURE',
    category: 'BED',
    domain: 'interior',
    dimensions: { width: 7.2, length: 7.8, height: 3.8 },
    color: '#D8D4CA',
    materialName: 'Textured Melange Linen & Bronzed Base',
    materialType: 'boucle',
    cost: 13600,
    csiCode: '12 51 00',
    roughness: 0.85,
    metalness: 0.1,
    description: 'Floating architectural bed frame with tufted enveloping headboard.'
  },
  {
    id: 'int-executive-desk',
    name: 'Poliform Concorde Executive Desk',
    type: 'FURNITURE',
    category: 'DESK',
    domain: 'interior',
    dimensions: { width: 7.5, length: 3.5, height: 2.5 },
    color: '#3B2E20',
    materialName: 'Quarter-Sawn Smoked Oak & Black Metal Legs',
    materialType: 'oak',
    cost: 9800,
    csiCode: '12 51 00',
    roughness: 0.45,
    metalness: 0.3,
    description: 'Executive workstation with integrated cable ducting, leather blotter pad, and pencil drawer.'
  },
  {
    id: 'int-marble-dining',
    name: 'Monolithic Calacatta Marble Dining Table',
    type: 'FURNITURE',
    category: 'DINING_TABLE',
    domain: 'interior',
    dimensions: { width: 9.5, length: 4.2, height: 2.5 },
    color: '#F4F4F2',
    materialName: 'Honed Calacatta Vagli Marble Slab',
    materialType: 'marble',
    cost: 16800,
    csiCode: '12 51 00',
    roughness: 0.15,
    metalness: 0.15,
    description: 'Bookmatched marble slab with chamfered edge profile and sculptural cylindrical plinth bases.'
  },
  {
    id: 'int-oval-bathtub',
    name: 'antoniolupi Freestanding Soaking Tub',
    type: 'FURNITURE',
    category: 'BATHTUB',
    domain: 'interior',
    dimensions: { width: 5.8, length: 3.2, height: 2.0 },
    color: '#A06D3B',
    materialName: 'Translucent Cristalmood Amber Resin',
    materialType: 'glass',
    cost: 17900,
    csiCode: '22 41 00',
    roughness: 0.2,
    metalness: 0.05,
    description: 'Sculpted oval ergonomic soaking tub with floor-mounted mixer tap.'
  },
  {
    id: 'int-stone-vanity',
    name: 'Salvatori Fluted Stone Vanity & Vessel Sink',
    type: 'FURNITURE',
    category: 'SANITARY',
    domain: 'interior',
    dimensions: { width: 5.0, length: 2.0, height: 2.8 },
    color: '#EEEEEE',
    materialName: 'Bianco Carrara Marble Fluted Clad',
    materialType: 'marble',
    cost: 12400,
    csiCode: '22 41 00',
    roughness: 0.25,
    metalness: 0.1,
    description: 'Wall-hung stone vanity block with integrated overflow and circular vessel basin.'
  },
  {
    id: 'int-kitchen-island',
    name: 'Poliform Monolithic Marble Culinary Island',
    type: 'FURNITURE',
    category: 'KITCHEN_ISLAND',
    domain: 'interior',
    dimensions: { width: 11.0, length: 4.2, height: 3.0 },
    color: '#7A7670',
    materialName: 'Ceppo di Gré Stone & Fumed Oak Inset',
    materialType: 'travertine',
    cost: 32000,
    csiCode: '12 35 30',
    roughness: 0.35,
    metalness: 0.1,
    description: 'Waterfall island with mitered 45-degree joints, flush induction cooktop, and seating overhang.'
  },

  // 3. Architectural Openings & Structure
  {
    id: 'arch-solid-wall',
    name: 'Acoustic Partition Wall (6" Core)',
    type: 'WALL',
    domain: 'architecture',
    dimensions: { width: 12.0, length: 0.5, height: 11.0 },
    color: '#E8E5DF',
    materialName: 'Venetian Navona Plaster',
    materialType: 'plaster',
    cost: 1400,
    csiCode: '09 22 16',
    roughness: 0.85,
    metalness: 0.05,
    description: 'Metal-stud partition with acoustic batt insulation and Navona polished plaster finish.'
  },
  {
    id: 'arch-glass-curtain',
    name: 'Floor-to-Ceiling Glazed Curtain Wall',
    type: 'WALL',
    domain: 'architecture',
    dimensions: { width: 12.0, length: 0.5, height: 11.0 },
    color: '#B0C4DE',
    materialName: 'Low-E Double-Glazed Acoustic Glass',
    materialType: 'glass',
    cost: 4200,
    csiCode: '08 44 00',
    roughness: 0.05,
    metalness: 0.2,
    description: 'Structural glass curtain wall with concealed floor and ceiling channels.'
  },
  {
    id: 'arch-pivot-door',
    name: 'Frameless Smoked Oak Pivot Door',
    type: 'DOOR',
    domain: 'architecture',
    dimensions: { width: 3.5, length: 0.5, height: 9.5 },
    color: '#3A2E20',
    materialName: 'Quarter-Sawn Smoked Oak',
    materialType: 'oak',
    cost: 3200,
    csiCode: '08 14 00',
    roughness: 0.4,
    metalness: 0.1,
    description: 'Full-height floor-to-ceiling pivot door with integrated magnetic latch and oil damper.'
  },
  {
    id: 'arch-ribbon-window',
    name: 'Architectural Ribbon Window',
    type: 'WINDOW',
    domain: 'architecture',
    dimensions: { width: 8.0, length: 0.5, height: 4.0 },
    color: '#87CEEB',
    materialName: 'Double-Glazed Low-E Glass',
    materialType: 'glass',
    cost: 2900,
    csiCode: '08 51 00',
    roughness: 0.05,
    metalness: 0.2,
    description: 'Horizontal ribbon glazing band with thermally broken aluminum profile.'
  },
  {
    id: 'arch-fluted-column',
    name: 'Architectural Fluted Concrete Column',
    type: 'COLUMN',
    domain: 'architecture',
    dimensions: { width: 1.5, length: 1.5, height: 11.0 },
    color: '#A09C94',
    materialName: 'Fair-Faced Concrete',
    materialType: 'concrete',
    cost: 2100,
    csiCode: '03 30 00',
    roughness: 0.7,
    metalness: 0.05,
    description: 'Load-bearing cylindrical structural column with micro-fluted textural relief.'
  },
  {
    id: 'arch-floating-stairs',
    name: 'Cantilever Floating Timber Staircase',
    type: 'STAIRS',
    category: 'STAIRCASE',
    domain: 'architecture',
    dimensions: { width: 4.0, length: 12.0, height: 10.0 },
    color: '#4A3B2C',
    materialName: 'Solid White Oak Treads & Concealed Steel Stringer',
    materialType: 'oak',
    cost: 18500,
    csiCode: '05 51 00',
    roughness: 0.4,
    metalness: 0.2,
    description: 'Floating open-riser cantilevered stair treads projecting from structural concrete spine.'
  },

  // 4. Mesh Primitives (Blender-like)
  {
    id: 'prim-cube',
    name: 'Mesh Primitive Cube / Plinth',
    type: 'PRIMITIVE_CUBE',
    category: 'PRIMITIVE_CUBE',
    domain: 'primitives',
    dimensions: { width: 3.0, length: 3.0, height: 3.0 },
    color: '#D4AF37',
    materialName: 'Architectural Brushed Bronze',
    materialType: 'bronze',
    cost: 1500,
    csiCode: '05 50 00',
    roughness: 0.3,
    metalness: 0.8,
    description: 'Geometry primitive cube with 90° mitered edges and uniform scaling.'
  },
  {
    id: 'prim-cylinder',
    name: 'Mesh Primitive Cylinder Pedestal',
    type: 'PRIMITIVE_CYLINDER',
    category: 'PRIMITIVE_CYLINDER',
    domain: 'primitives',
    dimensions: { width: 2.5, length: 2.5, height: 3.5 },
    color: '#D4CBB8',
    materialName: 'Honed Navona Travertine',
    materialType: 'travertine',
    cost: 1800,
    csiCode: '04 42 00',
    roughness: 0.4,
    metalness: 0.1,
    description: 'Smooth 32-segment parametric cylinder pedestal.'
  }
];

interface ObjectCreationPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onAddPreset: (preset: ObjectPreset) => void;
}

export const ObjectCreationPalette: React.FC<ObjectCreationPaletteProps> = ({
  isOpen,
  onClose,
  onAddPreset
}) => {
  const [activeDomain, setActiveDomain] = useState<'all' | 'interior' | 'exterior' | 'architecture' | 'primitives'>('all');
  const [search, setSearch] = useState<string>('');

  if (!isOpen) return null;

  const filtered = OBJECT_PRESETS.filter(p => {
    const matchesDomain = activeDomain === 'all' || p.domain === activeDomain;
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.materialName.toLowerCase().includes(search.toLowerCase()) ||
      p.description.toLowerCase().includes(search.toLowerCase());
    return matchesDomain && matchesSearch;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in-50 duration-200">
      <div className="bg-[#1C1A17] text-white w-full max-w-4xl rounded-3xl border border-[#3A332A] shadow-2xl overflow-hidden flex flex-col max-h-[88vh]">
        {/* Header (Blender-like Add Mesh Menu) */}
        <div className="px-6 py-4 border-b border-[#2C2416] flex items-center justify-between bg-[#24201A]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#D4AF37] text-black flex items-center justify-center font-bold">
              <Plus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-lg text-[#F5F2EB]">
                Add & Create Architectural Objects (Blender / CAD Mesh Library)
              </h3>
              <p className="text-xs text-gray-400">
                Spawn interior furniture, exterior landscape elements, doors, windows, and mesh primitives.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Domain Filter Pills & Search */}
        <div className="px-6 py-3 border-b border-[#2C2416] bg-[#1F1C18] flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none">
            {[
              { id: 'all' as const, label: 'All Presets' },
              { id: 'interior' as const, label: 'Interior Living & FF&E' },
              { id: 'exterior' as const, label: 'Exterior & Landscape' },
              { id: 'architecture' as const, label: 'Walls, Doors & Glazing' },
              { id: 'primitives' as const, label: 'Mesh Primitives' }
            ].map(tab => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveDomain(tab.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-mono transition-all cursor-pointer whitespace-nowrap ${
                  activeDomain === tab.id
                    ? 'bg-[#D4AF37] text-black font-bold shadow-xs'
                    : 'bg-[#26221D] text-gray-400 hover:text-white border border-[#3A332A]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search presets..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-[#26221D] border border-[#3A332A] rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#D4AF37]"
            />
          </div>
        </div>

        {/* Preset Cards Grid */}
        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(p => (
            <div
              key={p.id}
              onClick={() => {
                onAddPreset(p);
                onClose();
              }}
              className="bg-[#24201A] border border-[#3A332A] hover:border-[#D4AF37] rounded-2xl p-4 flex flex-col justify-between space-y-3 cursor-pointer transition-all hover:scale-[1.01] hover:shadow-xl group"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-[#D4AF37] font-bold">
                    {p.domain}
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 text-gray-300">
                    {p.dimensions.width}' × {p.dimensions.length}' × {p.dimensions.height}'
                  </span>
                </div>
                <h4 className="font-serif font-bold text-sm text-[#F5F2EB] group-hover:text-[#D4AF37] transition-colors">
                  {p.name}
                </h4>
                <p className="text-[11px] text-gray-400 line-clamp-2 mt-1 leading-relaxed">
                  {p.description}
                </p>
              </div>

              <div className="pt-2 border-t border-white/5 flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5">
                  <span
                    className="w-3 h-3 rounded-full border border-black/40"
                    style={{ backgroundColor: p.color }}
                  />
                  <span className="text-[11px] font-mono text-gray-300 truncate max-w-[120px]">
                    {p.materialName}
                  </span>
                </div>
                <button
                  type="button"
                  className="px-2.5 py-1 bg-[#D4AF37]/20 group-hover:bg-[#D4AF37] text-[#D4AF37] group-hover:text-black font-bold rounded-lg text-xs transition-colors flex items-center gap-1 font-mono"
                >
                  <Plus className="w-3 h-3" />
                  <span>Spawn</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
