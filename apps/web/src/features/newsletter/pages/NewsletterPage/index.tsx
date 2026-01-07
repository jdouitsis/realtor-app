import { zodResolver } from '@hookform/resolvers/zod'
import { useRouteContext } from '@tanstack/react-router'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod/v4'

import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
  Label,
} from '@/components/ui'
import { OtpVerificationForm } from '@/features/auth/components/OtpVerificationForm'
import { parseError } from '@/lib/errors'

import { NewsletterConfigForm } from './components/NewsletterConfigForm'

const signupSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().min(1, 'Email is required').email('Please enter a valid email address'),
})

type SignupFormData = z.infer<typeof signupSchema>
type Step = 'email' | 'otp'

interface OtpState {
  userId: string
  email: string
}

export function NewsletterPage() {
  const context = useRouteContext({ from: '__root__' })
  const { auth } = context
  const isAuthenticated = auth.isAuthenticated

  const [step, setStep] = useState<Step>('email')
  const [otpState, setOtpState] = useState<OtpState | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string>()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
  })

  const handleFormSubmit = async (data: SignupFormData) => {
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
      // Router will invalidate and re-render since user is now authenticated
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

  // Authenticated users just see the config form
  if (isAuthenticated) {
    return <NewsletterConfigForm />
  }

  // Non-authenticated: show config with signup flow at bottom
  return (
    <div className="space-y-6">
      <NewsletterConfigForm showStatus={false} />

      {step === 'email' && (
        <Card>
          <CardHeader>
            <CardTitle>Get Started</CardTitle>
            <CardDescription>
              Enter your details to start receiving newsletter updates.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Enter your name"
                  aria-invalid={!!errors.name}
                  {...register('name')}
                />
                {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  aria-invalid={!!errors.email}
                  {...register('email')}
                />
                {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
                {error && <p className="text-sm text-destructive">{error}</p>}
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Creating account...' : 'Sign up for newsletter'}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {step === 'otp' && otpState && (
        <OtpVerificationForm
          email={otpState.email}
          onSubmit={handleOtpSubmit}
          onResend={handleResend}
          isLoading={isLoading}
          error={error}
          className="max-w-none"
        />
      )}
    </div>
  )
}
