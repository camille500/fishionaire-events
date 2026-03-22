import type { H3Event } from 'h3'
import { clerkClient } from '@clerk/nuxt/server'
import UserController from '../../controllers/userController'
import EventController from '../../controllers/eventController'

export default defineEventHandler(async (event: H3Event) => {
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

  const { title, tier, templateId, eventType, eventDate, location, description, coverImageUrl, coverImageKey, subEvents } = await readBody<{
    title: string
    tier: string
    templateId?: number
    eventType?: string
    eventDate?: string
    location?: string
    description?: string
    coverImageUrl?: string
    coverImageKey?: string
    subEvents?: Array<{ title: string, description?: string }>
  }>(event)
  if (!title || !title.trim()) {
    throw createError({ statusCode: 400, statusMessage: 'Title is required' })
  }

  if (title.length > 200) {
    throw createError({ statusCode: 400, statusMessage: 'Title too long (max 200 characters)' })
  }

  if (description && description.length > 5000) {
    throw createError({ statusCode: 400, statusMessage: 'Description too long (max 5000 characters)' })
  }

  if (location && location.length > 500) {
    throw createError({ statusCode: 400, statusMessage: 'Location too long (max 500 characters)' })
  }

  const result = await EventController.createEvent(userId, title, tier, templateId || null, {
    eventType: eventType || null,
    eventDate: eventDate || null,
    location: location || null,
    description: description || null,
    coverImageUrl: coverImageUrl || null,
    coverImageKey: coverImageKey || null,
    subEvents: subEvents || [],
  })

  setResponseStatus(event, 201)
  return result
})
