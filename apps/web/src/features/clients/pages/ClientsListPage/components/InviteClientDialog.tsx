import { useNavigate } from '@tanstack/react-router'
import { toast } from 'sonner'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui'

import { InviteClientForm } from './InviteClientForm'

interface InviteClientDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function InviteClientDialog({ open, onOpenChange }: InviteClientDialogProps) {
  const navigate = useNavigate()

  const handleCancel = () => {
    onOpenChange(false)
  }

  const handleSuccess = (clientId: string, email: string) => {
    onOpenChange(false)
    toast.success(`Invitation sent to ${email}`)
    void navigate({ to: '/clients/$id', params: { id: clientId } })
  }

  const handleViewProfile = (clientId: string) => {
    onOpenChange(false)
    void navigate({ to: '/clients/$id', params: { id: clientId } })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Invite Client</DialogTitle>
          <DialogDescription>
            Send a magic link invitation to your client so they can access the platform.
          </DialogDescription>
        </DialogHeader>
        {open && (
          <InviteClientForm
            onSuccess={handleSuccess}
            onViewProfile={handleViewProfile}
            onCancel={handleCancel}
          />
        )}
      </DialogContent>
    </Dialog>
  )
}
