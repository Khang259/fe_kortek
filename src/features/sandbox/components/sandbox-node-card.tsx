import { StatusBadge } from '@/components/common/status-badge'
import { Button } from '@/components/ui/button'
import { useSetSandboxNodeState } from '@/features/sandbox/api/sandbox-api'
import type { SandboxNode } from '@/features/sandbox/types'
import { useNodeRuntimeItem } from '@/features/nodes/hooks/use-node-runtime-item'
import { getNodeDisplayName } from '@/features/nodes/utils/node-display-name'
import {
  isNodeLocked,
  nodeLockSummary,
} from '@/features/nodes/utils/node-lock'
import { cn } from '@/lib/utils'
import type { WarehouseNode } from '@/types'

interface SandboxNodeCardProps {
  sandbox: SandboxNode
  warehouse?: WarehouseNode
}

export function SandboxNodeCard({ sandbox, warehouse }: SandboxNodeCardProps) {
  const setState = useSetSandboxNodeState()
  const runtime = useNodeRuntimeItem(sandbox.nodeId)
  const label = warehouse ? getNodeDisplayName(warehouse) : sandbox.nodeId
  const kind = warehouse?.kind
  const priority = warehouse?.priority
  const locked = runtime ? isNodeLocked(runtime.lock) : false
  const ready = runtime?.isReady ?? false
  const busy = setState.isPending

  return (
    <div
      className={cn(
        'flex flex-col gap-1.5 rounded-md border px-2.5 py-2',
        sandbox.detected ? 'border-warning/60 bg-warning/5' : 'bg-card',
      )}
    >
      <div className="flex items-start justify-between gap-1">
        <span className="min-w-0">
          <strong
            className="block truncate text-[11px] font-medium"
            title={sandbox.nodeId}
          >
            {label}
          </strong>
          <small className="block truncate text-[9px] text-faint">
            {kind ? `${kind} · ` : ''}
            {priority != null ? `p${priority} · ` : ''}
            {sandbox.nodeId}
            {!sandbox.cameraEnabled ? ' · cam off' : ''}
          </small>
        </span>
        <Button
          variant={sandbox.detected ? 'default' : 'outline'}
          size="sm"
          disabled={busy || !sandbox.cameraEnabled}
          title="POST /sandbox/set_node_state — desired detected (not isReady)"
          onClick={() =>
            setState.mutate({
              nodeId: sandbox.nodeId,
              detected: !sandbox.detected,
            })
          }
        >
          {sandbox.detected ? 'Loaded' : 'Empty'}
        </Button>
      </div>
      <div className="flex flex-wrap gap-1">
        <StatusBadge tone={ready ? 'success' : 'neutral'}>
          {ready ? 'ready' : 'not ready'}
        </StatusBadge>
        {locked ? (
          <StatusBadge tone="warning">
            lock: {nodeLockSummary(runtime!.lock)}
          </StatusBadge>
        ) : (
          <StatusBadge tone="neutral">unlocked</StatusBadge>
        )}
        {runtime?.detected ? (
          <StatusBadge tone="info">SSE detected</StatusBadge>
        ) : null}
      </div>
    </div>
  )
}
