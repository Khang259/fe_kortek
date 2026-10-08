import type { ReactNode } from 'react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface PanelProps {
  title: ReactNode
  icon?: ReactNode
  actions?: ReactNode
  className?: string
  contentClassName?: string
  children: ReactNode
}

/** Khung panel chuẩn của console: header cao 40px + body. */
export function Panel({
  title,
  icon,
  actions,
  className,
  contentClassName,
  children,
}: PanelProps) {
  return (
    <Card
      className={cn(
        'gap-0 rounded-lg py-0 ring-border',
        className,
      )}
    >
      <CardHeader className="flex h-10 shrink-0 flex-row items-center justify-between gap-2 border-b bg-surface-raised px-3">
        <CardTitle className="flex items-center gap-2 text-xs font-semibold">
          {icon}
          {title}
        </CardTitle>
        {actions ? (
          <div className="flex items-center gap-3">{actions}</div>
        ) : null}
      </CardHeader>
      <CardContent
        className={cn('flex min-h-0 flex-1 flex-col p-3', contentClassName)}
      >
        {children}
      </CardContent>
    </Card>
  )
}
