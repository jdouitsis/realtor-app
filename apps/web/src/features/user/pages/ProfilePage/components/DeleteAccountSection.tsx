import { zodResolver } from '@hookform/resolvers/zod'
import { AlertTriangle, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { Button, Input, Label } from '@/components/ui'
import { parseError } from '@/lib/errors'
import { queryClient } from '@/lib/query'
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
    onSuccess: () => {
      clearStorage('auth_token')
      queryClient.clear()
      void router.invalidate()
      void router.navigate({ to: '/login' })
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
      <div className="rounded-lg border border-destructive/50 shadow-md overflow-hidden bg-card">
        <div className="flex items-center gap-3 px-4 py-4 border-b border-destructive/30">
          <span className="p-2 rounded-lg bg-destructive/10 text-destructive">
            <AlertTriangle className="h-4 w-4" strokeWidth={1.5} />
          </span>
          <h3 className="text-sm font-medium text-destructive">Danger Zone</h3>
        </div>
        <div className="px-4 py-4 space-y-4">
          <p className="text-sm text-muted-foreground">
            Once you delete your account, there is no going back. All your data will be permanently
            removed.
          </p>
          <Button variant="destructive" size="sm" onClick={() => setShowConfirmation(true)}>
            <Trash2 className="h-4 w-4" strokeWidth={1.5} />
            Delete Account
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-lg border border-destructive shadow-md overflow-hidden bg-card">
      <div className="flex items-center gap-3 px-4 py-4 border-b border-destructive/30">
        <span className="p-2 rounded-lg bg-destructive/10 text-destructive">
          <Trash2 className="h-4 w-4" strokeWidth={1.5} />
        </span>
        <h3 className="text-sm font-medium text-destructive">Delete Your Account</h3>
      </div>
      <div className="px-4 py-4 space-y-4">
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
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
            <Label htmlFor="confirmEmail" className="text-xs text-muted-foreground">
              Type <strong className="text-foreground">{userEmail}</strong> to confirm
            </Label>
            <Input
              id="confirmEmail"
              type="email"
              placeholder="Enter your email to confirm"
              className="bg-transparent"
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
            <Button
              type="submit"
              variant="destructive"
              size="sm"
              disabled={deleteAccount.isPending}
            >
              {deleteAccount.isPending ? 'Deleting...' : 'Permanently Delete Account'}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                setShowConfirmation(false)
                form.reset()
              }}
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
