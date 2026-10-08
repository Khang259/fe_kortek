import { Search } from 'lucide-react'

import { FilterSelect } from '@/components/common/filter-select'
import { Input } from '@/components/ui/input'
import { FILTER_ALL } from '@/config/constants'
import { usePairListFilterStore } from '@/features/dispatch/stores/pair-list-filter-store'
import { useZones } from '@/features/zones'

const statusOptions = [
  { label: 'All statuses', value: FILTER_ALL },
  { label: 'Enabled', value: 'enabled' },
  { label: 'Disabled', value: 'disabled' },
]

export function PairFilters() {
  const { data: zones = [] } = useZones()
  const search = usePairListFilterStore((state) => state.search)
  const zone = usePairListFilterStore((state) => state.zone)
  const status = usePairListFilterStore((state) => state.status)
  const setSearch = usePairListFilterStore((state) => state.setSearch)
  const setZone = usePairListFilterStore((state) => state.setZone)
  const setStatus = usePairListFilterStore((state) => state.setStatus)

  const zoneOptions = [
    { label: 'All zones', value: FILTER_ALL },
    ...zones.map((item) => ({ label: item.name, value: item.id })),
  ]

  return (
    <div className="mb-3 flex flex-wrap gap-2">
      <div className="relative min-w-48 flex-1">
        <Search className="absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search by pair name, nodeId…"
          aria-label="Search pairs"
          className="pl-8 text-[11px]"
        />
      </div>
      <FilterSelect
        label="Zone"
        value={zone}
        options={zoneOptions}
        onChange={setZone}
        className="min-w-28 text-[11px]"
      />
      <FilterSelect
        label="Status"
        value={status}
        options={statusOptions}
        onChange={setStatus}
        className="min-w-36 text-[11px]"
      />
    </div>
  )
}
