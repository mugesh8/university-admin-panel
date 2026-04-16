export function PageHeader({ breadcrumbs, actions, className = '' }) {
  if (!breadcrumbs && !actions) return null

  return (
    <header
      className={`mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between ${className}`}
    >
      <div className="min-w-0 flex-1">
        {breadcrumbs ? (
          <nav className="text-xs text-[var(--color-text-muted)]" aria-label="Breadcrumb">
            {breadcrumbs}
          </nav>
        ) : null}
      </div>
      {actions ? (
        <div className="flex w-full shrink-0 flex-wrap items-center gap-2 sm:w-auto sm:justify-end">{actions}</div>
      ) : null}
    </header>
  )
}
