import { QueryState } from '@/components/common/query-state'
import { useZones } from '@/features/zones/api/get-zones'
import { ZoneControlItem } from '@/features/zones/components/zone-control-item'
import { ZoneListFilters } from '@/features/zones/components/zone-list-filters'
import { useZoneFilterStore } from '@/features/zones/stores/zone-filter-store'
import { filterZones } from '@/features/zones/utils/filter-zones'
import { formatRatio } from '@/utils'

export function ZoneControlPanel() {
  const { data: zones = [], isPending, isError } = useZones()
  const status = useZoneFilterStore((state) => state.status)
  const filtered = filterZones(zones, status)
  const streamingCount = zones.filter((zone) => zone.isStreaming).length

  return (
    <section className="flex h-full min-h-0 flex-col">
      <header className="flex shrink-0 items-center justify-between border-b px-3 py-2.5 text-xs font-semibold">
        <span>Zones</span>
        <span className="text-muted-foreground">
          {formatRatio(streamingCount, zones.length)} with feed
        </span>
      </header>
      <ZoneListFilters />
      <div className="min-h-0 flex-1 overflow-auto">
        <QueryState
          isPending={isPending}
          isError={isError}
          isEmpty={filtered.length === 0}
          emptyMessage="No zones match the filter"
        >
          {filtered.map((zone) => (
            <ZoneControlItem key={zone.id} zone={zone} />
          ))}
        </QueryState>
      </div>
    </section>
  )
}
