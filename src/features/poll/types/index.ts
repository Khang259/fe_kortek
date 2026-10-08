import type { NodeRuntimeSnapshot } from '@/features/nodes/types/runtime'

/** Payload rút gọn từ `GET /poll/get_snapshot`. */
export interface PollCameraItem {
  cameraId: number
  status: 'streaming' | 'offline' | 'disabled'
  enabled: boolean
  zone: string
  error: string | null
}

export interface PollZoneItem {
  id: string
  isRunning: boolean
  isStreaming: boolean
  isConfigEnabled: boolean
  cameraCount: number
  nodeCount: number
}

export interface PollSnapshot {
  serverTime: string
  pollIntervalSec: number
  etag: string
  cameras?: { items: PollCameraItem[] }
  zones?: { items: PollZoneItem[] }
  notifications?: { unreadCount: number }
  map?: { activeVersionId: string | null }
  /** Runtime nodes RAM — cùng shape `get_runtime_state`. */
  nodes?: NodeRuntimeSnapshot
}
