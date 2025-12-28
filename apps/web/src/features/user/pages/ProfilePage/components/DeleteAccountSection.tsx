import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { Button, Card, CardContent, CardHeader, CardTitle, Input, Label } from '@/components/ui'
import { parseError } from '@/lib/errors'
import { clearStorage } from '@/lib/storage'
import { trpc } from '@/lib/trpc'
import { router } from '@/router'

interface DeleteAccountSectionProps {
  userEmail: string
}

export function DeleteAccountSection({ userEmail }: DeleteAccountSectionProps) {
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [error, setError] = useState<string>()

  const deleteSchema = z.object({
    confirmEmail: z.string().refine((val) => val.toLowerCase() === userEmail.toLowerCase(), {
      message: "Email doesn't match your account email",
    }),
  })

  const form = useForm<z.infer<typeof deleteSchema>>({
    resolver: zodResolver(deleteSchema),
  })

  const deleteAccount = trpc.user.deleteAccount.useMutation({
    onSuccess: async () => {
      clearStorage('auth_token')
      void router.invalidate()
    },
    onError: (err) => {
      // REQUEST_NEW_OTP errors are handled globally in query.ts
      setError(parseError(err).userMessage)
    },
  })

  const handleDelete = (data: z.infer<typeof deleteSchema>) => {
    deleteAccount.mutate({ confirmEmail: data.confirmEmail })
  }

  if (!showConfirmation) {
    return (
      <Card className="border-destructive/50">
        <CardHeader>
          <CardTitle className="text-destructive">Danger Zone</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Once you delete your account, there is no going back. All your data will be permanently
            removed.
          </p>
          <Button variant="destructive" onClick={() => setShowConfirmation(true)}>
            Delete Account
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-destructive">
      <CardHeader>
        <CardTitle className="text-destructive">Delete Your Account</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-destructive/10 border border-destructive/20 rounded-md p-4">
          <p className="text-sm font-medium text-destructive">
            Warning: This action is irreversible
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            All your data, including your profile, sessions, and any associated information will be
            permanently deleted.
          </p>
        </div>
        <form onSubmit={form.handleSubmit(handleDelete)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="confirmEmail">
              Type <strong>{userEmail}</strong> to confirm
            </Label>
            <Input
              id="confirmEmail"
              type="email"
              placeholder="Enter your email to confirm"
              {...form.register('confirmEmail')}
            />
            {form.formState.errors.confirmEmail && (
              <p className="text-sm text-destructive">
                {form.formState.errors.confirmEmail.message}
              </p>
            )}
            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>
          <div className="flex gap-2">
            <Button type="submit" variant="destructive" disabled={deleteAccount.isPending}>
              {deleteAccount.isPending ? 'Deleting...' : 'Permanently Delete Account'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setShowConfirmation(false)
                form.reset()
              }}
            >
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
