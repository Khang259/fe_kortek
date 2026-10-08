import { StatusBadge } from '@/components/common/status-badge'
import { TableCell, TableRow } from '@/components/ui/table'
import type { AuditLog } from '@/features/logs/types'
import {
  auditActionLabel,
  auditActionTone,
} from '@/features/logs/utils/log-result'
import { formatLogTimestamp } from '@/utils'

interface AuditLogRowProps {
  log: AuditLog
}

export function AuditLogRow({ log }: AuditLogRowProps) {
  return (
    <TableRow>
      <TableCell className="font-mono text-[10px] whitespace-nowrap text-muted-foreground">
        {formatLogTimestamp(log.occurredAt)}
      </TableCell>
      <TableCell className="text-[11px] font-medium">{log.userName}</TableCell>
      <TableCell className="text-[10px] text-muted-foreground">{log.role}</TableCell>
      <TableCell className="font-mono text-[10px]">{log.ipAddress}</TableCell>
      <TableCell className="text-[10px] text-muted-foreground">
        {log.device}
      </TableCell>
      <TableCell>
        <StatusBadge tone={auditActionTone(log.action)}>
          {auditActionLabel(log.action)}
        </StatusBadge>
      </TableCell>
    </TableRow>
  )
}
