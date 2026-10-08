import { create } from 'zustand'

import type { Camera } from '@/features/cameras/types'

/** Bản nháp một hàng khi Chỉnh sửa. */
export interface CameraEditDraft {
  cameraId: number
  name: string
  rtspUrl: string
  zone: string
  /** nodeId cách nhau bởi dấu phẩy. */
  observedNodeIdsText: string
}

interface CameraBulkEditState {
  isEditing: boolean
  drafts: Record<number, CameraEditDraft>
  enterEdit: (cameras: Camera[]) => void
  exitEdit: () => void
  patchDraft: (
    cameraId: number,
    patch: Partial<Omit<CameraEditDraft, 'cameraId'>>,
  ) => void
}

function toDraft(camera: Camera): CameraEditDraft {
  return {
    cameraId: camera.cameraId,
    name: camera.name,
    rtspUrl: camera.rtspUrl,
    zone: camera.zone,
    observedNodeIdsText: camera.observedNodeIds.join(', '),
  }
}

export const useCameraBulkEditStore = create<CameraBulkEditState>((set) => ({
  isEditing: false,
  drafts: {},

  enterEdit: (cameras) =>
    set({
      isEditing: true,
      drafts: Object.fromEntries(
        cameras.map((camera) => [camera.cameraId, toDraft(camera)]),
      ),
    }),

  exitEdit: () => set({ isEditing: false, drafts: {} }),

  patchDraft: (cameraId, patch) =>
    set((state) => {
      const current = state.drafts[cameraId]
      if (!current) {
        return state
      }
      return {
        drafts: {
          ...state.drafts,
          [cameraId]: { ...current, ...patch },
        },
      }
    }),
}))
