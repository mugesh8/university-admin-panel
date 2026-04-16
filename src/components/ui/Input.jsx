export function Input({ className = '', label, id, hint, ...props }) {
  const inputId = id ?? props.name
  return (
    <div className="w-full">
      {label ? (
        <label htmlFor={inputId} className="mb-1.5 block text-sm font-medium text-[var(--color-heading)]">
          {label}
        </label>
      ) : null}
      <input
        id={inputId}
        className={`w-full rounded-xl border border-[#0A1628]/15 bg-white px-3 py-2.5 text-sm text-[#0A1628] placeholder:text-[#0A1628]/45 focus:border-[#D4A843]/50 focus:outline-none focus:ring-2 focus:ring-[#D4A843]/35 ${className}`}
        {...props}
      />
      {hint ? <p className="mt-1 text-xs text-[var(--color-text-muted)]">{hint}</p> : null}
    </div>
  )
}
