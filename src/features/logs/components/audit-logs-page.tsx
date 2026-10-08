import { AuditLogTable } from '@/features/logs/components/audit-log-table'
import { LogTimeFilter } from '@/features/logs/components/log-time-filter'

export function AuditLogsPage() {
  return (
    <div className="grid gap-3">
      <div className="flex justify-end">
        <LogTimeFilter />
      </div>
      <AuditLogTable />
    </div>
  )
}
