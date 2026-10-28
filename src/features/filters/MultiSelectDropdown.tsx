import { useEffect, useId, useRef, useState, type KeyboardEvent } from 'react'
import type { OptionItem } from '../../types/domain'
import { cn } from '../../lib/cn'
import { useInView } from '../../hooks/useInView'
import { Spinner } from '../../components/Spinner'
import { Skeleton } from '../../components/Skeleton'
import { ErrorState } from '../../components/ErrorState'
import { CheckIcon, ChevronDownIcon } from '../../components/icons'

export interface MultiSelectDropdownProps {
  label: string
  options: OptionItem[]
  selected: string[]
  onChange: (next: string[]) => void
  /** Dipanggil saat sentinel di dasar daftar terlihat. */
  onReachEnd: () => void
  hasMore: boolean
  /** Muat awal. */
  isLoading: boolean
  /** Muat halaman berikutnya. */
  isFetchingMore: boolean
  error?: string
  onRetry?: () => void
  disabled?: boolean
  helperText?: string
  emptyText?: string
}

/**
 * Dropdown multi-select generik dengan infinite scroll (design 4.3, FR-4).
 * Aksesibilitas: listbox + aria-multiselectable, navigasi panah, Spasi/Enter memilih, Esc menutup.
 */
export function MultiSelectDropdown({
  label,
  options,
  selected,
  onChange,
  onReachEnd,
  hasMore,
  isLoading,
  isFetchingMore,
  error,
  onRetry,
  disabled = false,
  helperText,
  emptyText = 'Tidak ada data',
}: MultiSelectDropdownProps) {
  const id = useId()
  const [open, setOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)
  const [panelElement, setPanelElement] = useState<HTMLDivElement | null>(null)
  const [sentinelElement, setSentinelElement] = useState<HTMLDivElement | null>(null)
  const rootRef = useRef<HTMLDivElement>(null)
  const listRef = useRef<HTMLUListElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)

  const sentinelInView = useInView(sentinelElement, {
    root: panelElement,
    rootMargin: '0px 0px 96px 0px',
    enabled: open,
  })

  // Infinite scroll: muat halaman berikutnya saat sentinel terlihat (FR-4.3).
  useEffect(() => {
    if (open && sentinelInView && hasMore && !isFetchingMore && !isLoading && !error) {
      onReachEnd()
    }
  }, [open, sentinelInView, hasMore, isFetchingMore, isLoading, error, onReachEnd])

  // Tutup saat klik di luar.
  useEffect(() => {
    if (!open) return
    const onPointerDown = (event: PointerEvent) => {
      if (
        event.target instanceof Node &&
        rootRef.current &&
        !rootRef.current.contains(event.target)
      ) {
        setOpen(false)
      }
    }
    document.addEventListener('pointerdown', onPointerDown)
    return () => document.removeEventListener('pointerdown', onPointerDown)
  }, [open])

  // Fokus ke daftar saat panel terbuka; gulir opsi aktif agar terlihat.
  useEffect(() => {
    if (open) listRef.current?.focus()
  }, [open, isLoading])

  useEffect(() => {
    if (!open) return
    listRef.current
      ?.querySelector<HTMLElement>(`[data-index="${activeIndex}"]`)
      ?.scrollIntoView({ block: 'nearest' })
  }, [open, activeIndex])

  const toggleValue = (value: string) => {
    onChange(
      selected.includes(value) ? selected.filter((item) => item !== value) : [...selected, value],
    )
  }

  const close = () => {
    setOpen(false)
    triggerRef.current?.focus()
  }

  const onListKeyDown = (event: KeyboardEvent<HTMLUListElement>) => {
    const lastIndex = options.length - 1
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault()
        setActiveIndex((index) => Math.min(index + 1, lastIndex))
        break
      case 'ArrowUp':
        event.preventDefault()
        setActiveIndex((index) => Math.max(index - 1, 0))
        break
      case 'Home':
        event.preventDefault()
        setActiveIndex(0)
        break
      case 'End':
        event.preventDefault()
        setActiveIndex(lastIndex)
        break
      case ' ':
      case 'Enter': {
        event.preventDefault()
        const option = options[activeIndex]
        if (option) toggleValue(option.value)
        break
      }
      case 'Escape':
        event.preventDefault()
        event.stopPropagation()
        close()
        break
      case 'Tab':
        setOpen(false)
        break
      default:
        break
    }
  }

  const count = selected.length
  const activeOptionId = open && options[activeIndex] ? `${id}-opt-${activeIndex}` : undefined
  const showPanelError = Boolean(error) && options.length === 0
  const showInlineError = Boolean(error) && options.length > 0

  return (
    <div ref={rootRef} className="relative w-full sm:w-72">
      <button
        ref={triggerRef}
        type="button"
        id={`${id}-trigger`}
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? `${id}-listbox` : undefined}
        onClick={() => setOpen((value) => !value)}
        className={cn(
          'flex h-10 w-full items-center justify-between gap-2 rounded-lg border bg-white px-3 text-sm shadow-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500',
          open ? 'border-primary-500' : 'border-neutral-200 hover:border-primary-500',
          disabled && 'cursor-not-allowed opacity-50 hover:border-neutral-200',
        )}
      >
        <span className="flex min-w-0 items-center gap-2">
          <span className="font-medium text-neutral-900">{label}</span>
          {count > 0 && (
            <span className="rounded-full bg-primary-100 px-2 py-0.5 text-xs font-semibold text-primary-700">
              {count}
            </span>
          )}
        </span>
        <ChevronDownIcon
          className={cn('h-4 w-4 shrink-0 text-neutral-500 transition', open && 'rotate-180')}
        />
      </button>
      {helperText && <p className="mt-1 text-xs text-neutral-500">{helperText}</p>}

      {open && (
        <div
          ref={setPanelElement}
          className="absolute left-0 z-20 mt-2 max-h-72 w-full overflow-y-auto rounded-xl border border-neutral-200 bg-white shadow-xl sm:w-80"
        >
          {isLoading ? (
            <div className="space-y-3 p-3" aria-busy="true" aria-label="Memuat opsi">
              {Array.from({ length: 5 }, (_, i) => (
                <div key={i} className="flex items-center gap-3">
                  <Skeleton className="h-4 w-4" />
                  <Skeleton className="h-4 flex-1" />
                </div>
              ))}
            </div>
          ) : showPanelError ? (
            <div className="p-3">
              <ErrorState compact message={error ?? ''} onRetry={onRetry} />
            </div>
          ) : options.length === 0 ? (
            <p className="p-4 text-sm text-neutral-500">{emptyText}</p>
          ) : (
            <ul
              ref={listRef}
              id={`${id}-listbox`}
              role="listbox"
              aria-multiselectable="true"
              aria-labelledby={`${id}-trigger`}
              aria-activedescendant={activeOptionId}
              tabIndex={0}
              onKeyDown={onListKeyDown}
              className="py-1 outline-none"
            >
              {options.map((option, index) => {
                const isSelected = selected.includes(option.value)
                const isActive = index === activeIndex
                return (
                  <li
                    key={option.value}
                    id={`${id}-opt-${index}`}
                    data-index={index}
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => {
                      setActiveIndex(index)
                      toggleValue(option.value)
                    }}
                    onMouseEnter={() => setActiveIndex(index)}
                    className={cn(
                      'flex min-h-10 cursor-pointer items-center gap-3 px-3 py-2 text-sm',
                      isActive && 'bg-primary-50',
                      isSelected ? 'text-primary-900' : 'text-neutral-900',
                    )}
                  >
                    <span
                      aria-hidden="true"
                      className={cn(
                        'flex h-4 w-4 shrink-0 items-center justify-center rounded border',
                        isSelected
                          ? 'border-primary-600 bg-primary-600 text-white'
                          : 'border-neutral-300 bg-white',
                      )}
                    >
                      {isSelected && <CheckIcon className="h-3 w-3" />}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate">{option.label}</span>
                      {option.hint && (
                        <span className="block truncate text-xs text-neutral-500">
                          {option.hint}
                        </span>
                      )}
                    </span>
                  </li>
                )
              })}
            </ul>
          )}

          {!isLoading && !showPanelError && (
            <div ref={setSentinelElement} className="h-px" aria-hidden="true" />
          )}

          {isFetchingMore && (
            <div
              className="flex items-center gap-2 px-3 py-2 text-xs text-neutral-500"
              role="status"
            >
              <Spinner size="sm" />
              Memuat lebih banyak…
            </div>
          )}

          {showInlineError && (
            <div className="p-2">
              <ErrorState compact message={error ?? ''} onRetry={onRetry} />
            </div>
          )}
        </div>
      )}
    </div>
  )
}
