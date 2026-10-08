import { useEffect, useRef, type ReactNode, type WheelEvent } from 'react'

import { PERMISSIONS } from '@/config/permissions'
import { CompressMapLayer } from '@/features/maps/components/compress-map-layer'
import { useMapCompress } from '@/features/maps/api/get-compress'
import { NodeMapLegend } from '@/features/nodes/components/node-map-legend'
import { NodeMapMarker } from '@/features/nodes/components/node-map-marker'
import { NodeMapToolbar } from '@/features/nodes/components/node-map-toolbar'
import { NodeMapZone } from '@/features/nodes/components/node-map-zone'
import { useMapPan } from '@/features/nodes/hooks/use-map-pan'
import { useMapViewStore } from '@/features/nodes/stores/map-view-store'
import { useZones } from '@/features/zones'
import { useHasPermission } from '@/hooks/use-has-permission'
import { cn } from '@/lib/utils'
import type { WarehouseNode } from '@/types'

interface NodeMapProps {
  nodes: WarehouseNode[]
  /** Lớp overlay do feature khác truyền vào (ví dụ camera pin). */
  overlay?: ReactNode
}

const ZONE_BOX_CLASS = [
  'left-[4%] w-[43%] border-zone-a bg-zone-a/12 text-info',
  'left-[53%] w-[38%] border-zone-b bg-zone-b/12 text-zone-b',
] as const

/** Nền kẻ ô — size-full theo khung resizable. */
const MAP_GRID_CLASS =
  'pointer-events-none absolute inset-0 size-full opacity-25 [background-image:linear-gradient(var(--border)_1px,transparent_1px),linear-gradient(90deg,var(--border)_1px,transparent_1px)] [background-size:30px_30px]'

export function NodeMap({ nodes, overlay }: NodeMapProps) {
  const viewportRef = useRef<HTMLDivElement>(null)
  const { data: zones = [] } = useZones()
  const canReadMap = useHasPermission(PERMISSIONS.mapRead)
  const { data: compressData, isPending: compressPending } = useMapCompress(
    undefined,
    canReadMap,
  )

  const rotation = useMapViewStore((state) => state.rotation)
  const zoom = useMapViewStore((state) => state.zoom)
  const offsetX = useMapViewStore((state) => state.offsetX)
  const offsetY = useMapViewStore((state) => state.offsetY)
  const zoomIn = useMapViewStore((state) => state.zoomIn)
  const zoomOut = useMapViewStore((state) => state.zoomOut)
  const setViewportSize = useMapViewStore((state) => state.setViewportSize)
  const { isDragging, panHandlers } = useMapPan()

  const positionedNodes = nodes.filter((node) => node.position !== null)
  const hasCompress = Boolean(compressData?.compress)
  const showEmptyHint =
    !compressPending && !hasCompress && positionedNodes.length === 0

  /** Viewport size → clamp pan động theo (viewport/2) * zoom. */
  useEffect(() => {
    const el = viewportRef.current
    if (!el) {
      return
    }
    const updateSize = () => {
      const rect = el.getBoundingClientRect()
      setViewportSize(rect.width, rect.height)
    }
    updateSize()
    const observer = new ResizeObserver(updateSize)
    observer.observe(el)
    return () => observer.disconnect()
  }, [setViewportSize])

  const handleWheel = (event: WheelEvent<HTMLDivElement>) => {
    event.preventDefault()
    if (event.deltaY < 0) {
      zoomIn()
      return
    }
    if (event.deltaY > 0) {
      zoomOut()
    }
  }

  return (
    <div
      ref={viewportRef}
      className={cn(
        'relative flex h-full min-h-0 w-full flex-1 touch-none overflow-hidden rounded-md border bg-map-canvas select-none',
        isDragging ? 'cursor-grabbing' : 'cursor-grab',
      )}
      onWheel={handleWheel}
      {...panHandlers}
    >
      {/*
        Grid gắn viewport (không theo pan/zoom) — luôn phủ đúng kích thước
        khi kéo ResizablePanel (`size-full` theo khung flex).
      */}
      <div aria-hidden className={MAP_GRID_CLASS} />

      <NodeMapToolbar />

      <div
        className={cn(
          'absolute inset-0 size-full origin-center',
          !isDragging && 'transition-transform duration-150 ease-out',
        )}
        style={{
          transform: `translate(${offsetX}px, ${offsetY}px) rotate(${rotation}deg) scale(${zoom})`,
        }}
      >
        {hasCompress && compressData ? (
          <CompressMapLayer compress={compressData.compress} />
        ) : (
          <>
            {zones.slice(0, 2).map((zone, index) => (
              <NodeMapZone
                key={zone.id}
                label={zone.name}
                className={ZONE_BOX_CLASS[index]}
              />
            ))}
          </>
        )}

        {positionedNodes.map((node) => (
          <NodeMapMarker key={node.id} node={node} />
        ))}
        {overlay}
      </div>

      {showEmptyHint ? (
        <p
          data-map-no-pan
          className="absolute inset-x-0 bottom-10 z-3 px-3 text-center text-[10px] text-muted-foreground"
        >
          {canReadMap
            ? 'No compress map yet — import a zip (requires map.write) or wait for an active version.'
            : 'Missing map.read permission — cannot load compress map.'}
        </p>
      ) : null}

      <NodeMapLegend />
    </div>
  )
}
