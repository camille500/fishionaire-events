import { usePrisma } from '../database'
import GalleryPhoto from '../entities/GalleryPhoto'

function toInt(value: string | number): number {
  return typeof value === 'string' ? parseInt(value, 10) : value
}

export default class GalleryPhotoRepository {
  static async create(photo: GalleryPhoto): Promise<GalleryPhoto> {
    const prisma = usePrisma()
    const row = await prisma.galleryPhoto.create({
      data: {
        eventId: toInt(photo.eventId),
        imageUrl: photo.imageUrl,
        imageKey: photo.imageKey,
        caption: photo.caption,
        uploaderEmail: photo.uploaderEmail,
        uploaderName: photo.uploaderName,
        uploadedBy: photo.uploadedBy,
        sortOrder: photo.sortOrder,
      },
    })
    return GalleryPhoto.fromJSON(row as any)
  }

  static async findByEventId(eventId: number): Promise<GalleryPhoto[]> {
    const prisma = usePrisma()
    const rows = await prisma.galleryPhoto.findMany({
      where: { eventId: toInt(eventId) },
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
    })
    return rows.map((row: any) => GalleryPhoto.fromJSON(row))
  }

  static async findById(id: number): Promise<GalleryPhoto | null> {
    const prisma = usePrisma()
    const row = await prisma.galleryPhoto.findUnique({
      where: { id: toInt(id) },
    })
    return row ? GalleryPhoto.fromJSON(row as any) : null
  }

  static async delete(id: number): Promise<void> {
    const prisma = usePrisma()
    await prisma.galleryPhoto.delete({ where: { id: toInt(id) } })
  }

  static async bulkDelete(ids: number[]): Promise<void> {
    const prisma = usePrisma()
    await prisma.galleryPhoto.deleteMany({
      where: { id: { in: ids.map(toInt) } },
    })
  }

  static async updateCaption(id: number, caption: string | null): Promise<GalleryPhoto> {
    const prisma = usePrisma()
    const row = await prisma.galleryPhoto.update({
      where: { id: toInt(id) },
      data: { caption },
    })
    return GalleryPhoto.fromJSON(row as any)
  }

  static async countByEventId(eventId: number): Promise<number> {
    const prisma = usePrisma()
    return prisma.galleryPhoto.count({ where: { eventId: toInt(eventId) } })
  }

  static async reorder(eventId: number, orderedIds: number[]): Promise<void> {
    const prisma = usePrisma()
    const updates = orderedIds.map((id, index) =>
      prisma.galleryPhoto.update({
        where: { id: toInt(id) },
        data: { sortOrder: index },
      })
    )
    await prisma.$transaction(updates)
  }
}
