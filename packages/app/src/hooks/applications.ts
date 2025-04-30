import { useState, useEffect } from 'react'
import * as NetworkApplicationsAPI from '@/api/network/applications'
import { atom, useAtom } from 'jotai'

import { isOnlineAtom } from '@/state/online'
import { authenticatedAtom } from './auth'
import LocalApplicationsAPI from '@/api/localStorage/applications'
import {
  Application,
  ApplicationDTO,
  ApplicationStore,
} from '@/types/applications'

const FAILED_SIGNED_IN_NO_INTERNET: JSONFail = {
  success: false,
  detail: 'no internet and signed in, pausing updates until back online',
}

export default function useApplicationsAPI() {
  const [isAuthenticated] = useAtom(authenticatedAtom)
  const [isOnline] = useAtom(isOnlineAtom)

  const fetchApplications = async (): Promise<
    JSONResponse<ApplicationStore>
  > => {
    if (isAuthenticated) return await NetworkApplicationsAPI.fetchApplications()
    return LocalApplicationsAPI.fetchApplications()
  }

  const postApplication = async (
    application: ApplicationDTO
  ): Promise<JSONResponse<Application>> => {
    if (isOnline && isAuthenticated)
      return await NetworkApplicationsAPI.postApplication(application)

    if (!isAuthenticated)
      return LocalApplicationsAPI.postApplication(application)

    return FAILED_SIGNED_IN_NO_INTERNET
  }

  const putApplication = async (
    applicationId: string,
    application: ApplicationDTO
  ): Promise<JSONResponse<Application>> => {
    if (isOnline && isAuthenticated)
      return await NetworkApplicationsAPI.putApplication(
        applicationId,
        application
      )

    if (!isAuthenticated)
      return LocalApplicationsAPI.putApplication(applicationId, application)

    return FAILED_SIGNED_IN_NO_INTERNET
  }

  const putApplications = async (
    applications: ApplicationStore
  ): Promise<JSONResponse> => {
    if (isOnline && isAuthenticated)
      return await NetworkApplicationsAPI.putApplications(applications)

    if (!isAuthenticated)
      return LocalApplicationsAPI.putApplications(applications)

    return FAILED_SIGNED_IN_NO_INTERNET
  }

  const deleteApplication = async (applicationId: string) => {
    if (isOnline && isAuthenticated)
      return await NetworkApplicationsAPI.deleteApplication(applicationId)

    if (!isAuthenticated)
      return LocalApplicationsAPI.deleteApplication(applicationId)

    return FAILED_SIGNED_IN_NO_INTERNET
  }

  const deleteApplications = async (applicationIds: string[]) => {
    if (isOnline && isAuthenticated)
      return await NetworkApplicationsAPI.deleteApplications(applicationIds)

    if (!isAuthenticated)
      return LocalApplicationsAPI.deleteApplications(applicationIds)

    return FAILED_SIGNED_IN_NO_INTERNET
  }

  return {
    fetchApplications,
    postApplication,
    putApplication,
    putApplications,
    deleteApplication,
    deleteApplications,
  }
}
