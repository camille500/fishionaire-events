import { PrismaClient } from '#prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

let _prisma = null

export function usePrisma() {
  if (!_prisma) {
    const config = useRuntimeConfig()
    const adapter = new PrismaPg({ connectionString: config.databaseUrl })
    _prisma = new PrismaClient({ adapter })
  }
  return _prisma
}
