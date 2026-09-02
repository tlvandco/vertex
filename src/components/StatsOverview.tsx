import React from 'react';
import { useApp } from '../context/AppContext';
import { OnboardingStatusTracker } from './OnboardingStatusTracker';
import {
  Briefcase,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Award,
  ArrowRight,
  RefreshCw,
  UserPlus,
  UserCheck,
  Users,
  Palette,
  ExternalLink,
  DollarSign,
  MessageSquare,
  Sparkles,
  ShieldAlert,
  HardHat,
  FileCheck2,
  Camera,
  CheckSquare,
  ShieldCheck
} from 'lucide-react';
import { getRolePermissions, hasViewAccess } from '../utils/rbac';

export const StatsOverview: React.FC = () => {
  const {
    projects,
    milestones,
    tasks,
    users,
    openProjectDrawer,
    setIsCreateProjectOpen,
    setEditingProjectData,
    setIsCreateMemberOpen,
    setIsCreateClientOpen,
    setActiveView,
    addToast,
    currentUser,
    setChatOpen
  } = useApp();

  const rolePermissions = getRolePermissions(currentUser.role);
  const isClient = currentUser.role === 'CLIENT';
  const isAdmin = currentUser.role === 'ADMIN';

  const pendingClientsCount = users.filter(
    u => (u.role === 'CLIENT' || u.onboardingStatus !== undefined) && u.onboardingStatus === 'PENDING_ONBOARDING'
  ).length;

  const roleScopedProjects = isClient
    ? projects.filter(
        p =>
          p.clientId === currentUser.id ||
          p.clientEmail.toLowerCase() === currentUser.email.toLowerCase() ||
          currentUser.assignedProjectIds?.includes(p.id)
      )
    : projects;

  const roleScopedMilestones = isClient
    ? milestones.filter(m => roleScopedProjects.some(p => p.id === m.projectId))
    : milestones;

  const totalProjects = roleScopedProjects.length;
  const planning = roleScopedProjects.filter(p => p.status === 'PLANNING').length;
  const inProgress = roleScopedProjects.filter(p => p.status === 'IN_PROGRESS').length;
  const completed = roleScopedProjects.filter(p => p.status === 'COMPLETED').length;

  const totalBudget = roleScopedProjects.reduce((acc, p) => acc + p.budget, 0);
  const totalSpent = roleScopedProjects.reduce((acc, p) => acc + p.spent, 0);
  const overallProgress = totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0;

  // Milestone of the Month highlight
  const highlightMilestone = roleScopedMilestones.find(m => m.isHighlightOfMonth) || roleScopedMilestones.find(m => m.status === 'IN_PROGRESS');
  const highlightProject = highlightMilestone ? roleScopedProjects.find(p => p.id === highlightMilestone.projectId) : null;

  const recentProjects = [...roleScopedProjects].slice(0, 4);

  return (
    <div className="space-y-6">
      {/* Top Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              {isClient ? 'My Estates' : 'Total Projects'}
            </span>
            <div className="p-2 rounded-lg bg-amber-50 text-[#8B7355]">
              <Briefcase className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-bold font-serif text-[#2C2416]">{totalProjects}</div>
          <p className="text-[11px] text-gray-400 mt-1">
            {isClient ? 'Assigned architectural contracts' : 'Portfolio active estates'}
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Planning</span>
            <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-bold font-serif text-gray-800">{planning}</div>
          <p className="text-[11px] text-gray-400 mt-1">Schematics & permits</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">In Progress</span>
            <div className="p-2 rounded-lg bg-amber-50 text-[#D4AF37]">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-bold font-serif text-[#D4AF37]">{inProgress}</div>
          <p className="text-[11px] text-gray-400 mt-1">Active site execution</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Completed</span>
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-bold font-serif text-emerald-700">{completed}</div>
          <p className="text-[11px] text-gray-400 mt-1">Delivered estates</p>
        </div>
      </div>

      {/* Main Row: Financial Health / Role Focus + Milestone Spotlight + Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Financial / Role Banner & Milestone Spotlight & Recent */}
        <div className="lg:col-span-2 space-y-6">
          {/* Capital Status Banner (Visible to Admin, PM, Finance, and Client for their own project) */}
          {(hasViewAccess(currentUser.role, 'financials') || isClient) && (
            <div className="bg-gradient-to-r from-[#2C2416] to-[#423623] text-white p-6 rounded-2xl shadow-lg relative overflow-hidden">
              <div className="absolute right-0 top-0 w-64 h-64 bg-[#D4AF37]/10 rounded-full blur-3xl pointer-events-none" />
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
                <div>
                  <span className="text-xs uppercase tracking-widest text-[#D4AF37] font-semibold">
                    {isClient ? 'Estate Contract & Draw Status' : 'Portfolio Capital Status'}
                  </span>
                  <h3 className="text-2xl font-serif font-bold mt-1 text-white">
                    ${totalSpent.toLocaleString()}{' '}
                    <span className="text-sm font-normal text-gray-300">
                      / ${totalBudget.toLocaleString()} Total Contract Value
                    </span>
                  </h3>
                </div>
                {hasViewAccess(currentUser.role, 'financials') && (
                  <button
                    onClick={() => setActiveView('financials')}
                    className="text-xs bg-white/10 hover:bg-white/20 text-[#D4AF37] border border-[#D4AF37]/30 px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <span>{isClient ? 'My Invoices' : 'Full Ledger'}</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-xs text-gray-300">
                  <span>Committed Expenditure ({overallProgress}%)</span>
                  <span>${(totalBudget - totalSpent).toLocaleString()} Remaining Buffer</span>
                </div>
                <div className="w-full bg-white/20 h-2.5 rounded-full overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-[#D4AF37] to-[#F3E5AB] h-full rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(overallProgress, 100)}%` }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Grid of Recent Projects + Milestone Highlight */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Recent Projects List */}
            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-serif font-bold text-gray-900">
                  {isClient ? 'My Assigned Estates' : 'Recent Projects'}
                </h4>
                <button
                  onClick={() => setActiveView('projects')}
                  className="text-xs text-[#8B7355] hover:text-[#B8860B] font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <span>View All</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>

              <div className="space-y-3">
                {recentProjects.length === 0 ? (
                  <p className="text-xs text-gray-400 italic py-4 text-center">No projects assigned to this account.</p>
                ) : (
                  recentProjects.map(p => (
                    <div
                      key={p.id}
                      onClick={() => openProjectDrawer(p.id)}
                      className="p-3 rounded-xl border border-gray-100 hover:border-amber-200 hover:bg-amber-50/30 transition-all cursor-pointer flex items-center justify-between group"
                    >
                      <div className="min-w-0 flex-1 mr-3">
                        <p className="text-sm font-semibold text-gray-800 truncate group-hover:text-[#8B7355]">
                          {p.name}
                        </p>
                        <p className="text-xs text-gray-400 truncate">{p.location}</p>
                      </div>
                      <div className="text-right">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          p.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-700' :
                          p.status === 'IN_PROGRESS' ? 'bg-amber-50 text-amber-700' : 'bg-gray-100 text-gray-600'
                        }`}>
                          {p.status}
                        </span>
                        <p className="text-xs font-bold text-gray-700 mt-1">{p.progress}%</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Milestone of the Month Spotlight */}
            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">🏆</span>
                    <span className="text-xs font-bold uppercase tracking-wider text-[#8B7355]">
                      Milestone Spotlight
                    </span>
                  </div>
                  {highlightProject && (
                    <button
                      onClick={() => openProjectDrawer(highlightProject.id, 'milestones')}
                      className="text-xs bg-[#D4AF37] text-white px-2.5 py-1 rounded-md hover:bg-[#B8860B] transition-colors cursor-pointer font-medium"
                    >
                      Inspect
                    </button>
                  )}
                </div>

                {highlightMilestone ? (
                  <div className="p-4 rounded-xl bg-amber-50/50 border border-amber-200/60 mt-2">
                    <h5 className="font-bold text-gray-900 text-sm">{highlightMilestone.name}</h5>
                    <p className="text-xs text-gray-500 mt-0.5">{highlightProject?.name || 'Project Master'}</p>
                    <p className="text-xs text-gray-600 mt-2 line-clamp-2 leading-relaxed">
                      {highlightMilestone.description}
                    </p>

                    <div className="mt-4 space-y-1.5">
                      <div className="flex justify-between text-xs font-medium">
                        <span className="text-gray-500">Progress:</span>
                        <span className="font-bold text-[#8B7355]">{highlightMilestone.progress}%</span>
                      </div>
                      <div className="w-full bg-amber-200/50 h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-[#D4AF37] h-full rounded-full transition-all duration-300"
                          style={{ width: `${highlightMilestone.progress}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-[11px] text-gray-400 mt-1">
                        <span>Due: {highlightMilestone.dueDate}</span>
                        <span className="uppercase text-amber-700 font-semibold">{highlightMilestone.status}</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-6 text-center text-xs text-gray-400 italic">No milestone highlighted this cycle.</div>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
                <span>Active Trackers: {roleScopedMilestones.length}</span>
                <span className="text-emerald-600 font-semibold">
                  {roleScopedMilestones.filter(m => m.status === 'COMPLETED').length} Complete
                </span>
              </div>
            </div>
          </div>

          {/* Field Progress & Client Validation Digest */}
          {(() => {
            const pendingValidationTasks = tasks.filter(t =>
              roleScopedProjects.some(p => p.id === t.projectId) &&
              t.progressImages?.some(img => img.validationStatus === 'PENDING_CLIENT_VALIDATION')
            );
            const totalUploadedImages = tasks
              .filter(t => roleScopedProjects.some(p => p.id === t.projectId))
              .reduce((acc, t) => acc + (t.progressImages?.length || 0), 0);

            return (
              <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-amber-50 text-[#8B7355]">
                      <Camera className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-serif font-bold text-gray-900 text-sm">Site Progress & Validation Feed</h4>
                      <p className="text-[11px] text-gray-400">Field photo evidence & client sign-offs</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs bg-gray-100 text-gray-700 px-2.5 py-1 rounded-full font-medium">
                      {totalUploadedImages} photos uploaded
                    </span>
                    {pendingValidationTasks.length > 0 && (
                      <span className="text-xs bg-amber-100 text-amber-800 font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {pendingValidationTasks.length} awaiting sign-off
                      </span>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {tasks
                    .filter(t => roleScopedProjects.some(p => p.id === t.projectId) && (t.progressImages?.length || 0) > 0)
                    .slice(0, 3)
                    .map(task => {
                      const proj = projects.find(p => p.id === task.projectId);
                      const latestImage = task.progressImages?.[task.progressImages.length - 1];
                      const hasPending = task.progressImages?.some(i => i.validationStatus === 'PENDING_CLIENT_VALIDATION');

                      return (
                        <div
                          key={task.id}
                          onClick={() => proj && openProjectDrawer(proj.id, 'tasks')}
                          className="p-3.5 rounded-xl border border-gray-100 hover:border-amber-200 hover:bg-amber-50/20 transition-all cursor-pointer flex flex-col justify-between group"
                        >
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-[10px] font-bold text-gray-400 truncate max-w-[120px]">
                                {proj?.name}
                              </span>
                              {hasPending ? (
                                <span className="text-[9px] font-bold px-1.5 py-0.5 bg-amber-100 text-amber-800 rounded-full">
                                  Action Required
                                </span>
                              ) : (
                                <span className="text-[9px] font-bold px-1.5 py-0.5 bg-emerald-100 text-emerald-800 rounded-full flex items-center gap-0.5">
                                  <ShieldCheck className="w-2.5 h-2.5" />
                                  Verified
                                </span>
                              )}
                            </div>

                            <p className="font-bold text-xs text-gray-900 group-hover:text-[#8B7355] truncate">
                              {task.title}
                            </p>
                            <p className="text-[11px] text-gray-500 mt-0.5">
                              Assigned: {task.assignedToName || 'Specialist'}
                            </p>
                          </div>

                          {latestImage && (
                            <div className="mt-3 flex items-center gap-2.5 pt-2 border-t border-gray-100">
                              <img
                                src={latestImage.imageUrl}
                                alt={latestImage.caption}
                                className="w-10 h-10 rounded-lg object-cover border border-gray-200 shrink-0"
                              />
                              <div className="min-w-0 flex-1">
                                <p className="text-[11px] text-gray-700 truncate font-medium">{latestImage.caption}</p>
                                <p className="text-[10px] text-gray-400">
                                  By {latestImage.uploadedBy.name} ({latestImage.uploadedBy.role.replace('_', ' ')})
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                </div>
              </div>
            );
          })()}
        </div>

        {/* Right Aside: Role-Appropriate Quick Operations */}
        <aside className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs h-fit space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-serif font-bold text-gray-900 text-lg">Quick Operations</h4>
            <button
              onClick={() => addToast('success', 'Synchronized live portfolio data')}
              className="p-1.5 text-gray-400 hover:text-[#8B7355] transition-colors rounded-lg hover:bg-gray-50"
              title="Refresh Data"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

          <div className="flex flex-col gap-2.5">
            {/* Primary Action for Project Managers and Admins */}
            {rolePermissions.canCreateProject && (
              <button
                onClick={() => {
                  setEditingProjectData(null);
                  setIsCreateProjectOpen(true);
                }}
                className="w-full text-left p-3.5 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#B8860B] text-white hover:opacity-95 transition-all flex items-center justify-between shadow-xs cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-1.5 bg-white/20 rounded-lg">
                    <Briefcase className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-sm block">New Project</span>
                    <span className="text-[11px] text-amber-100">Initialize contract & specs</span>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            )}

            {/* Design Portal Action (for Admin, PM, Designer, Site Engineer, Client) */}
            {hasViewAccess(currentUser.role, 'design-portal') && (
              <button
                onClick={() => setActiveView('design-portal')}
                className="w-full text-left p-3 rounded-xl bg-gray-50 hover:bg-amber-50/50 border border-gray-200/70 hover:border-amber-200 transition-all flex items-center justify-between cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-1.5 bg-purple-100 text-purple-700 rounded-lg">
                    <Palette className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-semibold text-xs text-gray-800 block">
                      {isClient ? 'Review Design Submissions' : 'Design Portal'}
                    </span>
                    <span className="text-[10px] text-gray-500">
                      {isClient ? 'Sign off 3D renders & finishes' : 'AI moodboards & 3D gallery'}
                    </span>
                  </div>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-gray-400 group-hover:text-[#8B7355]" />
              </button>
            )}

            {/* Financials / Invoices Action */}
            {hasViewAccess(currentUser.role, 'financials') && (
              <button
                onClick={() => setActiveView('financials')}
                className="w-full text-left p-3 rounded-xl bg-gray-50 hover:bg-amber-50/50 border border-gray-200/70 hover:border-amber-200 transition-all flex items-center justify-between cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-1.5 bg-emerald-100 text-emerald-700 rounded-lg">
                    <DollarSign className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-semibold text-xs text-gray-800 block">
                      {isClient ? 'My Invoices & Escrow' : 'Financial Ledger'}
                    </span>
                    <span className="text-[10px] text-gray-500">
                      {isClient ? 'View statements & payment receipts' : 'Draws, billing & expenses'}
                    </span>
                  </div>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-gray-400 group-hover:text-[#8B7355]" />
              </button>
            )}

            {/* Team Directory (Admin & PM only) */}
            {hasViewAccess(currentUser.role, 'team-clients') && (
              <button
                onClick={() => setActiveView('team-clients')}
                className="w-full text-left p-3 rounded-xl bg-gray-50 hover:bg-amber-50/50 border border-gray-200/70 hover:border-amber-200 transition-all flex items-center justify-between cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-1.5 bg-blue-100 text-blue-700 rounded-lg">
                    <Users className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-semibold text-xs text-gray-800 block">Directory & Clients</span>
                    <span className="text-[10px] text-gray-500">Staff allocations & client onboarding</span>
                  </div>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-gray-400 group-hover:text-[#8B7355]" />
              </button>
            )}

            {/* Team Member Onboarding (Admin & PM only) */}
            {rolePermissions.canManageTeam && (
              <button
                onClick={() => setIsCreateMemberOpen(true)}
                className="w-full text-left p-3 rounded-xl bg-gray-50 hover:bg-amber-50/50 border border-gray-200/70 hover:border-amber-200 transition-all flex items-center justify-between cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-1.5 bg-amber-100 text-amber-800 rounded-lg">
                    <UserPlus className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-semibold text-xs text-gray-800 block">New Team Member</span>
                    <span className="text-[10px] text-gray-500">Onboard architects & PMs</span>
                  </div>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-gray-400 group-hover:text-[#8B7355]" />
              </button>
            )}

            {/* Onboarding Status Tracker Quick Jump (Admin & PM) */}
            {(isAdmin || rolePermissions.canManageTeam) && (
              <button
                onClick={() => {
                  const el = document.getElementById('onboarding-status-tracker');
                  if (el) {
                    el.scrollIntoView({ behavior: 'smooth' });
                  } else {
                    setActiveView('team-clients');
                  }
                }}
                className="w-full text-left p-3 rounded-xl bg-amber-50/70 hover:bg-amber-100/60 border border-amber-200 text-amber-900 transition-all flex items-center justify-between cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-1.5 bg-[#D4AF37] text-white rounded-lg">
                    <UserCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-semibold text-xs block">Onboarding Tracker</span>
                      {pendingClientsCount > 0 && (
                        <span className="text-[10px] font-bold px-1.5 py-0.2 bg-amber-500 text-white rounded-full animate-pulse">
                          {pendingClientsCount} pending
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-amber-700">Client approvals & permissions</span>
                  </div>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-amber-600 group-hover:translate-x-0.5 transition-transform" />
              </button>
            )}

            {/* Unified Chat Action */}
            <button
              onClick={() => setChatOpen(true)}
              className="w-full text-left p-3 rounded-xl bg-gray-50 hover:bg-amber-50/50 border border-gray-200/70 hover:border-amber-200 transition-all flex items-center justify-between cursor-pointer group"
            >
              <div className="flex items-center gap-3">
                <div className="p-1.5 bg-amber-100 text-[#8B7355] rounded-lg">
                  <MessageSquare className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-semibold text-xs text-gray-800 block">Studio Messaging</span>
                  <span className="text-[10px] text-gray-500">Real-time collaboration channels</span>
                </div>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-gray-400 group-hover:text-[#8B7355]" />
            </button>

            {/* Forensic Audit Logs - STRICTLY ADMIN ONLY */}
            {rolePermissions.canViewAuditLogs && (
              <button
                onClick={() => setActiveView('analytics')}
                className="w-full text-left p-3 rounded-xl bg-red-50/50 hover:bg-red-50 border border-red-200 text-red-900 transition-all flex items-center justify-between cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-1.5 bg-red-100 text-red-700 rounded-lg">
                    <ShieldAlert className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-semibold text-xs block">Security & Audit</span>
                      <span className="text-[9px] uppercase font-bold px-1 bg-red-200 text-red-800 rounded">
                        Admin
                      </span>
                    </div>
                    <span className="text-[10px] text-red-600">Forensic logs & telemetry</span>
                  </div>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-red-400 group-hover:text-red-700" />
              </button>
            )}
          </div>
        </aside>
      </div>

      {/* Admin Onboarding Status Tracker Section */}
      {(isAdmin || rolePermissions.canManageTeam) && (
        <div className="pt-2">
          <OnboardingStatusTracker />
        </div>
      )}
    </div>
  );
};
