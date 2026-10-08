import { create } from 'zustand'

interface InferenceState {
  /** true = đã confirm ready / inference đang chạy. */
  isReady: boolean
  setReady: (ready: boolean) => void
}

export const useInferenceStore = create<InferenceState>((set) => ({
  isReady: false,
  setReady: (isReady) => set({ isReady }),
}))
