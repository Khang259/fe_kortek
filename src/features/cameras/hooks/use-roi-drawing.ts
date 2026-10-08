import { useRef, useState } from 'react'

import type { RoiBox } from '@/features/cameras/types'
import {
  isValidRoiBox,
  relativeRectToRoiBox,
} from '@/features/cameras/utils/roi-box'

const clamp01 = (value: number) => Math.min(1, Math.max(0, value))

/**
 * Kéo chuột trên khung (tỷ lệ 0–1), chốt thành ROI pixel xywh 640×480.
 */
export function useRoiDrawing(onComplete: (box: RoiBox) => void) {
  const containerRef = useRef<HTMLDivElement>(null)
  const startPointRef = useRef<{ x: number; y: number } | null>(null)
  const [activeBox, setActiveBox] = useState<RoiBox | null>(null)

  const toRelativePoint = (event: React.PointerEvent) => {
    const container = containerRef.current
    if (!container) {
      return { x: 0, y: 0 }
    }
    const rect = container.getBoundingClientRect()
    return {
      x: clamp01((event.clientX - rect.left) / rect.width),
      y: clamp01((event.clientY - rect.top) / rect.height),
    }
  }

  const handlePointerDown = (event: React.PointerEvent) => {
    event.currentTarget.setPointerCapture(event.pointerId)
    startPointRef.current = toRelativePoint(event)
    setActiveBox(null)
  }

  const handlePointerMove = (event: React.PointerEvent) => {
    const start = startPointRef.current
    if (!start) {
      return
    }
    const current = toRelativePoint(event)
    setActiveBox(
      relativeRectToRoiBox(start.x, start.y, current.x, current.y),
    )
  }

  const handlePointerUp = () => {
    startPointRef.current = null
    if (activeBox && isValidRoiBox(activeBox) && activeBox[2] >= 8 && activeBox[3] >= 8) {
      onComplete(activeBox)
    }
    setActiveBox(null)
  }

  return {
    containerRef,
    activeBox,
    pointerHandlers: {
      onPointerDown: handlePointerDown,
      onPointerMove: handlePointerMove,
      onPointerUp: handlePointerUp,
    },
  }
}
