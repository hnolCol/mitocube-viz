


import _ from "lodash"
import { isInRange } from "../utils/inrange" 
import React from "react"
import PropTypes from "prop-types"
import { isPropHexColorString } from "../types/checks/color"


function splitArrayByNaN({ ys  }) {
    const indices = _.range(ys.length)
    return _.reduce(indices, (acc, idx, index) => {

        const yIsNaN = _.isNaN(ys[idx]) 
        if (index === 0) acc.push([])
        if (yIsNaN) {
            acc.push([])
        } 
        else {
            acc.at(-1).push(idx)
        }
        return acc
     }, [])
}


/**
 * 
 * @param {Object} param0 
 * @param {Number[]} param0.ys
 * @param {Number[]} param0.xs
 * @param {Function} param0.yScale
 * @param {Function} param0.xScale
 * @returns 
 */
function SplitProfile({ ys, xs, yScale, xScale, stroke, strokeWidth }) {
    

    const ySplits = splitArrayByNaN({ ys })
    return (
        <g>
            {ySplits.map((split, idx) => {

                if (split.length === 1) return <circle
                    key={`${idx}`}
                    cx={xScale(xs[split[0]])}
                    cy={yScale(ys[split[0]])}
                    r={2}
                    fill={stroke} />
                
                const linePoints = split.map(i => ({ x: xScale(xs[i]), y: yScale(ys[i]) }))
                return <polyline key={`${idx}`} points={linePoints.map(p => `${p.x},${p.y}`).join(" ")}
                    fill="none"
                    stroke={stroke}
                    strokeWidth={strokeWidth} />
            })}
     </g>
 )}



ProfilesWithNaN.propTypes = {
    stroke: isPropHexColorString,
    strokeWidth : PropTypes.number
 }
ProfilesWithNaN.defaultProps = {
    stroke: "#000000",
    strokeWidth : 2
 }

function ProfilesWithNaN({
    data,
    xScale,
    yScale,
    stroke,
    xaxisName,
    yaxisName,
    strokeWidth,
    showPoints = true,
    rerenderDependency = []
}) { 


    const [minX, maxX] = xScale.domain()
    const [maxY, minY] = yScale.domain()
    const yRange = [minY, maxY]
    // const xRange = [minX, maxX]

    // const isXInRange = d => isInRange({ value: d[xaxisName], range: xRange })
    const isYInRange = d => isInRange({ value: d[yaxisName], range: yRange })
    return <g>

        <SplitProfile
            ys={data.map(d => d[yaxisName])}
            xs={data.map(d => d[xaxisName])}
            yScale={yScale}
            xScale={xScale}
            stroke={stroke}
            strokeWidth={strokeWidth} />
        
    </g>
}


function areEqual(prevProps, nextProps) {
    /*
    return true if passing nextProps to render would return
    the same result as passing prevProps to render,
    otherwise return false
    */
    if (prevProps.stroke !== nextProps.stroke) return false
    if (prevProps.strokeWidth !== nextProps.strokeWidth) return false
    if (!_.isArray(prevProps.rerenderDependency)) return false
    if (prevProps.rerenderDependency.length !== nextProps.rerenderDependency.length) return false 
    if (_.some(prevProps.rerenderDependency, (value,idx) => nextProps.rerenderDependency[idx] !== value)) return false 
    return true
  }
  export default React.memo(ProfilesWithNaN, areEqual);