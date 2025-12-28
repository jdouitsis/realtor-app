import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'

import { Header } from '@/components/common/Header'
import { Sidebar } from '@/features/dashboard'

export const Route = createFileRoute('/_authenticated')({
  beforeLoad: ({ context, location }) => {
    if (!context.auth.isAuthenticated) {
      throw redirect({
        to: '/login',
        search: {
          redirect: location.href,
        },
      })
    }
  },
  component: AuthenticatedLayout,
})

function AuthenticatedLayout() {
  return (
    <div className="flex h-full">
      <Sidebar />
      <div className="flex flex-1 flex-col min-h-0">
        <Header />
        <main className="flex-1 overflow-y-auto max-w-4xl w-full mx-auto px-6 py-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
