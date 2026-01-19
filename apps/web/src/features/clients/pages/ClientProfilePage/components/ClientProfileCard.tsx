import { type ClientStatus } from '@app/shared/clients'
import { Calendar, Loader2, Mail, Send, Sparkles, UserRound } from 'lucide-react'

import { Avatar, AvatarFallback, Button, Card, CardContent } from '@/components/ui'
import { cn } from '@/lib/utils'

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
    <Card className="h-full overflow-hidden">
      {/* Gradient header background */}
      <div className="relative h-24 bg-gradient-to-br from-primary/20 via-primary/10 to-transparent dark:from-primary/10 dark:via-primary/5">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent" />
        {/* Decorative sparkle */}
        <Sparkles className="absolute right-4 top-4 h-5 w-5 text-primary/30" />
      </div>

      <CardContent className="relative px-6 pb-6">
        {/* Avatar - positioned to overlap the header */}
        <div className="flex justify-center -mt-12 mb-4">
          <div className="relative">
            <Avatar className="h-24 w-24 text-2xl ring-4 ring-background shadow-xl">
              <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/10 text-primary font-semibold">
                {getInitials(client.name)}
              </AvatarFallback>
            </Avatar>
            {/* Status indicator dot */}
            <div
              className={cn(
                'absolute bottom-1 right-1 h-4 w-4 rounded-full ring-2 ring-background',
                client.status === 'active' && 'bg-emerald-500',
                client.status === 'invited' && 'bg-amber-500',
                client.status === 'inactive' && 'bg-zinc-400'
              )}
            />
          </div>
        </div>

        {/* Name and Status */}
        <div className="text-center pb-6 border-b border-border/50">
          <h2 className="text-xl font-semibold tracking-tight">{client.name}</h2>
          {client.nickname && (
            <p className="text-sm text-muted-foreground mt-0.5">"{client.nickname}"</p>
          )}
          <div className="mt-3">
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
              className="w-full group"
              onClick={onResendInvite}
              disabled={isResending}
            >
              {isResending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
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
    <div className="flex items-start gap-3 group">
      <div className="rounded-lg bg-muted/50 p-2.5 text-muted-foreground transition-colors group-hover:bg-muted group-hover:text-foreground">
        {icon}
      </div>
      <div className="min-w-0 flex-1 pt-0.5">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{label}</p>
        <p className="text-sm font-medium truncate mt-0.5" title={value}>
          {value}
        </p>
      </div>
    </div>
  )
}

function NicknameRow({ clientId, nickname }: { clientId: string; nickname: string | null }) {
  return (
    <div className="flex items-start gap-3 group">
      <div className="rounded-lg bg-muted/50 p-2.5 text-muted-foreground transition-colors group-hover:bg-muted group-hover:text-foreground">
        <UserRound className="h-4 w-4" />
      </div>
      <div className="min-w-0 flex-1 pt-0.5">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Nickname</p>
        <div className="mt-0.5">
          <NicknameEditor clientId={clientId} nickname={nickname} />
        </div>
      </div>
    </div>
  )
}
