import { type ClientStatus } from '@app/shared/clients'
import { Calendar, Loader2, Mail, Send, UserRound } from 'lucide-react'

import { Avatar, AvatarFallback, Button, Card, CardContent } from '@/components/ui'

import { StatusBadge } from '../../ClientsListPage/components/StatusBadge'
import { NicknameEditor } from './NicknameEditor'
import { StatusChangeButton } from './StatusChangeButton'

interface Client {
  id: string
  clientId: string
  name: string
  email: string
  status: ClientStatus
  nickname: string | null
  createdAt: string
}

interface ClientProfileCardProps {
  client: Client
  onStatusChange: (newStatus: 'active' | 'inactive') => void
  isUpdating: boolean
  onResendInvite: () => void
  isResending: boolean
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

export function ClientProfileCard({
  client,
  onStatusChange,
  isUpdating,
  onResendInvite,
  isResending,
}: ClientProfileCardProps) {
  const handleToggle = () => {
    if (client.status !== 'invited') {
      onStatusChange(getNextStatus(client.status))
    }
  }

  return (
    <Card className="h-full">
      <CardContent className="p-6">
        {/* Avatar and Name Section */}
        <div className="flex flex-col items-center text-center pb-6 border-b">
          <Avatar className="h-24 w-24 text-2xl ring-4 ring-background shadow-lg">
            <AvatarFallback className="bg-primary/10 text-primary font-semibold">
              {getInitials(client.name)}
            </AvatarFallback>
          </Avatar>
          <h2 className="mt-4 text-xl font-semibold">{client.name}</h2>
          <div className="mt-2">
            <StatusBadge status={client.status} />
          </div>
        </div>

        {/* Details Section */}
        <div className="py-6 space-y-4">
          <DetailRow icon={<Mail className="h-4 w-4" />} label="Email" value={client.email} />
          <DetailRow
            icon={<Calendar className="h-4 w-4" />}
            label="Member since"
            value={formatMemberSince(client.createdAt)}
          />
          <NicknameRow clientId={client.id} nickname={client.nickname} />
        </div>

        {/* Actions Section */}
        <div className="space-y-3 pt-2">
          {client.status === 'invited' && (
            <Button
              variant="outline"
              className="w-full"
              onClick={onResendInvite}
              disabled={isResending}
            >
              {isResending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
              Resend Invite
            </Button>
          )}

          <StatusChangeButton
            currentStatus={client.status}
            onToggle={handleToggle}
            isLoading={isUpdating}
          />
        </div>
      </CardContent>
    </Card>
  )
}

function DetailRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode
  label: string
  value: string
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="rounded-md bg-muted p-2 text-muted-foreground">{icon}</div>
      <div className="min-w-0 flex-1">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-medium truncate" title={value}>
          {value}
        </p>
      </div>
    </div>
  )
}

function NicknameRow({ clientId, nickname }: { clientId: string; nickname: string | null }) {
  return (
    <div className="flex items-start gap-3">
      <div className="rounded-md bg-muted p-2 text-muted-foreground">
        <UserRound className="h-4 w-4" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs text-muted-foreground">Nickname</p>
        <NicknameEditor clientId={clientId} nickname={nickname} />
      </div>
    </div>
  )
}
