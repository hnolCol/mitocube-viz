import { useMemo, useState } from "react"
import _ from "lodash"
import PropTypes from "prop-types"
import { scaleBand, scaleLinear } from "@visx/scale"
import { AxisBottom, AxisLeft } from "@visx/axis"
import { Text } from "@visx/text"
import { localPoint } from "@visx/event"
import { useTooltip, useTooltipInPortal } from "@visx/tooltip"
import { SVG } from "../base/SVG"
import Bar from "../../primitives/Bar"
import MetricTable from "../../tooltip/MetricTable"
import { getColorPalette } from "../../colors/palette"
import { getAxisStrokeColor, getStrokeColor } from "../../colors/stroke"
import { getNumberTicks } from "../../axis/ticks"

const DEFAULT_MARGINS = { left: 50, right: 15, bottom: 60, top: 15 }
// fraction of a bar width by which successive year bars are offset (0.75 => 25% overlap)
const YEAR_OVERLAP = 0.75
// opacity floor for the oldest visible year; opacity is interpolated between
// this and 1.0 across all selected years so even many years stay readable
const MIN_YEAR_OPACITY = 0.35
const YEAR_OPACITY = { current: 1.0, previous: 0.45, older: 0.2 }

GroupedYearComparisonChart.propTypes = {
    data: PropTypes.arrayOf(PropTypes.shape({
        group: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
        year: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
        value: PropTypes.number.isRequired
    })),
    years: PropTypes.array,
    groups: PropTypes.array,
    width: PropTypes.number,
    height: PropTypes.number,
    margins: PropTypes.object,
    yaxisLabel: PropTypes.string,
    xaxisLabel: PropTypes.string,
    svgID: PropTypes.string,
    darkmode: PropTypes.bool,
    colorGroups: PropTypes.array,
    minWidthPerGroup: PropTypes.number,
    maxGroups: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    otherGroupLabel: PropTypes.string
}

/**
 * Grouped bar chart comparing years (encoded by bar opacity) across categories
 * (encoded by color). Minimal style: axes only, no grid. Category names are
 * rendered as shrink-to-fit tick labels on the bottom axis and are included in
 * the hover tooltip.
 *
 * @param {Object} props
 * @param {Array} props.data - flat rows: [{ group, year, value }]
 * @param {Array} props.years - ordered years, ascending
 * @param {Array} props.groups - ordered group labels
 * @param {number} props.width
 * @param {number} props.height
 * @param {Object} props.margins
 * @param {string} props.yaxisLabel
 * @param {string} props.xaxisLabel
 * @param {string} props.svgID
 * @param {boolean} props.darkmode
 * @param {number} props.minWidthPerGroup - Minimum chart width allocated to each
 * group (category). If groups * minWidthPerGroup exceeds `width`, the chart grows
 * horizontally and becomes scrollable (overflow-x) so bars stay readable with
 * many categories.
 * @param {number | "auto"} props.maxGroups - Limit the number of categories shown.
 * "auto" derives the limit from the available width (max 2x the given `width`;
 * the chart then never scrolls). A number caps the categories explicitly.
 * Categories are ranked by total value across all selected years and the
 * remaining ones are collapsed into an "Other" bucket. `null`/`undefined` = no limit.
 * @param {string} props.otherGroupLabel - Label for the collapsed categories bucket.
 */
