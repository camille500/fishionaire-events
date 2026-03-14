export default class EventTemplate {
  constructor({ id, name, description, eventType, settings, subEventTemplates, isSystem, ownerClerkId, createdAt, updatedAt }) {
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

  static fromJSON(data) {
    return new EventTemplate({
      id: data.id,
      name: data.name,
      description: data.description,
      eventType: data.eventType || data.event_type,
      settings: typeof data.settings === 'string' ? JSON.parse(data.settings) : data.settings,
      subEventTemplates: typeof data.subEventTemplates === 'string'
        ? JSON.parse(data.subEventTemplates)
        : (data.subEventTemplates || data.sub_event_templates || []),
      isSystem: data.isSystem ?? data.is_system ?? false,
      ownerClerkId: data.ownerClerkId || data.owner_clerk_id,
      createdAt: data.createdAt || data.created_at,
      updatedAt: data.updatedAt || data.updated_at,
    })
  }

  toJSON() {
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
