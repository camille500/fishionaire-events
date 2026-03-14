export interface EventInvitationData {
  id: string | null
  eventId: string
  inviteeEmail: string
  inviterClerkId: string
  status: string
  createdAt: Date | string
}

export interface EventInvitationJSON {
  id?: string | null
  eventId?: string
  event_id?: string
  inviteeEmail?: string
  invitee_email?: string
  inviterClerkId?: string
  inviter_clerk_id?: string
  status?: string
  createdAt?: Date | string
  created_at?: Date | string
}

export default class EventInvitation {
  id: string | null
  eventId: string
  inviteeEmail: string
  inviterClerkId: string
  status: string
  createdAt: Date | string

  constructor({ id, eventId, inviteeEmail, inviterClerkId, status, createdAt }: EventInvitationData) {
    this.id = id || null
    this.eventId = eventId
    this.inviteeEmail = inviteeEmail
    this.inviterClerkId = inviterClerkId
    this.status = status || 'pending'
    this.createdAt = createdAt || new Date()
  }

  get isPending(): boolean {
    return this.status === 'pending'
  }

  static fromJSON(data: EventInvitationJSON): EventInvitation {
    return new EventInvitation({
      id: data.id ?? null,
      eventId: (data.eventId || data.event_id)!,
      inviteeEmail: (data.inviteeEmail || data.invitee_email)!,
      inviterClerkId: (data.inviterClerkId || data.inviter_clerk_id)!,
      status: data.status || 'pending',
      createdAt: data.createdAt || data.created_at || new Date(),
    })
  }

  toJSON(): EventInvitationData {
    return {
      id: this.id,
      eventId: this.eventId,
      inviteeEmail: this.inviteeEmail,
      inviterClerkId: this.inviterClerkId,
      status: this.status,
      createdAt: this.createdAt,
    }
  }
}
