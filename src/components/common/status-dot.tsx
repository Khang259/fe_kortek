import { cn } from '@/lib/utils'
import type { StatusTone } from '@/types'

const toneClasses: Record<StatusTone, string> = {
  success: 'bg-success',
  warning: 'bg-warning',
  danger: 'bg-danger',
  info: 'bg-info',
  purple: 'bg-purple',
  neutral: 'bg-faint',
}

interface StatusDotProps {
  tone?: StatusTone
  className?: string
}

export function StatusDot({ tone = 'neutral', className }: StatusDotProps) {
  return (
    <span
      aria-hidden
      className={cn('inline-block size-1.5 rounded-full', toneClasses[tone], className)}
    />
  )
}
