import { useEffect, useState } from 'react'

/** Menunda nilai selama `delay` ms; mengurangi request saat filter berubah cepat (R-2). */
export function useDebouncedValue<T>(value: T, delay = 300): T {
  const [debounced, setDebounced] = useState(value)

  useEffect(() => {
    const timer = window.setTimeout(() => setDebounced(value), delay)
    return () => window.clearTimeout(timer)
  }, [value, delay])

  return debounced
}
