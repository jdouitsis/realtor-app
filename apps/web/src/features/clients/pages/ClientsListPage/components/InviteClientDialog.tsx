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
  onSuccess: (clientId: string, email: string) => void
}

export function InviteClientDialog({ open, onOpenChange, onSuccess }: InviteClientDialogProps) {
  const handleCancel = () => {
    onOpenChange(false)
  }

  const handleSuccess = (clientId: string, email: string) => {
    onOpenChange(false)
    onSuccess(clientId, email)
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
        {open && <InviteClientForm onSuccess={handleSuccess} onCancel={handleCancel} />}
      </DialogContent>
    </Dialog>
  )
}
