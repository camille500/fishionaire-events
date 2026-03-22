export interface SocialWallPostData {
  id: number | null
  eventId: number
  guestEmail: string
  guestName: string | null
  content: string
  imageUrl: string | null
  imageKey: string | null
  status: string
  hearts: number
  createdAt: Date | string
  updatedAt: Date | string
}

export interface SocialWallPostJSON {
  id?: number | null
  eventId?: number
  event_id?: number
  guestEmail?: string
  guest_email?: string
  guestName?: string | null
  guest_name?: string | null
  content?: string
  imageUrl?: string | null
  image_url?: string | null
  imageKey?: string | null
  image_key?: string | null
  status?: string
  hearts?: number
  createdAt?: Date | string
  created_at?: Date | string
  updatedAt?: Date | string
  updated_at?: Date | string
}

export default class SocialWallPost {
  id: number | null
  eventId: number
  guestEmail: string
  guestName: string | null
  content: string
  imageUrl: string | null
  imageKey: string | null
  status: string
  hearts: number
  createdAt: Date | string
  updatedAt: Date | string

  constructor(data: SocialWallPostData) {
    this.id = data.id || null
    this.eventId = data.eventId
    this.guestEmail = data.guestEmail
    this.guestName = data.guestName || null
    this.content = data.content
    this.imageUrl = data.imageUrl || null
    this.imageKey = data.imageKey || null
    this.status = data.status || 'pending'
    this.hearts = data.hearts ?? 0
    this.createdAt = data.createdAt || new Date()
    this.updatedAt = data.updatedAt || new Date()
  }

  static fromJSON(data: SocialWallPostJSON): SocialWallPost {
    return new SocialWallPost({
      id: data.id ?? null,
      eventId: (data.eventId || data.event_id)!,
      guestEmail: (data.guestEmail || data.guest_email)!,
      guestName: data.guestName ?? data.guest_name ?? null,
      content: data.content || '',
      imageUrl: data.imageUrl ?? data.image_url ?? null,
      imageKey: data.imageKey ?? data.image_key ?? null,
      status: data.status || 'pending',
      hearts: data.hearts ?? 0,
      createdAt: data.createdAt || data.created_at || new Date(),
      updatedAt: data.updatedAt || data.updated_at || new Date(),
    })
  }

  toJSON(): SocialWallPostData {
    return {
      id: this.id,
      eventId: this.eventId,
      guestEmail: this.guestEmail,
      guestName: this.guestName,
      content: this.content,
      imageUrl: this.imageUrl,
      imageKey: this.imageKey,
      status: this.status,
      hearts: this.hearts,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    }
  }
}
