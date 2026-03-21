import { SESv2Client, SendEmailCommand } from '@aws-sdk/client-sesv2'

let _client: SESv2Client | null = null

function getClient(): SESv2Client {
  if (!_client) {
    const config = useRuntimeConfig()
    _client = new SESv2Client({
      region: config.awsRegion,
      credentials: {
        accessKeyId: config.awsAccessKeyId,
        secretAccessKey: config.awsSecretAccessKey,
      },
    })
  }
  return _client
}

export async function sendEmail(to: string, subject: string, htmlBody: string): Promise<void> {
  const config = useRuntimeConfig()
  const fromEmail = config.awsSesFromEmail as string
  const fromName = config.awsSesFromName as string

  await getClient().send(new SendEmailCommand({
    FromEmailAddress: `${fromName} <${fromEmail}>`,
    Destination: {
      ToAddresses: [to],
    },
    Content: {
      Simple: {
        Subject: { Data: subject, Charset: 'UTF-8' },
        Body: {
          Html: { Data: htmlBody, Charset: 'UTF-8' },
        },
      },
    },
  }))
}
