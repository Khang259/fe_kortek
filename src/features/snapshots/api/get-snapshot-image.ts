import { queryOptions, useQuery } from '@tanstack/react-query'

import { env } from '@/config/env'
import { apiClient } from '@/lib/axios'
import { mockSnapshotImageSrc } from '@/testing/fixtures/snapshots'
import { mockRequest } from '@/testing/mock-request'
import type { ApiError } from '@/types'

/**
 * Lấy file snapshot theo tên (Bearer).
 * Chấp nhận URL đầy đủ `…/get_image?file=…` hoặc basename thuần.
 */
export function extractSnapshotFileName(snapshotImageUrl: string): string | null {
  const trimmed = snapshotImageUrl.trim()
  if (!trimmed) {
    return null
  }

  /** Basename Mongo `image_path` — không có query/path. */
  if (!trimmed.includes('?') && !trimmed.includes('/') && !trimmed.includes('\\')) {
    return trimmed
  }

  try {
    const url = new URL(trimmed, 'http://local.invalid')
    const file = url.searchParams.get('file')
    if (file) {
      return file
    }
  } catch {
    /* fallthrough */
  }

  const match = /[?&]file=([^&]+)/.exec(trimmed)
  return match ? decodeURIComponent(match[1]) : null
}

async function getSnapshotImage(file: string): Promise<string> {
  if (env.useMockApi) {
    /** SVG tĩnh trong /public — giả lập JPEG pair ghép ngang. */
    return mockRequest(mockSnapshotImageSrc(file))
  }

  const response = await apiClient.get<Blob>('/snapshots/get_image', {
    params: { file },
    responseType: 'blob',
  })

  return URL.createObjectURL(response.data)
}

export const snapshotImageQueryOptions = (file: string) =>
  queryOptions({
    queryKey: ['snapshots', 'get_image', file] as const,
    queryFn: () => getSnapshotImage(file),
    staleTime: 60_000,
    gcTime: 60_000,
    retry: false,
  })

export function useSnapshotImage(
  snapshotImageUrl: string | null,
  enabled = true,
) {
  const file = snapshotImageUrl
    ? extractSnapshotFileName(snapshotImageUrl)
    : null

  return useQuery({
    ...snapshotImageQueryOptions(file ?? ''),
    enabled: enabled && Boolean(file),
  })
}

export function isSnapshotExpiredError(error: unknown) {
  return (error as ApiError | undefined)?.status === 404
}
