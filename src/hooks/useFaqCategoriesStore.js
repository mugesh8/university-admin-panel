import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  createFaqCategory,
  deleteFaqCategory,
  fetchFaqCategories,
  updateFaqCategory,
} from '../lib/api/faqCategoriesApi.js'

function normalizeCategory(c) {
  return {
    id: c.id,
    name: String(c.name ?? '').trim(),
    description: String(c.description ?? '').trim(),
    active: c.active !== false,
    sortOrder: Number(c.sortOrder ?? 0),
  }
}

export function useFaqCategoriesStore() {
  const [faqCategories, setFaqCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const refreshFaqCategories = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const rows = await fetchFaqCategories()
      setFaqCategories(rows.map(normalizeCategory).filter((c) => c.name))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load FAQ categories')
      setFaqCategories([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    refreshFaqCategories()
  }, [refreshFaqCategories])

  const createCategory = useCallback(async (payload) => {
    setSaving(true)
    setError('')
    try {
      const created = await createFaqCategory(payload)
      setFaqCategories((prev) => [...prev, normalizeCategory(created)])
      return created
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create FAQ category'
      setError(message)
      throw err
    } finally {
      setSaving(false)
    }
  }, [])

  const editCategory = useCallback(async (id, payload) => {
    setSaving(true)
    setError('')
    try {
      const updated = await updateFaqCategory(id, payload)
      setFaqCategories((prev) => prev.map((c) => (c.id === id ? normalizeCategory(updated) : c)))
      return updated
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update FAQ category'
      setError(message)
      throw err
    } finally {
      setSaving(false)
    }
  }, [])

  const removeCategory = useCallback(async (id) => {
    setSaving(true)
    setError('')
    try {
      await deleteFaqCategory(id)
      setFaqCategories((prev) => prev.filter((c) => c.id !== id))
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete FAQ category'
      setError(message)
      throw err
    } finally {
      setSaving(false)
    }
  }, [])

  const sortedFaqCategories = useMemo(
    () => [...faqCategories].sort((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name)),
    [faqCategories],
  )

  return {
    faqCategories: sortedFaqCategories,
    loading,
    saving,
    error,
    refreshFaqCategories,
    createCategory,
    editCategory,
    removeCategory,
  }
}
