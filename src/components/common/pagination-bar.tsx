import { ChevronLeft, ChevronRight } from 'lucide-react'

import { FilterSelect } from '@/components/common/filter-select'
import { Button } from '@/components/ui/button'
import { PAGE_SIZE_OPTIONS } from '@/config/constants'

const pageSizeOptions = PAGE_SIZE_OPTIONS.map((size) => ({
  label: `${size} / page`,
  value: String(size),
}))

interface PaginationBarProps {
  page: number
  totalPages: number
  pageSize: number
  total: number
  rangeStart: number
  rangeEnd: number
  onPageChange: (page: number) => void
  onPageSizeChange: (pageSize: number) => void
}

/** Thanh phân trang thuần trình bày — không tự fetch, nhận hết qua props. */
export function PaginationBar({
  page,
  totalPages,
  pageSize,
  total,
  rangeStart,
  rangeEnd,
  onPageChange,
  onPageSizeChange,
}: PaginationBarProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2 border-t bg-surface-raised px-3 py-2 text-[10px] text-muted-foreground">
      <span>
        Showing <b className="text-foreground">{rangeStart}</b>–
        <b className="text-foreground">{rangeEnd}</b> of{' '}
        <b className="text-foreground">{total}</b> records
      </span>

      <div className="flex items-center gap-2">
        <FilterSelect
          label="Records per page"
          value={String(pageSize)}
          options={pageSizeOptions}
          onChange={(value) => onPageSizeChange(Number(value))}
          className="h-7 min-w-28 text-[10px]"
        />
        <Button
          variant="outline"
          size="icon-xs"
          aria-label="Previous page"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
        >
          <ChevronLeft />
        </Button>
        <span>
          Page <b className="text-foreground">{page}</b> / {totalPages}
        </span>
        <Button
          variant="outline"
          size="icon-xs"
          aria-label="Next page"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
        >
          <ChevronRight />
        </Button>
      </div>
    </div>
  )
}
