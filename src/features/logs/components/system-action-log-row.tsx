import { Braces } from 'lucide-react'

import { StatusBadge } from '@/components/common/status-badge'
import { Button } from '@/components/ui/button'
import { TableCell, TableRow } from '@/components/ui/table'
import { useLogPayloadStore } from '@/features/logs/stores/log-payload-store'
import type { SystemActionLog } from '@/features/logs/types'
import {
  actionResultLabel,
  actionResultTone,
  systemActionLabel,
} from '@/features/logs/utils/log-result'
import { isSingleOrderId } from '@/features/snapshots'
import { cn } from '@/lib/utils'
import { formatLogTimestamp } from '@/utils'

interface SystemActionLogRowProps {
  log: SystemActionLog
}

function formatRoute(log: SystemActionLog) {
  if (!log.startNodeId && !log.endNodeId) {
    return '—'
  }
  return `${log.startNodeId ?? '—'} → ${log.endNodeId ?? '—'}`
}

/** Chỉ Single + ICS success mới có snapshot (contract). */
function resolveSnapshotOrderId(log: SystemActionLog): string | undefined {
  if (log.action !== 'dispatch' || log.result !== 'success') {
    return undefined
  }
  if (!log.orderId || !isSingleOrderId(log.orderId)) {
    return undefined
  }
  return log.orderId
}

export function SystemActionLogRow({ log }: SystemActionLogRowProps) {
  const openPayload = useLogPayloadStore((state) => state.open)
  const route = formatRoute(log)
  const orderLabel = log.orderId ?? '—'
  const isFailedDispatch =
    log.action === 'dispatch' && log.result === 'failed'
  const snapshotOrderId = resolveSnapshotOrderId(log)

  return (
    <TableRow className={cn(isFailedDispatch && 'bg-danger-muted/25')}>
      <TableCell className="font-mono text-[10px] whitespace-nowrap text-muted-foreground">
        {log.occurredAt ? formatLogTimestamp(log.occurredAt) : '—'}
      </TableCell>
      <TableCell className="font-mono text-[10px]" title={log.action}>
        {systemActionLabel(log.action)}
      </TableCell>
      <TableCell
        className="max-w-36 truncate font-mono text-[10px]"
        title={orderLabel}
      >
        {orderLabel}
      </TableCell>
      <TableCell className="max-w-48 truncate text-[10px]" title={route}>
        {route}
      </TableCell>
      <TableCell
        className="max-w-40 truncate font-mono text-[10px] text-muted-foreground"
        title={log.endpoint ?? undefined}
      >
        {log.endpoint ?? '—'}
      </TableCell>
      <TableCell>
        <StatusBadge tone={actionResultTone(log.result)}>
          {actionResultLabel(log.result)}
        </StatusBadge>
      </TableCell>
      <TableCell className="text-right">
        <Button
          variant="ghost"
          size="icon-xs"
          aria-label={`View payload ${orderLabel}`}
          onClick={() =>
            openPayload({
              title: `${log.action} · ${orderLabel}`,
              snapshotOrderId,
              sections: [
                { label: 'Endpoint', data: log.endpoint ?? '—' },
                { label: 'Error', data: log.errorMessage ?? '—' },
                { label: 'Request', data: log.requestPayload },
              ],
            })
          }
        >
          <Braces />
        </Button>
      </TableCell>
    </TableRow>
  )
}
