export function Select({ className = '', label, id, children, ...props }) {
  const selectId = id ?? props.name
  return (
    <div className="w-full">
      {label ? (
        <label htmlFor={selectId} className="mb-1.5 block text-sm font-medium text-[var(--color-heading)]">
          {label}
        </label>
      ) : null}
      <select
        id={selectId}
        className={`w-full rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2.5 text-sm text-[var(--color-heading)] focus:border-[var(--color-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)] ${className}`}
        {...props}
      >
        {children}
      </select>
    </div>
  )
}
