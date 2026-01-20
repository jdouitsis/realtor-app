import { createFileRoute } from '@tanstack/react-router'
import { Briefcase } from 'lucide-react'

export const Route = createFileRoute('/_authenticated/clients/$id/deal')({
  component: DealTab,
})

function DealTab() {
  return (
    <div className="space-y-6">
      {/* Empty State */}
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="rounded-full bg-blue-100 p-4 mb-4">
          <Briefcase className="h-6 w-6 text-foreground" strokeWidth={2} />
        </div>
        <h3 className="text-lg font-semibold tracking-tight mb-1">No active deal</h3>
        <p className="text-sm text-muted-foreground max-w-xs">
          This client doesn't have an active deal yet. Start one when you're ready.
        </p>
      </div>
    </div>
  )
}
