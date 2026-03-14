import { clerkClient } from '@clerk/nuxt/server'
import UserController from '../../controllers/userController'
import EventController from '../../controllers/eventController'

export default defineEventHandler(async (event) => {
  const { isAuthenticated, userId } = event.context.auth()

  if (!isAuthenticated) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  const clerkUser = await clerkClient(event).users.getUser(userId)
  const user = await UserController.syncUser({
    clerkId: userId,
    email: clerkUser.emailAddresses[0]?.emailAddress,
    firstName: clerkUser.firstName,
    lastName: clerkUser.lastName,
  })

  return await EventController.listUserEvents(userId, user.email)
})
