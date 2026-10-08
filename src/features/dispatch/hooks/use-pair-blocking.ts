import type { NodePair } from '@/features/dispatch/types'

/**
 * Blocking do backend tính sẵn (`isBlocked` / `blockedReason`).
 * Hook chỉ chuẩn hoá để UI hiển thị — không suy luận lại từ nodes.
 */
export function usePairBlocking(pair: NodePair) {
  return {
    isBlocked: pair.isBlocked,
    blockedReason: pair.blockedReason,
  }
}
