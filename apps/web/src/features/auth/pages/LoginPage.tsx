
import { LoginForm, type LoginFormData } from '../components/LoginForm'
import { useNavigate } from '@tanstack/react-router'
export function LoginPage() {
  const navigate = useNavigate()

  const handleSubmit = (data: LoginFormData) => {
    console.log(data)
    navigate({ to: '/dashboard' })
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <LoginForm onSubmit={handleSubmit} />
    </div>
  )
}
