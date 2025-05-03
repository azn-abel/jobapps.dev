import { Timeline, Text } from '@mantine/core'
import {
  IconGitBranch,
  IconGitPullRequest,
  IconGitCommit,
  IconMessageDots,
} from '@tabler/icons-react'
import { Application } from '../../types/applications'

import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'

dayjs.extend(relativeTime)

export default function InterviewTimeline({
  applications,
}: {
  applications: Application[]
}) {
  const interviews = applications
    .filter(
      (app) =>
        app.interviewDate &&
        (dayjs(app.interviewDate).isAfter(dayjs(), 'day') ||
          dayjs(app.interviewDate).isSame(dayjs(), 'day'))
    )
    .toSorted((a, b) => {
      if (a.interviewDate < b.interviewDate) return -1
      if (a.interviewDate > b.interviewDate) return 1
      return 0
    })

  return (
    <Timeline active={3} bulletSize={16} lineWidth={2}>
      {interviews.length > 0 ? (
        interviews.map((interview) => {
          return (
            <Timeline.Item
              title={interview.company + ' - ' + interview.jobTitle}
            >
              <Text size="xs" mt={4}>
                {interview.interviewDate}
              </Text>
            </Timeline.Item>
          )
        })
      ) : (
        <Timeline.Item title="No upcoming interviews." />
      )}
    </Timeline>
  )
}
