import { useNavigate, useSearch } from '@tanstack/react-router'
import { useState } from 'react'

import { parseError } from '@/lib/errors'

import { OtpVerificationForm } from '../../components/OtpVerificationForm'
import { useAuth } from '../../hooks/useAuth'
import { LoginForm, type LoginFormData } from './components/LoginForm'

type Step = 'email' | 'otp'

interface OtpState {
  userId: string
  email: string
}

export function LoginPage() {
  const navigate = useNavigate()
  const search = useSearch({ from: '/_public/login' })
  const { login, verifyOtp, resendOtp } = useAuth()

  const [step, setStep] = useState<Step>('email')
  const [otpState, setOtpState] = useState<OtpState | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string>()

  const handleEmailSubmit = async (data: LoginFormData) => {
    setIsLoading(true)
    setError(undefined)
    try {
      const { userId } = await login(data.email)
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
      await verifyOtp(otpState.userId, code)
      void navigate({ to: search.redirect ?? '/dashboard' })
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
      await resendOtp(otpState.userId)
    } catch (err) {
      setError(parseError(err).userMessage)
    }
  }

  return (
    <div className="h-full flex items-center justify-center bg-background p-4">
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
