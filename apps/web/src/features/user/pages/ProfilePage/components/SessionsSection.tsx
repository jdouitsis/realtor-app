import { AlertCircle, Check, Monitor, Shield } from 'lucide-react'
import { useState } from 'react'

import { Button, Skeleton } from '@/components/ui'
import { trpc } from '@/lib/trpc'

import { SessionCard } from './SessionCard'

export function SessionsSection() {
  const [revokingSessionId, setRevokingSessionId] = useState<string | null>(null)

  const sessionsQuery = trpc.user.getSessions.useQuery()
  const utils = trpc.useUtils()

  const revokeSession = trpc.user.revokeSession.useMutation({
    onSuccess: () => {
      setRevokingSessionId(null)
      void utils.user.getSessions.invalidate()
    },
    onError: () => {
      setRevokingSessionId(null)
    },
  })

  const revokeAllOther = trpc.user.revokeAllOtherSessions.useMutation({
    onSuccess: () => {
      void utils.user.getSessions.invalidate()
    },
  })

  const handleRevoke = (sessionId: string) => {
    setRevokingSessionId(sessionId)
    revokeSession.mutate({ sessionId })
  }

  const handleRevokeAll = () => {
    if (confirm('Are you sure you want to log out of all other devices?')) {
      revokeAllOther.mutate()
    }
  }

  if (sessionsQuery.isLoading) {
    return (
      <div className="rounded-lg border border-border/50 overflow-hidden bg-card">
        <div className="flex items-center gap-3 px-4 py-4 border-b border-border/50">
          <span className="p-2 rounded-lg bg-muted text-foreground">
            <Shield className="h-4 w-4" strokeWidth={1.5} />
          </span>
          <h3 className="text-sm font-medium">Active Sessions</h3>
        </div>
        <div className="divide-y divide-border/50">
          {(['a', 'b', 'c'] as const).map((key) => (
            <div key={key} className="flex items-start gap-4 px-4 py-4">
              <Skeleton className="h-10 w-10 rounded-lg" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-3 w-32" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (sessionsQuery.error) {
    return (
      <div className="rounded-lg border border-border/50 shadow-md overflow-hidden bg-card">
        <div className="flex items-center gap-3 px-4 py-4 border-b border-border/50">
          <span className="p-2 rounded-lg bg-muted text-foreground">
            <Shield className="h-4 w-4" strokeWidth={1.5} />
          </span>
          <h3 className="text-sm font-medium">Active Sessions</h3>
        </div>
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="rounded-full bg-destructive/10 p-4 mb-4">
            <AlertCircle className="h-6 w-6 text-destructive" strokeWidth={1.5} />
          </div>
          <h3 className="text-lg font-semibold tracking-tight mb-1">Failed to load sessions</h3>
          <p className="text-sm text-muted-foreground mb-6">Please try again later</p>
          <Button variant="outline" size="sm" onClick={() => void sessionsQuery.refetch()}>
            Try again
          </Button>
        </div>
      </div>
    )
  }

  const sessions = sessionsQuery.data?.sessions ?? []
  const otherSessionsCount = sessions.filter((s) => !s.isCurrent).length

  return (
    <div className="rounded-lg border border-border/50 shadow-md overflow-hidden bg-card">
      <div className="flex items-center justify-between px-4 py-4 border-b border-border/50">
        <div className="flex items-center gap-3">
          <span className="p-2 rounded-lg bg-muted text-foreground">
            <Shield className="h-4 w-4" strokeWidth={1.5} />
          </span>
          <h3 className="text-sm font-medium">Active Sessions</h3>
        </div>
        {otherSessionsCount > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleRevokeAll}
            disabled={revokeAllOther.isPending}
            className="text-destructive hover:text-destructive border-destructive/30"
          >
            {revokeAllOther.isPending ? 'Logging out...' : 'Log out all other devices'}
          </Button>
        )}
      </div>
      <div className="divide-y divide-border/50">
        {sessions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="rounded-full bg-muted/50 p-4 mb-4">
              <Monitor className="h-6 w-6 text-muted-foreground" strokeWidth={1.5} />
            </div>
            <h3 className="text-lg font-semibold tracking-tight mb-1">No active sessions</h3>
            <p className="text-sm text-muted-foreground max-w-xs">
              Your session history will appear here
            </p>
          </div>
        ) : (
          sessions.map((session) => (
            <SessionCard
              key={session.id}
              {...session}
              onRevoke={handleRevoke}
              isRevoking={revokingSessionId === session.id}
            />
          ))
        )}
      </div>
      {revokeSession.error && (
        <div className="px-4 py-3 border-t border-border/50 bg-destructive/5">
          <p className="text-sm text-destructive">{revokeSession.error.message}</p>
        </div>
      )}
      {revokeAllOther.isSuccess && (
        <div className="px-4 py-3 border-t border-border/50 bg-semantic-success/5">
          <span className="flex items-center gap-1 text-sm text-semantic-success">
            <Check className="h-4 w-4" strokeWidth={1.5} />
            Logged out of {revokeAllOther.data.revokedCount} other device(s)
          </span>
        </div>
      )}
    </div>
  )
}
