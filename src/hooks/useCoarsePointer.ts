import { useCallback, useSyncExternalStore } from 'react'

const COARSE_POINTER_QUERY = '(hover: none) and (pointer: coarse)'

/** Reactive flag for touch-first pointers — SSR-safe. */
export function useCoarsePointer() {
  const subscribe = useCallback((onChange: () => void) => {
    const query = window.matchMedia(COARSE_POINTER_QUERY)
    query.addEventListener('change', onChange)
    return () => query.removeEventListener('change', onChange)
  }, [])

  const getSnapshot = useCallback(
    () => window.matchMedia(COARSE_POINTER_QUERY).matches,
    [],
  )

  return useSyncExternalStore(subscribe, getSnapshot, () => false)
}
