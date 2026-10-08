import { AuthSnapshotImage } from '@/features/snapshots/components/auth-snapshot-image'
import {
  pickOrderSnapshotImageUrl,
  useOrderSnapshots,
} from '@/features/snapshots/api/get-snapshots-by-order'

interface OrderSnapshotProps {
  orderId: string
  /** Chỉ fetch khi true — tránh N request khi list đóng. */
  enabled?: boolean
}

/**
 * Ảnh pair (JPEG ghép) sau dispatch Single OK.
 * Meta: get_by_order → bytes: get_image (Bearer via blob).
 */
export function OrderSnapshot({ orderId, enabled = true }: OrderSnapshotProps) {
  const { data, isPending, isFetching, isError } = useOrderSnapshots(
    orderId,
    enabled,
  )

  const imageUrl = data ? pickOrderSnapshotImageUrl(data.items) : null
  const stillWaitingEmpty =
    data != null && data.items.length === 0 && isFetching

  if (isPending || stillWaitingEmpty) {
    return (
      <div className="grid h-28 place-items-center rounded-md border bg-camera-feed text-[10px] text-muted-foreground">
        Loading snapshot…
      </div>
    )
  }

  if (isError) {
    return (
      <div className="grid h-28 place-items-center rounded-md border bg-camera-feed text-[10px] text-muted-foreground">
        Could not load snapshot metadata
      </div>
    )
  }

  if (!imageUrl) {
    return (
      <div className="grid h-28 place-items-center rounded-md border bg-camera-feed text-[10px] text-muted-foreground">
        No snapshot (disabled / not recorded / not Single)
      </div>
    )
  }

  return (
    <AuthSnapshotImage
      snapshotImageUrl={imageUrl}
      alt={`Order snapshot ${orderId}`}
    />
  )
}
