import { RegisterForm, type RegisterFormData } from './components/RegisterForm'
import { useNavigate } from '@tanstack/react-router'
import { useAuth } from '../../hooks/useAuth'

export function RegisterPage() {
  const navigate = useNavigate()
  const { register } = useAuth()

  const handleSubmit = async (data: RegisterFormData) => {
    await register(data.email, data.password, data.name)
    void navigate({ to: '/dashboard' })
  }

  return (
    <div className="h-full flex items-center justify-center bg-background p-4">
      <RegisterForm onSubmit={handleSubmit} />
    </div>
  )
}
