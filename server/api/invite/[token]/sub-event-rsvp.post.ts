import type { H3Event } from 'h3'
import EventInvitationRepository from '../../../repositories/eventInvitationRepository'
import SubEventRsvpController from '../../../controllers/subEventRsvpController'

export default defineEventHandler(async (event: H3Event) => {
  const token = getRouterParam(event, 'token')
  if (!token || token.length < 6) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid invite code' })
  }

  const invitation = await EventInvitationRepository.findByAccessToken(token)
  if (!invitation) {
    throw createError({ statusCode: 404, statusMessage: 'Invalid invite code' })
  }

  const { subEventId, status } = await readBody<{ subEventId: number, status: string }>(event)
  if (!subEventId || !status) {
    throw createError({ statusCode: 400, statusMessage: 'subEventId and status are required' })
  }

  return SubEventRsvpController.rsvpToSubEvent(
    parseInt(invitation.eventId),
    subEventId,
    invitation.inviteeEmail,
    status
  )
})
