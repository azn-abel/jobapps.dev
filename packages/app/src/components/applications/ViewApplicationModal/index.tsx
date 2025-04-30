import {
  Modal,
  Button,
  Flex,
  Select,
  Textarea,
  LoadingOverlay,
  Autocomplete,
} from '@mantine/core'
import { DateInput } from '@mantine/dates'
import { isNotEmpty, useForm } from '@mantine/form'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'

import LocalApplicationsAPI from '../../../api/localStorage/applications'

import { uniqueJobTitlesAtom, uniqueCompaniesAtom } from '../../../state'
import { useAtom } from 'jotai'

import { validApplicationStates } from '../../../state/constants'
import { handleStatusDropdownClose } from '../util'

import { useState, useEffect } from 'react'
import {
  Application,
  ApplicationDTO,
  ApplicationInput,
  DateString,
} from '../../../types/applications'

import CustomPillsInput from '../../global/CustomPillsInput'
import LocalArchiveAPI from '../../../api/localStorage/archive'

dayjs.extend(utc)
dayjs.extend(timezone)

export default function EditApplicationModal({
  opened,
  open,
  close,
  application,
  callback,
}: {
  opened: boolean
  open: () => void
  close: () => void
  application: Application | null
  callback: () => void
}) {
  const [uniqueJobTitles] = useAtom(uniqueJobTitlesAtom)
  const [uniqueCompanies] = useAtom(uniqueCompaniesAtom)

  const [tags, setTags] = useState<string[]>([])

  const form = useForm<ApplicationInput>({
    mode: 'uncontrolled',
    initialValues: {
      jobTitle: '',
      company: '',
      status: 'New',
      tags: [],
      applicationDate: null,
      interviewDate: null,
      jobDescription: '',
    },
    validate: {
      jobTitle: isNotEmpty('Required'),
      company: isNotEmpty('Required'),
      status: (value) =>
        !validApplicationStates.includes(value)
          ? 'Status must be one of: New, Assessment, Interview, Offer, Rejected'
          : null,
      applicationDate: isNotEmpty('Required'),
    },
  })

  const [fetching, setFetching] = useState(false)

  const removeApplication = async () => {
    setFetching(true)
    application && LocalArchiveAPI.deleteArchivedApplications([application?.id])
    setFetching(false)

    close()
    callback()
  }

  useEffect(() => {
    form.setValues({
      jobTitle: application?.jobTitle || '',
      company: application?.company || '',
      status: application?.status || 'New',
      jobDescription: application?.jobDescription || '',
      tags: application?.tags,
      applicationDate: dayjs(application?.applicationDate).toDate(),
      interviewDate: application?.interviewDate
        ? dayjs(application.interviewDate).toDate()
        : null,
    })
    setTags(application?.tags || [])
  }, [application])

  return (
    <>
      <Modal
        opened={opened}
        onClose={close}
        title="View Application"
        removeScrollProps={{
          allowPinchZoom: true,
        }}
        centered
        size="lg"
      >
        <LoadingOverlay visible={fetching} zIndex={1000} />
        <form
          onSubmit={form.onSubmit(close)}
          onKeyDown={(e) => {
            if (
              e.code === 'Enter' &&
              (e.target as HTMLInputElement).tagName !== 'TEXTAREA'
            ) {
              e.preventDefault()
            }
          }}
        >
          <Autocomplete
            label="Job Title"
            placeholder="Job Title"
            withAsterisk
            data={uniqueJobTitles}
            key={form.key('jobTitle')}
            {...form.getInputProps('jobTitle')}
            readOnly
            variant="unstyled"
          />
          <Autocomplete
            label="Company"
            placeholder="Company Name"
            data={uniqueCompanies}
            withAsterisk
            key={form.key('company')}
            {...form.getInputProps('company')}
            readOnly
            variant="unstyled"
          />
          <Select
            label="Status"
            placeholder="Status"
            defaultValue={application?.status}
            data={['New', 'Assessment', 'Interview', 'Offer', 'Rejected']}
            onDropdownClose={() => handleStatusDropdownClose(form)}
            withAsterisk
            key={form.key('status')}
            {...form.getInputProps('status')}
            readOnly
            variant="unstyled"
          />
          <DateInput
            label="Application Date"
            valueFormat="YYYY-MM-DD"
            placeholder="Choose Date"
            preserveTime={false}
            firstDayOfWeek={0}
            weekendDays={[]}
            withAsterisk
            onTouchEnd={(e) => ((e.target as HTMLInputElement).readOnly = true)}
            key={form.key('applicationDate')}
            {...form.getInputProps('applicationDate')}
            readOnly
            variant="unstyled"
          />
          <DateInput
            label="Interview Date"
            valueFormat="YYYY-MM-DD"
            placeholder="No Date Specified"
            clearable
            preserveTime={false}
            firstDayOfWeek={0}
            weekendDays={[]}
            onTouchEnd={(e) => ((e.target as HTMLInputElement).readOnly = true)}
            key={form.key('interviewDate')}
            {...form.getInputProps('interviewDate')}
            readOnly
            variant="unstyled"
          />
          <CustomPillsInput
            tags={tags}
            setTags={setTags}
            showLabel
            readOnly
            unstyled
          />
          <Textarea
            label="Job Description"
            placeholder="No Job Description Provided"
            rows={8}
            maxLength={20000}
            key={form.key('jobDescription')}
            {...form.getInputProps('jobDescription')}
            readOnly
            variant="unstyled"
          />
          <Flex justify="space-between" mt={16}>
            <Button
              mr={16}
              color="red"
              onClick={removeApplication}
              style={{ justifySelf: 'start' }}
            >
              Delete
            </Button>
            <Flex>
              <Button onClick={close}>Close</Button>
            </Flex>
          </Flex>
        </form>
      </Modal>
    </>
  )
}

function formatDate(date?: Date | DateString): DateString {
  if (!date) return ''
  return dayjs(date).format('YYYY-MM-DD') as DateString
}
