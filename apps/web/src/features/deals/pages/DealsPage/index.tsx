import { ComingSoonPage } from '@/components/composed'

interface DealsPageProps {
  clientId?: string
}

export function DealsPage({ clientId }: DealsPageProps) {
  return <ComingSoonPage title="Deals" clientId={clientId} />
}
