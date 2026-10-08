import { RotateCcw, RotateCw, ZoomIn, ZoomOut } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  MAP_ZOOM_BOUNDS,
  useMapViewStore,
} from '@/features/nodes/stores/map-view-store'

function MapToolButton({
  label,
  onClick,
  disabled,
  children,
}: {
  label: string
  onClick: () => void
  disabled?: boolean
  children: React.ReactNode
}) {
  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <Button
            variant="outline"
            size="icon-xs"
            aria-label={label}
            disabled={disabled}
            onClick={onClick}
          />
        }
      >
        {children}
      </TooltipTrigger>
      <TooltipContent side="bottom">{label}</TooltipContent>
    </Tooltip>
  )
}

/** Thanh công cụ map: xoay ±45°, zoom in/out. */
export function NodeMapToolbar() {
  const zoom = useMapViewStore((state) => state.zoom)
  const rotateClockwise = useMapViewStore((state) => state.rotateClockwise)
  const rotateCounterClockwise = useMapViewStore(
    (state) => state.rotateCounterClockwise,
  )
  const zoomIn = useMapViewStore((state) => state.zoomIn)
  const zoomOut = useMapViewStore((state) => state.zoomOut)

  return (
    <div
      data-map-no-pan
      className="absolute top-2 right-2 z-10 flex flex-col items-end gap-1.5"
    >
      <div className="flex items-center gap-1 rounded-md border bg-surface-raised/95 p-1">
        <MapToolButton
          label="Rotate clockwise 45°"
          onClick={rotateClockwise}
        >
          <RotateCw />
        </MapToolButton>
        <MapToolButton
          label="Rotate counter-clockwise 45°"
          onClick={rotateCounterClockwise}
        >
          <RotateCcw />
        </MapToolButton>
        <MapToolButton
          label="Zoom in"
          onClick={zoomIn}
          disabled={zoom >= MAP_ZOOM_BOUNDS.max}
        >
          <ZoomIn />
        </MapToolButton>
        <MapToolButton
          label="Zoom out"
          onClick={zoomOut}
          disabled={zoom <= MAP_ZOOM_BOUNDS.min}
        >
          <ZoomOut />
        </MapToolButton>
      </div>
    </div>
  )
}
