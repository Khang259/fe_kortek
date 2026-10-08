import type { NodeLock } from '@/types'

export const EMPTY_NODE_LOCK: NodeLock = {
  user: false,
  system: false,
  orderId: null,
}

/** Node bị chặn auto-dispatch nếu user hoặc system lock. */
export function isNodeLocked(lock: NodeLock | null | undefined) {
  return lock?.user === true || lock?.system === true
}

export function nodeLockSummary(lock: NodeLock): string {
  const parts: string[] = []
  if (lock.user) {
    parts.push('user')
  }
  if (lock.system) {
    parts.push(lock.orderId ? `system (${lock.orderId})` : 'system')
  }
  return parts.length > 0 ? parts.join(' · ') : 'unlocked'
}

/**
 * Chuẩn hoá `lock` từ get_nodes.
 * Legacy `commandLock` / null → unlocked.
 */
export function normalizeNodeLock(raw: unknown): NodeLock {
  if (!raw || typeof raw !== 'object') {
    return { ...EMPTY_NODE_LOCK }
  }

  const record = raw as Record<string, unknown>

  /** Contract mới: { user, system, orderId } */
  if ('user' in record || 'system' in record) {
    return {
      user: Boolean(record.user),
      system: Boolean(record.system),
      orderId:
        typeof record.orderId === 'string' && record.orderId.trim() !== ''
          ? record.orderId
          : null,
    }
  }

  /** Legacy commandLock.enabled → map tạm sang user. */
  if ('enabled' in record) {
    return {
      user: Boolean(record.enabled),
      system: false,
      orderId: null,
    }
  }

  return { ...EMPTY_NODE_LOCK }
}
