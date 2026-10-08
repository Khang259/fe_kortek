import { Power, Trash2, Wrench } from 'lucide-react'

import { StatusBadge } from '@/components/common/status-badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  useDeletePair,
  useSetPairEnabled,
} from '@/features/dispatch/api/pair-mutations'
import { usePairBlocking } from '@/features/dispatch/hooks/use-pair-blocking'
import { usePairBulkEditStore } from '@/features/dispatch/stores/pair-bulk-edit-store'
import type { NodePair } from '@/features/dispatch/types'
import { useNodes } from '@/features/nodes'
import { getNodeDisplayName } from '@/features/nodes/utils/node-display-name'
import { useConfigWriteGate } from '@/features/system/hooks/use-config-write-gate'
import { cn } from '@/lib/utils'

interface NodePairCardProps {
  pair: NodePair
  canWrite: boolean
  isEditing: boolean
}

/** Card pair — chỉnh name khi bulk edit; không có zoneId trên pair. */
export function NodePairCard({
  pair,
  canWrite,
  isEditing,
}: NodePairCardProps) {
  const { isBlocked, blockedReason } = usePairBlocking(pair)
  const { data: nodes = [] } = useNodes()
  const deletePair = useDeletePair()
  const setEnabled = useSetPairEnabled()
  const { canWriteConfig } = useConfigWriteGate()
  const draft = usePairBulkEditStore((state) => state.drafts[pair.id])
  const patchDraft = usePairBulkEditStore((state) => state.patchDraft)

  const startNode = nodes.find((node) => node.id === pair.startNodeId)
  const endNode =
    pair.pairType === 'empty'
      ? null
      : nodes.find((node) => node.id === pair.endNodeId)
  const startLabel = startNode
    ? getNodeDisplayName(startNode)
    : pair.startNodeId
  const endLabel =
    pair.pairType === 'empty'
      ? '—'
      : endNode
        ? getNodeDisplayName(endNode)
        : pair.endNodeId

  const zoneHint = [startNode?.zoneId, endNode?.zoneId]
    .filter(Boolean)
    .filter((value, index, list) => list.indexOf(value) === index)
    .join(' / ')

  const busy = deletePair.isPending || setEnabled.isPending
  const actionsDisabled = busy || !canWriteConfig
  const showEditors = canWrite && isEditing && draft

  const handleDelete = () => {
    const ok = window.confirm(`Delete pair ${pair.id}?`)
    if (!ok) {
      return
    }
    deletePair.mutate({ id: pair.id })
  }

  return (
    <article
      className={cn(
        'overflow-hidden rounded-lg border bg-card',
        isBlocked && 'border-warning',
      )}
    >
      <header className="flex flex-wrap items-center gap-2 border-b bg-surface-raised px-3 py-2.5">
        <div className="min-w-0 flex-1 space-y-1.5">
          {showEditors ? (
            <Input
              value={draft.name}
              onChange={(event) =>
                patchDraft(pair.id, { name: event.target.value })
              }
              aria-label={`Pair name ${pair.id}`}
              className="h-7 font-semibold text-[11px]"
            />
          ) : (
            <b
              className="block truncate text-[11px] font-semibold"
              title={pair.name}
            >
              {pair.name}
            </b>
          )}
          <p className="truncate text-[9px] text-faint" title={pair.id}>
            {startLabel} → {endLabel}
          </p>
          {zoneHint ? (
            <span className="text-[10px] text-muted-foreground">
              Zone node: {zoneHint}
            </span>
          ) : null}
        </div>

        {canWrite && !isEditing ? (
          <div className="flex shrink-0 gap-1">
            <Button
              variant={pair.enabled ? 'destructive' : 'outline'}
              size="icon-xs"
              aria-label={pair.enabled ? 'Disable pair' : 'Enable pair'}
              disabled={actionsDisabled}
              title="set_pair_enabled"
              onClick={() =>
                setEnabled.mutate({ id: pair.id, enabled: !pair.enabled })
              }
            >
              <Power />
            </Button>
            <Button
              variant="destructive"
              size="icon-xs"
              aria-label="Delete pair"
              disabled={actionsDisabled}
              onClick={handleDelete}
            >
              <Trash2 />
            </Button>
          </div>
        ) : null}
      </header>

      {isBlocked && blockedReason ? (
        <p
          role="status"
          className="flex items-center gap-1.5 border-b border-warning bg-warning-muted/30 px-3 py-2 text-[10px] text-warning"
        >
          <Wrench className="size-3" />
          {blockedReason}
        </p>
      ) : null}

      <footer className="flex flex-wrap items-center gap-1.5 px-3 py-2">
        <StatusBadge
          tone={isBlocked ? 'warning' : pair.enabled ? 'success' : 'neutral'}
        >
          {isBlocked ? 'Blocked' : pair.enabled ? 'Active' : 'Paused'}
        </StatusBadge>
      </footer>
    </article>
  )
}
