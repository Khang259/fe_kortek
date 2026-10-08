import { toast } from 'sonner'

import { useNodePairs } from '@/features/dispatch/api/get-node-pairs'
import {
  useUpdatePair,
  type UpdatePairInput,
} from '@/features/dispatch/api/pair-mutations'
import {
  usePairBulkEditStore,
  type PairEditDraft,
} from '@/features/dispatch/stores/pair-bulk-edit-store'
import type { NodePair } from '@/features/dispatch/types'
import { useConfigWriteGate } from '@/features/system/hooks/use-config-write-gate'

function buildPatch(
  draft: PairEditDraft,
  pair: NodePair,
): UpdatePairInput | null {
  const name = draft.name.trim()
  const patch: UpdatePairInput = { id: draft.id }

  if (name !== pair.name) {
    patch.name = name || pair.name
  }

  if (patch.name === undefined) {
    return null
  }
  return patch
}

/** Chế độ chỉnh sửa hàng loạt name → PATCH update_pair. */
export function usePairBulkEdit() {
  const { data: pairs = [] } = useNodePairs()
  const isEditing = usePairBulkEditStore((state) => state.isEditing)
  const drafts = usePairBulkEditStore((state) => state.drafts)
  const enterEdit = usePairBulkEditStore((state) => state.enterEdit)
  const exitEdit = usePairBulkEditStore((state) => state.exitEdit)
  const updatePair = useUpdatePair()
  const { canWriteConfig, gateMessage } = useConfigWriteGate()

  const startEdit = () => {
    enterEdit(pairs)
  }

  const cancelEdit = () => {
    exitEdit()
  }

  const saveEdit = () => {
    if (!canWriteConfig) {
      toast.warning(gateMessage)
      return
    }

    const byId = new Map(pairs.map((pair) => [pair.id, pair]))
    const patches = Object.values(drafts)
      .map((draft) => {
        const pair = byId.get(draft.id)
        if (!pair) {
          return null
        }
        return buildPatch(draft, pair)
      })
      .filter((item): item is UpdatePairInput => item !== null)

    if (patches.length === 0) {
      exitEdit()
      return
    }

    void (async () => {
      try {
        for (const patch of patches) {
          await updatePair.mutateAsync(patch)
        }
        exitEdit()
      } catch {
        /* isError trên mutation */
      }
    })()
  }

  return {
    isEditing,
    isSaving: updatePair.isPending,
    isError: updatePair.isError,
    canWriteConfig,
    startEdit,
    cancelEdit,
    saveEdit,
  }
}
