import { useState, useEffect, ChangeEvent, useRef } from 'react'
import {
  Title,
  Card,
  Grid,
  Text,
  TextInput,
  Flex,
  UnstyledButton,
  Center,
  keys,
  Checkbox,
  Group,
  Table,
  Button,
  Switch,
} from '@mantine/core'
import cx from 'clsx'
import {
  IconChevronDown,
  IconChevronUp,
  IconSearch,
  IconSelector,
} from '@tabler/icons-react'

import classes from './Index.module.css'

import { useDisclosure, useMediaQuery } from '@mantine/hooks'

import { atom, useAtom } from 'jotai'
import { archiveApplicationsAtom, selectedArchiveRowsAtom } from '../state'
import { downloadCSV } from '../api/localStorage/io'
import { conditionalS } from '../utils'

import { Application, FilterableApplication } from '../types/applications'

import { ReactNode } from 'react'
import { animationProps } from '../state/constants'

import { MotionContainer } from '../state/constants'

import CustomPillsInput from '../components/global/CustomPillsInput'
import ViewApplicationModal from '../components/applications/ViewApplicationModal'
import useArchiveAPI from '@/hooks/archive'
import { authenticatedAtom } from '@/hooks/auth'

const archiveTagsAtom = atom<string[]>([])
const showArchiveTagsAtom = atom<boolean>(false)

export default function Archive() {
  const [applications, setApplications] = useAtom(archiveApplicationsAtom)
  const [selectedRows, setSelectedRows] = useAtom(selectedArchiveRowsAtom)

  const [isAuthenticated] = useAtom(authenticatedAtom)

  const isFirstRender = useRef(true)

  const { fetchArchive } = useArchiveAPI()

  const [tags, setTags] = useAtom(archiveTagsAtom)
  const [showTags, setShowTags] = useAtom(showArchiveTagsAtom)

  const numInterviews = applications.filter((app) =>
    ['Interview', 'Offer'].includes(app.status)
  ).length
  const numOffers = applications.filter((app) => app.status === 'Offer').length

  const smallScreen = useMediaQuery('(max-width: 512px)')

  const fillApplications = async () => {
    const response = await fetchArchive()
    if (!response || !response.success) {
      // something went wrong
      return
    }
    setApplications(Object.values(response.data))
    setSelectedRows([])
  }

  const exportCSV = () => {
    downloadCSV(
      applications.filter((row) => {
        if (!row.id) return false
        return selectedRows.includes(row.id)
      })
    )
  }

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false
      if (applications.length === 0) fillApplications()
      return
    }
    setApplications([])
    fillApplications()
  }, [isAuthenticated])

  return (
    <>
      <MotionContainer {...animationProps} pos="relative">
        <Flex justify="space-between" align="center" wrap="wrap">
          <Title>Archive</Title>
        </Flex>
        <Grid mt={24} mb={24}>
          <Grid.Col span={4}>
            <Card shadow="md" radius={8}>
              <Title order={2}>{applications?.length || 0}</Title>
              <Text size={smallScreen ? 'xs' : 'md'}>
                Application{conditionalS(applications?.length)}
              </Text>
            </Card>
          </Grid.Col>
          <Grid.Col span={4}>
            <Card shadow="md" radius={8}>
              <Title order={2}>{numInterviews || 0}</Title>
              <Text size={smallScreen ? 'xs' : 'md'}>
                Interview{conditionalS(numInterviews)}
              </Text>
            </Card>
          </Grid.Col>
          <Grid.Col span={4}>
            <Card shadow="md" radius={8}>
              <Title order={2}>{numOffers || 0}</Title>
              <Text size={smallScreen ? 'xs' : 'md'}>
                Offer{conditionalS(numOffers)}
              </Text>
            </Card>
          </Grid.Col>
        </Grid>
        <Flex justify="space-between" wrap="wrap" gap={12}>
          <Flex gap={12} align="center">
            <Title order={2}>Applications</Title>
          </Flex>
          <Flex gap={12}>
            {selectedRows?.length > 0 && (
              <>
                {/* <DeleteSelectedApplicationModal callback={fillApplications} /> */}
                <Button onClick={exportCSV}>Export</Button>
              </>
            )}
          </Flex>
        </Flex>
        <Flex mt={12} gap={12} align="center">
          <Switch
            label="Show Tags"
            onChange={(event) => setShowTags(event.currentTarget.checked)}
          />
          <CustomPillsInput tags={tags} setTags={setTags}></CustomPillsInput>
        </Flex>
        <Card
          mt={24}
          mb={24}
          radius={8}
          shadow="md"
          style={{ overflowX: 'scroll' }}
          className="hide-scroll"
        >
          <ApplicationsTable
            applications={applications}
            callback={fillApplications}
          />
        </Card>
      </MotionContainer>
    </>
  )
}

