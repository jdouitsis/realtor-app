import { getRouteApi, Link } from '@tanstack/react-router'
import {
  AlertCircle,
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  FileText,
  Home,
  Mail,
  MoreHorizontal,
  UserPlus,
  UserX,
} from 'lucide-react'
import { toast } from 'sonner'

import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Skeleton,
} from '@/components/ui'
import { parseError } from '@/lib/errors'
import { trpc } from '@/lib/trpc'
import { cn } from '@/lib/utils'

import { ClientProfileCard } from './components/ClientProfileCard'

const routeApi = getRouteApi('/_authenticated/clients/$id')

export function ClientProfilePage() {
  const { id } = routeApi.useParams()

  const utils = trpc.useUtils()

  const clientQuery = trpc.clients.getById.useQuery(
    { id },
    {
      staleTime: 30_000,
      retry: (failureCount, error) => {
        if (error.data?.code === 'NOT_FOUND') return false
        return failureCount < 3
      },
    }
  )

  const updateStatus = trpc.clients.updateStatus.useMutation({
    onMutate: async ({ id: clientId, status }) => {
      await utils.clients.getById.cancel({ id: clientId })
      const previous = utils.clients.getById.getData({ id: clientId })

      utils.clients.getById.setData({ id: clientId }, (old) => (old ? { ...old, status } : old))

      return { previous }
    },
    onError: (err, { id: clientId }, context) => {
      if (context?.previous) {
        utils.clients.getById.setData({ id: clientId }, context.previous)
      }
      const parsed = parseError(err)
      toast.error(parsed.userMessage)
    },
    onSettled: (_, __, { id: clientId }) => {
      void utils.clients.getById.invalidate({ id: clientId })
      void utils.clients.list.invalidate()
    },
    onSuccess: (_, { status }) => {
      toast.success(`Client marked as ${status}`)
    },
  })

  const resendInvite = trpc.clients.resendInvite.useMutation({
    onError: (err) => {
      const parsed = parseError(err)
      toast.error(parsed.userMessage)
    },
    onSuccess: () => {
      toast.success('Invitation resent')
    },
  })

  const handleStatusChange = (newStatus: 'active' | 'inactive') => {
    updateStatus.mutate({ id, status: newStatus })
  }

  const handleResendInvite = () => {
    resendInvite.mutate({ id, redirectUrl: '/forms' })
  }

  return (
    <div className="space-y-8">
      {/* Navigation */}
      <nav className="flex items-center gap-2 text-sm">
        <Link
          to="/clients"
          className="text-muted-foreground hover:text-foreground transition-colors"
        >
          Clients
        </Link>
        <span className="text-muted-foreground/50">/</span>
        <span className="text-foreground font-medium truncate">
          {clientQuery.data?.nickname || clientQuery.data?.name || 'Profile'}
        </span>
      </nav>

      <ClientProfileContent
        client={clientQuery.data}
        isLoading={clientQuery.isLoading}
        error={clientQuery.error}
        onRefetch={() => void clientQuery.refetch()}
        onStatusChange={handleStatusChange}
        isUpdating={updateStatus.isPending}
        onResendInvite={handleResendInvite}
        isResending={resendInvite.isPending}
      />
    </div>
  )
}

interface ClientProfileContentProps {
  client:
    | {
        id: string
        clientId: string
        name: string
        email: string
        status: 'invited' | 'active' | 'inactive'
        nickname: string | null
        createdAt: string
      }
    | undefined
  isLoading: boolean
  error: unknown
  onRefetch: () => void
  onStatusChange: (newStatus: 'active' | 'inactive') => void
  isUpdating: boolean
  onResendInvite: () => void
  isResending: boolean
}

