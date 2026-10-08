import { Eye, EyeOff, LogIn } from 'lucide-react'
import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ROUTES } from '@/config/routes'
import { useLogin } from '@/features/auth/api/login'

export function LoginForm() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const login = useLogin()
  const navigate = useNavigate()
  const location = useLocation()

  const redirectTo =
    (location.state as { from?: string } | null)?.from ?? ROUTES.dashboard

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    login.mutate(
      { username, password },
      { onSuccess: () => navigate(redirectTo, { replace: true }) },
    )
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-3">
      <label className="grid gap-1.5 text-[11px] text-muted-foreground">
        Username
        <Input
          value={username}
          onChange={(event) => setUsername(event.target.value)}
          autoComplete="username"
          required
        />
      </label>

      <label className="grid gap-1.5 text-[11px] text-muted-foreground">
        Password
        <span className="relative block">
          <Input
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete="current-password"
            className="pr-9"
            required
          />
          <button
            type="button"
            className="absolute top-1/2 right-2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            onClick={() => setShowPassword((open) => !open)}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
        </span>
      </label>

      <Button type="submit" disabled={login.isPending} className="mt-1">
        <LogIn />
        {login.isPending ? 'Signing in…' : 'Sign in'}
      </Button>
    </form>
  )
}
