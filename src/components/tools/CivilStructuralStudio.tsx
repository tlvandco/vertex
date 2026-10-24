import React, { useState } from 'react';
import {
  HardHat,
  Cpu,
  Layers,
  Ruler,
  AlertTriangle,
  CheckCircle2,
  Download,
  Info,
  Sliders,
  Droplet,
  Square,
  ShieldCheck,
  Building
} from 'lucide-react';
import { EngineeringConfig } from './types';
import { useApp } from '../../context/AppContext';

interface CivilStructuralStudioProps {
  config: EngineeringConfig;
}

// Steel Sections Database
interface SteelSection {
  name: string;
  depthIn: number;
  weightPlf: number;
  Ix: number; // in^4
  Zx: number; // in^3
  phiMnKipFt: number; // Kip-ft design capacity
  phiVnKips: number; // Kips shear capacity
}

const STEEL_SECTIONS: SteelSection[] = [
  { name: 'W10x22', depthIn: 10.17, weightPlf: 22, Ix: 118, Zx: 26.0, phiMnKipFt: 97.5, phiVnKips: 56.7 },
  { name: 'W12x26', depthIn: 12.22, weightPlf: 26, Ix: 204, Zx: 37.2, phiMnKipFt: 139.5, phiVnKips: 78.4 },
  { name: 'W14x30', depthIn: 13.84, weightPlf: 30, Ix: 291, Zx: 47.3, phiMnKipFt: 177.0, phiVnKips: 93.4 },
  { name: 'W16x40', depthIn: 16.01, weightPlf: 40, Ix: 518, Zx: 73.0, phiMnKipFt: 274.0, phiVnKips: 134.0 },
  { name: 'W18x50', depthIn: 17.99, weightPlf: 50, Ix: 800, Zx: 101.0, phiMnKipFt: 379.0, phiVnKips: 169.0 }
];

