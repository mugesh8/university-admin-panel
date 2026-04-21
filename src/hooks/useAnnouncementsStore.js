import { useMemo } from 'react'
import { usePersistentState } from './usePersistentState.js'
import { announcements as seed } from '../lib/mock-data/scaffold.js'

function initialAnnouncements() {
  return JSON.parse(JSON.stringify(seed))
}

/**
 * Mock persistence for announcements (localStorage).
 */
export function useAnnouncementsStore() {
  const defaults = useMemo(() => initialAnnouncements(), [])
  const [announcements, setAnnouncements] = usePersistentState('mucm-announcements-v1', defaults)
  return { announcements, setAnnouncements }
}
