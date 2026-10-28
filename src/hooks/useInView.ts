import { useEffect, useState } from 'react'

interface UseInViewOptions {
  root?: Element | null
  rootMargin?: string
  enabled?: boolean
}

/**
 * Mengamati `target` dengan IntersectionObserver. Dipakai sentinel infinite scroll (FR-4.3).
 * `target` dan `root` diterima sebagai elemen (bukan ref) agar observer dibuat ulang
 * saat panel dropdown dibuka/ditutup.
 */
export function useInView(
  target: Element | null,
  { root = null, rootMargin = '0px', enabled = true }: UseInViewOptions = {},
): boolean {
  const [inView, setInView] = useState(false)

  useEffect(() => {
    if (!target || !enabled) return
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0]
        setInView(entry ? entry.isIntersecting : false)
      },
      { root, rootMargin },
    )
    observer.observe(target)
    return () => observer.disconnect()
  }, [target, root, rootMargin, enabled])

  return Boolean(target) && enabled && inView
}
