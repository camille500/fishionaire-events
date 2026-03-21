import SubEventRepository from '../repositories/subEventRepository'
import SubEventDietaryRepository from '../repositories/subEventDietaryRepository'
import SubEventPlusOneRepository from '../repositories/subEventPlusOneRepository'
import SubEventMusicRequestRepository from '../repositories/subEventMusicRequestRepository'
import EventInvitationRepository from '../repositories/eventInvitationRepository'
import EventMemberRepository from '../repositories/eventMemberRepository'
import SpotifyConnectionRepository from '../repositories/spotifyConnectionRepository'
import { getValidToken, addTracksToPlaylist } from '../utils/spotifyClient'

export default class SubEventInteractionController {
  static async #verifyGuestAccess(subEventId: number, email: string) {
    const subEvent = await SubEventRepository.findById(subEventId)
    if (!subEvent) {
      throw createError({ statusCode: 404, statusMessage: 'Sub-event not found' })
    }

    const invitation = await EventInvitationRepository.findByEventIdAndEmail(subEvent.eventId, email.toLowerCase())
    if (!invitation) {
      throw createError({ statusCode: 403, statusMessage: 'You are not invited to this event' })
    }

    return subEvent
  }

  static async #verifyOrganizerAccess(subEventId: number, clerkId: string) {
    const subEvent = await SubEventRepository.findById(subEventId)
    if (!subEvent) {
      throw createError({ statusCode: 404, statusMessage: 'Sub-event not found' })
    }

    const member = await EventMemberRepository.findByEventIdAndUserId(subEvent.eventId, clerkId)
    if (!member || !member.canEdit) {
      throw createError({ statusCode: 403, statusMessage: 'You do not have permission to manage this sub-event' })
    }

    return subEvent
  }

  // Dietary preferences
  static async submitDietary(subEventId: number, email: string, data: { guestName?: string, restrictions: string, notes?: string }): Promise<Record<string, unknown>> {
    const subEvent = await this.#verifyGuestAccess(subEventId, email)

    if (subEvent.type !== 'dinner') {
      throw createError({ statusCode: 400, statusMessage: 'Dietary preferences are only available for dinner sub-events' })
    }

    if (!data.restrictions || !data.restrictions.trim()) {
      throw createError({ statusCode: 400, statusMessage: 'Dietary restrictions are required' })
    }

    const dietary = await SubEventDietaryRepository.upsert(subEventId, email.toLowerCase(), {
      guestName: data.guestName || null,
      restrictions: data.restrictions.trim(),
      notes: data.notes || null,
    })
    return dietary.toJSON()
  }

  static async getDietary(subEventId: number, email: string): Promise<Record<string, unknown> | null> {
    await this.#verifyGuestAccess(subEventId, email)
    const dietary = await SubEventDietaryRepository.findByGuestEmail(subEventId, email.toLowerCase())
    return dietary ? dietary.toJSON() : null
  }

  static async getDietarySummary(subEventId: number, clerkId: string): Promise<Record<string, unknown>> {
    await this.#verifyOrganizerAccess(subEventId, clerkId)
    const responses = await SubEventDietaryRepository.findBySubEventId(subEventId)

    const restrictionCounts: Record<string, number> = {}
    for (const r of responses) {
      const tags = r.restrictions.split(',').map((t) => t.trim().toLowerCase())
      for (const tag of tags) {
        if (tag) restrictionCounts[tag] = (restrictionCounts[tag] || 0) + 1
      }
    }

    return {
      totalResponses: responses.length,
      restrictionCounts,
      responses: responses.map((r) => r.toJSON()),
    }
  }

  // Plus-ones
  static async requestPlusOne(subEventId: number, email: string, plusOneName: string): Promise<Record<string, unknown>> {
    const subEvent = await this.#verifyGuestAccess(subEventId, email)

    if (subEvent.type !== 'party') {
      throw createError({ statusCode: 400, statusMessage: 'Plus-one requests are only available for party sub-events' })
    }

    const config = subEvent.typeConfig as { allowPlusOnes?: boolean, maxPlusOnes?: number }
    if (!config.allowPlusOnes) {
      throw createError({ statusCode: 400, statusMessage: 'Plus-ones are not enabled for this sub-event' })
    }

    if (!plusOneName || !plusOneName.trim()) {
      throw createError({ statusCode: 400, statusMessage: 'Plus-one name is required' })
    }

    if (subEvent.capacity) {
      const currentCount = await SubEventPlusOneRepository.countBySubEventId(subEventId)
      if (currentCount >= (config.maxPlusOnes || subEvent.capacity)) {
        throw createError({ statusCode: 400, statusMessage: 'No more plus-one spots available' })
      }
    }

    const plusOne = await SubEventPlusOneRepository.create({
      subEventId,
      guestEmail: email.toLowerCase(),
      plusOneName: plusOneName.trim(),
    })
    return plusOne.toJSON()
  }

  static async getPlusOnes(subEventId: number, clerkId: string): Promise<Record<string, unknown>[]> {
    await this.#verifyOrganizerAccess(subEventId, clerkId)
    const plusOnes = await SubEventPlusOneRepository.findBySubEventId(subEventId)
    return plusOnes.map((p) => p.toJSON())
  }

  static async deletePlusOne(plusOneId: number, clerkId: string, subEventId: number): Promise<void> {
    await this.#verifyOrganizerAccess(subEventId, clerkId)
    await SubEventPlusOneRepository.delete(plusOneId)
  }

  // Music requests
  static async submitMusicRequest(subEventId: number, email: string, data: {
    songTitle: string
    artist?: string
    spotifyTrackId?: string | null
    spotifyUri?: string | null
    albumArtUrl?: string | null
    previewUrl?: string | null
    durationMs?: number | null
  }): Promise<Record<string, unknown>> {
    const subEvent = await this.#verifyGuestAccess(subEventId, email)

    if (subEvent.type !== 'party') {
      throw createError({ statusCode: 400, statusMessage: 'Music requests are only available for party sub-events' })
    }

    const config = subEvent.typeConfig as { musicRequestsEnabled?: boolean, autoApproveRequests?: boolean }
    if (config.musicRequestsEnabled === false) {
      throw createError({ statusCode: 400, statusMessage: 'Music requests are not enabled for this sub-event' })
    }

    if (!data.songTitle || !data.songTitle.trim()) {
      throw createError({ statusCode: 400, statusMessage: 'Song title is required' })
    }

    const request = await SubEventMusicRequestRepository.create({
      subEventId,
      guestEmail: email.toLowerCase(),
      songTitle: data.songTitle.trim(),
      artist: data.artist || null,
      status: config.autoApproveRequests ? 'approved' : 'pending',
      spotifyTrackId: data.spotifyTrackId || null,
      spotifyUri: data.spotifyUri || null,
      albumArtUrl: data.albumArtUrl || null,
      previewUrl: data.previewUrl || null,
      durationMs: data.durationMs || null,
    })
    return request.toJSON()
  }

  static async getMusicRequests(subEventId: number): Promise<Record<string, unknown>[]> {
    const subEvent = await SubEventRepository.findById(subEventId)
    if (!subEvent) {
      throw createError({ statusCode: 404, statusMessage: 'Sub-event not found' })
    }
    const requests = await SubEventMusicRequestRepository.findBySubEventId(subEventId)
    return requests.map((r) => r.toJSON())
  }

  static async upvoteMusicRequest(requestId: number): Promise<Record<string, unknown>> {
    const updated = await SubEventMusicRequestRepository.upvote(requestId)
    return updated.toJSON()
  }

  static async approveMusicRequest(requestId: number, clerkId: string, subEventId: number): Promise<Record<string, unknown>> {
    const subEvent = await this.#verifyOrganizerAccess(subEventId, clerkId)
    const updated = await SubEventMusicRequestRepository.updateStatus(requestId, 'approved')

    // Auto-add to playlist if exactly one playlist exists
    if (updated.spotifyUri) {
      try {
        const connection = await SpotifyConnectionRepository.findByEventId(subEvent.eventId)
        if (connection) {
          const playlists = await SpotifyConnectionRepository.findPlaylists(Number(connection.id))
          if (playlists.length === 1) {
            const playlist = playlists[0]
            const accessToken = await getValidToken(connection)
            await addTracksToPlaylist(accessToken, playlist.spotifyPlaylistId, [updated.spotifyUri])
            await SubEventMusicRequestRepository.assignToPlaylist([Number(updated.id)], playlist.id)
            const result = updated.toJSON()
            result.playlistId = playlist.id
            return result
          }
        }
      } catch (err) {
        console.error('[Spotify] Auto-add to playlist failed:', err)
      }
    }

    return updated.toJSON()
  }

  static async rejectMusicRequest(requestId: number, clerkId: string, subEventId: number): Promise<Record<string, unknown>> {
    await this.#verifyOrganizerAccess(subEventId, clerkId)
    const updated = await SubEventMusicRequestRepository.updateStatus(requestId, 'rejected')
    return updated.toJSON()
  }
}
