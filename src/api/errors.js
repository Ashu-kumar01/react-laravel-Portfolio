/**
 * Normalised error used throughout the UI. Never exposes raw server
 * exceptions; messages are safe to show to visitors.
 */
export class ApiError extends Error {
  constructor({ message, status = 0, errors = {}, kind = 'api' }) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.errors = errors
    this.kind = kind // 'network' | 'validation' | 'auth' | 'forbidden' | 'not_found' | 'rate_limit' | 'server' | 'api'
  }

  get isNetwork() {
    return this.kind === 'network'
  }

  get isValidation() {
    return this.kind === 'validation'
  }
}

export const MESSAGES = {
  network: 'Connection lost.',
  networkDetail: 'Check your internet connection and try again.',
  loadFailed: 'Unable to load this content. Please try again.',
  server: 'Something went wrong.',
  serverDetail: 'An unexpected error occurred on our side. Please try again in a moment.',
  rateLimit: 'Too many requests. Please wait a moment and try again.',
}

const kindFromStatus = (status) => {
  if (status === 401) return 'auth'
  if (status === 403) return 'forbidden'
  if (status === 404) return 'not_found'
  if (status === 422) return 'validation'
  if (status === 429) return 'rate_limit'
  if (status >= 500) return 'server'
  return 'api'
}

/** Converts an axios error (or anything thrown) into an ApiError. */
export function toApiError(error) {
  if (error instanceof ApiError) return error

  if (error?.response) {
    const { status, data } = error.response
    const kind = kindFromStatus(status)
    let message = typeof data?.message === 'string' ? data.message : MESSAGES.loadFailed
    if (kind === 'server') message = MESSAGES.server
    if (kind === 'rate_limit') message = MESSAGES.rateLimit
    return new ApiError({ message, status, errors: data?.errors ?? {}, kind })
  }

  if (error?.code === 'ERR_CANCELED') {
    return new ApiError({ message: 'Request cancelled.', kind: 'api' })
  }

  // No response at all: offline, DNS, CORS or server down.
  return new ApiError({ message: MESSAGES.network, kind: 'network' })
}

/** First validation message per field, for react-hook-form's setError. */
export function fieldErrors(error) {
  const out = {}
  for (const [field, messages] of Object.entries(error?.errors ?? {})) {
    const key = field.replace(/\.(\d+)$/, '') // "technologies.2" -> "technologies"
    if (!out[key]) out[key] = Array.isArray(messages) ? messages[0] : String(messages)
  }
  return out
}
