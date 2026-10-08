import { PaginationBar } from '@/components/common/pagination-bar'
import { TableShell } from '@/components/common/table-shell'
import { useSystemActionLogs } from '@/features/logs/api/get-action-logs'
import { SystemActionLogRow } from '@/features/logs/components/system-action-log-row'
import { useLogPagination } from '@/features/logs/hooks/use-paginated-logs'

const columns = [
  'Time',
  'Action',
  'Order',
  'Route',
  'Endpoint',
  'Result',
  '',
]

export function SystemActionLogTable() {
  const { data, isPending, isError } = useSystemActionLogs()
  const items = data?.items ?? []
  const pagination = useLogPagination(data?.total ?? 0)

  return (
    <TableShell
      columns={columns}
      isPending={isPending}
      isError={isError}
      isEmpty={items.length === 0}
      emptyMessage="No system logs match the filters"
      footer={<PaginationBar {...pagination} />}
    >
      {items.map((log) => (
        <SystemActionLogRow key={log.id} log={log} />
      ))}
    </TableShell>
  )
}
