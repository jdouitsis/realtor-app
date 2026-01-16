import { authRouter } from '../domains/auth/router'
import { clientsRouter } from '../domains/clients/router'
import { userRouter } from '../domains/user/router'
import { router } from '../trpc'

export const appRouter = router({
  auth: authRouter,
  clients: clientsRouter,
  user: userRouter,
})

export type AppRouter = typeof appRouter
