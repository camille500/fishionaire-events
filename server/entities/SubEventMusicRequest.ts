export interface SubEventMusicRequestData {
  id: string | null
  subEventId: string
  guestEmail: string
  songTitle: string
  artist: string | null
  votes: number
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
  createdAt: Date | string

  constructor(data: SubEventMusicRequestData) {
    this.id = data.id || null
    this.subEventId = data.subEventId
    this.guestEmail = data.guestEmail
    this.songTitle = data.songTitle
    this.artist = data.artist || null
    this.votes = data.votes ?? 1
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
      createdAt: this.createdAt,
    }
  }
}
