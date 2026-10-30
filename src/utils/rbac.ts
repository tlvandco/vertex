import { UserRole, IAMPermission } from '../types';

export type AppViewId = 'dashboard' | 'projects' | 'design-portal' | 'financials' | 'team-clients' | 'analytics';

export interface RolePermissions {
  allowedViews: AppViewId[];
  defaultView: AppViewId;
  canCreateProject: boolean;
  canEditProject: boolean;
  canDeleteProject: boolean;
  canManageTeam: boolean;
  canOnboardClients: boolean;
  canViewAuditLogs: boolean;
  canViewAllFinancials: boolean;
  canViewOwnFinancialsOnly: boolean;
  canManageExpenses: boolean;
  canManageChangeOrders: boolean;
  canEditDesignStudio: boolean;
  canViewDesignStudio: boolean;
  roleTitle: string;
  roleDescription: string;
}

export const ALL_APP_VIEWS: AppViewId[] = [
  'dashboard',
  'projects',
  'design-portal',
  'financials',
  'team-clients',
  'analytics'
];

export const VIEW_REQUIRED_PERMISSIONS: Record<AppViewId, IAMPermission[]> = {
  dashboard: ['VIEW_DASHBOARD_ANALYTICS'],
  projects: [
    'MANAGE_PROJECTS',
    'MANAGE_TASKS',
    'MANAGE_PROJECTS_MILESTONES',
    'VIEW_PROJECT_DOCUMENTS',
    'CLIENT_PORTAL_VIEW'
  ],
  'design-portal': [
    'VIEW_DESIGN_PORTAL',
    'MANAGE_DESIGN_STUDIO',
    'GENERATE_AI_CONCEPTS',
    'DESIGN_PORTAL_WRITE'
  ],
  financials: [
    'VIEW_FINANCIALS',
    'MANAGE_FINANCIALS',
    'APPROVE_BUDGET_DRAWS',
    'ISSUE_INVOICES',
    'PROCESS_POS',
    'ACCESS_POS_TERMINAL',
    'EXECUTE_LEGAL_CONTRACTS',
    'MANAGE_CATALOG',
    'APPLY_CATALOG_BUDGET'
  ],
  'team-clients': [
    'MANAGE_TEAM_CLIENTS',
    'MANAGE_IAM_STAFF',
    'MANAGE_IAM_USERS',
    'ONBOARD_CLIENT_ACCOUNTS',
    'MANAGE_COMPANIES',
    'AUDIT_NDA_DOCUMENTS'
  ],
  analytics: [
    'VIEW_SYSTEM_AUDIT_LOGS',
    'EXPORT_AUDIT_LOGS',
    'EXPORT_FORENSIC_LOGS',
    'DATABASE_SCHEMA_EXPLORER',
    'CLUSTER_TELEMETRY',
    'SYSTEM_ADMIN_CONFIG'
  ]
};

export const ROLE_METADATA: Record<
  UserRole,
  { roleTitle: string; roleDescription: string; defaultView: AppViewId }
> = {
  ADMIN: {
    roleTitle: 'Principal Architect & Managing Director',
    roleDescription: 'Full studio governance, contract authorization, system architecture, and forensic audit ledger access.',
    defaultView: 'dashboard'
  },
  PROJECT_MANAGER: {
    roleTitle: 'Lead Project Manager',
    roleDescription: 'Milestone tracking, team allocation, client communications, and active project budget oversight.',
    defaultView: 'dashboard'
  },
  DESIGNER: {
    roleTitle: 'Architectural Designer & FF&E Specialist',
    roleDescription: 'Creative curation, 3D renderings, moodboards, finish schedules, and design revision sets.',
    defaultView: 'design-portal'
  },
  CLIENT: {
    roleTitle: 'Estate Client & Beneficiary',
    roleDescription: 'Private client portal for assigned estate tracking, design approvals, and escrow billing statements.',
    defaultView: 'dashboard'
  },
  SITE_ENGINEER: {
    roleTitle: 'Principal Site & Structural Engineer',
    roleDescription: 'Structural integrity inspections, HVAC & MEP coordination, punch lists, and on-site field logs.',
    defaultView: 'projects'
  },
  FINANCE: {
    roleTitle: 'Chief Financial Officer & Procurement Lead',
    roleDescription: 'Studio-wide accounts receivable, draw schedules, escrow management, vendor expenses, and cashflow.',
    defaultView: 'financials'
  }
};

