import { toast } from 'sonner'

import { useCameras } from '@/features/cameras/api/get-cameras'
import {
  useUpdateCamera,
  type UpdateCameraInput,
  type UpdateCameraResult,
} from '@/features/cameras/api/update-camera'
import {
  useCameraBulkEditStore,
  type CameraEditDraft,
} from '@/features/cameras/stores/camera-bulk-edit-store'
import type { Camera } from '@/features/cameras/types'
import { useNodes } from '@/features/nodes'
import {
  isStartNodeId,
  validateNewStartPriorities,
} from '@/features/nodes/utils/node-priority'
import { useConfigWriteGate } from '@/features/system/hooks/use-config-write-gate'

function parseObservedNodeIds(text: string) {
  return text
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
}

function sameNodeIds(a: string[], b: string[]) {
  if (a.length !== b.length) {
    return false
  }
  return a.every((id, index) => id === b[index])
}

function buildPatch(
  draft: CameraEditDraft,
  camera: Camera,
): UpdateCameraInput | null {
  const patch: UpdateCameraInput = { cameraId: draft.cameraId }
  const name = draft.name.trim()
  const rtspUrl = draft.rtspUrl.trim()
  const zone = draft.zone.trim().toUpperCase()
  const observedNodeIds = parseObservedNodeIds(draft.observedNodeIdsText)

  if (name !== camera.name) {
    patch.name = name
  }
  if (rtspUrl !== camera.rtspUrl) {
    patch.rtspUrl = rtspUrl
  }
  if (zone !== camera.zone) {
    patch.zone = zone
  }
  if (!sameNodeIds(observedNodeIds, camera.observedNodeIds)) {
    patch.observedNodeIds = observedNodeIds
  }

  if (
    patch.name === undefined &&
    patch.rtspUrl === undefined &&
    patch.zone === undefined &&
    patch.observedNodeIds === undefined
  ) {
    return null
  }
  return patch
}

/**
 * Chế độ chỉnh sửa bảng camera → mỗi hàng đổi gọi `PATCH update_camera`.
 * Gỡ observedNodeIds = xóa cascade node/ROI/pairs — confirm trước khi Save.
 */
export function useCameraBulkEdit() {
  const { data: cameras = [] } = useCameras()
  const { data: nodes = [] } = useNodes()
  const isEditing = useCameraBulkEditStore((state) => state.isEditing)
  const drafts = useCameraBulkEditStore((state) => state.drafts)
  const enterEdit = useCameraBulkEditStore((state) => state.enterEdit)
  const exitEdit = useCameraBulkEditStore((state) => state.exitEdit)
  const updateCamera = useUpdateCamera()
  const { canWriteConfig, gateMessage } = useConfigWriteGate()

  const startEdit = () => {
    enterEdit(cameras)
  }

  const cancelEdit = () => {
    exitEdit()
  }

  const saveEdit = () => {
    if (!canWriteConfig) {
      toast.warning(gateMessage)
      return
    }

    const byId = new Map(cameras.map((camera) => [camera.cameraId, camera]))
    const patches = Object.values(drafts)
      .map((draft) => {
        const camera = byId.get(draft.cameraId)
        if (!camera) {
          return null
        }
        return buildPatch(draft, camera)
      })
      .filter((item): item is UpdateCameraInput => item !== null)

    if (patches.length === 0) {
      exitEdit()
      return
    }

    for (const patch of patches) {
      if (!patch.observedNodeIds) {
        continue
      }
      const zone =
        patch.zone ??
        byId.get(patch.cameraId)?.zone ??
        ''
      const newStartIds = patch.observedNodeIds.filter(
        (id) =>
          isStartNodeId(id) && !nodes.some((node) => node.id === id),
      )
      try {
        validateNewStartPriorities({
          newStartIds,
          nodePriorities: patch.nodePriorities,
          zoneId: zone,
          existingNodes: nodes,
        })
      } catch (message) {
        toast.error(String(message))
        return
      }
    }

    const removals = patches.flatMap((patch) => {
      if (!patch.observedNodeIds) {
        return []
      }
      const camera = byId.get(patch.cameraId)
      if (!camera) {
        return []
      }
      return camera.observedNodeIds.filter(
        (id) => !patch.observedNodeIds!.includes(id),
      )
    })

    if (removals.length > 0) {
      const ok = window.confirm(
        `Remove ${removals.length} node(s) from observed?\n` +
          `${removals.join(', ')}\n\n` +
          `This DELETES the node + ROI and cascades all related pairs.`,
      )
      if (!ok) {
        return
      }
    }

    void (async () => {
      try {
        const results: UpdateCameraResult[] = []
        for (const patch of patches) {
          results.push(await updateCamera.mutateAsync(patch))
        }
        exitEdit()
        return results
      } catch (error) {
        console.error('[Camera config] Update failed', error)
      }
    })()
  }

  return {
    isEditing,
    isSaving: updateCamera.isPending,
    isError: updateCamera.isError,
    lastError: updateCamera.error,
    canWriteConfig,
    startEdit,
    cancelEdit,
    saveEdit,
  }
}
