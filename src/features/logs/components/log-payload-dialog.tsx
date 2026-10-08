import { JsonBlock } from '@/components/common/json-block'
import { SnapshotImage } from '@/components/common/snapshot-image'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useLogPayloadStore } from '@/features/logs/stores/log-payload-store'
import { OrderSnapshot } from '@/features/snapshots'

export function LogPayloadDialog() {
  const payload = useLogPayloadStore((state) => state.payload)
  const close = useLogPayloadStore((state) => state.close)
  const showOrderSnapshot = Boolean(payload?.snapshotOrderId)
  const showStaticSnapshot =
    !showOrderSnapshot && payload?.snapshotUrl !== undefined

  return (
    <Dialog
      open={payload !== null}
      onOpenChange={(open) => {
        if (!open) close()
      }}
    >
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="font-mono text-xs font-semibold">
            {payload?.title}
          </DialogTitle>
        </DialogHeader>
        <div className="grid max-h-[70vh] gap-3 overflow-auto">
          {showOrderSnapshot && payload?.snapshotOrderId ? (
            <div className="grid gap-1.5">
              <span className="text-[10px] font-semibold text-muted-foreground">
                Trace image
              </span>
              <OrderSnapshot orderId={payload.snapshotOrderId} />
            </div>
          ) : null}

          {showStaticSnapshot ? (
            <div className="grid gap-1.5">
              <span className="text-[10px] font-semibold text-muted-foreground">
                Trace image
              </span>
              <SnapshotImage
                url={payload?.snapshotUrl ?? null}
                alt={`Scene image for ${payload?.title}`}
              />
            </div>
          ) : null}

          {payload?.sections.map((section) => (
            <div key={section.label} className="grid gap-1.5">
              <span className="text-[10px] font-semibold text-muted-foreground">
                {section.label}
              </span>
              <JsonBlock data={section.data} />
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}
