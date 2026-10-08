import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { env } from '@/config/env'
import {
  getMockReady,
  mockPauseScan,
  mockStartScan,
} from '@/features/system/api/runtime-mock'
import {
  runtimeKeys,
  type ReloadRuntimeResult,
  type RuntimeStatus,
} from '@/features/system/api/runtime-keys'
import { normalizeStatus } from '@/features/system/utils/parse-runtime'
import { useInferenceStore } from '@/features/zones/stores/inference-store'
import { apiClient } from '@/lib/axios'
import { mockRequest } from '@/testing/mock-request'

function syncInferenceStore(ready: boolean) {
  useInferenceStore.getState().setReady(ready)
}

async function getRuntimeStatus(): Promise<RuntimeStatus> {
  if (env.useMockApi) {
    return mockRequest({ ready: getMockReady(), known: true }, 120)
  }
  const { data } = await apiClient.get<Record<string, unknown>>(
    '/runtime/get_status',
  )
  return normalizeStatus(data ?? {})
}

/**
 * `POST /runtime/pause-scan` — tắt inference + huỷ batch.
 * Quyền: `system.control`
 */
async function pauseScan(): Promise<RuntimeStatus> {
  if (env.useMockApi) {
    mockPauseScan()
    return mockRequest(
      { ready: false, known: true, message: 'Inference paused' },
      200,
    )
  }
  const { data } = await apiClient.post<Record<string, unknown>>(
    '/runtime/pause-scan',
  )
  return normalizeStatus(data ?? {}, false)
}

/**
 * `POST /runtime/start-scan` — bật inference (detect). Không gửi ICS.
 * Quyền: `system.control`
 */
async function startScan(): Promise<RuntimeStatus> {
  if (env.useMockApi) {
    mockStartScan()
    return mockRequest(
      { ready: true, known: true, message: 'Scanning started' },
      200,
    )
  }
  const { data } = await apiClient.post<Record<string, unknown>>(
    '/runtime/start-scan',
  )
  return normalizeStatus(data ?? {}, true)
}

/**
 * `POST /runtime/reload` — reload runtime seed.
 * Quyền: `system.control`
 */
async function reloadRuntime(): Promise<ReloadRuntimeResult> {
  if (env.useMockApi) {
    return mockRequest(
      { reloaded: true, message: 'Runtime reloaded' },
      200,
    )
  }
  const { data } = await apiClient.post<ReloadRuntimeResult>(
    '/runtime/reload',
  )
  return {
    reloaded: data.reloaded ?? true,
    message: data.message,
  }
}

/**
 * Poll trạng thái inference từ BE.
 * Chỉ cập nhật store khi parse được field rõ ràng (`known`).
 */
export function useRuntimeStatus(enabled = true) {
  return useQuery({
    queryKey: runtimeKeys.status(),
    queryFn: async () => {
      const status = await getRuntimeStatus()
      if (status.known) {
        syncInferenceStore(status.ready)
      }
      return status
    },
    enabled,
    staleTime: 5_000,
    refetchInterval: enabled ? 10_000 : false,
  })
}

export function usePauseScan() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: pauseScan,
    onSuccess: (result) => {
      syncInferenceStore(false)
      queryClient.setQueryData(runtimeKeys.status(), result)
      void queryClient.invalidateQueries({
        queryKey: runtimeKeys.pendingPairs(),
      })
    },
  })
}

export function useStartScan() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: startScan,
    onSuccess: (result) => {
      syncInferenceStore(true)
      queryClient.setQueryData(runtimeKeys.status(), result)
      void queryClient.invalidateQueries({
        queryKey: runtimeKeys.pendingPairs(),
      })
    },
  })
}

export function useReloadRuntime() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: reloadRuntime,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: runtimeKeys.status() })
      void queryClient.invalidateQueries({
        queryKey: runtimeKeys.pendingPairs(),
      })
    },
  })
}
