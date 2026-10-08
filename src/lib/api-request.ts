import { env } from '@/config/env'
import { apiClient } from '@/lib/axios'
import { mockRequest } from '@/testing/mock-request'
import type { PaginatedResponse } from '@/types'

/** Envelope list không phân trang (đợt 2–3). */
export interface ListResponse<TItem> {
  items: TItem[]
}

export type QueryParams = Record<
  string,
  string | number | boolean | undefined | null
>

/**
 * GET list RPC: mock nhận mảng, API thật unwrap `{ items }`.
 */
export async function fetchList<TItem>(
  url: string,
  mockItems: TItem[],
  params?: QueryParams,
): Promise<TItem[]> {
  if (env.useMockApi) {
    return mockRequest(mockItems)
  }

  const { data } = await apiClient.get<ListResponse<TItem>>(url, { params })
  return data.items
}

/**
 * GET list có phân trang (đợt 4): `{ items, total, page, pageSize }`.
 * Mock cắt trang từ mảng đã lọc sẵn.
 */
export async function fetchPaginated<TItem>(
  url: string,
  mockItems: TItem[],
  params?: QueryParams,
): Promise<PaginatedResponse<TItem>> {
  const page = Math.max(1, Number(params?.page ?? 1))
  const pageSize = Math.min(100, Math.max(1, Number(params?.pageSize ?? 20)))

  if (env.useMockApi) {
    const total = mockItems.length
    const start = (page - 1) * pageSize
    return mockRequest({
      items: mockItems.slice(start, start + pageSize),
      total,
      page,
      pageSize,
    })
  }

  const { data } = await apiClient.get<PaginatedResponse<TItem>>(url, {
    params: { ...params, page, pageSize },
  })
  return data
}

/** Giữ cho chỗ chưa chuyển sang list envelope. */
export async function fetchData<TData>(
  url: string,
  mockData: TData,
): Promise<TData> {
  if (env.useMockApi) {
    return mockRequest(mockData)
  }

  const { data } = await apiClient.get<TData>(url)
  return data
}
