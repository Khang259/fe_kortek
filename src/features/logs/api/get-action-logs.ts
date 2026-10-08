import { useQuery } from '@tanstack/react-query'

import { FILTER_ALL } from '@/config/constants'
import type { LogListParams, SystemActionLog, UserActionLog } from '@/features/logs/types'
import { useLogFilterStore } from '@/features/logs/stores/log-filter-store'
import {
  buildLogQueryParams,
  filterMockByOccurredAt,
} from '@/features/logs/utils/log-query'
import { fetchPaginated } from '@/lib/api-request'
import {
  systemActionLogFixtures,
  userActionLogFixtures,
} from '@/testing/fixtures/logs'

export const logKeys = {
  all: ['logs'] as const,
  systemActions: (params: LogListParams) =>
    [...logKeys.all, 'system', params] as const,
  userActions: (params: Omit<LogListParams, 'result' | 'action'>) =>
    [...logKeys.all, 'user', params] as const,
  audit: (params: Omit<LogListParams, 'result' | 'action'>) =>
    [...logKeys.all, 'audit', params] as const,
}

function useSharedLogParams(): LogListParams {
  const from = useLogFilterStore((state) => state.from)
  const to = useLogFilterStore((state) => state.to)
  const page = useLogFilterStore((state) => state.page)
  const pageSize = useLogFilterStore((state) => state.pageSize)
  const result = useLogFilterStore((state) => state.result)
  const action = useLogFilterStore((state) => state.action)

  return { from, to, page, pageSize, result, action }
}

/**
 * `GET /logs/get_system_action_logs` — outbound ICS + unlock_by_order_status.
 * @see docs/fe-api-system-action-logs.md
 */
async function getSystemActionLogs(params: LogListParams) {
  const query = buildLogQueryParams(params)
  let mock = filterMockByOccurredAt(
    systemActionLogFixtures,
    query.from,
    query.to,
  )
  if (query.result) {
    mock = mock.filter((item) => item.result === query.result)
  }
  if (query.action) {
    mock = mock.filter((item) => item.action === query.action)
  }
  /** `action` chỉ lọc mock — BE contract chưa có query action. */
  const { action: _action, ...apiQuery } = query
  return fetchPaginated<SystemActionLog>(
    '/logs/get_system_action_logs',
    mock,
    apiQuery,
  )
}

async function getUserActionLogs(params: Omit<LogListParams, 'result' | 'action'>) {
  const query = buildLogQueryParams({
    ...params,
    result: FILTER_ALL,
    action: FILTER_ALL,
  })
  const mock = filterMockByOccurredAt(
    userActionLogFixtures,
    query.from,
    query.to,
  )
  return fetchPaginated<UserActionLog>(
    '/logs/get_user_action_logs',
    mock,
    { from: query.from, to: query.to, page: query.page, pageSize: query.pageSize },
  )
}

export function useSystemActionLogs() {
  const params = useSharedLogParams()

  return useQuery({
    queryKey: logKeys.systemActions(params),
    queryFn: () => getSystemActionLogs(params),
  })
}

export function useUserActionLogs() {
  const { from, to, page, pageSize } = useSharedLogParams()
  const params = { from, to, page, pageSize }

  return useQuery({
    queryKey: logKeys.userActions(params),
    queryFn: () => getUserActionLogs(params),
  })
}
