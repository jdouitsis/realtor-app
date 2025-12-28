import { router } from '../../trpc'
import { cancelEmailChange } from './procedures/cancelEmailChange'
import { confirmEmailChange } from './procedures/confirmEmailChange'
import { deleteAccount } from './procedures/deleteAccount'
import { getProfile } from './procedures/getProfile'
import { getSessions } from './procedures/getSessions'
import { initiateEmailChange } from './procedures/initiateEmailChange'
import { requestStepUpOtp } from './procedures/requestStepUpOtp'
import { revokeAllOtherSessions } from './procedures/revokeAllOtherSessions'
import { revokeSession } from './procedures/revokeSession'
import { updateName } from './procedures/updateName'
import { verifyStepUpOtp } from './procedures/verifyStepUpOtp'

export const userRouter = router({
  getProfile,
  updateName,
  getSessions,
  revokeSession,
  revokeAllOtherSessions,
  requestStepUpOtp,
  verifyStepUpOtp,
  initiateEmailChange,
  confirmEmailChange,
  cancelEmailChange,
  deleteAccount,
})
