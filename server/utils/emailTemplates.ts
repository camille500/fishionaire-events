interface InviteEmailData {
  eventTitle: string
  eventDate?: string | null
  eventLocation?: string | null
  coverImageUrl?: string | null
  inviteeName?: string | null
  inviteLink: string
  pinCode?: string | null
}

export function renderInviteEmail(data: InviteEmailData): string {
  const greeting = data.inviteeName ? `Hi ${escapeHtml(data.inviteeName)},` : 'Hi,'
  const dateSection = data.eventDate
    ? `<p style="margin:0 0 4px;color:#666;font-size:14px;">📅 ${escapeHtml(formatDate(data.eventDate))}</p>`
    : ''
  const locationSection = data.eventLocation
    ? `<p style="margin:0 0 4px;color:#666;font-size:14px;">📍 ${escapeHtml(data.eventLocation)}</p>`
    : ''
  const coverSection = data.coverImageUrl
    ? `<img src="${escapeHtml(data.coverImageUrl)}" alt="${escapeHtml(data.eventTitle)}" style="width:100%;max-height:240px;object-fit:cover;border-radius:12px;margin-bottom:24px;" />`
    : ''

  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8" /><meta name="viewport" content="width=device-width,initial-scale=1.0" /></head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f5;padding:32px 16px;">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.08);">
        ${coverSection ? `<tr><td style="padding:0;">${coverSection}</td></tr>` : ''}
        <tr><td style="padding:32px 32px 24px;">
          <p style="margin:0 0 16px;font-size:16px;color:#333;line-height:1.5;">${greeting}</p>
          <p style="margin:0 0 24px;font-size:16px;color:#333;line-height:1.5;">You're invited to <strong>${escapeHtml(data.eventTitle)}</strong>!</p>
          ${dateSection}
          ${locationSection}
          ${(dateSection || locationSection) ? '<div style="height:24px;"></div>' : ''}
          <table cellpadding="0" cellspacing="0" style="margin:0 auto;">
            <tr><td style="background:#00b894;border-radius:8px;">
              <a href="${escapeHtml(data.inviteLink)}" style="display:inline-block;padding:14px 32px;color:#ffffff;text-decoration:none;font-size:16px;font-weight:600;letter-spacing:0.02em;">View invitation & RSVP</a>
            </td></tr>
          </table>
          ${data.pinCode ? `
          <div style="margin:24px auto 0;max-width:320px;padding:20px;background:#f8faf9;border:1px solid #e0e0e0;border-radius:12px;text-align:center;">
            <p style="margin:0 0 8px;font-size:13px;color:#666;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;">Your personal PIN code</p>
            <p style="margin:0;font-size:32px;font-weight:700;color:#1a1a2e;letter-spacing:0.15em;font-family:monospace;">${escapeHtml(data.pinCode)}</p>
            <p style="margin:8px 0 0;font-size:12px;color:#999;">You'll need this to open your invitation</p>
          </div>
          ` : ''}
          <p style="margin:24px 0 0;font-size:13px;color:#999;text-align:center;line-height:1.5;">
            If the button doesn't work, copy this link:<br />
            <a href="${escapeHtml(data.inviteLink)}" style="color:#00b894;word-break:break-all;">${escapeHtml(data.inviteLink)}</a>
          </p>
        </td></tr>
        <tr><td style="padding:16px 32px;background:#fafafa;border-top:1px solid #eee;text-align:center;">
          <p style="margin:0;font-size:12px;color:#aaa;">Sent via <a href="${escapeHtml(data.inviteLink.split('/invite')[0] || data.inviteLink)}" style="color:#00b894;text-decoration:none;">Fishionaire Events</a></p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`
}

// --- RSVP Confirmation Email ---

interface RsvpConfirmationEmailData {
  eventTitle: string
  guestName?: string | null
  rsvpStatus: 'accepted' | 'declined'
  eventDate?: string | null
  eventLocation?: string | null
  inviteLink: string
}

export function renderRsvpConfirmationEmail(data: RsvpConfirmationEmailData): string {
  const greeting = data.guestName ? `Hi ${escapeHtml(data.guestName)},` : 'Hi,'
  const isAccepted = data.rsvpStatus === 'accepted'
  const headline = isAccepted
    ? `You're going to <strong>${escapeHtml(data.eventTitle)}</strong>!`
    : `Your RSVP for <strong>${escapeHtml(data.eventTitle)}</strong> has been updated.`
  const emoji = isAccepted ? '🎉' : '👋'
  const subtext = isAccepted
    ? 'We look forward to seeing you there.'
    : 'We\'ll miss you! If plans change, you can always update your response.'
  const dateSection = data.eventDate
    ? `<p style="margin:0 0 4px;color:#666;font-size:14px;">📅 ${escapeHtml(formatDate(data.eventDate))}</p>`
    : ''
  const locationSection = data.eventLocation
    ? `<p style="margin:0 0 4px;color:#666;font-size:14px;">📍 ${escapeHtml(data.eventLocation)}</p>`
    : ''
  const baseUrl = data.inviteLink.split('/invite')[0] || data.inviteLink

  return wrapEmail(`
    <p style="margin:0 0 16px;font-size:16px;color:#333;line-height:1.5;">${greeting}</p>
    <p style="margin:0 0 8px;font-size:20px;color:#333;line-height:1.4;">${emoji} ${headline}</p>
    <p style="margin:0 0 24px;font-size:14px;color:#666;line-height:1.5;">${subtext}</p>
    ${dateSection}
    ${locationSection}
    ${(dateSection || locationSection) ? '<div style="height:24px;"></div>' : ''}
    <table cellpadding="0" cellspacing="0" style="margin:0 auto;">
      <tr><td style="background:#00b894;border-radius:8px;">
        <a href="${escapeHtml(data.inviteLink)}" style="display:inline-block;padding:14px 32px;color:#ffffff;text-decoration:none;font-size:16px;font-weight:600;">View event details</a>
      </td></tr>
    </table>
  `, baseUrl)
}

