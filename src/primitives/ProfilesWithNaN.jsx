


import _ from "lodash"
import { isInRange } from "../utils/inrange" 
import React from "react"
import PropTypes from "prop-types"
import { isPropHexColorString } from "../types/checks/color"
const isValidNumber = value => Number.isFinite(value)

function buildPolylineSegments(ds) {
    const segments = []
    const singlePoints = []

    let current = []

    const flush = () => {
        if (current.length > 1) {
            segments.push(current)
        } else if (current.length === 1) {
            singlePoints.push(current[0])
        }
        current = []
    }

    ds.forEach(d => {
        const valid =
            isValidNumber(d.x) &&
            isValidNumber(d.y) &&
            d.valid

        if (valid) {
            current.push(d)
        } else {
            flush()
        }
    })

    flush()

    return { segments, singlePoints }
}


ProfilesWithNaN.propTypes = {
    stroke: isPropHexColorString,
    strokeWidth : PropTypes.number
 }


function ProfilesWithNaN({
    data,
    xScale,
    yScale,
    stroke = "#000000",
    xaxisName,
    yaxisName,
    fill = "none",
    strokeWidth = 2,
    showPoints = true,
    includeXs = [],
    rerenderDependency = []}) { 
    const [minX, maxX] = xScale.domain()
    const [maxY, minY] = yScale.domain()
    const yRange = [minY, maxY]
    // const xRange = [minX, maxX]

    // const isXInRange = d => isInRange({ value: d[xaxisName], range: xRange })
    const isYInRange = d => isInRange({ value: d[yaxisName], range: yRange })
    const dscontrolled = includeXs.map(xName => { 
        const di = data.find(d => d[xaxisName] === xName)
        if (di) {
            return { y: yScale(di[yaxisName]), x : xScale(di[xaxisName]), valid : isYInRange(di) }
        } else {
            return { y: NaN, x : xScale(xName), valid : false }
        }
    }
    )
    const ds = data.map(d => ({ y: yScale(d[yaxisName]), x : xScale(d[xaxisName]), valid : isYInRange(d) }))
    return <g>
        {[data].map((d, idx) => {
            const { segments, singlePoints } = buildPolylineSegments(dscontrolled)
            return (
                <g key={`${idx}-profile-line`}>
                    {segments.map((segment, i) => (
                            <polyline
                                key={i}
                                points={segment.map(p => `${p.x},${p.y}`).join(", ")}
                                stroke={stroke}
                                strokeWidth={strokeWidth}
                                fill={fill}
                            />
                        ))}
                    {showPoints &&
                        singlePoints.map((p, i) => (
                            <circle
                                key={i}
                                cx={p.x}
                                cy={p.y}
                                r={5}
                                fill="#fff"
                                stroke={stroke}
                            />
                        ))}
                    {showPoints &&
                        _.map([yaxisName], yName => {
                            const x = xScale(yName)
                            const y = yScale(d[yName])

                            if (!Number.isFinite(x) || !Number.isFinite(y)) {
                                return null
                            }

                            return (
                                <circle
                                    key={`${yName}-${idx}-profile-point`}
                                    cx={x}
                                    cy={y}
                                    r={5}
                                    fill="#fff"
                                    stroke={stroke}
                                />
                            )
                        })}
                </g>)
        })}</g>
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