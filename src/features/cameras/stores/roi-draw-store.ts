import { create } from 'zustand'

interface RoiDrawState {
  /** null = dialog vẽ đang đóng. ROI giờ chỉnh theo camera, không theo từng ROI. */
  cameraId: number | null
  open: (cameraId: number) => void
  close: () => void
}

export const useRoiDrawStore = create<RoiDrawState>((set) => ({
  cameraId: null,
  open: (cameraId) => set({ cameraId }),
  close: () => set({ cameraId: null }),
}))
