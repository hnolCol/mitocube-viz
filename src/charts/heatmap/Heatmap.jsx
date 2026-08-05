import PropTypes from "prop-types"
import _ from "lodash"

import React, { useMemo, useState, useRef, useEffect } from "react"
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
    minMax: PropTypes.arrayOf(PropTypes.number),
    selectedClusters : PropTypes.arrayOf(PropTypes.number)
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
    clusterName:  undefined,
    colorNames: ["B", "C"],
    labelNames: ["tag"],
    binHeight: 15,
    legendElementSize: 20,
    matchWidth: true,
    handleSearchByDataIndex: undefined,
    resetSearchIdcs: undefined,
    searchIndices: new Set(),
    hoverIndices: new Set(),
    setHoverDataByDataIndex: () => {},
    minMax: [-6, 6],
    darkmode: false,
    selectedClusters: [],
    
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
    //labelNames,
    binHeight,
    legendElementSize,
    matchWidth,
    handleSearchByDataIndex,
    resetSearchIdcs,
    searchIndices,
    rerenderBackground,
    hoverIndices,
    setHoverDataByDataIndex,
    minMax,
    darkmode,
    isLabelFeatureTag,
    isLabelProteinTag,
    selectedClusters,
    setRequiredProteinTags,
    proteinTagMap,
    refetchedTrigger,
    proteinIsLoading,
    scrollContainerRef,
    maxHeight = "80vh",
    marginBetweenValues = 0,
    svgID = "heatmap-svg",
    exportMode = false
}) {
    const [scrollPos, setScrollPos] = useState(0)
    const uniqueColorValues = useMemo(() => colorNames.length > 0 ? getUniqueValuesInArrayOfObjects({ data, keyName: colorNames }) : [], [_.join(colorNames), data.length])
    const uniqueClusterValues = useMemo(() => getUniqueValuesInArrayOfObjects({ data, keyName: clusterName }).filter(v => v !== undefined), [clusterName])
    const heatmapValues = useMemo(() => _.map(data, d => _.map(valueNames, valueName => d[valueName])), [_.join(valueNames), data.length])
    //const labels = useMemo(() => { return labelNames.length > 0?_.map(data, d => _.join(_.map(labelNames, labelName => d[labelName])," | ")) : undefined}, [_.join(labelNames),data.length])
    //const labelsExist = _.isArray(labels)
    const colorValuesExist = uniqueColorValues.length > 0
    const numberRows = data.length
    const heatmapSVGHeight = numberRows * binHeight
    const heatmapSVGWidth = valueNames.length * binHeight + colorNames.length * binHeight + 300
    const { tooltipData, tooltipOpen, tooltipLeft, tooltipTop, hideTooltip, showTooltip } = useTooltip()
    //const refScrollContainer = useRef(null)
    
    const { containerRef, TooltipInPortal } = useTooltipInPortal({
        // use TooltipWithBounds
        detectBounds: true,
        // when tooltip containers are scrolled, this will correctly update the Tooltip position
        scroll: true,
    })

    
    const {minIdx, maxIdx } = useMemo(() => {
        if (scrollContainerRef.current !== null) {
            const minIdx = _.toInteger(scrollPos / binHeight)
            const maxIdx = _.toInteger(minIdx + scrollContainerRef.current.clientHeight / binHeight)
            return { minIdx, maxIdx }
        }
        return { minIdx: 0, maxIdx: 20 }
    }, [scrollPos, scrollContainerRef.current, binHeight])




    useEffect(() => {
        if (searchIndices.size > 0 && !proteinIsLoading) {
            setRequiredProteinTags([...searchIndices].map(idx => data[idx]["tag"]).filter(d => _.isString(d)))
        }
    }, [rerenderBackground])

    //value scale 
    /**
     * @description Calculates the colorScale to visualize the values. The function is memorized 
     * and only recalculated if minMax or the heatmapValues changes.
     * @returns {Function} 
     */
    const valueScale = useMemo(() => {
        return scaleLinear({
            domain: [minMax[0], 0, minMax[1]],
            range: getRedBlueColorScale()
        })
    }, [minMax, heatmapValues])

    /**
     * @description The colorScale for the individual clusters. 
     */
    const clusterColorScale = useMemo(() => {
        
        if (uniqueClusterValues.length === 0) return () => "#fafafa"
        
        return scaleOrdinal({
            domain: uniqueClusterValues,
            range: getColorPalette(uniqueClusterValues.length)
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
        setHoverDataByDataIndex(undefined, hoverIndices)
    }

    const handleMouseLeavesRow = () => {

        hoverIndices.clear()
        setHoverDataByDataIndex(undefined, hoverIndices)
    }
    //


    useEffect(() => {
        const proteinTagsDisplayInRange = dataIdcs.filter((dataIdx, idx) => idx >= minIdx && idx <= maxIdx).map(dataIdx => data[dataIdx]["tag"]).filter(tag => _.isString(tag)).map(tag => tag.includes(";") ? tag.split(";") : tag).flat()
        setRequiredProteinTags(prevValues => [...new Set([...prevValues, ...proteinTagsDisplayInRange])])
        
    }, [minIdx,maxIdx, selectedClusters.length, _.join(selectedClusters)])

    let dataIdcs = searchIndices.size > 0 ? _.range(numberRows).filter(idx => searchIndices.has(idx)) : _.range(numberRows)
    if (selectedClusters.length > 0) {
        dataIdcs = dataIdcs.filter(idx => selectedClusters.includes(data[idx]["cluster"]))
    }

    // slice to the visible window (+ small buffer) right before rendering
    const startIdx = Math.max(0, minIdx - 5)
    const visibleIdcs = exportMode ? dataIdcs : dataIdcs.slice(startIdx, maxIdx + 5)

    return (
        
        <div className="flex" style={{overflowY: "hidden", maxHeight : maxHeight}}>
            {/* The actual heatmap with values */}
            <div style={{ overflowY: "scroll", maxHeight: maxHeight}} onScroll={(e) => setScrollPos(e.target.scrollTop)} ref={scrollContainerRef}>
            
            <SVG {...{ width: heatmapSVGWidth, height: heatmapSVGHeight, svgRef: containerRef, svgID : svgID}}>
                
                {visibleIdcs.map((index, i) => {
                    const rowNumber = startIdx + i
                    var rowValues = heatmapValues[index]
                    var y = rowNumber * binHeight
                    var xValuesEnd = rowValues.length * binHeight + 1 + (marginBetweenValues * (rowValues.length - 1))
                    var marginBetweenValuesAndColors = colorValuesExist ? binHeight : 0
                    var marginBetweenValuesAndLabels = colorValuesExist ? colorNames.length * binHeight + marginBetweenValuesAndColors : marginBetweenValuesAndColors 
                    var labelString = data[index]["tag"]
                    return (
                        <HeatmapRow
                            key={`${index}-${labelString}`}
                            marginBetweenValues={marginBetweenValues}
                            {...{
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
                                labelString,
                                clusterIndexColor : clusterColorScale(data[index]["cluster"]),
                                opacity : hoverIndices.size === 0 ? 1 : hoverIndices.has(index) ? 1 : 0.4,
                                handleMouseEnter: handleMouseEntersRow,
                                handleMouseLeave: handleMouseLeavesRow,
                                darkmode,
                                isLabelProteinTag,
                                isLabelFeatureTag,
                                proteinTagMap,
                                
                                clusterExists : clusterName !== undefined && clusterName !== null && clusterName !== "",
                            }} />
                    )
                })}

                </SVG>
            </div>
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
        </div>
    )
}

export default Heatmap