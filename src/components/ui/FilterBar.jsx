export function FilterBar({ children, className = '' }) {
  return (
    <div
      className={`flex flex-wrap items-end gap-3 rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-4 shadow-[var(--shadow-sm)] ${className}`}
    >
      {children}
    </div>
  )
}
