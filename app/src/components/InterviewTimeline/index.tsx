import {
  Timeline,
  Text,
  Group,
  Modal,
  List,
  Button,
  LoadingOverlay,
  rem,
} from '@mantine/core'
import { Application } from '@jobapps.dev/shared/types/applications'
import { IconFileSpark } from '@tabler/icons-react'
import { ActionIcon, Tooltip } from '@mantine/core'

import { authenticatedAtom } from '@/hooks/auth'

import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import { useEffect, useState } from 'react'
import { useAtom } from 'jotai'
import { Interview } from '@jobapps.dev/shared/types/interview'

import { fetchInterviewQuestions } from '@/api/network/interview'

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

  const [isAuthenticated] = useAtom(authenticatedAtom)
  const [modalOpened, setModalOpened] = useState(false)
  const [company, setCompany] = useState('')
  const [role, setRole] = useState('')

  return (
    <>
      <Timeline active={3} bulletSize={16} lineWidth={2}>
        {interviews.length > 0 ? (
          interviews.map((interview) => {
            return (
              <Timeline.Item
                title={
                  <Group gap={4}>
                    {interview.company + ' - ' + interview.jobTitle}
                    <Tooltip
                      label="Generate Interview Questions"
                      position="right"
                      withArrow
                    >
                      <ActionIcon
                        variant="transparent"
                        size={16}
                        onClick={() => {
                          setModalOpened(true)
                          setCompany(interview.company)
                          setRole(interview.jobTitle)
                        }}
                      >
                        <IconFileSpark size={16} color="#C5A939" />
                      </ActionIcon>
                    </Tooltip>
                  </Group>
                }
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
      <InterviewQuestionsModal
        opened={modalOpened}
        setOpened={setModalOpened}
        company={company}
        role={role}
      />
    </>
  )
}

function InterviewQuestionsModal({
  opened,
  setOpened,
  company,
  role,
}: {
  opened: boolean
  setOpened: (opened: boolean) => void
  company: string
  role: string
}) {
  const [questions, setQuestions] = useState<Interview[]>([])
  const [remaining, setRemaining] = useState<number>(-1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string>('')

  const [isAuthenticated] = useAtom(authenticatedAtom)

  useEffect(() => {
    setQuestions([])
    setRemaining(-1)
    setError('')
  }, [company])

  const fetchQuestions = async () => {
    setLoading(true)
    setError('')
    setQuestions([])
    setRemaining(-1)
    try {
      const response = await fetchInterviewQuestions(company, role)
      if (response.success) {
        setQuestions(response.data.questions)
        setRemaining(response.data.remaining)
      } else {
        setError(response.detail)
      }
    } catch (e) {
      setError('An error occurred while fetching questions.')
    } finally {
      setLoading(false)
    }
  }

  if (!isAuthenticated) {
    return (
      <Modal
        opened={opened}
        onClose={() => setOpened(false)}
        title="Interview Questions"
        size="lg"
        centered
      >
        <Text>Sign in to generate interview questions.</Text>
        <Button mt={16} onClick={() => setOpened(false)} color="red">
          Close
        </Button>
      </Modal>
    )
  }

  return (
    <Modal
      opened={opened}
      onClose={() => setOpened(false)}
      title="Interview Questions"
      size="lg"
      centered
    >
      {loading && <LoadingOverlay visible mt={32} />}
      {questions.length === 0 && !loading && (
        <Text>Click to generate interview questions.</Text>
      )}
      {error && <Text c="red">{error}</Text>}
      <List type="ordered" px={16}>
        {questions.map((question, index) => (
          <List.Item key={index}>
            <Text>{question}</Text>
          </List.Item>
        ))}
      </List>
      {remaining >= 0 && questions.length > 0 && (
        <Text c="dimmed">Remaining: {remaining}</Text>
      )}
      <Button mt={16} onClick={() => fetchQuestions()}>
        Generate
      </Button>
    </Modal>
  )
}
