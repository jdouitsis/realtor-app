import { createFileRoute, redirect } from '@tanstack/react-router'

import { NewsletterPage } from '@/features/newsletter'

export const Route = createFileRoute('/_public/public/newsletter')({
  beforeLoad: ({ context }) => {
    if (context.auth.isAuthenticated) {
      throw redirect({ to: '/newsletter' })
    }
  },
  component: NewsletterPage,
})