export function GroupedYearComparisonChart({
    data = [],
    years = [],
    groups = [],
    width = 640,
    height = 360,
    margins = DEFAULT_MARGINS,
    yaxisLabel = "Count",
    xaxisLabel = undefined,
    svgID = "grouped-year-comparison-chart",
    darkmode = false,
    minWidthPerGroup = 40,
    maxGroups = null,
    otherGroupLabel = "Other",
    colorGroups = null
}) {
    // index rows by group::year once, avoiding per-(group x year) data.find scans
    const valueByGroupYearIndex = useMemo(() => {
        const idx = new Map()
        for (const d of data) idx.set(`${d.group}::${d.year}`, d.value)
        return idx
    }, [data])

    // total value per group across selected years, used for ranking when limiting
    const totalValueByGroup = useMemo(() => {
        return _.fromPairs(groups.map(g => [g, _.sumBy(
            years.map(year => valueByGroupYearIndex.get(`${g}::${year}`)),
            v => (_.isNumber(v) ? v : 0)
        )]))
    }, [valueByGroupYearIndex, groups, years])

    // determine effective group limit: "auto" = how many fit into twice the given
    // width (no scrolling), number = explicit cap, null = no limit
    const groupLimit = useMemo(() => {
        if (maxGroups === "auto") {
            return Math.max(1, Math.floor((width - margins.left - margins.right) / minWidthPerGroup))
        }
        if (_.isNumber(maxGroups) && maxGroups >= 1) return Math.floor(maxGroups)
        return null
    }, [maxGroups, width, margins.left, margins.right, minWidthPerGroup])

    // rank groups by total value, keep the top ones, collapse the rest into "Other"
    const { limitedGroups, hasOtherBucket, otherGroupData } = useMemo(() => {
        if (groupLimit === null || groups.length <= groupLimit) {
            return { limitedGroups: groups, hasOtherBucket: false, otherGroupData: [] }
        }
        const ranked = [...groups].sort((a, b) => (totalValueByGroup[b] ?? 0) - (totalValueByGroup[a] ?? 0))
        const kept = ranked.slice(0, groupLimit)
        const collapsed = groups.filter(g => !kept.includes(g))
        const otherRows = years.map(year => {
            const value = _.sum(
                collapsed.map(g => {
                    const v = valueByGroupYearIndex.get(`${g}::${year}`)
                    return _.isNumber(v) ? v : 0
                })
            )
            return { group: otherGroupLabel, year, value }
        }).filter(d => collapsed.some(g => valueByGroupYearIndex.has(`${g}::${d.year}`)))
        return { limitedGroups: [...kept, otherGroupLabel], hasOtherBucket: true, otherGroupData: otherRows }
    }, [groupLimit, groups, totalValueByGroup, years, data, otherGroupLabel])

    // combine original rows with the "Other" bucket rows
    const effectiveData = useMemo(() => {
        if (!hasOtherBucket) return data
        const collapsedSet = new Set(limitedGroups.filter(g => g !== otherGroupLabel))
        return [...data.filter(d => collapsedSet.has(d.group)), ...otherGroupData]
    }, [data, hasOtherBucket, otherGroupData, limitedGroups, otherGroupLabel, groups])

    // grow the chart horizontally when many groups would squeeze the bars;
    // the wrapper div scrolls horizontally in that case
    const totalGroupWidth = limitedGroups.length * minWidthPerGroup
    const svgWidth = Math.max(width, margins.left + margins.right + totalGroupWidth)
    const currentYear = years.length > 0 ? Math.max(...years.map(Number)) : null
    const chartWidth = svgWidth - margins.left - margins.right
    const chartHeight = height - margins.top - margins.bottom

    const valueByGroupYear = useMemo(() => {
        return _.fromPairs(effectiveData.map(d => [`${d.group}::${d.year}`, d.value]))
    }, [effectiveData])

    const yMax = useMemo(() => {
        return Math.max(1, ...effectiveData.map(d => d.value))
    }, [effectiveData])

    const xScale = useMemo(() => {
        return scaleBand({
            domain: limitedGroups,
            range: [margins.left, margins.left + chartWidth],
            round: true,
            padding: 0.3
        })
    }, [limitedGroups, margins.left, chartWidth])

    const yearScale = useMemo(() => {
        // with YEAR_OVERLAP < 1, bars overlap: each year is offset by a fraction
        // of the bar width instead of a full bandwidth
        const bandwidth = xScale.bandwidth()
        const slot = bandwidth / Math.max(years.length, 1)
        const barWidth = Math.min(slot / YEAR_OVERLAP, bandwidth)
        return scaleBand({
            domain: years,
            range: [0, (years.length - 1) * barWidth * YEAR_OVERLAP + barWidth],
            round: true,
            padding: 0.1
        })
    }, [years, xScale])

    const yScale = useMemo(() => {
        return scaleLinear({
            domain: [0, yMax * 1.1],
            range: [margins.top + chartHeight, margins.top],
            nice: true
        })
    }, [yMax, margins.top, chartHeight])

    // color domain: prefer the caller-provided full (unfiltered) category list so
    // colors stay stable when the year selection changes the visible groups;
    // the collapsed bucket gets a neutral grey
    const colorDomain = useMemo(() => {
        if (_.isArray(colorGroups) && colorGroups.length > 0) return colorGroups
        return _.uniq([...groups, ...data.map(d => d.group)])
    }, [colorGroups, groups, data])
    const colorPalette = useMemo(() => getColorPalette(Math.max(colorDomain.length, 1), darkmode), [colorDomain, darkmode])
    const colorByGroup = useMemo(() => {
        const byGroup = _.fromPairs(colorDomain.map((g, i) => [g, colorPalette[i % colorPalette.length]]))
        if (hasOtherBucket) byGroup[otherGroupLabel] = darkmode ? "#777777" : "#aaaaaa"
        return byGroup
    }, [colorDomain, colorPalette, hasOtherBucket, otherGroupLabel, darkmode])

    const {
        tooltipData,
        tooltipLeft,
        tooltipTop,
        tooltipOpen,
        showTooltip,
        hideTooltip
    } = useTooltip()

    // id ("group::year") of the currently hovered bar, used for the hover outline
    const [hoveredBar, setHoveredBar] = useState(null)

    const { containerRef, TooltipInPortal } = useTooltipInPortal({
        detectBounds: true,
        scroll: true
    })

    const yearOpacity = year => {
        // interpolate opacity smoothly between 1.0 (current year) and
        // MIN_YEAR_OPACITY (oldest visible year) instead of three fixed tiers,
        // so many selected years remain readable
        const n = years.length
        const idx = years.indexOf(year)
        if (n <= 1 || idx === -1 || idx === n - 1) return YEAR_OPACITY.current
        const t = idx / (n - 1)
        return YEAR_OPACITY.current + (MIN_YEAR_OPACITY - YEAR_OPACITY.current) * t
    }

    const handleMouseOver = (event, tooltipRows) => {
        const svg = event?.target?.ownerSVGElement || event?.currentTarget?.ownerSVGElement
        if (!svg) return
        const coords = localPoint(svg, event)
        if (coords === null) return
        showTooltip({ tooltipLeft: coords.x, tooltipTop: coords.y, tooltipData: tooltipRows })
    }

    const getTooltipRows = (group, year, value) => {
        const rows = [
            { text: xaxisLabel ? xaxisLabel : "Category", value: group, type: "default" },
            { text: "Year", value: year, type: "default" },
            { text: yaxisLabel, value: value, type: "default" }
        ]
        return rows
    }

    return (
        <div ref={containerRef} className="flex flex-column" style={{ overflowX: "auto" }}>
            <SVG {...{ width: svgWidth, height, svgID }}>
                <AxisLeft
                    scale={yScale}
                    left={margins.left}
                    label={yaxisLabel}
                    labelOffset={25}
                    labelProps={{ fontSize: "0.8rem", textAnchor: "middle" }}
                    numTicks={getNumberTicks(chartHeight)}
                    tickLength={3}
                    tickLineProps={{ stroke: getStrokeColor(darkmode) }}
                    stroke={getAxisStrokeColor(darkmode)}
                />
                {limitedGroups.map(group => {
                    const x0 = xScale(group)
                    return (
                        <g key={`group-${group}`}>
                            {years.map(year => {
                                const value = valueByGroupYear[`${group}::${year}`]
                                if (value === undefined) return null
                                // draw older years first so the current year (full opacity)
                                // ends up on top of the overlaps
                                const x = x0 + (yearScale(year) ?? 0)
                                const y = yScale(value)
                                return (
                                    <Bar
                                        key={`bar-${group}-${year}`}
                                        x={x}
                                        y1={y}
                                        y0={yScale(0)}
                                        width={yearScale.bandwidth()}
                                        fill={colorByGroup[group]}
                                        opacity={yearOpacity(year)}
                                        onMouseOver={e => { setHoveredBar(`${group}::${year}`); handleMouseOver(e, getTooltipRows(group, year, value)) }}
                                        onMouseMove={e => handleMouseOver(e, getTooltipRows(group, year, value))}
                                        onMouseLeave={() => { setHoveredBar(null); hideTooltip() }}
                                        stroke={hoveredBar === `${group}::${year}` ? (darkmode ? "#ffffff" : "#000000") : undefined}
                                        strokeWidth={hoveredBar === `${group}::${year}` ? 1.5 : undefined}
                                    />
                                )
                            })}
                        </g>
                    )
                })}
                <AxisBottom
                    scale={xScale}
                    top={margins.top + chartHeight}
                    label={xaxisLabel}
                    labelOffset={30}
                    labelProps={{ fontSize: "0.8rem", textAnchor: "middle", fill: darkmode ? "#ffffff" : "#000000" }}
                    numTicks={Math.max(limitedGroups.length, 1)}
                    tickLength={3}
                    tickLineProps={{ stroke: getStrokeColor(darkmode) }}
                    stroke={getAxisStrokeColor(darkmode)}
                    tickComponent={({ x, y, formattedValue }) =>
                        <Text
                            x={x}
                            y={y}
                            textAnchor="middle"
                            verticalAnchor="start"
                            fontSize="0.8rem"
                            width={xScale.bandwidth() * 1.1}
                            scaleToFit="shrink-only"
                            fill={darkmode ? "#ffffff" : "#000000"}
                        >
                            {formattedValue}
                        </Text>
                    }
                />
                <g transform={`translate(${Math.min(margins.left + chartWidth, width - margins.right)},${margins.top})`}>
                    {years.map((year, i) => (
                        <g key={`year-${year}`} transform={`translate(0,${i * 16})`}>
                            <rect x={-12} y={-5} width={10} height={10} fill={"#888888"} opacity={yearOpacity(year)} />
                            <Text x={0} y={0} fontSize={11} textAnchor={"end"} dx={-16} dy={4} verticalAnchor={"start"} fill={darkmode ? "#ffffff" : "#000000"}>{year}</Text>
                        </g>
                    ))}
                </g>
            </SVG>
            {tooltipOpen && (
                <TooltipInPortal
                    top={tooltipTop}
                    left={tooltipLeft}
                    style={{ ...defaultTooltipStyles }}
                >
                    {_.isArray(tooltipData) ? <MetricTable data={tooltipData} /> : null}
                </TooltipInPortal>
            )}
        </div>
    )
}

const defaultTooltipStyles = {
    position: "absolute",
    pointerEvents: "none",
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    border: "1px solid #e0e0e0",
    borderRadius: "4px",
    padding: "0.25rem",
    boxShadow: "0 2px 6px rgba(0, 0, 0, 0.15)",
    fontSize: "0.75rem"
}

export default GroupedYearComparisonChart
