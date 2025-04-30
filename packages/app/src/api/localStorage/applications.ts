import {
  Application,
  ApplicationDTO,
  ApplicationStore,
  DateString,
} from '../../types/applications'

const FAILED_COULDNT_FETCH: JSONFail = {
  success: false,
  detail: "couldn't fetch applications from localStorage",
}

const FAILED_COULDNT_VALIDATE: JSONFail = {
  success: false,
  detail: "couldn't validate application",
}

const LocalApplicationsAPI = {
  key: 'applications',

  fetchApplications(): JSONResponse<ApplicationStore> {
    const raw = localStorage.getItem(this.key)
    const data = raw ? JSON.parse(raw) : {}

    return {
      success: true,
      msg: 'fetching applications from localStorage',
      data,
    }
  },

  fetchApplicationsAsList(): JSONResponse<Application[]> {
    const response = this.fetchApplications()
    if (!response.success) return FAILED_COULDNT_FETCH

    const applications = response.data
    return {
      success: true,
      msg: 'fetching applications as list from localStorage',
      data: Object.values(applications),
    }
  },

  postApplication(application: ApplicationDTO): JSONResponse<Application> {
    const newApp: Application | null = validateApplication(application)
    if (!newApp) return FAILED_COULDNT_VALIDATE

    const response = this.fetchApplications()
    if (!response.success) return FAILED_COULDNT_FETCH

    const applications = response.data

    applications[newApp.id] = newApp
    localStorage.setItem(this.key, JSON.stringify(applications))

    return {
      success: true,
      msg: 'posted application to localStorage',
      data: newApp,
    }
  },

  putApplications(newApplications: ApplicationStore): JSONResponse {
    const response = this.fetchApplications()
    if (!response.success) return FAILED_COULDNT_FETCH

    const applications = response.data

    const now = new Date()
    for (let app of Object.values(newApplications)) {
      if (
        !applications[app.id] ||
        applications[app.id].lastUpdated < app.lastUpdated
      ) {
        app.lastUpdated = now
        applications[app.id] = app
      }
    }

    localStorage.setItem(this.key, JSON.stringify(applications))
    return {
      success: true,
      msg: 'put applications to localStorage',
    }
  },

  putApplication(
    id: string,
    application: ApplicationDTO
  ): JSONResponse<Application> {
    const newApp = validateApplication({ id, ...application })
    if (!newApp) return FAILED_COULDNT_VALIDATE

    const response = this.fetchApplications()
    if (!response.success) return FAILED_COULDNT_FETCH

    const applications = response.data
    applications[id] = newApp
    localStorage.setItem(this.key, JSON.stringify(applications))
    return {
      success: true,
      msg: 'put application to localStorage',
      data: newApp,
    }
  },

  deleteApplication(id: string): JSONResponse {
    const response = this.fetchApplications()
    if (!response.success) return FAILED_COULDNT_FETCH

    const applications = response.data

    delete applications[id]
    localStorage.setItem(this.key, JSON.stringify(applications))
    return {
      success: true,
      msg: 'deleted application if exists',
    }
  },

  deleteApplications(applicationIds: string[]): JSONResponse {
    const response = this.fetchApplications()
    if (!response.success) return FAILED_COULDNT_FETCH

    const applications = response.data

    for (let id of applicationIds) delete applications[id]

    localStorage.setItem(this.key, JSON.stringify(applications))
    return {
      success: true,
      msg: 'deleted applications if exists',
    }
  },
}

function validateApplication(application: ApplicationDTO): Application | null {
  if (
    !application ||
    !application.jobTitle ||
    !application.company ||
    !application.status ||
    !application.applicationDate ||
    !application.tags
  )
    return null

  const { jobTitle, company, status, applicationDate, tags } = application

  const newApp = {
    id: application.id || crypto.randomUUID(),
    jobTitle,
    company,
    status,
    tags,
    applicationDate,
    interviewDate: application.interviewDate || ('' as DateString),
    jobDescription:
      application.jobDescription && application.jobDescription !== 'null'
        ? application.jobDescription
        : '',
    lastUpdated: new Date(),
  }

  return newApp
}

export default LocalApplicationsAPI
