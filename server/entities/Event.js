import { getFeaturesForTier } from '../utils/tierFeatures.js'

export default class Event {
  constructor({ id, title, description, eventType, eventDate, eventEndDate, location, maxGuests, isPrivate, tier, features, coverImageUrl, coverImageKey, ownerClerkId, archivedAt, createdAt, updatedAt }) {
    this.id = id || null
    this.title = title
    this.description = description || null
    this.eventType = eventType || null
    this.eventDate = eventDate || null
    this.eventEndDate = eventEndDate || null
    this.location = location || null
    this.maxGuests = maxGuests || null
    this.isPrivate = isPrivate ?? true
    this.tier = tier || 'free'
    this.features = { ...getFeaturesForTier(this.tier), ...(features || {}) }
    this.coverImageUrl = coverImageUrl || null
    this.coverImageKey = coverImageKey || null
    this.ownerClerkId = ownerClerkId
    this.archivedAt = archivedAt || null
    this.createdAt = createdAt || new Date()
    this.updatedAt = updatedAt || new Date()
  }

  static fromJSON(data) {
    return new Event({
      id: data.id,
      title: data.title,
      description: data.description,
      eventType: data.eventType || data.event_type,
      eventDate: data.eventDate || data.event_date,
      eventEndDate: data.eventEndDate || data.event_end_date,
      location: data.location,
      maxGuests: data.maxGuests || data.max_guests,
      isPrivate: data.isPrivate ?? data.is_private ?? true,
      tier: data.tier,
      features: data.features,
      coverImageUrl: data.coverImageUrl || data.cover_image_url,
      coverImageKey: data.coverImageKey || data.cover_image_key,
      ownerClerkId: data.ownerClerkId || data.owner_clerk_id,
      archivedAt: data.archivedAt || data.archived_at || null,
      createdAt: data.createdAt || data.created_at,
      updatedAt: data.updatedAt || data.updated_at,
    })
  }

  toJSON() {
    return {
      id: this.id,
      title: this.title,
      description: this.description,
      eventType: this.eventType,
      eventDate: this.eventDate,
      eventEndDate: this.eventEndDate,
      location: this.location,
      maxGuests: this.maxGuests,
      isPrivate: this.isPrivate,
      tier: this.tier,
      features: this.features,
      coverImageUrl: this.coverImageUrl,
      coverImageKey: this.coverImageKey,
      ownerClerkId: this.ownerClerkId,
      archivedAt: this.archivedAt,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    }
  }
}
