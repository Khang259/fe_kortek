import { Map } from 'lucide-react'

import { Panel } from '@/components/common/panel'
import { MapVersionControls } from '@/features/maps'
import { CameraPinLayer } from '@/features/cameras'
import { NodeMap, useLockedNodeCount, useNodes } from '@/features/nodes'

export function NodeMapPanel() {
  const { data: nodes = [], isPending, isError } = useNodes()
  const { data: lockedCount = 0 } = useLockedNodeCount()

  return (
    <Panel
      title="Map"
      icon={<Map className="size-4" />}
      className="flex h-full min-h-0 flex-col"
      contentClassName="gap-2"
      actions={
        <div className="flex flex-wrap items-center justify-end gap-2">
          <span className="hidden max-w-40 truncate text-[10px] text-faint sm:inline">
            {lockedCount > 0
              ? `${lockedCount} node(s) locked`
              : 'Drag to pan · scroll to zoom'}
          </span>
          <MapVersionControls />
        </div>
      }
    >
      {isError ? (
        <p className="text-[11px] text-danger">Could not load node list.</p>
      ) : null}
      {isPending ? (
        <p className="text-[11px] text-muted-foreground">Loading…</p>
      ) : (
        <div className="flex min-h-0 flex-1 flex-col">
          <NodeMap nodes={nodes} overlay={<CameraPinLayer />} />
        </div>
      )}
    </Panel>
  )
}
