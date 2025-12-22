import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod/v4'
import { LoginPage } from '@/features/auth'

const loginSearchSchema = z.object({
  redirect: z.string().optional(),
})

export const Route = createFileRoute('/login')({
  validateSearch: loginSearchSchema,
  component: LoginPage,
})
