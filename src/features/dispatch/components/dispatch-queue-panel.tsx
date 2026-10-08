import { PendingPairsPanel } from '@/features/system'

/**
 * Rail dashboard: preview batch (readyStarts / nextPairs / banner).
 * Data: poll GET /runtime/get_pending_pairs.
 * @see docs/fe-api-dispatch-batch.md
 */
export function DispatchQueuePanel() {
  return (
    <section className="flex h-full min-h-0 flex-col">
      <PendingPairsPanel className="flex min-h-0 flex-1 flex-col overflow-auto p-3" />
    </section>
  )
}
