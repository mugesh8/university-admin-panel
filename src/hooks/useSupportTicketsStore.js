import { useMemo } from 'react'
import { usePersistentState } from './usePersistentState.js'
import { supportTickets as seed } from '../lib/mock-data/scaffold.js'

function normalizeTicket(t) {
  return {
    ...t,
    messages: Array.isArray(t.messages) ? t.messages : [],
  }
}

function initialTickets() {
  return JSON.parse(JSON.stringify(seed)).map(normalizeTicket)
}

/**
 * Mock persistence for support tickets (localStorage).
 */
export function useSupportTicketsStore() {
  const defaults = useMemo(() => initialTickets(), [])
  const [raw, setTickets] = usePersistentState('mucm-support-tickets-v1', defaults)
  const tickets = useMemo(() => raw.map(normalizeTicket), [raw])
  return { tickets, setTickets }
}
