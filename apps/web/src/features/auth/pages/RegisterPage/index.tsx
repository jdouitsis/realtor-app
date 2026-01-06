import { getRouteApi } from '@tanstack/react-router'
import { useState } from 'react'

import { parseError } from '@/lib/errors'

import { OtpVerificationForm } from '../../components/OtpVerificationForm'
import { RegisterForm, type RegisterFormData } from './components/RegisterForm'

const routeApi = getRouteApi('/_public/register')

type Step = 'register' | 'otp'

interface OtpState {
  userId: string
  email: string
}

export function RegisterPage() {
  const { auth } = routeApi.useRouteContext()
  const { redirect } = routeApi.useSearch()
  const navigate = routeApi.useNavigate()

  const [step, setStep] = useState<Step>('register')
  const [otpState, setOtpState] = useState<OtpState | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string>()

  const handleRegisterSubmit = async (data: RegisterFormData) => {
    setIsLoading(true)
    setError(undefined)
    try {
      const { userId } = await auth.register(data.email, data.name)
      setOtpState({ userId, email: data.email })
      setStep('otp')
    } catch (err) {
      setError(parseError(err).userMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const handleOtpSubmit = async (code: string) => {
    if (!otpState) return
    setIsLoading(true)
    setError(undefined)
    try {
      await auth.verifyOtp(otpState.userId, code)
      void navigate({ to: redirect ?? '/events' })
    } catch (err) {
      setError(parseError(err).userMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const handleResend = async () => {
    if (!otpState) return
    setError(undefined)
    try {
      await auth.resendOtp(otpState.userId)
    } catch (err) {
      setError(parseError(err).userMessage)
    }
  }

  return (
    <div className="h-full flex items-center justify-center bg-background p-4">
      {step === 'register' ? (
        <RegisterForm onSubmit={handleRegisterSubmit} isLoading={isLoading} error={error} />
      ) : otpState ? (
        <OtpVerificationForm
          email={otpState.email}
          onSubmit={handleOtpSubmit}
          onResend={handleResend}
          isLoading={isLoading}
          error={error}
        />
      ) : null}
    </div>
  )
}
