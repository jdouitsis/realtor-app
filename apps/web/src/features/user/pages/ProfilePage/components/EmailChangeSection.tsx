import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Checkbox,
  Input,
  Label,
} from '@/components/ui'
import { parseError } from '@/lib/errors'
import { trpc } from '@/lib/trpc'

type EmailChangeStep = 'idle' | 'verify_new'

const newEmailSchema = z.object({
  newEmail: z.string().email('Please enter a valid email address'),
})

const otpSchema = z.object({
  code: z.string().length(6, 'Code must be 6 digits'),
})

interface EmailChangeSectionProps {
  currentEmail: string
  pendingEmail: string | null
  onSuccess?: () => void
}

export function EmailChangeSection({
  currentEmail,
  pendingEmail,
  onSuccess,
}: EmailChangeSectionProps) {
  const [step, setStep] = useState<EmailChangeStep>(pendingEmail ? 'verify_new' : 'idle')
  const [invalidateOtherSessions, setInvalidateOtherSessions] = useState(false)
  const [initiateError, setInitiateError] = useState<string>()
  const [confirmError, setConfirmError] = useState<string>()

  const utils = trpc.useUtils()

  const newEmailForm = useForm<z.infer<typeof newEmailSchema>>({
    resolver: zodResolver(newEmailSchema),
  })

  const otpForm = useForm<z.infer<typeof otpSchema>>({
    resolver: zodResolver(otpSchema),
  })

  const initiateEmailChange = trpc.user.initiateEmailChange.useMutation({
    onSuccess: () => {
      setStep('verify_new')
      setInitiateError(undefined)
      void utils.user.getProfile.invalidate()
    },
    onError: (error) => {
      // REQUEST_NEW_OTP errors are handled globally in query.ts
      setInitiateError(parseError(error).userMessage)
    },
  })

  const confirmEmailChange = trpc.user.confirmEmailChange.useMutation({
    onSuccess: () => {
      setStep('idle')
      otpForm.reset()
      newEmailForm.reset()
      setConfirmError(undefined)
      void utils.user.getProfile.invalidate()
      void utils.auth.me.invalidate()
      onSuccess?.()
    },
    onError: (error) => {
      setConfirmError(parseError(error).userMessage)
    },
  })

  const cancelEmailChange = trpc.user.cancelEmailChange.useMutation({
    onSuccess: () => {
      setStep('idle')
      otpForm.reset()
      newEmailForm.reset()
      setInitiateError(undefined)
      setConfirmError(undefined)
      void utils.user.getProfile.invalidate()
    },
  })

  const handleInitiate = (data: z.infer<typeof newEmailSchema>) => {
    setInitiateError(undefined)
    initiateEmailChange.mutate({ newEmail: data.newEmail })
  }

  const handleConfirm = (data: z.infer<typeof otpSchema>) => {
    setConfirmError(undefined)
    confirmEmailChange.mutate({
      code: data.code,
      invalidateOtherSessions,
    })
  }

  const handleCancel = () => {
    cancelEmailChange.mutate()
  }

  if (step === 'idle' && !pendingEmail) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Email Address</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Current Email</Label>
            <p className="text-muted-foreground">{currentEmail}</p>
          </div>
          <form onSubmit={newEmailForm.handleSubmit(handleInitiate)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="newEmail">New Email Address</Label>
              <Input
                id="newEmail"
                type="email"
                placeholder="Enter new email address"
                {...newEmailForm.register('newEmail')}
              />
              {newEmailForm.formState.errors.newEmail && (
                <p className="text-sm text-destructive">
                  {newEmailForm.formState.errors.newEmail.message}
                </p>
              )}
              {initiateError && <p className="text-sm text-destructive">{initiateError}</p>}
            </div>
            <Button type="submit" disabled={initiateEmailChange.isPending}>
              {initiateEmailChange.isPending ? 'Sending code...' : 'Change Email'}
            </Button>
          </form>
        </CardContent>
      </Card>
    )
  }

  if (step === 'verify_new' || (step === 'idle' && pendingEmail)) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Verify New Email</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            A verification code has been sent to <strong>{pendingEmail}</strong>. Enter the code to
            complete the email change.
          </p>
          <form onSubmit={otpForm.handleSubmit(handleConfirm)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="newCode">Verification Code</Label>
              <Input
                id="newCode"
                type="text"
                placeholder="Enter 6-digit code"
                maxLength={6}
                {...otpForm.register('code')}
              />
              {otpForm.formState.errors.code && (
                <p className="text-sm text-destructive">{otpForm.formState.errors.code.message}</p>
              )}
              {confirmError && <p className="text-sm text-destructive">{confirmError}</p>}
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                id="invalidateSessions"
                checked={invalidateOtherSessions}
                onCheckedChange={(checked) => setInvalidateOtherSessions(checked === true)}
              />
              <Label htmlFor="invalidateSessions" className="text-sm font-normal cursor-pointer">
                Log out of all other devices
              </Label>
            </div>
            <div className="flex gap-2">
              <Button type="submit" disabled={confirmEmailChange.isPending}>
                {confirmEmailChange.isPending ? 'Confirming...' : 'Confirm Email Change'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                disabled={cancelEmailChange.isPending}
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    )
  }

  return null
}
