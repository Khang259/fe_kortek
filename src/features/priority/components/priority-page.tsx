import { Check, Pencil, X } from 'lucide-react'

import { SectionHeader } from '@/components/common/section-header'
import { Button } from '@/components/ui/button'
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '@/components/ui/resizable'
import { PriorityChain } from '@/features/priority/components/priority-chain'
import { usePriorityEditor } from '@/features/priority/hooks/use-priority-editor'
import { ConfigWriteGateBanner } from '@/features/system/components/config-write-gate-banner'
import { useMediaQuery } from '@/hooks/use-media-query'

export function PriorityPage() {
  const {
    primaryZone,
    primaryStarts,
    remainingStarts,
    remainingZoneLabel,
    isEditing,
    drafts,
    patchDraft,
    isPending,
    isError,
    isSaving,
    canWrite,
    canWriteConfig,
    startEdit,
    cancelEdit,
    saveEdit,
  } = usePriorityEditor()
  const isWide = useMediaQuery('(min-width: 1024px)')

  const onChangePriority = (nodeId: string, priority: number) => {
    patchDraft(nodeId, { priority })
  }

  const leftTitle = primaryZone
    ? `${primaryZone.name} (${primaryZone.id})`
    : 'Primary zone'

  const primaryChain = (
    <PriorityChain
      title={leftTitle}
      nodes={primaryStarts}
      isEditing={isEditing}
      drafts={drafts}
      onChangePriority={onChangePriority}
      isPending={isPending}
      isError={isError}
      emptyMessage="No start nodes in this zone"
    />
  )

  const remainingChain = (
    <PriorityChain
      title={remainingZoneLabel}
      nodes={remainingStarts}
      isEditing={isEditing}
      drafts={drafts}
      onChangePriority={onChangePriority}
      isPending={isPending}
      isError={isError}
      emptyMessage="No start nodes in other zones"
    />
  )

  return (
    <div>
      <SectionHeader
        title="Priority chain"
        description="Left = first zone, right = remaining zones. Edit priority only — rename in Settings → Cameras."
        action={
          canWrite ? (
            <div className="flex flex-wrap items-center gap-2">
              {isEditing ? (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={isSaving}
                    onClick={cancelEdit}
                  >
                    <X />
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    disabled={isSaving || !canWriteConfig}
                    onClick={saveEdit}
                  >
                    <Check />
                    {isSaving ? 'Updating…' : 'Update'}
                  </Button>
                </>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!canWriteConfig}
                  onClick={startEdit}
                >
                  <Pencil />
                  Edit
                </Button>
              )}
            </div>
          ) : undefined
        }
      />

      <ConfigWriteGateBanner />

      {!canWrite ? (
        <p className="mb-3 text-[11px] text-muted-foreground">
          Missing <code>camera.write</code> — view only.
        </p>
      ) : null}

      <div className="rounded-lg border bg-card p-4">
        <div className="min-h-48">
          {isWide ? (
            <ResizablePanelGroup orientation="horizontal" className="min-h-48">
              <ResizablePanel
                id="priority-primary"
                minSize={25}
                defaultSize={50}
              >
                <div className="h-full pr-1">{primaryChain}</div>
              </ResizablePanel>
              <ResizableHandle withHandle />
              <ResizablePanel
                id="priority-remaining"
                minSize={25}
                defaultSize={50}
              >
                <div className="h-full pl-1">{remainingChain}</div>
              </ResizablePanel>
            </ResizablePanelGroup>
          ) : (
            <div className="flex flex-col gap-3">
              {primaryChain}
              {remainingChain}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
