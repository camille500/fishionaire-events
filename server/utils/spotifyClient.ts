import SpotifyConnectionRepository from '../repositories/spotifyConnectionRepository'
import type SpotifyConnection from '../entities/SpotifyConnection'

const SPOTIFY_API = 'https://api.spotify.com/v1'
const SPOTIFY_ACCOUNTS = 'https://accounts.spotify.com'

let clientToken: { token: string, expiresAt: number } | null = null

function getCredentials() {
  const config = useRuntimeConfig()
  return {
    clientId: config.spotifyClientId as string,
    clientSecret: config.spotifyClientSecret as string,
  }
}

export async function getClientCredentialsToken(): Promise<string> {
  if (clientToken && Date.now() < clientToken.expiresAt - 60_000) {
    return clientToken.token
  }

  const { clientId, clientSecret } = getCredentials()
  const basic = Buffer.from(`${clientId}:${clientSecret}`).toString('base64')

  const res = await fetch(`${SPOTIFY_ACCOUNTS}/api/token`, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${basic}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  })

  if (!res.ok) {
    throw createError({ statusCode: 502, statusMessage: 'Failed to authenticate with Spotify' })
  }

  const data = await res.json()
  clientToken = {
    token: data.access_token,
    expiresAt: Date.now() + data.expires_in * 1000,
  }
  return clientToken.token
}

export async function searchTracks(query: string, limit = 10): Promise<Record<string, unknown>[]> {
  const token = await getClientCredentialsToken()

  const params = new URLSearchParams({ q: query, type: 'track', limit: String(limit) })
  const res = await fetch(`${SPOTIFY_API}/search?${params}`, {
    headers: { Authorization: `Bearer ${token}` },
  })

  if (!res.ok) {
    throw createError({ statusCode: 502, statusMessage: 'Spotify search failed' })
  }

  const data = await res.json()
  return (data.tracks?.items || []).map((track: Record<string, unknown>) => ({
    spotifyTrackId: track.id,
    spotifyUri: track.uri,
    songTitle: track.name,
    artist: (track.artists as Record<string, unknown>[])?.map((a) => a.name).join(', ') || null,
    albumArtUrl: (track.album as Record<string, unknown>)?.images?.[1]?.url
      || (track.album as Record<string, unknown>)?.images?.[0]?.url
      || null,
    previewUrl: track.preview_url || null,
    durationMs: track.duration_ms || null,
  }))
}

export function getAuthUrl(eventId: number, clerkId: string): string {
  const { clientId } = getCredentials()
  const config = useRuntimeConfig()
  const appUrl = config.public.appUrl as string
  const redirectUri = `${appUrl}/api/spotify/callback`

  const state = Buffer.from(JSON.stringify({ eventId, clerkId })).toString('base64url')

  const params = new URLSearchParams({
    response_type: 'code',
    client_id: clientId,
    scope: 'playlist-modify-public playlist-modify-private user-modify-playback-state user-read-playback-state',
    redirect_uri: redirectUri,
    state,
    show_dialog: 'true',
  })

  return `${SPOTIFY_ACCOUNTS}/authorize?${params}`
}

export async function exchangeCode(code: string): Promise<{
  accessToken: string
  refreshToken: string
  expiresIn: number
}> {
  const { clientId, clientSecret } = getCredentials()
  const config = useRuntimeConfig()
  const appUrl = config.public.appUrl as string
  const redirectUri = `${appUrl}/api/spotify/callback`
  const basic = Buffer.from(`${clientId}:${clientSecret}`).toString('base64')

  const res = await fetch(`${SPOTIFY_ACCOUNTS}/api/token`, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${basic}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: redirectUri,
    }).toString(),
  })

  if (!res.ok) {
    throw createError({ statusCode: 502, statusMessage: 'Failed to exchange Spotify authorization code' })
  }

  const data = await res.json()
  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    expiresIn: data.expires_in,
  }
}

