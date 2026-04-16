const tones = {
  default: 'bg-slate-100 text-slate-800',
  success: 'bg-emerald-100 text-emerald-900',
  warning: 'bg-amber-100 text-amber-900',
  danger: 'bg-red-100 text-red-900',
  info: 'bg-sky-100 text-sky-900',
}

export function Badge({ children, tone = 'default', className = '' }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${tones[tone] ?? tones.default} ${className}`}
    >
      {children}
    </span>
  )
}
