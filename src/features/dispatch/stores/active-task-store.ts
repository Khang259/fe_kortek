import { useMemo } from 'react'
import { create } from 'zustand'

import type { ActiveTask } from '@/features/dispatch/types'
import { compareActiveTasks } from '@/features/dispatch/utils/active-task-status'

interface ActiveTaskState {
  byOrderId: Record<string, ActiveTask>
  isHydrated: boolean
  isHydrateError: boolean
  replaceAll: (tasks: ActiveTask[]) => void
  upsert: (task: ActiveTask) => void
  remove: (orderId: string) => void
  setHydrateError: (failed: boolean) => void
  clear: () => void
}

export const useActiveTaskStore = create<ActiveTaskState>((set) => ({
  byOrderId: {},
  isHydrated: false,
  isHydrateError: false,

  replaceAll: (tasks) =>
    set({
      byOrderId: Object.fromEntries(tasks.map((task) => [task.orderId, task])),
      isHydrated: true,
      isHydrateError: false,
    }),

  upsert: (task) =>
    set((state) => ({
      byOrderId: { ...state.byOrderId, [task.orderId]: task },
    })),

  remove: (orderId) =>
    set((state) => {
      if (!(orderId in state.byOrderId)) {
        return state
      }
      const next = { ...state.byOrderId }
      delete next[orderId]
      return { byOrderId: next }
    }),

  setHydrateError: (isHydrateError) => set({ isHydrateError }),

  clear: () =>
    set((state) => {
      if (
        !state.isHydrated &&
        !state.isHydrateError &&
        Object.keys(state.byOrderId).length === 0
      ) {
        return state
      }
      return { byOrderId: {}, isHydrated: false, isHydrateError: false }
    }),
}))

/**
 * Sort ngoài selector — tránh `Object.values().sort()` tạo mảng mới mỗi
 * getSnapshot (useSyncExternalStore → Maximum update depth exceeded).
 */
export function useSortedActiveTasks(): ActiveTask[] {
  const byOrderId = useActiveTaskStore((state) => state.byOrderId)
  return useMemo(
    () => Object.values(byOrderId).sort(compareActiveTasks),
    [byOrderId],
  )
}
