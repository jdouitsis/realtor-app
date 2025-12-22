import { router } from '../../trpc'
import { login } from './procedures/login'
import { register } from './procedures/register'
import { me } from './procedures/me'

export const authRouter = router({
  login,
  register,
  me,
})
