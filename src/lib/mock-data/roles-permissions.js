/**
 * Demo RBAC aligned with BRD §2.3, §4.8.6 (User Roles & Permissions), §4.8.7, §5.2.
 * Phase 1 admin roles: Super Admin, University Admin, Admissions Manager, Admissions Officer, Finance.
 */

/** @typedef {'none' | 'view' | 'edit' | 'full'} PermissionLevel */

/** Screens / modules enforceable via RBAC */
export const rbacModules = [
  { id: 'dashboard', label: 'Dashboard', description: 'KPIs, funnel, charts' },
  { id: 'applications', label: 'Applications', description: 'List, detail, pipeline actions' },
  { id: 'communications', label: 'Communications', description: 'Email, templates, bulk send' },
  { id: 'reports', label: 'Reports', description: 'Exports and scheduled reports' },
  { id: 'announcements', label: 'Announcements', description: 'Applicant-facing notices' },
  { id: 'faq', label: 'FAQ', description: 'FAQ management' },
  { id: 'support_tickets', label: 'Support tickets', description: 'Applicant support queue' },
  { id: 'settings', label: 'Settings (masters)', description: 'Programs, intakes, fees, pipeline, etc.' },
  { id: 'users_logs', label: 'Users & logs', description: 'Admin users, login and audit logs' },
  { id: 'roles_permissions', label: 'Roles & permissions', description: 'Configure RBAC (Super Admin only)' },
]

export const rbacRoles = [
  {
    id: 'super_admin',
    name: 'Super Admin',
    summary: 'Full system control — all modules, all roles, all settings (BRD §2.3).',
    active: true,
    usersAssigned: 2,
  },
  {
    id: 'university_admin',
    name: 'University Admin',
    summary: 'Applications, portal settings, reports — broad operational access.',
    active: true,
    usersAssigned: 4,
  },
  {
    id: 'admissions_manager',
    name: 'Admissions Manager',
    summary: 'Oversight of pipeline, assignments, escalations, and team workload.',
    active: true,
    usersAssigned: 3,
  },
  {
    id: 'admissions_officer',
    name: 'Admissions Officer',
    summary: 'Day-to-day application processing, documents, and communications.',
    active: true,
    usersAssigned: 12,
  },
  {
    id: 'finance',
    name: 'Finance',
    summary: 'Fee transactions, revenue reporting, payment status updates.',
    active: true,
    usersAssigned: 2,
  },
]

/**
 * Matrix: role id → module id → level.
 * @type {Record<string, Record<string, PermissionLevel>>}
 */
export const rolePermissionMatrix = {
  super_admin: Object.fromEntries(rbacModules.map((m) => [m.id, 'full'])),
  university_admin: {
    dashboard: 'full',
    applications: 'full',
    communications: 'full',
    reports: 'full',
    announcements: 'full',
    faq: 'full',
    support_tickets: 'full',
    settings: 'full',
    users_logs: 'edit',
    roles_permissions: 'view',
  },
  admissions_manager: {
    dashboard: 'full',
    applications: 'full',
    communications: 'full',
    reports: 'view',
    announcements: 'edit',
    faq: 'view',
    support_tickets: 'full',
    settings: 'view',
    users_logs: 'view',
    roles_permissions: 'none',
  },
  admissions_officer: {
    dashboard: 'view',
    applications: 'edit',
    communications: 'edit',
    reports: 'view',
    announcements: 'view',
    faq: 'view',
    support_tickets: 'edit',
    settings: 'none',
    users_logs: 'none',
    roles_permissions: 'none',
  },
  finance: {
    dashboard: 'view',
    applications: 'view',
    communications: 'none',
    reports: 'full',
    announcements: 'none',
    faq: 'none',
    support_tickets: 'view',
    settings: 'view',
    users_logs: 'view',
    roles_permissions: 'none',
  },
}

export function permissionLabel(level) {
  switch (level) {
    case 'full':
      return 'Full'
    case 'edit':
      return 'Edit'
    case 'view':
      return 'View'
    default:
      return '—'
  }
}
