import { UserRole } from '../types';

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
    roleTitle: 'Principal Architect & Managing Director',
    roleDescription: 'Full studio governance, contract authorization, system architecture, and forensic audit ledger access.'
  },
  PROJECT_MANAGER: {
    allowedViews: ['dashboard', 'projects', 'design-portal', 'financials', 'team-clients'],
    defaultView: 'dashboard',
    canCreateProject: true,
    canEditProject: true,
    canDeleteProject: false,
    canManageTeam: true,
    canOnboardClients: true,
    canViewAuditLogs: false, // Audit & Analytics is STRICTLY ADMIN ONLY
    canViewAllFinancials: true,
    canViewOwnFinancialsOnly: false,
    canManageExpenses: true,
    canManageChangeOrders: true,
    canEditDesignStudio: true,
    canViewDesignStudio: true,
    roleTitle: 'Lead Project Manager',
    roleDescription: 'Milestone tracking, team allocation, client communications, and active project budget oversight.'
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
    roleTitle: 'Architectural Designer & FF&E Specialist',
    roleDescription: 'Creative curation, 3D renderings, moodboards, finish schedules, and design revision sets.'
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
    canViewOwnFinancialsOnly: true, // Only own invoices and payments
    canManageExpenses: false,
    canManageChangeOrders: true, // Clients can approve/sign change orders
    canEditDesignStudio: false,
    canViewDesignStudio: true, // Review and sign off
    roleTitle: 'Estate Client & Beneficiary',
    roleDescription: 'Private client portal for assigned estate tracking, design approvals, and escrow billing statements.'
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
    canViewDesignStudio: true, // Technical drawings and specifications
    roleTitle: 'Principal Site & Structural Engineer',
    roleDescription: 'Structural integrity inspections, HVAC & MEP coordination, punch lists, and on-site field logs.'
  },
  FINANCE: {
    allowedViews: ['dashboard', 'projects', 'financials'],
    defaultView: 'financials',
    canCreateProject: false,
    canEditProject: false,
    canDeleteProject: false,
    canManageTeam: false,
    canOnboardClients: false,
    canViewAuditLogs: false, // Audit is strictly Admin only
    canViewAllFinancials: true,
    canViewOwnFinancialsOnly: false,
    canManageExpenses: true,
    canManageChangeOrders: true,
    canEditDesignStudio: false,
    canViewDesignStudio: false,
    roleTitle: 'Chief Financial Officer & Procurement Lead',
    roleDescription: 'Studio-wide accounts receivable, draw schedules, escrow management, vendor expenses, and cashflow.'
  }
};

export function hasViewAccess(role: UserRole, view: AppViewId): boolean {
  const permissions = ROLE_PERMISSIONS[role] || ROLE_PERMISSIONS.CLIENT;
  return permissions.allowedViews.includes(view);
}

export function getRolePermissions(role: UserRole): RolePermissions {
  return ROLE_PERMISSIONS[role] || ROLE_PERMISSIONS.CLIENT;
}
