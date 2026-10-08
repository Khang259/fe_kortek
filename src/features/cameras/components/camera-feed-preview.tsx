import { DetectMetaOverlay } from '@/features/cameras/components/detect-meta-overlay'
import { WebrtcPlayer } from '@/features/cameras/components/webrtc-player'
import type { CameraStatus } from '@/features/cameras/types'

interface CameraFeedPreviewProps {
  cameraId: number
  status: CameraStatus
}

/**
 * Live detect trên map click — WHEP detect + poll preview/meta.
 * Đóng dialog / unmount → DELETE session (trong useWebRtcSession).
 */
export function CameraFeedPreview({ cameraId, status }: CameraFeedPreviewProps) {
  return (
    <WebrtcPlayer
      cameraId={cameraId}
      mode="detect"
      enabled={status === 'streaming'}
    >
      {({ isLive }) => (
        <DetectMetaOverlay cameraId={cameraId} enabled={isLive} />
      )}
    </WebrtcPlayer>
  )
}
