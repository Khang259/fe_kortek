import { useEffect } from 'react'

import { SnapshotImage } from '@/components/common/snapshot-image'
import {
  isSnapshotExpiredError,
  useSnapshotImage,
} from '@/features/snapshots/api/get-snapshot-image'

interface AuthSnapshotImageProps {
  snapshotImageUrl: string | null
  alt: string
}

/**
 * Tải ảnh snapshot có Bearer (blob URL).
 * 404 → hết hạn theo contract đợt 4.
 */
export function AuthSnapshotImage({
  snapshotImageUrl,
  alt,
}: AuthSnapshotImageProps) {
  const { data: blobUrl, isPending, isError, error } = useSnapshotImage(
    snapshotImageUrl,
  )

  useEffect(() => {
    if (!blobUrl || blobUrl.startsWith('/')) {
      return
    }
    return () => {
      URL.revokeObjectURL(blobUrl)
    }
  }, [blobUrl])

  if (!snapshotImageUrl) {
    return <SnapshotImage url={null} alt={alt} />
  }

  if (isPending) {
    return (
      <div className="grid h-40 place-items-center rounded-md border bg-camera-feed text-[10px] text-muted-foreground">
        Loading image…
      </div>
    )
  }

  if (isError || !blobUrl) {
    return (
      <SnapshotImage
        url={null}
        alt={alt}
        emptyMessage={
          isSnapshotExpiredError(error)
            ? 'Image expired'
            : 'Could not load image'
        }
      />
    )
  }

  return <SnapshotImage url={blobUrl} alt={alt} />
}