export const ROLE_PERMISSIONS: Record<UserRole, RolePermissions> = {
  ADMIN: {
    allowedViews: ['dashboard', 'projects', 'design-portal', 'financials', 'team-clients', 'analytics'],
    defaultView: 'dashboard',
    canCreateProject: true,
    canEditProject: true,
    canDeleteProject: true,
    canManageTeam: true,
    canOnboardClients: true,
    canViewAuditLogs: true,
    canViewAllFinancials: true,
    canViewOwnFinancialsOnly: false,
    canManageExpenses: true,
    canManageChangeOrders: true,
    canEditDesignStudio: true,
    canViewDesignStudio: true,
    roleTitle: ROLE_METADATA.ADMIN.roleTitle,
    roleDescription: ROLE_METADATA.ADMIN.roleDescription
  },
  PROJECT_MANAGER: {
    allowedViews: ['dashboard', 'projects', 'design-portal', 'financials', 'team-clients'],
    defaultView: 'dashboard',
    canCreateProject: true,
    canEditProject: true,
    canDeleteProject: false,
    canManageTeam: true,
    canOnboardClients: true,
    canViewAuditLogs: false,
    canViewAllFinancials: true,
    canViewOwnFinancialsOnly: false,
    canManageExpenses: true,
    canManageChangeOrders: true,
    canEditDesignStudio: true,
    canViewDesignStudio: true,
    roleTitle: ROLE_METADATA.PROJECT_MANAGER.roleTitle,
    roleDescription: ROLE_METADATA.PROJECT_MANAGER.roleDescription
  },
  DESIGNER: {
    allowedViews: ['dashboard', 'projects', 'design-portal'],
    defaultView: 'design-portal',
    canCreateProject: false,
    canEditProject: false,
    canDeleteProject: false,
    canManageTeam: false,
    canOnboardClients: false,
    canViewAuditLogs: false,
    canViewAllFinancials: false,
    canViewOwnFinancialsOnly: false,
    canManageExpenses: false,
    canManageChangeOrders: false,
    canEditDesignStudio: true,
    canViewDesignStudio: true,
    roleTitle: ROLE_METADATA.DESIGNER.roleTitle,
    roleDescription: ROLE_METADATA.DESIGNER.roleDescription
  },
  CLIENT: {
    allowedViews: ['dashboard', 'projects', 'design-portal', 'financials'],
    defaultView: 'dashboard',
    canCreateProject: false,
    canEditProject: false,
    canDeleteProject: false,
    canManageTeam: false,
    canOnboardClients: false,
    canViewAuditLogs: false,
    canViewAllFinancials: false,
    canViewOwnFinancialsOnly: true,
    canManageExpenses: false,
    canManageChangeOrders: true,
    canEditDesignStudio: false,
    canViewDesignStudio: true,
    roleTitle: ROLE_METADATA.CLIENT.roleTitle,
    roleDescription: ROLE_METADATA.CLIENT.roleDescription
  },
  SITE_ENGINEER: {
    allowedViews: ['dashboard', 'projects', 'design-portal'],
    defaultView: 'projects',
    canCreateProject: false,
    canEditProject: false,
    canDeleteProject: false,
    canManageTeam: false,
    canOnboardClients: false,
    canViewAuditLogs: false,
    canViewAllFinancials: false,
    canViewOwnFinancialsOnly: false,
    canManageExpenses: false,
    canManageChangeOrders: false,
    canEditDesignStudio: false,
    canViewDesignStudio: true,
    roleTitle: ROLE_METADATA.SITE_ENGINEER.roleTitle,
    roleDescription: ROLE_METADATA.SITE_ENGINEER.roleDescription
  },
  FINANCE: {
    allowedViews: ['dashboard', 'projects', 'financials'],
    defaultView: 'financials',
    canCreateProject: false,
    canEditProject: false,
    canDeleteProject: false,
    canManageTeam: false,
    canOnboardClients: false,
    canViewAuditLogs: false,
    canViewAllFinancials: true,
    canViewOwnFinancialsOnly: false,
    canManageExpenses: true,
    canManageChangeOrders: true,
    canEditDesignStudio: false,
    canViewDesignStudio: false,
    roleTitle: ROLE_METADATA.FINANCE.roleTitle,
    roleDescription: ROLE_METADATA.FINANCE.roleDescription
  }
};

