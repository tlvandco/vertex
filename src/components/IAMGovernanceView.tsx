import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  User,
  UserRole,
  SecurityTier,
  IAMPermission,
  UserStatus,
  TwoFactorStatus
} from '../types';
import {
  Shield,
  ShieldCheck,
  ShieldAlert,
  UserPlus,
  Key,
  Lock,
  Smartphone,
  RefreshCw,
  Trash2,
  Edit,
  CheckCircle2,
  AlertTriangle,
  Fingerprint,
  Radio,
  Search,
  Check,
  X,
  Laptop,
  Globe,
  Clock,
  LogOut,
  Building,
  Sliders,
  ChevronRight,
  Info
} from 'lucide-react';

const ALL_IAM_PERMISSIONS: { id: IAMPermission; label: string; description: string; category: string }[] = [
  {
    id: 'ADMIN_FULL_ACCESS',
    label: 'Sovereign Administrator Override',
    description: 'Unrestricted enterprise control, configuration, and root security override.',
    category: 'Core System'
  },
  {
    id: 'SYSTEM_ADMIN_CONFIG',
    label: 'System & Security Configuration',
    description: 'Manage 2FA enforcement, cryptographic rotation, and global IAM policies.',
    category: 'Core System'
  },
  {
    id: 'VIEW_DASHBOARD_ANALYTICS',
    label: 'View Executive Dashboard & Analytics',
    description: 'Access top-level KPI metrics, project health scores, and operational telemetry.',
    category: 'Core System'
  },
  {
    id: 'MANAGE_PROJECTS',
    label: 'Create & Manage Estates',
    description: 'Create new architectural projects, modify estate parameters, and archive builds.',
    category: 'Projects & Milestones'
  },
  {
    id: 'MANAGE_PROJECTS_MILESTONES',
    label: 'Gantt Milestones & Critical Paths',
    description: 'Set construction schedules, validate completion dates, and sign off phases.',
    category: 'Projects & Milestones'
  },
  {
    id: 'MANAGE_TASKS',
    label: 'Task Allocation & Progress Photos',
    description: 'Assign tasks to trade specialists, review progress photos, and approve field logs.',
    category: 'Projects & Milestones'
  },
  {
    id: 'VIEW_PROJECT_DOCUMENTS',
    label: 'Project Blueprints & CAD Files',
    description: 'Access architectural drawings, engineering schedules, and structural calculations.',
    category: 'Projects & Milestones'
  },
  {
    id: 'MANAGE_DESIGN_STUDIO',
    label: '3D Generative AI Studio & Moodboards',
    description: 'Generate AI spatial concepts, author finish schedules, and curate material swatches.',
    category: 'Design & AI Studio'
  },
  {
    id: 'GENERATE_AI_CONCEPTS',
    label: 'Generative AI Rendering Engine',
    description: 'Execute high-resolution AI interior and exterior prompt syntheses.',
    category: 'Design & AI Studio'
  },
  {
    id: 'VIEW_DESIGN_PORTAL',
    label: 'Design Gallery & Market Trends',
    description: 'Browse architectural portfolio masterworks and luxury design trend articles.',
    category: 'Design & AI Studio'
  },
  {
    id: 'DESIGN_PORTAL_WRITE',
    label: 'Publish Design Trends & Articles',
    description: 'Author and edit global market design briefs and architectural research papers.',
    category: 'Design & AI Studio'
  },
  {
    id: 'VIEW_FINANCIALS',
    label: 'View Financial Ledger & Margins',
    description: 'Read-only access to profit & loss, project budget margins, and cost reports.',
    category: 'Financial Ledger'
  },
  {
    id: 'MANAGE_FINANCIALS',
    label: 'Manage Budget Allocations & Draws',
    description: 'Issue draw requests, approve budget lines, and reallocate project capital.',
    category: 'Financial Ledger'
  },
  {
    id: 'APPROVE_BUDGET_DRAWS',
    label: 'Authorize High-Value Escrow Draws',
    description: 'Provide fiduciary approval for disbursements exceeding $250,000.',
    category: 'Financial Ledger'
  },
  {
    id: 'ISSUE_INVOICES',
    label: 'Issue Progressive Client Invoices',
    description: 'Generate progressive milestone invoices and trigger client payment requests.',
    category: 'Financial Ledger'
  },
  {
    id: 'PROCESS_POS',
    label: 'Process POS & Retainer Terminal',
    description: 'Execute instant card / wire point-of-sale retainer receipts and deposits.',
    category: 'Financial Ledger'
  },
  {
    id: 'ACCESS_POS_TERMINAL',
    label: 'Point-of-Sale Hardware Terminal',
    description: 'Access live physical POS checkout interface for design deposit capture.',
    category: 'Financial Ledger'
  },
  {
    id: 'MANAGE_CATALOG',
    label: 'Procurement & Service Catalog',
    description: 'Manage luxury finishes, lighting fixtures, and direct budget attachments.',
    category: 'Procurement & Legal'
  },
  {
    id: 'APPLY_CATALOG_BUDGET',
    label: 'Attach Materials to Active Budgets',
    description: 'Directly inject specified FF&E products into project cost ledgers.',
    category: 'Procurement & Legal'
  },
  {
    id: 'EXECUTE_LEGAL_CONTRACTS',
    label: 'Execute Legal Contracts & NDAs',
    description: 'Upload legal covenants and apply legally-binding cryptographic signatures.',
    category: 'Procurement & Legal'
  },
  {
    id: 'MANAGE_COMPANIES',
    label: 'Corporate Entities & Trade Partners',
    description: 'Register trade carriers, verify insurance COIs, and approve credit lines.',
    category: 'Procurement & Legal'
  },
  {
    id: 'AUDIT_NDA_DOCUMENTS',
    label: 'Audit & Inspect Signed NDAs',
    description: 'View full executed legal NDA documents and cryptographic signature proofs.',
    category: 'Procurement & Legal'
  },
  {
    id: 'MANAGE_IAM_STAFF',
    label: 'IAM & Staff Access Control',
    description: 'Provision staff credentials, rotate 2FA keys, and assign security clearance.',
    category: 'Security & IAM'
  },
  {
    id: 'MANAGE_IAM_USERS',
    label: 'Manage Identity Directory',
    description: 'Suspend or re-activate user credentials and modify role assignments.',
    category: 'Security & IAM'
  },
  {
    id: 'MANAGE_TEAM_CLIENTS',
    label: 'Team Directory & Client Allocations',
    description: 'Assign project managers, architects, and engineers to client accounts.',
    category: 'Security & IAM'
  },
  {
    id: 'ONBOARD_CLIENT_ACCOUNTS',
    label: 'Client Account Onboarding & OTP',
    description: 'Manage client verification pipelines, OTP authorizations, and tenant keys.',
    category: 'Security & IAM'
  },
  {
    id: 'MESSAGING_COLLABORATION',
    label: 'Direct Messaging & Project Rooms',
    description: 'Participate in encrypted 1-on-1 direct messages and project chat channels.',
    category: 'Collaboration & Telemetry'
  },
  {
    id: 'EXPORT_AUDIT_LOGS',
    label: 'Export Security Audit Logs',
    description: 'Download immutable audit trails for SOC2/ISO27001 regulatory compliance.',
    category: 'Collaboration & Telemetry'
  },
  {
    id: 'EXPORT_FORENSIC_LOGS',
    label: 'Export Forensic System Telemetry',
    description: 'Generate cryptographic audit packages with hash verification seals.',
    category: 'Collaboration & Telemetry'
  },
  {
    id: 'VIEW_SYSTEM_AUDIT_LOGS',
    label: 'Live System Telemetry & Logs',
    description: 'Inspect real-time API logs, response times, and edge node performance.',
    category: 'Collaboration & Telemetry'
  },
  {
    id: 'DATABASE_SCHEMA_EXPLORER',
    label: 'PostgreSQL Database Schema & DDL',
    description: 'Inspect relational tables, foreign key constraints, and SQL query health.',
    category: 'Collaboration & Telemetry'
  },
  {
    id: 'CLUSTER_TELEMETRY',
    label: 'Edge Cluster Health & Nodes',
    description: 'View distributed container cluster health, Redis cache, and latency probes.',
    category: 'Collaboration & Telemetry'
  },
  {
    id: 'CLIENT_PORTAL_VIEW',
    label: 'Client Estate Portal Access',
    description: 'Isolated access to client-facing dashboard, documents, and private chat.',
    category: 'Portal'
  }
];

