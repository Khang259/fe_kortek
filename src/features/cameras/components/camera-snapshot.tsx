import { Camera as CameraIcon, ImageOff } from 'lucide-react'
import { useEffect } from 'react'

import { useCameraSnapshot } from '@/features/cameras/api/get-camera-snapshot'
import type { CameraStatus } from '@/features/cameras/types'
import type { ApiError } from '@/types'

interface CameraSnapshotProps {
  cameraId: number
  status: CameraStatus
}

function snapshotErrorMessage(error: unknown) {
  const status = (error as ApiError | undefined)?.status
  if (status === 409) {
    return 'Camera not streaming — no frame'
  }
  if (status === 503) {
    return 'Runtime not ready'
  }
  if (status === 403) {
    return 'No permission to view snapshot'
  }
  if (status === 404) {
    return 'Camera not found'
  }
  return 'Could not load snapshot'
}

/**
 * Nền khung hình thật để vẽ ROI.
 * Blob URL từ get_snapshot được revoke khi unmount / đổi URL.
 */
export function CameraSnapshot({ cameraId, status }: CameraSnapshotProps) {
  const canLoad = status === 'streaming'
  const { data: url, isPending, isError, error } = useCameraSnapshot(
    cameraId,
    canLoad,
  )

  useEffect(() => {
    if (!url || url.startsWith('/')) {
      return
    }
    return () => {
      URL.revokeObjectURL(url)
    }
  }, [url])

  if (status === 'offline') {
    return (
      <SnapshotFrame>
        <ImageOff className="size-8 text-danger" />
        <span className="text-[10px] text-danger">
          Camera offline — cannot fetch image
        </span>
      </SnapshotFrame>
    )
  }

  if (status === 'disabled') {
    return (
      <SnapshotFrame>
        <CameraIcon className="size-8" />
        <span className="text-[10px]">Camera disabled — cannot draw ROI</span>
      </SnapshotFrame>
    )
  }

  if (isPending) {
    return (
      <SnapshotFrame>
        <span className="text-[10px]">Loading snapshot…</span>
      </SnapshotFrame>
    )
  }

  if (isError || !url) {
    return (
      <SnapshotFrame>
        <ImageOff className="size-8" />
        <span className="text-[10px]">{snapshotErrorMessage(error)}</span>
      </SnapshotFrame>
    )
  }

  return (
    <div className="relative aspect-[640/480] overflow-hidden rounded-md bg-camera-feed">
      <img
        src={url}
        alt={`Snapshot camera ${cameraId}`}
        className="size-full object-contain"
        draggable={false}
      />
    </div>
  )
}

function SnapshotFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative grid aspect-[640/480] place-items-center gap-1 rounded-md bg-camera-feed text-muted-foreground">
      {children}
    </div>
  )
}
