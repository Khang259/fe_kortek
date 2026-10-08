import { useMutation, useQueryClient } from '@tanstack/react-query'

import { env } from '@/config/env'
import { nodeKeys } from '@/features/nodes/api/get-nodes'
import { useNodeRuntimeStore } from '@/features/nodes/stores/node-runtime-store'
import { apiClient } from '@/lib/axios'
import { mockRequest } from '@/testing/mock-request'
import { nodeFixtures } from '@/testing/fixtures/nodes'
import { nodePairFixtures } from '@/testing/fixtures/dispatch'
import type { NodeLock } from '@/types'

interface SetLockInput {
  nodeId: string
  /** Chỉ bật user lock (contract). */
  user: true
}

interface UnlockByUserInput {
  nodeId: string
}

interface UnlockByUserResult {
  nodeId: string
  lock: NodeLock
}

function syncPairBlocking(nodeId: string) {
  nodePairFixtures.forEach((pair) => {
    const touches = pair.startNodeId === nodeId || pair.endNodeId === nodeId
    if (!touches) {
      return
    }
    const start = nodeFixtures.find((n) => n.id === pair.startNodeId)
    const end = nodeFixtures.find((n) => n.id === pair.endNodeId)
    const locked =
      start?.lock.user ||
      start?.lock.system ||
      end?.lock.user ||
      end?.lock.system ||
      start?.isUnderMaintenance ||
      end?.isUnderMaintenance
    if (locked) {
      pair.isBlocked = true
      pair.blockedReason = 'Node liên quan đang lock/bảo trì'
      return
    }
    pair.isBlocked = false
    pair.blockedReason = null
  })
}

/**
 * `POST /nodes/set_lock` — chỉ bật `lock.user`.
 * Quyền: `node.maintenance`.
 */
async function setLock({ nodeId }: SetLockInput) {
  if (env.useMockApi) {
    const node = nodeFixtures.find((item) => item.id === nodeId)
    if (node) {
      node.lock = { ...node.lock, user: true }
    }
    syncPairBlocking(nodeId)
    return mockRequest({ nodeId, user: true }, 200)
  }

  const { data } = await apiClient.post('/nodes/set_lock', {
    nodeId,
    user: true,
  })
  return data
}

/**
 * `POST /nodes/unlock_by_user` — gỡ cả `lock.user` + `lock.system` trên 1 node.
 * Body chỉ `{ nodeId }`. Quyền: `node.maintenance`.
 * @see docs/fe-api-unlock-by-system-user.md
 */
async function unlockByUser({
  nodeId,
}: UnlockByUserInput): Promise<UnlockByUserResult> {
  if (env.useMockApi) {
    const node = nodeFixtures.find((item) => item.id === nodeId)
    if (!node) {
      throw { status: 404, message: `Node ${nodeId} not found` }
    }
    node.lock = { user: false, system: false, orderId: null }
    syncPairBlocking(nodeId)
    return mockRequest({ nodeId, lock: { ...node.lock } }, 200)
  }

  const { data } = await apiClient.post<UnlockByUserResult>(
    '/nodes/unlock_by_user',
    { nodeId },
  )
  return data
}

function invalidateNodeQueries(queryClient: ReturnType<typeof useQueryClient>) {
  queryClient.invalidateQueries({ queryKey: nodeKeys.all })
  queryClient.invalidateQueries({ queryKey: ['dispatch'] })
}

export function useSetNodeLock() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: setLock,
    onSuccess: (_data, variables) => {
      useNodeRuntimeStore.getState().patchLock(variables.nodeId, {
        user: true,
      })
      invalidateNodeQueries(queryClient)
    },
  })
}

export function useUnlockByUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: unlockByUser,
    onSuccess: (data) => {
      useNodeRuntimeStore.getState().patchLock(data.nodeId, data.lock)
      invalidateNodeQueries(queryClient)
    },
  })
}
