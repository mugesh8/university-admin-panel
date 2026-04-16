import { NavLink, Outlet, useLocation } from 'react-router-dom'

const TAB_PATHS = ['/communications', '/communications/templates', '/communications/bulk-messages']

function tabClass(active) {
  return [
    'inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all duration-200',
    active
      ? 'bg-[#0A1628] text-white shadow-md shadow-[#0A1628]/25'
      : 'bg-white/90 text-[#0A1628]/70 ring-1 ring-[#0A1628]/10 hover:bg-[#f8fafc] hover:text-[#0A1628] hover:ring-[#0A1628]/20',
  ].join(' ')
}

export function CommunicationsLayout() {
  const { pathname } = useLocation()
  const path = pathname.replace(/\/$/, '') || '/'
  const showTabs = TAB_PATHS.includes(path)

  return (
    <div className="mx-auto w-full max-w-[80rem]">
      {showTabs ? (
        <nav
          className="mb-6 flex flex-wrap gap-2 border-b border-[#0a1628]/[0.08] pb-4"
          aria-label="Communications sections"
        >
          <NavLink to="/communications" end className={({ isActive }) => tabClass(isActive)}>
            Compose Email
          </NavLink>
          <NavLink to="/communications/templates" className={({ isActive }) => tabClass(isActive)}>
            Email Templates
          </NavLink>
          <NavLink to="/communications/bulk-messages" className={({ isActive }) => tabClass(isActive)}>
            Bulk messages
          </NavLink>
        </nav>
      ) : null}
      <Outlet />
    </div>
  )
}
