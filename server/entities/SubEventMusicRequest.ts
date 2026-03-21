export type MusicRequestStatus = 'pending' | 'approved' | 'rejected' | 'queued'

export interface SubEventMusicRequestData {
  id: string | null
  subEventId: string
  guestEmail: string
  songTitle: string
  artist: string | null
  votes: number
  status: MusicRequestStatus
  spotifyTrackId: string | null
  spotifyUri: string | null
  albumArtUrl: string | null
  previewUrl: string | null
  durationMs: number | null
  playlistId: number | null
  createdAt: Date | string
}

export interface SubEventMusicRequestJSON {
  id?: string | null
  subEventId?: string
  sub_event_id?: string
  guestEmail?: string
  guest_email?: string
  songTitle?: string
  song_title?: string
  artist?: string | null
  votes?: number
  status?: MusicRequestStatus
  spotifyTrackId?: string | null
  spotify_track_id?: string | null
  spotifyUri?: string | null
  spotify_uri?: string | null
  albumArtUrl?: string | null
  album_art_url?: string | null
  previewUrl?: string | null
  preview_url?: string | null
  durationMs?: number | null
  duration_ms?: number | null
  playlistId?: number | null
  playlist_id?: number | null
  createdAt?: Date | string
  created_at?: Date | string
}

export default class SubEventMusicRequest {
  id: string | null
  subEventId: string
  guestEmail: string
  songTitle: string
  artist: string | null
  votes: number
  status: MusicRequestStatus
  spotifyTrackId: string | null
  spotifyUri: string | null
  albumArtUrl: string | null
  previewUrl: string | null
  durationMs: number | null
  playlistId: number | null
  createdAt: Date | string

  constructor(data: SubEventMusicRequestData) {
    this.id = data.id || null
    this.subEventId = data.subEventId
    this.guestEmail = data.guestEmail
    this.songTitle = data.songTitle
    this.artist = data.artist || null
    this.votes = data.votes ?? 1
    this.status = data.status || 'pending'
    this.spotifyTrackId = data.spotifyTrackId || null
    this.spotifyUri = data.spotifyUri || null
    this.albumArtUrl = data.albumArtUrl || null
    this.previewUrl = data.previewUrl || null
    this.durationMs = data.durationMs || null
    this.playlistId = data.playlistId || null
    this.createdAt = data.createdAt || new Date()
  }

  static fromJSON(data: SubEventMusicRequestJSON): SubEventMusicRequest {
    return new SubEventMusicRequest({
      id: data.id ?? null,
      subEventId: (data.subEventId || data.sub_event_id)!,
      guestEmail: (data.guestEmail || data.guest_email)!,
      songTitle: (data.songTitle || data.song_title)!,
      artist: data.artist ?? null,
      votes: data.votes ?? 1,
      status: data.status || 'pending',
      spotifyTrackId: data.spotifyTrackId ?? data.spotify_track_id ?? null,
      spotifyUri: data.spotifyUri ?? data.spotify_uri ?? null,
      albumArtUrl: data.albumArtUrl ?? data.album_art_url ?? null,
      previewUrl: data.previewUrl ?? data.preview_url ?? null,
      durationMs: data.durationMs ?? data.duration_ms ?? null,
      playlistId: data.playlistId ?? data.playlist_id ?? null,
      createdAt: data.createdAt || data.created_at || new Date(),
    })
  }

  toJSON(): SubEventMusicRequestData {
    return {
      id: this.id,
      subEventId: this.subEventId,
      guestEmail: this.guestEmail,
      songTitle: this.songTitle,
      artist: this.artist,
      votes: this.votes,
      status: this.status,
      spotifyTrackId: this.spotifyTrackId,
      spotifyUri: this.spotifyUri,
      albumArtUrl: this.albumArtUrl,
      previewUrl: this.previewUrl,
      durationMs: this.durationMs,
      playlistId: this.playlistId,
      createdAt: this.createdAt,
    }
  }
}
