import { useEffect, useRef, useState } from 'react'
import { ChevronDown } from 'lucide-react'

/**
 * Checkbox dropdown for choosing zero or more string options. Empty selection means no filter (all).
 */
export function MultiSelect({
  className = '',
  label,
  id,
  options,
  value,
  onChange,
  placeholder = 'All',
}) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef(null)
  const controlId = id ?? label?.replace(/\s+/g, '-').toLowerCase()

  useEffect(() => {
    function handlePointerDown(e) {
      if (rootRef.current && !rootRef.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handlePointerDown)
    return () => document.removeEventListener('mousedown', handlePointerDown)
  }, [])

  const selected = new Set(value)
  const summary =
    value.length === 0 ? placeholder : value.length === 1 ? value[0] : `${value.length} selected`

  function toggle(opt) {
    const next = new Set(selected)
    if (next.has(opt)) next.delete(opt)
    else next.add(opt)
    onChange([...next])
  }

  return (
    <div className={`relative w-full ${className}`} ref={rootRef}>
      {label ? (
        <label htmlFor={controlId} className="mb-1.5 block text-sm font-medium text-[var(--color-heading)]">
          {label}
        </label>
      ) : null}
      <button
        id={controlId}
        type="button"
        aria-expanded={open}
        aria-haspopup="listbox"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between gap-2 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2.5 text-left text-sm text-[var(--color-heading)] focus:border-[var(--color-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)]"
      >
        <span className="min-w-0 truncate">{summary}</span>
        <ChevronDown className={`h-4 w-4 shrink-0 opacity-60 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open ? (
        <div
          role="listbox"
          className="absolute left-0 right-0 z-30 mt-1 max-h-56 overflow-auto rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] py-1 shadow-lg"
        >
          {options.length === 0 ? (
            <p className="px-3 py-2 text-sm text-[var(--color-text-muted)]">No options</p>
          ) : (
            options.map((opt) => (
              <label
                key={opt}
                className="flex cursor-pointer items-center gap-2 px-3 py-2 text-sm hover:bg-[var(--color-border)]/40"
              >
                <input
                  type="checkbox"
                  className="rounded border-[var(--color-border)] text-[var(--color-primary)] focus:ring-[var(--color-primary)]"
                  checked={selected.has(opt)}
                  onChange={() => toggle(opt)}
                />
                <span className="text-[var(--color-heading)]">{opt}</span>
              </label>
            ))
          )}
        </div>
      ) : null}
    </div>
  )
}
