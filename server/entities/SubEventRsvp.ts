export interface SubEventRsvpData {
  id: string | null
  subEventId: string
  guestEmail: string
  status: string
  createdAt: Date | string
  updatedAt: Date | string
}

export interface SubEventRsvpJSON {
  id?: string | null
  subEventId?: string
  sub_event_id?: string
  guestEmail?: string
  guest_email?: string
  status?: string
  createdAt?: Date | string
  created_at?: Date | string
  updatedAt?: Date | string
  updated_at?: Date | string
}

export default class SubEventRsvp {
  id: string | null
  subEventId: string
  guestEmail: string
  status: string
  createdAt: Date | string
  updatedAt: Date | string

  constructor({ id, subEventId, guestEmail, status, createdAt, updatedAt }: SubEventRsvpData) {
    this.id = id || null
    this.subEventId = subEventId
    this.guestEmail = guestEmail
    this.status = status || 'pending'
    this.createdAt = createdAt || new Date()
    this.updatedAt = updatedAt || new Date()
  }

  static fromJSON(data: SubEventRsvpJSON): SubEventRsvp {
    return new SubEventRsvp({
      id: data.id ?? null,
      subEventId: (data.subEventId || data.sub_event_id)!,
      guestEmail: (data.guestEmail || data.guest_email)!,
      status: data.status || 'pending',
      createdAt: data.createdAt || data.created_at || new Date(),
      updatedAt: data.updatedAt || data.updated_at || new Date(),
    })
  }

  toJSON(): SubEventRsvpData {
    return {
      id: this.id,
      subEventId: this.subEventId,
      guestEmail: this.guestEmail,
      status: this.status,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    }
  }
}
