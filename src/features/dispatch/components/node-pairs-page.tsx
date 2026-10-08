import { Check, Pencil, Plus, X } from 'lucide-react'
import { useState } from 'react'

import { PaginationBar } from '@/components/common/pagination-bar'
import { QueryState } from '@/components/common/query-state'
import { SectionHeader } from '@/components/common/section-header'
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '@/components/ui/resizable'
import { Button } from '@/components/ui/button'
import { PERMISSIONS } from '@/config/permissions'
import { NodePairCard } from '@/features/dispatch/components/node-pair-card'
import { PairFilters } from '@/features/dispatch/components/pair-filters'
import { PairFormDialog } from '@/features/dispatch/components/pair-form-dialog'
import { useFilteredPairs } from '@/features/dispatch/hooks/use-filtered-pairs'
import { usePairBulkEdit } from '@/features/dispatch/hooks/use-pair-bulk-edit'
import { NodeMaintenancePanel } from '@/features/nodes'
import { ConfigWriteGateBanner } from '@/features/system/components/config-write-gate-banner'
import { useHasPermission } from '@/hooks/use-has-permission'
import { useMediaQuery } from '@/hooks/use-media-query'

export function NodePairsPage() {
  const canRead = useHasPermission(PERMISSIONS.pairRead)
  const canWrite = useHasPermission(PERMISSIONS.pairWrite)
  const { pairs, pagination, isPending, isError } = useFilteredPairs()
  const {
    isEditing,
    isSaving,
    canWriteConfig,
    startEdit,
    cancelEdit,
    saveEdit,
  } = usePairBulkEdit()
  const [openCreate, setOpenCreate] = useState(false)
  const isWide = useMediaQuery('(min-width: 1024px)')

  if (!canRead) {
    return (
      <p className="text-sm text-muted-foreground">
        Missing <code>pair.read</code> permission to view pairs.
      </p>
    )
  }

  const pairsPanel = (
    <div className="flex h-full min-h-0 flex-col">
      <SectionHeader
        title="Node pairs"
        description={
          isEditing
            ? 'Edit mode — change name/zone then click Update'
            : 'Create pairs (nodes must have ROI) · bulk edit name/zone'
        }
        action={
          canWrite ? (
            <div className="flex flex-wrap items-center gap-2">
              {isEditing ? (
                <>
                  <Button
                    variant="outline"
                    disabled={isSaving}
                    onClick={cancelEdit}
                  >
                    <X />
                    Cancel
                  </Button>
                  <Button
                    disabled={isSaving || !canWriteConfig}
                    onClick={saveEdit}
                  >
                    <Check />
                    {isSaving ? 'Updating…' : 'Update'}
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="outline" onClick={startEdit}>
                    <Pencil />
                    Edit
                  </Button>
                  <Button
                    disabled={!canWriteConfig}
                    onClick={() => setOpenCreate(true)}
                  >
                    <Plus />
                    Add pair
                  </Button>
                </>
              )}
            </div>
          ) : undefined
        }
      />
      <ConfigWriteGateBanner />
      <PairFilters />
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-lg border bg-card">
        <div className="min-h-0 flex-1 overflow-auto">
          <QueryState
            isPending={isPending}
            isError={isError}
            isEmpty={pairs.length === 0}
            emptyMessage="No pairs match the filters"
          >
            <div className="grid gap-2.5 p-3">
              {pairs.map((pair) => (
                <NodePairCard
                  key={pair.id}
                  pair={pair}
                  canWrite={canWrite}
                  isEditing={isEditing}
                />
              ))}
            </div>
          </QueryState>
        </div>
        <PaginationBar {...pagination} />
      </div>
    </div>
  )

  const maintenancePanel = (
    <div className="h-full min-h-0 overflow-auto">
      <NodeMaintenancePanel />
    </div>
  )

  return (
    <>
      <div className="flex h-[calc(100dvh-7.5rem)] min-h-[420px] flex-col">
        {isWide ? (
          <ResizablePanelGroup
            orientation="horizontal"
            className="min-h-0 flex-1"
          >
            <ResizablePanel id="pairs-list" minSize={35} defaultSize={58}>
              <div className="h-full pr-1">{pairsPanel}</div>
            </ResizablePanel>
            <ResizableHandle withHandle />
            <ResizablePanel
              id="pairs-maintenance"
              minSize={25}
              defaultSize={42}
            >
              <div className="h-full pl-1">{maintenancePanel}</div>
            </ResizablePanel>
          </ResizablePanelGroup>
        ) : (
          <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-auto">
            {pairsPanel}
            {maintenancePanel}
          </div>
        )}
      </div>

      <PairFormDialog
        open={openCreate}
        onClose={() => setOpenCreate(false)}
      />
    </>
  )
}
