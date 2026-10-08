import type { BatchStopReason } from '@/features/system/types'

interface BatchStopBannerProps {
  stopReason: BatchStopReason
  newNodes: string[]
}

/**
 * Banner khi cổng batch vừa đóng — gợi ý bước tiếp theo.
 * @see docs/fe-api-dispatch-batch.md
 */
export function BatchStopBanner({ stopReason, newNodes }: BatchStopBannerProps) {
  if (stopReason === 'batch_complete') {
    return (
      <p
        role="status"
        className="rounded-md border border-info/40 bg-info/10 px-3 py-2 text-[11px] text-info"
      >
        Batch fully dispatched — stage the next load, then confirm.
      </p>
    )
  }

  if (stopReason === 'new_nodes') {
    const list = newNodes.length > 0 ? newNodes.join(', ') : '(unknown)'
    return (
      <p
        role="status"
        className="rounded-md border border-warning/40 bg-warning/10 px-3 py-2 text-[11px] text-warning"
      >
        New load detected outside batch: {list} — verify, then confirm again.
      </p>
    )
  }

  if (stopReason === 'canceled') {
    return (
      <p
        role="status"
        className="rounded-md border border-border bg-secondary/60 px-3 py-2 text-[11px] text-muted-foreground"
      >
        Batch canceled. Inference still running — confirm again when ready.
      </p>
    )
  }

  return null
}
