import { getRouteApi } from '@tanstack/react-router'
import { useState } from 'react'

import { parseError } from '@/lib/errors'

import { OtpVerificationForm } from '../../components/OtpVerificationForm'
import { RegisterForm, type RegisterFormData } from './components/RegisterForm'

const routeApi = getRouteApi('/_public/register')

type Step = 'register' | 'otp'

export function RegisterPage() {
  const { auth } = routeApi.useRouteContext()
  const { redirect } = routeApi.useSearch()
  const navigate = routeApi.useNavigate()

  const [step, setStep] = useState<Step>('register')
  const [otpEmail, setOtpEmail] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string>()

  const handleRegisterSubmit = async (data: RegisterFormData) => {
    setIsLoading(true)
    setError(undefined)
    try {
      await auth.register(data.email, data.name)
      setOtpEmail(data.email)
      setStep('otp')
    } catch (err) {
      setError(parseError(err).userMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const handleOtpSubmit = async (code: string) => {
    if (!otpEmail) return
    setIsLoading(true)
    setError(undefined)
    try {
      await auth.verifyOtp(otpEmail, code)
      void navigate({ to: redirect ?? '/dashboard' })
    } catch (err) {
      setError(parseError(err).userMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const handleResend = async () => {
    if (!otpEmail) return
    setError(undefined)
    try {
      await auth.resendOtp(otpEmail)
    } catch (err) {
      setError(parseError(err).userMessage)
    }
  }

  return (
    <div className="flex flex-1 items-center justify-center bg-background p-4">
      {step === 'register' ? (
        <RegisterForm onSubmit={handleRegisterSubmit} isLoading={isLoading} error={error} />
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
