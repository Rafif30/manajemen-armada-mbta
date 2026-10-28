import { useId } from 'react'
import { PAGE_SIZE_OPTIONS, isPageSize, type PageSize } from '../../lib/pagination'

interface PageSizeSelectProps {
  value: PageSize
  onChange: (next: PageSize) => void
  disabled?: boolean
}

/** Pilihan jumlah data per halaman (FR-3.2). */
export function PageSizeSelect({ value, onChange, disabled }: PageSizeSelectProps) {
  const id = useId()
  return (
    <label htmlFor={id} className="flex items-center gap-2 text-sm text-neutral-700">
      <span>Per halaman</span>
      <select
        id={id}
        value={value}
        disabled={disabled}
        onChange={(event) => {
          const next = Number(event.target.value)
          if (isPageSize(next)) onChange(next)
        }}
        className="h-10 rounded-lg border border-neutral-200 bg-white px-2 text-sm text-neutral-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {PAGE_SIZE_OPTIONS.map((size) => (
          <option key={size} value={size}>
            {size}
          </option>
        ))}
      </select>
    </label>
  )
}
