import { useNodeRuntimeStore } from '@/features/nodes/stores/node-runtime-store'
import type { NodeRuntimeItem } from '@/features/nodes/types/runtime'

/** Đọc 1 item runtime theo nodeId (SSE / snapshot). */
export function useNodeRuntimeItem(
  nodeId: string,
): NodeRuntimeItem | undefined {
  return useNodeRuntimeStore((state) => state.byId[nodeId])
}

export function useNodeRuntimeReady() {
  return useNodeRuntimeStore((state) => state.runtimeReady)
}

export function useNodeRuntimeSseFailed() {
  return useNodeRuntimeStore((state) => state.sseFailed)
}