function ApplicationsTable({
  applications,
  callback,
}: {
  applications: Application[]
  callback: () => void
}) {
  const [opened, { open, close }] = useDisclosure(false)

  const [search, setSearch] = useState('')
  const [sortedApplications, setSortedApplications] = useState(applications)
  const [sortBy, setSortBy] = useState<keyof FilterableApplication | null>(null)
  const [reverseSortDirection, setReverseSortDirection] = useState(false)

  const [tags, setTags] = useAtom(archiveTagsAtom)
  const [showTags, setShowTags] = useAtom(showArchiveTagsAtom)

  const [selectedApplication, setSelectedApplication] =
    useState<Application | null>(null)

  const [selection, setSelection] = useAtom(selectedArchiveRowsAtom)

  const toggleRow = (id: string) =>
    setSelection((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id]
    )
  const toggleAll = () =>
    setSelection((current) =>
      current.length === applications.length
        ? []
        : applications.map((item) => item.id as string)
    )

  useEffect(() => {
    setSortedApplications(applications)
  }, [applications])

  useEffect(() => {
    setSortedApplications(
      sortData(applications, {
        sortBy,
        reversed: reverseSortDirection,
        search,
        tags,
      })
    )
  }, [tags])

  const setSorting = (field: keyof FilterableApplication) => {
    const reversed = field === sortBy ? !reverseSortDirection : false
    setReverseSortDirection(reversed)
    setSortBy(field)
    setSortedApplications(
      sortData(applications, { sortBy: field, reversed, search, tags })
    )
  }

  const handleSearchChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { value } = event.currentTarget
    setSearch(value)
    setSortedApplications(
      sortData(applications, {
        sortBy,
        reversed: reverseSortDirection,
        search: value,
        tags,
      })
    )
  }

  const sortedRows = sortedApplications.map((application, index) => {
    const selected = selection.includes(application.id as string)
    return (
      <Table.Tr
        key={index}
        onClick={() => {
          setSelectedApplication({ ...application })
          open()
        }}
        style={{ cursor: 'pointer' }}
        className={cx({ [classes.rowSelected]: selected })}
      >
        <Table.Td>
          <Checkbox
            checked={selection.includes(application.id)}
            onChange={() => {
              toggleRow(application.id)
              close()
            }}
          />
        </Table.Td>
        <Table.Td>{application.jobTitle}</Table.Td>
        <Table.Td>{application.company}</Table.Td>
        <Table.Td>{application.status}</Table.Td>
        <Table.Td>{application.applicationDate}</Table.Td>
        <Table.Td>{application.interviewDate}</Table.Td>

        {showTags && (
          <Table.Td maw={96}>{application.tags?.join(', ') || ''}</Table.Td>
        )}
      </Table.Tr>
    )
  })

  return (
    <>
      <ViewApplicationModal
        opened={opened}
        open={open}
        close={close}
        application={selectedApplication}
        callback={callback}
      />
      <TextInput
        placeholder="Search by any field"
        mb="md"
        leftSection={<IconSearch size={16} stroke={1.5} />}
        value={search}
        onChange={handleSearchChange}
      />
      <Table highlightOnHover>
        <Table.Thead>
          <Table.Tr>
            <Table.Th w={40}>
              <Checkbox
                onChange={toggleAll}
                checked={selection.length === applications?.length}
                indeterminate={
                  selection.length > 0 &&
                  selection.length !== applications?.length
                }
              />
            </Table.Th>
            <Th
              sorted={sortBy === 'jobTitle'}
              reversed={reverseSortDirection}
              onSort={() => setSorting('jobTitle')}
            >
              Job Title
            </Th>
            <Th
              sorted={sortBy === 'company'}
              reversed={reverseSortDirection}
              onSort={() => setSorting('company')}
            >
              Company
            </Th>
            <Th
              sorted={sortBy === 'status'}
              reversed={reverseSortDirection}
              onSort={() => setSorting('status')}
            >
              Status
            </Th>
            <Th
              sorted={sortBy === 'applicationDate'}
              reversed={reverseSortDirection}
              onSort={() => setSorting('applicationDate')}
            >
              Applied
            </Th>
            <Th
              sorted={sortBy === 'interviewDate'}
              reversed={reverseSortDirection}
              onSort={() => setSorting('interviewDate')}
            >
              Interview
            </Th>
            {showTags && <Table.Th maw={96}>Tags</Table.Th>}
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>{sortedRows}</Table.Tbody>
      </Table>
    </>
  )
}

function Th({
  children,
  reversed,
  sorted,
  onSort,
}: {
  children: ReactNode
  reversed: boolean
  sorted: boolean
  onSort: () => void
}) {
  const Icon = sorted
    ? reversed
      ? IconChevronUp
      : IconChevronDown
    : IconSelector
  return (
    <Table.Th className={classes.th}>
      <UnstyledButton onClick={onSort} className={classes.control}>
        <Group justify="space-between">
          <Text fw={500} fz="sm">
            {children}
          </Text>
          <Center className={classes.icon}>
            <Icon size={16} stroke={1.5} />
          </Center>
        </Group>
      </UnstyledButton>
    </Table.Th>
  )
}

function filterData(data: Application[], search: string, tags: string[]) {
  const query = search.toLowerCase().trim()
  return data.filter((item: any) => {
    const itemTags: string[] = item.tags
    return (
      keys(data[0]).some((key) =>
        JSON.stringify(item[key] || '')
          ?.toLowerCase()
          .includes(query)
      ) &&
      (tags.length === 0 || tags.every((tag) => itemTags?.includes(tag)))
    )
  })
}

function sortData(
  data: Application[],
  {
    sortBy,
    reversed,
    search,
    tags,
  }: {
    sortBy: keyof FilterableApplication | null
    reversed: Boolean
    search: string
    tags: string[]
  }
) {
  if (!sortBy) {
    return filterData(data, search, tags)
  }

  return filterData(
    [...data].sort((a, b) => {
      if (!a[sortBy] && !b[sortBy]) return 0
      if (!a[sortBy]) return 1
      if (!b[sortBy]) return -1
      if (reversed) {
        return b[sortBy].localeCompare(a[sortBy])
      }

      return a[sortBy].localeCompare(b[sortBy])
    }),
    search,
    tags
  )
}
