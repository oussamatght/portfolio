import { useCallback, useSyncExternalStore } from 'react'

const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)'

/** Reactive `prefers-reduced-motion` flag (SSR-safe). */
export function usePrefersReducedMotion() {
  const subscribe = useCallback((onChange: () => void) => {
    const query = window.matchMedia(REDUCED_MOTION_QUERY)
    query.addEventListener('change', onChange)
    return () => query.removeEventListener('change', onChange)
  }, [])

  const getSnapshot = useCallback(() => window.matchMedia(REDUCED_MOTION_QUERY).matches, [])

  return useSyncExternalStore(subscribe, getSnapshot, () => false)
}
