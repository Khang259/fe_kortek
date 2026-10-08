import { useEffect } from 'react'

import { useThemeStore } from '@/stores/theme-store'

/** Đồng bộ theme trong store xuống class trên <html> để Tailwind bật biến thể dark:. */
export function useApplyTheme() {
  const theme = useThemeStore((state) => state.theme)

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
  }, [theme])
}
