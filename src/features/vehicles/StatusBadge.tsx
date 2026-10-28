import { Badge } from '../../components/Badge'
import { getStatusPresentation } from '../../lib/status'
import type { VehicleStatus } from '../../types/domain'

interface StatusBadgeProps {
  status: VehicleStatus | null
  /** Nilai mentah dari API, ditampilkan pada tooltip (FR-2.3). */
  rawStatus?: string | null
}

export function StatusBadge({ status, rawStatus }: StatusBadgeProps) {
  const { label, badgeClass, dotClass } = getStatusPresentation(status)
  return (
    <Badge className={badgeClass} dotClass={dotClass} title={rawStatus ?? status ?? 'null'}>
      {label}
    </Badge>
  )
}
