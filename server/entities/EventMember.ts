export interface EventMemberUser {
  email: string
  firstName: string | null
  lastName: string | null
}

export interface EventMemberData {
  id: string | null
  eventId: string
  userClerkId: string
  role: string
  invitedEmail: string | null
  createdAt: Date | string
  user: EventMemberUser | null
}

export interface EventMemberJSON {
  id?: string | null
  eventId?: string
  event_id?: string
  userClerkId?: string
  user_clerk_id?: string
  role?: string
  invitedEmail?: string | null
  invited_email?: string | null
  createdAt?: Date | string
  created_at?: Date | string
  user?: EventMemberUser | null
}

export default class EventMember {
  id: string | null
  eventId: string
  userClerkId: string
  role: string
  invitedEmail: string | null
  createdAt: Date | string
  user: EventMemberUser | null

  constructor({ id, eventId, userClerkId, role, invitedEmail, createdAt, user }: EventMemberData) {
    this.id = id || null
    this.eventId = eventId
    this.userClerkId = userClerkId
    this.role = role || 'guest'
    this.invitedEmail = invitedEmail || null
    this.createdAt = createdAt || new Date()
    this.user = user || null
  }

  static fromJSON(data: EventMemberJSON): EventMember {
    return new EventMember({
      id: data.id ?? null,
      eventId: (data.eventId || data.event_id)!,
      userClerkId: (data.userClerkId || data.user_clerk_id)!,
      role: data.role || 'guest',
      invitedEmail: data.invitedEmail || data.invited_email || null,
      createdAt: data.createdAt || data.created_at || new Date(),
      user: data.user || null,
    })
  }

  toJSON(): EventMemberData {
    return {
      id: this.id,
      eventId: this.eventId,
      userClerkId: this.userClerkId,
      role: this.role,
      invitedEmail: this.invitedEmail,
      createdAt: this.createdAt,
      user: this.user ? {
        email: this.user.email,
        firstName: this.user.firstName,
        lastName: this.user.lastName,
      } : null,
    }
  }

  get isOwner(): boolean {
    return this.role === 'owner'
  }

  get isCoOrganizer(): boolean {
    return this.role === 'co_organizer'
  }

  get canEdit(): boolean {
    return this.role === 'owner' || this.role === 'co_organizer'
  }
}
