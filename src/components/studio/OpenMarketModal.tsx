import React, { useState, useRef } from 'react';
import {
  OpenMarketItem,
  StudioElement,
  StudioMaterialType,
  FurnitureCategory
} from './types';
import {
  OPEN_MARKET_CATALOG,
  marketItemToStudioElement,
  parseObjFile,
  ParsedObjResult
} from './openMarketCatalog';
import {
  Store,
  Upload,
  Search,
  Filter,
  Box,
  Layers,
  Sparkles,
  X,
  Plus,
  Check,
  Globe,
  Sliders,
  FileCode,
  DollarSign,
  Tag,
  Package,
  Cpu,
  ArrowRight,
  Eye,
  Info
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

// Sample raw OBJ text for immediate testing of 3D Wavefront OBJ importing
const SAMPLE_OBJ_MODELS: { title: string; desc: string; category: FurnitureCategory; material: StudioMaterialType; obj: string }[] = [
  {
    title: 'Bauhaus Cantilever Lounge Armchair',
    desc: 'Pure tubular geometry with leather sling cushion based on Marcel Breuer design principles',
    category: 'ARMCHAIR',
    material: 'leather',
    obj: `
# Bauhaus Armchair OBJ
v -1.6 0.0 -1.5
v 1.6 0.0 -1.5
v 1.6 0.0 1.5
v -1.6 0.0 1.5
v -1.6 1.4 -1.5
v 1.6 1.4 -1.5
v 1.6 1.4 1.5
v -1.6 1.4 1.5
v -1.6 2.8 -1.5
v 1.6 2.8 -1.5
f 1 2 6 5
f 2 3 7 6
f 3 4 8 7
f 4 1 5 8
f 5 6 7 8
f 5 6 10 9
`
  },
  {
    title: 'Monolithic Sculptural Travertine Plinth',
    desc: 'Honed travertine architectural display pedestal with fluted bevels',
    category: 'COFFEE_TABLE',
    material: 'travertine',
    obj: `
# Sculptural Plinth OBJ
v -2.0 0.0 -2.0
v 2.0 0.0 -2.0
v 2.0 0.0 2.0
v -2.0 0.0 2.0
v -1.6 1.8 -1.6
v 1.6 1.8 -1.6
v 1.6 1.8 1.6
v -1.6 1.8 1.6
v -2.2 2.0 -2.2
v 2.2 2.0 -2.2
v 2.2 2.0 2.2
v -2.2 2.0 2.2
f 1 2 6 5
f 2 3 7 6
f 3 4 8 7
f 4 1 5 8
f 5 6 10 9
f 6 7 11 10
f 7 8 12 11
f 8 5 9 12
f 9 10 11 12
`
  },
  {
    title: 'Linear Architectural Pendant Light Fixture',
    desc: 'Sleek bronze horizontal canopy with suspended downlight prisms',
    category: 'LAMP',
    material: 'bronze',
    obj: `
# Bronze Pendant OBJ
v -3.5 0.0 -0.4
v 3.5 0.0 -0.4
v 3.5 0.0 0.4
v -3.5 0.0 0.4
v -3.5 0.6 -0.4
v 3.5 0.6 -0.4
v 3.5 0.6 0.4
v -3.5 0.6 0.4
f 1 2 3 4
f 5 6 7 8
f 1 2 6 5
f 2 3 7 6
f 3 4 8 7
f 4 1 5 8
`
  }
];

interface OpenMarketModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInsertElement: (element: StudioElement) => void;
  roomWidthFt: number;
  roomLengthFt: number;
}

