import React, { useEffect, useRef } from 'react'
import {
  sankey,
  SankeyGraph,
  SankeyLink,
  sankeyLinkHorizontal,
  SankeyNode,
} from 'd3-sankey'
import { useMediaQuery } from '@mantine/hooks'
import * as d3 from 'd3'

import { Application } from '../../types/applications'

type NodeData = { name: string; apps: Application[] }
type LinkData = { apps: Application[] }

type Node = SankeyNode<NodeData, LinkData>
type Link = SankeyLink<NodeData, LinkData>

const SankeyChart = ({
  applications,
  interviews,
  offers,
  rejectionsNoInterview,
  applicationsNoResponse,
  interviewsNoResponse,
  interviewsRejected,
}: {
  applications: Application[]
  interviews: Application[]
  offers: Application[]
  rejectionsNoInterview: Application[]
  applicationsNoResponse: Application[]
  interviewsNoResponse: Application[]
  interviewsRejected: Application[]
}) => {
  const ref = useRef(null)

  const smallScreen = useMediaQuery('max-width: 512px')

  useEffect(() => {
    const width = 600
    const height = 300

    const rawNodes: Node[] = [
      { name: 'Applications', apps: applications }, // 0
      { name: 'Interviews', apps: interviews }, // 1
      { name: 'Offers', apps: offers }, // 2
      {
        name: 'Rejected',
        apps: [...rejectionsNoInterview, ...interviewsRejected],
      }, // 3
      {
        name: 'No Response',
        apps: [...applicationsNoResponse, ...interviewsNoResponse],
      }, // 4
    ]

    const rawLinks: Link[] = [
      { source: 0, target: 1, value: interviews.length, apps: interviews },
      {
        source: 0,
        target: 3,
        value: rejectionsNoInterview.length,
        apps: rejectionsNoInterview,
      },
      {
        source: 0,
        target: 4,
        value: applicationsNoResponse.length,
        apps: applicationsNoResponse,
      },

      { source: 1, target: 2, value: offers.length, apps: offers },
      {
        source: 1,
        target: 3,
        value: interviewsRejected.length,
        apps: interviewsRejected,
      },
      {
        source: 1,
        target: 4,
        value: interviewsNoResponse.length,
        apps: interviewsNoResponse,
      },
    ]

    const filteredLinks = rawLinks.filter((link) => link.value > 0)

    const data: SankeyGraph<Node, Link> = {
      nodes: rawNodes,
      links: filteredLinks,
    }

    const svg = d3.select(ref.current).attr('viewBox', [0, 0, width, height])
    svg.selectAll('*').remove()

    const { nodes, links } = sankey<Node, Link>()
      .nodeWidth(15)
      .nodePadding(30)
      .extent([
        [1, 20],
        [width - 1, height - 20],
      ])(data)

    svg
      .append('g')
      .selectAll('rect')
      .data(nodes)
      .join('rect')
      .attr('x', (d) => d?.x0 || 0)
      .attr('y', (d) => d?.y0 || 0)
      .attr('height', (d) => (d && d.y1 && d.y0 ? d.y1 - d.y0 : 0))
      .attr('width', (d) => (d && d.x1 && d.x0 ? d.x1 - d.x0 : 0))
      .attr('fill', '#4f46e5')

    svg
      .append('g')
      .attr('fill', 'none')
      .selectAll('path')
      .data(links)
      .join('path')
      .attr('d', sankeyLinkHorizontal())
      .attr('stroke', '#a5b4fc')
      .attr('stroke-width', (d) => Math.max(1, d.width || 0))
      .attr('opacity', 0.5)

    svg
      .append('g')
      .style('font', '12px sans-serif')
      .selectAll('text')
      .data(nodes)
      .join('text')
      .attr('x', (d) => (d && d.x0 ? d.x0 - 6 : 0))
      .attr('y', (d) => (d && d.y1 && d.y0 ? (d.y1 + d.y0) / 2 : 0))
      .attr('dy', '0.35em')
      .attr('text-anchor', 'end')
      .text((d) => `${d.name} (${d.value || 0})`)
      .filter((d) => d.x0! < width / 2)
      .attr('x', (d) => (d && d.x1 ? d.x1 + 6 : 0))
      .attr('text-anchor', 'start')
      .text((d) => `${d.name} (${d.value || 0})`)

    const tooltip = d3
      .select('body')
      .append('div')
      .style('position', 'absolute')
      .style('padding', '6px 12px')
      .style('background', 'rgba(0,0,0,0.75)')
      .style('color', 'white')
      .style('border-radius', '4px')
      .style('pointer-events', 'none')
      .style('display', 'none')
      .style('max-width', '50%')

    svg
      .selectAll<SVGPathElement, Link>('path')
      .on('mousemove', function (event, d: SankeyLink<NodeData, LinkData>) {
        let companies = d.apps?.map((app) => app.company) || ['N/A']
        companies = [...new Set(companies)]
        companies.sort()

        const source = d.source as SankeyNode<NodeData, LinkData>
        const target = d.target as SankeyNode<NodeData, LinkData>

        tooltip
          .style('display', 'block')
          .style('top', event.pageY + 10 + 'px')
          .style('left', event.pageX + 10 + 'px')
          .style('transform', 'translate(0, 0)')
          .html(
            `<strong>${source.name} → ${
              target.name
            }</strong><br/>Companies: ${companies.join(', ')}`
          )
      })
      .on('mouseout', () => tooltip.style('display', 'none'))

    svg
      .selectAll<SVGPathElement, Node>('rect')
      .on('mousemove', function (event, d) {
        let companies = d.apps?.map((app) => app.company) || ['N/A']
        companies = [...new Set(companies)]
        companies.sort()

        const rightSide = ['No Response', 'Offers', 'Rejected'].includes(d.name)

        if (rightSide) tooltip.style('width', '25%')

        tooltip
          .style('display', 'block')
          .style('top', event.pageY + 10 + 'px')
          .style('left', event.pageX + (rightSide ? 0 : 10) + 'px')
          .style('transform', `translate(${rightSide ? '-100%' : 0}, 0)`)
          .html(
            `<strong>${d.name}</strong><br/>Companies: ${companies.join(', ')}`
          )
      })
      .on('mouseout', () =>
        tooltip.style('display', 'none').style('width', 'fit-content')
      )
  }, [])

  return (
    <svg
      ref={ref}
      style={{
        width: '80%',
        maxWidth: '768px',
        height: '80%',
        maxHeight: '512px',
      }}
    />
  )
}

export default SankeyChart
