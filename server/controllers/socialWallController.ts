import SocialWallPost from '../entities/SocialWallPost'
import SocialWallPostRepository from '../repositories/socialWallPostRepository'
import EventRepository from '../repositories/eventRepository'
import EventMemberRepository from '../repositories/eventMemberRepository'
import EventInvitationRepository from '../repositories/eventInvitationRepository'
import ActivityLogController from './activityLogController'
import NotificationController from './notificationController'
import { uploadImage, deleteImage } from '../utils/s3'

export default class SocialWallController {
  static async #verifyOrganizerAccess(eventId: number, clerkId: string) {
    const event = await EventRepository.findById(eventId as any)
    if (!event) {
      throw createError({ statusCode: 404, statusMessage: 'Event not found' })
    }
    const member = await EventMemberRepository.findByEventIdAndUserId(String(eventId), clerkId)
    if (!member || !member.canEdit) {
      throw createError({ statusCode: 403, statusMessage: 'You do not have permission to manage this event' })
    }
    return event
  }

  static #checkFeature(event: any) {
    if (!event.features?.socialWall) {
      throw createError({ statusCode: 403, statusMessage: 'Social wall is not available for this event tier' })
    }
  }

  static async #resolveGuestFromToken(accessToken: string) {
    const invitation = await EventInvitationRepository.findByAccessToken(accessToken)
    if (!invitation) {
      throw createError({ statusCode: 404, statusMessage: 'Invalid invite link' })
    }
    return invitation
  }

  // --- Organizer methods ---

  static async listAllPosts(eventId: number, clerkId: string) {
    const event = await this.#verifyOrganizerAccess(eventId, clerkId)
    this.#checkFeature(event)
    const posts = await SocialWallPostRepository.findByEventId(eventId)
    return posts.map((p) => p.toJSON())
  }

  static async getStats(eventId: number, clerkId: string) {
    await this.#verifyOrganizerAccess(eventId, clerkId)
    const [total, pending, approved] = await Promise.all([
      SocialWallPostRepository.countByEventId(eventId),
      SocialWallPostRepository.countByEventId(eventId, 'pending'),
      SocialWallPostRepository.countByEventId(eventId, 'approved'),
    ])
    return { total, pending, approved }
  }

  static async approvePost(postId: number, clerkId: string) {
    const post = await SocialWallPostRepository.findById(postId)
    if (!post) {
      throw createError({ statusCode: 404, statusMessage: 'Post not found' })
    }
    await this.#verifyOrganizerAccess(post.eventId, clerkId)
    const updated = await SocialWallPostRepository.updateStatus(postId, 'approved')
    return updated.toJSON()
  }

  static async rejectPost(postId: number, clerkId: string) {
    const post = await SocialWallPostRepository.findById(postId)
    if (!post) {
      throw createError({ statusCode: 404, statusMessage: 'Post not found' })
    }
    await this.#verifyOrganizerAccess(post.eventId, clerkId)
    const updated = await SocialWallPostRepository.updateStatus(postId, 'rejected')
    return updated.toJSON()
  }

  static async deletePost(postId: number, clerkId: string) {
    const post = await SocialWallPostRepository.findById(postId)
    if (!post) {
      throw createError({ statusCode: 404, statusMessage: 'Post not found' })
    }
    await this.#verifyOrganizerAccess(post.eventId, clerkId)
    if (post.imageKey) {
      await deleteImage(post.imageKey)
    }
    await SocialWallPostRepository.delete(postId)
  }

  static async updateSettings(eventId: number, clerkId: string, settings: { socialWallAutoApprove: boolean }) {
    const event = await this.#verifyOrganizerAccess(eventId, clerkId)
    this.#checkFeature(event)
    event.socialWallAutoApprove = settings.socialWallAutoApprove
    await EventRepository.update(event)
    return { socialWallAutoApprove: event.socialWallAutoApprove }
  }

  // --- Guest methods ---

  static async getGuestWall(accessToken: string) {
    const invitation = await this.#resolveGuestFromToken(accessToken)
    const event = await EventRepository.findById(invitation.eventId as any)
    if (!event) {
      throw createError({ statusCode: 404, statusMessage: 'Event not found' })
    }

    if (!event.features?.socialWall) {
      return { posts: [] }
    }

    const posts = await SocialWallPostRepository.findByEventId(Number(invitation.eventId), 'approved')
    return {
      posts: posts.map((p) => p.toJSON()),
    }
  }

  static async guestCreatePost(
    accessToken: string,
    content: string,
    buffer?: Buffer,
    contentType?: string,
  ) {
    const invitation = await this.#resolveGuestFromToken(accessToken)
    const event = await EventRepository.findById(invitation.eventId as any)
    if (!event) {
      throw createError({ statusCode: 404, statusMessage: 'Event not found' })
    }

    this.#checkFeature(event)

    if (!content || content.trim().length === 0) {
      throw createError({ statusCode: 400, statusMessage: 'Content is required' })
    }
    if (content.length > 500) {
      throw createError({ statusCode: 400, statusMessage: 'Content must be 500 characters or less' })
    }

    const eventId = Number(invitation.eventId)
    let imageUrl: string | null = null
    let imageKey: string | null = null

    if (buffer && contentType) {
      const result = await uploadImage(buffer, contentType, `events/${eventId}/social-wall`)
      imageUrl = result.url
      imageKey = result.key
    }

    const post = new SocialWallPost({
      id: null,
      eventId,
      guestEmail: invitation.inviteeEmail,
      guestName: invitation.inviteeName || null,
      content: content.trim(),
      imageUrl,
      imageKey,
      status: event.socialWallAutoApprove ? 'approved' : 'pending',
      hearts: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    const saved = await SocialWallPostRepository.create(post)

    const name = invitation.inviteeName || invitation.inviteeEmail
    ActivityLogController.log(eventId, 'social_wall_post', name, invitation.inviteeEmail, {
      hasImage: !!imageUrl,
      contentPreview: content.slice(0, 100),
    })

    NotificationController.notify({
      eventId,
      type: 'social_wall_post',
      title: `${name} posted on the Social Wall`,
      body: content.slice(0, 100),
      linkUrl: `/dashboard/events/${eventId}`,
      metadata: { hasImage: !!imageUrl },
      recipientRole: 'all_organizers',
      eventTier: event.tier,
    })

    return saved.toJSON()
  }

  static async guestHeartPost(accessToken: string, postId: number) {
    const invitation = await this.#resolveGuestFromToken(accessToken)
    const post = await SocialWallPostRepository.findById(postId)
    if (!post) {
      throw createError({ statusCode: 404, statusMessage: 'Post not found' })
    }

    if (post.eventId !== Number(invitation.eventId)) {
      throw createError({ statusCode: 403, statusMessage: 'Post does not belong to this event' })
    }

    if (post.status !== 'approved') {
      throw createError({ statusCode: 403, statusMessage: 'Cannot heart a post that is not approved' })
    }

    const updated = await SocialWallPostRepository.incrementHearts(postId)
    return { hearts: updated.hearts }
  }
}
