import { useEffect, useRef, useState } from 'react'

function readStored(key, fallback) {
  const storedValue = window.localStorage.getItem(key)
  if (!storedValue) {
    return fallback
  }
  try {
    return JSON.parse(storedValue)
  } catch {
    return fallback
  }
}

export function usePersistentState(key, initialValue) {
  const initialRef = useRef(initialValue)
  initialRef.current = initialValue

  const [state, setState] = useState(() => readStored(key, initialValue))

  useEffect(() => {
    setState(readStored(key, initialRef.current))
  }, [key])

  useEffect(() => {
    window.localStorage.setItem(key, JSON.stringify(state))
  }, [key, state])

  return [state, setState]
}
