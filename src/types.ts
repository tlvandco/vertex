export type UserRole = 'ADMIN' | 'PROJECT_MANAGER' | 'DESIGNER' | 'CLIENT' | 'SITE_ENGINEER' | 'FINANCE';

export type OnboardingStatus = 'ONBOARDED' | 'PENDING_ONBOARDING' | 'REJECTED';

export type UserStatus = 'ACTIVE' | 'SUSPENDED' | 'PENDING_2FA' | 'INVITED';
export type TwoFactorStatus = 'ENROLLED' | 'PENDING_ENROLLMENT' | 'NOT_CONFIGURED' | 'DISABLED';
export type SecurityTier = 'TIER_1_SOVEREIGN' | 'TIER_2_PRINCIPAL' | 'TIER_3_SPECIALIST' | 'TIER_4_CLIENT' | 'TIER_5_CONTRACTOR';

export type IAMPermission =
  | 'ADMIN_FULL_ACCESS'
  | 'SYSTEM_ADMIN_CONFIG'
  | 'VIEW_DASHBOARD_ANALYTICS'
  | 'MANAGE_PROJECTS'
  | 'MANAGE_TASKS'
  | 'MANAGE_PROJECTS_MILESTONES'
  | 'VIEW_PROJECT_DOCUMENTS'
  | 'MANAGE_DESIGN_STUDIO'
  | 'VIEW_DESIGN_PORTAL'
  | 'GENERATE_AI_CONCEPTS'
  | 'DESIGN_PORTAL_WRITE'
  | 'VIEW_FINANCIALS'
  | 'MANAGE_FINANCIALS'
  | 'APPROVE_BUDGET_DRAWS'
  | 'ISSUE_INVOICES'
  | 'PROCESS_POS'
  | 'ACCESS_POS_TERMINAL'
  | 'MANAGE_CATALOG'
  | 'APPLY_CATALOG_BUDGET'
  | 'EXECUTE_LEGAL_CONTRACTS'
  | 'MANAGE_COMPANIES'
  | 'AUDIT_NDA_DOCUMENTS'
  | 'MANAGE_IAM_STAFF'
  | 'MANAGE_IAM_USERS'
  | 'MANAGE_TEAM_CLIENTS'
  | 'ONBOARD_CLIENT_ACCOUNTS'
  | 'MESSAGING_COLLABORATION'
  | 'EXPORT_AUDIT_LOGS'
  | 'EXPORT_FORENSIC_LOGS'
  | 'VIEW_SYSTEM_AUDIT_LOGS'
  | 'DATABASE_SCHEMA_EXPLORER'
  | 'CLUSTER_TELEMETRY'
  | 'CLIENT_PORTAL_VIEW';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar: string;
  phone?: string;
  specialization?: string;
  company?: string;
  companyId?: string;
  onboardingStatus?: OnboardingStatus;
  onboardedAt?: string;
  assignedProjectIds?: string[];
  status?: UserStatus;
  twoFactorStatus?: TwoFactorStatus;
  twoFactorEnforced?: boolean;
  securityTier?: SecurityTier;
  permissions?: IAMPermission[];
  lastLoginAt?: string;
  submittedAt?: string;
  onboardingNotes?: string;
  requestedClearance?: string;
  mfaSecretKey?: string;
  backupCodesRemaining?: number;
}

export type CompanyType =
  | 'CLIENT_HOLDING'
  | 'GENERAL_CONTRACTOR'
  | 'MEP_ENGINEERING'
  | 'INTERIOR_FURNISHING'
  | 'STONE_QUARRY'
  | 'LOGISTICS_EQUIPMENT'
  | 'LEGAL_CONSULTING'
  | 'ARCHITECTURAL_STUDIO'
  | 'OTHER';

export type CompanyStatus = 'VERIFIED' | 'PENDING_AUDIT' | 'SUSPENDED' | 'RESTRICTED';

export type RiskTier = 'LOW' | 'MEDIUM' | 'HIGH';
export type InsuranceStatus = 'VALID' | 'EXPIRING_SOON' | 'EXPIRED' | 'NOT_SUBMITTED';

