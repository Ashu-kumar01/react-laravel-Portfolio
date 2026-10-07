import { createContext, useCallback, useContext, useEffect, useLayoutEffect, useMemo, useState } from 'react'
import { configureAuth } from '../api/client'
import { authApi } from '../api/admin'
import { queryClient, queryKeys } from '../api/queryClient'

/**
 * Admin session. The API issues an expiring Sanctum bearer token; it is kept
 * in sessionStorage (cleared when the browser session ends) and never contains
 * the password. Expired/revoked tokens trigger a redirect to the login page.
 */
const STORAGE_KEY = 'ak.admin.session'
const AuthContext = createContext(null)

function readSession() {
  try {
    const session = JSON.parse(sessionStorage.getItem(STORAGE_KEY) ?? 'null')
    if (!session?.token) return null
    if (session.expiresAt && new Date(session.expiresAt).getTime() <= Date.now()) return null
    return session
  } catch {
    return null
  }
}

function writeSession(session) {
  try {
    if (session) sessionStorage.setItem(STORAGE_KEY, JSON.stringify(session))
    else sessionStorage.removeItem(STORAGE_KEY)
  } catch {
    /* storage unavailable (private mode) — session lives in memory only */
  }
}

let currentToken = readSession()?.token ?? null
let handleUnauthorized = () => {}

// Wired at module load so requests fired by child effects already carry the token.
configureAuth({
  getToken: () => currentToken,
  onUnauthorized: () => handleUnauthorized(),
})

export function AuthProvider({ children }) {
  const [session, setSession] = useState(readSession)
  const [expired, setExpired] = useState(false)

  const clear = useCallback((reason) => {
    currentToken = null
    writeSession(null)
    setSession(null)
    setExpired(reason === 'expired')
    queryClient.removeQueries({ queryKey: queryKeys.admin.all })
  }, [])

  useLayoutEffect(() => {
    handleUnauthorized = () => clear('expired')
  }, [clear])

  // Log out automatically when the token's expiry time is reached.
  useEffect(() => {
    if (!session?.expiresAt) return undefined
    const ms = new Date(session.expiresAt).getTime() - Date.now()
    if (ms <= 0) {
      const id = setTimeout(() => clear('expired'), 0)
      return () => clearTimeout(id)
    }
    const id = setTimeout(() => clear('expired'), Math.min(ms, 2 ** 31 - 1))
    return () => clearTimeout(id)
  }, [session?.expiresAt, clear])

  const login = useCallback(async (credentials) => {
    const { data } = await authApi.login(credentials)
    const next = { token: data.token, expiresAt: data.expires_at, user: data.user }
    currentToken = next.token
    writeSession(next)
    setExpired(false)
    setSession(next)
    return next
  }, [])

  const logout = useCallback(async () => {
    try {
      await authApi.logout()
    } catch {
      /* token may already be invalid; clear locally regardless */
    }
    clear('logout')
  }, [clear])

  const updateUser = useCallback((user) => {
    setSession((prev) => {
      if (!prev) return prev
      const next = { ...prev, user }
      writeSession(next)
      return next
    })
  }, [])

  const value = useMemo(
    () => ({
      user: session?.user ?? null,
      expiresAt: session?.expiresAt ?? null,
      isAuthenticated: Boolean(session?.token),
      expired,
      login,
      logout,
      updateUser,
    }),
    [session, expired, login, logout, updateUser],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
  return ctx
}
