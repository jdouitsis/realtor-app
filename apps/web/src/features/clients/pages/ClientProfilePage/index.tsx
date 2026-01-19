import { getRouteApi, Link } from '@tanstack/react-router'
import {
  AlertCircle,
  ArrowLeft,
  CalendarDays,
  CheckCircle,
  ClipboardList,
  History,
  Home,
  Mail,
  MoreHorizontal,
  UserPlus,
  UserX,
} from 'lucide-react'
import { toast } from 'sonner'

import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
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
        // Don't retry on 404
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
    <div className="space-y-6">
      {/* Back Navigation */}
      <Link
        to="/clients"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors duration-150 group"
      >
        <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
        Back to Clients
      </Link>

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
        <Card className="flex flex-col items-center justify-center py-20 text-center">
          <div className="rounded-full bg-muted p-4 mb-4">
            <UserX className="h-8 w-8 text-muted-foreground" />
          </div>
          <h2 className="text-lg font-semibold tracking-tight mb-1">Client not found</h2>
          <p className="text-sm text-muted-foreground mb-6 max-w-sm">
            This client doesn't exist or you don't have access to view it.
          </p>
          <Button variant="outline" asChild>
            <Link to="/clients">Back to Clients</Link>
          </Button>
        </Card>
      )
    }

    return (
      <Card className="flex flex-col items-center justify-center py-20 text-center">
        <div className="rounded-full bg-destructive/10 p-4 mb-4">
          <AlertCircle className="h-8 w-8 text-destructive" />
        </div>
        <h2 className="text-lg font-semibold tracking-tight mb-1">Failed to load client</h2>
        <p className="text-sm text-muted-foreground mb-6">{parsed.userMessage}</p>
        <Button variant="outline" onClick={onRefetch}>
          Try again
        </Button>
      </Card>
    )
  }

  if (!client) {
    return null
  }

  return (
    <div className="flex flex-col lg:flex-row lg:items-stretch gap-6">
      {/* Left Column - Profile Card */}
      <div className="lg:w-80 flex-shrink-0">
        <ClientProfileCard
          client={client}
          onStatusChange={onStatusChange}
          isUpdating={isUpdating}
          onResendInvite={onResendInvite}
          isResending={isResending}
        />
      </div>

      {/* Right Column - Stats and Activity */}
      <div className="flex-1 flex flex-col gap-6">
        {/* Stats Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <StatCard
            icon={<Home className="h-5 w-5" />}
            title="Open Deals"
            description="Active property transactions"
            count={0}
            accentColor="violet"
          />
          <StatCard
            icon={<ClipboardList className="h-5 w-5" />}
            title="Pending Forms"
            description="Awaiting signature"
            count={0}
            accentColor="blue"
          />
          <StatCard
            icon={<CalendarDays className="h-5 w-5" />}
            title="Important Dates"
            description="Upcoming deadlines"
            count={0}
            accentColor="amber"
          />
        </div>

        {/* Activity Timeline */}
        <LatestActivity createdAt={client.createdAt} className="flex-1" />
      </div>
    </div>
  )
}

function LoadingSkeleton() {
  return (
    <div className="flex flex-col lg:flex-row lg:items-stretch gap-6">
      <div className="lg:w-80 flex-shrink-0">
        <Card className="h-full">
          <div className="h-24 bg-muted/50" />
          <CardContent className="pt-0 px-6 pb-6">
            <div className="flex justify-center -mt-12 mb-4">
              <Skeleton className="h-24 w-24 rounded-full" />
            </div>
            <div className="text-center pb-6 border-b">
              <Skeleton className="h-6 w-32 mx-auto mb-2" />
              <Skeleton className="h-5 w-16 mx-auto" />
            </div>
            <div className="py-6 space-y-4">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
            <Skeleton className="h-10 w-full" />
          </CardContent>
        </Card>
      </div>
      <div className="flex-1 flex flex-col gap-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
        <Skeleton className="h-64 flex-1" />
      </div>
    </div>
  )
}

