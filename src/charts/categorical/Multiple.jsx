import { useMemo, useState, useEffect, useRef } from "react"
import { scaleBand, scaleLinear, scaleOrdinal } from "@visx/scale"
import PropTypes from "prop-types"
import _ from "lodash"

import {
    addMarginToBoundaries,
    getBoundariesFromArrayOfObjects,
    getChartWidthAndHeightWithMargins
} from "../../utils/border"

import { getColorPalette } from "../../colors/palette"
import { SVG } from "../base/SVG"
import { CategoricalLegend } from "../../legend/CategoricalLegend"


MultiCategoricalChart.propTypes = {
    width: PropTypes.number,
    height: PropTypes.number,
    data: PropTypes.arrayOf(PropTypes.object),
    margins: PropTypes.object,
    yaxisName: PropTypes.string,
    errorName: PropTypes.string,
    colorName: PropTypes.string,
    splitName: PropTypes.string,
    subplotName: PropTypes.string,
    svgID: PropTypes.string,
    innerSubplotPadding: PropTypes.number,
    outerSubplotPadding: PropTypes.number,
    innerSplitPadding: PropTypes.number,
    innerColorPadding: PropTypes.number,
    colorPalette: PropTypes.oneOfType([
        PropTypes.arrayOf(PropTypes.string),
        PropTypes.object
    ]),
    caTagToText: PropTypes.object,
    attributeTagToText: PropTypes.object
}


