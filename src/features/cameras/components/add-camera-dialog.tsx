import { FilterSelect } from '@/components/common/filter-select'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { useAddCameraForm } from '@/features/cameras/hooks/use-add-camera-form'

interface AddCameraDialogProps {
  open: boolean
  onClose: () => void
}

export function AddCameraDialog({ open, onClose }: AddCameraDialogProps) {
  const form = useAddCameraForm(onClose)

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) {
          onClose()
        }
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xs font-semibold">
            Add camera
          </DialogTitle>
        </DialogHeader>

        <div className="grid gap-2 text-[11px]">
          {!form.canWriteConfig ? (
            <p className="text-warning">{form.gateMessage}</p>
          ) : null}

          <label className="grid gap-1">
            <span className="text-muted-foreground">Name *</span>
            <Input
              value={form.name}
              onChange={(event) => form.setName(event.target.value)}
              placeholder="AE5-CAM-06"
              className="h-8 text-[11px]"
            />
          </label>
          <label className="grid gap-1">
            <span className="text-muted-foreground">RTSP URL *</span>
            <Input
              value={form.rtspUrl}
              onChange={(event) => form.setRtspUrl(event.target.value)}
              placeholder="rtsp://host/stream"
              className="h-8 font-mono text-[11px]"
            />
          </label>
          <FilterSelect
            label="Zone (optional)"
            value={form.zone}
            options={form.zoneOptions}
            onChange={form.setZone}
            className="text-[11px]"
          />
          <label className="grid gap-1">
            <span className="text-muted-foreground">
              Observed nodes (optional, comma-separated nodeIds)
            </span>
            <Input
              value={form.nodeIdDraft}
              onChange={(event) => form.setNodeIdDraft(event.target.value)}
              placeholder={form.nodePlaceholder}
              className="h-8 font-mono text-[11px]"
            />
          </label>
          {form.newStartIds.length > 0 ? (
            <div className="grid gap-1.5 rounded-md border px-2 py-2">
              <span className="text-[10px] text-muted-foreground">
                New start priority (unique within Zone) *
              </span>
              {form.newStartIds.map((id) => (
                <label
                  key={id}
                  className="flex items-center gap-2 font-mono text-[10px]"
                >
                  <span className="min-w-0 flex-1 truncate" title={id}>
                    {id}
                  </span>
                  <Input
                    type="number"
                    min={0}
                    step={1}
                    value={form.startPriorities[id] ?? ''}
                    onChange={(event) =>
                      form.setStartPriorities((prev) => ({
                        ...prev,
                        [id]: event.target.value,
                      }))
                    }
                    aria-label={`Priority ${id}`}
                    className="h-7 w-20 font-mono text-[10px]"
                  />
                </label>
              ))}
            </div>
          ) : null}
          {form.needsZoneForNodes ? (
            <p className="text-[10px] text-danger">
              Select a Zone when observed nodes are set.
            </p>
          ) : null}
          {form.priorityError ? (
            <p className="text-[10px] text-danger">{form.priorityError}</p>
          ) : null}
          <div className="flex justify-end gap-2 pt-1">
            <Button variant="outline" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button
              size="sm"
              disabled={!form.canSubmit || form.isPending}
              onClick={form.handleSubmit}
            >
              {form.isPending ? 'Creating…' : 'Save camera'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
