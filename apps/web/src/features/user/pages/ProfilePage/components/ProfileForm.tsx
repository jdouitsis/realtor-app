import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { Button, Card, CardContent, CardHeader, CardTitle, Input, Label } from '@/components/ui'
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
    <Card>
      <CardHeader>
        <CardTitle>Profile Information</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Display Name</Label>
            <Input
              id="name"
              type="text"
              placeholder="Enter your name"
              aria-invalid={!!errors.name}
              {...register('name')}
            />
            {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
            {updateName.error && (
              <p className="text-sm text-destructive">{updateName.error.message}</p>
            )}
          </div>
          <Button type="submit" disabled={updateName.isPending || !isDirty}>
            {updateName.isPending ? 'Saving...' : 'Save Changes'}
          </Button>
          {updateName.isSuccess && (
            <p className="text-sm text-green-600">Name updated successfully</p>
          )}
        </form>
      </CardContent>
    </Card>
  )
}
