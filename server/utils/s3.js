import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3'
import crypto from 'crypto'

let _client = null

function getClient() {
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

function getBucket() {
  const config = useRuntimeConfig()
  return config.awsBucket
}

function getPublicUrl(key) {
  const config = useRuntimeConfig()
  if (config.awsCdnUrl) {
    return `${config.awsCdnUrl}/${key}`
  }
  return `https://${getBucket()}.s3.${config.awsRegion}.amazonaws.com/${key}`
}

export async function uploadImage(buffer, contentType, folder = 'covers') {
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

export async function deleteImage(key) {
  if (!key) return
  await getClient().send(new DeleteObjectCommand({
    Bucket: getBucket(),
    Key: key,
  }))
}
