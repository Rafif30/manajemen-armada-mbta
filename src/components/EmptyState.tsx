import { InboxIcon } from './icons'
import { Button } from './Button'
import { cn } from '../lib/cn'

interface EmptyStateProps {
  title?: string
  message: string
  action?: { label: string; onClick: () => void }
  className?: string
}

export function EmptyState({
  title = 'Tidak ada data',
  message,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center rounded-xl border border-dashed border-neutral-200 bg-white px-6 py-12 text-center',
        className,
      )}
    >
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-50 text-primary-600">
        <InboxIcon className="h-6 w-6" />
      </span>
      <h3 className="mt-4 text-lg font-semibold text-neutral-900">{title}</h3>
      <p className="mt-1 max-w-md text-sm text-neutral-500">{message}</p>
      {action && (
        <Button variant="secondary" onClick={action.onClick} className="mt-6">
          {action.label}
        </Button>
      )}
    </div>
  )
}
