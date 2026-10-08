import { create } from 'zustand'

import type {
  NodeRuntimeItem,
  NodeRuntimeSnapshot,
} from '@/features/nodes/types/runtime'
import { EMPTY_NODE_LOCK } from '@/features/nodes/utils/node-lock'

interface NodeRuntimeState {
  runtimeReady: boolean
  /** Map<nodeId, item> — filter zone/camera trên FE. */
  byId: Record<string, NodeRuntimeItem>
  /** true khi SSE đang lỗi → dựa poll include=nodes. */
  sseFailed: boolean
  replaceAll: (snapshot: NodeRuntimeSnapshot) => void
  upsert: (item: NodeRuntimeItem) => void
  patchLock: (
    nodeId: string,
    lock: Partial<NodeRuntimeItem['lock']>,
  ) => void
  setSseFailed: (failed: boolean) => void
}

export const useNodeRuntimeStore = create<NodeRuntimeState>((set) => ({
  runtimeReady: false,
  byId: {},
  sseFailed: false,

  replaceAll: (snapshot) => {
    const byId: Record<string, NodeRuntimeItem> = {}
    snapshot.items.forEach((item) => {
      byId[item.nodeId] = {
        ...item,
        lock: item.lock ?? { ...EMPTY_NODE_LOCK },
      }
    })
    set({ runtimeReady: snapshot.runtimeReady, byId })
  },

  upsert: (item) => {
    set((state) => ({
      byId: {
        ...state.byId,
        [item.nodeId]: {
          ...item,
          lock: item.lock ?? { ...EMPTY_NODE_LOCK },
        },
      },
    }))
  },

  patchLock: (nodeId, lock) => {
    set((state) => {
      const current = state.byId[nodeId]
      if (!current) {
        return state
      }
      return {
        byId: {
          ...state.byId,
          [nodeId]: {
            ...current,
            lock: { ...current.lock, ...lock },
          },
        },
      }
    })
  },

  setSseFailed: (sseFailed) => set({ sseFailed }),
}))
