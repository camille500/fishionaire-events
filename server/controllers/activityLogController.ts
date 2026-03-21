import EventMemberRepository from '../repositories/eventMemberRepository'
import ActivityLogRepository from '../repositories/activityLogRepository'
import ActivityLog from '../entities/ActivityLog'

export default class ActivityLogController {
  static async log(
    eventId: number,
    type: string,
    actorName: string,
    actorEmail: string,
    metadata?: Record<string, unknown>,
  ): Promise<void> {
    try {
      const log = new ActivityLog({
        id: null,
        eventId,
        type,
        actorName,
        actorEmail,
        metadata: metadata || null,
        createdAt: new Date(),
      })
      await ActivityLogRepository.create(log)
    } catch {
      // Activity logging should never block the main flow
    }
  }

  static async getByEventId(eventId: number, clerkId: string): Promise<Record<string, unknown>[]> {
    const member = await EventMemberRepository.findByEventIdAndUserId(String(eventId), clerkId)
    if (!member || !member.canEdit) {
      throw createError({ statusCode: 403, statusMessage: 'You do not have permission to view this event' })
    }

    const logs = await ActivityLogRepository.findByEventId(eventId)
    return logs.map((log) => log.toJSON() as unknown as Record<string, unknown>)
  }
}
