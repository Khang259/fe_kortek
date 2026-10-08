import { env } from '@/config/env'
import type {
  PreviewMeta,
  WebRtcIceResponse,
  WebRtcMode,
  WebRtcStatus,
  WhepErrorBody,
} from '@/features/cameras/types/webrtc'
import { camerasUrl } from '@/features/cameras/utils/cameras-url'
import { useSessionStore } from '@/stores/session-store'
import { mockRequest } from '@/testing/mock-request'

export const webrtcKeys = {
  all: ['webrtc'] as const,
  ice: () => [...webrtcKeys.all, 'ice'] as const,
  status: () => [...webrtcKeys.all, 'status'] as const,
  meta: (cameraId: number) => [...webrtcKeys.all, 'meta', cameraId] as const,
}

/** Bearer cho fetch thô (SDP / binary meta) — không đi qua axios interceptor. */
function bearerHeaders(extra?: HeadersInit): HeadersInit {
  const accessToken = useSessionStore.getState().accessToken
  return {
    ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    ...extra,
  }
}

function errorMessage(body: WhepErrorBody, fallback: string): string {
  if (typeof body.message === 'string' && body.message.trim() !== '') {
    return body.message
  }
  return fallback
}

/** `GET /api/v1/cameras/webrtc/ice` — Bearer + `camera.read`. */
export async function fetchWebRtcIce(): Promise<WebRtcIceResponse> {
  if (env.useMockApi) {
    return mockRequest({ iceServers: [] })
  }

  const res = await fetch(camerasUrl('/webrtc/ice'), {
    headers: bearerHeaders(),
  })
  if (!res.ok) {
    const err = (await res.json().catch(() => ({}))) as WhepErrorBody
    throw new Error(errorMessage(err, `ICE HTTP ${res.status}`))
  }
  return res.json() as Promise<WebRtcIceResponse>
}

/** `GET /api/v1/cameras/webrtc/status` — số slot đang dùng. */
export async function fetchWebRtcStatus(): Promise<WebRtcStatus> {
  if (env.useMockApi) {
    return mockRequest({ count: 0, max: 4 })
  }

  const res = await fetch(camerasUrl('/webrtc/status'), {
    headers: bearerHeaders(),
  })
  if (!res.ok) {
    const err = (await res.json().catch(() => ({}))) as WhepErrorBody
    throw new Error(errorMessage(err, `WebRTC status HTTP ${res.status}`))
  }
  return res.json() as Promise<WebRtcStatus>
}

export interface WhepConnectResult {
  sdp: string
  sessionId: string
}

/**
 * POST WHEP — body SDP raw, header application/sdp.
 * 201 → SDP answer + sessionId từ Location.
 */
export async function postWhep(
  cameraId: number,
  mode: WebRtcMode,
  offerSdp: string,
): Promise<WhepConnectResult> {
  const res = await fetch(
    camerasUrl(`/${cameraId}/webrtc/${mode}/whep`),
    {
      method: 'POST',
      headers: bearerHeaders({
        'Content-Type': 'application/sdp',
        Accept: 'application/sdp',
      }),
      body: offerSdp,
    },
  )

  if (res.status === 201) {
    const sdp = await res.text()
    const location = res.headers.get('Location') ?? ''
    const sessionId = location.split('/').filter(Boolean).pop()
    if (!sessionId) {
      throw new Error('WHEP 201 missing Location/sessionId')
    }
    return { sdp, sessionId }
  }

  const err = (await res.json().catch(() => ({}))) as WhepErrorBody
  const message = errorMessage(err, `WHEP ${res.status}`)
  if (res.status === 409) {
    throw new Error(`WebRTC session limit reached — ${message}`)
  }
  if (res.status === 503) {
    throw new Error(`MediaMTX not ready — ${message}`)
  }
  if (res.status === 404) {
    throw new Error(`Camera missing or no RTSP — ${message}`)
  }
  if (res.status === 401 || res.status === 403) {
    throw new Error(`WebRTC auth failed — ${message}`)
  }
  throw new Error(message)
}

/** `DELETE /api/v1/cameras/{id}/webrtc/sessions/{sessionId}` */
export async function deleteWebRtcSession(
  cameraId: number,
  sessionId: string,
  options?: { keepalive?: boolean },
): Promise<void> {
  if (env.useMockApi) {
    return
  }

  await fetch(camerasUrl(`/${cameraId}/webrtc/sessions/${sessionId}`), {
    method: 'DELETE',
    headers: bearerHeaders(),
    keepalive: options?.keepalive === true,
  })
}

/** BE có thể trả `cls` number (class id) — FE luôn normalize string. */
function normalizePreviewMeta(raw: PreviewMeta): PreviewMeta {
  return {
    w: Number(raw.w) || 0,
    h: Number(raw.h) || 0,
    ts: Number(raw.ts) || 0,
    rois: Array.isArray(raw.rois) ? raw.rois : [],
    dets: Array.isArray(raw.dets)
      ? raw.dets.map((det) => ({
          cls: String(det.cls ?? ''),
          conf: Number(det.conf) || 0,
          xyxy: det.xyxy,
        }))
      : [],
  }
}

/** `GET /api/v1/cameras/{id}/preview/meta` — chỉ mode detect. */
export async function fetchPreviewMeta(cameraId: number): Promise<PreviewMeta> {
  const res = await fetch(camerasUrl(`/${cameraId}/preview/meta`), {
    headers: bearerHeaders(),
  })
  if (!res.ok) {
    const err = (await res.json().catch(() => ({}))) as WhepErrorBody
    throw new Error(errorMessage(err, `preview/meta HTTP ${res.status}`))
  }
  const raw = (await res.json()) as PreviewMeta
  return normalizePreviewMeta(raw)
}
