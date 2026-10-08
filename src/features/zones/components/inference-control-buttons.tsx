import { CircleCheck, PauseCircle, Play, RefreshCw } from 'lucide-react'

import { StatusBadge } from '@/components/common/status-badge'
import { Button } from '@/components/ui/button'
import { PERMISSIONS } from '@/config/permissions'
import {
  useCancelBatch,
  useConfirmDispatch,
  usePauseScan,
  usePendingPairs,
  useReloadRuntime,
  useRuntimeStatus,
  useStartScan,
} from '@/features/system/api/runtime'
import { useToggleZone } from '@/features/zones/api/toggle-zone'
import { useInferenceStore } from '@/features/zones/stores/inference-store'
import { useSystemPowerStore } from '@/features/zones/stores/system-power-store'
import { useHasPermission } from '@/hooks/use-has-permission'

/**
 * Runtime: start-scan / confirm-dispatch / cancel-batch / pause-scan / reload.
 * @see docs/fe-api-dispatch-batch.md
 */
export function InferenceControlButtons() {
  const canControlSystem = useHasPermission(PERMISSIONS.systemControl)
  const isReady = useInferenceStore((state) => state.isReady)
  const fleetActive = useSystemPowerStore((state) => state.fleetActive)

  useRuntimeStatus(canControlSystem)
  const pendingPairs = usePendingPairs(canControlSystem)
  const startScan = useStartScan()
  const confirmDispatch = useConfirmDispatch()
  const cancelBatch = useCancelBatch()
  const pauseScan = usePauseScan()
  const reload = useReloadRuntime()
  const toggleZone = useToggleZone()

  if (!canControlSystem) {
    return null
  }

  const batchActive = pendingPairs.data?.batch.active ?? false
  const hasStuck = (pendingPairs.data?.stuckNodes.length ?? 0) > 0
  const busy =
    startScan.isPending ||
    confirmDispatch.isPending ||
    cancelBatch.isPending ||
    pauseScan.isPending ||
    reload.isPending ||
    toggleZone.isPending

  const handleStartScan = () => {
    void (async () => {
      try {
        if (!fleetActive) {
          await toggleZone.mutateAsync({ zoneId: null, isRunning: true })
        }
        await startScan.mutateAsync()
      } catch {
        /* toast qua MutationCache */
      }
    })()
  }

  return (
    <div className="flex items-center gap-1.5">
      <StatusBadge tone={isReady ? 'success' : 'warning'}>
        {isReady ? 'Inference: running' : 'Inference: paused'}
      </StatusBadge>
      {batchActive ? (
        <StatusBadge tone="info">Batch dispatching</StatusBadge>
      ) : null}
      <Button
        variant="ghost"
        size="sm"
        disabled={busy || isReady}
        title="start_all (if needed) → POST /runtime/start-scan"
        onClick={handleStartScan}
      >
        <Play />
        Start scan
      </Button>
      <Button
        variant="ghost"
        size="sm"
        disabled={busy || !isReady || batchActive}
        title="POST /runtime/confirm-dispatch — snapshot isReady batch, send to ICS"
        onClick={() => confirmDispatch.mutate()}
      >
        <CircleCheck />
        Confirm dispatch
      </Button>
      {batchActive && hasStuck ? (
        <Button
          variant="ghost"
          size="sm"
          disabled={busy}
          title="POST /runtime/cancel-batch — close gate, keep inference"
          onClick={() => cancelBatch.mutate()}
        >
          Cancel batch
        </Button>
      ) : null}
      <Button
        variant="ghost"
        size="sm"
        disabled={busy || !isReady}
        title="POST /runtime/pause-scan — stop inference and cancel batch"
        onClick={() => pauseScan.mutate()}
      >
        <PauseCircle />
        Pause
      </Button>
      <Button
        variant="ghost"
        size="sm"
        disabled={busy}
        title="POST /runtime/reload"
        aria-label="Reload runtime"
        onClick={() => reload.mutate()}
      >
        <RefreshCw />
      </Button>
    </div>
  )
}
