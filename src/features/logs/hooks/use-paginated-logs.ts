import { useLogFilterStore } from '@/features/logs/stores/log-filter-store'

/**
 * Map `total` từ API → props `PaginationBar`.
 * Phân trang thật ở server (đợt 4); hook chỉ tính range hiển thị.
 */
export function useLogPagination(total: number) {
  const page = useLogFilterStore((state) => state.page)
  const pageSize = useLogFilterStore((state) => state.pageSize)
  const setPage = useLogFilterStore((state) => state.setPage)
  const setPageSize = useLogFilterStore((state) => state.setPageSize)

  const totalPages = Math.max(1, Math.ceil(total / pageSize) || 1)
  const safePage = Math.min(page, totalPages)
  const startIndex = (safePage - 1) * pageSize

  return {
    page: safePage,
    totalPages,
    pageSize,
    total,
    rangeStart: total === 0 ? 0 : startIndex + 1,
    rangeEnd: Math.min(startIndex + pageSize, total),
    onPageChange: setPage,
    onPageSizeChange: setPageSize,
  }
}
