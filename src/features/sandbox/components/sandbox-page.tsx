import { QueryState } from '@/components/common/query-state'
import { SectionHeader } from '@/components/common/section-header'
import { PERMISSIONS } from '@/config/permissions'
import {
  isSandboxRuntimeDown,
  isSandboxUnavailable,
  useSandboxNodes,
  useSandboxOrders,
} from '@/features/sandbox/api/sandbox-api'
import { SandboxNodeGrid } from '@/features/sandbox/components/sandbox-node-grid'
import { SandboxOrdersTable } from '@/features/sandbox/components/sandbox-orders-table'
import { SandboxToolbar } from '@/features/sandbox/components/sandbox-toolbar'
import { PendingPairsPanel } from '@/features/system'
import { useHasPermission } from '@/hooks/use-has-permission'

export function SandboxPage() {
  const canControl = useHasPermission(PERMISSIONS.systemControl)
  const nodesQuery = useSandboxNodes(canControl)
  const runtimeDown =
    nodesQuery.isError && isSandboxRuntimeDown(nodesQuery.error)
  const ordersQuery = useSandboxOrders(
    canControl && (nodesQuery.isSuccess || runtimeDown),
  )

  if (!canControl) {
    return (
      <main className="px-6 py-6">
        <p className="text-[11px] text-muted-foreground">
          Requires system.control permission to use Sandbox.
        </p>
      </main>
    )
  }

  if (nodesQuery.isError && isSandboxUnavailable(nodesQuery.error)) {
    return (
      <main className="px-6 py-6">
        <SectionHeader title="Sandbox" />
        <p className="text-[11px] text-muted-foreground">
          Sandbox unavailable (RUNTIME_MODE ≠ sandbox). API returns 404.
        </p>
      </main>
    )
  }

  const nodes = nodesQuery.data ?? []
  const orders = ordersQuery.data ?? []
  const ordersRuntimeDown =
    ordersQuery.isError && isSandboxRuntimeDown(ordersQuery.error)

  return (
    <main className="min-w-0 overflow-auto px-6 py-6">
      <SectionHeader
        title="Sandbox"
        description="Smoke-test dispatch by priority — mock camera / AI / ICS"
      />
      <SandboxToolbar />

      {runtimeDown ? (
        <p
          role="status"
          className="mb-4 rounded-md border border-warning/40 bg-warning/10 px-3 py-2 text-[11px] text-warning"
        >
          Sandbox runtime not running (HTTP 503). Run start_all → start-scan;
          this page will refresh automatically.
        </p>
      ) : null}

      <PendingPairsPanel
        className="mb-6 max-w-2xl"
        enabled={!runtimeDown}
      />

      <section className="mb-6">
        <h3 className="mb-2 text-xs font-semibold">Nodes (toggle detected)</h3>
        <QueryState
          isPending={nodesQuery.isPending}
          isError={nodesQuery.isError && !runtimeDown}
          isEmpty={!runtimeDown && nodes.length === 0}
          emptyMessage="No ROI nodes (empty items)"
        >
          {runtimeDown ? null : <SandboxNodeGrid nodes={nodes} />}
        </QueryState>
      </section>

      <section>
        <h3 className="mb-2 text-xs font-semibold">
          Mock ICS (get_orders · compare seq)
        </h3>
        <div className="overflow-hidden rounded-lg border bg-card">
          {ordersRuntimeDown && !runtimeDown ? (
            <p className="px-3 py-6 text-center text-[11px] text-warning">
              get_orders 503 — runtime not ready.
            </p>
          ) : (
            <QueryState
              isPending={ordersQuery.isPending && !runtimeDown}
              isError={ordersQuery.isError && !ordersRuntimeDown}
              isEmpty={false}
            >
              <SandboxOrdersTable orders={orders} />
            </QueryState>
          )}
        </div>
      </section>
    </main>
  )
}
