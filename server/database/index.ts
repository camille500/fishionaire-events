import { PrismaClient } from '#prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

let _prisma: PrismaClient | null = null

export function usePrisma(): PrismaClient {
  if (!_prisma) {
    const config = useRuntimeConfig()
    const adapter = new PrismaPg({ connectionString: config.databaseUrl })
    _prisma = new PrismaClient({ adapter })
  }
  return _prisma
}
