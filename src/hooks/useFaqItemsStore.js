import { useMemo } from 'react'
import { usePersistentState } from './usePersistentState.js'
import { faqItems as seed } from '../lib/mock-data/scaffold.js'

function normalizeFaq(f) {
  return {
    ...f,
    answer: f.answer ?? '',
  }
}

function initialFaqs() {
  return JSON.parse(JSON.stringify(seed)).map(normalizeFaq)
}

/**
 * Mock persistence for FAQ items (localStorage).
 */
export function useFaqItemsStore() {
  const defaults = useMemo(() => initialFaqs(), [])
  const [raw, setFaqItems] = usePersistentState('mucm-faq-items-v1', defaults)
  const faqItems = useMemo(() => raw.map(normalizeFaq), [raw])
  return { faqItems, setFaqItems }
}
