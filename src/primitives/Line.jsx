

import React, { memo } from "react"
import PropTypes from "prop-types"
import { isPropHexColorString } from "../types/checks/color"
import _ from "lodash"

Line.propTypes = {
    x1: PropTypes.number.isRequired,
    y1: PropTypes.number.isRequired,
    x2: PropTypes.number.isRequired,
    y2: PropTypes.number.isRequired,
    stroke: isPropHexColorString,
    strokeWidth: PropTypes.number,
    rerenderDependency: PropTypes.array,
    opacity: PropTypes.number
}

Line.defaultProps = {
    stroke: "#000000",
    strokeWidth: 1,
    opacity : 1,
    rerenderDependency: []
}


function Line({x1, y1, x2, y2, stroke, strokeWidth, opacity, rerenderDependency, ...props }) { 
    if (!_.every([x1, y1, x2, y2], _.isNumber)) return null

    return (
        <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={stroke} strokeWidth={strokeWidth} opacity={opacity} {...props}/>
    )
}

function areEqual(prevProps, nextProps) {
    /*
    return true if passing nextProps to render would return
    the same result as passing prevProps to render,
    otherwise return false
    */
   
    if (_.some(prevProps.rerenderDependency, (value, idx) => nextProps.rerenderDependency[idx] !== value)) return false
    
    if (_.some(["x1", "y1", "x2", "y2"], key => prevProps[key] !== nextProps[key])) return false
    if (prevProps.opacity!== nextProps.opacity) return false
    if (prevProps.stroke !== nextProps.stroke) return false
    if (prevProps.strokeWidth !== nextProps.strokeWidth) return false
    return true
}


export default memo(Line, areEqual);