import { dayjs } from '@/lib/dayjs'

/** 14:31 — dùng cho notification, dispatch. */
export const formatClock = (isoDate: string) => dayjs(isoDate).format('HH:mm')

/** 14:32:08 — dùng cho activity log. */
export const formatClockWithSeconds = (isoDate: string) =>
  dayjs(isoDate).format('HH:mm:ss')

/**
 * 12/06 14:32:10.418 — dùng cho bảng log.
 * Có millisecond để đối chiếu thứ tự hai bản ghi trong cùng một giây,
 * và có ngày vì log kéo dài nhiều ngày, chỉ giờ thì không xác định được.
 */
export const formatLogTimestamp = (isoDate: string) =>
  dayjs(isoDate).format('DD/MM HH:mm:ss.SSS')

/** "3 minutes ago" */
export const formatRelative = (isoDate: string) => dayjs(isoDate).fromNow()

export const formatPercent = (value: number) => `${Math.round(value)}%`

/** 18/50 */
export const formatRatio = (current: number, total: number) =>
  `${current}/${total}`

/** "Nguyễn Thành" → "NT". Dùng cho avatar, tránh phải lưu thêm field ở backend. */
export function getInitials(name: string) {
  const words = name.trim().split(/\s+/)
  const first = words[0]?.[0] ?? ''
  const last = words.length > 1 ? (words[words.length - 1]?.[0] ?? '') : ''
  return (first + last).toUpperCase()
}
