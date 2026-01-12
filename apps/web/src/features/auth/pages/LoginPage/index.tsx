import { getRouteApi } from '@tanstack/react-router'
import { useState } from 'react'

import { OtpVerificationForm } from '../../components/OtpVerificationForm'
import { LoginForm, type LoginFormData } from './components/LoginForm'

const routeApi = getRouteApi('/_public/login/')

type Step = 'email' | 'otp'

export function LoginPage() {
  const { auth } = routeApi.useRouteContext()
  const navigate = routeApi.useNavigate()
  const { redirect } = routeApi.useSearch()

  const [step, setStep] = useState<Step>('email')
  const [otpEmail, setOtpEmail] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string>()

  const handleEmailSubmit = async (data: LoginFormData) => {
    setIsLoading(true)
    setError(undefined)
    await auth
      .login(data.email)
      .then(({ email }) => {
        setOtpEmail(email)
        setStep('otp')
      })
      .catch(setError)
      .finally(() => setIsLoading(false))
  }

  const handleOtpSubmit = async (code: string) => {
    if (!otpEmail) return
    setIsLoading(true)
    setError(undefined)
    await auth
      .verifyOtp(otpEmail, code)
      .then(() => navigate({ to: redirect ?? '/dashboard' }))
      .catch(setError)
      .finally(() => setIsLoading(false))
  }

  const handleResend = async () => {
    if (!otpEmail) return
    setError(undefined)
    await auth
      .resendOtp(otpEmail)
      .catch(setError)
      .finally(() => setIsLoading(false))
  }

  return (
    <div className="flex flex-1 items-center justify-center bg-background p-4">
      {step === 'email' ? (
        <LoginForm onSubmit={handleEmailSubmit} isLoading={isLoading} error={error} />
      ) : otpEmail ? (
        <OtpVerificationForm
          email={otpEmail}
          onSubmit={handleOtpSubmit}
          onResend={handleResend}
          isLoading={isLoading}
          error={error}
        />
      ) : null}
    </div>
  )
}
