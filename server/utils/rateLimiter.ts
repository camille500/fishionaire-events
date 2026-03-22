const store = new Map<string, { count: number, firstAttempt: number }>()

const MAX_ATTEMPTS = 10
const WINDOW_MS = 15 * 60 * 1000 // 15 minutes

/**
 * IP-based rate limiter for public token endpoints.
 * Returns { allowed: true } if under the limit, or throws a 429 error.
 * Only call this BEFORE a failed lookup — don't count successful lookups.
 */
export function checkRateLimit(ip: string, key: string): void {
  _checkLimit(store, `${key}:${ip}`, MAX_ATTEMPTS, WINDOW_MS)
}

const aiStore = new Map<string, { count: number, firstAttempt: number }>()

const AI_MAX_ATTEMPTS = 20
const AI_WINDOW_MS = 15 * 60 * 1000 // 15 minutes

/**
 * User-based rate limiter for AI endpoints (protects against runaway OpenAI costs).
 * Call after auth check, before calling the AI controller.
 */
export function checkAiRateLimit(userId: string): void {
  _checkLimit(aiStore, `ai:${userId}`, AI_MAX_ATTEMPTS, AI_WINDOW_MS)
}

function _checkLimit(
  map: Map<string, { count: number, firstAttempt: number }>,
  id: string,
  maxAttempts: number,
  windowMs: number,
): void {
  const now = Date.now()
  const entry = map.get(id)

  if (!entry || now - entry.firstAttempt > windowMs) {
    map.set(id, { count: 1, firstAttempt: now })
    return
  }

  if (entry.count >= maxAttempts) {
    const retryAfter = Math.ceil((entry.firstAttempt + windowMs - now) / 1000)
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
  for (const [id, entry] of aiStore) {
    if (now - entry.firstAttempt > AI_WINDOW_MS) {
      aiStore.delete(id)
    }
  }
}, 30 * 60 * 1000)
