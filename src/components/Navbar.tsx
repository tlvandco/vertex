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
  Radio,
  Lock
} from 'lucide-react';
import { ClusterHealthModal } from './ClusterHealthModal';
import { apiClient } from '../services/apiClient';
import { AppViewId, hasViewAccess, getRolePermissions, ROLE_PERMISSIONS } from '../utils/rbac';

export const Navbar: React.FC = () => {
  const {
    currentUser,
    switchRole,
    users,
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
  const [isClusterModalOpen, setIsClusterModalOpen] = useState(false);
  const [latency, setLatency] = useState(14);

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
    const timer = setInterval(probe, 10000);
    return () => clearInterval(timer);
  }, []);

  const totalUnread = channels.reduce((sum, c) => sum + c.unreadCount, 0);

  const roles: { role: UserRole; label: string; badgeColor: string; summary: string }[] = [
    {
      role: 'ADMIN',
      label: 'Admin (Alexander Wright)',
      badgeColor: 'bg-red-100 text-red-800 border-red-200',
      summary: 'All modules, analytics audit trail, & firm management'
    },
    {
      role: 'PROJECT_MANAGER',
      label: 'Project Manager (Sophia Chen)',
      badgeColor: 'bg-blue-100 text-blue-800 border-blue-200',
      summary: 'Projects, milestones, team allocation, budget oversight'
    },
    {
      role: 'DESIGNER',
      label: 'Designer (Marcus Vance)',
      badgeColor: 'bg-amber-100 text-amber-800 border-amber-200',
      summary: 'Design studio, 3D renderings, moodboards, FF&E specs'
    },
    {
      role: 'CLIENT',
      label: 'Client (Eleanor Sterling)',
      badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      summary: 'Isolated estate dashboard, private ledger & approvals'
    },
    {
      role: 'SITE_ENGINEER',
      label: 'Site Engineer (David Thorne)',
      badgeColor: 'bg-purple-100 text-purple-800 border-purple-200',
      summary: 'Field progress, MEP & structural specs, inspections'
    },
    {
      role: 'FINANCE',
      label: 'Finance (Claire Dupont)',
      badgeColor: 'bg-teal-100 text-teal-800 border-teal-200',
      summary: 'Company ledger, invoices, draws, contractor expenses'
    }
  ];

  const currentRoleConfig = roles.find(r => r.role === currentUser.role) || roles[0];

  const allNavItems: { id: AppViewId; label: string; icon: any }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: Compass },
    { id: 'projects', label: currentUser.role === 'CLIENT' ? 'My Project' : 'Projects', icon: Briefcase },
    { id: 'design-portal', label: currentUser.role === 'CLIENT' ? 'Design Approvals' : 'Design Portal', icon: Palette },
    { id: 'financials', label: currentUser.role === 'CLIENT' ? 'My Financials' : 'Financials', icon: DollarSign },
    { id: 'team-clients', label: 'Team & Clients', icon: Users },
    { id: 'analytics', label: 'Analytics & Audit', icon: Activity }
  ];

  // Strictly filter navigation items to authorized views for this role
  const visibleNavItems = allNavItems.filter(item => hasViewAccess(currentUser.role, item.id));

  return (
    <nav className="bg-white/90 backdrop-blur-md border-b border-gray-200 sticky top-0 z-40 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand & Role Badge */}
          <div className="flex items-center gap-6">
            <button
              onClick={() => setActiveView(rolePermissions.defaultView)}
              className="flex items-center gap-2.5 group text-left cursor-pointer focus:outline-none"
            >
              <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-[#8B7355] via-[#D4AF37] to-[#B8860B] flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <span className="font-serif text-2xl font-bold tracking-wider text-[#2C2416]">VERTEX</span>
                <span className="hidden sm:inline-block text-[10px] uppercase tracking-widest text-[#D4AF37] font-semibold ml-2">
                  Studio Edition
                </span>
              </div>
            </button>

            {/* Quick Role Switcher Chip */}
            <div className="relative">
              <button
                onClick={() => setIsRolePickerOpen(!isRolePickerOpen)}
                className={`text-xs font-semibold px-2.5 py-1 rounded-full border flex items-center gap-1.5 transition-colors cursor-pointer ${currentRoleConfig.badgeColor}`}
                title="Switch test persona"
              >
                <Shield className="w-3 h-3" />
                <span>{currentUser.role}</span>
                <ChevronDown className="w-3 h-3 opacity-60" />
              </button>

              {isRolePickerOpen && (
                <div className="absolute left-0 mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-gray-200/80 p-2.5 z-50 animate-in fade-in zoom-in-95">
                  <div className="px-2.5 py-1.5 border-b border-gray-100 mb-1 flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                      Switch Role Context (RBAC)
                    </span>
                    <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded">
                      Role Guarded
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
                        className={`w-full text-left px-3 py-2 text-xs rounded-xl flex items-center justify-between transition-colors ${
                          currentUser.role === r.role ? 'bg-amber-50 text-[#8B7355] font-bold' : 'hover:bg-gray-50 text-gray-700'
                        }`}
                      >
                        <div className="min-w-0 pr-2">
                          <div className="font-semibold text-gray-900">{r.label}</div>
                          <div className="text-[10px] text-gray-400 font-normal truncate">{r.summary}</div>
                        </div>
                        {currentUser.role === r.role ? (
                          <span className="text-[#D4AF37] font-bold">✓</span>
                        ) : (
                          <span className="text-[10px] text-gray-400">Select</span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden lg:flex items-center space-x-1">
            {visibleNavItems.map(item => {
              const Icon = item.icon;
              const isActive = activeView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveView(item.id)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 cursor-pointer ${
                    isActive
                      ? 'bg-[#2C2416] text-[#D4AF37] shadow-xs'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100/70'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-[#D4AF37]' : 'text-gray-400'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>

          {/* Right Action Items */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Live Production Cluster Topology Indicator (Admin only) */}
            {currentUser.role === 'ADMIN' && (
              <button
                onClick={() => setIsClusterModalOpen(true)}
                className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 text-[11px] font-semibold transition-all cursor-pointer shadow-xs"
                title="Inspect Production Architecture & Cluster Health"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <Server className="w-3 h-3 text-emerald-600" />
                <span>Edge Active</span>
                <span className="text-[10px] text-emerald-600 font-mono opacity-80">{latency}ms</span>
              </button>
            )}

            {/* Live Chat Drawer Trigger */}
            <button
              onClick={() => setChatOpen(!chatOpen)}
              className="relative p-2.5 text-gray-600 hover:text-[#8B7355] hover:bg-amber-50/60 rounded-full transition-colors cursor-pointer"
              title="Open Unified Chat"
            >
              <MessageSquare className="w-5 h-5" />
              {totalUnread > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
                  {totalUnread}
                </span>
              )}
            </button>

            {/* New Project CTA - Only for roles with project creation privileges */}
            {rolePermissions.canCreateProject && (
              <button
                onClick={() => {
                  setEditingProjectData(null);
                  setIsCreateProjectOpen(true);
                }}
                className="hidden sm:flex items-center gap-2 bg-[#D4AF37] hover:bg-[#B8860B] text-white px-4 py-2 rounded-lg text-sm font-medium shadow-sm transition-all hover:shadow cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>New Project</span>
              </button>
            )}

            {/* Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center gap-2 p-1 rounded-full hover:ring-2 hover:ring-[#D4AF37]/50 transition-all cursor-pointer"
              >
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="w-8 h-8 rounded-full object-cover border border-amber-200"
                />
              </button>

              {isProfileOpen && (
                <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-gray-100 p-3.5 z-50 animate-in fade-in zoom-in-95">
                  <div className="flex items-center gap-3 pb-3 border-b border-gray-100 mb-2">
                    <img
                      src={currentUser.avatar}
                      alt={currentUser.name}
                      className="w-10 h-10 rounded-full object-cover border border-amber-200"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-bold text-gray-900 truncate">{currentUser.name}</p>
                      <p className="text-xs text-gray-500 truncate">{currentUser.email}</p>
                      <div className="flex items-center gap-1 mt-0.5">
                        <span className="text-[10px] font-semibold uppercase px-1.5 py-0.5 bg-amber-50 text-[#8B7355] rounded border border-amber-200">
                          {currentUser.role}
                        </span>
                        {currentUser.role === 'ADMIN' && (
                          <span className="text-[9px] uppercase font-bold text-red-700 bg-red-50 px-1 py-0.5 rounded">
                            SUPERUSER
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="p-2.5 bg-amber-50/50 rounded-xl border border-amber-100 text-xs text-gray-600 mb-2.5">
                    <span className="font-semibold block text-gray-900 text-[11px] mb-0.5">Role Permission Scope:</span>
                    <p className="text-[10px] text-gray-500 leading-tight">{rolePermissions.roleDescription}</p>
                  </div>

                  <div className="space-y-1">
                    {hasViewAccess(currentUser.role, 'design-portal') && (
                      <button
                        onClick={() => {
                          setActiveView('design-portal');
                          setIsProfileOpen(false);
                        }}
                        className="w-full text-left px-3 py-2 text-xs text-gray-700 hover:bg-gray-50 rounded-lg flex items-center gap-2"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
                        <span>{currentUser.role === 'CLIENT' ? 'Design Approvals' : 'Explore Design Studio'}</span>
                      </button>
                    )}
                    <button
                      onClick={() => {
                        addToast('info', 'Logged out of VERTEX. Re-initializing guest session.');
                        setIsProfileOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 text-xs text-red-600 hover:bg-red-50 rounded-lg flex items-center gap-2"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Reset Session</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Sub-Navigation */}
        <div className="lg:hidden flex overflow-x-auto py-2 gap-1 border-t border-gray-100 scrollbar-none">
          {visibleNavItems.map(item => {
            const Icon = item.icon;
            const isActive = activeView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveView(item.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-[#2C2416] text-[#D4AF37]'
                    : 'text-gray-600 bg-gray-50'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Cluster Health & Architecture Modal */}
      <ClusterHealthModal
        isOpen={isClusterModalOpen}
        onClose={() => setIsClusterModalOpen(false)}
      />
    </nav>
  );
};

