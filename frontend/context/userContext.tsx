"use client"

import React, { createContext, useContext, useEffect, useState } from 'react'
import { setCookie, deleteCookie } from 'cookies-next/client'
import { usePathname } from 'next/navigation'
import { useRouter } from 'next/navigation'
import { getUserData } from '@/utils/getUserData'

export interface User {
  id: number
  email: string
  fullname: string
  username: string,
  is_admin: boolean
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
    const user = getUserData()
    if(user){
      setUser(user)
    }
    else
      router.push('/login') 

  }, [pathname])

  const login = async (userData: UserData) => {
    localStorage.setItem('userData', JSON.stringify(userData.user))
    setCookie('accessToken', userData.access_token)
    setCookie('user_id', userData.user.id)
    setUser(userData.user)
  }

  const logout = () => {
    localStorage.removeItem('accessToken')
    localStorage.removeItem('userData')
    deleteCookie('accessToken')
    deleteCookie('user_id')
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