export interface GalleryPhotoData {
  id: number | null
  eventId: number
  imageUrl: string
  imageKey: string
  caption: string | null
  uploaderEmail: string | null
  uploaderName: string | null
  uploadedBy: string
  sortOrder: number
  createdAt: Date | string
}

export interface GalleryPhotoJSON {
  id?: number | null
  eventId?: number
  event_id?: number
  imageUrl?: string
  image_url?: string
  imageKey?: string
  image_key?: string
  caption?: string | null
  uploaderEmail?: string | null
  uploader_email?: string | null
  uploaderName?: string | null
  uploader_name?: string | null
  uploadedBy?: string
  uploaded_by?: string
  sortOrder?: number
  sort_order?: number
  createdAt?: Date | string
  created_at?: Date | string
}

export default class GalleryPhoto {
  id: number | null
  eventId: number
  imageUrl: string
  imageKey: string
  caption: string | null
  uploaderEmail: string | null
  uploaderName: string | null
  uploadedBy: string
  sortOrder: number
  createdAt: Date | string

  constructor(data: GalleryPhotoData) {
    this.id = data.id || null
    this.eventId = data.eventId
    this.imageUrl = data.imageUrl
    this.imageKey = data.imageKey
    this.caption = data.caption || null
    this.uploaderEmail = data.uploaderEmail || null
    this.uploaderName = data.uploaderName || null
    this.uploadedBy = data.uploadedBy || 'organizer'
    this.sortOrder = data.sortOrder ?? 0
    this.createdAt = data.createdAt || new Date()
  }

  static fromJSON(data: GalleryPhotoJSON): GalleryPhoto {
    return new GalleryPhoto({
      id: data.id ?? null,
      eventId: (data.eventId || data.event_id)!,
      imageUrl: (data.imageUrl || data.image_url)!,
      imageKey: (data.imageKey || data.image_key)!,
      caption: data.caption ?? null,
      uploaderEmail: data.uploaderEmail ?? data.uploader_email ?? null,
      uploaderName: data.uploaderName ?? data.uploader_name ?? null,
      uploadedBy: data.uploadedBy || data.uploaded_by || 'organizer',
      sortOrder: data.sortOrder ?? data.sort_order ?? 0,
      createdAt: data.createdAt || data.created_at || new Date(),
    })
  }

  toJSON(): GalleryPhotoData {
    return {
      id: this.id,
      eventId: this.eventId,
      imageUrl: this.imageUrl,
      imageKey: this.imageKey,
      caption: this.caption,
      uploaderEmail: this.uploaderEmail,
      uploaderName: this.uploaderName,
      uploadedBy: this.uploadedBy,
      sortOrder: this.sortOrder,
      createdAt: this.createdAt,
    }
  }
}