const SECURITY_TIER_CONFIG: Record<
  SecurityTier,
  { label: string; badgeColor: string; description: string }
> = {
  TIER_1_SOVEREIGN: {
    label: 'Tier 1 • Sovereign Admin',
    badgeColor: 'bg-red-100 text-red-900 border-red-300',
    description: 'Highest security clearance; unrestricted system authority.'
  },
  TIER_2_PRINCIPAL: {
    label: 'Tier 2 • Principal Partner',
    badgeColor: 'bg-amber-100 text-amber-900 border-amber-300',
    description: 'Project directorship, high-value financial oversight, and contracts.'
  },
  TIER_3_SPECIALIST: {
    label: 'Tier 3 • Staff Specialist',
    badgeColor: 'bg-blue-100 text-blue-900 border-blue-300',
    description: 'Design studio, MEP specifications, and milestone execution.'
  },
  TIER_4_CLIENT: {
    label: 'Tier 4 • Client Principal',
    badgeColor: 'bg-emerald-100 text-emerald-900 border-emerald-300',
    description: 'Estate owner portal with private financial ledger and design sign-offs.'
  },
  TIER_5_CONTRACTOR: {
    label: 'Tier 5 • Trade Partner',
    badgeColor: 'bg-purple-100 text-purple-900 border-purple-300',
    description: 'Subcontracted crane, rigging, stone quarry, and site personnel.'
  }
};

