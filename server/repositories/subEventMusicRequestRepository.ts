import { usePrisma } from '../database'
import SubEventMusicRequest from '../entities/SubEventMusicRequest'

export default class SubEventMusicRequestRepository {
  static async create(data: { subEventId: string, guestEmail: string, songTitle: string, artist?: string | null }): Promise<SubEventMusicRequest> {
    const prisma = usePrisma()
    const row = await prisma.subEventMusicRequest.create({
      data: {
        subEventId: data.subEventId,
        guestEmail: data.guestEmail,
        songTitle: data.songTitle,
        artist: data.artist || null,
      },
    })
    return SubEventMusicRequest.fromJSON(row)
  }

  static async findBySubEventId(subEventId: string): Promise<SubEventMusicRequest[]> {
    const prisma = usePrisma()
    const rows = await prisma.subEventMusicRequest.findMany({
      where: { subEventId },
      orderBy: { votes: 'desc' },
    })
    return rows.map((row) => SubEventMusicRequest.fromJSON(row))
  }

  static async upvote(id: string): Promise<SubEventMusicRequest> {
    const prisma = usePrisma()
    const row = await prisma.subEventMusicRequest.update({
      where: { id },
      data: { votes: { increment: 1 } },
    })
    return SubEventMusicRequest.fromJSON(row)
  }

  static async delete(id: string): Promise<void> {
    const prisma = usePrisma()
    await prisma.subEventMusicRequest.delete({ where: { id } })
  }
}
