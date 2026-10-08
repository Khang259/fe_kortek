export const runtimeKeys = {
  all: ['runtime'] as const,
  status: () => [...runtimeKeys.all, 'status'] as const,
  pendingPairs: () => [...runtimeKeys.all, 'pending-pairs'] as const,
}

export interface RuntimeStatus {
  /** true = start-scan / inference đang chạy. */
  ready: boolean
  message?: string
  /**
   * false = get_status không có field nhận diện được → **không** ghi đè store.
   * Tránh poll làm UI nhảy Scan ↔ Pause sai.
   */
  known: boolean
}

export interface ReloadRuntimeResult {
  reloaded: boolean
  message?: string
}
