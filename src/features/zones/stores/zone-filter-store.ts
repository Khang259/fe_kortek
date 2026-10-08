import { create } from 'zustand'

import { FILTER_ALL } from '@/config/constants'

interface ZoneFilterState {
  /** FILTER_ALL | 'running' | 'stopped' */
  status: string
  setStatus: (status: string) => void
}

export const useZoneFilterStore = create<ZoneFilterState>((set) => ({
  status: FILTER_ALL,
  setStatus: (status) => set({ status }),
}))
