import { useCallback, useEffect, useMemo, useState } from 'react'
import { createFaq, deleteFaq, fetchFaqs, updateFaq } from '../lib/api/faqsApi.js'
import { parseStringArray } from '../lib/faqContent.js'

function normalizeFaq(f) {
  const contextSteps = [
    ...parseStringArray(f.contextSteps),
    ...parseStringArray(f.context_steps),
    ...parseStringArray(f.form_steps),
    ...parseStringArray(f.step_contexts),
  ]
  return {
    id: f.id,
    categoryId: f.categoryId ?? null,
    category: String(f.category ?? 'General').trim() || 'General',
    question: String(f.question ?? '').trim(),
    answer: String(f.answer ?? '').trim(),
    active: f.active !== false,
    sortOrder: Number(f.sortOrder ?? 0),
    contextSteps: [...new Set(contextSteps)],
  }
}

export function useFaqItemsStore() {
  const [faqItems, setFaqItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const refreshFaqItems = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const rows = await fetchFaqs()
      setFaqItems(rows.map(normalizeFaq))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load FAQs')
      setFaqItems([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    refreshFaqItems()
  }, [refreshFaqItems])

  const createFaqItem = useCallback(async (payload) => {
    setSaving(true)
    setError('')
    try {
      const created = await createFaq(payload)
      setFaqItems((prev) => [normalizeFaq(created), ...prev])
      return created
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create FAQ')
      throw err
    } finally {
      setSaving(false)
    }
  }, [])

  const editFaqItem = useCallback(async (id, payload) => {
    setSaving(true)
    setError('')
    try {
      const updated = await updateFaq(id, payload)
      setFaqItems((prev) => prev.map((f) => (f.id === id ? normalizeFaq(updated) : f)))
      return updated
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update FAQ')
      throw err
    } finally {
      setSaving(false)
    }
  }, [])

  const removeFaqItem = useCallback(async (id) => {
    setSaving(true)
    setError('')
    try {
      await deleteFaq(id)
      setFaqItems((prev) => prev.filter((f) => f.id !== id))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete FAQ')
      throw err
    } finally {
      setSaving(false)
    }
  }, [])

  const sortedFaqItems = useMemo(
    () => [...faqItems].sort((a, b) => a.sortOrder - b.sortOrder || a.question.localeCompare(b.question)),
    [faqItems],
  )

  return {
    faqItems: sortedFaqItems,
    loading,
    saving,
    error,
    refreshFaqItems,
    createFaqItem,
    editFaqItem,
    removeFaqItem,
  }
}
