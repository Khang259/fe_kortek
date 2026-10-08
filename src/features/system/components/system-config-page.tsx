import { Check, Pencil } from 'lucide-react'

import { QueryState } from '@/components/common/query-state'
import { SectionHeader } from '@/components/common/section-header'
import { StatusBadge } from '@/components/common/status-badge'
import { Button } from '@/components/ui/button'
import { useSystemConfig } from '@/features/system/api/get-system-config'

export function SystemConfigPage() {
  const { data: config, isPending, isError } = useSystemConfig()

  return (
    <>
      <SectionHeader
        title="System"
        description="Warehouse connection settings and runtime parameters"
        action={
          <Button>
            <Check />
            Save changes
          </Button>
        }
      />
      <QueryState isPending={isPending} isError={isError}>
        {config ? (
          <>
            <div className="mb-3 flex max-w-2xl items-center justify-between rounded-lg border bg-card p-3.5">
              <div>
                <h3 className="text-xs font-semibold">Runtime</h3>
                <p className="mt-1 text-[10px] text-muted-foreground">
                  AMR orchestration service status
                </p>
              </div>
              <StatusBadge
                tone={config.runtimeStatus === 'healthy' ? 'success' : 'warning'}
              >
                {config.runtimeStatus === 'healthy' ? 'Healthy' : 'Degraded'}
              </StatusBadge>
            </div>
            {config.entries.map((entry) => (
              <div
                key={entry.id}
                className="grid max-w-2xl grid-cols-[1fr_2fr_20px] items-center gap-3 border-b px-3 py-3 text-[11px]"
              >
                <span>{entry.label}</span>
                <b className="font-mono font-normal text-muted-foreground">
                  {entry.value}
                </b>
                <Pencil className="size-3.5 text-muted-foreground" />
              </div>
            ))}
          </>
        ) : null}
      </QueryState>
    </>
  )
}
