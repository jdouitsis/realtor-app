import { Link } from '@tanstack/react-router'
import { Construction } from 'lucide-react'

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui'
import { trpc } from '@/lib/trpc'

interface ComingSoonPageProps {
  title: string
  clientId?: string
}

/**
 * Placeholder page for features that are not yet implemented.
 *
 * @example
 * <ComingSoonPage title="Activity" />
 * <ComingSoonPage title="Activity" clientId="abc123" />
 */
export function ComingSoonPage({ title, clientId }: ComingSoonPageProps) {
  return (
    <div className="space-y-6">
      <ComingSoonBreadcrumb title={title} clientId={clientId} />
      <ComingSoonContent title={title} clientId={clientId} />
    </div>
  )
}

function ComingSoonBreadcrumb({ title, clientId }: ComingSoonPageProps) {
  const clientQuery = trpc.clients.getById.useQuery(
    { id: clientId! },
    { enabled: Boolean(clientId), staleTime: 30_000 }
  )

  const clientName = clientQuery.data?.nickname || clientQuery.data?.name

  if (clientId && clientName) {
    return (
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link to="/clients">Clients</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link to="/clients/$id/activity" params={{ id: clientId }}>
                {clientName}
              </Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{title}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    )
  }

  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbPage>{title}</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  )
}

function ComingSoonContent({ title, clientId }: ComingSoonPageProps) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="rounded-full bg-muted/50 p-4 mb-4">
        <Construction className="h-6 w-6 text-muted-foreground" strokeWidth={1.5} />
      </div>
      <h2 className="text-lg font-semibold tracking-tight mb-1">Coming Soon</h2>
      <p className="text-sm text-muted-foreground max-w-xs mb-6">
        The {title.toLowerCase()} page is under construction. Check back later.
      </p>
      {clientId && (
        <Link
          to="/clients/$id/activity"
          params={{ id: clientId }}
          className="text-sm text-primary hover:underline"
        >
          Back to client profile
        </Link>
      )}
    </div>
  )
}
