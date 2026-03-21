import SpotifyConnectionRepository from '../repositories/spotifyConnectionRepository'
import SubEventMusicRequestRepository from '../repositories/subEventMusicRequestRepository'
import EventMemberRepository from '../repositories/eventMemberRepository'
import {
  searchTracks,
  getAuthUrl,
  exchangeCode,
  getSpotifyUser,
  getValidToken,
  createPlaylist,
  addTracksToPlaylist,
  addToQueue,
} from '../utils/spotifyClient'

export default class SpotifyController {
  static async #verifyOrganizer(eventId: number, clerkId: string) {
    const member = await EventMemberRepository.findByEventIdAndUserId(eventId, clerkId)
    if (!member || !member.canEdit) {
      throw createError({ statusCode: 403, statusMessage: 'You do not have permission to manage this event' })
    }
  }

  static async search(query: string): Promise<Record<string, unknown>[]> {
    if (!query || query.trim().length < 2) {
      return []
    }
    return searchTracks(query.trim())
  }

  static getConnectUrl(eventId: number, clerkId: string): string {
    return getAuthUrl(eventId, clerkId)
  }

  static async handleCallback(code: string, state: string): Promise<{ eventId: number }> {
    let parsed: { eventId: number, clerkId: string }
    try {
      parsed = JSON.parse(Buffer.from(state, 'base64url').toString())
    } catch {
      throw createError({ statusCode: 400, statusMessage: 'Invalid state parameter' })
    }

    const { eventId, clerkId } = parsed

    const tokens = await exchangeCode(code)
    const spotifyUser = await getSpotifyUser(tokens.accessToken)
    const tokenExpiresAt = new Date(Date.now() + tokens.expiresIn * 1000)

    await SpotifyConnectionRepository.upsert(eventId, {
      userClerkId: clerkId,
      spotifyUserId: spotifyUser.id,
      spotifyDisplayName: spotifyUser.displayName,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      tokenExpiresAt,
    })

    return { eventId }
  }

  static async getConnection(eventId: number, clerkId: string): Promise<Record<string, unknown>> {
    await this.#verifyOrganizer(eventId, clerkId)
    const connection = await SpotifyConnectionRepository.findByEventId(eventId)
    if (!connection) {
      return { connected: false }
    }
    const playlists = await SpotifyConnectionRepository.findPlaylists(Number(connection.id))
    return {
      ...connection.toPublicJSON(),
      playlists: playlists.map((p) => ({
        id: p.id,
        name: p.name,
        spotifyPlaylistUrl: p.spotifyPlaylistUrl,
      })),
    }
  }

  static async disconnect(eventId: number, clerkId: string): Promise<void> {
    await this.#verifyOrganizer(eventId, clerkId)
    await SpotifyConnectionRepository.deleteByEventId(eventId)
  }

  static async createEventPlaylist(eventId: number, clerkId: string, name: string, subEventId: number): Promise<Record<string, unknown>> {
    await this.#verifyOrganizer(eventId, clerkId)

    const connection = await SpotifyConnectionRepository.findByEventId(eventId)
    if (!connection) {
      throw createError({ statusCode: 400, statusMessage: 'Spotify is not connected for this event' })
    }

    const accessToken = await getValidToken(connection)
    const playlist = await createPlaylist(accessToken, connection.spotifyUserId, name)
    const dbPlaylist = await SpotifyConnectionRepository.createPlaylist(Number(connection.id), {
      spotifyPlaylistId: playlist.id,
      spotifyPlaylistUrl: playlist.url,
      name,
    })

    // Try to add approved tracks that aren't already in a playlist
    const approvedRequests = await SubEventMusicRequestRepository.findBySubEventIdAndStatus(subEventId, 'approved')
    const unassigned = approvedRequests.filter((r) => r.spotifyUri && !r.playlistId)
    const trackUris = unassigned.map((r) => r.spotifyUri!)

    if (trackUris.length > 0) {
      try {
        await addTracksToPlaylist(accessToken, playlist.id, trackUris)
        await SubEventMusicRequestRepository.assignToPlaylist(
          unassigned.map((r) => Number(r.id)),
          dbPlaylist.id,
        )
      } catch (err) {
        console.error('[Spotify] Failed to add tracks, but playlist was created:', playlist.url)
      }
    }

    return {
      id: dbPlaylist.id,
      playlistId: playlist.id,
      playlistUrl: playlist.url,
      trackCount: trackUris.length,
      name,
    }
  }

  static async addToPlaylist(eventId: number, clerkId: string, playlistDbId: number, requestIds: number[]): Promise<Record<string, unknown>> {
    await this.#verifyOrganizer(eventId, clerkId)

    const connection = await SpotifyConnectionRepository.findByEventId(eventId)
    if (!connection) {
      throw createError({ statusCode: 400, statusMessage: 'Spotify is not connected for this event' })
    }

    const playlist = await SpotifyConnectionRepository.findPlaylistById(playlistDbId)
    if (!playlist) {
      throw createError({ statusCode: 404, statusMessage: 'Playlist not found' })
    }

    const requests = []
    for (const id of requestIds) {
      const req = await SubEventMusicRequestRepository.findById(id)
      if (req && req.spotifyUri) requests.push(req)
    }

    if (requests.length === 0) {
      throw createError({ statusCode: 400, statusMessage: 'No valid Spotify tracks to add' })
    }

    const accessToken = await getValidToken(connection)
    const trackUris = requests.map((r) => r.spotifyUri!)
    await addTracksToPlaylist(accessToken, playlist.spotifyPlaylistId, trackUris)
    await SubEventMusicRequestRepository.assignToPlaylist(
      requests.map((r) => Number(r.id)),
      playlistDbId,
    )

    return { added: requests.length }
  }

  static async addTrackToQueue(eventId: number, clerkId: string, requestId: number): Promise<void> {
    await this.#verifyOrganizer(eventId, clerkId)

    const connection = await SpotifyConnectionRepository.findByEventId(eventId)
    if (!connection) {
      throw createError({ statusCode: 400, statusMessage: 'Spotify is not connected for this event' })
    }

    const request = await SubEventMusicRequestRepository.findById(requestId)
    if (!request || !request.spotifyUri) {
      throw createError({ statusCode: 400, statusMessage: 'This track has no Spotify URI' })
    }

    const accessToken = await getValidToken(connection)
    await addToQueue(accessToken, request.spotifyUri)
    await SubEventMusicRequestRepository.updateStatus(requestId, 'queued')
  }
}
