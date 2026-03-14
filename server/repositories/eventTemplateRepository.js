import { usePrisma } from '../database'
import EventTemplate from '../entities/EventTemplate'
import { SYSTEM_TEMPLATES } from '../utils/systemTemplates'

export default class EventTemplateRepository {
  static async create(template) {
    const prisma = usePrisma()
    const data = template.toJSON()
    const row = await prisma.eventTemplate.create({
      data: {
        name: data.name,
        description: data.description,
        eventType: data.eventType,
        settings: data.settings,
        subEventTemplates: data.subEventTemplates,
        isSystem: data.isSystem,
        ownerClerkId: data.ownerClerkId,
      },
    })
    return EventTemplate.fromJSON(row)
  }

  static async findById(id) {
    const prisma = usePrisma()
    const row = await prisma.eventTemplate.findUnique({ where: { id } })
    if (!row) return null
    return EventTemplate.fromJSON(row)
  }

  static async findSystemTemplates() {
    const prisma = usePrisma()
    await this.ensureSystemTemplatesExist()
    const rows = await prisma.eventTemplate.findMany({
      where: { isSystem: true },
      orderBy: { name: 'asc' },
    })
    return rows.map((row) => EventTemplate.fromJSON(row))
  }

  static async findByOwner(clerkId) {
    const prisma = usePrisma()
    const rows = await prisma.eventTemplate.findMany({
      where: { ownerClerkId: clerkId, isSystem: false },
      orderBy: { createdAt: 'desc' },
    })
    return rows.map((row) => EventTemplate.fromJSON(row))
  }

  static async delete(id) {
    const prisma = usePrisma()
    await prisma.eventTemplate.delete({ where: { id } })
  }

  static async ensureSystemTemplatesExist() {
    const prisma = usePrisma()
    const count = await prisma.eventTemplate.count({ where: { isSystem: true } })
    if (count > 0) return

    await Promise.all(
      SYSTEM_TEMPLATES.map((t) =>
        prisma.eventTemplate.create({
          data: {
            name: t.name,
            description: t.description || null,
            eventType: t.eventType,
            settings: t.settings || {},
            subEventTemplates: t.subEventTemplates || [],
            isSystem: true,
          },
        })
      )
    )
  }
}
