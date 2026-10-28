import { Input } from '@/components/ui/input'
import { getNodeDisplayName } from '@/features/nodes/utils/node-display-name'
import type { PriorityDraft } from '@/features/priority/types'
import { cn } from '@/lib/utils'
import type { WarehouseNode } from '@/types'

function formatPriority(value: number) {
  return String(value).padStart(2, '0')
}

interface PriorityChainNodeProps {
  node: WarehouseNode
  isEditing: boolean
  draft?: PriorityDraft
  onChangePriority: (nodeId: string, priority: number) => void
  onChangeColId: (nodeId: string, colId: string) => void
}

export function PriorityChainNode({
  node,
  isEditing,
  draft,
  onChangePriority,
  onChangeColId,
}: PriorityChainNodeProps) {
  const priority = draft?.priority ?? node.priority
  const colId = draft?.colId ?? node.colId ?? ''
  const displayName = getNodeDisplayName(node)

  return (
    <article
      className={cn(
        'priority-chain-card group relative isolate w-40 shrink-0 overflow-hidden rounded-2xl border border-border bg-card',
        'shadow-[0_8px_20px_-14px_rgba(0,0,0,0.55)] transition duration-200',
        'hover:-translate-y-0.5 hover:border-info hover:shadow-[0_12px_24px_-14px_rgba(115,167,255,0.25)]',
      )}
    >
      <div className="grid grid-cols-[32%_28%_40%] divide-x divide-border">
        <div className="flex flex-col gap-0.5 px-1.5 py-2.5">
          <span className="text-[8px] font-medium tracking-wider text-faint uppercase">
            Col
          </span>
          {isEditing ? (
            <Input
              value={colId}
              onChange={(event) =>
                onChangeColId(node.id, event.target.value.toUpperCase())
              }
              className="h-auto border-0 bg-transparent p-0 font-mono text-base font-bold text-foreground uppercase shadow-none focus-visible:ring-0"
              aria-label={`Col for ${displayName}`}
              maxLength={4}
            />
          ) : (
            <span className="font-mono text-base leading-none font-bold text-foreground">
              {colId || '—'}
            </span>
          )}
        </div>

        <div className="flex flex-col gap-0.5 px-1.5 py-2.5">
          <span className="text-[8px] font-medium tracking-wider text-faint uppercase">
            P
          </span>
          {isEditing ? (
            <Input
              type="number"
              min={0}
              value={priority}
              onChange={(event) => {
                const value = Number(event.target.value)
                if (!Number.isFinite(value)) return
                onChangePriority(node.id, Math.max(0, Math.trunc(value)))
              }}
              className="h-auto border-0 bg-transparent p-0 font-mono text-base font-bold text-foreground shadow-none focus-visible:ring-0"
              aria-label={`Priority for ${displayName}`}
            />
          ) : (
            <span className="font-mono text-base leading-none font-bold text-foreground">
              {formatPriority(priority)}
            </span>
          )}
        </div>

        <div className="flex min-w-0 flex-col justify-center gap-0.5 px-2 py-2.5">
          <span className="text-[8px] font-medium tracking-wider text-faint uppercase">
            Name
          </span>
          <span
            className="truncate text-[9px] font-semibold text-muted-foreground"
            title={`${displayName} — rename in Settings → Cameras`}
          >
            {displayName}
          </span>
        </div>
      </div>
    </article>
  )
}
