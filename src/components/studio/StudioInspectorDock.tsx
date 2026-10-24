import React, { useState } from 'react';
import { StudioElement, StudioMaterialType } from './types';
import { EngineeringConfig } from '../tools/types';
import {
  Sliders,
  RotateCw,
  Trash2,
  Copy,
  Eye,
  Box,
  Layers,
  Sparkles,
  Lock,
  Unlock,
  Move,
  Maximize2,
  Palette,
  Sun,
  Grid,
  Trees,
  Plus,
  RefreshCw,
  Compass,
  ArrowRight
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface StudioInspectorDockProps {
  selectedElement: StudioElement | undefined;
  elements: StudioElement[];
  onUpdateElement: (id: string, updates: Partial<StudioElement>) => void;
  onDeleteElement: (id: string) => void;
  onSelectElement: (id: string | null) => void;
  onAddElement: (elem: StudioElement) => void;
  config: EngineeringConfig;
  roomLengthFt: number;
  setRoomLengthFt: (val: number) => void;
  roomWidthFt: number;
  setRoomWidthFt: (val: number) => void;
  ceilingHeightFt: number;
  setCeilingHeightFt: (val: number) => void;
  activeLayers: {
    architecture: boolean;
    structure: boolean;
    furniture: boolean;
    annotation: boolean;
  };
  setActiveLayers: React.Dispatch<
    React.SetStateAction<{
      architecture: boolean;
      structure: boolean;
      furniture: boolean;
      annotation: boolean;
    }>
  >;
  onOpenCreationPalette: () => void;
  isMaximized: boolean;
}

export const StudioInspectorDock: React.FC<StudioInspectorDockProps> = ({
  selectedElement,
  elements,
  onUpdateElement,
  onDeleteElement,
  onSelectElement,
  onAddElement,
  config,
  roomLengthFt,
  setRoomLengthFt,
  roomWidthFt,
  setRoomWidthFt,
  ceilingHeightFt,
  setCeilingHeightFt,
  activeLayers,
  setActiveLayers,
  onOpenCreationPalette,
  isMaximized
}) => {
  const { addToast } = useApp();
  const [activeTab, setActiveTab] = useState<'TRANSFORM' | 'SHADING' | 'OUTLINER' | 'ENVIRONMENT'>('TRANSFORM');

  // Array Tool State
  const [arrayCount, setArrayCount] = useState<number>(3);
  const [arraySpacingFt, setArraySpacingFt] = useState<number>(4.0);
  const [arrayAxis, setArrayAxis] = useState<'X' | 'Y'>('X');

  // Handle Exact Angle Rotation
  const handleSetExactAngle = (angle: number) => {
    if (!selectedElement) return;
    const normalized = Math.round((((angle % 360) + 360) % 360) * 10) / 10;
    onUpdateElement(selectedElement.id, { rotation: normalized });
  };

  // Handle Nudging Angle
  const handleNudgeAngle = (delta: number) => {
    if (!selectedElement) return;
    handleSetExactAngle(selectedElement.rotation + delta);
  };

  // Handle Linear Array Multiplier
  const handleSpawnArray = () => {
    if (!selectedElement) return;
    for (let i = 1; i <= arrayCount; i++) {
      const copy: StudioElement = {
        ...selectedElement,
        id: `${selectedElement.type.toLowerCase()}-arr-${Date.now()}-${i}`,
        name: `${selectedElement.name} (Array ${i})`,
        x: arrayAxis === 'X' ? selectedElement.x + arraySpacingFt * i : selectedElement.x,
        y: arrayAxis === 'Y' ? selectedElement.y + arraySpacingFt * i : selectedElement.y
      };
      onAddElement(copy);
    }
    addToast('success', `Created ${arrayCount} array duplicates spaced by ${arraySpacingFt}ft`);
  };

  return (
    <div className={`bg-[#1C1A17] text-white border border-[#3A332A] rounded-3xl shadow-xl overflow-hidden flex flex-col ${isMaximized ? 'h-full' : ''}`}>
      {/* Blender-style Top Tab Navigation */}
      <div className="flex items-center border-b border-[#2C2416] bg-[#24201A] p-1 gap-1">
        {[
          { id: 'TRANSFORM' as const, label: 'Transform' },
          { id: 'SHADING' as const, label: 'Materials & Colors' },
          { id: 'OUTLINER' as const, label: `Outliner (${elements.length})` },
          { id: 'ENVIRONMENT' as const, label: 'Site / Bounds' }
        ].map(tab => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 py-2 text-center text-xs font-semibold rounded-xl transition-all cursor-pointer truncate px-1.5 ${
              activeTab === tab.id
                ? 'bg-[#D4AF37] text-black font-bold shadow-md'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-5 space-y-5 text-xs">
        {/* TAB 1: TRANSFORM & GAPS & PRECISION ROTATION */}
        {activeTab === 'TRANSFORM' && (
          <>
            {selectedElement ? (
              <div className="space-y-4">
                {/* Identification & Lock */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex-1">
                    <span className="text-[10px] uppercase font-mono tracking-wider text-gray-500 block mb-1">
                      Element Title & Type
                    </span>
                    <input
                      type="text"
                      value={selectedElement.name}
                      onChange={e => onUpdateElement(selectedElement.id, { name: e.target.value })}
                      className="w-full px-3 py-1.5 bg-[#26221D] border border-[#3A332A] rounded-xl font-semibold text-white focus:outline-none focus:border-[#D4AF37]"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => onUpdateElement(selectedElement.id, { isLocked: !selectedElement.isLocked })}
                    className={`mt-4 p-2 rounded-xl border transition-all cursor-pointer ${
                      selectedElement.isLocked
                        ? 'bg-amber-500/20 text-[#D4AF37] border-amber-500/40'
                        : 'bg-[#26221D] text-gray-400 border-[#3A332A] hover:text-white'
                    }`}
                    title={selectedElement.isLocked ? 'Unlock Element' : 'Lock Element'}
                  >
                    {selectedElement.isLocked ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                  </button>
                </div>

                {/* Exact Rotation to Specific Angles */}
                <div className="bg-[#24201A] p-3.5 rounded-2xl border border-[#3A332A] space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] uppercase font-mono tracking-wider text-[#D4AF37] font-bold">
                      Rotation to Specific Angles (AutoCAD / Blender)
                    </label>
                    <div className="flex items-center gap-1 font-mono">
                      <input
                        type="number"
                        step="0.5"
                        value={selectedElement.rotation}
                        onChange={e => handleSetExactAngle(Number(e.target.value))}
                        className="w-16 px-1.5 py-0.5 bg-[#1C1A17] border border-[#3A332A] rounded text-right font-bold text-white text-xs"
                      />
                      <span className="text-gray-400">°</span>
                    </div>
                  </div>

                  {/* Continuous Range Slider */}
                  <input
                    type="range"
                    min="0"
                    max="360"
                    step="1"
                    value={selectedElement.rotation}
                    onChange={e => handleSetExactAngle(Number(e.target.value))}
                    className="w-full accent-[#D4AF37]"
                  />

                  {/* Quick Specific Angle Preset Buttons */}
                  <div className="grid grid-cols-4 gap-1.5 font-mono text-[11px]">
                    {[
                      { angle: 0, label: '0° North' },
                      { angle: 45, label: '45° Miter' },
                      { angle: 90, label: '90° East' },
                      { angle: 135, label: '135°' },
                      { angle: 180, label: '180° South' },
                      { angle: 225, label: '225°' },
                      { angle: 270, label: '270° West' },
                      { angle: (selectedElement.rotation + 180) % 360, label: 'Flip 180°' }
                    ].map(p => (
                      <button
                        key={p.label}
                        type="button"
                        onClick={() => handleSetExactAngle(p.angle)}
                        className={`py-1 rounded-lg border text-center transition-all cursor-pointer ${
                          Math.abs(selectedElement.rotation - p.angle) < 0.1
                            ? 'bg-[#D4AF37] text-black font-bold border-[#D4AF37]'
                            : 'bg-[#1C1A17] text-gray-300 hover:text-white border-[#3A332A]'
                        }`}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>

                  {/* Micro Angle Nudge Stepper */}
                  <div className="flex items-center justify-between pt-1 text-[11px] font-mono text-gray-400">
                    <span>Nudge:</span>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleNudgeAngle(-15)}
                        className="px-2 py-0.5 bg-[#1C1A17] hover:bg-white/10 rounded border border-[#3A332A] cursor-pointer"
                      >
                        -15°
                      </button>
                      <button
                        type="button"
                        onClick={() => handleNudgeAngle(-1)}
                        className="px-2 py-0.5 bg-[#1C1A17] hover:bg-white/10 rounded border border-[#3A332A] cursor-pointer"
                      >
                        -1°
                      </button>
                      <button
                        type="button"
                        onClick={() => handleNudgeAngle(+1)}
                        className="px-2 py-0.5 bg-[#1C1A17] hover:bg-white/10 rounded border border-[#3A332A] cursor-pointer"
                      >
                        +1°
                      </button>
                      <button
                        type="button"
                        onClick={() => handleNudgeAngle(+15)}
                        className="px-2 py-0.5 bg-[#1C1A17] hover:bg-white/10 rounded border border-[#3A332A] cursor-pointer"
                      >
                        +15°
                      </button>
                    </div>
                  </div>
                </div>

                {/* Spatial Coordinates X, Y, Z Elevation */}
                <div className="bg-[#24201A] p-3.5 rounded-2xl border border-[#3A332A] space-y-2">
                  <span className="text-[10px] uppercase font-mono tracking-wider text-gray-400 block mb-1">
                    Spatial World Location (CAD Coordinates in Feet)
                  </span>
                  <div className="grid grid-cols-3 gap-2 font-mono">
                    <div>
                      <label className="text-[10px] text-gray-500 block">X Pos (ft)</label>
                      <input
                        type="number"
                        step="0.5"
                        value={selectedElement.x}
                        onChange={e => onUpdateElement(selectedElement.id, { x: Number(e.target.value) })}
                        className="w-full px-2 py-1.5 bg-[#1C1A17] border border-[#3A332A] rounded-xl text-white font-bold"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-gray-500 block">Y Pos (ft)</label>
                      <input
                        type="number"
                        step="0.5"
                        value={selectedElement.y}
                        onChange={e => onUpdateElement(selectedElement.id, { y: Number(e.target.value) })}
                        className="w-full px-2 py-1.5 bg-[#1C1A17] border border-[#3A332A] rounded-xl text-white font-bold"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-gray-500 block">Z Elev (ft)</label>
                      <input
                        type="number"
                        step="0.5"
                        value={selectedElement.z}
                        onChange={e => onUpdateElement(selectedElement.id, { z: Number(e.target.value) })}
                        className="w-full px-2 py-1.5 bg-[#1C1A17] border border-[#3A332A] rounded-xl text-white font-bold"
                      />
                    </div>
                  </div>
                </div>

                {/* Bounding Dimensions (W, L, H) */}
                <div className="bg-[#24201A] p-3.5 rounded-2xl border border-[#3A332A] space-y-2">
                  <span className="text-[10px] uppercase font-mono tracking-wider text-gray-400 block mb-1">
                    Bounding Box Scale (Width × Length × Height)
                  </span>
                  <div className="grid grid-cols-3 gap-2 font-mono">
                    <div>
                      <label className="text-[10px] text-gray-500 block">Width (ft)</label>
                      <input
                        type="number"
                        step="0.5"
                        value={selectedElement.width}
                        onChange={e => onUpdateElement(selectedElement.id, { width: Math.max(0.5, Number(e.target.value)) })}
                        className="w-full px-2 py-1.5 bg-[#1C1A17] border border-[#3A332A] rounded-xl text-white font-bold"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-gray-500 block">Length (ft)</label>
                      <input
                        type="number"
                        step="0.5"
                        value={selectedElement.length}
                        onChange={e => onUpdateElement(selectedElement.id, { length: Math.max(0.5, Number(e.target.value)) })}
                        className="w-full px-2 py-1.5 bg-[#1C1A17] border border-[#3A332A] rounded-xl text-white font-bold"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-gray-500 block">Height (ft)</label>
                      <input
                        type="number"
                        step="0.5"
                        value={selectedElement.height}
                        onChange={e => onUpdateElement(selectedElement.id, { height: Math.max(0.5, Number(e.target.value)) })}
                        className="w-full px-2 py-1.5 bg-[#1C1A17] border border-[#3A332A] rounded-xl text-white font-bold"
                      />
                    </div>
                  </div>
                </div>

                {/* Gaps, Margins & Offsets (AutoCAD & Blender Style) */}
                <div className="bg-[#24201A] p-3.5 rounded-2xl border border-[#3A332A] space-y-3">
                  <span className="text-[10px] uppercase font-mono tracking-wider text-[#D4AF37] font-bold block">
                    Gaps, Clearances & Array Spacing
                  </span>

                  <div className="grid grid-cols-2 gap-2 font-mono">
                    <div>
                      <label className="text-[10px] text-gray-400 block">Wall Clearance / Gap (ft)</label>
                      <input
                        type="number"
                        step="0.5"
                        value={selectedElement.gapOffsetFt || 0}
                        onChange={e => onUpdateElement(selectedElement.id, { gapOffsetFt: Number(e.target.value) })}
                        className="w-full px-2 py-1.5 bg-[#1C1A17] border border-[#3A332A] rounded-xl text-white"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-gray-400 block">Shadowline Reveal (in)</label>
                      <input
                        type="number"
                        step="0.25"
                        value={selectedElement.revealGapInches || 0.5}
                        onChange={e => onUpdateElement(selectedElement.id, { revealGapInches: Number(e.target.value) })}
                        className="w-full px-2 py-1.5 bg-[#1C1A17] border border-[#3A332A] rounded-xl text-white"
                      />
                    </div>
                  </div>

                  {/* Linear Array Multiplier Tool */}
                  <div className="pt-2 border-t border-white/5 space-y-2">
                    <span className="text-[10px] uppercase font-mono text-gray-400 block">
                      Linear Array Generator (AutoCAD Array)
                    </span>
                    <div className="grid grid-cols-3 gap-1.5 font-mono">
                      <div>
                        <label className="text-[9px] text-gray-500">Count</label>
                        <input
                          type="number"
                          min="1"
                          max="8"
                          value={arrayCount}
                          onChange={e => setArrayCount(Number(e.target.value))}
                          className="w-full px-1.5 py-1 bg-[#1C1A17] border border-[#3A332A] rounded-lg text-white"
                        />
                      </div>
                      <div>
                        <label className="text-[9px] text-gray-500">Spacing (ft)</label>
                        <input
                          type="number"
                          step="1"
                          value={arraySpacingFt}
                          onChange={e => setArraySpacingFt(Number(e.target.value))}
                          className="w-full px-1.5 py-1 bg-[#1C1A17] border border-[#3A332A] rounded-lg text-white"
                        />
                      </div>
                      <div>
                        <label className="text-[9px] text-gray-500">Axis</label>
                        <select
                          value={arrayAxis}
                          onChange={e => setArrayAxis(e.target.value as any)}
                          className="w-full px-1.5 py-1 bg-[#1C1A17] border border-[#3A332A] rounded-lg text-white"
                        >
                          <option value="X">X Axis</option>
                          <option value="Y">Y Axis</option>
                        </select>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleSpawnArray}
                      className="w-full py-1.5 bg-white/10 hover:bg-[#D4AF37] hover:text-black text-gray-200 font-bold rounded-xl transition-all cursor-pointer font-mono text-[11px]"
                    >
                      + Spawn Array Duplicates
                    </button>
                  </div>
                </div>

                {/* Delete Button */}
                <button
                  type="button"
                  onClick={() => onDeleteElement(selectedElement.id)}
                  className="w-full py-2 bg-red-950/40 hover:bg-red-900/60 text-red-300 font-bold rounded-xl border border-red-800/40 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete Element (Del)</span>
                </button>
              </div>
            ) : (
              <div className="py-12 text-center text-gray-500 space-y-3">
                <Box className="w-8 h-8 mx-auto text-gray-600" />
                <p className="font-serif text-gray-400">No Element Selected</p>
                <p className="text-[11px] text-gray-500 max-w-[220px] mx-auto leading-relaxed">
                  Click any object in the 2D CAD or 3D workspace, or spawn a new object below.
                </p>
                <button
                  type="button"
                  onClick={onOpenCreationPalette}
                  className="px-4 py-2 bg-[#D4AF37] text-black font-bold rounded-xl text-xs inline-flex items-center gap-1.5 shadow-md cursor-pointer hover:bg-amber-400 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add New Object / Mesh</span>
                </button>
              </div>
            )}
          </>
        )}

        {/* TAB 2: PBR SHADING & COLOR CONTROLS */}
        {activeTab === 'SHADING' && (
          <div className="space-y-4">
            {selectedElement ? (
              <div className="space-y-4">
                {/* Real-time Color Picker & Hex */}
                <div className="bg-[#24201A] p-3.5 rounded-2xl border border-[#3A332A] space-y-2">
                  <label className="text-[10px] uppercase font-mono tracking-wider text-gray-400 block">
                    Surface Color & Tint (Hex / RGB)
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={selectedElement.color || '#D4AF37'}
                      onChange={e => onUpdateElement(selectedElement.id, { color: e.target.value })}
                      className="w-10 h-10 rounded-xl cursor-pointer bg-transparent border-0"
                    />
                    <input
                      type="text"
                      value={selectedElement.color}
                      onChange={e => onUpdateElement(selectedElement.id, { color: e.target.value })}
                      className="flex-1 px-3 py-2 bg-[#1C1A17] border border-[#3A332A] rounded-xl font-mono text-white text-xs"
                      placeholder="#RRGGBB"
                    />
                  </div>
                </div>

                {/* Architectural Finish Presets */}
                <div className="bg-[#24201A] p-3.5 rounded-2xl border border-[#3A332A] space-y-2">
                  <label className="text-[10px] uppercase font-mono tracking-wider text-gray-400 block mb-1">
                    Material Preset & Architectural Cladding
                  </label>
                  <select
                    value={selectedElement.materialType}
                    onChange={e => onUpdateElement(selectedElement.id, { materialType: e.target.value as any })}
                    className="w-full px-3 py-2 bg-[#1C1A17] border border-[#3A332A] rounded-xl text-white font-medium focus:outline-none focus:border-[#D4AF37]"
                  >
                    <optgroup label="Interior Stones & Woods">
                      <option value="travertine">Navona Travertine</option>
                      <option value="marble">Calacatta Vagli Marble</option>
                      <option value="oak">Quarter-Sawn Smoked Oak</option>
                      <option value="walnut">American Black Walnut</option>
                      <option value="boucle">Loro Piana Wool Bouclé</option>
                      <option value="leather">Cognac Saddle Leather</option>
                    </optgroup>
                    <optgroup label="Metals & Plasters">
                      <option value="bronze">Patinated Bronze</option>
                      <option value="matte_black">Matte Black Anodized</option>
                      <option value="steel">Brushed Stainless Steel</option>
                      <option value="plaster">Venetian Navona Plaster</option>
                      <option value="concrete">Architectural Concrete</option>
                    </optgroup>
                    <optgroup label="Exterior & Specialty">
                      <option value="water">Crystalline Pool Water</option>
                      <option value="timber_deck">Ipe Hardwood Decking</option>
                      <option value="grass">Lawn & Specimen Foliage</option>
                      <option value="slate">Natural Slate Paving</option>
                      <option value="glass">Low-E Architectural Glazing</option>
                    </optgroup>
                  </select>
                </div>

                {/* PBR Shader Properties (Blender Style) */}
                <div className="bg-[#24201A] p-3.5 rounded-2xl border border-[#3A332A] space-y-3">
                  <span className="text-[10px] uppercase font-mono tracking-wider text-[#D4AF37] font-bold block">
                    PBR Shader Properties (Blender Engine)
                  </span>

                  {/* Roughness */}
                  <div>
                    <div className="flex justify-between items-center text-[10px] font-mono text-gray-400 mb-1">
                      <span>Roughness (Gloss 0 ↔ 1 Matte)</span>
                      <span className="text-white font-bold">{selectedElement.roughness ?? 0.5}</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.05"
                      value={selectedElement.roughness ?? 0.5}
                      onChange={e => onUpdateElement(selectedElement.id, { roughness: Number(e.target.value) })}
                      className="w-full accent-[#D4AF37]"
                    />
                  </div>

                  {/* Metalness */}
                  <div>
                    <div className="flex justify-between items-center text-[10px] font-mono text-gray-400 mb-1">
                      <span>Metalness (Dielectric 0 ↔ 1 Metallic)</span>
                      <span className="text-white font-bold">{selectedElement.metalness ?? 0.1}</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.05"
                      value={selectedElement.metalness ?? 0.1}
                      onChange={e => onUpdateElement(selectedElement.id, { metalness: Number(e.target.value) })}
                      className="w-full accent-[#D4AF37]"
                    />
                  </div>

                  {/* Opacity */}
                  <div>
                    <div className="flex justify-between items-center text-[10px] font-mono text-gray-400 mb-1">
                      <span>Opacity / Transmission</span>
                      <span className="text-white font-bold">{selectedElement.opacity ?? 1.0}</span>
                    </div>
                    <input
                      type="range"
                      min="0.1"
                      max="1"
                      step="0.05"
                      value={selectedElement.opacity ?? 1.0}
                      onChange={e => onUpdateElement(selectedElement.id, { opacity: Number(e.target.value) })}
                      className="w-full accent-[#D4AF37]"
                    />
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-center text-gray-500 py-8">Select an element to adjust material shader.</p>
            )}
          </div>
        )}

        {/* TAB 3: OUTLINER (BLENDER SCENE TREE) */}
        {activeTab === 'OUTLINER' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-white/5">
              <span className="text-[10px] uppercase font-mono tracking-wider text-gray-400">
                Scene Collection Elements ({elements.length})
              </span>
              <button
                type="button"
                onClick={onOpenCreationPalette}
                className="text-[10px] font-bold text-[#D4AF37] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3 h-3" />
                <span>Add Object</span>
              </button>
            </div>

            <div className="space-y-1.5 max-h-[480px] overflow-y-auto">
              {elements.map(el => {
                const isSelected = el.id === selectedElement?.id;
                return (
                  <div
                    key={el.id}
                    onClick={() => onSelectElement(el.id)}
                    className={`p-2.5 rounded-xl border flex items-center justify-between transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#D4AF37]/20 border-[#D4AF37] text-white font-bold'
                        : 'bg-[#24201A] border-[#3A332A] text-gray-300 hover:border-gray-500'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: el.color || '#D4AF37' }}
                      />
                      <span className="truncate text-xs">{el.name}</span>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 text-gray-400">
                      <span className="text-[9px] font-mono uppercase px-1.5 py-0.5 rounded bg-white/5">
                        {el.type}
                      </span>
                      {el.isLocked && <Lock className="w-3 h-3 text-[#D4AF37]" />}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 4: ENVIRONMENT & SITE BOUNDS */}
        {activeTab === 'ENVIRONMENT' && (
          <div className="space-y-4">
            <span className="text-[10px] uppercase font-mono tracking-wider text-gray-400 block mb-2">
              Spatial Enclosure & Landscape Bounds
            </span>

            <div className="space-y-3 font-mono">
              <div>
                <label className="text-[10px] text-gray-400 block mb-1">Site / Space Length (ft)</label>
                <input
                  type="number"
                  min="16"
                  max="120"
                  value={roomLengthFt}
                  onChange={e => setRoomLengthFt(Math.max(16, Number(e.target.value)))}
                  className="w-full px-3 py-2 bg-[#24201A] border border-[#3A332A] rounded-xl text-white font-bold"
                />
              </div>

              <div>
                <label className="text-[10px] text-gray-400 block mb-1">Site / Space Width (ft)</label>
                <input
                  type="number"
                  min="16"
                  max="120"
                  value={roomWidthFt}
                  onChange={e => setRoomWidthFt(Math.max(16, Number(e.target.value)))}
                  className="w-full px-3 py-2 bg-[#24201A] border border-[#3A332A] rounded-xl text-white font-bold"
                />
              </div>

              <div>
                <label className="text-[10px] text-gray-400 block mb-1">Finished Ceiling / Clearance (ft)</label>
                <input
                  type="number"
                  step="0.5"
                  min="8"
                  max="28"
                  value={ceilingHeightFt}
                  onChange={e => setCeilingHeightFt(Math.max(8, Number(e.target.value)))}
                  className="w-full px-3 py-2 bg-[#24201A] border border-[#3A332A] rounded-xl text-white font-bold"
                />
              </div>
            </div>

            <div className="p-3 bg-[#24201A] rounded-xl border border-[#3A332A] text-[11px] text-gray-300 space-y-1">
              <span className="font-bold text-[#D4AF37] block">Gross Enclosure Footprint:</span>
              <p className="font-mono text-xs text-white">
                {roomLengthFt * roomWidthFt} sq.ft ({Math.round(roomLengthFt * roomWidthFt * 0.0929)} m²)
              </p>
              <p className="text-[10px] text-gray-400">
                Volume: {roomLengthFt * roomWidthFt * ceilingHeightFt} cu.ft
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
