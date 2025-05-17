import { useDisclosure } from '@mantine/hooks'
import { Modal, Button, Flex, Text, LoadingOverlay } from '@mantine/core'

import { useAtom } from 'jotai'
import { selectedRowsAtom } from '../../../state'
import { useState } from 'react'

import { isOnlineAtom } from '@/state/online'
import { authenticatedAtom } from '@/hooks/auth'
import useApplicationsAPI from '@/hooks/applications'

export default function DeleteSelectedApplicationModal({
  callback,
}: {
  callback: () => Promise<void>
}) {
  const [opened, { open, close }] = useDisclosure(false)

  const [isOnline] = useAtom(isOnlineAtom)
  const [isAuthenticated] = useAtom(authenticatedAtom)

  const { deleteApplications } = useApplicationsAPI()

  const [selectedRows, setSelectedRows] = useAtom(selectedRowsAtom)
  const [loading, setLoading] = useState(false)

  const removeApplications = async () => {
    setLoading(true)
    const result = await deleteApplications(selectedRows)
    if (!result.success) {
      // u o
    }
    setSelectedRows([])
    close()
    await callback()
    setLoading(false)
  }

  return (
    <>
      <Modal
        opened={opened}
        onClose={close}
        title="Delete Applications"
        centered
        removeScrollProps={{
          allowPinchZoom: true,
        }}
        size="md"
      >
        <LoadingOverlay visible={loading} />
        <Text>
          Are you sure you want to delete {selectedRows.length} application
          {selectedRows.length !== 1 && 's'}?
        </Text>

        <Flex justify="flex-end" mt={16} gap={12}>
          <Button variant="default" onClick={close}>
            Back
          </Button>
          <Button color="red" onClick={removeApplications}>
            Yes, I'm Sure
          </Button>
        </Flex>
      </Modal>

      {(!isOnline && isAuthenticated) || (
        <Button
          color="red"
          onClick={open}
          disabled={!isOnline && isAuthenticated}
        >
          Delete
        </Button>
      )}
    </>
  )
}
