export interface SubEventInvite {
  subEventId: number
  plusOnes: number
}

export interface PlusOneInvite {
  id: string | null
  inviteeEmail: string
  inviteeName: string | null
  status: string
  accessToken: string
}

export interface EventInvitationData {
  id: string | null
  eventId: string
  inviteeEmail: string
  inviteeName: string | null
  inviterClerkId: string
  status: string
  plusOnes: number
  accessToken: string
  invitedById: number | null
  invitedByName: string | null
  emailSentAt: Date | string | null
  checkedInAt: Date | string | null
  subEventInvites: SubEventInvite[]
  plusOneInvites: PlusOneInvite[]
  createdAt: Date | string
}

export interface EventInvitationJSON {
  id?: string | null
  eventId?: string
  event_id?: string
  inviteeEmail?: string
  invitee_email?: string
  inviteeName?: string | null
  invitee_name?: string | null
  inviterClerkId?: string
  inviter_clerk_id?: string
  status?: string
  plusOnes?: number
  plus_ones?: number
  accessToken?: string
  access_token?: string
  invitedById?: number | null
  invited_by_id?: number | null
  invitedBy?: { inviteeName?: string | null, invitee_name?: string | null } | null
  invited_by?: { inviteeName?: string | null, invitee_name?: string | null } | null
  emailSentAt?: Date | string | null
  email_sent_at?: Date | string | null
  checkedInAt?: Date | string | null
  checked_in_at?: Date | string | null
  subEventInvites?: SubEventInvite[]
  sub_event_invites?: SubEventInvite[]
  plusOneInvites?: any[]
  plus_one_invites?: any[]
  createdAt?: Date | string
  created_at?: Date | string
}

export default class EventInvitation {
  id: string | null
  eventId: string
  inviteeEmail: string
  inviteeName: string | null
  inviterClerkId: string
  status: string
  plusOnes: number
  accessToken: string
  invitedById: number | null
  invitedByName: string | null
  emailSentAt: Date | string | null
  checkedInAt: Date | string | null
  subEventInvites: SubEventInvite[]
  plusOneInvites: PlusOneInvite[]
  createdAt: Date | string

  constructor({ id, eventId, inviteeEmail, inviteeName, inviterClerkId, status, plusOnes, accessToken, invitedById, invitedByName, emailSentAt, checkedInAt, subEventInvites, plusOneInvites, createdAt }: EventInvitationData) {
    this.id = id || null
    this.eventId = eventId
    this.inviteeEmail = inviteeEmail
    this.inviteeName = inviteeName || null
    this.inviterClerkId = inviterClerkId
    this.status = status || 'pending'
    this.plusOnes = plusOnes || 0
    this.accessToken = accessToken
    this.invitedById = invitedById || null
    this.invitedByName = invitedByName || null
    this.emailSentAt = emailSentAt || null
    this.checkedInAt = checkedInAt || null
    this.subEventInvites = subEventInvites || []
    this.plusOneInvites = plusOneInvites || []
    this.createdAt = createdAt || new Date()
  }

  get isPending(): boolean {
    return this.status === 'pending'
  }

  get isAccepted(): boolean {
    return this.status === 'accepted'
  }

  get isDeclined(): boolean {
    return this.status === 'declined'
  }

  get isCheckedIn(): boolean {
    return this.checkedInAt !== null
  }

  get isPlusOne(): boolean {
    return this.invitedById !== null
  }

  get filledPlusOnes(): number {
    return this.plusOneInvites.length
  }

  get remainingPlusOnes(): number {
    return Math.max(0, this.plusOnes - this.filledPlusOnes)
  }

  static fromJSON(data: EventInvitationJSON): EventInvitation {
    const subEventInvites = data.subEventInvites || data.sub_event_invites || []
    const rawPlusOnes = data.plusOneInvites || data.plus_one_invites || []

    const invitedByData = data.invitedBy || data.invited_by
    const invitedByName = invitedByData?.inviteeName ?? invitedByData?.invitee_name ?? null

    return new EventInvitation({
      id: data.id ?? null,
      eventId: (data.eventId || data.event_id)!,
      inviteeEmail: (data.inviteeEmail || data.invitee_email)!,
      inviteeName: data.inviteeName ?? data.invitee_name ?? null,
      inviterClerkId: (data.inviterClerkId || data.inviter_clerk_id)!,
      status: data.status || 'pending',
      plusOnes: data.plusOnes ?? data.plus_ones ?? 0,
      accessToken: (data.accessToken || data.access_token)!,
      invitedById: data.invitedById ?? data.invited_by_id ?? null,
      invitedByName,
      emailSentAt: data.emailSentAt ?? data.email_sent_at ?? null,
      checkedInAt: data.checkedInAt ?? data.checked_in_at ?? null,
      subEventInvites: subEventInvites.map((s: any) => ({
        subEventId: s.subEventId ?? s.sub_event_id ?? s.subEventId,
        plusOnes: s.plusOnes ?? s.plus_ones ?? 0,
      })),
      plusOneInvites: rawPlusOnes.map((p: any) => ({
        id: p.id ?? null,
        inviteeEmail: p.inviteeEmail || p.invitee_email || '',
        inviteeName: p.inviteeName ?? p.invitee_name ?? null,
        status: p.status || 'pending',
        accessToken: p.accessToken || p.access_token || '',
      })),
      createdAt: data.createdAt || data.created_at || new Date(),
    })
  }

  toJSON(): EventInvitationData {
    return {
      id: this.id,
      eventId: this.eventId,
      inviteeEmail: this.inviteeEmail,
      inviteeName: this.inviteeName,
      inviterClerkId: this.inviterClerkId,
      status: this.status,
      plusOnes: this.plusOnes,
      accessToken: this.accessToken,
      invitedById: this.invitedById,
      invitedByName: this.invitedByName,
      emailSentAt: this.emailSentAt,
      checkedInAt: this.checkedInAt,
      subEventInvites: this.subEventInvites,
      plusOneInvites: this.plusOneInvites,
      createdAt: this.createdAt,
    }
  }
}
