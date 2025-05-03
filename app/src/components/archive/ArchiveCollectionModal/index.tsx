import { useDisclosure } from '@mantine/hooks'
import { Modal, Button, Flex, Text, LoadingOverlay } from '@mantine/core'

import { useState } from 'react'

import { archiveApplicationsAtom, selectedRowsAtom } from '../../../state'
import { useAtom } from 'jotai'
import { conditionalS } from '../../../utils'
import { isOnlineAtom } from '@/state/online'
import { authenticatedAtom } from '@/hooks/auth'
import useArchiveAPI from '@/hooks/archive'

export default function ArchiveCollectionModal({
  callback,
}: {
  callback: () => Promise<void>
}) {
  const [isOnline] = useAtom(isOnlineAtom)
  const [isAuthenticated] = useAtom(authenticatedAtom)

  const { postToArchive, fetchArchive } = useArchiveAPI()

  const [opened, { open, close }] = useDisclosure(false)
  const [error, setError] = useState('')

  const [rows] = useAtom(selectedRowsAtom)

  const [loading, setLoading] = useState(false)

  const [archiveRows, setArchiveRows] = useAtom(archiveApplicationsAtom)

  const archiveCollection = async () => {
    setLoading(true)
    setError('')
    const postResponse = await postToArchive(rows)

    if (!postResponse.success) {
      setError(postResponse.detail)
      setLoading(false)
      return
    }

    const fetchResponse = await fetchArchive()

    if (!fetchResponse.success) {
      setError(fetchResponse.detail)
      setLoading(false)
      return
    }
    setArchiveRows(Object.values(fetchResponse.data))
    await callback()
    setLoading(false)
    close()
  }

  const onClose = () => {
    setError('')
    close()
  }

  return (
    <>
      <Modal
        opened={opened}
        onClose={onClose}
        title="Archive Applications"
        centered
        removeScrollProps={{
          allowPinchZoom: true,
        }}
        size="md"
      >
        <LoadingOverlay visible={loading} />
        <Flex direction="column" gap={12}>
          <Text>This action cannot be undone.</Text>
          <Text>
            Are you sure you want to archive {rows.length} application
            {conditionalS(rows.length)}?
          </Text>
          {error && (
            <Text size="xs" c="red">
              {error}
            </Text>
          )}
        </Flex>

        <Flex justify="flex-end" mt={16} gap={12}>
          <Button variant="default" onClick={onClose}>
            Back
          </Button>
          <Button color="red" onClick={archiveCollection}>
            Yes, I'm Sure
          </Button>
        </Flex>
      </Modal>
      {(!isOnline && isAuthenticated) || (
        <Button
          disabled={rows.length === 0}
          onClick={open}
          hidden={!isOnline && isAuthenticated}
        >
          Archive
        </Button>
      )}
    </>
  )
}
