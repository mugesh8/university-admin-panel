import { createContext, useCallback, useContext, useMemo, useState } from 'react'

const PageTitleContext = createContext(null)

export function PageTitleProvider({ children }) {
  const [override, setOverride] = useState(null)

  const setPageTitleOverride = useCallback((value) => {
    setOverride(value)
  }, [])

  const value = useMemo(
    () => ({
      override,
      setPageTitleOverride,
    }),
    [override, setPageTitleOverride],
  )

  return <PageTitleContext.Provider value={value}>{children}</PageTitleContext.Provider>
}

export function usePageTitleContext() {
  const ctx = useContext(PageTitleContext)
  if (!ctx) {
    throw new Error('usePageTitleContext must be used within PageTitleProvider')
  }
  return ctx
}
