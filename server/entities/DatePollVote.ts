export type DatePollVoteStatus = 'yes' | 'maybe' | 'no'

export interface DatePollVoteData {
  id: string | null
  datePollOptionId: string
  voterEmail: string
  voterName: string | null
  status: DatePollVoteStatus
  token: string | null
  createdAt: Date | string
  updatedAt: Date | string
}

export interface DatePollVoteJSON {
  id?: string | null
  datePollOptionId?: string
  date_poll_option_id?: string
  voterEmail?: string
  voter_email?: string
  voterName?: string | null
  voter_name?: string | null
  status?: DatePollVoteStatus
  token?: string | null
  createdAt?: Date | string
  created_at?: Date | string
  updatedAt?: Date | string
  updated_at?: Date | string
}

export default class DatePollVote {
  id: string | null
  datePollOptionId: string
  voterEmail: string
  voterName: string | null
  status: DatePollVoteStatus
  token: string | null
  createdAt: Date | string
  updatedAt: Date | string

  constructor({ id, datePollOptionId, voterEmail, voterName, status, token, createdAt, updatedAt }: DatePollVoteData) {
    this.id = id || null
    this.datePollOptionId = datePollOptionId
    this.voterEmail = voterEmail
    this.voterName = voterName || null
    this.status = status || 'yes'
    this.token = token || null
    this.createdAt = createdAt || new Date()
    this.updatedAt = updatedAt || new Date()
  }

  static fromJSON(data: DatePollVoteJSON): DatePollVote {
    return new DatePollVote({
      id: data.id ?? null,
      datePollOptionId: (data.datePollOptionId || data.date_poll_option_id)!,
      voterEmail: (data.voterEmail || data.voter_email)!,
      voterName: data.voterName ?? data.voter_name ?? null,
      status: (data.status || 'yes') as DatePollVoteStatus,
      token: data.token ?? null,
      createdAt: data.createdAt || data.created_at || new Date(),
      updatedAt: data.updatedAt || data.updated_at || new Date(),
    })
  }

  toJSON(): DatePollVoteData {
    return {
      id: this.id,
      datePollOptionId: this.datePollOptionId,
      voterEmail: this.voterEmail,
      voterName: this.voterName,
      status: this.status,
      token: this.token,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    }
  }
}
