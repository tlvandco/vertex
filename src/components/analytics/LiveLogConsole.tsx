import React, { useState, useEffect, useRef } from 'react';
import {
  Terminal,
  Search,
  Filter,
  Download,
  Trash2,
  Pause,
  Play,
  Copy,
  Check,
  ChevronDown,
  ChevronRight,
  AlertTriangle,
  XCircle,
  Info,
  Clock,
  Layers,
  FileCode,
  ArrowDown
} from 'lucide-react';
import { SystemLog } from '../../types';

interface Props {
  logs: SystemLog[];
  initialSearchQuery?: string;
  onClearLogs?: () => void;
  onSelectTraceId?: (traceId: string) => void;
}

export const LiveLogConsole: React.FC<Props> = ({
  logs,
  initialSearchQuery = '',
  onClearLogs,
  onSelectTraceId
}) => {
  const [levelFilter, setLevelFilter] = useState<string>('ALL');
  const [sourceFilter, setSourceFilter] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState(initialSearchQuery);
  const [isPaused, setIsPaused] = useState(false);
  const [autoScroll, setAutoScroll] = useState(true);
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const consoleEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (initialSearchQuery) {
      setSearchTerm(initialSearchQuery);
    }
  }, [initialSearchQuery]);

  useEffect(() => {
    if (autoScroll && !isPaused && consoleEndRef.current) {
      consoleEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs, autoScroll, isPaused]);

  const uniqueSources = Array.from(new Set(logs.map(l => l.source).filter(Boolean)));

  const filteredLogs = logs.filter(log => {
    if (levelFilter !== 'ALL' && log.level !== levelFilter) return false;
    if (sourceFilter !== 'ALL' && log.source !== sourceFilter) return false;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      const matchesMsg = log.message.toLowerCase().includes(q);
      const matchesSource = log.source.toLowerCase().includes(q);
      const matchesTrace = log.traceId?.toLowerCase().includes(q);
      const matchesCorr = log.correlationId?.toLowerCase().includes(q);
      if (!matchesMsg && !matchesSource && !matchesTrace && !matchesCorr) return false;
    }
    return true;
  });

  const handleExportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(filteredLogs, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `vertex_system_logs_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleCopyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getLevelBadge = (level: string) => {
    switch (level) {
      case 'ERROR':
      case 'FATAL':
        return <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-red-950/80 text-red-400 border border-red-800">ERR</span>;
      case 'WARN':
        return <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-950/80 text-amber-400 border border-amber-800">WRN</span>;
      case 'DEBUG':
        return <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-purple-950/80 text-purple-400 border border-purple-800">DBG</span>;
      default:
        return <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-950/80 text-emerald-400 border border-emerald-800">INF</span>;
    }
  };

  return (
    <div className="bg-[#121214] text-gray-200 p-6 rounded-3xl font-mono text-xs shadow-2xl border border-gray-800 space-y-4">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between pb-4 border-b border-gray-800 gap-4">
        <div className="flex items-center gap-3">
          <Terminal className="w-5 h-5 text-[#D4AF37]" />
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[#D4AF37] font-bold text-sm">VERTEX Streaming Log Engine</span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-gray-800 text-gray-400 border border-gray-700">
                system.log (Microkernel & SRE)
              </span>
            </div>
            <p className="text-[11px] text-gray-500 font-sans mt-0.5">
              Live stdout/stderr stream from edge gateway, database pool, and IAM subsystems.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className={`w-2.5 h-2.5 rounded-full ${isPaused ? 'bg-amber-500' : 'bg-emerald-500 animate-pulse'}`} />
          <span className="text-xs text-gray-400">{isPaused ? 'Stream Paused' : 'Stream Connected'}</span>
        </div>
      </div>

      {/* Filter and Control Toolbar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-3 bg-[#18181B] p-3 rounded-2xl border border-gray-800">
        <div className="flex items-center gap-2 w-full md:w-auto flex-wrap">
          <div className="relative w-full md:w-64">
            <Search className="w-3.5 h-3.5 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Filter logs or traceId..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-black/60 border border-gray-700 rounded-xl focus:border-[#D4AF37] outline-none text-gray-200"
            />
          </div>

          {/* Level Filter Pills */}
          <div className="flex items-center gap-1 bg-black/50 p-1 rounded-xl border border-gray-800">
            {['ALL', 'ERROR', 'WARN', 'INFO', 'DEBUG'].map(lvl => (
              <button
                key={lvl}
                onClick={() => setLevelFilter(lvl)}
                className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                  levelFilter === lvl
                    ? 'bg-[#D4AF37] text-gray-950 font-black'
                    : 'text-gray-400 hover:text-gray-200'
                }`}
              >
                {lvl}
              </button>
            ))}
          </div>

          {/* Source Filter */}
          {uniqueSources.length > 0 && (
            <select
              value={sourceFilter}
              onChange={e => setSourceFilter(e.target.value)}
              className="px-2.5 py-1.5 text-xs bg-black/60 border border-gray-700 rounded-xl text-gray-300 outline-none"
            >
              <option value="ALL">All Sources</option>
              {uniqueSources.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 w-full md:w-auto justify-end">
          <button
            onClick={() => setAutoScroll(!autoScroll)}
            className={`px-2.5 py-1.5 rounded-xl text-[11px] font-semibold border transition-all flex items-center gap-1 cursor-pointer ${
              autoScroll ? 'bg-gray-800 text-gray-200 border-gray-700' : 'bg-transparent text-gray-500 border-gray-800'
            }`}
            title="Auto-scroll on new incoming logs"
          >
            <ArrowDown className="w-3 h-3" />
            <span>Auto-Scroll</span>
          </button>

          <button
            onClick={() => setIsPaused(!isPaused)}
            className={`px-2.5 py-1.5 rounded-xl text-[11px] font-semibold border transition-all flex items-center gap-1 cursor-pointer ${
              isPaused ? 'bg-amber-950 text-amber-300 border-amber-800' : 'bg-gray-800 text-gray-300 border-gray-700 hover:bg-gray-700'
            }`}
          >
            {isPaused ? <Play className="w-3 h-3" /> : <Pause className="w-3 h-3" />}
            <span>{isPaused ? 'Resume' : 'Pause'}</span>
          </button>

          <button
            onClick={handleExportJSON}
            className="p-1.5 rounded-xl text-gray-400 hover:text-gray-200 hover:bg-gray-800 transition-all border border-gray-800 cursor-pointer"
            title="Export filtered logs as JSON"
          >
            <Download className="w-3.5 h-3.5" />
          </button>

          {onClearLogs && (
            <button
              onClick={onClearLogs}
              className="p-1.5 rounded-xl text-red-400 hover:text-red-300 hover:bg-red-950/40 transition-all border border-gray-800 cursor-pointer"
              title="Clear visible log stream"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Main Console Output */}
      <div className="space-y-1.5 h-[480px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-800 bg-black/60 p-4 rounded-2xl border border-gray-800/80">
        {filteredLogs.length === 0 ? (
          <div className="py-20 text-center text-gray-500 text-xs">
            No system log events matched filter criteria.
          </div>
        ) : (
          filteredLogs.map(log => {
            const isExpanded = expandedLogId === log.id;
            return (
              <div
                key={log.id}
                onClick={() => setExpandedLogId(isExpanded ? null : log.id)}
                className={`p-2 rounded-xl border transition-colors cursor-pointer ${
                  isExpanded ? 'bg-gray-900 border-gray-700' : 'hover:bg-white/5 border-transparent'
                }`}
              >
                <div className="flex items-start gap-2.5">
                  <span className="text-gray-500 shrink-0 text-[11px] font-mono">{log.timestamp}</span>
                  {getLevelBadge(log.level)}
                  <span className="text-gray-400 shrink-0 text-[11px]">[{log.source}]</span>
                  <span className={`break-all leading-relaxed ${
                    log.level === 'ERROR' ? 'text-red-300 font-semibold' :
                    log.level === 'WARN' ? 'text-amber-300' : 'text-gray-200'
                  }`}>
                    {log.message}
                  </span>
                </div>

                {/* Expanded Details Drawer */}
                {isExpanded && (
                  <div className="mt-3 pt-3 border-t border-gray-800 space-y-2 bg-black/40 p-3 rounded-lg text-[11px]">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-gray-400">
                      <div>
                        Log Event ID: <span className="text-gray-200 font-bold">{log.id}</span>
                      </div>
                      {log.traceId && (
                        <div className="flex items-center gap-1.5">
                          Trace ID:
                          <span className="text-[#D4AF37] font-bold">{log.traceId}</span>
                          {onSelectTraceId && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onSelectTraceId(log.traceId!);
                              }}
                              className="text-xs text-blue-400 hover:underline ml-1 cursor-pointer"
                            >
                              Inspect Trace
                            </button>
                          )}
                        </div>
                      )}
                      {log.correlationId && (
                        <div>
                          Correlation ID: <span className="text-gray-300">{log.correlationId}</span>
                        </div>
                      )}
                    </div>

                    {log.stack && (
                      <div className="mt-2">
                        <div className="flex items-center justify-between text-gray-400 mb-1">
                          <span>Attached Error Stack:</span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCopyText(log.stack!, log.id);
                            }}
                            className="text-[10px] text-gray-400 hover:text-white flex items-center gap-1 cursor-pointer"
                          >
                            {copiedId === log.id ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                            <span>Copy Stack</span>
                          </button>
                        </div>
                        <pre className="bg-red-950/40 text-red-200 p-2.5 rounded border border-red-900/60 overflow-x-auto text-[10px] max-h-36">
                          {log.stack}
                        </pre>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
        <div ref={consoleEndRef} />
      </div>

      {/* Footer Info */}
      <div className="pt-2 border-t border-gray-800/80 flex flex-col sm:flex-row justify-between items-center text-[11px] text-gray-500 gap-2">
        <span>Displaying {filteredLogs.length} of {logs.length} live stream entries</span>
        <div className="flex items-center gap-3">
          <span>Format: RFC 5424 Syslog</span>
          <span>Buffer: In-Memory Ring Buffer</span>
        </div>
      </div>
    </div>
  );
};
