import { router } from '../../trpc'
import { getById } from './procedures/getById'
import { invite } from './procedures/invite'
import { list } from './procedures/list'
import { updateStatus } from './procedures/updateStatus'

export const clientsRouter = router({
  list,
  getById,
  invite,
  updateStatus,
})
