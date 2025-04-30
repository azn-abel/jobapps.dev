import LocalApplicationsAPI from '@/api/localStorage/applications'
import backendClient from './client'
import {
  Application,
  ApplicationDTO,
  ApplicationStore,
} from '@/types/applications'

export async function fetchApplications(): Promise<
  JSONResponse<ApplicationStore>
> {
  try {
    const response = await backendClient.get('/applications')
    return response.data
  } catch (e: any) {
    return (
      e.response?.data || { success: false, detail: 'unknown error occurred' }
    )
  }
}

export async function postApplication(
  application: ApplicationDTO
): Promise<JSONResponse<Application>> {
  try {
    const response = await backendClient.post('/applications', application)
    return response.data
  } catch (e: any) {
    return (
      e.response?.data || { success: false, detail: 'unknown error occurred' }
    )
  }
}

export async function putApplication(
  applicationId: string,
  application: ApplicationDTO
): Promise<JSONResponse<Application>> {
  try {
    const response = await backendClient.put(
      `/applications/${applicationId}`,
      application
    )
    return response.data
  } catch (e: any) {
    return (
      e.response?.data || { success: false, detail: 'unknown error occurred' }
    )
  }
}

export async function putApplications(
  applications: ApplicationStore
): Promise<JSONResponse> {
  try {
    const response = await backendClient.put('/applications', applications)
    return response.data
  } catch (e: any) {
    return (
      e.response?.data || { success: false, detail: 'unknown error occurred' }
    )
  }
}

export async function deleteApplication(id: string): Promise<JSONResponse> {
  try {
    const response = await backendClient.delete(`/applications/${id}`)
    return response.data
  } catch (e: any) {
    return (
      e.response?.data || { success: false, detail: 'unknown error occurred' }
    )
  }
}

export async function deleteApplications(
  applicationIds: string[]
): Promise<JSONResponse> {
  try {
    const response = await backendClient.delete(`/applications`, {
      params: {
        ids: applicationIds.join(','),
      },
    })
    return response.data
  } catch (e: any) {
    return (
      e.response?.data || { success: false, detail: 'unknown error occurred' }
    )
  }
}

const NetworkApplicationsAPI = {
  fetchApplications,
  postApplication,
  putApplications,
  deleteApplication,
  deleteApplications,
}

export default NetworkApplicationsAPI
