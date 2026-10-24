import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { UserRole } from '../types';
import {
  MessageSquare,
  Plus,
  Compass,
  Briefcase,
  Layers,
  DollarSign,
  Users,
  Activity,
  LogOut,
  ChevronDown,
  Sparkles,
  Shield,
  Palette,
  Server,
  Lock,
  UserPlus,
  UserCheck,
  ShieldCheck,
  CheckCircle2,
  Search
} from 'lucide-react';
import { ClusterHealthModal } from './ClusterHealthModal';
import { UserOnboardingModal } from './UserOnboardingModal';
import { apiClient } from '../services/apiClient';
import { AppViewId, hasViewAccess, getRolePermissions } from '../utils/rbac';

export const Navbar: React.FC = () => {
  const {
    currentUser,
    switchRole,
    activeView,
    setActiveView,
    channels,
    setChatOpen,
    chatOpen,
    setIsCreateProjectOpen,
    setEditingProjectData,
    addToast
  } = useApp();

  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isRolePickerOpen, setIsRolePickerOpen] = useState(false);
  const [isOnboardingModalOpen, setIsOnboardingModalOpen] = useState(false);
  const [onboardingInitialType, setOnboardingInitialType] = useState<'CLIENT' | 'STAFF'>('STAFF');
  const [isClusterModalOpen, setIsClusterModalOpen] = useState(false);
  const [latency, setLatency] = useState(12);

  const rolePermissions = getRolePermissions(currentUser.role);

  // Auto-switch to authorized default view if current activeView is forbidden for this role
  useEffect(() => {
    if (!hasViewAccess(currentUser.role, activeView)) {
      setActiveView(rolePermissions.defaultView);
    }
  }, [currentUser.role, activeView, rolePermissions.defaultView, setActiveView]);

  useEffect(() => {
    const probe = async () => {
      await apiClient.fetchHealth();
      setLatency(apiClient.getAverageLatency());
    };
    probe();
    const timer = setInterval(probe, 12000);
    return () => clearInterval(timer);
  }, []);

  const totalUnread = channels.reduce((sum, c) => sum + c.unreadCount, 0);

  const roles: { role: UserRole; label: string; badgeColor: string; isStaff: boolean; summary: string }[] = [
    {
      role: 'ADMIN',
      label: 'Alexander Wright (Admin)',
      badgeColor: 'bg-red-50 text-red-700 border-red-200',
      isStaff: true,
      summary: 'Executive governance, security IAM & system analytics'
    },
    {
      role: 'PROJECT_MANAGER',
      label: 'Sophia Chen (Project Mgr)',
      badgeColor: 'bg-blue-50 text-blue-700 border-blue-200',
      isStaff: true,
      summary: 'Project delivery, task allocation & budget oversight'
    },
    {
      role: 'DESIGNER',
      label: 'Marcus Vance (Lead Architect)',
      badgeColor: 'bg-amber-50 text-amber-700 border-amber-200',
      isStaff: true,
      summary: '3D BIM CAD modeling, zoning calculations & moodboards'
    },
    {
      role: 'SITE_ENGINEER',
      label: 'David Thorne (Site Engineer)',
      badgeColor: 'bg-purple-50 text-purple-700 border-purple-200',
      isStaff: true,
      summary: 'MEP coordination, structural clashes & field progress'
    },
    {
      role: 'FINANCE',
      label: 'Claire Dupont (Financial Controller)',
      badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      isStaff: true,
      summary: 'Escrow ledgers, invoices, change orders & payment draws'
    },
    {
      role: 'CLIENT',
      label: 'Eleanor Sterling (Estate Client)',
      badgeColor: 'bg-teal-50 text-teal-700 border-teal-200',
      isStaff: false,
      summary: 'Private estate portal, design reviews & milestone sign-offs'
    }
  ];

  const currentRoleConfig = roles.find(r => r.role === currentUser.role) || roles[0];

  const allNavItems: { id: AppViewId; label: string; icon: any }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: Compass },
    { id: 'projects', label: currentUser.role === 'CLIENT' ? 'My Project' : 'Projects', icon: Briefcase },
    { id: 'design-portal', label: currentUser.role === 'CLIENT' ? 'Design Approvals' : 'Design Studio', icon: Palette },
    { id: 'financials', label: currentUser.role === 'CLIENT' ? 'My Financials' : 'Financials & POS', icon: DollarSign },
    { id: 'team-clients', label: 'Team & IAM', icon: Users },
    { id: 'analytics', label: 'Observability & APM', icon: Activity }
  ];

  const visibleNavItems = allNavItems.filter(item => hasViewAccess(currentUser.role, item.id));

  return (
    <>
      <header className="bg-white/95 backdrop-blur-md border-b border-slate-200/80 sticky top-0 z-40 shadow-xs transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-14 gap-3">
            {/* Left: Brand Logo & Role Context */}
            <div className="flex items-center gap-4 shrink-0">
              <button
                onClick={() => setActiveView(rolePermissions.defaultView)}
                className="flex items-center gap-2 group cursor-pointer focus:outline-none"
              >
                <div className="w-8 h-8 rounded-xl bg-slate-900 flex items-center justify-center text-amber-400 shadow-sm group-hover:scale-105 transition-transform">
                  <Layers className="w-4 h-4" />
                </div>
                <div className="flex items-baseline gap-1.5">
                  <span className="font-bold text-base tracking-tight text-slate-900">VERTEX</span>
                  <span className="hidden sm:inline-block text-[9px] uppercase tracking-wider font-bold text-amber-600 bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200/60">
                    Studio
                  </span>
                </div>
              </button>

              {/* Staff Persona / 2FA Switcher */}
              <div className="relative">
                <button
                  onClick={() => setIsRolePickerOpen(!isRolePickerOpen)}
                  className={`text-xs font-semibold px-2.5 py-1 rounded-lg border flex items-center gap-1.5 transition-colors cursor-pointer ${currentRoleConfig.badgeColor}`}
                  title="Switch Role Profile (Enforces 2FA for Staff)"
                >
                  <Lock className="w-3 h-3 text-amber-600" />
                  <span className="max-w-[110px] truncate">{currentUser.role}</span>
                  <ChevronDown className="w-3 h-3 opacity-60" />
                </button>

                {isRolePickerOpen && (
                  <div className="absolute left-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-slate-200 p-2 z-50 animate-in fade-in zoom-in-95">
                    <div className="px-2.5 py-1.5 border-b border-slate-100 mb-1 flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Staff Persona & 2FA Gate
                      </span>
                      <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                        2FA Enforced
                      </span>
                    </div>

                    <div className="space-y-1">
                      {roles.map(r => (
                        <button
                          key={r.role}
                          onClick={() => {
                            switchRole(r.role);
                            setIsRolePickerOpen(false);
                          }}
                          className={`w-full text-left px-3 py-2 text-xs rounded-xl flex items-center justify-between transition-colors cursor-pointer ${
                            currentUser.role === r.role
                              ? 'bg-amber-50 text-amber-900 font-bold border border-amber-200/60'
                              : 'hover:bg-slate-50 text-slate-700'
                          }`}
                        >
                          <div className="min-w-0 pr-2">
                            <div className="flex items-center gap-1.5">
                              <span className="font-semibold text-slate-900">{r.label}</span>
                              {r.isStaff && (
                                <span className="text-[9px] px-1 py-0.2 rounded bg-slate-100 text-slate-600 font-mono">
                                  2FA
                                </span>
                              )}
                            </div>
                            <div className="text-[10px] text-slate-400 truncate mt-0.5">{r.summary}</div>
                          </div>
                          {currentUser.role === r.role && (
                            <CheckCircle2 className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Center: Desktop Navigation Tabs */}
            <nav className="hidden lg:flex items-center space-x-1">
              {visibleNavItems.map(item => {
                const Icon = item.icon;
                const isActive = activeView === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveView(item.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                      isActive
                        ? 'bg-slate-900 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-amber-400' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>

            {/* Right: Actions, Onboarding Trigger, Notifications, Profile */}
            <div className="flex items-center gap-2 shrink-0">
              {/* OTP Onboarding Quick Trigger */}
              <button
                onClick={() => {
                  setOnboardingInitialType(currentUser.role === 'CLIENT' ? 'CLIENT' : 'STAFF');
                  setIsOnboardingModalOpen(true);
                }}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-900 transition-colors cursor-pointer shadow-2xs"
                title="Onboard Client (Email/SMS OTP) or Staff (Email OTP)"
              >
                <UserPlus className="w-3.5 h-3.5 text-amber-700" />
                <span>Onboard via OTP</span>
              </button>

              {/* Edge Latency Badge (Admin only) */}
              {currentUser.role === 'ADMIN' && (
                <button
                  onClick={() => setIsClusterModalOpen(true)}
                  className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-semibold transition-colors cursor-pointer"
                  title="Cluster Health & Telemetry"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <Server className="w-3 h-3 text-slate-500" />
                  <span className="font-mono text-[10px]">{latency}ms</span>
                </button>
              )}

              {/* Live Chat Trigger */}
              <button
                onClick={() => setChatOpen(!chatOpen)}
                className="relative p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                title="Open Team & Client Collaboration Chat"
              >
                <MessageSquare className="w-4 h-4" />
                {totalUnread > 0 && (
                  <span className="absolute top-1 right-1 w-3.5 h-3.5 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center animate-pulse">
                    {totalUnread}
                  </span>
                )}
              </button>

              {/* New Project CTA */}
              {rolePermissions.canCreateProject && (
                <button
                  onClick={() => {
                    setEditingProjectData(null);
                    setIsCreateProjectOpen(true);
                  }}
                  className="hidden sm:flex items-center gap-1.5 bg-slate-900 hover:bg-black text-amber-400 px-3 py-1.5 rounded-lg text-xs font-bold shadow-xs transition-all cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>New Project</span>
                </button>
              )}

              {/* User Profile Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center gap-1.5 p-1 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer focus:outline-none"
                >
                  <img
                    src={currentUser.avatar}
                    alt={currentUser.name}
                    className="w-7 h-7 rounded-lg object-cover border border-slate-200"
                  />
                  <ChevronDown className="w-3 h-3 text-slate-400 hidden sm:block" />
                </button>

                {isProfileOpen && (
                  <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-slate-200 p-3 z-50 animate-in fade-in zoom-in-95">
                    <div className="flex items-center gap-3 pb-3 border-b border-slate-100 mb-2">
                      <img
                        src={currentUser.avatar}
                        alt={currentUser.name}
                        className="w-9 h-9 rounded-xl object-cover border border-slate-200"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-slate-900 truncate">{currentUser.name}</p>
                        <p className="text-[11px] text-slate-500 truncate">{currentUser.email}</p>
                        <div className="flex items-center gap-1.5 mt-1">
                          <span className="text-[10px] font-semibold uppercase px-1.5 py-0.2 bg-slate-100 text-slate-700 rounded">
                            {currentUser.role}
                          </span>
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                            2FA Active
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <button
                        onClick={() => {
                          setOnboardingInitialType('STAFF');
                          setIsOnboardingModalOpen(true);
                          setIsProfileOpen(false);
                        }}
                        className="w-full text-left px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 rounded-lg flex items-center gap-2 cursor-pointer"
                      >
                        <UserPlus className="w-3.5 h-3.5 text-amber-600" />
                        <span>Onboard Staff via Email OTP</span>
                      </button>

                      <button
                        onClick={() => {
                          setOnboardingInitialType('CLIENT');
                          setIsOnboardingModalOpen(true);
                          setIsProfileOpen(false);
                        }}
                        className="w-full text-left px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 rounded-lg flex items-center gap-2 cursor-pointer"
                      >
                        <UserCheck className="w-3.5 h-3.5 text-blue-600" />
                        <span>Onboard Client via Email/Phone OTP</span>
                      </button>

                      <button
                        onClick={() => {
                          addToast('info', 'Re-authenticating session via Two-Factor Authentication...');
                          setIsProfileOpen(false);
                          switchRole(currentUser.role);
                        }}
                        className="w-full text-left px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 rounded-lg flex items-center gap-2 cursor-pointer"
                      >
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Re-Verify 2FA Session</span>
                      </button>

                      <div className="pt-1 border-t border-slate-100 mt-1">
                        <button
                          onClick={() => {
                            addToast('info', 'Logged out. Active session closed.');
                            setIsProfileOpen(false);
                          }}
                          className="w-full text-left px-3 py-2 text-xs text-red-600 hover:bg-red-50 rounded-lg flex items-center gap-2 cursor-pointer"
                        >
                          <LogOut className="w-3.5 h-3.5" />
                          <span>Sign Out</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Mobile Navigation Scroll Row */}
          <div className="lg:hidden flex overflow-x-auto py-1.5 gap-1 border-t border-slate-100 scrollbar-none">
            {visibleNavItems.map(item => {
              const Icon = item.icon;
              const isActive = activeView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveView(item.id)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap flex items-center gap-1.5 transition-colors cursor-pointer ${
                    isActive
                      ? 'bg-slate-900 text-white'
                      : 'text-slate-600 bg-slate-50 hover:bg-slate-100'
                  }`}
                >
                  <Icon className="w-3 h-3" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </header>

      {/* Cluster Health & Architecture Modal */}
      <ClusterHealthModal
        isOpen={isClusterModalOpen}
        onClose={() => setIsClusterModalOpen(false)}
      />

      {/* Universal OTP Onboarding Modal */}
      <UserOnboardingModal
        isOpen={isOnboardingModalOpen}
        onClose={() => setIsOnboardingModalOpen(false)}
        initialType={onboardingInitialType}
      />
    </>
  );
};
