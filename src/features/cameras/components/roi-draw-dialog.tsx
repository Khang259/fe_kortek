import { RotateCcw, Save } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { PERMISSIONS } from '@/config/permissions'
import { useCameraRois } from '@/features/cameras/api/get-camera-rois'
import { usePersistRoiDrafts } from '@/features/cameras/api/persist-roi-drafts'
import { RoiDraftRow } from '@/features/cameras/components/roi-draft-row'
import { RoiDrawCanvas } from '@/features/cameras/components/roi-draw-canvas'
import { useRoiDrafts } from '@/features/cameras/hooks/use-roi-drafts'
import { useRoiDrawing } from '@/features/cameras/hooks/use-roi-drawing'
import type { Camera } from '@/features/cameras/types'
import { useNodes } from '@/features/nodes'
import { getNodeDisplayName } from '@/features/nodes/utils/node-display-name'
import { useHasPermission } from '@/hooks/use-has-permission'

interface RoiDrawDialogBodyProps {
  camera: Camera
  onClose: () => void
}

function RoiDrawDialogBody({ camera, onClose }: RoiDrawDialogBodyProps) {
  const { data: cameraRois = [] } = useCameraRois(camera.cameraId)
  const { data: nodes = [] } = useNodes()
  const persistRois = usePersistRoiDrafts()
  const canWrite = useHasPermission(PERMISSIONS.cameraWrite)

  const drafts = useRoiDrafts(cameraRois)
  const drawing = useRoiDrawing(drafts.add)
  const drawingEnabled = canWrite && camera.status === 'streaming'

  const observedNodes = nodes.filter((node) =>
    camera.observedNodeIds.includes(node.id),
  )
  const nodeOptions = observedNodes.map((node) => ({
    label: `${getNodeDisplayName(node)} (${node.kind})`,
    value: node.id,
  }))

  const handleSave = () => {
    persistRois.mutate(
      {
        cameraId: camera.cameraId,
        initialRois: cameraRois,
        drafts: drafts.drafts,
      },
      { onSuccess: onClose },
    )
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle className="text-xs font-semibold">
          Draw ROI · {camera.name} · {camera.zone}
        </DialogTitle>
      </DialogHeader>

      <p className="text-[10px] text-muted-foreground">
        Canvas: WebRTC <strong>preview</strong> (WHEP). ROI coordinates are stored in the
        default <strong>640×480</strong> frame (pixel xywh). Close / Save → DELETE
        session.{' '}
        {drawingEnabled
          ? 'Drag to add ROI. Assign each region to a real nodeId.'
          : canWrite
            ? `Camera is ${camera.status} — view-only ROI, cannot draw more.`
            : 'Missing camera.write — view-only ROI.'}
      </p>

      <RoiDrawCanvas
        cameraId={camera.cameraId}
        cameraStatus={camera.status}
        drafts={drafts.drafts}
        activeBox={drawing.activeBox}
        drawingEnabled={drawingEnabled}
        containerRef={drawing.containerRef}
        pointerHandlers={drawing.pointerHandlers}
        nodeLabelById={Object.fromEntries(
          observedNodes.map((node) => [node.id, getNodeDisplayName(node)]),
        )}
      />

      {drafts.drafts.length > 0 && (
        <div className="overflow-hidden rounded-md border">
          {drafts.drafts.map((draft, index) => (
            <RoiDraftRow
              key={draft.key}
              draft={draft}
              index={index}
              nodeOptions={nodeOptions}
              disabled={!canWrite}
              onNodeChange={(nodeId) => drafts.setNodeId(draft.key, nodeId)}
              onRemove={() => drafts.remove(draft.key)}
            />
          ))}
        </div>
      )}

      <div className="flex items-center justify-between gap-2">
        <span className="text-[10px] text-muted-foreground">
          {drafts.drafts.length} ROI
        </span>
        <div className="flex gap-1.5">
          <Button
            variant="outline"
            size="sm"
            disabled={!drawingEnabled}
            onClick={drafts.reset}
          >
            <RotateCcw />
            Undo
          </Button>
          {canWrite ? (
            <Button
              size="sm"
              disabled={
                !drawingEnabled ||
                drafts.hasUnassigned ||
                persistRois.isPending
              }
              onClick={handleSave}
            >
              <Save />
              {persistRois.isPending ? 'Saving…' : 'Save ROI'}
            </Button>
          ) : null}
        </div>
      </div>
    </>
  )
}

interface RoiDrawDialogProps {
  camera: Camera | null
  onClose: () => void
}

export function RoiDrawDialog({ camera, onClose }: RoiDrawDialogProps) {
  return (
    <Dialog
      open={camera !== null}
      onOpenChange={(open) => {
        if (!open) onClose()
      }}
    >
      <DialogContent className="max-h-[90vh] overflow-auto sm:max-w-lg">
        {camera ? (
          <RoiDrawDialogBody
            key={camera.cameraId}
            camera={camera}
            onClose={onClose}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  )
}
