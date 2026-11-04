import PropTypes from "prop-types"
import _ from "lodash"
import React from "react"
import { Text } from "@visx/text"
import { getStrokeColor } from "../colors/stroke"
import { getFillColor } from "../colors/fill"

ProfileLine.propTypes = {
    data : PropTypes.array.isRequired,
    valid : PropTypes.arrayOf(PropTypes.bool).isRequired, // boolean
    xaxisName : PropTypes.string.isRequired,
    yaxisName : PropTypes.arrayOf(PropTypes.string).isRequired,
    xScale : PropTypes.func.isRequired,
    yScale : PropTypes.func.isRequired,
    rerenderDependency : PropTypes.array.isRequired
}


function ProfileLine({
    data = [], 
    valid = [], 
    xaxisName, 
    yaxisName,
    sizeName,
    colorName, 
    labelNames = [],
    xScale, 
    yScale, 
    sizeScale, 
    colorScale, 
    fill = "none",
    stroke, 
    strokeWidth = 2,
    darkmode = false, 
    rerenderDependency = [], 
    searchIndices = new Set() ,
    filterIndices = new Set(),
    showPoints = true}) {

    const halfBandWidth = xScale.bandwidth() / 2
    const strokeColor = stroke !== undefined ? stroke : getStrokeColor(darkmode)
    return(
        <g>
            {data.map((d, idx) => <g key={`${idx}-profile-line`}>
                <polyline
                    points={_.join(_.map(yaxisName, yName => `${xScale(yName)+halfBandWidth},${yScale(d[yName])}`), ", ")}
                    {...{ stroke: strokeColor, strokeWidth, fill }} />
                {showPoints ? _.map(yaxisName, yName => <circle {...{
                    cx: xScale(yName) + halfBandWidth,
                    cy: yScale(d[yName]),
                    r: 5,
                    fill: darkmode ? "#2b2b2b" : "#fff",
                    stroke: strokeColor
                }} />) : null
                }
                {labelNames.length > 0 && yaxisName.length > 0 ?
                    <Text
                        x={xScale(yaxisName.at(-1))}
                        y={yScale(yScale.domain().at(-1))}
                        dy={-8}
                        textAnchor="end"
                        verticalAnchor="middle"
                        fill={getFillColor(darkmode)}>
                        {_.join(_.map(labelNames, labelName => d[labelName]), ", ")}
                    </Text> : null}
            </g>)}



        </g>
    )
}

function areEqual(prevProps, nextProps) {
    /*
    return true if passing nextProps to render would return
    the same result as passing prevProps to render,
    otherwise return false
    */
    if (prevProps.darkmode !== nextProps.darkmode) return false
    if (!_.isArray(prevProps.rerenderDependency)) return false
    if (prevProps.rerenderDependency.length !== nextProps.rerenderDependency.length) return false 
    if (_.some(prevProps.rerenderDependency, (value,idx) => nextProps.rerenderDependency[idx] !== value)) return false 
    return true
  }
  export default React.memo(ProfileLine, areEqual);