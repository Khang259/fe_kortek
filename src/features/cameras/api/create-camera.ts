import { useMutation, useQueryClient } from '@tanstack/react-query'

import { env } from '@/config/env'
import { cameraKeys } from '@/features/cameras/api/get-cameras'
import type { Camera } from '@/features/cameras/types'
import {
  createObservedNode,
  normalizeZone,
  toStartPriorityApiError,
} from '@/features/cameras/utils/camera-node-helpers'
import { dispatchKeys } from '@/features/dispatch/api/get-active-tasks'
import { nodeKeys } from '@/features/nodes/api/get-nodes'
import {
  isStartNodeId,
  validateNewStartPriorities,
} from '@/features/nodes/utils/node-priority'
import { assertInferencePaused } from '@/features/system/hooks/use-config-write-gate'
import { apiClient } from '@/lib/axios'
import { mockRequest } from '@/testing/mock-request'
import { cameraFixtures } from '@/testing/fixtures/cameras'
import { nodeFixtures } from '@/testing/fixtures/nodes'
import type { ApiError } from '@/types'

export interface CreateCameraInput {
  name: string
  rtspUrl: string
  zone?: string
  observedNodeIds?: string[]
  /** Bắt buộc khi tạo mới ít nhất một `start_*`. */
  nodePriorities?: Record<string, number>
}

export interface CreateCameraResult extends Camera {
  requiresRestart: boolean
  observedAssigned: number
  observedCreated: number
}

function buildPayload(input: CreateCameraInput): CreateCameraInput {
  const name = input.name.trim()
  const rtspUrl = input.rtspUrl.trim()
  if (!name) {
    const error: ApiError = { status: 400, message: 'name không được rỗng' }
    throw error
  }
  if (!rtspUrl) {
    const error: ApiError = { status: 400, message: 'rtspUrl không được rỗng' }
    throw error
  }

  const zoneRaw = input.zone?.trim()
  if (zoneRaw === '') {
    const error: ApiError = { status: 400, message: 'zone không được rỗng' }
    throw error
  }

  const observedNodeIds = (input.observedNodeIds ?? [])
    .map((id) => id.trim())
    .filter(Boolean)

  if (observedNodeIds.length > 0 && !zoneRaw) {
    const error: ApiError = {
      status: 400,
      message: 'observedNodeIds yêu cầu có zone',
    }
    throw error
  }

  const payload: CreateCameraInput = { name, rtspUrl }
  if (zoneRaw) {
    payload.zone = normalizeZone(zoneRaw)
  }
  if (observedNodeIds.length > 0) {
    payload.observedNodeIds = observedNodeIds
  }
  if (input.nodePriorities && Object.keys(input.nodePriorities).length > 0) {
    payload.nodePriorities = input.nodePriorities
  }
  return payload
}

function normalizeCreateResult(data: CreateCameraResult): CreateCameraResult {
  const cameraId = data.cameraId ?? data.id
  return {
    ...data,
    cameraId,
    id: cameraId,
    format: data.format?.trim() || 'H264',
    resolution: data.resolution ?? '640x480',
    mapPosition: data.mapPosition ?? null,
    error: data.error ?? null,
    observedNodeIds: data.observedNodeIds ?? [],
    zone: data.zone ?? '',
    requiresRestart: data.requiresRestart ?? false,
    observedAssigned: data.observedAssigned ?? 0,
    observedCreated: data.observedCreated ?? 0,
  }
}

/**
 * `POST /cameras/create_camera`
 * @see docs/fe-api-create-camera.md
 * @see docs/fe-api-start-priority.md
 */
async function createCamera(
  input: CreateCameraInput,
): Promise<CreateCameraResult> {
  assertInferencePaused()
  const payload = buildPayload(input)
  console.log('[create_camera] request', payload)

  if (env.useMockApi) {
    const duplicate = cameraFixtures.find(
      (item) => item.rtspUrl === payload.rtspUrl,
    )
    if (duplicate) {
      const error: ApiError = {
        status: 409,
        message: `rtspUrl đã dùng bởi camera ${duplicate.cameraId}`,
      }
      throw error
    }

    const cameraId =
      Math.max(0, ...cameraFixtures.map((item) => item.cameraId)) + 1
    const zone = payload.zone ?? ''
    const observedNodeIds = payload.observedNodeIds ?? []
    const nodePriorities = payload.nodePriorities ?? {}
    let observedCreated = 0
    let observedAssigned = 0

    const newStartIds = observedNodeIds.filter(
      (nodeId) =>
        isStartNodeId(nodeId) &&
        !nodeFixtures.some((item) => item.id === nodeId),
    )
    try {
      validateNewStartPriorities({
        newStartIds,
        nodePriorities,
        zoneId: zone,
        existingNodes: nodeFixtures,
      })
    } catch (message) {
      throw toStartPriorityApiError(message)
    }

    for (const nodeId of observedNodeIds) {
      const existing = nodeFixtures.find((item) => item.id === nodeId)
      if (!existing) {
        const priority = isStartNodeId(nodeId)
          ? nodePriorities[nodeId]
          : (nodePriorities[nodeId] ?? 0)
        createObservedNode({
          nodeId,
          cameraId,
          zone,
          priority,
          name: null,
        })
        observedCreated += 1
        observedAssigned += 1
        continue
      }
      if (
        existing.cameraId !== null &&
        existing.cameraId !== cameraId
      ) {
        const error: ApiError = {
          status: 409,
          message: `Node ${nodeId} đang thuộc camera ${existing.cameraId} (1 node chỉ gắn 1 camera)`,
        }
        throw error
      }
      existing.cameraId = cameraId
      existing.zoneId = zone
      observedAssigned += 1
    }

    const camera: Camera = {
      id: cameraId,
      cameraId,
      name: payload.name,
      rtspUrl: payload.rtspUrl,
      zone,
      format: 'H264',
      resolution: '640x480',
      observedNodeIds,
      status: 'offline',
      enabled: true,
      error: null,
      mapPosition: null,
    }
    cameraFixtures.push(camera)

    const result: CreateCameraResult = {
      ...camera,
      requiresRestart: true,
      observedAssigned,
      observedCreated,
    }
    console.log('[create_camera] response (mock)', result)
    return mockRequest(result, 200)
  }

  const { data } = await apiClient.post<CreateCameraResult>(
    '/cameras/create_camera',
    payload,
  )
  console.log('[create_camera] response', data)
  return normalizeCreateResult(data)
}

export function useCreateCamera() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createCamera,
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: cameraKeys.list() })
      if (result.observedCreated > 0 || result.observedAssigned > 0) {
        queryClient.invalidateQueries({ queryKey: nodeKeys.all })
        queryClient.invalidateQueries({ queryKey: dispatchKeys.pairs() })
      }
    },
  })
}
