import { TrendingDown, TrendingUp } from 'lucide-react'
import { Card } from './Card.jsx'

export function KpiCard({ title, subtitle, value, delta, deltaPositive, compact = false }) {
  return (
    <Card
      padding={false}
      className={`flex h-full flex-col ${
        compact
          ? 'min-h-0 !p-3 sm:!p-3.5'
          : 'min-h-[148px] p-5'
      }`}
    >
      <p
        className={`font-medium leading-snug text-[var(--color-text-muted)] ${
          compact ? 'text-xs' : 'text-sm'
        }`}
      >
        {title}
      </p>
      {subtitle ? (
        <p
          className={`leading-snug text-[var(--color-text-muted)]/80 ${compact ? 'mt-0 text-[10px]' : 'mt-0.5 text-xs'}`}
        >
          {subtitle}
        </p>
      ) : null}
      <p
        className={`font-semibold tabular-nums tracking-tight text-[var(--color-heading)] ${
          compact ? 'mt-1.5 text-lg' : 'mt-3 text-2xl'
        }`}
      >
        {value}
      </p>
      {delta ? (
        <p
          className={`mt-auto inline-flex flex-wrap items-center gap-1 font-medium ${
            compact ? 'pt-1.5 text-[10px]' : 'pt-3 text-xs'
          } ${deltaPositive ? 'text-emerald-700' : 'text-red-700'}`}
        >
          {deltaPositive ? (
            <TrendingUp className={`shrink-0 ${compact ? 'h-3 w-3' : 'h-3.5 w-3.5'}`} />
          ) : (
            <TrendingDown className={`shrink-0 ${compact ? 'h-3 w-3' : 'h-3.5 w-3.5'}`} />
          )}
          {delta}{' '}
          <span className="font-normal text-[var(--color-text-muted)]">vs prior period</span>
        </p>
      ) : null}
    </Card>
  )
}
