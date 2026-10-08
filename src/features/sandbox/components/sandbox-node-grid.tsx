import { SandboxNodeCard } from '@/features/sandbox/components/sandbox-node-card'
import type { SandboxNode } from '@/features/sandbox/types'
import { useNodes } from '@/features/nodes'
import type { WarehouseNode } from '@/types'

interface SandboxNodeGridProps {
  nodes: SandboxNode[]
}

function zoneOf(
  sandbox: SandboxNode,
  byId: Map<string, WarehouseNode>,
): string {
  return byId.get(sandbox.nodeId)?.zoneId ?? '—'
}

function sortInZone(a: SandboxNode, b: SandboxNode, byId: Map<string, WarehouseNode>) {
  const wa = byId.get(a.nodeId)
  const wb = byId.get(b.nodeId)
  const pa = wa?.priority ?? Number.POSITIVE_INFINITY
  const pb = wb?.priority ?? Number.POSITIVE_INFINITY
  if (pa !== pb) {
    return pa - pb
  }
  return a.nodeId.localeCompare(b.nodeId)
}

/**
 * Nhóm theo zoneId từ warehouse get_nodes (sandbox API không trả zoneId/kind).
 * @see docs/fe-api-sandbox.md
 */
export function SandboxNodeGrid({ nodes }: SandboxNodeGridProps) {
  const { data: warehouseNodes = [] } = useNodes()
  const byId = new Map(warehouseNodes.map((node) => [node.id, node]))

  const groups = new Map<string, SandboxNode[]>()
  for (const node of nodes) {
    const zoneId = zoneOf(node, byId)
    const list = groups.get(zoneId) ?? []
    list.push(node)
    groups.set(zoneId, list)
  }

  const zoneIds = [...groups.keys()].sort((a, b) => a.localeCompare(b))

  return (
    <div className="space-y-4">
      {zoneIds.map((zoneId) => {
        const items = [...(groups.get(zoneId) ?? [])].sort((a, b) =>
          sortInZone(a, b, byId),
        )
        const starts = items.filter(
          (n) => (byId.get(n.nodeId)?.kind ?? 'start') === 'start',
        )
        const ends = items.filter((n) => byId.get(n.nodeId)?.kind === 'end')
        const rest = items.filter((n) => {
          const kind = byId.get(n.nodeId)?.kind
          return kind !== 'start' && kind !== 'end'
        })
        return (
          <section key={zoneId}>
            <h3 className="mb-2 text-[11px] font-semibold text-muted-foreground">
              Zone {zoneId}
              <span className="ml-1 font-normal text-faint">
                ({items.length} node)
              </span>
            </h3>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {[...starts, ...ends, ...rest].map((node) => (
                <SandboxNodeCard
                  key={node.nodeId}
                  sandbox={node}
                  warehouse={byId.get(node.nodeId)}
                />
              ))}
            </div>
          </section>
        )
      })}
    </div>
  )
}
