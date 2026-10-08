import { useCallback, useEffect, useRef, useState } from 'react'

import {
  deleteWebRtcSession,
  fetchWebRtcIce,
  fetchWebRtcStatus,
  postWhep,
} from '@/features/cameras/api/webrtc'
import type { WebRtcMode, WebRtcPhase } from '@/features/cameras/types/webrtc'
import { waitIceGatheringComplete } from '@/features/cameras/utils/wait-ice'
import { env } from '@/config/env'

interface UseWebRtcSessionOptions {
  cameraId: number
  mode: WebRtcMode
  /** false → không connect (offline/disabled/mock dialog đóng). */
  enabled: boolean
}

/**
 * Connect WHEP theo contract §6; hangup khi unmount / disable / pagehide.
 */
export function useWebRtcSession({
  cameraId,
  mode,
  enabled,
}: UseWebRtcSessionOptions) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const pcRef = useRef<RTCPeerConnection | null>(null)
  const sessionIdRef = useRef<string | null>(null)
  const [phase, setPhase] = useState<WebRtcPhase>('idle')
  const [error, setError] = useState<string | null>(null)
  const [retryKey, setRetryKey] = useState(0)

  const clearPeer = useCallback(() => {
    const pc = pcRef.current
    pcRef.current = null
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
    if (pc) {
      pc.close()
    }
  }, [])

  const hangup = useCallback(
    async (options?: { keepalive?: boolean }) => {
      const sessionId = sessionIdRef.current
      sessionIdRef.current = null
      clearPeer()
      if (!sessionId) {
        return
      }
      try {
        await deleteWebRtcSession(cameraId, sessionId, options)
      } catch {
        /* slot có thể đã hết hạn — bỏ qua */
      }
    },
    [cameraId, clearPeer],
  )

  const retry = useCallback(() => {
    setRetryKey((key) => key + 1)
  }, [])

  useEffect(() => {
    if (!enabled) {
      setPhase('idle')
      setError(null)
      return
    }

    if (env.useMockApi) {
      setPhase('error')
      setError(
        'WebRTC requires a real backend — set VITE_USE_MOCK_API=false and connect again',
      )
      return
    }

    let cancelled = false

    const connect = async () => {
      setPhase('connecting')
      setError(null)

      try {
        const { iceServers } = await fetchWebRtcIce()
        const status = await fetchWebRtcStatus()
        if (status.count >= status.max) {
          throw new Error(
            `WebRTC session limit reached (${status.max}) — close another camera and retry`,
          )
        }

        const pc = new RTCPeerConnection({ iceServers })
        if (cancelled) {
          pc.close()
          return
        }
        pcRef.current = pc

        pc.addTransceiver('video', { direction: 'recvonly' })
        pc.ontrack = (event) => {
          const video = videoRef.current
          if (!video) {
            return
          }
          video.srcObject =
            event.streams[0] ?? new MediaStream([event.track])
        }

        await pc.setLocalDescription(await pc.createOffer())
        await waitIceGatheringComplete(pc)

        if (cancelled) {
          pc.close()
          pcRef.current = null
          return
        }

        const offerSdp = pc.localDescription?.sdp
        if (!offerSdp) {
          throw new Error('Missing SDP offer')
        }

        const { sdp, sessionId } = await postWhep(cameraId, mode, offerSdp)

        if (cancelled) {
          await deleteWebRtcSession(cameraId, sessionId).catch(() => undefined)
          pc.close()
          pcRef.current = null
          return
        }

        sessionIdRef.current = sessionId
        await pc.setRemoteDescription({ type: 'answer', sdp })
        setPhase('live')
      } catch (caught) {
        if (cancelled) {
          return
        }
        clearPeer()
        sessionIdRef.current = null
        setPhase('error')
        setError(
          caught instanceof Error ? caught.message : 'Could not connect WebRTC',
        )
      }
    }

    void connect()

    const onPageHide = () => {
      void hangup({ keepalive: true })
    }
    window.addEventListener('pagehide', onPageHide)

    return () => {
      cancelled = true
      window.removeEventListener('pagehide', onPageHide)
      void hangup()
    }
  }, [cameraId, mode, enabled, retryKey, hangup, clearPeer])

  return {
    videoRef,
    phase,
    error,
    isLive: phase === 'live',
    hangup,
    retry,
  }
}
