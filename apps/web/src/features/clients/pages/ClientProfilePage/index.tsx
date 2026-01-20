import { Link, Outlet, useLocation } from '@tanstack/react-router'
import type { LucideIcon } from 'lucide-react'
import {
  AlertCircle,
  ArrowLeft,
  Briefcase,
  ClipboardList,
  History,
  User,
  UserX,
} from 'lucide-react'
import { toast } from 'sonner'

import { Button, Skeleton } from '@/components/ui'
import { parseError } from '@/lib/errors'
import { trpc } from '@/lib/trpc'
import { cn } from '@/lib/utils'
import type { FileRouteTypes } from '@/routeTree.gen'

import { ClientProfileCard } from './components/ClientProfileCard'

interface ClientProfileLayoutProps {
  clientId: string
}

interface Tab {
  label: string
  path: FileRouteTypes['to']
  icon: LucideIcon
}

const TABS: Tab[] = [
  { label: 'Activity', path: '/clients/$id/activity', icon: History },
  { label: 'Deals', path: '/clients/$id/deals', icon: Briefcase },
  { label: 'Forms', path: '/clients/$id/forms', icon: ClipboardList },
  { label: 'Artifacts', path: '/clients/$id/artifacts', icon: User },
]

export function ClientProfileLayout({ clientId }: ClientProfileLayoutProps) {
  const location = useLocation()

  const utils = trpc.useUtils()

  const clientQuery = trpc.clients.getById.useQuery(
    { id: clientId },
    {
      staleTime: 30_000,
      retry: (failureCount, error) => {
        if (error.data?.code === 'NOT_FOUND') return false
        return failureCount < 3
      },
    }
  )

  const updateStatus = trpc.clients.updateStatus.useMutation({
    onMutate: async ({ id, status }) => {
      await utils.clients.getById.cancel({ id })
      const previous = utils.clients.getById.getData({ id })

      utils.clients.getById.setData({ id }, (old) => (old ? { ...old, status } : old))

      return { previous }
    },
    onError: (err, { id }, context) => {
      if (context?.previous) {
        utils.clients.getById.setData({ id }, context.previous)
      }
      const parsed = parseError(err)
      toast.error(parsed.userMessage)
    },
    onSettled: (_, __, { id }) => {
      void utils.clients.getById.invalidate({ id })
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
    updateStatus.mutate({ id: clientId, status: newStatus })
  }

  const handleResendInvite = () => {
    resendInvite.mutate({ id: clientId, redirectUrl: '/forms' })
  }

  if (clientQuery.isLoading) {
    return <LoadingSkeleton />
  }

  if (clientQuery.error) {
    const parsed = parseError(clientQuery.error)
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
        <Button variant="outline" size="sm" onClick={() => void clientQuery.refetch()}>
          Try again
        </Button>
      </div>
    )
  }

  const client = clientQuery.data
  if (!client) {
    return null
  }

  const currentPath = location.pathname

  const hydratedTabs = TABS.map((tab) => ({
    ...tab,
    resolvedPath: tab.path.replace('$id', clientId),
    isActive: currentPath.startsWith(tab.path.replace('$id', clientId)),
    Icon: tab.icon,
  }))

  return (
    <div className="space-y-6">
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
          {client.nickname || client.name}
        </span>
      </nav>

      <div className="flex flex-col md:flex-row gap-8 md:gap-12">
        {/* Sidebar - avatar always visible, details hidden on mobile */}
        <aside className="w-full md:w-64 flex-shrink-0">
          <ClientProfileCard
            client={client}
            onStatusChange={handleStatusChange}
            isUpdating={updateStatus.isPending}
            onResendInvite={handleResendInvite}
            isResending={resendInvite.isPending}
          />
        </aside>

        {/* Main Content */}
        <main className="flex-1">
          {/* Tabs Navigation */}
          <div className="border-b border-border mb-6 -mx-4 px-4 md:mx-0 md:px-0 overflow-x-auto">
            <nav className="flex gap-1 min-w-max">
              {hydratedTabs.map(({ path, label, isActive, Icon }) => (
                <Link
                  key={path}
                  to={path}
                  params={{ id: clientId }}
                  className={cn(
                    'relative flex items-center gap-2 px-3 md:px-4 py-2.5 text-sm font-medium transition-colors whitespace-nowrap',
                    isActive
                      ? 'text-blue-600 hover:text-blue-600'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  <Icon className="h-4 w-4 flex-shrink-0" strokeWidth={1.5} />
                  {label}
                  {isActive && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
                  )}
                </Link>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <Outlet />
        </main>
      </div>
    </div>
  )
}

function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-5 w-32" />
      <div className="flex flex-col md:flex-row gap-8 md:gap-12">
        <aside className="w-full md:w-64 flex-shrink-0 space-y-6">
          <div className="flex flex-col items-center space-y-4">
            <Skeleton className="h-20 w-20 rounded-full" />
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-5 w-16" />
          </div>
          <div className="hidden md:block space-y-1 rounded-lg border border-border/50">
            <Skeleton className="h-14 w-full" />
            <Skeleton className="h-14 w-full" />
            <Skeleton className="h-14 w-full" />
          </div>
        </aside>
        <main className="flex-1 space-y-6">
          <Skeleton className="h-10 w-80 max-w-full" />
          <Skeleton className="h-64 w-full rounded-lg" />
        </main>
      </div>
    </div>
  )
}
