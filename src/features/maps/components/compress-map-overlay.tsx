import type { CameraStatus } from '@/features/cameras/types'

export function cameraStroke(status: CameraStatus | undefined) {
  return status === 'streaming' ? '#22c55e' : '#ef4444'
}

export type MapTooltip =
  | {
      kind: 'node'
      x: number
      y: number
      qr: string
      zone: string
      camera: string
      pairPoint: string
    }
  | {
      kind: 'camera'
      x: number
      y: number
      name: string
      zone: string
    }

export function CameraIcon({
  x,
  y,
  size,
  color,
}: {
  x: number
  y: number
  size: number
  color: string
}) {
  const w = size * 2.2
  const h = size * 1.6
  const left = x - w / 2
  const top = y - h / 2

  return (
    <g>
      <rect
        x={left}
        y={top}
        width={w}
        height={h}
        rx={size * 0.25}
        fill="var(--color-surface-raised, #111)"
        stroke={color}
        strokeWidth={size * 0.22}
      />
      <circle
        cx={x}
        cy={y}
        r={size * 0.55}
        fill="none"
        stroke={color}
        strokeWidth={size * 0.2}
      />
      <rect
        x={x + w * 0.28}
        y={y - h * 0.35}
        width={w * 0.22}
        height={h * 0.35}
        rx={size * 0.08}
        fill={color}
      />
    </g>
  )
}

/**
 * Tooltip cố định theo screen (fixed) — render ngoài layer scale qua portal.
 * Không đặt absolute trong CompressMapLayer kẻo bị zoom/rotate kéo lệch.
 */
export function MapHoverTooltip({ tip }: { tip: MapTooltip }) {
  return (
    <div
      data-map-no-pan
      className="pointer-events-none fixed z-50 max-w-56 rounded-md border bg-foreground px-2.5 py-2 text-[10px] text-background shadow-md"
      style={{
        left: tip.x,
        top: tip.y,
        transform: 'translate(-50%, calc(-100% - 8px))',
      }}
    >
      {tip.kind === 'node' ? (
        <div className="grid gap-0.5 whitespace-pre-wrap">
          <p>
            <span className="opacity-70">QR code: </span>
            {tip.qr || '—'}
          </p>
          <p>
            <span className="opacity-70">Zone: </span>
            {tip.zone || '—'}
          </p>
          <p>
            <span className="opacity-70">Camera: </span>
            {tip.camera || '—'}
          </p>
          <p>
            <span className="opacity-70">Pair point: </span>
            {tip.pairPoint || '—'}
          </p>
        </div>
      ) : (
        <div className="grid gap-0.5 whitespace-pre-wrap">
          <p className="font-semibold">{tip.name || 'Camera'}</p>
          <p>
            <span className="opacity-70">Zone: </span>
            {tip.zone || '—'}
          </p>
        </div>
      )}
    </div>
  )
}

export function pointsToPolyline(points: { x: number; y: number }[]) {
  return points.map((point) => `${point.x},${point.y}`).join(' ')
}

/** Marker nghiệp vụ: màu theo detected / undetected / unknown + badge lock. */
export function NodeMarker({
  x,
  y,
  fill,
  locked,
  markerR,
}: {
  x: number
  y: number
  fill: string
  locked: boolean
  markerR: number
}) {
  const badgeR = markerR * 0.45
  const badgeX = x + markerR * 0.75
  const badgeY = y - markerR * 0.75

  return (
    <>
      <circle
        cx={x}
        cy={y}
        r={markerR}
        fill={fill}
        stroke="var(--color-surface-raised, #111)"
        strokeWidth={markerR * 0.15}
        strokeDasharray={locked ? `${markerR * 0.35} ${markerR * 0.25}` : undefined}
      />
      <circle cx={x} cy={y} r={markerR * 1.6} fill="transparent" />
      {locked ? (
        <g>
          <circle
            cx={badgeX}
            cy={badgeY}
            r={badgeR}
            fill="var(--color-surface-raised, #111)"
            stroke="#f59e0b"
            strokeWidth={markerR * 0.12}
          />
          <rect
            x={badgeX - badgeR * 0.35}
            y={badgeY - badgeR * 0.1}
            width={badgeR * 0.7}
            height={badgeR * 0.55}
            rx={badgeR * 0.1}
            fill="#f59e0b"
          />
          <path
            d={`M ${badgeX - badgeR * 0.22} ${badgeY - badgeR * 0.05}
                v ${-badgeR * 0.28}
                a ${badgeR * 0.22} ${badgeR * 0.22} 0 0 1 ${badgeR * 0.44} 0
                v ${badgeR * 0.28}`}
            fill="none"
            stroke="#f59e0b"
            strokeWidth={markerR * 0.1}
          />
        </g>
      ) : null}
    </>
  )
}
