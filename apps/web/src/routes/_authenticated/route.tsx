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
    <div className="flex h-full w-full">
      <Sidebar />
      <div className="flex flex-1 flex-col min-h-0 w-full">
        <Header />
        <main className="flex-1 overflow-y-auto px-6 py-6 w-full">
          <div className="max-w-4xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