// --- Event Update Email ---

interface EventUpdateEmailData {
  eventTitle: string
  guestName?: string | null
  changes: Array<{ field: string, oldValue?: string | null, newValue?: string | null }>
  inviteLink: string
}

export function renderEventUpdateEmail(data: EventUpdateEmailData): string {
  const greeting = data.guestName ? `Hi ${escapeHtml(data.guestName)},` : 'Hi,'
  const baseUrl = data.inviteLink.split('/invite')[0] || data.inviteLink

  const changeRows = data.changes.map((change) => {
    const label = change.field === 'date' ? '📅 Date' : '📍 Location'
    const oldVal = change.oldValue ? escapeHtml(change.field === 'date' ? formatDate(change.oldValue) : change.oldValue) : 'Not set'
    const newVal = change.newValue ? escapeHtml(change.field === 'date' ? formatDate(change.newValue) : change.newValue) : 'Removed'
    return `
      <tr>
        <td style="padding:8px 12px;font-size:13px;color:#999;font-weight:600;">${label}</td>
        <td style="padding:8px 12px;font-size:13px;color:#999;text-decoration:line-through;">${oldVal}</td>
        <td style="padding:8px 12px;font-size:13px;color:#333;font-weight:600;">${newVal}</td>
      </tr>`
  }).join('')

  return wrapEmail(`
    <p style="margin:0 0 16px;font-size:16px;color:#333;line-height:1.5;">${greeting}</p>
    <p style="margin:0 0 24px;font-size:16px;color:#333;line-height:1.5;">📢 <strong>${escapeHtml(data.eventTitle)}</strong> has been updated:</p>
    <table cellpadding="0" cellspacing="0" style="width:100%;border:1px solid #eee;border-radius:8px;overflow:hidden;margin-bottom:24px;">
      ${changeRows}
    </table>
    <table cellpadding="0" cellspacing="0" style="margin:0 auto;">
      <tr><td style="background:#00b894;border-radius:8px;">
        <a href="${escapeHtml(data.inviteLink)}" style="display:inline-block;padding:14px 32px;color:#ffffff;text-decoration:none;font-size:16px;font-weight:600;">View updated details</a>
      </td></tr>
    </table>
  `, baseUrl)
}

// --- Event Reminder Email ---

interface EventReminderEmailData {
  eventTitle: string
  eventDate?: string | null
  eventLocation?: string | null
  timeframe: string
  dashboardLink: string
}

export function renderEventReminderEmail(data: EventReminderEmailData): string {
  const dateSection = data.eventDate
    ? `<p style="margin:0 0 4px;color:#666;font-size:14px;">📅 ${escapeHtml(formatDate(data.eventDate))}</p>`
    : ''
  const locationSection = data.eventLocation
    ? `<p style="margin:0 0 4px;color:#666;font-size:14px;">📍 ${escapeHtml(data.eventLocation)}</p>`
    : ''
  const baseUrl = data.dashboardLink.split('/dashboard')[0] || data.dashboardLink

  return wrapEmail(`
    <p style="margin:0 0 8px;font-size:20px;color:#333;line-height:1.4;">⏰ Your event is coming up!</p>
    <p style="margin:0 0 24px;font-size:16px;color:#333;line-height:1.5;"><strong>${escapeHtml(data.eventTitle)}</strong> is in <strong>${escapeHtml(data.timeframe)}</strong>.</p>
    ${dateSection}
    ${locationSection}
    ${(dateSection || locationSection) ? '<div style="height:24px;"></div>' : ''}
    <table cellpadding="0" cellspacing="0" style="margin:0 auto;">
      <tr><td style="background:#00b894;border-radius:8px;">
        <a href="${escapeHtml(data.dashboardLink)}" style="display:inline-block;padding:14px 32px;color:#ffffff;text-decoration:none;font-size:16px;font-weight:600;">View event dashboard</a>
      </td></tr>
    </table>
  `, baseUrl)
}

