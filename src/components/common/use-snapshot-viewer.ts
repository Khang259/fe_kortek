import { useEffect, useRef, useState } from 'react'

const MIN_ZOOM = 1
const MAX_ZOOM = 4
const ZOOM_STEP = 0.5

export const SNAPSHOT_ZOOM_BOUNDS = { min: MIN_ZOOM, max: MAX_ZOOM } as const

/**
 * Viewport ảnh snapshot: fullscreen (đồng bộ với document) + zoom in/out.
 * Thoát fullscreen (Esc) sẽ reset zoom về 1.
 */
export function useSnapshotViewer() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [zoom, setZoom] = useState(MIN_ZOOM)

  useEffect(() => {
    const syncFullscreen = () => {
      const active = document.fullscreenElement === containerRef.current
      setIsFullscreen(active)
      if (!active) setZoom(MIN_ZOOM)
    }
    document.addEventListener('fullscreenchange', syncFullscreen)
    return () =>
      document.removeEventListener('fullscreenchange', syncFullscreen)
  }, [])

  const toggleFullscreen = () => {
    if (document.fullscreenElement) {
      void document.exitFullscreen()
      return
    }
    /** Trình duyệt có thể từ chối (iframe thiếu quyền), bỏ qua chứ không để văng lỗi. */
    void containerRef.current?.requestFullscreen().catch(() => undefined)
  }

  const zoomIn = () =>
    setZoom((value) => Math.min(MAX_ZOOM, +(value + ZOOM_STEP).toFixed(2)))

  const zoomOut = () =>
    setZoom((value) => Math.max(MIN_ZOOM, +(value - ZOOM_STEP).toFixed(2)))

  return {
    containerRef,
    isFullscreen,
    zoom,
    zoomIn,
    zoomOut,
    toggleFullscreen,
    canZoomIn: zoom < MAX_ZOOM,
    canZoomOut: zoom > MIN_ZOOM,
  }
}
