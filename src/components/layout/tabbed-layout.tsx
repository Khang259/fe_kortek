import { Outlet, useLocation, useNavigate } from 'react-router'

import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { cn } from '@/lib/utils'

export interface LayoutTab {
  label: string
  to: string
}

interface TabbedLayoutProps {
  tabs: LayoutTab[]
  contentClassName?: string
}

/** URL là nguồn sự thật của tab đang mở, nhờ đó reload/share link vẫn đúng. */
export function TabbedLayout({ tabs, contentClassName }: TabbedLayoutProps) {
  const { pathname } = useLocation()
  const navigate = useNavigate()

  return (
    <main className="min-w-0">
      <Tabs
        value={pathname}
        onValueChange={(value) => navigate(String(value))}
        className="gap-0"
      >
        <TabsList
          variant="line"
          className="h-auto w-full justify-start rounded-none border-b bg-card px-4"
        >
          {tabs.map((tab) => (
            <TabsTrigger
              key={tab.to}
              value={tab.to}
              className="flex-none px-3 py-3 text-xs"
            >
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
      <div className={cn('p-5', contentClassName)}>
        <Outlet />
      </div>
    </main>
  )
}
