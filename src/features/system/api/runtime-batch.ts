import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { env } from '@/config/env'
import {
  buildMockPendingPairs,
  mockCancelBatch,
  mockConfirmDispatch,
} from '@/features/system/api/runtime-mock'
import { runtimeKeys } from '@/features/system/api/runtime-keys'
import type {
  CancelBatchResult,
  ConfirmDispatchResult,
  PendingPairsResponse,
} from '@/features/system/types'
import { normalizePendingPairs } from '@/features/system/utils/parse-runtime'
import { apiClient } from '@/lib/axios'
import { mockRequest } from '@/testing/mock-request'

/**
 * `POST /runtime/confirm-dispatch` — chụp batch isReady, mở cổng gửi ICS.
 * Quyền: `system.control`
 */
async function confirmDispatch(): Promise<ConfirmDispatchResult> {
  if (env.useMockApi) {
    return mockRequest(mockConfirmDispatch(), 200)
  }
  const { data } = await apiClient.post<ConfirmDispatchResult>(
    '/runtime/confirm-dispatch',
  )
  return {
    message: data.message ?? 'Dispatch confirmed',
    batchSize: data.batchSize ?? data.batchNodes?.length ?? 0,
    batchNodes: Array.isArray(data.batchNodes) ? data.batchNodes : [],
  }
}

/**
 * `GET /runtime/get_pending_pairs` — preview batch / readyStarts / nextPairs.
 * Poll được, không side-effect.
 */
async function getPendingPairs(): Promise<PendingPairsResponse> {
  if (env.useMockApi) {
    return mockRequest(buildMockPendingPairs(), 80)
  }
  const { data } = await apiClient.get<Record<string, unknown>>(
    '/runtime/get_pending_pairs',
  )
  return normalizePendingPairs(data ?? {})
}

/**
 * `POST /runtime/cancel-batch` — chỉ đóng cổng; inference vẫn chạy.
 * Quyền: `system.control`
 */
async function cancelBatch(): Promise<CancelBatchResult> {
  if (env.useMockApi) {
    return mockRequest(mockCancelBatch(), 200)
  }
  const { data } = await apiClient.post<Record<string, unknown>>(
    '/runtime/cancel-batch',
  )
  return {
    message: typeof data.message === 'string' ? data.message : 'Batch canceled',
    dispatched: Array.isArray(data.dispatched)
      ? data.dispatched.filter((n): n is string => typeof n === 'string')
      : [],
    remaining: Array.isArray(data.remaining)
      ? data.remaining.filter((n): n is string => typeof n === 'string')
      : [],
  }
}

/** Poll preview batch — gợi ý 1–2s theo contract. */
export function usePendingPairs(enabled = true) {
  return useQuery({
    queryKey: runtimeKeys.pendingPairs(),
    queryFn: getPendingPairs,
    enabled,
    staleTime: 0,
    refetchInterval: enabled ? 1_500 : false,
  })
}

export function useConfirmDispatch() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: confirmDispatch,
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: runtimeKeys.pendingPairs(),
      })
    },
  })
}

export function useCancelBatch() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: cancelBatch,
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: runtimeKeys.pendingPairs(),
      })
    },
  })
}
