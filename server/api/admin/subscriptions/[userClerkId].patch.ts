import { requireAdmin } from '../../../utils/requireAdmin'
import AdminController from '../../../controllers/adminController'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const userClerkId = getRouterParam(event, 'userClerkId')
  const body = await readBody(event)

  if (!userClerkId) {
    throw createError({ statusCode: 400, statusMessage: 'Missing userClerkId' })
  }

  return await AdminController.updateSubscription(userClerkId, body.tier, body.status)
})
