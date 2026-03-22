import { usePrisma } from '~/server/database'

export default defineEventHandler(async () => {
  try {
    const prisma = usePrisma()
    await prisma.$queryRaw`SELECT 1`
    return { status: 'ok', timestamp: Date.now() }
  } catch {
    throw createError({ statusCode: 503, statusMessage: 'Service unavailable' })
  }
})
