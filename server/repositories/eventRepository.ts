import { usePrisma } from '../database'
import Event from '../entities/Event'

export default class EventRepository {
  static async create(event: Event): Promise<Event> {
    const prisma = usePrisma()
    const data = event.toJSON()
    const row = await prisma.event.create({
      data: {
        title: data.title,
        description: data.description,
        eventType: data.eventType,
        eventDate: data.eventDate,
        eventEndDate: data.eventEndDate,
        location: data.location,
        locationLat: data.locationLat,
        locationLon: data.locationLon,
        shareToken: data.shareToken,
        isPrivate: data.isPrivate,
        tier: data.tier,
        features: data.features,
        themeColor: data.themeColor,
        themeColorSecondary: data.themeColorSecondary,
        gradientAngle: data.gradientAngle,
        fontPairing: data.fontPairing,
        cardStyle: data.cardStyle,
        welcomeMessage: data.welcomeMessage,
        heroAnimation: data.heroAnimation,
        backgroundPattern: data.backgroundPattern,
        colorMode: data.colorMode,
        customLogoUrl: data.customLogoUrl,
        customLogoKey: data.customLogoKey,
        hideBranding: data.hideBranding,
        coverImageUrl: data.coverImageUrl,
        coverImageKey: data.coverImageKey,
        ownerClerkId: data.ownerClerkId,
        aiTone: data.aiTone,
        aiToneCustom: data.aiToneCustom,
        aiExtraContext: data.aiExtraContext,
        rsvpEnabled: data.rsvpEnabled,
        rsvpDeadline: data.rsvpDeadline,
        mode: data.mode,
        guestLimit: data.guestLimit,
      },
    })
    return Event.fromJSON(row)
  }

  static async findByShareToken(shareToken: string): Promise<Event | null> {
    const prisma = usePrisma()
    const row = await prisma.event.findUnique({ where: { shareToken } })
    if (!row) return null
    return Event.fromJSON(row)
  }

  static async findById(id: string): Promise<Event | null> {
    const prisma = usePrisma()
    const row = await prisma.event.findUnique({ where: { id: Number(id) } })
    if (!row) return null
    return Event.fromJSON(row)
  }

  static async findByOwner(clerkId: string): Promise<Event[]> {
    const prisma = usePrisma()
    const rows = await prisma.event.findMany({
      where: { ownerClerkId: clerkId, archivedAt: null, mode: 'event' },
      orderBy: { createdAt: 'desc' },
    })
    return rows.map((row) => Event.fromJSON(row))
  }

  static async findRsvpsByOwner(clerkId: string): Promise<Event[]> {
    const prisma = usePrisma()
    const rows = await prisma.event.findMany({
      where: { ownerClerkId: clerkId, archivedAt: null, mode: 'rsvp' },
      orderBy: { createdAt: 'desc' },
    })
    return rows.map((row) => Event.fromJSON(row))
  }

  static async findArchivedByOwner(clerkId: string): Promise<Event[]> {
    const prisma = usePrisma()
    const rows = await prisma.event.findMany({
      where: { ownerClerkId: clerkId, archivedAt: { not: null } },
      orderBy: { archivedAt: 'desc' },
    })
    return rows.map((row) => Event.fromJSON(row))
  }

