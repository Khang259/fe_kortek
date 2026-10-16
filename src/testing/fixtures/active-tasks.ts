import type { ActiveTask } from '@/features/dispatch/types'

/** @see docs/fe-api-active-tasks.md */
export const activeTaskFixtures: ActiveTask[] = [
  {
    orderId: 'S-10000004-10000105-2026-10-03 09:52:00.000001',
    startNodeId: 'start_10000004',
    endNodeId: 'end_10000105',
    priorityStart: 1,
    status: 'inprogress',
  },
  {
    orderId: 'S-10000010-10000105-2026-10-03 09:51:33.123456',
    startNodeId: 'start_10000010',
    endNodeId: 'end_10000105',
    priorityStart: 6,
    status: 'issued',
  },
  {
    orderId: 'S-10000068-10000106-2026-10-03 09:50:00.000000',
    startNodeId: 'start_10000068',
    endNodeId: 'end_10000106',
    priorityStart: 19,
    status: 'issued',
  },
  {
    orderId: 'S-10000085-10000105-2026-10-03 09:49:00.000000',
    startNodeId: 'start_10000085',
    endNodeId: 'end_10000105',
    priorityStart: 11,
    status: 'inprogress',
  },
]
