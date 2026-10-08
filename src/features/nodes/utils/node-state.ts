import type { NodeState, StatusTone } from '@/types'

export const nodeStateLabels: Record<NodeState, string> = {
  cargo: 'Cargo',
  clear: 'Clear',
  idle: 'Idle',
}

export const nodeStateTones: Record<NodeState, StatusTone> = {
  cargo: 'danger',
  clear: 'success',
  idle: 'neutral',
}

/** Màu viền + nền của marker trên map và vòng tròn nhỏ ở danh sách. */
export const nodeStateRingClasses: Record<NodeState, string> = {
  cargo: 'border-danger text-danger bg-danger-muted/50',
  clear: 'border-success text-success bg-success-muted/45',
  idle: 'border-faint text-muted-foreground bg-surface-overlay',
}
