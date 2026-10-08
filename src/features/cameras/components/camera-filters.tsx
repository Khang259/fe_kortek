import { Search } from 'lucide-react'

import { FilterSelect } from '@/components/common/filter-select'
import { Input } from '@/components/ui/input'
import { FILTER_ALL } from '@/config/constants'
import { useCameraFilterStore } from '@/features/cameras/stores/camera-filter-store'
import { cameraStatusLabels } from '@/features/cameras/utils/camera-status'
import { useZones } from '@/features/zones'

const statusOptions = [
  { label: 'All statuses', value: FILTER_ALL },
  ...Object.entries(cameraStatusLabels).map(([value, label]) => ({
    label,
    value,
  })),
]

export function CameraFilters() {
  const { data: zones = [] } = useZones()
  const search = useCameraFilterStore((state) => state.search)
  const zone = useCameraFilterStore((state) => state.zone)
  const status = useCameraFilterStore((state) => state.status)
  const setSearch = useCameraFilterStore((state) => state.setSearch)
  const setZone = useCameraFilterStore((state) => state.setZone)
  const setStatus = useCameraFilterStore((state) => state.setStatus)

  const zoneOptions = [
    { label: 'All zones', value: FILTER_ALL },
    ...zones.map((item) => ({ label: item.name, value: item.id })),
  ]

  return (
    <div className="mb-3 flex flex-wrap gap-2">
      <div className="relative min-w-60 flex-1">
        <Search className="absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search by name, ID, or RTSP URL..."
          aria-label="Search cameras"
          className="pl-8 text-[11px]"
        />
      </div>
      <FilterSelect
        label="Zone"
        value={zone}
        options={zoneOptions}
        onChange={setZone}
        className="min-w-32 text-[11px]"
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
