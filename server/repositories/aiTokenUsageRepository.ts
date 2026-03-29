import { usePrisma } from '../database'
import AiTokenUsage from '../entities/AiTokenUsage'

export default class AiTokenUsageRepository {
  static async findByUserAndDate(clerkId: string, date: Date): Promise<AiTokenUsage | null> {
    const prisma = usePrisma()
    const row = await prisma.aiTokenUsage.findUnique({
      where: {
        userClerkId_date: { userClerkId: clerkId, date },
      },
    })
    if (!row) return null
    return AiTokenUsage.fromJSON(row)
  }

  static async recordUsage(clerkId: string, tokens: number): Promise<AiTokenUsage> {
    const prisma = usePrisma()
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const row = await prisma.aiTokenUsage.upsert({
      where: {
        userClerkId_date: { userClerkId: clerkId, date: today },
      },
      create: {
        userClerkId: clerkId,
        date: today,
        tokensUsed: tokens,
        requestCount: 1,
      },
      update: {
        tokensUsed: { increment: tokens },
        requestCount: { increment: 1 },
      },
    })

    return AiTokenUsage.fromJSON(row)
  }
}
