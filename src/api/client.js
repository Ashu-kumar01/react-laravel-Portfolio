import axios from 'axios'
import { env } from '../config/env'
import { toApiError } from './errors'

/**
 * Single axios instance for the whole app. React never talks to the
 * database — only to the Laravel API at VITE_API_BASE_URL.
 */
export const http = axios.create({
  baseURL: env.apiBaseUrl,
  timeout: 20000,
  headers: { Accept: 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
})

let tokenProvider = () => null
let unauthorizedHandler = () => {}

/** Wired up by the auth store so the API layer stays framework-agnostic. */
export function configureAuth({ getToken, onUnauthorized }) {
  tokenProvider = getToken
  unauthorizedHandler = onUnauthorized
}

http.interceptors.request.use((config) => {
  const token = tokenProvider()
  if (token && config.url?.startsWith('/admin')) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

http.interceptors.response.use(
  (response) => response,
  (error) => {
    const apiError = toApiError(error)
    const url = error?.config?.url ?? ''
    if (apiError.status === 401 && url.startsWith('/admin') && !url.startsWith('/admin/login')) {
      unauthorizedHandler(apiError)
    }
    return Promise.reject(apiError)
  },
)

/** Unwraps the standard { success, message, data, meta } envelope. */
export const unwrap = (response) => ({
  data: response.data?.data ?? null,
  meta: response.data?.meta ?? {},
  message: response.data?.message ?? '',
})

/**
 * Builds multipart FormData from a plain object. Arrays become `key[]`,
 * booleans become 1/0, Files are appended as-is and null/undefined are skipped.
 * An empty array is sent as an empty string so the server knows to clear it.
 */
export function toFormData(values, method) {
  const form = new FormData()
  if (method) form.append('_method', method)

  for (const [key, value] of Object.entries(values)) {
    if (value === undefined || value === null) continue
    if (Array.isArray(value)) {
      if (value.length === 0) form.append(key, '')
      value.forEach((item) => form.append(`${key}[]`, item instanceof Blob ? item : String(item)))
    } else if (typeof value === 'boolean') {
      form.append(key, value ? '1' : '0')
    } else if (value instanceof Blob) {
      form.append(key, value)
    } else {
      form.append(key, String(value))
    }
  }

  return form
}
