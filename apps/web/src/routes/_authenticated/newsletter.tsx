import { createFileRoute } from '@tanstack/react-router'

import { NewsletterPage } from '@/features/newsletter'

export const Route = createFileRoute('/_authenticated/newsletter')({
  component: NewsletterPage,
})
