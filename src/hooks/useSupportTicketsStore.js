import { useCallback, useEffect, useState } from 'react'
import { deleteSupportTicket, fetchSupportTickets, patchSupportTicket } from '../lib/api/supportTicketsApi.js'

export function useSupportTicketsStore() {
  const [tickets, setTickets] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const refreshTickets = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const rows = await fetchSupportTickets()
      setTickets(rows)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load support tickets')
      setTickets([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    refreshTickets()
  }, [refreshTickets])

  const applyTicketPatch = useCallback(async (id, payload) => {
    setSaving(true)
    setError('')
    try {
      const updated = await patchSupportTicket(id, payload)
      setTickets((prev) => prev.map((ticket) => (ticket.id === id ? updated : ticket)))
      return updated
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update support ticket')
      throw err
    } finally {
      setSaving(false)
    }
  }, [])

  const removeTicket = useCallback(async (id) => {
    setSaving(true)
    setError('')
    try {
      await deleteSupportTicket(id)
      setTickets((prev) => prev.filter((ticket) => ticket.id !== id))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete support ticket')
      throw err
    } finally {
      setSaving(false)
    }
  }, [])

  return {
    tickets,
    loading,
    saving,
    error,
    refreshTickets,
    applyTicketPatch,
    removeTicket,
  }
}
