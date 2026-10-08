import type { SystemConfig, SystemHealth } from '@/features/system/types'

export const systemConfigFixture: SystemConfig = {
  runtimeStatus: 'healthy',
  entries: [
    { id: 'database', label: 'Database', value: 'postgres://warehouse-db.internal:5432/amr' },
    { id: 'gpu', label: 'GPU inference', value: 'cuda:0 · YOLOv8 warehouse' },
    { id: 'dispatch-interval', label: 'Dispatch interval', value: '500ms' },
    { id: 'detection-threshold', label: 'Detection threshold', value: '0.70' },
  ],
}

export const systemHealthOkFixture: SystemHealth = {
  status: 'ok',
  service: 'AMR Camera System',
  mongo: true,
  runtime_running: true,
  webrtc: { alive: true, owned: true, watchdog: true },
}

export const systemHealthDegradedFixture: SystemHealth = {
  status: 'degraded',
  service: 'AMR Camera System',
  mongo: true,
  runtime_running: false,
  webrtc: { alive: false, owned: false, watchdog: false },
  message: 'degraded: runtime không sẵn sàng',
}
