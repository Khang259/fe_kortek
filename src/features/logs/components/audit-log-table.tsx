import { PaginationBar } from '@/components/common/pagination-bar'
import { TableShell } from '@/components/common/table-shell'
import { useAuditLogs } from '@/features/logs/api/get-audit-logs'
import { AuditLogRow } from '@/features/logs/components/audit-log-row'
import { useLogPagination } from '@/features/logs/hooks/use-paginated-logs'

const columns = [
  'Time',
  'Account',
  'Role',
  'IP address',
  'Device',
  'Event',
]

export function AuditLogTable() {
  const { data, isPending, isError } = useAuditLogs()
  const items = data?.items ?? []
  const pagination = useLogPagination(data?.total ?? 0)

  return (
    <TableShell
      columns={columns}
      isPending={isPending}
      isError={isError}
      isEmpty={items.length === 0}
      emptyMessage="No access records match the filters"
      footer={<PaginationBar {...pagination} />}
    >
      {items.map((log) => (
        <AuditLogRow key={log.id} log={log} />
      ))}
    </TableShell>
  )
}
