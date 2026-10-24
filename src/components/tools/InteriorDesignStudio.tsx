import React, { useState } from 'react';
import {
  Palette,
  Lightbulb,
  Volume2,
  Table,
  Plus,
  Trash2,
  Download,
  CheckCircle2,
  Sparkles,
  Info,
  Sliders,
  DollarSign,
  PackageCheck
} from 'lucide-react';
import { FFEItem, EngineeringConfig } from './types';
import { useApp } from '../../context/AppContext';

interface InteriorDesignStudioProps {
  config: EngineeringConfig;
}

const DEFAULT_FFE_ITEMS: FFEItem[] = [
  {
    id: 'ffe-1',
    itemCode: 'ST-01',
    room: 'Living Salon',
    category: 'SEATING',
    description: 'Bespoke Curvilinear Sectional in Pierre Frey Bouclé',
    vendor: 'B&B Italia / Custom Atelier',
    dimensions: '144"W × 68"D × 28"H',
    finishFabricGrade: 'Grade F Bouclé (Alpaca / Wool blend)',
    quantity: 1,
    unitCost: 24500,
    leadTimeWeeks: 14,
    status: 'APPROVED'
  },
  {
    id: 'ffe-2',
    itemCode: 'CG-01',
    room: 'Living Salon',
    category: 'CASEGOOD',
    description: 'Monolithic Low Cocktail Table in Calacatta Viola Marble',
    vendor: 'Salvatori Stone Works (Carrara)',
    dimensions: '60"W × 36"D × 14"H',
    finishFabricGrade: 'Honed Silk Satin Sealed',
    quantity: 1,
    unitCost: 16800,
    leadTimeWeeks: 8,
    status: 'PO_ISSUED'
  },
  {
    id: 'ffe-3',
    itemCode: 'LT-01',
    room: 'Dining Salon',
    category: 'LIGHTING',
    description: 'Suspended Sculptural Mobile Chandelier (Living Bronze & Alabaster)',
    vendor: 'Apparatus Studio New York',
    dimensions: '72"L × 34"W × 42" Drop',
    finishFabricGrade: 'Tarnished Brass & Italian Alabaster',
    quantity: 1,
    unitCost: 19500,
    leadTimeWeeks: 12,
    status: 'SPECIFIED'
  },
  {
    id: 'ffe-4',
    itemCode: 'TX-01',
    room: 'Master Sanctuary',
    category: 'RUG_TEXTILE',
    description: 'Hand-Knotted Tibetan Silk & Wool High-Pile Area Rug',
    vendor: 'Tai Ping Carpets',
    dimensions: '16\'-0" × 12\'-0"',
    finishFabricGrade: '100% Tibetan Highland Wool / Raw Silk',
    quantity: 1,
    unitCost: 14200,
    leadTimeWeeks: 16,
    status: 'IN_TRANSIT'
  }
];

