import { cameraRoiFixtures } from '@/testing/fixtures/cameras'
import { nodePairFixtures } from '@/testing/fixtures/dispatch'
import { nodeFixtures } from '@/testing/fixtures/nodes'

/**
 * Cascade xóa node: ROI + pairs chứa node → xóa node.
 * Dùng chung cho delete_roi (chỉ ROI+pairs), update_camera gỡ observed, delete_camera.
 */
export function cascadeDeleteNode(nodeId: string): {
  roiDeleted: number
  pairsDeleted: number
  nodeDeleted: boolean
} {
  let roiDeleted = 0
  for (let i = cameraRoiFixtures.length - 1; i >= 0; i -= 1) {
    if (cameraRoiFixtures[i].nodeId === nodeId) {
      cameraRoiFixtures.splice(i, 1)
      roiDeleted += 1
    }
  }

  let pairsDeleted = 0
  for (let i = nodePairFixtures.length - 1; i >= 0; i -= 1) {
    const pair = nodePairFixtures[i]
    if (pair.startNodeId === nodeId || pair.endNodeId === nodeId) {
      nodePairFixtures.splice(i, 1)
      pairsDeleted += 1
    }
  }

  const nodeIndex = nodeFixtures.findIndex((item) => item.id === nodeId)
  let nodeDeleted = false
  if (nodeIndex >= 0) {
    nodeFixtures.splice(nodeIndex, 1)
    nodeDeleted = true
  }

  return { roiDeleted, pairsDeleted, nodeDeleted }
}

/** Cascade xóa ROI: xóa pairs chứa node của ROI (node giữ lại). */
export function cascadeDeleteRoiByNodeId(nodeId: string): number {
  let pairsDeleted = 0
  for (let i = nodePairFixtures.length - 1; i >= 0; i -= 1) {
    const pair = nodePairFixtures[i]
    if (pair.startNodeId === nodeId || pair.endNodeId === nodeId) {
      nodePairFixtures.splice(i, 1)
      pairsDeleted += 1
    }
  }
  return pairsDeleted
}
