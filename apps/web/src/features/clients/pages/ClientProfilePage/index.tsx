import { getRouteApi, Link } from '@tanstack/react-router'
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle,
  ClipboardList,
  History,
  Home,
  Loader2,
  Mail,
  UserPlus,
} from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui'
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

  const handleStatusChange = (newStatus: 'active' | 'inactive') => {
    updateStatus.mutate({ id, status: newStatus })
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
        createdAt: string
      }
    | undefined
  isLoading: boolean
  error: unknown
  onRefetch: () => void
  onStatusChange: (newStatus: 'active' | 'inactive') => void
  isUpdating: boolean
}

function ClientProfileContent({
  client,
  isLoading,
  error,
  onRefetch,
  onStatusChange,
  isUpdating,
}: ClientProfileContentProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (error) {
    const parsed = parseError(error)
    const isNotFound = parsed.appCode === 'NOT_FOUND'

    if (isNotFound) {
      return (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <p className="text-lg font-medium mb-2">Client not found</p>
          <p className="text-sm text-muted-foreground mb-4">
            This client doesn't exist or you don't have access to view it.
          </p>
          <Button variant="outline" asChild>
            <Link to="/clients">Back to Clients</Link>
          </Button>
        </div>
      )
    }

    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <p className="text-destructive mb-2">Failed to load client</p>
        <p className="text-sm text-muted-foreground mb-4">{parsed.userMessage}</p>
        <Button variant="outline" onClick={onRefetch}>
          Try again
        </Button>
      </div>
    )
  }

  if (!client) {
    return null
  }

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      <div className="lg:w-72 flex-shrink-0">
        <ClientProfileCard
          client={client}
          onStatusChange={onStatusChange}
          isUpdating={isUpdating}
        />
      </div>

      <div className="flex-1 space-y-6">
        <PlaceholderSection
          icon={<Home className="h-5 w-5" />}
          title="Open Deals"
          description="Track active property transactions with this client"
        />

        <hr className="border-border" />

        <PlaceholderSection
          icon={<ClipboardList className="h-5 w-5" />}
          title="Pending Forms"
          description="Forms waiting on client signature or completion"
        />

        <hr className="border-border" />

        <PlaceholderSection
          icon={<CalendarDays className="h-5 w-5" />}
          title="Important Dates"
          description="Upcoming deadlines, inspections, and closing dates"
        />

        <hr className="border-border" />

        <LatestActivity createdAt={client.createdAt} />
      </div>
    </div>
  )
}

function PlaceholderSection({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode
  title: string
  description: string
}) {
  return (
    <section className="space-y-2">
      <h2 className="flex items-center gap-2 text-lg font-semibold">
        {icon}
        {title}
      </h2>
      <p className="text-sm text-muted-foreground">{description}</p>
      <p className="text-xs text-muted-foreground/60">Coming soon</p>
    </section>
  )
}

function LatestActivity({ createdAt }: { createdAt: string }) {
  // Mock activity data - in the future this would come from an API
  const activities = [
    {
      icon: <CheckCircle className="h-4 w-4 text-green-600" />,
      description: 'Client activated their account',
      date: new Date().toISOString(),
    },
    {
      icon: <Mail className="h-4 w-4 text-blue-600" />,
      description: 'Invitation email sent',
      date: createdAt,
    },
    {
      icon: <UserPlus className="h-4 w-4 text-purple-600" />,
      description: 'Client added to your list',
      date: createdAt,
    },
  ]

  return (
    <section className="space-y-3">
      <h2 className="flex items-center gap-2 text-lg font-semibold">
        <History className="h-5 w-5" />
        Latest Activity
      </h2>
      <div className="space-y-4">
        {activities.map((activity) => (
          <ActivityItem key={activity.description} {...activity} />
        ))}
      </div>
    </section>
  )
}

function ActivityItem({
  icon,
  description,
  date,
}: {
  icon: React.ReactNode
  description: string
  date: string
}) {
  const formattedDate = new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })

  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-full bg-muted">
        {icon}
      </div>
      <div>
        <p className="text-sm">{description}</p>
        <p className="text-xs text-muted-foreground">{formattedDate}</p>
      </div>
    </div>
  )
}
