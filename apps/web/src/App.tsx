import { RouterProvider } from '@tanstack/react-router'
import { Toaster } from 'sonner'

import { StepUpOtpModal } from '@/components/composed/step-up-otp-modal'
import { createAuth } from '@/lib/auth'

import { router } from './router'

const auth = createAuth(router)

export function App() {
  return (
    <>
      <RouterProvider router={router} context={{ auth }} />
      <StepUpOtpModal />
      <Toaster position="top-right" richColors />
    </>
  )
}
