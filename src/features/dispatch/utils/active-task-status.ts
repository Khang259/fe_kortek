import type { ActiveTask } from '@/features/dispatch/types'
import type { StatusTone } from '@/types'

export const activeTaskStatusLabels: Record<ActiveTask['status'], string> = {
  issued: 'Issued',
  inprogress: 'In progress',
}

export const activeTaskStatusTones: Record<ActiveTask['status'], StatusTone> = {
  issued: 'purple',
  inprogress: 'success',
}

const priorityItemClasses: Record<number, string> = {
  1: 'min-h-12 gap-2 px-3 py-2.5',
  2: 'min-h-11 gap-2 px-2.5 py-2',
  3: 'min-h-10 gap-1.5 px-2 py-1.5',
  4: 'min-h-9 gap-1.5 px-2 py-1',
  5: 'min-h-8 gap-1 px-1.5 py-1',
}

/** Kích thước item theo priorityStart (1 lớn nhất; null → nhỏ nhất). */
export function activeTaskPriorityItemClasses(
  priorityStart: number | null,
) {
  if (priorityStart == null || !Number.isFinite(priorityStart)) {
    return priorityItemClasses[5]
  }
  const level = Math.max(1, Math.min(5, Math.round(priorityStart)))
  return priorityItemClasses[level]
}

/** Sort: priorityStart ASC (null cuối), tie → orderId. */
export function compareActiveTasks(a: ActiveTask, b: ActiveTask) {
  const pa = a.priorityStart
  const pb = b.priorityStart
  if (pa == null && pb == null) {
    return a.orderId.localeCompare(b.orderId)
  }
  if (pa == null) {
    return 1
  }
  if (pb == null) {
    return -1
  }
  if (pa !== pb) {
    return pa - pb
  }
  return a.orderId.localeCompare(b.orderId)
}
