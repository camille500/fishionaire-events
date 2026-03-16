import UserRepository from '../repositories/userRepository'
import EventRepository from '../repositories/eventRepository'

export interface LlmSettingsData {
  aiTone: string | null
  aiToneCustom: string | null
  aiExtraContext: string | null
}

export interface ResolvedLlmSettings {
  tone: string
  toneCustom: string | null
  extraContext: string | null
}

export default class LlmSettingsController {
  static async getAccountSettings(clerkId: string): Promise<LlmSettingsData> {
    const user = await UserRepository.findByClerkId(clerkId)
    if (!user) {
      throw createError({ statusCode: 404, statusMessage: 'User not found' })
    }
    return {
      aiTone: user.aiTone,
      aiToneCustom: user.aiToneCustom,
      aiExtraContext: user.aiExtraContext,
    }
  }

  static async updateAccountSettings(clerkId: string, settings: Partial<LlmSettingsData>): Promise<LlmSettingsData> {
    const user = await UserRepository.updateLlmSettings(clerkId, {
      aiTone: settings.aiTone,
      aiToneCustom: settings.aiToneCustom,
      aiExtraContext: settings.aiExtraContext,
    })
    return {
      aiTone: user.aiTone,
      aiToneCustom: user.aiToneCustom,
      aiExtraContext: user.aiExtraContext,
    }
  }

  static async getEventSettings(eventId: string, clerkId: string): Promise<LlmSettingsData> {
    const event = await EventRepository.findById(eventId)
    if (!event) {
      throw createError({ statusCode: 404, statusMessage: 'Event not found' })
    }
    if (event.ownerClerkId !== clerkId) {
      throw createError({ statusCode: 403, statusMessage: 'Forbidden' })
    }
    return {
      aiTone: event.aiTone,
      aiToneCustom: event.aiToneCustom,
      aiExtraContext: event.aiExtraContext,
    }
  }

  static async updateEventSettings(eventId: string, clerkId: string, settings: Partial<LlmSettingsData>): Promise<LlmSettingsData> {
    const event = await EventRepository.findById(eventId)
    if (!event) {
      throw createError({ statusCode: 404, statusMessage: 'Event not found' })
    }
    if (event.ownerClerkId !== clerkId) {
      throw createError({ statusCode: 403, statusMessage: 'Forbidden' })
    }

    event.aiTone = settings.aiTone ?? event.aiTone
    event.aiToneCustom = settings.aiToneCustom ?? event.aiToneCustom
    event.aiExtraContext = settings.aiExtraContext ?? event.aiExtraContext

    const updated = await EventRepository.update(event)
    return {
      aiTone: updated.aiTone,
      aiToneCustom: updated.aiToneCustom,
      aiExtraContext: updated.aiExtraContext,
    }
  }

  static async resolveSettings(clerkId: string, eventId?: string): Promise<ResolvedLlmSettings> {
    const user = await UserRepository.findByClerkId(clerkId)
    const accountTone = user?.aiTone ?? null
    const accountToneCustom = user?.aiToneCustom ?? null
    const accountExtraContext = user?.aiExtraContext ?? null

    let eventTone: string | null = null
    let eventToneCustom: string | null = null
    let eventExtraContext: string | null = null

    if (eventId) {
      const event = await EventRepository.findById(eventId)
      if (event) {
        eventTone = event.aiTone
        eventToneCustom = event.aiToneCustom
        eventExtraContext = event.aiExtraContext
      }
    }

    return {
      tone: eventTone ?? accountTone ?? 'vriendelijk',
      toneCustom: eventToneCustom ?? accountToneCustom ?? null,
      extraContext: eventExtraContext ?? accountExtraContext ?? null,
    }
  }
}
