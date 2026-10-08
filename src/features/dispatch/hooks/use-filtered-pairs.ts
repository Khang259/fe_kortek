import { useMemo } from 'react'

import { FILTER_ALL } from '@/config/constants'
import { useNodePairs } from '@/features/dispatch/api/get-node-pairs'
import { usePairListFilterStore } from '@/features/dispatch/stores/pair-list-filter-store'
import { useNodes } from '@/features/nodes'
import { buildListPagination } from '@/lib/list-pagination'
import { useDebounce } from '@/hooks/use-debounce'

/** Lọc + phân trang client-side. Zone filter theo zone của start/end node. */
export function useFilteredPairs() {
  const query = useNodePairs()
  const { data: nodes = [] } = useNodes()
  const search = usePairListFilterStore((state) => state.search)
  const zone = usePairListFilterStore((state) => state.zone)
  const status = usePairListFilterStore((state) => state.status)
  const page = usePairListFilterStore((state) => state.page)
  const pageSize = usePairListFilterStore((state) => state.pageSize)
  const setPage = usePairListFilterStore((state) => state.setPage)
  const setPageSize = usePairListFilterStore((state) => state.setPageSize)

  const debouncedSearch = useDebounce(search)

  const zoneByNodeId = useMemo(
    () => new Map(nodes.map((node) => [node.id, node.zoneId])),
    [nodes],
  )

  const filtered = useMemo(() => {
    const keyword = debouncedSearch.trim().toLowerCase()

    return (query.data ?? []).filter((pair) => {
      if (zone !== FILTER_ALL) {
        const startZone = zoneByNodeId.get(pair.startNodeId)
        const endZone =
          pair.endNodeId === '_'
            ? undefined
            : zoneByNodeId.get(pair.endNodeId)
        if (startZone !== zone && endZone !== zone) {
          return false
        }
      }
      if (status === 'enabled' && !pair.enabled) {
        return false
      }
      if (status === 'disabled' && pair.enabled) {
        return false
      }
      if (!keyword) {
        return true
      }
      return (
        pair.name.toLowerCase().includes(keyword) ||
        pair.id.toLowerCase().includes(keyword) ||
        pair.startNodeId.toLowerCase().includes(keyword) ||
        pair.endNodeId.toLowerCase().includes(keyword)
      )
    })
  }, [query.data, debouncedSearch, zone, status, zoneByNodeId])

  const pagination = buildListPagination(
    filtered.length,
    page,
    pageSize,
    setPage,
    setPageSize,
  )

  return {
    pairs: filtered.slice(pagination.startIndex, pagination.endIndex),
    pagination,
    isPending: query.isPending,
    isError: query.isError,
  }
}
