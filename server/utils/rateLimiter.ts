const store = new Map<string, { count: number, firstAttempt: number }>()

const MAX_ATTEMPTS = 10
const WINDOW_MS = 15 * 60 * 1000 // 15 minutes

/**
 * IP-based rate limiter for public token endpoints.
 * Returns { allowed: true } if under the limit, or throws a 429 error.
 * Only call this BEFORE a failed lookup — don't count successful lookups.
 */
export function checkRateLimit(ip: string, key: string): void {
  const id = `${key}:${ip}`
  const now = Date.now()
  const entry = store.get(id)

  if (!entry || now - entry.firstAttempt > WINDOW_MS) {
    // Window expired or first attempt — reset
    store.set(id, { count: 1, firstAttempt: now })
    return
  }

  if (entry.count >= MAX_ATTEMPTS) {
    const retryAfter = Math.ceil((entry.firstAttempt + WINDOW_MS - now) / 1000)
    throw createError({
      statusCode: 429,
      statusMessage: 'Too many attempts. Please try again later.',
      data: { retryAfter },
    })
  }

  entry.count++
}

/**
 * Call after a successful token lookup to NOT penalize the user.
 * Decrements the counter so valid requests aren't counted.
 */
export function resetRateLimit(ip: string, key: string): void {
  const id = `${key}:${ip}`
  const entry = store.get(id)
  if (entry && entry.count > 0) {
    entry.count--
  }
}

// Cleanup stale entries every 30 minutes
setInterval(() => {
  const now = Date.now()
  for (const [id, entry] of store) {
    if (now - entry.firstAttempt > WINDOW_MS) {
      store.delete(id)
    }
  }
}, 30 * 60 * 1000)
