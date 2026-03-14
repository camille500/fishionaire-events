import type { H3Event } from 'h3'
import AnalyticsController from '../../../controllers/analyticsController'

export default defineEventHandler(async (event: H3Event) => {
  const eventId = parseInt(getRouterParam(event, 'id'))
  if (isNaN(eventId)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid event ID' })
  }

  const ip = getRequestHeader(event, 'x-forwarded-for') || getRequestHeader(event, 'x-real-ip') || ''
  const userAgent = getRequestHeader(event, 'user-agent') || ''
  const clerkId = event.context.auth?.()?.userId || null

  await AnalyticsController.recordView(eventId, { ip, userAgent, clerkId })
  return { success: true }
})
