import { usePrisma } from '../database'
import SubEventMusicRequest from '../entities/SubEventMusicRequest'
import type { MusicRequestStatus } from '../entities/SubEventMusicRequest'

export default class SubEventMusicRequestRepository {
  static async create(data: {
    subEventId: string
    guestEmail: string
    songTitle: string
    artist?: string | null
    status?: MusicRequestStatus
    spotifyTrackId?: string | null
    spotifyUri?: string | null
    albumArtUrl?: string | null
    previewUrl?: string | null
    durationMs?: number | null
  }): Promise<SubEventMusicRequest> {
    const prisma = usePrisma()
    const row = await prisma.subEventMusicRequest.create({
      data: {
        subEventId: Number(data.subEventId),
        guestEmail: data.guestEmail,
        songTitle: data.songTitle,
        artist: data.artist || null,
        status: data.status || 'pending',
        spotifyTrackId: data.spotifyTrackId || null,
        spotifyUri: data.spotifyUri || null,
        albumArtUrl: data.albumArtUrl || null,
        previewUrl: data.previewUrl || null,
        durationMs: data.durationMs || null,
      },
    })
    return SubEventMusicRequest.fromJSON(row)
  }

  static async findBySubEventId(subEventId: string | number): Promise<SubEventMusicRequest[]> {
    const prisma = usePrisma()
    const rows = await prisma.subEventMusicRequest.findMany({
      where: { subEventId: Number(subEventId) },
      orderBy: { votes: 'desc' },
    })
    return rows.map((row) => SubEventMusicRequest.fromJSON(row))
  }

  static async findBySubEventIdAndStatus(subEventId: string | number, status: MusicRequestStatus): Promise<SubEventMusicRequest[]> {
    const prisma = usePrisma()
    const rows = await prisma.subEventMusicRequest.findMany({
      where: { subEventId: Number(subEventId), status },
      orderBy: { votes: 'desc' },
    })
    return rows.map((row) => SubEventMusicRequest.fromJSON(row))
  }

  static async findById(id: string | number): Promise<SubEventMusicRequest | null> {
    const prisma = usePrisma()
    const row = await prisma.subEventMusicRequest.findUnique({
      where: { id: Number(id) },
    })
    return row ? SubEventMusicRequest.fromJSON(row) : null
  }

  static async updateStatus(id: string | number, status: MusicRequestStatus): Promise<SubEventMusicRequest> {
    const prisma = usePrisma()
    const row = await prisma.subEventMusicRequest.update({
      where: { id: Number(id) },
      data: { status },
    })
    return SubEventMusicRequest.fromJSON(row)
  }

  static async upvote(id: string | number): Promise<SubEventMusicRequest> {
    const prisma = usePrisma()
    const row = await prisma.subEventMusicRequest.update({
      where: { id: Number(id) },
      data: { votes: { increment: 1 } },
    })
    return SubEventMusicRequest.fromJSON(row)
  }

  static async assignToPlaylist(ids: number[], playlistId: number): Promise<void> {
    const prisma = usePrisma()
    await prisma.subEventMusicRequest.updateMany({
      where: { id: { in: ids } },
      data: { playlistId },
    })
  }

  static async findByPlaylistId(playlistId: number): Promise<SubEventMusicRequest[]> {
    const prisma = usePrisma()
    const rows = await prisma.subEventMusicRequest.findMany({
      where: { playlistId },
      orderBy: { votes: 'desc' },
    })
    return rows.map((row) => SubEventMusicRequest.fromJSON(row))
  }

  static async delete(id: string | number): Promise<void> {
    const prisma = usePrisma()
    await prisma.subEventMusicRequest.delete({ where: { id: Number(id) } })
  }
}
