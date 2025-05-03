import React from 'react'
import { Outlet } from 'react-router'
import Header from './components/global/Heading'
import OfflineAlert from './components/global/OfflineAlert'
import { LoadingOverlay } from '@mantine/core'
import { authLoadingAtom } from './hooks/auth'
import { useAtom } from 'jotai'

const Layout = () => {
  const [authLoading] = useAtom(authLoadingAtom)
  return (
    <>
      <LoadingOverlay visible={authLoading} zIndex={199} />
      <Header />
      <Outlet />
      <OfflineAlert />
    </>
  )
}

export default Layout
