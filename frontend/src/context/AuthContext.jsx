import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import {
  clearStoredTokens,
  fetchCurrentUser,
  getStoredTokens,
  loginUser,
  registerUser,
  setAuthToken,
  setRefreshToken,
} from '../services/api.js'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const initializeAuth = async () => {
      const { accessToken } = getStoredTokens()
      if (!accessToken) {
        setUser(null)
        setIsLoading(false)
        return
      }

      try {
        const response = await fetchCurrentUser()
        setUser(response.data)
      } catch {
        clearStoredTokens()
        setUser(null)
      } finally {
        setIsLoading(false)
      }
    }

    initializeAuth()
  }, [])

  const login = async (email, password) => {
    const response = await loginUser(email, password)
    const { access_token: accessToken, refresh_token: refreshToken } = response.data
    setAuthToken(accessToken)
    setRefreshToken(refreshToken)

    const profileResponse = await fetchCurrentUser()
    setUser(profileResponse.data)
    return profileResponse.data
  }

  const register = async (email, password) => {
    await registerUser(email, password)
    return login(email, password)
  }

  const logout = () => {
    clearStoredTokens()
    setUser(null)
  }

  const value = useMemo(
    () => ({
      user,
      isLoading,
      isAuthenticated: Boolean(user),
      login,
      register,
      logout,
    }),
    [user, isLoading],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used inside an AuthProvider.')
  }
  return context
}

export default AuthContext
