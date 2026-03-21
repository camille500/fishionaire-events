import type { H3Event } from 'h3'
import EventMemberRepository from '../../repositories/eventMemberRepository'
import ActivityLogRepository from '../../repositories/activityLogRepository'

export default defineEventHandler(async (event: H3Event) => {
  const { isAuthenticated, userId } = event.context.auth()
  if (!isAuthenticated) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  // Get all events the user is a member of
  const memberships = await EventMemberRepository.findByUserId(userId)
  const eventIds = memberships.map((m: any) => Number(m.eventId))

  if (eventIds.length === 0) return []

  const logs = await ActivityLogRepository.findByEventIds(eventIds, 10)
  return logs.map((log) => log.toJSON())
})
