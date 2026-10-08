import { create } from 'zustand'

import { DEFAULT_PAGE_SIZE, FILTER_ALL } from '@/config/constants'

interface PairListFilterState {
  search: string
  zone: string
  /** FILTER_ALL | 'enabled' | 'disabled' */
  status: string
  page: number
  pageSize: number
  setSearch: (search: string) => void
  setZone: (zone: string) => void
  setStatus: (status: string) => void
  setPage: (page: number) => void
  setPageSize: (pageSize: number) => void
}

export const usePairListFilterStore = create<PairListFilterState>((set) => ({
  search: '',
  zone: FILTER_ALL,
  status: FILTER_ALL,
  page: 1,
  pageSize: DEFAULT_PAGE_SIZE,
  setSearch: (search) => set({ search, page: 1 }),
  setZone: (zone) => set({ zone, page: 1 }),
  setStatus: (status) => set({ status, page: 1 }),
  setPage: (page) => set({ page }),
  setPageSize: (pageSize) => set({ pageSize, page: 1 }),
}))
