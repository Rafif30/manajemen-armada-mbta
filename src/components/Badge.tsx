import type { ReactNode } from 'react'
import { cn } from '../lib/cn'

interface BadgeProps {
  children: ReactNode
  className?: string
  /** Kelas warna titik indikator; bila ada, titik dirender di kiri teks. */
  dotClass?: string
  title?: string
}

export function Badge({ children, className, dotClass, title }: BadgeProps) {
  return (
    <span
      title={title}
      className={cn(
        'inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium',
        className,
      )}
    >
      {dotClass && <span aria-hidden="true" className={cn('h-2 w-2 rounded-full', dotClass)} />}
      {children}
    </span>
  )
}
