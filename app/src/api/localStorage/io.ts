import Papa, { ParseStepResult } from 'papaparse'
import LocalApplicationsAPI from './applications'
import { Application, ApplicationKeys } from '../../types/applications'

export function downloadCSV(
  data: Application[],
  filename = 'Job Applications.csv'
) {
  if (!data.length) return

  const headers: (keyof Application)[] = ApplicationKeys

  const encoder = new TextEncoder()
  const stream = new ReadableStream({
    start(controller) {
      const escape = (str: string) => `"${String(str).replace(/"/g, '""')}"`

      // write headers
      controller.enqueue(encoder.encode(headers.map(escape).join(',') + '\n'))

      // write rows
      for (const obj of data) {
        if (!obj.interviewDate) obj.interviewDate = ''
        if (!obj.applicationDate) obj.applicationDate = ''
        const row = headers.map((key: keyof Application) => {
          if (key === 'tags' && !obj[key]) obj[key] = []
          return escape(
            typeof obj[key] === 'string' ? obj[key] : JSON.stringify(obj[key])
          )
        })
        controller.enqueue(encoder.encode(row.join(',') + '\n'))
      }

      controller.close()
    },
  })

  new Response(stream).blob().then((blob) => {
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  })
}

export function importCSV(file: File): Promise<Application[]> {
  const applications = LocalApplicationsAPI.fetchApplications()
  const ids = Object.keys(applications)
  const results: Application[] = []
  const handleResult = (result: ParseStepResult<Application>) => {
    const formatted: any = {}

    for (const key of ApplicationKeys) {
      if (!result.data[key]) {
        if (key === 'tags') formatted[key] = []
        else formatted[key] = ''
        continue
      }
      try {
        // @ts-ignore
        formatted[key] = JSON.parse(result.data[key])
      } catch {
        formatted[key] = result.data[key]
      }
    }

    if (!formatted.interviewDate) formatted.interviewDate = ''
    if (!ids.includes(formatted.id)) results.push(formatted)
  }
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      step: handleResult,
      dynamicTyping: true,
      complete: () => resolve(results),
      error: reject,
    })
  })
}
