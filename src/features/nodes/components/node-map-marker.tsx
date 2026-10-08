import { Lock } from 'lucide-react'

import { useNodeRuntimeItem } from '@/features/nodes/hooks/use-node-runtime-item'
import { getNodeDisplayName } from '@/features/nodes/utils/node-display-name'
import {
  isNodeLocked,
  nodeLockSummary,
} from '@/features/nodes/utils/node-lock'
import {
  MAP_STATUS_FILL,
  resolveMapNodeStatus,
} from '@/features/nodes/utils/map-status-style'
import { cn } from '@/lib/utils'
import type { WarehouseNode } from '@/types'

interface NodeMapMarkerProps {
  node: WarehouseNode
}

/** Marker Mongo (khi có position) — màu khớp legend detected/undetected/unknown. */
export function NodeMapMarker({ node }: NodeMapMarkerProps) {
  const runtime = useNodeRuntimeItem(node.id)

  if (!node.position) {
    return null
  }

  const lock = runtime?.lock ?? node.lock
  const locked = isNodeLocked(lock)
  const displayName = getNodeDisplayName(node)
  const status = resolveMapNodeStatus(runtime)
  const fill = MAP_STATUS_FILL[status]

  return (
    <div
      className={cn(
        'absolute z-2 flex size-7 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2',
        locked && 'border-dashed border-warning',
        node.isUnderMaintenance && 'opacity-45',
      )}
      style={{
        left: `${node.position.x}%`,
        top: `${node.position.y}%`,
        borderColor: locked ? undefined : fill,
        backgroundColor: `${fill}33`,
      }}
      title={
        [
          displayName,
          node.id,
          status,
          runtime?.isReady ? 'ready' : null,
          locked ? `Lock: ${nodeLockSummary(lock)}` : null,
          node.isUnderMaintenance
            ? `Maintenance: ${node.maintenanceReason ?? 'unknown'}`
            : null,
        ]
          .filter(Boolean)
          .join(' · ')
      }
    >
      {locked ? (
        <span className="absolute -top-1.5 -right-1.5 grid size-4 place-items-center rounded-full border border-warning bg-surface-raised text-warning">
          <Lock className="size-2" />
        </span>
      ) : null}
    </div>
  )
}