export interface Company {
  id: string;
  name: string;
  legalName?: string;
  type: CompanyType;
  registrationNumber: string; // EIN / Tax ID
  licenseNumber?: string;
  email: string;
  phone: string;
  website?: string;
  address: string;
  city: string;
  country: string;
  status: CompanyStatus;
  primaryContactName: string;
  primaryContactEmail: string;
  primaryContactPhone?: string;
  assignedProjectIds: string[];
  activeProjectsCount?: number;
  insuranceCOIStatus: InsuranceStatus;
  insuranceExpiryDate?: string;
  ndaStatus: 'SIGNED' | 'PENDING' | 'EXEMPT' | 'EXPIRED';
  ndaDocumentId?: string;
  ndaDocumentUrl?: string;
  ndaFileName?: string;
  ndaFileSize?: string;
  ndaSignedAt?: string;
  ndaSignerName?: string;
  ndaCryptoHash?: string;
  creditLimit?: number;
  riskTier: RiskTier;
  createdAt: string;
  logo?: string;
  notes?: string;
}

export interface UserSession {
  id: string;
  userId: string;
  userName?: string;
  ipAddress: string;
  userAgent: string;
  device?: string;
  location: string;
  createdAt: string;
  lastActiveAt: string;
  lastActive?: string;
  twoFactorVerified?: boolean;
  isCurrentSession?: boolean;
}

export interface TwoFactorChallenge {
  actionType?: 'GRANT_USER_ACCESS' | 'CHANGE_USER_ROLE' | 'MODIFY_IAM_PERMISSIONS' | 'ACTIVATE_ACCOUNT' | 'SUSPEND_ACCOUNT' | 'RESET_2FA' | 'MANAGE_COMPANY' | 'DELETE_USER' | string;
  actionName?: string;
  title: string;
  description: string;
  targetUser?: {
    id?: string;
    name: string;
    email: string;
    role: UserRole;
  };
  payload?: any;
  onSuccess: (code: string) => void;
}

export interface TwoFactorEnrollmentPackage {
  user?: User;
  userId?: string;
  userName?: string;
  userEmail?: string;
  secretKey: string;
  qrCodeUrl: string;
  activationCode?: string;
  backupCodes: string[];
  expiresAt?: string;
  generatedAt?: string;
  enforcedSecurityTier?: string;
}

export type ProjectStatus = 'PLANNING' | 'IN_PROGRESS' | 'ON_HOLD' | 'COMPLETED';

export interface TeamAssignment {
  memberId: string;
  memberName: string;
  memberAvatar: string;
  role: string;
  allocationPercentage: number;
}

export interface Project {
  id: string;
  name: string;
  code: string;
  location: string;
  latitude?: number;
  longitude?: number;
  budget: number;
  spent: number;
  status: ProjectStatus;
  progress: number;
  description: string;
  clientId: string;
  clientName: string;
  clientEmail: string;
  startDate: string;
  endDate: string;
  coverImage?: string;
  team: TeamAssignment[];
  createdAt: string;
}

export interface Milestone {
  id: string;
  projectId: string;
  name: string;
  description: string;
  dueDate: string;
  targetTaskId?: string;
  progress: number;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
  isHighlightOfMonth?: boolean;
}

export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'REVIEW' | 'DONE';

export interface TaskAttachment {
  id: string;
  name: string;
  url: string;
  size: string;
  type: string;
}

export interface TaskComment {
  id: string;
  authorName: string;
  authorAvatar: string;
  text: string;
  createdAt: string;
}

export type TaskImageValidationStatus = 'PENDING_CLIENT_VALIDATION' | 'CLIENT_VALIDATED' | 'REQUIRES_REVISION';

