import { AlertIcon } from './icons'
import { Button } from './Button'
import { cn } from '../lib/cn'

interface ErrorStateProps {
  title?: string
  message: string
  onRetry?: () => void
  retryLabel?: string
  /** Versi ringkas untuk di dalam panel dropdown atau popup. */
  compact?: boolean
  className?: string
}

export function ErrorState({
  title = 'Terjadi kendala',
  message,
  onRetry,
  retryLabel = 'Coba lagi',
  compact = false,
  className,
}: ErrorStateProps) {
  if (compact) {
    return (
      <div
        role="alert"
        className={cn(
          'flex items-start gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-800',
          className,
        )}
      >
        <AlertIcon className="mt-0.5 h-4 w-4 shrink-0 text-danger-600" />
        <div className="min-w-0 flex-1">
          <p>{message}</p>
          {onRetry && (
            <button
              type="button"
              onClick={onRetry}
              className="mt-1 font-medium text-danger-600 underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
            >
              {retryLabel}
            </button>
          )}
        </div>
      </div>
    )
  }

  return (
    <div
      role="alert"
      className={cn(
        'flex flex-col items-center justify-center rounded-xl border border-red-200 bg-red-50 px-6 py-12 text-center',
        className,
      )}
    >
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-danger-600 shadow-sm">
        <AlertIcon className="h-6 w-6" />
      </span>
      <h3 className="mt-4 text-lg font-semibold text-neutral-900">{title}</h3>
      <p className="mt-1 max-w-md text-sm text-neutral-700">{message}</p>
      {onRetry && (
        <Button variant="primary" onClick={onRetry} className="mt-6">
          {retryLabel}
        </Button>
      )}
    </div>
  )
}
