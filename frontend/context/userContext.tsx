"use client"

import React, { createContext, useContext, useEffect, useState } from 'react'
import { setCookie, deleteCookie } from 'cookies-next/client'
import { usePathname } from 'next/navigation'
import { useRouter } from 'next/navigation'

export interface User {
  id: number
  email: string
  fullname: string
  username: string
}

export interface UserData {
  access_token: string
  token_type: string
  user: User
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  login: (userData: UserData) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    if (['/login', '/register'].includes(pathname || '')) {
      return
    }
    checkAuth()
  }, [pathname])

  const checkAuth = async () => {
    const token = localStorage.getItem('accessToken')
    if (token) {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_HOST}/users/me`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
        if (response.ok) {
          const userData = await response.json()
          setUser(userData)
        } else {
          localStorage.removeItem('accessToken')
          deleteCookie('accessToken')
        }
      } catch (error) {
        console.error('Auth check failed:', error)
        localStorage.removeItem('accessToken')
        deleteCookie('accessToken')
      }
    }
    setIsLoading(false)
  }

  const login = async (userData: UserData) => {
    localStorage.setItem('accessToken', userData.access_token)
    setCookie('accessToken', userData.access_token)
    setUser(userData.user)
  }

  const logout = () => {
    localStorage.removeItem('accessToken')
    deleteCookie('accessToken')
    setUser(null)
    router.push('/login')
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}