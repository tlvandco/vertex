import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Project, ProjectStatus, Milestone, Task, BudgetLine, Expense, ChangeOrder } from '../types';
import { TaskProgressGallery } from './TaskProgressGallery';
import {
  X,
  MapPin,
  Calendar,
  DollarSign,
  Users,
  CheckSquare,
  TrendingUp,
  Clock,
  Plus,
  Trash2,
  Edit2,
  FileText,
  Paperclip,
  MessageSquare,
  AlertCircle,
  CheckCircle2,
  ChevronRight,
  ExternalLink,
  ShieldAlert,
  Sparkles,
  Layers,
  Camera,
  ShieldCheck,
  Award,
  Filter,
  Check
} from 'lucide-react';

export const ProjectDrawer: React.FC = () => {
  const {
    selectedProject,
    selectedProjectId,
    closeProjectDrawer,
    activeDrawerTab,
    setActiveDrawerTab,
    updateProject,
    milestones,
    addMilestone,
    updateMilestone,
    deleteMilestone,
    tasks,
    addTask,
    updateTask,
    deleteTask,
    addTaskComment,
    assignTask,
    budgetLines,
    addBudgetLine,
    deleteBudgetLine,
    expenses,
    addExpense,
    invoices,
    addInvoice,
    changeOrders,
    addChangeOrder,
    updateChangeOrderStatus,
    teamMembers,
    assignTeamMemberToProject,
    removeTeamMemberFromProject,
    currentUser,
    addToast
  } = useApp();

  // Milestone Form state
  const [newMilestoneName, setNewMilestoneName] = useState('');
  const [newMilestoneDesc, setNewMilestoneDesc] = useState('');
  const [newMilestoneDate, setNewMilestoneDate] = useState('');

  // Task Form state
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDesc, setNewTaskDesc] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState<Task['priority']>('MEDIUM');
  const [newTaskDueDate, setNewTaskDueDate] = useState('');
  const [newTaskAssigneeId, setNewTaskAssigneeId] = useState('');
  const [newTaskStage, setNewTaskStage] = useState('Structural & MEP');
  const [taskFilter, setTaskFilter] = useState<'ALL' | 'MY_TASKS' | 'PENDING_VALIDATION' | 'DONE'>('ALL');

  // Comment input
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});

  // Change Order form state
  const [coTitle, setCoTitle] = useState('');
  const [coDesc, setCoDesc] = useState('');
  const [coReason, setCoReason] = useState('');
  const [coBudget, setCoBudget] = useState(15000);
  const [coSchedule, setCoSchedule] = useState(4);

  // Expense form state
  const [expDesc, setExpDesc] = useState('');
  const [expAmount, setExpAmount] = useState(5000);
  const [expCategory, setExpCategory] = useState('Materials');
  const [expVendor, setExpVendor] = useState('');

  // Budget Line form state
  const [blCategory, setBlCategory] = useState('Finishes');
  const [blItem, setBlItem] = useState('');
  const [blEst, setBlEst] = useState(50000);

  // Team assign state
  const [assignMemberId, setAssignMemberId] = useState('');
  const [assignRole, setAssignRole] = useState('Project Specialist');
  const [assignAlloc, setAssignAlloc] = useState(50);

  if (!selectedProject) return null;

  const projectMilestones = milestones.filter(m => m.projectId === selectedProject.id);
  const projectTasks = tasks.filter(t => t.projectId === selectedProject.id);
  const projectBudgetLines = budgetLines.filter(b => b.projectId === selectedProject.id);
  const projectExpenses = expenses.filter(e => e.projectId === selectedProject.id);
  const projectInvoices = invoices.filter(i => i.projectId === selectedProject.id);
  const projectChangeOrders = changeOrders.filter(c => c.projectId === selectedProject.id);

  const tabs = [
    { id: 'overview', label: 'Overview & Specs' },
    { id: 'milestones', label: `Milestones (${projectMilestones.length})` },
    { id: 'tasks', label: `Tasks (${projectTasks.length})` },
    { id: 'financials', label: 'Budget & Ledger' },
    { id: 'change-orders', label: `Change Orders (${projectChangeOrders.length})` },
    { id: 'team', label: `Team Allocations (${selectedProject.team.length})` }
  ];

  const handleAddMilestone = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMilestoneName.trim()) return;
    addMilestone({
      projectId: selectedProject.id,
      name: newMilestoneName,
      description: newMilestoneDesc,
      dueDate: newMilestoneDate || new Date().toISOString().split('T')[0],
      progress: 0,
      status: 'PENDING'
    });
    setNewMilestoneName('');
    setNewMilestoneDesc('');
    setNewMilestoneDate('');
  };

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    const assignee = teamMembers.find(t => t.id === newTaskAssigneeId);
    addTask({
      projectId: selectedProject.id,
      title: newTaskTitle,
      description: newTaskDesc,
      assignedToId: assignee?.id,
      assignedToName: assignee?.name,
      assignedToAvatar: assignee?.avatar,
      assignedRole: assignee?.role,
      stage: newTaskStage,
      progressPercent: 0,
      priority: newTaskPriority,
      status: 'TODO',
      dueDate: newTaskDueDate || new Date().toISOString().split('T')[0]
    });
    setNewTaskTitle('');
    setNewTaskDesc('');
    setNewTaskDueDate('');
  };

  const handleAddCO = (e: React.FormEvent) => {
    e.preventDefault();
    if (!coTitle.trim()) return;
    addChangeOrder({
      projectId: selectedProject.id,
      title: coTitle,
      description: coDesc,
      reason: coReason,
      budgetImpact: Number(coBudget),
      scheduleImpactDays: Number(coSchedule),
      requestedBy: currentUser.name,
      requestedRole: currentUser.role
    });
    setCoTitle('');
    setCoDesc('');
    setCoReason('');
  };

  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!expDesc.trim()) return;
    addExpense({
      projectId: selectedProject.id,
      description: expDesc,
      category: expCategory,
      amount: Number(expAmount),
      date: new Date().toISOString().split('T')[0],
      vendor: expVendor || 'Authorized Supplier',
      paymentMethod: 'BANK_TRANSFER',
      status: 'PENDING'
    });
    setExpDesc('');
    setExpVendor('');
  };

  const handleAddBudgetLine = (e: React.FormEvent) => {
    e.preventDefault();
    if (!blItem.trim()) return;
    addBudgetLine({
      projectId: selectedProject.id,
      category: blCategory,
      itemName: blItem,
      estimated: Number(blEst),
      actual: 0,
      variance: Number(blEst)
    });
    setBlItem('');
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex justify-end animate-in fade-in duration-200">
      <div className="w-full max-w-4xl bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
        {/* Drawer Header */}
        <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-gray-900 to-[#2C2416] text-white">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <span className="px-2.5 py-0.5 rounded-md text-[11px] font-mono font-bold bg-[#D4AF37] text-[#2C2416]">
                  {selectedProject.code}
                </span>
                <span className="text-xs text-amber-200/80 uppercase font-semibold tracking-wider">
                  {selectedProject.status.replace('_', ' ')}
                </span>
              </div>
              <h2 className="text-2xl font-serif font-bold drop-shadow-xs">{selectedProject.name}</h2>
              <p className="text-xs text-gray-300 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span>{selectedProject.location}</span>
                {selectedProject.latitude && (
                  <a
                    href={`https://www.google.com/maps?q=${selectedProject.latitude},${selectedProject.longitude}`}
                    target="_blank"
                    rel="noreferrer"
                    className="ml-2 text-[11px] text-[#D4AF37] hover:underline flex items-center gap-0.5"
                  >
                    <span>View Map</span>
                    <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                )}
              </p>
            </div>

            <button
              onClick={closeProjectDrawer}
              className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Tabs Nav */}
          <div className="flex items-center gap-1 mt-6 overflow-x-auto scrollbar-none border-t border-white/10 pt-4">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveDrawerTab(tab.id)}
                className={`px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  activeDrawerTab === tab.id
                    ? 'bg-[#D4AF37] text-[#2C2416] shadow-sm'
                    : 'text-gray-300 hover:text-white hover:bg-white/10'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Drawer Body Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gray-50/50">
          {/* TAB 1: OVERVIEW & SPECS */}
          {activeDrawerTab === 'overview' && (
            <div className="space-y-6">
              {/* Progress & Quick Stats Card */}
              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="font-serif font-bold text-gray-900">Project Completion & Budget Burn</h4>
                  <span className="text-xs font-bold text-[#8B7355] bg-amber-50 px-2.5 py-1 rounded-full">
                    {selectedProject.progress}% Physical Completion
                  </span>
                </div>

                <div className="w-full bg-gray-100 h-3 rounded-full overflow-hidden">
                  <div
                    className="bg-[#D4AF37] h-full rounded-full transition-all duration-300"
                    style={{ width: `${selectedProject.progress}%` }}
                  />
                </div>

                <div className="grid grid-cols-3 gap-4 pt-2">
                  <div className="p-3 bg-gray-50 rounded-xl">
                    <span className="text-[10px] text-gray-400 font-bold uppercase block">Budget Approved</span>
                    <span className="text-sm font-bold text-gray-900">${selectedProject.budget.toLocaleString()}</span>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-xl">
                    <span className="text-[10px] text-gray-400 font-bold uppercase block">Actual Spent</span>
                    <span className="text-sm font-bold text-[#8B7355]">${selectedProject.spent.toLocaleString()}</span>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-xl">
                    <span className="text-[10px] text-gray-400 font-bold uppercase block">Remaining Margin</span>
                    <span className="text-sm font-bold text-emerald-700">
                      ${(selectedProject.budget - selectedProject.spent).toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Progress adjust slider */}
                {currentUser.role !== 'CLIENT' && (
                  <div className="pt-3 border-t border-gray-100 flex items-center gap-4">
                    <span className="text-xs font-medium text-gray-600">Quick adjust physical progress:</span>
                    <input
                      type="range"
                      min={0}
                      max={100}
                      value={selectedProject.progress}
                      onChange={e => updateProject(selectedProject.id, { progress: Number(e.target.value) })}
                      className="flex-1 accent-[#D4AF37] h-2 bg-gray-200 rounded-lg cursor-pointer"
                    />
                    <span className="text-xs font-bold text-gray-900 w-10 text-right">{selectedProject.progress}%</span>
                  </div>
                )}
              </div>

              {/* Architectural Description */}
              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs space-y-3">
                <h4 className="font-serif font-bold text-gray-900">Architectural Brief & Scope</h4>
                <p className="text-sm text-gray-700 leading-relaxed">{selectedProject.description}</p>

                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100 text-xs">
                  <div>
                    <span className="text-gray-400 font-semibold uppercase block text-[10px]">Client Contact</span>
                    <p className="font-bold text-gray-800">{selectedProject.clientName}</p>
                    <p className="text-gray-500">{selectedProject.clientEmail}</p>
                  </div>
                  <div>
                    <span className="text-gray-400 font-semibold uppercase block text-[10px]">Schedule Timeline</span>
                    <p className="font-bold text-gray-800">
                      {selectedProject.startDate} to {selectedProject.endDate}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: MILESTONES */}
          {activeDrawerTab === 'milestones' && (
            <div className="space-y-6">
              {/* Add Milestone Form */}
              {currentUser.role !== 'CLIENT' && (
                <form onSubmit={handleAddMilestone} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs space-y-3">
                  <h4 className="font-serif font-bold text-gray-900 text-sm">Add Milestone Target</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input
                      type="text"
                      placeholder="Milestone title (e.g. Marble Installation)"
                      value={newMilestoneName}
                      onChange={e => setNewMilestoneName(e.target.value)}
                      required
                      className="px-3 py-2 text-xs border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-[#D4AF37]"
                    />
                    <input
                      type="date"
                      value={newMilestoneDate}
                      onChange={e => setNewMilestoneDate(e.target.value)}
                      className="px-3 py-2 text-xs border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-[#D4AF37]"
                    />
                  </div>
                  <input
                    type="text"
                    placeholder="Short description & verification requirements..."
                    value={newMilestoneDesc}
                    onChange={e => setNewMilestoneDesc(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-[#D4AF37]"
                  />
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      className="px-4 py-1.5 bg-[#D4AF37] hover:bg-[#B8860B] text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Save Milestone</span>
                    </button>
                  </div>
                </form>
              )}

              {/* Milestones List */}
              <div className="space-y-4">
                {projectMilestones.length === 0 ? (
                  <div className="p-8 text-center bg-white rounded-2xl border border-gray-100 text-xs text-gray-400">
                    No milestones recorded yet for this project.
                  </div>
                ) : (
                  projectMilestones.map(m => (
                    <div key={m.id} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs space-y-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <h5 className="font-bold text-gray-900 text-sm">{m.name}</h5>
                            {m.isHighlightOfMonth && (
                              <span className="px-2 py-0.5 bg-amber-100 text-[#8B7355] text-[10px] font-bold rounded-full">
                                Spotlight
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-gray-500 mt-0.5">{m.description}</p>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              const newStatus = m.status === 'COMPLETED' ? 'IN_PROGRESS' : 'COMPLETED';
                              const newProg = newStatus === 'COMPLETED' ? 100 : 50;
                              updateMilestone(m.id, { status: newStatus, progress: newProg });
                              if (newStatus === 'COMPLETED') addToast('success', `Milestone "${m.name}" marked complete! 🎉`);
                            }}
                            className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer ${
                              m.status === 'COMPLETED'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>{m.status}</span>
                          </button>

                          {/* 1-Click Milestone Billing Bridge */}
                          {m.status === 'COMPLETED' && currentUser.role !== 'CLIENT' && (
                            <button
                              onClick={() => {
                                const calculatedDraw = Math.round(selectedProject.budget * 0.15); // 15% progress milestone billing draw
                                addInvoice({
                                  projectId: selectedProject.id,
                                  projectName: selectedProject.name,
                                  clientId: selectedProject.clientId,
                                  clientName: selectedProject.clientName,
                                  clientEmail: selectedProject.clientEmail,
                                  issueDate: new Date().toISOString().split('T')[0],
                                  dueDate: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
                                  amount: calculatedDraw,
                                  tax: 0,
                                  total: calculatedDraw,
                                  status: 'PENDING',
                                  items: [
                                    {
                                      description: `Milestone Sign-Off: ${m.name} (100% Verified Completion)`,
                                      quantity: 1,
                                      unitPrice: calculatedDraw,
                                      total: calculatedDraw
                                    }
                                  ]
                                });
                                addToast('success', `Progress billing invoice for "${m.name}" ($${calculatedDraw.toLocaleString()}) issued to ${selectedProject.clientName}!`);
                              }}
                              className="px-2.5 py-1 bg-[#D4AF37] hover:bg-[#B8860B] text-black font-bold text-[11px] rounded-lg transition-all flex items-center gap-1 cursor-pointer shadow-2xs"
                              title="Create progress billing invoice directly from this completed milestone"
                            >
                              <DollarSign className="w-3 h-3 text-black" />
                              <span>Bill Milestone</span>
                            </button>
                          )}

                          {currentUser.role !== 'CLIENT' && (
                            <button
                              onClick={() => deleteMilestone(m.id)}
                              className="p-1 text-gray-400 hover:text-red-500 rounded"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Progress Bar & slider */}
                      <div className="space-y-1.5 pt-2">
                        <div className="flex justify-between text-xs text-gray-600">
                          <span>Progress</span>
                          <span className="font-bold text-[#8B7355]">{m.progress}%</span>
                        </div>
                        <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                          <div
                            className="bg-[#D4AF37] h-full rounded-full transition-all duration-300"
                            style={{ width: `${m.progress}%` }}
                          />
                        </div>
                        <div className="flex justify-between items-center text-[11px] text-gray-400 pt-1">
                          <span>Target: {m.dueDate}</span>
                          {currentUser.role !== 'CLIENT' && (
                            <input
                              type="range"
                              min={0}
                              max={100}
                              value={m.progress}
                              onChange={e => updateMilestone(m.id, { progress: Number(e.target.value) })}
                              className="w-32 accent-[#D4AF37] h-1.5 bg-gray-200 rounded-lg cursor-pointer"
                            />
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 3: TASKS BOARD */}
          {activeDrawerTab === 'tasks' && (
            <div className="space-y-6">
              {/* Role Context & Workflow Banner */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-[#D4AF37] text-white flex items-center justify-center shrink-0 shadow-xs">
                    {currentUser.role === 'SITE_ENGINEER' ? (
                      <Camera className="w-4 h-4" />
                    ) : currentUser.role === 'CLIENT' ? (
                      <ShieldCheck className="w-4 h-4" />
                    ) : (
                      <CheckSquare className="w-4 h-4" />
                    )}
                  </div>
                  <div>
                    <h5 className="font-serif font-bold text-gray-900 text-sm">
                      {currentUser.role === 'SITE_ENGINEER'
                        ? 'Site Engineering Field Desk'
                        : currentUser.role === 'CLIENT'
                        ? 'Client Validation & Approval Center'
                        : 'Field Execution & Site Progress Board'}
                    </h5>
                    <p className="text-gray-600 text-xs mt-0.5">
                      {currentUser.role === 'SITE_ENGINEER'
                        ? 'Upload high-resolution field inspection photos to your assigned tasks to demonstrate physical progress and submit for client sign-off.'
                        : currentUser.role === 'CLIENT'
                        ? 'Inspect site progress photos uploaded by site engineers, review field load tests, and issue digital cryptographic verification seals.'
                        : 'Assign tasks to site engineers and specialists, track physical completion metrics, and monitor client verification seals in real-time.'}
                    </p>
                  </div>
                </div>

                {currentUser.role === 'SITE_ENGINEER' && (
                  <span className="px-2.5 py-1 bg-amber-500/20 text-amber-900 font-bold rounded-lg shrink-0 text-[11px] self-start sm:self-auto flex items-center gap-1">
                    <Camera className="w-3 h-3" />
                    <span>Upload Authorized</span>
                  </span>
                )}
              </div>

              {/* Task Filters */}
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-1.5 bg-gray-100 p-1 rounded-xl text-xs font-semibold">
                  <button
                    type="button"
                    onClick={() => setTaskFilter('ALL')}
                    className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                      taskFilter === 'ALL' ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-500 hover:text-gray-900'
                    }`}
                  >
                    All Tasks ({projectTasks.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setTaskFilter('MY_TASKS')}
                    className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                      taskFilter === 'MY_TASKS' ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-500 hover:text-gray-900'
                    }`}
                  >
                    Assigned to Me ({projectTasks.filter(t => t.assignedToId === currentUser.id).length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setTaskFilter('PENDING_VALIDATION')}
                    className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1 ${
                      taskFilter === 'PENDING_VALIDATION' ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-500 hover:text-gray-900'
                    }`}
                  >
                    <Clock className="w-3 h-3 text-amber-600" />
                    <span>
                      Pending Sign-Off (
                      {
                        projectTasks.filter(t =>
                          t.progressImages?.some(img => img.validationStatus === 'PENDING_CLIENT_VALIDATION')
                        ).length
                      }
                      )
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setTaskFilter('DONE')}
                    className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                      taskFilter === 'DONE' ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-500 hover:text-gray-900'
                    }`}
                  >
                    Completed ({projectTasks.filter(t => t.status === 'DONE').length})
                  </button>
                </div>
              </div>

              {/* Add Task Form for Managers / Engineers / Admins */}
              {currentUser.role !== 'CLIENT' && (
                <form onSubmit={handleAddTask} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-serif font-bold text-gray-900 text-sm flex items-center gap-2">
                      <Plus className="w-4 h-4 text-[#D4AF37]" />
                      <span>Assign New Engineering Task</span>
                    </h4>
                    <span className="text-[11px] text-gray-400">Field work & trade assignment</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <input
                      type="text"
                      placeholder="Task headline (e.g. Inspect Subfloor Rebar)..."
                      value={newTaskTitle}
                      onChange={e => setNewTaskTitle(e.target.value)}
                      required
                      className="sm:col-span-2 px-3 py-2 text-xs border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-[#D4AF37]"
                    />
                    <select
                      value={newTaskPriority}
                      onChange={e => setNewTaskPriority(e.target.value as any)}
                      className="px-3 py-2 text-xs border border-gray-300 rounded-lg outline-none bg-white"
                    >
                      <option value="LOW">Low Priority</option>
                      <option value="MEDIUM">Medium Priority</option>
                      <option value="HIGH">High Priority</option>
                      <option value="URGENT">Urgent Priority</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <select
                      value={newTaskAssigneeId}
                      onChange={e => setNewTaskAssigneeId(e.target.value)}
                      className="px-3 py-2 text-xs border border-gray-300 rounded-lg outline-none bg-white"
                    >
                      <option value="">Select Assignee (e.g. Site Engineer)...</option>
                      {teamMembers.map(tm => (
                        <option key={tm.id} value={tm.id}>
                          {tm.name} — {tm.role.replace('_', ' ')}
                        </option>
                      ))}
                    </select>

                    <input
                      type="text"
                      placeholder="Stage (e.g. Structural & MEP)..."
                      value={newTaskStage}
                      onChange={e => setNewTaskStage(e.target.value)}
                      className="px-3 py-2 text-xs border border-gray-300 rounded-lg outline-none"
                    />

                    <input
                      type="date"
                      value={newTaskDueDate}
                      onChange={e => setNewTaskDueDate(e.target.value)}
                      className="px-3 py-2 text-xs border border-gray-300 rounded-lg outline-none"
                    />
                  </div>

                  <textarea
                    placeholder="Engineering specifications, inspection protocols, and proof requirements for client sign-off..."
                    rows={2}
                    value={newTaskDesc}
                    onChange={e => setNewTaskDesc(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-[#D4AF37]"
                  />

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      className="px-4 py-2 bg-[#D4AF37] hover:bg-[#B8860B] text-white text-xs font-semibold rounded-lg transition-all cursor-pointer flex items-center gap-1.5 shadow-xs"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Assign Task to Specialist</span>
                    </button>
                  </div>
                </form>
              )}

              {/* Tasks List */}
              <div className="space-y-4">
                {(() => {
                  const filtered = projectTasks.filter(t => {
                    if (taskFilter === 'MY_TASKS') return t.assignedToId === currentUser.id;
                    if (taskFilter === 'PENDING_VALIDATION') {
                      return t.progressImages?.some(img => img.validationStatus === 'PENDING_CLIENT_VALIDATION');
                    }
                    if (taskFilter === 'DONE') return t.status === 'DONE';
                    return true;
                  });

                  if (filtered.length === 0) {
                    return (
                      <div className="p-8 text-center bg-white rounded-2xl border border-gray-100 text-xs text-gray-400 space-y-1">
                        <CheckSquare className="w-8 h-8 mx-auto text-gray-300 mb-2" />
                        <p className="font-semibold text-gray-600">No tasks matching current filter</p>
                        <p className="text-[11px]">Switch filters or assign new tasks to continue tracking progress.</p>
                      </div>
                    );
                  }

                  return filtered.map(task => {
                    const hasPendingValidation = task.progressImages?.some(
                      img => img.validationStatus === 'PENDING_CLIENT_VALIDATION'
                    );
                    const isAssignedToCurrent = task.assignedToId === currentUser.id;

                    return (
                      <div
                        key={task.id}
                        className={`bg-white p-5 rounded-2xl border shadow-xs space-y-4 transition-all ${
                          hasPendingValidation
                            ? 'border-amber-300/80 ring-1 ring-amber-400/20'
                            : 'border-gray-100 hover:border-gray-200'
                        }`}
                      >
                        {/* Task Card Header */}
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                          <div className="space-y-1.5">
                            <div className="flex flex-wrap items-center gap-2">
                              <span
                                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                  task.priority === 'URGENT'
                                    ? 'bg-red-100 text-red-800'
                                    : task.priority === 'HIGH'
                                    ? 'bg-orange-100 text-orange-800'
                                    : 'bg-gray-100 text-gray-700'
                                }`}
                              >
                                {task.priority}
                              </span>

                              {task.stage && (
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-900 border border-amber-200/60">
                                  {task.stage}
                                </span>
                              )}

                              {isAssignedToCurrent && (
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                                  Assigned to You
                                </span>
                              )}

                              <h5 className="font-bold text-gray-900 text-sm">{task.title}</h5>
                            </div>
                            <p className="text-xs text-gray-600 leading-relaxed">{task.description}</p>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <select
                              value={task.status}
                              onChange={e => updateTask(task.id, { status: e.target.value as any })}
                              className="text-xs font-semibold px-2.5 py-1 rounded-lg border border-gray-200 bg-gray-50 outline-none"
                            >
                              <option value="TODO">To Do</option>
                              <option value="IN_PROGRESS">In Progress</option>
                              <option value="REVIEW">Review</option>
                              <option value="DONE">Done</option>
                            </select>

                            {currentUser.role !== 'CLIENT' && (
                              <button
                                onClick={() => deleteTask(task.id)}
                                className="p-1 text-gray-400 hover:text-red-500 rounded transition-colors"
                                title="Delete task"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Progress Bar if available */}
                        {task.progressPercent !== undefined && task.progressPercent > 0 && (
                          <div className="space-y-1">
                            <div className="flex justify-between text-[11px] text-gray-500">
                              <span>Field Completion Status</span>
                              <span className="font-bold text-gray-800">{task.progressPercent}%</span>
                            </div>
                            <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-[#D4AF37] rounded-full transition-all duration-500"
                                style={{ width: `${task.progressPercent}%` }}
                              />
                            </div>
                          </div>
                        )}

                        {/* Assignee Information & Reassignment */}
                        <div className="flex flex-wrap items-center justify-between pt-2 border-t border-gray-100 text-xs text-gray-500 gap-2">
                          <div className="flex items-center gap-2">
                            {task.assignedToAvatar && (
                              <img
                                src={task.assignedToAvatar}
                                alt={task.assignedToName}
                                className="w-6 h-6 rounded-full object-cover border border-gray-200"
                              />
                            )}
                            <div>
                              <span className="font-bold text-gray-800 block text-xs">
                                {task.assignedToName || 'Unassigned'}
                              </span>
                              {task.assignedRole && (
                                <span className="text-[10px] text-[#8B7355] font-semibold">
                                  {task.assignedRole.replace('_', ' ')}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Quick Assign / Reassign for Managers & Admins */}
                          {currentUser.role !== 'CLIENT' && (
                            <div className="flex items-center gap-1 text-[11px]">
                              <span className="text-gray-400">Assign to:</span>
                              <select
                                value={task.assignedToId || ''}
                                onChange={e => {
                                  if (e.target.value) {
                                    assignTask(task.id, e.target.value);
                                  }
                                }}
                                className="px-2 py-0.5 bg-gray-50 border border-gray-200 rounded text-[11px] outline-none text-gray-700"
                              >
                                <option value="">Assign Specialist...</option>
                                {teamMembers.map(tm => (
                                  <option key={tm.id} value={tm.id}>
                                    {tm.name} ({tm.role.replace('_', ' ')})
                                  </option>
                                ))}
                              </select>
                            </div>
                          )}

                          <span className="text-[11px]">Due Date: {task.dueDate}</span>
                        </div>

                        {/* TASK PROGRESS GALLERY: PHOTO UPLOADS & CLIENT VALIDATION */}
                        <div className="pt-2 border-t border-gray-100">
                          <TaskProgressGallery task={task} />
                        </div>

                        {/* Comments Thread */}
                        <div className="pt-3 border-t border-gray-100 space-y-2">
                          <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-700">
                            <MessageSquare className="w-3.5 h-3.5 text-gray-400" />
                            <span>Engineering Discussion ({task.comments.length})</span>
                          </div>

                          {task.comments.length > 0 && (
                            <div className="space-y-1.5">
                              {task.comments.map(comm => (
                                <div key={comm.id} className="p-2.5 bg-gray-50 rounded-xl text-xs flex gap-2.5">
                                  <img
                                    src={comm.authorAvatar}
                                    alt={comm.authorName}
                                    className="w-5 h-5 rounded-full object-cover shrink-0 mt-0.5"
                                  />
                                  <div className="min-w-0 flex-1">
                                    <div className="flex justify-between items-center">
                                      <span className="font-bold text-gray-800 text-[11px]">{comm.authorName}</span>
                                      <span className="text-[10px] text-gray-400">
                                        {new Date(comm.createdAt).toLocaleTimeString([], {
                                          hour: '2-digit',
                                          minute: '2-digit'
                                        })}
                                      </span>
                                    </div>
                                    <p className="text-gray-600 mt-0.5 text-xs leading-relaxed">{comm.text}</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Add Comment input */}
                          <div className="flex gap-2">
                            <input
                              type="text"
                              placeholder="Add an engineering note or site observation..."
                              value={commentInputs[task.id] || ''}
                              onChange={e => setCommentInputs({ ...commentInputs, [task.id]: e.target.value })}
                              onKeyDown={e => {
                                if (e.key === 'Enter' && commentInputs[task.id]?.trim()) {
                                  addTaskComment(task.id, commentInputs[task.id]);
                                  setCommentInputs({ ...commentInputs, [task.id]: '' });
                                }
                              }}
                              className="flex-1 px-3 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-lg outline-none focus:bg-white focus:ring-1 focus:ring-[#D4AF37]"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                if (commentInputs[task.id]?.trim()) {
                                  addTaskComment(task.id, commentInputs[task.id]);
                                  setCommentInputs({ ...commentInputs, [task.id]: '' });
                                }
                              }}
                              className="px-3 py-1 bg-gray-800 text-white text-xs font-semibold rounded-lg hover:bg-black transition-colors cursor-pointer"
                            >
                              Post
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  });
                })()}
              </div>
            </div>
          )}

          {/* TAB 4: FINANCIALS & LEDGER */}
          {activeDrawerTab === 'financials' && (
            <div className="space-y-6">
              {/* Add Expense / Budget Line Forms */}
              {currentUser.role !== 'CLIENT' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Record Expense */}
                  <form onSubmit={handleAddExpense} className="bg-white p-4 rounded-2xl border border-gray-100 shadow-xs space-y-3">
                    <h5 className="font-bold text-xs text-gray-800 uppercase tracking-wider">Record Project Expense</h5>
                    <input
                      type="text"
                      placeholder="Expense description (e.g. Marble deposit)"
                      value={expDesc}
                      onChange={e => setExpDesc(e.target.value)}
                      required
                      className="w-full px-3 py-1.5 text-xs border border-gray-300 rounded-lg outline-none"
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="number"
                        placeholder="Amount ($)"
                        value={expAmount}
                        onChange={e => setExpAmount(Number(e.target.value))}
                        className="px-3 py-1.5 text-xs border border-gray-300 rounded-lg outline-none"
                      />
                      <input
                        type="text"
                        placeholder="Vendor / Supplier"
                        value={expVendor}
                        onChange={e => setExpVendor(e.target.value)}
                        className="px-3 py-1.5 text-xs border border-gray-300 rounded-lg outline-none"
                      />
                    </div>
                    <button
                      type="submit"
                      className="w-full py-1.5 bg-[#2C2416] text-[#D4AF37] text-xs font-bold rounded-lg hover:bg-black transition-colors"
                    >
                      Log Expense
                    </button>
                  </form>

                  {/* Add Budget Line */}
                  <form onSubmit={handleAddBudgetLine} className="bg-white p-4 rounded-2xl border border-gray-100 shadow-xs space-y-3">
                    <h5 className="font-bold text-xs text-gray-800 uppercase tracking-wider">Add Budget Allocation</h5>
                    <input
                      type="text"
                      placeholder="Budget Item (e.g. Italian Millwork)"
                      value={blItem}
                      onChange={e => setBlItem(e.target.value)}
                      required
                      className="w-full px-3 py-1.5 text-xs border border-gray-300 rounded-lg outline-none"
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="number"
                        placeholder="Estimated ($)"
                        value={blEst}
                        onChange={e => setBlEst(Number(e.target.value))}
                        className="px-3 py-1.5 text-xs border border-gray-300 rounded-lg outline-none"
                      />
                      <input
                        type="text"
                        placeholder="Category"
                        value={blCategory}
                        onChange={e => setBlCategory(e.target.value)}
                        className="px-3 py-1.5 text-xs border border-gray-300 rounded-lg outline-none"
                      />
                    </div>
                    <button
                      type="submit"
                      className="w-full py-1.5 bg-[#D4AF37] text-white text-xs font-bold rounded-lg hover:bg-[#B8860B] transition-colors"
                    >
                      Add Line Item
                    </button>
                  </form>
                </div>
              )}

              {/* Budget Lines Breakdown */}
              <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs space-y-3">
                <h4 className="font-serif font-bold text-gray-900 text-sm">Budget Breakdown by Category</h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-gray-100 text-gray-400 font-semibold">
                        <th className="py-2">Item</th>
                        <th className="py-2">Category</th>
                        <th className="py-2">Estimated</th>
                        <th className="py-2">Actual</th>
                        <th className="py-2">Variance</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {projectBudgetLines.map(bl => (
                        <tr key={bl.id}>
                          <td className="py-2.5 font-medium text-gray-800">{bl.itemName}</td>
                          <td className="py-2.5 text-gray-500">{bl.category}</td>
                          <td className="py-2.5 font-bold text-gray-900">${bl.estimated.toLocaleString()}</td>
                          <td className="py-2.5 font-bold text-[#8B7355]">${bl.actual.toLocaleString()}</td>
                          <td className={`py-2.5 font-bold ${bl.variance >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                            {bl.variance >= 0 ? `+$${bl.variance.toLocaleString()}` : `-$${Math.abs(bl.variance).toLocaleString()}`}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Project Expenses Log */}
              <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs space-y-3">
                <h4 className="font-serif font-bold text-gray-900 text-sm">Recorded Expenses & Invoices</h4>
                <div className="space-y-2">
                  {projectExpenses.map(exp => (
                    <div key={exp.id} className="p-3 bg-gray-50 rounded-xl flex items-center justify-between text-xs">
                      <div>
                        <p className="font-bold text-gray-800">{exp.description}</p>
                        <p className="text-gray-400 text-[11px]">{exp.vendor} • {exp.date} • {exp.category}</p>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-[#8B7355] text-sm">${exp.amount.toLocaleString()}</span>
                        <span className={`block text-[10px] font-semibold ${
                          exp.status === 'APPROVED' ? 'text-emerald-600' : 'text-amber-600'
                        }`}>
                          {exp.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: CHANGE ORDERS */}
          {activeDrawerTab === 'change-orders' && (
            <div className="space-y-6">
              {/* Submit CO Form */}
              <form onSubmit={handleAddCO} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs space-y-3">
                <h4 className="font-serif font-bold text-gray-900 text-sm">Propose Formal Change Order</h4>
                <input
                  type="text"
                  placeholder="Change order title (e.g. Master Terrace Enclosure)"
                  value={coTitle}
                  onChange={e => setCoTitle(e.target.value)}
                  required
                  className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-[#D4AF37]"
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] text-gray-500 font-bold block mb-1">Budget Impact ($ USD)</label>
                    <input
                      type="number"
                      value={coBudget}
                      onChange={e => setCoBudget(Number(e.target.value))}
                      className="w-full px-3 py-1.5 text-xs border border-gray-300 rounded-lg outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-gray-500 font-bold block mb-1">Schedule Delay (Days)</label>
                    <input
                      type="number"
                      value={coSchedule}
                      onChange={e => setCoSchedule(Number(e.target.value))}
                      className="w-full px-3 py-1.5 text-xs border border-gray-300 rounded-lg outline-none"
                    />
                  </div>
                </div>
                <textarea
                  placeholder="Architectural reason & justification..."
                  rows={2}
                  value={coReason}
                  onChange={e => setCoReason(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg outline-none"
                />
                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-[#D4AF37] hover:bg-[#B8860B] text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                  >
                    Submit Change Order
                  </button>
                </div>
              </form>

              {/* CO List */}
              <div className="space-y-4">
                {projectChangeOrders.length === 0 ? (
                  <div className="p-8 text-center bg-white rounded-2xl border border-gray-100 text-xs text-gray-400">
                    No change orders submitted for this project.
                  </div>
                ) : (
                  projectChangeOrders.map(co => (
                    <div key={co.id} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs space-y-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-bold text-[#8B7355]">{co.id.toUpperCase()}</span>
                            <h5 className="font-bold text-gray-900 text-sm">{co.title}</h5>
                          </div>
                          <p className="text-xs text-gray-600 mt-1">{co.reason}</p>
                        </div>
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                          co.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-800' :
                          co.status === 'REJECTED' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {co.status}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-3 p-3 bg-gray-50 rounded-xl text-xs">
                        <div>
                          <span className="text-gray-400 font-semibold text-[10px] block">Budget Impact</span>
                          <span className="font-bold text-gray-900">+${co.budgetImpact.toLocaleString()}</span>
                        </div>
                        <div>
                          <span className="text-gray-400 font-semibold text-[10px] block">Schedule Impact</span>
                          <span className="font-bold text-gray-900">+{co.scheduleImpactDays} Days</span>
                        </div>
                      </div>

                      {/* Approval Controls for Admin/Client */}
                      {co.status === 'PENDING' && currentUser.role !== 'DESIGNER' && (
                        <div className="flex justify-end items-center gap-2 pt-2 border-t border-gray-100">
                          <button
                            onClick={() => updateChangeOrderStatus(co.id, 'REJECTED')}
                            className="px-3 py-1.5 rounded-xl text-xs font-semibold text-red-600 hover:bg-red-50 cursor-pointer transition-colors"
                          >
                            Decline
                          </button>
                          <button
                            onClick={() => updateChangeOrderStatus(co.id, 'APPROVED')}
                            className="px-4 py-1.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs cursor-pointer transition-all flex items-center gap-1.5"
                            title={`Approve change order and automatically increase project budget by $${co.budgetImpact.toLocaleString()}`}
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Approve & Apply +${co.budgetImpact.toLocaleString()} to Budget</span>
                          </button>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 6: TEAM ALLOCATIONS */}
          {activeDrawerTab === 'team' && (
            <div className="space-y-6">
              {/* Assign Team Member */}
              {currentUser.role !== 'CLIENT' && (
                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs space-y-3">
                  <h4 className="font-serif font-bold text-gray-900 text-sm">Assign Staff Member to Project</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <select
                      value={assignMemberId}
                      onChange={e => setAssignMemberId(e.target.value)}
                      className="px-3 py-2 text-xs border border-gray-300 rounded-lg outline-none bg-white"
                    >
                      <option value="">Select Member...</option>
                      {teamMembers.map(tm => (
                        <option key={tm.id} value={tm.id}>
                          {tm.name} ({tm.role})
                        </option>
                      ))}
                    </select>
                    <input
                      type="text"
                      placeholder="Project Role (e.g. Lead Designer)"
                      value={assignRole}
                      onChange={e => setAssignRole(e.target.value)}
                      className="px-3 py-2 text-xs border border-gray-300 rounded-lg outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (assignMemberId) {
                          assignTeamMemberToProject(selectedProject.id, assignMemberId, assignRole, assignAlloc);
                          setAssignMemberId('');
                        }
                      }}
                      className="px-4 py-2 bg-[#D4AF37] hover:bg-[#B8860B] text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Assign Staff</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Allocated Team List */}
              <div className="space-y-3">
                {selectedProject.team.map((tMember, idx) => (
                  <div
                    key={idx}
                    className="bg-white p-4 rounded-2xl border border-gray-100 shadow-xs flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={tMember.memberAvatar}
                        alt={tMember.memberName}
                        className="w-10 h-10 rounded-full object-cover border"
                      />
                      <div>
                        <h5 className="font-bold text-gray-900 text-sm">{tMember.memberName}</h5>
                        <p className="text-xs text-[#8B7355] font-medium">{tMember.role}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <span className="text-[10px] text-gray-400 block font-semibold">Allocation</span>
                        <span className="text-xs font-bold text-gray-800">{tMember.allocationPercentage}%</span>
                      </div>
                      {currentUser.role !== 'CLIENT' && (
                        <button
                          onClick={() => removeTeamMemberFromProject(selectedProject.id, tMember.memberId)}
                          className="p-1 text-gray-400 hover:text-red-500 rounded"
                          title="Remove from project"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
