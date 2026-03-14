import { clerkClient } from '@clerk/nuxt/server'
import UserController from '../../controllers/userController'
import EventController from '../../controllers/eventController'

export default defineEventHandler(async (event) => {
  const { isAuthenticated, userId } = event.context.auth()

  if (!isAuthenticated) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  const clerkUser = await clerkClient(event).users.getUser(userId)
  await UserController.syncUser({
    clerkId: userId,
    email: clerkUser.emailAddresses[0]?.emailAddress,
    firstName: clerkUser.firstName,
    lastName: clerkUser.lastName,
  })

  const { title, tier, templateId, eventType, eventDate, location, subEvents } = await readBody(event)
  const result = await EventController.createEvent(userId, title, tier, templateId || null, {
    eventType: eventType || null,
    eventDate: eventDate || null,
    location: location || null,
    subEvents: subEvents || [],
  })

  setResponseStatus(event, 201)
  return result
})
