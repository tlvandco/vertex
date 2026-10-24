import React, { useState } from 'react';
import {
  Play,
  RefreshCw,
  Table as TableIcon,
  Cpu,
  FileCode,
  Download,
  Search,
  Maximize2,
  Minimize2,
  CheckCircle2,
  AlertTriangle,
  Database,
  Layers,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { DBQueryExplainResult } from '../../types';
import { apiClient } from '../../services/apiClient';

interface InteractiveExplainSimulatorProps {
  initialTable?: string;
  className?: string;
}

const PRESET_QUERIES = [
  {
    label: 'Invoices: Active & Paid Ledger',
    table: 'invoices',
    query: "SELECT id, invoice_number, client_name, amount, status FROM invoices WHERE status IN ('PAID', 'PENDING') ORDER BY issue_date DESC LIMIT 50;"
  },
  {
    label: 'Projects: Capital Budgets > $2M',
    table: 'projects',
    query: "SELECT id, project_code, name, client, budget, phase, completion_pct FROM projects WHERE budget_numeric > 2000000 ORDER BY budget_numeric DESC;"
  },
  {
    label: 'Catalog: Material Specification Items',
    table: 'catalog_items',
    query: "SELECT id, sku, title, category, price, csi_division, stock_quantity FROM catalog_items WHERE category = 'MATERIAL' LIMIT 25;"
  },
  {
    label: 'Tasks: High-Priority BIM Clashes',
    table: 'tasks',
    query: "SELECT id, title, assignee, priority, status, due_date FROM tasks WHERE priority IN ('HIGH', 'CRITICAL') ORDER BY due_date ASC;"
  },
  {
    label: 'Security Audit: Forensic Log Stream',
    table: 'audit_logs',
    query: "SELECT id, action, category, status, ip_address, timestamp FROM audit_logs ORDER BY timestamp DESC LIMIT 30;"
  }
];

export const InteractiveExplainSimulator: React.FC<InteractiveExplainSimulatorProps> = ({
  initialTable = 'invoices',
  className = ''
}) => {
  const [queryTargetTable, setQueryTargetTable] = useState<string>(initialTable);
  const [queryInput, setQueryInput] = useState<string>(
    PRESET_QUERIES[0].query
  );
  const [isExplaining, setIsExplaining] = useState<boolean>(false);
  const [explainResult, setExplainResult] = useState<DBQueryExplainResult | null>(null);
  const [activeResultView, setActiveResultView] = useState<'results' | 'plan' | 'json'>('results');
  const [resultFilterTerm, setResultFilterTerm] = useState<string>('');
  const [isMaximized, setIsMaximized] = useState<boolean>(false);

  const handleRunExplain = async () => {
    setIsExplaining(true);
    try {
      const res = await apiClient.explainQuery(queryInput, queryTargetTable);
      setExplainResult(res);
      // Default to results view so user immediately sees the query results
      setActiveResultView('results');
    } catch (err) {
      console.error('Failed to explain query:', err);
    } finally {
      setIsExplaining(false);
    }
  };

  const handlePresetSelect = (preset: typeof PRESET_QUERIES[0]) => {
    setQueryTargetTable(preset.table);
    setQueryInput(preset.query);
  };

  const exportResultsCSV = () => {
    if (!explainResult?.queryResults) return;
    const { columns, rows } = explainResult.queryResults;
    const headerRow = columns.join(',');
    const dataRows = rows.map(r => columns.map(c => `"${r[c] ?? ''}"`).join(','));
    const csvContent = [headerRow, ...dataRows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `query_result_${queryTargetTable}_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  };

  const exportResultsJSON = () => {
    if (!explainResult?.queryResults) return;
    const jsonContent = JSON.stringify(explainResult.queryResults.rows, null, 2);
    const blob = new Blob([jsonContent], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `query_result_${queryTargetTable}_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
  };

  // Filter rows
  const filteredRows = explainResult?.queryResults?.rows.filter(row => {
    if (!resultFilterTerm.trim()) return true;
    const term = resultFilterTerm.toLowerCase();
    return Object.values(row).some(val => String(val).toLowerCase().includes(term));
  }) || [];

  return (
    <div
      className={`${
        isMaximized
          ? 'fixed inset-0 z-50 bg-[#161412] text-gray-100 p-6 flex flex-col h-screen w-screen overflow-hidden'
          : `bg-white border border-gray-200 rounded-3xl p-6 shadow-sm space-y-5 ${className}`
      }`}
    >
      {/* Chrome / Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b pb-4 border-gray-100 dark:border-white/10">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500">
            <Play className="w-4 h-4 fill-emerald-500/20" />
          </div>
          <div>
            <h4
              className={`text-sm font-bold flex items-center gap-2 ${
                isMaximized ? 'text-white' : 'text-gray-900'
              }`}
            >
              <span>Interactive EXPLAIN ANALYZE Simulator & Query Engine</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full font-mono font-normal bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                PostgreSQL 16 High-Throughput
              </span>
            </h4>
            <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
              Simulate planner execution trees, inspect cost breakdowns, and view the actual retrieved query dataset.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Preset queries pill selector */}
          <div className="hidden md:flex items-center gap-1.5 text-xs">
            <span className="text-[10px] uppercase font-mono text-gray-400">Presets:</span>
            <select
              onChange={e => {
                const found = PRESET_QUERIES.find(p => p.label === e.target.value);
                if (found) handlePresetSelect(found);
              }}
              className="px-2.5 py-1.5 rounded-xl border border-gray-200 dark:border-white/15 bg-gray-50 dark:bg-black/40 text-xs font-semibold outline-none cursor-pointer"
            >
              {PRESET_QUERIES.map(p => (
                <option key={p.label} value={p.label}>
                  {p.label}
                </option>
              ))}
            </select>
          </div>

          {/* Window Maximize / Minimize button */}
          <button
            type="button"
            onClick={() => setIsMaximized(!isMaximized)}
            className="p-2 rounded-xl border border-gray-200 dark:border-white/15 hover:bg-gray-100 dark:hover:bg-white/10 text-gray-600 dark:text-gray-300 transition-colors flex items-center gap-1 text-xs font-semibold cursor-pointer"
            title={isMaximized ? 'Restore window size' : 'Maximize window for full query analysis'}
          >
            {isMaximized ? (
              <>
                <Minimize2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline text-[11px]">Restore</span>
              </>
            ) : (
              <>
                <Maximize2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline text-[11px]">Maximize</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Query Bar */}
      <div className="space-y-2">
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              value={queryInput}
              onChange={e => setQueryInput(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  handleRunExplain();
                }
              }}
              placeholder="Enter SQL Query (e.g. SELECT * FROM invoices WHERE client_id = $1)"
              className={`w-full p-3 rounded-2xl text-xs font-mono outline-none border transition-all ${
                isMaximized
                  ? 'bg-black/60 border-white/15 text-emerald-400 focus:border-emerald-500'
                  : 'bg-gray-50 border-gray-200 text-gray-900 focus:bg-white focus:border-[#D4AF37]'
              }`}
            />
            <span className="absolute right-3 top-3 text-[10px] font-mono text-gray-400 pointer-events-none hidden sm:inline">
              Press Enter ↵
            </span>
          </div>

          <select
            value={queryTargetTable}
            onChange={e => {
              const newTbl = e.target.value;
              setQueryTargetTable(newTbl);
              const foundPreset = PRESET_QUERIES.find(p => p.table === newTbl);
              if (foundPreset) {
                setQueryInput(foundPreset.query);
              } else {
                setQueryInput(`SELECT * FROM ${newTbl} LIMIT 50;`);
              }
            }}
            className={`p-3 rounded-2xl text-xs font-semibold outline-none border cursor-pointer ${
              isMaximized
                ? 'bg-black/60 border-white/15 text-white'
                : 'bg-gray-50 border-gray-200 text-gray-800'
            }`}
          >
            <option value="invoices">Table: invoices</option>
            <option value="projects">Table: projects</option>
            <option value="catalog_items">Table: catalog_items</option>
            <option value="tasks">Table: tasks</option>
            <option value="audit_logs">Table: audit_logs</option>
          </select>

          <button
            onClick={handleRunExplain}
            disabled={isExplaining}
            className="px-5 py-3 bg-[#2C2416] hover:bg-black text-[#D4AF37] font-bold text-xs rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0 disabled:opacity-50"
          >
            {isExplaining ? (
              <RefreshCw className="w-4 h-4 animate-spin text-[#D4AF37]" />
            ) : (
              <Play className="w-4 h-4 fill-[#D4AF37]" />
            )}
            <span>Run Explain & View Results</span>
          </button>
        </div>
      </div>

      {/* Results Display Area */}
      {explainResult && (
        <div
          className={`space-y-4 rounded-2xl overflow-hidden flex flex-col ${
            isMaximized ? 'flex-1 min-h-0' : ''
          }`}
        >
          {/* Subheader view switch tabs + stats */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-gray-100 dark:bg-black/40 p-2.5 rounded-2xl border border-gray-200 dark:border-white/10">
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setActiveResultView('results')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  activeResultView === 'results'
                    ? 'bg-white dark:bg-[#2C2416] text-black dark:text-[#D4AF37] shadow-sm'
                    : 'text-gray-500 hover:text-gray-900 dark:text-gray-400'
                }`}
              >
                <TableIcon className="w-3.5 h-3.5" />
                <span>
                  Query Results ({explainResult.queryResults?.rows.length || explainResult.rowsActual} rows)
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActiveResultView('plan')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  activeResultView === 'plan'
                    ? 'bg-white dark:bg-[#2C2416] text-black dark:text-[#D4AF37] shadow-sm'
                    : 'text-gray-500 hover:text-gray-900 dark:text-gray-400'
                }`}
              >
                <Cpu className="w-3.5 h-3.5" />
                <span>Execution Plan & Costs</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveResultView('json')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  activeResultView === 'json'
                    ? 'bg-white dark:bg-[#2C2416] text-black dark:text-[#D4AF37] shadow-sm'
                    : 'text-gray-500 hover:text-gray-900 dark:text-gray-400'
                }`}
              >
                <FileCode className="w-3.5 h-3.5" />
                <span>Raw JSON</span>
              </button>
            </div>

            {/* Quick Metrics Badge */}
            <div className="flex items-center gap-3 text-[11px] font-mono text-gray-500 dark:text-gray-400">
              <span className="flex items-center gap-1">
                Plan: <strong className="text-emerald-500">{explainResult.planType}</strong>
              </span>
              <span>•</span>
              <span>
                Time: <strong className="text-white dark:text-white font-bold">{explainResult.executionTimeMs} ms</strong>
              </span>
              <span>•</span>
              <span>
                Buffer: <strong className="text-white dark:text-white font-bold">{explainResult.bufferHits} blk</strong>
              </span>
            </div>
          </div>

          {/* VIEW 1: QUERY RESULTS (ACTUAL DATA ROWS) */}
          {activeResultView === 'results' && explainResult.queryResults && (
            <div
              className={`flex flex-col border border-gray-200 dark:border-white/10 rounded-2xl overflow-hidden bg-white dark:bg-black/30 ${
                isMaximized ? 'flex-1 min-h-0' : ''
              }`}
            >
              {/* Filter & Export bar */}
              <div className="p-3 bg-gray-50 dark:bg-white/5 border-b border-gray-200 dark:border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                <div className="relative w-full sm:w-64">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-gray-400" />
                  <input
                    type="text"
                    value={resultFilterTerm}
                    onChange={e => setResultFilterTerm(e.target.value)}
                    placeholder="Search in query results..."
                    className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-white dark:bg-black/60 border border-gray-200 dark:border-white/15 text-xs outline-none"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-gray-500">
                    Showing {filteredRows.length} of {explainResult.queryResults.totalRows} rows
                  </span>
                  <button
                    type="button"
                    onClick={exportResultsCSV}
                    className="px-2.5 py-1.5 rounded-xl border border-gray-200 dark:border-white/15 hover:bg-gray-100 dark:hover:bg-white/10 font-bold text-[11px] flex items-center gap-1 cursor-pointer"
                  >
                    <Download className="w-3 h-3" />
                    <span>CSV</span>
                  </button>
                  <button
                    type="button"
                    onClick={exportResultsJSON}
                    className="px-2.5 py-1.5 rounded-xl border border-gray-200 dark:border-white/15 hover:bg-gray-100 dark:hover:bg-white/10 font-bold text-[11px] flex items-center gap-1 cursor-pointer"
                  >
                    <FileCode className="w-3 h-3" />
                    <span>JSON</span>
                  </button>
                </div>
              </div>

              {/* Table Data Grid */}
              <div
                className={`overflow-x-auto overflow-y-auto ${
                  isMaximized ? 'flex-1 max-h-none' : 'max-h-96'
                }`}
              >
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-gray-100 dark:bg-white/10 text-gray-700 dark:text-gray-300 font-mono text-[11px] uppercase tracking-wider border-b border-gray-200 dark:border-white/10">
                      <th className="p-3 w-10 text-center text-gray-400 font-mono">#</th>
                      {explainResult.queryResults.columns.map(col => (
                        <th key={col} className="p-3 font-semibold whitespace-nowrap">
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-white/5 font-sans">
                    {filteredRows.map((row, idx) => (
                      <tr
                        key={idx}
                        className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors group"
                      >
                        <td className="p-3 text-center text-[10px] font-mono text-gray-400">
                          {idx + 1}
                        </td>
                        {explainResult.queryResults!.columns.map(col => {
                          const val = row[col];
                          const strVal = String(val ?? '');
                          const isStatus = col.toLowerCase().includes('status');
                          const isPriority = col.toLowerCase().includes('priority');
                          const isMoney = strVal.startsWith('$');
                          const isId = col.toLowerCase() === 'id' || col.toLowerCase().includes('code') || col.toLowerCase() === 'sku';

                          return (
                            <td key={col} className="p-3 whitespace-nowrap">
                              {isStatus ? (
                                <span
                                  className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                                    strVal === 'PAID' || strVal === 'ACTIVE' || strVal === 'SUCCESS' || strVal === 'COMPLETED'
                                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                      : strVal === 'PENDING' || strVal === 'REVIEW' || strVal === 'PLANNING'
                                      ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                                      : 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300'
                                  }`}
                                >
                                  {strVal}
                                </span>
                              ) : isPriority ? (
                                <span
                                  className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                                    strVal === 'CRITICAL'
                                      ? 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300'
                                      : strVal === 'HIGH'
                                      ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                                      : 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                                  }`}
                                >
                                  {strVal}
                                </span>
                              ) : isMoney ? (
                                <span className="font-mono font-bold text-emerald-600 dark:text-[#D4AF37]">
                                  {strVal}
                                </span>
                              ) : isId ? (
                                <span className="font-mono text-gray-500 dark:text-gray-400 font-semibold">
                                  {strVal}
                                </span>
                              ) : (
                                <span className="text-gray-800 dark:text-gray-200">
                                  {strVal}
                                </span>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* VIEW 2: EXECUTION PLAN & DETAILED OPTIMIZER METRICS */}
          {activeResultView === 'plan' && (
            <div className="p-5 bg-gray-900 text-gray-200 rounded-2xl border border-gray-800 text-xs space-y-4 font-mono">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-800 pb-3">
                <div className="flex items-center gap-2">
                  <span className="text-gray-400">Access Method:</span>
                  <span
                    className={`px-2.5 py-1 rounded-lg font-bold text-xs ${
                      explainResult.planType === 'Index Scan'
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                        : explainResult.planType === 'Bitmap Heap Scan'
                        ? 'bg-blue-950 text-blue-300 border border-blue-800'
                        : 'bg-amber-950 text-amber-300 border border-amber-800'
                    }`}
                  >
                    {explainResult.planType}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-xs">
                  <span>
                    Total Cost: <strong className="text-white">{explainResult.totalCost}</strong>
                  </span>
                  <span>
                    Execution Time:{' '}
                    <strong className="text-emerald-400">{explainResult.executionTimeMs} ms</strong>
                  </span>
                  <span>
                    Buffer Hits:{' '}
                    <strong className="text-[#D4AF37]">{explainResult.bufferHits} blocks</strong>
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                <div className="bg-black/40 p-3 rounded-xl border border-white/5 space-y-1">
                  <span className="text-[10px] text-gray-400 uppercase tracking-wider block">
                    Target Table
                  </span>
                  <span className="text-white font-bold">{explainResult.targetTable}</span>
                </div>
                <div className="bg-black/40 p-3 rounded-xl border border-white/5 space-y-1">
                  <span className="text-[10px] text-gray-400 uppercase tracking-wider block">
                    B-Tree / GIN Index Used
                  </span>
                  <span className="text-[#D4AF37] font-bold">
                    {explainResult.usedIndex || 'None'}
                  </span>
                </div>
                <div className="bg-black/40 p-3 rounded-xl border border-white/5 space-y-1">
                  <span className="text-[10px] text-gray-400 uppercase tracking-wider block">
                    Rows (Estimated / Actual)
                  </span>
                  <span className="text-emerald-300 font-bold">
                    {explainResult.rowsEstimated} / {explainResult.rowsActual}
                  </span>
                </div>
              </div>

              <div className="bg-emerald-950/30 border border-emerald-800/40 p-3 rounded-xl text-emerald-300 text-[11px] flex items-start gap-2">
                <Sparkles className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-emerald-200 font-sans font-semibold">
                    PostgreSQL Query Optimizer Recommendation
                  </strong>
                  <span>{explainResult.recommendations[0]}</span>
                </div>
              </div>
            </div>
          )}

          {/* VIEW 3: RAW JSON */}
          {activeResultView === 'json' && (
            <div className="bg-gray-950 text-emerald-400 p-4 rounded-2xl font-mono text-xs overflow-x-auto max-h-96 border border-gray-800 shadow-inner">
              <pre>{JSON.stringify(explainResult, null, 2)}</pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
