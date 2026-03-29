export interface AiTokenUsageData {
  id: number | null
  userClerkId: string
  date: Date | string
  tokensUsed: number
  requestCount: number
  createdAt: Date | string
  updatedAt: Date | string
}

export interface AiTokenUsageJSON {
  id?: number | null
  userClerkId?: string
  user_clerk_id?: string
  date?: Date | string
  tokensUsed?: number
  tokens_used?: number
  requestCount?: number
  request_count?: number
  createdAt?: Date | string
  created_at?: Date | string
  updatedAt?: Date | string
  updated_at?: Date | string
}

export default class AiTokenUsage {
  id: number | null
  userClerkId: string
  date: Date
  tokensUsed: number
  requestCount: number
  createdAt: Date | string
  updatedAt: Date | string

  constructor({ id, userClerkId, date, tokensUsed, requestCount, createdAt, updatedAt }: AiTokenUsageData) {
    this.id = id || null
    this.userClerkId = userClerkId
    this.date = new Date(date)
    this.tokensUsed = tokensUsed || 0
    this.requestCount = requestCount || 0
    this.createdAt = createdAt || new Date()
    this.updatedAt = updatedAt || new Date()
  }

  static fromJSON(data: AiTokenUsageJSON): AiTokenUsage {
    return new AiTokenUsage({
      id: data.id ?? null,
      userClerkId: (data.userClerkId || data.user_clerk_id)!,
      date: data.date || new Date(),
      tokensUsed: data.tokensUsed ?? data.tokens_used ?? 0,
      requestCount: data.requestCount ?? data.request_count ?? 0,
      createdAt: data.createdAt || data.created_at || new Date(),
      updatedAt: data.updatedAt || data.updated_at || new Date(),
    })
  }

  toJSON(): AiTokenUsageData {
    return {
      id: this.id,
      userClerkId: this.userClerkId,
      date: this.date,
      tokensUsed: this.tokensUsed,
      requestCount: this.requestCount,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    }
  }
}
