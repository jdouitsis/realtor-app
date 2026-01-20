import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { z } from 'zod'

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Label,
} from '@/components/ui'
import { cn } from '@/lib/utils'

import { OTPInput } from './OTPInput'

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
  className?: string
}

const RESEND_COOLDOWN_SECONDS = 60

export function OtpVerificationForm({
  email,
  onSubmit,
  onResend,
  isLoading = false,
  error,
  className,
}: OtpVerificationFormProps) {
  const [resendCooldown, setResendCooldown] = useState(RESEND_COOLDOWN_SECONDS)

  const canResend = resendCooldown === 0

  const {
    control,
    reset,
    formState: { errors },
  } = useForm<OtpFormData>({
    resolver: zodResolver(otpSchema),
    defaultValues: { code: '' },
  })

  // Countdown timer for resend
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [resendCooldown])

  const handleComplete = (code: string) => {
    if (!isLoading) {
      onSubmit(code)
    }
  }

  const handleResend = () => {
    reset()
    onResend()
    setResendCooldown(RESEND_COOLDOWN_SECONDS)
  }

  return (
    <Card className={cn('w-full max-w-md border-border/50 shadow-md', className)}>
      <CardHeader className="text-center">
        <CardTitle className="text-2xl tracking-tighter">Check your email</CardTitle>
        <CardDescription>
          We sent a 6-digit code to <span className="font-medium">{email}</span>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <Label htmlFor="code" id="code-label" className="sr-only">
            Verification code
          </Label>
          <Controller
            name="code"
            control={control}
            render={({ field }) => (
              <OTPInput
                id="code"
                value={field.value}
                onChange={field.onChange}
                onComplete={handleComplete}
                disabled={isLoading}
                hasError={!!errors.code || !!error}
                className="justify-center"
              />
            )}
          />
          {isLoading && <p className="text-center text-sm text-muted-foreground">Verifying...</p>}
          {errors.code && (
            <p className="text-center text-sm text-destructive">{errors.code.message}</p>
          )}
          {error && <p className="text-center text-sm text-destructive">{error}</p>}
        </div>
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
