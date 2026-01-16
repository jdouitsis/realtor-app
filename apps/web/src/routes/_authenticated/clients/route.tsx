import { createFileRoute, notFound, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/clients')({
  loader: ({ context }) => {
    if (!context.user.isRealtor) {
      throw notFound()
    }
  },
  component: () => <Outlet />,
})
