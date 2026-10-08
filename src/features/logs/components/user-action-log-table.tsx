import { PaginationBar } from '@/components/common/pagination-bar'
import { TableShell } from '@/components/common/table-shell'
import { useUserActionLogs } from '@/features/logs/api/get-action-logs'
import { UserActionLogRow } from '@/features/logs/components/user-action-log-row'
import { useLogPagination } from '@/features/logs/hooks/use-paginated-logs'

const columns = [
  'Time',
  'User',
  'Role',
  'Action',
  'Endpoint',
  'HTTP',
  '',
]

export function UserActionLogTable() {
  const { data, isPending, isError } = useUserActionLogs()
  const items = data?.items ?? []
  const pagination = useLogPagination(data?.total ?? 0)

  return (
    <TableShell
      columns={columns}
      isPending={isPending}
      isError={isError}
      isEmpty={items.length === 0}
      emptyMessage="No user logs match the filters"
      footer={<PaginationBar {...pagination} />}
    >
      {items.map((log) => (
        <UserActionLogRow key={log.id} log={log} />
      ))}
    </TableShell>
  )
}
