import { useEffect, useState } from 'react'

/** Hoãn cập nhật giá trị để tránh filter/gọi API mỗi lần gõ. */
export function useDebounce<TValue>(value: TValue, delayMs = 300): TValue {
  const [debounced, setDebounced] = useState(value)

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delayMs)
    return () => clearTimeout(timer)
  }, [value, delayMs])

  return debounced
}
