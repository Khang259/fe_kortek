import type { HealthIndicator, SystemHealth } from '@/features/system/types'

/** Map payload get_health → hàng indicator topbar. */
export function healthToIndicators(health: SystemHealth): HealthIndicator[] {
  const ok = health.status === 'ok'
  const webrtcAlive = health.webrtc?.alive === true

  return [
    {
      id: 'status',
      label: ok ? 'System ok' : 'Degraded',
      tone: ok ? 'success' : 'warning',
      detail: health.message,
    },
    {
      id: 'mongo',
      label: health.mongo ? 'DB' : 'DB down',
      tone: health.mongo ? 'success' : 'danger',
    },
    {
      id: 'runtime',
      label: health.runtime_running ? 'Runtime' : 'Runtime off',
      tone: health.runtime_running ? 'success' : 'warning',
    },
    {
      id: 'webrtc',
      label: webrtcAlive ? 'WebRTC' : 'WebRTC off',
      tone: webrtcAlive ? 'success' : 'neutral',
      detail: webrtcAlive
        ? undefined
        : 'Media optional — app still runs when WebRTC is off',
    },
  ]
}
