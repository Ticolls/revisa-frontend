"use client"

import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from "react"
import { authService } from "@/lib/api/services/auth.service"
import { User } from "@/lib/api/types"

interface AuthContextType {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  refreshUser: () => Promise<void>
  setUser: (user: User | null) => void
  updateUser: (user: User) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [hasInitialized, setHasInitialized] = useState(false)

  const loadUser = async () => {
    if (hasInitialized) return
    
    try {
      const currentUser = await authService.getCurrentUser()
      setUser(currentUser)
      setIsAuthenticated(!!currentUser)
    } catch (error) {
      setUser(null)
      setIsAuthenticated(false)
    } finally {
      setIsLoading(false)
      setHasInitialized(true)
    }
  }

  useEffect(() => {
    loadUser()
  }, [])

  const refreshUser = async () => {
    setIsLoading(true)
    setHasInitialized(false)
    authService.clearCache() 
    await loadUser()
  }

  const updateUser = useCallback((newUser: User) => {
    setUser(newUser)
    setIsAuthenticated(true)
    setIsLoading(false)
    setHasInitialized(true)
  }, [])

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated,
        refreshUser,
        setUser,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

export function useRequireAuth(redirectUrl = "/login") {
  const { user, isLoading, isAuthenticated } = useAuth()

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      window.location.href = redirectUrl
    }
  }, [isLoading, isAuthenticated, redirectUrl])

  return { user, isLoading, isAuthenticated }
}
