import type { H3Event } from 'h3'
import LlmSettingsController from '../../../controllers/llmSettingsController'

interface LlmSettingsBody {
  aiTone?: string | null
  aiToneCustom?: string | null
  aiExtraContext?: string | null
}

export default defineEventHandler(async (event: H3Event) => {
  const { isAuthenticated, userId } = event.context.auth()

  if (!isAuthenticated) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  const { aiTone, aiToneCustom, aiExtraContext } = await readBody<LlmSettingsBody>(event)

  return LlmSettingsController.updateAccountSettings(userId, {
    aiTone,
    aiToneCustom,
    aiExtraContext,
  })
})
