import { FilterSelect } from '@/components/common/filter-select'
import { FILTER_ALL } from '@/config/constants'
import { useZoneFilterStore } from '@/features/zones/stores/zone-filter-store'

const statusOptions = [
  { label: 'All statuses', value: FILTER_ALL },
  { label: 'Running', value: 'running' },
  { label: 'Stopped', value: 'stopped' },
]

export function ZoneListFilters() {
  const status = useZoneFilterStore((state) => state.status)
  const setStatus = useZoneFilterStore((state) => state.setStatus)

  return (
    <div className="border-b px-3 py-2">
      <FilterSelect
        label="Zone status"
        value={status}
        options={statusOptions}
        onChange={setStatus}
        className="h-7 w-full text-[10px]"
      />
    </div>
  )
}
