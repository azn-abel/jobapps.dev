import backendClient from './client'

export async function sendGoogleToken(
  token: string
): Promise<JSONResponse<User>> {
  try {
    const response = await backendClient.post('/auth/login-with-google', {
      token,
    })
    return response.data
  } catch (e: any) {
    return (
      e.response?.data || { success: false, detail: 'unknown error occurred' }
    )
  }
}

export async function fetchCurrentUser(): Promise<JSONResponse<User>> {
  try {
    const response = await backendClient.get('/auth/current-user')
    return response.data
  } catch (e: any) {
    console.log(e)
    return (
      e.response?.data || { success: false, detail: 'unknown error occurred' }
    )
  }
}

export async function requestLogout(): Promise<JSONResponse> {
  try {
    const response = await backendClient.post('/auth/logout')
    return response.data
  } catch (e: any) {
    return (
      e.response?.data || { success: false, detail: 'unknown error occurred' }
    )
  }
}
