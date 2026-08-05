import { useMemo } from "react"
import _ from "lodash"

import { Group } from "@visx/group"
import { Text } from "@visx/text"
import { localPoint } from "@visx/event"
import { useTooltip, useTooltipInPortal } from "@visx/tooltip"


import PropTypes from "prop-types"
import SingleCategoricalChart from "./Single"
import MultiCategoricalChart from "./Multiple"


import { getColorPalette } from "../../colors/palette"
import XYAxisWithBackground from "../../axis/Axis"
import Box from "../../primitives/Box"
import Bar from "../../primitives/Bar"
import ErrorBar from "../base/Error"
import MetricTable from "../../tooltip/MetricTable"
import { ConditionApplicationLabel } from "../../axis/ConditionApplicationLabel"


Categorical.propTypes = {
    width: PropTypes.number,
    height: PropTypes.number,
    data: PropTypes.array,
    margins: PropTypes.object,
    yaxisName: PropTypes.string,
    colorName: PropTypes.string,
    splitName: PropTypes.string,
    subplotName: PropTypes.string,
    yaxisLabel: PropTypes.string,
    errorName: PropTypes.string,
    tooltipNames: PropTypes.array,
    colorPalette: PropTypes.array,
    minMaxYDomain: PropTypes.any,
    innerSubplotPadding: PropTypes.number,
    outerSubplotPadding: PropTypes.number,
    innerSplitPadding: PropTypes.number,
    innerColorPadding: PropTypes.number,
    svgID: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    darkmode: PropTypes.bool,
    chartType: PropTypes.oneOf(["boxplot", "barplot", "lineplot"]),
    bottomTicksAreConditionApplicationLabels: PropTypes.bool,
    caTagToText: PropTypes.object,
    attributeTagToText: PropTypes.object
}

Categorical.defaultProps = {
    width: 400,
    height: 300,
    data: [
        { y: 5, T: "A", G: "WT", O: "0.5h", e: 0.2 },
        { y: 4, T: "B", G: "WT", O: "0.5h", e: 0.4 },
        { y: 10, T: "C", G: "WT", O: "0.5h", e: 1.2 },
        { y: 5, T: "A", G: "WT", O: "0.5h", e: 0.2 },
        { y: 4, T: "B", G: "WT", O: "0.5h", e: 0.2 },
        { y: 10, T: "C", G: "WT", O: "0.5h", e: 0.2 },
        { y: 5, T: "A", G: "KO", O: "0.5h", e: 0.2 },
        { y: 40, T: "B", G: "KO", O: "0.5h", e: 0.2 },
        { y: -20, T: "C", G: "KO", O: "0.5h", e: 0.2 },
        { y: 5, T: "A", G: "WT", O: "10h", e: 3.2 },
        { y: 4, T: "B", G: "WT", O: "10h", e: 0.2 },
        { y: 2, T: "C", G: "WT", O: "10h", e: 0.2 },
        { y: 5, T: "A", G: "KO", O: "10h", e: 0.8 },
        { y: 4, T: "B", G: "KO", O: "10h", e: 0.2 },
        { y: 2, T: "C", G: "KO", O: "10h", e: 6.2 }
    ],
    chartType: "boxplot",
    margins: {
        left: 45,
        right: 5,
        bottom: 35,
        top: 8
    },
    yaxisName: "value",
    colorName: undefined,
    splitName: undefined,
    subplotName: undefined,
    yaxisLabel: undefined,
    errorName: "e",
    tooltipNames: [],
    colorPalette: [],
    minMaxYDomain: undefined,
    innerSubplotPadding: 0.05,
    outerSubplotPadding: 0.1,
    innerSplitPadding: 0.2,
    innerColorPadding: 0.0,
    svgID: undefined,
    darkmode: false,
    bottomTicksAreConditionApplicationLabels: true,
}

