/**
 * Mã quyền do backend trả trong `permissions[]`.
 * FE chỉ so khớp chuỗi này — không map từ `role`.
 */
export const PERMISSIONS = {
  cameraRead: 'camera.read',
  cameraWrite: 'camera.write',
  nodeRead: 'node.read',
  nodeMaintenance: 'node.maintenance',
  pairRead: 'pair.read',
  pairWrite: 'pair.write',
  zoneControl: 'zone.control',
  systemControl: 'system.control',
  logsRead: 'logs.read',
  mapRead: 'map.read',
  mapWrite: 'map.write',
} as const

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS]

/** Quyền đầy đủ (admin) — dùng mock và kiểm thử. */
export const ALL_PERMISSIONS: Permission[] = Object.values(PERMISSIONS)

/** Quyền operator theo seed backend (không có system.control / map.write). */
export const OPERATOR_PERMISSIONS: Permission[] = [
  PERMISSIONS.cameraRead,
  PERMISSIONS.cameraWrite,
  PERMISSIONS.nodeRead,
  PERMISSIONS.nodeMaintenance,
  PERMISSIONS.pairRead,
  PERMISSIONS.pairWrite,
  PERMISSIONS.zoneControl,
  PERMISSIONS.logsRead,
  PERMISSIONS.mapRead,
]
