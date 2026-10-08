import type { ActiveTask } from '@/features/dispatch/types'

/** @see docs/fe-api-active-tasks.md */
export const activeTaskFixtures: ActiveTask[] = [
  {
    orderId: 'S-10000071-10000770-2026-10-03 09:52:00.000001',
    startNodeId: 'start_10000071',
    endNodeId: 'end_10000770',
    priorityStart: 1,
    status: 'inprogress',
  },
  {
    orderId: 'S-10000061-10000761-2026-10-03 09:51:33.123456',
    startNodeId: 'start_10000061',
    endNodeId: 'end_10000761',
    priorityStart: 2,
    status: 'issued',
  },
  {
    orderId: 'S-10000060-10000760-2026-10-03 09:50:00.000000',
    startNodeId: 'start_10000060',
    endNodeId: 'end_10000760',
    priorityStart: 1,
    status: 'issued',
  },
  {
    orderId: 'S-10000070-10000770-2026-10-03 09:49:00.000000',
    startNodeId: 'start_10000070',
    endNodeId: 'end_10000770',
    priorityStart: 3,
    status: 'inprogress',
  },
  {
    orderId: 'S-10000062-10000761-2026-10-03 09:48:00.000000',
    startNodeId: 'start_10000062',
    endNodeId: 'end_10000761',
    priorityStart: null,
    status: 'issued',
  },
]
