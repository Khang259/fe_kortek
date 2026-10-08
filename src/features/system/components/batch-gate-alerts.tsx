import { Button } from '@/components/ui/button'
import { useCancelBatch } from '@/features/system/api/runtime'
import type { WaitingForItem } from '@/features/system/types'

interface BatchGateAlertsProps {
  waitingFor: WaitingForItem[]
  stuckNodes: string[]
  /** Chỉ hiện nút huỷ khi cổng đang mở. */
  batchActive: boolean
}

/**
 * Cảnh báo waitingFor / stuckNodes + nút Huỷ đợt (cancel-batch).
 * @see docs/fe-api-dispatch-batch.md
 */
export function BatchGateAlerts({
  waitingFor,
  stuckNodes,
  batchActive,
}: BatchGateAlertsProps) {
  const cancelBatch = useCancelBatch()

  if (waitingFor.length === 0 && stuckNodes.length === 0) {
    return null
  }

  return (
    <div className="flex flex-col gap-2">
      {waitingFor.map((item) => (
        <p
          key={`${item.zoneId}-${item.nodeId}`}
          role="status"
          className="rounded-md border border-info/40 bg-info/10 px-3 py-2 text-[11px] text-info"
        >
          Zone {item.zoneId} waiting for {item.nodeId}
        </p>
      ))}

      {stuckNodes.length > 0 ? (
        <div
          role="status"
          className="flex flex-wrap items-center gap-2 rounded-md border border-danger/40 bg-danger/10 px-3 py-2 text-[11px] text-danger"
        >
          <span>
            Possible stuck load: {stuckNodes.join(', ')}. Reposition load or
            cancel batch — inference keeps running.
          </span>
          {batchActive ? (
            <Button
              variant="outline"
              size="sm"
              className="h-7 border-danger/50 text-danger"
              disabled={cancelBatch.isPending}
              title="POST /runtime/cancel-batch — close gate, keep inference"
              onClick={() => cancelBatch.mutate()}
            >
              Cancel batch
            </Button>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}
