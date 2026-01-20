import { type ClientStatus } from '@app/shared/clients'
import { ChevronRight } from 'lucide-react'

import { Avatar, AvatarFallback } from '@/components/ui'

import { StatusBadge } from './StatusBadge'

export interface Client {
  id: string
  clientId: string
  name: string
  email: string
  status: ClientStatus
  nickname: string | null
  createdAt: string
}

interface ClientsTableProps {
  clients: Client[]
  onRowClick: (id: string) => void
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return `${diffDays} days ago`

  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export function ClientsTable({ clients, onRowClick }: ClientsTableProps) {
  return (
    <div className="rounded-lg border border-border/50 overflow-hidden shadow-md">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border/50 bg-zinc-200/70 text-left text-sm text-muted-foreground">
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium text-center">Status</th>
              <th className="px-4 py-3 font-medium hidden sm:table-cell">Added</th>
              <th className="px-4 py-3 font-medium w-10"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50 bg-card">
            {clients.map((client) => (
              <tr
                key={client.id}
                onClick={() => onRowClick(client.id)}
                className="group cursor-pointer transition-colors hover:bg-muted/30"
              >
                <td className="px-4 py-4">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-9 w-9 text-xs">
                      <AvatarFallback className="bg-primary/10 text-primary font-medium">
                        {getInitials(client.nickname ?? client.name)}
                      </AvatarFallback>
                    </Avatar>
                    <span
                      className="font-medium truncate max-w-[200px] block text-sm"
                      title={client.nickname ? `${client.nickname} (${client.name})` : client.name}
                    >
                      {client.nickname ? (
                        <>
                          {client.nickname}{' '}
                          <span className="text-muted-foreground font-normal">({client.name})</span>
                        </>
                      ) : (
                        client.name
                      )}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-4 text-center">
                  <StatusBadge status={client.status} />
                </td>
                <td className="px-4 py-4 text-sm text-muted-foreground hidden sm:table-cell">
                  {formatDate(client.createdAt)}
                </td>
                <td className="px-4 py-4">
                  <ChevronRight
                    className="h-4 w-4 text-muted-foreground/50 transition-all group-hover:text-muted-foreground group-hover:translate-x-0.5"
                    strokeWidth={1.5}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
