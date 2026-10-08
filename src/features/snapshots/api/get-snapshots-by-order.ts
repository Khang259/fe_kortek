import { queryOptions, useQuery } from '@tanstack/react-query'

import { env } from '@/config/env'
import type { OrderSnapshots, SnapshotItem } from '@/features/snapshots/types'
import { apiClient } from '@/lib/axios'
import { mockOrderSnapshots } from '@/testing/fixtures/snapshots'
import { mockRequest } from '@/testing/mock-request'

export const snapshotKeys = {
  all: ['snapshots'] as const,
  byOrder: (orderId: string) =>
    [...snapshotKeys.all, 'by-order', orderId] as const,
}

/** Chỉ Single (`S-…`) có snapshot; Empty/Double chưa hỗ trợ. */
export function isSingleOrderId(orderId: string): boolean {
  return orderId.startsWith('S-')
}

/**
 * Một JPEG ghép ngang — start/end cùng `imagePath`.
 * Ưu tiên `imageUrl`; fallback basename → path get_image.
 */
export function pickOrderSnapshotImageUrl(
  items: SnapshotItem[],
): string | null {
  const preferred =
    items.find((item) => item.nodeType === 'start' && item.imagePath) ??
    items.find((item) => item.imagePath)

  if (!preferred) {
    return null
  }

  if (preferred.imageUrl?.trim()) {
    return preferred.imageUrl.trim()
  }

  return `/api/v1/snapshots/get_image?file=${encodeURIComponent(preferred.imagePath)}`
}

function normalizeSnapshotItem(raw: unknown): SnapshotItem | null {
  if (!raw || typeof raw !== 'object') {
    return null
  }
  const data = raw as Record<string, unknown>
  const orderId = typeof data.orderId === 'string' ? data.orderId : null
  const nodeId = typeof data.nodeId === 'string' ? data.nodeId : null
  const nodeType =
    data.nodeType === 'start' || data.nodeType === 'end' ? data.nodeType : null
  const imagePath = typeof data.imagePath === 'string' ? data.imagePath : null
  if (!orderId || !nodeId || !nodeType || !imagePath) {
    return null
  }
  return {
    orderId,
    nodeId,
    nodeType,
    zoneId: typeof data.zoneId === 'string' ? data.zoneId : '',
    imagePath,
    imageUrl: typeof data.imageUrl === 'string' ? data.imageUrl : null,
    decision: typeof data.decision === 'string' ? data.decision : '',
    createdAt: typeof data.createdAt === 'string' ? data.createdAt : '',
  }
}

function normalizeOrderSnapshots(
  raw: unknown,
  fallbackOrderId: string,
): OrderSnapshots {
  if (!raw || typeof raw !== 'object') {
    return { orderId: fallbackOrderId, items: [] }
  }
  const data = raw as Record<string, unknown>
  const orderId =
    typeof data.orderId === 'string' ? data.orderId : fallbackOrderId
  const items = Array.isArray(data.items)
    ? data.items
        .map((item) => normalizeSnapshotItem(item))
        .filter((item): item is SnapshotItem => item !== null)
    : []
  return { orderId, items }
}

/**
 * `GET /snapshots/get_by_order?orderId=` — meta ảnh sau ICS Single success.
 * @see docs/fe-api-dispatch-snapshots.md
 */
export async function fetchSnapshotsByOrder(
  orderId: string,
): Promise<OrderSnapshots> {
  if (env.useMockApi) {
    return mockRequest(mockOrderSnapshots(orderId))
  }

  const { data } = await apiClient.get<unknown>('/snapshots/get_by_order', {
    params: { orderId },
  })
  return normalizeOrderSnapshots(data, orderId)
}

/** Retry ngắn khi `items=[]` — Mongo index fire-and-forget có thể trễ vài trăm ms. */
const EMPTY_RETRY_MS = 400
const EMPTY_RETRY_MAX = 5

export const orderSnapshotsQueryOptions = (orderId: string) =>
  queryOptions({
    queryKey: snapshotKeys.byOrder(orderId),
    queryFn: () => fetchSnapshotsByOrder(orderId),
    staleTime: 30_000,
    retry: false,
    refetchInterval: (query) => {
      const items = query.state.data?.items
      if (!items || items.length > 0) {
        return false
      }
      if (query.state.dataUpdateCount >= EMPTY_RETRY_MAX) {
        return false
      }
      return EMPTY_RETRY_MS
    },
  })

export function useOrderSnapshots(orderId: string | null, enabled = true) {
  const canFetch =
    enabled && Boolean(orderId) && isSingleOrderId(orderId ?? '')

  return useQuery({
    ...orderSnapshotsQueryOptions(orderId ?? ''),
    enabled: canFetch,
  })
}
