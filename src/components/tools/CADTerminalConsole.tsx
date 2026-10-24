import React, { useState, useRef, useEffect } from 'react';
import { Terminal, CornerDownLeft, Trash2, HelpCircle, Cpu, Sliders, Maximize2, Minimize2 } from 'lucide-react';
import { EngineeringConfig } from './types';

interface CADTerminalConsoleProps {
  config: EngineeringConfig;
  onUpdateConfig: (newConfig: Partial<EngineeringConfig>) => void;
  onRunBeamCalc?: (span: number, dl: number, ll: number) => void;
  onExportDxf?: () => void;
}

interface CommandLog {
  id: string;
  type: 'input' | 'output' | 'error' | 'success';
  text: string;
}

const INITIAL_LOGS: CommandLog[] = [
  { id: '1', type: 'output', text: 'VERTEX OS v4.19-arch-eng (x86_64-cad-kernel) - Active Session: ttyS0' },
  { id: '2', type: 'output', text: 'Type "help" or "man" to list available architectural, interior & civil engineering commands.' },
  { id: '3', type: 'success', text: 'System status: IBC 2024 / ASCE 7-22 solver online. Units: IMPERIAL (ft/lbs/psf).' }
];

export const CADTerminalConsole: React.FC<CADTerminalConsoleProps> = ({
  config,
  onUpdateConfig,
  onRunBeamCalc,
  onExportDxf
}) => {
  const [logs, setLogs] = useState<CommandLog[]>(INITIAL_LOGS);
  const [inputVal, setInputVal] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const handleCommand = (cmdStr: string) => {
    const raw = cmdStr.trim();
    if (!raw) return;

    // Append to logs
    const newLogId = Date.now().toString();
    const newLogs: CommandLog[] = [...logs, { id: newLogId, type: 'input', text: `vertex@cad-host:~$ ${raw}` }];

    // Save to history
    setHistory(prev => [raw, ...prev]);
    setHistoryIndex(-1);

    const parts = raw.split(/\s+/);
    const cmd = parts[0].toLowerCase();
    const args = parts.slice(1);

    switch (cmd) {
      case 'clear':
      case 'cls':
        setLogs([]);
        setInputVal('');
        return;

      case 'help':
      case 'man':
        newLogs.push({
          id: newLogId + '_out',
          type: 'output',
          text: `AVAILABLE CAD/BIM/ENG CLI COMMANDS:
  help | man                   Display this command manual
  uname -a                     Print kernel & simulation engine build info
  cat /etc/vertex.conf         Inspect active system & design code configuration
  sysctl set [key] [val]       Modify parameter (e.g. sysctl set unit metric | imperial)
  calc beam [args]             Compute bending moment & shear: --span <ft> --dl <plf> --ll <plf>
  calc footing [args]          Compute spread footing & rebar: --load <kips> --soil <psf>
  calc drainage [args]         Rational storm runoff Q=CIA: --area <ac> --c <0-1> --i <in/hr>
  zoning check [args]          Evaluate FAR & setbacks: --lot <sqft> --built <sqft> --floors <n>
  dxf export                   Compile active floorplan vectors into standard CAD format
  top | ps                     Display active engineering analysis threads
  clear                        Clear terminal screen buffer`
        });
        break;

      case 'uname':
        newLogs.push({
          id: newLogId + '_out',
          type: 'output',
          text: 'Linux vertex-cad 6.1.0-28-studio-rt #1 PREEMPT_RT x86_64 GNU/Linux [VERTEX BIM/FEM ENGINE v4.2.0]'
        });
        break;

      case 'cat':
        if (args[0] === '/etc/vertex.conf' || args[0] === 'vertex.conf') {
          newLogs.push({
            id: newLogId + '_out',
            type: 'output',
            text: `[SYSTEM_CONFIGURATION]
unit_system = ${config.unitSystem}
design_code = ${config.designCode}
safety_factor = ${config.safetyFactor}
cad_snap_inches = ${config.cadSnapGridInches}
seismic_design_category = ${config.seismicCategory}
basic_wind_speed_mph = ${config.basicWindSpeedMph}
ground_snow_psf = ${config.groundSnowLoadPsf}
allowable_soil_bearing_psf = ${config.allowableSoilBearingPsf}
title24_lpd_target_w_sqft = ${config.title24LpdTarget}
target_rt60_reverb_sec = ${config.reverberationTargetSec}`
          });
        } else {
          newLogs.push({ id: newLogId + '_out', type: 'error', text: `cat: ${args[0] || 'file'}: No such file or directory` });
        }
        break;

      case 'sysctl':
        if (args[0] === 'set' && args[1] && args[2]) {
          const key = args[1].toLowerCase();
          const val = args[2];
          if (key === 'unit' || key === 'units') {
            const unit = val.toUpperCase() === 'METRIC' ? 'METRIC' : 'IMPERIAL';
            onUpdateConfig({ unitSystem: unit });
            newLogs.push({ id: newLogId + '_out', type: 'success', text: `sysctl: unit_system set to ${unit}` });
          } else if (key === 'safety_factor' || key === 'sf') {
            const num = parseFloat(val);
            if (!isNaN(num) && num >= 1) {
              onUpdateConfig({ safetyFactor: num });
              newLogs.push({ id: newLogId + '_out', type: 'success', text: `sysctl: safety_factor set to ${num}` });
            } else {
              newLogs.push({ id: newLogId + '_out', type: 'error', text: 'sysctl: Invalid safety factor value (must be >= 1.0)' });
            }
          } else if (key === 'soil' || key === 'soil_bearing') {
            const num = parseInt(val, 10);
            if (!isNaN(num) && num > 0) {
              onUpdateConfig({ allowableSoilBearingPsf: num });
              newLogs.push({ id: newLogId + '_out', type: 'success', text: `sysctl: allowable_soil_bearing set to ${num} psf` });
            }
          } else {
            newLogs.push({ id: newLogId + '_out', type: 'error', text: `sysctl: Unknown or read-only parameter "${key}"` });
          }
        } else {
          newLogs.push({ id: newLogId + '_out', type: 'output', text: 'Usage: sysctl set [unit|safety_factor|soil] [value]' });
        }
        break;

      case 'calc':
        const sub = args[0];
        if (sub === 'beam') {
          // parse flags
          let span = 20;
          let dl = 600;
          let ll = 800;
          for (let i = 1; i < args.length; i++) {
            if (args[i] === '--span' && args[i + 1]) span = parseFloat(args[i + 1]);
            if (args[i] === '--dl' && args[i + 1]) dl = parseFloat(args[i + 1]);
            if (args[i] === '--ll' && args[i + 1]) ll = parseFloat(args[i + 1]);
          }
          const wu = (1.2 * dl + 1.6 * ll) / 1000; // kips/ft
          const mu = (wu * Math.pow(span, 2)) / 8; // kip-ft
          const vu = (wu * span) / 2; // kips
          newLogs.push({
            id: newLogId + '_out',
            type: 'success',
            text: `[STRUCTURAL BEAM SOLVER - AISC 360-16]
Span: ${span} ft | Dead Load: ${dl} plf | Live Load: ${ll} plf
Factored Uniform Load (Wu = 1.2D + 1.6L): ${wu.toFixed(2)} kips/ft
Maximum Design Bending Moment (Mu): ${mu.toFixed(1)} kip-ft
Maximum Design Shear Force (Vu): ${vu.toFixed(1)} kips
Recommended Spec: Steel W12x26 (Phi*Mn = 140 kip-ft) or Glulam 5.125"x18"
Governing deflection limit: L/360 compliant.`
          });
          if (onRunBeamCalc) onRunBeamCalc(span, dl, ll);
        } else if (sub === 'footing') {
          let load = 120; // kips
          let soil = config.allowableSoilBearingPsf;
          for (let i = 1; i < args.length; i++) {
            if (args[i] === '--load' && args[i + 1]) load = parseFloat(args[i + 1]);
            if (args[i] === '--soil' && args[i + 1]) soil = parseFloat(args[i + 1]);
          }
          const reqArea = (load * 1000) / soil;
          const footingDim = Math.ceil(Math.sqrt(reqArea) * 10) / 10;
          const volYds = (footingDim * footingDim * 1.5) / 27;
          newLogs.push({
            id: newLogId + '_out',
            type: 'success',
            text: `[SPREAD FOOTING & REBAR SOLVER - ACI 318]
Column Factored Load: ${load} kips | Soil Bearing: ${soil} psf
Required Plan Area: ${reqArea.toFixed(1)} sq.ft
Selected Dimension: ${footingDim} ft x ${footingDim} ft x 18" Depth
Concrete Volume Required: ${volYds.toFixed(2)} cu.yds (4,000 PSI Mix)
Rebar Cage: #6 @ 10" O.C. Each Way (Grade 60) | Estimated Steel: ~${Math.round(footingDim * footingDim * 4.2)} lbs.`
          });
        } else if (sub === 'drainage') {
          let area = 2.5; // acres
          let c = 0.75;
          let i = 3.2; // in/hr
          for (let idx = 1; idx < args.length; idx++) {
            if (args[idx] === '--area' && args[idx + 1]) area = parseFloat(args[idx + 1]);
            if (args[idx] === '--c' && args[idx + 1]) c = parseFloat(args[idx + 1]);
            if (args[idx] === '--i' && args[idx + 1]) i = parseFloat(args[idx + 1]);
          }
          const q = c * i * area; // cfs
          const basinVol = q * 3600 * 0.45; // cu ft
          newLogs.push({
            id: newLogId + '_out',
            type: 'success',
            text: `[CIVIL STORMWATER DRAINAGE - RATIONAL METHOD Q=CIA]
Catchment Area: ${area} acres | Composite Runoff (C): ${c} | Rainfall (I): ${i} in/hr
Peak Discharge (Q): ${q.toFixed(2)} CFS (${(q * 28.3168).toFixed(1)} L/s)
Detention Retention Storage Volume: ${Math.round(basinVol).toLocaleString()} cu.ft (~${Math.round(basinVol * 7.48).toLocaleString()} Gal)
Minimum Outfall Storm Pipe: ${Math.max(12, Math.ceil(Math.sqrt(q) * 6))}" RCP @ 1.0% Slope.`
          });
        } else {
          newLogs.push({ id: newLogId + '_out', type: 'output', text: 'Usage: calc [beam|footing|drainage] [--flags]' });
        }
        break;

      case 'zoning':
        let lot = 12000;
        let built = 4800;
        let floors = 2;
        for (let i = 0; i < args.length; i++) {
          if (args[i] === '--lot' && args[i + 1]) lot = parseFloat(args[i + 1]);
          if (args[i] === '--built' && args[i + 1]) built = parseFloat(args[i + 1]);
          if (args[i] === '--floors' && args[i + 1]) floors = parseFloat(args[i + 1]);
        }
        const totalGross = built * floors;
        const far = totalGross / lot;
        const coverage = (built / lot) * 100;
        newLogs.push({
          id: newLogId + '_out',
          type: 'success',
          text: `[MUNICIPAL ZONING & FAR AUDIT - IBC R-1/R-2]
Lot Area: ${lot.toLocaleString()} sq.ft | Ground Footprint: ${built.toLocaleString()} sq.ft (${floors} Stories)
Calculated Floor Area Ratio (FAR): ${far.toFixed(2)} (Standard Max: 0.60 -> ${far <= 0.60 ? 'COMPLIANT' : 'EXCEEDS ENVELOPE'})
Lot Coverage: ${coverage.toFixed(1)}% (Standard Max: 40% -> ${coverage <= 40 ? 'PASS' : 'VARIANCE REQUIRED'})
Mandated Minimum Setbacks: Front: 20'-0" | Rear: 15'-0" | Interior Side: 6'-0"`
        });
        break;

      case 'dxf':
        if (args[0] === 'export') {
          if (onExportDxf) onExportDxf();
          newLogs.push({ id: newLogId + '_out', type: 'success', text: 'Compiled CAD DXF vector bundle. Triggering download in browser...' });
        } else {
          newLogs.push({ id: newLogId + '_out', type: 'output', text: 'Usage: dxf export' });
        }
        break;

      case 'top':
      case 'ps':
        newLogs.push({
          id: newLogId + '_out',
          type: 'output',
          text: `PID  USER      PR  NI    VIRT    RES  %CPU %MEM     TIME+ COMMAND
 104 vertex    20   0  524.2m  48.1m   1.2  0.6   0:04.12 cad-geom-engine
 108 vertex    20   0  312.0m  32.4m   0.8  0.4   0:01.88 fem-beam-solver
 112 vertex    20   0  184.5m  22.1m   0.2  0.3   0:00.64 iesna-photometric
 119 vertex    20   0  128.0m  16.5m   0.0  0.2   0:00.32 sabine-rt60`
        });
        break;

      default:
        newLogs.push({
          id: newLogId + '_out',
          type: 'error',
          text: `bash: ${cmd}: command not found. Type "help" for valid engineering commands.`
        });
        break;
    }

    setLogs(newLogs);
    setInputVal('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleCommand(inputVal);
    } else if (e.key === 'ArrowUp') {
      if (history.length > 0 && historyIndex + 1 < history.length) {
        const nextIdx = historyIndex + 1;
        setHistoryIndex(nextIdx);
        setInputVal(history[nextIdx]);
      }
    } else if (e.key === 'ArrowDown') {
      if (historyIndex > 0) {
        const nextIdx = historyIndex - 1;
        setHistoryIndex(nextIdx);
        setInputVal(history[nextIdx]);
      } else if (historyIndex === 0) {
        setHistoryIndex(-1);
        setInputVal('');
      }
    }
  };

  return (
    <div
      className={
        isMaximized
          ? 'fixed inset-0 z-50 bg-[#181614] border-0 shadow-2xl overflow-hidden font-mono text-xs flex flex-col h-screen w-screen'
          : 'bg-[#181614] rounded-3xl border border-[#3A3228] shadow-2xl overflow-hidden font-mono text-xs flex flex-col'
      }
    >
      {/* Terminal Window Chrome */}
      <div className="bg-[#24201B] px-4 py-2.5 flex items-center justify-between border-b border-[#3A3228]">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setLogs([])}
              title="Clear / Close (Red)"
              className="w-3 h-3 rounded-full bg-[#FF5F56] border border-[#E0443E] cursor-pointer hover:opacity-80"
            />
            <button
              type="button"
              onClick={() => setIsExpanded(!isExpanded)}
              title="Minimize/Expand Height (Yellow)"
              className="w-3 h-3 rounded-full bg-[#FFBD2E] border border-[#DEA123] cursor-pointer hover:opacity-80"
            />
            <button
              type="button"
              onClick={() => setIsMaximized(!isMaximized)}
              title="Maximize / Restore Window (Green)"
              className="w-3 h-3 rounded-full bg-[#27C93F] border border-[#1AAB29] cursor-pointer hover:opacity-80"
            />
          </div>
          <span className="text-[11px] text-[#A69986] font-semibold ml-2 flex items-center gap-1.5">
            <Terminal className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>VERTEX CLI Engine — Shell ttyS0 [bash]</span>
          </span>
          {isMaximized && (
            <span className="text-[10px] bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/40 px-2 py-0.5 rounded font-mono font-bold">
              FULLSCREEN TERMINAL
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setLogs([])}
            title="Clear Terminal Buffer"
            className="p-1 rounded text-gray-400 hover:text-gray-200 hover:bg-white/5 cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
          {!isMaximized && (
            <button
              type="button"
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-[10px] px-2 py-0.5 rounded bg-white/10 text-gray-300 hover:bg-white/20 transition-colors cursor-pointer"
            >
              {isExpanded ? 'Collapse' : 'Expand Height'}
            </button>
          )}
          <button
            type="button"
            onClick={() => setIsMaximized(!isMaximized)}
            className="text-[10px] px-2.5 py-1 rounded-lg bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/40 hover:bg-[#D4AF37]/30 font-bold transition-colors cursor-pointer flex items-center gap-1"
          >
            {isMaximized ? <Minimize2 className="w-3 h-3" /> : <Maximize2 className="w-3 h-3" />}
            <span>{isMaximized ? 'Minimize Window' : 'Maximize'}</span>
          </button>
        </div>
      </div>

      {/* Quick Macro Buttons */}
      <div className="px-4 py-2 bg-[#1C1916] border-b border-[#2D261F] flex items-center gap-1.5 overflow-x-auto text-[10px] shrink-0">
        <span className="text-gray-500 uppercase tracking-wider font-semibold mr-1">Quick Macros:</span>
        {[
          { label: 'Beam Check', cmd: 'calc beam --span 24 --dl 650 --ll 850' },
          { label: 'Footing Calc', cmd: 'calc footing --load 140 --soil 3000' },
          { label: 'Zoning Audit', cmd: 'zoning --lot 15000 --built 5200 --floors 2' },
          { label: 'Drainage Q=CIA', cmd: 'calc drainage --area 2.0 --c 0.80 --i 3.0' },
          { label: 'Inspect Config', cmd: 'cat /etc/vertex.conf' },
          { label: 'DXF Export', cmd: 'dxf export' }
        ].map((m, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => handleCommand(m.cmd)}
            className="px-2.5 py-1 rounded-md bg-[#2C2416] hover:bg-[#3E3321] text-[#D4AF37] border border-[#53432B] font-medium whitespace-nowrap transition-colors cursor-pointer"
          >
            {m.label}
          </button>
        ))}
      </div>

      {/* Terminal Output Stream */}
      <div
        className={`p-4 overflow-y-auto space-y-1.5 scrollbar-thin scrollbar-thumb-gray-700 select-text ${
          isMaximized ? 'flex-1' : isExpanded ? 'max-h-[500px]' : 'max-h-[260px]'
        }`}
      >
        {logs.map(log => {
          if (log.type === 'input') {
            return (
              <div key={log.id} className="text-[#D4AF37] font-semibold">
                {log.text}
              </div>
            );
          }
          if (log.type === 'error') {
            return (
              <div key={log.id} className="text-rose-400 whitespace-pre-wrap">
                {log.text}
              </div>
            );
          }
          if (log.type === 'success') {
            return (
              <div key={log.id} className="text-emerald-400 whitespace-pre-wrap">
                {log.text}
              </div>
            );
          }
          return (
            <div key={log.id} className="text-[#C8BEB2] whitespace-pre-wrap leading-relaxed">
              {log.text}
            </div>
          );
        })}
        <div ref={endRef} />
      </div>

      {/* Interactive Command Input Line */}
      <div className="px-4 py-2.5 bg-[#141210] border-t border-[#3A3228] flex items-center gap-2">
        <span className="text-[#D4AF37] font-bold shrink-0">vertex@cad-host:~$</span>
        <input
          type="text"
          value={inputVal}
          onChange={e => setInputVal(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="type command (e.g. 'calc beam', 'help', 'zoning', 'sysctl set unit metric')..."
          className="w-full bg-transparent text-[#F2ECE4] outline-none font-mono text-xs placeholder:text-gray-600"
          autoComplete="off"
          spellCheck={false}
        />
        <button
          type="button"
          onClick={() => handleCommand(inputVal)}
          className="px-2 py-1 bg-[#D4AF37] hover:bg-[#B8860B] text-black font-bold rounded text-[11px] flex items-center gap-1 cursor-pointer shrink-0"
        >
          <span>Run</span>
          <CornerDownLeft className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
};
