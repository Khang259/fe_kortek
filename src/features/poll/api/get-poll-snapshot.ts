import { env } from '@/config/env'
import type { PollSnapshot } from '@/features/poll/types'
import { apiClient } from '@/lib/axios'
import { mockRequest } from '@/testing/mock-request'
import { pollSnapshotFixture } from '@/testing/fixtures/poll'

export const pollKeys = {
  all: ['poll'] as const,
  snapshot: () => [...pollKeys.all, 'snapshot'] as const,
}

/**
 * `GET /poll/get_snapshot` + `If-None-Match`.
 * 304 → trả `null` (không đổi).
 */
export async function fetchPollSnapshot(
  etag: string | null,
): Promise<PollSnapshot | null> {
  if (env.useMockApi) {
    return mockRequest(pollSnapshotFixture(), 200)
  }

  const { data, status } = await apiClient.get<PollSnapshot>(
    '/poll/get_snapshot',
    {
      headers: etag ? { 'If-None-Match': etag } : undefined,
      validateStatus: (code) => code === 200 || code === 304,
    },
  )

  if (status === 304) {
    return null
  }

  return data
}
