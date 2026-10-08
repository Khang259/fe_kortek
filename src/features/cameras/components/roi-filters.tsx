import { Search } from 'lucide-react'

import { FilterSelect } from '@/components/common/filter-select'
import { Input } from '@/components/ui/input'
import { FILTER_ALL } from '@/config/constants'
import { useRoiFilterStore } from '@/features/cameras/stores/roi-filter-store'
import { useZones } from '@/features/zones'

export function RoiFilters() {
  const { data: zones = [] } = useZones()
  const cameraSearch = useRoiFilterStore((state) => state.cameraSearch)
  const zone = useRoiFilterStore((state) => state.zone)
  const nodeSearch = useRoiFilterStore((state) => state.nodeSearch)
  const setCameraSearch = useRoiFilterStore((state) => state.setCameraSearch)
  const setZone = useRoiFilterStore((state) => state.setZone)
  const setNodeSearch = useRoiFilterStore((state) => state.setNodeSearch)

  const zoneOptions = [
    { label: 'All zones', value: FILTER_ALL },
    ...zones.map((item) => ({ label: item.name, value: item.id })),
  ]

  return (
    <div className="mb-3 flex flex-wrap gap-2">
      <div className="relative min-w-48 flex-1">
        <Search className="absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={cameraSearch}
          onChange={(event) => setCameraSearch(event.target.value)}
          placeholder="Search camera name…"
          aria-label="Search ROI cameras"
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
      <div className="relative min-w-48 flex-1">
        <Search className="absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={nodeSearch}
          onChange={(event) => setNodeSearch(event.target.value)}
          placeholder="Search by node (name / id)…"
          aria-label="Search ROI nodes"
          className="pl-8 text-[11px]"
        />
      </div>
    </div>
  )
}
