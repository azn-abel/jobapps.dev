import { useState, useEffect } from 'react'
import { Container, Flex, Title } from '@mantine/core'
import LocalApplicationsAPI from '../api/localStorage/applications'

import SankeyChart from '../components/SankeyChart/sankey'
import CustomBarChart from '../components/CustomBarChart'
import InterviewTimeline from '../components/InterviewTimeline'

import { Application } from '../types/applications'

import { animationProps, MotionFlex, MotionContainer } from '../state/constants'
import { useMediaQuery } from '@mantine/hooks'
import { homeApplicationsAtom } from '@/state'
import { useAtom } from 'jotai'
import useApplicationsAPI from '@/hooks/applications'
import { authenticatedAtom } from '@/hooks/auth'

export default function Visualize() {
  const smallScreen = useMediaQuery('(max-width: 512px)')

  const [isAuthenticated] = useAtom(authenticatedAtom)

  const [loading, setLoading] = useState(true)

  const [applications, setApplications] = useAtom(homeApplicationsAtom)
  const [interviews, setInterviews] = useState<Application[]>([])
  const [offers, setOffers] = useState<Application[]>([])
  const [noResponse, setNoResponse] = useState<Application[]>([])

  const { fetchApplications } = useApplicationsAPI()

  const [rejectionsNoInterview, setRejectionsNoInterview] = useState<
    Application[]
  >([])
  const [applicationsNoResponse, setApplicationsNoResponse] = useState<
    Application[]
  >([])
  const [interviewsNoResponse, setInterviewsNoResponse] = useState<
    Application[]
  >([])
  const [interviewsRejected, setInterviewsRejected] = useState<Application[]>(
    []
  )

  const onMount = async () => {
    let data: Application[] = applications
    if (data.length === 0) {
      const result = await fetchApplications()
      if (!result.success) {
        // Sumn went wrong
        return
      }
      data = Object.values(result.data)
    }
    setApplications(data)
    setInterviews(
      data.filter(
        (item) =>
          ['Interview', 'Offer'].includes(item.status) || item.interviewDate
      )
    )
    setOffers(data.filter((item) => item.status === 'Offer'))
    setNoResponse(
      data.filter((item) =>
        ['Interview', 'New', 'Assessment'].includes(item.status)
      )
    )
    setRejectionsNoInterview(
      data.filter((item) => !item.interviewDate && item.status === 'Rejected')
    )
    setApplicationsNoResponse(
      data.filter((item) => ['New', 'Assessment'].includes(item.status))
    )
    setInterviewsNoResponse(data.filter((item) => item.status === 'Interview'))
    setInterviewsRejected(
      data.filter((item) => item.status === 'Rejected' && item.interviewDate)
    )

    setLoading(false)
  }

  useEffect(() => {
    onMount()
  }, [isAuthenticated])

  if (loading) return <></>

  return (
    <>
      <MotionContainer mb={64}>
        <MotionFlex
          {...animationProps}
          justify="center"
          align="center"
          direction="column"
          gap={12}
        >
          {applications.length === 0 ? (
            <Title order={2}>Nothing to show.</Title>
          ) : (
            <>
              <Title w="100%">This season...</Title>
              <SankeyChart
                applications={applications}
                interviews={interviews}
                offers={offers}
                rejectionsNoInterview={rejectionsNoInterview}
                applicationsNoResponse={applicationsNoResponse}
                interviewsNoResponse={interviewsNoResponse}
                interviewsRejected={interviewsRejected}
              />
              <MotionFlex
                direction={smallScreen ? 'column' : 'row'}
                w="100%"
                gap={24}
              >
                <MotionFlex direction="column" w={smallScreen ? '100%' : '50%'}>
                  <Title order={3} w="100%" mb={16}>
                    Upcoming Interviews
                  </Title>
                  <InterviewTimeline applications={applications} />
                </MotionFlex>
                <MotionFlex direction="column" w={smallScreen ? '100%' : '50%'}>
                  <Title order={3} w="100%" mb={16}>
                    Past 6 Months
                  </Title>
                  <CustomBarChart applications={applications} />
                </MotionFlex>
              </MotionFlex>
            </>
          )}
        </MotionFlex>
      </MotionContainer>
    </>
  )
}
