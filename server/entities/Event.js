import { getFeaturesForTier } from '../utils/tierFeatures.js'

export default class Event {
  constructor({ id, title, description, tier, features, ownerClerkId, createdAt, updatedAt }) {
    this.id = id || null
    this.title = title
    this.description = description || null
    this.tier = tier || 'free'
    this.features = { ...getFeaturesForTier(this.tier), ...(features || {}) }
    this.ownerClerkId = ownerClerkId
    this.createdAt = createdAt || new Date()
    this.updatedAt = updatedAt || new Date()
  }

  static fromJSON(data) {
    return new Event({
      id: data.id,
      title: data.title,
      description: data.description,
      tier: data.tier,
      features: data.features,
      ownerClerkId: data.ownerClerkId || data.owner_clerk_id,
      createdAt: data.createdAt || data.created_at,
      updatedAt: data.updatedAt || data.updated_at,
    })
  }

  toJSON() {
    return {
      id: this.id,
      title: this.title,
      description: this.description,
      tier: this.tier,
      features: this.features,
      ownerClerkId: this.ownerClerkId,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    }
  }
}
