import { create } from 'zustand'

import { FILTER_ALL } from '@/config/constants'

interface LogFilterState {
  /** FILTER_ALL | 'success' | 'failed' */
  result: string
  /** FILTER_ALL | 'dispatch' | 'unlock_by_order_status' — system tab. */
  action: string
  /** Định dạng của input datetime-local: 'YYYY-MM-DDTHH:mm'. '' = không lọc. */
  from: string
  to: string
  page: number
  pageSize: number
  setResult: (result: string) => void
  setAction: (action: string) => void
  setFrom: (from: string) => void
  setTo: (to: string) => void
  setPage: (page: number) => void
  setPageSize: (pageSize: number) => void
  resetTimeRange: () => void
}

export const useLogFilterStore = create<LogFilterState>((set) => ({
  result: FILTER_ALL,
  action: FILTER_ALL,
  from: '',
  to: '',
  page: 1,
  /** Khớp mặc định API đợt 4 (pageSize=20). */
  pageSize: 20,

  /**
   * Mọi thay đổi bộ lọc đều đưa page về 1. Nếu không, người dùng đang ở
   * trang 3 mà lọc còn 5 bản ghi sẽ thấy bảng trống dù dữ liệu vẫn có.
   */
  setResult: (result) => set({ result, page: 1 }),
  setAction: (action) => set({ action, page: 1 }),
  setFrom: (from) => set({ from, page: 1 }),
  setTo: (to) => set({ to, page: 1 }),
  setPageSize: (pageSize) => set({ pageSize, page: 1 }),
  setPage: (page) => set({ page }),
  resetTimeRange: () => set({ from: '', to: '', page: 1 }),
}))