export const InteriorDesignStudio: React.FC<InteriorDesignStudioProps> = ({ config }) => {
  const { addToast } = useApp();
  const [activeSub, setActiveSub] = useState<'ffe' | 'photometric' | 'acoustic'>('ffe');

  // ----------------------------------------------------
  // SUB-TOOL 1: FF&E SCHEDULE & SPECIFICATION MATRIX
  // ----------------------------------------------------
  const [ffeList, setFfeList] = useState<FFEItem[]>(DEFAULT_FFE_ITEMS);
  const [ffeFilterCategory, setFfeFilterCategory] = useState<string>('ALL');
  const [markupPercent, setMarkupPercent] = useState<number>(15); // 15% trade procurement fee

  // Modal / Add state
  const [newItemCode, setNewItemCode] = useState('ST-05');
  const [newRoom, setNewRoom] = useState('Living Salon');
  const [newCat, setNewCat] = useState<FFEItem['category']>('SEATING');
  const [newDesc, setNewDesc] = useState('');
  const [newVendor, setNewVendor] = useState('');
  const [newCost, setNewCost] = useState(6500);
  const [newQty, setNewQty] = useState(1);
  const [newLead, setNewLead] = useState(8);

  const handleAddFFE = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDesc.trim()) {
      addToast('error', 'Item description is required');
      return;
    }
    const item: FFEItem = {
      id: 'ffe_' + Date.now(),
      itemCode: newItemCode,
      room: newRoom,
      category: newCat,
      description: newDesc,
      vendor: newVendor || 'Bespoke Atelier',
      dimensions: 'Standard Custom Spec',
      finishFabricGrade: 'Premium Grade COM',
      quantity: newQty,
      unitCost: newCost,
      leadTimeWeeks: newLead,
      status: 'SPECIFIED'
    };
    setFfeList(prev => [...prev, item]);
    setNewDesc('');
    setNewVendor('');
    addToast('success', `Added ${newItemCode} to FF&E Schedule`);
  };

  const handleDeleteFFE = (id: string) => {
    setFfeList(prev => prev.filter(item => item.id !== id));
    addToast('info', 'Removed item from FF&E schedule');
  };

  // Cost Computations
  const subtotalCost = ffeList.reduce((acc, item) => acc + item.unitCost * item.quantity, 0);
  const procurementFee = Math.round(subtotalCost * (markupPercent / 100));
  const contingencyCost = Math.round(subtotalCost * 0.08); // 8% freight & installation contingency
  const grandTotalCost = subtotalCost + procurementFee + contingencyCost;

  // Export CSV
  const handleExportCSV = () => {
    const headers = ['Item Code', 'Room', 'Category', 'Description', 'Vendor', 'Dimensions', 'Finish / Grade', 'Qty', 'Unit Cost ($)', 'Total Cost ($)', 'Lead Time (Wks)', 'Status'];
    const rows = ffeList.map(item => [
      item.itemCode,
      `"${item.room}"`,
      item.category,
      `"${item.description.replace(/"/g, '""')}"`,
      `"${item.vendor}"`,
      `"${item.dimensions}"`,
      `"${item.finishFabricGrade}"`,
      item.quantity,
      item.unitCost,
      item.unitCost * item.quantity,
      item.leadTimeWeeks,
      item.status
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `VERTEX_FFE_Schedule_BoQ_${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    addToast('success', 'Exported FF&E Schedule as CSV spreadsheet');
  };

  // ----------------------------------------------------
  // SUB-TOOL 2: PHOTOMETRIC LIGHTING & ILLUMINANCE
  // ----------------------------------------------------
  const [photoRoomAreaSqFt, setPhotoRoomAreaSqFt] = useState<number>(450); // e.g. 25x18 ft
  const [photoTargetLux, setPhotoTargetLux] = useState<number>(250); // Lux (Lumens/m2)
  const [colorTempKelvin, setColorTempKelvin] = useState<number>(2700); // 2700K warm luxury
  const [installedDownlightWatts, setInstalledDownlightWatts] = useState<number>(140);
  const [installedCoveWatts, setInstalledCoveWatts] = useState<number>(90);
  const [installedAccentWatts, setInstalledAccentWatts] = useState<number>(50);

  const roomAreaM2 = photoRoomAreaSqFt * 0.092903;
  const targetTotalLumens = Math.round(roomAreaM2 * photoTargetLux);

  // Total installed lighting power
  const totalWatts = installedDownlightWatts + installedCoveWatts + installedAccentWatts;
  const lightingPowerDensity = totalWatts / photoRoomAreaSqFt; // W/sq.ft
  const title24MaxLpd = config.title24LpdTarget || 0.65;
  const isTitle24Compliant = lightingPowerDensity <= title24MaxLpd;

  // Layer ratios
  const ambientPct = Math.round((installedCoveWatts / totalWatts) * 100) || 35;
  const taskPct = Math.round((installedDownlightWatts / totalWatts) * 100) || 50;
  const accentPct = Math.round((installedAccentWatts / totalWatts) * 100) || 15;

  // Dynamic preview style based on CCT Kelvin
  const getKelvinColor = (k: number) => {
    if (k <= 2400) return '#FF9E4A'; // Candlelight
    if (k <= 2700) return '#FFAE68'; // Warm 2700K
    if (k <= 3000) return '#FFC48C'; // Soft 3000K
    if (k <= 3500) return '#FFE1B8'; // Neutral 3500K
    if (k <= 4000) return '#FFF0DE'; // Cool white
    return '#EAF2FF'; // Daylight
  };

  // ----------------------------------------------------
  // SUB-TOOL 3: SABINE REVERBERATION RT60 ACOUSTICS
  // ----------------------------------------------------
  const [roomLengthFt, setRoomLengthFt] = useState<number>(26);
  const [roomWidthFt, setRoomWidthFt] = useState<number>(18);
  const [roomHeightFt, setRoomHeightFt] = useState<number>(11);

  // Percentages of wall/floor materials
  const [travertineFloorPct, setTravertineFloorPct] = useState<number>(70); // Low absorption
  const [acousticPlasterWallPct, setAcousticPlasterWallPct] = useState<number>(45); // High absorption
  const [draperyCurtainPct, setDraperyCurtainPct] = useState<number>(30); // High absorption

  const roomVolumeCuFt = roomLengthFt * roomWidthFt * roomHeightFt;
  const floorAreaSqFt = roomLengthFt * roomWidthFt;
  const wallGrossSqFt = 2 * (roomLengthFt + roomWidthFt) * roomHeightFt;

  // Absorption calculations (Sabine: RT60 = 0.049 * V / A_sabins)
  const floorSabins = floorAreaSqFt * ((travertineFloorPct / 100) * 0.02 + ((100 - travertineFloorPct) / 100) * 0.45);
  const wallSabins = wallGrossSqFt * ((acousticPlasterWallPct / 100) * 0.65 + ((100 - acousticPlasterWallPct) / 100) * 0.05);
  const ceilingSabins = floorAreaSqFt * 0.15;
  const totalSabins = Math.max(1, floorSabins + wallSabins + ceilingSabins);

  const calculatedRT60 = (0.049 * roomVolumeCuFt) / totalSabins;
  const targetRT60 = config.reverberationTargetSec || 0.55;
  const isAcousticCompliant = calculatedRT60 >= 0.40 && calculatedRT60 <= 0.70;

  return (
    <div className="space-y-6">
      {/* Studio Header Bar */}
      <div className="bg-white p-5 rounded-3xl border border-gray-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#4A3B2C] text-[#E8D7C0] flex items-center justify-center shrink-0 shadow-xs">
            <Palette className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-serif font-bold text-gray-900 text-base">
                Interior Architecture & FF&E Studio
              </h4>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-50 text-[#8B7355] font-bold border border-amber-200">
                IESNA • TITLE 24 • SABINE RT60
              </span>
            </div>
            <p className="text-xs text-gray-500">
              Procurement specification schedule, layered photometric lux modeling, and reverberation acoustics.
            </p>
          </div>
        </div>

        {/* Sub-tool toggles */}
        <div className="flex items-center gap-1.5 bg-gray-100 p-1 rounded-2xl">
          {[
            { id: 'ffe', label: 'FF&E Bill of Quantities', icon: Table },
            { id: 'photometric', label: 'Photometrics & CCT', icon: Lightbulb },
            { id: 'acoustic', label: 'Sabine RT60 Acoustics', icon: Volume2 }
          ].map(t => {
            const Icon = t.icon;
            return (
              <button
                key={t.id}
                onClick={() => setActiveSub(t.id as any)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                  activeSub === t.id
                    ? 'bg-[#2C2416] text-[#D4AF37] font-bold shadow-xs'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ==================================================== */}
      {/* SUB-TOOL 1: FF&E SCHEDULE & PROCUREMENT */}
      {/* ==================================================== */}
      {activeSub === 'ffe' && (
        <div className="space-y-6">
          {/* Summary Rollup Banner */}
          <div className="bg-gradient-to-r from-[#2C2416] to-[#1C170E] text-white p-6 rounded-3xl shadow-md grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono">
            <div>
              <span className="text-[10px] text-gray-400 font-sans block">Subtotal Trade Cost</span>
              <span className="text-lg font-bold text-[#D4AF37]">${subtotalCost.toLocaleString()}</span>
              <span className="text-[10px] text-gray-400 block">{ffeList.length} Specified Items</span>
            </div>

            <div>
              <span className="text-[10px] text-gray-400 font-sans block">Procurement Fee ({markupPercent}%)</span>
              <span className="text-lg font-bold text-white">${procurementFee.toLocaleString()}</span>
              <span className="text-[10px] text-gray-400 block">Atelier Trade Management</span>
            </div>

            <div>
              <span className="text-[10px] text-gray-400 font-sans block">Freight / White-Glove</span>
              <span className="text-lg font-bold text-white">${contingencyCost.toLocaleString()}</span>
              <span className="text-[10px] text-gray-400 block">8% Transit & Crating</span>
            </div>

            <div className="border-l border-white/10 pl-4">
              <span className="text-[10px] text-[#D4AF37] font-sans block uppercase font-bold">Total FF&E Budget</span>
              <span className="text-xl font-bold text-white">${grandTotalCost.toLocaleString()}</span>
              <span className="text-[10px] text-emerald-400 block font-sans">Delivered & Installed</span>
            </div>
          </div>

          {/* Table & Actions Header */}
          <div className="bg-white p-6 rounded-3xl border border-gray-200/80 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <Table className="w-4 h-4 text-[#D4AF37]" />
                <h5 className="font-serif font-bold text-gray-900 text-sm">
                  Itemized Furnishings, Fixtures & Equipment Schedule
                </h5>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleExportCSV}
                  className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export CSV</span>
                </button>
              </div>
            </div>

            {/* FF&E Ledger Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-gray-200 text-[10px] font-mono text-gray-400 uppercase tracking-wider">
                    <th className="py-2.5 px-3">Code</th>
                    <th className="py-2.5 px-3">Room</th>
                    <th className="py-2.5 px-3">Category</th>
                    <th className="py-2.5 px-3">Description & Vendor</th>
                    <th className="py-2.5 px-3">Dimensions & Finish</th>
                    <th className="py-2.5 px-3 text-center">Qty</th>
                    <th className="py-2.5 px-3 text-right">Unit ($)</th>
                    <th className="py-2.5 px-3 text-right">Total ($)</th>
                    <th className="py-2.5 px-3 text-center">Lead</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-2 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {ffeList.map(item => (
                    <tr key={item.id} className="hover:bg-gray-50/70 transition-colors">
                      <td className="py-3 px-3 font-mono font-bold text-[#8B7355]">{item.itemCode}</td>
                      <td className="py-3 px-3 font-medium text-gray-700">{item.room}</td>
                      <td className="py-3 px-3">
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-gray-100 text-gray-600">
                          {item.category}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <div className="font-semibold text-gray-900">{item.description}</div>
                        <div className="text-[10px] text-gray-400">{item.vendor}</div>
                      </td>
                      <td className="py-3 px-3 text-gray-500">
                        <div>{item.dimensions}</div>
                        <div className="text-[10px] text-[#8B7355]">{item.finishFabricGrade}</div>
                      </td>
                      <td className="py-3 px-3 text-center font-mono">{item.quantity}</td>
                      <td className="py-3 px-3 text-right font-mono text-gray-600">${item.unitCost.toLocaleString()}</td>
                      <td className="py-3 px-3 text-right font-mono font-bold text-gray-900">
                        ${(item.unitCost * item.quantity).toLocaleString()}
                      </td>
                      <td className="py-3 px-3 text-center font-mono text-gray-500">{item.leadTimeWeeks}w</td>
                      <td className="py-3 px-3">
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                          {item.status}
                        </span>
                      </td>
                      <td className="py-3 px-2 text-center">
                        <button
                          type="button"
                          onClick={() => handleDeleteFFE(item.id)}
                          className="p-1 rounded text-gray-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Quick Add Form */}
            <form onSubmit={handleAddFFE} className="pt-4 border-t border-gray-100 grid grid-cols-1 sm:grid-cols-6 gap-3 text-xs">
              <div>
                <input
                  type="text"
                  placeholder="Code (e.g. ST-02)"
                  value={newItemCode}
                  onChange={e => setNewItemCode(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl"
                  required
                />
              </div>

              <div>
                <select
                  value={newCat}
                  onChange={e => setNewCat(e.target.value as any)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl"
                >
                  <option value="SEATING">Seating</option>
                  <option value="CASEGOOD">Casegoods</option>
                  <option value="LIGHTING">Lighting</option>
                  <option value="RUG_TEXTILE">Rug / Textile</option>
                  <option value="PLUMBING_FIXTURE">Plumbing / Bath</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <input
                  type="text"
                  placeholder="Item Description..."
                  value={newDesc}
                  onChange={e => setNewDesc(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl"
                  required
                />
              </div>

              <div>
                <input
                  type="number"
                  placeholder="Unit Cost ($)"
                  value={newCost}
                  onChange={e => setNewCost(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl"
                  required
                />
              </div>

              <div>
                <button
                  type="submit"
                  className="w-full py-2 bg-[#2C2416] hover:bg-black text-[#D4AF37] font-bold rounded-xl flex items-center justify-center gap-1 cursor-pointer transition-colors shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Line</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* SUB-TOOL 2: PHOTOMETRIC & CCT KELVIN ENGINE */}
      {/* ==================================================== */}
      {activeSub === 'photometric' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-6 bg-white p-6 rounded-3xl border border-gray-200/80 shadow-xs space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h5 className="font-bold text-gray-900 text-sm flex items-center gap-2">
                <Lightbulb className="w-4 h-4 text-amber-500" />
                <span>Illuminance & Layered Wattage Distribution</span>
              </h5>
              <span className="text-[10px] font-mono text-gray-400">
                IESNA RP-11 Standard
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <label className="font-semibold text-gray-700 block mb-1">
                  Floor Area (sq.ft)
                </label>
                <input
                  type="number"
                  value={photoRoomAreaSqFt}
                  onChange={e => setPhotoRoomAreaSqFt(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl font-mono text-xs"
                />
              </div>

              <div>
                <label className="font-semibold text-gray-700 block mb-1">
                  Target Illuminance (Lux)
                </label>
                <input
                  type="number"
                  step="25"
                  value={photoTargetLux}
                  onChange={e => setPhotoTargetLux(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl font-mono text-xs"
                />
                <span className="text-[10px] text-gray-400 block mt-0.5">Living: 200 • Kitchen: 450</span>
              </div>
            </div>

            {/* Fixture Wattage Layers */}
            <div className="space-y-3 pt-2 text-xs">
              <div>
                <div className="flex justify-between text-gray-700 mb-1">
                  <span>Concealed Ambient LED Cove (W):</span>
                  <span className="font-mono font-bold">{installedCoveWatts}W ({ambientPct}%)</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="300"
                  step="10"
                  value={installedCoveWatts}
                  onChange={e => setInstalledCoveWatts(Number(e.target.value))}
                  className="w-full accent-amber-500"
                />
              </div>

              <div>
                <div className="flex justify-between text-gray-700 mb-1">
                  <span>Architectural Task Downlights (W):</span>
                  <span className="font-mono font-bold">{installedDownlightWatts}W ({taskPct}%)</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="400"
                  step="10"
                  value={installedDownlightWatts}
                  onChange={e => setInstalledDownlightWatts(Number(e.target.value))}
                  className="w-full accent-amber-500"
                />
              </div>

              <div>
                <div className="flex justify-between text-gray-700 mb-1">
                  <span>Art Accent Spotlights & Sconces (W):</span>
                  <span className="font-mono font-bold">{installedAccentWatts}W ({accentPct}%)</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="200"
                  step="10"
                  value={installedAccentWatts}
                  onChange={e => setInstalledAccentWatts(Number(e.target.value))}
                  className="w-full accent-amber-500"
                />
              </div>
            </div>

            {/* Correlated Color Temperature Slider */}
            <div className="pt-2">
              <div className="flex justify-between text-xs text-gray-700 font-semibold mb-1">
                <span>Color Temperature (CCT):</span>
                <span className="font-mono font-bold text-amber-700">{colorTempKelvin} Kelvin</span>
              </div>
              <input
                type="range"
                min="2200"
                max="5000"
                step="100"
                value={colorTempKelvin}
                onChange={e => setColorTempKelvin(Number(e.target.value))}
                className="w-full accent-amber-500"
              />
              <div className="flex justify-between text-[10px] text-gray-400 font-mono mt-1">
                <span>2200K Candle</span>
                <span>2700K Warm</span>
                <span>3000K Soft</span>
                <span>4000K Neutral</span>
                <span>5000K Sky</span>
              </div>
            </div>
          </div>

          {/* Compliance & Visual Chamber */}
          <div className="lg:col-span-6 bg-white p-6 rounded-3xl border border-gray-200/80 shadow-xs space-y-5 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <h5 className="font-bold text-gray-900 text-sm flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-amber-600" />
                  <span>Title 24 & Photometric Audit</span>
                </h5>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                    isTitle24Compliant ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                  }`}
                >
                  {isTitle24Compliant ? 'TITLE 24 PASSED' : 'EXCEEDS ENERGY CODE'}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs font-mono">
                <div className="p-3 bg-gray-50 rounded-2xl border border-gray-100">
                  <span className="text-[10px] text-gray-400 font-sans block">Total Installed Load</span>
                  <span className="text-base font-bold text-gray-900">{totalWatts}W</span>
                  <span className="text-[10px] text-gray-400 block">LED Array</span>
                </div>

                <div className="p-3 bg-gray-50 rounded-2xl border border-gray-100">
                  <span className="text-[10px] text-gray-400 font-sans block">Power Density (LPD)</span>
                  <span className="text-base font-bold text-gray-900">{lightingPowerDensity.toFixed(2)}</span>
                  <span className="text-[10px] text-gray-400 block">W / sq.ft (Max: {title24MaxLpd})</span>
                </div>

                <div className="p-3 bg-gray-50 rounded-2xl border border-gray-100">
                  <span className="text-[10px] text-gray-400 font-sans block">Target Flux</span>
                  <span className="text-base font-bold text-gray-900">{targetTotalLumens.toLocaleString()}</span>
                  <span className="text-[10px] text-gray-400 block">Lumens</span>
                </div>
              </div>
            </div>

            {/* Atmospheric CCT Chamber Preview */}
            <div
              className="p-6 rounded-2xl border border-gray-200 transition-all duration-300 text-center space-y-2"
              style={{
                backgroundColor: getKelvinColor(colorTempKelvin),
                boxShadow: `0 10px 30px -5px ${getKelvinColor(colorTempKelvin)}88`
              }}
            >
              <div className="inline-block px-3 py-1 bg-black/60 backdrop-blur-md rounded-full text-white text-[11px] font-mono font-bold">
                Photometric Chamber Preview • {colorTempKelvin}K
              </div>
              <p className="text-xs text-gray-800 font-medium max-w-sm mx-auto drop-shadow-xs">
                {colorTempKelvin <= 2700
                  ? 'Intimate golden residential warmth, flattering to skin tones and natural travertine.'
                  : colorTempKelvin <= 3500
                  ? 'Balanced architectural clarity ideal for artwork curation and reading libraries.'
                  : 'High CRI daylight simulation optimized for culinary preparation and architectural drawings.'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* SUB-TOOL 3: SABINE REVERBERATION RT60 ACOUSTICS */}
      {/* ==================================================== */}
      {activeSub === 'acoustic' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-6 bg-white p-6 rounded-3xl border border-gray-200/80 shadow-xs space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h5 className="font-bold text-gray-900 text-sm flex items-center gap-2">
                <Volume2 className="w-4 h-4 text-purple-600" />
                <span>Room Geometry & Absorption Coefficients</span>
              </h5>
              <span className="text-[10px] font-mono text-gray-400">
                Sabine Formula: RT60 = 0.049·V / A
              </span>
            </div>

            <div className="grid grid-cols-3 gap-3 text-xs">
              <div>
                <label className="font-semibold text-gray-700 block mb-1">Length (ft)</label>
                <input
                  type="number"
                  value={roomLengthFt}
                  onChange={e => setRoomLengthFt(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl font-mono text-xs"
                />
              </div>

              <div>
                <label className="font-semibold text-gray-700 block mb-1">Width (ft)</label>
                <input
                  type="number"
                  value={roomWidthFt}
                  onChange={e => setRoomWidthFt(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl font-mono text-xs"
                />
              </div>

              <div>
                <label className="font-semibold text-gray-700 block mb-1">Ceiling (ft)</label>
                <input
                  type="number"
                  value={roomHeightFt}
                  onChange={e => setRoomHeightFt(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl font-mono text-xs"
                />
              </div>
            </div>

            <div className="space-y-3 pt-2 text-xs">
              <div>
                <div className="flex justify-between text-gray-700 mb-1">
                  <span>Travertine / Hard Flooring Coverage (%):</span>
                  <span className="font-mono font-bold">{travertineFloorPct}% (NRC 0.02)</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={travertineFloorPct}
                  onChange={e => setTravertineFloorPct(Number(e.target.value))}
                  className="w-full accent-purple-600"
                />
              </div>

              <div>
                <div className="flex justify-between text-gray-700 mb-1">
                  <span>Acoustic Micro-perforated Plaster Walls (%):</span>
                  <span className="font-mono font-bold">{acousticPlasterWallPct}% (NRC 0.65)</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={acousticPlasterWallPct}
                  onChange={e => setAcousticPlasterWallPct(Number(e.target.value))}
                  className="w-full accent-purple-600"
                />
              </div>
            </div>
          </div>

          {/* Acoustic Readout Card */}
          <div className="lg:col-span-6 bg-white p-6 rounded-3xl border border-gray-200/80 shadow-xs space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h5 className="font-bold text-gray-900 text-sm flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-purple-600" />
                <span>Reverberation Time Status</span>
              </h5>
              <span
                className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                  isAcousticCompliant ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                }`}
              >
                {isAcousticCompliant ? 'BALANCED ACOUSTIC LUXURY' : 'REVERBERANT / ECHO RISK'}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs font-mono">
              <div className="p-3 bg-gray-50 rounded-2xl border border-gray-100">
                <span className="text-[10px] text-gray-400 font-sans block">Calculated RT60 Decay</span>
                <span className="text-xl font-bold text-gray-900">{calculatedRT60.toFixed(2)}s</span>
                <span className="text-[10px] text-gray-400 block">Target: {targetRT60}s (0.45 - 0.65s)</span>
              </div>

              <div className="p-3 bg-gray-50 rounded-2xl border border-gray-100">
                <span className="text-[10px] text-gray-400 font-sans block">Total Sound Absorption</span>
                <span className="text-xl font-bold text-gray-900">{Math.round(totalSabins)}</span>
                <span className="text-[10px] text-gray-400 block">Sabins (Absorption units)</span>
              </div>
            </div>

            <div className="p-4 bg-purple-50 rounded-2xl border border-purple-100 text-xs text-purple-950 space-y-1">
              <span className="font-bold block">Acoustical Architect Assessment:</span>
              <p className="text-[11px] text-purple-900 leading-relaxed">
                {calculatedRT60 < 0.40
                  ? 'Space is acoustically dry or over-damped. Consider introducing reflective hard plaster reveals.'
                  : calculatedRT60 <= 0.65
                  ? 'Optimal speech clarity, intimacy, and high-fidelity sound immersion without flutter echoes.'
                  : 'Reverberation exceeds recommended threshold. Recommend specifying wool drapery and acoustical ceiling baffles.'}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
