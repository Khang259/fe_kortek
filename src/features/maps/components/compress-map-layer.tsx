import { useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

import { useCameras } from '@/features/cameras'
import { useCameraPreviewStore } from '@/features/cameras/stores/camera-preview-store'
import type { Camera } from '@/features/cameras/types'
import { MapHoverTooltip, type MapTooltip } from '@/features/maps/components/compress-map-overlay'
import { CompressMapMarkers } from '@/features/maps/components/compress-map-markers'
import type { CompressNode, CompressPayload } from '@/features/maps/types'
import {
  counterScaleMarkerR,
  isNodeVisibleAtZoom,
} from '@/features/maps/utils/map-lod'
import {
  findWarehouseByCompressName,
  indexNodesByNodeId,
} from '@/features/maps/utils/match-compress-node'
import {
  boundsToViewBox,
  buildContentBounds,
  filterValidLines,
  fitBoundsToViewport,
  isCompressCameraName,
  isCompressNodeVisible,
  parseCompress,
} from '@/features/maps/utils/parse-compress'
import { useNodes } from '@/features/nodes/api/get-nodes'
import { useMapViewStore } from '@/features/nodes/stores/map-view-store'
import { useNodeRuntimeStore } from '@/features/nodes/stores/node-runtime-store'

interface CompressMapLayerProps {
  compress: CompressPayload
}

/**
 * Vẽ nodes/lines từ get_compress.
 * Cam-* luôn vẽ; node nghiệp vụ chỉ khi `compress.name === mongo.nodeId`.
 * Màu theo runtime detected / undetected / unknown + lock.
 * LOD theo zoom; hover tooltip; click camera → preview.
 */
export function CompressMapLayer({ compress }: CompressMapLayerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const { data: cameras = [] } = useCameras()
  const { data: warehouseNodes = [] } = useNodes()
  const runtimeById = useNodeRuntimeStore((state) => state.byId)
  const openPreview = useCameraPreviewStore((state) => state.open)
  const zoom = useMapViewStore((state) => state.zoom)
  const [tooltip, setTooltip] = useState<MapTooltip | null>(null)
  const [viewportSize, setViewportSize] = useState({ width: 0, height: 0 })

  const { nodes, lines } = useMemo(() => parseCompress(compress), [compress])
  const visibleNodes = useMemo(
    () => nodes.filter(isCompressNodeVisible),
    [nodes],
  )
  /** Bounds dùng full node set — không nhảy khung khi LOD ẩn marker. */
  const lodNodes = useMemo(
    () => visibleNodes.filter((node) => isNodeVisibleAtZoom(node, zoom)),
    [visibleNodes, zoom],
  )
  const mapLines = useMemo(() => filterValidLines(lines), [lines])
  const contentBounds = useMemo(
    () => buildContentBounds(compress, visibleNodes, mapLines),
    [compress, visibleNodes, mapLines],
  )

  /** Zoom đổi → marker có thể biến mất; clear tooltip để không treo. */
  useEffect(() => {
    setTooltip(null)
  }, [zoom])

  useEffect(() => {
    const el = containerRef.current
    if (!el) {
      return
    }
    const updateSize = () => {
      const rect = el.getBoundingClientRect()
      setViewportSize({ width: rect.width, height: rect.height })
    }
    updateSize()
    const observer = new ResizeObserver(updateSize)
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  const fitViewBox = useMemo(() => {
    const fitted = fitBoundsToViewport(
      contentBounds,
      viewportSize.width,
      viewportSize.height,
    )
    return boundsToViewBox(fitted)
  }, [contentBounds, viewportSize.height, viewportSize.width])

  const baseMarkerR = Math.max(compress.width, compress.height) * 0.008
  /** Marker không phình theo zoom; line giữ base để scale cùng path. */
  const markerR = counterScaleMarkerR(baseMarkerR, zoom)
  const lineStrokeWidth = baseMarkerR * 0.22

  const cameraById = useMemo(() => {
    const map = new Map<number, Camera>()
    cameras.forEach((camera) => {
      map.set(camera.cameraId, camera)
    })
    return map
  }, [cameras])

  const nodesByNodeId = useMemo(
    () => indexNodesByNodeId(warehouseNodes),
    [warehouseNodes],
  )

  /**
   * Debug join compress.name ↔ mongo.nodeId — mở DevTools Console.
   * Xóa khi xác nhận data khớp.
   */
  useEffect(() => {
    const compressBusiness = visibleNodes.filter(
      (node) => !isCompressCameraName(node.name),
    )
    const compressCameras = visibleNodes.filter((node) =>
      isCompressCameraName(node.name),
    )
    const matched = compressBusiness.filter((node) =>
      findWarehouseByCompressName(node.name, nodesByNodeId),
    )
    const unmatched = compressBusiness.filter(
      (node) => !findWarehouseByCompressName(node.name, nodesByNodeId),
    )

    const lodBusiness = lodNodes.filter(
      (node) => !isCompressCameraName(node.name),
    )
    console.groupCollapsed(
      `[map-join] compress=${visibleNodes.length} mongo=${warehouseNodes.length} matched=${matched.length} unmatched=${unmatched.length} lodBusiness=${lodBusiness.length} zoom=${zoom}`,
    )
    console.table(
      compressBusiness.map((node) => ({
        source: 'compress',
        name: node.name,
        qr: node.qr,
        kind: node.kind,
        type: node.type,
        joined: Boolean(findWarehouseByCompressName(node.name, nodesByNodeId)),
      })),
    )
    console.table(
      warehouseNodes.map((node) => ({
        source: 'mongo',
        nodeId: node.nodeId,
        id: node.id,
        name: node.name,
        kind: node.kind,
      })),
    )
    console.log('[map-join] compress cameras', compressCameras.map((n) => n.name))
    console.log(
      '[map-join] unmatched compress.name (không vẽ)',
      unmatched.map((n) => n.name),
    )
    console.log(
      '[map-join] matched compress.name',
      matched.map((n) => n.name),
    )
    console.groupEnd()
  }, [visibleNodes, lodNodes, warehouseNodes, nodesByNodeId, zoom])

  /** Tọa độ màn hình — tooltip portal + fixed, không dính scale của map. */
  const toScreenPoint = (event: React.MouseEvent) => ({
    x: event.clientX,
    y: event.clientY,
  })

  const showNodeTooltip = (event: React.MouseEvent, node: CompressNode) => {
    const point = toScreenPoint(event)
    setTooltip({
      kind: 'node',
      ...point,
      qr: node.qr || node.name,
      zone: node.zone,
      camera: node.camera,
      pairPoint: node.pairPoint,
    })
  }

  const showCameraTooltip = (
    event: React.MouseEvent,
    node: CompressNode,
    camera: Camera | undefined,
  ) => {
    const point = toScreenPoint(event)
    setTooltip({
      kind: 'camera',
      ...point,
      name: camera?.name ?? node.name,
      zone: camera?.zone ?? node.zone,
    })
  }

  const handleCameraClick = (
    event: React.MouseEvent,
    cameraId: number | null,
  ) => {
    event.stopPropagation()
    if (cameraId == null) {
      return
    }
    openPreview(cameraId)
  }

  return (
    <div ref={containerRef} className="absolute inset-0">
      <svg
        viewBox={fitViewBox}
        preserveAspectRatio="xMidYMid meet"
        className="absolute inset-0 size-full"
      >
        <CompressMapMarkers
          mapLines={mapLines}
          visibleNodes={lodNodes}
          markerR={markerR}
          lineStrokeWidth={lineStrokeWidth}
          cameraById={cameraById}
          nodesByNodeId={nodesByNodeId}
          runtimeById={runtimeById}
          onShowNodeTooltip={showNodeTooltip}
          onShowCameraTooltip={showCameraTooltip}
          onClearTooltip={() => setTooltip(null)}
          onCameraClick={handleCameraClick}
        />
      </svg>
      {tooltip
        ? createPortal(<MapHoverTooltip tip={tooltip} />, document.body)
        : null}
    </div>
  )
}
