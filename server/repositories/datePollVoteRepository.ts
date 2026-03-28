import { usePrisma } from '../database'
import DatePollVote, { DatePollVoteStatus } from '../entities/DatePollVote'

export default class DatePollVoteRepository {
  static async upsert(
    datePollOptionId: string | number,
    voterEmail: string,
    status: DatePollVoteStatus,
    voterName?: string | null,
    token?: string | null,
    attendFrom?: Date | string | null,
    attendUntil?: Date | string | null,
  ): Promise<DatePollVote> {
    const prisma = usePrisma()
    const optionId = typeof datePollOptionId === 'string' ? parseInt(datePollOptionId, 10) : datePollOptionId
    const row = await prisma.datePollVote.upsert({
      where: { datePollOptionId_voterEmail: { datePollOptionId: optionId, voterEmail } },
      update: {
        status,
        voterName: voterName || undefined,
        attendFrom: attendFrom ?? null,
        attendUntil: attendUntil ?? null,
        updatedAt: new Date(),
      },
      create: {
        datePollOptionId: optionId,
        voterEmail,
        voterName,
        status,
        token,
        attendFrom: attendFrom ?? null,
        attendUntil: attendUntil ?? null,
      },
    })
    return DatePollVote.fromJSON(row)
  }

  static async findByPollIdAndEmail(datePollId: string, voterEmail: string): Promise<DatePollVote[]> {
    const prisma = usePrisma()
    const rows = await prisma.datePollVote.findMany({
      where: {
        voterEmail,
        option: { datePollId: Number(datePollId) },
      },
    })
    return rows.map((row) => DatePollVote.fromJSON(row))
  }

  static async deleteByPollAndEmail(datePollId: string, voterEmail: string): Promise<void> {
    const prisma = usePrisma()
    await prisma.datePollVote.deleteMany({
      where: {
        voterEmail,
        option: { datePollId: Number(datePollId) },
      },
    })
  }
}
