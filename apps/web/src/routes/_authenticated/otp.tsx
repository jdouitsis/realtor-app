import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'

import { StepUpOtpPage } from '@/features/auth'

const otpSearchSchema = z.object({
  redirect: z.string().optional(),
})

export const Route = createFileRoute('/_authenticated/otp')({
  validateSearch: otpSearchSchema,
  component: StepUpOtpPage,
})
