import { Timeline, Text, Group, Modal, List, Button } from '@mantine/core'
import { Application } from '@jobapps.dev/shared/types/applications'
import { IconFileSpark } from '@tabler/icons-react'
import { ActionIcon, Tooltip } from '@mantine/core'

import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import { useState } from 'react'

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

  const [modalOpened, setModalOpened] = useState(false)

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
                        onClick={() => setModalOpened(true)}
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
      />
    </>
  )
}

function InterviewQuestionsModal({
  opened,
  setOpened,
}: {
  opened: boolean
  setOpened: (opened: boolean) => void
}) {
  const questions = [
    "What aspects of Meta's technology and mission excites you the most, and how do you see yourself contributing to our efforts?",
    'Can you describe a situation where you had to balance competing priorities and meet multiple deadlines?',
    'Tell me about a time when you received feedback or constructive criticism on your work, and how you used it to improve.',
    "Give an example of a project you led or were a part of that you're particularly proud of, and what you learned from the experience.",
    'Can you walk me through your process for troubleshooting and resolving a difficult technical issue?',
  ]
  return (
    <Modal
      opened={opened}
      onClose={() => setOpened(false)}
      title="Interview Questions"
      size="lg"
      centered
    >
      <List type="ordered" px={16}>
        {questions.map((question, index) => (
          <List.Item key={index}>
            <Text>{question}</Text>
          </List.Item>
        ))}
      </List>
      <Button mt={16}>Re-generate</Button>
    </Modal>
  )
}
