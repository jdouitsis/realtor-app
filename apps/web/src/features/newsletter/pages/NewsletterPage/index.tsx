import { useRouteContext } from '@tanstack/react-router'

import { NewsletterConfigForm } from './components/NewsletterConfigForm'
import { NewsletterSignupForm } from './components/NewsletterSignupForm'

export function NewsletterPage() {
  const context = useRouteContext({ from: '__root__' })
  const isAuthenticated = context.auth.isAuthenticated

  if (isAuthenticated) {
    return <NewsletterConfigForm />
  }

  return (
    <div className="flex min-h-[calc(100vh-10rem)] items-center justify-center">
      <NewsletterSignupForm />
    </div>
  )
}
