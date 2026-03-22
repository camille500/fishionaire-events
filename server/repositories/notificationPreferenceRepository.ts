import { usePrisma } from '../database'
import NotificationPreference from '../entities/NotificationPreference'
import type { NotificationPreferenceData } from '../entities/NotificationPreference'

export default class NotificationPreferenceRepository {
  static async findByUserId(clerkId: string): Promise<NotificationPreference | null> {
    const prisma = usePrisma()
    const row = await prisma.notificationPreference.findUnique({
      where: { userClerkId: clerkId },
    })
    return row ? NotificationPreference.fromJSON(row as any) : null
  }

  static async upsert(
    clerkId: string,
    data: Partial<NotificationPreferenceData>,
  ): Promise<NotificationPreference> {
    const prisma = usePrisma()
    const updateData: any = {}
    if (data.preferences !== undefined) updateData.preferences = data.preferences
    if (data.reminderSchedule !== undefined) updateData.reminderSchedule = data.reminderSchedule
    if (data.digestEnabled !== undefined) updateData.digestEnabled = data.digestEnabled
    updateData.updatedAt = new Date()

    const row = await prisma.notificationPreference.upsert({
      where: { userClerkId: clerkId },
      create: {
        userClerkId: clerkId,
        ...updateData,
      },
      update: updateData,
    })
    return NotificationPreference.fromJSON(row as any)
  }
}
