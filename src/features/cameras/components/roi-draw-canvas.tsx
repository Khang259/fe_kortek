import { WebrtcPlayer } from '@/features/cameras/components/webrtc-player'
import type { CameraStatus, RoiBox, RoiDraft } from '@/features/cameras/types'
import { roiBoxToCssPercent } from '@/features/cameras/utils/roi-box'
import { cn } from '@/lib/utils'

interface RoiDrawCanvasProps {
  cameraId: number
  cameraStatus: CameraStatus
  drafts: RoiDraft[]
  /** ROI đang kéo dở, vẽ nét đứt để phân biệt với ROI đã chốt. */
  activeBox: RoiBox | null
  /** false khi camera offline/disabled — vẫn hiện overlay ROI cũ nhưng không vẽ thêm. */
  drawingEnabled: boolean
  containerRef: React.Ref<HTMLDivElement>
  pointerHandlers: {
    onPointerDown: (event: React.PointerEvent) => void
    onPointerMove: (event: React.PointerEvent) => void
    onPointerUp: (event: React.PointerEvent) => void
  }
  /** Map nodeId → label hiển thị trên overlay. */
  nodeLabelById?: Record<string, string>
}

/** Lớp phủ lên WebRTC preview để kéo chuột tạo nhiều ROI. */
export function RoiDrawCanvas({
  cameraId,
  cameraStatus,
  drafts,
  activeBox,
  drawingEnabled,
  containerRef,
  pointerHandlers,
  nodeLabelById = {},
}: RoiDrawCanvasProps) {
  const streamEnabled = cameraStatus === 'streaming'

  return (
    <WebrtcPlayer
      cameraId={cameraId}
      mode="preview"
      enabled={streamEnabled}
      containerRef={containerRef}
      containerProps={{
        className: cn(
          'touch-none select-none',
          drawingEnabled ? 'cursor-crosshair' : 'cursor-not-allowed',
        ),
        ...(drawingEnabled ? pointerHandlers : {}),
      }}
    >
      {drafts.map((draft, index) => (
        <div
          key={draft.key}
          className={cn(
            'absolute border-2',
            draft.nodeId === ''
              ? 'border-warning bg-warning/15'
              : 'border-info bg-info/15',
          )}
          style={roiBoxToCssPercent(draft.box)}
        >
          <small className="absolute -top-4 -left-px bg-surface-raised px-1 text-[8px] whitespace-nowrap">
            {draft.nodeId
              ? (nodeLabelById[draft.nodeId] ?? draft.nodeId)
              : `ROI ${index + 1} · unassigned`}
          </small>
        </div>
      ))}

      {activeBox && drawingEnabled && (
        <div
          className="absolute border-2 border-dashed border-info bg-info/10"
          style={roiBoxToCssPercent(activeBox)}
        />
      )}
    </WebrtcPlayer>
  )
}
