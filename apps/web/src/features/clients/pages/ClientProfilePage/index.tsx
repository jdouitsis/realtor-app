import { getRouteApi, Link } from '@tanstack/react-router'
import {
  AlertCircle,
  ArrowLeft,
  CalendarDays,
  CheckCircle,
  ClipboardList,
  History,
  Home,
  Loader2,
  Mail,
  UserPlus,
  UserX,
} from 'lucide-react'
import { toast } from 'sonner'

import { Button, Card, CardContent, CardHeader, CardTitle } from '@/components/ui'
import { parseError } from '@/lib/errors'
import { trpc } from '@/lib/trpc'

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
      <Link
        to="/clients"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
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
    return (
      <Card className="flex items-center justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </Card>
    )
  }

  if (error) {
    const parsed = parseError(error)
    const isNotFound = parsed.appCode === 'NOT_FOUND'

    if (isNotFound) {
      return (
        <Card className="flex flex-col items-center justify-center py-16 text-center">
          <div className="rounded-full bg-muted p-4 mb-4">
            <UserX className="h-8 w-8 text-muted-foreground" />
          </div>
          <p className="text-lg font-semibold mb-1">Client not found</p>
          <p className="text-sm text-muted-foreground mb-4">
            This client doesn't exist or you don't have access to view it.
          </p>
          <Button variant="outline" asChild>
            <Link to="/clients">Back to Clients</Link>
          </Button>
        </Card>
      )
    }

    return (
      <Card className="flex flex-col items-center justify-center py-16 text-center">
        <div className="rounded-full bg-destructive/10 p-3 mb-4">
          <AlertCircle className="h-6 w-6 text-destructive" />
        </div>
        <p className="font-medium mb-1">Failed to load client</p>
        <p className="text-sm text-muted-foreground mb-4">{parsed.userMessage}</p>
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
      <div className="lg:w-80 flex-shrink-0">
        <ClientProfileCard
          client={client}
          onStatusChange={onStatusChange}
          isUpdating={isUpdating}
          onResendInvite={onResendInvite}
          isResending={isResending}
        />
      </div>

      <div className="flex-1 flex flex-col gap-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <PlaceholderCard
            icon={<Home className="h-5 w-5" />}
            title="Open Deals"
            description="Active property transactions"
            count={0}
          />
          <PlaceholderCard
            icon={<ClipboardList className="h-5 w-5" />}
            title="Pending Forms"
            description="Awaiting signature"
            count={0}
          />
          <PlaceholderCard
            icon={<CalendarDays className="h-5 w-5" />}
            title="Important Dates"
            description="Upcoming deadlines"
            count={0}
          />
        </div>

        <LatestActivity createdAt={client.createdAt} className="flex-1" />
      </div>
    </div>
  )
}

function PlaceholderCard({
  icon,
  title,
  description,
  count,
}: {
  icon: React.ReactNode
  title: string
  description: string
  count: number
}) {
  return (
    <Card className="relative overflow-hidden">
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="rounded-lg bg-primary/10 p-2.5">
            <div className="text-primary">{icon}</div>
          </div>
          <span className="text-2xl font-bold text-muted-foreground/30">{count}</span>
        </div>
        <div className="mt-4">
          <h3 className="font-semibold">{title}</h3>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-primary/20 to-transparent" />
      </CardContent>
    </Card>
  )
}

function LatestActivity({ createdAt, className }: { createdAt: string; className?: string }) {
  // Mock activity data - in the future this would come from an API
  const activities = [
    {
      icon: <CheckCircle className="h-4 w-4" />,
      iconBg: 'bg-emerald-100 text-emerald-600',
      description: 'Client activated their account',
      date: new Date().toISOString(),
    },
    {
      icon: <Mail className="h-4 w-4" />,
      iconBg: 'bg-blue-100 text-blue-600',
      description: 'Invitation email sent',
      date: createdAt,
    },
    {
      icon: <UserPlus className="h-4 w-4" />,
      iconBg: 'bg-violet-100 text-violet-600',
      description: 'Client added to your list',
      date: createdAt,
    },
  ]

  return (
    <Card className={className}>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-base">
          <History className="h-5 w-5 text-muted-foreground" />
          Latest Activity
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-4 top-2 bottom-2 w-px bg-border" />

          <div className="space-y-6">
            {activities.map((activity) => (
              <ActivityItem key={activity.description} {...activity} />
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
}: {
  icon: React.ReactNode
  iconBg: string
  description: string
  date: string
}) {
  const formattedDate = new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })

  return (
    <div className="flex items-start gap-4 relative">
      <div
        className={`relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${iconBg}`}
      >
        {icon}
      </div>
      <div className="flex-1 pt-1">
        <p className="text-sm font-medium">{description}</p>
        <p className="text-xs text-muted-foreground">{formattedDate}</p>
      </div>
    </div>
  )
}
