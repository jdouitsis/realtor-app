import { createFileRoute } from '@tanstack/react-router'
import { RegisterPage } from '@/features/auth'

export const Route = createFileRoute('/_public/register')({
  component: RegisterPage,
})
