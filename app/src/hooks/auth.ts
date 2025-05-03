import { useState, useEffect } from 'react'
import {
  fetchCurrentUser,
  requestLogout,
  sendGoogleToken,
} from '@/api/network/auth'
import { atom, useAtom } from 'jotai'
import { archiveApplicationsAtom, homeApplicationsAtom } from '@/state'

export const authenticatedAtom = atom(false)
export const userAtom = atom<User | null>(null)
export const authLoadingAtom = atom(true)

export default function useAuth() {
  const [isLoading, setIsLoading] = useAtom(authLoadingAtom)
  const [isAuthenticated, setIsAuthenticated] = useAtom(authenticatedAtom)
  const [homeApplications, setHomeApplications] = useAtom(homeApplicationsAtom)
  const [archiveApplications, setArchiveApplications] = useAtom(
    archiveApplicationsAtom
  )
  const [user, setUser] = useAtom(userAtom)

  useEffect(() => {
    const initializeAuth = async () => {
      setIsLoading(true)
      const response = await fetchCurrentUser()
      if (response.success) {
        setUser(response.data)
        setIsAuthenticated(true)
      } else {
        setIsAuthenticated(false)
      }
      setIsLoading(false)
    }

    initializeAuth()
  }, [])

  const login = async (token: string) => {
    setIsLoading(true)
    const response = await sendGoogleToken(token)
    if (response.success) {
      setUser(response.data)
      setIsAuthenticated(true)
    }
    setIsLoading(false)
    return response
  }
  const logout = async () => {
    setIsLoading(true)
    const response = await requestLogout()
    if (response.success) {
      setUser(null)
      setArchiveApplications([])
      setHomeApplications([])
      setIsAuthenticated(false)
    }
    setIsLoading(false)
  }

  return { user, isAuthenticated, isLoading, login, logout }
}
