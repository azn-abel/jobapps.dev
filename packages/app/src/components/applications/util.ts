import { validApplicationStates } from '../../state/constants'
import { UseFormReturnType } from '@mantine/form'
import {
  ApplicationDTO,
  ApplicationInput,
  ApplicationStatus,
} from '../../types/applications'

export const handleStatusDropdownClose = (
  form: UseFormReturnType<ApplicationInput>
) => {
  const status = form.getValues().status
  const match: ApplicationStatus = validApplicationStates.find((item) =>
    item.toLowerCase().startsWith(status.toLowerCase())
  ) as ApplicationStatus
  if (match && status !== match) {
    form.setFieldValue('status', match)
  } else {
    form.setFieldValue('status', match)
  }
}
