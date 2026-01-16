import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { Button, Input, Label } from '@/components/ui'
import { parseError } from '@/lib/errors'
import { trpc } from '@/lib/trpc'
import { router } from '@/router'

import { DuplicateClientAlert } from './DuplicateClientAlert'

const inviteFormSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Please enter a valid email'),
  name: z.string().min(1, 'Name is required'),
})

type InviteFormData = z.infer<typeof inviteFormSchema>

interface InviteClientFormProps {
  onSuccess: (clientId: string, email: string) => void
  onViewProfile: (clientId: string) => void
  onCancel: () => void
}

interface DuplicateInfo {
  email: string
  clientId: string
}

export function InviteClientForm({ onSuccess, onViewProfile, onCancel }: InviteClientFormProps) {
  const [duplicate, setDuplicate] = useState<DuplicateInfo | null>(null)
  const [serverError, setServerError] = useState<string | null>(null)

  const utils = trpc.useUtils()
  const invite = trpc.clients.invite.useMutation({
    onSuccess: () => utils.clients.list.invalidate(),
  })

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<InviteFormData>({
    resolver: zodResolver(inviteFormSchema),
    defaultValues: { email: '', name: '' },
  })

  const onSubmit = async (data: InviteFormData) => {
    setDuplicate(null)
    setServerError(null)

    try {
      // Build redirect URL for the client's magic link
      // Using dashboard since /forms doesn't exist yet
      const { href: redirectUrl } = router.buildLocation({ to: '/dashboard' })

      const result = await invite.mutateAsync({
        email: data.email,
        name: data.name,
        redirectUrl,
      })

      onSuccess(result.clientId, data.email)
    } catch (error) {
      const parsed = parseError(error)

      if (parsed.appCode === 'ALREADY_EXISTS') {
        // Extract client ID from error message: 'Client "uuid" already exists'
        const match = parsed.debugMessage.match(/"([^"]+)"/)
        const clientId = match?.[1] ?? ''

        setDuplicate({ email: data.email, clientId })
      } else {
        setServerError(parsed.userMessage)
      }
    }
  }

  const handleViewProfile = () => {
    if (duplicate) {
      onViewProfile(duplicate.clientId)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {duplicate && (
        <DuplicateClientAlert email={duplicate.email} onViewProfile={handleViewProfile} />
      )}

      {serverError && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-3">
          <p className="text-sm text-destructive">{serverError}</p>
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          type="text"
          placeholder="John Smith"
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
          placeholder="client@example.com"
          aria-invalid={!!errors.email}
          {...register('email')}
        />
        {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={invite.isPending}>
          {invite.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
          Invite
        </Button>
      </div>
    </form>
  )
}
