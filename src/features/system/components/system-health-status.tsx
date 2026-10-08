import { StatusDot } from '@/components/common/status-dot'
import { useSystemHealth } from '@/features/system/api/get-system-config'

export function SystemHealthStatus() {
  const { data: indicators = [], isError } = useSystemHealth()

  if (isError) {
    return (
      <div className="hidden items-center gap-1.5 text-[11px] text-danger md:flex">
        <StatusDot tone="danger" />
        Lost connection to server
      </div>
    )
  }

  return (
    <div className="hidden items-center gap-4 text-[11px] text-muted-foreground md:flex">
      {indicators.map((indicator) => (
        <span
          key={indicator.id}
          className="flex items-center gap-1.5"
          title={indicator.detail}
        >
          <StatusDot tone={indicator.tone} />
          {indicator.label}
        </span>
      ))}
    </div>
  )
}
