import { Outlet, createFileRoute, redirect } from '@tanstack/react-router'

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
    <div className="h-full bg-background flex flex-col">
      <PublicHeader />
      <div className="flex flex-col items-center justify-center h-full w-full">
        <Outlet />
      </div>
    </div>
  )
}
