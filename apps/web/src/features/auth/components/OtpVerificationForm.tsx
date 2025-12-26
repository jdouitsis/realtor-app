import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Input,
  Label,
} from '@/components/ui'

const otpSchema = z.object({
  code: z
    .string()
    .min(1, 'Code is required')
    .length(6, 'Code must be 6 digits')
    .regex(/^\d+$/, 'Code must contain only numbers'),
})

type OtpFormData = z.infer<typeof otpSchema>

interface OtpVerificationFormProps {
  email: string
  onSubmit: (code: string) => void
  onResend: () => void
  isLoading?: boolean
  error?: string
}

const RESEND_COOLDOWN_SECONDS = 60

export function OtpVerificationForm({
  email,
  onSubmit,
  onResend,
  isLoading = false,
  error,
}: OtpVerificationFormProps) {
  const [resendCooldown, setResendCooldown] = useState(RESEND_COOLDOWN_SECONDS)

  const canResend = resendCooldown === 0

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<OtpFormData>({
    resolver: zodResolver(otpSchema),
  })

  // Countdown timer for resend
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [resendCooldown])

  const handleFormSubmit = (data: OtpFormData) => {
    onSubmit(data.code)
  }

  const handleResend = () => {
    onResend()
    setResendCooldown(RESEND_COOLDOWN_SECONDS)
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">Check your email</CardTitle>
        <CardDescription>
          We sent a 6-digit code to <span className="font-medium">{email}</span>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="code">Verification code</Label>
            <Input
              id="code"
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={6}
              placeholder="000000"
              className="text-center text-2xl tracking-widest"
              aria-invalid={!!errors.code || !!error}
              {...register('code')}
            />
            {errors.code && <p className="text-sm text-destructive">{errors.code.message}</p>}
            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Verifying...' : 'Verify'}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="justify-center">
        <p className="text-sm text-muted-foreground">
          Didn't receive the code?{' '}
          {canResend ? (
            <button
              type="button"
              onClick={handleResend}
              className="text-primary underline"
              disabled={isLoading}
            >
              Resend code
            </button>
          ) : (
            <span className="text-muted-foreground">Resend in {resendCooldown}s</span>
          )}
        </p>
      </CardFooter>
    </Card>
  )
}
