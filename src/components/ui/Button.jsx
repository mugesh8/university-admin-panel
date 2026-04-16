export function Button({
  children,
  variant = 'primary',
  className = '',
  type = 'button',
  disabled,
  ...props
}) {
  const base =
    'inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4A843]/60 disabled:pointer-events-none disabled:opacity-50'
  const variants = {
    primary:
      'bg-gradient-to-r from-[#0A1628] via-[#122640] to-[#0A1628] text-white shadow-lg shadow-[#0A1628]/35 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-[#0A1628]/45',
    secondary:
      'border border-[#D4A843]/50 bg-white/80 text-[#0A1628] shadow-sm backdrop-blur hover:border-[#D4A843] hover:bg-[#D4A843]/10',
    ghost: 'text-[#0A1628] hover:bg-[#0A1628]/8',
    danger: 'bg-red-600 text-white hover:bg-red-700 hover:translate-y-0',
  }
  return (
    <button
      type={type}
      disabled={disabled}
      className={`${base} ${variants[variant] ?? variants.primary} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}
