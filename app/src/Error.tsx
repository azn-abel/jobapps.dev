import { Title, Text, Flex } from '@mantine/core'
import { Navigate } from 'react-router'

export default function Error() {
  return (
    <Flex h={'100vh'} justify="center" align="center" direction="column">
      <Title mb={12}>Something went wrong :/</Title>
      <Text>Try refreshing</Text>
    </Flex>
  )
}
