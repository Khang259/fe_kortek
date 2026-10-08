import { useMutation, useQueryClient } from '@tanstack/react-query'

import { env } from '@/config/env'
import { cameraKeys } from '@/features/cameras/api/get-cameras'
import type { Camera } from '@/features/cameras/types'
import {
  createObservedNode,
  normalizeZone,
  toStartPriorityApiError,
} from '@/features/cameras/utils/camera-node-helpers'
import { nodeKeys } from '@/features/nodes/api/get-nodes'
import {
  isStartNodeId,
  validateNewStartPriorities,
} from '@/features/nodes/utils/node-priority'
import { dispatchKeys } from '@/features/dispatch/api/get-active-tasks'
import { assertInferencePaused } from '@/features/system/hooks/use-config-write-gate'
import { cascadeDeleteNode } from '@/lib/mock-cascade'
import { apiClient } from '@/lib/axios'
import { mockRequest } from '@/testing/mock-request'
import { cameraFixtures } from '@/testing/fixtures/cameras'
import { nodePairFixtures } from '@/testing/fixtures/dispatch'
import { nodeFixtures } from '@/testing/fixtures/nodes'
import type { ApiError } from '@/types'

/** Body partial — chỉ gửi field cần sửa (+ cameraId). */
export interface UpdateCameraInput {
  cameraId: number
  name?: string
  rtspUrl?: string
  zone?: string
  /**
   * Sync SSOT: create / giữ / xóa cascade.
   * Không gửi = không đổi; `[]` = xóa hết node của camera.
   */
  observedNodeIds?: string[]
  /** Bắt buộc khi observedNodeIds tạo mới `start_*`. */
  nodePriorities?: Record<string, number>
}

export interface UpdateCameraResult extends Camera {
  requiresRestart: boolean
  nodesZoneUpdated: number
  /** Số id trong list (sau sync). */
  observedAssigned: number
  /** Số node mới tạo. */
  observedCreated: number
  /** Số node bị xóa cascade. */
  observedRemoved: number
  /** Alias = observedRemoved (tương thích). */
  observedUnassigned: number
  /** List `start:end` đã xóa. */
  pairsDeleted: string[]
}

/** Đổi zone camera: start mang priority đã có ở zone đích → 409. */
function assertZonePriorityOk(camera: Camera, nextZone: string) {
  camera.observedNodeIds.forEach((nodeId) => {
    const node = nodeFixtures.find((item) => item.id === nodeId)
    if (!node || node.kind !== 'start') {
      return
    }
    const conflict = nodeFixtures.find(
      (other) =>
        other.kind === 'start' &&
        other.zoneId === nextZone &&
        other.priority === node.priority &&
        other.id !== node.id,
    )
    if (conflict) {
      const error: ApiError = {
        status: 409,
        message: `priority ${node.priority} đã dùng bởi start ${conflict.id} trong zone ${nextZone}`,
      }
      throw error
    }
  })
}

/**
 * Sync observedNodeIds (SSOT):
 * - Id mới → auto-create node (start cần nodePriorities)
 * - Id thuộc camera khác → 409
 * - Id bị bỏ → xóa node + ROI + cascade pairs
 */
function syncObservedNodes(
  camera: Camera,
  nextIds: string[],
  nodePriorities: Record<string, number>,
): {
  assigned: number
  created: number
  removed: number
  pairsDeleted: string[]
} {
  const desired = new Set(nextIds)
  let assigned = 0
  let created = 0
  const pairsDeleted: string[] = []

  const newStartIds = nextIds.filter(
    (nodeId) =>
      isStartNodeId(nodeId) && !nodeFixtures.some((item) => item.id === nodeId),
  )
  try {
    validateNewStartPriorities({
      newStartIds,
      nodePriorities,
      zoneId: camera.zone,
      existingNodes: nodeFixtures,
    })
  } catch (message) {
    throw toStartPriorityApiError(message)
  }

  for (const nodeId of nextIds) {
    const existing = nodeFixtures.find((item) => item.id === nodeId)
    if (!existing) {
      const priority = isStartNodeId(nodeId)
        ? nodePriorities[nodeId]
        : (nodePriorities[nodeId] ?? 0)
      createObservedNode({
        nodeId,
        cameraId: camera.cameraId,
        zone: camera.zone,
        priority,
        name: nodeId,
      })
      created += 1
      assigned += 1
      continue
    }
    if (
      existing.cameraId !== null &&
      existing.cameraId !== camera.cameraId
    ) {
      const error: ApiError = {
        status: 409,
        message: `Node ${nodeId} đang thuộc camera #${existing.cameraId}`,
      }
      throw error
    }
    const wasOther = existing.cameraId !== camera.cameraId
    existing.cameraId = camera.cameraId
    existing.zoneId = camera.zone
    if (wasOther) {
      assigned += 1
    }
  }

  const toRemove = nodeFixtures.filter(
    (node) =>
      node.cameraId === camera.cameraId && !desired.has(node.id),
  )
  let removed = 0
  for (const node of toRemove) {
    nodePairFixtures.forEach((pair) => {
      if (pair.startNodeId === node.id || pair.endNodeId === node.id) {
        pairsDeleted.push(pair.id)
      }
    })
    cascadeDeleteNode(node.id)
    removed += 1
  }

  camera.observedNodeIds = [...nextIds]
  return { assigned, created, removed, pairsDeleted }
}

