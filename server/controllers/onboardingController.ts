import OnboardingRepository from '../repositories/onboardingRepository'
import type { OnboardingStateData } from '../entities/OnboardingState'

export default class OnboardingController {
  static async getState(clerkId: string) {
    const state = await OnboardingRepository.upsert(clerkId, {})
    return state.toJSON()
  }

  static async updateState(clerkId: string, updates: Partial<OnboardingStateData>) {
    const allowed: Partial<OnboardingStateData> = {}
    if (updates.dashboardTourDone !== undefined) allowed.dashboardTourDone = updates.dashboardTourDone
    if (updates.eventCreationTourDone !== undefined) allowed.eventCreationTourDone = updates.eventCreationTourDone
    if (updates.dismissedTooltips !== undefined) allowed.dismissedTooltips = updates.dismissedTooltips

    const state = await OnboardingRepository.upsert(clerkId, allowed)
    return state.toJSON()
  }

  static async resetAll(clerkId: string) {
    const state = await OnboardingRepository.upsert(clerkId, {
      dashboardTourDone: false,
      eventCreationTourDone: false,
      dismissedTooltips: {},
    })
    return state.toJSON()
  }
}
