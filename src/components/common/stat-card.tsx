import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import type { StatusTone } from '@/types'

const valueToneClasses: Record<StatusTone, string> = {
  success: 'text-success',
  warning: 'text-warning',
  danger: 'text-danger',
  info: 'text-info',
  purple: 'text-purple',
  neutral: 'text-foreground',
}

interface StatCardProps {
  label: string
  value: string
  hint?: string
  tone?: StatusTone
}

export function StatCard({
  label,
  value,
  hint,
  tone = 'neutral',
}: StatCardProps) {
  return (
    <Card className="gap-0 rounded-lg px-3 py-2.5 ring-border">
      <span className="text-[10px] text-muted-foreground">{label}</span>
      <strong
        className={cn('my-1 block text-xl font-medium', valueToneClasses[tone])}
      >
        {value}
      </strong>
      {hint ? <small className="text-[10px] text-faint">{hint}</small> : null}
    </Card>
  )
}
