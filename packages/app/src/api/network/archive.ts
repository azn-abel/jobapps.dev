import backendClient from './client'
import { Archive } from '@/types/archive'

export async function fetchArchive(): Promise<JSONResponse<Archive>> {
  try {
    const response = await backendClient.get('/archive')
    return response.data
  } catch (e: any) {
    return (
      e.response?.data || { success: false, detail: 'unknown error occurred' }
    )
  }
}

export async function postToArchive(
  applicationIds: string[]
): Promise<JSONResponse> {
  try {
    const response = await backendClient.post('/archive', {
      applicationIds,
    })
    return response.data
  } catch (e: any) {
    return (
      e.response?.data || { success: false, detail: 'unknown error occurred' }
    )
  }
}

export async function deleteFromArchive(
  applicationIds: string[]
): Promise<JSONResponse> {
  try {
    await Promise.allSettled(
      applicationIds.map((id) => {
        backendClient.delete(`/archive/${id}`)
      })
    )
    return {
      success: true,
      msg: 'deleted applications successfully',
    }
  } catch (e: any) {
    return (
      e.response?.data || { success: false, detail: 'unknown error occurred' }
    )
  }
}

const NetworkArchiveAPI = {
  fetchArchive,
  postToArchive,
  deleteFromArchive,
}

export default NetworkArchiveAPI
