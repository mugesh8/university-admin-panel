import { useMemo } from 'react'
import { Eye } from 'lucide-react'
import { Button } from '../../components/ui/Button.jsx'
import { buildSectionGroups } from '../../lib/application-form/buildSectionGroups.js'
import { FormSectionHeader } from '../../lib/application-form/FormSectionHeader.jsx'
import { getSingleFieldDisplayValue } from '../../lib/application-form/submissionDisplay.js'

function getFileFieldViewUrl(field, formValues) {
  const mapped = formValues._fileViewUrls?.[field.name]
  if (mapped && String(mapped).trim()) return String(mapped).trim()
  const raw = formValues[field.name]
  if (typeof raw === 'string' && /^https?:\/\//i.test(raw.trim())) return raw.trim()
  return null
}

/**
 * Read-only note block — mirrors create FormField `type === 'note'` styling.
 */
function ReadOnlyNoteBlock({ field, hideNoteTitleBody = false }) {
  const isPlain = field.noteVariant === 'plain'
  const isSub = field.noteVariant === 'sub'
  const showTitleBody = !hideNoteTitleBody
  return (
    <div className="space-y-2.5 sm:col-span-2 xl:col-span-3">
      {field.noteBadge ? (
        <span className="inline-block rounded-lg bg-[#D4A843]/12 px-2.5 py-1 text-xs font-bold tracking-wide text-[#7a5a14]">
          {field.noteBadge}
        </span>
      ) : null}
      {showTitleBody && field.noteTitle ? (
        <h3
          className={`font-semibold text-[#0A1628] [font-family:'DM_Serif_Display',serif] ${
            isSub ? 'text-sm' : isPlain ? 'text-xs font-bold uppercase tracking-widest text-[#0A1628]/45' : 'text-lg'
          }`}
        >
          {field.noteTitle}
        </h3>
      ) : null}
      {showTitleBody && field.noteBody ? (
        <p className={`text-xs leading-relaxed ${isPlain ? 'text-[#0A1628]/40' : 'text-[#0A1628]/45'}`}>
          {field.noteBody}
        </p>
      ) : null}
      {field.noteCallout ? (
        <div className="rounded-xl border border-blue-200/50 bg-blue-50/70 p-3.5">
          <p className="text-xs leading-relaxed text-blue-800/70">{field.noteCallout}</p>
        </div>
      ) : null}
      {field.reviewBullets ? (
        <div className="rounded-xl border border-[#0A1628]/10 bg-[#F8F7F4] p-4">
          <ul className="list-inside list-disc space-y-2 text-sm text-[#0A1628]/70">
            {field.reviewBullets.map((item) => (
              <li key={item} className="leading-relaxed">
                {item}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  )
}

function FieldReadOnlyRow({ field, formValues }) {
  const fileViewUrl = field.type === 'file' ? getFileFieldViewUrl(field, formValues) : null

  return (
    <div
      className={`${
        field.fullWidth ||
        field.type === 'checkbox' ||
        field.type === 'yesNo' ||
        field.type === 'radioGroup' ||
        field.type === 'repeatable' ||
        field.type === 'file'
          ? 'md:col-span-2 xl:col-span-3'
          : ''
      }`}
    >
      {field.type === 'repeatable' ? (
        <div className="space-y-2.5">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#0A1628]/45">
            {field.sectionTitle ?? field.label ?? field.name}
          </p>
          {Array.isArray(formValues[field.name]) && formValues[field.name].length > 0 ? (
            formValues[field.name].map((row, rowIndex) => (
              <div
                key={`${field.name}-row-${rowIndex}`}
                className="rounded-lg border border-[#0A1628]/10 bg-[#F8F7F4]/80 px-3 py-2.5"
              >
                <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#0A1628]/45">
                  {field.itemBadge ?? 'Item'} {rowIndex + 1}
                </p>
                <div className="mt-1.5 grid grid-cols-1 gap-1.5 sm:grid-cols-2">
                  {(field.itemFields ?? []).map((sub) => (
                    <p key={`${field.name}-${rowIndex}-${sub.name}`} className="text-xs text-[#0A1628]/72">
                      <span className="font-semibold text-[#0A1628]/82">
                        {String(sub.label ?? sub.name).toUpperCase()}:
                      </span>{' '}
                      {getSingleFieldDisplayValue(sub, row?.[sub.name])}
                    </p>
                  ))}
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-[#0A1628]/55">No entries added.</p>
          )}
        </div>
      ) : field.type === 'file' ? (
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#0A1628]/45">
              {field.label}
            </p>
            <p className="mt-1 whitespace-pre-wrap text-sm text-[#0A1628]/78">
              {getSingleFieldDisplayValue(field, formValues[field.name])}
            </p>
          </div>
          {fileViewUrl ? (
            <Button
              type="button"
              variant="secondary"
              className="shrink-0 self-start !px-3 !py-1.5 text-xs"
              onClick={() => window.open(fileViewUrl, '_blank', 'noopener,noreferrer')}
            >
              <Eye className="mr-1.5 inline h-3.5 w-3.5" aria-hidden />
              View
            </Button>
          ) : null}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-1 sm:grid-cols-[170px_minmax(0,1fr)] sm:items-start sm:gap-3">
          <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#0A1628]/45">
            {field.label}
          </p>
          <p className="whitespace-pre-wrap text-sm text-[#0A1628]/78">
            {getSingleFieldDisplayValue(field, formValues[field.name])}
          </p>
        </div>
      )}
    </div>
  )
}

/**
 * One portal application step: section groups (read-only), matching the student form structure.
 */
export function ApplicationFormStepPanel({ step, formValues }) {
  const values = formValues && typeof formValues === 'object' ? formValues : {}

  const fieldsForGrouping = useMemo(
    () => step.fields.filter((f) => !String(f.name).startsWith('__')),
    [step.fields],
  )

  const groups = useMemo(() => buildSectionGroups(fieldsForGrouping, values), [fieldsForGrouping, values])

  if (groups.length === 0) {
    return (
      <p className="text-sm text-[#0A1628]/55">
        No fields in this section for the current data, or all fields are hidden by conditional rules.
      </p>
    )
  }

  return (
    <div className="space-y-5">
      {step.description ? <p className="text-xs text-[#0A1628]/50">{step.description}</p> : null}

      {groups.map((group, groupIndex) => {
        const hasRegularFields = group.fields.length > 0
        const hideDividerNoteDuplicate = Boolean(
          group.title && group.noteField?.noteTitle && group.noteField.noteTitle === group.title,
        )

        return (
          <div
            key={group.title ?? `admin-step-group-${groupIndex}`}
            className="overflow-hidden rounded-2xl border border-[#0A1628]/10 bg-white shadow-sm"
          >
            {group.title ? (
              <div className="border-b border-[#0A1628]/8 bg-gradient-to-r from-[#D4A843]/5 to-transparent px-5 py-3.5 sm:px-6">
                <FormSectionHeader title={group.title} subtitle={group.subtitle} />
              </div>
            ) : null}

            {group.noteField ? (
              <div className={`px-5 sm:px-6 ${hasRegularFields ? 'pt-5 pb-0' : 'py-5'}`}>
                <ReadOnlyNoteBlock field={group.noteField} hideNoteTitleBody={hideDividerNoteDuplicate} />
              </div>
            ) : null}

            {hasRegularFields ? (
              <div className="grid grid-cols-1 gap-4 p-5 md:grid-cols-2 xl:grid-cols-3 sm:p-6">
                {group.fields.map((field) => {
                  if (field.type === 'note') {
                    const hideSectionNoteDuplicate = Boolean(
                      group.title && field.noteTitle && field.noteTitle === group.title,
                    )
                    return (
                      <ReadOnlyNoteBlock
                        key={`${step.id}-${field.name}`}
                        field={field}
                        hideNoteTitleBody={hideSectionNoteDuplicate}
                      />
                    )
                  }
                  return <FieldReadOnlyRow key={`${step.id}-${field.name}`} field={field} formValues={values} />
                })}
              </div>
            ) : null}
          </div>
        )
      })}
    </div>
  )
}
