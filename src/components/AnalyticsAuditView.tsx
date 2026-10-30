import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import {
  Activity,
  ShieldCheck,
  Terminal,
  Download,
  Filter,
  Search,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  RefreshCw,
  Clock,
  Sparkles,
  Server,
  Zap,
  Cpu,
  Globe,
  HardDrive,
  Database,
  Table as TableIcon,
  Play,
  Copy,
  Check,
  Layers3,
  GitFork,
  Key,
  FileCode2,
  Bug,
  ShieldAlert,
  Layers
} from 'lucide-react';
import { apiClient, SystemMetrics } from '../services/apiClient';
import { DATABASE_SCHEMA_TABLES, POSTGRESQL_DDL_SCHEMA } from '../data/dbSchemaData';
import { DBStatusResponse, DBQueryExplainResult } from '../types';
import { SecurityTestingSuite } from './analytics/SecurityTestingSuite';
import { InteractiveExplainSimulator } from './analytics/InteractiveExplainSimulator';
import { DistributedTracingViewer } from './analytics/DistributedTracingViewer';
import { FaultInjectionSandbox } from './analytics/FaultInjectionSandbox';
import { LiveLogConsole } from './analytics/LiveLogConsole';
import { SRETelemetryMetrics } from './analytics/SRETelemetryMetrics';

