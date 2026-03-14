export interface SubEventTemplate {
  title: string
  description?: string | null
  location?: string | null
  [key: string]: unknown
}

export interface EventTemplateData {
  id: string | null
  name: string
  description: string | null
  eventType: string | null
  settings: Record<string, unknown>
  subEventTemplates: SubEventTemplate[]
  isSystem: boolean
  ownerClerkId: string | null
  createdAt: Date | string
  updatedAt: Date | string
}

export interface EventTemplateJSON {
  id?: string | null
  name: string
  description?: string | null
  eventType?: string | null
  event_type?: string | null
  settings?: Record<string, unknown> | string
  subEventTemplates?: SubEventTemplate[] | string
  sub_event_templates?: SubEventTemplate[] | string
  isSystem?: boolean
  is_system?: boolean
  ownerClerkId?: string | null
  owner_clerk_id?: string | null
  createdAt?: Date | string
  created_at?: Date | string
  updatedAt?: Date | string
  updated_at?: Date | string
}

export default class EventTemplate {
  id: string | null
  name: string
  description: string | null
  eventType: string | null
  settings: Record<string, unknown>
  subEventTemplates: SubEventTemplate[]
  isSystem: boolean
  ownerClerkId: string | null
  createdAt: Date | string
  updatedAt: Date | string

  constructor({ id, name, description, eventType, settings, subEventTemplates, isSystem, ownerClerkId, createdAt, updatedAt }: EventTemplateData) {
    this.id = id || null
    this.name = name
    this.description = description || null
    this.eventType = eventType || null
    this.settings = settings || {}
    this.subEventTemplates = subEventTemplates || []
    this.isSystem = isSystem ?? false
    this.ownerClerkId = ownerClerkId || null
    this.createdAt = createdAt || new Date()
    this.updatedAt = updatedAt || new Date()
  }

  static fromJSON(data: EventTemplateJSON): EventTemplate {
    return new EventTemplate({
      id: data.id ?? null,
      name: data.name,
      description: data.description ?? null,
      eventType: data.eventType || data.event_type || null,
      settings: typeof data.settings === 'string' ? JSON.parse(data.settings) : (data.settings || {}),
      subEventTemplates: typeof data.subEventTemplates === 'string'
        ? JSON.parse(data.subEventTemplates)
        : (data.subEventTemplates || (typeof data.sub_event_templates === 'string'
          ? JSON.parse(data.sub_event_templates)
          : data.sub_event_templates) || []),
      isSystem: data.isSystem ?? data.is_system ?? false,
      ownerClerkId: data.ownerClerkId || data.owner_clerk_id || null,
      createdAt: data.createdAt || data.created_at || new Date(),
      updatedAt: data.updatedAt || data.updated_at || new Date(),
    })
  }

  toJSON(): EventTemplateData {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      eventType: this.eventType,
      settings: this.settings,
      subEventTemplates: this.subEventTemplates,
      isSystem: this.isSystem,
      ownerClerkId: this.ownerClerkId,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    }
  }
}
