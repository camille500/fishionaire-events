import { usePrisma } from '../database'
import DatePollOption from '../entities/DatePollOption'

interface OptionCreateData {
  datePollId: string
  date: Date | string
  startTime?: Date | string | null
  endTime?: Date | string | null
  sortOrder?: number
}

export default class DatePollOptionRepository {
  static async create(data: OptionCreateData): Promise<DatePollOption> {
    const prisma = usePrisma()
    const row = await prisma.datePollOption.create({
      data: {
        datePollId: data.datePollId,
        date: new Date(data.date),
        startTime: data.startTime ? new Date(data.startTime) : null,
        endTime: data.endTime ? new Date(data.endTime) : null,
        sortOrder: data.sortOrder ?? 0,
      },
      include: { votes: true },
    })
    return DatePollOption.fromJSON(row)
  }

  static async bulkCreate(options: OptionCreateData[]): Promise<DatePollOption[]> {
    const prisma = usePrisma()
    const rows = await Promise.all(
      options.map((o) =>
        prisma.datePollOption.create({
          data: {
            datePollId: o.datePollId,
            date: new Date(o.date),
            startTime: o.startTime ? new Date(o.startTime) : null,
            endTime: o.endTime ? new Date(o.endTime) : null,
            sortOrder: o.sortOrder ?? 0,
          },
          include: { votes: true },
        })
      )
    )
    return rows.map((row) => DatePollOption.fromJSON(row))
  }

  static async delete(id: string): Promise<void> {
    const prisma = usePrisma()
    await prisma.datePollOption.delete({ where: { id } })
  }
}
