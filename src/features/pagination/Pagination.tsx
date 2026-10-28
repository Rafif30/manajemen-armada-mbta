import type { ReactNode } from 'react'
import type { PageMeta } from '../../types/domain'
import { getPageNumbers, rangeText, type PageSize } from '../../lib/pagination'
import { PageSizeSelect } from './PageSizeSelect'
import { Spinner } from '../../components/Spinner'
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronsLeftIcon,
  ChevronsRightIcon,
} from '../../components/icons'
import { cn } from '../../lib/cn'

interface PaginationProps {
  meta: PageMeta
  isFetching: boolean
  onPageChange: (page: number) => void
  onLimitChange: (limit: PageSize) => void
}

interface PageButtonProps {
  onClick: () => void
  disabled?: boolean
  active?: boolean
  label: string
  children: ReactNode
  className?: string
}

function PageButton({ onClick, disabled, active, label, children, className }: PageButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      aria-current={active ? 'page' : undefined}
      className={cn(
        'flex h-10 min-w-10 items-center justify-center rounded-lg px-2 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500',
        active
          ? 'bg-primary-600 text-white'
          : 'border border-neutral-200 bg-white text-neutral-900 hover:bg-primary-50 disabled:hover:bg-white',
        'disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
    >
      {children}
    </button>
  )
}

/** Kontrol pagination (FR-3, design 4.4). */
export function Pagination({ meta, isFetching, onPageChange, onLimitChange }: PaginationProps) {
  const { page, totalPages, hasPrev, hasNext } = meta
  const lastPage = totalPages ?? (hasNext ? null : page)
  const tokens = totalPages !== null ? getPageNumbers(page, totalPages) : [page]

  return (
    <nav
      aria-label="Navigasi halaman"
      className="space-y-3 rounded-xl border border-neutral-200 bg-white p-4 shadow-sm"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="flex items-center gap-2 text-sm text-neutral-700" aria-live="polite">
          <span>{rangeText(meta)}</span>
          {meta.isTotalEstimate && (
            <span className="sr-only">
              (perkiraan; total pasti diketahui pada halaman terakhir)
            </span>
          )}
          {isFetching && <Spinner size="sm" label="Memuat halaman" />}
        </p>
        <PageSizeSelect value={meta.limit as PageSize} onChange={onLimitChange} />
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-neutral-700">
          Halaman <span className="font-semibold text-neutral-900">{page}</span>
          {' dari '}
          <span className="font-semibold text-neutral-900">{totalPages ?? '?'}</span>
        </p>

        <div className="flex flex-wrap items-center gap-1.5">
          <PageButton label="Halaman pertama" onClick={() => onPageChange(1)} disabled={!hasPrev}>
            <ChevronsLeftIcon className="h-4 w-4" />
          </PageButton>
          <PageButton
            label="Halaman sebelumnya"
            onClick={() => onPageChange(page - 1)}
            disabled={!hasPrev}
          >
            <ChevronLeftIcon className="h-4 w-4" />
          </PageButton>

          <div className="hidden items-center gap-1.5 sm:flex">
            {tokens.map((token, index) =>
              token === 'ellipsis' ? (
                <span
                  key={`ellipsis-${index}`}
                  className="px-1 text-neutral-500"
                  aria-hidden="true"
                >
                  …
                </span>
              ) : (
                <PageButton
                  key={token}
                  label={`Halaman ${token}`}
                  active={token === page}
                  onClick={() => onPageChange(token)}
                >
                  {token}
                </PageButton>
              ),
            )}
          </div>

          <PageButton
            label="Halaman berikutnya"
            onClick={() => onPageChange(page + 1)}
            disabled={!hasNext}
          >
            <ChevronRightIcon className="h-4 w-4" />
          </PageButton>
          {lastPage !== null && (
            <PageButton
              label="Halaman terakhir"
              onClick={() => onPageChange(lastPage)}
              disabled={page >= lastPage}
            >
              <ChevronsRightIcon className="h-4 w-4" />
            </PageButton>
          )}
        </div>
      </div>
    </nav>
  )
}
