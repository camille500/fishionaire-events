import type DatePollVote from './DatePollVote'
import { DatePollVoteJSON } from './DatePollVote'
import DatePollVoteEntity from './DatePollVote'

export interface DatePollOptionData {
  id: string | null
  datePollId: string
  date: Date | string
  startTime: Date | string | null
  endTime: Date | string | null
  sortOrder: number
  createdAt: Date | string
  votes?: DatePollVote[]
}

export interface DatePollOptionJSON {
  id?: string | null
  datePollId?: string
  date_poll_id?: string
  date: Date | string
  startTime?: Date | string | null
  start_time?: Date | string | null
  endTime?: Date | string | null
  end_time?: Date | string | null
  sortOrder?: number
  sort_order?: number
  createdAt?: Date | string
  created_at?: Date | string
  votes?: DatePollVoteJSON[]
}

export default class DatePollOption {
  id: string | null
  datePollId: string
  date: Date | string
  startTime: Date | string | null
  endTime: Date | string | null
  sortOrder: number
  createdAt: Date | string
  votes: DatePollVote[]

  constructor({ id, datePollId, date, startTime, endTime, sortOrder, createdAt, votes }: DatePollOptionData) {
    this.id = id || null
    this.datePollId = datePollId
    this.date = date
    this.startTime = startTime || null
    this.endTime = endTime || null
    this.sortOrder = sortOrder ?? 0
    this.createdAt = createdAt || new Date()
    this.votes = votes || []
  }

  get yesCount(): number {
    return this.votes.filter(v => v.status === 'yes').length
  }

  get maybeCount(): number {
    return this.votes.filter(v => v.status === 'maybe').length
  }

  get noCount(): number {
    return this.votes.filter(v => v.status === 'no').length
  }

  get score(): number {
    return this.yesCount * 2 + this.maybeCount
  }

  static fromJSON(data: DatePollOptionJSON): DatePollOption {
    return new DatePollOption({
      id: data.id ?? null,
      datePollId: (data.datePollId || data.date_poll_id)!,
      date: data.date,
      startTime: data.startTime ?? data.start_time ?? null,
      endTime: data.endTime ?? data.end_time ?? null,
      sortOrder: data.sortOrder ?? data.sort_order ?? 0,
      createdAt: data.createdAt || data.created_at || new Date(),
      votes: (data.votes || []).map(v => DatePollVoteEntity.fromJSON(v)),
    })
  }

  toJSON(): DatePollOptionData {
    return {
      id: this.id,
      datePollId: this.datePollId,
      date: this.date,
      startTime: this.startTime,
      endTime: this.endTime,
      sortOrder: this.sortOrder,
      createdAt: this.createdAt,
      votes: this.votes,
    }
  }
}
