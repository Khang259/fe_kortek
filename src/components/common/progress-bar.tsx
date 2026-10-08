import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'
import type { StatusTone } from '@/types'

const toneClasses: Record<StatusTone, string> = {
  success: '[&_[data-slot=progress-indicator]]:bg-success',
  warning: '[&_[data-slot=progress-indicator]]:bg-warning',
  danger: '[&_[data-slot=progress-indicator]]:bg-danger',
  info: '[&_[data-slot=progress-indicator]]:bg-info',
  purple: '[&_[data-slot=progress-indicator]]:bg-purple',
  neutral: '[&_[data-slot=progress-indicator]]:bg-faint',
}

interface ProgressBarProps {
  value: number
  label: string
  tone?: StatusTone
  className?: string
}

export function ProgressBar({
  value,
  label,
  tone = 'info',
  className,
}: ProgressBarProps) {
  return (
    <Progress
      value={value}
      aria-label={label}
      className={cn('w-full', toneClasses[tone], className)}
    />
  )
}