// --- RSVP Nudge Email ---

interface RsvpNudgeEmailData {
  eventTitle: string
  pendingCount: number
  totalInvited: number
  guestNames: string[]
  dashboardLink: string
}

export function renderRsvpNudgeEmail(data: RsvpNudgeEmailData): string {
  const baseUrl = data.dashboardLink.split('/dashboard')[0] || data.dashboardLink
  const guestList = data.guestNames.map((name) =>
    `<li style="margin:0 0 4px;font-size:14px;color:#666;">${escapeHtml(name)}</li>`
  ).join('')
  const moreCount = data.pendingCount - data.guestNames.length
  const moreText = moreCount > 0 ? `<li style="margin:0 0 4px;font-size:14px;color:#999;">and ${moreCount} more...</li>` : ''

  return wrapEmail(`
    <p style="margin:0 0 8px;font-size:20px;color:#333;line-height:1.4;">📋 RSVP reminder</p>
    <p style="margin:0 0 16px;font-size:16px;color:#333;line-height:1.5;"><strong>${data.pendingCount}</strong> of ${data.totalInvited} guests haven't responded to <strong>${escapeHtml(data.eventTitle)}</strong> yet.</p>
    <ul style="margin:0 0 24px;padding-left:20px;">
      ${guestList}
      ${moreText}
    </ul>
    <table cellpadding="0" cellspacing="0" style="margin:0 auto;">
      <tr><td style="background:#00b894;border-radius:8px;">
        <a href="${escapeHtml(data.dashboardLink)}" style="display:inline-block;padding:14px 32px;color:#ffffff;text-decoration:none;font-size:16px;font-weight:600;">View guest list</a>
      </td></tr>
    </table>
  `, baseUrl)
}

// --- Generic Notification Email ---

interface NotificationEmailData {
  title: string
  body: string
  linkUrl?: string | null
  recipientName?: string | null
}

export function renderNotificationEmail(data: NotificationEmailData): string {
  const greeting = data.recipientName ? `Hi ${escapeHtml(data.recipientName)},` : 'Hi,'
  const linkButton = data.linkUrl
    ? `<table cellpadding="0" cellspacing="0" style="margin:24px auto 0;">
      <tr><td style="background:#00b894;border-radius:8px;">
        <a href="${escapeHtml(data.linkUrl)}" style="display:inline-block;padding:14px 32px;color:#ffffff;text-decoration:none;font-size:16px;font-weight:600;">View details</a>
      </td></tr>
    </table>`
    : ''
  const baseUrl = data.linkUrl?.split('/dashboard')[0] || data.linkUrl?.split('/invite')[0] || ''

  return wrapEmail(`
    <p style="margin:0 0 16px;font-size:15px;color:#666;line-height:1.5;">${greeting}</p>
    <p style="margin:0 0 8px;font-size:18px;font-weight:600;color:#333;line-height:1.4;">${escapeHtml(data.title)}</p>
    <p style="margin:0 0 8px;font-size:15px;color:#555;line-height:1.5;">${escapeHtml(data.body)}</p>
    ${linkButton}
  `, baseUrl)
}

// --- Shared wrapper ---

function wrapEmail(bodyContent: string, baseUrl: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8" /><meta name="viewport" content="width=device-width,initial-scale=1.0" /></head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f5;padding:32px 16px;">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.08);">
        <tr><td style="padding:32px 32px 24px;">
          ${bodyContent}
        </td></tr>
        <tr><td style="padding:16px 32px;background:#fafafa;border-top:1px solid #eee;text-align:center;">
          <p style="margin:0;font-size:12px;color:#aaa;">Sent via <a href="${escapeHtml(baseUrl)}" style="color:#00b894;text-decoration:none;">Fishionaire Events</a></p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function formatDate(dateStr: string): string {
  try {
    const d = new Date(dateStr)
    return d.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
  } catch {
    return dateStr
  }
}
