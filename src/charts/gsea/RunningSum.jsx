import React, { useMemo } from "react"
import PropTypes from "prop-types"
import _ from "lodash"
import { scaleLinear } from "@visx/scale"
import { AxisBottom, AxisLeft } from "@visx/axis"
import { Group } from "@visx/group"
import { SVG } from "../base/SVG"
import { getChartWidthAndHeightWithMargins } from "../../utils/border"
import { getStrokeColor, getAxisStrokeColor } from "../../colors/stroke"
import { getFillColor } from "../../colors/fill"
import { getNumberTicks } from "../../axis/ticks"

const HIT_MARKER_HEIGHT = 6

function buildLinePath(points) {
    if (!_.isArray(points) || points.length === 0) return ""
    return points.map((point, index) => `${index === 0 ? "M" : "L"}${point[0]},${point[1]}`).join("")
}

/**
 * Classic GSEA running-sum plot: the enrichment running sum walked down the
 * ranked list (x = rank position, most upregulated first), with vertical hit
 * markers below the x axis, the leading-edge segment highlighted and the
 * enrichment-score peak marked.
 *
 * @param {Object} props
 * @param {Number[]} props.runningSum Running-sum value per rank position.
 * @param {Number[]} props.hitRanks Rank positions of the annotation's members.
 * @param {Number[]} [props.leadingEdgeRanks] Hit ranks forming the leading edge.
 * @param {Number} [props.esRank] Rank position of the enrichment score peak.
 * @param {Number} [props.es] Enrichment score (used to label the peak).
 */
export function GSEARunningSumChart({
    runningSum = [],
    hitRanks = [],
    leadingEdgeRanks = [],
    esRank = undefined,
    es = undefined,
    width = 640,
    height = 280,
    margins = { left: 50, top: 10, right: 15, bottom: 40 },
    xaxisLabel = "rank in sorted list",
    yaxisLabel = "running enrichment score (ES)",
    lineColor = "#2e528b",
    hitColor = "#d9822b",
    leadingEdgeColor = "#edf8b1",
    darkmode = false,
    svgID
}) {
    const { chartWidth, chartHeight } = getChartWidthAndHeightWithMargins({ width, height, margins })

    const values = useMemo(() => (_.isArray(runningSum) ? runningSum.filter(_.isNumber) : []), [runningSum])
    const hits = useMemo(() => (_.isArray(hitRanks) ? hitRanks.filter(_.isNumber) : []), [hitRanks])
    const leadingEdge = useMemo(() => (_.isArray(leadingEdgeRanks) ? leadingEdgeRanks.filter(_.isNumber) : []), [leadingEdgeRanks])

    const xScale = useMemo(() => scaleLinear({
        domain: [0, Math.max(1, values.length - 1)],
        range: [margins.left, margins.left + chartWidth]
    }), [values.length, chartWidth, margins.left])

    const yScale = useMemo(() => scaleLinear({
        domain: [Math.min(0, ...values), Math.max(0, ...values)],
        range: [margins.top + chartHeight, margins.top],
        nice: true
    }), [values, chartHeight, margins.top])

    if (values.length < 2) {
        return (
            <SVG {...{ width, height, id: svgID }}>
                <text x={width / 2} y={height / 2} textAnchor="middle" fill={getFillColor(darkmode)}>No running sum data</text>
            </SVG>
        )
    }

    const points = values.map((value, rank) => [xScale(rank), yScale(value)])
    const linePath = buildLinePath(points)

    let leadingEdgeRect = null
    if (_.isArray(leadingEdge) && leadingEdge.length > 0 && hits.includes(esRank) === false) {
        const ranks = _.isNumber(esRank) ? [esRank, ...leadingEdge] : leadingEdge
        const from = xScale(_.min(ranks))
        const to = xScale(_.max(ranks))
        leadingEdgeRect = <rect x={from} y={margins.top} width={Math.max(1, to - from)} height={chartHeight} fill={leadingEdgeColor} opacity={0.55} />
    }

    const esY = _.isNumber(esRank) ? yScale(values[esRank]) : undefined

    return (
        <SVG {...{ width, height, id: svgID }}>
            {leadingEdgeRect}
            <AxisLeft
                scale={yScale}
                left={margins.left}
                top={margins.top}
                stroke={getAxisStrokeColor(darkmode)}
                tickStroke={getAxisStrokeColor(darkmode)}
                tickLabelProps={() => ({ fill: getFillColor(darkmode), fontSize: 10, textAnchor: "end", dx: -2 })}
                label={yaxisLabel}
                labelProps={{ fill: getFillColor(darkmode), fontSize: 11, textAnchor: "middle", angle: -90 }}
                numTicks={getNumberTicks(chartHeight)}
            />
            <AxisBottom
                scale={xScale}
                left={0}
                top={margins.top + chartHeight}
                stroke={getAxisStrokeColor(darkmode)}
                tickStroke={getAxisStrokeColor(darkmode)}
                tickLabelProps={() => ({ fill: getFillColor(darkmode), fontSize: 10, textAnchor: "middle" })}
                label={xaxisLabel}
                labelProps={{ fill: getFillColor(darkmode), fontSize: 11, textAnchor: "middle" }}
                numTicks={getNumberTicks(chartWidth)}
            />
            <Group>
                <line x1={margins.left} x2={margins.left + chartWidth} y1={yScale(0)} y2={yScale(0)} stroke={getStrokeColor(darkmode)} strokeWidth={1} opacity={0.6} />
                {hits.map((rank, index) => (
                    <line key={`hit-${index}`} x1={xScale(rank)} x2={xScale(rank)}
                        y1={margins.top + chartHeight + 2} y2={margins.top + chartHeight + 2 + HIT_MARKER_HEIGHT}
                        stroke={hitColor} strokeWidth={1} />
                ))}
                {_.isNumber(esRank) && _.isFinite(esY) ?
                    <line x1={xScale(esRank)} x2={xScale(esRank)} y1={margins.top} y2={margins.top + chartHeight} stroke={hitColor} strokeWidth={1} strokeDasharray="3,3" /> : null}
                <path d={linePath} fill="none" stroke={lineColor} strokeWidth={1.5} />
                {_.isNumber(esRank) && _.isFinite(esY) && _.isNumber(es) ?
                    <circle cx={xScale(esRank)} cy={esY} r={3} fill={lineColor} /> : null}
            </Group>
        </SVG>
    )
}

GSEARunningSumChart.propTypes = {
    runningSum: PropTypes.arrayOf(PropTypes.number),
    hitRanks: PropTypes.arrayOf(PropTypes.number),
    leadingEdgeRanks: PropTypes.arrayOf(PropTypes.number),
    esRank: PropTypes.number,
    es: PropTypes.number,
    width: PropTypes.number,
    height: PropTypes.number,
    margins: PropTypes.object,
    xaxisLabel: PropTypes.string,
    yaxisLabel: PropTypes.string,
    lineColor: PropTypes.string,
    hitColor: PropTypes.string,
    leadingEdgeColor: PropTypes.string,
    darkmode: PropTypes.bool,
    svgID: PropTypes.string
}
