import crypto from 'crypto'
import { usePrisma } from '../database'
import EventInvitation from '../entities/EventInvitation'

const FULL_INCLUDE = {
  subEventInvites: true,
  plusOneInvites: {
    select: {
      id: true,
      inviteeEmail: true,
      inviteeName: true,
      status: true,
      accessToken: true,
    },
  },
  invitedBy: {
    select: {
      inviteeName: true,
    },
  },
}

function mapRow(row: any): any {
  return {
    ...row,
    subEventInvites: (row.subEventInvites || []).map((s: any) => ({
      subEventId: s.subEventId,
      plusOnes: s.plusOnes,
    })),
    plusOneInvites: row.plusOneInvites || [],
    invitedBy: row.invitedBy || null,
  }
}

export default class EventInvitationRepository {
  static async create(invitation: EventInvitation): Promise<EventInvitation> {
    const prisma = usePrisma()
    const data = invitation.toJSON()
    const row = await prisma.eventInvitation.create({
      data: {
        eventId: Number(data.eventId),
        inviteeEmail: data.inviteeEmail,
        inviteeName: data.inviteeName,
        inviterClerkId: data.inviterClerkId,
        status: data.status,
        plusOnes: data.plusOnes,
        accessToken: data.accessToken || crypto.randomBytes(16).toString('hex'),
        invitedById: data.invitedById ? Number(data.invitedById) : null,
        subEventInvites: data.subEventInvites.length > 0
          ? {
              create: data.subEventInvites.map((s) => ({
                subEventId: Number(s.subEventId),
                plusOnes: s.plusOnes,
              })),
            }
          : undefined,
      },
      include: FULL_INCLUDE,
    })
    return EventInvitation.fromJSON(mapRow(row))
  }

  static async findByEventId(eventId: string): Promise<EventInvitation[]> {
    const prisma = usePrisma()
    const rows = await prisma.eventInvitation.findMany({
      where: { eventId: Number(eventId) },
      include: FULL_INCLUDE,
      orderBy: { createdAt: 'desc' },
    })
    return rows.map((row) => EventInvitation.fromJSON(mapRow(row)))
  }

  static async findPrimaryByEventId(eventId: string): Promise<EventInvitation[]> {
    const prisma = usePrisma()
    const rows = await prisma.eventInvitation.findMany({
      where: { eventId: Number(eventId), invitedById: null },
      include: FULL_INCLUDE,
      orderBy: { createdAt: 'desc' },
    })
    return rows.map((row) => EventInvitation.fromJSON(mapRow(row)))
  }

  static async findByEventIdAndEmail(eventId: string, email: string): Promise<EventInvitation | null> {
    const prisma = usePrisma()
    const row = await prisma.eventInvitation.findFirst({
      where: { eventId: Number(eventId), inviteeEmail: { equals: email, mode: 'insensitive' } },
      include: FULL_INCLUDE,
    })
    if (!row) return null
    return EventInvitation.fromJSON(mapRow(row))
  }

  static async findByAccessToken(token: string): Promise<EventInvitation | null> {
    const prisma = usePrisma()
    const row = await prisma.eventInvitation.findUnique({
      where: { accessToken: token },
      include: FULL_INCLUDE,
    })
    if (!row) return null
    return EventInvitation.fromJSON(mapRow(row))
  }

  static async update(id: number, data: {
    inviteeName?: string | null
    plusOnes?: number
    status?: string
    subEventInvites?: { subEventId: number, plusOnes: number }[]
  }): Promise<EventInvitation> {
    const prisma = usePrisma()

    if (data.subEventInvites !== undefined) {
      await prisma.invitationSubEvent.deleteMany({ where: { invitationId: id } })
      if (data.subEventInvites.length > 0) {
        await prisma.invitationSubEvent.createMany({
          data: data.subEventInvites.map((s) => ({
            invitationId: id,
            subEventId: Number(s.subEventId),
            plusOnes: s.plusOnes,
          })),
        })
      }
    }

    const row = await prisma.eventInvitation.update({
      where: { id },
      data: {
        ...(data.inviteeName !== undefined ? { inviteeName: data.inviteeName } : {}),
        ...(data.plusOnes !== undefined ? { plusOnes: data.plusOnes } : {}),
        ...(data.status !== undefined ? { status: data.status } : {}),
      },
      include: FULL_INCLUDE,
    })
    return EventInvitation.fromJSON(mapRow(row))
  }

  static async delete(id: number): Promise<void> {
    const prisma = usePrisma()
    await prisma.eventInvitation.delete({ where: { id } })
  }

  static async countGuests(eventId: string): Promise<{ invited: number, plusOnes: number, total: number }> {
    const prisma = usePrisma()
    const all = await prisma.eventInvitation.count({ where: { eventId: Number(eventId) } })
    return { invited: all, plusOnes: 0, total: all }
  }
}
