import type { PairType } from '@/features/dispatch/types'

/** `id` = `{start}:{end}` hoặc `{start}:_` (empty). */
export function buildPairId(
  startNodeId: string,
  endNodeId: string | null | undefined,
  pairType: PairType,
) {
  if (pairType === 'empty') {
    return `${startNodeId}:_`
  }
  return `${startNodeId}:${endNodeId}`
}

export function normalizePairEnd(
  pairType: PairType,
  endNodeId: string | null | undefined,
) {
  if (pairType === 'empty') {
    return '_'
  }
  return endNodeId?.trim() || ''
}
