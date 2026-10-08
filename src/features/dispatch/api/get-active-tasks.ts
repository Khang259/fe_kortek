import type { ActiveTask, ActiveTaskStatus } from '@/features/dispatch/types'
import { fetchList } from '@/lib/api-request'
import { activeTaskFixtures } from '@/testing/fixtures/active-tasks'

export const dispatchKeys = {
  all: ['dispatch'] as const,
  activeTasks: () => [...dispatchKeys.all, 'active-tasks'] as const,
  pairs: () => [...dispatchKeys.all, 'pairs'] as const,
}

function isActiveStatus(value: unknown): value is ActiveTaskStatus {
  return value === 'issued' || value === 'inprogress'
}

export function normalizeActiveTask(raw: unknown): ActiveTask | null {
  if (!raw || typeof raw !== 'object') {
    return null
  }
  const data = raw as Record<string, unknown>
  const orderId = typeof data.orderId === 'string' ? data.orderId : null
  const startNodeId =
    typeof data.startNodeId === 'string' ? data.startNodeId : null
  const endNodeId = typeof data.endNodeId === 'string' ? data.endNodeId : null
  if (!orderId || !startNodeId || !endNodeId || !isActiveStatus(data.status)) {
    return null
  }
  const priorityStart =
    typeof data.priorityStart === 'number' && Number.isFinite(data.priorityStart)
      ? data.priorityStart
      : null
  return {
    orderId,
    startNodeId,
    endNodeId,
    priorityStart,
    status: data.status,
  }
}

/**
 * `GET /dispatch/get_active_tasks` — hydrate panel.
 * ICS lỗi → 502 (không trả items rỗng).
 * @see docs/fe-api-active-tasks.md
 */
export async function fetchActiveTasks(): Promise<ActiveTask[]> {
  const items = await fetchList<ActiveTask>(
    '/dispatch/get_active_tasks',
    activeTaskFixtures,
  )
  return items
    .map((item) => normalizeActiveTask(item))
    .filter((item): item is ActiveTask => item !== null)
}
