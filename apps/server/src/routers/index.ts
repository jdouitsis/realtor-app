import { authRouter } from '../domains/auth/router'
import { userRouter } from '../domains/user/router'
import { router } from '../trpc'

export const appRouter = router({
  auth: authRouter,
  user: userRouter,
})

export type AppRouter = typeof appRouter