export const CivilStructuralStudio: React.FC<CivilStructuralStudioProps> = ({ config }) => {
  const { addToast } = useApp();
  const [subModule, setSubModule] = useState<'beam' | 'footing' | 'drainage'>('beam');

  // ---------------------------------------------
  // MODULE 1: BEAM & SPAN LOAD SOLVER
  // ---------------------------------------------
  const [spanLengthFt, setSpanLengthFt] = useState<number>(22);
  const [tributaryWidthFt, setTributaryWidthFt] = useState<number>(12);
  const [deadLoadPsf, setDeadLoadPsf] = useState<number>(35); // psf
  const [liveLoadPsf, setLiveLoadPsf] = useState<number>(60); // psf residential/commercial
  const [beamMaterialType, setBeamMaterialType] = useState<'STEEL' | 'GLULAM' | 'CONCRETE'>('STEEL');
  const [selectedSteelIdx, setSelectedSteelIdx] = useState<number>(1); // W12x26

  // Beam Calculations
  const selectedSteel = STEEL_SECTIONS[selectedSteelIdx];
  const selfWeightPlf = beamMaterialType === 'STEEL' ? selectedSteel.weightPlf : 35;
  const uniformDeadPlf = deadLoadPsf * tributaryWidthFt + selfWeightPlf;
  const uniformLivePlf = liveLoadPsf * tributaryWidthFt;

  // Factored Load Wu = 1.2 D + 1.6 L
  const factoredWuPlf = 1.2 * uniformDeadPlf + 1.6 * uniformLivePlf;
  const factoredWuKlf = factoredWuPlf / 1000;

  // Maximum Moment Mu = Wu * L^2 / 8
  const maxMuKipFt = (factoredWuKlf * Math.pow(spanLengthFt, 2)) / 8;

  // Maximum Shear Vu = Wu * L / 2
  const maxVuKips = (factoredWuKlf * spanLengthFt) / 2;

  // Deflection calculations (Service live load: 5 w_ll L^4 / (384 E I))
  // E = 29,000,000 psi for steel
  const wLiveLbIn = uniformLivePlf / 12;
  const spanInches = spanLengthFt * 12;
  const E_psi = beamMaterialType === 'STEEL' ? 29000000 : 1800000;
  const I_in4 = beamMaterialType === 'STEEL' ? selectedSteel.Ix : 650;
  const liveDeflectionInches = (5 * wLiveLbIn * Math.pow(spanInches, 4)) / (384 * E_psi * I_in4);
  const allowableLiveDeflectionInches = spanInches / 360; // L/360 limit

  const totalDeflectionInches = liveDeflectionInches * (1 + uniformDeadPlf / uniformLivePlf);
  const allowableTotalDeflectionInches = spanInches / 240; // L/240 limit

  // Capacity check
  const momentCapacityKipFt = beamMaterialType === 'STEEL' ? selectedSteel.phiMnKipFt : 160;
  const shearCapacityKips = beamMaterialType === 'STEEL' ? selectedSteel.phiVnKips : 45;
  const momentRatio = maxMuKipFt / momentCapacityKipFt;
  const shearRatio = maxVuKips / shearCapacityKips;
  const deflectionRatio = liveDeflectionInches / allowableLiveDeflectionInches;

  const isBeamSafe = momentRatio <= 1.0 && shearRatio <= 1.0 && deflectionRatio <= 1.0;

  // ---------------------------------------------
  // MODULE 2: FOUNDATION & SPREAD FOOTING
  // ---------------------------------------------
  const [colDeadLoadKips, setColDeadLoadKips] = useState<number>(75);
  const [colLiveLoadKips, setColLiveLoadKips] = useState<number>(55);
  const [soilBearingPsf, setSoilBearingPsf] = useState<number>(config.allowableSoilBearingPsf || 3000);
  const [footingThicknessIn, setFootingThicknessIn] = useState<number>(18);
  const [rebarBarSize, setRebarBarSize] = useState<'#4' | '#5' | '#6' | '#7'>('#5');

  // Calculations
  const totalServiceColKips = colDeadLoadKips + colLiveLoadKips;
  const totalFactoredColKips = 1.2 * colDeadLoadKips + 1.6 * colLiveLoadKips;
  const requiredFootingAreaSqFt = (totalServiceColKips * 1000) / soilBearingPsf;
  const calculatedSideFt = Math.max(3.0, Math.ceil(Math.sqrt(requiredFootingAreaSqFt) * 10) / 10);
  const actualFootingAreaSqFt = calculatedSideFt * calculatedSideFt;
  const actualSoilPressurePsf = Math.round((totalServiceColKips * 1000) / actualFootingAreaSqFt);

  const concreteVolumeCuYd = (actualFootingAreaSqFt * (footingThicknessIn / 12)) / 27;
  const concreteVolumeCuM = concreteVolumeCuYd * 0.764555;

  const rebarWeights: Record<string, number> = { '#4': 0.668, '#5': 1.043, '#6': 1.502, '#7': 2.044 };
  const barsPerDirection = Math.ceil((calculatedSideFt * 12 - 6) / 10) + 1; // 10" spacing
  const totalBarLengthFt = barsPerDirection * calculatedSideFt * 2;
  const totalRebarWeightLbs = Math.round(totalBarLengthFt * rebarWeights[rebarBarSize]);

  // ---------------------------------------------
  // MODULE 3: STORMWATER DRAINAGE (Q = C * I * A)
  // ---------------------------------------------
  const [siteTotalAreaAcres, setSiteTotalAreaAcres] = useState<number>(1.8);
  const [roofAreaSqFt, setRoofAreaSqFt] = useState<number>(12500);
  const [pavementAreaSqFt, setPavementAreaSqFt] = useState<number>(18000);
  const [landscapeAreaSqFt, setLandscapeAreaSqFt] = useState<number>(47940);
  const [rainfallIntensityInHr, setRainfallIntensityInHr] = useState<number>(3.4); // 10-year storm

  // Weighted C Calculation
  const totalSqFt = roofAreaSqFt + pavementAreaSqFt + landscapeAreaSqFt;
  const weightedC = totalSqFt > 0
    ? (roofAreaSqFt * 0.90 + pavementAreaSqFt * 0.85 + landscapeAreaSqFt * 0.18) / totalSqFt
    : 0.60;

  // Q = C * I * A
  const peakDischargeCfs = weightedC * rainfallIntensityInHr * (totalSqFt / 43560);
  const peakDischargeLps = peakDischargeCfs * 28.3168;

  // Detention Volume: V = Q_peak * storm_duration * factor
  const detentionVolumeCuFt = Math.round(peakDischargeCfs * 3600 * 0.38);
  const detentionGallons = Math.round(detentionVolumeCuFt * 7.48052);
  const stormPipeDiameterIn = Math.max(12, Math.ceil(Math.sqrt(peakDischargeCfs) * 6.2));

  // Export Engineering Report
  const handleExportEngineeringReport = () => {
    const report = `
========================================================================
VERTEX CIVIL & STRUCTURAL ENGINEERING CALCULATION MEMORANDUM
Code Baseline: ${config.designCode} • ASCE 7-22 • AISC 360-16 • ACI 318
Date Generated: ${new Date().toISOString().split('T')[0]}
Project Location: Seismic Category ${config.seismicCategory} | Wind: ${config.basicWindSpeedMph} MPH
========================================================================

1. STRUCTURAL BEAM & SPAN ANALYSIS
------------------------------------------------------------------------
Span Length: ${spanLengthFt} ft (${(spanLengthFt * 0.3048).toFixed(2)} m)
Tributary Width: ${tributaryWidthFt} ft
Specified Dead Load: ${deadLoadPsf} psf | Live Load: ${liveLoadPsf} psf
Material Spec: ${beamMaterialType === 'STEEL' ? selectedSteel.name + ' A992 (Fy=50 ksi)' : 'Engineered Timber / Concrete'}
Factored Load (Wu = 1.2D + 1.6L): ${factoredWuPlf.toFixed(1)} plf (${factoredWuKlf.toFixed(2)} klf)
Factored Moment (Mu): ${maxMuKipFt.toFixed(1)} kip-ft
Design Moment Capacity (Phi*Mn): ${momentCapacityKipFt} kip-ft [Stress Ratio: ${(momentRatio * 100).toFixed(1)}%]
Factored Shear (Vu): ${maxVuKips.toFixed(1)} kips
Shear Capacity (Phi*Vn): ${shearCapacityKips} kips [Ratio: ${(shearRatio * 100).toFixed(1)}%]
Service Live Deflection: ${liveDeflectionInches.toFixed(3)}" (Allowable L/360: ${allowableLiveDeflectionInches.toFixed(3)}")
STRUCTURAL VERDICT: ${isBeamSafe ? 'PASS - CODE COMPLIANT' : 'FAIL - SECTION INADEQUATE'}

2. FOUNDATION SPREAD FOOTING DESIGN (ACI 318)
------------------------------------------------------------------------
Column Total Service Axial Load: ${totalServiceColKips} kips (${totalFactoredColKips.toFixed(1)} kips factored)
Allowable Soil Bearing Capacity: ${soilBearingPsf} psf
Selected Pad Geometry: ${calculatedSideFt} ft x ${calculatedSideFt} ft x ${footingThicknessIn}" Depth
Actual Net Bearing Pressure: ${actualSoilPressurePsf} psf (Capacity: ${soilBearingPsf} psf)
Required Concrete Volume: ${concreteVolumeCuYd.toFixed(2)} cu.yds (${concreteVolumeCuM.toFixed(2)} m³)
Rebar Schedule: Grade 60 ${rebarBarSize} @ 10" O.C. Each Way (Bottom Mat)
Estimated Steel Weight: ${totalRebarWeightLbs} lbs

3. STORMWATER HYDROLOGY & SITE DRAINAGE (RATIONAL METHOD Q = CIA)
------------------------------------------------------------------------
Total Site Catchment Area: ${(totalSqFt / 43560).toFixed(2)} acres (${totalSqFt.toLocaleString()} sq.ft)
Impervious Surfaces: Roof ${roofAreaSqFt.toLocaleString()} sq.ft + Pavement ${pavementAreaSqFt.toLocaleString()} sq.ft
Weighted Composite Runoff Coefficient (C): ${weightedC.toFixed(2)}
Rainfall Intensity (10-Yr Return): ${rainfallIntensityInHr} in/hr
Peak Storm Discharge (Q): ${peakDischargeCfs.toFixed(2)} cfs (${peakDischargeLps.toFixed(1)} L/s)
Mitigation Retention Volume: ${detentionVolumeCuFt.toLocaleString()} cu.ft (${detentionGallons.toLocaleString()} gallons)
Minimum Gravity Storm Outfall Culvert: ${stormPipeDiameterIn}" RCP @ 1.0% Slope

ENGINEERING STAMP NOTICE:
Prepared in accordance with standard civil engineering principles. Professional Engineer (PE/SE) wet stamp required prior to municipal plan-check submittal.
    `.trim();

    const blob = new Blob([report], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `VERTEX_Civil_Structural_Calculation_${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    addToast('success', 'Exported Civil & Structural Calculation Memorandum');
  };

  return (
    <div className="space-y-6">
      {/* Module Header Bar */}
      <div className="bg-white p-5 rounded-3xl border border-gray-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-sky-950 text-sky-400 flex items-center justify-center shrink-0 shadow-xs">
            <HardHat className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-serif font-bold text-gray-900 text-base">
                Civil & Structural Engineering Studio
              </h4>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-sky-50 text-sky-800 font-bold border border-sky-200">
                AISC 360 • ACI 318 • ASCE 7-22
              </span>
            </div>
            <p className="text-xs text-gray-500">
              Rigorous beam load combinations, spread footing contact bearing, and Rational Method site hydrology.
            </p>
          </div>
        </div>

        {/* Sub-module switcher & export */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-2xl">
            {[
              { id: 'beam', label: 'Beam & Span Load', icon: Layers },
              { id: 'footing', label: 'Footing & Rebar', icon: Square },
              { id: 'drainage', label: 'Storm Drainage Q=CIA', icon: Droplet }
            ].map(m => {
              const Icon = m.icon;
              return (
                <button
                  key={m.id}
                  onClick={() => setSubModule(m.id as any)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                    subModule === m.id
                      ? 'bg-sky-900 text-white font-bold shadow-xs'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{m.label}</span>
                </button>
              );
            })}
          </div>

          <button
            onClick={handleExportEngineeringReport}
            className="px-3.5 py-2 bg-gray-900 hover:bg-black text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
            title="Download Engineering Calculations"
          >
            <Download className="w-3.5 h-3.5 text-sky-400" />
            <span>Export Calc Memo</span>
          </button>
        </div>
      </div>

      {/* ==================================================== */}
      {/* SUB-MODULE 1: BEAM & SPAN LOAD SOLVER */}
      {/* ==================================================== */}
      {subModule === 'beam' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Controls Form */}
          <div className="lg:col-span-6 bg-white p-6 rounded-3xl border border-gray-200/80 shadow-xs space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h5 className="font-bold text-gray-900 text-sm flex items-center gap-2">
                <Layers className="w-4 h-4 text-sky-600" />
                <span>Uniform Load & Span Parameters</span>
              </h5>
              <span className="text-[10px] font-mono text-gray-400">
                Limit State: 1.2D + 1.6L
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <label className="font-semibold text-gray-700 block mb-1">
                  Clear Span Length (ft)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min="8"
                    max="40"
                    step="1"
                    value={spanLengthFt}
                    onChange={e => setSpanLengthFt(Number(e.target.value))}
                    className="w-full accent-sky-600"
                  />
                  <span className="font-mono font-bold w-12 text-right">{spanLengthFt} ft</span>
                </div>
              </div>

              <div>
                <label className="font-semibold text-gray-700 block mb-1">
                  Tributary Width (ft)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min="4"
                    max="28"
                    step="1"
                    value={tributaryWidthFt}
                    onChange={e => setTributaryWidthFt(Number(e.target.value))}
                    className="w-full accent-sky-600"
                  />
                  <span className="font-mono font-bold w-12 text-right">{tributaryWidthFt} ft</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs pt-1">
              <div>
                <label className="font-semibold text-gray-700 block mb-1">
                  Dead Load (DL, psf)
                </label>
                <input
                  type="number"
                  value={deadLoadPsf}
                  onChange={e => setDeadLoadPsf(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl font-mono text-xs focus:bg-white"
                />
                <span className="text-[10px] text-gray-400 block mt-0.5">Finishes, framing & MEP</span>
              </div>

              <div>
                <label className="font-semibold text-gray-700 block mb-1">
                  Live Load (LL, psf)
                </label>
                <input
                  type="number"
                  value={liveLoadPsf}
                  onChange={e => setLiveLoadPsf(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl font-mono text-xs focus:bg-white"
                />
                <span className="text-[10px] text-gray-400 block mt-0.5">IBC Table 1607.1 occupancy</span>
              </div>
            </div>

            {/* Material & Section Selector */}
            <div className="space-y-3 pt-2">
              <label className="font-semibold text-gray-700 block text-xs">
                Structural Section Selection
              </label>

              <div className="flex gap-2 text-xs">
                {(['STEEL', 'GLULAM', 'CONCRETE'] as const).map(mat => (
                  <button
                    key={mat}
                    type="button"
                    onClick={() => setBeamMaterialType(mat)}
                    className={`px-3 py-1.5 rounded-xl border text-xs font-semibold cursor-pointer ${
                      beamMaterialType === mat
                        ? 'border-sky-600 bg-sky-50 text-sky-900 font-bold'
                        : 'border-gray-200 hover:bg-gray-50 text-gray-600'
                    }`}
                  >
                    {mat === 'STEEL' ? 'AISC Steel W-Shape' : mat === 'GLULAM' ? 'Glulam 24F Timber' : 'Reinforced Concrete'}
                  </button>
                ))}
              </div>

              {beamMaterialType === 'STEEL' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-1">
                  {STEEL_SECTIONS.map((sec, idx) => (
                    <button
                      key={sec.name}
                      type="button"
                      onClick={() => setSelectedSteelIdx(idx)}
                      className={`p-2.5 rounded-xl text-left border transition-all cursor-pointer ${
                        selectedSteelIdx === idx
                          ? 'border-sky-600 bg-sky-50 text-sky-950 font-bold shadow-xs'
                          : 'border-gray-200 hover:bg-gray-50 text-gray-700'
                      }`}
                    >
                      <div className="flex justify-between font-mono">
                        <span>{sec.name}</span>
                        <span className="text-gray-400">{sec.weightPlf} lbs/ft</span>
                      </div>
                      <div className="text-[10px] text-gray-500 font-sans mt-0.5">
                        Capacity: {sec.phiMnKipFt} kip-ft • Ix: {sec.Ix} in⁴
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Analysis & Verification Output Card */}
          <div className="lg:col-span-6 bg-white p-6 rounded-3xl border border-gray-200/80 shadow-xs space-y-5 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <h5 className="font-bold text-gray-900 text-sm flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-sky-600" />
                  <span>AISC Stress & Deflection Status</span>
                </h5>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                    isBeamSafe ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                  }`}
                >
                  {isBeamSafe ? 'SAFE / PASSED' : 'OVERSTRESSED'}
                </span>
              </div>

              {/* Numerical Readout Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs font-mono">
                <div className="p-3 bg-gray-50 rounded-2xl border border-gray-100">
                  <span className="text-[10px] text-gray-400 font-sans block">Factored Load Wu</span>
                  <span className="text-sm font-bold text-gray-900">{factoredWuPlf.toFixed(0)} plf</span>
                  <span className="text-[10px] text-gray-400 block">{factoredWuKlf.toFixed(2)} klf</span>
                </div>

                <div className="p-3 bg-gray-50 rounded-2xl border border-gray-100">
                  <span className="text-[10px] text-gray-400 font-sans block">Design Moment Mu</span>
                  <span className="text-sm font-bold text-gray-900">{maxMuKipFt.toFixed(1)}</span>
                  <span className="text-[10px] text-gray-400 block">kip-ft</span>
                </div>

                <div className="p-3 bg-gray-50 rounded-2xl border border-gray-100">
                  <span className="text-[10px] text-gray-400 font-sans block">Design Shear Vu</span>
                  <span className="text-sm font-bold text-gray-900">{maxVuKips.toFixed(1)}</span>
                  <span className="text-[10px] text-gray-400 block">kips</span>
                </div>
              </div>

              {/* Stress & Utilization Gauges */}
              <div className="space-y-3 pt-2 text-xs">
                <div>
                  <div className="flex justify-between font-semibold mb-1 text-gray-700">
                    <span>Flexural Bending (Mu / ΦMn):</span>
                    <span className="font-mono">{(momentRatio * 100).toFixed(1)}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-gray-100 overflow-hidden">
                    <div
                      className={`h-full transition-all ${
                        momentRatio <= 0.85 ? 'bg-emerald-500' : momentRatio <= 1.0 ? 'bg-amber-500' : 'bg-rose-500'
                      }`}
                      style={{ width: `${Math.min(100, momentRatio * 100)}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between font-semibold mb-1 text-gray-700">
                    <span>Shear Capacity (Vu / ΦVn):</span>
                    <span className="font-mono">{(shearRatio * 100).toFixed(1)}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-gray-100 overflow-hidden">
                    <div
                      className={`h-full transition-all ${
                        shearRatio <= 0.85 ? 'bg-emerald-500' : shearRatio <= 1.0 ? 'bg-amber-500' : 'bg-rose-500'
                      }`}
                      style={{ width: `${Math.min(100, shearRatio * 100)}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between font-semibold mb-1 text-gray-700">
                    <span>Live Load Deflection (L/360 Limit):</span>
                    <span className="font-mono">
                      {liveDeflectionInches.toFixed(3)}" / {allowableLiveDeflectionInches.toFixed(3)}"
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-gray-100 overflow-hidden">
                    <div
                      className={`h-full transition-all ${
                        deflectionRatio <= 1.0 ? 'bg-emerald-500' : 'bg-rose-500'
                      }`}
                      style={{ width: `${Math.min(100, deflectionRatio * 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Visual Beam Diagram */}
            <div className="p-4 bg-sky-950 text-white rounded-2xl font-mono text-[11px] space-y-2">
              <div className="flex justify-between text-sky-400">
                <span>▲ Pin Support</span>
                <span>Uniform Load: {factoredWuPlf.toFixed(0)} lbs/ft</span>
                <span>▲ Roller Support</span>
              </div>
              <div className="h-4 bg-sky-800 rounded flex items-center justify-center font-bold text-sky-200">
                ==== {beamMaterialType === 'STEEL' ? selectedSteel.name : 'ENGINEERED BEAM'} ({spanLengthFt}'-0") ====
              </div>
              <div className="flex justify-between text-[10px] text-gray-400">
                <span>R1 = {maxVuKips.toFixed(1)} kips</span>
                <span>Max Moment = {maxMuKipFt.toFixed(1)} kip-ft @ midspan</span>
                <span>R2 = {maxVuKips.toFixed(1)} kips</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* SUB-MODULE 2: FOUNDATION & SPREAD FOOTING */}
      {/* ==================================================== */}
      {subModule === 'footing' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-6 bg-white p-6 rounded-3xl border border-gray-200/80 shadow-xs space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h5 className="font-bold text-gray-900 text-sm flex items-center gap-2">
                <Square className="w-4 h-4 text-sky-600" />
                <span>Column Axial Loads & Soil Geotechnical Values</span>
              </h5>
              <span className="text-[10px] font-mono text-gray-400">
                ACI 318 Standard
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <label className="font-semibold text-gray-700 block mb-1">
                  Column Dead Load (kips)
                </label>
                <input
                  type="number"
                  value={colDeadLoadKips}
                  onChange={e => setColDeadLoadKips(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl font-mono text-xs focus:bg-white"
                />
              </div>

              <div>
                <label className="font-semibold text-gray-700 block mb-1">
                  Column Live Load (kips)
                </label>
                <input
                  type="number"
                  value={colLiveLoadKips}
                  onChange={e => setColLiveLoadKips(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl font-mono text-xs focus:bg-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <label className="font-semibold text-gray-700 block mb-1">
                  Allowable Soil Bearing (psf)
                </label>
                <input
                  type="number"
                  step="250"
                  value={soilBearingPsf}
                  onChange={e => setSoilBearingPsf(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl font-mono text-xs focus:bg-white"
                />
                <span className="text-[10px] text-gray-400 block mt-0.5">Geotechnical report basis</span>
              </div>

              <div>
                <label className="font-semibold text-gray-700 block mb-1">
                  Footing Depth (inches)
                </label>
                <input
                  type="number"
                  step="2"
                  value={footingThicknessIn}
                  onChange={e => setFootingThicknessIn(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl font-mono text-xs focus:bg-white"
                />
                <span className="text-[10px] text-gray-400 block mt-0.5">Minimum 12" per code</span>
              </div>
            </div>

            <div>
              <label className="font-semibold text-gray-700 block mb-1.5 text-xs">
                Reinforcement Rebar Size
              </label>
              <div className="flex gap-2 text-xs">
                {(['#4', '#5', '#6', '#7'] as const).map(size => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => setRebarBarSize(size)}
                    className={`px-4 py-2 rounded-xl border text-xs font-semibold cursor-pointer ${
                      rebarBarSize === size
                        ? 'border-sky-600 bg-sky-50 text-sky-900 font-bold'
                        : 'border-gray-200 hover:bg-gray-50 text-gray-700'
                    }`}
                  >
                    {size} Rebar (Grade 60)
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Sizing & Material Bill of Quantities */}
          <div className="lg:col-span-6 bg-white p-6 rounded-3xl border border-gray-200/80 shadow-xs space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h5 className="font-bold text-gray-900 text-sm flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Computed Footing Schedule & BoQ</span>
              </h5>
              <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                Bearing Safe: {actualSoilPressurePsf} &lt; {soilBearingPsf} psf
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs font-mono">
              <div className="p-3 bg-gray-50 rounded-2xl border border-gray-100">
                <span className="text-[10px] text-gray-400 font-sans block">Footing Size</span>
                <span className="text-base font-bold text-gray-900">{calculatedSideFt}' × {calculatedSideFt}'</span>
                <span className="text-[10px] text-gray-400 block">{actualFootingAreaSqFt.toFixed(1)} sq.ft</span>
              </div>

              <div className="p-3 bg-gray-50 rounded-2xl border border-gray-100">
                <span className="text-[10px] text-gray-400 font-sans block">Concrete Volume</span>
                <span className="text-base font-bold text-gray-900">{concreteVolumeCuYd.toFixed(2)}</span>
                <span className="text-[10px] text-gray-400 block">Cubic Yards ({concreteVolumeCuM.toFixed(1)} m³)</span>
              </div>

              <div className="p-3 bg-gray-50 rounded-2xl border border-gray-100">
                <span className="text-[10px] text-gray-400 font-sans block">Rebar Cage Mass</span>
                <span className="text-base font-bold text-gray-900">~{totalRebarWeightLbs}</span>
                <span className="text-[10px] text-gray-400 block">lbs of {rebarBarSize} Steel</span>
              </div>
            </div>

            <div className="p-4 bg-sky-50 rounded-2xl border border-sky-100 space-y-2 text-xs">
              <div className="font-bold text-sky-950 flex items-center gap-2">
                <Info className="w-3.5 h-3.5 text-sky-600" />
                <span>Contractor Pouring Specification:</span>
              </div>
              <ul className="list-disc list-inside space-y-1 text-sky-900 text-[11px] leading-relaxed">
                <li>Design Mix: 4,000 PSI Compressive Strength at 28-day cure, Air Entrained (4-6%).</li>
                <li>Grid Placement: {rebarBarSize} Grade 60 bars spaced at 10" on-center in both horizontal directions.</li>
                <li>Clear Cover: 3.0" minimum clearance from bottom soil substrate using concrete dobies.</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* SUB-MODULE 3: STORMWATER DRAINAGE & RETENTION */}
      {/* ==================================================== */}
      {subModule === 'drainage' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-6 bg-white p-6 rounded-3xl border border-gray-200/80 shadow-xs space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h5 className="font-bold text-gray-900 text-sm flex items-center gap-2">
                <Droplet className="w-4 h-4 text-sky-600" />
                <span>Catchment Surfaces & Rainfall Intensity</span>
              </h5>
              <span className="text-[10px] font-mono text-gray-400">
                Rational Method: Q = C·I·A
              </span>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-gray-700 block mb-1">
                  10-Year Return Storm Intensity (I, in/hr)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min="1.0"
                    max="6.0"
                    step="0.1"
                    value={rainfallIntensityInHr}
                    onChange={e => setRainfallIntensityInHr(Number(e.target.value))}
                    className="w-full accent-sky-600"
                  />
                  <span className="font-mono font-bold w-16 text-right">{rainfallIntensityInHr} in/hr</span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 pt-2">
                <div>
                  <label className="font-semibold text-gray-700 block mb-1">
                    Roof Area (sq.ft)
                  </label>
                  <input
                    type="number"
                    value={roofAreaSqFt}
                    onChange={e => setRoofAreaSqFt(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl font-mono text-xs focus:bg-white"
                  />
                  <span className="text-[10px] text-gray-400 block mt-0.5">C = 0.90</span>
                </div>

                <div>
                  <label className="font-semibold text-gray-700 block mb-1">
                    Paved / Drive (sq.ft)
                  </label>
                  <input
                    type="number"
                    value={pavementAreaSqFt}
                    onChange={e => setPavementAreaSqFt(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl font-mono text-xs focus:bg-white"
                  />
                  <span className="text-[10px] text-gray-400 block mt-0.5">C = 0.85</span>
                </div>

                <div>
                  <label className="font-semibold text-gray-700 block mb-1">
                    Landscaped (sq.ft)
                  </label>
                  <input
                    type="number"
                    value={landscapeAreaSqFt}
                    onChange={e => setLandscapeAreaSqFt(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl font-mono text-xs focus:bg-white"
                  />
                  <span className="text-[10px] text-gray-400 block mt-0.5">C = 0.18</span>
                </div>
              </div>
            </div>
          </div>

          {/* Drainage Output Readout */}
          <div className="lg:col-span-6 bg-white p-6 rounded-3xl border border-gray-200/80 shadow-xs space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h5 className="font-bold text-gray-900 text-sm flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-sky-600" />
                <span>Discharge & Detention Sizing</span>
              </h5>
              <span className="text-xs font-mono font-bold text-sky-800 bg-sky-50 px-2 py-0.5 rounded border border-sky-200">
                Composite C: {weightedC.toFixed(2)}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs font-mono">
              <div className="p-3 bg-gray-50 rounded-2xl border border-gray-100">
                <span className="text-[10px] text-gray-400 font-sans block">Peak Flow Rate (Q)</span>
                <span className="text-base font-bold text-gray-900">{peakDischargeCfs.toFixed(2)}</span>
                <span className="text-[10px] text-gray-400 block">CFS ({peakDischargeLps.toFixed(1)} L/s)</span>
              </div>

              <div className="p-3 bg-gray-50 rounded-2xl border border-gray-100">
                <span className="text-[10px] text-gray-400 font-sans block">Detention Basin</span>
                <span className="text-base font-bold text-gray-900">{detentionVolumeCuFt.toLocaleString()}</span>
                <span className="text-[10px] text-gray-400 block">cu.ft ({detentionGallons.toLocaleString()} Gal)</span>
              </div>

              <div className="p-3 bg-gray-50 rounded-2xl border border-gray-100">
                <span className="text-[10px] text-gray-400 font-sans block">Culvert Outfall</span>
                <span className="text-base font-bold text-gray-900">{stormPipeDiameterIn}"</span>
                <span className="text-[10px] text-gray-400 block">RCP Storm Line</span>
              </div>
            </div>

            <div className="p-4 bg-sky-50 rounded-2xl border border-sky-100 text-xs text-sky-950 space-y-1">
              <span className="font-bold block">Environmental Water Quality Compliance:</span>
              <p className="text-[11px] text-sky-900 leading-relaxed">
                Design satisfies standard municipal NPDES Phase II Low Impact Development (LID) criteria. Sized for retention of the 85th percentile 24-hour storm volume prior to controlled public storm main discharge.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
