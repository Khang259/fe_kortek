import { QueryState } from '@/components/common/query-state'
import { StatCard } from '@/components/common/stat-card'
import { useCameraStatusCounts } from '@/features/cameras/api/get-cameras'
import { formatRatio } from '@/utils'

export function CameraStatusLegend() {
  const { data: counts, isPending, isError } = useCameraStatusCounts()

  return (
    <QueryState isPending={isPending} isError={isError}>
      {counts ? (
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
          <StatCard
            label="Cameras online"
            value={formatRatio(counts.streaming, counts.total)}
            hint="Streaming / total cameras"
            tone="success"
          />
          <StatCard
            label="Cameras offline"
            value={String(counts.offline)}
            hint="Disconnected — needs check"
            tone={counts.offline > 0 ? 'danger' : 'neutral'}
          />
          <StatCard
            label="Cameras disabled"
            value={String(counts.disabled)}
            hint="Intentionally off — no alert"
            tone="neutral"
          />
        </div>
      ) : null}
    </QueryState>
  )
}
