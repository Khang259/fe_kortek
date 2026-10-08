import { usePreviewMeta } from '@/features/cameras/hooks/use-preview-meta'
import { useNodeRuntimeStore } from '@/features/nodes/stores/node-runtime-store'
import { cn } from '@/lib/utils'

interface DetectMetaOverlayProps {
  cameraId: number
  /** Chỉ poll khi session đã live. */
  enabled: boolean
}

/**
 * Vẽ ROI + detection từ `GET .../preview/meta` (scale theo w×h meta).
 * ROI xanh khi node runtime `detected` (cùng nguồn badge list node).
 */
export function DetectMetaOverlay({
  cameraId,
  enabled,
}: DetectMetaOverlayProps) {
  const { data: meta } = usePreviewMeta(cameraId, enabled)
  const runtimeById = useNodeRuntimeStore((state) => state.byId)

  if (!meta || meta.w <= 0 || meta.h <= 0) {
    return null
  }

  return (
    <div className="pointer-events-none absolute inset-0">
      {meta.rois.map((item) => {
        const [x, y, w, h] = item.roi
        const detected = runtimeById[item.node_id]?.detected === true
        return (
          <div
            key={`roi-${item.node_id}-${x}-${y}`}
            className={cn(
              'absolute border',
              detected
                ? 'border-success bg-success/15'
                : 'border-warning bg-warning/10',
            )}
            style={{
              left: `${(x / meta.w) * 100}%`,
              top: `${(y / meta.h) * 100}%`,
              width: `${(w / meta.w) * 100}%`,
              height: `${(h / meta.h) * 100}%`,
            }}
          >
            <small
              className={cn(
                'absolute -top-4 -left-px px-1 text-[8px] whitespace-nowrap',
                detected
                  ? 'bg-success-muted text-success'
                  : 'bg-surface-raised',
              )}
            >
              {item.node_id}
              {detected ? ' · detected' : ''}
            </small>
          </div>
        )
      })}

      {meta.dets.map((det, index) => {
        const [x1, y1, x2, y2] = det.xyxy
        return (
          <div
            key={`det-${det.cls}-${index}-${x1}-${y1}`}
            className="absolute border border-danger"
            style={{
              left: `${(x1 / meta.w) * 100}%`,
              top: `${(y1 / meta.h) * 100}%`,
              width: `${((x2 - x1) / meta.w) * 100}%`,
              height: `${((y2 - y1) / meta.h) * 100}%`,
            }}
          >
            <small className="absolute -top-4 -left-px bg-danger px-1 py-0.5 text-[8px] text-white">
              {String(det.cls).toUpperCase()}{' '}
              {Number(det.conf).toFixed(2)}
            </small>
          </div>
        )
      })}
    </div>
  )
}
