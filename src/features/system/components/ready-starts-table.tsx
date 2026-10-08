import { StatusBadge } from '@/components/common/status-badge'
import type { ReadyStart } from '@/features/system/types'

interface ReadyStartsTableProps {
  items: ReadyStart[]
}

/**
 * Bảng start đang isReady — preview batch / trạng thái gửi.
 */
export function ReadyStartsTable({ items }: ReadyStartsTableProps) {
  if (items.length === 0) {
    return (
      <p className="px-3 py-4 text-center text-[11px] text-muted-foreground">
        No isReady starts yet
      </p>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-[11px]">
        <thead className="border-b text-muted-foreground">
          <tr>
            <th className="px-3 py-1.5 font-medium">Node</th>
            <th className="px-3 py-1.5 font-medium">Zone</th>
            <th className="px-3 py-1.5 font-medium">P</th>
            <th className="px-3 py-1.5 font-medium">Status</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.nodeId} className="border-b border-border/60 last:border-0">
              <td className="px-3 py-1.5 font-mono">{item.nodeId}</td>
              <td className="px-3 py-1.5">{item.zoneId}</td>
              <td className="px-3 py-1.5">{item.priority}</td>
              <td className="px-3 py-1.5">
                <span className="inline-flex flex-wrap gap-1">
                  {item.inBatch ? (
                    <StatusBadge tone="info">inBatch</StatusBadge>
                  ) : null}
                  {item.dispatched ? (
                    <StatusBadge tone="success">dispatched</StatusBadge>
                  ) : (
                    <StatusBadge tone="neutral">ready</StatusBadge>
                  )}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
