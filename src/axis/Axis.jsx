import React from "react"
import { AxisBottom, AxisLeft } from "@visx/axis"
import _ from "lodash"




import { AxisBackground } from "./Background"
import { getAxisStrokeColor } from "../colors/stroke"
import { getNumberTicks } from "./ticks"
import { ConditionApplicationLabel } from "./ConditionApplicationLabel"



function XYAxisWithBackground({
    leftLeft,
    topBottom,
    leftScale,
    bottomScale,
    margins,
    bottomLabel,
    leftLabel,
    leftHideTicks = false,
    bottomHideTicks = false,
    bottomHideTickLabels = false,
    leftTickLabelsVisible = true,
    moveBottomToLeft = true,
    leftTickLabelProps = {},
    bottomTickLabelProps = {},
    bandwidth,
    chartHeight,
    chartWidth,
    darkmode = false
    }) {


    const leftStart = leftLeft === undefined ? margins.left : leftLeft
    const topStart = topBottom === undefined ? margins.top + chartHeight : topBottom


    if (_.isNumber(bandwidth)) {
        bottomTickLabelProps["width"] = bandwidth * 1.1
        bottomTickLabelProps["scaleToFit"] = 'shrink-only'
        bottomTickLabelProps["fontSize"] ="12px"
    }

    if (darkmode) {
        bottomTickLabelProps["fill"] = "#FFFFFF"
        leftTickLabelProps["fill"] = "#FFFFFF"
    }

    return (
        <g>
            <AxisBackground
                x={leftStart}
                y={margins.top}
                height={chartHeight}
                width={chartWidth}
                fill={darkmode ? "#2b2b2b" : "#fafafa"}
            />   
            <AxisLeft
                label={leftLabel} //label only first axis
                labelOffset={30}
                labelProps={{fontSize: "0.8rem", textAnchor : "middle", fill : darkmode ? "#FFFFFF" : "#000000", width : 0.8 * chartHeight}}
                tickLabelProps={{ fontSize: "0.8rem", ...leftTickLabelProps, width : 0.8 * chartHeight}}
                tickFormat={(tickLabel) => leftTickLabelsVisible ? tickLabel : undefined}
                left={leftStart}
                scale={leftScale}
                tickLineProps={{stroke : darkmode ? "#FFFFFF" : "#000000"}}
                hideTicks={leftHideTicks}
                numTicks={getNumberTicks(chartHeight)}
                stroke={getAxisStrokeColor(darkmode)}
                tickLength={3} />
            
            <AxisBottom
                left={moveBottomToLeft ? leftStart : 0}
                tickComponent={({x,y,formattedValue}) => bottomHideTickLabels ? null : <ConditionApplicationLabel x={x} y={y} tag={formattedValue} textProps={bottomTickLabelProps} />}
                top={topStart}
                label={bottomLabel}
                hideTicks={bottomHideTicks}
                labelProps={{fontSize: "0.8rem", verticalAnchor:"middle", textAnchor :"middle", dy:5, width : 0.8 * chartWidth, fill : darkmode ? "#FFFFFF" : "#000000"}}
                tickLabelProps={{ fontSize: "0.8rem", dy : -2, verticalAnchor: "middle", ...bottomTickLabelProps }}
                labelOffset={16}
                tickLineProps={{stroke : darkmode ? "#FFFFFF" : "#000000"}}
                numTicks={getNumberTicks(chartWidth)}
                scale={bottomScale}
                stroke={getAxisStrokeColor(darkmode)}
                tickLength={3}
                />

            
        </g>
    )
}


function areEqual(prevProps, nextProps) {
    /*
    return true if passing nextProps to render would return
    the same result as passing prevProps to render,
    otherwise return false
    */
    if (prevProps.bottomScale !== nextProps.bottomScale) return false 
    if (prevProps.leftScale !== nextProps.leftScale) return false 

    if (prevProps.chartHeight !== nextProps.chartHeight) return false 
    if (prevProps.chartWidth !== nextProps.chartWidth) return false

    if (prevProps.darkmode !== nextProps.darkmode) return false
    //if (!_.isEqual(prevProps.p,nextProps.p)) return false 
    // if (!_.isEqual(prevProps.xscale.domain,nextProps.xscale.domain)) return false 
    return true
}


export default React.memo(XYAxisWithBackground, areEqual)