export interface UserData {
  clerkId: string
  email: string
  firstName: string | null
  lastName: string | null
  role: string
  createdAt: Date | string
  updatedAt: Date | string
}

export interface UserJSON {
  clerkId?: string
  clerk_id?: string
  email: string
  firstName?: string | null
  first_name?: string | null
  lastName?: string | null
  last_name?: string | null
  role?: string
  createdAt?: Date | string
  created_at?: Date | string
  updatedAt?: Date | string
  updated_at?: Date | string
}

export default class User {
  clerkId: string
  email: string
  firstName: string | null
  lastName: string | null
  role: string
  createdAt: Date | string
  updatedAt: Date | string

  constructor({ clerkId, email, firstName, lastName, role, createdAt, updatedAt }: UserData) {
    this.clerkId = clerkId
    this.email = email
    this.firstName = firstName || null
    this.lastName = lastName || null
    this.role = role || 'user'
    this.createdAt = createdAt || new Date()
    this.updatedAt = updatedAt || new Date()
  }

  get isAdmin(): boolean {
    return this.role === 'admin'
  }

  static fromJSON(data: UserJSON): User {
    return new User({
      clerkId: (data.clerkId || data.clerk_id)!,
      email: data.email,
      firstName: data.firstName || data.first_name || null,
      lastName: data.lastName || data.last_name || null,
      role: data.role || 'user',
      createdAt: data.createdAt || data.created_at || new Date(),
      updatedAt: data.updatedAt || data.updated_at || new Date(),
    })
  }

  toJSON(): UserData {
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
