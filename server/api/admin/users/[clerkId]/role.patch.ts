import { requireAdmin } from '../../../../utils/requireAdmin'
import AdminController from '../../../../controllers/adminController'

export default defineEventHandler(async (event) => {
  const admin = await requireAdmin(event)
  const clerkId = getRouterParam(event, 'clerkId')
  const body = await readBody(event)

  if (!clerkId) {
    throw createError({ statusCode: 400, statusMessage: 'Missing clerkId' })
  }

  if (clerkId === admin.clerkId) {
    throw createError({ statusCode: 400, statusMessage: 'Cannot change your own role' })
  }

  return await AdminController.updateUserRole(clerkId, body.role)
})
