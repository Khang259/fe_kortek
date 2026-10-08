import {
  ImageOff,
  Maximize2,
  Minimize2,
  ZoomIn,
  ZoomOut,
} from 'lucide-react'
import { useState } from 'react'

import { useSnapshotViewer } from '@/components/common/use-snapshot-viewer'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface SnapshotImageProps {
  url: string | null
  alt: string
  /** Khi url null — mặc định "Lệnh này không có ảnh". */
  emptyMessage?: string
}

function SnapshotPlaceholder({ message }: { message: string }) {
  return (
    <div className="grid h-40 place-items-center gap-1 rounded-md border bg-camera-feed text-muted-foreground">
      <ImageOff className="size-6" />
      <span className="text-[10px]">{message}</span>
    </div>
  )
}

/**
 * Ảnh snapshot có thể bị xoá theo chính sách lưu trữ của backend, nên trường
 * hợp tải lỗi là bình thường chứ không phải bug. Phải nói rõ lý do thay vì
 * để trống hoặc hiện icon ảnh vỡ của trình duyệt.
 */
export function SnapshotImage({
  url,
  alt,
  emptyMessage = 'No image for this order',
}: SnapshotImageProps) {
  const [hasError, setHasError] = useState(false)
  const {
    containerRef,
    isFullscreen,
    zoom,
    zoomIn,
    zoomOut,
    toggleFullscreen,
    canZoomIn,
    canZoomOut,
  } = useSnapshotViewer()

  if (!url) {
    return <SnapshotPlaceholder message={emptyMessage} />
  }

  if (hasError) {
    return (
      <SnapshotPlaceholder message="Image expired or failed to load" />
    )
  }

  return (
    <div
      ref={containerRef}
      className={cn(
        'group/snapshot relative overflow-hidden bg-black',
        isFullscreen ? 'grid place-items-center' : 'rounded-md border',
      )}
    >
      <img
        src={url}
        alt={alt}
        loading="lazy"
        onError={() => setHasError(true)}
        style={{ transform: `scale(${zoom})` }}
        className={cn(
          'w-full origin-center object-contain transition-transform duration-150',
          isFullscreen ? 'max-h-screen' : 'max-h-56',
        )}
      />
      <div className="absolute top-1.5 right-1.5 flex gap-1">
        <Button
          variant="outline"
          size="icon-xs"
          aria-label="Zoom out"
          disabled={!canZoomOut}
          onClick={zoomOut}
        >
          <ZoomOut />
        </Button>
        <Button
          variant="outline"
          size="icon-xs"
          aria-label="Zoom in"
          disabled={!canZoomIn}
          onClick={zoomIn}
        >
          <ZoomIn />
        </Button>
        <Button
          variant="outline"
          size="icon-xs"
          aria-label={isFullscreen ? 'Exit fullscreen' : 'View fullscreen'}
          onClick={toggleFullscreen}
        >
          {isFullscreen ? <Minimize2 /> : <Maximize2 />}
        </Button>
      </div>
      {isFullscreen && (
        <span className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-md bg-surface-raised/90 px-2 py-1 text-[10px] text-muted-foreground">
          Press Esc to exit · Zoom {Math.round(zoom * 100)}%
        </span>
      )}
    </div>
  )
}
