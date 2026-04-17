import { useMemo } from 'react'
import { isFieldVisible } from '../../lib/application-form/formVisibility.js'
import { getSingleFieldDisplayValue } from '../../lib/application-form/submissionDisplay.js'

/**
 * One portal application step: title + visible fields (read-only), matching the student form structure.
 */
export function ApplicationFormStepPanel({ step, formValues }) {
  const visibleFields = useMemo(() => {
    if (!formValues || typeof formValues !== 'object') return []
    return step.fields.filter(
      (field) =>
        field.type !== 'note' &&
        !String(field.name).startsWith('__') &&
        isFieldVisible(field, formValues),
    )
  }, [step, formValues])

  if (visibleFields.length === 0) {
    return (
      <p className="text-sm text-[var(--color-text-muted)]">
        No fields in this section for the current data, or all fields are hidden by conditional rules.
      </p>
    )
  }

  return (
    <div className="overflow-hidden rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-sm">
      <div className="border-b border-[var(--color-border)] bg-[var(--color-bg)] px-4 py-2.5 sm:px-5">
        <h4 className="text-base font-semibold text-[var(--color-heading)]">{step.title}</h4>
        {step.description ? (
          <p className="mt-0.5 text-xs text-[var(--color-text-muted)]">{step.description}</p>
        ) : null}
      </div>
      <div className="space-y-0 p-4 sm:p-5">
        {visibleFields.map((field) => (
          <div
            key={`${step.id}-${field.name}`}
            className="border-b border-[var(--color-border)] py-2.5 last:border-b-0"
          >
            {field.type === 'repeatable' ? (
              <div className="space-y-2.5">
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--color-text-muted)]">
                  {field.sectionTitle ?? field.label ?? field.name}
                </p>
                {Array.isArray(formValues[field.name]) && formValues[field.name].length > 0 ? (
                  formValues[field.name].map((row, rowIndex) => (
                    <div
                      key={`${field.name}-row-${rowIndex}`}
                      className="rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2.5"
                    >
                      <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--color-text-muted)]">
                        {field.itemBadge ?? 'Item'} {rowIndex + 1}
                      </p>
                      <div className="mt-1.5 grid grid-cols-1 gap-1.5 sm:grid-cols-2">
                        {(field.itemFields ?? []).map((sub) => (
                          <p
                            key={`${field.name}-${rowIndex}-${sub.name}`}
                            className="text-xs text-[var(--color-text)]"
                          >
                            <span className="font-semibold text-[var(--color-heading)]">
                              {String(sub.label ?? sub.name).toUpperCase()}:
                            </span>{' '}
                            {getSingleFieldDisplayValue(sub, row?.[sub.name])}
                          </p>
                        ))}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-[var(--color-text-muted)]">No entries added.</p>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-1 sm:grid-cols-[170px_minmax(0,1fr)] sm:items-start sm:gap-3">
                <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--color-text-muted)]">
                  {field.label}
                </p>
                <p className="whitespace-pre-wrap text-sm text-[var(--color-text)]">
                  {getSingleFieldDisplayValue(field, formValues[field.name])}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
