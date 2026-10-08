import type { ApiError } from '@/types'
import { useInferenceStore } from '@/features/zones/stores/inference-store'

export const INFERENCE_GATE_MESSAGE =
  'Pause inference before editing config (pause-scan / stop)'

/** 409 khi inference đang chạy (isReady). */
export function assertInferencePaused() {
  if (useInferenceStore.getState().isReady) {
    const error: ApiError = {
      status: 409,
      message: INFERENCE_GATE_MESSAGE,
    }
    throw error
  }
}

/** Hook UI: chặn Save khi inference đang chạy. */
export function useConfigWriteGate() {
  const isReady = useInferenceStore((state) => state.isReady)
  return {
    /** true = đang inference → không được ghi cấu hình. */
    inferenceRunning: isReady,
    canWriteConfig: !isReady,
    gateMessage: INFERENCE_GATE_MESSAGE,
  }
}
