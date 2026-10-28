import type { BatchStopReason } from '@/features/system/types'

interface BatchStopBannerProps {
  stopReason: BatchStopReason
  newNodes: string[]
  /** Node ready ngoài batch — không dừng gửi; cần dispatch batch sau. */
  newNodesOutsideBatch?: string[]
}

/**
 * Banner khi cổng batch vừa đóng / có node mới ngoài batch.
 * @see docs/FE_CONTRACT_COLS_API.md
 */
export function BatchStopBanner({
  stopReason,
  newNodes,
  newNodesOutsideBatch = [],
}: BatchStopBannerProps) {
  return (
    <>
      {stopReason === 'batch_complete' ? (
        <p
          role="status"
          className="rounded-md border border-info/40 bg-info/10 px-3 py-2 text-[11px] text-info"
        >
          Batch fully dispatched — stage the next load, then dispatch.
        </p>
      ) : null}

      {stopReason === 'new_nodes' ? (
        <p
          role="status"
          className="rounded-md border border-warning/40 bg-warning/10 px-3 py-2 text-[11px] text-warning"
        >
          New load detected outside batch:{' '}
          {newNodes.length > 0 ? newNodes.join(', ') : '(unknown)'} — verify,
          then dispatch again.
        </p>
      ) : null}

      {stopReason === 'canceled' ? (
        <p
          role="status"
          className="rounded-md border border-border bg-secondary/60 px-3 py-2 text-[11px] text-muted-foreground"
        >
          Batch canceled. Inference still running — dispatch again when ready.
        </p>
      ) : null}

      {newNodesOutsideBatch.length > 0 ? (
        <p
          role="status"
          className="rounded-md border border-info/40 bg-info/10 px-3 py-2 text-[11px] text-info"
        >
          New ready outside batch (sending continues):{' '}
          {newNodesOutsideBatch.join(', ')} — include on next dispatch.
        </p>
      ) : null}
    </>
  )
}
