import EventView from '../entities/EventView'
import EventViewRepository from '../repositories/eventViewRepository'
import EventRepository from '../repositories/eventRepository'
import EventMemberRepository from '../repositories/eventMemberRepository'
import { usePrisma } from '../database'

interface DashboardAnalytics {
  totalViews: number
  totalInvitations: number
  rsvpRate: number
  rsvpBreakdown: RsvpBreakdown
  viewsOverTime: Array<{ date: string, count: number }>
  wishlistClaimRate: number
  budgetUtilization: number | null
}

interface RecordViewParams {
  ip: string | null
  userAgent: string | null
  clerkId: string | null
}

interface RsvpBreakdown {
  pending: number
  accepted: number
  declined: number
}

interface EventAnalytics {
  totalViews: number
  viewsOverTime: Array<{ date: string, count: number }>
  rsvpBreakdown: RsvpBreakdown
  invitationCount: number
  acceptanceRate: number
}

export default class AnalyticsController {
  static async recordView(eventId: number, { ip, userAgent, clerkId }: RecordViewParams): Promise<EventView | null> {
    // Deduplicate: skip if same IP viewed in last 5 minutes
    const isRecent = await EventViewRepository.hasRecentView(eventId, ip)
    if (isRecent) return null

    const view = new EventView({
      eventId,
      viewerIp: ip || null,
      userAgent: userAgent || null,
      clerkId: clerkId || null,
    })

    return EventViewRepository.create(view)
  }

  static async getEventAnalytics(eventId: number, clerkId: string): Promise<EventAnalytics> {
    const event = await EventRepository.findById(eventId)
    if (!event) {
      throw createError({ statusCode: 404, statusMessage: 'Event not found' })
    }

    const member = await EventMemberRepository.findByEventIdAndUserId(eventId, clerkId)
    if (!member || !member.canEdit) {
      throw createError({ statusCode: 403, statusMessage: 'Only organizers can view analytics' })
    }

    const prisma = usePrisma()

    const [totalViews, viewsOverTime, rsvpCounts, invitationCount] = await Promise.all([
      EventViewRepository.countByEventId(eventId),
      EventViewRepository.countGroupedByDate(eventId, 30),
      prisma.eventInvitation.groupBy({
        by: ['status'],
        where: { eventId },
        _count: true,
      }),
      EventRepository.getInvitationCount(eventId),
    ])

    const rsvpBreakdown: RsvpBreakdown = { pending: 0, accepted: 0, declined: 0 }
    rsvpCounts.forEach((r: { status: string, _count: number }) => {
      rsvpBreakdown[r.status as keyof RsvpBreakdown] = r._count
    })

    return {
      totalViews,
      viewsOverTime,
      rsvpBreakdown,
      invitationCount,
      acceptanceRate: invitationCount > 0
        ? Math.round((rsvpBreakdown.accepted / invitationCount) * 100)
        : 0,
    }
  }

  static async getDashboardAnalytics(clerkId: string): Promise<DashboardAnalytics> {
    const prisma = usePrisma()

    // Get all events owned by this user
    const memberships = await EventMemberRepository.findByUserId(clerkId)
    const ownedEventIds = memberships
      .filter((m: any) => m.role === 'owner')
      .map((m: any) => Number(m.eventId))

    if (ownedEventIds.length === 0) {
      return {
        totalViews: 0,
        totalInvitations: 0,
        rsvpRate: 0,
        rsvpBreakdown: { pending: 0, accepted: 0, declined: 0 },
        viewsOverTime: [],
        wishlistClaimRate: 0,
        budgetUtilization: null,
      }
    }

    const since = new Date()
    since.setDate(since.getDate() - 30)

    const [
      totalViews,
      viewsOverTime,
      invitations,
      wishlistStats,
      budgetStats,
    ] = await Promise.all([
      // Total views across all events
      prisma.eventView.count({
        where: { eventId: { in: ownedEventIds } },
      }),
      // Views over time (last 30 days)
      prisma.$queryRaw`
        SELECT DATE(created_at) as date, COUNT(*)::int as count
        FROM event_views
        WHERE event_id = ANY(${ownedEventIds}::int[]) AND created_at >= ${since}
        GROUP BY DATE(created_at)
        ORDER BY date ASC
      ` as Promise<Array<{ date: string, count: number }>>,
      // RSVP data
      prisma.eventInvitation.groupBy({
        by: ['status'],
        where: { eventId: { in: ownedEventIds } },
        _count: true,
      }),
      // Wishlist stats
      prisma.wishlistItem.aggregate({
        where: { eventId: { in: ownedEventIds } },
        _count: true,
      }).then(async (total) => {
        const claimed = await prisma.wishlistItem.count({
          where: {
            eventId: { in: ownedEventIds },
            claims: { some: {} },
          },
        })
        return { total: total._count, claimed }
      }),
      // Budget stats
      prisma.event.findMany({
        where: { id: { in: ownedEventIds }, budgetTarget: { not: null } },
        select: { budgetTarget: true },
      }).then(async (events) => {
        if (events.length === 0) return null
        const totalTarget = events.reduce((sum, e) => sum + (e.budgetTarget || 0), 0)
        const totalSpent = await prisma.budgetEntry.aggregate({
          where: { eventId: { in: ownedEventIds } },
          _sum: { amountCents: true },
        })
        return {
          target: totalTarget,
          spent: totalSpent._sum.amountCents || 0,
        }
      }),
    ])

    const rsvpBreakdown: RsvpBreakdown = { pending: 0, accepted: 0, declined: 0 }
    invitations.forEach((r: { status: string, _count: number }) => {
      rsvpBreakdown[r.status as keyof RsvpBreakdown] = r._count
    })
    const totalInvitations = rsvpBreakdown.pending + rsvpBreakdown.accepted + rsvpBreakdown.declined

    return {
      totalViews,
      totalInvitations,
      rsvpRate: totalInvitations > 0
        ? Math.round((rsvpBreakdown.accepted / totalInvitations) * 100)
        : 0,
      rsvpBreakdown,
      viewsOverTime: viewsOverTime.map((r) => ({ date: r.date, count: r.count })),
      wishlistClaimRate: wishlistStats.total > 0
        ? Math.round((wishlistStats.claimed / wishlistStats.total) * 100)
        : 0,
      budgetUtilization: budgetStats
        ? (budgetStats.target > 0 ? Math.round((budgetStats.spent / budgetStats.target) * 100) : 0)
        : null,
    }
  }
}
