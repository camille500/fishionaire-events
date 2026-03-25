import type { H3Event } from 'h3'
import OnboardingController from '../../controllers/onboardingController'

export default defineEventHandler(async (event: H3Event) => {
  const { isAuthenticated, userId } = event.context.auth()

  if (!isAuthenticated) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  return await OnboardingController.resetAll(userId)
})