  static async findByInviteeEmail(email: string): Promise<{ event: Event, status: string }[]> {
    const prisma = usePrisma()
    const rows = await prisma.event.findMany({
      where: {
        invitations: {
          some: { inviteeEmail: email },
        },
      },
      include: {
        invitations: {
          where: { inviteeEmail: email },
          select: { status: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    })
    return rows.map((row) => ({
      event: Event.fromJSON(row),
      status: row.invitations[0].status,
    }))
  }

  static async update(event: Event): Promise<Event> {
    const prisma = usePrisma()
    const data = event.toJSON()
    const row = await prisma.event.update({
      where: { id: Number(data.id) },
      data: {
        title: data.title,
        description: data.description,
        eventType: data.eventType,
        eventDate: data.eventDate,
        eventEndDate: data.eventEndDate,
        location: data.location,
        locationLat: data.locationLat,
        locationLon: data.locationLon,
        shareToken: data.shareToken,
        isPrivate: data.isPrivate,
        tier: data.tier,
        features: data.features,
        themeColor: data.themeColor,
        themeColorSecondary: data.themeColorSecondary,
        gradientAngle: data.gradientAngle,
        fontPairing: data.fontPairing,
        cardStyle: data.cardStyle,
        welcomeMessage: data.welcomeMessage,
        heroAnimation: data.heroAnimation,
        backgroundPattern: data.backgroundPattern,
        colorMode: data.colorMode,
        customLogoUrl: data.customLogoUrl,
        customLogoKey: data.customLogoKey,
        hideBranding: data.hideBranding,
        coverImageUrl: data.coverImageUrl,
        coverImageKey: data.coverImageKey,
        aiTone: data.aiTone,
        aiToneCustom: data.aiToneCustom,
        aiExtraContext: data.aiExtraContext,
        rsvpEnabled: data.rsvpEnabled,
        rsvpDeadline: data.rsvpDeadline,
        guestUploadsEnabled: data.guestUploadsEnabled,
        socialWallAutoApprove: data.socialWallAutoApprove,
        mode: data.mode,
        guestLimit: data.guestLimit,
        updatedAt: new Date(),
      },
    })
    return Event.fromJSON(row)
  }

  static async archive(id: string): Promise<void> {
    const prisma = usePrisma()
    await prisma.event.update({
      where: { id: Number(id) },
      data: { archivedAt: new Date() },
    })
  }

  static async restore(id: string): Promise<void> {
    const prisma = usePrisma()
    await prisma.event.update({
      where: { id: Number(id) },
      data: { archivedAt: null },
    })
  }

  static async getInvitationCount(eventId: string): Promise<number> {
    const prisma = usePrisma()
    return prisma.eventInvitation.count({ where: { eventId: Number(eventId) } })
  }

  static async getInvitationCountsByEventIds(eventIds: number[]): Promise<Record<number, number>> {
    if (eventIds.length === 0) return {}
    const prisma = usePrisma()
    const counts = await prisma.eventInvitation.groupBy({
      by: ['eventId'],
      where: { eventId: { in: eventIds } },
      _count: true,
    })
    const result: Record<number, number> = {}
    for (const c of counts) {
      result[c.eventId] = c._count
    }
    return result
  }

  static async findAllAdmin(options: { search?: string, offset: number, limit: number }): Promise<{ events: Event[], total: number }> {
    const prisma = usePrisma()
    const where: Record<string, unknown> = {}

    if (options.search) {
      where.title = { contains: options.search, mode: 'insensitive' }
    }

    const [rows, total] = await Promise.all([
      prisma.event.findMany({
        where,
        include: { owner: { select: { email: true, firstName: true, lastName: true } } },
        orderBy: { createdAt: 'desc' },
        skip: options.offset,
        take: options.limit,
      }),
      prisma.event.count({ where }),
    ])

    return { events: rows.map((row: any) => Event.fromJSON(row)), total }
  }

  static async countAll(): Promise<number> {
    const prisma = usePrisma()
    return prisma.event.count()
  }

  static async countGroupedByDate(days: number = 30): Promise<{ date: string, count: number }[]> {
    const prisma = usePrisma()
    const since = new Date()
    since.setDate(since.getDate() - days)

    const rows = await prisma.$queryRaw`
      SELECT DATE(created_at) as date, COUNT(*)::int as count
      FROM events
      WHERE created_at >= ${since}
      GROUP BY DATE(created_at)
      ORDER BY date ASC
    `
    return (rows as { date: string, count: number }[]).map((r) => ({ date: r.date, count: r.count }))
  }
}
