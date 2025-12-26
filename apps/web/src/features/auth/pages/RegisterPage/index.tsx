import { useNavigate } from '@tanstack/react-router'

import { parseError } from '@/lib/errors'

import { useAuth } from '../../hooks/useAuth'
import { RegisterForm, type RegisterFormData } from './components/RegisterForm'

export function RegisterPage() {
  const navigate = useNavigate()
  const { register } = useAuth()

  const handleSubmit = async (data: RegisterFormData) => {
    await register(data.email, data.password, data.name)
      .then(() => {
        void navigate({ to: '/dashboard' })
      })
      .catch((error) => {
        console.error(parseError(error).debugMessage)
      })
  }

  return (
    <div className="h-full flex items-center justify-center bg-background p-4">
      <RegisterForm onSubmit={handleSubmit} />
    </div>
  )
}
