import type { NodeRuntimeSnapshot } from '@/features/nodes/types/runtime'
import { nodeFixtures } from '@/testing/fixtures/nodes'

/** Mock snapshot runtime — map từ nodeFixtures (state cargo ≈ detected). */
export function nodeRuntimeSnapshotFixture(): NodeRuntimeSnapshot {
  return {
    runtimeReady: true,
    items: nodeFixtures.map((node) => ({
      nodeId: node.id,
      detected: node.state === 'cargo',
      isReady: node.state === 'clear' || node.state === 'cargo',
      lock: { ...node.lock },
    })),
  }
}
