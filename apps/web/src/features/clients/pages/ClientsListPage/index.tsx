import { CLIENT_STATUSES, type ClientStatus, DEFAULT_CLIENT_STATUSES } from '@app/shared/clients'
import { getRouteApi, useNavigate } from '@tanstack/react-router'
import { Loader2, UserPlus, Users } from 'lucide-react'
import { useMemo, useState } from 'react'

import { Button } from '@/components/ui'
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
      newStatuses = [status]
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-3xl font-bold">Clients</h1>
        <Button onClick={() => setIsInviteOpen(true)}>
          <UserPlus className="h-4 w-4" />
          Invite Client
        </Button>
      </div>

      <StatusFilter selectedStatuses={currentStatuses} onToggle={handleStatusToggle} />

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
    return <EmptyState hasAnyClients={hasAnyClients} />
  }

  return <ClientsTable clients={clients} onRowClick={onRowClick} />
}

function EmptyState({ hasAnyClients }: { hasAnyClients: boolean }) {
  if (!hasAnyClients) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Users className="h-12 w-12 text-muted-foreground mb-4" />
        <p className="text-lg font-medium mb-1">No clients yet</p>
        <p className="text-sm text-muted-foreground">Invite your first client to get started</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <p className="text-muted-foreground">No clients match the selected filters</p>
    </div>
  )
}
