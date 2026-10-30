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
  Check,
  Maximize2,
  Minimize2,
  Lock,
  Kanban,
  List,
  Columns3,
  GripVertical,
  ArrowLeft,
  ArrowRight,
  Search,
  ChevronDown,
  ChevronUp
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
    isProjectMember,
    addToast
  } = useApp();

  const [isMaximized, setIsMaximized] = useState(false);

  // Milestone Form state
  const [newMilestoneName, setNewMilestoneName] = useState('');
  const [newMilestoneDesc, setNewMilestoneDesc] = useState('');
  const [newMilestoneDate, setNewMilestoneDate] = useState('');

  // Task state
  const [taskViewMode, setTaskViewMode] = useState<'kanban' | 'list'>('kanban');
  const [taskSearchQuery, setTaskSearchQuery] = useState('');
  const [taskMilestoneFilter, setTaskMilestoneFilter] = useState('ALL');
  const [taskPriorityFilter, setTaskPriorityFilter] = useState<'ALL' | Task['priority']>('ALL');
  const [draggingTaskId, setDraggingTaskId] = useState<string | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<Task['status'] | null>(null);
  const [expandedTaskId, setExpandedTaskId] = useState<string | null>(null);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [newTaskInitialStatus, setNewTaskInitialStatus] = useState<Task['status']>('TODO');
  const [newTaskProgress, setNewTaskProgress] = useState<number>(0);

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

  const isPM = currentUser.role === 'PROJECT_MANAGER';
  const hasAccess = !isPM || isProjectMember(selectedProject.id, currentUser);

  if (!hasAccess) {
    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex justify-end animate-in fade-in duration-200">
        <div className="w-full max-w-lg bg-white h-full shadow-2xl flex flex-col justify-center items-center p-8 text-center">
          <div className="w-16 h-16 rounded-3xl bg-amber-50 text-amber-600 flex items-center justify-center mb-4 border border-amber-200">
            <Lock className="w-8 h-8" />
          </div>
          <span className="text-[10px] uppercase font-mono font-bold tracking-widest text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200 mb-2">
            IAM Role Policy Isolation
          </span>
          <h3 className="text-xl font-serif font-bold text-gray-900 mb-2">Project Access Restricted</h3>
          <p className="text-xs text-gray-600 max-w-sm mb-6 leading-relaxed">
            As a Project Manager, you are only authorized to access and manage estate projects that you are assigned to. You cannot manage details or settle payments for other projects.
          </p>
          <button
            onClick={closeProjectDrawer}
            className="px-6 py-2.5 bg-[#2C2416] text-[#D4AF37] font-bold text-xs rounded-xl hover:bg-black transition-all cursor-pointer shadow-md"
          >
            Return to My Portfolio
          </button>
        </div>
      </div>
    );
  }

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
      stage: newTaskStage || 'Structural & MEP',
      progressPercent: Number(newTaskProgress),
      priority: newTaskPriority,
      status: newTaskInitialStatus || 'TODO',
      dueDate: newTaskDueDate || new Date().toISOString().split('T')[0]
    });
    setNewTaskTitle('');
    setNewTaskDesc('');
    setNewTaskDueDate('');
    setNewTaskProgress(0);
    setShowTaskForm(false);
    addToast('success', `Task "${newTaskTitle}" created in ${newTaskInitialStatus || 'TODO'} status (${newTaskProgress}%)!`);
  };

  const statusColumns: { id: Task['status']; title: string; subtitle: string; color: string; badgeBg: string; borderHover: string }[] = [
    {
      id: 'TODO',
      title: 'To Do',
      subtitle: 'Backlog & Scheduled Field Tasks',
      color: 'text-slate-800 bg-slate-100 border-slate-200',
      badgeBg: 'bg-slate-700 text-white',
      borderHover: 'border-slate-400'
    },
    {
      id: 'IN_PROGRESS',
      title: 'In Progress',
      subtitle: 'Active Trade & Engineering Work',
      color: 'text-amber-900 bg-amber-50 border-amber-200',
      badgeBg: 'bg-[#D4AF37] text-black font-bold',
      borderHover: 'border-amber-400'
    },
    {
      id: 'REVIEW',
      title: 'QC & Validation',
      subtitle: 'Field Inspection & Client Sign-Off',
      color: 'text-blue-900 bg-blue-50 border-blue-200',
      badgeBg: 'bg-blue-600 text-white font-bold',
      borderHover: 'border-blue-400'
    },
    {
      id: 'DONE',
      title: 'Completed',
      subtitle: 'Cryptographically Verified',
      color: 'text-emerald-900 bg-emerald-50 border-emerald-200',
      badgeBg: 'bg-emerald-600 text-white font-bold',
      borderHover: 'border-emerald-400'
    }
  ];

  const statusProgression: Task['status'][] = ['TODO', 'IN_PROGRESS', 'REVIEW', 'DONE'];

  // Zero-Trust Security Policy: Clients & Specialists can ONLY change tasks explicitly assigned to them
  const canModifyTask = (task: Task) => {
    // Platform Admins have full operational authority
    if (currentUser.role === 'ADMIN') return true;
    // Project Managers can manage tasks on their managed projects
    if (currentUser.role === 'PROJECT_MANAGER') return true;
    // Clients can NEVER modify or advance tasks they are not assigned to
    if (currentUser.role === 'CLIENT') {
      return !!task.assignedToId && task.assignedToId === currentUser.id;
    }
    // Site Engineers can only update tasks assigned to them
    if (currentUser.role === 'SITE_ENGINEER') {
      return !!task.assignedToId && task.assignedToId === currentUser.id;
    }
    // Default fallback
    return !!task.assignedToId && task.assignedToId === currentUser.id;
  };

  const handleTaskStatusChange = (taskId: string, targetStatus: Task['status']) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;
    if (!canModifyTask(task)) {
      addToast('error', 'Security Policy: You are not authorized to modify tasks that are not assigned to you.');
      return;
    }
    let newProg = task.progressPercent ?? 0;
    if (targetStatus === 'DONE') {
      newProg = 100;
    } else if (targetStatus === 'TODO') {
      newProg = 0;
    } else if (targetStatus === 'IN_PROGRESS' && (newProg === 0 || newProg === 100)) {
      newProg = 50;
    } else if (targetStatus === 'REVIEW' && newProg < 80) {
      newProg = 85;
    }

    updateTask(taskId, { status: targetStatus, progressPercent: newProg });
    addToast('success', `Moved "${task.title}" to ${targetStatus.replace('_', ' ')} (${newProg}%)`);
  };

  const handleTaskProgressChange = (taskId: string, newProgress: number) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;
    if (!canModifyTask(task)) {
      addToast('error', 'Security Policy: You are not authorized to modify tasks that are not assigned to you.');
      return;
    }
    const clamped = Math.max(0, Math.min(100, Math.round(newProgress)));
    let nextStatus = task.status;
    if (clamped === 100) {
      nextStatus = 'DONE';
    } else if (clamped === 0) {
      nextStatus = 'TODO';
    } else if (clamped > 0 && clamped < 100) {
      if (task.status === 'TODO' || task.status === 'DONE') {
        nextStatus = 'IN_PROGRESS';
      }
    }
    updateTask(taskId, { progressPercent: clamped, status: nextStatus });
  };

  const moveTaskStatus = (taskId: string, direction: 'prev' | 'next') => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;
    const currentIndex = statusProgression.indexOf(task.status);
    const targetIndex = direction === 'next' ? currentIndex + 1 : currentIndex - 1;
    if (targetIndex >= 0 && targetIndex < statusProgression.length) {
      const nextStatus = statusProgression[targetIndex];
      handleTaskStatusChange(taskId, nextStatus);
    }
  };

  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task || !canModifyTask(task)) {
      e.preventDefault();
      addToast('error', 'Security Policy: You cannot drag or modify tasks that are not assigned to you.');
      return;
    }
    e.dataTransfer.setData('text/plain', taskId);
    e.dataTransfer.effectAllowed = 'move';
    setDraggingTaskId(taskId);
  };

  const handleDragOver = (e: React.DragEvent, colId: Task['status']) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverColumn !== colId) {
      setDragOverColumn(colId);
    }
  };

  const handleDragLeave = (e: React.DragEvent, colId: Task['status']) => {
    if (dragOverColumn === colId) {
      setDragOverColumn(null);
    }
  };

  const handleDrop = (e: React.DragEvent, targetStatus: Task['status']) => {
    e.preventDefault();
    setDragOverColumn(null);
    const taskId = e.dataTransfer.getData('text/plain') || draggingTaskId;
    setDraggingTaskId(null);
    if (!taskId) return;
    const targetTask = tasks.find(t => t.id === taskId);
    if (!targetTask) return;
    if (targetTask.status !== targetStatus) {
      handleTaskStatusChange(taskId, targetStatus);
    }
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
      <div
        className={`w-full bg-white h-full shadow-2xl flex flex-col transition-all duration-300 ${
          isMaximized ? 'max-w-full' : 'max-w-4xl animate-in slide-in-from-right duration-300'
        }`}
      >
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
                {isMaximized && (
                  <span className="text-[10px] uppercase font-mono font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                    Expanded Workspace View
                  </span>
                )}
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

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setIsMaximized(!isMaximized)}
                className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                title={isMaximized ? "Restore Drawer Size" : "Maximize Drawer Fullscreen"}
              >
                {isMaximized ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
              </button>
              <button
                type="button"
                onClick={closeProjectDrawer}
                className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                title="Close Drawer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
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

              {/* Milestones List - Space Optimized Responsive Grid */}
              <div className={`grid gap-4 ${isMaximized ? 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3' : 'grid-cols-1 md:grid-cols-2'}`}>
                {projectMilestones.length === 0 ? (
                  <div className="col-span-full p-8 text-center bg-white rounded-2xl border border-gray-100 text-xs text-gray-400">
                    No milestones recorded yet for this project.
                  </div>
                ) : (
                  projectMilestones.map(m => (
                    <div key={m.id} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs space-y-3 flex flex-col justify-between">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h5 className="font-bold text-gray-900 text-sm">{m.name}</h5>
                            {m.isHighlightOfMonth && (
                              <span className="px-2 py-0.5 bg-amber-100 text-[#8B7355] text-[10px] font-bold rounded-full">
                                Spotlight
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-gray-500 mt-1 line-clamp-2">{m.description}</p>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
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

                          {/* 1-Click Milestone Billing Bridge: Restricted for Project Manager to PO / CO Request */}
                          {m.status === 'COMPLETED' && currentUser.role !== 'CLIENT' && (
                            currentUser.role === 'PROJECT_MANAGER' ? (
                              <button
                                onClick={() => {
                                  setActiveDrawerTab('change-orders');
                                  setCoTitle(`Milestone Sign-Off Approval: ${m.name}`);
                                  setCoReason(`Milestone verified at 100% completion. Requesting Finance review & purchase order / billing draw authorization.`);
                                  addToast('info', `Switched to Change Orders to request PO / clearance for "${m.name}"`);
                                }}
                                className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-[#8B7355] border border-amber-200 font-bold text-[11px] rounded-lg transition-all flex items-center gap-1 cursor-pointer"
                                title="Project Managers request Change Orders or Purchase Orders for Finance clearance"
                              >
                                <FileText className="w-3 h-3 text-[#8B7355]" />
                                <span>Request PO / CO</span>
                              </button>
                            ) : (
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
                            )
                          )}

                          {currentUser.role !== 'CLIENT' && (
                            <button
                              onClick={() => deleteMilestone(m.id)}
                              className="p-1 text-gray-400 hover:text-red-500 rounded cursor-pointer"
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

                      {/* Milestone Task Sync & Kanban Jump */}
                      <div className="flex items-center justify-between text-xs pt-2.5 border-t border-gray-100">
                        <div className="flex items-center gap-1.5 text-gray-500 text-[11px]">
                          <CheckSquare className="w-3.5 h-3.5 text-[#D4AF37]" />
                          <span>
                            {projectTasks.filter(t => t.stage === m.name || t.stage?.toLowerCase() === m.name.toLowerCase()).length} tasks
                          </span>
                          {projectTasks.filter(t => (t.stage === m.name || t.stage?.toLowerCase() === m.name.toLowerCase()) && t.status === 'DONE').length > 0 && (
                            <span className="text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.5 rounded text-[10px]">
                              {projectTasks.filter(t => (t.stage === m.name || t.stage?.toLowerCase() === m.name.toLowerCase()) && t.status === 'DONE').length} completed
                            </span>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setActiveDrawerTab('tasks');
                            setTaskViewMode('kanban');
                            setTaskMilestoneFilter(m.name);
                            addToast('info', `Showing Kanban Board for milestone: "${m.name}"`);
                          }}
                          className="px-2.5 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 text-[#8B7355] text-[11px] font-semibold flex items-center gap-1 transition-all cursor-pointer border border-amber-200/60"
                          title="Open tasks in Kanban view for this milestone"
                        >
                          <Kanban className="w-3 h-3 text-[#D4AF37]" />
                          <span>Kanban Tasks</span>
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 3: TASKS & KANBAN BOARD */}
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
                      <Kanban className="w-4 h-4" />
                    )}
                  </div>
                  <div>
                    <h5 className="font-serif font-bold text-gray-900 text-sm">
                      {currentUser.role === 'SITE_ENGINEER'
                        ? 'Site Engineering Field Desk & Task Board'
                        : currentUser.role === 'CLIENT'
                        ? 'Client Validation & Approval Center'
                        : 'Field Execution & Milestone Kanban Board'}
                    </h5>
                    <p className="text-gray-600 text-xs mt-0.5">
                      {currentUser.role === 'SITE_ENGINEER'
                        ? 'Drag tasks across workflow stages, upload high-resolution field inspection photos, and submit verification requests for client sign-off.'
                        : currentUser.role === 'CLIENT'
                        ? 'Inspect site progress photos uploaded by site engineers, review field tests, and issue digital cryptographic verification seals across task columns.'
                        : 'Manage trade tasks visually across Kanban columns (To Do → In Progress → QC & Validation → Done) with drag-and-drop and milestone sync.'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
                  {currentUser.role === 'SITE_ENGINEER' && (
                    <span className="px-2.5 py-1 bg-amber-500/20 text-amber-900 font-bold rounded-lg text-[11px] flex items-center gap-1">
                      <Camera className="w-3 h-3" />
                      <span>Upload Authorized</span>
                    </span>
                  )}
                  {currentUser.role !== 'CLIENT' && (
                    <button
                      type="button"
                      onClick={() => {
                        setShowTaskForm(!showTaskForm);
                        setNewTaskInitialStatus('TODO');
                      }}
                      className="px-3 py-1.5 bg-[#2C2416] hover:bg-black text-[#D4AF37] text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>{showTaskForm ? 'Close Form' : 'New Task'}</span>
                    </button>
                  )}
                </div>
              </div>

              {/* View Mode Switcher & Filter Toolbar */}
              <div className="space-y-3">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                  {/* View Mode Toggle: Kanban Board vs List */}
                  <div className="flex items-center gap-1 bg-gray-200/80 p-1 rounded-xl self-start">
                    <button
                      type="button"
                      onClick={() => setTaskViewMode('kanban')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                        taskViewMode === 'kanban'
                          ? 'bg-white text-gray-900 shadow-xs'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      <Kanban className="w-3.5 h-3.5 text-[#D4AF37]" />
                      <span>Kanban Board</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setTaskViewMode('list')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                        taskViewMode === 'list'
                          ? 'bg-white text-gray-900 shadow-xs'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      <List className="w-3.5 h-3.5 text-gray-500" />
                      <span>List View</span>
                    </button>
                  </div>

                  {/* Search and Secondary Dropdown Filters */}
                  <div className="flex flex-wrap items-center gap-2">
                    {/* Search box */}
                    <div className="relative min-w-[200px] flex-1 sm:flex-none">
                      <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        placeholder="Search tasks, trades, assignees..."
                        value={taskSearchQuery}
                        onChange={e => setTaskSearchQuery(e.target.value)}
                        className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-[#D4AF37]/50"
                      />
                      {taskSearchQuery && (
                        <button
                          type="button"
                          onClick={() => setTaskSearchQuery('')}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs"
                        >
                          ✕
                        </button>
                      )}
                    </div>

                    {/* Milestone / Stage Filter */}
                    <select
                      value={taskMilestoneFilter}
                      onChange={e => setTaskMilestoneFilter(e.target.value)}
                      className="px-2.5 py-1.5 text-xs bg-white border border-gray-200 rounded-xl outline-none font-medium text-gray-700"
                    >
                      <option value="ALL">All Milestones & Stages</option>
                      {projectMilestones.map(m => (
                        <option key={m.id} value={m.name}>
                          Milestone: {m.name}
                        </option>
                      ))}
                      <option value="Structural & MEP">Stage: Structural & MEP</option>
                      <option value="Finishes">Stage: Finishes</option>
                      <option value="Exterior & Landscaping">Stage: Exterior & Landscaping</option>
                    </select>

                    {/* Priority Filter */}
                    <select
                      value={taskPriorityFilter}
                      onChange={e => setTaskPriorityFilter(e.target.value as any)}
                      className="px-2.5 py-1.5 text-xs bg-white border border-gray-200 rounded-xl outline-none font-medium text-gray-700"
                    >
                      <option value="ALL">All Priorities</option>
                      <option value="URGENT">Urgent Priority</option>
                      <option value="HIGH">High Priority</option>
                      <option value="MEDIUM">Medium Priority</option>
                      <option value="LOW">Low Priority</option>
                    </select>

                    {(taskSearchQuery || taskMilestoneFilter !== 'ALL' || taskPriorityFilter !== 'ALL' || taskFilter !== 'ALL') && (
                      <button
                        type="button"
                        onClick={() => {
                          setTaskSearchQuery('');
                          setTaskMilestoneFilter('ALL');
                          setTaskPriorityFilter('ALL');
                          setTaskFilter('ALL');
                        }}
                        className="px-2.5 py-1.5 text-[11px] text-amber-800 bg-amber-50 hover:bg-amber-100 rounded-xl font-semibold transition-all cursor-pointer border border-amber-200"
                      >
                        Reset Filters
                      </button>
                    )}
                  </div>
                </div>

                {/* Preset Status & Validation Pill Filters */}
                <div className="flex flex-wrap items-center gap-1.5 bg-gray-100 p-1 rounded-xl text-xs font-semibold">
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

              {/* Add Task Form for Managers / Engineers / Admins (Collapsible) */}
              {showTaskForm && currentUser.role !== 'CLIENT' && (
                <form onSubmit={handleAddTask} className="bg-white p-5 rounded-2xl border-2 border-[#D4AF37]/50 shadow-md space-y-3 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                    <h4 className="font-serif font-bold text-gray-900 text-sm flex items-center gap-2">
                      <Plus className="w-4 h-4 text-[#D4AF37]" />
                      <span>Assign New Task to {newTaskInitialStatus.replace('_', ' ')}</span>
                    </h4>
                    <span className="text-[11px] font-mono text-[#8B7355] bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200/60">
                      Initial Status: {newTaskInitialStatus}
                    </span>
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
                      className="px-3 py-2 text-xs border border-gray-300 rounded-lg outline-none bg-white font-medium"
                    >
                      <option value="LOW">Low Priority</option>
                      <option value="MEDIUM">Medium Priority</option>
                      <option value="HIGH">High Priority</option>
                      <option value="URGENT">Urgent Priority</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                    <select
                      value={newTaskAssigneeId}
                      onChange={e => setNewTaskAssigneeId(e.target.value)}
                      className="px-3 py-2 text-xs border border-gray-300 rounded-lg outline-none bg-white font-medium"
                    >
                      <option value="">Select Assignee...</option>
                      {teamMembers.map(tm => (
                        <option key={tm.id} value={tm.id}>
                          {tm.name} — {tm.role.replace('_', ' ')}
                        </option>
                      ))}
                    </select>

                    <select
                      value={newTaskStage}
                      onChange={e => setNewTaskStage(e.target.value)}
                      className="px-3 py-2 text-xs border border-gray-300 rounded-lg outline-none bg-white font-medium"
                    >
                      <option value="Structural & MEP">Structural & MEP</option>
                      <option value="Finishes">Finishes</option>
                      <option value="Exterior & Landscaping">Exterior & Landscaping</option>
                      {projectMilestones.map(m => (
                        <option key={m.id} value={m.name}>
                          Milestone: {m.name}
                        </option>
                      ))}
                    </select>

                    <select
                      value={newTaskInitialStatus}
                      onChange={e => {
                        const statusVal = e.target.value as Task['status'];
                        setNewTaskInitialStatus(statusVal);
                        if (statusVal === 'DONE') setNewTaskProgress(100);
                        else if (statusVal === 'TODO') setNewTaskProgress(0);
                        else if (statusVal === 'IN_PROGRESS') setNewTaskProgress(50);
                        else if (statusVal === 'REVIEW') setNewTaskProgress(85);
                      }}
                      className="px-3 py-2 text-xs border border-gray-300 rounded-lg outline-none bg-white font-medium"
                    >
                      <option value="TODO">Column: To Do</option>
                      <option value="IN_PROGRESS">Column: In Progress</option>
                      <option value="REVIEW">Column: QC & Validation</option>
                      <option value="DONE">Column: Completed</option>
                    </select>

                    <input
                      type="date"
                      value={newTaskDueDate}
                      onChange={e => setNewTaskDueDate(e.target.value)}
                      className="px-3 py-2 text-xs border border-gray-300 rounded-lg outline-none"
                    />
                  </div>

                  {/* Initial Progress Range & Steppers */}
                  <div className="bg-gray-50/90 p-3 rounded-xl border border-gray-200/80 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-gray-700 flex items-center gap-1.5">
                        <TrendingUp className="w-3.5 h-3.5 text-[#D4AF37]" />
                        <span>Initial Progress Target</span>
                      </span>
                      <span className="font-mono font-bold text-[#8B7355] text-xs">{newTaskProgress}%</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <input
                        type="range"
                        min={0}
                        max={100}
                        step={5}
                        value={newTaskProgress}
                        onChange={e => {
                          const val = Number(e.target.value);
                          setNewTaskProgress(val);
                          if (val === 100) setNewTaskInitialStatus('DONE');
                          else if (val === 0) setNewTaskInitialStatus('TODO');
                          else if (newTaskInitialStatus === 'TODO' || newTaskInitialStatus === 'DONE') setNewTaskInitialStatus('IN_PROGRESS');
                        }}
                        className="flex-1 accent-[#D4AF37] h-1.5 bg-gray-200 rounded-lg cursor-pointer"
                      />
                      <div className="flex items-center gap-1 shrink-0">
                        {[0, 25, 50, 75, 100].map(pct => (
                          <button
                            key={pct}
                            type="button"
                            onClick={() => {
                              setNewTaskProgress(pct);
                              if (pct === 100) setNewTaskInitialStatus('DONE');
                              else if (pct === 0) setNewTaskInitialStatus('TODO');
                              else if (newTaskInitialStatus === 'TODO' || newTaskInitialStatus === 'DONE') setNewTaskInitialStatus('IN_PROGRESS');
                            }}
                            className={`text-[10px] px-2 py-0.5 rounded font-mono font-semibold transition-colors cursor-pointer ${
                              newTaskProgress === pct
                                ? 'bg-[#2C2416] text-[#D4AF37]'
                                : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-100'
                            }`}
                          >
                            {pct}%
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <textarea
                    placeholder="Engineering specifications, inspection protocols, and proof requirements for client sign-off..."
                    rows={2}
                    value={newTaskDesc}
                    onChange={e => setNewTaskDesc(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-[#D4AF37]"
                  />

                  <div className="flex justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setShowTaskForm(false)}
                      className="px-3.5 py-1.5 text-xs text-gray-500 hover:text-gray-700 rounded-lg cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-[#D4AF37] hover:bg-[#B8860B] text-black text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center gap-1.5 shadow-xs"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Save & Place on Board</span>
                    </button>
                  </div>
                </form>
              )}

              {/* Tasks Filtering Logic */}
              {(() => {
                const filteredTasks = projectTasks.filter(task => {
                  if (taskSearchQuery.trim()) {
                    const q = taskSearchQuery.toLowerCase();
                    const matchTitle = task.title.toLowerCase().includes(q);
                    const matchDesc = task.description.toLowerCase().includes(q);
                    const matchAssignee = task.assignedToName?.toLowerCase().includes(q);
                    const matchStage = task.stage?.toLowerCase().includes(q);
                    if (!matchTitle && !matchDesc && !matchAssignee && !matchStage) return false;
                  }

                  if (taskFilter === 'MY_TASKS' && task.assignedToId !== currentUser.id) return false;
                  if (taskFilter === 'PENDING_VALIDATION') {
                    const hasPending = task.progressImages?.some(
                      img => img.validationStatus === 'PENDING_CLIENT_VALIDATION'
                    );
                    if (!hasPending) return false;
                  }
                  if (taskFilter === 'DONE' && task.status !== 'DONE') return false;

                  if (taskMilestoneFilter !== 'ALL') {
                    const matchStage =
                      task.stage === taskMilestoneFilter ||
                      task.stage?.toLowerCase() === taskMilestoneFilter.toLowerCase();
                    if (!matchStage) return false;
                  }

                  if (taskPriorityFilter !== 'ALL' && task.priority !== taskPriorityFilter) return false;

                  return true;
                });

                if (filteredTasks.length === 0 && projectTasks.length > 0) {
                  return (
                    <div className="p-8 text-center bg-white rounded-2xl border border-gray-100 text-xs text-gray-400 space-y-2">
                      <Filter className="w-8 h-8 mx-auto text-gray-300" />
                      <p className="font-semibold text-gray-700">No tasks match your active filters</p>
                      <p className="text-[11px]">Clear your search query or reset filters to view all tasks.</p>
                      <button
                        type="button"
                        onClick={() => {
                          setTaskSearchQuery('');
                          setTaskMilestoneFilter('ALL');
                          setTaskPriorityFilter('ALL');
                          setTaskFilter('ALL');
                        }}
                        className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-lg text-xs cursor-pointer inline-block mt-1"
                      >
                        Reset All Filters
                      </button>
                    </div>
                  );
                }

                if (projectTasks.length === 0) {
                  return (
                    <div className="p-8 text-center bg-white rounded-2xl border border-gray-100 text-xs text-gray-400 space-y-3">
                      <Kanban className="w-10 h-10 mx-auto text-[#D4AF37]/50" />
                      <div>
                        <p className="font-semibold text-gray-800 text-sm">No tasks created yet</p>
                        <p className="text-gray-500 mt-1 max-w-sm mx-auto">
                          Create tasks for this estate project to track trade assignments, site photos, client sign-offs, and field milestones.
                        </p>
                      </div>
                      {currentUser.role !== 'CLIENT' && (
                        <button
                          type="button"
                          onClick={() => {
                            setShowTaskForm(true);
                            setNewTaskInitialStatus('TODO');
                          }}
                          className="px-4 py-2 bg-[#D4AF37] hover:bg-[#B8860B] text-black font-bold rounded-xl text-xs cursor-pointer inline-flex items-center gap-1.5 shadow-sm"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Assign First Task</span>
                        </button>
                      )}
                    </div>
                  );
                }

                {/* VIEW 1: INTERACTIVE KANBAN BOARD VIEW */}
                if (taskViewMode === 'kanban') {
                  return (
                    <div className="space-y-3">
                      {/* Drag & Drop instruction helper */}
                      <div className="flex items-center justify-between text-[11px] text-gray-500 px-1">
                        <span className="flex items-center gap-1">
                          <GripVertical className="w-3.5 h-3.5 text-gray-400" />
                          <span>Drag and drop task cards between columns or use quick shift buttons</span>
                        </span>
                        <span className="font-medium text-gray-600">
                          Showing {filteredTasks.length} of {projectTasks.length} tasks
                        </span>
                      </div>

                      {/* Kanban Columns Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 items-start">
                        {statusColumns.map(col => {
                          const colTasks = filteredTasks.filter(t => t.status === col.id);
                          const isDragTarget = dragOverColumn === col.id;

                          return (
                            <div
                              key={col.id}
                              onDragOver={e => handleDragOver(e, col.id)}
                              onDragLeave={e => handleDragLeave(e, col.id)}
                              onDrop={e => handleDrop(e, col.id)}
                              className={`rounded-2xl flex flex-col transition-all duration-200 border min-h-[380px] ${
                                isDragTarget
                                  ? 'border-2 border-dashed border-[#D4AF37] bg-amber-50/70 ring-2 ring-amber-400/30'
                                  : 'border-gray-200 bg-gray-100/70'
                              }`}
                            >
                              {/* Column Header */}
                              <div className="p-3 border-b border-gray-200/70 bg-white/70 rounded-t-2xl flex items-center justify-between">
                                <div className="space-y-0.5">
                                  <div className="flex items-center gap-2">
                                    <div className="w-2.5 h-2.5 rounded-full bg-[#D4AF37]" />
                                    <h4 className="font-serif font-bold text-gray-900 text-xs">
                                      {col.title}
                                    </h4>
                                    <span
                                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${col.badgeBg}`}
                                    >
                                      {colTasks.length}
                                    </span>
                                  </div>
                                  <p className="text-[10px] text-gray-500 pl-4">{col.subtitle}</p>
                                </div>

                                {currentUser.role !== 'CLIENT' && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setNewTaskInitialStatus(col.id);
                                      setShowTaskForm(true);
                                    }}
                                    className="p-1 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-900 transition-colors cursor-pointer"
                                    title={`Add task to ${col.title}`}
                                  >
                                    <Plus className="w-3.5 h-3.5" />
                                  </button>
                                )}
                              </div>

                              {/* Column Content / Cards */}
                              <div className="p-2.5 space-y-2.5 flex-1 overflow-y-auto max-h-[700px] scrollbar-thin">
                                {colTasks.length === 0 ? (
                                  <div className="h-32 flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-xl text-center p-3 text-[11px] text-gray-400">
                                    <p>No tasks in {col.title}</p>
                                    <p className="text-[10px] text-gray-400 mt-0.5">Drop a task card here</p>
                                  </div>
                                ) : (
                                  colTasks.map(task => {
                                    const hasPendingValidation = task.progressImages?.some(
                                      img => img.validationStatus === 'PENDING_CLIENT_VALIDATION'
                                    );
                                    const isClientValidated = task.progressImages?.some(
                                      img => img.validationStatus === 'CLIENT_VALIDATED'
                                    );
                                    const isAssignedToCurrent = task.assignedToId === currentUser.id;
                                    const isExpanded = expandedTaskId === task.id;
                                    const isDragging = draggingTaskId === task.id;
                                    const canEditThisTask = canModifyTask(task);

                                    return (
                                      <div
                                        key={task.id}
                                        draggable={canEditThisTask}
                                        onDragStart={e => handleDragStart(e, task.id)}
                                        className={`bg-white rounded-xl border p-3.5 shadow-2xs hover:shadow-md transition-all space-y-2.5 ${
                                          canEditThisTask ? 'cursor-grab active:cursor-grabbing' : 'cursor-default'
                                        } ${
                                          isDragging ? 'opacity-40 scale-95' : 'opacity-100'
                                        } ${
                                          hasPendingValidation
                                            ? 'border-amber-300 ring-1 ring-amber-400/40 bg-gradient-to-br from-white to-amber-50/20'
                                            : 'border-gray-200/90 hover:border-[#D4AF37]/60'
                                        }`}
                                      >
                                        {/* Card Header: Priority & Quick Move Buttons */}
                                        <div className="flex items-center justify-between gap-1.5">
                                          <div className="flex items-center gap-1.5 flex-wrap">
                                            <span
                                              className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                                                task.priority === 'URGENT'
                                                  ? 'bg-red-100 text-red-800 border border-red-200'
                                                  : task.priority === 'HIGH'
                                                  ? 'bg-orange-100 text-orange-800 border border-orange-200'
                                                  : task.priority === 'MEDIUM'
                                                  ? 'bg-amber-100 text-amber-900 border border-amber-200'
                                                  : 'bg-gray-100 text-gray-700 border border-gray-200'
                                              }`}
                                            >
                                              {task.priority}
                                            </span>

                                            {task.stage && (
                                              <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded-md bg-stone-100 text-stone-700 truncate max-w-[110px]" title={task.stage}>
                                                {task.stage}
                                              </span>
                                            )}
                                          </div>

                                          {/* Quick Column Shift Controls - Restricted to assignees & managers */}
                                          {canEditThisTask ? (
                                            <div className="flex items-center gap-0.5 shrink-0" onClick={e => e.stopPropagation()}>
                                              {col.id !== 'TODO' && (
                                                <button
                                                  type="button"
                                                  onClick={() => moveTaskStatus(task.id, 'prev')}
                                                  className="p-1 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors cursor-pointer"
                                                  title="Move to previous stage"
                                                >
                                                  <ArrowLeft className="w-3 h-3" />
                                                </button>
                                              )}
                                              {col.id !== 'DONE' && (
                                                <button
                                                  type="button"
                                                  onClick={() => moveTaskStatus(task.id, 'next')}
                                                  className="p-1 rounded hover:bg-gray-100 text-[#8B7355] hover:text-black transition-colors cursor-pointer"
                                                  title="Advance to next stage"
                                                >
                                                  <ArrowRight className="w-3 h-3" />
                                                </button>
                                              )}
                                            </div>
                                          ) : (
                                            <span className="text-[9px] font-mono text-gray-500 bg-gray-50 border border-gray-200/80 px-1.5 py-0.5 rounded flex items-center gap-1" title={currentUser.role === 'CLIENT' ? 'Assigned to specialist • Client view only' : 'Assigned to another specialist • Read-Only'}>
                                              <Lock className="w-2.5 h-2.5 text-gray-400" />
                                              <span>Read-Only</span>
                                            </span>
                                          )}
                                        </div>

                                        {/* Task Title & Description */}
                                        <div className="space-y-1">
                                          <h5 className="font-bold text-gray-900 text-xs leading-snug line-clamp-2">
                                            {task.title}
                                          </h5>
                                          {task.description && (
                                            <p className="text-[11px] text-gray-500 line-clamp-2 leading-relaxed">
                                              {task.description}
                                            </p>
                                          )}
                                        </div>

                                        {/* Interactive Progress Bar */}
                                        {(() => {
                                          const currentProg = task.progressPercent !== undefined
                                            ? task.progressPercent
                                            : (task.status === 'DONE' ? 100 : task.status === 'REVIEW' ? 85 : task.status === 'IN_PROGRESS' ? 50 : 0);

                                          return (
                                            <div className="space-y-1.5 pt-1.5 border-t border-gray-100/80" onClick={e => e.stopPropagation()}>
                                              <div className="flex items-center justify-between text-[10px]">
                                                <span className="font-medium text-gray-500 flex items-center gap-1">
                                                  <span>Progress</span>
                                                  {currentProg === 100 && (
                                                    <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-1 py-0.2 rounded border border-emerald-200">
                                                      Done
                                                    </span>
                                                  )}
                                                </span>
                                                <span className="font-mono font-bold text-[#8B7355]">{currentProg}%</span>
                                              </div>

                                              <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                                                <div
                                                  className={`h-full rounded-full transition-all duration-300 ${
                                                    currentProg === 100 ? 'bg-emerald-500' : currentProg >= 50 ? 'bg-[#D4AF37]' : 'bg-amber-400'
                                                  }`}
                                                  style={{ width: `${currentProg}%` }}
                                                />
                                              </div>

                                              {canEditThisTask ? (
                                                <div className="flex items-center gap-1.5 pt-0.5">
                                                  <input
                                                    type="range"
                                                    min={0}
                                                    max={100}
                                                    step={5}
                                                    value={currentProg}
                                                    onChange={e => handleTaskProgressChange(task.id, Number(e.target.value))}
                                                    className="flex-1 accent-[#D4AF37] h-1 bg-gray-200 rounded-lg cursor-pointer"
                                                    title={`Set progress: ${currentProg}%`}
                                                  />
                                                  <div className="flex items-center gap-0.5 shrink-0">
                                                    {[25, 50, 75, 100].map(pct => (
                                                      <button
                                                        key={pct}
                                                        type="button"
                                                        onClick={() => handleTaskProgressChange(task.id, pct)}
                                                        className={`text-[9px] px-1 py-0.2 rounded font-mono font-semibold transition-colors cursor-pointer ${
                                                          currentProg === pct
                                                            ? 'bg-[#2C2416] text-[#D4AF37]'
                                                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                                        }`}
                                                        title={`Set to ${pct}%`}
                                                      >
                                                        {pct}%
                                                      </button>
                                                    ))}
                                                  </div>
                                                </div>
                                              ) : (
                                                <div className="flex justify-between items-center text-[9px] text-gray-400">
                                                  <span>Field progress</span>
                                                  <span className="flex items-center gap-0.5"><Lock className="w-2.5 h-2.5" /> Locked</span>
                                                </div>
                                              )}
                                            </div>
                                          );
                                        })()}

                                        {/* Progress Images & Client Validation Badges */}
                                        {task.progressImages && task.progressImages.length > 0 && (
                                          <div className="space-y-1.5 pt-1 border-t border-gray-100">
                                            <div className="flex items-center justify-between text-[10px]">
                                              <span className="flex items-center gap-1 font-semibold text-gray-600">
                                                <Camera className="w-3 h-3 text-[#D4AF37]" />
                                                <span>{task.progressImages.length} field photo{task.progressImages.length > 1 ? 's' : ''}</span>
                                              </span>

                                              {hasPendingValidation ? (
                                                <span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-900 font-bold text-[9px] flex items-center gap-0.5 border border-amber-300/80 animate-pulse">
                                                  <Clock className="w-2.5 h-2.5" />
                                                  <span>Pending Sign-Off</span>
                                                </span>
                                              ) : isClientValidated ? (
                                                <span className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-900 font-bold text-[9px] flex items-center gap-0.5 border border-emerald-300">
                                                  <ShieldCheck className="w-2.5 h-2.5 text-emerald-700" />
                                                  <span>Verified</span>
                                                </span>
                                              ) : null}
                                            </div>

                                            {/* Preview Thumbnails */}
                                            <div className="flex items-center gap-1 overflow-x-auto pb-0.5">
                                              {task.progressImages.slice(0, 3).map((img, idx) => (
                                                <img
                                                  key={idx}
                                                  src={img.imageUrl}
                                                  alt={img.caption}
                                                  className="w-10 h-10 rounded-lg object-cover border border-gray-200 shrink-0"
                                                />
                                              ))}
                                              {task.progressImages.length > 3 && (
                                                <div className="w-10 h-10 rounded-lg bg-gray-100 text-gray-500 font-bold text-[10px] flex items-center justify-center shrink-0 border border-gray-200">
                                                  +{task.progressImages.length - 3}
                                                </div>
                                              )}
                                            </div>
                                          </div>
                                        )}

                                        {/* Card Footer: Assignee, Due Date & Expand Actions */}
                                        <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-500 gap-1.5">
                                          {/* Assignee Avatar */}
                                          <div className="flex items-center gap-1.5 min-w-0">
                                            {task.assignedToAvatar ? (
                                              <img
                                                src={task.assignedToAvatar}
                                                alt={task.assignedToName}
                                                className="w-5 h-5 rounded-full object-cover border border-gray-200 shrink-0"
                                              />
                                            ) : (
                                              <div className="w-5 h-5 rounded-full bg-gray-200 text-gray-600 font-bold text-[9px] flex items-center justify-center shrink-0">
                                                ?
                                              </div>
                                            )}
                                            <span className="truncate font-medium text-gray-800 text-[11px]">
                                              {task.assignedToName ? task.assignedToName.split(' ')[0] : 'Unassigned'}
                                            </span>
                                          </div>

                                          {/* Due Date & Comments Badge */}
                                          <div className="flex items-center gap-2 shrink-0">
                                            <span className="flex items-center gap-0.5 text-[10px] text-gray-500" title={`Due Date: ${task.dueDate}`}>
                                              <Calendar className="w-3 h-3 text-gray-400" />
                                              <span>{task.dueDate.split('-').slice(1).join('/')}</span>
                                            </span>

                                            <button
                                              type="button"
                                              onClick={() => setExpandedTaskId(isExpanded ? null : task.id)}
                                              className={`px-1.5 py-0.5 rounded text-[10px] font-semibold flex items-center gap-0.5 transition-colors cursor-pointer ${
                                                isExpanded
                                                  ? 'bg-[#2C2416] text-[#D4AF37]'
                                                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                                              }`}
                                              title="Toggle photo gallery & discussion"
                                            >
                                              <MessageSquare className="w-2.5 h-2.5" />
                                              <span>{task.comments.length}</span>
                                              {isExpanded ? <ChevronUp className="w-2.5 h-2.5" /> : <ChevronDown className="w-2.5 h-2.5" />}
                                            </button>
                                          </div>
                                        </div>

                                        {/* Status selector or read-only badge */}
                                        <div className="flex items-center justify-between pt-1 text-[10px]">
                                          {canEditThisTask ? (
                                            <select
                                              value={task.status}
                                              onChange={e => handleTaskStatusChange(task.id, e.target.value as any)}
                                              className="text-[10px] font-semibold px-2 py-0.5 rounded-md border border-gray-200 bg-gray-50 outline-none cursor-pointer"
                                            >
                                              <option value="TODO">To Do</option>
                                              <option value="IN_PROGRESS">In Progress</option>
                                              <option value="REVIEW">QC & Review</option>
                                              <option value="DONE">Completed</option>
                                            </select>
                                          ) : (
                                            <span
                                              className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-gray-100 text-gray-700 border border-gray-200 flex items-center gap-1"
                                              title={currentUser.role === 'CLIENT' ? 'Read-only: Only assigned specialists or project managers can modify field progress' : 'Read-only: Assigned to another specialist'}
                                            >
                                              <Lock className="w-2.5 h-2.5 text-gray-400" />
                                              <span>{task.status.replace('_', ' ')}</span>
                                            </span>
                                          )}

                                          {currentUser.role !== 'CLIENT' && (
                                            <button
                                              type="button"
                                              onClick={() => deleteTask(task.id)}
                                              className="p-1 text-gray-400 hover:text-red-500 rounded transition-colors cursor-pointer"
                                              title="Delete task"
                                            >
                                              <Trash2 className="w-3 h-3" />
                                            </button>
                                          )}
                                        </div>

                                        {/* Expanded Detailed Gallery & Notes view */}
                                        {isExpanded && (
                                          <div className="pt-3 border-t-2 border-gray-100 space-y-3 animate-in fade-in duration-200">
                                            {/* Photo upload & client validation module */}
                                            <TaskProgressGallery task={task} />

                                            {/* Comments Thread */}
                                            <div className="space-y-2 pt-2 border-t border-gray-100">
                                              <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-700">
                                                <MessageSquare className="w-3.5 h-3.5 text-gray-400" />
                                                <span>Engineering Discussion ({task.comments.length})</span>
                                              </div>

                                              {task.comments.length > 0 && (
                                                <div className="space-y-1.5 max-h-48 overflow-y-auto">
                                                  {task.comments.map(comm => (
                                                    <div key={comm.id} className="p-2 bg-gray-50 rounded-xl text-xs flex gap-2">
                                                      <img
                                                        src={comm.authorAvatar}
                                                        alt={comm.authorName}
                                                        className="w-5 h-5 rounded-full object-cover shrink-0 mt-0.5"
                                                      />
                                                      <div className="min-w-0 flex-1">
                                                        <div className="flex justify-between items-center">
                                                          <span className="font-bold text-gray-800 text-[10px]">{comm.authorName}</span>
                                                          <span className="text-[9px] text-gray-400">
                                                            {new Date(comm.createdAt).toLocaleTimeString([], {
                                                              hour: '2-digit',
                                                              minute: '2-digit'
                                                            })}
                                                          </span>
                                                        </div>
                                                        <p className="text-gray-600 mt-0.5 text-[11px] leading-relaxed">{comm.text}</p>
                                                      </div>
                                                    </div>
                                                  ))}
                                                </div>
                                              )}

                                              {/* Post comment input */}
                                              <div className="flex gap-1.5">
                                                <input
                                                  type="text"
                                                  placeholder="Add note or site observation..."
                                                  value={commentInputs[task.id] || ''}
                                                  onChange={e => setCommentInputs({ ...commentInputs, [task.id]: e.target.value })}
                                                  onKeyDown={e => {
                                                    if (e.key === 'Enter' && commentInputs[task.id]?.trim()) {
                                                      addTaskComment(task.id, commentInputs[task.id]);
                                                      setCommentInputs({ ...commentInputs, [task.id]: '' });
                                                    }
                                                  }}
                                                  className="flex-1 px-2.5 py-1 text-xs bg-gray-50 border border-gray-200 rounded-lg outline-none focus:bg-white focus:ring-1 focus:ring-[#D4AF37]"
                                                />
                                                <button
                                                  type="button"
                                                  onClick={() => {
                                                    if (commentInputs[task.id]?.trim()) {
                                                      addTaskComment(task.id, commentInputs[task.id]);
                                                      setCommentInputs({ ...commentInputs, [task.id]: '' });
                                                    }
                                                  }}
                                                  className="px-2.5 py-1 bg-gray-800 text-white text-[11px] font-semibold rounded-lg hover:bg-black transition-colors cursor-pointer"
                                                >
                                                  Post
                                                </button>
                                              </div>
                                            </div>
                                          </div>
                                        )}
                                      </div>
                                    );
                                  })
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                }

                {/* VIEW 2: DETAILED LIST VIEW */}
                return (
                  <div className="space-y-4">
                    {filteredTasks.map(task => {
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
                              {canModifyTask(task) ? (
                                <select
                                  value={task.status}
                                  onChange={e => handleTaskStatusChange(task.id, e.target.value as any)}
                                  className="text-xs font-semibold px-2.5 py-1 rounded-lg border border-gray-200 bg-gray-50 outline-none cursor-pointer"
                                >
                                  <option value="TODO">To Do</option>
                                  <option value="IN_PROGRESS">In Progress</option>
                                  <option value="REVIEW">Review</option>
                                  <option value="DONE">Done</option>
                                </select>
                              ) : (
                                <span
                                  className="text-xs font-semibold px-2.5 py-1 rounded-lg border border-gray-200 bg-gray-100 text-gray-700 flex items-center gap-1.5"
                                  title={currentUser.role === 'CLIENT' ? 'Read-only: Only assigned specialists or project managers can modify field progress' : 'Read-only: Assigned to another specialist'}
                                >
                                  <Lock className="w-3 h-3 text-gray-400" />
                                  <span>{task.status.replace('_', ' ')}</span>
                                </span>
                              )}

                              {currentUser.role !== 'CLIENT' && (
                                <button
                                  type="button"
                                  onClick={() => deleteTask(task.id)}
                                  className="p-1 text-gray-400 hover:text-red-500 rounded transition-colors cursor-pointer"
                                  title="Delete task"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          </div>

                          {/* Interactive Progress Bar */}
                          {(() => {
                            const currentProg = task.progressPercent !== undefined
                              ? task.progressPercent
                              : (task.status === 'DONE' ? 100 : task.status === 'REVIEW' ? 85 : task.status === 'IN_PROGRESS' ? 50 : 0);
                            const canEdit = canModifyTask(task);

                            return (
                              <div className="space-y-1.5 py-1 bg-gray-50/70 p-3 rounded-xl border border-gray-100">
                                <div className="flex justify-between text-xs text-gray-600">
                                  <span className="flex items-center gap-1.5 font-medium">
                                    <span>Field Completion Status</span>
                                    {currentProg === 100 && (
                                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                                        100% Completed
                                      </span>
                                    )}
                                  </span>
                                  <span className="font-mono font-bold text-[#8B7355] text-xs">{currentProg}%</span>
                                </div>

                                <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                                  <div
                                    className={`h-full rounded-full transition-all duration-300 ${
                                      currentProg === 100 ? 'bg-emerald-500' : currentProg >= 50 ? 'bg-[#D4AF37]' : 'bg-amber-400'
                                    }`}
                                    style={{ width: `${currentProg}%` }}
                                  />
                                </div>

                                <div className="flex flex-wrap items-center justify-between gap-2 pt-0.5 text-xs">
                                  <span className="text-[11px] text-gray-400">
                                    Target Date: {task.dueDate || 'Open'}
                                  </span>

                                  {canEdit ? (
                                    <div className="flex items-center gap-2">
                                      <input
                                        type="range"
                                        min={0}
                                        max={100}
                                        step={5}
                                        value={currentProg}
                                        onChange={e => handleTaskProgressChange(task.id, Number(e.target.value))}
                                        className="w-28 sm:w-36 accent-[#D4AF37] h-1.5 bg-gray-200 rounded-lg cursor-pointer"
                                        title={`Adjust progress: ${currentProg}%`}
                                      />
                                      <div className="flex items-center gap-1">
                                        {[25, 50, 75, 100].map(pct => (
                                          <button
                                            key={pct}
                                            type="button"
                                            onClick={() => handleTaskProgressChange(task.id, pct)}
                                            className={`text-[10px] px-1.5 py-0.5 rounded font-mono font-medium transition-colors cursor-pointer ${
                                              currentProg === pct
                                                ? 'bg-[#2C2416] text-[#D4AF37]'
                                                : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-100'
                                            }`}
                                            title={`Quick set to ${pct}%`}
                                          >
                                            {pct}%
                                          </button>
                                        ))}
                                      </div>
                                    </div>
                                  ) : (
                                    <span className="text-[11px] text-gray-400 flex items-center gap-1">
                                      <Lock className="w-3 h-3 text-gray-400" />
                                      <span>Progress locked (Assigned to specialist)</span>
                                    </span>
                                  )}
                                </div>
                              </div>
                            );
                          })()}

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
                    })}
                  </div>
                );
              })()}
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
