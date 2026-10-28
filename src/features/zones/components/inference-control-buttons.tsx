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
import { useInferenceStore } from '@/features/zones/stores/inference-store'
import { useSystemPowerStore } from '@/features/zones/stores/system-power-store'
import { useHasPermission } from '@/hooks/use-has-permission'

/**
 * Runtime: Resume scan / Dispatch / cancel-batch / Pause / reload.
 * Bật hệ thống dùng AllZonesPowerButton (`start-cameras`) — không trùng nút.
 * @see docs/FE_CONTRACT_COLS_API.md
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
    reload.isPending

  /** Chỉ resume sau Pause — start hệ thống = nút Start cameras bên cạnh. */
  const canResume = fleetActive && !isReady

  return (
    <div className="flex items-center gap-1.5">
      <StatusBadge tone={isReady ? 'success' : 'warning'}>
        {isReady ? 'Inference: running' : 'Inference: paused'}
      </StatusBadge>
      {batchActive ? (
        <StatusBadge tone="info">Batch dispatching</StatusBadge>
      ) : null}
      {canResume ? (
        <Button
          variant="ghost"
          size="sm"
          disabled={busy}
          title="POST /runtime/start-scan — resume inference after Pause"
          onClick={() => startScan.mutate()}
        >
          <Play />
          Resume scan
        </Button>
      ) : null}
      <Button
        variant="ghost"
        size="sm"
        disabled={busy || !isReady || batchActive}
        title="POST /runtime/dispatch — snapshot isReady batch, send to ICS"
        onClick={() => confirmDispatch.mutate()}
      >
        <CircleCheck />
        Dispatch
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
