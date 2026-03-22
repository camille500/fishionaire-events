import { requireAdmin } from '../../../utils/requireAdmin'
import AdminController from '../../../controllers/adminController'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const query = getQuery(event)
  const page = Number(query.page || 0)
  const limit = Number(query.limit || 20)

  return await AdminController.listSubscriptions({
    tier: query.tier as string | undefined,
    status: query.status as string | undefined,
    offset: page * limit,
    limit,
  })
})
