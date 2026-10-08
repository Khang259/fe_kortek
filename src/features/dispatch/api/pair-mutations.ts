import { useMutation, useQueryClient } from '@tanstack/react-query'

import { env } from '@/config/env'
import { dispatchKeys } from '@/features/dispatch/api/get-active-tasks'
import type {
  NodePair,
  PairType,
  PairWriteResult,
} from '@/features/dispatch/types'
import {
  buildPairId,
  normalizePairEnd,
} from '@/features/dispatch/utils/pair-id'
import { assertInferencePaused } from '@/features/system/hooks/use-config-write-gate'
import { zoneKeys } from '@/features/zones/api/get-zones'
import { apiClient } from '@/lib/axios'
import { mockRequest } from '@/testing/mock-request'
import { cameraRoiFixtures } from '@/testing/fixtures/cameras'
import { nodePairFixtures } from '@/testing/fixtures/dispatch'
import { nodeFixtures } from '@/testing/fixtures/nodes'
import type { ApiError } from '@/types'

export interface CreatePairInput {
  startNodeId: string
  endNodeId?: string
  pairType: PairType
  enabled?: boolean
  autoDispatch?: boolean
  name?: string
}

export interface UpdatePairInput {
  id: string
  startNodeId?: string
  endNodeId?: string
  pairType?: PairType
  enabled?: boolean
  autoDispatch?: boolean
  name?: string
}

function assertNodeExists(nodeId: string) {
  if (!nodeFixtures.some((node) => node.id === nodeId)) {
    const error: ApiError = {
      status: 404,
      message: `Node ${nodeId} not found`,
    }
    throw error
  }
}

/** Node phải gắn camera + đã có ROI. */
function assertNodeHasRoi(nodeId: string) {
  const node = nodeFixtures.find((item) => item.id === nodeId)
  if (!node || node.cameraId === null) {
    const error: ApiError = {
      status: 400,
      message: `Node ${nodeId} chưa gắn camera`,
    }
    throw error
  }
  const hasRoi = cameraRoiFixtures.some(
    (roi) => roi.nodeId === nodeId && roi.cameraId === node.cameraId,
  )
  if (!hasRoi) {
    const error: ApiError = {
      status: 400,
      message: `Node ${nodeId} chưa có ROI — vẽ ROI trước khi tạo/sửa pair`,
    }
    throw error
  }
}

function findPairIndex(id: string) {
  return nodePairFixtures.findIndex((pair) => pair.id === id)
}

function findDuplicate(
  startNodeId: string,
  endNodeId: string,
  exceptId?: string,
) {
  return nodePairFixtures.find(
    (pair) =>
      pair.id !== exceptId &&
      pair.startNodeId === startNodeId &&
      pair.endNodeId === endNodeId,
  )
}

/** `POST /pairs/create_pair` — không gửi zoneId. */
async function createPair(input: CreatePairInput): Promise<PairWriteResult> {
  assertInferencePaused()
  console.log('[create_pair] request', input)
  const pairType = input.pairType
  const startNodeId = input.startNodeId.trim()
  const endNodeId = normalizePairEnd(pairType, input.endNodeId)

  if (pairType === 'normal' && !endNodeId) {
    const error: ApiError = {
      status: 400,
      message: 'pairType=normal bắt buộc endNodeId',
    }
    throw error
  }

  if (env.useMockApi) {
    assertNodeExists(startNodeId)
    assertNodeHasRoi(startNodeId)
    if (pairType === 'normal') {
      assertNodeExists(endNodeId)
      assertNodeHasRoi(endNodeId)
    }
    if (findDuplicate(startNodeId, endNodeId)) {
      const error: ApiError = {
        status: 409,
        message: 'Pair đã tồn tại',
      }
      throw error
    }

    const id = buildPairId(startNodeId, endNodeId, pairType)
    const enabled = input.enabled ?? true
    const autoDispatch = input.autoDispatch ?? true
    const name =
      input.name?.trim() ||
      (pairType === 'empty'
        ? `${startNodeId} → _`
        : `${startNodeId} → ${endNodeId}`)

    const pair: NodePair = {
      id,
      name,
      startNodeId,
      endNodeId,
      pairType,
      enabled,
      autoDispatch,
      isBlocked: false,
      blockedReason: null,
    }
    nodePairFixtures.push(pair)
    const result: PairWriteResult = {
      id,
      startNodeId,
      endNodeId,
      pairType,
      enabled,
      autoDispatch,
      name,
      runtimeReloaded: true,
    }
    console.log('[create_pair] response (mock)', result)
    return mockRequest(result, 200)
  }

  const { data } = await apiClient.post<PairWriteResult>(
    '/pairs/create_pair',
    {
      startNodeId,
      pairType,
      enabled: input.enabled ?? true,
      autoDispatch: input.autoDispatch ?? true,
      ...(input.name?.trim() ? { name: input.name.trim() } : {}),
      ...(pairType === 'normal' ? { endNodeId } : {}),
    },
  )
  console.log('[create_pair] response', data)
  return data
}

