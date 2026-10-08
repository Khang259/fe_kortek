import { create } from 'zustand'

export interface LogPayloadSection {
  label: string
  data: unknown
}

export interface LogPayload {
  title: string
  sections: LogPayloadSection[]
  /**
   * orderId Single sau dispatch OK → dialog gọi get_by_order + get_image.
   * undefined = không hiện khối ảnh.
   */
  snapshotOrderId?: string
  /** undefined = không hiện. null = khối ảnh trống. Ưu tiên thấp hơn snapshotOrderId. */
  snapshotUrl?: string | null
}

interface LogPayloadState {
  /** null = dialog đóng. */
  payload: LogPayload | null
  open: (payload: LogPayload) => void
  close: () => void
}

/**
 * Dialog xem payload dùng chung cho cả log hệ thống (request/response)
 * và log người dùng (dữ liệu thay đổi) — chỉ khác danh sách section.
 */
export const useLogPayloadStore = create<LogPayloadState>((set) => ({
  payload: null,
  open: (payload) => set({ payload }),
  close: () => set({ payload: null }),
}))
