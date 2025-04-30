import { authenticatedAtom } from '@/hooks/auth'
import { isOnlineAtom } from '@/state/online'
import { Alert } from '@mantine/core'
import { IconInfoCircle } from '@tabler/icons-react'
import { useAtom } from 'jotai'
import { useEffect, useRef, useState } from 'react'

export default function OfflineAlert() {
  const [isOnline] = useAtom(isOnlineAtom)
  const [isAuthenticated] = useAtom(authenticatedAtom)

  const [shushed, setShushed] = useState(false)

  useEffect(() => {
    setShushed(false)
  }, [isOnline])

  const icon = <IconInfoCircle />
  return (
    <Alert
      variant="filled"
      color="red"
      title="You are offline"
      icon={icon}
      withCloseButton
      pos="fixed"
      bottom={16}
      right={16}
      onClose={() => setShushed(true)}
      style={{
        zIndex: 9999,
        visibility:
          !isOnline && isAuthenticated && !shushed ? 'visible' : 'hidden',
      }}
    >
      Functionality may be limited
    </Alert>
  )
}
