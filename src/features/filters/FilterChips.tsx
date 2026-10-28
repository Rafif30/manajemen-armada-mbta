import { CloseIcon } from '../../components/icons'

export interface Chip {
  kind: 'route' | 'trip'
  value: string
  label: string
}

interface FilterChipsProps {
  chips: Chip[]
  onRemove: (chip: Chip) => void
  onClearAll: () => void
}

const KIND_LABEL = { route: 'Rute', trip: 'Trip' } as const

/** Chip pilihan filter dengan tombol hapus satu per satu dan "Hapus semua" (FR-4.2). */
export function FilterChips({ chips, onRemove, onClearAll }: FilterChipsProps) {
  if (chips.length === 0) return null

  return (
    <div className="flex flex-wrap items-center gap-2" aria-label="Filter aktif">
      {chips.map((chip) => (
        <span
          key={`${chip.kind}:${chip.value}`}
          className="inline-flex h-8 items-center gap-1 rounded-full bg-primary-100 pl-3 pr-1 text-xs font-medium text-primary-900"
        >
          <span className="text-primary-700">{KIND_LABEL[chip.kind]}</span>
          <span className="max-w-48 truncate">{chip.label}</span>
          <button
            type="button"
            onClick={() => onRemove(chip)}
            aria-label={`Hapus ${KIND_LABEL[chip.kind]} ${chip.label}`}
            className="flex h-6 w-6 items-center justify-center rounded-full text-primary-700 transition hover:bg-primary-500 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
          >
            <CloseIcon className="h-3.5 w-3.5" />
          </button>
        </span>
      ))}
      <button
        type="button"
        onClick={onClearAll}
        className="h-8 rounded-full px-3 text-xs font-medium text-neutral-500 transition hover:bg-neutral-100 hover:text-neutral-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
      >
        Hapus semua
      </button>
    </div>
  )
}
