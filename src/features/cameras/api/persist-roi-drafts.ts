import { useMutation, useQueryClient } from '@tanstack/react-query'

import {
  useCreateRoi,
  useDeleteRoi,
  useUpdateRoi,
  type UpdateRoiItem,
} from '@/features/cameras/api/roi-mutations'
import { cameraKeys } from '@/features/cameras/api/get-cameras'
import type { CameraRoi, RoiBox, RoiDraft } from '@/features/cameras/types'

interface PersistRoiDraftsInput {
  cameraId: number
  initialRois: CameraRoi[]
  drafts: RoiDraft[]
}

function boxesEqual(a: RoiBox, b: RoiBox) {
  return a[0] === b[0] && a[1] === b[1] && a[2] === b[2] && a[3] === b[3]
}

/**
 * Diff theo `nodeId` (id ROI = cameraId:nodeId):
 * - node biến mất khỏi draft → delete
 * - node mới → create
 * - cùng node, box đổi → gom **một** PATCH `update_roi` batch
 */
export async function persistRoiDrafts(
  { cameraId, initialRois, drafts }: PersistRoiDraftsInput,
  api: {
    create: (input: {
      cameraId: number
      nodeId: string
      box: RoiBox
    }) => Promise<unknown>
    updateBatch: (items: UpdateRoiItem[]) => Promise<unknown>
    remove: (input: { id: string }) => Promise<unknown>
  },
) {
  const desiredNodeIds = new Set(
    drafts.map((draft) => draft.nodeId).filter(Boolean),
  )

  for (const roi of initialRois) {
    if (!desiredNodeIds.has(roi.nodeId)) {
      await api.remove({ id: roi.id })
    }
  }

  const updates: UpdateRoiItem[] = []

  for (const draft of drafts) {
    if (!draft.nodeId) {
      continue
    }

    const existing = initialRois.find((roi) => roi.nodeId === draft.nodeId)
    if (!existing) {
      await api.create({
        cameraId,
        nodeId: draft.nodeId,
        box: draft.box,
      })
      continue
    }

    if (!boxesEqual(existing.box, draft.box)) {
      updates.push({ id: existing.id, box: draft.box })
    }
  }

  if (updates.length > 0) {
    await api.updateBatch(updates)
  }
}

export function usePersistRoiDrafts() {
  const createRoi = useCreateRoi()
  const updateRoi = useUpdateRoi()
  const deleteRoi = useDeleteRoi()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: PersistRoiDraftsInput) =>
      persistRoiDrafts(input, {
        create: (payload) => createRoi.mutateAsync(payload),
        updateBatch: (items) => updateRoi.mutateAsync({ items }),
        remove: (payload) => deleteRoi.mutateAsync(payload),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: cameraKeys.all })
    },
  })
}
