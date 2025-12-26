import { useState } from 'react'

import { useNavigate } from '@tanstack/react-router'

import { parseError } from '@/lib/errors'

import { OtpVerificationForm } from '../../components/OtpVerificationForm'
import { useAuth } from '../../hooks/useAuth'
import { RegisterForm, type RegisterFormData } from './components/RegisterForm'

type Step = 'register' | 'otp'

interface OtpState {
  userId: string
  email: string
}

export function RegisterPage() {
  const navigate = useNavigate()
  const { register, verifyOtp, resendOtp } = useAuth()

  const [step, setStep] = useState<Step>('register')
  const [otpState, setOtpState] = useState<OtpState | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string>()

  const handleRegisterSubmit = async (data: RegisterFormData) => {
    setIsLoading(true)
    setError(undefined)
    try {
      const { userId } = await register(data.email, data.name)
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
      void navigate({ to: '/dashboard' })
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
