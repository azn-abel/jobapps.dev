import dayjs from 'dayjs'
import { Application } from '../types/applications'

type MonthCounts = {
  [key: string]: number
}

type DateData = {
  month: string
  Applications: number
}

export function getLastSixMonths(applications: Application[]) {
  const result: MonthCounts = {}

  for (let i = 5; i >= 0; i--) {
    const date = dayjs().subtract(i, 'month')
    const year = date.year()
    const monthName = date.format('MMMM')

    result[`${monthName} ${year}`] = 0
  }

  for (let app of applications) {
    const date = dayjs(app.applicationDate)
    const appYear = date.year().toString()
    const appMonth = date.format('MMMM')
    if (Object.keys(result).includes(`${appMonth} ${appYear}`)) {
      result[`${appMonth} ${appYear}`] += 1
    }
  }

  const formatted: Array<DateData> = []

  Object.keys(result).forEach((key) => {
    formatted.push({
      month: key.slice(0, 3),
      Applications: result[key],
    })
  })
  return formatted
}
