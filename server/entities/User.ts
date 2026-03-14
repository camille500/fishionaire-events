export default class User {
  constructor({ clerkId, email, firstName, lastName, role, createdAt, updatedAt }) {
    this.clerkId = clerkId
    this.email = email
    this.firstName = firstName || null
    this.lastName = lastName || null
    this.role = role || 'user'
    this.createdAt = createdAt || new Date()
    this.updatedAt = updatedAt || new Date()
  }

  get isAdmin() {
    return this.role === 'admin'
  }

  static fromJSON(data) {
    return new User({
      clerkId: data.clerkId || data.clerk_id,
      email: data.email,
      firstName: data.firstName || data.first_name,
      lastName: data.lastName || data.last_name,
      role: data.role,
      createdAt: data.createdAt || data.created_at,
      updatedAt: data.updatedAt || data.updated_at,
    })
  }

  toJSON() {
    return {
      clerkId: this.clerkId,
      email: this.email,
      firstName: this.firstName,
      lastName: this.lastName,
      role: this.role,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    }
  }
}
