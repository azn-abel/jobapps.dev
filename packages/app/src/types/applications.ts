export type ApplicationStatus =
  | 'New'
  | 'Assessment'
  | 'Interview'
  | 'Offer'
  | 'Rejected'

export type Year = `${number}`
export type Month = `0${1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9}` | `1${0 | 1 | 2}`
export type Day =
  | `0${1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9}`
  | `${1 | 2}${number}`
  | `3${0 | 1}`

export type DateString = `${Year}-${Month}-${Day}` | ''

export type Application = {
  id: string
  jobTitle: string
  company: string
  status: ApplicationStatus
  tags: string[]
  applicationDate: DateString
  interviewDate: DateString
  jobDescription: string
  lastUpdated: Date
}

export type ApplicationStore = Record<string, Application>

export const ApplicationKeys: (keyof Application)[] = [
  'id',
  'jobTitle',
  'company',
  'status',
  'tags',
  'applicationDate',
  'interviewDate',
  'jobDescription',
]

export type ApplicationDTO = {
  id?: string
  jobTitle: string
  company: string
  status: ApplicationStatus
  tags: string[]
  applicationDate: DateString
  interviewDate?: DateString
  jobDescription?: string
}

export type ApplicationInput = {
  id?: string
  jobTitle: string
  company: string
  status: ApplicationStatus | ''
  tags: string[]
  applicationDate: Date | null
  interviewDate?: Date | null
  jobDescription?: string
}

export type FilterableApplication = {
  id: string
  jobTitle: string
  company: string
  status: ApplicationStatus
  applicationDate: DateString
  interviewDate: DateString
  jobDescription: string
}
