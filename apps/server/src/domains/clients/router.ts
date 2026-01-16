import { router } from '../../trpc'
import { getById } from './procedures/getById'
import { invite } from './procedures/invite'
import { list } from './procedures/list'
import { resendInvite } from './procedures/resendInvite'
import { updateNickname } from './procedures/updateNickname'
import { updateStatus } from './procedures/updateStatus'

export const clientsRouter = router({
  list,
  getById,
  invite,
  resendInvite,
  updateNickname,
  updateStatus,
})
