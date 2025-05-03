import { Application } from '../types/applications'

import { atom } from 'jotai'

export const selectedRowsAtom = atom<string[]>([])

export const selectedArchiveRowsAtom = atom<string[]>([])

export const homeApplicationsAtom = atom<Application[]>([])
export const archiveApplicationsAtom = atom<Application[]>([])

export const uniqueJobTitlesAtom = atom((get) => [
  ...new Set(get(homeApplicationsAtom).map((row) => row.jobTitle)),
])

export const uniqueCompaniesAtom = atom((get) => [
  ...new Set(get(homeApplicationsAtom).map((row) => row.company)),
])
