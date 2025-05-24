import backendClient from './client'
import {
  Application,
  ApplicationDTO,
  ApplicationStore,
} from '@jobapps.dev/shared/types/applications'
import { InterviewResponse } from '@jobapps.dev/shared/types/interview'

export async function fetchInterviewQuestions(
  company: string,
  role: string
): Promise<JSONResponse<InterviewResponse>> {
  try {
    const response = await backendClient.get('/interview', {
      params: {
        company,
        role,
      },
    })
    return response.data
  } catch (e: any) {
    if (e.response?.status === 429) {
      return {
        success: false,
        detail: 'Rate limit exceeded. Please try again later.',
      }
    }
    return (
      e.response?.data || { success: false, detail: 'unknown error occurred' }
    )
  }
}

const NetworkInterviewAPI = {
  fetchInterviewQuestions,
}

export default NetworkInterviewAPI
