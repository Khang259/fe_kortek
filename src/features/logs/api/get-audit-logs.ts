import { useQuery } from '@tanstack/react-query'

import { logKeys } from '@/features/logs/api/get-action-logs'
import type { AuditLog, LogListParams } from '@/features/logs/types'
import { useLogFilterStore } from '@/features/logs/stores/log-filter-store'
import {
  buildLogQueryParams,
  filterMockByOccurredAt,
} from '@/features/logs/utils/log-query'
import { fetchPaginated } from '@/lib/api-request'
import { auditLogFixtures } from '@/testing/fixtures/logs'

async function getAuditLogs(params: Omit<LogListParams, 'result'>) {
  const query = buildLogQueryParams({ ...params, result: 'all' })
  const mock = filterMockByOccurredAt(auditLogFixtures, query.from, query.to)
  return fetchPaginated<AuditLog>('/logs/get_audit_logs', mock, {
    from: query.from,
    to: query.to,
    page: query.page,
    pageSize: query.pageSize,
  })
}

export function useAuditLogs() {
  const from = useLogFilterStore((state) => state.from)
  const to = useLogFilterStore((state) => state.to)
  const page = useLogFilterStore((state) => state.page)
  const pageSize = useLogFilterStore((state) => state.pageSize)
  const params = { from, to, page, pageSize }

  return useQuery({
    queryKey: logKeys.audit(params),
    queryFn: () => getAuditLogs(params),
  })
}
