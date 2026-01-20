import { ClipboardList } from 'lucide-react'

export function FormsTab() {
  return (
    <div className="space-y-6">
      {/* Empty State */}
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="rounded-full bg-muted/50 p-4 mb-4">
          <ClipboardList className="h-6 w-6 text-muted-foreground" strokeWidth={1.5} />
        </div>
        <h3 className="text-lg font-semibold tracking-tight mb-1">No forms</h3>
        <p className="text-sm text-muted-foreground max-w-xs">
          There are no forms for this client.
        </p>
      </div>
    </div>
  )
}
