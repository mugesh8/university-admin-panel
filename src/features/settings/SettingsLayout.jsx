import { NavLink, Outlet, useLocation } from 'react-router-dom'

const TAB_PATHS = [
  '/settings',
  '/settings/intakes',
  '/settings/fee-structure',
  '/settings/doc-requirements',
  '/settings/pipeline-stages',
  '/settings/dropdown-options',
]

function tabClass(active) {
  return [
    'inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold transition-all duration-200 sm:px-4 sm:py-2.5',
    active
      ? 'bg-[#0A1628] text-white shadow-md shadow-[#0A1628]/25'
      : 'bg-white/90 text-[#0A1628]/70 ring-1 ring-[#0A1628]/10 hover:bg-[#f8fafc] hover:text-[#0A1628] hover:ring-[#0A1628]/20',
  ].join(' ')
}

export function SettingsLayout() {
  const { pathname } = useLocation()
  const path = pathname.replace(/\/$/, '') || '/'
  const showTabs = TAB_PATHS.includes(path)

  return (
    <div className="mx-auto w-full max-w-[80rem]">
      {showTabs ? (
        <nav
          className="mb-6 flex flex-wrap gap-2 border-b border-[#0a1628]/[0.08] pb-4"
          aria-label="Settings sections"
        >
          <NavLink to="/settings" end className={({ isActive }) => tabClass(isActive)}>
            Programs
          </NavLink>
          <NavLink to="/settings/intakes" className={({ isActive }) => tabClass(isActive)}>
            Intakes
          </NavLink>
          <NavLink to="/settings/fee-structure" className={({ isActive }) => tabClass(isActive)}>
            Fee Structure
          </NavLink>
          <NavLink to="/settings/doc-requirements" className={({ isActive }) => tabClass(isActive)}>
            Doc Requirements
          </NavLink>
          <NavLink to="/settings/pipeline-stages" className={({ isActive }) => tabClass(isActive)}>
            Pipeline Stages
          </NavLink>
          <NavLink to="/settings/dropdown-options" className={({ isActive }) => tabClass(isActive)}>
            Dropdown Options
          </NavLink>
        </nav>
      ) : null}
      <Outlet />
    </div>
  )
}