export const IAMGovernanceView: React.FC = () => {
  const {
    users,
    currentUser,
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
    trigger2FAChallenge,
    addToast
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRoleFilter, setSelectedRoleFilter] = useState<string>('ALL');
  const [activeTab, setActiveTab] = useState<'users' | 'sessions' | 'permissions'>('users');

  // Provisioning Modal State
  const [isProvisionModalOpen, setIsProvisionModalOpen] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserRole, setNewUserRole] = useState<UserRole>('DESIGNER');
  const [newUserTier, setNewUserTier] = useState<SecurityTier>('TIER_3_SPECIALIST');
  const [newUserCompany, setNewUserCompany] = useState('');
  const [newUserPhone, setNewUserPhone] = useState('+1 (555) 000-0000');
  const [newUserPermissions, setNewUserPermissions] = useState<IAMPermission[]>([
    'MANAGE_DESIGN_STUDIO',
    'MANAGE_PROJECTS_MILESTONES'
  ]);

  // Edit Permissions Modal State
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editRole, setEditRole] = useState<UserRole>('DESIGNER');
  const [editPermissions, setEditPermissions] = useState<IAMPermission[]>([]);

  // Open Provisioning Modal
  const openProvisionModal = () => {
    setNewUserName('');
    setNewUserEmail('');
    setNewUserRole('DESIGNER');
    setNewUserTier('TIER_3_SPECIALIST');
    setNewUserCompany('VERTEX Architecture Studio');
    setNewUserPhone('+1 (555) 000-0000');
    setNewUserPermissions(['MANAGE_DESIGN_STUDIO', 'MANAGE_PROJECTS_MILESTONES']);
    setIsProvisionModalOpen(true);
  };

  const handleRoleChangeInProvision = (role: UserRole) => {
    setNewUserRole(role);
    if (role === 'ADMIN') {
      setNewUserTier('TIER_1_SOVEREIGN');
      setNewUserPermissions(ALL_IAM_PERMISSIONS.map(p => p.id));
    } else if (role === 'PROJECT_MANAGER') {
      setNewUserTier('TIER_2_PRINCIPAL');
      setNewUserPermissions([
        'MANAGE_PROJECTS_MILESTONES',
        'VIEW_FINANCIALS',
        'MANAGE_FINANCIALS',
        'MANAGE_COMPANIES',
        'MANAGE_DESIGN_STUDIO'
      ]);
    } else if (role === 'FINANCE') {
      setNewUserTier('TIER_2_PRINCIPAL');
      setNewUserPermissions([
        'VIEW_FINANCIALS',
        'MANAGE_FINANCIALS',
        'ISSUE_INVOICES',
        'PROCESS_POS',
        'EXECUTE_LEGAL_CONTRACTS'
      ]);
    } else if (role === 'CLIENT') {
      setNewUserTier('TIER_4_CLIENT');
      setNewUserPermissions(['CLIENT_PORTAL_VIEW']);
    } else {
      setNewUserTier('TIER_3_SPECIALIST');
      setNewUserPermissions(['MANAGE_DESIGN_STUDIO', 'MANAGE_PROJECTS_MILESTONES']);
    }
  };

  const handleProvisionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName.trim() || !newUserEmail.trim()) {
      addToast('error', 'Full name and email are required');
      return;
    }

    // Gated by Two-Factor Authentication!
    trigger2FAChallenge({
      actionName: `Provision IAM Access: ${newUserEmail} (${newUserRole})`,
      title: 'Privileged IAM Provisioning Authorization',
      description: `Authorizing security clearance [${newUserTier}] and generating cryptographic 2FA secret key for ${newUserEmail}.`,
      onSuccess: (verification2FACode: string) => {
        grantUserAccess(
          {
            name: newUserName.trim(),
            email: newUserEmail.trim(),
            role: newUserRole,
            securityTier: newUserTier,
            company: newUserCompany,
            phone: newUserPhone,
            permissions: newUserPermissions,
            avatar: `https://images.unsplash.com/photo-${1534528741775 + Math.floor(Math.random() * 1000)}?w=150`
          },
          verification2FACode
        );
        setIsProvisionModalOpen(false);
      }
    });
  };

  const openEditPermissionsModal = (user: User) => {
    setEditingUser(user);
    setEditRole(user.role);
    setEditPermissions(user.permissions || []);
  };

  const handleSavePermissions = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    // Gated by Two-Factor Authentication!
    trigger2FAChallenge({
      actionName: `Update IAM Policy: ${editingUser.name}`,
      title: 'IAM Policy Reconfiguration',
      description: `Applying role ${editRole} and ${editPermissions.length} granular entitlements to user identity ${editingUser.email}.`,
      onSuccess: (code: string) => {
        updateUserRole(editingUser.id, editRole, editPermissions, code);
        setEditingUser(null);
      }
    });
  };

  const handleRotateKey = (user: User) => {
    trigger2FAChallenge({
      actionName: `Rotate 2FA Key: ${user.name}`,
      title: 'Cryptographic 2FA Key Rotation',
      description: `Rotating TOTP hardware key and re-issuing 8 emergency recovery codes for ${user.email}.`,
      onSuccess: () => {
        resetUser2FA(user.id);
      }
    });
  };

  const handleDeleteUser = (user: User) => {
    trigger2FAChallenge({
      actionName: `Revoke User Identity: ${user.name}`,
      title: 'Identity Decommission Authorization',
      description: `Permanently revoking access credentials and IAM certificates for ${user.email}.`,
      onSuccess: () => {
        deleteUserAccount(user.id);
      }
    });
  };

  const togglePermission = (permId: IAMPermission, isEdit = false) => {
    if (isEdit) {
      setEditPermissions(prev =>
        prev.includes(permId) ? prev.filter(p => p !== permId) : [...prev, permId]
      );
    } else {
      setNewUserPermissions(prev =>
        prev.includes(permId) ? prev.filter(p => p !== permId) : [...prev, permId]
      );
    }
  };

  const filteredUsers = users.filter(u => {
    const matchesSearch =
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (u.company && u.company.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesRole = selectedRoleFilter === 'ALL' || u.role === selectedRoleFilter;

    return matchesSearch && matchesRole;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner with Zero-Trust Controls */}
      <div className="bg-[#2C2416] p-6 rounded-3xl text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
        {/* Subtle background security pattern */}
        <div className="absolute right-0 top-0 bottom-0 opacity-10 pointer-events-none flex items-center pr-6">
          <Shield className="w-64 h-64 text-[#D4AF37]" />
        </div>

        <div className="relative z-10 space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase font-mono tracking-widest text-[#D4AF37] font-bold">
              Identity & Access Management (IAM)
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              FIPS 140-3 Hardware Verified
            </span>
          </div>
          <h2 className="text-2xl font-serif font-bold text-white">
            Access Governance & Zero-Trust IAM
          </h2>
          <p className="text-xs text-gray-300 max-w-xl leading-relaxed">
            Manage granular user roles, security clearance tiers, biometric TOTP enforcement, and active session credentials across all studio personnel.
          </p>
        </div>

        <div className="relative z-10 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
          {/* Zero Trust Toggle */}
          <div className="bg-white/10 backdrop-blur-xs p-3 rounded-2xl border border-white/10 flex items-center justify-between sm:justify-start gap-3">
            <div className="text-left">
              <span className="text-[11px] font-bold text-[#D4AF37] block">Mandatory 2FA Policy</span>
              <span className="text-[10px] text-gray-400">
                {global2FAEnforced ? 'Strict (All Users Enforced)' : 'Adaptive Security'}
              </span>
            </div>
            <button
              onClick={() => enforceGlobal2FA(!global2FAEnforced)}
              className={`w-12 h-6 rounded-full transition-colors relative p-0.5 cursor-pointer ${
                global2FAEnforced ? 'bg-[#D4AF37]' : 'bg-gray-600'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transition-transform ${
                  global2FAEnforced ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          <button
            onClick={openProvisionModal}
            className="px-5 py-3 rounded-2xl text-xs font-bold bg-[#D4AF37] hover:bg-[#B8860B] text-white shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0"
          >
            <UserPlus className="w-4 h-4" />
            <span>Grant User Access (2FA)</span>
          </button>
        </div>
      </div>

      {/* Security Tier Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {Object.entries(SECURITY_TIER_CONFIG).map(([tierKey, cfg]) => {
          const userCount = users.filter(u => (u.securityTier || 'TIER_3_SPECIALIST') === tierKey).length;
          return (
            <div key={tierKey} className="bg-white p-3.5 rounded-2xl border border-gray-200 shadow-2xs space-y-1.5">
              <div className="flex items-center justify-between">
                <span className={`text-[9px] font-bold px-2 py-0.5 rounded border ${cfg.badgeColor}`}>
                  {tierKey.replace('TIER_', 'T-')}
                </span>
                <span className="font-mono text-xs font-bold text-gray-900">{userCount} Users</span>
              </div>
              <div className="font-bold text-xs text-[#2C2416]">{cfg.label.split('•')[1]}</div>
              <p className="text-[10px] text-gray-400 leading-tight">{cfg.description}</p>
            </div>
          );
        })}
      </div>

      {/* Navigation Tabs & Controls */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={() => setActiveTab('users')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'users' ? 'bg-[#2C2416] text-[#D4AF37]' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Identity Directory ({users.length})
            </button>
            <button
              onClick={() => setActiveTab('sessions')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'sessions' ? 'bg-[#2C2416] text-[#D4AF37]' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Radio className="w-3 h-3 text-emerald-500 animate-pulse" />
              <span>Active IAM Sessions ({activeSessions.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('permissions')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'permissions' ? 'bg-[#2C2416] text-[#D4AF37]' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Permissions Matrix
            </button>
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Filter by name, email, role..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:border-[#D4AF37] focus:bg-white transition-all"
            />
          </div>
        </div>

        {/* Role Filter Chips */}
        {activeTab === 'users' && (
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs scrollbar-none">
            {['ALL', 'ADMIN', 'PROJECT_MANAGER', 'DESIGNER', 'SITE_ENGINEER', 'FINANCE', 'CLIENT'].map(r => (
              <button
                key={r}
                onClick={() => setSelectedRoleFilter(r)}
                className={`px-3 py-1 rounded-lg font-bold whitespace-nowrap transition-all cursor-pointer ${
                  selectedRoleFilter === r
                    ? 'bg-[#2C2416] text-[#D4AF37]'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {r === 'ALL' ? 'All Roles' : r.replace('_', ' ')}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Tab Content: Identity Directory */}
      {activeTab === 'users' && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-gray-600">
              <thead className="bg-[#FAF8F5] text-gray-800 border-b border-gray-200 text-[11px] uppercase tracking-wider font-semibold">
                <tr>
                  <th className="py-3.5 px-4">User Identity</th>
                  <th className="py-3.5 px-4">Security Tier</th>
                  <th className="py-3.5 px-4">Role & Entitlements</th>
                  <th className="py-3.5 px-4">2FA Status & MFA Key</th>
                  <th className="py-3.5 px-4">Account Status</th>
                  <th className="py-3.5 px-4 text-right">Actions (2FA Protected)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredUsers.map(user => {
                  const tierCfg =
                    SECURITY_TIER_CONFIG[user.securityTier || 'TIER_3_SPECIALIST'] ||
                    SECURITY_TIER_CONFIG.TIER_3_SPECIALIST;
                  const perms = user.permissions || [];

                  return (
                    <tr key={user.id} className="hover:bg-gray-50/80 transition-colors">
                      {/* Identity */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={user.avatar}
                            alt={user.name}
                            className="w-9 h-9 rounded-full object-cover border border-gray-200 shrink-0"
                          />
                          <div>
                            <div className="font-bold text-gray-900 text-xs flex items-center gap-1.5">
                              <span>{user.name}</span>
                              {user.id === currentUser.id && (
                                <span className="text-[9px] font-mono bg-amber-100 text-amber-900 px-1.5 py-0.2 rounded font-bold">
                                  YOU
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-gray-500 font-mono">{user.email}</div>
                            {user.company && (
                              <div className="text-[10px] text-gray-400 flex items-center gap-1 mt-0.5">
                                <Building className="w-2.5 h-2.5" />
                                <span>{user.company}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Security Tier */}
                      <td className="py-3.5 px-4">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${tierCfg.badgeColor}`}>
                          {tierCfg.label.split('•')[0]}
                        </span>
                        <div className="text-[10px] text-gray-500 font-medium mt-1">
                          {tierCfg.label.split('•')[1]}
                        </div>
                      </td>

                      {/* Role & Granular Entitlements */}
                      <td className="py-3.5 px-4 max-w-xs">
                        <div className="font-bold text-gray-800 text-[11px] mb-1">
                          {user.role.replace('_', ' ')}
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {perms.slice(0, 3).map(p => (
                            <span
                              key={p}
                              className="text-[9px] font-medium bg-gray-100 text-gray-700 px-1.5 py-0.5 rounded border border-gray-200"
                            >
                              {p.replace(/_/g, ' ')}
                            </span>
                          ))}
                          {perms.length > 3 && (
                            <span className="text-[9px] font-bold bg-[#D4AF37]/10 text-[#8B7355] px-1.5 py-0.5 rounded">
                              +{perms.length - 3} more
                            </span>
                          )}
                        </div>
                      </td>

                      {/* 2FA Status & MFA Key */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full border flex items-center gap-1 ${
                              user.twoFactorStatus === 'ENROLLED'
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : 'bg-amber-50 text-amber-700 border-amber-200'
                            }`}
                          >
                            <ShieldCheck className="w-3 h-3" />
                            <span>{user.twoFactorStatus || 'ENROLLED'}</span>
                          </span>
                        </div>
                        {user.mfaSecretKey && (
                          <div className="font-mono text-[10px] text-gray-400 mt-1">
                            Key: {user.mfaSecretKey.substring(0, 8)}... ({user.backupCodesRemaining || 8} codes)
                          </div>
                        )}
                      </td>

                      {/* Account Status */}
                      <td className="py-3.5 px-4">
                        <button
                          onClick={() => {
                            if (user.id === currentUser.id) {
                              addToast('error', 'Security Policy Violation: You cannot suspend your own active administrator account.');
                              return;
                            }
                            toggleUserStatus(user.id, user.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE');
                          }}
                          disabled={user.id === currentUser.id}
                          title={user.id === currentUser.id ? 'Active Admin cannot self-suspend' : `Set to ${user.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE'}`}
                          className={`text-[10px] font-bold px-2.5 py-1 rounded-full border transition-all ${
                            user.id === currentUser.id
                              ? 'bg-gray-100 text-gray-500 border-gray-200 cursor-not-allowed opacity-80'
                              : user.status === 'ACTIVE'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100 cursor-pointer'
                              : 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100 cursor-pointer'
                          }`}
                        >
                          {user.status || 'ACTIVE'}
                        </button>
                        <div className="text-[10px] text-gray-400 mt-0.5">
                          {user.lastLoginAt || 'Recently active'}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => openEditPermissionsModal(user)}
                            className="p-1.5 rounded-lg text-gray-700 hover:bg-gray-100 hover:text-black transition-colors cursor-pointer"
                            title="Edit Role & Granular Entitlements"
                          >
                            <Sliders className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleRotateKey(user)}
                            className="p-1.5 rounded-lg text-amber-700 hover:bg-amber-50 transition-colors cursor-pointer"
                            title="Rotate 2FA Token & Backup Codes"
                          >
                            <Key className="w-4 h-4" />
                          </button>
                          {user.id !== currentUser.id && (
                            <button
                              onClick={() => handleDeleteUser(user)}
                              className="p-1.5 rounded-lg text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                              title="Delete Identity Record"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab Content: Active IAM Sessions */}
      {activeTab === 'sessions' && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-2xs overflow-hidden">
          <div className="p-4 bg-[#FAF8F5] border-b border-gray-200 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-xs text-[#2C2416]">Concurrent TLS / IAM Sessions</h3>
              <p className="text-[11px] text-gray-500">
                Real-time tracking of authenticated edge tokens and cryptographic device signatures.
              </p>
            </div>
            <span className="text-[11px] font-mono font-bold bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded-md border border-emerald-200">
              {activeSessions.length} Active Sessions
            </span>
          </div>

          <div className="divide-y divide-gray-100">
            {activeSessions.map(session => (
              <div key={session.id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gray-100 border border-gray-200 flex items-center justify-center text-gray-700">
                    <Laptop className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-gray-900">{session.userName}</span>
                      <span className="text-[10px] font-mono bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">
                        {session.device}
                      </span>
                    </div>
                    <div className="text-[11px] text-gray-500 flex items-center gap-2 mt-0.5">
                      <span className="flex items-center gap-1">
                        <Globe className="w-3 h-3 text-gray-400" />
                        <span>{session.ipAddress} ({session.location})</span>
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-gray-400" />
                        <span>Last active: {session.lastActive}</span>
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                    {session.twoFactorVerified ? '2FA Certified' : 'Passkey Valid'}
                  </span>
                  <button
                    onClick={() => revokeUserSession(session.id)}
                    className="px-3 py-1.5 rounded-xl border border-red-200 text-red-700 hover:bg-red-50 text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Revoke Token</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab Content: Permissions Matrix */}
      {activeTab === 'permissions' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {ALL_IAM_PERMISSIONS.map(perm => (
            <div key={perm.id} className="bg-white p-4 rounded-2xl border border-gray-200 shadow-2xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#D4AF37] bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                  {perm.category}
                </span>
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
              </div>
              <h4 className="font-serif font-bold text-xs text-[#2C2416]">{perm.label}</h4>
              <p className="text-[11px] text-gray-500 leading-relaxed">{perm.description}</p>
              <div className="text-[10px] font-mono text-gray-400 pt-1 border-t border-gray-100">
                Key: {perm.id}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal: Provision User Access (Gated by 2FA) */}
      {isProvisionModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-gray-200 overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
            <div className="bg-[#2C2416] p-6 text-white relative">
              <button
                onClick={() => setIsProvisionModalOpen(false)}
                className="absolute top-4 right-4 p-1.5 rounded-full text-gray-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#D4AF37]/20 border border-[#D4AF37]/40 flex items-center justify-center text-[#D4AF37]">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] uppercase font-mono tracking-widest text-[#D4AF37] font-bold">
                    Zero-Trust IAM Provisioning
                  </span>
                  <h3 className="text-lg font-serif font-bold text-white">
                    Grant Privileged User Access
                  </h3>
                </div>
              </div>
            </div>

            <form onSubmit={handleProvisionSubmit} className="p-6 space-y-4 overflow-y-auto flex-1 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-semibold text-gray-700 block mb-1">Full Legal Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Eleanor Vance"
                    value={newUserName}
                    onChange={e => setNewUserName(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl focus:bg-white focus:border-[#D4AF37] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="font-semibold text-gray-700 block mb-1">Corporate Email Address *</label>
                  <input
                    type="email"
                    required
                    placeholder="eleanor.vance@vertex.studio"
                    value={newUserEmail}
                    onChange={e => setNewUserEmail(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl focus:bg-white focus:border-[#D4AF37] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="font-semibold text-gray-700 block mb-1">Assigned Role</label>
                  <select
                    value={newUserRole}
                    onChange={e => handleRoleChangeInProvision(e.target.value as UserRole)}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl focus:bg-white focus:border-[#D4AF37] focus:outline-none font-medium"
                  >
                    <option value="ADMIN">ADMIN (Sovereign)</option>
                    <option value="PROJECT_MANAGER">PROJECT MANAGER</option>
                    <option value="DESIGNER">DESIGNER</option>
                    <option value="SITE_ENGINEER">SITE ENGINEER</option>
                    <option value="FINANCE">FINANCE OFFICER</option>
                    <option value="CLIENT">CLIENT STAKEHOLDER</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-gray-700 block mb-1">Security Tier</label>
                  <select
                    value={newUserTier}
                    onChange={e => setNewUserTier(e.target.value as SecurityTier)}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl focus:bg-white focus:border-[#D4AF37] focus:outline-none font-medium"
                  >
                    <option value="TIER_1_SOVEREIGN">Tier 1 Sovereign</option>
                    <option value="TIER_2_PRINCIPAL">Tier 2 Principal</option>
                    <option value="TIER_3_SPECIALIST">Tier 3 Specialist</option>
                    <option value="TIER_4_CLIENT">Tier 4 Client</option>
                    <option value="TIER_5_CONTRACTOR">Tier 5 Contractor</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-gray-700 block mb-1">Entity / Affiliation</label>
                  <input
                    type="text"
                    placeholder="VERTEX Studio"
                    value={newUserCompany}
                    onChange={e => setNewUserCompany(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl focus:bg-white focus:border-[#D4AF37] focus:outline-none"
                  />
                </div>
              </div>

              {/* Granular Entitlements Checklist */}
              <div>
                <label className="font-semibold text-gray-800 block mb-2 text-xs">
                  Granular Entitlement Grants ({newUserPermissions.length} selected):
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 bg-gray-50 p-3 rounded-2xl border border-gray-200 max-h-48 overflow-y-auto">
                  {ALL_IAM_PERMISSIONS.map(perm => {
                    const checked = newUserPermissions.includes(perm.id);
                    return (
                      <label
                        key={perm.id}
                        className={`flex items-start gap-2 p-2 rounded-xl border transition-all cursor-pointer ${
                          checked
                            ? 'bg-amber-50/80 border-amber-300 text-amber-950 font-semibold'
                            : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-100'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => togglePermission(perm.id, false)}
                          className="mt-0.5 rounded text-[#D4AF37] focus:ring-[#D4AF37]"
                        />
                        <div className="text-[11px] leading-tight">
                          <div>{perm.label}</div>
                          <div className="text-[9px] text-gray-400 mt-0.5">{perm.category}</div>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Callout on 2FA Gating */}
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 flex items-center gap-2 text-amber-900 text-xs">
                <Key className="w-4 h-4 text-amber-700 shrink-0" />
                <span>
                  Clicking <strong>Provision Identity</strong> will prompt for your Admin 2FA Hardware Key, generate an MFA QR package, and issue 8 recovery codes.
                </span>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setIsProvisionModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-50 font-bold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-[#D4AF37] hover:bg-[#B8860B] text-white font-bold shadow-sm transition-all flex items-center gap-2 cursor-pointer"
                >
                  <Fingerprint className="w-4 h-4" />
                  <span>Verify with 2FA & Provision</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Edit User Role & Permissions (Gated by 2FA) */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-gray-200 overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
            <div className="bg-[#2C2416] p-6 text-white relative">
              <button
                onClick={() => setEditingUser(null)}
                className="absolute top-4 right-4 p-1.5 rounded-full text-gray-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#D4AF37]/20 border border-[#D4AF37]/40 flex items-center justify-center text-[#D4AF37]">
                  <Sliders className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] uppercase font-mono tracking-widest text-[#D4AF37] font-bold">
                    IAM Policy Configuration
                  </span>
                  <h3 className="text-lg font-serif font-bold text-white">
                    {editingUser.name} ({editingUser.email})
                  </h3>
                </div>
              </div>
            </div>

            <form onSubmit={handleSavePermissions} className="p-6 space-y-4 overflow-y-auto flex-1 text-xs">
              <div>
                <label className="font-semibold text-gray-700 block mb-1">Assigned Role</label>
                <select
                  value={editRole}
                  onChange={e => setEditRole(e.target.value as UserRole)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl focus:bg-white focus:border-[#D4AF37] focus:outline-none font-medium"
                >
                  <option value="ADMIN">ADMIN (Full Access)</option>
                  <option value="PROJECT_MANAGER">PROJECT MANAGER</option>
                  <option value="DESIGNER">DESIGNER</option>
                  <option value="SITE_ENGINEER">SITE ENGINEER</option>
                  <option value="FINANCE">FINANCE OFFICER</option>
                  <option value="CLIENT">CLIENT STAKEHOLDER</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-gray-800 block mb-2 text-xs">
                  Entitlements Policy Grants:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 bg-gray-50 p-3 rounded-2xl border border-gray-200 max-h-56 overflow-y-auto">
                  {ALL_IAM_PERMISSIONS.map(perm => {
                    const checked = editPermissions.includes(perm.id);
                    return (
                      <label
                        key={perm.id}
                        className={`flex items-start gap-2 p-2 rounded-xl border transition-all cursor-pointer ${
                          checked
                            ? 'bg-amber-50/80 border-amber-300 text-amber-950 font-semibold'
                            : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-100'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => togglePermission(perm.id, true)}
                          className="mt-0.5 rounded text-[#D4AF37] focus:ring-[#D4AF37]"
                        />
                        <div className="text-[11px] leading-tight">
                          <div>{perm.label}</div>
                          <div className="text-[9px] text-gray-400 mt-0.5">{perm.category}</div>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 flex items-center gap-2 text-amber-900 text-xs">
                <ShieldCheck className="w-4 h-4 text-amber-700 shrink-0" />
                <span>
                  Policy re-grants require biometric 2FA sign-off and will be recorded into the immutable audit ledger.
                </span>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="px-4 py-2.5 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-50 font-bold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-[#D4AF37] hover:bg-[#B8860B] text-white font-bold shadow-sm transition-all flex items-center gap-2 cursor-pointer"
                >
                  <Fingerprint className="w-4 h-4" />
                  <span>Verify with 2FA & Apply</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
