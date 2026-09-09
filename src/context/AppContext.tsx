import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  User,
  UserRole,
  UserStatus,
  TwoFactorStatus,
  SecurityTier,
  IAMPermission,
  UserSession,
  TwoFactorChallenge,
  TwoFactorEnrollmentPackage,
  Project,
  Milestone,
  Task,
  TaskProgressImage,
  TaskImageValidationStatus,
  BudgetLine,
  Expense,
  Invoice,
  Payment,
  ChangeOrder,
  TeamMember,
  Client,
  Company,
  DesignConcept,
  DesignRequest,
  Inquiry,
  MarketArticle,
  ChatChannel,
  ChatMessage,
  AuditLog,
  SystemLog,
  ToastMessage,
  POSTransaction,
  LegalDocument,
  LegalDocumentStatus,
  CatalogItem
} from '../types';
import {
  SEED_USERS,
  SEED_PROJECTS,
  SEED_MILESTONES,
  SEED_TASKS,
  SEED_BUDGET_LINES,
  SEED_EXPENSES,
  SEED_INVOICES,
  SEED_PAYMENTS,
  SEED_CHANGE_ORDERS,
  SEED_TEAM_MEMBERS,
  SEED_CLIENTS,
  SEED_COMPANIES,
  SEED_CONCEPTS,
  SEED_DESIGN_REQUESTS,
  SEED_INQUIRIES,
  SEED_ARTICLES,
  SEED_CHANNELS,
  SEED_MESSAGES,
  SEED_AUDIT_LOGS,
  SEED_SYSTEM_LOGS,
  SEED_POS_TRANSACTIONS,
  SEED_LEGAL_DOCUMENTS,
  SEED_CATALOG_ITEMS
} from '../data/seedData';

const SEED_SESSIONS: UserSession[] = [
  {
    id: 'sess-1',
    userId: 'u1',
    ipAddress: '192.168.1.101',
    userAgent: 'Chrome 128 (macOS Sonoma / M3 Max)',
    location: 'Beverly Hills, CA, USA',
    createdAt: '2026-09-01 08:30:12',
    lastActiveAt: 'Just now',
    isCurrentSession: true
  },
  {
    id: 'sess-2',
    userId: 'u2',
    ipAddress: '172.56.21.90',
    userAgent: 'Safari 17.5 (iOS 18 / iPad Pro)',
    location: 'Los Angeles, CA, USA',
    createdAt: '2026-09-01 07:14:22',
    lastActiveAt: '15 mins ago'
  },
  {
    id: 'sess-3',
    userId: 'u4',
    ipAddress: '108.48.91.204',
    userAgent: 'Edge 126 (Windows 11 Enterprise)',
    location: 'Beverly Hills, CA, USA',
    createdAt: '2026-09-01 06:12:00',
    lastActiveAt: '2 hours ago'
  },
  {
    id: 'sess-4',
    userId: 'u5',
    ipAddress: '66.249.79.112',
    userAgent: 'Chrome Mobile (Android 15 / Pixel 9 Pro)',
    location: 'San Pedro Port, CA, USA',
    createdAt: '2026-08-31 22:15:30',
    lastActiveAt: '9 hours ago'
  }
];

interface AppContextType {
  // Auth & Roles
  currentUser: User;
  switchRole: (role: UserRole) => void;
  users: User[];

  // Navigation
  activeView: 'dashboard' | 'projects' | 'design-portal' | 'financials' | 'team-clients' | 'analytics';
  setActiveView: (view: 'dashboard' | 'projects' | 'design-portal' | 'financials' | 'team-clients' | 'analytics') => void;

  // Companies & Trade Partners ("caranies")
  companies: Company[];
  addCompany: (company: Omit<Company, 'id' | 'createdAt'>) => Company;
  updateCompany: (id: string, updates: Partial<Company>) => void;
  deleteCompany: (id: string) => void;
  uploadContractorNDA: (companyId: string, fileData: { fileName: string; fileDataUrl: string; fileSize?: string; signerName?: string }) => Promise<LegalDocument>;

  // IAM & 2FA Governance
  grantUserAccess: (
    userData: Omit<User, 'id' | 'onboardedAt'> & { initialPassword?: string },
    verification2FACode: string
  ) => TwoFactorEnrollmentPackage;
  updateUserRole: (userId: string, newRole: UserRole, permissions: IAMPermission[], verification2FACode?: string) => void;
  updateUserPermissions: (userId: string, permissions: IAMPermission[]) => void;
  toggleUserStatus: (userId: string, status: UserStatus) => void;
  resetUser2FA: (userId: string) => TwoFactorEnrollmentPackage;
  enforceGlobal2FA: (enforced: boolean) => void;
  deleteUserAccount: (userId: string) => void;
  activeSessions: UserSession[];
  revokeUserSession: (sessionId: string) => void;
  global2FAEnforced: boolean;

  // 2FA Security Challenge & Enrollment Modals
  is2FAChallengeOpen: boolean;
  setIs2FAChallengeOpen: (open: boolean) => void;
  current2FAChallenge: TwoFactorChallenge | null;
  setCurrent2FAChallenge: (challenge: TwoFactorChallenge | null) => void;
  trigger2FAChallenge: (challenge: Omit<TwoFactorChallenge, 'onSuccess'> & { onSuccess: (code: string) => void }) => void;
  enrollmentPackage: TwoFactorEnrollmentPackage | null;
  setEnrollmentPackage: (pkg: TwoFactorEnrollmentPackage | null) => void;

  // Projects
  projects: Project[];
  selectedProjectId: string | null;
  selectedProject: Project | null;
  openProjectDrawer: (projectId: string, tab?: string) => void;
  closeProjectDrawer: () => void;
  activeDrawerTab: string;
  setActiveDrawerTab: (tab: string) => void;
  addProject: (project: Omit<Project, 'id' | 'createdAt' | 'code' | 'spent' | 'team'>) => Project;
  updateProject: (id: string, updates: Partial<Project>) => void;
  deleteProject: (id: string) => void;

  // Milestones
  milestones: Milestone[];
  addMilestone: (milestone: Omit<Milestone, 'id'>) => void;
  updateMilestone: (id: string, updates: Partial<Milestone>) => void;
  deleteMilestone: (id: string) => void;

  // Tasks
  tasks: Task[];
  addTask: (task: Omit<Task, 'id' | 'comments' | 'attachments'>) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  addTaskComment: (taskId: string, text: string) => void;
  addTaskProgressImage: (
    taskId: string,
    imageData: {
      imageUrl: string;
      thumbnailUrl?: string;
      caption: string;
      stageName?: string;
      progressPercent?: number;
      locationTag?: string;
      cameraMetadata?: { device?: string; timestamp?: string; gpsCoords?: string };
      tags?: string[];
    }
  ) => TaskProgressImage;
  validateTaskProgressImage: (
    taskId: string,
    imageId: string,
    validation: {
      status: 'CLIENT_VALIDATED' | 'REQUIRES_REVISION';
      feedback?: string;
      rating?: number;
    }
  ) => void;
  deleteTaskProgressImage: (taskId: string, imageId: string) => void;
  assignTask: (taskId: string, memberId: string) => void;

  // Financials
  budgetLines: BudgetLine[];
  addBudgetLine: (line: Omit<BudgetLine, 'id'>) => void;
  updateBudgetLine: (id: string, updates: Partial<BudgetLine>) => void;
  deleteBudgetLine: (id: string) => void;

  expenses: Expense[];
  addExpense: (expense: Omit<Expense, 'id'>) => void;
  updateExpenseStatus: (id: string, status: 'APPROVED' | 'REJECTED') => void;

  invoices: Invoice[];
  addInvoice: (invoice: Omit<Invoice, 'id' | 'invoiceNumber'>) => void;
  updateInvoiceStatus: (id: string, status: Invoice['status']) => void;

  payments: Payment[];
  recordPayment: (payment: Omit<Payment, 'id'>) => void;

  // POS & Payment Terminal
  posTransactions: POSTransaction[];
  processPOSTransaction: (
    transaction: Omit<POSTransaction, 'id' | 'transactionNumber' | 'timestamp' | 'receiptHash'>
  ) => POSTransaction;

  // Architectural Service & Procurement Catalog
  catalogItems: CatalogItem[];
  addCatalogItem: (item: Omit<CatalogItem, 'id' | 'createdAt'>) => CatalogItem;
  updateCatalogItem: (id: string, updates: Partial<CatalogItem>) => void;
  deleteCatalogItem: (id: string) => void;
  applyCatalogItemToBudget: (
    catalogItemId: string,
    projectId: string,
    options?: { customPrice?: number; customQuantity?: number; notes?: string }
  ) => BudgetLine | undefined;

  // Legal Documents & Digital Signature Vault
  legalDocuments: LegalDocument[];
  uploadLegalDocument: (
    doc: Omit<LegalDocument, 'id' | 'documentNumber' | 'createdAt' | 'status' | 'version'> & { version?: string }
  ) => LegalDocument;
  signLegalDocument: (
    documentId: string,
    signerData: { signerName: string; signerRole: string; signatureDataUrl?: string; ipAddress?: string }
  ) => void;
  updateLegalDocumentStatus: (documentId: string, status: LegalDocumentStatus) => void;

  // Change Orders
  changeOrders: ChangeOrder[];
  addChangeOrder: (co: Omit<ChangeOrder, 'id' | 'status' | 'date'>) => void;
  updateChangeOrderStatus: (id: string, status: 'APPROVED' | 'REJECTED', notes?: string) => void;

  // Team & Clients
  teamMembers: TeamMember[];
  addTeamMember: (member: Omit<TeamMember, 'id' | 'activeProjectsCount'>) => void;
  updateTeamMember: (id: string, updates: Partial<TeamMember>) => void;
  clients: Client[];
  addClient: (client: Omit<Client, 'id' | 'activeProjectsCount'>) => void;
  assignTeamMemberToProject: (projectId: string, memberId: string, role: string, allocationPercentage?: number) => void;
  removeTeamMemberFromProject: (projectId: string, memberId: string) => void;

  // Design Portal
  designRequests: DesignRequest[];
  createDesignRequest: (req: Omit<DesignRequest, 'id' | 'status' | 'createdAt' | 'generatedConcepts'>) => Promise<DesignRequest>;
  inquiries: Inquiry[];
  submitInquiry: (inq: Omit<Inquiry, 'id' | 'createdAt' | 'status'>) => void;
  updateInquiryStatus: (id: string, status: 'NEW' | 'CONTACTED' | 'RESOLVED') => void;
  designConcepts: DesignConcept[];
  addDesignConcept: (concept: Omit<DesignConcept, 'id'>) => DesignConcept;
  updateDesignConcept: (id: string, updates: Partial<DesignConcept>) => void;
  deleteDesignConcept: (id: string) => void;
  promoteConceptToPortfolio: (conceptId: string, customTitle?: string, collectionName?: string) => void;
  articles: MarketArticle[];

  // Chat & Messaging
  chatOpen: boolean;
  setChatOpen: (open: boolean) => void;
  channels: ChatChannel[];
  activeChannelId: string;
  setActiveChannelId: (id: string) => void;
  markChannelAsRead: (channelId: string) => void;
  messages: Record<string, ChatMessage[]>;
  sendMessage: (channelId: string, text: string, replyToId?: string, replySnippet?: string) => void;
  deleteMessage: (channelId: string, messageId: string) => void;
  createChatChannel: (channelData: {
    name: string;
    type: 'PROJECT' | 'DIRECT' | 'GENERAL';
    projectId?: string;
    subtext?: string;
    members: string[];
    category?: 'PROJECT_ROOM' | 'DIRECT_MESSAGE' | 'DESIGN_CRITIQUE' | 'CLIENT_SUPPORT' | 'SITE_COORDINATION' | 'GENERAL';
    initialMessage?: string;
  }) => ChatChannel;

