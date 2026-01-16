import { type ClientStatus } from '@app/shared/clients'
import { ChevronRight } from 'lucide-react'

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
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b text-left text-sm text-muted-foreground">
            <th className="pb-3 font-medium">Name</th>
            <th className="pb-3 font-medium">Email</th>
            <th className="pb-3 font-medium">Status</th>
            <th className="pb-3 font-medium hidden sm:table-cell">Created</th>
            <th className="pb-3 font-medium w-10"></th>
          </tr>
        </thead>
        <tbody>
          {clients.map((client) => (
            <tr
              key={client.id}
              onClick={() => onRowClick(client.id)}
              className="border-b cursor-pointer hover:bg-muted/50 transition-colors"
            >
              <td className="py-4">
                {client.nickname ? (
                  <div>
                    <span
                      className="font-medium truncate max-w-[200px] block"
                      title={client.nickname}
                    >
                      {client.nickname}
                    </span>
                    <span
                      className="text-sm text-muted-foreground truncate max-w-[200px] block"
                      title={client.name}
                    >
                      {client.name}
                    </span>
                  </div>
                ) : (
                  <span className="font-medium truncate max-w-[200px] block" title={client.name}>
                    {client.name}
                  </span>
                )}
              </td>
              <td className="py-4">
                <span
                  className="text-muted-foreground truncate max-w-[200px] block"
                  title={client.email}
                >
                  {client.email}
                </span>
              </td>
              <td className="py-4">
                <StatusBadge status={client.status} />
              </td>
              <td className="py-4 text-muted-foreground hidden sm:table-cell">
                {formatDate(client.createdAt)}
              </td>
              <td className="py-4">
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
