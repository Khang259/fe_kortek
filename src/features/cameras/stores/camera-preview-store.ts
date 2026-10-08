import { create } from 'zustand'

interface CameraPreviewState {
  /** null = dialog đóng. */
  cameraId: number | null
  open: (cameraId: number) => void
  close: () => void
}

export const useCameraPreviewStore = create<CameraPreviewState>((set) => ({
  cameraId: null,
  open: (cameraId) => set({ cameraId }),
  close: () => set({ cameraId: null }),
}))