export interface TaskProgressImage {
  id: string;
  taskId: string;
  projectId: string;
  imageUrl: string;
  thumbnailUrl?: string;
  caption: string;
  stageName?: string; // e.g. "Structural Framing", "Rough-in Electrical", "Stone Cladding"
  progressPercent?: number; // 0-100
  locationTag?: string; // e.g. "Penthouse Level 4, Primary Suite"
  uploadedBy: {
    id: string;
    name: string;
    role: UserRole;
    avatar?: string;
    company?: string;
  };
  uploadedAt: string;
  cameraMetadata?: {
    device?: string;
    timestamp?: string;
    gpsCoords?: string;
  };
  validationStatus: TaskImageValidationStatus;
  clientValidation?: {
    validatedBy: string;
    validatedById?: string;
    validatedAt: string;
    signatureVerificationCode: string;
    feedback?: string;
    rating?: number;
  };
  tags?: string[];
}

export interface Task {
  id: string;
  projectId: string;
  title: string;
  description: string;
  assignedToId?: string;
  assignedToName?: string;
  assignedToAvatar?: string;
  assignedRole?: string;
  priority: TaskPriority;
  status: TaskStatus;
  dueDate: string;
  attachments: TaskAttachment[];
  comments: TaskComment[];
  progressImages?: TaskProgressImage[];
  progressPercent?: number;
  stage?: string;
}

export interface BudgetLine {
  id: string;
  projectId: string;
  category: string;
  itemName: string;
  estimated: number;
  actual: number;
  variance: number;
  notes?: string;
}

export type ExpenseStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface Expense {
  id: string;
  projectId: string;
  description: string;
  category: string;
  amount: number;
  date: string;
  vendor: string;
  paymentMethod: 'CASH' | 'BANK_TRANSFER' | 'CREDIT_CARD' | 'UPI';
  receiptUrl?: string;
  status: ExpenseStatus;
  approvedBy?: string;
}

export type InvoiceStatus = 'DRAFT' | 'PENDING' | 'PAID' | 'OVERDUE';

export interface Invoice {
  id: string;
  invoiceNumber: string;
  projectId: string;
  projectName: string;
  clientId: string;
  clientName: string;
  clientEmail: string;
  amount: number;
  tax: number;
  total: number;
  issueDate: string;
  dueDate: string;
  status: InvoiceStatus;
  notes?: string;
  items: { description: string; quantity: number; unitPrice: number; total: number }[];
}

export interface Payment {
  id: string;
  invoiceId: string;
  invoiceNumber: string;
  projectId: string;
  projectName?: string;
  clientId?: string;
  clientName?: string;
  amount: number;
  paymentMethod: string;
  referenceNumber: string;
  paymentDate: string;
  notes?: string;
}

export type ChangeOrderStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface ChangeOrder {
  id: string;
  projectId: string;
  title: string;
  description: string;
  reason: string;
  budgetImpact: number;
  scheduleImpactDays: number;
  requestedBy: string;
  requestedRole: string;
  status: ChangeOrderStatus;
  date: string;
  reviewedBy?: string;
  reviewNotes?: string;
}

export interface TeamMember {
  id: string;
  name: string;
  role: 'ADMIN' | 'PROJECT_MANAGER' | 'ARCHITECT' | 'DESIGNER' | 'SITE_ENGINEER' | 'FINANCE';
  email: string;
  phone: string;
  specialization: string;
  avatar: string;
  activeProjectsCount: number;
  status: 'ACTIVE' | 'ON_LEAVE';
  hourlyRate?: number;
}

export interface Client {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  address: string;
  activeProjectsCount: number;
  avatar: string;
  totalBilled?: number;
  status?: string;
  notes?: string;
}

export interface DesignConcept {
  id: string;
  title: string;
  roomType: string;
  style: string;
  imageUrl: string;
  description: string;
  estimatedCost: string;
  colorPalette: string[];
  tags: string[];
  isPortfolioItem?: boolean;
  collectionName?: string;
}

export interface DesignRequest {
  id: string;
  projectName: string;
  clientName: string;
  clientEmail: string;
  roomType: string;
  roomDimensions: string;
  budgetRange: string;
  stylePreference: string;
  colorScheme: string;
  designRequirements: string;
  floorPlanUrl?: string;
  status: 'PENDING' | 'GENERATED' | 'APPROVED';
  createdAt: string;
  generatedConcepts: DesignConcept[];
}

