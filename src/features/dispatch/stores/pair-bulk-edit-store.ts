import { create } from 'zustand'

import type { NodePair } from '@/features/dispatch/types'

export interface PairEditDraft {
  id: string
  name: string
}

interface PairBulkEditState {
  isEditing: boolean
  drafts: Record<string, PairEditDraft>
  enterEdit: (pairs: NodePair[]) => void
  exitEdit: () => void
  patchDraft: (
    id: string,
    patch: Partial<Omit<PairEditDraft, 'id'>>,
  ) => void
}

function toDraft(pair: NodePair): PairEditDraft {
  return {
    id: pair.id,
    name: pair.name,
  }
}

export const usePairBulkEditStore = create<PairBulkEditState>((set) => ({
  isEditing: false,
  drafts: {},

  enterEdit: (pairs) =>
    set({
      isEditing: true,
      drafts: Object.fromEntries(
        pairs.map((pair) => [pair.id, toDraft(pair)]),
      ),
    }),

  exitEdit: () => set({ isEditing: false, drafts: {} }),

  patchDraft: (id, patch) =>
    set((state) => {
      const current = state.drafts[id]
      if (!current) {
        return state
      }
      return {
        drafts: {
          ...state.drafts,
          [id]: { ...current, ...patch },
        },
      }
    }),
}))
