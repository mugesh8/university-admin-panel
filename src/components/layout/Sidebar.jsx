import { NavLink } from 'react-router-dom'
import { PanelLeftClose, PanelLeft } from 'lucide-react'
import { MUCM_CREST_URL } from '../../lib/brand.js'
import { sidebarNav } from '../../lib/nav.js'

export function Sidebar({ collapsed, onToggleCollapse, mobileOpen, onCloseMobile }) {
  return (
    <>
      {mobileOpen ? (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          aria-label="Close menu"
          onClick={onCloseMobile}
        />
      ) : null}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex h-full max-h-full w-[min(300px,calc(100vw-1.5rem))] shrink-0 flex-col overflow-hidden border-r border-white/10 bg-gradient-to-b from-[#071427] via-[#0A1628] to-[#0f2742] text-white transition-[width,transform] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] lg:static lg:max-h-none lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        } ${
          collapsed
            ? 'lg:w-[72px] xl:w-[80px] 2xl:w-[88px]'
            : 'lg:w-[240px] xl:w-[280px] 2xl:w-[320px]'
        }`}
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(212,168,67,0.24),transparent_45%)]" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(255,255,255,0.06),transparent_45%)]" />

        <div
          className={`relative flex h-full min-h-0 flex-col px-4 py-6 lg:py-5 lg:px-3.5 xl:px-5 xl:py-7 2xl:py-8 ${
          collapsed ? 'lg:px-2 xl:px-2.5' : ''
        }`}
        >
          <div
            className={`mb-3 flex shrink-0 items-center gap-2.5 border-b border-white/10 pb-3 xl:mb-4 xl:gap-3 xl:pb-4 ${collapsed ? 'lg:flex-col lg:items-center lg:gap-1.5 lg:border-0 lg:pb-2 xl:gap-2' : ''}`}
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-white/10 bg-white/[0.06] p-1 ring-1 ring-white/10 xl:h-11 xl:w-11 xl:rounded-xl">
              <img src={MUCM_CREST_URL} alt="" className="h-8 w-8 object-contain xl:h-9 xl:w-9" />
            </div>
            {!collapsed ? (
              <div className="min-w-0 leading-tight">
                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/50">MUCM</p>
                <p className="text-[13px] font-semibold text-white/90 xl:text-sm">Admin panel</p>
              </div>
            ) : null}
          </div>

          <nav
            className={`min-h-0 flex-1 space-y-2 overflow-y-auto overflow-x-hidden overscroll-y-contain pr-1 [scrollbar-color:rgba(255,255,255,0.25)_transparent] [scrollbar-width:thin] xl:space-y-2.5 ${
              collapsed ? 'lg:space-y-1.5 lg:pr-0 lg:[scrollbar-width:none] lg:[&::-webkit-scrollbar]:w-0' : ''
            }`}
            aria-label="Main"
          >
            {sidebarNav.map((item, index) => {
              if (item.type === 'section') {
                return collapsed ? null : (
                  <div key={`section-${item.label}-${index}`} className="pt-2 first:pt-0 xl:pt-3">
                    <p className="mb-1.5 px-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">
                      {item.label}
                    </p>
                  </div>
                )
              }

              const NavIcon = item.icon
              return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/dashboard'}
                title={collapsed ? item.label : undefined}
                onClick={onCloseMobile}
                className={({ isActive }) =>
                  `relative flex w-full items-center gap-2.5 overflow-hidden rounded-xl border text-left transition-all duration-300 xl:gap-3 xl:rounded-2xl ${
                    isActive
                      ? `border-[#D4A843]/70 bg-gradient-to-r from-[#D4A843]/25 to-[#D4A843]/5 text-[#f7dc95] shadow-lg shadow-[#D4A843]/10 ${
                          collapsed ? '' : 'animate-soft-pulse'
                        } ${
                          collapsed
                            ? 'lg:border-[#D4A843]/45 lg:bg-none lg:bg-[#D4A843]/14 lg:shadow-none lg:ring-1 lg:ring-inset lg:ring-[#D4A843]/35'
                            : ''
                        }`
                      : `border-white/10 bg-white/[0.02] text-white/75 hover:border-white/25 hover:bg-white/[0.05] ${
                          collapsed
                            ? 'lg:border-transparent lg:bg-transparent lg:hover:border-transparent lg:hover:bg-white/[0.06]'
                            : ''
                        }`
                  } ${collapsed ? 'lg:justify-center lg:px-0 lg:py-2 xl:py-2.5' : 'px-3 py-2.5 xl:px-3.5 xl:py-3'}`
                }
              >
                {({ isActive }) => (
                  <>
                    {isActive ? (
                      <span
                        className={`pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent via-[#fff6d8]/20 to-transparent ${
                          collapsed ? 'lg:hidden' : 'animate-shimmer'
                        }`}
                      />
                    ) : null}
                    <span
                      className={`inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border xl:h-9 xl:w-9 ${
                        isActive
                          ? 'border-[#D4A843]/60 bg-[#D4A843]/20 text-[#f7dc95]'
                          : 'border-white/20 bg-white/5 text-white/80'
                      } ${
                        collapsed
                          ? 'lg:h-7 lg:w-7 lg:rounded-md lg:border-0 lg:bg-transparent lg:text-current xl:h-8 xl:w-8'
                          : ''
                      }`}
                    >
                      <NavIcon className="h-4 w-4 shrink-0 xl:h-[18px] xl:w-[18px]" strokeWidth={1.65} aria-hidden />
                    </span>
                    {!collapsed ? (
                      <span className="min-w-0">
                        <strong className="block text-[13px] font-semibold leading-snug xl:text-sm">{item.label}</strong>
                      </span>
                    ) : null}
                  </>
                )}
              </NavLink>
              )
            })}
          </nav>

          <div className="mt-auto hidden shrink-0 border-t border-white/10 pt-2.5 lg:block xl:pt-3">
            <button
              type="button"
              onClick={onToggleCollapse}
              aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              className={`flex w-full items-center gap-2 rounded-lg py-2 text-[13px] font-medium text-white/55 transition hover:bg-white/[0.06] hover:text-white/90 xl:rounded-xl xl:py-2.5 xl:text-sm ${
                collapsed ? 'lg:justify-center lg:px-0' : 'px-2 text-left'
              }`}
            >
              {collapsed ? <PanelLeft className="h-4 w-4 shrink-0 xl:h-5 xl:w-5" /> : <PanelLeftClose className="h-4 w-4 shrink-0 xl:h-5 xl:w-5" />}
              {!collapsed ? <span>Collapse</span> : null}
            </button>
          </div>
        </div>
      </aside>
    </>
  )
}
