type ApplicationDeletion = {
  applicationId: string
  deleted: Date
}
type ArchiveDeletion = {
  applicationId: string
  deleted: Date
}

type ApplicationDeletionStore = ApplicationDeletion[]
type ArchiveDeletionStore = ArchiveDeletion[]

type DeleteStore = {
  applications: ApplicationDeletionStore
  archive: ArchiveDeletionStore
}
