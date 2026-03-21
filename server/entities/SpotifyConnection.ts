export interface SpotifyConnectionData {
  id: string | null
  eventId: string
  userClerkId: string
  spotifyUserId: string
  spotifyDisplayName: string | null
  accessToken: string
  refreshToken: string
  tokenExpiresAt: Date | string
  playlistId: string | null
  playlistUrl: string | null
  createdAt: Date | string
  updatedAt: Date | string
}

export interface SpotifyConnectionJSON {
  id?: string | null
  eventId?: string
  event_id?: string
  userClerkId?: string
  user_clerk_id?: string
  spotifyUserId?: string
  spotify_user_id?: string
  spotifyDisplayName?: string | null
  spotify_display_name?: string | null
  accessToken?: string
  access_token?: string
  refreshToken?: string
  refresh_token?: string
  tokenExpiresAt?: Date | string
  token_expires_at?: Date | string
  playlistId?: string | null
  playlist_id?: string | null
  playlistUrl?: string | null
  playlist_url?: string | null
  createdAt?: Date | string
  created_at?: Date | string
  updatedAt?: Date | string
  updated_at?: Date | string
}

export default class SpotifyConnection {
  id: string | null
  eventId: string
  userClerkId: string
  spotifyUserId: string
  spotifyDisplayName: string | null
  accessToken: string
  refreshToken: string
  tokenExpiresAt: Date | string
  playlistId: string | null
  playlistUrl: string | null
  createdAt: Date | string
  updatedAt: Date | string

  constructor(data: SpotifyConnectionData) {
    this.id = data.id || null
    this.eventId = data.eventId
    this.userClerkId = data.userClerkId
    this.spotifyUserId = data.spotifyUserId
    this.spotifyDisplayName = data.spotifyDisplayName || null
    this.accessToken = data.accessToken
    this.refreshToken = data.refreshToken
    this.tokenExpiresAt = data.tokenExpiresAt
    this.playlistId = data.playlistId || null
    this.playlistUrl = data.playlistUrl || null
    this.createdAt = data.createdAt || new Date()
    this.updatedAt = data.updatedAt || new Date()
  }

  static fromJSON(data: SpotifyConnectionJSON): SpotifyConnection {
    return new SpotifyConnection({
      id: data.id ?? null,
      eventId: (data.eventId || data.event_id)!,
      userClerkId: (data.userClerkId || data.user_clerk_id)!,
      spotifyUserId: (data.spotifyUserId || data.spotify_user_id)!,
      spotifyDisplayName: data.spotifyDisplayName ?? data.spotify_display_name ?? null,
      accessToken: (data.accessToken || data.access_token)!,
      refreshToken: (data.refreshToken || data.refresh_token)!,
      tokenExpiresAt: (data.tokenExpiresAt || data.token_expires_at)!,
      playlistId: data.playlistId ?? data.playlist_id ?? null,
      playlistUrl: data.playlistUrl ?? data.playlist_url ?? null,
      createdAt: data.createdAt || data.created_at || new Date(),
      updatedAt: data.updatedAt || data.updated_at || new Date(),
    })
  }

  toJSON(): SpotifyConnectionData {
    return {
      id: this.id,
      eventId: this.eventId,
      userClerkId: this.userClerkId,
      spotifyUserId: this.spotifyUserId,
      spotifyDisplayName: this.spotifyDisplayName,
      accessToken: this.accessToken,
      refreshToken: this.refreshToken,
      tokenExpiresAt: this.tokenExpiresAt,
      playlistId: this.playlistId,
      playlistUrl: this.playlistUrl,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    }
  }

  toPublicJSON(): Record<string, unknown> {
    return {
      id: this.id,
      eventId: this.eventId,
      spotifyDisplayName: this.spotifyDisplayName,
      playlistId: this.playlistId,
      playlistUrl: this.playlistUrl,
      connected: true,
    }
  }
}