/**
 * Dynamically resolves whether a user/role has access to a specific view.
 * If customPermissions is provided (from live role policy or user assignment),
 * it evaluates against live permissions instead of static defaults.
 */
export function hasViewAccess(
  role: UserRole,
  view: AppViewId,
  customPermissions?: IAMPermission[]
): boolean {
  if (role === 'ADMIN') return true;

  if (customPermissions && Array.isArray(customPermissions)) {
    if (customPermissions.includes('ADMIN_FULL_ACCESS')) return true;

    if (view === 'dashboard') {
      return (
        customPermissions.includes('VIEW_DASHBOARD_ANALYTICS') ||
        customPermissions.length > 0
      );
    }

    const required = VIEW_REQUIRED_PERMISSIONS[view] || [];
    return required.some(p => customPermissions.includes(p));
  }

  const permissions = ROLE_PERMISSIONS[role] || ROLE_PERMISSIONS.CLIENT;
  return permissions.allowedViews.includes(view);
}

/**
 * Dynamically calculates role permissions, merging custom permission overrides if supplied.
 */
export function getRolePermissions(
  role: UserRole,
  customPermissions?: IAMPermission[]
): RolePermissions {
  const meta = ROLE_METADATA[role] || ROLE_METADATA.CLIENT;
  const staticPerms = ROLE_PERMISSIONS[role] || ROLE_PERMISSIONS.CLIENT;

  if (!customPermissions || !Array.isArray(customPermissions)) {
    return staticPerms;
  }

  const isRootAdmin = role === 'ADMIN' || customPermissions.includes('ADMIN_FULL_ACCESS');
  const allowedViews = ALL_APP_VIEWS.filter(v =>
    hasViewAccess(role, v, customPermissions)
  );

  const defaultView = allowedViews.includes(meta.defaultView)
    ? meta.defaultView
    : allowedViews[0] || 'dashboard';

  return {
    allowedViews,
    defaultView,
    canCreateProject: isRootAdmin || customPermissions.includes('MANAGE_PROJECTS'),
    canEditProject: isRootAdmin || customPermissions.includes('MANAGE_PROJECTS'),
    canDeleteProject: isRootAdmin,
    canManageTeam: isRootAdmin || customPermissions.includes('MANAGE_TEAM_CLIENTS') || customPermissions.includes('MANAGE_IAM_STAFF'),
    canOnboardClients: isRootAdmin || customPermissions.includes('ONBOARD_CLIENT_ACCOUNTS'),
    canViewAuditLogs: isRootAdmin || customPermissions.includes('VIEW_SYSTEM_AUDIT_LOGS') || customPermissions.includes('EXPORT_AUDIT_LOGS'),
    canViewAllFinancials: isRootAdmin || customPermissions.includes('VIEW_FINANCIALS') || customPermissions.includes('MANAGE_FINANCIALS'),
    canViewOwnFinancialsOnly: role === 'CLIENT',
    canManageExpenses: isRootAdmin || customPermissions.includes('MANAGE_FINANCIALS') || customPermissions.includes('APPROVE_BUDGET_DRAWS'),
    canManageChangeOrders: isRootAdmin || customPermissions.includes('MANAGE_PROJECTS') || customPermissions.includes('MANAGE_FINANCIALS') || role === 'CLIENT',
    canEditDesignStudio: isRootAdmin || customPermissions.includes('MANAGE_DESIGN_STUDIO') || customPermissions.includes('DESIGN_PORTAL_WRITE'),
    canViewDesignStudio: isRootAdmin || customPermissions.includes('VIEW_DESIGN_PORTAL') || customPermissions.includes('MANAGE_DESIGN_STUDIO'),
    roleTitle: meta.roleTitle,
    roleDescription: meta.roleDescription
  };
}