export const AnalyticsAuditView: React.FC = () => {
  const { auditLogs, systemLogs, addToast, logAuditAction, clearAuditLogs, hasPermission, currentUser } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [activeTab, setActiveTab] = useState<'telemetry' | 'traces' | 'debugger' | 'console' | 'database' | 'security' | 'audit'>('telemetry');
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null);
  const [dbStatus, setDbStatus] = useState<DBStatusResponse | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Cross-workspace navigation state
  const [logTraceSearchQuery, setLogTraceSearchQuery] = useState('');

  // Database Schema Sub-tab & Search
  const [selectedTable, setSelectedTable] = useState<string>('projects');
  const [schemaSearch, setSchemaSearch] = useState<string>('');
  const [schemaViewMode, setSchemaViewMode] = useState<'tables' | 'ddl'>('tables');
  const [copiedDDL, setCopiedDDL] = useState(false);

  const fetchLiveMetrics = async () => {
    setIsRefreshing(true);
    const [m, db] = await Promise.all([
      apiClient.fetchMetrics(),
      apiClient.fetchDBStatus()
    ]);
    setMetrics(m);
    setDbStatus(db);
    setIsRefreshing(false);
  };

  useEffect(() => {
    fetchLiveMetrics();
    const interval = setInterval(fetchLiveMetrics, 6000);
    return () => clearInterval(interval);
  }, []);

  const handleCopyDDL = () => {
    navigator.clipboard.writeText(POSTGRESQL_DDL_SCHEMA);
    setCopiedDDL(true);
    setTimeout(() => setCopiedDDL(false), 2000);
  };

  const filteredAuditLogs = auditLogs.filter(log => {
    const matchesSearch =
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.diagnostics.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.ip.includes(searchTerm);

    const matchesCategory = categoryFilter === 'ALL' || log.category === categoryFilter;
    const matchesStatus = statusFilter === 'ALL' || log.status === statusFilter;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const exportCSV = () => {
    const headers = 'ID,Timestamp,User,Action,Category,Status,IP,Diagnostics\n';
    const rows = filteredAuditLogs
      .map(l => `"${l.id}","${l.timestamp}","${l.user}","${l.action}","${l.category}","${l.status}","${l.ip}","${l.diagnostics}"`)
      .join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `vertex_audit_logs_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    addToast('success', 'Audit log export downloaded as CSV');
  };

  const simulateSystemAudit = () => {
    logAuditAction(
      'MANUAL_SYSTEM_DIAGNOSTICS',
      'CORE_SYSTEM',
      'SUCCESS',
      'Verified all database indices, distributed APM traces, and cryptographic hashes.'
    );
    addToast('success', 'Full system diagnostics completed with 0 anomalies');
    fetchLiveMetrics();
  };

  // Correlation helpers
  const handleSelectTraceForLogs = (traceId: string) => {
    setLogTraceSearchQuery(traceId);
    setActiveTab('console');
    addToast('info', `Filtered Live Log Console for Trace ID: ${traceId}`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-serif font-bold text-[#2C2416]">System Observability & APM Command Center</h2>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Production Telemetry Active
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-0.5">
            Distributed request tracing, golden signal metrics, real-time log engine, and active fault debugging suite.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {(hasPermission('SYSTEM_ADMIN_CONFIG') || currentUser.role === 'ADMIN') && (
            <button
              onClick={() => {
                if (confirm('Are you sure you want to clear forensic audit logs? This action is tracked.')) {
                  clearAuditLogs();
                }
              }}
              className="px-3 py-2 rounded-xl text-xs font-bold border border-red-200 hover:bg-red-50 text-red-700 transition-all flex items-center gap-1.5 cursor-pointer"
              title="Flush and reset audit log ledger"
            >
              <span>Reset Logs</span>
            </button>
          )}
          <button
            onClick={simulateSystemAudit}
            className="px-3.5 py-2 rounded-xl text-xs font-bold border border-gray-300 hover:bg-gray-50 text-gray-700 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>Run Health Check</span>
          </button>
          {(hasPermission('EXPORT_AUDIT_LOGS') || hasPermission('EXPORT_FORENSIC_LOGS') || currentUser.role === 'ADMIN') && (
            <button
              onClick={exportCSV}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-[#2C2416] hover:bg-black text-[#D4AF37] shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
          )}
        </div>
      </div>

      {/* Observability Pillars Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-gray-200 pb-3 overflow-x-auto scrollbar-none">
        <button
          onClick={() => setActiveTab('telemetry')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'telemetry' ? 'bg-[#2C2416] text-[#D4AF37] shadow-xs' : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <Activity className="w-3.5 h-3.5 text-[#D4AF37]" />
          <span>Telemetry & Golden Signals</span>
        </button>

        <button
          onClick={() => setActiveTab('traces')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'traces' ? 'bg-[#2C2416] text-[#D4AF37] shadow-xs' : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <Layers className="w-3.5 h-3.5 text-blue-500" />
          <span>Distributed Tracing (APM)</span>
        </button>

        <button
          onClick={() => setActiveTab('debugger')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'debugger' ? 'bg-[#2C2416] text-[#D4AF37] shadow-xs' : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <Bug className="w-3.5 h-3.5 text-amber-500" />
          <span>Interactive Debugger & Sandbox</span>
        </button>

        <button
          onClick={() => setActiveTab('console')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'console' ? 'bg-[#2C2416] text-[#D4AF37] shadow-xs' : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <Terminal className="w-3.5 h-3.5 text-emerald-500" />
          <span>Live Log Stream ({systemLogs.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('database')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'database' ? 'bg-[#2C2416] text-[#D4AF37] shadow-xs' : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <Database className="w-3.5 h-3.5 text-indigo-500" />
          <span>Database Engine & DDL</span>
        </button>

        <button
          onClick={() => setActiveTab('security')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'security' ? 'bg-[#2C2416] text-[#D4AF37] shadow-xs' : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>Security & Pen Test</span>
        </button>

        <button
          onClick={() => setActiveTab('audit')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'audit' ? 'bg-[#2C2416] text-[#D4AF37] shadow-xs' : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <Clock className="w-3.5 h-3.5 text-gray-500" />
          <span>Audit Ledger ({auditLogs.length})</span>
        </button>
      </div>

      {/* WORKSPACE 1: SRE TELEMETRY & GOLDEN SIGNALS */}
      {activeTab === 'telemetry' && (
        <SRETelemetryMetrics metrics={metrics} />
      )}

      {/* WORKSPACE 2: DISTRIBUTED TRACING & APM WATERFALL */}
      {activeTab === 'traces' && (
        <DistributedTracingViewer onSelectTraceForLogs={handleSelectTraceForLogs} />
      )}

      {/* WORKSPACE 3: INTERACTIVE DEBUGGER & CHAOS SANDBOX */}
      {activeTab === 'debugger' && (
        <FaultInjectionSandbox
          onFaultInjected={fetchLiveMetrics}
          onJumpToTraces={() => setActiveTab('traces')}
          onJumpToLogs={() => setActiveTab('console')}
        />
      )}

      {/* WORKSPACE 4: LIVE STREAMING LOG ENGINE */}
      {activeTab === 'console' && (
        <LiveLogConsole
          logs={systemLogs}
          initialSearchQuery={logTraceSearchQuery}
          onSelectTraceId={(traceId) => {
            setActiveTab('traces');
          }}
        />
      )}

      {/* WORKSPACE 5: DATABASE ENGINE & DDL */}
      {activeTab === 'database' && (
        <div className="space-y-6">
          {/* Top Controls */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-gray-200 shadow-xs">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setSchemaViewMode('tables')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  schemaViewMode === 'tables'
                    ? 'bg-[#2C2416] text-[#D4AF37] shadow-xs'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <TableIcon className="w-3.5 h-3.5 inline mr-1" />
                Entity Schema Explorer
              </button>
              <button
                onClick={() => setSchemaViewMode('ddl')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  schemaViewMode === 'ddl'
                    ? 'bg-[#2C2416] text-[#D4AF37] shadow-xs'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <FileCode2 className="w-3.5 h-3.5 inline mr-1" />
                PostgreSQL DDL Scripts
              </button>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              {schemaViewMode === 'tables' && (
                <div className="relative flex-1 sm:w-60">
                  <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search tables or columns..."
                    value={schemaSearch}
                    onChange={e => setSchemaSearch(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-xl outline-none focus:bg-white"
                  />
                </div>
              )}

              {schemaViewMode === 'ddl' && (
                <button
                  onClick={handleCopyDDL}
                  className="px-3 py-1.5 bg-[#D4AF37] hover:bg-[#B8860B] text-black font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  {copiedDDL ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedDDL ? 'Copied DDL!' : 'Copy SQL DDL'}</span>
                </button>
              )}
            </div>
          </div>

          {schemaViewMode === 'tables' ? (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Table Selection Sidebar */}
              <div className="md:col-span-1 bg-white border border-gray-200 rounded-2xl p-3 space-y-1.5 shadow-xs max-h-96 overflow-y-auto">
                <div className="text-[10px] uppercase font-bold text-gray-400 px-2 mb-2 tracking-wider">
                  Database Tables ({DATABASE_SCHEMA_TABLES.length})
                </div>
                {DATABASE_SCHEMA_TABLES.filter(t => 
                  t.name.toLowerCase().includes(schemaSearch.toLowerCase()) ||
                  t.description.toLowerCase().includes(schemaSearch.toLowerCase()) ||
                  t.module.toLowerCase().includes(schemaSearch.toLowerCase())
                ).map(t => (
                  <button
                    key={t.name}
                    onClick={() => setSelectedTable(t.name)}
                    className={`w-full text-left p-2.5 rounded-xl text-xs transition-all flex items-center justify-between cursor-pointer ${
                      selectedTable === t.name
                        ? 'bg-[#2C2416] text-[#D4AF37] font-bold shadow-xs'
                        : 'hover:bg-gray-100 text-gray-700'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <TableIcon className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">{t.name}</span>
                    </div>
                    <span className="text-[9px] px-1.5 py-0.5 rounded font-mono font-bold bg-gray-200 text-gray-700">
                      {t.columns.length} col
                    </span>
                  </button>
                ))}
              </div>

              {/* Table Schema Detail Viewer */}
              {(() => {
                const currentTableData = DATABASE_SCHEMA_TABLES.find(t => t.name === selectedTable) || DATABASE_SCHEMA_TABLES[0];
                return (
                  <div className="md:col-span-3 bg-white border border-gray-200 rounded-2xl p-5 shadow-xs space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-gray-100 gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-base font-bold font-mono text-gray-900">{currentTableData.name}</h4>
                          <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                            {currentTableData.module}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">{currentTableData.description}</p>
                      </div>

                      <div className="flex items-center gap-2 text-xs font-mono text-gray-500">
                        <span>Est. Rows: <strong className="text-gray-900">{currentTableData.estimatedRowCount.toLocaleString()}</strong></span>
                        <span>&bull;</span>
                        <span>Indexes: <strong className="text-gray-900">{currentTableData.indexes.length}</strong></span>
                      </div>
                    </div>

                    {/* Columns Table */}
                    <div>
                      <h5 className="text-xs font-bold text-gray-700 mb-2 flex items-center gap-1.5">
                        <Layers3 className="w-3.5 h-3.5 text-amber-600" />
                        Column Definitions & Foreign Key Constraints
                      </h5>
                      <div className="border border-gray-200 rounded-xl overflow-hidden">
                        <table className="w-full text-left text-xs">
                          <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 font-semibold">
                            <tr>
                              <th className="p-2.5">Column</th>
                              <th className="p-2.5">Type</th>
                              <th className="p-2.5">Constraints</th>
                              <th className="p-2.5">Description</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100">
                            {currentTableData.columns.map((c, idx) => (
                              <tr key={idx} className="hover:bg-gray-50/50">
                                <td className="p-2.5 font-mono font-bold text-gray-900 flex items-center gap-1">
                                  {c.isPrimary && <span title="Primary Key"><Key className="w-3 h-3 text-amber-500" /></span>}
                                  {c.name}
                                </td>
                                <td className="p-2.5 font-mono text-blue-700 text-[11px]">{c.type}</td>
                                <td className="p-2.5 text-[11px]">
                                  {c.isPrimary && <span className="text-amber-700 font-bold mr-1">PRIMARY KEY</span>}
                                  {!c.isNullable && <span className="text-gray-500 mr-1">NOT NULL</span>}
                                  {c.defaultValue && <span className="text-emerald-700 font-mono">DEFAULT {c.defaultValue}</span>}
                                  {c.references && (
                                    <div className="text-purple-700 font-mono text-[10px] mt-0.5 flex items-center gap-0.5">
                                      <GitFork className="w-2.5 h-2.5" />
                                      FK &rarr; {c.references.table}({c.references.column})
                                    </div>
                                  )}
                                </td>
                                <td className="p-2.5 text-gray-500 text-[11px]">{c.description}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Indexes List */}
                    <div>
                      <h5 className="text-xs font-bold text-gray-700 mb-2 flex items-center gap-1.5">
                        <Zap className="w-3.5 h-3.5 text-indigo-600" />
                        Performance Indexes ({currentTableData.indexes.length})
                      </h5>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                        {currentTableData.indexes.map((idx, i) => (
                          <div key={i} className="p-2.5 rounded-xl border border-gray-200 bg-gray-50/60 flex items-center justify-between">
                            <div>
                              <div className="font-mono font-bold text-gray-800 text-[11px]">{idx.name}</div>
                              <div className="text-[10px] text-gray-500 font-mono mt-0.5">
                                ON ({idx.columns.join(', ')})
                              </div>
                            </div>
                            <span className="text-[9px] px-2 py-0.5 rounded font-mono font-bold bg-white border border-gray-200 text-indigo-700">
                              {idx.type}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          ) : (
            <div className="bg-gray-950 text-gray-100 rounded-2xl p-4 font-mono text-xs overflow-x-auto max-h-[500px] border border-gray-800 shadow-inner">
              <pre>{POSTGRESQL_DDL_SCHEMA}</pre>
            </div>
          )}

          {/* Interactive Query Analyzer & Results Simulator */}
          <InteractiveExplainSimulator initialTable={selectedTable} />
        </div>
      )}

      {/* WORKSPACE 6: SECURITY & PEN-TEST SUITE */}
      {activeTab === 'security' && (
        <SecurityTestingSuite />
      )}

      {/* WORKSPACE 7: AUDIT LOG EXPLORER */}
      {activeTab === 'audit' && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="bg-white p-4 rounded-2xl border border-gray-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Filter by user, action, IP..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#D4AF37] outline-none"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto scrollbar-none">
              <select
                value={categoryFilter}
                onChange={e => setCategoryFilter(e.target.value)}
                className="px-3 py-2 text-xs border border-gray-200 rounded-xl outline-none bg-white font-medium"
              >
                <option value="ALL">All Categories</option>
                <option value="CORE_SYSTEM">Core System</option>
                <option value="FINANCIAL_GOVERNANCE">Financials</option>
                <option value="PROJECT_MANAGEMENT">Project Mgmt</option>
                <option value="COLLABORATION">Collaboration</option>
                <option value="PORTAL">Portal</option>
                <option value="OBSERVABILITY_DEBUG">Observability & Debug</option>
              </select>

              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className="px-3 py-2 text-xs border border-gray-200 rounded-xl outline-none bg-white font-medium"
              >
                <option value="ALL">All Statuses</option>
                <option value="SUCCESS">Success Only</option>
                <option value="FAILURE">Failure</option>
                <option value="ERROR">Error</option>
              </select>
            </div>
          </div>

          {/* Audit Logs Table */}
          <div className="bg-white rounded-3xl border border-gray-200/80 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 border-b border-gray-100 text-gray-500 font-semibold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="py-3.5 px-6">Timestamp</th>
                    <th className="py-3.5 px-4">User & Role</th>
                    <th className="py-3.5 px-4">Action</th>
                    <th className="py-3.5 px-4">Category</th>
                    <th className="py-3.5 px-4">Resource Target</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4">IP Address</th>
                    <th className="py-3.5 px-6">Diagnostics & Audit Trace</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredAuditLogs.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-gray-400">
                        No audit events match your search criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredAuditLogs.map(log => (
                      <tr key={log.id} className="hover:bg-gray-50/70 transition-colors">
                        <td className="py-3.5 px-6 font-mono text-gray-500 whitespace-nowrap">{log.timestamp}</td>
                        <td className="py-3.5 px-4">
                          <div className="font-semibold text-gray-900">{log.user}</div>
                          {log.userRole && (
                            <span className="text-[10px] uppercase font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                              {log.userRole}
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 font-mono font-bold text-[#8B7355]">{log.action}</td>
                        <td className="py-3.5 px-4 text-gray-500">{log.category}</td>
                        <td className="py-3.5 px-4">
                          {log.resourceType ? (
                            <div className="font-mono text-[11px] text-gray-700">
                              <span className="font-bold text-gray-900">{log.resourceType}</span>
                              {log.resourceId && <span className="text-gray-400 block text-[10px]">ID: {log.resourceId}</span>}
                            </div>
                          ) : (
                            <span className="text-gray-400 italic">SYSTEM</span>
                          )}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            log.status === 'SUCCESS' ? 'bg-emerald-100 text-emerald-800' :
                            log.status === 'FAILURE' ? 'bg-amber-100 text-amber-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {log.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-mono text-gray-400">{log.ip}</td>
                        <td className="py-3.5 px-6 text-gray-700 max-w-sm">
                          <div className="leading-snug">{log.diagnostics}</div>
                          {log.metadata && (
                            <div className="mt-1 font-mono text-[10px] text-gray-500 bg-gray-50 p-1 rounded border border-gray-200 truncate">
                              {JSON.stringify(log.metadata)}
                            </div>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
