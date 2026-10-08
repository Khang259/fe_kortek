import { create } from 'zustand'

import type { PriorityDraft } from '@/features/priority/types'
import type { WarehouseNode } from '@/types'

interface PriorityEditorState {
  isEditing: boolean
  drafts: Record<string, PriorityDraft>
  enterEdit: (nodes: WarehouseNode[]) => void
  exitEdit: () => void
  patchDraft: (nodeId: string, patch: Partial<PriorityDraft>) => void
}

export const usePriorityEditorStore = create<PriorityEditorState>((set) => ({
  isEditing: false,
  drafts: {},
  enterEdit: (nodes) =>
    set({
      isEditing: true,
      drafts: Object.fromEntries(
        nodes.map((node) => [node.id, { priority: node.priority }]),
      ),
    }),
  exitEdit: () => set({ isEditing: false, drafts: {} }),
  patchDraft: (nodeId, patch) =>
    set((state) => {
      const current = state.drafts[nodeId]
      if (!current) return state
      return {
        drafts: {
          ...state.drafts,
          [nodeId]: { ...current, ...patch },
        },
      }
    }),
}))
