import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3'
import crypto from 'crypto'

let _client: S3Client | null = null

function getClient(): S3Client {
  if (!_client) {
    const config = useRuntimeConfig()
    _client = new S3Client({
      region: config.awsRegion,
      credentials: {
        accessKeyId: config.awsAccessKeyId,
        secretAccessKey: config.awsSecretAccessKey,
      },
    })
  }
  return _client
}

function getBucket(): string {
  const config = useRuntimeConfig()
  return config.awsBucket as string
}

function getPublicUrl(key: string): string {
  const config = useRuntimeConfig()
  if (config.awsCdnUrl) {
    return `${config.awsCdnUrl}/${key}`
  }
  return `https://${getBucket()}.s3.${config.awsRegion}.amazonaws.com/${key}`
}

export async function uploadImage(buffer: Buffer, contentType: string, folder: string = 'covers'): Promise<{ key: string, url: string }> {
  const ext = contentType.split('/')[1] || 'jpg'
  const key = `${folder}/${crypto.randomUUID()}.${ext}`

  await getClient().send(new PutObjectCommand({
    Bucket: getBucket(),
    Key: key,
    Body: buffer,
    ContentType: contentType,
    CacheControl: 'public, max-age=31536000, immutable',
  }))

  return { key, url: getPublicUrl(key) }
}

export async function deleteImage(key: string | undefined | null): Promise<void> {
  if (!key) return
  await getClient().send(new DeleteObjectCommand({
    Bucket: getBucket(),
    Key: key,
  }))
}
