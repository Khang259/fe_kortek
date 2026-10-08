import type { ReactNode } from 'react'

import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { StatusTone } from '@/types'

const toneClasses: Record<StatusTone, string> = {
  success: 'bg-success-muted text-success',
  warning: 'bg-warning-muted text-warning',
  danger: 'bg-danger-muted text-danger',
  info: 'bg-info-muted text-info',
  purple: 'bg-purple-muted text-purple',
  neutral: 'border-border bg-secondary text-muted-foreground',
}

interface StatusBadgeProps {
  tone?: StatusTone
  className?: string
  children: ReactNode
}

export function StatusBadge({
  tone = 'neutral',
  className,
  children,
}: StatusBadgeProps) {
  return (
    <Badge
      variant="outline"
      className={cn('text-[10px] font-semibold', toneClasses[tone], className)}
    >
      {children}
    </Badge>
  )
}
