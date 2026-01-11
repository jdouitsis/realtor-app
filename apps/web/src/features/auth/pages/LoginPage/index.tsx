import { getRouteApi } from '@tanstack/react-router'
import { useState } from 'react'

import { parseError } from '@/lib/errors'

import { OtpVerificationForm } from '../../components/OtpVerificationForm'
import { LoginForm, type LoginFormData } from './components/LoginForm'

const routeApi = getRouteApi('/_public/login/')

type Step = 'email' | 'otp'

interface OtpState {
  userId: string
  email: string
}

export function LoginPage() {
  const { auth } = routeApi.useRouteContext()
  const navigate = routeApi.useNavigate()
  const { redirect } = routeApi.useSearch()

  const [step, setStep] = useState<Step>('email')
  const [otpState, setOtpState] = useState<OtpState | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string>()

  const handleEmailSubmit = async (data: LoginFormData) => {
    setIsLoading(true)
    setError(undefined)
    try {
      const { userId } = await auth.login(data.email)
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
    <div className="flex flex-1 items-center justify-center bg-background p-4">
      {step === 'email' ? (
        <LoginForm onSubmit={handleEmailSubmit} isLoading={isLoading} error={error} />
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
