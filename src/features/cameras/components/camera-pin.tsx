import { Camera as CameraIcon } from 'lucide-react'

import { useCameraPreviewStore } from '@/features/cameras/stores/camera-preview-store'
import type { Camera } from '@/features/cameras/types'

interface CameraPinProps {
  camera: Camera
}

export function CameraPin({ camera }: CameraPinProps) {
  const openPreview = useCameraPreviewStore((state) => state.open)

  if (!camera.mapPosition) {
    return null
  }

  return (
    <button
      type="button"
      data-map-no-pan
      onClick={() => openPreview(camera.id)}
      aria-label={`Xem live feed camera ${camera.id}`}
      className="absolute z-3 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center rounded-md border border-info/70 bg-info-muted px-1.5 py-1 text-info hover:bg-info-muted/70"
      style={{
        left: `${camera.mapPosition.x}%`,
        top: `${camera.mapPosition.y}%`,
      }}
    >
      <CameraIcon className="size-3" />
      <small className="text-[8px]">Cam {camera.id}</small>
    </button>
  )
}