function MultiCategoricalChart({
    width = 600,
    height = 300,

    data = [
        { y: 5, T: "A", G: "WT", O: "0.5h" },
        { y: 4, T: "B", G: "WT", O: "0.5h" },
        { y: 10, T: "C", G: "WT", O: "0.5h" },
        { y: 5, T: "A", G: "WT2", O: "0.5h" },
        { y: 4, T: "B", G: "WT2", O: "0.5h" },
        { y: 10, T: "C", G: "WT2", O: "0.5h" },
        { y: 5, T: "A", G: "KO", O: "0.5h" },
        { y: 40, T: "B", G: "KO", O: "0.5h" },
        { y: -20, T: "C", G: "KO", O: "0.5h" },
        { y: 5, T: "A", G: "WT", O: "10h" },
        { y: 4, T: "B", G: "WT", O: "10h" },
        { y: 2, T: "C", G: "WT", O: "10h" },
        { y: 5, T: "A", G: "KO", O: "10h" },
        { y: 4, T: "B", G: "KO", O: "10h" },
        { y: 2, T: "C", G: "KO", O: "10h" }
    ],

    margins = {
        left: 15,
        right: 5,
        bottom: 30,
        top: 5
    },

    yaxisName = "y",
    colorName,
    splitName,
    subplotName,

    innerSubplotPadding = 0.05,
    outerSubplotPadding = 0.05,
    innerSplitPadding = 0.1,
    innerColorPadding = 0.0,

    svgID = undefined,
    svgRef = undefined,

    colorPalette = [],
    minMaxYDomain = undefined,
    yScaleStartsAtZero = true,

    caTagToText,
    attributeTagToText,
    children
}) {
    const [isLegendOpen, setIsLegendOpen] = useState(true)

    // ------------------------------------------------------------
    // Legend positioning
    // ------------------------------------------------------------

    // Distance from the top chart boundary.
    // 0 = exactly at margins.top
    const [legendOffsetY, setLegendOffsetY] = useState(0)

    const [isDraggingLegend, setIsDraggingLegend] = useState(false)

    const [legendDragStartY, setLegendDragStartY] = useState(0)
    const [legendDragStartOffsetY, setLegendDragStartOffsetY] = useState(0)

    // Ref used to measure the actual legend height.
    const legendRef = useRef(null)

    const [legendHeight, setLegendHeight] = useState(0)


    // ------------------------------------------------------------
    // Measure legend
    // ------------------------------------------------------------

    useEffect(() => {
        if (!legendRef.current) {
            return
        }

        const updateLegendHeight = () => {
            setLegendHeight(
                legendRef.current.getBoundingClientRect().height
            )
        }

        updateLegendHeight()

        const resizeObserver = new ResizeObserver(
            updateLegendHeight
        )

        resizeObserver.observe(legendRef.current)

        return () => {
            resizeObserver.disconnect()
        }
    }, [isLegendOpen])


    // ------------------------------------------------------------
    // Legend dragging
    // ------------------------------------------------------------

    const handleLegendMouseDown = (event) => {
        // Don't start dragging when clicking the collapse button.
        if (event.target.closest("button")) {
            return
        }
        event.stopPropagation()
        event.preventDefault()

        setIsDraggingLegend(true)

        setLegendDragStartY(event.clientY)
        setLegendDragStartOffsetY(legendOffsetY)
    }


    useEffect(() => {
        if (!isDraggingLegend) {
            return undefined
        }

        const handleMouseMove = (event) => {
            const deltaY =
                event.clientY - legendDragStartY

            // Moving the mouse down should increase the
            // distance from the top.
            const newOffset =
                legendDragStartOffsetY + deltaY


            // ----------------------------------------------------
            // Chart boundaries
            // ----------------------------------------------------

            // Top boundary:
            //
            // legend top >= margins.top
            //
            const minOffset = 0


            // Bottom boundary:
            //
            // legend bottom <= height - margins.bottom
            //
            const maxOffset = Math.max(
                0,
                height -
                margins.bottom -
                margins.top -
                legendHeight
            )


            const clampedOffset = Math.max(
                minOffset,
                Math.min(maxOffset, newOffset)
            )

            setLegendOffsetY(clampedOffset)
        }


        const handleMouseUp = () => {
            setIsDraggingLegend(false)
        }


        window.addEventListener(
            "mousemove",
            handleMouseMove
        )

        window.addEventListener(
            "mouseup",
            handleMouseUp
        )


        return () => {
            window.removeEventListener(
                "mousemove",
                handleMouseMove
            )

            window.removeEventListener(
                "mouseup",
                handleMouseUp
            )
        }
    }, [
        isDraggingLegend,
        legendDragStartY,
        legendDragStartOffsetY,
        height,
        margins.top,
        margins.bottom,
        legendHeight
    ])


    // ------------------------------------------------------------
    // Data
    // ------------------------------------------------------------

    const uniqueColorValues = _.uniqBy(
        data,
        colorName
    ).map(d => d[colorName])

    const colorCategoryFound =
        _.isString(colorName) &&
        _.has(data[0], colorName)

    const subplotCategoryFound =
        _.isString(subplotName) &&
        _.has(data[0], subplotName)

    const splitCategoryFound =
        _.isString(splitName) &&
        _.has(data[0], splitName)


    const subplotCategories =
        subplotCategoryFound
            ? _.uniqBy(data, subplotName)
                .map(d => d[subplotName])
            : [""]


    const splitCategories =
        splitCategoryFound
            ? _.uniqBy(data, splitName)
                .map(d => d[splitName])
            : []


    // ------------------------------------------------------------
    // Color scale
    // ------------------------------------------------------------

    const colorScale = useMemo(() => {
        if (!colorCategoryFound) {
            return () => getColorPalette(1)[0]
        }

        let colorRange = []

        if (colorPalette === undefined) {
            colorRange = getColorPalette(
                uniqueColorValues.length
            )
        }
        else if (_.isArray(colorPalette)) {
            colorRange = colorPalette.slice()
        }
        else if (_.isObject(colorPalette)) {
            if (
                uniqueColorValues.filter(
                    value => !_.has(colorPalette, value)
                ).length !== 0
            ) {
                colorRange = getColorPalette(
                    uniqueColorValues.length
                )
            }
            else {
                colorRange = uniqueColorValues.map(
                    value => colorPalette[value]
                )
            }
        }
        else {
            colorRange = getColorPalette(
                uniqueColorValues.length
            )
        }

        return scaleOrdinal({
            domain: uniqueColorValues,
            range: colorRange
        })
    }, [
        colorCategoryFound,
        colorPalette,
        uniqueColorValues
    ])


    const hasLegend =
        _.isFunction(colorScale) &&
        _.has(colorScale, "domain")


    // ------------------------------------------------------------
    // Chart dimensions
    // ------------------------------------------------------------

    const adjustedWidth = width

    const {
        chartHeight,
        chartWidth
    } = getChartWidthAndHeightWithMargins({
        width: adjustedWidth,
        height,
        margins
    })


    // ------------------------------------------------------------
    // Scales
    // ------------------------------------------------------------

    const subplotScale = useMemo(() => {
        return scaleBand({
            range: [
                margins.left,
                margins.left + chartWidth
            ],
            domain: subplotCategories,
            paddingOuter: 0,
            paddingInner: innerSubplotPadding,
            round: true
        })
    }, [
        chartWidth,
        subplotCategories,
        innerSubplotPadding,
        margins.left
    ])


    const splitScale = useMemo(() => {
        return scaleBand({
            range: [
                0,
                subplotScale.bandwidth()
            ],
            domain: splitCategories,
            paddingOuter: outerSubplotPadding,
            paddingInner: innerSplitPadding,
            round: true
        })
    }, [
        subplotScale,
        splitCategories,
        outerSubplotPadding,
        innerSplitPadding
    ])


    const splitColorScale = useMemo(() => {
        return scaleBand({
            range: [
                0,
                splitCategoryFound
                    ? splitScale.bandwidth()
                    : subplotCategoryFound
                        ? subplotScale.bandwidth()
                        : chartWidth
            ],
            domain: uniqueColorValues,
            paddingOuter: 0.15,
            paddingInner: innerColorPadding,
            round: true
        })
    }, [
        splitScale,
        splitCategoryFound,
        subplotCategoryFound,
        uniqueColorValues,
        innerColorPadding,
        chartWidth
    ])


    const yScale = useMemo(() => {
        const preDefinedYDomain =
            minMaxYDomain !== undefined &&
            _.isObject(minMaxYDomain) &&
            _.has(minMaxYDomain, "min") &&
            _.has(minMaxYDomain, "max")

        const yDomain = preDefinedYDomain
            ? {}
            : getBoundariesFromArrayOfObjects({
                data,
                keyName: yaxisName
            })

        const yDomainWithMargin = preDefinedYDomain
            ? minMaxYDomain
            : addMarginToBoundaries({
                domain: yDomain
            })

        return scaleLinear({
            domain: [
                yDomainWithMargin.max,
                yDomainWithMargin.min < 0
                    ? yDomainWithMargin.min
                    : yScaleStartsAtZero
                        ? 0
                        : yDomainWithMargin.min
            ],
            range: [
                margins.top,
                margins.top + chartHeight
            ],
            nice: true
        })
    }, [
        data,
        yaxisName,
        chartHeight,
        minMaxYDomain,
        yScaleStartsAtZero,
        margins.top
    ])


    // ------------------------------------------------------------
    // Categorical split
    // ------------------------------------------------------------

    const categoricalSplit = subplotCategories.map(
        (cat, idx) => ({
            chartHeight,
            chartWidth,
            idx,
            yaxisName,
            splitName,
            colorName,
            subplotName,
            margins,
            yScale,
            splitCategories,
            splitScale,
            subplotScale,
            subplotCategory: cat,
            splitColorScale,
            colorScale,

            subplotData: subplotCategoryFound
                ? _.filter(
                    data,
                    d => d[subplotName] === cat
                )
                : data,

            colorCategoryFound,

            colorCategories: colorCategoryFound
                ? colorScale.domain()
                : [],

            subplotCategoryFound,
            splitCategoryFound,

            bandwidth: subplotScale.bandwidth(),
            colorBandwidth:
                splitColorScale.bandwidth(),

            xcenter:
                subplotScale(cat) +
                subplotScale.bandwidth() / 2,

            caTagToText,
            attributeTagToText
        })
    )


    // ------------------------------------------------------------
    // Render
    // ------------------------------------------------------------

    return (
        <div
            style={{
                position: "relative",
                width: adjustedWidth,
                height: height
            }}
        >
            <SVG
                {...{
                    width: adjustedWidth,
                    height,
                    svgID,
                    svgRef
                }}
            >
                <>{children(categoricalSplit)}</>
            </SVG>


            {hasLegend && (
                <div
                    ref={legendRef}

                    onMouseDown={handleLegendMouseDown}

                    style={{
                        position: "absolute",

                        // Start in the TOP RIGHT.
                        top: margins.top,
                        right: margins.right,

                        // Move vertically from the top position.
                        transform:
                            `translateY(${legendOffsetY}px)`,

                        zIndex: 10,

                        cursor: isDraggingLegend
                            ? "grabbing"
                            : "grab",

                        userSelect: "none"
                    }}
                >
                    <div
                        className="padding--little"
                        style={{
                            position: "relative"
                        }}
                    >
                        <CategoricalLegend
                            {...{
                                titleOnly: !isLegendOpen,
                                colorName,
                                colorScale,
                                caTagToText,
                                attributeTagToText,
                                maxWidth: "180px"
                            }}
                        />

                        <button
                            style={{
                                position: "absolute",
                                top: 0,
                                right: 0,
                                cursor: "pointer"
                            }}

                            className="basic-button--no-border"

                            onMouseDown={(e) => {
                                e.stopPropagation()
                            }}

                            onClick={(e) => {
                                e.stopPropagation()
                                setIsLegendOpen(
                                    !isLegendOpen
                                )
                            }}
                        >
                            {isLegendOpen
                                ? "▲"
                                : "▼"}
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}


export default MultiCategoricalChart