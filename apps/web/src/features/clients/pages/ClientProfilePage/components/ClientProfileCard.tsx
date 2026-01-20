import { type ClientStatus } from '@app/shared/clients'
import { Calendar, CircleDot, Loader2, Mail, Send, User, UserRound } from 'lucide-react'

import { Avatar, AvatarFallback, Badge, Button } from '@/components/ui'

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
    month: 'short',
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

const STATUS_LABELS: Record<ClientStatus, string> = {
  active: 'Active',
  invited: 'Invited',
  inactive: 'Inactive',
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
    <div className="space-y-6">
      {/* Profile card - hidden on mobile (shown in Details tab) */}
      <div className="hidden md:block rounded-lg border border-border/50 bg-card shadow-md overflow-hidden">
        {/* Avatar header */}
        <div className="flex justify-center py-6 bg-avatar-header">
          <Avatar className="h-16 w-16 text-xl">
            <AvatarFallback className="bg-avatar-bg text-avatar-text font-semibold">
              {getInitials(client.name)}
            </AvatarFallback>
          </Avatar>
        </div>

        {/* Details */}
        <div className="divide-y divide-border/50">
          <DetailRow
            icon={<User className="h-4 w-4 text-foreground" strokeWidth={2} />}
            label="Name"
            value={client.name}
          />
          <NicknameRow clientId={client.id} nickname={client.nickname} />
          <DetailRow
            icon={<Mail className="h-4 w-4 text-foreground" strokeWidth={2} />}
            label="Email"
            value={client.email}
          />
          <DetailRow
            icon={<Calendar className="h-4 w-4 text-foreground" strokeWidth={2} />}
            label="Joined"
            value={formatMemberSince(client.createdAt)}
          />
          {/* Status row */}
          <div className="flex items-center gap-3 px-4 py-3">
            <span className="p-2 rounded-lg">
              <CircleDot className="h-4 w-4 text-foreground" strokeWidth={2} />
            </span>
            <div className="flex-1 min-w-0">
              <span className="text-xs text-muted-foreground">Status</span>
              <div className="mt-0.5">
                <Badge status={client.status}>{STATUS_LABELS[client.status]}</Badge>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Actions - hidden on mobile (shown in Details tab) */}
      <div className="hidden md:block space-y-2">
        {client.status === 'invited' && (
          <Button
            variant="outline"
            size="sm"
            className="w-full h-9 text-sm font-medium border-semantic-info/30 text-semantic-info hover:bg-semantic-info/10 shadow-md"
            onClick={onResendInvite}
            disabled={isResending}
          >
            {isResending ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Send className="h-3.5 w-3.5" strokeWidth={1.5} />
            )}
            Resend invitation
          </Button>
        )}

        <StatusChangeButton
          currentStatus={client.status}
          onToggle={handleToggle}
          isLoading={isUpdating}
        />
      </div>
    </div>
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
    <div className="flex items-center gap-3 px-4 py-3 transition-colors">
      <span className="p-2 rounded-lg">{icon}</span>
      <div className="flex-1 min-w-0">
        <span className="text-xs text-muted-foreground">{label}</span>
        <p className="text-sm font-medium truncate" title={value}>
          {value}
        </p>
      </div>
    </div>
  )
}

function NicknameRow({ clientId, nickname }: { clientId: string; nickname: string | null }) {
  return (
    <div className="flex items-center gap-3 px-4 py-3 transition-colors">
      <span className="p-2 rounded-lg">
        <UserRound className="h-4 w-4 text-foreground" strokeWidth={2} />
      </span>
      <div className="flex-1 min-w-0">
        <span className="block text-xs text-muted-foreground">Nickname</span>
        <NicknameEditor clientId={clientId} nickname={nickname} />
      </div>
    </div>
  )
}
