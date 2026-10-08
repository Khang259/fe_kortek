import { StatusBadge } from '@/components/common/status-badge'
import {
  useIsAnyZoneRunning,
  useIsAnyZoneStreaming,
} from '@/features/zones'

/**
 * Badge live fleet — `isStreaming` / armed `isRunning`.
 * @see docs/fe-zones-runtime-flags.md
 */
export function FleetStatusBadge() {
  const { data: fleetLive = false } = useIsAnyZoneStreaming()
  const { data: fleetArmed = false } = useIsAnyZoneRunning()

  if (fleetLive) {
    return <StatusBadge tone="success">Running</StatusBadge>
  }
  if (fleetArmed) {
    return <StatusBadge tone="warning">Armed — no feed</StatusBadge>
  }
  return <StatusBadge tone="warning">Paused</StatusBadge>
}
