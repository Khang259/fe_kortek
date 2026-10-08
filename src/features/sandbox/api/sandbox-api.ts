import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { env } from '@/config/env'
import type {
  SandboxNode,
  SandboxOrder,
  SetSandboxNodeStateInput,
  SetSandboxOrderStatusInput,
} from '@/features/sandbox/types'
import { fetchList } from '@/lib/api-request'
import { apiClient } from '@/lib/axios'
import { mockRequest } from '@/testing/mock-request'
import {
  sandboxNodeFixtures,
  sandboxOrderFixtures,
} from '@/testing/fixtures/sandbox'
import type { ApiError } from '@/types'

export const sandboxKeys = {
  all: ['sandbox'] as const,
  nodes: () => [...sandboxKeys.all, 'nodes'] as const,
  orders: () => [...sandboxKeys.all, 'orders'] as const,
}

export function sandboxErrorStatus(error: unknown): number {
  if (error && typeof error === 'object' && 'status' in error) {
    return Number((error as ApiError).status) || 0
  }
  return 0
}

/** 404 = không phải sandbox mode (ẩn màn / nav). */
export function isSandboxUnavailable(error: unknown) {
  return sandboxErrorStatus(error) === 404
}

/** 503 = sandbox mode nhưng runtime chưa chạy — vẫn hiện màn. */
export function isSandboxRuntimeDown(error: unknown) {
  return sandboxErrorStatus(error) === 503
}

/**
 * `GET /sandbox/get_nodes` — desired detected state.
 * 404 ≠ sandbox; 503 = runtime chưa sẵn; 200 items có thể [].
 * @see docs/fe-api-sandbox.md
 */
export async function fetchSandboxNodes(): Promise<SandboxNode[]> {
  return fetchList('/sandbox/get_nodes', sandboxNodeFixtures)
}

export async function fetchSandboxOrders(): Promise<SandboxOrder[]> {
  return fetchList('/sandbox/get_orders', sandboxOrderFixtures)
}

async function setSandboxNodeState({
  nodeId,
  detected,
}: SetSandboxNodeStateInput): Promise<{ nodeId: string; detected: boolean }> {
  if (env.useMockApi) {
    const node = sandboxNodeFixtures.find((item) => item.nodeId === nodeId)
    if (!node) {
      throw {
        status: 404,
        message: `Node ${nodeId} not found`,
      } satisfies ApiError
    }
    node.detected = detected
    return mockRequest({ nodeId, detected })
  }
  const { data } = await apiClient.post<{ nodeId: string; detected: boolean }>(
    '/sandbox/set_node_state',
    { nodeId, detected },
  )
  return data
}

/** `status` là int (6 | 3 | 23) — khớp contract sandbox. */
async function setSandboxOrderStatus({
  orderId,
  status,
}: SetSandboxOrderStatusInput): Promise<unknown> {
  if (env.useMockApi) {
    const order = sandboxOrderFixtures.find((item) => item.orderId === orderId)
    if (!order) {
      throw {
        status: 404,
        message: `orderId ${orderId} not found`,
      } satisfies ApiError
    }
    order.status = status
    return mockRequest({ orderId, status })
  }
  const { data } = await apiClient.post('/sandbox/set_order_status', {
    orderId,
    status,
  })
  return data
}

function shouldRetrySandbox(failureCount: number, error: unknown) {
  if (isSandboxUnavailable(error)) {
    return false
  }
  return failureCount < 2
}

/** Probe nav: 404 ẩn; 503 vẫn coi là có sandbox. */
export function useSandboxAvailable(enabled = true) {
  return useQuery({
    queryKey: sandboxKeys.nodes(),
    queryFn: fetchSandboxNodes,
    enabled,
    retry: shouldRetrySandbox,
    staleTime: 30_000,
    refetchInterval: (query) =>
      isSandboxRuntimeDown(query.state.error) ? 5_000 : false,
  })
}

export function useSandboxNodes(enabled = true) {
  return useQuery({
    queryKey: sandboxKeys.nodes(),
    queryFn: fetchSandboxNodes,
    enabled,
    retry: shouldRetrySandbox,
    refetchInterval: (query) =>
      isSandboxRuntimeDown(query.state.error) ? 5_000 : false,
  })
}

export function useSandboxOrders(enabled = true) {
  return useQuery({
    queryKey: sandboxKeys.orders(),
    queryFn: fetchSandboxOrders,
    enabled,
    retry: shouldRetrySandbox,
    refetchInterval: (query) => {
      if (isSandboxRuntimeDown(query.state.error)) {
        return 5_000
      }
      return enabled ? 3_000 : false
    },
  })
}

export function useSetSandboxNodeState() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: setSandboxNodeState,
    onSuccess: (result) => {
      queryClient.setQueryData<SandboxNode[]>(sandboxKeys.nodes(), (nodes) => {
        if (!nodes) {
          return nodes
        }
        return nodes.map((node) =>
          node.nodeId === result.nodeId
            ? { ...node, detected: result.detected }
            : node,
        )
      })
    },
  })
}

export function useSetSandboxOrderStatus() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: setSandboxOrderStatus,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: sandboxKeys.orders() })
    },
  })
}
