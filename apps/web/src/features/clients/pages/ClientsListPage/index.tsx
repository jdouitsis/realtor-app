import { getRouteApi } from '@tanstack/react-router'
import { Loader2, UserPlus, Users } from 'lucide-react'

import { Button } from '@/components/ui'
import { parseError } from '@/lib/errors'
import { trpc } from '@/lib/trpc'

import { type Client, ClientsTable } from './components/ClientsTable'
import { StatusFilter } from './components/StatusFilter'

const routeApi = getRouteApi('/_authenticated/clients/')

type FilterStatus = 'all' | 'invited' | 'active' | 'inactive'

export function ClientsListPage() {
  const { status } = routeApi.useSearch()
  const routeNavigate = routeApi.useNavigate()

  const currentStatus: FilterStatus = status ?? 'all'
  const queryStatus = currentStatus === 'all' ? undefined : currentStatus

  const clientsQuery = trpc.clients.list.useQuery({ status: queryStatus }, { staleTime: 30_000 })

  const handleStatusChange = (newStatus: FilterStatus) => {
    void routeNavigate({
      search: newStatus === 'all' ? {} : { status: newStatus },
    })
  }

  const handleRowClick = (_id: string) => {
    // TODO: Navigate to client detail page when Feature 04 is implemented
    // void navigate({ to: '/clients/$id', params: { id } })
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-3xl font-bold">Clients</h1>
        <Button disabled>
          <UserPlus className="h-4 w-4" />
          Invite Client
        </Button>
      </div>

      <StatusFilter value={currentStatus} onChange={handleStatusChange} />

      <ClientsContent
        clients={clientsQuery.data}
        isLoading={clientsQuery.isLoading}
        error={clientsQuery.error}
        onRefetch={() => void clientsQuery.refetch()}
        currentStatus={currentStatus}
        onRowClick={handleRowClick}
      />
    </div>
  )
}

interface ClientsContentProps {
  clients: Client[] | undefined
  isLoading: boolean
  error: unknown
  onRefetch: () => void
  currentStatus: FilterStatus
  onRowClick: (id: string) => void
}

function ClientsContent({
  clients,
  isLoading,
  error,
  onRefetch,
  currentStatus,
  onRowClick,
}: ClientsContentProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (error) {
    const parsed = parseError(error)
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <p className="text-destructive mb-2">Failed to load clients</p>
        <p className="text-sm text-muted-foreground mb-4">{parsed.userMessage}</p>
        <Button variant="outline" onClick={onRefetch}>
          Try again
        </Button>
      </div>
    )
  }

  if (!clients || clients.length === 0) {
    return <EmptyState currentStatus={currentStatus} />
  }

  return <ClientsTable clients={clients} onRowClick={onRowClick} />
}

function EmptyState({ currentStatus }: { currentStatus: FilterStatus }) {
  if (currentStatus === 'all') {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Users className="h-12 w-12 text-muted-foreground mb-4" />
        <p className="text-lg font-medium mb-1">No clients yet</p>
        <p className="text-sm text-muted-foreground">Invite your first client to get started</p>
      </div>
    )
  }

  const statusLabel = currentStatus.charAt(0).toUpperCase() + currentStatus.slice(1)
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <p className="text-muted-foreground">No {statusLabel.toLowerCase()} clients found</p>
    </div>
  )
}
