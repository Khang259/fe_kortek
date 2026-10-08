import { X } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useLogFilterStore } from '@/features/logs/stores/log-filter-store'

/**
 * Dùng input datetime-local thay vì date-picker riêng: chọn được cả ngày và
 * giờ trong một ô, không thêm thư viện, và trình duyệt tự lo phần bản địa hoá.
 */
export function LogTimeFilter() {
  const from = useLogFilterStore((state) => state.from)
  const to = useLogFilterStore((state) => state.to)
  const setFrom = useLogFilterStore((state) => state.setFrom)
  const setTo = useLogFilterStore((state) => state.setTo)
  const resetTimeRange = useLogFilterStore((state) => state.resetTimeRange)

  const hasRange = from !== '' || to !== ''

  return (
    <div className="flex flex-wrap items-center gap-1.5 text-[10px] text-muted-foreground">
      <span>From</span>
      <Input
        type="datetime-local"
        value={from}
        /** Không cho chọn mốc đầu muộn hơn mốc cuối. */
        max={to || undefined}
        onChange={(event) => setFrom(event.target.value)}
        aria-label="Start time"
        className="h-7 w-44 text-[10px]"
      />
      <span>to</span>
      <Input
        type="datetime-local"
        value={to}
        min={from || undefined}
        onChange={(event) => setTo(event.target.value)}
        aria-label="End time"
        className="h-7 w-44 text-[10px]"
      />
      {hasRange && (
        <Button
          variant="ghost"
          size="icon-xs"
          aria-label="Clear time filter"
          onClick={resetTimeRange}
        >
          <X />
        </Button>
      )}
    </div>
  )
}
