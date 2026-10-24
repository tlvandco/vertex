import React, { useState } from 'react';
import {
  Sparkles,
  X,
  Building,
  CheckCircle2,
  Sliders,
  Maximize2,
  Layers,
  ArrowRight,
  Compass,
  FileCode
} from 'lucide-react';
import { StudioElement } from './types';
import { useApp } from '../../context/AppContext';

interface LayoutGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyLayout: (
    elements: StudioElement[],
    widthFt: number,
    lengthFt: number,
    ceilingHeightFt: number,
    layoutTitle: string
  ) => void;
}

interface LayoutArchetype {
  id: string;
  name: string;
  category: 'RESIDENTIAL' | 'COMMERCIAL' | 'HOSPITALITY';
  description: string;
  defaultWidthFt: number;
  defaultLengthFt: number;
  defaultCeilingFt: number;
  estimatedCost: string;
  generateElements: (w: number, l: number, h: number) => StudioElement[];
}

export const LayoutGeneratorModal: React.FC<LayoutGeneratorModalProps> = ({
  isOpen,
  onClose,
  onApplyLayout
}) => {
  const { addToast } = useApp();

  const [selectedArchetypeId, setSelectedArchetypeId] = useState<string>('penthouse');
  const [targetWidthFt, setTargetWidthFt] = useState<number>(36);
  const [targetLengthFt, setTargetLengthFt] = useState<number>(28);
  const [ceilingHeightFt, setCeilingHeightFt] = useState<number>(11);
  const [furnishLevel, setFurnishLevel] = useState<'FULL' | 'MINIMAL' | 'SHELL'>('FULL');

  if (!isOpen) return null;

  const ARCHETYPES: LayoutArchetype[] = [
    {
      id: 'penthouse',
      name: 'Ultra-Luxury Penthouse Salon & Suite',
      category: 'RESIDENTIAL',
      description: 'Expansive open salon with integrated bio-ethanol fireplace, marble dining gallery, master retreat with en-suite bath, and floor-to-ceiling curtain glazing.',
      defaultWidthFt: 36,
      defaultLengthFt: 28,
      defaultCeilingFt: 11,
      estimatedCost: '$165,000 - $240,000',
      generateElements: (w, l, h) => {
        const elems: StudioElement[] = [
          // Perimeter Walls
          {
            id: 'wall-n',
            name: 'North Perimeter Wall',
            type: 'WALL',
            layer: 'architecture',
            x: w / 2,
            y: 0.25,
            z: 0,
            width: w,
            length: 0.5,
            height: h,
            rotation: 0,
            isWallSegment: true,
            color: '#E8E5DF',
            materialName: 'Venetian Plaster',
            materialType: 'plaster',
            lrv: 74,
            cost: 4800
          },
          {
            id: 'wall-s',
            name: 'South Perimeter Wall',
            type: 'WALL',
            layer: 'architecture',
            x: w / 2,
            y: l - 0.25,
            z: 0,
            width: w,
            length: 0.5,
            height: h,
            rotation: 0,
            isWallSegment: true,
            color: '#E8E5DF',
            materialName: 'Venetian Plaster',
            materialType: 'plaster',
            lrv: 74,
            cost: 4800
          },
          {
            id: 'wall-w',
            name: 'West Perimeter Wall',
            type: 'WALL',
            layer: 'architecture',
            x: 0.25,
            y: l / 2,
            z: 0,
            width: 0.5,
            length: l,
            height: h,
            rotation: 0,
            isWallSegment: true,
            color: '#E8E5DF',
            materialName: 'Venetian Plaster',
            materialType: 'plaster',
            lrv: 74,
            cost: 3800
          },
          {
            id: 'wall-e-glass',
            name: 'East Curtain Wall Glazing',
            type: 'WALL',
            layer: 'architecture',
            x: w - 0.25,
            y: l / 2,
            z: 0,
            width: 0.5,
            length: l,
            height: h,
            rotation: 0,
            isWallSegment: true,
            color: '#B0C4DE',
            materialName: 'Low-E Insulated Architectural Glazing',
            materialType: 'glass',
            lrv: 85,
            cost: 14200
          },

          // Interior Partition Wall
          {
            id: 'wall-partition-1',
            name: 'Master Suite Slatted Partition',
            type: 'WALL',
            layer: 'architecture',
            x: w * 0.62,
            y: l * 0.4,
            z: 0,
            width: 0.5,
            length: l * 0.75,
            height: h,
            rotation: 0,
            isWallSegment: true,
            color: '#3B332A',
            materialName: 'Smoked Quarter-Sawn Oak Slats',
            materialType: 'oak',
            lrv: 25,
            cost: 6500
          },

          // Architectural Pivot Door
          {
            id: 'door-suite',
            name: 'Flush Smoked Oak Pivot Door',
            type: 'DOOR',
            layer: 'architecture',
            x: w * 0.62,
            y: l * 0.85,
            z: 0,
            width: 3.5,
            length: 0.5,
            height: 9.5,
            rotation: 0,
            color: '#2C2416',
            materialName: 'Smoked Oak',
            materialType: 'oak',
            lrv: 20,
            cost: 3400,
            clearanceRadiusFt: 3.5
          },

          // Structural Feature Column
          {
            id: 'col-feature',
            name: 'Fair-Faced Concrete Column',
            type: 'COLUMN',
            layer: 'structure',
            x: w * 0.35,
            y: l * 0.5,
            z: 0,
            width: 1.5,
            length: 1.5,
            height: h,
            rotation: 0,
            color: '#9E9A92',
            materialName: 'Fair-Faced Architectural Concrete',
            materialType: 'concrete',
            lrv: 45,
            cost: 2400
          }
        ];

        // Furnishings (if not bare shell)
        if (furnishLevel !== 'SHELL') {
          elems.push(
            {
              id: 'furn-sofa',
              name: 'Modular Italian Sectional Sofa',
              type: 'FURNITURE',
              furnitureCategory: 'SOFA',
              layer: 'furniture',
              x: w * 0.28,
              y: l * 0.32,
              z: 0,
              width: 12,
              length: 5,
              height: 2.6,
              rotation: 0,
              color: '#DDD7CC',
              materialName: 'Bouclé Textile',
              materialType: 'boucle',
              lrv: 68,
              cost: 17500,
              vendor: 'Minotti Milan',
              clearanceRadiusFt: 3.0
            },
            {
              id: 'furn-cocktail',
              name: 'Navona Travertine Plinth Table',
              type: 'FURNITURE',
              furnitureCategory: 'COFFEE_TABLE',
              layer: 'furniture',
              x: w * 0.28,
              y: l * 0.52,
              z: 0,
              width: 6,
              length: 3.5,
              height: 1.2,
              rotation: 0,
              color: '#D4CBB8',
              materialName: 'Navona Travertine',
              materialType: 'travertine',
              lrv: 55,
              cost: 7200,
              vendor: 'Salvatori Tuscany'
            },
            {
              id: 'furn-dining',
              name: 'Calacatta Marble Dining Table',
              type: 'FURNITURE',
              furnitureCategory: 'DINING_TABLE',
              layer: 'furniture',
              x: w * 0.82,
              y: l * 0.35,
              z: 0,
              width: 9,
              length: 4.5,
              height: 2.5,
              rotation: 90,
              color: '#F5F5F3',
              materialName: 'Calacatta Marble',
              materialType: 'marble',
              lrv: 82,
              cost: 15400,
              vendor: 'Antolini Italy',
              clearanceRadiusFt: 3.5
            },
            {
              id: 'furn-credenza',
              name: 'Architectural AV Credenza Wall',
              type: 'FURNITURE',
              furnitureCategory: 'CREDENZA',
              layer: 'furniture',
              x: w * 0.28,
              y: l - 1.5,
              z: 0.5,
              width: 14,
              length: 2,
              height: 2.2,
              rotation: 0,
              color: '#2A231C',
              materialName: 'Ebonized Oak',
              materialType: 'oak',
              lrv: 15,
              cost: 8900
            },
            {
              id: 'furn-chandelier',
              name: 'Burnished Brass Linear Pendant',
              type: 'FURNITURE',
              furnitureCategory: 'LAMP',
              layer: 'furniture',
              x: w * 0.82,
              y: l * 0.35,
              z: h - 3,
              width: 7,
              length: 1.5,
              height: 1,
              rotation: 90,
              color: '#C5A059',
              materialName: 'Burnished Brass',
              materialType: 'bronze',
              lrv: 58,
              cost: 5800
            }
          );
        }

        return elems;
      }
    },
    {
      id: 'residence',
      name: 'Modern Open-Plan Residence (Great Room & Island)',
      category: 'RESIDENTIAL',
      description: 'Unified family great room centering a massive monolithic kitchen waterfall island, living salon with fireplace, and dining alcove.',
      defaultWidthFt: 40,
      defaultLengthFt: 30,
      defaultCeilingFt: 10.5,
      estimatedCost: '$135,000 - $190,000',
      generateElements: (w, l, h) => {
        const elems: StudioElement[] = [
          // Perimeter Walls
          {
            id: 'res-wall-n',
            name: 'North Wall',
            type: 'WALL',
            layer: 'architecture',
            x: w / 2,
            y: 0.25,
            z: 0,
            width: w,
            length: 0.5,
            height: h,
            rotation: 0,
            isWallSegment: true,
            color: '#EFECE6',
            materialName: 'Chalk White Mineral Paint',
            materialType: 'plaster',
            lrv: 80,
            cost: 5000
          },
          {
            id: 'res-wall-s',
            name: 'South Wall',
            type: 'WALL',
            layer: 'architecture',
            x: w / 2,
            y: l - 0.25,
            z: 0,
            width: w,
            length: 0.5,
            height: h,
            rotation: 0,
            isWallSegment: true,
            color: '#EFECE6',
            materialName: 'Chalk White Mineral Paint',
            materialType: 'plaster',
            lrv: 80,
            cost: 5000
          },
          {
            id: 'res-wall-w',
            name: 'West Wall with Window',
            type: 'WALL',
            layer: 'architecture',
            x: 0.25,
            y: l / 2,
            z: 0,
            width: 0.5,
            length: l,
            height: h,
            rotation: 0,
            isWallSegment: true,
            color: '#EFECE6',
            materialName: 'Chalk White Mineral Paint',
            materialType: 'plaster',
            lrv: 80,
            cost: 4200
          },
          {
            id: 'res-wall-e',
            name: 'East Terrace Sliders',
            type: 'WALL',
            layer: 'architecture',
            x: w - 0.25,
            y: l / 2,
            z: 0,
            width: 0.5,
            length: l,
            height: h,
            rotation: 0,
            isWallSegment: true,
            color: '#87CEEB',
            materialName: 'Aluminum Sliding Glass Sliders',
            materialType: 'glass',
            lrv: 88,
            cost: 11000
          },

          // Monolithic Kitchen Waterfall Island
          {
            id: 'res-kitchen-island',
            name: 'Calacatta Honed Kitchen Waterfall Island',
            type: 'FURNITURE',
            furnitureCategory: 'KITCHEN_ISLAND',
            layer: 'furniture',
            x: w * 0.72,
            y: l * 0.45,
            z: 0,
            width: 12,
            length: 4.5,
            height: 3.0,
            rotation: 90,
            color: '#F4F3EF',
            materialName: 'Calacatta Honed Marble',
            materialType: 'marble',
            lrv: 82,
            cost: 21000,
            vendor: 'Boffi Milan',
            clearanceRadiusFt: 4.0
          },
          {
            id: 'res-sofa',
            name: 'Custom Deep Upholstered L-Sofa',
            type: 'FURNITURE',
            furnitureCategory: 'SOFA',
            layer: 'furniture',
            x: w * 0.28,
            y: l * 0.45,
            z: 0,
            width: 13,
            length: 6,
            height: 2.7,
            rotation: 0,
            color: '#D8D1C5',
            materialName: 'Belgian Linen Bouclé',
            materialType: 'boucle',
            lrv: 65,
            cost: 14500,
            clearanceRadiusFt: 3.0
          },
          {
            id: 'res-dining',
            name: 'Solid White Oak Dining Table',
            type: 'FURNITURE',
            furnitureCategory: 'DINING_TABLE',
            layer: 'furniture',
            x: w * 0.28,
            y: l * 0.82,
            z: 0,
            width: 9.5,
            length: 4.0,
            height: 2.5,
            rotation: 0,
            color: '#8B7355',
            materialName: 'Quarter-Sawn White Oak',
            materialType: 'oak',
            lrv: 36,
            cost: 7800,
            clearanceRadiusFt: 3.5
          }
        ];
        return elems;
      }
    },
    {
      id: 'tech-office',
      name: 'Creative Agency / Executive Tech Suite',
      category: 'COMMERCIAL',
      description: 'Acoustic glass boardroom, open agile desking zone, private telephone booths, and lounge hospitality bar for high-performance creative firms.',
      defaultWidthFt: 42,
      defaultLengthFt: 32,
      defaultCeilingFt: 12,
      estimatedCost: '$180,000 - $260,000',
      generateElements: (w, l, h) => {
        const elems: StudioElement[] = [
          // Perimeter Walls
          {
            id: 'off-wall-n',
            name: 'North Core Wall',
            type: 'WALL',
            layer: 'architecture',
            x: w / 2,
            y: 0.25,
            z: 0,
            width: w,
            length: 0.5,
            height: h,
            rotation: 0,
            isWallSegment: true,
            color: '#D3CFCA',
            materialName: 'Architectural Microcement',
            materialType: 'plaster',
            lrv: 62,
            cost: 5400
          },
          {
            id: 'off-wall-s',
            name: 'South Curtain Wall',
            type: 'WALL',
            layer: 'architecture',
            x: w / 2,
            y: l - 0.25,
            z: 0,
            width: w,
            length: 0.5,
            height: h,
            rotation: 0,
            isWallSegment: true,
            color: '#B0C4DE',
            materialName: 'Acoustic Double Glazed Curtain Wall',
            materialType: 'glass',
            lrv: 85,
            cost: 15500
          },
          {
            id: 'off-wall-w',
            name: 'West Wall',
            type: 'WALL',
            layer: 'architecture',
            x: 0.25,
            y: l / 2,
            z: 0,
            width: 0.5,
            length: l,
            height: h,
            rotation: 0,
            isWallSegment: true,
            color: '#D3CFCA',
            materialName: 'Microcement',
            materialType: 'plaster',
            lrv: 62,
            cost: 4400
          },
          {
            id: 'off-wall-e',
            name: 'East Wall',
            type: 'WALL',
            layer: 'architecture',
            x: w - 0.25,
            y: l / 2,
            z: 0,
            width: 0.5,
            length: l,
            height: h,
            rotation: 0,
            isWallSegment: true,
            color: '#D3CFCA',
            materialName: 'Microcement',
            materialType: 'plaster',
            lrv: 62,
            cost: 4400
          },

          // Acoustic Glass Boardroom Enclosure
          {
            id: 'off-boardroom-wall',
            name: 'Acoustic Glazed Boardroom Wall',
            type: 'WALL',
            layer: 'architecture',
            x: w * 0.35,
            y: l * 0.32,
            z: 0,
            width: 0.5,
            length: l * 0.6,
            height: h,
            rotation: 0,
            isWallSegment: true,
            color: '#87CEEB',
            materialName: 'STC 48 Acoustic Demountable Glazing',
            materialType: 'glass',
            lrv: 88,
            cost: 9800
          },
          {
            id: 'off-boardroom-door',
            name: 'Acoustic Glass Sliding Door',
            type: 'DOOR',
            layer: 'architecture',
            x: w * 0.35,
            y: l * 0.6,
            z: 0,
            width: 3.5,
            length: 0.5,
            height: 9,
            rotation: 0,
            color: '#2C2416',
            materialName: 'Black Anodized Aluminum',
            materialType: 'bronze',
            lrv: 25,
            cost: 3200,
            clearanceRadiusFt: 3.5
          },

          // Conference Table
          {
            id: 'off-conf-table',
            name: '12-Person Executive Boat Conference Table',
            type: 'FURNITURE',
            furnitureCategory: 'DINING_TABLE',
            layer: 'furniture',
            x: w * 0.18,
            y: l * 0.32,
            z: 0,
            width: 14,
            length: 5,
            height: 2.5,
            rotation: 90,
            color: '#3B3228',
            materialName: 'American Black Walnut & Integrated Power',
            materialType: 'walnut',
            lrv: 22,
            cost: 16800,
            vendor: 'Poltrona Frau',
            clearanceRadiusFt: 3.5
          },

          // Agile Desking Workbench
          {
            id: 'off-desking-1',
            name: 'Dual Agile Linear Workstation Pod',
            type: 'FURNITURE',
            furnitureCategory: 'DESK',
            layer: 'furniture',
            x: w * 0.68,
            y: l * 0.35,
            z: 0,
            width: 14,
            length: 5,
            height: 2.5,
            rotation: 0,
            color: '#ECE9E2',
            materialName: 'Forbo Linoleum & White Oak',
            materialType: 'oak',
            lrv: 70,
            cost: 11200,
            vendor: 'Vitra Switzerland',
            clearanceRadiusFt: 3.0
          },
          {
            id: 'off-desking-2',
            name: 'Dual Agile Linear Workstation Pod B',
            type: 'FURNITURE',
            furnitureCategory: 'DESK',
            layer: 'furniture',
            x: w * 0.68,
            y: l * 0.72,
            z: 0,
            width: 14,
            length: 5,
            height: 2.5,
            rotation: 0,
            color: '#ECE9E2',
            materialName: 'Forbo Linoleum & White Oak',
            materialType: 'oak',
            lrv: 70,
            cost: 11200,
            vendor: 'Vitra Switzerland',
            clearanceRadiusFt: 3.0
          }
        ];
        return elems;
      }
    }
  ];

  const activeArchetype = ARCHETYPES.find(a => a.id === selectedArchetypeId) || ARCHETYPES[0];

  const handleSelectArchetype = (arch: LayoutArchetype) => {
    setSelectedArchetypeId(arch.id);
    setTargetWidthFt(arch.defaultWidthFt);
    setTargetLengthFt(arch.defaultLengthFt);
    setCeilingHeightFt(arch.defaultCeilingFt);
  };

  const handleGenerate = () => {
    const generated = activeArchetype.generateElements(targetWidthFt, targetLengthFt, ceilingHeightFt);
    onApplyLayout(generated, targetWidthFt, targetLengthFt, ceilingHeightFt, activeArchetype.name);
    addToast('success', `Generated architectural layout: ${activeArchetype.name}`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in-50 duration-200">
      <div className="bg-white max-w-3xl w-full rounded-3xl border border-gray-200 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-[#2C2416] p-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#D4AF37]/20 border border-[#D4AF37]/40 flex items-center justify-center text-[#D4AF37]">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-base text-white">
                Algorithmic Architectural Layout Generator
              </h3>
              <p className="text-xs text-gray-300">
                Synthesize code-compliant 2D/3D spaces, perimeter envelopes, and curated FF&E schemes in seconds.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full text-gray-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs">
          {/* Step 1: Select Spatial Archetype */}
          <div>
            <label className="font-semibold text-gray-800 block mb-2 text-xs uppercase tracking-wider">
              1. Select Spatial Archetype
            </label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {ARCHETYPES.map(arch => {
                const isSelected = arch.id === selectedArchetypeId;
                return (
                  <div
                    key={arch.id}
                    onClick={() => handleSelectArchetype(arch)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer space-y-2 relative ${
                      isSelected
                        ? 'border-[#D4AF37] bg-amber-50/50 shadow-md ring-1 ring-[#D4AF37]'
                        : 'border-gray-200 hover:border-gray-300 bg-gray-50/60'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-gray-200/80 text-gray-700 font-bold">
                        {arch.category}
                      </span>
                      {isSelected && <CheckCircle2 className="w-4 h-4 text-[#D4AF37]" />}
                    </div>

                    <h4 className="font-serif font-bold text-gray-900 text-sm leading-snug">
                      {arch.name}
                    </h4>

                    <p className="text-[11px] text-gray-500 line-clamp-3 leading-relaxed">
                      {arch.description}
                    </p>

                    <div className="pt-2 border-t border-gray-200/80 flex items-center justify-between font-mono text-[10px] text-gray-600">
                      <span>{arch.defaultWidthFt}' × {arch.defaultLengthFt}'</span>
                      <span className="font-bold text-[#8B7355]">{arch.estimatedCost}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Step 2: Parametric Dimensional Constraints */}
          <div className="p-5 bg-gray-50 rounded-2xl border border-gray-200/80 space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-gray-200">
              <Sliders className="w-4 h-4 text-[#D4AF37]" />
              <h5 className="font-bold text-gray-900 text-xs uppercase tracking-wider">
                2. Spatial & Volumetric Dimensions
              </h5>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="font-semibold text-gray-700 block mb-1">
                  Enclosure Length (ft)
                </label>
                <input
                  type="number"
                  min="20"
                  max="100"
                  value={targetWidthFt}
                  onChange={e => setTargetWidthFt(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl font-mono text-xs font-bold"
                />
                <span className="text-[10px] text-gray-400 block mt-0.5">X Axis</span>
              </div>

              <div>
                <label className="font-semibold text-gray-700 block mb-1">
                  Enclosure Width (ft)
                </label>
                <input
                  type="number"
                  min="16"
                  max="80"
                  value={targetLengthFt}
                  onChange={e => setTargetLengthFt(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl font-mono text-xs font-bold"
                />
                <span className="text-[10px] text-gray-400 block mt-0.5">Y Axis</span>
              </div>

              <div>
                <label className="font-semibold text-gray-700 block mb-1">
                  Finished Ceiling Height (ft)
                </label>
                <input
                  type="number"
                  step="0.5"
                  min="8"
                  max="24"
                  value={ceilingHeightFt}
                  onChange={e => setCeilingHeightFt(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl font-mono text-xs font-bold"
                />
                <span className="text-[10px] text-gray-400 block mt-0.5">Z Axis Elevation</span>
              </div>
            </div>

            {/* Total Area Stamp */}
            <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-gray-200 font-mono text-xs text-gray-700">
              <span>Gross Spatial Footprint:</span>
              <strong className="text-gray-900 font-bold">
                {targetWidthFt * targetLengthFt} sq.ft ({Math.round(targetWidthFt * targetLengthFt * 0.0929)} m²)
              </strong>
            </div>
          </div>

          {/* Step 3: Furnish & Specification Level */}
          <div>
            <label className="font-semibold text-gray-800 block mb-2 text-xs uppercase tracking-wider">
              3. Furnishing & Specification Level
            </label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { id: 'FULL', label: 'Turnkey Furnished', desc: 'Walls + Doors + High-End FF&E Matrix' },
                { id: 'MINIMAL', label: 'Architectural Zoning', desc: 'Walls + Doors + Key Feature Anchor Pieces' },
                { id: 'SHELL', label: 'Warm Core Shell', desc: 'Perimeter Walls + Curtain Glazing Only' }
              ].map(lvl => (
                <button
                  key={lvl.id}
                  type="button"
                  onClick={() => setFurnishLevel(lvl.id as any)}
                  className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                    furnishLevel === lvl.id
                      ? 'border-[#D4AF37] bg-amber-50/50 ring-1 ring-[#D4AF37]'
                      : 'border-gray-200 bg-gray-50/40 hover:bg-gray-100'
                  }`}
                >
                  <span className="font-bold text-gray-900 block text-xs">{lvl.label}</span>
                  <span className="text-[10px] text-gray-500 block mt-0.5">{lvl.desc}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="bg-gray-50 p-4 border-t border-gray-200 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-gray-600 hover:text-gray-900 cursor-pointer"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleGenerate}
            className="px-6 py-2.5 bg-[#2C2416] hover:bg-black text-[#D4AF37] font-bold text-xs rounded-xl shadow-lg flex items-center gap-2 cursor-pointer transition-all"
          >
            <Sparkles className="w-4 h-4 text-[#D4AF37]" />
            <span>Generate & Populate Workspace</span>
          </button>
        </div>
      </div>
    </div>
  );
};
