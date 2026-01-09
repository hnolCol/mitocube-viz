import PropTypes from "prop-types"
import _ from "lodash"

import React, { useMemo, useState, useRef } from "react"
import { scaleLinear, scaleOrdinal } from "@visx/scale"
import { useTooltip, useTooltipInPortal } from "@visx/tooltip"
import { LegendItem, LegendLabel, LegendLinear } from "@visx/legend"



import { SVG } from "../base/SVG"
import { getUniqueValuesInArrayOfObjects } from "../../utils/arrays"
import { getRedBlueColorScale, getColorPalette, getAxisStrokeColor } from "../../colors/palette"
import { roundNumber } from "../../transforms/numbers"
import HeatmapRow from "./Row"


Heatmap.propTypes = {
    width: PropTypes.number,
    data: PropTypes.arrayOf(PropTypes.object),
    valueNames: PropTypes.arrayOf(PropTypes.string),
    clusterName: PropTypes.string,
    colorNames: PropTypes.arrayOf(PropTypes.string), // columns that are plotted next to the right of the value 
    labelNames: PropTypes.arrayOf(PropTypes.string),
    binHeight: PropTypes.number,
    legendElementSize: PropTypes.number,
    matchWidth: PropTypes.bool,
    handleSearchByDataIndex: PropTypes.func,
    resetSearchIdcs: PropTypes.func,
    searchIndices: PropTypes.instanceOf(Set),
    hoverIndices: PropTypes.instanceOf(Set),
    setHoverDataByDataIndex: PropTypes.func,
    minMax: PropTypes.arrayOf(PropTypes.number)
}

Heatmap.defaultProps = {
    data: [
        { v: 2, v1: 4, B: "+", C: "-" },
        { v: 2, v1: 4, B: "+", C: "-" },
        { v: 2, v1: 4, B: "+", C: "-" },
        { v: -2, v1: 2, B: "-", C: "+" },
        { v: 0, v1: 1.2, B: "-", C: "+" }
    ],
    valueNames: ["v", "v1"],
    clusterName: "c",
    colorNames: ["B", "C"],
    labelNames: ["B"],
    binHeight: 15,
    legendElementSize: 20,
    matchWidth: true,
    handleSearchByDataIndex: undefined,
    resetSearchIdcs: undefined,
    searchIndices: new Set(),
    hoverIndices: new Set(),
    setHoverDataByDataIndex: () => {},
    minMax: [-6, 6],
    darkmode : false
}

/**
 * 
 * @param {Object} props 
 * @param {Object[]} props.data - The data for the heatmap 
 * @param {String[]} props.valueNames - The keyNames in data items that should be shown in the heatmap 
 * @param {String[]} props.colorNames - The keyNames in data items that should be used for an extra color column in the heatmap
 * @param {Number} props.binHeight - The pixel height of rectangle in the heatmap 
 * @param {Boolean} props.matchWidth - If the width of the SVG should be matched. If enabled the binHeight will not be used for the width of the rectangle. Which is otherwise done to
 * achieve rectangles.
 * @param {Function} props.setHoverDataByDataIndex - Function to set the hover data by data index.
 * @returns {React.ReactElement} - The heatmap JSX Element.
 */
