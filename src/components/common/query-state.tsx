import type { ReactNode } from 'react'

import { cn } from '@/lib/utils'

interface QueryStateProps {
  isPending: boolean
  isError: boolean
  isEmpty?: boolean
  emptyMessage?: string
  children: ReactNode
}

/**
 * Gom 3 trạng thái lặp lại của mọi query (đang tải / lỗi / rỗng) về một chỗ
 * để component nghiệp vụ chỉ tập trung render dữ liệu.
 */
export function QueryState({
  isPending,
  isError,
  isEmpty = false,
  emptyMessage = 'No data',
  children,
}: QueryStateProps) {
  const message = isPending
    ? 'Loading…'
    : isError
      ? 'Failed to load data'
      : isEmpty
        ? emptyMessage
        : null

  if (message === null) {
    return <>{children}</>
  }

  return (
    <p
      role="status"
      className={cn(
        'px-3 py-6 text-center text-[11px]',
        isError ? 'text-danger' : 'text-muted-foreground',
      )}
    >
      {message}
    </p>
  )
}
