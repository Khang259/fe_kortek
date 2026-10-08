import { useMutation, useQueryClient } from '@tanstack/react-query'

import { env } from '@/config/env'
import { cameraKeys } from '@/features/cameras/api/get-cameras'
import type { CameraRoi, RoiBox } from '@/features/cameras/types'
import { isValidRoiBox } from '@/features/cameras/utils/roi-box'
import { dispatchKeys } from '@/features/dispatch/api/get-active-tasks'
import { assertInferencePaused } from '@/features/system/hooks/use-config-write-gate'
import { cascadeDeleteRoiByNodeId } from '@/lib/mock-cascade'
import { apiClient } from '@/lib/axios'
import { mockRequest } from '@/testing/mock-request'
import {
  cameraFixtures,
  cameraRoiFixtures,
} from '@/testing/fixtures/cameras'
import { nodePairFixtures } from '@/testing/fixtures/dispatch'
import { nodeFixtures } from '@/testing/fixtures/nodes'
import type { ApiError } from '@/types'

function findNodeMeta(nodeId: string) {
  const node = nodeFixtures.find((item) => item.id === nodeId)
  return {
    label: node?.name?.trim() || nodeId,
    kind: node?.kind ?? ('start' as const),
  }
}

async function createRoi(input: {
  cameraId: number
  nodeId: string
  box: RoiBox
}) {
  assertInferencePaused()
  if (env.useMockApi) {
    const camera = cameraFixtures.find(
      (item) => item.cameraId === input.cameraId,
    )
    if (!camera) {
      const error: ApiError = {
        status: 404,
        message: `Camera ${input.cameraId} not found`,
      }
      throw error
    }
    if (!camera.observedNodeIds.includes(input.nodeId)) {
      const error: ApiError = {
        status: 400,
        message: `Node ${input.nodeId} không thuộc observedNodeIds camera #${input.cameraId}`,
      }
      throw error
    }

    const meta = findNodeMeta(input.nodeId)
    const id = `${input.cameraId}:${input.nodeId}`
    const next: CameraRoi = {
      id,
      cameraId: input.cameraId,
      nodeId: input.nodeId,
      label: meta.label,
      kind: meta.kind,
      box: input.box,
      refWidth: 640,
      refHeight: 480,
    }
    const index = cameraRoiFixtures.findIndex((roi) => roi.id === id)
    if (index >= 0) {
      cameraRoiFixtures[index] = next
    } else {
      cameraRoiFixtures.push(next)
    }
    return mockRequest(next, 250)
  }

  const { data } = await apiClient.post<CameraRoi>(
    '/cameras/create_roi',
    input,
  )
  return data
}

/** Một phần tử trong batch update_roi. */
export type UpdateRoiItem =
  | { id: string; box: RoiBox }
  | { cameraId: number; nodeId: string; box: RoiBox }

/** Body PATCH — batch khuyến nghị; single vẫn tương thích. */
export type UpdateRoiInput =
  | { items: UpdateRoiItem[] }
  | UpdateRoiItem

interface UpdateRoiListResponse {
  items: CameraRoi[]
}

function resolveUpdateRoiId(item: UpdateRoiItem): string {
  if ('id' in item) {
    return item.id
  }
  return `${item.cameraId}:${item.nodeId}`
}

function toUpdateRoiItems(input: UpdateRoiInput): UpdateRoiItem[] {
  if ('items' in input) {
    return input.items
  }
  return [input]
}

function toRequestBody(item: UpdateRoiItem) {
  if ('id' in item) {
    return { id: item.id, box: item.box }
  }
  return {
    cameraId: item.cameraId,
    nodeId: item.nodeId,
    box: item.box,
  }
}

/**
 * `PATCH /cameras/update_roi` — batch atomic.
 * Validate toàn bộ trước; 1 lỗi → không ghi gì (mock + BE).
 */
async function updateRoi(input: UpdateRoiInput): Promise<UpdateRoiListResponse> {
  assertInferencePaused()
  const items = toUpdateRoiItems(input)
  if (items.length === 0) {
    const error: ApiError = { status: 400, message: 'items rỗng' }
    throw error
  }

  for (let index = 0; index < items.length; index += 1) {
    const item = items[index]
    if (!isValidRoiBox(item.box)) {
      const error: ApiError = {
        status: 400,
        message: `items[${index}]: box vượt khung 640×480`,
      }
      throw error
    }
  }

  if (env.useMockApi) {
    const resolved: Array<{ id: string; box: RoiBox; index: number }> = []
    for (let index = 0; index < items.length; index += 1) {
      const item = items[index]
      const id = resolveUpdateRoiId(item)
      const roi = cameraRoiFixtures.find((entry) => entry.id === id)
      if (!roi) {
        const error: ApiError = {
          status: 404,
          message: `items[${index}]: ROI không tồn tại (${id})`,
        }
        throw error
      }
      resolved.push({ id, box: item.box, index })
    }

    const updated: CameraRoi[] = resolved.map(({ id, box }) => {
      const roi = cameraRoiFixtures.find((entry) => entry.id === id)!
      roi.box = box
      return { ...roi }
    })

    return mockRequest({ items: updated }, 250)
  }

  const { data } = await apiClient.patch<UpdateRoiListResponse>(
    '/cameras/update_roi',
    { items: items.map(toRequestBody) },
  )
  return data
}

async function deleteRoi(input: { id: string }) {
  assertInferencePaused()
  if (env.useMockApi) {
    const index = cameraRoiFixtures.findIndex((item) => item.id === input.id)
    if (index < 0) {
      const error: ApiError = {
        status: 404,
        message: `ROI ${input.id} not found`,
      }
      throw error
    }
    const roi = cameraRoiFixtures[index]
    const pairsDeleted = nodePairFixtures
      .filter(
        (pair) =>
          pair.startNodeId === roi.nodeId || pair.endNodeId === roi.nodeId,
      )
      .map((pair) => pair.id)
    cascadeDeleteRoiByNodeId(roi.nodeId)
    cameraRoiFixtures.splice(index, 1)
    return mockRequest(
      { id: input.id, deleted: true, pairsDeleted },
      200,
    )
  }

  const { data } = await apiClient.post<{
    id: string
    deleted: boolean
    pairsDeleted?: string[]
  }>('/cameras/delete_roi', input)
  return {
    ...data,
    pairsDeleted: data.pairsDeleted ?? [],
  }
}

function invalidateRois(queryClient: ReturnType<typeof useQueryClient>) {
  queryClient.invalidateQueries({ queryKey: cameraKeys.all })
  queryClient.invalidateQueries({ queryKey: dispatchKeys.pairs() })
}

export function useCreateRoi() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createRoi,
    onSuccess: () => invalidateRois(queryClient),
  })
}

export function useUpdateRoi() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: updateRoi,
    onSuccess: () => invalidateRois(queryClient),
  })
}

export function useDeleteRoi() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deleteRoi,
    onSuccess: () => invalidateRois(queryClient),
  })
}
