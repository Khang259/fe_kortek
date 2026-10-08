import { create } from 'zustand'

/** Range rộng hơn để LOD ẩn/hiện marker theo mức zoom (giống Google Maps). */
const MIN_ZOOM = 0.4
const MAX_ZOOM = 4
const ZOOM_STEP = 0.25
const ROTATE_STEP = 45

interface MapViewState {
  rotation: number
  zoom: number
  offsetX: number
  offsetY: number
  viewportWidth: number
  viewportHeight: number
  rotateClockwise: () => void
  rotateCounterClockwise: () => void
  zoomIn: () => void
  zoomOut: () => void
  panBy: (dx: number, dy: number) => void
  resetPan: () => void
  setViewportSize: (width: number, height: number) => void
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

/**
 * Giới hạn pan động: đủ để kéo nội dung khi zoom lớn.
 * (viewport/2) * zoom — không hardcode pixel cố định.
 */
export function maxPanAxis(viewportSize: number, zoom: number) {
  return (Math.max(viewportSize, 1) / 2) * zoom
}

function clampOffsets(state: {
  offsetX: number
  offsetY: number
  zoom: number
  viewportWidth: number
  viewportHeight: number
}) {
  const maxX = maxPanAxis(state.viewportWidth, state.zoom)
  const maxY = maxPanAxis(state.viewportHeight, state.zoom)
  return {
    offsetX: clamp(state.offsetX, -maxX, maxX),
    offsetY: clamp(state.offsetY, -maxY, maxY),
  }
}

/** Viewport local: xoay / zoom / kéo — file map do API `/maps/*` quản lý. */
export const useMapViewStore = create<MapViewState>((set, get) => ({
  rotation: 0,
  zoom: 1,
  offsetX: 0,
  offsetY: 0,
  viewportWidth: 0,
  viewportHeight: 0,

  rotateClockwise: () =>
    set({ rotation: (get().rotation + ROTATE_STEP) % 360 }),

  rotateCounterClockwise: () =>
    set({ rotation: (get().rotation - ROTATE_STEP + 360) % 360 }),

  zoomIn: () => {
    const zoom = Math.min(MAX_ZOOM, +(get().zoom + ZOOM_STEP).toFixed(2))
    const current = get()
    set({ zoom, ...clampOffsets({ ...current, zoom }) })
  },

  zoomOut: () => {
    const zoom = Math.max(MIN_ZOOM, +(get().zoom - ZOOM_STEP).toFixed(2))
    const current = get()
    set({ zoom, ...clampOffsets({ ...current, zoom }) })
  },

  panBy: (dx, dy) => {
    const current = get()
    set(
      clampOffsets({
        ...current,
        offsetX: current.offsetX + dx,
        offsetY: current.offsetY + dy,
      }),
    )
  },

  resetPan: () => set({ offsetX: 0, offsetY: 0 }),

  setViewportSize: (width, height) => {
    const current = get()
    set({
      viewportWidth: width,
      viewportHeight: height,
      ...clampOffsets({ ...current, viewportWidth: width, viewportHeight: height }),
    })
  },
}))

export const MAP_ZOOM_BOUNDS = { min: MIN_ZOOM, max: MAX_ZOOM } as const
