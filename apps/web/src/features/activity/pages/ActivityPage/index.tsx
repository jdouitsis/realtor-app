import { ComingSoonPage } from '@/components/composed'

interface ActivityPageProps {
  clientId?: string
}

export function ActivityPage({ clientId }: ActivityPageProps) {
  return <ComingSoonPage title="Activity" clientId={clientId} />
}
