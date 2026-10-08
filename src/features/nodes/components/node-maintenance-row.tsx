import { Lock, LockOpen, Wrench } from 'lucide-react'
import { useState } from 'react'

import { StatusBadge } from '@/components/common/status-badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { PERMISSIONS } from '@/config/permissions'
import {
  useSetNodeLock,
  useUnlockByUser,
} from '@/features/nodes/api/set-node-lock'
import { useToggleNodeMaintenance } from '@/features/nodes/api/toggle-node-maintenance'
import { useNodeRuntimeItem } from '@/features/nodes/hooks/use-node-runtime-item'
import { getNodeDisplayName } from '@/features/nodes/utils/node-display-name'
import {
  isNodeLocked,
  nodeLockSummary,
} from '@/features/nodes/utils/node-lock'
import { useHasPermission } from '@/hooks/use-has-permission'
import { cn } from '@/lib/utils'
import type { WarehouseNode } from '@/types'

interface NodeMaintenanceRowProps {
  node: WarehouseNode
}

export function NodeMaintenanceRow({ node }: NodeMaintenanceRowProps) {
  const [reason, setReason] = useState('')
  const toggleMaintenance = useToggleNodeMaintenance()
  const setLock = useSetNodeLock()
  const unlockByUser = useUnlockByUser()
  const canMaintain = useHasPermission(PERMISSIONS.nodeMaintenance)
  const runtime = useNodeRuntimeItem(node.id)
  const lock = runtime?.lock ?? node.lock
  const locked = isNodeLocked(lock)
  const lockBusy =
    setLock.isPending ||
    unlockByUser.isPending ||
    toggleMaintenance.isPending
  const displayName = getNodeDisplayName(node)

  return (
    <div
      className={cn(
        'flex flex-wrap items-center gap-2 border-b px-3 py-2 last:border-b-0',
        locked && 'bg-warning/10',
      )}
    >
      <span className="min-w-32 flex-1">
        <strong className="block text-[11px] font-medium" title={node.id}>
          {displayName}
        </strong>
        <small className="mt-0.5 block text-[9px] text-faint">
          {node.id} · {node.kind} · {node.zoneId}
          {!node.enabled ? ' · disabled' : ''}
          {locked ? ` · lock: ${nodeLockSummary(lock)}` : ''}
          {node.maintenanceReason ? ` · ${node.maintenanceReason}` : ''}
        </small>
      </span>

      {node.isUnderMaintenance ? (
        <StatusBadge tone="warning">Under maintenance</StatusBadge>
      ) : canMaintain ? (
        <Input
          value={reason}
          onChange={(event) => setReason(event.target.value)}
          placeholder="Maintenance reason"
          aria-label={`Maintenance reason for ${displayName}`}
          className="h-7 w-40 text-[10px]"
        />
      ) : null}

      {canMaintain ? (
        <>
          {locked ? (
            <Button
              variant="outline"
              size="sm"
              disabled={lockBusy}
              title="POST /nodes/unlock_by_user — clear lock.user and lock.system on this node"
              onClick={() => unlockByUser.mutate({ nodeId: node.id })}
            >
              <LockOpen />
              Unlock
            </Button>
          ) : (
            <Button
              variant="outline"
              size="sm"
              disabled={lockBusy}
              title="Lock node from auto-dispatch (lock.user)"
              onClick={() =>
                setLock.mutate({ nodeId: node.id, user: true })
              }
            >
              <Lock />
              User lock
            </Button>
          )}
          <Button
            variant={node.isUnderMaintenance ? 'default' : 'outline'}
            size="sm"
            disabled={
              lockBusy ||
              (!node.isUnderMaintenance && reason.trim() === '')
            }
            onClick={() => {
              const next = !node.isUnderMaintenance
              toggleMaintenance.mutate({
                nodeId: node.id,
                isUnderMaintenance: next,
                maintenanceReason: next ? reason.trim() : null,
              })
              setReason('')
            }}
          >
            <Wrench />
            {node.isUnderMaintenance ? 'End maintenance' : 'Start maintenance'}
          </Button>
        </>
      ) : (
        <span className="text-[9px] text-faint">
          Missing node.maintenance permission
        </span>
      )}
    </div>
  )
}
