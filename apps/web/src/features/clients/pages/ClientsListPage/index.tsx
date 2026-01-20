import { CLIENT_STATUSES, type ClientStatus, DEFAULT_CLIENT_STATUSES } from '@app/shared/clients'
import { getRouteApi, useNavigate } from '@tanstack/react-router'
import { AlertCircle, UserPlus, Users } from 'lucide-react'
import { useMemo, useState } from 'react'

import { Button, Skeleton } from '@/components/ui'
import { parseError } from '@/lib/errors'
import { trpc } from '@/lib/trpc'

import { type Client, ClientsTable } from './components/ClientsTable'
import { InviteClientDialog } from './components/InviteClientDialog'
import { StatusFilter } from './components/StatusFilter'

const routeApi = getRouteApi('/_authenticated/clients/')

export function ClientsListPage() {
  const [isInviteOpen, setIsInviteOpen] = useState(false)

  const { statuses } = routeApi.useSearch()
  const routeNavigate = routeApi.useNavigate()
  const navigate = useNavigate()

  const currentStatuses: ClientStatus[] = statuses ?? DEFAULT_CLIENT_STATUSES

  const clientsQuery = trpc.clients.list.useQuery({}, { staleTime: 30_000 })

  const filteredClients = useMemo(() => {
    if (!clientsQuery.data) return undefined
    if (currentStatuses.length === 0) return clientsQuery.data
    return clientsQuery.data.filter((c) => currentStatuses.includes(c.status))
  }, [clientsQuery.data, currentStatuses])

  const handleStatusToggle = (status: ClientStatus) => {
    const allSelected = CLIENT_STATUSES.every((s) => currentStatuses.includes(s))

    let newStatuses: ClientStatus[]
    if (allSelected) {
      // When all are selected, clicking one selects only that one
      newStatuses = CLIENT_STATUSES.filter((s) => s !== status)
    } else if (currentStatuses.includes(status)) {
      // Deselect the clicked status
      newStatuses = currentStatuses.filter((s) => s !== status)
    } else {
      // Add the clicked status
      newStatuses = [...currentStatuses, status]
    }

    void routeNavigate({
      search: newStatuses.length === 0 ? {} : { statuses: newStatuses.join(',') },
    })
  }

  const handleRowClick = (id: string) => {
    void navigate({ to: '/clients/$id', params: { id } })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold tracking-tight">Clients</h1>
          <p className="text-sm text-muted-foreground">Manage and view your client relationships</p>
        </div>
        <Button size="sm" onClick={() => setIsInviteOpen(true)}>
          <UserPlus className="h-4 w-4" strokeWidth={1.5} />
          Invite Client
        </Button>
      </div>

      {/* Filters */}
      <StatusFilter selectedStatuses={currentStatuses} onToggle={handleStatusToggle} />

      {/* Content */}
      <ClientsContent
        clients={filteredClients}
        isLoading={clientsQuery.isLoading}
        error={clientsQuery.error}
        onRefetch={() => void clientsQuery.refetch()}
        hasAnyClients={(clientsQuery.data?.length ?? 0) > 0}
        onRowClick={handleRowClick}
      />

      <InviteClientDialog open={isInviteOpen} onOpenChange={setIsInviteOpen} />
    </div>
  )
}

interface ClientsContentProps {
  clients: Client[] | undefined
  isLoading: boolean
  error: unknown
  onRefetch: () => void
  hasAnyClients: boolean
  onRowClick: (id: string) => void
}

function ClientsContent({
  clients,
  isLoading,
  error,
  onRefetch,
  hasAnyClients,
  onRowClick,
}: ClientsContentProps) {
  if (isLoading) {
    return <LoadingSkeleton />
  }

  if (error) {
    const parsed = parseError(error)
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="rounded-full bg-destructive/10 p-4 mb-4">
          <AlertCircle className="h-6 w-6 text-destructive" strokeWidth={1.5} />
        </div>
        <h2 className="text-lg font-semibold tracking-tight mb-1">Failed to load clients</h2>
        <p className="text-sm text-muted-foreground mb-6">{parsed.userMessage}</p>
        <Button variant="outline" size="sm" onClick={onRefetch}>
          Try again
        </Button>
      </div>
    )
  }

  if (!clients || clients.length === 0) {
    return <EmptyState hasAnyClients={hasAnyClients} />
  }

  return <ClientsTable clients={clients} onRowClick={onRowClick} />
}

function LoadingSkeleton() {
  return (
    <div className="rounded-lg border border-border/50 overflow-hidden">
      {/* Header row skeleton */}
      <div className="border-b border-border/50 bg-zinc-200/70 px-4 py-3">
        <div className="flex items-center gap-4">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-16 mx-auto" />
          <Skeleton className="h-4 w-20 hidden sm:block" />
        </div>
      </div>
      {/* Row skeletons */}
      <div className="bg-card">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            // eslint-disable-next-line react-x/no-array-index-key -- Static skeleton rows never reorder
            key={`skeleton-row-${i}`}
            className="flex items-center gap-3 px-4 py-4 border-b border-border/50 last:border-b-0"
          >
            <Skeleton className="h-9 w-9 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-32" />
            </div>
            <Skeleton className="h-5 w-16 rounded-full" />
            <Skeleton className="h-4 w-20 hidden sm:block" />
          </div>
        ))}
      </div>
    </div>
  )
}

function EmptyState({ hasAnyClients }: { hasAnyClients: boolean }) {
  if (!hasAnyClients) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="rounded-full bg-muted/50 p-4 mb-4">
          <Users className="h-6 w-6 text-muted-foreground" strokeWidth={1.5} />
        </div>
        <h2 className="text-lg font-semibold tracking-tight mb-1">No clients yet</h2>
        <p className="text-sm text-muted-foreground max-w-xs">
          Invite your first client to get started
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center py-16 text-center rounded-lg border border-border/50">
      <p className="text-sm text-muted-foreground">No clients match the selected filters</p>
    </div>
  )
}
