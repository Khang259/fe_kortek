import { FILTER_ALL } from '@/config/constants'
import type { LogListParams } from '@/features/logs/types'

/**
 * datetime-local (`YYYY-MM-DDTHH:mm`) → ISO-8601 gửi API.
 * Rỗng = không lọc.
 */
export function toIsoQueryParam(localValue: string): string | undefined {
  if (!localValue.trim()) {
    return undefined
  }
  const date = new Date(localValue)
  if (Number.isNaN(date.getTime())) {
    return undefined
  }
  return date.toISOString()
}

export function buildLogQueryParams(params: LogListParams) {
  return {
    from: toIsoQueryParam(params.from ?? ''),
    to: toIsoQueryParam(params.to ?? ''),
    page: params.page,
    pageSize: params.pageSize,
    result:
      params.result && params.result !== FILTER_ALL
        ? params.result
        : undefined,
    action:
      params.action && params.action !== FILTER_ALL
        ? params.action
        : undefined,
  }
}

/** Lọc mock theo khoảng thời gian trên field `occurredAt`. */
export function filterMockByOccurredAt<
  T extends { occurredAt: string | null },
>(items: T[], from?: string, to?: string): T[] {
  const fromMs = from ? new Date(from).getTime() : null
  const toMs = to ? new Date(to).getTime() : null

  return items.filter((item) => {
    if (!item.occurredAt) {
      return false
    }
    const time = new Date(item.occurredAt).getTime()
    if (Number.isNaN(time)) {
      return false
    }
    if (fromMs !== null && !Number.isNaN(fromMs) && time < fromMs) {
      return false
    }
    if (toMs !== null && !Number.isNaN(toMs) && time > toMs) {
      return false
    }
    return true
  })
}
