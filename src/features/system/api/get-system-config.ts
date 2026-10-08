import { queryOptions, useQuery } from '@tanstack/react-query'

import { env } from '@/config/env'
import type { HealthIndicator, SystemConfig, SystemHealth } from '@/features/system/types'
import { healthToIndicators } from '@/features/system/utils/health-indicators'
import { apiClient } from '@/lib/axios'
import { fetchData } from '@/lib/api-request'
import { mockRequest } from '@/testing/mock-request'
import {
  systemConfigFixture,
  systemHealthOkFixture,
} from '@/testing/fixtures/system'

export const systemKeys = {
  all: ['system'] as const,
  config: () => [...systemKeys.all, 'config'] as const,
  health: () => [...systemKeys.all, 'health'] as const,
}

/**
 * `GET /system/get_health` (Bearer) — 200 hoặc 503 cùng shape.
 * Không gọi `GET /health` (ops, không Bearer).
 */
async function fetchSystemHealth(): Promise<HealthIndicator[]> {
  if (env.useMockApi) {
    return mockRequest(healthToIndicators(systemHealthOkFixture))
  }

  const { data, status } = await apiClient.get<SystemHealth>(
    '/system/get_health',
    {
      validateStatus: (code) => code === 200 || code === 503,
    },
  )

  if (status !== 200 && status !== 503) {
    return [
      {
        id: 'status',
        label: 'Lost connection to server',
        tone: 'danger',
        detail: `HTTP ${status}`,
      },
    ]
  }

  return healthToIndicators(data)
}

export const systemConfigQueryOptions = queryOptions({
  queryKey: systemKeys.config(),
  queryFn: () => fetchData<SystemConfig>('/system/config', systemConfigFixture),
})

export const systemHealthQueryOptions = queryOptions({
  queryKey: systemKeys.health(),
  queryFn: fetchSystemHealth,
  /** Contract: 30–60s hoặc cùng chu kỳ poll — chọn 30s. */
  refetchInterval: 30_000,
})

export const useSystemConfig = () => useQuery(systemConfigQueryOptions)

export const useSystemHealth = () => useQuery(systemHealthQueryOptions)
