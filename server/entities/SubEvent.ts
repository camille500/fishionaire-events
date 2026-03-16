export type SubEventTypeValue = 'generic' | 'ceremony' | 'dinner' | 'party' | 'activity'

export interface SubEventData {
  id: string | null
  eventId: string
  title: string
  description: string | null
  type: SubEventTypeValue
  richContent: string | null
  coverImageUrl: string | null
  coverImageKey: string | null
  capacity: number | null
  dressCode: string | null
  typeConfig: Record<string, unknown>
  startTime: string | Date | null
  endTime: string | Date | null
  location: string | null
  sortOrder: number
  createdAt: Date | string
  updatedAt: Date | string
}

export interface SubEventJSON {
  id?: string | null
  eventId?: string
  event_id?: string
  title: string
  description?: string | null
  type?: SubEventTypeValue | string
  richContent?: string | null
  rich_content?: string | null
  coverImageUrl?: string | null
  cover_image_url?: string | null
  coverImageKey?: string | null
  cover_image_key?: string | null
  capacity?: number | null
  dressCode?: string | null
  dress_code?: string | null
  typeConfig?: Record<string, unknown> | string
  type_config?: Record<string, unknown> | string
  startTime?: string | Date | null
  start_time?: string | Date | null
  endTime?: string | Date | null
  end_time?: string | Date | null
  location?: string | null
  sortOrder?: number
  sort_order?: number
  createdAt?: Date | string
  created_at?: Date | string
  updatedAt?: Date | string
  updated_at?: Date | string
}

function parseTypeConfig(raw: Record<string, unknown> | string | undefined | null): Record<string, unknown> {
  if (!raw) return {}
  if (typeof raw === 'string') {
    try { return JSON.parse(raw) } catch { return {} }
  }
  return raw
}

export default class SubEvent {
  id: string | null
  eventId: string
  title: string
  description: string | null
  type: SubEventTypeValue
  richContent: string | null
  coverImageUrl: string | null
  coverImageKey: string | null
  capacity: number | null
  dressCode: string | null
  typeConfig: Record<string, unknown>
  startTime: string | Date | null
  endTime: string | Date | null
  location: string | null
  sortOrder: number
  createdAt: Date | string
  updatedAt: Date | string

  constructor(data: SubEventData) {
    this.id = data.id || null
    this.eventId = data.eventId
    this.title = data.title
    this.description = data.description || null
    this.type = data.type || 'generic'
    this.richContent = data.richContent || null
    this.coverImageUrl = data.coverImageUrl || null
    this.coverImageKey = data.coverImageKey || null
    this.capacity = data.capacity ?? null
    this.dressCode = data.dressCode || null
    this.typeConfig = data.typeConfig || {}
    this.startTime = data.startTime || null
    this.endTime = data.endTime || null
    this.location = data.location || null
    this.sortOrder = data.sortOrder ?? 0
    this.createdAt = data.createdAt || new Date()
    this.updatedAt = data.updatedAt || new Date()
  }

  static fromJSON(data: SubEventJSON): SubEvent {
    return new SubEvent({
      id: data.id ?? null,
      eventId: (data.eventId || data.event_id)!,
      title: data.title,
      description: data.description ?? null,
      type: (data.type as SubEventTypeValue) || 'generic',
      richContent: data.richContent ?? data.rich_content ?? null,
      coverImageUrl: data.coverImageUrl ?? data.cover_image_url ?? null,
      coverImageKey: data.coverImageKey ?? data.cover_image_key ?? null,
      capacity: data.capacity ?? null,
      dressCode: data.dressCode ?? data.dress_code ?? null,
      typeConfig: parseTypeConfig(data.typeConfig ?? data.type_config),
      startTime: data.startTime || data.start_time || null,
      endTime: data.endTime || data.end_time || null,
      location: data.location ?? null,
      sortOrder: data.sortOrder ?? data.sort_order ?? 0,
      createdAt: data.createdAt || data.created_at || new Date(),
      updatedAt: data.updatedAt || data.updated_at || new Date(),
    })
  }

  toJSON(): SubEventData {
    return {
      id: this.id,
      eventId: this.eventId,
      title: this.title,
      description: this.description,
      type: this.type,
      richContent: this.richContent,
      coverImageUrl: this.coverImageUrl,
      coverImageKey: this.coverImageKey,
      capacity: this.capacity,
      dressCode: this.dressCode,
      typeConfig: this.typeConfig,
      startTime: this.startTime,
      endTime: this.endTime,
      location: this.location,
      sortOrder: this.sortOrder,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    }
  }
}
