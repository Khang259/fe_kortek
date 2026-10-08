import { DEFAULT_PAGE_SIZE } from '@/config/constants'

/** Props sẵn cho `PaginationBar` + chỉ số slice list (client-side). */
export function buildListPagination(
  total: number,
  page: number,
  pageSize: number,
  onPageChange: (page: number) => void,
  onPageSizeChange: (pageSize: number) => void,
) {
  const size = pageSize > 0 ? pageSize : DEFAULT_PAGE_SIZE
  const totalPages = Math.max(1, Math.ceil(total / size) || 1)
  const safePage = Math.min(Math.max(1, page), totalPages)
  const startIndex = (safePage - 1) * size

  return {
    page: safePage,
    totalPages,
    pageSize: size,
    total,
    rangeStart: total === 0 ? 0 : startIndex + 1,
    rangeEnd: Math.min(startIndex + size, total),
    onPageChange,
    onPageSizeChange,
    startIndex,
    endIndex: startIndex + size,
  }
}
