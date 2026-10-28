import { useEffect, useState } from 'react'

import type { CameraRoi, RoiBox, RoiDraft } from '@/features/cameras/types'

const toDrafts = (rois: CameraRoi[]): RoiDraft[] =>
  rois.map((roi) => ({
    key: roi.id,
    id: roi.id,
    nodeId: roi.nodeId,
    box: roi.box,
  }))

/** Key ổn định cho draft mới — không dùng index (lệch khi xoá giữa list).
 *  Fallback vì randomUUID chỉ có trên secure context (HTTPS/localhost), không có trên HTTP+IP LAN. */
const newDraftKey = () =>
  globalThis.crypto?.randomUUID?.() ??
  `roi-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`

/** Quản lý danh sách ROI đang chỉnh của một camera. */
export function useRoiDrafts(existingRois: CameraRoi[]) {
  const [drafts, setDrafts] = useState<RoiDraft[]>(() => toDrafts(existingRois))
  const seed = existingRois.map((roi) => `${roi.id}:${roi.box.join()}`).join('|')

  useEffect(() => {
    setDrafts(toDrafts(existingRois))
    // Chỉ reset khi dữ liệu server đổi — không phụ thuộc reference mảng.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seed])

  const add = (box: RoiBox) => {
    setDrafts((current) => [
      ...current,
      { key: newDraftKey(), id: null, nodeId: '', box },
    ])
  }

  const remove = (key: string) => {
    setDrafts((current) => current.filter((draft) => draft.key !== key))
  }

  const setNodeId = (key: string, nodeId: string) => {
    setDrafts((current) =>
      current.map((draft) =>
        draft.key === key ? { ...draft, nodeId } : draft,
      ),
    )
  }

  return {
    drafts,
    add,
    remove,
    setNodeId,
    reset: () => setDrafts(toDrafts(existingRois)),
    /** Chặn lưu khi còn ROI chưa gán node — backend không biết vùng đó thuộc điểm nào. */
    hasUnassigned: drafts.some((draft) => draft.nodeId === ''),
  }
}
