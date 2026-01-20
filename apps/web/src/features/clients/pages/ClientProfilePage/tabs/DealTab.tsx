import { Link } from '@tanstack/react-router'
import { ArrowRight, Briefcase } from 'lucide-react'

interface DealTabProps {
  clientId: string
}

export function DealTab({ clientId }: DealTabProps) {
  return (
    <div className="space-y-6">
      {/* Empty State */}
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="rounded-full bg-muted/50 p-4 mb-4">
          <Briefcase className="h-6 w-6 text-muted-foreground" strokeWidth={1.5} />
        </div>
        <h3 className="text-lg font-semibold tracking-tight mb-1">No active deal</h3>
        <p className="text-sm text-muted-foreground max-w-xs">
          This client doesn't have an active deal yet. Start one when you're ready.
        </p>
      </div>
      <ViewMoreLink clientId={clientId} />
    </div>
  )
}

function ViewMoreLink({ clientId }: { clientId: string }) {
  return (
    <div className="pt-2 border-t border-border/50">
      <Link
        to="/deals"
        search={{ clientId }}
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        View all deals
        <ArrowRight className="h-3.5 w-3.5" strokeWidth={2} />
      </Link>
    </div>
  )
}
