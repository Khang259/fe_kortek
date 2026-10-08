import { env } from '@/config/env'

/**
 * Path WebRTC dưới `/api/v1/cameras/...` (Bearer + `camera.read`).
 * `path` bắt đầu bằng `/` (vd. `/webrtc/ice`).
 * @see docs/fe-api-webrtc.md
 */
export function camerasUrl(path: string): string {
  const normalized = path.startsWith('/') ? path : `/${path}`
  const base = env.apiUrl.replace(/\/$/, '')
  return `${base}/cameras${normalized}`
}
