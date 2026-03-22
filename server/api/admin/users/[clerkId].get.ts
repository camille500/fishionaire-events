import { requireAdmin } from '../../../utils/requireAdmin'
import AdminController from '../../../controllers/adminController'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const clerkId = getRouterParam(event, 'clerkId')

  if (!clerkId) {
    throw createError({ statusCode: 400, statusMessage: 'Missing clerkId' })
  }

  return await AdminController.getUserDetail(clerkId)
})
