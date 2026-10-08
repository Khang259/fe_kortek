import { queryOptions, useQuery } from '@tanstack/react-query'

import { dispatchKeys } from '@/features/dispatch/api/get-active-tasks'
import type { NodePair } from '@/features/dispatch/types'
import { fetchList } from '@/lib/api-request'
import { nodePairFixtures } from '@/testing/fixtures/dispatch'

/** `GET /pairs/get_pairs` — không filter `?zoneId=` (pair xuyên zone). */
const getPairs = () =>
  fetchList<NodePair>('/pairs/get_pairs', nodePairFixtures)

export const nodePairsQueryOptions = () =>
  queryOptions({
    queryKey: dispatchKeys.pairs(),
    queryFn: getPairs,
  })

export const useNodePairs = () => useQuery(nodePairsQueryOptions())
