import { router } from '../../trpc'
import { generateMagicLink } from './procedures/generateMagicLink'
import { login } from './procedures/login'
import { logout } from './procedures/logout'
import { me } from './procedures/me'
import { register } from './procedures/register'
import { requestMagicLink } from './procedures/requestMagicLink'
import { resendOtp } from './procedures/resendOtp'
import { verifyMagicLink } from './procedures/verifyMagicLink'
import { verifyOtp } from './procedures/verifyOtp'

export const authRouter = router({
  login,
  register,
  verifyOtp,
  resendOtp,
  logout,
  me,
  requestMagicLink,
  generateMagicLink,
  verifyMagicLink,
})
