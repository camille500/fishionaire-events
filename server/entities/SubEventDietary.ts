export interface SubEventDietaryData {
  id: string | null
  subEventId: string
  guestEmail: string
  guestName: string | null
  restrictions: string
  notes: string | null
  createdAt: Date | string
  updatedAt: Date | string
}

export interface SubEventDietaryJSON {
  id?: string | null
  subEventId?: string
  sub_event_id?: string
  guestEmail?: string
  guest_email?: string
  guestName?: string | null
  guest_name?: string | null
  restrictions?: string
  notes?: string | null
  createdAt?: Date | string
  created_at?: Date | string
  updatedAt?: Date | string
  updated_at?: Date | string
}

export default class SubEventDietary {
  id: string | null
  subEventId: string
  guestEmail: string
  guestName: string | null
  restrictions: string
  notes: string | null
  createdAt: Date | string
  updatedAt: Date | string

  constructor(data: SubEventDietaryData) {
    this.id = data.id || null
    this.subEventId = data.subEventId
    this.guestEmail = data.guestEmail
    this.guestName = data.guestName || null
    this.restrictions = data.restrictions
    this.notes = data.notes || null
    this.createdAt = data.createdAt || new Date()
    this.updatedAt = data.updatedAt || new Date()
  }

  static fromJSON(data: SubEventDietaryJSON): SubEventDietary {
    return new SubEventDietary({
      id: data.id ?? null,
      subEventId: (data.subEventId || data.sub_event_id)!,
      guestEmail: (data.guestEmail || data.guest_email)!,
      guestName: data.guestName ?? data.guest_name ?? null,
      restrictions: data.restrictions || '',
      notes: data.notes ?? null,
      createdAt: data.createdAt || data.created_at || new Date(),
      updatedAt: data.updatedAt || data.updated_at || new Date(),
    })
  }

  toJSON(): SubEventDietaryData {
    return {
      id: this.id,
      subEventId: this.subEventId,
      guestEmail: this.guestEmail,
      guestName: this.guestName,
      restrictions: this.restrictions,
      notes: this.notes,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    }
  }
}
