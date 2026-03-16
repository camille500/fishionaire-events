import { usePrisma } from '../database'
import DatePollVote, { DatePollVoteStatus } from '../entities/DatePollVote'

export default class DatePollVoteRepository {
  static async upsert(
    datePollOptionId: string,
    voterEmail: string,
    status: DatePollVoteStatus,
    voterName?: string | null,
    token?: string | null,
  ): Promise<DatePollVote> {
    const prisma = usePrisma()
    const row = await prisma.datePollVote.upsert({
      where: { datePollOptionId_voterEmail: { datePollOptionId, voterEmail } },
      update: { status, voterName: voterName || undefined, updatedAt: new Date() },
      create: { datePollOptionId, voterEmail, voterName, status, token },
    })
    return DatePollVote.fromJSON(row)
  }

  static async findByPollIdAndEmail(datePollId: string, voterEmail: string): Promise<DatePollVote[]> {
    const prisma = usePrisma()
    const rows = await prisma.datePollVote.findMany({
      where: {
        voterEmail,
        option: { datePollId },
      },
    })
    return rows.map((row) => DatePollVote.fromJSON(row))
  }

  static async deleteByPollAndEmail(datePollId: string, voterEmail: string): Promise<void> {
    const prisma = usePrisma()
    await prisma.datePollVote.deleteMany({
      where: {
        voterEmail,
        option: { datePollId },
      },
    })
  }
}
