

import { useMemo } from "react";
import Box from "../../primitives/Box";
import { SVG } from "../base/SVG";
import PropTypes from "prop-types";
import { getChartWidthAndHeightWithMargins } from "../../utils/border";
import { scaleLinear } from "@visx/scale";
import { TextLabel } from "../../text/TextLabel";
import _ from "lodash"
import { Text } from "@visx/text";
import { abbreviateNumber } from "../../transforms/numbers";

MinimalBoxplots.propTypes = {
    qs: PropTypes.arrayOf(PropTypes.object),
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


MinimalBoxplots.defaultProps = {
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
export function MinimalBoxplots({ qs, boxWidth, width, height, margins, yaxisLabel, rerender, showMedian, medianSuffix, roundToDigits, preYScale, fill = "#efefef", spaceBetween = 10, indicateN = true, verticalLineAtZero = true, xtickLabels = [] }) {
    const { chartHeight, chartWidth } = getChartWidthAndHeightWithMargins({ width, height, margins })
    const checkedBoxWidth = _.isNumber(boxWidth) && boxWidth < chartWidth ? boxWidth : chartWidth / qs.length
    const fills = _.isArray(fill) && fill.length === qs.length ? fill : qs.map(() => fill)

    abbreviateNumber
    const yScale = useMemo(() => {
        if (_.isFunction(preYScale)) return preYScale
        const max = _.maxBy(qs, (q) => q.max).max
        const min = _.minBy(qs, (q) => q.min).min

        return scaleLinear(
            {
                domain: [max, min],
                range: [margins.top, margins.top + chartHeight],
                nice: true
            }
        )
    }, [chartHeight, rerender])

    console.log(xtickLabels)

    return (
        <SVG {...{ width, height }}>

            {verticalLineAtZero ? <line x1={margins.left} x2={margins.left + chartWidth} y1={yScale(0)} y2={yScale(0)} stroke={"#000000"} strokeWidth={1} /> : null}

            {qs.map((q, i) => {
                return <Box key={`boxplot-${i}`} x={margins.left + checkedBoxWidth / 2 + (i * checkedBoxWidth) + (i * spaceBetween) } q25={yScale(q.q25)} q75={yScale(q.q75)} max={yScale(q.max)} min={yScale(q.min)} median={yScale(q.m)} width={checkedBoxWidth} fill={fills[i]} />
            })}
            {xtickLabels.map((label, i) => <Text key={`boxplot-xtick-${i}`} x={margins.left + checkedBoxWidth / 2 + (i * checkedBoxWidth) + (i * spaceBetween)} y={height - margins.bottom} dy={0} fontSize={10} verticalAnchor={"middle"} textAnchor={"end"} angle={-90}  totalYOffset={0}>{label}</Text>)}
            {indicateN ? qs.map((q, i) => <Text
                key={`idnicate-n-boxplot${i}`}
                x={margins.left + checkedBoxWidth / 2 + (i * checkedBoxWidth) + (i * spaceBetween)}
                y={yScale(q.max)}
                dy={-4}
                verticalAnchor={"bottom"}
                textAnchor={"middle"}
                totalYOffset={0}>{abbreviateNumber(q.N)}</Text>) : null}
            
            {showMedian ? qs.map((q, i) => <TextLabel key={`boxplot-median-${i}`} 
                x={margins.left + checkedBoxWidth / 2 + (i * checkedBoxWidth) + (i * spaceBetween)}
                dx={2}
                y={yScale(q.m)}
                labelTexts={[`${_.round(q.m, roundToDigits)} ${medianSuffix}`]} verticalAnchor={"middle"} textAnchor={"start"} totalYOffset={0} />) : null}
            <Text x={margins.left} dx={-8} y={chartHeight / 2} textAnchor="middle" verticalAnchor="end" angle={-90}>{yaxisLabel}</Text>
        </SVG>
    )
}