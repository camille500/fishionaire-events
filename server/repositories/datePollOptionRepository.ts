import { usePrisma } from '../database'
import DatePollOption from '../entities/DatePollOption'

interface OptionCreateData {
  datePollId: string
  date: Date | string
  startTime?: Date | string | null
  endTime?: Date | string | null
  sortOrder?: number
}

function toValidDate(value: Date | string | null | undefined): Date | null {
  if (!value) return null
  const d = new Date(value)
  return isNaN(d.getTime()) ? null : d
}

export default class DatePollOptionRepository {
  static async create(data: OptionCreateData): Promise<DatePollOption> {
    const prisma = usePrisma()
    const row = await prisma.datePollOption.create({
      data: {
        datePollId: data.datePollId,
        date: new Date(data.date),
        startTime: toValidDate(data.startTime),
        endTime: toValidDate(data.endTime),
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
            startTime: toValidDate(o.startTime),
            endTime: toValidDate(o.endTime),
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
