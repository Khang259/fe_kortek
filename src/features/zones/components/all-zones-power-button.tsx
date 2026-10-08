import { useEffect, useRef } from 'react'
import { Pause, Zap } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { PERMISSIONS } from '@/config/permissions'
import { useZones } from '@/features/zones/api/get-zones'
import { useToggleZone } from '@/features/zones/api/toggle-zone'
import { useSystemPowerStore } from '@/features/zones/stores/system-power-store'
import { useHasPermission } from '@/hooks/use-has-permission'

/**
 * Start/stop camera toàn nhà máy (`start_all` / `stop_all`).
 * Trạng thái nút = công tắc (`isRunning` / fleetActive) — không phải live stream.
 */
export function AllZonesPowerButton() {
  const canControlSystem = useHasPermission(PERMISSIONS.systemControl)
  const fleetActive = useSystemPowerStore((state) => state.fleetActive)
  const setFleetActive = useSystemPowerStore((state) => state.setFleetActive)
  const { data: zones } = useZones()
  const toggleZone = useToggleZone()
  const hydrated = useRef(false)

  useEffect(() => {
    if (!zones || hydrated.current) {
      return
    }
    hydrated.current = true
    // Armed = isRunning (enabled), không hydrate từ isStreaming.
    setFleetActive(zones.some((zone) => zone.isRunning))
  }, [zones, setFleetActive])

  if (!canControlSystem) {
    return null
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      disabled={toggleZone.isPending}
      title="Camera power only — use start-scan / Pause for inference"
      onClick={() =>
        toggleZone.mutate({ zoneId: null, isRunning: !fleetActive })
      }
    >
      {fleetActive ? <Pause /> : <Zap />}
      {fleetActive ? 'Stop cameras' : 'Start cameras'}
    </Button>
  )
}
