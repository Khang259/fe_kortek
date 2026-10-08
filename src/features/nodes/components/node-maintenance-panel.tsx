import { Wrench } from 'lucide-react'
import { useMemo } from 'react'

import { FilterSelect } from '@/components/common/filter-select'
import { PaginationBar } from '@/components/common/pagination-bar'
import { Panel } from '@/components/common/panel'
import { QueryState } from '@/components/common/query-state'
import { FILTER_ALL } from '@/config/constants'
import { useNodes } from '@/features/nodes/api/get-nodes'
import { NodeMaintenanceRow } from '@/features/nodes/components/node-maintenance-row'
import {
  useMaintenanceListPaginationStore,
  type MaintenanceLockFilter,
} from '@/features/nodes/stores/maintenance-list-pagination-store'
import { useNodeRuntimeStore } from '@/features/nodes/stores/node-runtime-store'
import { isNodeLocked } from '@/features/nodes/utils/node-lock'
import { buildListPagination } from '@/lib/list-pagination'

const lockFilterOptions = [
  { label: 'All locks', value: FILTER_ALL },
  { label: 'Locked', value: 'locked' },
  { label: 'Unlocked', value: 'unlocked' },
]

export function NodeMaintenancePanel() {
  const { data: nodes = [], isPending, isError } = useNodes()
  const runtimeById = useNodeRuntimeStore((state) => state.byId)
  const lockFilter = useMaintenanceListPaginationStore(
    (state) => state.lockFilter,
  )
  const page = useMaintenanceListPaginationStore((state) => state.page)
  const pageSize = useMaintenanceListPaginationStore((state) => state.pageSize)
  const setLockFilter = useMaintenanceListPaginationStore(
    (state) => state.setLockFilter,
  )
  const setPage = useMaintenanceListPaginationStore((state) => state.setPage)
  const setPageSize = useMaintenanceListPaginationStore(
    (state) => state.setPageSize,
  )

  const filteredNodes = useMemo(() => {
    if (lockFilter === FILTER_ALL) return nodes
    return nodes.filter((node) => {
      const lock = runtimeById[node.id]?.lock ?? node.lock
      const locked = isNodeLocked(lock)
      return lockFilter === 'locked' ? locked : !locked
    })
  }, [lockFilter, nodes, runtimeById])

  const maintenanceCount = nodes.filter(
    (node) => node.isUnderMaintenance,
  ).length

  const pagination = buildListPagination(
    filteredNodes.length,
    page,
    pageSize,
    setPage,
    setPageSize,
  )
  const pageItems = filteredNodes.slice(
    pagination.startIndex,
    pagination.endIndex,
  )

  return (
    <Panel
      title="Node maintenance"
      icon={<Wrench className="size-4" />}
      actions={
        <>
          <FilterSelect
            label="Lock filter"
            value={lockFilter}
            options={lockFilterOptions}
            onChange={(value) =>
              setLockFilter(value as MaintenanceLockFilter)
            }
            className="h-7 min-w-28 text-[10px]"
          />
          <span className="text-[10px] text-faint">
            {maintenanceCount > 0
              ? `${maintenanceCount} node(s) under maintenance`
              : 'No nodes under maintenance'}
          </span>
        </>
      }
      contentClassName="p-0"
    >
      <QueryState
        isPending={isPending}
        isError={isError}
        isEmpty={filteredNodes.length === 0}
        emptyMessage={
          nodes.length === 0
            ? 'No nodes configured'
            : 'No nodes match the lock filter'
        }
      >
        {pageItems.map((node) => (
          <NodeMaintenanceRow key={node.id} node={node} />
        ))}
      </QueryState>
      <PaginationBar {...pagination} />
    </Panel>
  )
}
