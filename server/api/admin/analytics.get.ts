import { requireAdmin } from '../../utils/requireAdmin'
import AdminController from '../../controllers/adminController'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const query = getQuery(event)
  const days = Math.min(Number(query.days || 30), 90)

  return await AdminController.getAnalytics(days)
})
