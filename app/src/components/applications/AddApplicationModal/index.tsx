import { useDisclosure } from '@mantine/hooks'
import {
  Modal,
  Button,
  Flex,
  Autocomplete,
  Textarea,
  LoadingOverlay,
} from '@mantine/core'
import { DateInput } from '@mantine/dates'
import { isNotEmpty, useForm } from '@mantine/form'
import { useEffect, useState } from 'react'
import dayjs from 'dayjs'

import { uniqueJobTitlesAtom, uniqueCompaniesAtom } from '../../../state'
import { useAtom } from 'jotai'

import { validApplicationStates } from '../../../state/constants'

import { handleStatusDropdownClose } from '../util'
import {
  ApplicationDTO,
  ApplicationInput,
  DateString,
} from '../../../types/applications'

import CustomPillsInput from '../../global/CustomPillsInput'

import useApplicationsAPI from '@/hooks/applications'
import { isOnlineAtom } from '@/state/online'
import { authenticatedAtom } from '@/hooks/auth'

export default function AddApplicationModal({
  callback,
}: {
  callback: () => void
}) {
  const [opened, { open, close }] = useDisclosure(false)
  const [fetching, setFetching] = useState(false)

  const [isOnline] = useAtom(isOnlineAtom)
  const [isAuthenticated] = useAtom(authenticatedAtom)

  const [uniqueJobTitles] = useAtom(uniqueJobTitlesAtom)
  const [uniqueCompanies] = useAtom(uniqueCompaniesAtom)

  const [tags, setTags] = useState<string[]>([])

  const { postApplication } = useApplicationsAPI()

  const form = useForm<ApplicationInput>({
    mode: 'uncontrolled',
    initialValues: {
      jobTitle: '',
      company: '',
      status: '',
      tags: [],
      applicationDate: null,
      interviewDate: null,
      jobDescription: '',
    },
    validate: {
      jobTitle: isNotEmpty('Required'),
      company: isNotEmpty('Required'),
      status: (value) => {
        return !validApplicationStates.includes(value)
          ? 'Status must be one of: New, Assessment, Interview, Offer, Rejected'
          : null
      },
      applicationDate: isNotEmpty('Required'),
    },
  })

  const createApplication = async (values: ApplicationInput) => {
    const body: ApplicationDTO = {
      ...values,
      status: values.status || 'New',
      applicationDate: formatDate(values.applicationDate) || '',
      interviewDate: formatDate(values.interviewDate) || '',
      tags: tags,
    }

    if (body.interviewDate && ['New', 'Assessment'].includes(body.status))
      body.status = 'Interview'

    setFetching(true)
    const result = await postApplication(body)
    setFetching(false)

    if (!result.success) {
      //something went wrong
      return
    }
    close()
    callback()
  }

  useEffect(() => {
    form.setValues({
      jobTitle: '',
      company: '',
      status: '',
      jobDescription: '',
      applicationDate: null,
      interviewDate: null,
      tags: [],
    })
    setTags([])
  }, [opened])

  return (
    <>
      <Modal
        opened={opened}
        onClose={close}
        title="Add Application"
        removeScrollProps={{
          allowPinchZoom: true,
        }}
        centered
        size="lg"
      >
        <LoadingOverlay visible={fetching} zIndex={1000} />
        <form
          onSubmit={form.onSubmit(createApplication)}
          onKeyDown={(e: React.KeyboardEvent<HTMLFormElement>) => {
            if (
              e.code === 'Enter' &&
              (e.target as HTMLElement).tagName !== 'TEXTAREA'
            ) {
              e.preventDefault()
            }
          }}
        >
          <Autocomplete
            label="Job Title"
            placeholder="Job Title"
            data={uniqueJobTitles}
            withAsterisk
            key={form.key('jobTitle')}
            {...form.getInputProps('jobTitle')}
          />
          <Autocomplete
            label="Company"
            placeholder="Company Name"
            data={uniqueCompanies}
            withAsterisk
            key={form.key('company')}
            {...form.getInputProps('company')}
          />
          <Autocomplete
            label="Status"
            placeholder="Status"
            data={validApplicationStates}
            onDropdownClose={() => handleStatusDropdownClose(form)}
            withAsterisk
            key={form.key('status')}
            {...form.getInputProps('status')}
          />
          <DateInput
            label="Application Date"
            valueFormat="YYYY-MM-DD"
            placeholder="Choose Date"
            preserveTime={false}
            firstDayOfWeek={0}
            weekendDays={[]}
            withAsterisk
            onTouchEnd={(e: React.TouchEvent) =>
              ((e.target as HTMLInputElement).readOnly = true)
            }
            key={form.key('applicationDate')}
            {...form.getInputProps('applicationDate')}
          />
          <DateInput
            label="Interview Date"
            valueFormat="YYYY-MM-DD"
            placeholder="Choose Date"
            clearable
            firstDayOfWeek={0}
            weekendDays={[]}
            onTouchEnd={(e: React.TouchEvent) =>
              ((e.target as HTMLInputElement).readOnly = true)
            }
            key={form.key('interviewDate')}
            {...form.getInputProps('interviewDate')}
          />
          <CustomPillsInput tags={tags} setTags={setTags} showLabel />
          <Textarea
            label="Job Description"
            placeholder="Job Description"
            rows={8}
            maxLength={20000}
            key={form.key('jobDescroption')}
            {...form.getInputProps('jobDescription')}
          />
          <Flex justify="flex-end" mt={16}>
            <Button mr={16} color="red" onClick={close}>
              Cancel
            </Button>
            <Button type="submit">Save</Button>
          </Flex>
        </form>
      </Modal>
      {(!isOnline && isAuthenticated) || (
        <Button
          variant="default"
          onClick={open}
          hidden={!isOnline && isAuthenticated}
        >
          Add
        </Button>
      )}
    </>
  )
}

function formatDate(date?: Date | null): DateString | null {
  if (!date) return null
  return dayjs(date).format('YYYY-MM-DD') as DateString
}
