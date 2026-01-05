import { createFileRoute, Outlet } from '@tanstack/react-router'

import { PublicHeader } from '@/features/public'

export const Route = createFileRoute('/_public')({
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
