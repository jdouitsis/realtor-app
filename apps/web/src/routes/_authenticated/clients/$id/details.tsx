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
        <div className="rounded-lg border border-border/50 bg-card divide-y divide-border/50">
          <DetailRow
            icon={<Mail className="h-4 w-4" strokeWidth={1.5} />}
            label="Email"
            value={client.email}
            iconClassName="bg-blue-500/10 text-blue-500"
          />
          <DetailRow
            icon={<Calendar className="h-4 w-4" strokeWidth={1.5} />}
            label="Joined"
            value={formatMemberSince(client.createdAt)}
            iconClassName="bg-amber-500/10 text-amber-500"
          />
          <DetailRow
            icon={<UserRound className="h-4 w-4" strokeWidth={1.5} />}
            label="Nickname"
            value={client.nickname || 'Not set'}
            iconClassName="bg-violet-500/10 text-violet-500"
            placeholder={!client.nickname}
          />
        </div>
      </div>

      {/* Family */}
      <div>
        <h3 className="text-sm font-medium text-muted-foreground mb-3">Family</h3>
        <div className="rounded-lg border border-border/50 bg-card divide-y divide-border/50">
          <DetailRow
            icon={<Heart className="h-4 w-4" strokeWidth={1.5} />}
            label="Spouse"
            value="Not set"
            iconClassName="bg-pink-500/10 text-pink-500"
            placeholder
          />
          <DetailRow
            icon={<Baby className="h-4 w-4" strokeWidth={1.5} />}
            label="Children"
            value="Not set"
            iconClassName="bg-sky-500/10 text-sky-500"
            placeholder
          />
          <DetailRow
            icon={<Users className="h-4 w-4" strokeWidth={1.5} />}
            label="Other Family Members"
            value="Not set"
            iconClassName="bg-violet-500/10 text-violet-500"
            placeholder
          />
        </div>
      </div>

      {/* Preferences */}
      <div>
        <h3 className="text-sm font-medium text-muted-foreground mb-3">Preferences</h3>
        <div className="rounded-lg border border-border/50 bg-card divide-y divide-border/50">
          <DetailRow
            icon={<Coffee className="h-4 w-4" strokeWidth={1.5} />}
            label="Preferred Drink"
            value="Not set"
            iconClassName="bg-orange-500/10 text-orange-500"
            placeholder
          />
          <DetailRow
            icon={<UtensilsCrossed className="h-4 w-4" strokeWidth={1.5} />}
            label="Preferred Food"
            value="Not set"
            iconClassName="bg-rose-500/10 text-rose-500"
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
  iconClassName,
  placeholder,
}: {
  icon: React.ReactNode
  label: string
  value: string
  iconClassName?: string
  placeholder?: boolean
}) {
  return (
    <div className="flex items-center gap-3 px-4 py-4 hover:bg-muted/30 transition-colors">
      <span className={`p-2 rounded-lg ${iconClassName || 'text-muted-foreground'}`}>{icon}</span>
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
