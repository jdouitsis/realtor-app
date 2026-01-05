import { createFileRoute, Outlet } from '@tanstack/react-router'

import { NavBar } from '@/components/common/NavBar'

export const Route = createFileRoute('/_public')({
  component: PublicLayout,
})

function PublicLayout() {
  return (
    <div className="flex h-full flex-col bg-background">
      <NavBar />
      <div className="flex h-full w-full flex-col items-center justify-center">
        <Outlet />
      </div>
    </div>
  )
}
