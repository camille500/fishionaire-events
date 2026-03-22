import GalleryPhoto from '../entities/GalleryPhoto'
import GalleryPhotoRepository from '../repositories/galleryPhotoRepository'
import EventRepository from '../repositories/eventRepository'
import EventMemberRepository from '../repositories/eventMemberRepository'
import EventInvitationRepository from '../repositories/eventInvitationRepository'
import ActivityLogController from './activityLogController'
import NotificationController from './notificationController'
import { uploadImage, deleteImage } from '../utils/s3'

export default class GalleryController {
  static async #verifyOrganizerAccess(eventId: number, clerkId: string) {
    const event = await EventRepository.findById(eventId)
    if (!event) {
      throw createError({ statusCode: 404, statusMessage: 'Event not found' })
    }
    const member = await EventMemberRepository.findByEventIdAndUserId(eventId, clerkId)
    if (!member || !member.canEdit) {
      throw createError({ statusCode: 403, statusMessage: 'You do not have permission to manage this event' })
    }
    return event
  }

  static #checkGalleryFeature(event: { features: Record<string, unknown> }) {
    if (!event.features?.photoGallery) {
      throw createError({ statusCode: 403, statusMessage: 'Photo gallery is not available for this event tier' })
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

  static async listPhotos(eventId: number, clerkId: string): Promise<Record<string, unknown>[]> {
    const event = await this.#verifyOrganizerAccess(eventId, clerkId)
    this.#checkGalleryFeature(event)
    const photos = await GalleryPhotoRepository.findByEventId(eventId)
    return photos.map((p) => p.toJSON())
  }

  static async uploadPhoto(
    eventId: number,
    clerkId: string,
    buffer: Buffer,
    contentType: string,
    caption?: string,
  ): Promise<Record<string, unknown>> {
    const event = await this.#verifyOrganizerAccess(eventId, clerkId)
    this.#checkGalleryFeature(event)

    const count = await GalleryPhotoRepository.countByEventId(eventId)
    const { key, url } = await uploadImage(buffer, contentType, `events/${eventId}/gallery`)

    const photo = new GalleryPhoto({
      id: null,
      eventId,
      imageUrl: url,
      imageKey: key,
      caption: caption || null,
      uploaderEmail: null,
      uploaderName: null,
      uploadedBy: 'organizer',
      sortOrder: count,
      createdAt: new Date(),
    })

    const saved = await GalleryPhotoRepository.create(photo)
    return saved.toJSON()
  }

  static async deletePhoto(photoId: number, clerkId: string): Promise<void> {
    const photo = await GalleryPhotoRepository.findById(photoId)
    if (!photo) {
      throw createError({ statusCode: 404, statusMessage: 'Photo not found' })
    }
    await this.#verifyOrganizerAccess(photo.eventId, clerkId)
    await deleteImage(photo.imageKey)
    await GalleryPhotoRepository.delete(photoId)
  }

  static async bulkDeletePhotos(eventId: number, clerkId: string, ids: number[]): Promise<void> {
    await this.#verifyOrganizerAccess(eventId, clerkId)
    const photos = await Promise.all(ids.map((id) => GalleryPhotoRepository.findById(id)))
    for (const photo of photos) {
      if (photo && photo.eventId === eventId) {
        await deleteImage(photo.imageKey)
      }
    }
    await GalleryPhotoRepository.bulkDelete(ids)
  }

  static async updateCaption(photoId: number, clerkId: string, caption: string | null): Promise<Record<string, unknown>> {
    const photo = await GalleryPhotoRepository.findById(photoId)
    if (!photo) {
      throw createError({ statusCode: 404, statusMessage: 'Photo not found' })
    }
    await this.#verifyOrganizerAccess(photo.eventId, clerkId)
    const updated = await GalleryPhotoRepository.updateCaption(photoId, caption)
    return updated.toJSON()
  }

  static async setAsCover(photoId: number, clerkId: string): Promise<Record<string, unknown>> {
    const photo = await GalleryPhotoRepository.findById(photoId)
    if (!photo) {
      throw createError({ statusCode: 404, statusMessage: 'Photo not found' })
    }
    const event = await this.#verifyOrganizerAccess(photo.eventId, clerkId)
    event.coverImageUrl = photo.imageUrl
    event.coverImageKey = photo.imageKey
    await EventRepository.update(event)
    return { coverImageUrl: photo.imageUrl }
  }

  static async reorderPhotos(eventId: number, clerkId: string, orderedIds: number[]): Promise<Record<string, unknown>[]> {
    const event = await this.#verifyOrganizerAccess(eventId, clerkId)
    this.#checkGalleryFeature(event)
    await GalleryPhotoRepository.reorder(eventId, orderedIds)
    const photos = await GalleryPhotoRepository.findByEventId(eventId)
    return photos.map((p) => p.toJSON())
  }

  // --- Guest methods ---

  static async getGuestGallery(accessToken: string): Promise<Record<string, unknown>> {
    const invitation = await this.#resolveGuestFromToken(accessToken)
    const event = await EventRepository.findById(invitation.eventId)
    if (!event) {
      throw createError({ statusCode: 404, statusMessage: 'Event not found' })
    }

    if (!event.features?.photoGallery) {
      return { photos: [], guestUploadsEnabled: false }
    }

    const photos = await GalleryPhotoRepository.findByEventId(invitation.eventId)
    return {
      photos: photos.map((p) => p.toJSON()),
      guestUploadsEnabled: event.guestUploadsEnabled,
    }
  }

  static async guestUploadPhoto(
    accessToken: string,
    buffer: Buffer,
    contentType: string,
    caption?: string,
  ): Promise<Record<string, unknown>> {
    const invitation = await this.#resolveGuestFromToken(accessToken)
    const event = await EventRepository.findById(invitation.eventId)
    if (!event) {
      throw createError({ statusCode: 404, statusMessage: 'Event not found' })
    }

    if (!event.features?.photoGallery) {
      throw createError({ statusCode: 403, statusMessage: 'Photo gallery is not available for this event' })
    }
    if (!event.guestUploadsEnabled) {
      throw createError({ statusCode: 403, statusMessage: 'Guest photo uploads are not enabled for this event' })
    }

    const count = await GalleryPhotoRepository.countByEventId(invitation.eventId)
    const { key, url } = await uploadImage(buffer, contentType, `events/${invitation.eventId}/gallery`)

    const photo = new GalleryPhoto({
      id: null,
      eventId: invitation.eventId,
      imageUrl: url,
      imageKey: key,
      caption: caption || null,
      uploaderEmail: invitation.inviteeEmail,
      uploaderName: invitation.inviteeName || null,
      uploadedBy: 'guest',
      sortOrder: count,
      createdAt: new Date(),
    })

    const saved = await GalleryPhotoRepository.create(photo)

    const name = invitation.inviteeName || invitation.inviteeEmail
    ActivityLogController.log(invitation.eventId, 'photo_upload', name, invitation.inviteeEmail, {
      caption: caption || null,
    })

    NotificationController.notify({
      eventId: invitation.eventId,
      type: 'photo_upload',
      title: `${name} uploaded a photo`,
      body: `${name} added a photo to the gallery`,
      linkUrl: `/dashboard/events/${invitation.eventId}`,
      metadata: { caption: caption || null },
      recipientRole: 'all_organizers',
      eventTier: event.tier,
    })

    return saved.toJSON()
  }
}
