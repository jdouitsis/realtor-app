import { ComingSoonPage } from '@/components/composed'

interface FormsPageProps {
  clientId?: string
}

export function FormsPage({ clientId }: FormsPageProps) {
  return <ComingSoonPage title="Forms" clientId={clientId} />
}
