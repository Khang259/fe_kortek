import { useMutation, useQueryClient } from '@tanstack/react-query'

import { env } from '@/config/env'
import { cameraKeys } from '@/features/cameras/api/get-cameras'
import type { Camera } from '@/features/cameras/types'
import { dispatchKeys } from '@/features/dispatch/api/get-active-tasks'
import { nodeKeys } from '@/features/nodes/api/get-nodes'
import { assertInferencePaused } from '@/features/system/hooks/use-config-write-gate'
import { apiClient } from '@/lib/axios'
import { mockRequest } from '@/testing/mock-request'
import { cameraFixtures } from '@/testing/fixtures/cameras'
import { nodePairFixtures } from '@/testing/fixtures/dispatch'
import { nodeFixtures } from '@/testing/fixtures/nodes'
import type { ApiError } from '@/types'

interface SetCameraStatusInput {
  cameraId: number
  enabled: boolean
}

interface SetCameraStatusResult {
  cameraId: number
  enabled: boolean
  nodesUpdated: number
  pairsUpdated: number
}

/**
 * `POST /cameras/set_camera_status`
 * Cascade enabled trên nodes + pairs của camera. Cần inference pause.
 */
async function setCameraStatus({
  cameraId,
  enabled,
}: SetCameraStatusInput): Promise<SetCameraStatusResult> {
  assertInferencePaused()

  if (env.useMockApi) {
    const camera = cameraFixtures.find((item) => item.cameraId === cameraId)
    if (!camera) {
      const error: ApiError = {
        status: 404,
        message: `Camera ${cameraId} not found`,
      }
      throw error
    }

    camera.enabled = enabled
    camera.status = enabled
      ? camera.status === 'disabled'
        ? 'offline'
        : camera.status
      : 'disabled'
    if (!enabled) {
      camera.error = null
    }

    const related = new Set(camera.observedNodeIds)
    let nodesUpdated = 0
    nodeFixtures.forEach((node) => {
      if (node.cameraId !== cameraId && !related.has(node.id)) {
        return
      }
      if (node.cameraId === cameraId || related.has(node.id)) {
        node.enabled = enabled
        nodesUpdated += 1
      }
    })

    let pairsUpdated = 0
    nodePairFixtures.forEach((pair) => {
      const linked =
        related.has(pair.startNodeId) || related.has(pair.endNodeId)
      if (!linked) {
        return
      }
      pair.enabled = enabled
      pairsUpdated += 1
      if (!enabled) {
        pair.isBlocked = true
        pair.autoDispatch = false
        pair.blockedReason = `Camera #${cameraId} đang disabled`
        return
      }
      if (pair.blockedReason?.includes(`Camera #${cameraId}`)) {
        pair.isBlocked = false
        pair.blockedReason = null
        pair.autoDispatch = true
      }
    })

    return mockRequest(
      { cameraId, enabled, nodesUpdated, pairsUpdated },
      200,
    )
  }

  const { data } = await apiClient.post<SetCameraStatusResult>(
    '/cameras/set_camera_status',
    { cameraId, enabled },
  )
  return {
    cameraId: data.cameraId,
    enabled: data.enabled,
    nodesUpdated: data.nodesUpdated ?? 0,
    pairsUpdated: data.pairsUpdated ?? 0,
  }
}

export function useSetCameraStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: setCameraStatus,
    onSuccess: (result) => {
      queryClient.setQueryData<Camera[]>(cameraKeys.list(), (cameras) =>
        cameras?.map((camera) =>
          camera.cameraId === result.cameraId
            ? {
                ...camera,
                enabled: result.enabled,
                status: result.enabled
                  ? camera.status === 'disabled'
                    ? 'offline'
                    : camera.status
                  : 'disabled',
              }
            : camera,
        ),
      )
      queryClient.invalidateQueries({ queryKey: cameraKeys.list() })
      queryClient.invalidateQueries({ queryKey: nodeKeys.all })
      queryClient.invalidateQueries({ queryKey: dispatchKeys.pairs() })
    },
  })
}
