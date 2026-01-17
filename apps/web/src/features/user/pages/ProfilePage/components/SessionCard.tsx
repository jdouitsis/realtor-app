import { Globe, Monitor, Smartphone } from 'lucide-react'

import { Badge, Button, Card, CardContent } from '@/components/ui'

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

function isMobileDevice(device: string | null, os: string | null): boolean {
  const combined = `${device ?? ''} ${os ?? ''}`.toLowerCase()
  return combined.includes('mobile') || combined.includes('android') || combined.includes('iphone')
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
  const isMobile = isMobileDevice(device, os)

  return (
    <Card className={isCurrent ? 'border-primary/50 bg-primary/5' : ''}>
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          <div className="rounded-lg bg-muted p-2.5 shrink-0">
            {isMobile ? (
              <Smartphone className="h-5 w-5 text-muted-foreground" />
            ) : (
              <Monitor className="h-5 w-5 text-muted-foreground" />
            )}
          </div>
          <div className="flex-1 min-w-0 space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-medium">{deviceInfo || 'Unknown device'}</span>
              {isCurrent && <Badge variant="success">Current session</Badge>}
            </div>
            {device && <p className="text-sm text-muted-foreground">{device}</p>}
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              {ipAddress && (
                <span className="flex items-center gap-1">
                  <Globe className="h-3.5 w-3.5" />
                  {ipAddress}
                </span>
              )}
              <span>Active {formatRelativeTime(lastActiveAt)}</span>
            </div>
            <p className="text-xs text-muted-foreground">Created: {formatDate(createdAt)}</p>
          </div>
          {!isCurrent && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onRevoke(id)}
              disabled={isRevoking}
              className="text-destructive hover:text-destructive shrink-0"
            >
              {isRevoking ? 'Revoking...' : 'Revoke'}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
