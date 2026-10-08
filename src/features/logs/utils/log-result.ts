import type { ActionResult } from '@/features/logs/types'
import type { StatusTone } from '@/types'

export const actionResultLabels: Record<ActionResult, string> = {
  success: 'Success',
  failed: 'Failed',
}

export const actionResultTones: Record<ActionResult, StatusTone> = {
  success: 'success',
  failed: 'danger',
}

export function actionResultLabel(result: string) {
  if (result === 'success' || result === 'failed') {
    return actionResultLabels[result]
  }
  return result
}

export function actionResultTone(result: string): StatusTone {
  if (result === 'success' || result === 'failed') {
    return actionResultTones[result]
  }
  return 'neutral'
}

/** Nhãn action system log — @see docs/fe-api-unlock-by-order-status.md */
export const systemActionLabels: Record<string, string> = {
  dispatch: 'Dispatch ICS',
  unlock_by_order_status: 'ICS callback',
}

export function systemActionLabel(action: string) {
  return systemActionLabels[action] ?? action
}

export function isDispatchFailedLog(log: {
  action: string
  result: string
}) {
  return log.action === 'dispatch' && log.result === 'failed'
}

const knownAuditLabels: Record<string, string> = {
  login_success: 'Login',
  login_failed: 'Login failed',
  logout: 'Logout',
  login: 'Login',
}

export function auditActionLabel(action: string) {
  return knownAuditLabels[action] ?? action
}

export function auditActionTone(action: string): StatusTone {
  if (action.includes('fail')) {
    return 'danger'
  }
  if (action.includes('logout')) {
    return 'neutral'
  }
  return 'success'
}

/** HTTP status → badge cho user action log. */
export function httpStatusTone(status: number): StatusTone {
  if (status >= 500) return 'danger'
  if (status >= 400) return 'warning'
  if (status >= 200 && status < 300) return 'success'
  return 'neutral'
}
