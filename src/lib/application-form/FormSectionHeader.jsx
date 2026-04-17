import {
  AlertTriangle,
  BookOpen,
  Briefcase,
  FileCheck2,
  FolderOpen,
  Globe,
  HandCoins,
  HeartPulse,
  MapPin,
  Shield,
  ShieldAlert,
  User,
  Users,
} from 'lucide-react'

/** Section title row with icon — matches student portal StepForm SectionHeader. */
export function FormSectionHeader({ title, subtitle }) {
  if (!title) return null
  const normalized = String(title).toLowerCase()
  const Icon = (() => {
    if (normalized.includes('identity')) return User
    if (normalized.includes('contact')) return Users
    if (normalized.includes('citizenship') || normalized.includes('immigration')) return Globe
    if (normalized.includes('address')) return MapPin
    if (normalized.includes('emergency')) return ShieldAlert
    if (
      normalized.includes('parent') ||
      normalized.includes('guardian') ||
      normalized.includes('father') ||
      normalized.includes('mother')
    ) {
      return Users
    }
    if (normalized.includes('financial') || normalized.includes('sponsor') || normalized.includes('payment')) {
      return HandCoins
    }
    if (normalized.includes('academic') || normalized.includes('education')) return BookOpen
    if (normalized.includes('experience') || normalized.includes('motivation')) return Briefcase
    if (normalized.includes('disclosure')) return Shield
    if (normalized.includes('discipline')) return AlertTriangle
    if (normalized.includes('disability') || normalized.includes('accommodation')) return HeartPulse
    if (normalized.includes('document')) return FolderOpen
    if (normalized.includes('review') || normalized.includes('submit')) return FileCheck2
    return FileCheck2
  })()

  return (
    <div className="mb-0 flex items-start gap-3.5">
      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#D4A843]/20 to-[#D4A843]/5 shadow-sm">
        <Icon className="h-4 w-4 text-[#D4A843]" strokeWidth={2} />
      </div>
      <div>
        <h3 className="text-lg font-semibold text-[#0A1628] [font-family:'DM_Serif_Display',serif]">
          {title}
        </h3>
        {subtitle ? <p className="mt-0.5 text-xs text-[#0A1628]/50">{subtitle}</p> : null}
      </div>
    </div>
  )
}
