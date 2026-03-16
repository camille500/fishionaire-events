import type { H3Event } from 'h3'
import AiController from '../../controllers/aiController'

interface GenerateDescriptionBody {
  prompt: string
  tone: string
  language: string
  length: string
  eventType: string
  includeEmojis: boolean
  refineInstruction?: string
  previousText?: string
  eventId?: string
}

export default defineEventHandler(async (event: H3Event) => {
  const { isAuthenticated, userId } = event.context.auth()

  if (!isAuthenticated) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  const { prompt, tone, language, length, eventType, includeEmojis, refineInstruction, previousText, eventId } = await readBody<GenerateDescriptionBody>(event)

  const stream = AiController.generateDescriptionStream({
    prompt,
    tone,
    language,
    length,
    eventType,
    includeEmojis,
    refineInstruction,
    previousText,
    clerkId: userId,
    eventId,
  })

  const eventStream = createEventStream(event)

  ;(async () => {
    try {
      for await (const chunk of stream) {
        await eventStream.push({ data: chunk })
      }
    } catch (err: unknown) {
      await eventStream.push({ event: 'error', data: (err as { statusMessage?: string }).statusMessage || 'An error occurred' })
    } finally {
      await eventStream.close()
    }
  })()

  return eventStream.send()
})
