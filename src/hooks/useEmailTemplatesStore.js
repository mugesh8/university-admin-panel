import { useMemo } from 'react'
import { usePersistentState } from './usePersistentState.js'
import { emailTemplates as seed } from '../lib/mock-data/scaffold.js'

function normalizeTemplate(t) {
  return {
    ...t,
    body: t.body ?? t.bodyPreview ?? '',
  }
}

function initialTemplates() {
  return JSON.parse(JSON.stringify(seed)).map(normalizeTemplate)
}

/**
 * Shared mock persistence for email templates (localStorage).
 * Keeps Compose / Bulk messages in sync with the templates library.
 */
export function useEmailTemplatesStore() {
  const defaults = useMemo(() => initialTemplates(), [])
  const [raw, setTemplates] = usePersistentState('mucm-email-templates-v1', defaults)
  const templates = useMemo(() => raw.map(normalizeTemplate), [raw])
  return { templates, setTemplates }
}
