import AiTokenUsageController from '../controllers/aiTokenUsageController'

export async function checkAiTokenLimit(clerkId: string): Promise<void> {
  await AiTokenUsageController.checkLimit(clerkId)
}

export async function recordAiTokens(clerkId: string, tokens: number): Promise<void> {
  await AiTokenUsageController.recordTokens(clerkId, tokens)
}