/** `PATCH /pairs/update_pair` — không gửi zoneId. */
async function updatePair(input: UpdatePairInput): Promise<PairWriteResult> {
  assertInferencePaused()
  console.log('[update_pair] request', input)
  const hasField =
    input.startNodeId !== undefined ||
    input.endNodeId !== undefined ||
    input.pairType !== undefined ||
    input.enabled !== undefined ||
    input.autoDispatch !== undefined ||
    input.name !== undefined

  if (!hasField) {
    const error: ApiError = {
      status: 400,
      message: 'Không gửi field nào để cập nhật',
    }
    throw error
  }

  if (env.useMockApi) {
    const index = findPairIndex(input.id)
    if (index < 0) {
      const error: ApiError = {
        status: 404,
        message: `Pair ${input.id} not found`,
      }
      throw error
    }

    const current = nodePairFixtures[index]
    const pairType = input.pairType ?? current.pairType
    const startNodeId = (input.startNodeId ?? current.startNodeId).trim()
    const endNodeId = normalizePairEnd(
      pairType,
      input.endNodeId !== undefined ? input.endNodeId : current.endNodeId,
    )

    if (pairType === 'normal' && !endNodeId) {
      const error: ApiError = {
        status: 400,
        message: 'pairType=normal bắt buộc endNodeId',
      }
      throw error
    }

    assertNodeExists(startNodeId)
    assertNodeHasRoi(startNodeId)
    if (pairType === 'normal') {
      assertNodeExists(endNodeId)
      assertNodeHasRoi(endNodeId)
    }

    const nextId = buildPairId(startNodeId, endNodeId, pairType)
    if (findDuplicate(startNodeId, endNodeId, current.id)) {
      const error: ApiError = {
        status: 409,
        message: 'Pair đích đã tồn tại',
      }
      throw error
    }

    const updated: NodePair = {
      ...current,
      id: nextId,
      startNodeId,
      endNodeId,
      pairType,
      enabled: input.enabled ?? current.enabled,
      autoDispatch: input.autoDispatch ?? current.autoDispatch,
      name:
        input.name?.trim() ||
        (pairType === 'empty'
          ? `${startNodeId} → _`
          : `${startNodeId} → ${endNodeId}`),
    }
    nodePairFixtures[index] = updated

    const result: PairWriteResult = {
      id: updated.id,
      startNodeId: updated.startNodeId,
      endNodeId: updated.endNodeId,
      pairType: updated.pairType,
      enabled: updated.enabled,
      autoDispatch: updated.autoDispatch,
      name: updated.name,
      runtimeReloaded: true,
    }
    console.log('[update_pair] response (mock)', result)
    return mockRequest(result, 200)
  }

  const body: Record<string, string | boolean> = { id: input.id }
  if (input.startNodeId !== undefined) {
    body.startNodeId = input.startNodeId.trim()
  }
  if (input.endNodeId !== undefined) {
    body.endNodeId = input.endNodeId.trim()
  }
  if (input.pairType !== undefined) {
    body.pairType = input.pairType
  }
  if (input.enabled !== undefined) {
    body.enabled = input.enabled
  }
  if (input.autoDispatch !== undefined) {
    body.autoDispatch = input.autoDispatch
  }
  if (input.name !== undefined) {
    body.name = input.name.trim()
  }

  const { data } = await apiClient.patch<PairWriteResult>(
    '/pairs/update_pair',
    body,
  )
  console.log('[update_pair] response', data)
  return data
}

/** `POST /pairs/delete_pair` */
async function deletePair(input: {
  id?: string
  startNodeId?: string
  endNodeId?: string
}): Promise<PairWriteResult> {
  assertInferencePaused()
  console.log('[delete_pair] request', input)

  if (env.useMockApi) {
    let index = -1
    if (input.id) {
      index = findPairIndex(input.id)
    } else if (input.startNodeId) {
      const end = input.endNodeId?.trim() || '_'
      index = nodePairFixtures.findIndex(
        (pair) =>
          pair.startNodeId === input.startNodeId && pair.endNodeId === end,
      )
    }

    if (index < 0) {
      const error: ApiError = {
        status: 404,
        message: 'Pair không tồn tại',
      }
      throw error
    }

    const [removed] = nodePairFixtures.splice(index, 1)
    const result: PairWriteResult = {
      id: removed.id,
      startNodeId: removed.startNodeId,
      endNodeId: removed.endNodeId,
      runtimeReloaded: true,
    }
    console.log('[delete_pair] response (mock)', result)
    return mockRequest(result, 200)
  }

  const { data } = await apiClient.post<PairWriteResult>(
    '/pairs/delete_pair',
    input,
  )
  console.log('[delete_pair] response', data)
  return data
}

/** `POST /pairs/set_pair_enabled` */
async function setPairEnabled(input: {
  id: string
  enabled: boolean
}): Promise<PairWriteResult> {
  assertInferencePaused()
  console.log('[set_pair_enabled] request', input)

  if (env.useMockApi) {
    const pair = nodePairFixtures.find((item) => item.id === input.id)
    if (!pair) {
      const error: ApiError = {
        status: 404,
        message: `Pair ${input.id} not found`,
      }
      throw error
    }
    pair.enabled = input.enabled
    const result: PairWriteResult = {
      id: pair.id,
      startNodeId: pair.startNodeId,
      endNodeId: pair.endNodeId,
      enabled: pair.enabled,
      runtimeReloaded: true,
    }
    console.log('[set_pair_enabled] response (mock)', result)
    return mockRequest(result, 200)
  }

  const { data } = await apiClient.post<PairWriteResult>(
    '/pairs/set_pair_enabled',
    input,
  )
  console.log('[set_pair_enabled] response', data)
  return data
}

function invalidatePairs(queryClient: ReturnType<typeof useQueryClient>) {
  queryClient.invalidateQueries({ queryKey: dispatchKeys.pairs() })
  queryClient.invalidateQueries({ queryKey: zoneKeys.all })
}

export function useCreatePair() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createPair,
    onSuccess: () => invalidatePairs(queryClient),
  })
}

export function useUpdatePair() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: updatePair,
    onSuccess: () => invalidatePairs(queryClient),
  })
}

export function useDeletePair() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deletePair,
    onSuccess: () => invalidatePairs(queryClient),
  })
}

export function useSetPairEnabled() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: setPairEnabled,
    onSuccess: () => invalidatePairs(queryClient),
  })
}
