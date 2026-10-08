import { create } from 'zustand'

import { DEFAULT_PAGE_SIZE, FILTER_ALL } from '@/config/constants'
import type { CameraFilters } from '@/features/cameras/types'

interface CameraFilterState extends CameraFilters {
  page: number
  pageSize: number
  setSearch: (search: string) => void
  setZone: (zone: string) => void
  setStatus: (status: string) => void
  setPage: (page: number) => void
  setPageSize: (pageSize: number) => void
  reset: () => void
}

const initialFilters = {
  search: '',
  zone: FILTER_ALL,
  status: FILTER_ALL,
  page: 1,
  pageSize: DEFAULT_PAGE_SIZE,
}

export const useCameraFilterStore = create<CameraFilterState>((set) => ({
  ...initialFilters,
  setSearch: (search) => set({ search, page: 1 }),
  setZone: (zone) => set({ zone, page: 1 }),
  setStatus: (status) => set({ status, page: 1 }),
  setPage: (page) => set({ page }),
  setPageSize: (pageSize) => set({ pageSize, page: 1 }),
  reset: () => set(initialFilters),
}))
