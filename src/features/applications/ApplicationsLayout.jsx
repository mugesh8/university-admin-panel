import { NavLink, Outlet, useLocation } from 'react-router-dom'

const TAB_PATHS = [
  '/applications',
  '/applications/drafts',
  '/applications/interviews',
  '/applications/payments',
  '/applications/enrolled-students',
  '/applications/documents',
]

function shouldShowApplicationTabs(path) {
  if (path === '/applications/new') return false
  if (TAB_PATHS.includes(path)) return true
  if (path.startsWith('/applications/drafts/')) return true
  return false
}

function tabClass(active) {
  return [
    'inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all duration-200',
    active
      ? 'bg-[#0A1628] text-white shadow-md shadow-[#0A1628]/25'
      : 'bg-white/90 text-[#0A1628]/70 ring-1 ring-[#0A1628]/10 hover:bg-[#f8fafc] hover:text-[#0A1628] hover:ring-[#0A1628]/20',
  ].join(' ')
}

export function ApplicationsLayout() {
  const { pathname } = useLocation()
  const path = pathname.replace(/\/$/, '') || '/'
  const showTabs = shouldShowApplicationTabs(path)

  return (
    <div className="mx-auto w-full max-w-[80rem]">
      {showTabs ? (
        <nav
          className="mb-6 flex flex-wrap gap-2 border-b border-[#0a1628]/[0.08] pb-4"
          aria-label="Applications sections"
        >
          <NavLink to="/applications" end className={({ isActive }) => tabClass(isActive)}>
            All applications
          </NavLink>
          <NavLink to="/applications/drafts" className={({ isActive }) => tabClass(isActive)}>
            Drafts
          </NavLink>
          <NavLink to="/applications/interviews" className={({ isActive }) => tabClass(isActive)}>
            Interviews
          </NavLink>
          <NavLink to="/applications/payments" className={({ isActive }) => tabClass(isActive)}>
            Payments
          </NavLink>
          <NavLink to="/applications/enrolled-students" className={({ isActive }) => tabClass(isActive)}>
            Enrolled Students
          </NavLink>
          <NavLink to="/applications/documents" className={({ isActive }) => tabClass(isActive)}>
            Documents
          </NavLink>
        </nav>
      ) : null}
      <Outlet />
    </div>
  )
}
