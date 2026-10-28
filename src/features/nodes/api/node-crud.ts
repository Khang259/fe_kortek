import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import { env } from '@/config/env'
import { cameraKeys } from '@/features/cameras/api/get-cameras'
import { nodeKeys } from '@/features/nodes/api/get-nodes'
import { isValidColId, normalizeColId } from '@/features/nodes/utils/node-col'
import { usedStartPrioritiesInZone } from '@/features/nodes/utils/node-priority'
import { apiClient } from '@/lib/axios'
import { mockRequest } from '@/testing/mock-request'
import { nodeFixtures } from '@/testing/fixtures/nodes'
import type { ApiError, WarehouseNode } from '@/types'

export interface UpdateNodeInput {
  nodeId: string
  priority?: number
  enabled?: boolean
  /** Chỉ start — mã cột trong zone. */
  colId?: string
}

/**
 * `PATCH /nodes/update_node` — `priority` / `enabled` / `colId`.
 * Không cần inference pause (chỉ ghi DB). Không gửi zoneId/cameraId.
 * Đổi priority/colId → toast nhắc restart runtime (dispatch hydrate lúc start).
 * @see docs/FE_CONTRACT_COLS_API.md
 */
async function updateNode(input: UpdateNodeInput): Promise<WarehouseNode> {
  console.log('[update_node] request', input)

  if (
    'cameraId' in input &&
    (input as { cameraId?: unknown }).cameraId !== undefined
  ) {
    const error: ApiError = {
      status: 400,
      message: 'Không đổi cameraId — dùng update_camera.observedNodeIds',
    }
    throw error
  }

  if (
    'zoneId' in input &&
    (input as { zoneId?: unknown }).zoneId !== undefined
  ) {
    const error: ApiError = {
      status: 400,
      message: 'Không đổi zoneId — zone chỉ đổi qua update_camera.zone',
    }
    throw error
  }

  if (
    input.priority === undefined &&
    input.enabled === undefined &&
    input.colId === undefined
  ) {
    const error: ApiError = {
      status: 400,
      message: 'Không gửi field nào để cập nhật',
    }
    throw error
  }

  if (input.priority !== undefined) {
    if (!Number.isInteger(input.priority) || input.priority < 0) {
      const error: ApiError = { status: 400, message: 'priority phải >= 0' }
      throw error
    }
  }

  if (input.colId !== undefined && !isValidColId(input.colId)) {
    const error: ApiError = {
      status: 400,
      message: 'colId không được rỗng',
    }
    throw error
  }

  if (env.useMockApi) {
    const node = nodeFixtures.find((item) => item.id === input.nodeId)
    if (!node) {
      const error: ApiError = {
        status: 404,
        message: `Node ${input.nodeId} not found`,
      }
      throw error
    }
    if (input.priority !== undefined && node.kind === 'start') {
      const used = usedStartPrioritiesInZone(
        nodeFixtures,
        node.zoneId,
        node.id,
      )
      if (used.has(input.priority)) {
        const error: ApiError = {
          status: 409,
          message: `priority ${input.priority} đã dùng bởi start khác trong zone ${node.zoneId}`,
        }
        throw error
      }
      node.priority = input.priority
    } else if (input.priority !== undefined) {
      node.priority = input.priority
    }
    if (input.enabled !== undefined) {
      node.enabled = input.enabled
    }
    if (input.colId !== undefined) {
      if (node.kind !== 'start') {
        const error: ApiError = {
          status: 400,
          message: 'colId chỉ áp dụng cho start node',
        }
        throw error
      }
      node.colId = normalizeColId(input.colId)
    }
    const updated = { ...node }
    console.log('[update_node] response (mock)', updated)
    return mockRequest(updated, 200)
  }

  const body: Record<string, string | number | boolean> = {
    nodeId: input.nodeId,
  }
  if (input.priority !== undefined) {
    body.priority = input.priority
  }
  if (input.enabled !== undefined) {
    body.enabled = input.enabled
  }
  if (input.colId !== undefined) {
    body.colId = input.colId.trim()
  }

  const { data } = await apiClient.patch<WarehouseNode>(
    '/nodes/update_node',
    body,
  )
  console.log('[update_node] response', data)
  return data
}

function invalidateNodeRelated(
  queryClient: ReturnType<typeof useQueryClient>,
) {
  queryClient.invalidateQueries({ queryKey: nodeKeys.all })
  queryClient.invalidateQueries({ queryKey: cameraKeys.all })
  queryClient.invalidateQueries({ queryKey: ['dispatch'] })
}

export function useUpdateNode() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: updateNode,
    onSuccess: (_data, variables) => {
      invalidateNodeRelated(queryClient)
      if (
        variables.priority !== undefined ||
        variables.colId !== undefined
      ) {
        toast.warning(
          'Saved to DB. Restart runtime for ICS dispatch order to change.',
        )
      }
    },
  })
}
