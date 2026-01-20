import { ComingSoonPage } from '@/components/composed'

interface ArtifactsPageProps {
  clientId?: string
}

export function ArtifactsPage({ clientId }: ArtifactsPageProps) {
  return <ComingSoonPage title="Artifacts" clientId={clientId} />
}
