import { BusIcon, RefreshIcon } from './icons'
import { Spinner } from './Spinner'
import { cn } from '../lib/cn'
import { formatDateTime } from '../lib/format'

interface AppHeaderProps {
  onRefresh: () => void
  isRefreshing: boolean
  /** Timestamp (ms) data kendaraan terakhir diterima; 0 bila belum ada. */
  dataUpdatedAt: number
}

export function AppHeader({ onRefresh, isRefreshing, dataUpdatedAt }: AppHeaderProps) {
  return (
    <header className="border-b-4 border-accent-500 bg-primary-900 text-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/10">
            <BusIcon className="h-6 w-6 text-accent-400" />
          </span>
          <div className="min-w-0">
            <h1 className="truncate text-xl font-semibold sm:text-2xl">Manajemen Armada</h1>
            <p className="truncate text-xs text-white/70">
              {dataUpdatedAt > 0
                ? `Data terakhir diterima ${formatDateTime(new Date(dataUpdatedAt).toISOString())}`
                : 'Sumber data: MBTA V3 API'}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onRefresh}
          disabled={isRefreshing}
          className={cn(
            'inline-flex h-10 shrink-0 items-center gap-2 rounded-lg bg-accent-500 px-3 text-sm font-semibold text-neutral-900 transition hover:bg-accent-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white disabled:cursor-not-allowed disabled:opacity-70 sm:px-4',
          )}
        >
          {isRefreshing ? (
            <Spinner size="sm" className="text-neutral-900" />
          ) : (
            <RefreshIcon className="h-4 w-4" />
          )}
          <span className="hidden sm:inline">Segarkan</span>
          <span className="sr-only sm:hidden">Segarkan data</span>
        </button>
      </div>
    </header>
  )
}
