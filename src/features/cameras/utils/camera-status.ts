import type { Camera, CameraStatus } from '@/features/cameras/types'
import type { StatusTone } from '@/types'

export const cameraStatusLabels: Record<CameraStatus, string> = {
  streaming: 'Streaming',
  offline: 'Offline',
  disabled: 'Disabled',
}

export const cameraStatusTones: Record<CameraStatus, StatusTone> = {
  streaming: 'success',
  offline: 'danger',
  disabled: 'neutral',
}

export interface CameraStatusCounts {
  total: number
  streaming: number
  offline: number
  disabled: number
}

export function countCamerasByStatus(cameras: Camera[]): CameraStatusCounts {
  return {
    total: cameras.length,
    streaming: cameras.filter((camera) => camera.status === 'streaming').length,
    offline: cameras.filter((camera) => camera.status === 'offline').length,
    disabled: cameras.filter((camera) => camera.status === 'disabled').length,
  }
}

export { formatRoiBox } from './roi-box'
