import { PrismaClient } from '#prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

let _prisma: PrismaClient | null = null

export function usePrisma(): PrismaClient {
  if (!_prisma) {
    const config = useRuntimeConfig()
    if (!config.databaseUrl) {
      throw new Error('DATABASE_URL is not configured')
    }
    const adapter = new PrismaPg({ connectionString: config.databaseUrl })
    _prisma = new PrismaClient({ adapter })
  }
  return _prisma
}

export async function disconnectPrisma(): Promise<void> {
  if (_prisma) {
    await _prisma.$disconnect()
    _prisma = null
  }
}
