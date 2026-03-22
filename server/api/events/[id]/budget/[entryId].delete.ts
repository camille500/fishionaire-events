import type { H3Event } from 'h3'
import BudgetController from '../../../../controllers/budgetController'

export default defineEventHandler(async (event: H3Event) => {
  const { isAuthenticated, userId } = event.context.auth()
  if (!isAuthenticated) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  const entryId = parseInt(getRouterParam(event, 'entryId')!)
  if (isNaN(entryId)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid entry ID' })
  }

  await BudgetController.deleteEntry(entryId, userId)
  return { success: true }
})
