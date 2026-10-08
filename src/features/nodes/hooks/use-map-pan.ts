import { useRef, useState } from 'react'

import { useMapViewStore } from '@/features/nodes/stores/map-view-store'

/**
 * Kéo chuột (pointer) để pan viewport map.
 * Bỏ qua khi bắt đầu từ phần tử có `data-map-no-pan` (toolbar, nút…).
 */
export function useMapPan() {
  const panBy = useMapViewStore((state) => state.panBy)
  const lastPointRef = useRef<{ x: number; y: number } | null>(null)
  const [isDragging, setIsDragging] = useState(false)

  const handlePointerDown = (event: React.PointerEvent<HTMLElement>) => {
    if (event.button !== 0) {
      return
    }
    const target = event.target as HTMLElement
    if (target.closest('[data-map-no-pan]')) {
      return
    }

    lastPointRef.current = { x: event.clientX, y: event.clientY }
    setIsDragging(true)
    event.currentTarget.setPointerCapture(event.pointerId)
  }

  const handlePointerMove = (event: React.PointerEvent<HTMLElement>) => {
    const last = lastPointRef.current
    if (!last) {
      return
    }

    const dx = event.clientX - last.x
    const dy = event.clientY - last.y
    lastPointRef.current = { x: event.clientX, y: event.clientY }
    panBy(dx, dy)
  }

  const endDrag = (event: React.PointerEvent<HTMLElement>) => {
    if (!lastPointRef.current) {
      return
    }
    lastPointRef.current = null
    setIsDragging(false)
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId)
    }
  }

  return {
    isDragging,
    panHandlers: {
      onPointerDown: handlePointerDown,
      onPointerMove: handlePointerMove,
      onPointerUp: endDrag,
      onPointerCancel: endDrag,
    },
  }
}
