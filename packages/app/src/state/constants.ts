import { Container, Flex } from '@mantine/core'
import { motion } from 'framer-motion'

export const validApplicationStates = [
  'New',
  'Assessment',
  'Interview',
  'Offer',
  'Rejected',
]

export const animationProps = {
  initial: { opacity: 0, y: -10 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
  transition: { duration: 0.2 },
}

export const MotionContainer = motion.create(Container as any)

export const MotionFlex = motion.create(Flex as any)
