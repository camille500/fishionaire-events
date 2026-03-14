import AiController from '../../controllers/aiController'

export default defineEventHandler(async (event) => {
  const { isAuthenticated } = event.context.auth()

  if (!isAuthenticated) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  const { prompt, tone, language, length, eventType, includeEmojis, refineInstruction, previousText } = await readBody(event)

  const stream = AiController.generateDescriptionStream({
    prompt,
    tone,
    language,
    length,
    eventType,
    includeEmojis,
    refineInstruction,
    previousText,
  })

  const eventStream = createEventStream(event)

  ;(async () => {
    try {
      for await (const chunk of stream) {
        await eventStream.push({ data: chunk })
      }
    } catch (err) {
      await eventStream.push({ event: 'error', data: err.statusMessage || 'An error occurred' })
    } finally {
      await eventStream.close()
    }
  })()

  return eventStream.send()
})
