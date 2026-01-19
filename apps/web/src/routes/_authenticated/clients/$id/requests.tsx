import { createFileRoute } from '@tanstack/react-router'
import { ClipboardList } from 'lucide-react'

export const Route = createFileRoute('/_authenticated/clients/$id/requests')({
  component: RequestsTab,
})

function RequestsTab() {
  return (
    <div className="space-y-6">
      {/* Empty State */}
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="rounded-full bg-blue-500/10 p-4 mb-4">
          <ClipboardList className="h-6 w-6 text-blue-500" strokeWidth={1.5} />
        </div>
        <h3 className="text-lg font-semibold tracking-tight mb-1">No pending requests</h3>
        <p className="text-sm text-muted-foreground max-w-xs">
          There are no pending form requests for this client.
        </p>
      </div>
    </div>
  )
}
