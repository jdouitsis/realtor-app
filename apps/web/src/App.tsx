import { RouterProvider } from '@tanstack/react-router'

import { DemoNoticeDialog } from '@/components/common/DemoNoticeDialog'
import { createAuth } from '@/lib/auth'

import { router } from './router'

const auth = createAuth(router)

export function App() {
  return (
    <>
      <RouterProvider router={router} context={{ auth }} />
      <DemoNoticeDialog />
    </>
  )
}
