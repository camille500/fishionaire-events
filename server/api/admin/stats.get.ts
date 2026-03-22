import { requireAdmin } from '../../utils/requireAdmin'
import AdminController from '../../controllers/adminController'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  return await AdminController.getDashboardStats()
})
