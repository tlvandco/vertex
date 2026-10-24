import React from 'react';
import {
  Sliders,
  X,
  RotateCcw,
  CheckCircle2,
  Shield,
  Compass,
  Wind,
  Layers,
  HardHat,
  Cpu,
  FileCode,
  Download
} from 'lucide-react';
import { EngineeringConfig, UnitSystem, DesignCode, DEFAULT_ENGINEERING_CONFIG } from './types';
import { useApp } from '../../context/AppContext';

interface EngineeringConfigPanelProps {
  config: EngineeringConfig;
  onUpdateConfig: (newConfig: Partial<EngineeringConfig>) => void;
  onClose: () => void;
}

export const EngineeringConfigPanel: React.FC<EngineeringConfigPanelProps> = ({
  config,
  onUpdateConfig,
  onClose
}) => {
  const { addToast } = useApp();

  const handleExportJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(config, null, 2));
    const a = document.createElement('a');
    a.href = dataStr;
    a.download = `vertex_engineering_config_${Date.now()}.json`;
    a.click();
    addToast('success', 'Exported vertex_engineering_config.json');
  };

  const handleReset = () => {
    onUpdateConfig(DEFAULT_ENGINEERING_CONFIG);
    addToast('info', 'Reset all parameters to default IBC 2024 standards');
  };

  // Quick Presets
  const applyPreset = (name: string, preset: Partial<EngineeringConfig>) => {
    onUpdateConfig(preset);
    addToast('success', `Applied engineering preset: ${name}`);
  };

  return (
    <div className="bg-white rounded-3xl border border-gray-200/90 shadow-xl overflow-hidden animate-in fade-in-50 duration-200">
      {/* Chrome Header */}
      <div className="bg-[#2C2416] p-5 text-white flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#D4AF37]/20 border border-[#D4AF37]/40 flex items-center justify-center text-[#D4AF37]">
            <Sliders className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-serif font-bold text-sm text-white">
                Engineering & Code Baseline Configuration
              </h4>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/10 text-emerald-300 border border-white/20">
                /etc/vertex.conf
              </span>
            </div>
            <p className="text-[11px] text-gray-300">
              Customize structural safety factors, jurisdictional design codes, units, and environmental loads.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleExportJson}
            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-gray-200 text-xs flex items-center gap-1 cursor-pointer transition-colors"
            title="Export JSON Configuration"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="text-[11px] font-mono">Export .json</span>
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-gray-200 text-xs flex items-center gap-1 cursor-pointer transition-colors"
            title="Reset to Factory Defaults"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="text-[11px]">Reset</span>
          </button>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full text-gray-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Preset Profiles Ribbon */}
      <div className="px-6 py-3 bg-[#FAF8F5] border-b border-gray-200/80 flex items-center gap-2 overflow-x-auto text-xs">
        <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">
          Jurisdictional Presets:
        </span>
        {[
          {
            name: 'US West Coast Seismic (High-Rise)',
            preset: {
              unitSystem: 'IMPERIAL' as UnitSystem,
              designCode: 'IBC_2024' as DesignCode,
              safetyFactor: 1.67,
              seismicCategory: 'E' as const,
              basicWindSpeedMph: 125,
              allowableSoilBearingPsf: 4000
            }
          },
          {
            name: 'Eurocode 3 Metric (EN 1993 / SIA)',
            preset: {
              unitSystem: 'METRIC' as UnitSystem,
              designCode: 'EUROCODE_3' as DesignCode,
              safetyFactor: 1.50,
              seismicCategory: 'B' as const,
              basicWindSpeedMph: 95,
              allowableSoilBearingPsf: 3000
            }
          },
          {
            name: 'Heavy Civil & Foundation (Deep Soil)',
            preset: {
              unitSystem: 'IMPERIAL' as UnitSystem,
              designCode: 'ACI_318' as DesignCode,
              safetyFactor: 2.0,
              seismicCategory: 'D' as const,
              allowableSoilBearingPsf: 2000
            }
          },
          {
            name: 'California Title 24 High-Efficiency',
            preset: {
              unitSystem: 'IMPERIAL' as UnitSystem,
              designCode: 'TITLE_24' as DesignCode,
              title24LpdTarget: 0.55,
              reverberationTargetSec: 0.50
            }
          }
        ].map((p, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => applyPreset(p.name, p.preset)}
            className="px-2.5 py-1 bg-white hover:bg-amber-50 text-gray-700 hover:text-[#8B7355] border border-gray-200 rounded-lg whitespace-nowrap font-medium transition-colors cursor-pointer"
          >
            {p.name}
          </button>
        ))}
      </div>

      {/* Main Settings Grid */}
      <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-xs">
        {/* Section 1: Measurement & Dimensional Units */}
        <div className="p-4 bg-gray-50/70 rounded-2xl border border-gray-200/80 space-y-3">
          <div className="flex items-center gap-2 pb-2 border-b border-gray-200">
            <Compass className="w-4 h-4 text-[#D4AF37]" />
            <h5 className="font-bold text-gray-900">Unit System & CAD Snapping</h5>
          </div>

          <div>
            <label className="font-semibold text-gray-700 block mb-1">Measurement System</label>
            <div className="grid grid-cols-2 gap-2">
              {(['IMPERIAL', 'METRIC'] as const).map(u => (
                <button
                  key={u}
                  type="button"
                  onClick={() => onUpdateConfig({ unitSystem: u })}
                  className={`py-2 px-3 rounded-xl border text-center font-mono cursor-pointer transition-all ${
                    config.unitSystem === u
                      ? 'border-[#D4AF37] bg-white text-[#2C2416] font-bold shadow-xs'
                      : 'border-gray-200 bg-white/60 text-gray-600 hover:bg-white'
                  }`}
                >
                  {u === 'IMPERIAL' ? 'Imperial (ft, in, lbs)' : 'Metric (m, mm, kN)'}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="font-semibold text-gray-700 block mb-1">CAD Snap Grid Pitch (inches)</label>
            <input
              type="number"
              min="1"
              max="24"
              value={config.cadSnapGridInches}
              onChange={e => onUpdateConfig({ cadSnapGridInches: Number(e.target.value) || 6 })}
              className="w-full px-3 py-1.5 bg-white border border-gray-200 rounded-xl font-mono text-xs"
            />
            <span className="text-[10px] text-gray-400 block mt-0.5">Architectural 2D layout snap increment</span>
          </div>
        </div>

        {/* Section 2: Building Codes & Safety Factor */}
        <div className="p-4 bg-gray-50/70 rounded-2xl border border-gray-200/80 space-y-3">
          <div className="flex items-center gap-2 pb-2 border-b border-gray-200">
            <Shield className="w-4 h-4 text-emerald-600" />
            <h5 className="font-bold text-gray-900">Design Code & Factor of Safety</h5>
          </div>

          <div>
            <label className="font-semibold text-gray-700 block mb-1">Governing Building Code</label>
            <select
              value={config.designCode}
              onChange={e => onUpdateConfig({ designCode: e.target.value as DesignCode })}
              className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl font-semibold text-xs text-gray-800"
            >
              <option value="IBC_2024">International Building Code (IBC 2024 / ASCE 7-22)</option>
              <option value="AISC_360">AISC 360-16 / 360-22 (Structural Steel LRDF)</option>
              <option value="ACI_318">ACI 318-19 (Structural Reinforced Concrete)</option>
              <option value="EUROCODE_3">Eurocode 3 (EN 1993 European Standards)</option>
              <option value="TITLE_24">California Title 24 (Energy / Photometrics)</option>
            </select>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="font-semibold text-gray-700">Safety Factor Multiplier (Ω / SF)</label>
              <span className="font-mono font-bold text-emerald-700">{config.safetyFactor}×</span>
            </div>
            <input
              type="range"
              min="1.0"
              max="2.5"
              step="0.05"
              value={config.safetyFactor}
              onChange={e => onUpdateConfig({ safetyFactor: Number(e.target.value) })}
              className="w-full accent-emerald-600"
            />
            <div className="flex justify-between text-[10px] text-gray-400 font-mono mt-0.5">
              <span>1.0x (Nominal)</span>
              <span>1.67x (AISC)</span>
              <span>2.5x (Heavy Civil)</span>
            </div>
          </div>
        </div>

        {/* Section 3: Geotechnical & Structural Environmental Loads */}
        <div className="p-4 bg-gray-50/70 rounded-2xl border border-gray-200/80 space-y-3">
          <div className="flex items-center gap-2 pb-2 border-b border-gray-200">
            <HardHat className="w-4 h-4 text-sky-600" />
            <h5 className="font-bold text-gray-900">Geotechnical & Environmental Loads</h5>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-gray-700 block mb-1">Seismic Category</label>
              <select
                value={config.seismicCategory}
                onChange={e => onUpdateConfig({ seismicCategory: e.target.value as any })}
                className="w-full px-3 py-1.5 bg-white border border-gray-200 rounded-xl font-mono text-xs"
              >
                {(['A', 'B', 'C', 'D', 'E', 'F'] as const).map(c => (
                  <option key={c} value={c}>Category {c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="font-semibold text-gray-700 block mb-1">Basic Wind (MPH)</label>
              <input
                type="number"
                min="70"
                max="200"
                value={config.basicWindSpeedMph}
                onChange={e => onUpdateConfig({ basicWindSpeedMph: Number(e.target.value) })}
                className="w-full px-3 py-1.5 bg-white border border-gray-200 rounded-xl font-mono text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-gray-700 block mb-1">Ground Snow (psf)</label>
              <input
                type="number"
                min="0"
                max="120"
                value={config.groundSnowLoadPsf}
                onChange={e => onUpdateConfig({ groundSnowLoadPsf: Number(e.target.value) })}
                className="w-full px-3 py-1.5 bg-white border border-gray-200 rounded-xl font-mono text-xs"
              />
            </div>

            <div>
              <label className="font-semibold text-gray-700 block mb-1">Soil Bearing (psf)</label>
              <input
                type="number"
                step="250"
                min="1000"
                max="12000"
                value={config.allowableSoilBearingPsf}
                onChange={e => onUpdateConfig({ allowableSoilBearingPsf: Number(e.target.value) })}
                className="w-full px-3 py-1.5 bg-white border border-gray-200 rounded-xl font-mono text-xs"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
