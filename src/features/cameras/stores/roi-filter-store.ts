import { create } from 'zustand'

import { DEFAULT_PAGE_SIZE, FILTER_ALL } from '@/config/constants'

interface RoiFilterState {
  cameraSearch: string
  zone: string
  nodeSearch: string
  page: number
  pageSize: number
  setCameraSearch: (value: string) => void
  setZone: (zone: string) => void
  setNodeSearch: (value: string) => void
  setPage: (page: number) => void
  setPageSize: (pageSize: number) => void
}

export const useRoiFilterStore = create<RoiFilterState>((set) => ({
  cameraSearch: '',
  zone: FILTER_ALL,
  nodeSearch: '',
  page: 1,
  pageSize: DEFAULT_PAGE_SIZE,
  setCameraSearch: (cameraSearch) => set({ cameraSearch, page: 1 }),
  setZone: (zone) => set({ zone, page: 1 }),
  setNodeSearch: (nodeSearch) => set({ nodeSearch, page: 1 }),
  setPage: (page) => set({ page }),
  setPageSize: (pageSize) => set({ pageSize, page: 1 }),
}))
