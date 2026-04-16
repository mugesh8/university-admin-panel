export function Card({ children, className = '', padding = true }) {
  return (
    <div
      className={`rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-[var(--shadow-sm)] ${padding ? 'p-4 xl:p-5' : ''} ${className}`}
    >
      {children}
    </div>
  )
}

export function CardHeader({ title, description, actions }) {
  return (
    <div className="mb-3 flex shrink-0 flex-wrap items-start justify-between gap-2 sm:items-center xl:mb-4 xl:gap-3">
      <div className="min-w-0 flex-1">
        {title ? (
          <h3 className="text-sm font-semibold text-[var(--color-heading)] xl:text-base">{title}</h3>
        ) : null}
        {description ? (
          <p className="mt-0.5 text-sm text-[var(--color-text-muted)]">{description}</p>
        ) : null}
      </div>
      {actions ? <div className="flex shrink-0 flex-wrap gap-2">{actions}</div> : null}
    </div>
  )
}
