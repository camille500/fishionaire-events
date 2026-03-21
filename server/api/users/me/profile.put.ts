import type { H3Event } from 'h3'
import UserController from '../../../controllers/userController'

export default defineEventHandler(async (event: H3Event) => {
  const { isAuthenticated, userId } = event.context.auth()

  if (!isAuthenticated) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  const body = await readBody(event)

  return await UserController.updateProfile(userId, {
    displayName: body.displayName,
    bio: body.bio,
    website: body.website,
    socialInstagram: body.socialInstagram,
    socialTwitter: body.socialTwitter,
    socialLinkedin: body.socialLinkedin,
    profileVisible: body.profileVisible,
  })
})
