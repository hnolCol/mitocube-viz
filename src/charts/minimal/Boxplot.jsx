

import { useMemo } from "react";
import Box from "../../primitives/Box";
import { SVG } from "../base/SVG";
import PropTypes from "prop-types";
import { getChartWidthAndHeightWithMargins } from "../../utils/border";
import { scaleLinear } from "@visx/scale";
import { TextLabel } from "../../text/TextLabel";
import _ from "lodash"
import { Text } from "@visx/text";

MinimalBoxplot.propTypes = {
    q: PropTypes.object,
    boxWidth : PropTypes.number,
    width: PropTypes.number, 
    height: PropTypes.number,
    margins: PropTypes.object,
    rerender: PropTypes.arrayOf(PropTypes.number),
    showMedian: PropTypes.bool,
    medianSuffix: PropTypes.string,
    roundToDigits: PropTypes.number,
    yaxisLabel : PropTypes.string
}


MinimalBoxplot.defaultProps = {
    boxWidth : 30,
    width: 90, 
    height : 150,
    margins: {
        left: 20,
        right: 5,
        bottom: 5,
        top: 5
    },
    showMedian: true,
    medianSuffix: "",
    roundToDigits: 1,
    yaxisLabel : "value"
    
}
/**
 * 
 * 
 * @param {*} param0 
 * @returns 
 */
export function MinimalBoxplot({ q, boxWidth, width, height, margins, yaxisLabel , rerender, showMedian, medianSuffix, roundToDigits }) {
    
    const { chartHeight, chartWidth } = getChartWidthAndHeightWithMargins({ width, height, margins })
    const checkedBoxWidth = _.isNumber(boxWidth) && boxWidth < chartWidth ? boxWidth : chartWidth / 2
    const yScale = useMemo(() => { 
        return scaleLinear(
                {
                    domain: [q.max, q.min],
                    range: [margins.top, margins.top + chartHeight],
                    nice: true
                }
            )
        }, [chartHeight, rerender])
    return (
        <SVG {...{ width, height }}>

            <Box x={margins.left + checkedBoxWidth/2} q25={yScale(q.q1)} q75={yScale(q.q3)} max={yScale(q.max)} min={yScale(q.min)} median={yScale(q.median)} fill={"#efefef"} width={checkedBoxWidth} />
            {showMedian ? <TextLabel x={margins.left + checkedBoxWidth} dx={2} y={yScale(q.median)} labelTexts={[`${_.round(q.median, roundToDigits)} ${medianSuffix}`]} verticalAnchor={"middle"} textAnchor={"start"} totalYOffset={0} /> : null}
            <Text x={margins.left} dx={-4} y={chartHeight / 2} textAnchor="middle" verticalAnchor="end" angle={-90}>{yaxisLabel}</Text> 
        </SVG>
    )
}