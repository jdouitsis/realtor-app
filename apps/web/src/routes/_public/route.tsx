import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'
import { PublicHeader } from '@/features/public'

export const Route = createFileRoute('/_public')({
  beforeLoad: ({ context }) => {
    if (context.auth.isAuthenticated) {
      throw redirect({ to: '/dashboard' })
    }
  },
  component: PublicLayout,
})

function PublicLayout() {
  return (
    <div className="min-h-screen bg-background">
      <PublicHeader />
      <Outlet />
    </div>
  )
}
