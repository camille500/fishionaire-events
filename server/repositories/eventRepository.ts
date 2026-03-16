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
        shareToken: data.shareToken,
        isPrivate: data.isPrivate,
        tier: data.tier,
        features: data.features,
        coverImageUrl: data.coverImageUrl,
        coverImageKey: data.coverImageKey,
        ownerClerkId: data.ownerClerkId,
        aiTone: data.aiTone,
        aiToneCustom: data.aiToneCustom,
        aiExtraContext: data.aiExtraContext,
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
      where: { ownerClerkId: clerkId, archivedAt: null },
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
        shareToken: data.shareToken,
        isPrivate: data.isPrivate,
        tier: data.tier,
        features: data.features,
        coverImageUrl: data.coverImageUrl,
        coverImageKey: data.coverImageKey,
        aiTone: data.aiTone,
        aiToneCustom: data.aiToneCustom,
        aiExtraContext: data.aiExtraContext,
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
}