function StatCard({
  icon,
  title,
  description,
  count,
  accentColor,
}: {
  icon: React.ReactNode
  title: string
  description: string
  count: number
  accentColor: 'violet' | 'blue' | 'amber' | 'emerald'
}) {
  const colorClasses = {
    violet: {
      bg: 'bg-violet-500/10 dark:bg-violet-500/20',
      text: 'text-violet-600 dark:text-violet-400',
      gradient: 'from-violet-500/30',
    },
    blue: {
      bg: 'bg-blue-500/10 dark:bg-blue-500/20',
      text: 'text-blue-600 dark:text-blue-400',
      gradient: 'from-blue-500/30',
    },
    amber: {
      bg: 'bg-amber-500/10 dark:bg-amber-500/20',
      text: 'text-amber-600 dark:text-amber-400',
      gradient: 'from-amber-500/30',
    },
    emerald: {
      bg: 'bg-emerald-500/10 dark:bg-emerald-500/20',
      text: 'text-emerald-600 dark:text-emerald-400',
      gradient: 'from-emerald-500/30',
    },
  }

  const colors = colorClasses[accentColor]

  return (
    <Card className="relative overflow-hidden group hover:shadow-md transition-shadow duration-200">
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className={cn('rounded-xl p-3', colors.bg)}>
            <div className={colors.text}>{icon}</div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>View all</DropdownMenuItem>
              <DropdownMenuItem>Add new</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div className="mt-4">
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold tracking-tighter">{count}</span>
            {count === 0 && (
              <span className="text-xs text-muted-foreground font-medium">No items</span>
            )}
          </div>
          <h3 className="font-semibold mt-1 tracking-tight">{title}</h3>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
        {/* Accent gradient line */}
        <div
          className={cn(
            'absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r to-transparent',
            colors.gradient
          )}
        />
      </CardContent>
    </Card>
  )
}

function LatestActivity({ createdAt, className }: { createdAt: string; className?: string }) {
  const activities = [
    {
      icon: <CheckCircle className="h-4 w-4" />,
      iconBg: 'bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400',
      description: 'Client activated their account',
      date: new Date().toISOString(),
    },
    {
      icon: <Mail className="h-4 w-4" />,
      iconBg: 'bg-blue-500/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400',
      description: 'Invitation email sent',
      date: createdAt,
    },
    {
      icon: <UserPlus className="h-4 w-4" />,
      iconBg: 'bg-violet-500/10 text-violet-600 dark:bg-violet-500/20 dark:text-violet-400',
      description: 'Client added to your list',
      date: createdAt,
    },
  ]

  return (
    <Card className={className}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base font-semibold tracking-tight">
            <div className="rounded-lg bg-muted p-2">
              <History className="h-4 w-4 text-muted-foreground" />
            </div>
            Latest Activity
          </CardTitle>
          <Button variant="ghost" size="sm" className="text-muted-foreground">
            View all
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="relative">
          {/* Timeline line with gradient fade */}
          <div className="absolute left-4 top-2 bottom-2 w-px bg-gradient-to-b from-border via-border to-transparent" />

          <div className="space-y-6">
            {activities.map((activity, index) => (
              <ActivityItem key={activity.description} {...activity} isFirst={index === 0} />
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function ActivityItem({
  icon,
  iconBg,
  description,
  date,
  isFirst,
}: {
  icon: React.ReactNode
  iconBg: string
  description: string
  date: string
  isFirst?: boolean
}) {
  const formattedDate = new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })

  const timeAgo = getRelativeTime(new Date(date))

  return (
    <div className="flex items-start gap-4 relative group">
      <div
        className={cn(
          'relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-transform group-hover:scale-110',
          iconBg,
          isFirst && 'ring-2 ring-background ring-offset-2 ring-offset-background'
        )}
      >
        {icon}
      </div>
      <div className="flex-1 pt-1">
        <p className="text-sm font-medium">{description}</p>
        <p className="text-xs text-muted-foreground mt-0.5">
          {timeAgo} · {formattedDate}
        </p>
      </div>
    </div>
  )
}

function getRelativeTime(date: Date): string {
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return `${diffDays} days ago`
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`
  return `${Math.floor(diffDays / 30)} months ago`
}
