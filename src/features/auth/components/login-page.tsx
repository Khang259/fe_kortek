import { Package } from 'lucide-react'
import { Navigate } from 'react-router'

import { Card } from '@/components/ui/card'
import { ROUTES } from '@/config/routes'
import { LoginForm } from '@/features/auth/components/login-form'
import { useSessionStore } from '@/stores/session-store'

export function LoginPage() {
  const accessToken = useSessionStore((state) => state.accessToken)

  if (accessToken) {
    return <Navigate to={ROUTES.dashboard} replace />
  }

  return (
    <div className="grid min-h-screen place-items-center bg-background p-6">
      <Card className="w-full max-w-sm gap-4 rounded-lg p-5 ring-border">
        <div className="flex items-center gap-2.5 text-sm font-semibold">
          <span className="grid size-7 place-items-center rounded-md bg-primary/40 text-info">
            <Package className="size-4" />
          </span>
          AMR Warehouse
        </div>
        <p className="text-[11px] text-muted-foreground">
          Sign in to access the operations console.
        </p>
        <LoginForm />
      </Card>
    </div>
  )
}
