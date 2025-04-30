import { Application } from '../../types/applications'
import { Archive } from '../../types/archive'

import LocalApplicationsAPI from './applications'

import { downloadCSV } from './io'

const DeletesAPI = {
  key: 'deletes',

  fetchDeletes(): DeleteStore {
    const raw: string | null = localStorage.getItem(this.key)
    return raw
      ? JSON.parse(raw)
      : {
          applications: [],
          archive: [],
        }
  },

  fetchApplicationDeletes(): ApplicationDeletionStore {
    return this.fetchDeletes().applications
  },

  fetchArchiveDeletes(): ArchiveDeletionStore {
    return this.fetchDeletes().archive
  },

  postApplicationDelete(deletion: ApplicationDeletion) {
    const deletes = this.fetchDeletes()
    deletes.applications.push(deletion)
    localStorage.setItem(this.key, JSON.stringify(deletes))
  },

  postArchiveDelete(deletion: ArchiveDeletion) {
    const deletes = this.fetchDeletes()
    deletes.archive.push(deletion)
    localStorage.setItem(this.key, JSON.stringify(deletes))
  },

  flush() {
    localStorage.setItem(
      this.key,
      JSON.stringify({
        applications: [],
        archive: [],
      })
    )
  },
}

export default DeletesAPI
