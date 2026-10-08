import type { ReactNode } from 'react'

import { QueryState } from '@/components/common/query-state'
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

interface TableShellProps {
  /** Chuỗi rỗng = cột không có tiêu đề (cột chứa nút hành động). */
  columns: string[]
  isPending: boolean
  isError: boolean
  isEmpty: boolean
  emptyMessage: string
  children: ReactNode
  /** Thanh phân trang. Hiện cả khi bảng rỗng để người dùng lùi lại được. */
  footer?: ReactNode
}

/** Vỏ bảng chuẩn: viền, header xám, và các trạng thái loading/error/empty. */
export function TableShell({
  columns,
  isPending,
  isError,
  isEmpty,
  emptyMessage,
  children,
  footer,
}: TableShellProps) {
  return (
    <div className="overflow-hidden rounded-lg border bg-card">
      <QueryState
        isPending={isPending}
        isError={isError}
        isEmpty={isEmpty}
        emptyMessage={emptyMessage}
      >
        <Table>
          <TableHeader>
            <TableRow className="bg-surface-raised hover:bg-surface-raised">
              {columns.map((column, index) => (
                <TableHead
                  key={column || index}
                  className="h-9 text-[10px] font-semibold text-muted-foreground"
                >
                  {column}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>{children}</TableBody>
        </Table>
      </QueryState>
      {footer}
    </div>
  )
}