export const OpenMarketModal: React.FC<OpenMarketModalProps> = ({
  isOpen,
  onClose,
  onInsertElement,
  roomWidthFt,
  roomLengthFt
}) => {
  const { addToast } = useApp();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [activeTab, setActiveTab] = useState<'MARKET' | 'UPLOAD' | 'TEST_MODELS'>('MARKET');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  // File Upload & Custom 3D Object State
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [parsedObj, setParsedObj] = useState<ParsedObjResult | null>(null);
  const [unitScale, setUnitScale] = useState<number>(1.0); // 1.0 = feet, 3.28 = meters to feet, 0.0833 = inches to feet
  const [customName, setCustomName] = useState<string>('');
  const [customCategory, setCustomCategory] = useState<FurnitureCategory>('SOFA');
  const [customMaterial, setCustomMaterial] = useState<StudioMaterialType>('oak');
  const [customCost, setCustomCost] = useState<number>(4500);
  const [customVendor, setCustomVendor] = useState<string>('External BIM Marketplace');

  if (!isOpen) return null;

  // Filter Catalog
  const filteredCatalog = OPEN_MARKET_CATALOG.filter(item => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.manufacturer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.materialName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.csiCode.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      selectedCategory === 'ALL' || item.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  // Handle Quick Insert from Open Market
  const handleInsertMarketItem = (item: OpenMarketItem) => {
    const centerX = Math.round((roomLengthFt / 2) * 2) / 2;
    const centerY = Math.round((roomWidthFt / 2) * 2) / 2;
    const element = marketItemToStudioElement(item, centerX, centerY);
    onInsertElement(element);
    addToast('success', `Imported ${item.name} from ${item.manufacturer}`);
    onClose();
  };

  // Handle 3D File Upload (.OBJ or .JSON)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadedFileName(file.name);
    const fileNameLower = file.name.toLowerCase();
    const reader = new FileReader();

    if (fileNameLower.endsWith('.obj') || fileNameLower.endsWith('.txt')) {
      reader.onload = event => {
        try {
          const text = event.target?.result as string;
          const cleanName = file.name.replace(/\.[^/.]+$/, '');
          const result = parseObjFile(text, cleanName, unitScale);
          setParsedObj(result);
          setCustomName(cleanName);
          addToast('success', `Parsed 3D Wavefront OBJ (${result.vertices.length / 3} vertices)`);
        } catch (err) {
          addToast('error', 'Failed to parse OBJ file. Check format.');
        }
      };
      reader.readAsText(file);
    } else if (fileNameLower.endsWith('.json')) {
      reader.onload = event => {
        try {
          const jsonText = event.target?.result as string;
          const parsed = JSON.parse(jsonText);
          const cleanName = parsed.name || file.name.replace(/\.[^/.]+$/, '');
          setCustomName(cleanName);

          // If BIM JSON has dimensions or vertices
          if (parsed.vertices) {
            setParsedObj({
              name: cleanName,
              vertices: parsed.vertices,
              bounds: {
                minX: 0, maxX: parsed.width || 4,
                minY: 0, maxY: parsed.height || 3,
                minZ: 0, maxZ: parsed.length || 4,
                widthFt: parsed.width || 4,
                heightFt: parsed.height || 3,
                lengthFt: parsed.length || 4
              }
            });
          }
          if (parsed.cost) setCustomCost(parsed.cost);
          if (parsed.manufacturer) setCustomVendor(parsed.manufacturer);
          addToast('success', `Parsed BIM Component JSON successfully`);
        } catch (err) {
          addToast('error', 'Invalid BIM JSON file');
        }
      };
      reader.readAsText(file);
    } else {
      addToast('error', 'Unsupported file type. Please upload .OBJ or .JSON');
    }
  };

  // Insert Custom Uploaded Object
  const handleInsertCustomObject = () => {
    const centerX = Math.round((roomLengthFt / 2) * 2) / 2;
    const centerY = Math.round((roomWidthFt / 2) * 2) / 2;

    const width = parsedObj ? parsedObj.bounds.widthFt : 4.0;
    const length = parsedObj ? parsedObj.bounds.lengthFt : 4.0;
    const height = parsedObj ? parsedObj.bounds.heightFt : 3.0;

    const newElement: StudioElement = {
      id: `imported-${Date.now()}`,
      name: customName || 'Imported Market Object',
      type: 'IMPORTED_OBJECT',
      furnitureCategory: customCategory,
      layer: 'furniture',
      x: centerX,
      y: centerY,
      z: 0,
      width,
      length,
      height,
      rotation: 0,
      color: '#D4AF37',
      materialName: `${customMaterial.toUpperCase()} Finish`,
      materialType: customMaterial,
      lrv: 50,
      cost: customCost,
      csiCode: '12 51 00',
      vendor: customVendor,
      roomName: 'Design Space',
      isImported: true,
      importedFormat: uploadedFileName?.endsWith('.json') ? 'JSON' : 'OBJ',
      importedSource: customVendor,
      importedObjMesh: parsedObj
        ? {
            vertices: parsedObj.vertices,
            normals: parsedObj.normals
          }
        : undefined
    };

    onInsertElement(newElement);
    addToast('success', `Imported ${newElement.name} into Studio workspace`);
    onClose();
  };

  // Quick Load Test Model
  const handleLoadSampleModel = (sample: typeof SAMPLE_OBJ_MODELS[0]) => {
    const result = parseObjFile(sample.obj, sample.title, 1.0);
    setParsedObj(result);
    setCustomName(sample.title);
    setCustomCategory(sample.category);
    setCustomMaterial(sample.material);
    setCustomVendor('Sample Open Market Library');
    setActiveTab('UPLOAD');
    addToast('info', `Loaded ${sample.title} into 3D inspector`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in-50 duration-200">
      <div className="bg-[#1C1A17] text-white w-full max-w-5xl rounded-3xl border border-[#3A332A] shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-5 border-b border-[#2C2416] flex items-center justify-between bg-[#24201A]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#D4AF37] text-black flex items-center justify-center font-bold shadow-md">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-serif font-bold text-xl text-[#F5F2EB]">
                  Global Design Market & 3D Object Importer
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-[#D4AF37] border border-amber-500/30 font-bold">
                  BIM & CAD READY
                </span>
              </div>
              <p className="text-xs text-gray-400">
                Browse verified architectural specifications or import custom Wavefront .OBJ & BIM components.
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

        {/* Tab Navigation */}
        <div className="flex items-center justify-between px-6 pt-3 border-b border-[#2C2416] bg-[#1F1C18] flex-wrap gap-2">
          <div className="flex items-center gap-2">
            {[
              { id: 'MARKET' as const, label: 'Curated Open Market', icon: Store, count: OPEN_MARKET_CATALOG.length },
              { id: 'UPLOAD' as const, label: 'Import Custom 3D File (.OBJ / .JSON)', icon: Upload },
              { id: 'TEST_MODELS' as const, label: '1-Click Test OBJ Models', icon: Sparkles }
            ].map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-2.5 rounded-t-xl text-xs font-semibold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
                    isActive
                      ? 'border-[#D4AF37] text-[#D4AF37] bg-[#2A251E] font-bold'
                      : 'border-transparent text-gray-400 hover:text-gray-200'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                  {tab.count !== undefined && (
                    <span className="text-[10px] px-1.5 py-0.2 bg-white/10 rounded-full font-mono text-gray-300">
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab 1: Curated Open Market Catalog */}
        {activeTab === 'MARKET' && (
          <div className="flex-1 overflow-y-auto p-6 space-y-5">
            {/* Search & Category Filter Pills */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-3">
              {/* Search Bar */}
              <div className="relative w-full md:w-80">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search brand, model, CSI code, or material..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-[#26221D] border border-[#3A332A] rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#D4AF37]"
                />
              </div>

              {/* Category Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto scrollbar-none">
                {[
                  { id: 'ALL', label: 'All Items' },
                  { id: 'FURNITURE', label: 'Living & Lounge' },
                  { id: 'LIGHTING', label: 'Lighting' },
                  { id: 'BATH_KITCHEN', label: 'Kitchen & Bath' },
                  { id: 'ARCHITECTURAL', label: 'Partitions' },
                  { id: 'STRUCTURAL', label: 'Columns' },
                  { id: 'DECOR', label: 'Biophilic' }
                ].map(cat => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-mono transition-all cursor-pointer whitespace-nowrap ${
                      selectedCategory === cat.id
                        ? 'bg-[#D4AF37] text-black font-bold shadow-xs'
                        : 'bg-[#26221D] text-gray-400 hover:text-white border border-[#3A332A]'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Catalog Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredCatalog.map(item => (
                <div
                  key={item.id}
                  className="bg-[#24201A] border border-[#3A332A] hover:border-[#D4AF37]/60 rounded-2xl p-4 flex flex-col justify-between transition-all hover:shadow-xl group"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono uppercase tracking-wider text-[#D4AF37] font-bold">
                            {item.manufacturer}
                          </span>
                          <span className="text-[10px] text-gray-500">• {item.originCountry}</span>
                        </div>
                        <h4 className="font-serif font-bold text-sm text-[#F5F2EB] group-hover:text-[#D4AF37] transition-colors mt-0.5">
                          {item.name}
                        </h4>
                      </div>
                      <span className="text-[10px] font-mono px-2 py-0.5 bg-white/5 border border-white/10 rounded text-gray-300">
                        {item.lod}
                      </span>
                    </div>

                    <p className="text-[11px] text-gray-400 line-clamp-2 leading-relaxed">
                      {item.description}
                    </p>

                    {/* Specifications Grid */}
                    <div className="grid grid-cols-2 gap-2 text-[11px] bg-[#1C1A17] p-2.5 rounded-xl border border-white/5 font-mono">
                      <div>
                        <span className="text-gray-500 block text-[9px] uppercase">Dimensions</span>
                        <span className="text-gray-300 font-bold">
                          {item.dimensions.widthFt}' × {item.dimensions.lengthFt}' × {item.dimensions.heightFt}'
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500 block text-[9px] uppercase">Finish</span>
                        <span className="text-gray-300 truncate block" title={item.materialName}>
                          {item.materialName}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500 block text-[9px] uppercase">CSI Code</span>
                        <span className="text-gray-400">{item.csiCode}</span>
                      </div>
                      <div>
                        <span className="text-gray-500 block text-[9px] uppercase">Lead Time</span>
                        <span className="text-gray-400">{item.leadTimeWeeks} weeks</span>
                      </div>
                    </div>
                  </div>

                  {/* Price & Insert Action */}
                  <div className="flex items-center justify-between pt-3 mt-3 border-t border-[#3A332A]">
                    <div>
                      <span className="text-[10px] text-gray-500 block uppercase font-mono">Trade Cost</span>
                      <span className="font-mono font-bold text-[#D4AF37] text-sm">
                        ${item.cost.toLocaleString()}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleInsertMarketItem(item)}
                      className="px-3.5 py-1.5 rounded-xl bg-[#D4AF37] hover:bg-amber-400 text-black text-xs font-bold flex items-center gap-1.5 shadow-md transition-all cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Insert into Space</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 2: Custom 3D File Importer (.OBJ / .JSON) */}
        {activeTab === 'UPLOAD' && (
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Column: Dropzone & Upload Settings */}
              <div className="lg:col-span-6 space-y-4">
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-[#4A4036] hover:border-[#D4AF37] bg-[#24201A] rounded-2xl p-8 text-center cursor-pointer transition-all hover:bg-[#2A251E] group"
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".obj,.json,.txt"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <div className="w-14 h-14 rounded-2xl bg-[#D4AF37]/10 text-[#D4AF37] flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                    <Upload className="w-7 h-7" />
                  </div>
                  <h4 className="font-serif font-bold text-base text-[#F5F2EB]">
                    {uploadedFileName ? uploadedFileName : 'Select or Drop 3D File (.OBJ or .JSON)'}
                  </h4>
                  <p className="text-xs text-gray-400 mt-1 max-w-sm mx-auto">
                    Supports industry Wavefront 3D OBJ meshes with vertices and faces, or BIM component JSON descriptors.
                  </p>
                  <span className="inline-block mt-3 px-3 py-1 bg-white/5 rounded-lg text-[10px] font-mono text-[#D4AF37] border border-[#D4AF37]/30">
                    Auto-Scales & Normalizes to CAD Coordinates
                  </span>
                </div>

                {/* Import Scale Unit Selector */}
                <div className="bg-[#24201A] p-4 rounded-2xl border border-[#3A332A] space-y-2">
                  <label className="text-xs font-mono font-bold text-gray-300 block">
                    3D Model Unit Calibration
                  </label>
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    {[
                      { scale: 1.0, label: '1 Unit = 1 Foot' },
                      { scale: 3.28084, label: '1 Unit = 1 Meter' },
                      { scale: 0.08333, label: '1 Unit = 1 Inch' }
                    ].map(opt => (
                      <button
                        key={opt.label}
                        type="button"
                        onClick={() => setUnitScale(opt.scale)}
                        className={`p-2 rounded-xl text-center font-mono transition-all cursor-pointer ${
                          unitScale === opt.scale
                            ? 'bg-[#D4AF37] text-black font-bold'
                            : 'bg-[#1C1A17] text-gray-400 hover:text-white border border-white/5'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Column: Model Properties & Verification */}
              <div className="lg:col-span-6 space-y-4">
                <div className="bg-[#24201A] p-5 rounded-2xl border border-[#3A332A] space-y-4">
                  <h4 className="font-serif font-bold text-sm text-[#F5F2EB] flex items-center gap-2">
                    <Cpu className="w-4 h-4 text-[#D4AF37]" />
                    <span>Imported Object Specification</span>
                  </h4>

                  {parsedObj ? (
                    <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl space-y-1 text-xs">
                      <div className="flex items-center gap-2 text-emerald-400 font-bold">
                        <Check className="w-4 h-4" />
                        <span>3D Geometry Validated</span>
                      </div>
                      <p className="text-[11px] text-gray-300 font-mono">
                        Vertices: {parsedObj.vertices.length / 3} | Dimensions: {parsedObj.bounds.widthFt}'W × {parsedObj.bounds.lengthFt}'L × {parsedObj.bounds.heightFt}'H
                      </p>
                    </div>
                  ) : (
                    <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-xs text-amber-300">
                      Upload an .OBJ or .JSON file on the left, or test using the sample models tab.
                    </div>
                  )}

                  {/* Metadata Input Fields */}
                  <div className="space-y-3 text-xs">
                    <div>
                      <label className="text-[10px] uppercase font-mono tracking-wider text-gray-400 block mb-1">
                        Object Title
                      </label>
                      <input
                        type="text"
                        value={customName}
                        onChange={e => setCustomName(e.target.value)}
                        placeholder="e.g. Modern Executive Credenza"
                        className="w-full px-3 py-2 bg-[#1C1A17] border border-[#3A332A] rounded-xl text-white font-medium focus:outline-none focus:border-[#D4AF37]"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[10px] uppercase font-mono tracking-wider text-gray-400 block mb-1">
                          Category
                        </label>
                        <select
                          value={customCategory}
                          onChange={e => setCustomCategory(e.target.value as any)}
                          className="w-full px-3 py-2 bg-[#1C1A17] border border-[#3A332A] rounded-xl text-white font-medium focus:outline-none focus:border-[#D4AF37]"
                        >
                          <option value="SOFA">Sofa & Lounge</option>
                          <option value="ARMCHAIR">Armchair</option>
                          <option value="DINING_TABLE">Dining Table</option>
                          <option value="COFFEE_TABLE">Coffee Table</option>
                          <option value="BED">Platform Bed</option>
                          <option value="DESK">Executive Desk</option>
                          <option value="CREDENZA">Joinery Credenza</option>
                          <option value="BATHTUB">Soaking Bathtub</option>
                          <option value="LAMP">Pendant / Lamp</option>
                          <option value="PLANT">Biophilic Plant</option>
                          <option value="CUSTOM">Custom Architectural</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-[10px] uppercase font-mono tracking-wider text-gray-400 block mb-1">
                          Material Finish
                        </label>
                        <select
                          value={customMaterial}
                          onChange={e => setCustomMaterial(e.target.value as any)}
                          className="w-full px-3 py-2 bg-[#1C1A17] border border-[#3A332A] rounded-xl text-white font-medium focus:outline-none focus:border-[#D4AF37]"
                        >
                          <option value="oak">Quarter-Sawn Smoked Oak</option>
                          <option value="walnut">American Black Walnut</option>
                          <option value="travertine">Navona Travertine</option>
                          <option value="marble">Calacatta Vagli Marble</option>
                          <option value="boucle">Wool Bouclé</option>
                          <option value="leather">Cognac Saddle Leather</option>
                          <option value="bronze">Patinated Bronze</option>
                          <option value="matte_black">Matte Black Anodized</option>
                          <option value="glass">Low-E Architectural Glass</option>
                          <option value="concrete">Fair-Faced Concrete</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[10px] uppercase font-mono tracking-wider text-gray-400 block mb-1">
                          Cost Estimate ($)
                        </label>
                        <input
                          type="number"
                          value={customCost}
                          onChange={e => setCustomCost(Number(e.target.value))}
                          className="w-full px-3 py-2 bg-[#1C1A17] border border-[#3A332A] rounded-xl text-white font-mono focus:outline-none focus:border-[#D4AF37]"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] uppercase font-mono tracking-wider text-gray-400 block mb-1">
                          Source / Manufacturer
                        </label>
                        <input
                          type="text"
                          value={customVendor}
                          onChange={e => setCustomVendor(e.target.value)}
                          className="w-full px-3 py-2 bg-[#1C1A17] border border-[#3A332A] rounded-xl text-white focus:outline-none focus:border-[#D4AF37]"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Insert Button */}
                  <button
                    type="button"
                    disabled={!parsedObj && !customName}
                    onClick={handleInsertCustomObject}
                    className="w-full py-3 bg-[#D4AF37] hover:bg-amber-400 disabled:opacity-40 disabled:cursor-not-allowed text-black font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Insert Custom 3D Object into Studio</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Pre-loaded 1-Click Test OBJ Models */}
        {activeTab === 'TEST_MODELS' && (
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            <div className="p-4 bg-[#24201A] border border-[#3A332A] rounded-2xl flex items-center gap-3">
              <Sparkles className="w-5 h-5 text-[#D4AF37] shrink-0" />
              <p className="text-xs text-gray-300">
                Test the platform's native 3D OBJ parser immediately without needing your own CAD file. Click any preset below to load, calibrate, and place into your project!
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {SAMPLE_OBJ_MODELS.map((sample, idx) => (
                <div
                  key={idx}
                  className="bg-[#24201A] border border-[#3A332A] hover:border-[#D4AF37] rounded-2xl p-5 flex flex-col justify-between space-y-4 transition-all"
                >
                  <div className="space-y-2">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#D4AF37]/20 text-[#D4AF37] font-bold">
                      {sample.category} • WAVEFRONT .OBJ
                    </span>
                    <h4 className="font-serif font-bold text-base text-[#F5F2EB]">
                      {sample.title}
                    </h4>
                    <p className="text-xs text-gray-400 leading-relaxed">
                      {sample.desc}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleLoadSampleModel(sample)}
                    className="w-full py-2 bg-[#2C2416] hover:bg-[#D4AF37] hover:text-black text-[#D4AF37] font-bold rounded-xl text-xs flex items-center justify-center gap-2 border border-[#D4AF37]/40 transition-all cursor-pointer"
                  >
                    <span>Load & Calibrate OBJ</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