  // Logs & Analytics
  auditLogs: AuditLog[];
  systemLogs: SystemLog[];
  logAuditAction: (
    action: string,
    category: string,
    status: 'SUCCESS' | 'FAILURE' | 'ERROR',
    diagnostics: string,
    metadata?: { resourceType?: string; resourceId?: string; payload?: Record<string, any> }
  ) => void;
  clearAuditLogs: () => void;
  onboardClient: (userId: string, assignedProjectId?: string, customWelcomeNote?: string) => void;
  rejectClientOnboarding: (userId: string, reason?: string) => void;
  createPendingClient: (clientData: {
    name: string;
    email: string;
    company: string;
    phone?: string;
    assignedProjectId?: string;
    notes?: string;
  }) => User;

  // Toasts
  toasts: ToastMessage[];
  addToast: (type: 'success' | 'error' | 'info', message: string) => void;
  removeToast: (id: string) => void;

  // Modals
  isCreateProjectOpen: boolean;
  setIsCreateProjectOpen: (open: boolean) => void;
  editingProjectData: Project | null;
  setEditingProjectData: (proj: Project | null) => void;
  isCreateMemberOpen: boolean;
  setIsCreateMemberOpen: (open: boolean) => void;
  isCreateClientOpen: boolean;
  setIsCreateClientOpen: (open: boolean) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

function loadFromStorage<T>(key: string, defaultValue: T): T {
  try {
    const saved = localStorage.getItem(`vertex_${key}`);
    return saved ? JSON.parse(saved) : defaultValue;
  } catch (e) {
    console.error(`Failed to load ${key} from storage:`, e);
    return defaultValue;
  }
}

function saveToStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(`vertex_${key}`, JSON.stringify(value));
  } catch (e) {
    console.error(`Failed to save ${key} to storage:`, e);
  }
}

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<User[]>(() => loadFromStorage('users', SEED_USERS));
  const [currentUser, setCurrentUser] = useState<User>(() => loadFromStorage('currentUser', SEED_USERS[0]));
  const [activeView, setActiveView] = useState<'dashboard' | 'projects' | 'design-portal' | 'financials' | 'team-clients' | 'analytics'>('dashboard');

  // Core Data Stores
  const [projects, setProjects] = useState<Project[]>(() => loadFromStorage('projects', SEED_PROJECTS));
  const [milestones, setMilestones] = useState<Milestone[]>(() => loadFromStorage('milestones', SEED_MILESTONES));
  const [tasks, setTasks] = useState<Task[]>(() => loadFromStorage('tasks', SEED_TASKS));
  const [budgetLines, setBudgetLines] = useState<BudgetLine[]>(() => loadFromStorage('budgetLines', SEED_BUDGET_LINES));
  const [expenses, setExpenses] = useState<Expense[]>(() => loadFromStorage('expenses', SEED_EXPENSES));
  const [invoices, setInvoices] = useState<Invoice[]>(() => loadFromStorage('invoices', SEED_INVOICES));
  const [payments, setPayments] = useState<Payment[]>(() => loadFromStorage('payments', SEED_PAYMENTS));
  const [changeOrders, setChangeOrders] = useState<ChangeOrder[]>(() => loadFromStorage('changeOrders', SEED_CHANGE_ORDERS));
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>(() => loadFromStorage('teamMembers', SEED_TEAM_MEMBERS));
  const [clients, setClients] = useState<Client[]>(() => loadFromStorage('clients', SEED_CLIENTS));
  const [designConcepts, setDesignConcepts] = useState<DesignConcept[]>(() => loadFromStorage('designConcepts', SEED_CONCEPTS));
  const [designRequests, setDesignRequests] = useState<DesignRequest[]>(() => loadFromStorage('designRequests', SEED_DESIGN_REQUESTS));
  const [inquiries, setInquiries] = useState<Inquiry[]>(() => loadFromStorage('inquiries', SEED_INQUIRIES));
  const [articles] = useState<MarketArticle[]>(SEED_ARTICLES);
  const [channels, setChannels] = useState<ChatChannel[]>(() => loadFromStorage('channels', SEED_CHANNELS));
  const [messages, setMessages] = useState<Record<string, ChatMessage[]>>(() => loadFromStorage('messages', SEED_MESSAGES));
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => loadFromStorage('auditLogs', SEED_AUDIT_LOGS));
  const [systemLogs, setSystemLogs] = useState<SystemLog[]>(() => loadFromStorage('systemLogs', SEED_SYSTEM_LOGS));
  const [posTransactions, setPosTransactions] = useState<POSTransaction[]>(() => loadFromStorage('posTransactions', SEED_POS_TRANSACTIONS));
  const [catalogItems, setCatalogItems] = useState<CatalogItem[]>(() => loadFromStorage('catalogItems', SEED_CATALOG_ITEMS));
  const [legalDocuments, setLegalDocuments] = useState<LegalDocument[]>(() => loadFromStorage('legalDocuments', SEED_LEGAL_DOCUMENTS));
  const [companies, setCompanies] = useState<Company[]>(() => loadFromStorage('companies', SEED_COMPANIES));
  const [activeSessions, setActiveSessions] = useState<UserSession[]>(() => loadFromStorage('activeSessions', SEED_SESSIONS));
  const [global2FAEnforced, setGlobal2FAEnforced] = useState<boolean>(() => loadFromStorage('global2FAEnforced', true));

  // 2FA Security Challenge & Enrollment Flow state
  const [is2FAChallengeOpen, setIs2FAChallengeOpen] = useState<boolean>(false);
  const [current2FAChallenge, setCurrent2FAChallenge] = useState<TwoFactorChallenge | null>(null);
  const [enrollmentPackage, setEnrollmentPackage] = useState<TwoFactorEnrollmentPackage | null>(null);

  // UI state
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [activeDrawerTab, setActiveDrawerTab] = useState<string>('overview');
  const [chatOpen, setChatOpen] = useState<boolean>(false);
  const [activeChannelId, setActiveChannelId] = useState<string>('c-p1');
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Modals state
  const [isCreateProjectOpen, setIsCreateProjectOpen] = useState(false);
  const [editingProjectData, setEditingProjectData] = useState<Project | null>(null);
  const [isCreateMemberOpen, setIsCreateMemberOpen] = useState(false);
  const [isCreateClientOpen, setIsCreateClientOpen] = useState(false);

  // Sync back to local storage
  useEffect(() => saveToStorage('users', users), [users]);
  useEffect(() => saveToStorage('currentUser', currentUser), [currentUser]);
  useEffect(() => saveToStorage('projects', projects), [projects]);
  useEffect(() => saveToStorage('milestones', milestones), [milestones]);
  useEffect(() => saveToStorage('tasks', tasks), [tasks]);
  useEffect(() => saveToStorage('budgetLines', budgetLines), [budgetLines]);
  useEffect(() => saveToStorage('expenses', expenses), [expenses]);
  useEffect(() => saveToStorage('invoices', invoices), [invoices]);
  useEffect(() => saveToStorage('payments', payments), [payments]);
  useEffect(() => saveToStorage('changeOrders', changeOrders), [changeOrders]);
  useEffect(() => saveToStorage('teamMembers', teamMembers), [teamMembers]);
  useEffect(() => saveToStorage('clients', clients), [clients]);
  useEffect(() => saveToStorage('companies', companies), [companies]);
  useEffect(() => saveToStorage('activeSessions', activeSessions), [activeSessions]);
  useEffect(() => saveToStorage('global2FAEnforced', global2FAEnforced), [global2FAEnforced]);
  useEffect(() => saveToStorage('designConcepts', designConcepts), [designConcepts]);
  useEffect(() => saveToStorage('designRequests', designRequests), [designRequests]);
  useEffect(() => saveToStorage('inquiries', inquiries), [inquiries]);
  useEffect(() => saveToStorage('channels', channels), [channels]);
  useEffect(() => saveToStorage('messages', messages), [messages]);
  useEffect(() => saveToStorage('auditLogs', auditLogs), [auditLogs]);
  useEffect(() => saveToStorage('systemLogs', systemLogs), [systemLogs]);
  useEffect(() => saveToStorage('posTransactions', posTransactions), [posTransactions]);
  useEffect(() => saveToStorage('catalogItems', catalogItems), [catalogItems]);
  useEffect(() => saveToStorage('legalDocuments', legalDocuments), [legalDocuments]);

  const addToast = (type: 'success' | 'error' | 'info', message: string) => {
    const id = Date.now().toString() + Math.random().toString(36).substring(2, 6);
    setToasts(prev => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const logAuditAction = (
    action: string,
    category: string,
    status: 'SUCCESS' | 'FAILURE' | 'ERROR',
    diagnostics: string,
    metadata?: { resourceType?: string; resourceId?: string; payload?: Record<string, any> }
  ) => {
    const now = new Date();
    const timestamp = now.toISOString().replace('T', ' ').substring(0, 19);
    const newLog: AuditLog = {
      id: 'aud_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      timestamp,
      user: currentUser.email,
      userRole: currentUser.role,
      action,
      category,
      status,
      ip: '192.168.1.' + (100 + Math.floor(Math.random() * 50)),
      diagnostics,
      resourceType: metadata?.resourceType,
      resourceId: metadata?.resourceId,
      metadata: metadata?.payload
    };
    setAuditLogs(prev => [newLog, ...prev]);

    // Also add to system log
    const timeShort = now.toTimeString().split(' ')[0] + '.' + String(now.getMilliseconds()).padStart(3, '0');
    setSystemLogs(prev => [
      {
        id: 'sys_' + Date.now(),
        timestamp: timeShort,
        level: status === 'ERROR' ? 'ERROR' : status === 'FAILURE' ? 'WARN' : 'INFO',
        message: `[${category}] ${action} (${currentUser.role}:${currentUser.email}): ${diagnostics}`,
        source: 'actionDispatcher'
      },
      ...prev.slice(0, 99)
    ]);
  };

  const clearAuditLogs = () => {
    setAuditLogs([]);
    addToast('info', 'Audit logs cleared. Diagnostic baseline initialized.');
    logAuditAction('CLEAR_AUDIT_LOGS', 'SECURITY_ADMIN', 'SUCCESS', 'Administrator initiated audit log flush');
  };

  const onboardClient = (
    userId: string,
    assignedProjectId?: string,
    customWelcomeNote?: string
  ) => {
    const targetUser = users.find(u => u.id === userId);
    if (!targetUser) return;

    // Automatic Client Role Entitlements
    const defaultClientPermissions: IAMPermission[] = [
      'VIEW_FINANCIALS',
      'EXECUTE_LEGAL_CONTRACTS',
      'DESIGN_PORTAL_WRITE',
      'CLIENT_PORTAL_VIEW'
    ];

    const currentAssigned = targetUser.assignedProjectIds || [];
    const updatedAssigned = assignedProjectId && !currentAssigned.includes(assignedProjectId)
      ? [...currentAssigned, assignedProjectId]
      : currentAssigned;

    const updatedUser: User = {
      ...targetUser,
      role: 'CLIENT',
      status: 'ACTIVE',
      onboardingStatus: 'ONBOARDED',
      onboardedAt: new Date().toISOString().split('T')[0],
      securityTier: targetUser.securityTier || 'TIER_4_CLIENT',
      twoFactorStatus: 'ENROLLED',
      twoFactorEnforced: true,
      permissions: defaultClientPermissions,
      assignedProjectIds: updatedAssigned
    };

    setUsers(prev => prev.map(u => u.id === userId ? updatedUser : u));
    if (currentUser.id === userId) {
      setCurrentUser(updatedUser);
    }

    // Link assigned project to client if provided
    if (assignedProjectId) {
      setProjects(prev => prev.map(p => {
        if (p.id === assignedProjectId) {
          return {
            ...p,
            clientId: targetUser.id,
            clientName: targetUser.name,
            clientEmail: targetUser.email
          };
        }
        return p;
      }));
    }

    // Ensure client profile exists in clients directory
    setClients(prev => {
      const exists = prev.find(c => c.id === targetUser.id || c.email.toLowerCase() === targetUser.email.toLowerCase());
      if (exists) {
        return prev.map(c => (c.id === targetUser.id || c.email.toLowerCase() === targetUser.email.toLowerCase()) ? {
          ...c,
          status: 'ACTIVE',
          activeProjectsCount: Math.max(c.activeProjectsCount, updatedAssigned.length)
        } : c);
      }
      const newClientEntry: Client = {
        id: targetUser.id,
        name: targetUser.name,
        company: targetUser.company || 'Private Estate Trust',
        email: targetUser.email,
        phone: targetUser.phone || '+1 (555) 000-0000',
        address: '1000 Wilshire Blvd, Los Angeles, CA',
        activeProjectsCount: updatedAssigned.length,
        totalBilled: 0,
        status: 'ACTIVE',
        avatar: targetUser.avatar || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150',
        notes: `Verified & onboarded via Admin Onboarding Status Tracker on ${new Date().toISOString().split('T')[0]}.`
      };
      return [...prev, newClientEntry];
    });

    // Automatically trigger Welcome Notification in the Direct Support Channel
    const welcomeChannelId = `c-direct-${targetUser.id}`;
    const welcomeChannelName = `${targetUser.name} (Direct Support)`;
    const welcomeMessageText = `🎉 Welcome to VERTEX Studio Architecture, ${targetUser.name}!\n\nYour client account for "${targetUser.company || 'Private Trust'}" has been approved by the Administration Team with Tier-4 Client clearance.\n\nYour active entitlements include:\n• 📐 3D Design Submissions & Moodboard Approvals\n• 🏛️ Live Project Milestone Inspection & Timeline Sign-offs\n• 💳 Private Escrow Ledger, Draw Schedules & Statements\n• ✍️ Cryptographic Digital Contract Execution\n${customWelcomeNote ? `\n💬 Administrator Note: "${customWelcomeNote}"\n` : ''}\nOur architects and project managers are ready to assist you in this channel.`;

    setChannels(prev => {
      const existing = prev.find(c => c.id === welcomeChannelId);
      if (existing) {
        return prev.map(c => c.id === welcomeChannelId ? {
          ...c,
          unreadCount: c.unreadCount + 1,
          lastMessagePreview: `Welcome to VERTEX, ${targetUser.name}!`,
          lastMessageTime: 'Just now'
        } : c);
      }
      const newWelcomeChannel: ChatChannel = {
        id: welcomeChannelId,
        name: welcomeChannelName,
        type: 'DIRECT',
        category: 'CLIENT_SUPPORT',
        unreadCount: 1,
        lastMessagePreview: `Welcome to VERTEX, ${targetUser.name}!`,
        lastMessageTime: 'Just now',
        members: Array.from(new Set(['Alexander Wright', targetUser.name])),
        createdBy: 'Alexander Wright',
        creatorRole: 'ADMIN',
        subtext: 'Direct Client Welcome & Support Channel'
      };
      return [newWelcomeChannel, ...prev];
    });

    const newMsg: ChatMessage = {
      id: 'm_welcome_' + Date.now(),
      channelId: welcomeChannelId,
      senderId: 'u1',
      senderName: 'Alexander Wright',
      senderRole: 'ADMIN',
      senderAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      text: welcomeMessageText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => ({
      ...prev,
      [welcomeChannelId]: [...(prev[welcomeChannelId] || []), newMsg]
    }));

    addToast('success', `Client ${targetUser.name} approved! Role permissions updated & welcome notification sent.`);
    logAuditAction(
      'CLIENT_ONBOARDING_APPROVED',
      'CLIENT_GOVERNANCE',
      'SUCCESS',
      `Approved client account for ${targetUser.email} (${targetUser.name}) from "${targetUser.company}". Assigned Tier-4 entitlements & dispatched welcome channel.`,
      {
        resourceType: 'USER',
        resourceId: userId,
        payload: {
          permissions: defaultClientPermissions,
          company: targetUser.company,
          assignedProjectIds: updatedAssigned,
          welcomeNotificationChannel: welcomeChannelId
        }
      }
    );
  };

  const rejectClientOnboarding = (userId: string, reason?: string) => {
    const targetUser = users.find(u => u.id === userId);
    if (!targetUser) return;

    const updatedUser: User = {
      ...targetUser,
      onboardingStatus: 'REJECTED',
      status: 'SUSPENDED',
      permissions: []
    };

    setUsers(prev => prev.map(u => u.id === userId ? updatedUser : u));
    if (currentUser.id === userId) {
      setCurrentUser(updatedUser);
    }

    setClients(prev => prev.map(c => (c.id === userId || c.email.toLowerCase() === targetUser.email.toLowerCase()) ? {
      ...c,
      status: 'SUSPENDED'
    } : c));

    addToast('error', `Client account ${targetUser.name} onboarding request was rejected.`);
    logAuditAction(
      'CLIENT_ONBOARDING_REJECTED',
      'CLIENT_GOVERNANCE',
      'FAILURE',
      `Rejected client registration for ${targetUser.email} (${targetUser.name}). Reason: ${reason || 'Administrative discretion / Compliance verification failed'}. Access restricted.`,
      { resourceType: 'USER', resourceId: userId, payload: { reason } }
    );
  };

  const createPendingClient = (clientData: {
    name: string;
    email: string;
    company: string;
    phone?: string;
    assignedProjectId?: string;
    notes?: string;
  }): User => {
    const newId = 'u_pending_' + Date.now();
    const newPendingUser: User = {
      id: newId,
      name: clientData.name,
      email: clientData.email,
      role: 'CLIENT',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      phone: clientData.phone || '+1 (555) 900-1122',
      company: clientData.company || 'Private Heritage Trust',
      onboardingStatus: 'PENDING_ONBOARDING',
      submittedAt: new Date().toISOString().replace('T', ' ').substring(0, 16) + ' UTC (Just now)',
      onboardingNotes: clientData.notes || 'Awaiting initial compliance sign-off & draw permissions.',
      requestedClearance: 'TIER_4_CLIENT',
      assignedProjectIds: clientData.assignedProjectId ? [clientData.assignedProjectId] : [],
      status: 'PENDING_2FA',
      twoFactorStatus: 'PENDING_ENROLLMENT',
      twoFactorEnforced: true,
      securityTier: 'TIER_4_CLIENT',
      permissions: ['VIEW_FINANCIALS'],
      lastLoginAt: 'Never',
      backupCodesRemaining: 8
    };

    setUsers(prev => [...prev, newPendingUser]);
    addToast('info', `Pending client "${newPendingUser.name}" added to onboarding review queue.`);
    logAuditAction(
      'CLIENT_REGISTRATION_SUBMITTED',
      'CLIENT_GOVERNANCE',
      'SUCCESS',
      `Client registration received for ${newPendingUser.email} (${newPendingUser.company})`,
      { resourceType: 'USER', resourceId: newId }
    );
    return newPendingUser;
  };

  const switchRole = (role: UserRole) => {
    const matched = users.find(u => u.role === role) || users[0];
    setCurrentUser(matched);
    addToast('info', `Switched active profile to ${matched.name} (${role})`);
    logAuditAction('SWITCH_ROLE', 'AUTH_SESSION', 'SUCCESS', `Switched role context to ${role} (${matched.email})`);
  };

  const selectedProject = projects.find(p => p.id === selectedProjectId) || null;

  const openProjectDrawer = (projectId: string, tab = 'overview') => {
    setSelectedProjectId(projectId);
    setActiveDrawerTab(tab);
  };

  const closeProjectDrawer = () => {
    setSelectedProjectId(null);
  };

  // Projects CRUD
  const addProject = (projectData: Omit<Project, 'id' | 'createdAt' | 'code' | 'spent' | 'team'>): Project => {
    const newId = 'p' + (projects.length + 1);
    const newCode = `VTX-2026-${String(projects.length + 1).padStart(3, '0')}`;
    const newProj: Project = {
      ...projectData,
      id: newId,
      code: newCode,
      spent: 0,
      team: [
        {
          memberId: currentUser.id,
          memberName: currentUser.name,
          memberAvatar: currentUser.avatar,
          role: currentUser.role === 'ADMIN' ? 'Principal Architect' : 'Lead Manager',
          allocationPercentage: 50
        }
      ],
      createdAt: new Date().toISOString()
    };

    setProjects(prev => [newProj, ...prev]);
    
    // Create corresponding chat channel
    const newChannel: ChatChannel = {
      id: `c-${newId}`,
      name: newProj.name,
      type: 'PROJECT',
      projectId: newId,
      unreadCount: 0,
      lastMessagePreview: 'Project room created',
      lastMessageTime: 'Just now',
      members: [currentUser.name]
    };
    setChannels(prev => [...prev, newChannel]);
    setMessages(prev => ({
      ...prev,
      [newChannel.id]: [
        {
          id: 'm_' + Date.now(),
          channelId: newChannel.id,
          senderId: currentUser.id,
          senderName: currentUser.name,
          senderRole: currentUser.role,
          senderAvatar: currentUser.avatar,
          text: `Welcome to the collaboration channel for ${newProj.name}.`,
          timestamp: 'Just now'
        }
      ]
    }));

    addToast('success', `Project "${newProj.name}" created successfully`);
    logAuditAction('CREATE_PROJECT', 'CORE_SYSTEM', 'SUCCESS', `Created project ${newCode}: ${newProj.name}`);
    return newProj;
  };

  const updateProject = (id: string, updates: Partial<Project>) => {
    setProjects(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
    addToast('success', 'Project details updated');
    logAuditAction('UPDATE_PROJECT', 'CORE_SYSTEM', 'SUCCESS', `Updated project properties for ${id}`);
  };

  const deleteProject = (id: string) => {
    const proj = projects.find(p => p.id === id);
    setProjects(prev => prev.filter(p => p.id !== id));
    if (selectedProjectId === id) setSelectedProjectId(null);
    addToast('info', `Project ${proj?.name || id} removed`);
    logAuditAction('DELETE_PROJECT', 'CORE_SYSTEM', 'SUCCESS', `Deleted project ${id}`);
  };

  // Milestones CRUD
  const addMilestone = (milestoneData: Omit<Milestone, 'id'>) => {
    const newMilestone: Milestone = {
      ...milestoneData,
      id: 'm' + (milestones.length + 1)
    };
    setMilestones(prev => [...prev, newMilestone]);
    addToast('success', `Milestone "${newMilestone.name}" added`);
    logAuditAction('ADD_MILESTONE', 'PROJECT_TIMELINE', 'SUCCESS', `Added milestone ${newMilestone.name}`);
  };

  const updateMilestone = (id: string, updates: Partial<Milestone>) => {
    setMilestones(prev => prev.map(m => m.id === id ? { ...m, ...updates } : m));
    addToast('info', 'Milestone updated');
    logAuditAction('UPDATE_MILESTONE', 'PROJECT_TIMELINE', 'SUCCESS', `Updated milestone ${id}`);
  };

  const deleteMilestone = (id: string) => {
    setMilestones(prev => prev.filter(m => m.id !== id));
    addToast('info', 'Milestone removed');
    logAuditAction('DELETE_MILESTONE', 'PROJECT_TIMELINE', 'SUCCESS', `Removed milestone ${id}`);
  };

  // Tasks CRUD
  const addTask = (taskData: Omit<Task, 'id' | 'comments' | 'attachments'>) => {
    const newTask: Task = {
      ...taskData,
      id: 't' + (tasks.length + 1),
      comments: [],
      attachments: []
    };
    setTasks(prev => [newTask, ...prev]);
    addToast('success', `Task "${newTask.title}" assigned`);
    logAuditAction('CREATE_TASK', 'PROJECT_MANAGEMENT', 'SUCCESS', `Added task ${newTask.title}`);
  };

  const updateTask = (id: string, updates: Partial<Task>) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
    logAuditAction('UPDATE_TASK', 'PROJECT_MANAGEMENT', 'SUCCESS', `Updated task ${id}`);
  };

  const deleteTask = (id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
    addToast('info', 'Task deleted');
    logAuditAction('DELETE_TASK', 'PROJECT_MANAGEMENT', 'SUCCESS', `Deleted task ${id}`);
  };

  const addTaskComment = (taskId: string, text: string) => {
    const newComment = {
      id: 'c_' + Date.now(),
      authorName: currentUser.name,
      authorAvatar: currentUser.avatar,
      text,
      createdAt: new Date().toISOString()
    };
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, comments: [...t.comments, newComment] } : t));
    addToast('success', 'Comment posted');
  };

  const addTaskProgressImage = (
    taskId: string,
    imageData: {
      imageUrl: string;
      thumbnailUrl?: string;
      caption: string;
      stageName?: string;
      progressPercent?: number;
      locationTag?: string;
      cameraMetadata?: { device?: string; timestamp?: string; gpsCoords?: string };
      tags?: string[];
    }
  ): TaskProgressImage => {
    const newImgId = 'img_' + taskId + '_' + Date.now();
    const task = tasks.find(t => t.id === taskId);
    const newImage: TaskProgressImage = {
      id: newImgId,
      taskId,
      projectId: task?.projectId || selectedProjectId || 'p1',
      imageUrl: imageData.imageUrl,
      thumbnailUrl: imageData.thumbnailUrl || imageData.imageUrl,
      caption: imageData.caption || 'Site progress inspection snapshot',
      stageName: imageData.stageName || task?.stage || 'Field Verification',
      progressPercent: imageData.progressPercent ?? task?.progressPercent ?? 50,
      locationTag: imageData.locationTag || 'Site Location B1',
      uploadedBy: {
        id: currentUser.id,
        name: currentUser.name,
        role: currentUser.role,
        avatar: currentUser.avatar,
        company: currentUser.company
      },
      uploadedAt: new Date().toISOString().replace('T', ' ').slice(0, 19) + ' UTC',
      cameraMetadata: imageData.cameraMetadata || {
        device: 'Leica BLK360 / Mobile Site Scanner',
        timestamp: new Date().toISOString(),
        gpsCoords: '34.0736° N, 118.4004° W'
      },
      validationStatus: 'PENDING_CLIENT_VALIDATION',
      tags: imageData.tags || ['Site Progress', currentUser.role]
    };

    setTasks(prev =>
      prev.map(t => {
        if (t.id === taskId) {
          const currentImages = t.progressImages || [];
          const updatedProg = imageData.progressPercent !== undefined ? imageData.progressPercent : t.progressPercent;
          const updatedStatus = t.status === 'TODO' ? 'IN_PROGRESS' : t.status;
          return {
            ...t,
            progressImages: [newImage, ...currentImages],
            progressPercent: updatedProg,
            status: updatedStatus
          };
        }
        return t;
      })
    );

    addToast('success', `Progress photo uploaded by ${currentUser.name} (${currentUser.role.replace('_', ' ')})`);
    logAuditAction(
      'SITE_PROGRESS_PHOTO_UPLOAD',
      'ENGINEERING_LOGS',
      'SUCCESS',
      `Uploaded progress photo for task "${task?.title || taskId}" (${currentUser.role})`,
      { resourceType: 'TASK_IMAGE', resourceId: newImgId, payload: { caption: imageData.caption, location: imageData.locationTag } }
    );
    return newImage;
  };

  const validateTaskProgressImage = (
    taskId: string,
    imageId: string,
    validation: {
      status: 'CLIENT_VALIDATED' | 'REQUIRES_REVISION';
      feedback?: string;
      rating?: number;
    }
  ) => {
    const sealCode = `VTX-SEAL-${Math.floor(1000 + Math.random() * 9000)}-${currentUser.name.slice(0, 3).toUpperCase()}`;
    const isValidated = validation.status === 'CLIENT_VALIDATED';

    setTasks(prev =>
      prev.map(t => {
        if (t.id === taskId) {
          const images = (t.progressImages || []).map(img => {
            if (img.id === imageId) {
              return {
                ...img,
                validationStatus: validation.status,
                clientValidation: {
                  validatedBy: currentUser.name,
                  validatedById: currentUser.id,
                  validatedAt: new Date().toISOString().replace('T', ' ').slice(0, 19) + ' UTC',
                  signatureVerificationCode: sealCode,
                  feedback: validation.feedback || (isValidated ? 'Client verified and accepted site work.' : 'Revision requested on site work.'),
                  rating: validation.rating ?? (isValidated ? 5 : 3)
                }
              };
            }
            return img;
          });
          return { ...t, progressImages: images };
        }
        return t;
      })
    );

    if (isValidated) {
      addToast('success', `Progress photo verified & stamped with digital seal [${sealCode}] ✨`);
    } else {
      addToast('info', 'Clarification/Revision requested on site progress image.');
    }

    logAuditAction(
      isValidated ? 'CLIENT_PROGRESS_VALIDATION' : 'CLIENT_REVISION_REQUEST',
      'CLIENT_GOVERNANCE',
      'SUCCESS',
      `${isValidated ? 'Approved' : 'Requested revision on'} progress image ${imageId} for task ${taskId} (Seal: ${sealCode})`,
      { resourceType: 'TASK_IMAGE_VALIDATION', resourceId: imageId, payload: { sealCode, feedback: validation.feedback } }
    );
  };

  const deleteTaskProgressImage = (taskId: string, imageId: string) => {
    setTasks(prev =>
      prev.map(t => {
        if (t.id === taskId) {
          return {
            ...t,
            progressImages: (t.progressImages || []).filter(img => img.id !== imageId)
          };
        }
        return t;
      })
    );
    addToast('info', 'Progress image removed');
    logAuditAction('DELETE_TASK_IMAGE', 'ENGINEERING_LOGS', 'SUCCESS', `Deleted progress image ${imageId} from task ${taskId}`);
  };

  const assignTask = (taskId: string, memberId: string) => {
    const member = teamMembers.find(m => m.id === memberId) || users.find(u => u.id === memberId);
    if (!member) return;

    setTasks(prev =>
      prev.map(t => {
        if (t.id === taskId) {
          return {
            ...t,
            assignedToId: member.id,
            assignedToName: member.name,
            assignedToAvatar: member.avatar,
            assignedRole: member.role
          };
        }
        return t;
      })
    );

    addToast('success', `Task assigned to ${member.name} (${member.role.replace('_', ' ')})`);
    logAuditAction('ASSIGN_TASK', 'PROJECT_MANAGEMENT', 'SUCCESS', `Assigned task ${taskId} to ${member.name}`);
  };

  // Financials CRUD
  const addBudgetLine = (line: Omit<BudgetLine, 'id'>) => {
    const newLine: BudgetLine = { ...line, id: 'bl' + (budgetLines.length + 1) };
    setBudgetLines(prev => [...prev, newLine]);
    addToast('success', `Budget line "${newLine.itemName}" added`);
  };

  const updateBudgetLine = (id: string, updates: Partial<BudgetLine>) => {
    setBudgetLines(prev => prev.map(b => b.id === id ? { ...b, ...updates } : b));
  };

  const deleteBudgetLine = (id: string) => {
    setBudgetLines(prev => prev.filter(b => b.id !== id));
  };

  const addExpense = (expenseData: Omit<Expense, 'id'>) => {
    const newExp: Expense = { ...expenseData, id: 'exp' + (expenses.length + 1) };
    setExpenses(prev => [newExp, ...prev]);

    // Update project spent
    setProjects(prev => prev.map(p => {
      if (p.id === newExp.projectId) {
        return { ...p, spent: p.spent + newExp.amount };
      }
      return p;
    }));

    addToast('success', `Expense of $${newExp.amount.toLocaleString()} recorded`);
    logAuditAction('RECORD_EXPENSE', 'FINANCIALS', 'SUCCESS', `Recorded expense ${newExp.description} ($${newExp.amount})`);
  };

  const updateExpenseStatus = (id: string, status: 'APPROVED' | 'REJECTED') => {
    setExpenses(prev => prev.map(e => e.id === id ? { ...e, status, approvedBy: currentUser.name } : e));
    addToast('info', `Expense marked as ${status}`);
    logAuditAction('APPROVE_EXPENSE', 'FINANCIALS', 'SUCCESS', `Expense ${id} set to ${status}`);
  };

  const addInvoice = (invoiceData: Omit<Invoice, 'id' | 'invoiceNumber'>) => {
    const newNum = `INV-2026-${String(invoices.length + 500).padStart(4, '0')}`;
    const newInv: Invoice = {
      ...invoiceData,
      id: 'inv' + (invoices.length + 1),
      invoiceNumber: newNum
    };
    setInvoices(prev => [newInv, ...prev]);
    addToast('success', `Invoice ${newNum} generated`);
    logAuditAction('GENERATE_INVOICE', 'INVOICING', 'SUCCESS', `Created invoice ${newNum} for $${newInv.total}`);
  };

  const updateInvoiceStatus = (id: string, status: Invoice['status']) => {
    setInvoices(prev => prev.map(inv => inv.id === id ? { ...inv, status } : inv));
    addToast('info', `Invoice status set to ${status}`);
  };

  const recordPayment = (paymentData: Omit<Payment, 'id'>) => {
    const newPay: Payment = {
      ...paymentData,
      id: 'pay' + (payments.length + 1)
    };
    setPayments(prev => [newPay, ...prev]);
    setInvoices(prev => prev.map(inv => inv.id === paymentData.invoiceId ? { ...inv, status: 'PAID' } : inv));
    addToast('success', `Payment of $${newPay.amount.toLocaleString()} confirmed`);
    logAuditAction('RECORD_PAYMENT', 'FINANCIAL_GOVERNANCE', 'SUCCESS', `Settled invoice ${newPay.invoiceNumber} with $${newPay.amount}`);
  };

  // POS & Payment Terminal
  const processPOSTransaction = (
    transactionData: Omit<POSTransaction, 'id' | 'transactionNumber' | 'timestamp' | 'receiptHash'>
  ): POSTransaction => {
    const nextNum = `POS-2026-${String(posTransactions.length + 8843).padStart(4, '0')}`;
    const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);
    const hash = '0x' + Array.from({ length: 32 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
    
    const newTx: POSTransaction = {
      ...transactionData,
      id: 'pos_' + Date.now(),
      transactionNumber: nextNum,
      timestamp,
      receiptHash: hash
    };

    setPosTransactions(prev => [newTx, ...prev]);

    // Also record a payment receipt if linked to a project
    const newPayment: Payment = {
      id: 'pay_pos_' + Date.now(),
      invoiceId: 'pos_direct',
      invoiceNumber: newTx.transactionNumber,
      projectId: newTx.projectId,
      projectName: newTx.projectName,
      clientId: newTx.clientId,
      clientName: newTx.clientName,
      amount: newTx.total,
      paymentDate: timestamp.split(' ')[0],
      paymentMethod: newTx.paymentMethod === 'CARD_CHIP' || newTx.paymentMethod === 'CARD_TAP' || newTx.paymentMethod === 'CARD_ON_FILE' 
        ? 'CREDIT_CARD' 
        : newTx.paymentMethod === 'WIRE_ESCROW' 
        ? 'WIRE_TRANSFER' 
        : 'ACH_TRANSFER',
      referenceNumber: newTx.authCode,
      notes: `POS Direct Settlement (${newTx.paymentMethod})`
    };
    setPayments(prev => [newPayment, ...prev]);

    addToast('success', `POS Settlement ${nextNum} authorized for $${newTx.total.toLocaleString()}`);
    logAuditAction(
      'POS_TRANSACTION_PROCESSED',
      'POINT_OF_SALE',
      'SUCCESS',
      `Processed ${newTx.paymentMethod} payment ${nextNum} ($${newTx.total}) at terminal ${newTx.terminalId}`,
      { resourceType: 'POS_TRANSACTION', resourceId: newTx.id, payload: { authCode: newTx.authCode, total: newTx.total } }
    );

    return newTx;
  };

  // Architectural Service & Procurement Catalog
  const addCatalogItem = (itemData: Omit<CatalogItem, 'id' | 'createdAt'>): CatalogItem => {
    const nextSku = itemData.sku && itemData.sku.trim()
      ? itemData.sku.trim().toUpperCase()
      : `CAT-${itemData.category.substring(0, 3).toUpperCase()}-${String(catalogItems.length + 1).padStart(2, '0')}`;
    
    const newItem: CatalogItem = {
      ...itemData,
      id: 'cat_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      sku: nextSku,
      createdAt: new Date().toISOString().split('T')[0],
      isCustom: true,
      createdBy: currentUser.name
    };

    setCatalogItems(prev => [newItem, ...prev]);
    addToast('success', `Added "${newItem.title}" to Architectural Catalog`);
    logAuditAction(
      'CREATE_CATALOG_ITEM',
      'PROCUREMENT_CATALOG',
      'SUCCESS',
      `Added service item "${newItem.title}" (${newItem.sku}) at $${newItem.price.toLocaleString()}`
    );
    return newItem;
  };

  const updateCatalogItem = (id: string, updates: Partial<CatalogItem>) => {
    setCatalogItems(prev =>
      prev.map(item => (item.id === id ? { ...item, ...updates } : item))
    );
    addToast('info', 'Catalog item specifications updated');
    logAuditAction('UPDATE_CATALOG_ITEM', 'PROCUREMENT_CATALOG', 'SUCCESS', `Updated catalog item ${id}`);
  };

  const deleteCatalogItem = (id: string) => {
    const target = catalogItems.find(i => i.id === id);
    setCatalogItems(prev => prev.filter(item => item.id !== id));
    addToast('info', `Removed "${target?.title || 'item'}" from catalog`);
    logAuditAction('DELETE_CATALOG_ITEM', 'PROCUREMENT_CATALOG', 'SUCCESS', `Deleted catalog item ${id}`);
  };

  const applyCatalogItemToBudget = (
    catalogItemId: string,
    projectId: string,
    options?: { customPrice?: number; customQuantity?: number; notes?: string }
  ): BudgetLine | undefined => {
    const item = catalogItems.find(c => c.id === catalogItemId);
    if (!item) {
      addToast('error', 'Catalog item not found');
      return undefined;
    }

    const qty = options?.customQuantity && options.customQuantity > 0 ? options.customQuantity : 1;
    const est = options?.customPrice !== undefined ? options.customPrice : item.price * qty;

    const newLine: BudgetLine = {
      id: 'bl_' + Date.now() + '_' + Math.random().toString(36).substring(2, 5),
      projectId,
      category: item.category,
      itemName: `${item.title} [${item.sku}]`,
      estimated: est,
      actual: 0,
      variance: -est,
      notes: options?.notes || `Directly allocated from Architectural Service & Procurement Catalog (${item.unit || 'Standard'}). Lead time: ${item.leadTime || 'Standard'}.`
    };

    setBudgetLines(prev => [...prev, newLine]);
    addToast('success', `Allocated "${item.title}" to project budget ($${est.toLocaleString()})`);
    logAuditAction(
      'ALLOCATE_CATALOG_TO_BUDGET',
      'FINANCIALS',
      'SUCCESS',
      `Allocated catalog item ${item.title} ($${est}) to project ${projectId}`
    );
    return newLine;
  };

  // Legal Documents & Digital Signature Vault
  const uploadLegalDocument = (
    docData: Omit<LegalDocument, 'id' | 'documentNumber' | 'createdAt' | 'status' | 'version'> & { version?: string }
  ): LegalDocument => {
    const nextDocNum = `DOC-${docData.category.substring(0, 3)}-2026-${String(legalDocuments.length + 15).padStart(2, '0')}`;
    const newDoc: LegalDocument = {
      ...docData,
      id: 'doc_' + Date.now(),
      documentNumber: nextDocNum,
      status: 'PENDING_SIGNATURE',
      version: docData.version || 'v1.0 Stamped',
      createdAt: new Date().toISOString().split('T')[0]
    };

    setLegalDocuments(prev => [newDoc, ...prev]);
    addToast('success', `Legal paperwork "${newDoc.title}" registered in vault`);
    logAuditAction(
      'UPLOAD_LEGAL_DOCUMENT',
      'LEGAL_VAULT',
      'SUCCESS',
      `Uploaded and cataloged legal agreement ${newDoc.documentNumber} (${newDoc.title})`,
      { resourceType: 'LEGAL_DOCUMENT', resourceId: newDoc.id }
    );

    return newDoc;
  };

  const signLegalDocument = (
    documentId: string,
    signerData: { signerName: string; signerRole: string; signatureDataUrl?: string; ipAddress?: string }
  ) => {
    const nowIso = new Date().toISOString().replace('T', ' ').substring(0, 19) + ' UTC';
    const cryptoHash = 'SHA256:' + Array.from({ length: 32 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
    const certId = `CERT-VTX-${Date.now().toString(36).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;

    setLegalDocuments(prev => prev.map(doc => {
      if (doc.id === documentId) {
        const updatedSigners = doc.signers.map(s => {
          if (s.name.toLowerCase() === signerData.signerName.toLowerCase() || s.email.toLowerCase() === currentUser.email.toLowerCase()) {
            return {
              ...s,
              hasSigned: true,
              signedAt: nowIso,
              signatureDataUrl: signerData.signatureDataUrl,
              cryptoHash,
              ipAddress: signerData.ipAddress || '192.168.1.101'
            };
          }
          return s;
        });

        const allSigned = updatedSigners.every(s => s.hasSigned);

        return {
          ...doc,
          status: allSigned ? 'SIGNED_SEALED' : 'PENDING_SIGNATURE',
          signers: updatedSigners,
          signatureCertificate: {
            signedByName: signerData.signerName,
            signedByRole: signerData.signerRole,
            signedAt: nowIso,
            signatureDataUrl: signerData.signatureDataUrl,
            cryptoHash,
            ipAddress: signerData.ipAddress || '192.168.1.101',
            certificateId: certId
          }
        };
      }
      return doc;
    }));

    addToast('success', `Cryptographic Digital Signature & Seal applied successfully!`);
    logAuditAction(
      'SIGN_LEGAL_DOCUMENT',
      'DIGITAL_SIGNATURE',
      'SUCCESS',
      `Applied SHA-256 e-signature seal (${certId}) to document ${documentId} by ${signerData.signerName}`,
      { resourceType: 'LEGAL_DOCUMENT', resourceId: documentId, payload: { cryptoHash, certId } }
    );
  };

  const updateLegalDocumentStatus = (documentId: string, status: LegalDocumentStatus) => {
    setLegalDocuments(prev => prev.map(d => d.id === documentId ? { ...d, status } : d));
    addToast('info', `Document status updated to ${status}`);
    logAuditAction('UPDATE_DOCUMENT_STATUS', 'LEGAL_VAULT', 'SUCCESS', `Set document ${documentId} to ${status}`);
  };

  // Change Orders
  const addChangeOrder = (coData: Omit<ChangeOrder, 'id' | 'status' | 'date'>) => {
    const newCO: ChangeOrder = {
      ...coData,
      id: 'co' + (changeOrders.length + 1),
      status: 'PENDING',
      date: new Date().toISOString().split('T')[0]
    };
    setChangeOrders(prev => [newCO, ...prev]);
    addToast('success', 'Change order submitted for review');
    logAuditAction('SUBMIT_CHANGE_ORDER', 'GOVERNANCE', 'SUCCESS', `Submitted CO ${newCO.title}`);
  };

  const updateChangeOrderStatus = (id: string, status: 'APPROVED' | 'REJECTED', notes?: string) => {
    setChangeOrders(prev => prev.map(co => {
      if (co.id === id) {
        if (status === 'APPROVED') {
          // Adjust project budget if approved
          setProjects(pList => pList.map(proj => proj.id === co.projectId ? { ...proj, budget: proj.budget + co.budgetImpact } : proj));
        }
        return {
          ...co,
          status,
          reviewedBy: currentUser.name,
          reviewNotes: notes || (status === 'APPROVED' ? 'Approved in formal project review.' : 'Declined per client instruction.')
        };
      }
      return co;
    }));
    addToast('info', `Change order marked as ${status}`);
    logAuditAction('REVIEW_CHANGE_ORDER', 'GOVERNANCE', 'SUCCESS', `Set CO ${id} to ${status}`);
  };

  // Team & Clients
  const addTeamMember = (memberData: Omit<TeamMember, 'id' | 'activeProjectsCount'>) => {
    const newMember: TeamMember = {
      ...memberData,
      id: 'u_' + Date.now(),
      activeProjectsCount: 0
    };
    setTeamMembers(prev => [...prev, newMember]);
    addToast('success', `Team member ${newMember.name} onboarded`);
    logAuditAction('ADD_TEAM_MEMBER', 'DIRECTORY', 'SUCCESS', `Added ${newMember.name} (${newMember.role})`);
  };

  const updateTeamMember = (id: string, updates: Partial<TeamMember>) => {
    setTeamMembers(prev => prev.map(m => m.id === id ? { ...m, ...updates } : m));
    addToast('info', 'Team member updated');
  };

  const addClient = (clientData: Omit<Client, 'id' | 'activeProjectsCount'>) => {
    const newClient: Client = {
      ...clientData,
      id: 'c_' + Date.now(),
      activeProjectsCount: 0
    };
    setClients(prev => [...prev, newClient]);
    addToast('success', `Client account created for ${newClient.name}`);
    logAuditAction('CREATE_CLIENT', 'PORTAL', 'SUCCESS', `Created client ${newClient.name}`);
  };

  const assignTeamMemberToProject = (projectId: string, memberId: string, role: string, allocationPercentage = 50) => {
    const member = teamMembers.find(m => m.id === memberId) || users.find(u => u.id === memberId);
    if (!member) return;

    setProjects(prev => prev.map(proj => {
      if (proj.id === projectId) {
        const existing = proj.team.find(t => t.memberId === memberId);
        if (existing) {
          return {
            ...proj,
            team: proj.team.map(t => t.memberId === memberId ? { ...t, role, allocationPercentage } : t)
          };
        }
        return {
          ...proj,
          team: [...proj.team, {
            memberId: member.id,
            memberName: member.name,
            memberAvatar: member.avatar,
            role,
            allocationPercentage
          }]
        };
      }
      return proj;
    }));

    setTeamMembers(prev => prev.map(m => m.id === memberId ? { ...m, activeProjectsCount: m.activeProjectsCount + 1 } : m));
    addToast('success', `Assigned ${member.name} as ${role}`);
    logAuditAction('ASSIGN_TEAM', 'CORE_SYSTEM', 'SUCCESS', `Assigned ${member.name} to project ${projectId}`);
  };

  const removeTeamMemberFromProject = (projectId: string, memberId: string) => {
    setProjects(prev => prev.map(proj => proj.id === projectId ? {
      ...proj,
      team: proj.team.filter(t => t.memberId !== memberId)
    } : proj));
    addToast('info', 'Team allocation updated');
  };

  // Companies & Trade Partner Management ("caranies")
  const addCompany = (companyData: Omit<Company, 'id' | 'createdAt'>): Company => {
    const compId = 'comp_' + Date.now();
    const nowIso = new Date().toISOString();
    const newComp: Company = {
      ...companyData,
      id: compId,
      createdAt: nowIso.split('T')[0]
    };

    // If an NDA is signed / uploaded during onboarding
    if (newComp.ndaStatus === 'SIGNED' && (newComp.ndaDocumentUrl || newComp.ndaFileName)) {
      const docId = newComp.ndaDocumentId || `doc_nda_${Date.now()}`;
      newComp.ndaDocumentId = docId;
      if (!newComp.ndaSignedAt) newComp.ndaSignedAt = nowIso;
      if (!newComp.ndaCryptoHash) {
        newComp.ndaCryptoHash = 'SHA256:' + Array.from({ length: 32 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
      }

      const ndaLegalDoc: LegalDocument = {
        id: docId,
        documentNumber: `NDA-${(newComp.name || 'COMP').replace(/[^a-zA-Z0-9]/g, '').substring(0, 6).toUpperCase()}-2026-${String(Math.floor(100 + Math.random() * 900))}`,
        title: `Mutual Non-Disclosure Agreement - ${newComp.name}`,
        category: 'NDA',
        companyId: newComp.id,
        companyName: newComp.name,
        projectId: (newComp.assignedProjectIds && newComp.assignedProjectIds[0]) || 'p1',
        projectName: 'Master Corporate Covenant',
        clientId: 'u1',
        clientName: 'VERTEX Architecture Studio Inc.',
        effectiveDate: newComp.ndaSignedAt.split('T')[0],
        status: 'SIGNED_SEALED',
        version: 'v1.0 Executed Vault Copy',
        content: `Executed Mutual Non-Disclosure and Proprietary Intellectual Property Agreement for ${newComp.legalName || newComp.name}. All technical specifications, BIM models, and architectural drawings are strictly confidential under California Corporation State Bar ID #VTX-99481.`,
        uploadedFileUrl: newComp.ndaDocumentUrl,
        fileName: newComp.ndaFileName || `VERTEX_Executed_NDA_${newComp.name.replace(/\s+/g, '_')}.pdf`,
        fileSize: newComp.ndaFileSize || '185 KB',
        cryptoHash: newComp.ndaCryptoHash,
        signers: [
          {
            id: 's_' + Date.now(),
            name: newComp.ndaSignerName || newComp.primaryContactName || 'Authorized Officer',
            email: newComp.primaryContactEmail || newComp.email,
            role: `${newComp.name} Officer`,
            hasSigned: true,
            signedAt: newComp.ndaSignedAt,
            cryptoHash: newComp.ndaCryptoHash,
            ipAddress: '192.168.1.104'
          },
          {
            id: 's_admin',
            name: 'Alexander Wright, AIA',
            email: 'admin@vertex.com',
            role: 'Principal Architect & Managing Partner',
            hasSigned: true,
            signedAt: newComp.ndaSignedAt,
            cryptoHash: newComp.ndaCryptoHash,
            ipAddress: '10.0.4.1'
          }
        ],
        signatureCertificate: {
          signedByName: newComp.ndaSignerName || newComp.primaryContactName || 'Authorized Officer',
          signedByRole: 'Corporate Representative',
          signedAt: newComp.ndaSignedAt,
          cryptoHash: newComp.ndaCryptoHash,
          ipAddress: '192.168.1.104',
          certificateId: `CERT-NDA-${Date.now().toString(36).toUpperCase()}`
        },
        createdAt: newComp.ndaSignedAt.split('T')[0]
      };

      setLegalDocuments(prev => [ndaLegalDoc, ...prev]);
    }

    setCompanies(prev => [newComp, ...prev]);
    addToast('success', `Company "${newComp.name}" onboarded into registry`);

    // Server-side DB sync
    fetch('/api/companies', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newComp)
    }).catch(err => console.warn('Could not sync company to server DB:', err));

    logAuditAction(
      'REGISTER_COMPANY',
      'CORPORATE_GOVERNANCE',
      'SUCCESS',
      `Registered new ${newComp.type} entity: ${newComp.name} (${newComp.registrationNumber || 'No EIN'})${newComp.ndaStatus === 'SIGNED' ? ' [NDA Uploaded & Catalogs in Legal DB Vault]' : ''}`,
      { resourceType: 'COMPANY', resourceId: newComp.id, payload: { name: newComp.name, type: newComp.type, ndaStatus: newComp.ndaStatus } }
    );
    return newComp;
  };

  const updateCompany = (id: string, updates: Partial<Company>) => {
    setCompanies(prev => prev.map(c => {
      if (c.id === id) {
        const updated = { ...c, ...updates };
        if (updated.ndaStatus === 'SIGNED' && updated.ndaDocumentUrl) {
          const docId = updated.ndaDocumentId || `doc_nda_${Date.now()}`;
          updated.ndaDocumentId = docId;
          const nowIso = new Date().toISOString();
          if (!updated.ndaSignedAt) updated.ndaSignedAt = nowIso;
          if (!updated.ndaCryptoHash) {
            updated.ndaCryptoHash = 'SHA256:' + Array.from({ length: 32 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
          }

          setLegalDocuments(docs => {
            const existingIdx = docs.findIndex(d => d.id === docId || (d.companyId === id && d.category === 'NDA'));
            const signedAtDate = updated.ndaSignedAt || new Date().toISOString();
            const digestHash = updated.ndaCryptoHash || ('SHA256:' + Array.from({ length: 32 }, () => Math.floor(Math.random() * 16).toString(16)).join(''));
            const ndaDocRecord: LegalDocument = {
              id: docId,
              documentNumber: `NDA-${(updated.name || 'COMP').replace(/[^a-zA-Z0-9]/g, '').substring(0, 6).toUpperCase()}-2026-${String(Math.floor(100 + Math.random() * 900))}`,
              title: `Mutual Non-Disclosure Agreement - ${updated.name}`,
              category: 'NDA',
              companyId: updated.id,
              companyName: updated.name,
              projectId: (updated.assignedProjectIds && updated.assignedProjectIds[0]) || 'p1',
              projectName: 'Master Corporate Covenant',
              clientId: 'u1',
              clientName: 'VERTEX Architecture Studio Inc.',
              effectiveDate: signedAtDate.split('T')[0],
              status: 'SIGNED_SEALED',
              version: 'v1.0 Executed Vault Copy',
              content: `Mutual Non-Disclosure and Confidentiality Covenant executed with ${updated.legalName || updated.name}.`,
              uploadedFileUrl: updated.ndaDocumentUrl,
              fileName: updated.ndaFileName || `VERTEX_Executed_NDA_${updated.name.replace(/\s+/g, '_')}.pdf`,
              fileSize: updated.ndaFileSize || '185 KB',
              cryptoHash: digestHash,
              signers: [
                {
                  id: 's_' + Date.now(),
                  name: updated.ndaSignerName || updated.primaryContactName || 'Authorized Officer',
                  email: updated.primaryContactEmail || updated.email,
                  role: `${updated.name} Officer`,
                  hasSigned: true,
                  signedAt: signedAtDate,
                  cryptoHash: digestHash,
                  ipAddress: '192.168.1.104'
                }
              ],
              signatureCertificate: {
                signedByName: updated.ndaSignerName || updated.primaryContactName || 'Authorized Officer',
                signedByRole: 'Corporate Representative',
                signedAt: signedAtDate,
                cryptoHash: digestHash,
                ipAddress: '192.168.1.104',
                certificateId: `CERT-NDA-${Date.now().toString(36).toUpperCase()}`
              },
              createdAt: signedAtDate.split('T')[0]
            };

            if (existingIdx >= 0) {
              const copy = [...docs];
              copy[existingIdx] = { ...copy[existingIdx], ...ndaDocRecord };
              return copy;
            }
            return [ndaDocRecord, ...docs];
          });
        }
        return updated;
      }
      return c;
    }));

    // Server-side DB update
    fetch(`/api/companies/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    }).catch(err => console.warn('Could not update company on server DB:', err));

    addToast('info', 'Company record updated in database');
    logAuditAction('UPDATE_COMPANY', 'CORPORATE_GOVERNANCE', 'SUCCESS', `Modified company credentials/status for entity ${id}`);
  };

  const uploadContractorNDA = async (
    companyId: string,
    fileData: { fileName: string; fileDataUrl: string; fileSize?: string; signerName?: string }
  ): Promise<LegalDocument> => {
    const comp = companies.find(c => c.id === companyId);
    const nowIso = new Date().toISOString();
    const cryptoHash = 'SHA256:' + Array.from({ length: 32 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
    const docId = `doc_nda_${Date.now()}`;

    const newDoc: LegalDocument = {
      id: docId,
      documentNumber: `NDA-${(comp?.name || 'CONTRACTOR').replace(/[^a-zA-Z0-9]/g, '').substring(0, 6).toUpperCase()}-2026-${String(Math.floor(100 + Math.random() * 900))}`,
      title: `Mutual Non-Disclosure Agreement - ${comp?.name || 'Contractor'}`,
      category: 'NDA',
      companyId: companyId,
      companyName: comp?.name || 'Contractor Partner',
      projectId: (comp?.assignedProjectIds && comp.assignedProjectIds[0]) || 'p1',
      projectName: 'Master Corporate Covenant',
      clientId: 'u1',
      clientName: 'VERTEX Architecture Studio Inc.',
      effectiveDate: nowIso.split('T')[0],
      status: 'SIGNED_SEALED',
      version: 'v1.0 Executed Vault Copy',
      content: `Executed Mutual Non-Disclosure Agreement uploaded directly during contractor onboarding.`,
      uploadedFileUrl: fileData.fileDataUrl,
      fileName: fileData.fileName,
      fileSize: fileData.fileSize || '210 KB',
      cryptoHash,
      signers: [
        {
          id: 's_' + Date.now(),
          name: fileData.signerName || comp?.primaryContactName || 'Authorized Signatory',
          email: comp?.primaryContactEmail || comp?.email || 'contact@partner.com',
          role: `${comp?.name || 'Contractor'} Officer`,
          hasSigned: true,
          signedAt: nowIso,
          cryptoHash,
          ipAddress: '192.168.1.104'
        }
      ],
      signatureCertificate: {
        signedByName: fileData.signerName || comp?.primaryContactName || 'Authorized Signatory',
        signedByRole: 'Corporate Representative',
        signedAt: nowIso,
        cryptoHash,
        ipAddress: '192.168.1.104',
        certificateId: `CERT-NDA-${Date.now().toString(36).toUpperCase()}`
      },
      createdAt: nowIso.split('T')[0]
    };

    setLegalDocuments(prev => [newDoc, ...prev]);

    // Also update company record
    updateCompany(companyId, {
      ndaStatus: 'SIGNED',
      ndaDocumentId: docId,
      ndaDocumentUrl: fileData.fileDataUrl,
      ndaFileName: fileData.fileName,
      ndaFileSize: fileData.fileSize || '210 KB',
      ndaSignedAt: nowIso,
      ndaSignerName: fileData.signerName || comp?.primaryContactName || 'Authorized Signatory',
      ndaCryptoHash: cryptoHash
    });

    // Call server endpoint
    fetch('/api/upload-nda', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fileName: fileData.fileName,
        fileData: fileData.fileDataUrl,
        fileSize: fileData.fileSize,
        companyName: comp?.name,
        signerName: fileData.signerName,
        companyId
      })
    }).catch(err => console.warn('Could not post upload-nda to server:', err));

    addToast('success', `Signed NDA uploaded and recorded in database for ${comp?.name || 'contractor'}`);
    logAuditAction(
      'UPLOAD_CONTRACTOR_NDA',
      'LEGAL_VAULT',
      'SUCCESS',
      `Uploaded signed NDA for contractor ${comp?.name || companyId} (${fileData.fileName})`,
      { resourceType: 'LEGAL_DOCUMENT', resourceId: docId, payload: { companyId, fileName: fileData.fileName } }
    );

    return newDoc;
  };

  const deleteCompany = (id: string) => {
    const comp = companies.find(c => c.id === id);
    setCompanies(prev => prev.filter(c => c.id !== id));
    fetch(`/api/companies/${id}`, { method: 'DELETE' }).catch(err => console.warn('Could not delete company on server DB:', err));
    addToast('info', `Company ${comp?.name || id} decommissioned`);
    logAuditAction('DECOMMISSION_COMPANY', 'CORPORATE_GOVERNANCE', 'SUCCESS', `Decommissioned company ${comp?.name || id}`);
  };

  // IAM & 2FA Governance Flow
  const trigger2FAChallenge = (challenge: Omit<TwoFactorChallenge, 'onSuccess'> & { onSuccess: (code: string) => void }) => {
    setCurrent2FAChallenge({
      ...challenge,
      onSuccess: (code: string) => {
        setIs2FAChallengeOpen(false);
        challenge.onSuccess(code);
        addToast('success', 'Two-Factor biometric / OTP signature verified');
      }
    });
    setIs2FAChallengeOpen(true);
  };

  const grantUserAccess = (
    userData: Omit<User, 'id' | 'onboardedAt'> & { initialPassword?: string },
    verification2FACode: string
  ): TwoFactorEnrollmentPackage => {
    const newId = 'u_' + Date.now();
    const mfaSecretKey = `VTX-${(userData.name.split(' ')[0] || 'USER').toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}-SEC`;
    const backupCodes = Array.from({ length: 8 }, () => 
      Math.random().toString(36).substring(2, 6).toUpperCase() + '-' + Math.random().toString(36).substring(2, 6).toUpperCase()
    );

    const newUser: User = {
      ...userData,
      id: newId,
      status: 'ACTIVE',
      twoFactorStatus: 'ENROLLED',
      twoFactorEnforced: true,
      onboardingStatus: 'ONBOARDED',
      onboardedAt: new Date().toISOString().split('T')[0],
      lastLoginAt: 'Pending Initial Auth',
      mfaSecretKey,
      backupCodesRemaining: backupCodes.length
    };

    setUsers(prev => [...prev, newUser]);

    // Also register into TeamMember or Client directory depending on role
    if (newUser.role === 'CLIENT') {
      const clientEntry: Client = {
        id: newUser.id,
        name: newUser.name,
        company: newUser.company || 'Private Trust / Client',
        email: newUser.email,
        phone: newUser.phone || '+1 (555) 000-0000',
        address: '1000 Wilshire Blvd, Los Angeles, CA',
        activeProjectsCount: (newUser.assignedProjectIds || []).length,
        totalBilled: 0,
        status: 'ACTIVE',
        avatar: newUser.avatar,
        notes: `IAM provisioned client with MFA security clearance.`
      };
      setClients(prev => [...prev.filter(c => c.id !== clientEntry.id), clientEntry]);
    } else {
      const memberEntry: TeamMember = {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        avatar: newUser.avatar,
        specialization: newUser.specialization || `${newUser.role} Operations`,
        phone: newUser.phone || '+1 (555) 000-0000',
        activeProjectsCount: 0,
        status: 'ACTIVE',
        hourlyRate: newUser.role === 'ADMIN' ? 250 : newUser.role === 'PROJECT_MANAGER' ? 175 : newUser.role === 'DESIGNER' ? 140 : 120
      };
      setTeamMembers(prev => [...prev.filter(m => m.id !== memberEntry.id), memberEntry]);
    }

    const pkg: TwoFactorEnrollmentPackage = {
      userId: newUser.id,
      userName: newUser.name,
      userEmail: newUser.email,
      qrCodeUrl: `otpauth://totp/VERTEX%20Studio:${encodeURIComponent(newUser.email)}?secret=${mfaSecretKey}&issuer=VERTEX%20Studio%20Architecture`,
      secretKey: mfaSecretKey,
      backupCodes,
      generatedAt: new Date().toISOString().replace('T', ' ').substring(0, 19) + ' UTC',
      enforcedSecurityTier: newUser.securityTier || 'TIER_3_SPECIALIST'
    };

    setEnrollmentPackage(pkg);

    addToast('success', `User ${newUser.name} provisioned with cryptographic 2FA key`);
    logAuditAction(
      'IAM_USER_PROVISIONED',
      'IDENTITY_ACCESS_MANAGEMENT',
      'SUCCESS',
      `Granted ${newUser.role} access to ${newUser.email} with Tier [${newUser.securityTier}] verified by Admin 2FA (${verification2FACode})`,
      { resourceType: 'IAM_USER', resourceId: newUser.id, payload: { role: newUser.role, permissions: newUser.permissions } }
    );

    return pkg;
  };

  const updateUserRole = (userId: string, newRole: UserRole, permissions: IAMPermission[], verification2FACode?: string) => {
    setUsers(prev => prev.map(u => {
      if (u.id === userId) {
        return {
          ...u,
          role: newRole,
          permissions
        };
      }
      return u;
    }));

    // If current logged-in user modified
    if (currentUser.id === userId) {
      setCurrentUser(prev => ({ ...prev, role: newRole, permissions }));
    }

    addToast('success', `IAM Role & Permission grants upgraded for user`);
    logAuditAction(
      'UPDATE_USER_ROLE_PERMISSIONS',
      'IDENTITY_ACCESS_MANAGEMENT',
      'SUCCESS',
      `Re-assigned role ${newRole} with ${permissions.length} granular entitlements to user ${userId} [2FA Auth: ${verification2FACode || 'Admin session'}]`,
      { resourceType: 'IAM_USER', resourceId: userId, payload: { newRole, permissions } }
    );
  };

  const updateUserPermissions = (userId: string, permissions: IAMPermission[]) => {
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, permissions } : u));
    if (currentUser.id === userId) {
      setCurrentUser(prev => ({ ...prev, permissions }));
    }
    addToast('info', 'Permissions policy updated');
    logAuditAction('UPDATE_IAM_PERMISSIONS', 'IDENTITY_ACCESS_MANAGEMENT', 'SUCCESS', `Updated policy grants for user ${userId}`);
  };

  const toggleUserStatus = (userId: string, status: UserStatus) => {
    if (userId === currentUser.id && status === 'SUSPENDED') {
      addToast('error', 'Security Policy Violation: You cannot suspend your own active administrator account.');
      return;
    }
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, status } : u));
    addToast('info', `User account status changed to ${status}`);
    logAuditAction('TOGGLE_USER_STATUS', 'IDENTITY_ACCESS_MANAGEMENT', 'SUCCESS', `Set status of user ${userId} to ${status}`);
  };

  const resetUser2FA = (userId: string): TwoFactorEnrollmentPackage => {
    const user = users.find(u => u.id === userId);
    if (!user) throw new Error('User not found');

    const mfaSecretKey = `VTX-${(user.name.split(' ')[0] || 'USER').toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}-SEC`;
    const backupCodes = Array.from({ length: 8 }, () => 
      Math.random().toString(36).substring(2, 6).toUpperCase() + '-' + Math.random().toString(36).substring(2, 6).toUpperCase()
    );

    setUsers(prev => prev.map(u => u.id === userId ? {
      ...u,
      twoFactorStatus: 'ENROLLED',
      twoFactorEnforced: true,
      mfaSecretKey,
      backupCodesRemaining: backupCodes.length
    } : u));

    const pkg: TwoFactorEnrollmentPackage = {
      userId: user.id,
      userName: user.name,
      userEmail: user.email,
      qrCodeUrl: `otpauth://totp/VERTEX%20Studio:${encodeURIComponent(user.email)}?secret=${mfaSecretKey}&issuer=VERTEX%20Studio%20Architecture`,
      secretKey: mfaSecretKey,
      backupCodes,
      generatedAt: new Date().toISOString().replace('T', ' ').substring(0, 19) + ' UTC',
      enforcedSecurityTier: user.securityTier || 'TIER_3_SPECIALIST'
    };

    setEnrollmentPackage(pkg);
    addToast('success', `MFA Secret and Backup Codes rotated for ${user.name}`);
    logAuditAction('RESET_USER_2FA', 'IDENTITY_ACCESS_MANAGEMENT', 'SUCCESS', `Rotated TOTP hardware key for ${user.email}`);

    return pkg;
  };

  const enforceGlobal2FA = (enforced: boolean) => {
    setGlobal2FAEnforced(enforced);
    setUsers(prev => prev.map(u => ({ ...u, twoFactorEnforced: enforced })));
    addToast(enforced ? 'success' : 'info', `Global 2FA Enforcement policy is now ${enforced ? 'ACTIVE (Strict Zero-Trust)' : 'OPTIONAL'}`);
    logAuditAction('SET_GLOBAL_2FA_POLICY', 'SECURITY_POLICY', 'SUCCESS', `Global Zero-Trust 2FA Enforcement set to: ${enforced}`);
  };

  const deleteUserAccount = (userId: string) => {
    const user = users.find(u => u.id === userId);
    setUsers(prev => prev.filter(u => u.id !== userId));
    setActiveSessions(prev => prev.filter(s => s.userId !== userId));
    addToast('info', `User account ${user?.name || userId} deleted from IAM Directory`);
    logAuditAction('DELETE_USER_ACCOUNT', 'IDENTITY_ACCESS_MANAGEMENT', 'SUCCESS', `Removed identity record for ${user?.email || userId}`);
  };

  const revokeUserSession = (sessionId: string) => {
    setActiveSessions(prev => prev.filter(s => s.id !== sessionId));
    addToast('info', 'Active session credential revoked');
    logAuditAction('REVOKE_SESSION', 'IDENTITY_ACCESS_MANAGEMENT', 'SUCCESS', `Terminated active IAM session ${sessionId}`);
  };

  // Design Portal
  const createDesignRequest = async (reqData: Omit<DesignRequest, 'id' | 'status' | 'createdAt' | 'generatedConcepts'>): Promise<DesignRequest> => {
    // Generate AI Concepts based on room and style
    const matchingConcepts = designConcepts.filter(
      c => c.roomType.toLowerCase() === reqData.roomType.toLowerCase() ||
           c.style.toLowerCase() === reqData.stylePreference.toLowerCase()
    );

    const generated: DesignConcept[] = matchingConcepts.length > 0 ? matchingConcepts : [
      {
        id: 'gen_' + Date.now(),
        title: `${reqData.stylePreference} ${reqData.roomType} Concept`,
        roomType: reqData.roomType,
        style: reqData.stylePreference,
        imageUrl: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=800&auto=format&fit=crop&q=80',
        description: `Bespoke AI-generated design matching ${reqData.colorScheme} tones and ${reqData.roomDimensions} volume.`,
        estimatedCost: reqData.budgetRange,
        colorPalette: ['#EAE6E1', '#D4AF37', '#2C2416'],
        tags: [reqData.stylePreference, reqData.roomType, 'AI Rendered']
      }
    ];

    const newReq: DesignRequest = {
      ...reqData,
      id: 'dr_' + Date.now(),
      status: 'GENERATED',
      createdAt: new Date().toISOString(),
      generatedConcepts: generated
    };

    setDesignRequests(prev => [newReq, ...prev]);
    addToast('success', `Design generation completed for ${reqData.projectName}!`);
    logAuditAction('GENERATE_DESIGN_REQUEST', 'DESIGN_STUDIO', 'SUCCESS', `Generated design proposals for ${reqData.projectName}`);
    return newReq;
  };

  const addDesignConcept = (conceptData: Omit<DesignConcept, 'id'>): DesignConcept => {
    const newConcept: DesignConcept = {
      ...conceptData,
      id: 'concept_' + Date.now()
    };
    setDesignConcepts(prev => [newConcept, ...prev]);
    addToast('success', `Added new concept "${newConcept.title}" to Studio Catalog`);
    logAuditAction('CREATE_DESIGN_CONCEPT', 'DESIGN_STUDIO', 'SUCCESS', `Created concept ${newConcept.title}`);
    return newConcept;
  };

  const updateDesignConcept = (id: string, updates: Partial<DesignConcept>) => {
    setDesignConcepts(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
    addToast('info', 'Design concept updated successfully');
    logAuditAction('UPDATE_DESIGN_CONCEPT', 'DESIGN_STUDIO', 'SUCCESS', `Updated design concept ${id}`);
  };

  const deleteDesignConcept = (id: string) => {
    setDesignConcepts(prev => prev.filter(c => c.id !== id));
    addToast('info', 'Design concept removed from catalog');
    logAuditAction('DELETE_DESIGN_CONCEPT', 'DESIGN_STUDIO', 'SUCCESS', `Deleted concept ${id}`);
  };

  const submitInquiry = (inqData: Omit<Inquiry, 'id' | 'createdAt' | 'status'>) => {
    const newInq: Inquiry = {
      ...inqData,
      id: 'inq_' + Date.now(),
      createdAt: new Date().toISOString(),
      status: 'NEW'
    };
    setInquiries(prev => [newInq, ...prev]);
    addToast('success', 'Inquiry received! A senior design director will contact you within 24 hours.');
    logAuditAction('SUBMIT_INQUIRY', 'PORTAL', 'SUCCESS', `Received inquiry from ${newInq.name}`);
  };

  const updateInquiryStatus = (id: string, status: 'NEW' | 'CONTACTED' | 'RESOLVED') => {
    setInquiries(prev => prev.map(inq => inq.id === id ? { ...inq, status } : inq));
    addToast('info', `Inquiry status updated to ${status}`);
    logAuditAction('UPDATE_INQUIRY_STATUS', 'PORTAL', 'SUCCESS', `Updated inquiry ${id} to ${status}`);
  };

  const promoteConceptToPortfolio = (conceptId: string, customTitle?: string, collectionName?: string) => {
    setDesignConcepts(prev => prev.map(c => {
      if (c.id === conceptId) {
        return {
          ...c,
          title: customTitle || c.title,
          isPortfolioItem: true,
          collectionName: collectionName || c.collectionName || 'Featured Masterworks'
        };
      }
      return c;
    }));
    addToast('success', 'Concept promoted to official portfolio gallery');
    logAuditAction('PROMOTE_PORTFOLIO', 'PORTFOLIO_MGMT', 'SUCCESS', `Promoted concept ${conceptId} to portfolio`);
  };

  const markChannelAsRead = (channelId: string) => {
    setChannels(prev => prev.map(c => c.id === channelId ? { ...c, unreadCount: 0 } : c));
  };

  const handleSetActiveChannel = (id: string) => {
    setActiveChannelId(id);
    markChannelAsRead(id);
  };

  const handleSetChatOpen = (open: boolean) => {
    setChatOpen(open);
    if (open && activeChannelId) {
      markChannelAsRead(activeChannelId);
    }
  };

  // Chat Engine
  const sendMessage = (channelId: string, text: string, replyToId?: string, replySnippet?: string) => {
    if (!text.trim()) return;

    const newMsg: ChatMessage = {
      id: 'msg_' + Date.now(),
      channelId,
      senderId: currentUser.id,
      senderName: currentUser.name,
      senderRole: currentUser.role,
      senderAvatar: currentUser.avatar,
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      replyToId,
      replySnippet
    };

    setMessages(prev => ({
      ...prev,
      [channelId]: [...(prev[channelId] || []), newMsg]
    }));

    setChannels(prev => prev.map(c => {
      if (c.id === channelId) {
        return {
          ...c,
          lastMessagePreview: text,
          lastMessageTime: 'Just now'
        };
      }
      return c;
    }));

    logAuditAction('SEND_CHAT_MESSAGE', 'COLLABORATION', 'SUCCESS', `Sent message to ${channelId}`);
  };

  const deleteMessage = (channelId: string, messageId: string) => {
    setMessages(prev => ({
      ...prev,
      [channelId]: (prev[channelId] || []).filter(m => m.id !== messageId)
    }));
    addToast('info', 'Message deleted');
  };

  const createChatChannel = (channelData: {
    name: string;
    type: 'PROJECT' | 'DIRECT' | 'GENERAL';
    projectId?: string;
    subtext?: string;
    members: string[];
    category?: 'PROJECT_ROOM' | 'DIRECT_MESSAGE' | 'DESIGN_CRITIQUE' | 'CLIENT_SUPPORT' | 'SITE_COORDINATION' | 'GENERAL';
    initialMessage?: string;
  }): ChatChannel => {
    const newChannelId = 'c_' + Date.now().toString(36);
    const newChannel: ChatChannel = {
      id: newChannelId,
      name: channelData.name,
      type: channelData.type,
      projectId: channelData.projectId,
      subtext: channelData.subtext || (channelData.type === 'DIRECT' ? 'Direct Message' : 'Active Discussion Room'),
      unreadCount: 0,
      lastMessagePreview: channelData.initialMessage || 'Channel created',
      lastMessageTime: 'Just now',
      members: Array.from(new Set([currentUser.name, ...channelData.members])),
      createdBy: currentUser.name,
      creatorRole: currentUser.role,
      category: channelData.category || 'PROJECT_ROOM'
    };

    setChannels(prev => [newChannel, ...prev]);

    // If initial message provided, seed the messages list
    if (channelData.initialMessage && channelData.initialMessage.trim()) {
      const initMsg: ChatMessage = {
        id: 'm_' + Date.now(),
        channelId: newChannelId,
        senderId: currentUser.id,
        senderName: currentUser.name,
        senderRole: currentUser.role,
        senderAvatar: currentUser.avatar,
        text: channelData.initialMessage.trim(),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => ({
        ...prev,
        [newChannelId]: [initMsg]
      }));
    } else {
      setMessages(prev => ({
        ...prev,
        [newChannelId]: []
      }));
    }

    setActiveChannelId(newChannelId);
    setChatOpen(true);
    addToast('success', `Channel "${newChannel.name}" created successfully`);
    logAuditAction(
      'CREATE_CHAT_CHANNEL',
      'COLLABORATION',
      'SUCCESS',
      `Created channel ${newChannel.name} (${newChannel.type}) with members: ${newChannel.members.join(', ')}`,
      { resourceType: 'CHAT_CHANNEL', resourceId: newChannel.id }
    );

    return newChannel;
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        switchRole,
        users,
        activeView,
        setActiveView,
        projects,
        selectedProjectId,
        selectedProject,
        openProjectDrawer,
        closeProjectDrawer,
        activeDrawerTab,
        setActiveDrawerTab,
        addProject,
        updateProject,
        deleteProject,
        milestones,
        addMilestone,
        updateMilestone,
        deleteMilestone,
        tasks,
        addTask,
        updateTask,
        deleteTask,
        addTaskComment,
        addTaskProgressImage,
        validateTaskProgressImage,
        deleteTaskProgressImage,
        assignTask,
        budgetLines,
        addBudgetLine,
        updateBudgetLine,
        deleteBudgetLine,
        expenses,
        addExpense,
        updateExpenseStatus,
        invoices,
        addInvoice,
        updateInvoiceStatus,
        payments,
        recordPayment,
        posTransactions,
        processPOSTransaction,
        catalogItems,
        addCatalogItem,
        updateCatalogItem,
        deleteCatalogItem,
        applyCatalogItemToBudget,
        legalDocuments,
        uploadLegalDocument,
        signLegalDocument,
        updateLegalDocumentStatus,
        changeOrders,
        addChangeOrder,
        updateChangeOrderStatus,
        teamMembers,
        addTeamMember,
        updateTeamMember,
        clients,
        addClient,
        assignTeamMemberToProject,
        removeTeamMemberFromProject,
        companies,
        addCompany,
        updateCompany,
        deleteCompany,
        uploadContractorNDA,
        grantUserAccess,
        updateUserRole,
        updateUserPermissions,
        toggleUserStatus,
        resetUser2FA,
        enforceGlobal2FA,
        deleteUserAccount,
        activeSessions,
        revokeUserSession,
        global2FAEnforced,
        is2FAChallengeOpen,
        setIs2FAChallengeOpen,
        current2FAChallenge,
        setCurrent2FAChallenge,
        trigger2FAChallenge,
        enrollmentPackage,
        setEnrollmentPackage,
        designRequests,
        createDesignRequest,
        inquiries,
        submitInquiry,
        updateInquiryStatus,
        designConcepts,
        addDesignConcept,
        updateDesignConcept,
        deleteDesignConcept,
        promoteConceptToPortfolio,
        articles,
        chatOpen,
        setChatOpen: handleSetChatOpen,
        channels,
        activeChannelId,
        setActiveChannelId: handleSetActiveChannel,
        markChannelAsRead,
        messages,
        sendMessage,
        deleteMessage,
        createChatChannel,
        auditLogs,
        systemLogs,
        logAuditAction,
        clearAuditLogs,
        onboardClient,
        rejectClientOnboarding,
        createPendingClient,
        toasts,
        addToast,
        removeToast,
        isCreateProjectOpen,
        setIsCreateProjectOpen,
        editingProjectData,
        setEditingProjectData,
        isCreateMemberOpen,
        setIsCreateMemberOpen,
        isCreateClientOpen,
        setIsCreateClientOpen
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
};
