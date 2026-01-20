import { type ClientStatus } from '@app/shared/clients'
import { Calendar, Loader2, Mail, Send, UserRound } from 'lucide-react'

import { Avatar, AvatarFallback, Badge, Button } from '@/components/ui'
import { cn } from '@/lib/utils'

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

const statusConfig: Record<ClientStatus, { label: string; className: string }> = {
  active: {
    label: 'Active',
    className: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
  },
  invited: {
    label: 'Invited',
    className: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
  },
  inactive: {
    label: 'Inactive',
    className: 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20',
  },
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

  const status = statusConfig[client.status]

  return (
    <div className="space-y-6">
      {/* Profile Header with gradient accent */}
      <div className="relative rounded-xl bg-gradient-to-br from-blue-500/10 via-sky-500/5 to-cyan-500/10 p-6 text-center shadow-md">
        {/* Decorative gradient orb */}
        <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-blue-500/20 to-transparent rounded-full blur-2xl" />

        <Avatar className="h-20 w-20 mx-auto text-xl ring-4 ring-background shadow-lg">
          <AvatarFallback className="bg-gradient-to-br from-blue-500 to-sky-600 text-white font-semibold">
            {getInitials(client.name)}
          </AvatarFallback>
        </Avatar>

        <div className="mt-4 space-y-2">
          <h2 className="text-xl font-semibold tracking-tight text-foreground">{client.name}</h2>

          <Badge variant="outline" className={cn('text-xs font-medium border', status.className)}>
            {status.label}
          </Badge>
        </div>
      </div>

      {/* Details with colored icons - hidden on mobile (shown in Details tab) */}
      <div className="hidden md:block rounded-lg border border-border/50 bg-card shadow-md divide-y divide-border/50">
        <DetailRow
          icon={<Mail className="h-4 w-4 text-blue-700" strokeWidth={2} />}
          label="Email"
          value={client.email}
        />
        <DetailRow
          icon={<Calendar className="h-4 w-4 text-blue-700" strokeWidth={2} />}
          label="Joined"
          value={formatMemberSince(client.createdAt)}
        />
        <NicknameRow clientId={client.id} nickname={client.nickname} />
      </div>

      {/* Actions - hidden on mobile (shown in Details tab) */}
      <div className="hidden md:block space-y-2">
        {client.status === 'invited' && (
          <Button
            variant="outline"
            size="sm"
            className="w-full h-9 text-sm font-medium border-blue-500/30 text-blue-500 hover:bg-blue-500/10 hover:text-blue-400 shadow-md"
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
        <UserRound className="h-4 w-4 text-blue-700" strokeWidth={2} />
      </span>
      <div className="flex-1 min-w-0">
        <span className="block text-xs text-muted-foreground">Nickname</span>
        <NicknameEditor clientId={clientId} nickname={nickname} />
      </div>
    </div>
  )
}
