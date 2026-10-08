import { ChevronRight } from 'lucide-react'

import { QueryState } from '@/components/common/query-state'
import { PriorityChainNode } from '@/features/priority/components/priority-chain-node'
import type { PriorityDraft } from '@/features/priority/types'
import type { WarehouseNode } from '@/types'

interface PriorityChainProps {
  title: string
  nodes: WarehouseNode[]
  isEditing: boolean
  drafts: Record<string, PriorityDraft>
  onChangePriority: (nodeId: string, priority: number) => void
  isPending: boolean
  isError: boolean
  emptyMessage?: string
}

/** Chuỗi start — chỉ sửa priority (không filter / add / remove). */
export function PriorityChain({
  title,
  nodes,
  isEditing,
  drafts,
  onChangePriority,
  isPending,
  isError,
  emptyMessage = 'No start nodes',
}: PriorityChainProps) {
  return (
    <div className="flex h-full min-w-0 flex-col rounded-lg border bg-card p-3">
      <p className="mb-2 text-[11px] font-semibold text-foreground">{title}</p>

      <QueryState
        isPending={isPending}
        isError={isError}
        isEmpty={nodes.length === 0}
        emptyMessage={emptyMessage}
      >
        <div className="flex flex-wrap items-center gap-2">
          {nodes.map((node, index) => (
            <div key={node.id} className="flex items-center gap-2">
              <PriorityChainNode
                node={node}
                isEditing={isEditing}
                draft={drafts[node.id]}
                onChangePriority={onChangePriority}
              />
              {index < nodes.length - 1 ? (
                <ChevronRight
                  className="size-4 shrink-0 text-faint"
                  aria-hidden
                />
              ) : null}
            </div>
          ))}
        </div>
      </QueryState>
    </div>
  )
}
