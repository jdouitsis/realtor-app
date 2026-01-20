import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { z } from 'zod'

import {
  Button,
  Dialog,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Label,
  StepUpDialogContent,
} from '@/components/ui'
import { OTPInput } from '@/features/auth/components/OTPInput'
import { parseError } from '@/lib/errors'
import { useStepUpModal } from '@/lib/step-up-modal'
import { trpc } from '@/lib/trpc'
import { cn } from '@/lib/utils'

const otpSchema = z.object({
  code: z
    .string()
    .min(1, 'Code is required')
    .length(6, 'Code must be 6 digits')
    .regex(/^\d+$/, 'Code must contain only numbers'),
})

type OtpFormData = z.infer<typeof otpSchema>

const RESEND_COOLDOWN_SECONDS = 60

export function StepUpOtpModal() {
  const { isOpen, close } = useStepUpModal()
  const [error, setError] = useState<string>()
  const [otpRequested, setOtpRequested] = useState(false)
  const [resendCooldown, setResendCooldown] = useState(RESEND_COOLDOWN_SECONDS)
  const { data: user } = trpc.auth.me.useQuery(undefined, { enabled: isOpen })

  const canResend = resendCooldown === 0

  const {
    control,
    reset,
    formState: { errors },
  } = useForm<OtpFormData>({
    resolver: zodResolver(otpSchema),
    defaultValues: { code: '' },
  })

  const requestOtp = trpc.user.requestStepUpOtp.useMutation({
    onSuccess: () => {
      setOtpRequested(true)
      setError(undefined)
      setResendCooldown(RESEND_COOLDOWN_SECONDS)
    },
    onError: (err) => {
      const parsed = parseError(err)
      setError(parsed.userMessage)
    },
  })

  const verifyOtp = trpc.user.verifyStepUpOtp.useMutation({
    onSuccess: () => {
      handleClose()
    },
    onError: (err) => {
      const parsed = parseError(err)
      setError(parsed.userMessage)
    },
  })

  // Request OTP when modal opens
  useEffect(() => {
    if (isOpen && !otpRequested && !requestOtp.isPending) {
      requestOtp.mutate()
    }
  }, [isOpen, otpRequested, requestOtp])

  // Countdown timer for resend
  useEffect(() => {
    if (!isOpen) return
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [isOpen, resendCooldown])

  // Reset state when modal closes
  const handleClose = () => {
    close()
    setOtpRequested(false)
    setError(undefined)
    setResendCooldown(RESEND_COOLDOWN_SECONDS)
    reset()
  }

  const handleComplete = (code: string) => {
    if (!verifyOtp.isPending) {
      setError(undefined)
      verifyOtp.mutate({ code })
    }
  }

  const handleResend = () => {
    reset()
    setError(undefined)
    requestOtp.mutate()
  }

  const isLoading = requestOtp.isPending || verifyOtp.isPending

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <StepUpDialogContent
        onEscapeKeyDown={(e) => e.preventDefault()}
        onPointerDownOutside={(e) => e.preventDefault()}
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader className="text-center sm:text-center">
          <DialogTitle className="text-2xl tracking-tighter">Verification required</DialogTitle>
          <DialogDescription>
            {user?.email ? (
              <>
                We sent a 6-digit code to <span className="font-medium">{user.email}</span>
              </>
            ) : (
              'We sent a 6-digit code to your email'
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-4">
          <Label htmlFor="step-up-code" id="step-up-code-label" className="sr-only">
            Verification code
          </Label>
          <Controller
            name="code"
            control={control}
            render={({ field }) => (
              <OTPInput
                id="step-up-code"
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

        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            Didn't receive the code?{' '}
            {canResend ? (
              <button
                type="button"
                onClick={handleResend}
                className={cn(
                  'text-primary underline',
                  isLoading && 'pointer-events-none opacity-50'
                )}
                disabled={isLoading}
              >
                Resend code
              </button>
            ) : (
              <span className="text-muted-foreground">Resend in {resendCooldown}s</span>
            )}
          </p>
        </div>

        <DialogFooter className="sm:justify-center">
          <Button variant="outline" onClick={handleClose} disabled={isLoading}>
            Cancel
          </Button>
        </DialogFooter>
      </StepUpDialogContent>
    </Dialog>
  )
}