export interface Inquiry {
  id: string;
  name: string;
  email: string;
  phone: string;
  companyName?: string;
  inquiryType: 'RESIDENTIAL' | 'COMMERCIAL' | 'CONSULTATION' | 'OTHER';
  spaceType: string;
  timeline: string;
  message: string;
  preferredContact: 'EMAIL' | 'PHONE' | 'BOTH';
  createdAt: string;
  status: 'NEW' | 'CONTACTED' | 'RESOLVED';
}

export interface MarketArticle {
  id: string;
  title: string;
  category: string;
  readTime: string;
  excerpt: string;
  content: string;
  imageUrl: string;
  author: string;
  date: string;
  tags: string[];
}

export interface ChatMessage {
  id: string;
  channelId: string;
  senderId: string;
  senderName: string;
  senderRole: string;
  senderAvatar: string;
  text: string;
  timestamp: string;
  replyToId?: string;
  replySnippet?: string;
  reactions?: Record<string, string[]>;
  attachments?: string[];
}

export interface ChatChannel {
  id: string;
  name: string;
  type: 'PROJECT' | 'DIRECT' | 'GENERAL';
  projectId?: string;
  subtext?: string;
  unreadCount: number;
  lastMessagePreview?: string;
  lastMessageTime?: string;
  members: string[];
  createdBy?: string;
  creatorRole?: string;
  category?: 'PROJECT_ROOM' | 'DIRECT_MESSAGE' | 'DESIGN_CRITIQUE' | 'CLIENT_SUPPORT' | 'SITE_COORDINATION' | 'GENERAL';
  permittedRoles?: UserRole[];
}

export type PaymentTerminalMethod = 'CARD_CHIP' | 'CARD_TAP' | 'WIRE_ESCROW' | 'ACH_DIRECT' | 'CASHIERS_CHECK' | 'CARD_ON_FILE';

export interface POSLineItem {
  id: string;
  description: string;
  category: string;
  quantity: number;
  unitPrice: number;
  total: number;
  catalogItemId?: string;
}

export interface CatalogItem {
  id: string;
  sku: string;
  title: string;
  category: string;
  price: number;
  unit: string;
  description: string;
  leadTime?: string;
  tags?: string[];
  isCustom?: boolean;
  createdAt?: string;
  createdBy?: string;
}

export interface POSTransaction {
  id: string;
  transactionNumber: string;
  projectId: string;
  projectName: string;
  clientId: string;
  clientName: string;
  cashierName: string;
  cashierRole: string;
  terminalId: string;
  timestamp: string;
  items: POSLineItem[];
  subtotal: number;
  tax: number;
  contingencyFee: number;
  total: number;
  paymentMethod: PaymentTerminalMethod;
  cardLastFour?: string;
  authCode: string;
  status: 'SETTLED' | 'REFUNDED' | 'VOID';
  notes?: string;
  digitalSignatureUrl?: string;
  receiptHash: string;
}

export type LegalDocumentCategory =
  | 'CONTRACT'
  | 'DRAW_AGREEMENT'
  | 'CHANGE_ORDER_ADDENDUM'
  | 'LIEN_WAIVER'
  | 'PERMIT_PERFECTION'
  | 'INDEMNITY_INSURANCE'
  | 'NDA';

export type LegalDocumentStatus = 'DRAFT' | 'PENDING_SIGNATURE' | 'SIGNED_SEALED' | 'ARCHIVED';

export interface DocumentSigner {
  id: string;
  name: string;
  email: string;
  role: string;
  hasSigned: boolean;
  signedAt?: string;
  signatureDataUrl?: string;
  cryptoHash?: string;
  ipAddress?: string;
}

export interface LegalDocument {
  id: string;
  documentNumber: string;
  title: string;
  category: LegalDocumentCategory;
  companyId?: string;
  companyName?: string;
  projectId: string;
  projectName: string;
  clientId: string;
  clientName: string;
  effectiveDate: string;
  status: LegalDocumentStatus;
  content: string;
  uploadedFileUrl?: string;
  fileName?: string;
  fileSize?: string;
  cryptoHash?: string;
  signers: DocumentSigner[];
  signatureCertificate?: {
    signedByName: string;
    signedByRole: string;
    signedAt: string;
    signatureDataUrl?: string;
    cryptoHash: string;
    ipAddress: string;
    certificateId: string;
  };
  createdAt: string;
  version: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  user: string;
  userRole?: UserRole;
  action: string;
  category: string;
  status: 'SUCCESS' | 'FAILURE' | 'ERROR';
  ip: string;
  diagnostics: string;
  resourceType?: string;
  resourceId?: string;
  metadata?: Record<string, any>;
}