function Heatmap({
    data,
    valueNames,
    clusterName,
    colorNames,
    labelNames,
    binHeight,
    legendElementSize,
    matchWidth,
    handleSearchByDataIndex,
    resetSearchIdcs,
    searchIndices,
    hoverIndices,
    setHoverDataByDataIndex,
    minMax,
    darkmode
}) {
    
    
    const [scrollPos, setScrollPos] = useState(0)
    const uniqueColorValues = useMemo(() => colorNames.length > 0 ? getUniqueValuesInArrayOfObjects({data, keyName : colorNames}) : [], [_.join(colorNames),data.length])
    const uniqueClusterValues = useMemo(() => getUniqueValuesInArrayOfObjects({ data, keyName : clusterName }).filter(v => v!==undefined), [clusterName])
    const heatmapValues = useMemo(() => _.map(data, d => _.map(valueNames, valueName => d[valueName])), [_.join(valueNames),data.length])
    const labels = useMemo(() => { return labelNames.length > 0?_.map(data, d => _.join(_.map(labelNames, labelName => d[labelName])," | ")) : undefined}, [_.join(labelNames),data.length])
    const labelsExist = _.isArray(labels)
    const colorValuesExist = uniqueColorValues.length > 0
    const numberRows = data.length
    const heatmapSVGHeight = numberRows * binHeight
    const heatmapSVGWidth = valueNames.length * binHeight + colorNames.length * binHeight + 300
    const { tooltipData, tooltipOpen, tooltipLeft, tooltipTop, hideTooltip, showTooltip } = useTooltip()
    const refScrollContainer = useRef(null)
    let minIdx = 0
    let maxIdx = 20

    const { containerRef, TooltipInPortal } = useTooltipInPortal({
        // use TooltipWithBounds
        detectBounds: true,
        // when tooltip containers are scrolled, this will correctly update the Tooltip position
        scroll: true,
    })

    //value scale 
    /**
     * @description Calculates the colorScale to visualize the values. The function is memorized 
     * and only recalculated if minMax or the heatmapValues changes.
     * @returns {Function} 
     */
    const valueScale = useMemo(() => {
        return scaleLinear({
            domain: [minMax[0],0,minMax[1]],
            range : getRedBlueColorScale()
    })},[minMax,heatmapValues])

    /**
     * @description The colorScale for the individual clusters. 
     */
    const clusterColorScale = useMemo(() => {
        
        if (uniqueClusterValues.length === 0) return () => "#fafafa"
        
        return scaleOrdinal({
            domain: uniqueClusterValues,
            range : getColorPalette(uniqueClusterValues.length)
        })
    }, [clusterName])


    /**
     * @description Calculates the colorScale for the extraColor (keyNames)
     */
    const extraColorScale = useMemo(() => {
        if (uniqueColorValues.length === 0) return () => "#fafafa"
        var colorPalette = getColorPalette(uniqueColorValues.length)
        const idx = uniqueColorValues.indexOf("-")
        if (_.isNumber(idx)) colorPalette[idx] = "#fafafa"
        return scaleOrdinal({
            domain: uniqueColorValues,
            range: colorPalette,
        })
    }, [uniqueColorValues])


    const handleMouseEntersRow = (event, index) => {

        hoverIndices.clear()
        hoverIndices.add(index)
        setHoverDataByDataIndex(undefined,hoverIndices)
    }

    const handleMouseLeavesRow = () => {

        hoverIndices.clear()
        setHoverDataByDataIndex(undefined,hoverIndices)
    }
    //


    const dataIdcs = searchIndices.size > 0 ? _.range(numberRows).filter(idx => searchIndices.has(idx)) : _.range(numberRows)


    if (refScrollContainer.current !== null){
        minIdx = _.toInteger(scrollPos / binHeight)
        maxIdx = _.toInteger(minIdx + refScrollContainer.current.clientHeight / binHeight)
    }


    return (
        
        <div className="flex flex-column">
            <div className="margin--medium flex flex-column" style={{maxHeight:"12rem"}}>
                <div><h4>Z-Scores</h4></div>
                <div className="flex flex-column">
                <LegendLinear scale={valueScale}>
                    {(labels) => labels.map(label => {
                        return <LegendItem key={label.value} className="flex flex-row align-items-center">
                            <svg width={legendElementSize} height={legendElementSize}><rect width={legendElementSize} height={legendElementSize} fill={label.value} stroke={getAxisStrokeColor(darkmode)} /></svg>
                                <LegendLabel style={{ marginLeft: "0.5rem" }}>{roundNumber({ number: label.datum, limit : {min : minMax[0], max : minMax[1]}})}</LegendLabel>
                        </LegendItem>
                    })}
                    </LegendLinear>
                    </div>
            </div>
            
            {/* The actual heatmap with values */}
            <div style={{ overflowY: "scroll", maxHeight: "80vh" }} onScroll={(e) => setScrollPos(e.target.scrollTop)} ref={refScrollContainer}>
            
            <SVG {...{ width: heatmapSVGWidth, height: heatmapSVGHeight, svgRef: containerRef }}>
                
                {dataIdcs.map((index,rowNumber) => {
                   // if (searchIndices.size > 0 && !searchIndices.has(rowNumber)) return null 
                    var rowValues = heatmapValues[index]
                    var y = rowNumber * binHeight
                    var xValuesEnd = rowValues.length * binHeight + 1 //+1 for cluster label
                    var marginBetweenValuesAndColors = colorValuesExist ? binHeight : 0
                    var marginBetweenValuesAndLabels = colorValuesExist ? colorNames.length * binHeight + marginBetweenValuesAndColors : marginBetweenValuesAndColors 
                    var labelString = labelsExist ? labels[index] : undefined

                    return (
                        <HeatmapRow {...{
                            key: `${index}-${rowNumber}-${labelString}`,
                            data : data[index],
                            valueNames,
                            rowNumber,
                            index,
                            minIdx,
                            maxIdx,
                            y,
                            binHeight,
                            valueScale,
                            xValuesEnd,
                            extraColorScale,
                            marginBetweenValuesAndColors,
                            marginBetweenValuesAndLabels,
                            colorValuesExist,
                            colorNames,
                            labelsExist,
                            labelString,
                            clusterIndexColor : clusterColorScale(data[index]["cluster"]),
                            opacity : hoverIndices.size === 0 ? 1 : hoverIndices.has(index) ? 1 : 0.4,
                            handleMouseEnter: handleMouseEntersRow,
                            handleMouseLeave: handleMouseLeavesRow,
                            darkmode
                        }} />
                    )
                })}

                </SVG>
                </div>
            {tooltipOpen ? <TooltipInPortal left={tooltipLeft} top={tooltipTop} key={Math.random()}>
                <p>BUM</p>

            </TooltipInPortal> : null}
        </div>
    )
}

export default Heatmap