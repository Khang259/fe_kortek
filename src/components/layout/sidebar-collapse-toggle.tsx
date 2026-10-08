import { ChevronLeft, ChevronRight } from 'lucide-react'

interface SidebarCollapseToggleProps {
  isCollapsed: boolean
  onToggle: () => void
}

/** Chỉ hiện trên desktop — mobile đã dùng drawer nên không cần thu gọn. */
export function SidebarCollapseToggle({
  isCollapsed,
  onToggle,
}: SidebarCollapseToggleProps) {
  const label = isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'

  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={label}
      title={label}
      className="hidden w-full items-center justify-center gap-1.5 border-t py-2 text-[10px] text-muted-foreground hover:bg-surface-overlay hover:text-foreground md:flex"
    >
      {isCollapsed ? (
        <ChevronRight className="size-4" />
      ) : (
        <>
          <ChevronLeft className="size-4" />
          Collapse
        </>
      )}
    </button>
  )
}
