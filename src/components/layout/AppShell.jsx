import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { PageTitleProvider } from '../../context/PageTitleContext.jsx'
import { Sidebar } from './Sidebar.jsx'
import { TopNav } from './TopNav.jsx'
import { useAuth } from '../../features/auth/useAuth.js'

export function AppShell() {
  const { signOut } = useAuth()
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <PageTitleProvider>
    <div className="flex h-full min-h-0 w-full overflow-hidden bg-[#eef2f7]">
      <Sidebar
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed((c) => !c)}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
      />
      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <TopNav onSignOut={signOut} onMenuClick={() => setMobileOpen(true)} />
        <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden overscroll-y-contain bg-[radial-gradient(circle_at_top_right,#fff4d6_0%,#f7f6f3_35%,#eef2f7_100%)] p-3 sm:p-4 lg:p-4 xl:p-6">
          <Outlet />
        </div>
      </div>
    </div>
    </PageTitleProvider>
  )
}
