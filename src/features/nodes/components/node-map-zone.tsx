import { cn } from '@/lib/utils'

interface NodeMapZoneProps {
  label: string
  className: string
}

export function NodeMapZone({ label, className }: NodeMapZoneProps) {
  return (
    <div
      className={cn(
        'absolute top-[10%] h-[78%] rounded-md border border-dashed',
        className,
      )}
    >
      <span className="absolute top-2 left-2 text-[10px] font-semibold">
        {label}
      </span>
    </div>
  )
}
