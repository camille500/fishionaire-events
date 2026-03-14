import EventMemberController from '../../../../controllers/eventMemberController'

export default defineEventHandler(async (event) => {
  const { isAuthenticated, userId } = event.context.auth()
  if (!isAuthenticated) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  const eventId = parseInt(getRouterParam(event, 'id'))
  if (isNaN(eventId)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid event ID' })
  }

  const targetClerkId = getRouterParam(event, 'clerkId')
  await EventMemberController.removeCoOrganizer(eventId, userId, targetClerkId)
  return { success: true }
})
