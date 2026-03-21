interface InviteEmailData {
  eventTitle: string
  eventDate?: string | null
  eventLocation?: string | null
  coverImageUrl?: string | null
  inviteeName?: string | null
  inviteLink: string
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
          <p style="margin:24px 0 0;font-size:13px;color:#999;text-align:center;line-height:1.5;">
            If the button doesn't work, copy this link:<br />
            <a href="${escapeHtml(data.inviteLink)}" style="color:#00b894;word-break:break-all;">${escapeHtml(data.inviteLink)}</a>
          </p>
        </td></tr>
        <tr><td style="padding:16px 32px;background:#fafafa;border-top:1px solid #eee;text-align:center;">
          <p style="margin:0;font-size:12px;color:#aaa;">Sent via <a href="${escapeHtml(data.inviteLink.split('/invite')[0])}" style="color:#00b894;text-decoration:none;">Fishionaire Events</a></p>
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
