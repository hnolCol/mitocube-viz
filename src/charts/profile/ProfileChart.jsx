
import { SVG } from "../base/SVG";
import XYAxisWithBackground from "../../axis/Axis"
import { useMemo, useRef } from "react";
import { scaleBand, scaleLinear, scaleOrdinal } from "@visx/scale";


import { QuantileBackground } from "./QuantileBackground";
import { Group } from "@visx/group";
import { Text } from "@visx/text";

import _, { get } from "lodash"
import { getQuantilesInArrayByKeyNames } from "../../utils/stats";
import { addMarginToBoundaries, getChartWidthAndHeightWithMargins } from "../../utils/border";
import ProfilesWithNaN from "../../primitives/ProfilesWithNaN";
import ProfileLine from "../../primitives/ProfileLine";
import { getColorPalette } from "../../colors/palette";
import { TextLabel } from "../../text/TextLabel";

export function ProfileChart({
    chartIdx,
    width = 320,
    height = 240,
    margins = {
        left: 45,
        top: 5,
        right: 45,
        bottom: 40
    },
    data,
    valid,
    yaxisName,
    xaxisName = "sample_tag",
    splitName, 
    labelNames = [],
    yaxisLabel,
    xaxisLabel,
    limits,
    stroke = "#00000",
    colorName, 
    svgID,
    rerenderHover,
    rerenderBackground,
    hoverData,
    profileAsLine = true,
    profileAsBar = false,
    subsetIndices = new Set(), // subset the data to only plot those 
    searchIndices = new Set(),
    hoverIndices = new Set(),
    mergeHoverWithSearch = true,
    showQuantileBackground = false,
    showSplits = true,
    containsNaN = false,
    darkmode = false,
    proteinTagMap,
    splitByProtein = false,
    includeXs
}) {  


     const { chartWidth, chartHeight } = getChartWidthAndHeightWithMargins({ width, height, margins })

    // if (mergeHoverWithSearch && (hoverIndices.size > 0 || searchIndices.size > 0)) {

    //     hoverIdcsInSubset = Array.from([...hover Indices, ...searchIndices].filter(idx => subsetIndices.has(idx)))
    // } else {
    //     hoverIdcsInSubset = hoverIndices.size > 0 ? Array.from([...hoverIndices].filter(idx => subsetIndices.has(idx))) : []
    // }


    const uniqueSplitValues = _.isString(splitName) ? _.uniqBy(data, splitName).map(d => d[splitName]) : []
    const B = uniqueSplitValues.map(val => proteinTagMap.has(val))
    const uniqueSplitText = splitByProtein && proteinTagMap ? uniqueSplitValues.map(val => proteinTagMap.has(val) ?  proteinTagMap.get(val).text : val) : uniqueSplitValues
    const indexesBySplit = useMemo(() => {
        const groups = {};
        data.forEach((item, index) => {
            const splitValue = get(item, splitName);
            if (!groups[splitValue]) {
                groups[splitValue] = [];
            }
            groups[splitValue].push(index);
        });
        return groups;
    }, [data, splitName]);
   
    const svgRef = useRef(null);
   
    
    const q = showQuantileBackground ? useMemo(() => getQuantilesInArrayByKeyNames({ data : data.filter((_,idx) => subsetIndices.has(idx)), keyNames: yaxisName }), [yaxisName]) : null
    
    const getYScaleDomain = () => {
        const yDomain = limits[yaxisName]
        const yDomainWithMargin = addMarginToBoundaries({ domain: yDomain, frac: 0.1 })
        
        return yDomainWithMargin
    }
    const yScale = useMemo(() => {

        const yDomain = getYScaleDomain()
        
        
        return scaleLinear(
            {
                domain: [yDomain.max, yDomain.min],
                range: [margins.top, margins.top + chartHeight],
                nice: true
            }
        )
    }, [yaxisName, chartHeight, margins.top, margins.bottom, limits[yaxisName].min, limits[yaxisName].max])

    const xScale = useMemo(() => {
        // y scale for the scatter by yaxisNames
        const domain = _.uniqBy(data,xaxisName).map(d => d[xaxisName])
        return scaleBand(
            {
                domain,
                range: [margins.left, margins.left + chartWidth],
                nice: true,
                padding : 1
                
            }
        )
    }, [chartWidth, yaxisName.length, margins.left, margins.right])


    const colorScale = useMemo(() => {
     
        if (colorName === undefined) return () => stroke
        const colorDomain = _.uniqBy(data, colorName).map(d => d[colorName])
        const colorRange = getColorPalette(colorDomain.length, darkmode)
   
        return scaleOrdinal({
            domain: colorDomain,
            range: colorRange,
        })} ,[colorName, stroke, darkmode, data.length, _.join(_.uniqBy(data, colorName).map(d => d[colorName]))])
    
    
    return (
        
        <SVG {...{ width, height, svgID, svgRef}}>
            <XYAxisWithBackground
                margins={margins}
                leftScale={yScale}
                bottomScale={xScale}
                bottomLabel={_.isString(xaxisLabel)?xaxisLabel:xaxisName}
                leftHideTicks={false}
                leftLabel={yaxisLabel} 
                moveBottomToLeft={false}
                bottomHideTickLabels={true}
                bottomTicksAreConditionApplicationLabels={false}
            
                {...{ chartHeight, chartWidth }} />
        
            {showQuantileBackground ? <QuantileBackground {...{xScale, yScale, data : q, keyNames : yaxisName, rerenderDependency: rerenderBackground}} /> : null}  
            
            {profileAsLine ? 
                <g>
                    
                    {_.keys(indexesBySplit).map((splitValue, idx) => {
                        const indices = indexesBySplit[splitValue]
                        const splitData = indices.map(i => data[i])
                        return <ProfilesWithNaN
                        
                            key={`profile-${splitValue}-${idx}`}
                            { ...{
                                data: splitData, //displayData
                                xaxisName,
                                yaxisName,
                                yScale,
                                xScale,
                                includeXs,
                                stroke : colorScale(splitData[0][colorName]),
                                rerenderDependency: _.concat(rerenderHover, rerenderBackground, chartHeight, chartWidth, yScale.domain(), yScale.domain())
                            }} />
                    })} 

                
                </g> : null}

            {showSplits ? 
                    <g>
                        
                    <TextLabel
                        dx={1}
                        margins={margins}
                        labelTexts={uniqueSplitText}
                        color={uniqueSplitValues.map(splitValue => colorScale(splitValue))}
                        isProtein={uniqueSplitValues.map(v => true)}/> 
                        
                </g> : null 
            }
            {/* {profileAsBar ? <g>
                <ProfileBars {...{ valid, data: displayData, xScale, yScale, yaxisName, xaxisName, rerenderDependency: rerenderHover }} />
            </g> : null} */}

            {/* Indicate Searches */}
            
            {/* {searchIndices.size > 0 ? <FilterIndicator {...{ searchIndices : searchIndicesInSubset, width, margins }} /> : null} */}
            
            {/* {<ChartTopLeftLabel {...{ margins, labelTexts: [`C${chartIdx}`,`n=${subsetIndices.size}`], textOffset: 3, color : [stroke,"#00000"] }} />} */}
            
        </SVG >
    )
}