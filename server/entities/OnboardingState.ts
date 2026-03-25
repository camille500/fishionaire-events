export interface OnboardingStateData {
  id: number | null
  userClerkId: string
  dashboardTourDone: boolean
  eventCreationTourDone: boolean
  dismissedTooltips: Record<string, boolean>
  updatedAt: Date | string
}

export interface OnboardingStateJSON {
  id?: number | null
  userClerkId?: string
  user_clerk_id?: string
  dashboardTourDone?: boolean
  dashboard_tour_done?: boolean
  eventCreationTourDone?: boolean
  event_creation_tour_done?: boolean
  dismissedTooltips?: Record<string, boolean> | string
  dismissed_tooltips?: Record<string, boolean> | string
  updatedAt?: Date | string
  updated_at?: Date | string
}

function parseJson<T>(value: T | string, fallback: T): T {
  if (typeof value === 'string') {
    try { return JSON.parse(value) } catch { return fallback }
  }
  return value ?? fallback
}

export default class OnboardingState {
  id: number | null
  userClerkId: string
  dashboardTourDone: boolean
  eventCreationTourDone: boolean
  dismissedTooltips: Record<string, boolean>
  updatedAt: Date | string

  constructor(data: OnboardingStateData) {
    this.id = data.id || null
    this.userClerkId = data.userClerkId
    this.dashboardTourDone = data.dashboardTourDone ?? false
    this.eventCreationTourDone = data.eventCreationTourDone ?? false
    this.dismissedTooltips = data.dismissedTooltips || {}
    this.updatedAt = data.updatedAt || new Date()
  }

  static fromJSON(data: OnboardingStateJSON): OnboardingState {
    return new OnboardingState({
      id: data.id ?? null,
      userClerkId: (data.userClerkId || data.user_clerk_id)!,
      dashboardTourDone: data.dashboardTourDone ?? data.dashboard_tour_done ?? false,
      eventCreationTourDone: data.eventCreationTourDone ?? data.event_creation_tour_done ?? false,
      dismissedTooltips: parseJson(data.dismissedTooltips ?? data.dismissed_tooltips, {}) as Record<string, boolean>,
      updatedAt: data.updatedAt || data.updated_at || new Date(),
    })
  }

  toJSON(): OnboardingStateData {
    return {
      id: this.id,
      userClerkId: this.userClerkId,
      dashboardTourDone: this.dashboardTourDone,
      eventCreationTourDone: this.eventCreationTourDone,
      dismissedTooltips: this.dismissedTooltips,
      updatedAt: this.updatedAt,
    }
  }
}
