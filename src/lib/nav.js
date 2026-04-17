import {
  LayoutDashboard,
  FileText,
  Mail,
  BarChart3,
  Settings,
  Megaphone,
  HelpCircle,
  LifeBuoy,
  Shield,
} from 'lucide-react'

export const sidebarNav = [
  { type: 'link', to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { type: 'link', to: '/applications', label: 'Applications', icon: FileText },
  { type: 'link', to: '/communications', label: 'Communications', icon: Mail },
  { type: 'link', to: '/reports', label: 'Reports', icon: BarChart3 },
  { type: 'link', to: '/announcements', label: 'Announcements', icon: Megaphone },
  { type: 'link', to: '/faq', label: 'FAQ', icon: HelpCircle },
  { type: 'link', to: '/support-tickets', label: 'Support tickets', icon: LifeBuoy },
  { type: 'link', to: '/roles-permissions', label: 'Roles & permissions', icon: Shield },
  { type: 'link', to: '/settings', label: 'Settings', icon: Settings },
]

export const routeTitles = {
  '/dashboard': 'Dashboard',
  '/account': 'Account',
  '/settings': 'Programs',
  '/settings/intakes': 'Intakes',
  '/settings/fee-structure': 'Fee structure',
  '/settings/doc-requirements': 'Document requirements',
  '/settings/pipeline-stages': 'Pipeline stages',
  '/settings/dropdown-options': 'Dropdown options',
  '/applications': 'Applications',
  '/applications/new': 'New application',
  '/applications/drafts': 'Drafts',
  '/applications/interviews': 'Interviews',
  '/applications/payments': 'Payments',
  '/applications/enrolled-students': 'Enrolled students',
  '/applications/documents': 'Documents',
  '/communications': 'Compose email',
  '/communications/templates': 'Email templates',
  '/communications/bulk-messages': 'Bulk messages',
  '/reports': 'Reports',
  '/announcements': 'Announcements',
  '/faq': 'FAQ management',
  '/support-tickets': 'Support tickets',
  '/roles-permissions': 'Roles & permissions',
}

const RESERVED_APPLICATION_SEGMENTS = new Set([
  'new',
  'drafts',
  'interviews',
  'payments',
  'enrolled-students',
  'documents',
])

/**
 * Static title from URL, or null when the route needs a dynamic override (e.g. application detail).
 */
export function getPageTitleFromPath(pathname) {
  const p = pathname.replace(/\/$/, '') || '/'
  if (routeTitles[p]) return routeTitles[p]

  const parts = p.split('/').filter(Boolean)
  if (parts[0] === 'applications' && parts[1] === 'drafts' && parts.length === 3) {
    return 'Draft application'
  }
  if (parts[0] === 'applications' && parts.length === 2 && !RESERVED_APPLICATION_SEGMENTS.has(parts[1])) {
    return 'Application'
  }

  return routeTitles[p] ?? 'University admin'
}
