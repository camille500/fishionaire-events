import { usePrisma } from '../database'
import Event from '../entities/Event'

export default class EventRepository {
  static async create(event) {
    const prisma = usePrisma()
    const data = event.toJSON()
    const row = await prisma.event.create({
      data: {
        title: data.title,
        description: data.description,
        tier: data.tier,
        features: data.features,
        ownerClerkId: data.ownerClerkId,
      },
    })
    return Event.fromJSON(row)
  }

  static async findById(id) {
    const prisma = usePrisma()
    const row = await prisma.event.findUnique({ where: { id } })
    if (!row) return null
    return Event.fromJSON(row)
  }

  static async findByOwner(clerkId) {
    const prisma = usePrisma()
    const rows = await prisma.event.findMany({
      where: { ownerClerkId: clerkId },
      orderBy: { createdAt: 'desc' },
    })
    return rows.map((row) => Event.fromJSON(row))
  }

  static async findByInviteeEmail(email) {
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

  static async update(event) {
    const prisma = usePrisma()
    const data = event.toJSON()
    const row = await prisma.event.update({
      where: { id: data.id },
      data: {
        title: data.title,
        description: data.description,
        tier: data.tier,
        features: data.features,
        updatedAt: new Date(),
      },
    })
    return Event.fromJSON(row)
  }

  static async getInvitationCount(eventId) {
    const prisma = usePrisma()
    return prisma.eventInvitation.count({ where: { eventId } })
  }
}
