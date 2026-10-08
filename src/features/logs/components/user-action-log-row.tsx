import { Braces } from 'lucide-react'

import { StatusBadge } from '@/components/common/status-badge'
import { Button } from '@/components/ui/button'
import { TableCell, TableRow } from '@/components/ui/table'
import { useLogPayloadStore } from '@/features/logs/stores/log-payload-store'
import type { UserActionLog } from '@/features/logs/types'
import { httpStatusTone } from '@/features/logs/utils/log-result'
import { formatLogTimestamp } from '@/utils'

interface UserActionLogRowProps {
  log: UserActionLog
}

export function UserActionLogRow({ log }: UserActionLogRowProps) {
  const openPayload = useLogPayloadStore((state) => state.open)
  const hasDetail = log.payload != null || log.changes != null

  return (
    <TableRow>
      <TableCell className="font-mono text-[10px] whitespace-nowrap text-muted-foreground">
        {formatLogTimestamp(log.occurredAt)}
      </TableCell>
      <TableCell className="text-[11px] font-medium">{log.userName}</TableCell>
      <TableCell className="text-[10px] text-muted-foreground">{log.role}</TableCell>
      <TableCell className="font-mono text-[10px]">{log.action}</TableCell>
      <TableCell
        className="max-w-48 truncate font-mono text-[10px] text-muted-foreground"
        title={log.endpoint}
      >
        {log.endpoint}
      </TableCell>
      <TableCell>
        <StatusBadge tone={httpStatusTone(log.status)}>{log.status}</StatusBadge>
      </TableCell>
      <TableCell className="text-right">
        <Button
          variant="ghost"
          size="icon-xs"
          aria-label={`View payload ${log.action}`}
          disabled={!hasDetail}
          onClick={() =>
            openPayload({
              title: `${log.action} · ${log.endpoint}`,
              sections: [
                { label: 'Payload', data: log.payload },
                { label: 'Changes', data: log.changes },
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
