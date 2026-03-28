import type { H3Event } from 'h3'
import RsvpController from '../../controllers/rsvpController'

export default defineEventHandler(async (event: H3Event) => {
  const { isAuthenticated, userId } = event.context.auth()
  if (!isAuthenticated) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  const body = await readBody<{
    title: string
    description?: string | null
    coverImageUrl?: string | null
    coverImageKey?: string | null
    rsvpDeadline?: string | null
  }>(event)

  const result = await RsvpController.createStandaloneRsvp(userId, body)

  setResponseStatus(event, 201)
  return result
})
