import { create } from 'zustand'

import { DEFAULT_PAGE_SIZE, FILTER_ALL } from '@/config/constants'

/** FILTER_ALL | 'locked' | 'unlocked' */
export type MaintenanceLockFilter = typeof FILTER_ALL | 'locked' | 'unlocked'

interface MaintenanceListPaginationState {
  /** Lọc theo trạng thái lock (filter = bộ lọc danh sách). */
  lockFilter: MaintenanceLockFilter
  page: number
  pageSize: number
  setLockFilter: (lockFilter: MaintenanceLockFilter) => void
  setPage: (page: number) => void
  setPageSize: (pageSize: number) => void
}

export const useMaintenanceListPaginationStore =
  create<MaintenanceListPaginationState>((set) => ({
    lockFilter: FILTER_ALL,
    page: 1,
    pageSize: DEFAULT_PAGE_SIZE,
    setLockFilter: (lockFilter) => set({ lockFilter, page: 1 }),
    setPage: (page) => set({ page }),
    setPageSize: (pageSize) => set({ pageSize, page: 1 }),
  }))
