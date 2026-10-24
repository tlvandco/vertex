import React, { useState, useEffect } from 'react';
import {
  AlertTriangle,
  Play,
  RotateCcw,
  CheckCircle2,
  XCircle,
  Copy,
  Check,
  Server,
  Zap,
  ShieldAlert,
  Database,
  Cpu,
  RefreshCw,
  Layers,
  ArrowRight,
  ShieldCheck,
  FileCode,
  HardDrive
} from 'lucide-react';
import { apiClient } from '../../services/apiClient';
import { FaultSimulationResult, SubsystemHealth } from '../../types';

interface Props {
  onFaultInjected?: () => void;
  onJumpToTraces?: () => void;
  onJumpToLogs?: () => void;
}

export const FaultInjectionSandbox: React.FC<Props> = ({
  onFaultInjected,
  onJumpToTraces,
  onJumpToLogs
}) => {
  const [subsystems, setSubsystems] = useState<SubsystemHealth[]>([]);
  const [isProbingAll, setIsProbingAll] = useState(false);
  const [activeSimulation, setActiveSimulation] = useState<string | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationResult, setSimulationResult] = useState<FaultSimulationResult | null>(null);
  const [copiedStack, setCopiedStack] = useState(false);
  const [pingingSubsystemId, setPingingSubsystemId] = useState<string | null>(null);

  const scenarios = [
    {
      id: '500',
      label: '500 Internal Error',
      category: 'RUNTIME_EXCEPTION',
      description: 'Simulates NullPointerException during 3D BIM spatial calculation.',
      color: 'border-red-300 hover:border-red-500 bg-red-50/40 text-red-900',
      badgeColor: 'bg-red-100 text-red-800'
    },
    {
      id: 'db_timeout',
      label: '504 Database Timeout',
      category: 'DB_POOL_CONTENTION',
      description: 'Simulates PostgreSQL lock starvation on projects table in PgBouncer.',
      color: 'border-amber-300 hover:border-amber-500 bg-amber-50/40 text-amber-900',
      badgeColor: 'bg-amber-100 text-amber-800'
    },
    {
      id: '401',
      label: '401 Token Expired',
      category: 'AUTH_EXPIRATION',
      description: 'Simulates JWT signature rejection for expired bearer token.',
      color: 'border-purple-300 hover:border-purple-500 bg-purple-50/40 text-purple-900',
      badgeColor: 'bg-purple-100 text-purple-800'
    },
    {
      id: '403',
      label: '403 Forbidden IAM',
      category: 'ACCESS_DENIED',
      description: 'Simulates contractor role attempting restricted financial ledger write.',
      color: 'border-indigo-300 hover:border-indigo-500 bg-indigo-50/40 text-indigo-900',
      badgeColor: 'bg-indigo-100 text-indigo-800'
    },
    {
      id: '400',
      label: '400 Schema Validation',
      category: 'PAYLOAD_INVALID',
      description: 'Simulates missing specification UUID parameter in OpenAPI contract.',
      color: 'border-blue-300 hover:border-blue-500 bg-blue-50/40 text-blue-900',
      badgeColor: 'bg-blue-100 text-blue-800'
    },
    {
      id: '404',
      label: '404 Entity Missing',
      category: 'NOT_FOUND',
      description: 'Simulates queried project resource not existing in PostgreSQL.',
      color: 'border-gray-300 hover:border-gray-500 bg-gray-50/40 text-gray-900',
      badgeColor: 'bg-gray-100 text-gray-800'
    },
    {
      id: '429',
      label: '429 Rate Limit Burst',
      category: 'DDOS_THROTTLE',
      description: 'Simulates IP burst exceeding sliding 300 req / 15m window.',
      color: 'border-orange-300 hover:border-orange-500 bg-orange-50/40 text-orange-900',
      badgeColor: 'bg-orange-100 text-orange-800'
    },
    {
      id: 'heap_spike',
      label: 'Heap Memory Surge',
      category: 'MEMORY_SATURATION',
      description: 'Simulates 64MB buffer allocation and V8 GC recovery cycle.',
      color: 'border-emerald-300 hover:border-emerald-500 bg-emerald-50/40 text-emerald-900',
      badgeColor: 'bg-emerald-100 text-emerald-800'
    }
  ];

  const fetchHealth = async () => {
    const res = await apiClient.fetchHealthProbes();
    setSubsystems(res.subsystems || []);
  };

  useEffect(() => {
    fetchHealth();
  }, []);

  const handleRunSimulation = async (scenarioId: string) => {
    setIsSimulating(true);
    setActiveSimulation(scenarioId);
    try {
      const result = await apiClient.simulateFault(scenarioId);
      setSimulationResult(result);
      onFaultInjected?.();
    } catch {
      // Error is encapsulated
    } finally {
      setIsSimulating(false);
    }
  };

  const handlePingSubsystem = async (id: string) => {
    setPingingSubsystemId(id);
    const result = await apiClient.pingSubsystem(id);
    setSubsystems(prev =>
      prev.map(s => (s.id === id ? { ...s, latencyMs: result.latencyMs, lastChecked: new Date().toISOString() } : s))
    );
    setTimeout(() => setPingingSubsystemId(null), 400);
  };

  const handleRunAllDiagnostics = async () => {
    setIsProbingAll(true);
    for (const sub of subsystems) {
      await apiClient.pingSubsystem(sub.id);
    }
    await fetchHealth();
    setIsProbingAll(false);
  };

  const handleCopyStack = () => {
    if (!simulationResult) return;
    navigator.clipboard.writeText(simulationResult.stackTrace);
    setCopiedStack(true);
    setTimeout(() => setCopiedStack(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-gray-900 via-[#1c1917] to-gray-900 text-white p-6 rounded-3xl border border-gray-800 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-[#D4AF37]" />
            <h3 className="text-lg font-bold">Interactive Fault Injection & Diagnostics Sandbox</h3>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/40">
              SRE Chaos Engine
            </span>
          </div>
          <p className="text-xs text-gray-300 mt-1 max-w-2xl leading-relaxed">
            Trigger deterministic failures across API Gateway, PostgreSQL, Redis, and Auth layers.
            Observe real-time error propagation into distributed traces, central logs, and golden signal metrics.
          </p>
        </div>

        <button
          onClick={handleRunAllDiagnostics}
          disabled={isProbingAll}
          className="px-4 py-2.5 rounded-xl text-xs font-bold bg-[#D4AF37] text-gray-950 hover:bg-[#e0be4e] transition-all flex items-center gap-1.5 cursor-pointer shadow-md whitespace-nowrap"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isProbingAll ? 'animate-spin' : ''}`} />
          <span>{isProbingAll ? 'Probing Subsystems...' : 'Run Subsystem Diagnostics'}</span>
        </button>
      </div>

      {/* Subsystem Live Health Probes */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 flex items-center gap-1.5">
            <Server className="w-3.5 h-3.5 text-gray-600" />
            <span>Subsystem Health Probes ({subsystems.length} Monitored Endpoints)</span>
          </h4>
          <span className="text-[11px] text-gray-400">All checks run against active backend</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
          {subsystems.map(sub => {
            const isPinging = pingingSubsystemId === sub.id;
            return (
              <div
                key={sub.id}
                className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs hover:border-[#D4AF37]/50 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-gray-100 text-gray-700 font-bold">
                      {sub.category}
                    </span>
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      {sub.status}
                    </span>
                  </div>

                  <h5 className="font-bold text-xs text-gray-900 mb-1">{sub.name}</h5>
                  <p className="text-[11px] text-gray-500 leading-snug line-clamp-2 mb-3">{sub.details}</p>

                  <div className="space-y-1 py-2 border-t border-gray-100 text-[10px] font-mono text-gray-600">
                    {Object.entries(sub.metrics).slice(0, 3).map(([k, v]) => (
                      <div key={k} className="flex justify-between">
                        <span className="text-gray-400">{k}:</span>
                        <span className="font-bold text-gray-800">{v}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-2 border-t border-gray-100 flex items-center justify-between mt-2">
                  <span className="font-mono text-[11px] font-bold text-emerald-700">
                    {sub.latencyMs}ms RTT
                  </span>
                  <button
                    onClick={() => handlePingSubsystem(sub.id)}
                    disabled={isPinging}
                    className="px-2 py-1 rounded-lg text-[10px] font-bold border border-gray-200 hover:bg-gray-50 text-gray-700 flex items-center gap-1 cursor-pointer"
                  >
                    <RefreshCw className={`w-2.5 h-2.5 ${isPinging ? 'animate-spin text-[#D4AF37]' : ''}`} />
                    <span>Ping</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Fault Injection Matrix */}
      <div>
        <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3 flex items-center gap-1.5">
          <Zap className="w-3.5 h-3.5 text-amber-600" />
          <span>Active Fault Injection Scenarios (Select to Trigger)</span>
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {scenarios.map(sc => {
            const isCurrentlySelected = activeSimulation === sc.id;
            return (
              <button
                key={sc.id}
                onClick={() => handleRunSimulation(sc.id)}
                disabled={isSimulating}
                className={`p-4 rounded-2xl border text-left transition-all cursor-pointer relative overflow-hidden group shadow-xs ${sc.color} ${
                  isCurrentlySelected ? 'ring-2 ring-[#D4AF37] shadow-md' : ''
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded font-mono ${sc.badgeColor}`}>
                    {sc.category}
                  </span>
                  <Play className={`w-3.5 h-3.5 text-gray-400 group-hover:text-gray-900 group-hover:scale-110 transition-transform ${isSimulating && isCurrentlySelected ? 'animate-spin' : ''}`} />
                </div>
                <h5 className="font-bold text-xs mb-1">{sc.label}</h5>
                <p className="text-[11px] text-gray-600 leading-relaxed">{sc.description}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Simulation Diagnostic Output Console */}
      {simulationResult && (
        <div className="bg-[#18181B] text-gray-100 rounded-3xl p-6 border border-gray-800 shadow-2xl space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 border-b border-gray-800 gap-2">
            <div className="flex items-center gap-3">
              <span className={`px-2.5 py-1 rounded-full text-xs font-bold font-mono ${
                simulationResult.statusCode >= 500 ? 'bg-red-900/60 text-red-300 border border-red-700' :
                simulationResult.statusCode >= 400 ? 'bg-amber-900/60 text-amber-300 border border-amber-700' :
                'bg-emerald-900/60 text-emerald-300 border border-emerald-700'
              }`}>
                HTTP {simulationResult.statusCode} {simulationResult.errorName}
              </span>
              <span className="text-xs text-gray-400 font-mono">
                Trace: {simulationResult.traceId}
              </span>
            </div>

            <div className="flex items-center gap-2">
              {onJumpToTraces && (
                <button
                  onClick={onJumpToTraces}
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-gray-800 hover:bg-gray-700 text-[#D4AF37] transition-all flex items-center gap-1 cursor-pointer"
                >
                  <span>View in Traces</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              )}
              {onJumpToLogs && (
                <button
                  onClick={onJumpToLogs}
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-gray-800 hover:bg-gray-700 text-gray-300 transition-all flex items-center gap-1 cursor-pointer"
                >
                  <span>View in Logs</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>

          {/* Root Cause & Remediation */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-red-950/30 border border-red-900/50 rounded-2xl p-4 space-y-1.5">
              <div className="text-[10px] uppercase font-bold text-red-400 flex items-center gap-1.5 font-mono">
                <AlertTriangle className="w-3.5 h-3.5" />
                Root Cause Analysis
              </div>
              <p className="text-xs text-gray-200 leading-relaxed font-sans">
                {simulationResult.diagnostics.rootCause}
              </p>
              <div className="text-[10px] text-gray-400 font-mono pt-1">
                Affected Subsystem: <span className="text-[#D4AF37]">{simulationResult.diagnostics.affectedService}</span>
              </div>
            </div>

            <div className="bg-emerald-950/30 border border-emerald-900/50 rounded-2xl p-4 space-y-1.5">
              <div className="text-[10px] uppercase font-bold text-emerald-400 flex items-center gap-1.5 font-mono">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Actionable Engineering Remediation
              </div>
              <p className="text-xs text-gray-200 leading-relaxed font-sans">
                {simulationResult.diagnostics.remediation}
              </p>
              <div className="text-[10px] text-emerald-400 font-mono pt-1">
                Status: Diagnostic correlated into system telemetry & traces
              </div>
            </div>
          </div>

          {/* Stack Trace Viewer */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-gray-400 font-mono flex items-center gap-1.5">
                <FileCode className="w-3.5 h-3.5 text-[#D4AF37]" />
                Runtime Stack Trace ({simulationResult.errorName})
              </span>
              <button
                onClick={handleCopyStack}
                className="text-xs text-gray-400 hover:text-white flex items-center gap-1 cursor-pointer"
              >
                {copiedStack ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedStack ? 'Copied' : 'Copy Stack'}</span>
              </button>
            </div>
            <pre className="bg-black/80 text-red-300 p-4 rounded-2xl font-mono text-xs overflow-x-auto border border-gray-800 leading-relaxed max-h-48">
              {simulationResult.stackTrace}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};
