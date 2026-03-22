export interface CategoryPreference {
  inApp: boolean
  email: boolean
}

export interface NotificationPreferenceData {
  id: number | null
  userClerkId: string
  preferences: Record<string, CategoryPreference>
  reminderSchedule: string[]
  digestEnabled: boolean
  createdAt: Date | string
  updatedAt: Date | string
}

export interface NotificationPreferenceJSON {
  id?: number | null
  userClerkId?: string
  user_clerk_id?: string
  preferences?: Record<string, CategoryPreference> | string
  reminderSchedule?: string[] | string
  reminder_schedule?: string[] | string
  digestEnabled?: boolean
  digest_enabled?: boolean
  createdAt?: Date | string
  created_at?: Date | string
  updatedAt?: Date | string
  updated_at?: Date | string
}

function parseJson<T>(value: T | string, fallback: T): T {
  if (typeof value === 'string') {
    try { return JSON.parse(value) } catch { return fallback }
  }
  return value ?? fallback
}

export default class NotificationPreference {
  id: number | null
  userClerkId: string
  preferences: Record<string, CategoryPreference>
  reminderSchedule: string[]
  digestEnabled: boolean
  createdAt: Date | string
  updatedAt: Date | string

  constructor(data: NotificationPreferenceData) {
    this.id = data.id || null
    this.userClerkId = data.userClerkId
    this.preferences = data.preferences || {}
    this.reminderSchedule = data.reminderSchedule || []
    this.digestEnabled = data.digestEnabled ?? false
    this.createdAt = data.createdAt || new Date()
    this.updatedAt = data.updatedAt || new Date()
  }

  static fromJSON(data: NotificationPreferenceJSON): NotificationPreference {
    return new NotificationPreference({
      id: data.id ?? null,
      userClerkId: (data.userClerkId || data.user_clerk_id)!,
      preferences: parseJson(data.preferences, {}) as Record<string, CategoryPreference>,
      reminderSchedule: parseJson(data.reminderSchedule ?? data.reminder_schedule, []) as string[],
      digestEnabled: data.digestEnabled ?? data.digest_enabled ?? false,
      createdAt: data.createdAt || data.created_at || new Date(),
      updatedAt: data.updatedAt || data.updated_at || new Date(),
    })
  }

  toJSON(): NotificationPreferenceData {
    return {
      id: this.id,
      userClerkId: this.userClerkId,
      preferences: this.preferences,
      reminderSchedule: this.reminderSchedule,
      digestEnabled: this.digestEnabled,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    }
  }
}
