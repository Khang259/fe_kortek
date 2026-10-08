import { Pause, Zap } from 'lucide-react'

import { StatusBadge } from '@/components/common/status-badge'
import { Button } from '@/components/ui/button'
import { PERMISSIONS } from '@/config/permissions'
import { useToggleZone } from '@/features/zones/api/toggle-zone'
import type { WarehouseZone } from '@/features/zones/types'
import { useHasPermission } from '@/hooks/use-has-permission'
import { formatClock } from '@/utils'

interface ZoneControlItemProps {
  zone: WarehouseZone
}

function zoneLiveBadge(zone: WarehouseZone) {
  if (zone.isStreaming) {
    return { tone: 'success' as const, label: 'With feed' }
  }
  if (zone.isRunning) {
    return { tone: 'warning' as const, label: 'Armed' }
  }
  return { tone: 'warning' as const, label: 'Stopped' }
}

export function ZoneControlItem({ zone }: ZoneControlItemProps) {
  const toggleZone = useToggleZone()
  const canControlZone = useHasPermission(PERMISSIONS.zoneControl)
  const actionLabel = zone.isRunning ? 'Stop' : 'Start'
  const badge = zoneLiveBadge(zone)

  return (
    <div
      className="flex items-center gap-2 border-b px-3 py-2 last:border-b-0"
      title={
        zone.lastChangedAt
          ? `Changed at ${formatClock(zone.lastChangedAt)} by ${zone.lastChangedBy ?? '—'}`
          : 'No change history'
      }
    >
      <span className="flex-1">
        <strong className="block text-[11px] font-medium">{zone.name}</strong>
        <small className="mt-0.5 block text-[9px] text-faint">
          {zone.nodeCount} node · {zone.cameraCount} camera
        </small>
      </span>

      <StatusBadge tone={badge.tone}>{badge.label}</StatusBadge>

      {canControlZone ? (
        <Button
          variant="ghost"
          size="icon-xs"
          aria-label={`${actionLabel} ${zone.name}`}
          disabled={toggleZone.isPending}
          onClick={() =>
            toggleZone.mutate({ zoneId: zone.id, isRunning: !zone.isRunning })
          }
        >
          {zone.isRunning ? <Pause /> : <Zap />}
        </Button>
      ) : null}
    </div>
  )
}
