import { PencilRuler } from 'lucide-react'

import { StatusBadge } from '@/components/common/status-badge'
import { Button } from '@/components/ui/button'
import { TableCell, TableRow } from '@/components/ui/table'
import { PERMISSIONS } from '@/config/permissions'
import { useRoiDrawStore } from '@/features/cameras/stores/roi-draw-store'
import type { Camera, CameraRoi } from '@/features/cameras/types'
import { formatRoiBox } from '@/features/cameras/utils/camera-status'
import { useHasPermission } from '@/hooks/use-has-permission'

interface CameraRoiRowProps {
  camera: Camera
  rois: CameraRoi[]
}

export function CameraRoiRow({ camera, rois }: CameraRoiRowProps) {
  const openDraw = useRoiDrawStore((state) => state.open)
  const canReadCamera = useHasPermission(PERMISSIONS.cameraRead)
  const canWriteCamera = useHasPermission(PERMISSIONS.cameraWrite)
  const hasObservedNodes = camera.observedNodeIds.length > 0
  const canOpen = canReadCamera && hasObservedNodes

  const title = !canReadCamera
    ? 'Missing camera.read permission'
    : !hasObservedNodes
      ? 'Camera has no observed nodes'
      : !canWriteCamera
        ? 'View-only ROI (missing camera.write)'
        : camera.status === 'offline'
          ? 'Camera offline — open to view ROI, cannot draw more'
          : camera.status === 'disabled'
            ? 'Camera disabled — open to view ROI, cannot draw more'
            : `Draw ROI for ${camera.name}`

  return (
    <TableRow className="text-[11px]">
      <TableCell className="font-semibold">{camera.name}</TableCell>
      <TableCell className="text-muted-foreground">{camera.zone}</TableCell>
      <TableCell>
        <div className="flex flex-wrap gap-1">
          {camera.observedNodeIds.map((nodeId) => (
            <StatusBadge key={nodeId} tone="info">
              {nodeId}
            </StatusBadge>
          ))}
        </div>
      </TableCell>
      <TableCell>
        {rois.length === 0 ? (
          <span className="text-[10px] text-faint">No ROI yet</span>
        ) : (
          <div className="grid gap-0.5">
            {rois.map((roi) => (
              <span
                key={roi.id}
                className="font-mono text-[10px] text-muted-foreground"
                title={roi.nodeId}
              >
                {roi.nodeId}: {formatRoiBox(roi.box)}
              </span>
            ))}
          </div>
        )}
      </TableCell>
      <TableCell className="text-right">
        <Button
          variant="outline"
          size="icon-xs"
          aria-label={`Open ROI camera ${camera.cameraId}`}
          disabled={!canOpen}
          title={title}
          onClick={() => openDraw(camera.cameraId)}
        >
          <PencilRuler />
        </Button>
      </TableCell>
    </TableRow>
  )
}
