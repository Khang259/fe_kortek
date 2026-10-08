import type { NextPair } from '@/features/system/types'

interface NextPairsListProps {
  items: NextPair[]
}

/**
 * Cặp sẽ gửi ở vòng kế (~1s) theo get_pending_pairs.
 */
export function NextPairsList({ items }: NextPairsListProps) {
  if (items.length === 0) {
    return (
      <p className="px-3 py-2 text-[11px] text-muted-foreground">
        No next pairs (end not ready or no ready start)
      </p>
    )
  }

  return (
    <ul className="divide-y text-[11px]">
      {items.map((pair) => (
        <li
          key={`${pair.startNodeId}-${pair.endNodeId}`}
          className="flex items-center gap-2 px-3 py-1.5 font-mono"
        >
          <span>{pair.startNodeId}</span>
          <span className="text-muted-foreground">→</span>
          <span>{pair.endNodeId}</span>
        </li>
      ))}
    </ul>
  )
}