export async function refreshAccessToken(refreshToken: string): Promise<{
  accessToken: string
  refreshToken: string
  expiresIn: number
}> {
  const { clientId, clientSecret } = getCredentials()
  const basic = Buffer.from(`${clientId}:${clientSecret}`).toString('base64')

  const res = await fetch(`${SPOTIFY_ACCOUNTS}/api/token`, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${basic}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
    }).toString(),
  })

  if (!res.ok) {
    throw createError({ statusCode: 502, statusMessage: 'Failed to refresh Spotify token' })
  }

  const data = await res.json()
  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token || refreshToken,
    expiresIn: data.expires_in,
  }
}

export async function getValidToken(connection: SpotifyConnection): Promise<string> {
  const expiresAt = new Date(connection.tokenExpiresAt).getTime()

  if (Date.now() < expiresAt - 5 * 60 * 1000) {
    return connection.accessToken
  }

  const refreshed = await refreshAccessToken(connection.refreshToken)
  const newExpiresAt = new Date(Date.now() + refreshed.expiresIn * 1000)

  await SpotifyConnectionRepository.updateTokens(
    Number(connection.eventId),
    refreshed.accessToken,
    refreshed.refreshToken,
    newExpiresAt,
  )

  return refreshed.accessToken
}

export async function getSpotifyUser(accessToken: string): Promise<{ id: string, displayName: string | null }> {
  const res = await fetch(`${SPOTIFY_API}/me`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  })

  if (!res.ok) {
    throw createError({ statusCode: 502, statusMessage: 'Failed to fetch Spotify user profile' })
  }

  const data = await res.json()
  return { id: data.id, displayName: data.display_name || null }
}

export async function createPlaylist(accessToken: string, _userId: string, name: string, description?: string): Promise<{ id: string, url: string }> {
  const res = await fetch(`${SPOTIFY_API}/me/playlists`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name,
      description: description || 'Created by Fishionaire Events',
      public: true,
    }),
  })

  if (res.status === 403) {
    console.error('[Spotify] createPlaylist forbidden — app may need quota extension')
    throw createError({ statusCode: 403, statusMessage: 'Spotify app needs quota extension approval. Request it in the Spotify Developer Dashboard.' })
  }

  if (!res.ok) {
    const errorBody = await res.text().catch(() => 'unknown')
    console.error('[Spotify] createPlaylist failed:', res.status, errorBody)
    throw createError({ statusCode: 502, statusMessage: `Failed to create Spotify playlist: ${res.status}` })
  }

  const data = await res.json()
  return { id: data.id, url: data.external_urls?.spotify || '' }
}

export async function addTracksToPlaylist(accessToken: string, playlistId: string, trackUris: string[]): Promise<void> {
  // Spotify allows max 100 tracks per request
  for (let i = 0; i < trackUris.length; i += 100) {
    const batch = trackUris.slice(i, i + 100)
    const res = await fetch(`${SPOTIFY_API}/playlists/${playlistId}/tracks`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ uris: batch }),
    })

    if (!res.ok) {
      const errorBody = await res.text().catch(() => 'unknown')
      console.error('[Spotify] addTracksToPlaylist failed:', res.status, errorBody)
      throw createError({ statusCode: 502, statusMessage: `Failed to add tracks to Spotify playlist: ${res.status}` })
    }
  }
}

export async function addToQueue(accessToken: string, trackUri: string): Promise<void> {
  const params = new URLSearchParams({ uri: trackUri })
  const res = await fetch(`${SPOTIFY_API}/me/player/queue?${params}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${accessToken}` },
  })

  if (res.status === 403) {
    throw createError({ statusCode: 403, statusMessage: 'Spotify Premium is required to add tracks to the queue' })
  }

  if (res.status === 404) {
    throw createError({ statusCode: 404, statusMessage: 'No active Spotify playback device found. Start playing on a device first.' })
  }

  if (!res.ok) {
    throw createError({ statusCode: 502, statusMessage: 'Failed to add track to Spotify queue' })
  }
}
