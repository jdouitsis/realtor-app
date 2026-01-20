import { zodResolver } from '@hookform/resolvers/zod'
import { Check, User } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { Button, Input, Label } from '@/components/ui'
import { trpc } from '@/lib/trpc'

const profileSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name is too long'),
})

type ProfileFormData = z.infer<typeof profileSchema>

interface ProfileFormProps {
  initialName: string
  onSuccess?: () => void
}

export function ProfileForm({ initialName, onSuccess }: ProfileFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    resetField,
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: initialName },
  })

  const utils = trpc.useUtils()

  const updateName = trpc.user.updateName.useMutation({
    onSuccess: (data) => {
      utils.auth.me.setData(undefined, (prev) => (prev ? { ...prev, name: data.name } : prev))
      resetField('name', { defaultValue: data.name })
      onSuccess?.()
    },
  })

  const handleFormSubmit = (data: ProfileFormData) => {
    updateName.mutate({ name: data.name })
  }

  return (
    <div className="rounded-lg border border-border/50 shadow-md overflow-hidden bg-card">
      <div className="flex items-center gap-3 px-4 py-4 border-b border-border/50">
        <span className="p-2 rounded-lg bg-muted text-foreground">
          <User className="h-4 w-4" strokeWidth={1.5} />
        </span>
        <h3 className="text-sm font-medium">Profile Information</h3>
      </div>
      <div className="px-4 py-4">
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-xs text-muted-foreground">
              Display Name
            </Label>
            <Input
              id="name"
              type="text"
              placeholder="Enter your name"
              aria-invalid={!!errors.name}
              className="bg-transparent"
              {...register('name')}
            />
            {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
            {updateName.error && (
              <p className="text-sm text-destructive">{updateName.error.message}</p>
            )}
          </div>
          <div className="flex items-center gap-3">
            <Button type="submit" size="sm" disabled={updateName.isPending || !isDirty}>
              {updateName.isPending ? 'Saving...' : 'Save Changes'}
            </Button>
            {updateName.isSuccess && (
              <span className="flex items-center gap-1 text-sm text-semantic-success">
                <Check className="h-4 w-4" strokeWidth={1.5} />
                Name updated
              </span>
            )}
          </div>
        </form>
      </div>
    </div>
  )
}
