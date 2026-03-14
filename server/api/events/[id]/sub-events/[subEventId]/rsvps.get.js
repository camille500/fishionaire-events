import SubEventRsvpController from '../../../../../controllers/subEventRsvpController'

export default defineEventHandler(async (event) => {
  const { isAuthenticated, userId } = event.context.auth()
  if (!isAuthenticated) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  const eventId = parseInt(getRouterParam(event, 'id'))
  const subEventId = parseInt(getRouterParam(event, 'subEventId'))
  if (isNaN(eventId) || isNaN(subEventId)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid ID' })
  }

  return SubEventRsvpController.getSubEventRsvps(eventId, subEventId, userId)
})
