import React, { useState, useEffect } from 'react';
import {
  Activity,
  Search,
  Filter,
  RefreshCw,
  Trash2,
  Clock,
  ArrowUpRight,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Copy,
  Check,
  ChevronRight,
  X,
  Layers,
  Server,
  Zap,
  ShieldCheck,
  Terminal,
  ExternalLink
} from 'lucide-react';
import { apiClient } from '../../services/apiClient';
import { HttpTrace, HttpTraceSpan } from '../../types';

interface Props {
  onSelectTraceForLogs?: (traceId: string) => void;
}

export const DistributedTracingViewer: React.FC<Props> = ({ onSelectTraceForLogs }) => {
  const [traces, setTraces] = useState<HttpTrace[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [selectedTrace, setSelectedTrace] = useState<HttpTrace | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [methodFilter, setMethodFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedTraceId, setCopiedTraceId] = useState<string | null>(null);

  const fetchTraces = async () => {
    setIsLoading(true);
    try {
      const res = await apiClient.fetchTraces({
        status: statusFilter,
        method: methodFilter,
        search: searchQuery
      });
      setTraces(res.traces || []);
    } catch {
      // fallback
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTraces();
  }, [statusFilter, methodFilter]);

  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(fetchTraces, 4000);
    return () => clearInterval(interval);
  }, [autoRefresh, statusFilter, methodFilter, searchQuery]);

  const handleClearTraces = async () => {
    if (confirm('Flush in-memory APM distributed traces buffer?')) {
      await apiClient.clearTraces();
      setTraces([]);
      setSelectedTrace(null);
    }
  };

  const handleCopyTraceId = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    navigator.clipboard.writeText(id);
    setCopiedTraceId(id);
    setTimeout(() => setCopiedTraceId(null), 2000);
  };

  const getStatusBadge = (code: number) => {
    if (code >= 200 && code < 300) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
          {code} OK
        </span>
      );
    }
    if (code === 400 || code === 404) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
          <AlertTriangle className="w-3 h-3 text-amber-600" />
          {code}
        </span>
      );
    }
    if (code === 401 || code === 403) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800 border border-purple-200">
          <ShieldCheck className="w-3 h-3 text-purple-600" />
          {code} AUTH
        </span>
      );
    }
    if (code === 429) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-orange-100 text-orange-800 border border-orange-200">
          <Zap className="w-3 h-3 text-orange-600" />
          429 RATE
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-800 border border-red-200">
        <XCircle className="w-3 h-3 text-red-600" />
        {code} ERR
      </span>
    );
  };

  const getMethodBadge = (method: string) => {
    switch (method.toUpperCase()) {
      case 'GET':
        return <span className="px-2 py-0.5 rounded font-mono text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">GET</span>;
      case 'POST':
        return <span className="px-2 py-0.5 rounded font-mono text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">POST</span>;
      case 'PUT':
        return <span className="px-2 py-0.5 rounded font-mono text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">PUT</span>;
      case 'DELETE':
        return <span className="px-2 py-0.5 rounded font-mono text-[10px] font-bold bg-red-50 text-red-700 border border-red-200">DEL</span>;
      case 'PATCH':
        return <span className="px-2 py-0.5 rounded font-mono text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200">PATCH</span>;
      default:
        return <span className="px-2 py-0.5 rounded font-mono text-[10px] font-bold bg-gray-50 text-gray-700 border border-gray-200">{method}</span>;
    }
  };

  return (
    <div className="space-y-4">
      {/* Controls & Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 w-full md:w-auto">
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search path, traceId, IP..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && fetchTraces()}
              className="w-full pl-9 pr-4 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#D4AF37] outline-none"
            />
          </div>

          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="px-3 py-2 text-xs border border-gray-200 rounded-xl outline-none bg-white font-medium"
          >
            <option value="ALL">All Statuses</option>
            <option value="2xx">2xx Success</option>
            <option value="4xx">4xx Client Errors</option>
            <option value="5xx">5xx Server Errors</option>
          </select>

          <select
            value={methodFilter}
            onChange={e => setMethodFilter(e.target.value)}
            className="px-3 py-2 text-xs border border-gray-200 rounded-xl outline-none bg-white font-medium"
          >
            <option value="ALL">All Methods</option>
            <option value="GET">GET</option>
            <option value="POST">POST</option>
            <option value="PUT">PUT</option>
            <option value="DELETE">DELETE</option>
          </select>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto justify-end">
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              autoRefresh ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-gray-100 text-gray-600 border border-gray-200'
            }`}
            title="Auto-refresh trace stream every 4s"
          >
            <span className={`w-2 h-2 rounded-full ${autoRefresh ? 'bg-emerald-500 animate-pulse' : 'bg-gray-400'}`} />
            <span>{autoRefresh ? 'Live Polling' : 'Paused'}</span>
          </button>

          <button
            onClick={fetchTraces}
            disabled={isLoading}
            className="p-2 rounded-xl text-xs font-semibold border border-gray-200 hover:bg-gray-50 text-gray-700 transition-all cursor-pointer"
            title="Refresh traces"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-[#D4AF37]' : ''}`} />
          </button>

          <button
            onClick={handleClearTraces}
            className="p-2 rounded-xl text-xs font-semibold border border-red-200 hover:bg-red-50 text-red-600 transition-all cursor-pointer"
            title="Flush traces buffer"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Traces Table & Inspector Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <div className={`${selectedTrace ? 'lg:col-span-7' : 'lg:col-span-12'} bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden transition-all`}>
          <div className="px-5 py-3.5 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-[#D4AF37]" />
              <span className="font-bold text-xs text-gray-800">
                APM Request Pipeline ({traces.length} captured)
              </span>
            </div>
            <span className="text-[11px] text-gray-400 font-mono">
              Ring buffer capacity: 80 traces
            </span>
          </div>

          <div className="overflow-x-auto max-h-[580px] overflow-y-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 border-b border-gray-100 text-gray-500 font-semibold uppercase tracking-wider text-[10px] sticky top-0 z-10">
                <tr>
                  <th className="py-2.5 px-4">Status</th>
                  <th className="py-2.5 px-3">Method</th>
                  <th className="py-2.5 px-4">Endpoint Path</th>
                  <th className="py-2.5 px-3">Latency</th>
                  <th className="py-2.5 px-4">Trace ID</th>
                  <th className="py-2.5 px-4 text-right">Inspect</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {traces.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-gray-400 font-mono text-xs">
                      No distributed traces recorded matching criteria. Make API requests or run fault simulator.
                    </td>
                  </tr>
                ) : (
                  traces.map(trace => {
                    const isSelected = selectedTrace?.id === trace.id;
                    return (
                      <tr
                        key={trace.id}
                        onClick={() => setSelectedTrace(trace)}
                        className={`cursor-pointer transition-colors ${
                          isSelected ? 'bg-amber-50/70 border-l-4 border-l-[#D4AF37]' : 'hover:bg-gray-50/60'
                        }`}
                      >
                        <td className="py-2.5 px-4 whitespace-nowrap">
                          {getStatusBadge(trace.statusCode)}
                        </td>
                        <td className="py-2.5 px-3 whitespace-nowrap">
                          {getMethodBadge(trace.method)}
                        </td>
                        <td className="py-2.5 px-4 font-mono font-medium text-gray-800 max-w-xs truncate" title={trace.path}>
                          {trace.path}
                        </td>
                        <td className="py-2.5 px-3 font-mono whitespace-nowrap">
                          <span className={`font-semibold ${
                            trace.durationMs > 100 ? 'text-red-600' :
                            trace.durationMs > 30 ? 'text-amber-600' : 'text-emerald-700'
                          }`}>
                            {trace.durationMs}ms
                          </span>
                        </td>
                        <td className="py-2.5 px-4 font-mono text-[11px] text-gray-500 whitespace-nowrap">
                          <div className="flex items-center gap-1">
                            <span className="truncate max-w-[100px]">{trace.traceId}</span>
                            <button
                              onClick={(e) => handleCopyTraceId(trace.traceId, e)}
                              className="text-gray-400 hover:text-gray-700 cursor-pointer p-0.5"
                              title="Copy Trace ID"
                            >
                              {copiedTraceId === trace.traceId ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                            </button>
                          </div>
                        </td>
                        <td className="py-2.5 px-4 text-right">
                          <ChevronRight className={`w-4 h-4 ml-auto transition-transform ${isSelected ? 'text-[#D4AF37] translate-x-1' : 'text-gray-300'}`} />
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Selected Trace Details Drawer / Inspector */}
        {selectedTrace && (
          <div className="lg:col-span-5 bg-white rounded-2xl border border-gray-200 shadow-md p-5 flex flex-col max-h-[640px] overflow-y-auto space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-[#D4AF37]" />
                <h4 className="font-bold text-sm text-gray-900">Distributed Trace Waterfall</h4>
              </div>
              <button
                onClick={() => setSelectedTrace(null)}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Request Summary Banner */}
            <div className="bg-gray-50 p-3.5 rounded-xl border border-gray-200 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {getMethodBadge(selectedTrace.method)}
                  {getStatusBadge(selectedTrace.statusCode)}
                </div>
                <div className="font-mono text-xs font-bold text-gray-700">
                  {selectedTrace.durationMs}ms
                </div>
              </div>

              <div className="font-mono text-xs font-bold text-gray-900 break-all">
                {selectedTrace.path}
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px] pt-1 border-t border-gray-200/60 text-gray-500 font-mono">
                <div>
                  <span className="text-gray-400 block text-[9px] uppercase">Trace ID</span>
                  <div className="flex items-center gap-1 font-bold text-gray-800 truncate">
                    <span>{selectedTrace.traceId}</span>
                    <button
                      onClick={() => handleCopyTraceId(selectedTrace.traceId)}
                      className="cursor-pointer text-gray-400 hover:text-gray-800"
                    >
                      {copiedTraceId === selectedTrace.traceId ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                    </button>
                  </div>
                </div>
                <div>
                  <span className="text-gray-400 block text-[9px] uppercase">Timestamp</span>
                  <span className="text-gray-700">{selectedTrace.timestamp.split('T')[1].replace('Z', '')}</span>
                </div>
              </div>
            </div>

            {/* Waterfall Spans Timeline */}
            <div>
              <h5 className="text-xs font-bold text-gray-800 mb-2 flex items-center justify-between">
                <span>Execution Spans ({selectedTrace.spans.length})</span>
                <span className="text-[10px] text-gray-400 font-normal">Cumulative latency breakdown</span>
              </h5>

              <div className="space-y-2.5">
                {selectedTrace.spans.map((span, idx) => {
                  const pct = Math.min(100, Math.max(5, Math.round((span.durationMs / Math.max(1, selectedTrace.durationMs)) * 100)));
                  return (
                    <div key={idx} className="bg-gray-50 p-2.5 rounded-xl border border-gray-100">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="font-medium text-gray-800 flex items-center gap-1.5 truncate max-w-[200px]">
                          <span className={`w-1.5 h-1.5 rounded-full ${span.status === 'ERROR' ? 'bg-red-500' : 'bg-emerald-500'}`} />
                          {span.name}
                        </span>
                        <span className="font-mono text-[11px] text-gray-600 font-bold">
                          {span.durationMs}ms ({pct}%)
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${
                            span.status === 'ERROR' ? 'bg-red-500' : 'bg-[#D4AF37]'
                          }`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      {span.details && (
                        <div className="mt-1 font-mono text-[10px] text-red-600">
                          {span.details}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Error Diagnostics & Stack Trace (if present) */}
            {selectedTrace.errorDetails && (
              <div className="bg-red-50/70 border border-red-200 rounded-xl p-3 space-y-1.5">
                <div className="flex items-center gap-1.5 text-xs font-bold text-red-800">
                  <XCircle className="w-3.5 h-3.5 text-red-600" />
                  <span>{selectedTrace.errorDetails.code || 'Exception Details'}</span>
                </div>
                <div className="text-xs text-red-700 leading-relaxed font-mono">
                  {selectedTrace.errorDetails.message}
                </div>
                {selectedTrace.errorDetails.stack && (
                  <pre className="text-[10px] bg-red-950 text-red-100 p-2.5 rounded-lg overflow-x-auto font-mono max-h-36">
                    {selectedTrace.errorDetails.stack}
                  </pre>
                )}
              </div>
            )}

            {/* Request & Response Headers */}
            <div>
              <h5 className="text-xs font-bold text-gray-800 mb-2">Transport Headers</h5>
              <div className="bg-gray-900 text-gray-200 rounded-xl p-3 font-mono text-[11px] space-y-1">
                {selectedTrace.requestHeaders && (
                  <div>
                    <div className="text-amber-400 font-bold mb-1 text-[10px] uppercase">Request Headers:</div>
                    {Object.entries(selectedTrace.requestHeaders).map(([k, v]) => (
                      <div key={k} className="truncate">
                        <span className="text-gray-400">{k}:</span> <span className="text-gray-100">{String(v)}</span>
                      </div>
                    ))}
                  </div>
                )}
                {selectedTrace.responseHeaders && (
                  <div className="pt-2 border-t border-gray-800 mt-2">
                    <div className="text-emerald-400 font-bold mb-1 text-[10px] uppercase">Response Headers:</div>
                    {Object.entries(selectedTrace.responseHeaders).map(([k, v]) => (
                      <div key={k} className="truncate">
                        <span className="text-gray-400">{k}:</span> <span className="text-gray-100">{String(v)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Quick action to correlate logs */}
            {onSelectTraceForLogs && (
              <button
                onClick={() => onSelectTraceForLogs(selectedTrace.traceId)}
                className="w-full py-2.5 rounded-xl text-xs font-bold bg-[#2C2416] text-[#D4AF37] hover:bg-black transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Terminal className="w-3.5 h-3.5" />
                <span>Filter System Logs by this Trace ID</span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
