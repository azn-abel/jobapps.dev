import {
  Container,
  Text,
  Group,
  Burger,
  Flex,
  Card,
  Button,
  Avatar,
} from '@mantine/core'
import { useState, useEffect } from 'react'
import useAuth from '@/hooks/auth'
import classes from './Heading.module.css'

import GoogleSignInButton from '../GoogleSignInButton'

import { Link } from 'react-router'
import { useDisclosure } from '@mantine/hooks'
import { motion, AnimatePresence } from 'framer-motion'
import { animationProps } from '../../../state/constants'
import { requestLogout } from '@/api/network/auth'
import { authenticatedAtom } from '@/hooks/auth'
import { useAtom } from 'jotai'

import { isOnlineAtom } from '@/state/online'

const links = [
  { link: '/', label: 'Home' },
  { link: '/visualize', label: 'Visualize' },
  { link: '/archive', label: 'Archive' },
]

const MotionCard = motion.create(Card as any)

export default function Heading() {
  const { user, isAuthenticated, logout } = useAuth()
  // const [isAuthenticated] = useAtom(authenticatedAtom)
  const [isOnline] = useAtom(isOnlineAtom)

  const [opened, { toggle }] = useDisclosure(false)
  const [active, setActive] = useState(window.location.pathname)
  const items = links.map((link) => (
    <Link
      key={link.label}
      to={link.link}
      className={classes.link}
      data-active={active === link.link || undefined}
      onClick={() => {
        toggle()
        setActive(link.link)
      }}
    >
      {link.label}
    </Link>
  ))

  useEffect(() => {
    const handlePathChange = () => {
      setActive(window.location.pathname)
    }

    window.addEventListener('popstate', handlePathChange)
    window.addEventListener('locationchange', handlePathChange)

    return () => {
      window.removeEventListener('popstate', handlePathChange)
      window.removeEventListener('locationchange', handlePathChange)
    }
  }, [])

  return (
    <header
      className={classes.header}
      style={{ zIndex: 200, position: 'relative' }}
    >
      <Container size="md" className={classes.inner} pos="relative">
        <Link to="/" style={{ textDecoration: 'none', color: 'black' }}>
          <Text>Job Applications</Text>
        </Link>
        <Group gap={5} visibleFrom="xs">
          {items}
          {isAuthenticated ? (
            <LogoutButton callback={logout} disabled={!isOnline} />
          ) : (
            isOnline && <GoogleSignInButton />
          )}
          <Avatar ml={8} src={user?.picture} />
        </Group>
        <Group hiddenFrom="xs">
          <Avatar src={user?.picture} />
          <Burger opened={opened} onClick={toggle} size="sm" />
        </Group>
        <AnimatePresence>
          {opened && (
            <MotionCard
              shadow="md"
              radius={8}
              hiddenFrom="xs"
              pos="absolute"
              top={64}
              right={8}
              {...animationProps}
            >
              <Flex
                className={classes.links}
                direction={'column'}
                gap={8}
                bg={'white'}
              >
                {items}
                {isAuthenticated ? (
                  <LogoutButton callback={logout} disabled={!isOnline} />
                ) : (
                  isOnline && <GoogleSignInButton />
                )}
              </Flex>
            </MotionCard>
          )}
        </AnimatePresence>
      </Container>
    </header>
  )
}

function LogoutButton({
  callback,
  disabled,
}: {
  callback: () => void
  disabled: boolean
}) {
  return (
    <Button
      className={classes.button}
      color="red"
      size="sm"
      onClick={() => {
        callback()
      }}
      disabled={disabled}
      miw={90}
    >
      Sign Out
    </Button>
  )
}
