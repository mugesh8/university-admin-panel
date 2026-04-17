import { isFieldVisible } from './formVisibility.js'

/**
 * Same grouping as the student portal StepForm: section-property mode vs note-divider mode.
 * @returns {Array<{ title: string | null, subtitle: string | null, noteField: object | null, fields: object[] }>}
 */
export function buildSectionGroups(fields, values) {
  const visible = fields.filter((f) => isFieldVisible(f, values))
  const usesSectionProp = visible.some((f) => f.section)

  if (usesSectionProp) {
    const map = new Map()
    visible.forEach((field) => {
      const key = field.section ?? '__ungrouped'
      if (!map.has(key)) {
        map.set(key, {
          title: key === '__ungrouped' ? null : key,
          subtitle: field.sectionSubtitle ?? null,
          noteField: null,
          fields: [],
        })
      }
      const group = map.get(key)
      if (!group.subtitle && field.sectionSubtitle) {
        group.subtitle = field.sectionSubtitle
      }
      group.fields.push(field)
    })
    return Array.from(map.values())
  }

  const groups = []
  let current = { title: null, subtitle: null, noteField: null, fields: [] }

  visible.forEach((field) => {
    if (field.type === 'note') {
      if (current.fields.length > 0 || current.noteField) {
        groups.push(current)
      }
      current = {
        title: field.noteTitle ?? null,
        subtitle: field.noteBody ?? null,
        noteField: field,
        fields: [],
      }
    } else {
      current.fields.push(field)
    }
  })

  if (current.fields.length > 0 || current.noteField) {
    groups.push(current)
  }

  return groups
}

/**
 * Group fields for Step 8 review: use `field.section` when set, else the most recent
 * visible note title in step order, else repeatable `sectionTitle`.
 * (Same logic as the student portal StepForm.)
 */
export function buildReviewSubsectionGroups(reviewStep, values) {
  const rows = []
  let lastNoteTitle = null

  for (const field of reviewStep.fields) {
    if (field.type === 'note') {
      if (isFieldVisible(field, values)) {
        lastNoteTitle = field.noteTitle ?? null
      }
      continue
    }
    if (String(field.name ?? '').startsWith('__')) continue
    if (!isFieldVisible(field, values)) continue

    let subheading = field.section ?? null
    if (!subheading && field.type === 'repeatable') {
      subheading = field.sectionTitle ?? lastNoteTitle
    }
    if (!subheading) {
      subheading = lastNoteTitle
    }

    rows.push({ subheading, field })
  }

  const sectionKey = (sub) => (sub === null || sub === undefined ? '__none' : String(sub))
  const order = []
  const byKey = new Map()

  for (const { subheading, field } of rows) {
    const key = sectionKey(subheading)
    if (!byKey.has(key)) {
      byKey.set(key, [])
      order.push(key)
    }
    byKey.get(key).push(field)
  }

  return order.map((key) => ({
    subheading: key === '__none' ? null : key,
    fields: byKey.get(key),
  }))
}
