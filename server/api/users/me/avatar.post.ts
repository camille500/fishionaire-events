import type { H3Event } from 'h3'
import UserController from '../../../controllers/userController'

export default defineEventHandler(async (event: H3Event) => {
  const { isAuthenticated, userId } = event.context.auth()

  if (!isAuthenticated) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  const formData = await readMultipartFormData(event)
  if (!formData || formData.length === 0) {
    throw createError({ statusCode: 400, statusMessage: 'No file uploaded' })
  }

  const file = formData.find((f) => f.name === 'image')
  if (!file) {
    throw createError({ statusCode: 400, statusMessage: 'No image field found' })
  }

  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
  const fileType = file.type || ''
  if (!allowedTypes.includes(fileType)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid file type. Allowed: JPEG, PNG, WebP, GIF' })
  }

  const maxSize = 5 * 1024 * 1024
  if (file.data.length > maxSize) {
    throw createError({ statusCode: 400, statusMessage: 'File too large. Maximum 5MB' })
  }

  return await UserController.uploadAvatar(userId, file.data, fileType)
})
