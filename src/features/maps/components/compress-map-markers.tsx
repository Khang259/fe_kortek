import {
  CameraIcon,
  NodeMarker,
  cameraStroke,
  pointsToPolyline,
} from '@/features/maps/components/compress-map-overlay'
import type { Camera } from '@/features/cameras/types'
import type { CompressLine, CompressNode } from '@/features/maps/types'
import { findWarehouseByCompressName } from '@/features/maps/utils/match-compress-node'
import {
  isCompressCameraName,
  parseCamIndex,
} from '@/features/maps/utils/parse-compress'
import type { NodeRuntimeItem } from '@/features/nodes/types/runtime'
import { isNodeLocked } from '@/features/nodes/utils/node-lock'
import {
  MAP_STATUS_FILL,
  resolveMapNodeStatus,
} from '@/features/nodes/utils/map-status-style'
import type { WarehouseNode } from '@/types'

interface CompressMapMarkersProps {
  mapLines: CompressLine[]
  visibleNodes: CompressNode[]
  /** Bán kính marker đã counter-scale theo zoom. */
  markerR: number
  /** Độ dày đường — không counter-scale, phóng theo viewport zoom. */
  lineStrokeWidth: number
  cameraById: Map<number, Camera>
  /** Mongo index theo nodeId — join `compress.name === nodeId`. */
  nodesByNodeId: Map<string, WarehouseNode>
  runtimeById: Record<string, NodeRuntimeItem>
  onShowNodeTooltip: (event: React.MouseEvent, node: CompressNode) => void
  onShowCameraTooltip: (
    event: React.MouseEvent,
    node: CompressNode,
    camera: Camera | undefined,
  ) => void
  onClearTooltip: () => void
  onCameraClick: (event: React.MouseEvent, cameraId: number | null) => void
}

export function CompressMapMarkers({
  mapLines,
  visibleNodes,
  markerR,
  lineStrokeWidth,
  cameraById,
  nodesByNodeId,
  runtimeById,
  onShowNodeTooltip,
  onShowCameraTooltip,
  onClearTooltip,
  onCameraClick,
}: CompressMapMarkersProps) {
  return (
    <>
      {mapLines.map((line, index) => (
        <polyline
          key={`line-${index}-${line.from}-${line.to}`}
          points={pointsToPolyline(line.points)}
          fill="none"
          stroke={MAP_STATUS_FILL.path}
          strokeWidth={lineStrokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
          className="pointer-events-none opacity-70"
        />
      ))}

      {visibleNodes.map((node, index) => {
        if (isCompressCameraName(node.name)) {
          const camIndex = parseCamIndex(node.name)
          const camera =
            camIndex !== null ? cameraById.get(camIndex) : undefined
          const color = cameraStroke(camera?.status)

          return (
            <g
              key={`cam-${index}-${node.name}`}
              data-map-no-pan
              className="cursor-pointer"
              onMouseEnter={(event) =>
                onShowCameraTooltip(event, node, camera)
              }
              onMouseMove={(event) =>
                onShowCameraTooltip(event, node, camera)
              }
              onMouseLeave={onClearTooltip}
              onPointerDown={(event) => event.stopPropagation()}
              onClick={(event) => onCameraClick(event, camIndex)}
            >
              <CameraIcon
                x={node.x}
                y={node.y}
                size={markerR}
                color={color}
              />
              <circle
                cx={node.x}
                cy={node.y}
                r={markerR * 1.8}
                fill="transparent"
              />
            </g>
          )
        }

        /** Chỉ vẽ khi join được Mongo (`name` compress === `nodeId`). */
        const warehouse = findWarehouseByCompressName(node.name, nodesByNodeId)
        if (!warehouse) {
          return null
        }

        const runtime =
          runtimeById[warehouse.nodeId] ?? runtimeById[warehouse.id]
        const status = resolveMapNodeStatus(runtime)
        const locked = isNodeLocked(runtime?.lock ?? warehouse.lock)

        return (
          <g
            key={`node-${index}-${node.x}-${node.y}`}
            data-map-no-pan
            className="cursor-help"
            onMouseEnter={(event) => onShowNodeTooltip(event, node)}
            onMouseMove={(event) => onShowNodeTooltip(event, node)}
            onMouseLeave={onClearTooltip}
            onPointerDown={(event) => event.stopPropagation()}
          >
            <NodeMarker
              x={node.x}
              y={node.y}
              fill={MAP_STATUS_FILL[status]}
              locked={locked}
              markerR={markerR}
            />
          </g>
        )
      })}
    </>
  )
}
