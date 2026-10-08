import { useMutation, useQueryClient } from '@tanstack/react-query'

import { env } from '@/config/env'
import { nodeKeys } from '@/features/nodes/api/get-nodes'
import { apiClient } from '@/lib/axios'
import { mockRequest } from '@/testing/mock-request'
import { nodeFixtures } from '@/testing/fixtures/nodes'
import { nodePairFixtures } from '@/testing/fixtures/dispatch'

interface SetMaintenanceInput {
  nodeId: string
  isUnderMaintenance: boolean
  maintenanceReason: string | null
}

async function setMaintenance({
  nodeId,
  isUnderMaintenance,
  maintenanceReason,
}: SetMaintenanceInput) {
  if (env.useMockApi) {
    const node = nodeFixtures.find((item) => item.id === nodeId)
    if (node) {
      node.isUnderMaintenance = isUnderMaintenance
      node.maintenanceReason = isUnderMaintenance ? maintenanceReason : null
    }
    nodePairFixtures.forEach((pair) => {
      const touches =
        pair.startNodeId === nodeId || pair.endNodeId === nodeId
      if (!touches) return
      if (isUnderMaintenance) {
        pair.isBlocked = true
        pair.blockedReason = `Node ${nodeId} đang bảo trì`
      } else {
        const stillBlocked =
          nodeFixtures.find((n) => n.id === pair.startNodeId)
            ?.isUnderMaintenance ||
          nodeFixtures.find((n) => n.id === pair.endNodeId)?.isUnderMaintenance
        pair.isBlocked = Boolean(stillBlocked)
        pair.blockedReason = stillBlocked
          ? pair.blockedReason
          : null
      }
    })
    return mockRequest(undefined, 250)
  }

  await apiClient.post('/nodes/set_maintenance', {
    nodeId,
    isUnderMaintenance,
    maintenanceReason,
  })
}

export function useToggleNodeMaintenance() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: setMaintenance,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: nodeKeys.all })
      queryClient.invalidateQueries({ queryKey: ['dispatch'] })
    },
  })
}
