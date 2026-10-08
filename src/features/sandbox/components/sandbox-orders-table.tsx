import { StatusBadge } from '@/components/common/status-badge'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useSetSandboxOrderStatus } from '@/features/sandbox/api/sandbox-api'
import type { SandboxOrder } from '@/features/sandbox/types'

interface SandboxOrdersTableProps {
  orders: SandboxOrder[]
}

function statusLabel(status: number) {
  if (status === 9) return '9 issued'
  if (status === 6) return '6 inprogress'
  if (status === 3) return '3 canceled'
  if (status === 23) return '23 placed'
  return String(status)
}

/**
 * status body là int. BE không enforce tắt detected trước →3 — operator tự làm.
 */
export function SandboxOrdersTable({ orders }: SandboxOrdersTableProps) {
  const setStatus = useSetSandboxOrderStatus()
  const sorted = [...orders].sort((a, b) => a.seq - b.seq)

  if (sorted.length === 0) {
    return (
      <p className="px-3 py-6 text-center text-[11px] text-muted-foreground">
        No mock ICS orders yet
      </p>
    )
  }

  return (
    <div>
      <p className="border-b px-3 py-2 text-[10px] text-faint">
        Checklist: clear start detected before clicking →3 (BE does not block; if
        skipped → next order may have wrong priority).
      </p>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-14">seq</TableHead>
            <TableHead>orderId</TableHead>
            <TableHead className="w-28">status</TableHead>
            <TableHead className="w-40 text-right">Simulate ICS</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sorted.map((order) => (
            <TableRow key={order.orderId}>
              <TableCell className="font-mono text-[11px]">{order.seq}</TableCell>
              <TableCell
                className="max-w-64 truncate font-mono text-[10px]"
                title={order.orderId}
              >
                {order.orderId}
              </TableCell>
              <TableCell>
                <StatusBadge
                  tone={
                    order.status === 6
                      ? 'success'
                      : order.status === 9
                        ? 'purple'
                        : 'neutral'
                  }
                >
                  {statusLabel(order.status)}
                </StatusBadge>
              </TableCell>
              <TableCell className="text-right">
                <div className="inline-flex gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={setStatus.isPending}
                    title="POST /sandbox/set_order_status · status: 6 (int)"
                    onClick={() =>
                      setStatus.mutate({ orderId: order.orderId, status: 6 })
                    }
                  >
                    →6
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={setStatus.isPending}
                    title="status: 3 (int) — clear start detected first (FE checklist)"
                    onClick={() =>
                      setStatus.mutate({ orderId: order.orderId, status: 3 })
                    }
                  >
                    →3
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
