import { useNavigate, useSearch } from '@tanstack/react-router'

import { useAuth } from '../../hooks/useAuth'
import { LoginForm, type LoginFormData } from './components/LoginForm'

export function LoginPage() {
  const navigate = useNavigate()
  const search = useSearch({ from: '/_public/login' })
  const { login } = useAuth()

  const handleSubmit = async (data: LoginFormData) => {
    await login(data.email, data.password)
    void navigate({ to: search.redirect ?? '/dashboard' })
  }

  return (
    <div className="h-full flex items-center justify-center bg-background p-4">
      <LoginForm onSubmit={handleSubmit} />
    </div>
  )
}
