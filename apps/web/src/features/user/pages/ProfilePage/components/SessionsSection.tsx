import { useState } from 'react'

import { Button, Card, CardContent, CardHeader, CardTitle } from '@/components/ui'
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
      <Card>
        <CardHeader>
          <CardTitle>Active Sessions</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Loading sessions...</p>
        </CardContent>
      </Card>
    )
  }

  if (sessionsQuery.error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Active Sessions</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-destructive">Failed to load sessions</p>
        </CardContent>
      </Card>
    )
  }

  const sessions = sessionsQuery.data?.sessions ?? []
  const otherSessionsCount = sessions.filter((s) => !s.isCurrent).length

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Active Sessions</CardTitle>
        {otherSessionsCount > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleRevokeAll}
            disabled={revokeAllOther.isPending}
            className="text-destructive hover:text-destructive"
          >
            {revokeAllOther.isPending ? 'Logging out...' : 'Log out all other devices'}
          </Button>
        )}
      </CardHeader>
      <CardContent className="space-y-3">
        {sessions.length === 0 ? (
          <p className="text-muted-foreground">No active sessions found</p>
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
        {revokeSession.error && (
          <p className="text-sm text-destructive">{revokeSession.error.message}</p>
        )}
        {revokeAllOther.isSuccess && (
          <p className="text-sm text-green-600">
            Logged out of {revokeAllOther.data.revokedCount} other device(s)
          </p>
        )}
      </CardContent>
    </Card>
  )
}
