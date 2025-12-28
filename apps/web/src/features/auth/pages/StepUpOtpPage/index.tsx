import { getRouteApi, useNavigate } from '@tanstack/react-router'
import { useEffect, useState } from 'react'

import { parseError } from '@/lib/errors'
import { trpc } from '@/lib/trpc'

import { OtpVerificationForm } from '../../components/OtpVerificationForm'

const routeApi = getRouteApi('/_authenticated/otp')

export function StepUpOtpPage() {
  const { redirect } = routeApi.useSearch()
  const navigate = useNavigate()
  const [error, setError] = useState<string>()
  const [otpRequested, setOtpRequested] = useState(false)
  const { data: user } = trpc.auth.me.useQuery()

  const requestOtp = trpc.user.requestStepUpOtp.useMutation({
    onSuccess: () => {
      setOtpRequested(true)
      setError(undefined)
    },
    onError: (err) => {
      const parsed = parseError(err)
      setError(parsed.userMessage)
    },
  })

  const verifyOtp = trpc.user.verifyStepUpOtp.useMutation({
    onSuccess: () => {
      // Redirect back to where they came from, or default to profile
      void navigate({ to: redirect ?? '/profile' })
    },
    onError: (err) => {
      const parsed = parseError(err)
      setError(parsed.userMessage)
    },
  })

  // Request OTP on mount
  useEffect(() => {
    if (!otpRequested && !requestOtp.isPending) {
      requestOtp.mutate()
    }
  }, [otpRequested, requestOtp])

  const handleSubmit = (code: string) => {
    setError(undefined)
    verifyOtp.mutate({ code })
  }

  const handleResend = () => {
    setError(undefined)
    requestOtp.mutate()
  }

  if (!user) {
    return null
  }

  return (
    <div className="flex h-full items-center justify-center p-4">
      <OtpVerificationForm
        email={user.email}
        onSubmit={handleSubmit}
        onResend={handleResend}
        isLoading={requestOtp.isPending || verifyOtp.isPending}
        error={error}
      />
    </div>
  )
}
