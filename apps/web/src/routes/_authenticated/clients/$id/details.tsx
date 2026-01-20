import { createFileRoute } from '@tanstack/react-router'
import {
  Baby,
  Calendar,
  Coffee,
  Heart,
  Mail,
  UserRound,
  Users,
  UtensilsCrossed,
} from 'lucide-react'

import { trpc } from '@/lib/trpc'

export const Route = createFileRoute('/_authenticated/clients/$id/details')({
  component: DetailsTab,
})

function formatMemberSince(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
}

function DetailsTab() {
  const { id } = Route.useParams()
  const clientQuery = trpc.clients.getById.useQuery({ id })

  if (!clientQuery.data) {
    return null
  }

  const client = clientQuery.data

  return (
    <div className="space-y-6">
      {/* Contact Information - Mobile only (shown in sidebar on desktop) */}
      <div className="md:hidden">
        <h3 className="text-sm font-medium text-muted-foreground mb-3">Contact</h3>
        <div className="rounded-lg border border-border/50 bg-card shadow-md divide-y divide-border/50">
          <DetailRow
            icon={<Mail className="h-4 w-4 text-blue-700" strokeWidth={2} />}
            label="Email"
            value={client.email}
          />
          <DetailRow
            icon={<Calendar className="h-4 w-4 text-blue-700" strokeWidth={2} />}
            label="Joined"
            value={formatMemberSince(client.createdAt)}
          />
          <DetailRow
            icon={<UserRound className="h-4 w-4 text-blue-700" strokeWidth={2} />}
            label="Nickname"
            value={client.nickname || 'Not set'}
            placeholder={!client.nickname}
          />
        </div>
      </div>

      {/* Family */}
      <div>
        <h3 className="text-sm font-medium text-muted-foreground mb-3">Family</h3>
        <div className="rounded-lg border border-border/50 bg-card shadow-md divide-y divide-border/50">
          <DetailRow
            icon={<Heart className="h-4 w-4 text-blue-700" strokeWidth={2} />}
            label="Spouse"
            value="Not set"
            placeholder
          />
          <DetailRow
            icon={<Baby className="h-4 w-4 text-blue-700" strokeWidth={2} />}
            label="Children"
            value="Not set"
            placeholder
          />
          <DetailRow
            icon={<Users className="h-4 w-4 text-blue-700" strokeWidth={2} />}
            label="Other Family Members"
            value="Not set"
            placeholder
          />
        </div>
      </div>

      {/* Preferences */}
      <div>
        <h3 className="text-sm font-medium text-muted-foreground mb-3">Preferences</h3>
        <div className="rounded-lg border border-border/50 bg-card shadow-md divide-y divide-border/50">
          <DetailRow
            icon={<Coffee className="h-4 w-4 text-blue-700" strokeWidth={2} />}
            label="Preferred Drink"
            value="Not set"
            placeholder
          />
          <DetailRow
            icon={<UtensilsCrossed className="h-4 w-4 text-blue-700" strokeWidth={2} />}
            label="Preferred Food"
            value="Not set"
            placeholder
          />
        </div>
      </div>
    </div>
  )
}

function DetailRow({
  icon,
  label,
  value,
  placeholder,
}: {
  icon: React.ReactNode
  label: string
  value: string
  placeholder?: boolean
}) {
  return (
    <div className="flex items-center gap-3 px-4 py-4 transition-colors">
      <span className="p-2 rounded-lg">{icon}</span>
      <div className="flex-1 min-w-0">
        <span className="block text-xs text-muted-foreground">{label}</span>
        <p
          className={`text-sm truncate ${
            placeholder ? 'text-muted-foreground italic' : 'font-medium'
          }`}
          title={value}
        >
          {value}
        </p>
      </div>
    </div>
  )
}
