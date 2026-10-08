import { create } from 'zustand'

interface SystemPowerState {
  /**
   * Công tắc fleet (nút Khởi động / Dừng camera) — hydrate từ `isRunning`,
   * sync sau start_all / stop_all (kể cả 503 đã bật enabled).
   * Badge live topbar dùng `isStreaming` — không dùng field này.
   * Toggle từng zone / poll **không** đụng field này.
   */
  fleetActive: boolean
  setFleetActive: (active: boolean) => void
  /** true khi start_all/stop_all đang chạy — poll không patch isRunning/isStreaming. */
  fleetMutationPending: boolean
  setFleetMutationPending: (pending: boolean) => void
}

export const useSystemPowerStore = create<SystemPowerState>((set) => ({
  fleetActive: false,
  setFleetActive: (fleetActive) => set({ fleetActive }),
  fleetMutationPending: false,
  setFleetMutationPending: (fleetMutationPending) => set({ fleetMutationPending }),
}))
