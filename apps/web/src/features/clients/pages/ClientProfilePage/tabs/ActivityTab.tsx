import { Link } from '@tanstack/react-router'
import { ArrowRight, CheckCircle2, Mail, UserPlus } from 'lucide-react'

import { trpc } from '@/lib/trpc'
import { cn } from '@/lib/utils'

interface ActivityTabProps {
  clientId: string
}

export function ActivityTab({ clientId }: ActivityTabProps) {
  const clientQuery = trpc.clients.getById.useQuery({ id: clientId })

  if (!clientQuery.data) {
    return null
  }

  return (
    <div className="space-y-6">
      <ActivityTimeline createdAt={clientQuery.data.createdAt} />
      <ViewMoreLink to="/activity" clientId={clientId} label="View all activity" />
    </div>
  )
}

function ActivityTimeline({ createdAt }: { createdAt: string }) {
  const activities = [
    {
      icon: <CheckCircle2 className="h-3.5 w-3.5" strokeWidth={2} />,
      iconColor: 'text-foreground',
      description: 'Account activated',
      timestamp: new Date(),
    },
    {
      icon: <Mail className="h-3.5 w-3.5" strokeWidth={2} />,
      iconColor: 'text-foreground',
      description: 'Invitation sent',
      timestamp: new Date(createdAt),
    },
    {
      icon: <UserPlus className="h-3.5 w-3.5" strokeWidth={2} />,
      iconColor: 'text-foreground',
      description: 'Client created',
      timestamp: new Date(createdAt),
    },
  ]

  return (
    <div className="relative">
      {/* Continuous timeline line */}
      <div className="absolute left-[11px] top-3 bottom-3 w-px bg-border" />

      <div className="space-y-0">
        {activities.map((activity) => (
          <ActivityItem key={activity.description} {...activity} />
        ))}
      </div>
    </div>
  )
}

function ActivityItem({
  icon,
  iconColor,
  description,
  timestamp,
}: {
  icon: React.ReactNode
  iconColor: string
  description: string
  timestamp: Date
}) {
  const relativeTime = getRelativeTime(timestamp)

  return (
    <div
      className={cn(
        'group relative flex items-start gap-4 py-3 px-2 -mx-2 rounded-md',
        'hover:bg-muted/30 transition-colors cursor-default'
      )}
    >
      {/* Icon */}
      <div
        className={cn(
          'relative z-10 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-card border border-border/50',
          iconColor
        )}
      >
        {icon}
      </div>

      {/* Content */}
      <div className="flex-1 flex items-center justify-between gap-4 min-w-0">
        <p className="text-sm">{description}</p>
        <time className="text-xs text-muted-foreground shrink-0" title={timestamp.toLocaleString()}>
          {relativeTime}
        </time>
      </div>
    </div>
  )
}

function getRelativeTime(date: Date): string {
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / (1000 * 60))
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return `${diffDays}d ago`
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function ViewMoreLink({
  to,
  clientId,
  label,
}: {
  to: '/activity' | '/deals' | '/forms' | '/artifacts'
  clientId: string
  label: string
}) {
  return (
    <div className="pt-2 border-t border-border/50">
      <Link
        to={to}
        search={{ clientId }}
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        {label}
        <ArrowRight className="h-3.5 w-3.5" strokeWidth={2} />
      </Link>
    </div>
  )
}
