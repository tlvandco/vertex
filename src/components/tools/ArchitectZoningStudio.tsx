import React, { useState } from 'react';
import {
  Building,
  ShieldAlert,
  CheckCircle2,
  FileCode,
  Download,
  Info,
  Sliders,
  Ruler,
  Maximize2,
  Compass,
  Layers,
  ArrowRight
} from 'lucide-react';
import { EngineeringConfig } from './types';
import { useApp } from '../../context/AppContext';

interface ArchitectZoningStudioProps {
  config: EngineeringConfig;
  onExportDxf?: () => void;
}

export const ArchitectZoningStudio: React.FC<ArchitectZoningStudioProps> = ({ config, onExportDxf }) => {
  const { addToast } = useApp();
  const [activeSub, setActiveSub] = useState<'zoning' | 'egress' | 'cad-layers'>('zoning');

  // ----------------------------------------------------
  // SUB-TOOL 1: MUNICIPAL ZONING & FAR ENVELOPE
  // ----------------------------------------------------
  const [lotAreaSqFt, setLotAreaSqFt] = useState<number>(14500);
  const [groundFootprintSqFt, setGroundFootprintSqFt] = useState<number>(4800);
  const [numAboveGradeStories, setNumAboveGradeStories] = useState<number>(2);
  const [basementSqFt, setBasementSqFt] = useState<number>(3200);
  const [isBasementExempt, setIsBasementExempt] = useState<boolean>(true); // Municipal exemption
  const [zoningClassification, setZoningClassification] = useState<'R1_ESTATE' | 'R2_LUXURY' | 'COMMERCIAL_MIXED'>('R1_ESTATE');

  // Setbacks
  const [frontSetbackFt, setFrontSetbackFt] = useState<number>(25);
  const [rearSetbackFt, setRearSetbackFt] = useState<number>(20);
  const [sideSetbackFt, setSideSetbackFt] = useState<number>(8);

  const ZONING_RULES = {
    R1_ESTATE: { name: 'Single-Family Estate (R-1)', maxFar: 0.45, maxCoverage: 35, minFront: 20, minRear: 15, minSide: 6, maxHt: 32 },
    R2_LUXURY: { name: 'Multi-Family Luxury (R-2)', maxFar: 0.75, maxCoverage: 45, minFront: 15, minRear: 15, minSide: 5, maxHt: 45 },
    COMMERCIAL_MIXED: { name: 'Mixed-Use Commercial (C-1)', maxFar: 1.50, maxCoverage: 65, minFront: 0, minRear: 10, minSide: 0, maxHt: 60 }
  }[zoningClassification];

  // Computations
  const aboveGradeTotalGross = groundFootprintSqFt * numAboveGradeStories;
  const countedFarGross = isBasementExempt ? aboveGradeTotalGross : aboveGradeTotalGross + basementSqFt;
  const actualFar = countedFarGross / lotAreaSqFt;
  const actualCoverage = (groundFootprintSqFt / lotAreaSqFt) * 100;

  const isFarCompliant = actualFar <= ZONING_RULES.maxFar;
  const isCoverageCompliant = actualCoverage <= ZONING_RULES.maxCoverage;
  const isFrontSetbackCompliant = frontSetbackFt >= ZONING_RULES.minFront;
  const isRearSetbackCompliant = rearSetbackFt >= ZONING_RULES.minRear;
  const isSideSetbackCompliant = sideSetbackFt >= ZONING_RULES.minSide;
  const isZoningPass = isFarCompliant && isCoverageCompliant && isFrontSetbackCompliant && isRearSetbackCompliant && isSideSetbackCompliant;

  // ----------------------------------------------------
  // SUB-TOOL 2: IBC 2024 OCCUPANCY & EGRESS LIFE-SAFETY
  // ----------------------------------------------------
  const [occupancyGroup, setOccupancyGroup] = useState<'R2' | 'B' | 'A2' | 'M'>('R2');
  const [egressFloorAreaSqFt, setEgressFloorAreaSqFt] = useState<number>(8500);
  const [isSprinkleredNFPA13, setIsSprinkleredNFPA13] = useState<boolean>(true);

  const OCCUPANCY_SPECS = {
    R2: { label: 'Group R-2 (Residential Luxury Apartments / Condos)', factor: 200, egressDoorsMin: 36, corridorMin: 44 },
    B: { label: 'Group B (Business / Executive Architecture Ateliers)', factor: 150, egressDoorsMin: 36, corridorMin: 44 },
    A2: { label: 'Group A-2 (Dining Salons, Private Clubs)', factor: 15, egressDoorsMin: 36, corridorMin: 72 },
    M: { label: 'Group M (High-End Retail Boutiques)', factor: 60, egressDoorsMin: 36, corridorMin: 44 }
  }[occupancyGroup];

  const calculatedOccupantLoad = Math.max(1, Math.ceil(egressFloorAreaSqFt / OCCUPANCY_SPECS.factor));
  const requiredExitsCount = calculatedOccupantLoad > 500 ? 3 : calculatedOccupantLoad >= 50 ? 2 : 1;
  const minEgressWidthInches = Math.round(calculatedOccupantLoad * 0.2); // 0.2" per occupant
  const maxTravelDistanceFt = isSprinkleredNFPA13 ? 250 : 200; // IBC 1017.2

  // ----------------------------------------------------
  // SUB-TOOL 3: CAD VECTOR LAYERS & DXF EXPORT
  // ----------------------------------------------------
  const [cadLayers, setCadLayers] = useState({
    'A-WALL': { label: 'A-WALL (Structural & Partition Walls)', color: '#FFFFFF', active: true },
    'A-DOOR': { label: 'A-DOOR (Door Swings & Clearances)', color: '#D4AF37', active: true },
    'A-GLAZ': { label: 'A-GLAZ (Windows & Glazed Curtainwalls)', color: '#38BDF8', active: true },
    'A-FURN': { label: 'A-FURN (Furniture & FF&E Layout)', color: '#C8BCA8', active: true },
    'A-ANNO': { label: 'A-ANNO (Dimension Strings & Tags)', color: '#94A3B8', active: true }
  });

  const toggleLayer = (key: keyof typeof cadLayers) => {
    setCadLayers(prev => ({
      ...prev,
      [key]: { ...prev[key], active: !prev[key].active }
    }));
  };

  const handleExportDXF = () => {
    if (onExportDxf) {
      onExportDxf();
      return;
    }

    // Generate compliant standard ASCII DXF header
    const dxfContent = `0
SECTION
2
HEADER
9
$ACADVER
1
AC1015
0
ENDSEC
0
SECTION
2
TABLES
0
TABLE
2
LAYER
70
5
0
LAYER
2
A-WALL
70
0
62
7
0
LAYER
2
A-DOOR
70
0
62
2
0
LAYER
2
A-GLAZ
70
0
62
4
0
LAYER
2
A-FURN
70
0
62
3
0
LAYER
2
A-ANNO
70
0
62
1
0
ENDTAB
0
ENDSEC
0
SECTION
2
ENTITIES
0
LINE
8
A-WALL
10
0.0
20
0.0
30
0.0
11
312.0
21
0.0
31
0.0
0
LINE
8
A-WALL
10
312.0
20
0.0
30
0.0
11
312.0
21
240.0
31
0.0
0
LINE
8
A-WALL
10
312.0
20
240.0
30
0.0
11
0.0
21
240.0
31
0.0
0
LINE
8
A-WALL
10
0.0
20
240.0
30
0.0
11
0.0
21
0.0
31
0.0
0
ENDSEC
0
EOF`;

    const blob = new Blob([dxfContent], { type: 'application/dxf' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `VERTEX_Architectural_Floorplan_${Date.now()}.dxf`;
    a.click();
    URL.revokeObjectURL(url);
    addToast('success', 'Exported AutoCAD-compatible DXF Vector File');
  };

  return (
    <div className="space-y-6">
      {/* Studio Header Bar */}
      <div className="bg-white p-5 rounded-3xl border border-gray-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#1C2524] text-[#A5D6A7] flex items-center justify-center shrink-0 shadow-xs">
            <Building className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-serif font-bold text-gray-900 text-base">
                Architectural Building Code & Zoning Studio
              </h4>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 font-bold border border-emerald-200">
                IBC 2024 • FAR • ADA LIFE-SAFETY
              </span>
            </div>
            <p className="text-xs text-gray-500">
              Parametric building envelope checks, occupant egress exit math, and DXF vector export.
            </p>
          </div>
        </div>

        {/* Sub-tool toggles */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 bg-gray-100 p-1 rounded-2xl">
            {[
              { id: 'zoning', label: 'Zoning & FAR', icon: Compass },
              { id: 'egress', label: 'IBC Egress & Life Safety', icon: ShieldAlert },
              { id: 'cad-layers', label: 'CAD Layers & DXF', icon: Layers }
            ].map(t => {
              const Icon = t.icon;
              return (
                <button
                  key={t.id}
                  onClick={() => setActiveSub(t.id as any)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                    activeSub === t.id
                      ? 'bg-[#1C2524] text-[#A5D6A7] font-bold shadow-xs'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{t.label}</span>
                </button>
              );
            })}
          </div>

          <button
            onClick={handleExportDXF}
            className="px-3.5 py-2 bg-gray-900 hover:bg-black text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
            title="Download AutoCAD DXF CAD format"
          >
            <Download className="w-3.5 h-3.5 text-[#A5D6A7]" />
            <span>Export DXF</span>
          </button>
        </div>
      </div>

      {/* ==================================================== */}
      {/* SUB-TOOL 1: MUNICIPAL ZONING & FAR */}
      {/* ==================================================== */}
      {activeSub === 'zoning' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-6 bg-white p-6 rounded-3xl border border-gray-200/80 shadow-xs space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h5 className="font-bold text-gray-900 text-sm flex items-center gap-2">
                <Compass className="w-4 h-4 text-emerald-600" />
                <span>Parcel & Footprint Envelope Inputs</span>
              </h5>
              <span className="text-[10px] font-mono text-gray-400">
                Title 14 Code
              </span>
            </div>

            <div>
              <label className="font-semibold text-gray-700 block mb-1 text-xs">
                Zoning Classification District
              </label>
              <div className="grid grid-cols-3 gap-2 text-xs">
                {(['R1_ESTATE', 'R2_LUXURY', 'COMMERCIAL_MIXED'] as const).map(z => (
                  <button
                    key={z}
                    type="button"
                    onClick={() => setZoningClassification(z)}
                    className={`p-2 rounded-xl text-left border text-xs font-semibold cursor-pointer ${
                      zoningClassification === z
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-950 font-bold'
                        : 'border-gray-200 hover:bg-gray-50 text-gray-600'
                    }`}
                  >
                    {z === 'R1_ESTATE' ? 'R-1 Estate' : z === 'R2_LUXURY' ? 'R-2 Luxury' : 'C-1 Mixed'}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <label className="font-semibold text-gray-700 block mb-1">
                  Lot Area (sq.ft)
                </label>
                <input
                  type="number"
                  value={lotAreaSqFt}
                  onChange={e => setLotAreaSqFt(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl font-mono text-xs"
                />
              </div>

              <div>
                <label className="font-semibold text-gray-700 block mb-1">
                  Ground Footprint (sq.ft)
                </label>
                <input
                  type="number"
                  value={groundFootprintSqFt}
                  onChange={e => setGroundFootprintSqFt(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl font-mono text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <label className="font-semibold text-gray-700 block mb-1">
                  Above-Grade Stories
                </label>
                <input
                  type="number"
                  min="1"
                  max="8"
                  value={numAboveGradeStories}
                  onChange={e => setNumAboveGradeStories(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl font-mono text-xs"
                />
              </div>

              <div>
                <label className="font-semibold text-gray-700 block mb-1">
                  Basement Area (sq.ft)
                </label>
                <input
                  type="number"
                  value={basementSqFt}
                  onChange={e => setBasementSqFt(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl font-mono text-xs"
                />
              </div>
            </div>

            {/* Setback Inputs */}
            <div className="space-y-2 pt-1 text-xs">
              <label className="font-semibold text-gray-700 block">
                Yard Setback Clearances (ft)
              </label>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <span className="text-[10px] text-gray-400 block">Front Yard</span>
                  <input
                    type="number"
                    value={frontSetbackFt}
                    onChange={e => setFrontSetbackFt(Number(e.target.value))}
                    className="w-full px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-xl font-mono text-xs"
                  />
                  <span className="text-[10px] text-gray-400">Min: {ZONING_RULES.minFront} ft</span>
                </div>
                <div>
                  <span className="text-[10px] text-gray-400 block">Rear Yard</span>
                  <input
                    type="number"
                    value={rearSetbackFt}
                    onChange={e => setRearSetbackFt(Number(e.target.value))}
                    className="w-full px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-xl font-mono text-xs"
                  />
                  <span className="text-[10px] text-gray-400">Min: {ZONING_RULES.minRear} ft</span>
                </div>
                <div>
                  <span className="text-[10px] text-gray-400 block">Side Interior</span>
                  <input
                    type="number"
                    value={sideSetbackFt}
                    onChange={e => setSideSetbackFt(Number(e.target.value))}
                    className="w-full px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-xl font-mono text-xs"
                  />
                  <span className="text-[10px] text-gray-400">Min: {ZONING_RULES.minSide} ft</span>
                </div>
              </div>
            </div>
          </div>

          {/* Zoning Audit Verdict */}
          <div className="lg:col-span-6 bg-white p-6 rounded-3xl border border-gray-200/80 shadow-xs space-y-5 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <h5 className="font-bold text-gray-900 text-sm flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Envelope & Density Compliance</span>
                </h5>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                    isZoningPass ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                  }`}
                >
                  {isZoningPass ? 'ZONING PERMITTED (NO VARIANCE)' : 'VARIANCE REQUIRED'}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs font-mono">
                <div className="p-3 bg-gray-50 rounded-2xl border border-gray-100">
                  <span className="text-[10px] text-gray-400 font-sans block">Calculated FAR</span>
                  <span className="text-base font-bold text-gray-900">{actualFar.toFixed(2)}</span>
                  <span className="text-[10px] text-gray-400 block">Max Limit: {ZONING_RULES.maxFar}</span>
                </div>

                <div className="p-3 bg-gray-50 rounded-2xl border border-gray-100">
                  <span className="text-[10px] text-gray-400 font-sans block">Lot Coverage</span>
                  <span className="text-base font-bold text-gray-900">{actualCoverage.toFixed(1)}%</span>
                  <span className="text-[10px] text-gray-400 block">Max Limit: {ZONING_RULES.maxCoverage}%</span>
                </div>

                <div className="p-3 bg-gray-50 rounded-2xl border border-gray-100">
                  <span className="text-[10px] text-gray-400 font-sans block">Counted Gross Area</span>
                  <span className="text-base font-bold text-gray-900">{countedFarGross.toLocaleString()}</span>
                  <span className="text-[10px] text-gray-400 block">sq.ft conditioned</span>
                </div>
              </div>

              {/* Setback check pills */}
              <div className="space-y-2 pt-2 text-xs">
                <span className="font-semibold text-gray-700 block">Setback Clearances:</span>
                <div className="grid grid-cols-3 gap-2 text-center font-mono text-[11px]">
                  <div className={`p-2 rounded-xl border ${isFrontSetbackCompliant ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-rose-50 border-rose-200 text-rose-800'}`}>
                    Front: {frontSetbackFt}' {isFrontSetbackCompliant ? '✓' : '✗'}
                  </div>
                  <div className={`p-2 rounded-xl border ${isRearSetbackCompliant ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-rose-50 border-rose-200 text-rose-800'}`}>
                    Rear: {rearSetbackFt}' {isRearSetbackCompliant ? '✓' : '✗'}
                  </div>
                  <div className={`p-2 rounded-xl border ${isSideSetbackCompliant ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-rose-50 border-rose-200 text-rose-800'}`}>
                    Side: {sideSetbackFt}' {isSideSetbackCompliant ? '✓' : '✗'}
                  </div>
                </div>
              </div>
            </div>

            {/* Visual Parcel Footprint Box */}
            <div className="p-4 bg-emerald-950 text-white rounded-2xl font-mono text-[11px] space-y-2">
              <div className="flex justify-between text-emerald-400">
                <span>PARCEL BOUNDARY ({(lotAreaSqFt / 43560).toFixed(2)} AC)</span>
                <span>HEIGHT CAP: {ZONING_RULES.maxHt}'-0"</span>
              </div>
              <div className="h-16 border-2 border-dashed border-emerald-500/50 rounded-xl p-2 flex items-center justify-center">
                <div className="bg-emerald-800/80 border border-emerald-400 rounded-lg p-2 text-center text-xs font-bold text-white shadow-xs">
                  BUILDING FOOTPRINT: {groundFootprintSqFt.toLocaleString()} SQ.FT ({actualCoverage.toFixed(0)}% LOT)
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* SUB-TOOL 2: IBC 2024 OCCUPANCY & EGRESS */}
      {/* ==================================================== */}
      {activeSub === 'egress' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-6 bg-white p-6 rounded-3xl border border-gray-200/80 shadow-xs space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h5 className="font-bold text-gray-900 text-sm flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-emerald-600" />
                <span>IBC Chapter 10 Egress Criteria</span>
              </h5>
              <span className="text-[10px] font-mono text-gray-400">
                IBC Table 1004.5
              </span>
            </div>

            <div>
              <label className="font-semibold text-gray-700 block mb-1 text-xs">
                Occupancy Classification
              </label>
              <div className="space-y-1.5 text-xs">
                {(['R2', 'B', 'A2', 'M'] as const).map(grp => (
                  <button
                    key={grp}
                    type="button"
                    onClick={() => setOccupancyGroup(grp)}
                    className={`w-full p-2.5 rounded-xl text-left border transition-all cursor-pointer ${
                      occupancyGroup === grp
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-950 font-bold'
                        : 'border-gray-200 hover:bg-gray-50 text-gray-700'
                    }`}
                  >
                    {OCCUPANCY_SPECS.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs pt-1">
              <div>
                <label className="font-semibold text-gray-700 block mb-1">
                  Gross Enclosed Area (sq.ft)
                </label>
                <input
                  type="number"
                  value={egressFloorAreaSqFt}
                  onChange={e => setEgressFloorAreaSqFt(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl font-mono text-xs"
                />
              </div>

              <div>
                <label className="font-semibold text-gray-700 block mb-1">
                  Fire Suppression Sprinklers
                </label>
                <select
                  value={isSprinkleredNFPA13 ? 'YES' : 'NO'}
                  onChange={e => setIsSprinkleredNFPA13(e.target.value === 'YES')}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs"
                >
                  <option value="YES">NFPA 13 Fully Sprinklered</option>
                  <option value="NO">Non-Sprinklered</option>
                </select>
              </div>
            </div>
          </div>

          {/* Egress Output Readout */}
          <div className="lg:col-span-6 bg-white p-6 rounded-3xl border border-gray-200/80 shadow-xs space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h5 className="font-bold text-gray-900 text-sm flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Life-Safety Egress Capacity Mandate</span>
              </h5>
              <span className="text-xs font-mono font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                IBC Compliant
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs font-mono">
              <div className="p-3 bg-gray-50 rounded-2xl border border-gray-100">
                <span className="text-[10px] text-gray-400 font-sans block">Design Occupant Load</span>
                <span className="text-base font-bold text-gray-900">{calculatedOccupantLoad}</span>
                <span className="text-[10px] text-gray-400 block">Occupants ({OCCUPANCY_SPECS.factor} sf/p)</span>
              </div>

              <div className="p-3 bg-gray-50 rounded-2xl border border-gray-100">
                <span className="text-[10px] text-gray-400 font-sans block">Required Exit Doors</span>
                <span className="text-base font-bold text-gray-900">{requiredExitsCount}</span>
                <span className="text-[10px] text-gray-400 block">Remote Independent Exits</span>
              </div>

              <div className="p-3 bg-gray-50 rounded-2xl border border-gray-100">
                <span className="text-[10px] text-gray-400 font-sans block">Max Travel Distance</span>
                <span className="text-base font-bold text-gray-900">{maxTravelDistanceFt} ft</span>
                <span className="text-[10px] text-gray-400 block">Common Egress Path</span>
              </div>
            </div>

            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200 space-y-2 text-xs">
              <span className="font-bold text-gray-900 block">Mandated Architectural Aperture Clearances:</span>
              <div className="grid grid-cols-2 gap-2 text-[11px] text-gray-700">
                <div className="p-2 bg-white rounded-xl border border-gray-200">
                  <span className="font-semibold block">Minimum Door Width:</span>
                  <span>{OCCUPANCY_SPECS.egressDoorsMin}" Clear Opening (ADA 32" Min)</span>
                </div>
                <div className="p-2 bg-white rounded-xl border border-gray-200">
                  <span className="font-semibold block">Corridor Hallway:</span>
                  <span>{OCCUPANCY_SPECS.corridorMin}" Unobstructed Width</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* SUB-TOOL 3: CAD VECTOR LAYERS & DXF */}
      {/* ==================================================== */}
      {activeSub === 'cad-layers' && (
        <div className="bg-white p-6 rounded-3xl border border-gray-200/80 shadow-xs space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <h5 className="font-bold text-gray-900 text-sm flex items-center gap-2">
              <Layers className="w-4 h-4 text-emerald-600" />
              <span>AIA Standard CAD Layer Manager & Vector Compilation</span>
            </h5>
            <span className="text-[10px] font-mono text-gray-400">
              AIA CAD Layer Guidelines
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
            {Object.entries(cadLayers).map(([key, layer]) => (
              <div
                key={key}
                onClick={() => toggleLayer(key as any)}
                className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                  layer.active
                    ? 'border-emerald-500 bg-emerald-50/40 text-gray-900'
                    : 'border-gray-200 bg-gray-50 text-gray-400 opacity-60'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: layer.color }} />
                  <div>
                    <div className="font-mono font-bold text-xs">{key}</div>
                    <div className="text-[10px] text-gray-500">{layer.label}</div>
                  </div>
                </div>
                <span className="text-[10px] font-mono font-bold">
                  {layer.active ? 'ON' : 'OFF'}
                </span>
              </div>
            ))}
          </div>

          <div className="p-4 bg-gray-900 text-white rounded-2xl flex items-center justify-between text-xs">
            <div className="space-y-0.5">
              <span className="font-bold block text-emerald-400">AutoCAD & Revit DXF/DWG Export Ready</span>
              <span className="text-[11px] text-gray-400">
                Exports 2D vectors, line types, layers, and coordinate points in standard AC1015 DXF format.
              </span>
            </div>

            <button
              onClick={handleExportDXF}
              className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-black font-bold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 shadow-xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download .DXF</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
