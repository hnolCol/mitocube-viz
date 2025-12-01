import React from "react";
import PropTypes from 'prop-types';
import _ from "lodash";
import { isPropHexColorString } from "../types/checks/color"

Point.defaultProps = {
    r: 4,
    opacity: 0.95,
    fill: "red",
    stroke: "#262626",
    strokeWidth: 1,
    circleProps: {}
}


Point.propTypes = {
    idx: PropTypes.number,
    p: PropTypes.array.isRequired,
    r: PropTypes.number,
    opacity: PropTypes.number,
    fill: isPropHexColorString,
    strokeWidth: PropTypes.number,
    mouseOver: PropTypes.func,
    mouseOverParams: PropTypes.object
}
/**
 * @description Renders a point in a SVG. Utilizes memorization to avoid rerendering. Updates only 
 * if the radius, the fill, the opacity, or the coordinates change. 
 * @param {Object} props
 * @param {number} props.idx Index of the point
 * @param {Array} props.p Coordinates of the point [x,y]
 * @param {number} props.r Radius of the point
 * @param {number} props.opacity Opacity of the point
 * @param {string} props.fill Fill color of the point
 * @param {string} props.stroke Stroke color of the point
 * @param {number} props.strokeWidth Stroke width of the point
 * @param {Object} props.circleProps Additional properties to pass to the circle element
 * @param {function} props.mouseOver Mouse over event handler. The event, index and mouseOverParams are passed to the handler
 * @param {Object} props.mouseOverParams Additional parameters to pass to the mouse over event handler
 * @returns 
 */
function Point({idx, p, r, opacity,  fill, stroke, strokeWidth, circleProps, mouseOver, mouseOverParams}) {
    const xValue = p[0]
    const yValue = p[1]
    return( 
        <circle 
            key={`${idx}-pp`} 
            cx={xValue}  
            cy={yValue}  
            onMouseOver={_.isFunction(mouseOver)?e => mouseOver(e,idx,mouseOverParams):undefined}
            {...{
                opacity,
                fill,
                r,
                stroke,
                strokeWidth
            }}
            {...circleProps}/>
    )
  }

  function areEqual(prevProps, nextProps) {
    /*
    Return true if passing nextProps to render would return
    the same result as passing prevProps to render,
    otherwise return false. 
    Checks for radios, fill color, opacity and the point position. 
    */
    if (prevProps.r !== nextProps.r) return false 
    if (prevProps.fill !== nextProps.fill) return false 
    if (prevProps.opacity !== nextProps.opacity) return false 
    if (prevProps.p[0] !== nextProps.p[0]) return false
    if (prevProps.p[1] !== nextProps.p[1]) return false

    return true
  }
  export default React.memo(Point, areEqual);