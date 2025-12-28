import { Button, Card, CardContent } from '@/components/ui'

interface SessionCardProps {
  id: string
  device: string | null
  browser: string | null
  os: string | null
  ipAddress: string | null
  isCurrent: boolean
  createdAt: string | Date
  lastActiveAt: string | Date
  onRevoke: (sessionId: string) => void
  isRevoking: boolean
}

function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(date))
}

function formatRelativeTime(date: string | Date): string {
  const now = new Date()
  const diffMs = now.getTime() - new Date(date).getTime()
  const diffMins = Math.floor(diffMs / (1000 * 60))
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins} minute${diffMins === 1 ? '' : 's'} ago`
  if (diffHours < 24) return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`
  return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`
}

export function SessionCard({
  id,
  device,
  browser,
  os,
  ipAddress,
  isCurrent,
  createdAt,
  lastActiveAt,
  onRevoke,
  isRevoking,
}: SessionCardProps) {
  const deviceInfo = [browser, os].filter(Boolean).join(' on ')

  return (
    <Card className={isCurrent ? 'border-primary' : ''}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-medium">{deviceInfo || 'Unknown device'}</span>
              {isCurrent && (
                <span className="text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded">
                  This device
                </span>
              )}
            </div>
            {device && <p className="text-sm text-muted-foreground">{device}</p>}
            {ipAddress && <p className="text-sm text-muted-foreground">IP: {ipAddress}</p>}
            <p className="text-sm text-muted-foreground">
              Last active: {formatRelativeTime(lastActiveAt)}
            </p>
            <p className="text-xs text-muted-foreground">Created: {formatDate(createdAt)}</p>
          </div>
          {!isCurrent && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onRevoke(id)}
              disabled={isRevoking}
              className="text-destructive hover:text-destructive"
            >
              {isRevoking ? 'Revoking...' : 'Revoke'}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
