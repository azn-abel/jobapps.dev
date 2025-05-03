import { useDisclosure } from '@mantine/hooks'
import { useState } from 'react'
import { Modal, Button } from '@mantine/core'
import { FileButton, Group, Text, Flex } from '@mantine/core'
import { importCSV } from '../../../api/localStorage/io'
import LocalApplicationsAPI from '../../../api/localStorage/applications'
import { ApplicationStore } from '@/types/applications'
import useApplicationsAPI from '@/hooks/applications'
import { useAtom } from 'jotai'
import { isOnlineAtom } from '@/state/online'
import { authenticatedAtom } from '@/hooks/auth'

export default function ImportApplicationsModal({
  callback,
}: {
  callback: () => void
}) {
  const [isOnline] = useAtom(isOnlineAtom)
  const [isAuthenticated] = useAtom(authenticatedAtom)

  const [opened, { open, close }] = useDisclosure(false)
  const [file, setFile] = useState<File | null>(null)
  const [error, setError] = useState('')

  const { putApplications } = useApplicationsAPI()

  const onClose = () => {
    close()
    setFile(null)
  }

  const handleImport = async () => {
    setError('')
    if (!file) return
    try {
      const results = await importCSV(file)
      const mapped: ApplicationStore = {}
      results.forEach((app) => (mapped[app.id] = app))
      putApplications(mapped)
      onClose()
      callback()
    } catch (e) {
      setError('Invalid CSV.')
    }
  }

  return (
    <>
      <Modal
        opened={opened}
        centered
        onClose={onClose}
        removeScrollProps={{
          allowPinchZoom: true,
        }}
        title="Import CSV"
      >
        <Group justify="center">
          <FileButton onChange={setFile} accept="text/csv">
            {(props) => <Button {...props}>Select a file</Button>}
          </FileButton>
        </Group>

        <Text size="sm" ta="center" mt="sm">
          {file ? `Selected file: ${file?.name}` : 'No file selected.'}
        </Text>

        {error && (
          <Text size="sm" ta="center" mt="sm" c="red">
            {error}
          </Text>
        )}
        <Flex justify="end" mt={12} gap={12}>
          <Button disabled={!file} onClick={handleImport}>
            Import
          </Button>
        </Flex>
      </Modal>
      {(!isOnline && isAuthenticated) || (
        <Button variant="default" onClick={open}>
          Import
        </Button>
      )}
    </>
  )
}
