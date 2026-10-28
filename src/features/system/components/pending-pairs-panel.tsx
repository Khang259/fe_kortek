import { QueryState } from '@/components/common/query-state'
import { StatusBadge } from '@/components/common/status-badge'
import { BatchGateAlerts } from '@/features/system/components/batch-gate-alerts'
import { BatchStopBanner } from '@/features/system/components/batch-stop-banner'
import { NextPairsList } from '@/features/system/components/next-pairs-list'
import { ReadyStartsTable } from '@/features/system/components/ready-starts-table'
import { usePendingPairs } from '@/features/system/api/runtime'

interface PendingPairsPanelProps {
  /** Tắt poll khi không cần (vd. sandbox 404). */
  enabled?: boolean
  className?: string
}

/**
 * Preview batch: readyStarts + nextPairs + banner stopReason / stuck / cols.
 * Poll GET /runtime/get_pending_pairs (~1.5s).
 */
export function PendingPairsPanel({
  enabled = true,
  className,
}: PendingPairsPanelProps) {
  const query = usePendingPairs(enabled)
  const data = query.data
  const batch = data?.batch

  return (
    <section className={className}>
      <header className="mb-2 flex flex-wrap items-center gap-2">
        <h3 className="text-xs font-semibold">Pending batch</h3>
        {batch ? (
          <StatusBadge tone={batch.active ? 'success' : 'neutral'}>
            {batch.active
              ? `Gate open · ${batch.remaining}/${batch.size} left`
              : 'Gate closed'}
          </StatusBadge>
        ) : null}
        {data && !data.runtimeReady ? (
          <StatusBadge tone="warning">Runtime not ready</StatusBadge>
        ) : null}
      </header>

      <div className="mb-2 flex flex-col gap-2">
        {batch ? (
          <BatchStopBanner
            stopReason={batch.stopReason}
            newNodes={batch.newNodes}
            newNodesOutsideBatch={data?.newNodesOutsideBatch}
          />
        ) : null}
        <BatchGateAlerts
          waitingFor={data?.waitingFor ?? []}
          stuckNodes={data?.stuckNodes ?? []}
          batchActive={batch?.active ?? false}
        />
        {(data?.colStatus.length ?? 0) > 0 ? (
          <p className="text-[10px] text-muted-foreground">
            Col heads:{' '}
            {data!.colStatus
              .map(
                (item) =>
                  `${item.zoneId}/${item.colId}→${item.headNodeId}${
                    item.headInBatch ? '✓' : ''
                  }`,
              )
              .join(' · ')}
          </p>
        ) : null}
      </div>

      <div className="overflow-hidden rounded-lg border bg-card">
        <QueryState
          isPending={query.isPending && !data}
          isError={query.isError && !data}
          isEmpty={false}
        >
          <div className="border-b">
            <p className="border-b px-3 py-1.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
              Ready starts
            </p>
            <ReadyStartsTable items={data?.readyStarts ?? []} />
          </div>
          <div>
            <p className="border-b px-3 py-1.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
              Next pairs
            </p>
            <NextPairsList items={data?.nextPairs ?? []} />
          </div>
        </QueryState>
      </div>
    </section>
  )
}
