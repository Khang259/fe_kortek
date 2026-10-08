import { StatusBadge } from '@/components/common/status-badge'
import { StatusDot } from '@/components/common/status-dot'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useCameras } from '@/features/cameras/api/get-cameras'
import { CameraFeedPreview } from '@/features/cameras/components/camera-feed-preview'
import { useCameraPreviewStore } from '@/features/cameras/stores/camera-preview-store'
import {
  cameraStatusLabels,
  cameraStatusTones,
} from '@/features/cameras/utils/camera-status'

export function CameraPreviewDialog() {
  const cameraId = useCameraPreviewStore((state) => state.cameraId)
  const close = useCameraPreviewStore((state) => state.close)
  const { data: cameras = [] } = useCameras()

  const camera = cameras.find((item) => item.cameraId === cameraId)

  return (
    <Dialog
      open={camera !== undefined}
      onOpenChange={(open) => {
        if (!open) close()
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xs font-semibold">
            Camera {camera?.cameraId} · Detect live
          </DialogTitle>
        </DialogHeader>
        {camera ? (
          <CameraFeedPreview
            key={camera.cameraId}
            cameraId={camera.cameraId}
            status={camera.status}
          />
        ) : null}
        <div className="flex items-center justify-between text-[10px] text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <StatusDot tone="success" />
            DETECT · {camera?.resolution ?? '—'}
          </span>
          {camera ? (
            <StatusBadge tone={cameraStatusTones[camera.status]}>
              {cameraStatusLabels[camera.status]}
            </StatusBadge>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  )
}