export interface SystemLog {
  id: string;
  timestamp: string;
  level: 'INFO' | 'WARN' | 'ERROR';
  message: string;
  source: string;
}

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

// Database Schema & Architecture Types
export interface DBSchemaColumn {
  name: string;
  type: string;
  isPrimary: boolean;
  isNullable: boolean;
  defaultValue?: string;
  references?: {
    table: string;
    column: string;
    onDelete?: 'CASCADE' | 'SET NULL' | 'RESTRICT';
  };
  description: string;
}

export interface DBSchemaIndex {
  name: string;
  columns: string[];
  type: 'BTREE' | 'GIN' | 'HASH' | 'PARTIAL';
  isUnique: boolean;
  predicate?: string;
}

export interface DBSchemaTable {
  name: string;
  description: string;
  module: 'AUTH_IAM' | 'PORTFOLIO' | 'FINANCIALS_POS' | 'PROCUREMENT' | 'COLLABORATION' | 'GOVERNANCE';
  columns: DBSchemaColumn[];
  indexes: DBSchemaIndex[];
  triggers?: string[];
  partitionStrategy?: string;
  estimatedRowCount: number;
}

export interface DBStatusResponse {
  connected: boolean;
  engine: string;
  version: string;
  pool: {
    total: number;
    active: number;
    idle: number;
    waitingClients: number;
    maxConnections: number;
  };
  storage: {
    tablesCount: number;
    recordsCount: number;
    walSizeBytes: number;
    databaseSizeMB: number;
    cacheHitRatio: string;
  };
  replication: {
    mode: 'ASYNC_MULTI_AZ';
    primaryRegion: string;
    replicaRegions: string[];
    replicationLagMs: number;
    status: 'STREAMING_SYNCED';
  };
  migrations: {
    appliedCount: number;
    latestMigration: string;
    appliedAt: string;
    pendingCount: number;
  };
}

export interface DBQueryExplainResult {
  query: string;
  planType: 'Index Scan' | 'Bitmap Heap Scan' | 'Index Only Scan' | 'Seq Scan';
  targetTable: string;
  usedIndex?: string;
  totalCost: number;
  executionTimeMs: number;
  rowsEstimated: number;
  rowsActual: number;
  bufferHits: number;
  recommendations: string[];
}

export interface SystemArchitectureSpec {
  ingress: {
    anycastIps: string[];
    cdnProvider: string;
    edgeLocationsCount: number;
    sslTlsVersion: string;
    wafRulesActive: number;
  };
  cluster: {
    orchestrator: 'Kubernetes GKE / Cloud Run';
    activeReplicas: number;
    minReplicas: number;
    maxReplicas: number;
    cpuTargetPercent: number;
    hpaTriggers: string[];
  };
  caching: {
    engine: 'Redis Distributed Cache 7.2';
    topology: 'Primary-Replica Cluster with SWR';
    cacheTTLSeconds: number;
    evictionPolicy: 'allkeys-lru';
  };
  database: {
    primaryEngine: 'PostgreSQL 16.2 Enterprise';
    highAvailability: 'Multi-Region Read Replicas';
    connectionPooler: 'PgBouncer in Transaction Mode';
    backupPolicy: 'Point-in-Time Recovery (PITR) 35-day retention';
  };
  storage: {
    blobProvider: 'Google Cloud Storage / AWS S3 Multi-Region';
    encryption: 'AES-256 GCM Customer-Managed Key';
    immutableWormAuditRetentionDays: number;
  };
  sla: {
    availabilityTarget: '99.99%';
    rpoMinutes: number;
    rtoSeconds: number;
    p99LatencyTargetMs: number;
  };
}

