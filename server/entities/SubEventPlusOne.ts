export interface SubEventPlusOneData {
  id: string | null
  subEventId: string
  guestEmail: string
  plusOneName: string
  status: string
  createdAt: Date | string
}

export interface SubEventPlusOneJSON {
  id?: string | null
  subEventId?: string
  sub_event_id?: string
  guestEmail?: string
  guest_email?: string
  plusOneName?: string
  plus_one_name?: string
  status?: string
  createdAt?: Date | string
  created_at?: Date | string
}

export default class SubEventPlusOne {
  id: string | null
  subEventId: string
  guestEmail: string
  plusOneName: string
  status: string
  createdAt: Date | string

  constructor(data: SubEventPlusOneData) {
    this.id = data.id || null
    this.subEventId = data.subEventId
    this.guestEmail = data.guestEmail
    this.plusOneName = data.plusOneName
    this.status = data.status || 'pending'
    this.createdAt = data.createdAt || new Date()
  }

  static fromJSON(data: SubEventPlusOneJSON): SubEventPlusOne {
    return new SubEventPlusOne({
      id: data.id ?? null,
      subEventId: (data.subEventId || data.sub_event_id)!,
      guestEmail: (data.guestEmail || data.guest_email)!,
      plusOneName: (data.plusOneName || data.plus_one_name)!,
      status: data.status || 'pending',
      createdAt: data.createdAt || data.created_at || new Date(),
    })
  }

  toJSON(): SubEventPlusOneData {
    return {
      id: this.id,
      subEventId: this.subEventId,
      guestEmail: this.guestEmail,
      plusOneName: this.plusOneName,
      status: this.status,
      createdAt: this.createdAt,
    }
  }
}
