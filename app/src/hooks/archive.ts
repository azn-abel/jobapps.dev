import { atom, useAtom } from 'jotai'

import { isOnlineAtom } from '@/state/online'
import { authenticatedAtom } from './auth'
import {
  Application,
  ApplicationDTO,
  ApplicationStore,
} from '@/types/applications'
import NetworkArchiveAPI from '@/api/network/archive'
import LocalArchiveAPI from '@/api/localStorage/archive'

const FAILED_SIGNED_IN_NO_INTERNET: JSONFail = {
  success: false,
  detail: 'no internet and signed in, pausing updates until back online',
}

export default function useArchiveAPI() {
  const [isAuthenticated] = useAtom(authenticatedAtom)
  const [isOnline] = useAtom(isOnlineAtom)

  const fetchArchive = async (): Promise<JSONResponse<ApplicationStore>> => {
    if (isAuthenticated) return await NetworkArchiveAPI.fetchArchive()
    return LocalArchiveAPI.fetchArchive()
  }

  const postToArchive = async (
    applicationIds: string[]
  ): Promise<JSONResponse> => {
    if (isOnline && isAuthenticated)
      return await NetworkArchiveAPI.postToArchive(applicationIds)

    if (!isAuthenticated)
      return LocalArchiveAPI.archiveApplications(applicationIds)

    return FAILED_SIGNED_IN_NO_INTERNET
  }

  const deleteFromArchive = async (
    applicationIds: string[]
  ): Promise<JSONResponse> => {
    if (isOnline && isAuthenticated)
      return await NetworkArchiveAPI.deleteFromArchive(applicationIds)

    if (!isAuthenticated)
      return LocalArchiveAPI.deleteArchivedApplications(applicationIds)

    return FAILED_SIGNED_IN_NO_INTERNET
  }

  return {
    fetchArchive,
    postToArchive,
    deleteFromArchive,
  }
}
