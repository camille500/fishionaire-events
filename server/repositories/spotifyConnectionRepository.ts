import { usePrisma } from '../database'
import SpotifyConnection from '../entities/SpotifyConnection'

export default class SpotifyConnectionRepository {
  static async findByEventId(eventId: number): Promise<SpotifyConnection | null> {
    const prisma = usePrisma()
    const row = await prisma.spotifyConnection.findUnique({
      where: { eventId },
    })
    return row ? SpotifyConnection.fromJSON(row) : null
  }

  static async upsert(eventId: number, data: {
    userClerkId: string
    spotifyUserId: string
    spotifyDisplayName?: string | null
    accessToken: string
    refreshToken: string
    tokenExpiresAt: Date
  }): Promise<SpotifyConnection> {
    const prisma = usePrisma()
    const row = await prisma.spotifyConnection.upsert({
      where: { eventId },
      create: {
        eventId,
        userClerkId: data.userClerkId,
        spotifyUserId: data.spotifyUserId,
        spotifyDisplayName: data.spotifyDisplayName || null,
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
        tokenExpiresAt: data.tokenExpiresAt,
      },
      update: {
        userClerkId: data.userClerkId,
        spotifyUserId: data.spotifyUserId,
        spotifyDisplayName: data.spotifyDisplayName || null,
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
        tokenExpiresAt: data.tokenExpiresAt,
        updatedAt: new Date(),
      },
    })
    return SpotifyConnection.fromJSON(row)
  }

  static async updateTokens(eventId: number, accessToken: string, refreshToken: string, expiresAt: Date): Promise<SpotifyConnection> {
    const prisma = usePrisma()
    const row = await prisma.spotifyConnection.update({
      where: { eventId },
      data: {
        accessToken,
        refreshToken,
        tokenExpiresAt: expiresAt,
        updatedAt: new Date(),
      },
    })
    return SpotifyConnection.fromJSON(row)
  }

  static async updatePlaylist(eventId: number, playlistId: string, playlistUrl: string): Promise<SpotifyConnection> {
    const prisma = usePrisma()
    const row = await prisma.spotifyConnection.update({
      where: { eventId },
      data: {
        playlistId,
        playlistUrl,
        updatedAt: new Date(),
      },
    })
    return SpotifyConnection.fromJSON(row)
  }

  static async deleteByEventId(eventId: number): Promise<void> {
    const prisma = usePrisma()
    await prisma.spotifyConnection.delete({ where: { eventId } })
  }

  static async createPlaylist(connectionId: number, data: {
    spotifyPlaylistId: string
    spotifyPlaylistUrl: string
    name: string
  }): Promise<{ id: number, spotifyPlaylistId: string, spotifyPlaylistUrl: string, name: string }> {
    const prisma = usePrisma()
    const row = await prisma.spotifyPlaylist.create({
      data: {
        spotifyConnectionId: connectionId,
        spotifyPlaylistId: data.spotifyPlaylistId,
        spotifyPlaylistUrl: data.spotifyPlaylistUrl,
        name: data.name,
      },
    })
    return row
  }

  static async findPlaylists(connectionId: number): Promise<{ id: number, spotifyPlaylistId: string, spotifyPlaylistUrl: string, name: string, createdAt: Date }[]> {
    const prisma = usePrisma()
    return prisma.spotifyPlaylist.findMany({
      where: { spotifyConnectionId: connectionId },
      orderBy: { createdAt: 'desc' },
    })
  }

  static async findPlaylistById(playlistId: number): Promise<{ id: number, spotifyPlaylistId: string, spotifyPlaylistUrl: string, name: string, spotifyConnectionId: number } | null> {
    const prisma = usePrisma()
    return prisma.spotifyPlaylist.findUnique({ where: { id: playlistId } })
  }
}
