import { Link } from 'react-router'

import { Button } from '@/components/ui/button'
import { ROUTES } from '@/config/routes'

export function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-background p-6 text-center">
      <p className="text-2xl font-semibold text-muted-foreground">404</p>
      <h1 className="text-sm font-semibold">Page not found</h1>
      <Button variant="outline" render={<Link to={ROUTES.dashboard} />}>
        Back to dashboard
      </Button>
    </div>
  )
}
