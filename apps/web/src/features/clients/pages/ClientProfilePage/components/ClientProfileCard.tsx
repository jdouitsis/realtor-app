import { Calendar, CircleDot, Mail } from 'lucide-react'

import { Avatar, AvatarFallback } from '@/components/ui'

import { StatusBadge } from '../../ClientsListPage/components/StatusBadge'
import { StatusChangeButton } from './StatusChangeButton'

type ClientStatus = 'invited' | 'active' | 'inactive'

interface Client {
  id: string
  clientId: string
  name: string
  email: string
  status: ClientStatus
  createdAt: string
}

interface ClientProfileCardProps {
  client: Client
  onStatusChange: (newStatus: 'active' | 'inactive') => void
  isUpdating: boolean
}

function formatMemberSince(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

function getNextStatus(current: ClientStatus): 'active' | 'inactive' {
  return current === 'active' ? 'inactive' : 'active'
}

export function ClientProfileCard({ client, onStatusChange, isUpdating }: ClientProfileCardProps) {
  const handleToggle = () => {
    if (client.status !== 'invited') {
      onStatusChange(getNextStatus(client.status))
    }
  }

  return (
    <div className="rounded-xl bg-muted/50 p-6 space-y-6">
      <div className="flex flex-col items-center text-center">
        <Avatar className="h-24 w-24 text-2xl">
          <AvatarFallback>{getInitials(client.name)}</AvatarFallback>
        </Avatar>
        <h1 className="mt-4 text-xl font-semibold">{client.name}</h1>
      </div>

      <div className="space-y-4">
        <h2 className="text-sm font-medium">Client details</h2>

        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <Mail className="mt-0.5 h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Email</p>
              <p className="text-sm">{client.email}</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Calendar className="mt-0.5 h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Member since</p>
              <p className="text-sm">{formatMemberSince(client.createdAt)}</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <CircleDot className="mt-0.5 h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Status</p>
              <div className="mt-1">
                <StatusBadge status={client.status} />
              </div>
            </div>
          </div>
        </div>
      </div>

      <StatusChangeButton
        currentStatus={client.status}
        onToggle={handleToggle}
        isLoading={isUpdating}
      />
    </div>
  )
}
