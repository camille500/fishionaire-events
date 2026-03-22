import type { H3Event } from 'h3'
import EventMemberRepository from '../../repositories/eventMemberRepository'
import ActivityLogRepository from '../../repositories/activityLogRepository'

export default defineEventHandler(async (event: H3Event) => {
  const { isAuthenticated, userId } = event.context.auth()
  if (!isAuthenticated) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  const query = getQuery(event)
  const limit = Math.min(Number(query.limit) || 10, 50)
  const offset = Math.max(Number(query.offset) || 0, 0)
  const type = typeof query.type === 'string' ? query.type : undefined

  // Get all events the user is a member of
  const memberships = await EventMemberRepository.findByUserId(userId)
  const eventIds = memberships.map((m: any) => Number(m.eventId))

  if (eventIds.length === 0) return []

  const logs = await ActivityLogRepository.findByEventIds(eventIds, limit, offset, type)
  return logs.map((log) => log.toJSON())
})
