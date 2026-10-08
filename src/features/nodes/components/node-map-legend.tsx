import { Camera, Lock } from 'lucide-react'

import { MAP_STATUS_FILL } from '@/features/nodes/utils/map-status-style'

export function NodeMapLegend() {
  return (
    <div
      data-map-no-pan
      className="absolute bottom-2 left-2 flex flex-wrap gap-3 rounded-md border bg-surface-raised/95 px-2 py-1.5 text-[10px] text-muted-foreground"
    >
      <span className="flex items-center gap-1">
        <span
          className="size-2 rounded-full"
          style={{ backgroundColor: MAP_STATUS_FILL.detected }}
        />
        Detected
      </span>
      <span className="flex items-center gap-1">
        <span
          className="size-2 rounded-full"
          style={{ backgroundColor: MAP_STATUS_FILL.undetected }}
        />
        Undetected
      </span>
      <span className="flex items-center gap-1">
        <span
          className="size-2 rounded-full"
          style={{ backgroundColor: MAP_STATUS_FILL.unknown }}
        />
        Unknown
      </span>
      <span className="flex items-center gap-1">
        <span
          className="size-2 rounded-full"
          style={{ backgroundColor: MAP_STATUS_FILL.path }}
        />
        Path
      </span>
      <span className="flex items-center gap-1">
        <Camera className="size-2.5 text-success" />
        Cam streaming
      </span>
      <span className="flex items-center gap-1">
        <Camera className="size-2.5 text-danger" />
        Cam can&apos;t connect
      </span>
      <span className="flex items-center gap-1">
        <Lock className="size-2.5 text-warning" />
        Lock (user/system)
      </span>
    </div>
  )
}
