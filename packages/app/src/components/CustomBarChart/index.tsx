import { BarChart, BarChartSeries } from '@mantine/charts'
import { Application } from '../../types/applications'

import { getLastSixMonths } from '../../utils/dates'

export default function CustomBarChart({
  applications,
}: {
  applications: Application[]
}) {
  const data = getLastSixMonths(applications)

  return (
    <BarChart
      h={300}
      data={data}
      dataKey="month"
      series={[{ name: 'Applications', color: 'blue.6' }]}
      tickLine="y"
      yAxisProps={{
        allowDecimals: false,
      }}
      barProps={(series: BarChartSeries) => ({
        onClick: (data: string, index: number) => {},
      })}
    />
  )
}