function Categorical({
    width,
    height,
    data,
    margins,
    yaxisName,
    colorName,
    splitName,
    subplotName,
    yaxisLabel,
    errorName,
    tooltipNames,
    colorPalette,
    minMaxYDomain,
    innerSubplotPadding,
    outerSubplotPadding,
    innerSplitPadding,
    innerColorPadding,
    svgID,
    darkmode,
    chartType,
    bottomTicksAreConditionApplicationLabels,
    caTagToText,
    attributeTagToText
}) {

    // stroke color used for every Box/axis-adjacent element that responds to darkmode
    const strokeColor = darkmode ? "#ffffff" : "#000000"

    // get color values for legend/label
    // memoized so hover-triggered re-renders (tooltip show/hide) don't rebuild this every time
    const legendColors = useMemo(() => {
        const uniqueColorValuesFromData = _.uniqBy(data, colorName)
        const useCustomPalette = _.isArray(colorPalette) && colorPalette.length === uniqueColorValuesFromData.length
        const colorValues = useCustomPalette
            ? colorPalette
            : getColorPalette(uniqueColorValuesFromData.length, darkmode)
        // map colors to color attribute values
        return Object.fromEntries(uniqueColorValuesFromData.map((d, idx) => [d[colorName], colorValues[idx]]))
    }, [data, colorName, colorPalette, darkmode])

    const {
        tooltipData,
        tooltipLeft,
        tooltipTop,
        tooltipOpen,
        showTooltip,
        hideTooltip,
    } = useTooltip();

    const { containerRef, TooltipInPortal } = useTooltipInPortal({
        // use TooltipWithBounds
        detectBounds: true,
        // when tooltip containers are scrolled, this will correctly update the Tooltip position
        scroll: true,
    })

    const getTooltipData = ({ data, value, errorValue }) => {
        let quantileData = []
        let barInfo = []
        if (chartType === "boxplot") {

            quantileData = extractQuantileData(data, undefined, false, true)
        }
        else if (chartType === "barplot") {
            barInfo = [{ text: yaxisName, value: _.round(value, 2), type: "default" }, { text: "Error", type: "default", value: _.isNaN(errorValue) ? "NaN" : _.round(errorValue, 2) }]
        }
        const tooltipInfo = _.map(tooltipNames,
            tooltipName => {
                let tooltipValue = data[tooltipName.text]

                return {
                    text: tooltipName.text,
                    value: tooltipValue,
                    type: tooltipName.type
                }
            }).filter(t => t.value !== undefined)

        return _.concat(tooltipInfo, quantileData, barInfo)
    }

    /**
     * 
     * @param {Number[]} array 
     * @param {Function} yScale 
     * @param {Boolean} scale 
     * @param {Boolean} forTooltip 
     * @returns 
     */
    const extractQuantileData = (array, yScale, scale = true, forTooltip = false) => {
        // bail out unless array is an object AND has the yaxisName key -- previously this
        // used `&&` which only caught the case where array was neither, letting
        // "object but missing the key" fall through to a crash below
        if (!_.isObject(array) || !_.has(array, yaxisName)) {
            return forTooltip ? [] : {}
        }
        if (chartType === "boxplot") {
            if (forTooltip) {
                return _.map(array[yaxisName], (q, idx) => { return { text: array.labels[idx], type: "default", value: scale ? yScale(q) : _.round(q, 2) } })
            }
            return Object.assign(...array[yaxisName].map((q, idx) => { return ({ [array.labels[idx]]: scale ? yScale(q) : _.round(q, 2) }) })
            )
        }
    }

    /**
     * 
     * @param {MouseEvent} event 
     * @param {Object[]} bartooltipData 
     */
    const handleMouseOver = (event, bartooltipData) => {
        const coords = localPoint(event.target.ownerSVGElement, event);
        showTooltip({
            tooltipLeft: coords.x,
            tooltipTop: coords.y,
            tooltipData: bartooltipData
        });
    };

    return (
        <div ref={containerRef} className="flex flex column">
            {colorName && splitName === undefined && subplotName === undefined ?
                <SingleCategoricalChart
                    {...{
                        data,
                        width,
                        height,
                        svgID,
                        margins,
                        yaxisName,
                        colorName,
                        minMaxYDomain,
                        colorPalette: legendColors,
                        svgRef: containerRef,
                        chartType,
                        yScaleStartsAtZero: chartType === "barplot",
                        caTagToText,
                        attributeTagToText,
                        darkmode
                    }}>
                    {(categoricalData) => categoricalData.map(({
                        idx,
                        colorCategories,
                        chartType,
                        data,
                        yaxisName,
                        colorName,
                        margins,
                        splitColorScale,
                        colorScale,
                        yScale,
                        chartHeight,
                        chartWidth,
                        colorBandwidth,
                        darkmode,
                        caTagToText,
                        attributeTagToText
                    }, didx) => {
                        return (
                            <g key={`singleCat-bar-${idx}-${didx}`}>
                                <XYAxisWithBackground
                                    margins={margins}
                                    leftScale={yScale}
                                    bottomScale={splitColorScale}
                                    bandwidth={colorBandwidth}
                                    bottomLabel={""}
                                    leftLabel={_.isString(yaxisLabel) ? yaxisLabel : yaxisName}
                                    {...{
                                        chartHeight,
                                        chartWidth,
                                        darkmode,
                                        bottomTicksAreConditionApplicationLabels,
                                        caTagToText,
                                        attributeTagToText
                                    }} />
                                {/* x axis label */}
                                <Text
                                    x={margins.left + chartWidth / 2}
                                    y={margins.top + chartHeight + 35}
                                    verticalAnchor="start"
                                    fill={darkmode ? "#ffffff" : "#000000"}
                                    textAnchor="middle">
                                    {attributeTagToText.get(colorName) ? attributeTagToText.get(colorName) : colorName}
                                </Text>

                                {colorCategories.map(colorCategory => {
                                    const xPosition = splitColorScale(colorCategory)
                                    const color = colorScale(colorCategory)
                                    const dataForColorCategory = data.filter(d => d[colorName] === colorCategory)[0]
                                    const boxQuantiles = extractQuantileData(dataForColorCategory, yScale)

                                    const yPosition = yScale(dataForColorCategory[yaxisName])
                                    const errorValue = dataForColorCategory[errorName]
                                    return (
                                        <Group
                                            key={`bar-error-${colorCategory}`}
                                            left={margins.left}
                                            onMouseEnter={e => handleMouseOver(e, getTooltipData({ data: dataForColorCategory, value: dataForColorCategory[yaxisName], errorValue }))}
                                            onMouseLeave={hideTooltip}>

                                            {chartType === "boxplot" ?
                                                <Box
                                                    {...boxQuantiles}
                                                    fill={color}
                                                    stroke={darkmode ? "#ffffff" : "#000000"}
                                                    x={xPosition + colorBandwidth / 2}
                                                    width={colorBandwidth}
                                                    showWhiskers={true} /> :

                                                chartType === "barplot" ?
                                                    <Group>
                                                        <Bar x={xPosition} y1={yPosition} y0={yScale(0)} fill={color} width={colorBandwidth} />
                                                        {errorName !== undefined && !_.isNaN(errorValue) && _.isNumber(errorValue) ?
                                                            <ErrorBar
                                                                x={xPosition + colorBandwidth / 2}
                                                                y0={yPosition} //bar start 
                                                                y1={yPosition > 0 ? yScale(yPosition + errorValue) : yScale(yPosition - errorValue)}
                                                                width={colorBandwidth * 0.5} /> : null}
                                                    </Group>
                                                    :
                                                    null}
                                        </Group>
                                    )
                                })}
                            </g>
                        )
                    })}

                </SingleCategoricalChart> :

                <MultiCategoricalChart
                    {...{
                        data,
                        width,
                        height,
                        svgID,
                        margins,
                        yaxisName,
                        colorName,
                        splitName,
                        subplotName,
                        innerColorPadding,
                        innerSplitPadding,
                        innerSubplotPadding,
                        outerSubplotPadding,
                        colorPalette: legendColors,
                        yScaleStartsAtZero: false,
                        minMaxYDomain,
                        svgRef: containerRef,
                        caTagToText,
                        attributeTagToText
                    }}>
                    {(categoricalData) => categoricalData.map((
                        {
                            yaxisName,
                            splitName,
                            colorName,
                            subplotCategory,
                            splitCategories,
                            subplotScale,
                            splitScale,
                            splitColorScale,
                            colorScale,
                            yScale,
                            subplotData,
                            chartHeight,
                            chartWidth,
                            colorBandwidth,
                            margins,
                            xcenter,
                            subplotCategoryFound,
                            colorCategoryFound,
                            splitCategoryFound,
                            caTagToText,
                            attributeTagToText
                        }, didx) => {
                        const subplotStart = subplotScale(subplotCategory)
                        const subplotWidth = subplotScale.bandwidth()
                        return (
                            <g key={`${subplotCategory}-subplot`}>

                                <XYAxisWithBackground
                                    leftLeft={subplotStart}
                                    topBottom={margins.top + chartHeight}
                                    margins={margins}
                                    leftScale={yScale}
                                    leftTickLabelsVisible={didx === 0}
                                    bottomScale={splitScale}
                                    bottomTicksAreConditionApplicationLabels={bottomTicksAreConditionApplicationLabels}
                                    bottomLabel={""}
                                    caTagToText={caTagToText}
                                    attributeTagToText={attributeTagToText}
                                    bandwidth={splitScale.bandwidth() * 1.1}
                                    leftLabel={didx === 0 ? _.isString(yaxisLabel) ? yaxisLabel : yaxisName : ""}
                                    {...{ chartHeight, chartWidth: subplotWidth }} />

                                {subplotCategoryFound ?
                                    <g>

                                        <ConditionApplicationLabel caTagToText={caTagToText} x={xcenter} y={margins.top + 12} tag={subplotCategory} />

                                    </g> : null}

                                {didx === 0 ? <Text
                                    x={margins.left + chartWidth / 2}
                                    y={margins.top + chartHeight + 25}
                                    verticalAnchor="start"
                                    textAnchor="middle">{_.isObject(attributeTagToText) && _.isString(attributeTagToText.get(splitName)) ? attributeTagToText.get(splitName) : splitName}</Text> : null}


                                {/* {If there is not split but a subplot} */}
                                {(!splitCategoryFound && colorCategoryFound && subplotCategoryFound) ?
                                    subplotData.map(subplotDataArray => {

                                        var boxWidth = splitColorScale.bandwidth()
                                        var colorCategory = subplotDataArray[colorName]
                                        var xBar = splitColorScale(colorCategory)
                                        const boxQuantiles = extractQuantileData(subplotDataArray, yScale)
                                        return (
                                            <Group
                                                key={`subplot-box-${subplotCategory}-${colorCategory}`}
                                                left={subplotStart}
                                                onMouseEnter={e => handleMouseOver(e, getTooltipData({ data: subplotDataArray, value: subplotDataArray[yaxisName], errorValue: subplotDataArray[errorName] }))}
                                                onMouseLeave={hideTooltip}>

                                                <Box stroke={strokeColor} {...boxQuantiles} fill={colorScale(colorCategory)} x={xBar + boxWidth / 2} width={boxWidth} />
                                            </Group>
                                        )
                                    })

                                    : null}


                                {/* If there is just a split Category, the split scale cannot be used -- very odd case*/}
                                {!splitCategoryFound && !colorCategoryFound ?
                                    subplotData.map((subplotDataArray, subplotIdx) => {
                                        var xBar = (subplotWidth - subplotWidth * 0.75) / 2
                                        var boxWidth = subplotWidth * 0.75

                                        const boxQuantiles = extractQuantileData(subplotDataArray, yScale)
                                        return (
                                            <Group
                                                key={`nosplit-box-${subplotCategory}-${subplotIdx}`}
                                                left={subplotStart}
                                                onMouseEnter={e => handleMouseOver(e, getTooltipData({ data: subplotDataArray, value: subplotDataArray[yaxisName], errorValue: subplotDataArray[errorName] }))}
                                                onMouseLeave={hideTooltip}>

                                                {/* fill uses a fixed fallback color -- colorScale() with no argument (no color
                                                    dimension in this branch) previously returned an undefined/default range value */}
                                                <Box stroke={strokeColor} {...boxQuantiles} fill={legendColors[Object.keys(legendColors)[0]] ?? strokeColor} x={xBar + boxWidth / 2} width={boxWidth} />

                                            </Group>
                                        )
                                    })


                                    : null}

                                {/* if splitName is undefined, splitCategories will be en empty array, no plotting required */}
                                {splitCategories.map((splitCategory, splitIdx) => {

                                    const splitCatData = subplotData.filter(m => m[splitName] === splitCategory)
                                    const splitStart = splitScale(splitCategory)

                                    return (
                                        <Group left={subplotStart + splitStart} key={`${splitCategory}-${splitIdx}`}>
                                            {splitCatData.map((colorCatData, colorIdx) => {
                                                var colorCategory = colorCatData[colorName]
                                                var color = colorScale(colorCategory)
                                                var xBar = splitColorScale(colorCategory)

                                                const boxQuantiles = extractQuantileData(colorCatData, yScale)

                                                return (
                                                    <Group key={`${colorIdx}-${subplotCategory}-${colorCategory}`}
                                                        onMouseEnter={e => handleMouseOver(e, getTooltipData({ data: colorCatData, value: colorCatData[yaxisName], errorValue: colorCatData[errorName] }))}
                                                        onMouseLeave={hideTooltip}>
                                                        <Box stroke={strokeColor} {...boxQuantiles} fill={color} x={xBar + colorBandwidth / 2} width={colorBandwidth} />

                                                    </Group>
                                                )
                                            })}
                                        </Group>
                                    )
                                })}
                            </g>)
                    })}

                </MultiCategoricalChart>}


            {tooltipOpen && (
                <TooltipInPortal
                    top={tooltipTop}
                    left={tooltipLeft}
                >
                    {_.isArray(tooltipData) ? <MetricTable data={tooltipData} caTagToText={caTagToText} attributeTagToText={attributeTagToText} colorMap={legendColors} /> : null}


                </TooltipInPortal>
            )}
        </div>
    )
}



export default Categorical
