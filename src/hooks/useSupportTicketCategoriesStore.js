import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  createSupportTicketCategory,
  deleteSupportTicketCategory,
  fetchSupportTicketCategories,
  updateSupportTicketCategory,
} from '../lib/api/supportTicketCategoriesApi.js'

export function useSupportTicketCategoriesStore() {
  const [raw, setRaw] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const categories = useMemo(
    () =>
      (Array.isArray(raw) ? raw : [])
        .filter((category) => category.name)
        .sort((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name)),
    [raw],
  )

  const refreshCategories = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const rows = await fetchSupportTicketCategories(true)
      setRaw(rows)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load support ticket categories')
      setRaw([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    refreshCategories()
  }, [refreshCategories])

  const createCategory = useCallback(async (payload) => {
    setSaving(true)
    setError('')
    try {
      const created = await createSupportTicketCategory({
        name: payload.name,
        is_active: payload.active !== false,
        sort_order: payload.sortOrder ?? raw.length,
      })
      setRaw((prev) => [...prev, created])
      return created
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create support ticket category')
      throw err
    } finally {
      setSaving(false)
    }
  }, [raw.length])

  const editCategory = useCallback(async (id, payload) => {
    setSaving(true)
    setError('')
    try {
      const updated = await updateSupportTicketCategory(id, {
        ...(payload.name !== undefined ? { name: payload.name } : {}),
        ...(payload.active !== undefined ? { is_active: payload.active } : {}),
        ...(payload.sortOrder !== undefined ? { sort_order: payload.sortOrder } : {}),
      })
      setRaw((prev) => prev.map((category) => (category.id === id ? updated : category)))
      return updated
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update support ticket category')
      throw err
    } finally {
      setSaving(false)
    }
  }, [])

  const removeCategory = useCallback(async (id) => {
    setSaving(true)
    setError('')
    try {
      await deleteSupportTicketCategory(id)
      setRaw((prev) => prev.filter((category) => category.id !== id))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete support ticket category')
      throw err
    } finally {
      setSaving(false)
    }
  }, [])

  return {
    supportTicketCategories: categories,
    loading,
    saving,
    error,
    refreshCategories,
    createCategory,
    editCategory,
    removeCategory,
  }
}
