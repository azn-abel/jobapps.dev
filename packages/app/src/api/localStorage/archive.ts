import { Application } from '../../types/applications'
import { Archive } from '../../types/archive'

import LocalApplicationsAPI from './applications'
import { downloadCSV } from './io'

const FAILED_COULDNT_FETCH: JSONFail = {
  success: false,
  detail: "couldn't fetch archive from localStorage",
}

const FAILED_COULDNT_VALIDATE: JSONFail = {
  success: false,
  detail: "couldn't validate application",
}

const LocalArchiveAPI = {
  key: 'archive',

  fetchArchive(): JSONResponse<Archive> {
    const raw: string | null = localStorage.getItem(this.key)
    const content = raw ? JSON.parse(raw) : {}
    return {
      success: true,
      msg: 'fetched archive from localStorage',
      data: content,
    }
  },

  fetchArchiveAsList(): JSONResponse<Application[]> {
    const response = this.fetchArchive()
    if (!response.success) return FAILED_COULDNT_FETCH

    return {
      success: true,
      msg: 'fetched archive as list',
      data: Object.values(response.data),
    }
  },

  fetchArchiveTags(): JSONResponse<string[]> {
    const response = this.fetchArchive()
    if (!response.success) return FAILED_COULDNT_FETCH

    const applications = Object.values(response.data)
    const tags = new Set<string>()

    applications.forEach((app) => {
      app.tags.forEach((tag) => {
        tags.add(tag)
      })
    })

    return {
      success: true,
      msg: 'fetched archive tags from localStorage',
      data: [...tags],
    }
  },

  archiveApplications(applicationIds: string[]): JSONResponse {
    const applicationsResponse = LocalApplicationsAPI.fetchApplications()
    const archiveResponse = this.fetchArchive()
    if (!applicationsResponse.success || !archiveResponse.success)
      return FAILED_COULDNT_FETCH

    const applications = applicationsResponse.data
    const archive = archiveResponse.data

    let count = 0
    for (let id of applicationIds) {
      if (applications[id]) {
        archive[id] = applications[id]
        delete applications[id]
        count++
      }
    }

    localStorage.setItem(this.key, JSON.stringify(archive))
    localStorage.setItem(LocalApplicationsAPI.key, JSON.stringify(applications))
    return {
      success: true,
      msg: `archived ${count} applications`,
    }
  },

  deleteArchivedApplications(applicationIds: string[]): JSONResponse {
    const response = this.fetchArchive()
    if (!response.success) return FAILED_COULDNT_FETCH

    const archive = response.data

    for (let id of applicationIds) delete archive[id]

    localStorage.setItem(this.key, JSON.stringify(archive))

    return {
      success: true,
      msg: 'deleted applications, if exists',
    }
  },
}

export default LocalArchiveAPI
