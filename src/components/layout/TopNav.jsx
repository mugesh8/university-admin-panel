import { useEffect, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Bell, LogOut, Menu, User, UserCircle } from 'lucide-react'
import { usePageTitleContext } from '../../context/PageTitleContext.jsx'
import { getPageTitleFromPath } from '../../lib/nav.js'

const SAMPLE_NOTIFICATIONS = [
  {
    id: 'n1',
    title: 'Application submitted',
    body: 'APP-2026-0142 — BSc Computer Science, Fall 2026.',
    time: '12 min ago',
  },
  {
    id: 'n2',
    title: 'Payment confirmed',
    body: 'Registration fee recorded for APP-2026-0098.',
    time: '1 hr ago',
  },
  {
    id: 'n3',
    title: 'Interview scheduled',
    body: 'Dean panel invite sent for APP-2026-0061.',
    time: 'Yesterday',
  },
]

export function TopNav({ onMenuClick, onSignOut }) {
  const { pathname } = useLocation()
  const { override } = usePageTitleContext()
  const pageTitle = override ?? getPageTitleFromPath(pathname)
  const [menuOpen, setMenuOpen] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)
  const accountWrapRef = useRef(null)
  const notifWrapRef = useRef(null)

  useEffect(() => {
    if (!menuOpen && !notifOpen) return
    function handlePointerDown(e) {
      if (accountWrapRef.current && !accountWrapRef.current.contains(e.target)) {
        setMenuOpen(false)
      }
      if (notifWrapRef.current && !notifWrapRef.current.contains(e.target)) {
        setNotifOpen(false)
      }
    }
    function handleKey(e) {
      if (e.key === 'Escape') {
        setMenuOpen(false)
        setNotifOpen(false)
      }
    }
    document.addEventListener('mousedown', handlePointerDown)
    document.addEventListener('keydown', handleKey)
    return () => {
      document.removeEventListener('mousedown', handlePointerDown)
      document.removeEventListener('keydown', handleKey)
    }
  }, [menuOpen, notifOpen])

  return (
    <header className="z-30 flex h-14 shrink-0 items-center justify-between gap-3 border-b border-[#0A1628]/10 bg-white/80 px-3 backdrop-blur-md sm:px-5">
      <div className="flex min-w-0 flex-1 items-center gap-1 sm:gap-2">
        <button
          type="button"
          className="shrink-0 rounded-xl p-2 text-[#0A1628] hover:bg-[#0A1628]/5 lg:hidden"
          aria-label="Open menu"
          onClick={onMenuClick}
        >
          <Menu className="h-5 w-5" />
        </button>
        <h1 className="min-w-0 truncate text-base font-semibold text-lg tracking-tight text-[#0A1628]">
          {pageTitle}
        </h1>
      </div>

      <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
        <div className="relative" ref={notifWrapRef}>
          <button
            type="button"
            aria-expanded={notifOpen}
            aria-haspopup="dialog"
            aria-label="Notifications"
            onClick={() => {
              setNotifOpen((o) => !o)
              setMenuOpen(false)
            }}
            className="relative flex h-10 w-10 items-center justify-center rounded-full border border-[#0A1628]/15 bg-[#0A1628]/5 text-[#0A1628] transition hover:border-[#D4A843]/50 hover:bg-[#D4A843]/10 hover:text-[#0A1628] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4A843]/60"
          >
            <Bell className="h-5 w-5" strokeWidth={1.75} aria-hidden />
            <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-[#c2410c] ring-2 ring-white" aria-hidden />
          </button>

          {notifOpen ? (
            <div
              role="dialog"
              aria-label="Notifications"
              className="absolute right-0 z-50 mt-1.5 w-[min(100vw-1.5rem,20rem)] overflow-hidden rounded-xl border border-[#0A1628]/10 bg-white shadow-lg shadow-[#0A1628]/10"
            >
              <div className="border-b border-[#0A1628]/8 px-3 py-2.5">
                <p className="text-sm font-semibold text-[#0A1628]">Notifications</p>
                <p className="text-xs text-[#0A1628]/60">Recent updates</p>
              </div>
              <ul className="max-h-[min(60vh,18rem)] divide-y divide-[#0A1628]/8 overflow-y-auto overscroll-contain">
                {SAMPLE_NOTIFICATIONS.map((n) => (
                  <li key={n.id}>
                    <button
                      type="button"
                      className="flex w-full flex-col gap-0.5 px-3 py-3 text-left transition hover:bg-[#0A1628]/[0.04]"
                    >
                      <span className="text-sm font-medium text-[#0A1628]">{n.title}</span>
                      <span className="text-xs leading-snug text-[#0A1628]/70">{n.body}</span>
                      <span className="text-[10px] font-medium uppercase tracking-wide text-[#0A1628]/45">
                        {n.time}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
              <div className="border-t border-[#0A1628]/8 p-2">
                <button
                  type="button"
                  className="w-full rounded-lg py-2 text-center text-sm font-semibold text-[#0A1628] transition hover:bg-[#0A1628]/5"
                  onClick={() => setNotifOpen(false)}
                >
                  View more
                </button>
              </div>
            </div>
          ) : null}
        </div>

        <div className="relative shrink-0" ref={accountWrapRef}>
        <button
          type="button"
          aria-expanded={menuOpen}
          aria-haspopup="menu"
          aria-label="Account menu"
          onClick={() => {
            setMenuOpen((o) => !o)
            setNotifOpen(false)
          }}
          className="flex h-10 w-10 items-center justify-center rounded-full border border-[#0A1628]/15 bg-[#0A1628]/5 text-[#0A1628] transition hover:border-[#D4A843]/50 hover:bg-[#D4A843]/10 hover:text-[#0A1628] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4A843]/60"
        >
          <User className="h-5 w-5" strokeWidth={1.75} aria-hidden />
        </button>

        {menuOpen ? (
          <div
            role="menu"
            aria-orientation="vertical"
            className="absolute right-0 z-50 mt-1.5 min-w-[11rem] overflow-hidden rounded-xl border border-[#0A1628]/10 bg-white py-1 shadow-lg shadow-[#0A1628]/10"
          >
            <Link
              to="/account"
              role="menuitem"
              className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm font-medium text-[#0A1628] transition hover:bg-[#0A1628]/5"
              onClick={() => setMenuOpen(false)}
            >
              <UserCircle className="h-4 w-4 shrink-0 text-[#0A1628]/70" aria-hidden />
              Account
            </Link>
            <button
              type="button"
              role="menuitem"
              className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm font-medium text-[#0A1628] transition hover:bg-red-50 hover:text-red-700"
              onClick={() => {
                setMenuOpen(false)
                onSignOut()
              }}
            >
              <LogOut className="h-4 w-4 shrink-0" aria-hidden />
              Logout
            </button>
          </div>
        ) : null}
        </div>
      </div>
    </header>
  )
}
