import { useMutation, useQueryClient } from '@tanstack/react-query'

import { env } from '@/config/env'
import { cameraKeys } from '@/features/cameras/api/get-cameras'
import { dispatchKeys } from '@/features/dispatch/api/get-active-tasks'
import { nodeKeys } from '@/features/nodes/api/get-nodes'
import { assertInferencePaused } from '@/features/system/hooks/use-config-write-gate'
import { cascadeDeleteNode } from '@/lib/mock-cascade'
import { apiClient } from '@/lib/axios'
import { mockRequest } from '@/testing/mock-request'
import {
  cameraFixtures,
  cameraRoiFixtures,
} from '@/testing/fixtures/cameras'
import { nodePairFixtures } from '@/testing/fixtures/dispatch'
import type { ApiError } from '@/types'

export interface DeleteCameraResult {
  cameraId: number
  deleted: boolean
  nodesDeleted: string[]
  pairsDeleted: string[]
}

/**
 * `POST /cameras/delete_camera` — cascade nodes + pairs + ROI.
 * @see docs/fe-api-sync-camera-node-pair.md
 */
async function deleteCamera(cameraId: number): Promise<DeleteCameraResult> {
  assertInferencePaused()
  console.log('[delete_camera] request', { cameraId })

  if (env.useMockApi) {
    const index = cameraFixtures.findIndex(
      (item) => item.cameraId === cameraId,
    )
    if (index < 0) {
      const error: ApiError = {
        status: 404,
        message: `Camera ${cameraId} not found`,
      }
      throw error
    }

    const camera = cameraFixtures[index]
    const nodesDeleted = [...camera.observedNodeIds]
    const pairsDeleted: string[] = []

    for (const nodeId of nodesDeleted) {
      // Thu thập pair ids trước khi cascade
      nodePairFixtures.forEach((pair) => {
        if (pair.startNodeId === nodeId || pair.endNodeId === nodeId) {
          pairsDeleted.push(pair.id)
        }
      })
      cascadeDeleteNode(nodeId)
    }

    // ROI còn sót (nếu có)
    for (let i = cameraRoiFixtures.length - 1; i >= 0; i -= 1) {
      if (cameraRoiFixtures[i].cameraId === cameraId) {
        cameraRoiFixtures.splice(i, 1)
      }
    }

    cameraFixtures.splice(index, 1)
    const result: DeleteCameraResult = {
      cameraId,
      deleted: true,
      nodesDeleted,
      pairsDeleted: [...new Set(pairsDeleted)],
    }
    console.log('[delete_camera] response (mock)', result)
    return mockRequest(result, 200)
  }

  const { data } = await apiClient.post<DeleteCameraResult>(
    '/cameras/delete_camera',
    { cameraId },
  )
  console.log('[delete_camera] response', data)
  return {
    ...data,
    nodesDeleted: data.nodesDeleted ?? [],
    pairsDeleted: data.pairsDeleted ?? [],
  }
}

export function useDeleteCamera() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (cameraId: number) => deleteCamera(cameraId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: cameraKeys.all })
      queryClient.invalidateQueries({ queryKey: nodeKeys.all })
      queryClient.invalidateQueries({ queryKey: dispatchKeys.pairs() })
    },
  })
}
