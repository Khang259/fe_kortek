import { CircleCheck, Play, Zap } from 'lucide-react'

import { StatusBadge } from '@/components/common/status-badge'
import { Button } from '@/components/ui/button'
import {
  useCancelBatch,
  useConfirmDispatch,
  usePendingPairs,
  useStartScan,
} from '@/features/system/api/runtime'
import { useToggleZone } from '@/features/zones/api/toggle-zone'
import { useInferenceStore } from '@/features/zones/stores/inference-store'
import { useSystemPowerStore } from '@/features/zones/stores/system-power-store'

/**
 * Flow: start-cameras → (isReady) → dispatch.
 * start-scan giữ để resume sau pause.
 * @see docs/FE_CONTRACT_COLS_API.md
 */
export function SandboxToolbar() {
  const isReady = useInferenceStore((state) => state.isReady)
  const fleetActive = useSystemPowerStore((state) => state.fleetActive)
  const toggleZone = useToggleZone()
  const startScan = useStartScan()
  const confirmDispatch = useConfirmDispatch()
  const cancelBatch = useCancelBatch()
  const pendingPairs = usePendingPairs(true)
  const batchActive = pendingPairs.data?.batch.active ?? false
  const hasStuck = (pendingPairs.data?.stuckNodes.length ?? 0) > 0
  const busy =
    toggleZone.isPending ||
    startScan.isPending ||
    confirmDispatch.isPending ||
    cancelBatch.isPending

  const handleStartCameras = () => {
    toggleZone.mutate({ zoneId: null, isRunning: true })
  }

  return (
    <div className="mb-4 flex flex-wrap items-center gap-2 rounded-lg border bg-card px-3 py-2.5">
      <StatusBadge tone={isReady ? 'success' : 'warning'}>
        {isReady ? 'Inference: running' : 'Inference: pause'}
      </StatusBadge>
      <StatusBadge tone={fleetActive ? 'success' : 'neutral'}>
        {fleetActive ? 'Camera: armed' : 'Camera: off'}
      </StatusBadge>
      {batchActive ? (
        <StatusBadge tone="info">Batch sending</StatusBadge>
      ) : null}
      <Button
        variant="outline"
        size="sm"
        disabled={busy || fleetActive}
        title="POST /system/start-cameras — cameras + inference ON"
        onClick={handleStartCameras}
      >
        <Zap />
        start-cameras
      </Button>
      {fleetActive && !isReady ? (
        <Button
          variant="outline"
          size="sm"
          disabled={busy}
          title="POST /runtime/start-scan — resume inference after Pause"
          onClick={() => startScan.mutate()}
        >
          <Play />
          start-scan
        </Button>
      ) : null}
      <Button
        variant="outline"
        size="sm"
        disabled={busy || !isReady || batchActive}
        title="POST /runtime/dispatch — capture batch, send ICS"
        onClick={() => confirmDispatch.mutate()}
      >
        <CircleCheck />
        dispatch
      </Button>
      {batchActive && hasStuck ? (
        <Button
          variant="outline"
          size="sm"
          disabled={busy}
          title="POST /runtime/cancel-batch — close gate, keep inference"
          onClick={() => cancelBatch.mutate()}
        >
          cancel-batch
        </Button>
      ) : null}
      <p className="w-full text-[10px] text-faint md:w-auto md:flex-1 md:text-right">
        start-cameras = cameras + scan. Dispatch theo colId ASC rồi priority.
        Stuck → cancel-batch.
      </p>
    </div>
  )
}