/**
 * `PATCH /cameras/update_camera` — partial update + SSOT sync.
 * @see docs/fe-api-start-priority.md
 */
async function updateCamera(
  input: UpdateCameraInput,
): Promise<UpdateCameraResult> {
  assertInferencePaused()
  console.log('[update_camera] request', input)

  const name = input.name?.trim()
  const rtspUrl = input.rtspUrl?.trim()
  const zone = input.zone !== undefined ? normalizeZone(input.zone) : undefined
  const observedNodeIds = input.observedNodeIds
  const nodePriorities = input.nodePriorities ?? {}

  const hasField =
    name !== undefined ||
    rtspUrl !== undefined ||
    zone !== undefined ||
    observedNodeIds !== undefined
  if (!hasField) {
    const error: ApiError = {
      status: 400,
      message: 'Không gửi field nào để cập nhật',
    }
    throw error
  }
  if (name !== undefined && name === '') {
    const error: ApiError = { status: 400, message: 'name không được rỗng' }
    throw error
  }
  if (rtspUrl !== undefined && rtspUrl === '') {
    const error: ApiError = { status: 400, message: 'rtspUrl không được rỗng' }
    throw error
  }
  if (zone !== undefined && zone === '') {
    const error: ApiError = { status: 400, message: 'zone không được rỗng' }
    throw error
  }

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

    const rtspChanged = rtspUrl !== undefined && rtspUrl !== camera.rtspUrl
    let nodesZoneUpdated = 0
    let observedAssigned = 0
    let observedCreated = 0
    let observedRemoved = 0
    let pairsDeleted: string[] = []

    if (name !== undefined) {
      camera.name = name
    }
    if (rtspUrl !== undefined) {
      camera.rtspUrl = rtspUrl
    }
    if (zone !== undefined && zone !== camera.zone) {
      assertZonePriorityOk(camera, zone)
      camera.zone = zone
      nodeFixtures.forEach((node) => {
        if (node.cameraId === camera.cameraId) {
          node.zoneId = zone
          nodesZoneUpdated += 1
        }
      })
    }
    if (observedNodeIds !== undefined) {
      const sync = syncObservedNodes(camera, observedNodeIds, nodePriorities)
      observedAssigned = sync.assigned
      observedCreated = sync.created
      observedRemoved = sync.removed
      pairsDeleted = sync.pairsDeleted
    }

    const result: UpdateCameraResult = {
      ...camera,
      requiresRestart: rtspChanged,
      nodesZoneUpdated,
      observedAssigned:
        observedNodeIds !== undefined
          ? observedNodeIds.length
          : observedAssigned,
      observedCreated,
      observedRemoved,
      observedUnassigned: observedRemoved,
      pairsDeleted,
    }
    console.log('[update_camera] response (mock)', result)
    return mockRequest(result, 200)
  }

  const body: Record<
    string,
    string | number | string[] | Record<string, number>
  > = {
    cameraId: input.cameraId,
  }
  if (name !== undefined) {
    body.name = name
  }
  if (rtspUrl !== undefined) {
    body.rtspUrl = rtspUrl
  }
  if (zone !== undefined) {
    body.zone = zone
  }
  if (observedNodeIds !== undefined) {
    body.observedNodeIds = observedNodeIds
  }
  if (Object.keys(nodePriorities).length > 0) {
    body.nodePriorities = nodePriorities
  }

  const { data } = await apiClient.patch<UpdateCameraResult>(
    '/cameras/update_camera',
    body,
  )
  console.log('[update_camera] response', data)
  const removed = data.observedRemoved ?? data.observedUnassigned ?? 0
  return {
    ...data,
    observedAssigned: data.observedAssigned ?? 0,
    observedCreated: data.observedCreated ?? 0,
    observedRemoved: removed,
    observedUnassigned: removed,
    pairsDeleted: data.pairsDeleted ?? [],
    nodesZoneUpdated: data.nodesZoneUpdated ?? 0,
    requiresRestart: data.requiresRestart ?? false,
  }
}

export function useUpdateCamera() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: updateCamera,
    onSuccess: (result, variables) => {
      queryClient.invalidateQueries({ queryKey: cameraKeys.list() })
      const touchedNodes =
        result.nodesZoneUpdated > 0 ||
        result.observedCreated > 0 ||
        result.observedRemoved > 0 ||
        result.pairsDeleted.length > 0 ||
        variables.observedNodeIds !== undefined
      if (touchedNodes) {
        queryClient.invalidateQueries({ queryKey: nodeKeys.all })
        queryClient.invalidateQueries({ queryKey: cameraKeys.all })
        queryClient.invalidateQueries({ queryKey: dispatchKeys.pairs() })
      }
    },
  })
}
