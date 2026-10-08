import { ImageOff, Loader2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { useWebRtcSession } from '@/features/cameras/hooks/use-webrtc-session'
import { useWebRtcStatus } from '@/features/cameras/hooks/use-webrtc-status'
import type { WebRtcMode } from '@/features/cameras/types/webrtc'
import { cn } from '@/lib/utils'

interface WebrtcPlayerRenderState {
  isLive: boolean
}

interface WebrtcPlayerProps {
  cameraId: number
  mode: WebRtcMode
  enabled: boolean
  className?: string
  /** Overlay trên video; nhận `isLive` để bật poll meta. */
  children?:
    | React.ReactNode
    | ((state: WebrtcPlayerRenderState) => React.ReactNode)
  containerRef?: React.Ref<HTMLDivElement>
  containerProps?: React.HTMLAttributes<HTMLDivElement>
}

/**
 * Player WHEP chung: video + trạng thái connect + slot count.
 * Hangup tự chạy khi unmount / `enabled=false`.
 */
export function WebrtcPlayer({
  cameraId,
  mode,
  enabled,
  className,
  children,
  containerRef,
  containerProps,
}: WebrtcPlayerProps) {
  const { videoRef, phase, error, isLive, retry } = useWebRtcSession({
    cameraId,
    mode,
    enabled,
  })
  const { data: slots } = useWebRtcStatus(enabled)

  const { className: containerClassName, ...restContainerProps } =
    containerProps ?? {}

  const overlay =
    typeof children === 'function' ? children({ isLive }) : children

  return (
    <div className={cn('space-y-1', className)}>
      <div
        ref={containerRef}
        className={cn(
          'relative aspect-[640/480] overflow-hidden rounded-md bg-camera-feed',
          containerClassName,
        )}
        {...restContainerProps}
      >
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className={cn(
            'size-full object-fill',
            !isLive && 'invisible absolute inset-0',
          )}
        />

        {overlay}

        {phase === 'connecting' && (
          <div className="absolute inset-0 grid place-items-center gap-1 text-muted-foreground">
            <Loader2 className="size-6 animate-spin" />
            <span className="text-[10px]">Connecting WebRTC…</span>
          </div>
        )}

        {phase === 'error' && (
          <div className="absolute inset-0 grid place-items-center gap-2 p-3 text-center text-muted-foreground">
            <ImageOff className="size-8" />
            <span className="text-[10px] text-danger">{error}</span>
            <Button type="button" size="sm" variant="outline" onClick={retry}>
              Retry
            </Button>
          </div>
        )}

        {!enabled && phase === 'idle' && (
          <div className="absolute inset-0 grid place-items-center gap-1 text-muted-foreground">
            <ImageOff className="size-8" />
            <span className="text-[10px]">Camera not streaming</span>
          </div>
        )}
      </div>

      {slots && (
        <p className="text-[10px] text-muted-foreground">
          WebRTC slot {slots.count}/{slots.max}
          {mode === 'detect' ? ' · detect + overlay' : ' · preview'}
        </p>
      )}
    </div>
  )
}