function ClientProfileContent({
  client,
  isLoading,
  error,
  onRefetch,
  onStatusChange,
  isUpdating,
  onResendInvite,
  isResending,
}: ClientProfileContentProps) {
  if (isLoading) {
    return <LoadingSkeleton />
  }

  if (error) {
    const parsed = parseError(error)
    const isNotFound = parsed.appCode === 'NOT_FOUND'

    if (isNotFound) {
      return (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="rounded-full bg-muted/50 p-4 mb-4">
            <UserX className="h-6 w-6 text-muted-foreground" strokeWidth={1.5} />
          </div>
          <h2 className="text-lg font-semibold tracking-tight mb-1">Client not found</h2>
          <p className="text-sm text-muted-foreground mb-6 max-w-xs">
            This client doesn't exist or has been removed.
          </p>
          <Button variant="outline" size="sm" asChild>
            <Link to="/clients">
              <ArrowLeft className="h-4 w-4" strokeWidth={1.5} />
              Back to clients
            </Link>
          </Button>
        </div>
      )
    }

    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="rounded-full bg-destructive/10 p-4 mb-4">
          <AlertCircle className="h-6 w-6 text-destructive" strokeWidth={1.5} />
        </div>
        <h2 className="text-lg font-semibold tracking-tight mb-1">Something went wrong</h2>
        <p className="text-sm text-muted-foreground mb-6">{parsed.userMessage}</p>
        <Button variant="outline" size="sm" onClick={onRefetch}>
          Try again
        </Button>
      </div>
    )
  }

  if (!client) {
    return null
  }

  return (
    <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
      {/* Sidebar */}
      <aside className="lg:w-64 flex-shrink-0">
        <ClientProfileCard
          client={client}
          onStatusChange={onStatusChange}
          isUpdating={isUpdating}
          onResendInvite={onResendInvite}
          isResending={isResending}
        />
      </aside>

      {/* Main Content */}
      <main className="flex-1 space-y-8">
        {/* Stats Tiles */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-muted-foreground">Overview</h3>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>Export data</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-destructive">Archive client</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="grid gap-px sm:grid-cols-3 rounded-lg border border-border/50 bg-border/50 overflow-hidden">
            <StatTile
              icon={<Home className="h-4 w-4" strokeWidth={1.5} />}
              value={0}
              label="Open deals"
              shortcut="D"
            />
            <StatTile
              icon={<FileText className="h-4 w-4" strokeWidth={1.5} />}
              value={0}
              label="Pending forms"
              shortcut="F"
            />
            <StatTile
              icon={<CalendarDays className="h-4 w-4" strokeWidth={1.5} />}
              value={0}
              label="Important dates"
              shortcut="I"
            />
          </div>
        </section>

        {/* Activity */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-muted-foreground">Activity</h3>
            <Button variant="ghost" size="sm" className="text-xs text-muted-foreground h-7">
              View all
            </Button>
          </div>

          <ActivityTimeline createdAt={client.createdAt} />
        </section>
      </main>
    </div>
  )
}

function LoadingSkeleton() {
  return (
    <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
      <aside className="lg:w-64 flex-shrink-0 space-y-6">
        <div className="flex flex-col items-center space-y-4">
          <Skeleton className="h-20 w-20 rounded-full" />
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-5 w-16" />
        </div>
        <div className="space-y-1 rounded-lg border border-border/50">
          <Skeleton className="h-14 w-full" />
          <Skeleton className="h-14 w-full" />
          <Skeleton className="h-14 w-full" />
        </div>
      </aside>
      <main className="flex-1 space-y-8">
        <div>
          <Skeleton className="h-4 w-20 mb-4" />
          <Skeleton className="h-24 w-full rounded-lg" />
        </div>
        <div>
          <Skeleton className="h-4 w-16 mb-4" />
          <div className="space-y-4">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-3/4" />
          </div>
        </div>
      </main>
    </div>
  )
}

function StatTile({
  icon,
  value,
  label,
  shortcut,
}: {
  icon: React.ReactNode
  value: number
  label: string
  shortcut?: string
}) {
  return (
    <button
      type="button"
      className={cn(
        'relative flex flex-col items-start p-4 bg-card text-left',
        'hover:bg-muted/50 transition-colors',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset'
      )}
    >
      <div className="flex items-center gap-2 text-muted-foreground mb-3">
        {icon}
        <span className="text-xs">{label}</span>
      </div>
      <span className="text-2xl font-semibold tracking-tight tabular-nums">
        {value}
      </span>
      {shortcut && (
        <kbd className="absolute top-3 right-3 hidden sm:inline-flex h-5 px-1.5 items-center justify-center rounded border border-border/50 bg-muted/50 text-[10px] font-medium text-muted-foreground">
          {shortcut}
        </kbd>
      )}
    </button>
  )
}

function ActivityTimeline({ createdAt }: { createdAt: string }) {
  const activities = [
    {
      icon: <CheckCircle2 className="h-3.5 w-3.5" strokeWidth={1.5} />,
      iconColor: 'text-emerald-500',
      description: 'Account activated',
      timestamp: new Date(),
    },
    {
      icon: <Mail className="h-3.5 w-3.5" strokeWidth={1.5} />,
      iconColor: 'text-blue-500',
      description: 'Invitation sent',
      timestamp: new Date(createdAt),
    },
    {
      icon: <UserPlus className="h-3.5 w-3.5" strokeWidth={1.5} />,
      iconColor: 'text-violet-500',
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
