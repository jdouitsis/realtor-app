import { router } from '../../trpc'
import { login } from './procedures/login'
import { logout } from './procedures/logout'
import { me } from './procedures/me'
import { register } from './procedures/register'
import { resendOtp } from './procedures/resendOtp'
import { verifyOtp } from './procedures/verifyOtp'

export const authRouter = router({
  login,
  register,
  verifyOtp,
  resendOtp,
  logout,
  me,
})
