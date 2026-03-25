import { usePrisma } from '../database'
import OnboardingState from '../entities/OnboardingState'
import type { OnboardingStateData } from '../entities/OnboardingState'

export default class OnboardingRepository {
  static async findByClerkId(clerkId: string): Promise<OnboardingState | null> {
    const prisma = usePrisma()
    const row = await prisma.onboardingState.findUnique({
      where: { userClerkId: clerkId },
    })
    return row ? OnboardingState.fromJSON(row as any) : null
  }

  static async upsert(
    clerkId: string,
    data: Partial<OnboardingStateData>,
  ): Promise<OnboardingState> {
    const prisma = usePrisma()
    const updateData: any = {}
    if (data.dashboardTourDone !== undefined) updateData.dashboardTourDone = data.dashboardTourDone
    if (data.eventCreationTourDone !== undefined) updateData.eventCreationTourDone = data.eventCreationTourDone
    if (data.dismissedTooltips !== undefined) updateData.dismissedTooltips = data.dismissedTooltips
    updateData.updatedAt = new Date()

    const row = await prisma.onboardingState.upsert({
      where: { userClerkId: clerkId },
      create: {
        userClerkId: clerkId,
        ...updateData,
      },
      update: updateData,
    })
    return OnboardingState.fromJSON(row as any)
  }
}
