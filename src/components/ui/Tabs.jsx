import { createContext, useCallback, useContext, useMemo, useState } from 'react'

const TabsCtx = createContext(null)

export function Tabs({ defaultValue, children, value: controlled, onValueChange }) {
  const [uncontrolled, setUncontrolled] = useState(defaultValue)
  const isControlled = controlled !== undefined
  const value = isControlled ? controlled : uncontrolled
  const setValue = useCallback(
    (v) => {
      if (!isControlled) setUncontrolled(v)
      onValueChange?.(v)
    },
    [isControlled, onValueChange],
  )
  const api = useMemo(() => ({ value, setValue }), [value, setValue])
  return <TabsCtx.Provider value={api}>{children}</TabsCtx.Provider>
}

export function TabList({ children, className = '' }) {
  return (
    <div
      role="tablist"
      className={`flex flex-wrap gap-1 border-b border-[var(--color-border)] ${className}`}
    >
      {children}
    </div>
  )
}

export function TabTrigger({ value, children }) {
  const ctx = useContext(TabsCtx)
  if (!ctx) throw new Error('TabTrigger outside Tabs')
  const active = ctx.value === value
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={() => ctx.setValue(value)}
      className={`relative px-4 py-2.5 text-sm font-medium transition-colors ${
        active
          ? 'text-[var(--color-primary)] after:absolute after:inset-x-2 after:bottom-0 after:h-0.5 after:rounded-full after:bg-[var(--color-primary)]'
          : 'text-[var(--color-text-muted)] hover:text-[var(--color-heading)]'
      }`}
    >
      {children}
    </button>
  )
}

export function TabPanel({ value, children, className = '' }) {
  const ctx = useContext(TabsCtx)
  if (!ctx) throw new Error('TabPanel outside Tabs')
  if (ctx.value !== value) return null
  return (
    <div role="tabpanel" className={`pt-4 ${className}`}>
      {children}
    </div>
  )
}
