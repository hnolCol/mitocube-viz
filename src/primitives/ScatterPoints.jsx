import PropTypes from "prop-types"
import _ from "lodash"
import React from "react"
import { isPropHexColorString } from "../types/checks/color"
import { isPropSet } from "../types/checks/set"
import { isInRange } from "../utils/inrange" 



const getCircle = ({
    // data props
    idx,
    d,
    // axis/scale props
    xaxisName,
    yaxisName,
    xScale,
    yScale,
    // size props
    sizeName,
    sizeScale,
    scaleSize = 1,
    // color props
    colorName,
    colorScale,
    colorScaleValid,
    colorScaleDefined,
    colorMap,
    colorMapKeyName,
    checkColorMap,
    fill,
    // glyph/polygon props
    glyphMap,
    polyMapKeyName,
    checkPolyMap,
    // style props
    stroke,
    strokeWidth,
    opacity,
    // misc props
    props}) => {
    if (!checkPolyMap || !_.has(d,polyMapKeyName) || !_.has(glyphMap,d[polyMapKeyName]) || glyphMap[d[polyMapKeyName]] === "circle") return <circle 
    //dont use opacity, very very slow on safari, instead fillOpacity and strokeOpacity 
        key={`${idx}-sc-p`}
        cx={xScale(d[xaxisName])} 
        cy={yScale(d[yaxisName])} 
        r={sizeScale(d[sizeName]) * scaleSize} 
        fillOpacity={opacity}
        strokeOpacity={opacity}
        {...{
            fill : checkColorMap && _.has(colorMap, d[colorMapKeyName]) ? colorMap[d[colorMapKeyName]]: colorScaleDefined && colorScaleValid ? colorScale(d[colorName]) : fill,
            stroke,
            strokeWidth,
            ...props
            }} />
    
    if (glyphMap[d[polyMapKeyName]] === "rect") {
        const width = (sizeScale(d[sizeName]) * 2.2) * scaleSize
        return <rect
            key={`${idx}-sc-rect`}
            x={xScale(d[xaxisName]) - width / 2}
            y={yScale(d[yaxisName]) - width / 2}
            width={width}
            height={width}
            {... {
            fill: checkColorMap && _.has(colorMap, d[colorMapKeyName]) ? colorMap[d[colorMapKeyName]] : colorScaleDefined && colorScaleValid ? colorScale(d[colorName]) : fill,
            stroke,
            rx: 2,
            fillOpacity: opacity,
            strokeOpacity : opacity,
            strokeWidth, ...props}} />
    }   
}

ScatterPoints.propTypes = {
    data : PropTypes.array.isRequired,
    valid : PropTypes.arrayOf(PropTypes.bool).isRequired, // boolean
    xaxisName : PropTypes.string.isRequired,
    yaxisName : PropTypes.string.isRequired,
    xScale : PropTypes.func.isRequired,
    yScale: PropTypes.func.isRequired,
    colorScale: PropTypes.func.isRequired,
    sizeScale: PropTypes.func.isRequired,
    fill: isPropHexColorString,
    stroke: isPropHexColorString,
    rerenderDependency: PropTypes.array.isRequired,
    filterIndices: isPropSet,
    searchIndices: isPropSet, 
    colorMap : PropTypes.objectOf(isPropHexColorString),
    glyphMap : PropTypes.objectOf(PropTypes.oneOf(["rect","circle"]))
}
ScatterPoints.defaultProps = {
    data: [],
    valid: [],
    indices: undefined,
    sizeName: undefined,
    colorName: undefined,
    fill: "#efefef",
    stroke: "#000000",
    strokeWidth: 0.5,
    searchStrokeWidth: 1.0,
    checkColorMap: false,
    colorMap: { pathway: "#79c29e" },
    colorMapKeyName: "node_type",
    glyphMap: { pathway: "rect" },
    checkPolyMap: false,
    polyMapKeyName: "node_type",
    rerenderDependency: [],
    searchIndices: new Set(),
    filterIndices: new Set()
};

/**
 * 
 * @param {Object} props The properties of the JSX Component. The Component only rerenders if the the rerenderDependency array changes and is intended to be used
 * for big datasets. Hence, you have to make sure to alter the rerenderDepency values to obtain a proper rerender. This is also the case if any of the scales is updated.
 * @param {Object[]} props.data - The data array 
 * @param {Boolean[]} props.valid - An array of Booleans indicating if the data row is valid. 
 * @param {String} props.xaxisName - The keyName of the x-axis value. Must be present in all items of data. 
 * @param {String} props.yaxisName - The keyName of y-axis value. Must be present in all items if the data. 
 * @param {String} props.colorName - The keyName to be used to access the color. ```data[idx][colorName]``` will be send to the colorScale function to get the color for each point. 
 * @param {String} props.sizeName - The keyName to be used to acces the size /radius of the scatter points. ```data[idx][sizeName]```will be used to call the sizeScale for each item in the data array. 
 * @param {Function} props.xScale - The scale for the x axis, a function that returns the pixel by the data value 
 * @param {Function} props.yScale - The scale for the y-axis, a function that returns the pixel by the data value
 * @param {Function} props.sizeScale - Function that returns a size based on the value given in sizeName. If the 
 * @param {Function} props.colorScale - The scale that returns a number for the radius of scatter points by value in data array accessed by the colorName 
 * @param {String} props.fill - The hex color to fill the scatter points. Is ignored if ```colorName``` is not undefined and ```colorScale```is a function
 * @param {Boolean} props.checkColorMap - If the colorMap should be checked for a matching key. 
 * @param {Object.<string,string>} props.colorMap - Key - hexColor maps to be used instead of the colorScale. Will be ignored if checkColorMap is 'false'
 * @param {String} props.stroke - The hex color code for the stroke of the scatter points.  
 * @param {Number} props.strokeWidth - The strokewidth of the scatter points.   
 * @param {Array} props.rerenderDependency - An array with value that is checked and if it changed, the component will rerender, otherwise not. 
 * @param {Set} props.searchIndices - A set of indices. The indices that match will be displayed at opacity 1 and non matching will be using 0.2 
 * @param {Set} props.filterIndices - A set of indices. The indices that match will be shown, others will be omitted. 
 * @returns The JSX Component as a SVG group. 
 */
function ScatterPoints({
    data = [], 
    valid = [], 
    indices,
    xaxisName, 
    yaxisName, 
    sizeName, 
    colorName, 
    xScale, 
    yScale, 
    sizeScale, 
    colorScale, 
    fill = "#efefef",
    stroke = "#000000", 
    strokeWidth = 0.5,
    searchStrokeWidth = 1.0,
    checkColorMap = false,
    colorMap = { "pathway": "#79c29e" },
    colorMapKeyName = "node_type",
    glyphMap = { "pathway": "rect" },
    checkPolyMap = false,
    polyMapKeyName = "node_type",
    rerenderDependency = [], 
    defaultOpacity = 0.8,
    searchIndices = new Set() ,
    filterIndices =  new Set()}){
 
    const filterByIdx = filterIndices.size !== 0
    const opacityBySearch = searchIndices.size !== 0

    const colorScaleDefined = colorName !== undefined && _.has(data[0], colorName) && _.isFunction(colorScale)

    const [minX, maxX] = xScale.domain()
    const [maxY, minY] = yScale.domain()
    const yRange = [minY, maxY]
    const xRange = [minX, maxX]

    // let validIdcs = indices === undefined ?
    //     _.range(data.length).filter(idx => valid[idx] && isInRange({ value: data[idx][xaxisName], range: xRange }) && isInRange({ value: data[idx][yaxisName], range: yRange})) :
    //     Array.from(indices).filter(idx => valid[idx] && isInRange({ value: data[idx][xaxisName], range: xRange }) && isInRange({ value: data[idx][yaxisName], range: yRange }))
    
    const validIdcs = []

    const candidateIndices = indices === undefined ? 
        null : 
        indices

    if (candidateIndices === null) {
        for (let idx = 0; idx < data.length; idx++) {
            const d = data[idx]

            if (
                valid[idx] &&
                isInRange({ value: d[xaxisName], range: xRange }) &&
                isInRange({ value: d[yaxisName], range: yRange })
            ) {
                validIdcs.push(idx)
            }
        }
    } else {
        for (const idx of candidateIndices) {
            const d = data[idx]

            if (
                valid[idx] &&
                isInRange({ value: d[xaxisName], range: xRange }) &&
                isInRange({ value: d[yaxisName], range: yRange })
            ) {
                validIdcs.push(idx)
            }
        }
    }

    const opacity = opacityBySearch ? 0.3 : defaultOpacity
    let normalIndices
    let highlightIndices

    if (!opacityBySearch && !filterByIdx) {
        // fastest path: nothing to split
        normalIndices = validIdcs
        highlightIndices = []
    } else {
        normalIndices = []
        highlightIndices = []

        for (const idx of validIdcs) {
            if (filterByIdx && !filterIndices.has(idx)) continue

            if (opacityBySearch && searchIndices.has(idx)) {
                highlightIndices.push(idx)
            } else {
                normalIndices.push(idx)
            }
        }
    }
    
    return(
        <g>
            {normalIndices.map(idx => {
                const d = data[idx]
                // if (!valid[idx]) return null 
                const colorScaleValid = colorScaleDefined ? _.isString(colorScale(d[colorName])) : false
                return getCircle({
                    idx,
                    d,
                    colorScaleValid,
                    props: {strokeWidth, fillOpacity : opacity, strokeOpacity : opacity},
                    scaleSize: 1.0,
                    glyphMap,
                    polyMapKeyName,
                    checkPolyMap,
                    xScale,
                    yScale,
                    colorScale,
                    checkColorMap,
                    colorScaleDefined,
                    xaxisName,
                    yaxisName,
                    sizeName,
                    colorMap,
                    colorMapKeyName,
                    fill,
                    stroke,
                    strokeWidth,
                    opacity,
                    sizeScale,
                    colorName
                })
            })}
            {opacityBySearch ? highlightIndices.map(idx => {
                if (!valid[idx]) return null 
                const d = data[idx]
                const colorScaleValid = colorScaleDefined ? _.isString(colorScale(d[colorName])) : false
                return getCircle({
                    idx,
                    d,
                    colorScaleValid,
                    props: {strokeWidth : searchStrokeWidth, fillOpacity : 1.0, strokeOpacity : 1.0},
                    scaleSize: 1.15,
                    glyphMap,
                    polyMapKeyName,
                    checkPolyMap,
                    xScale,
                    yScale,
                    colorScale,
                    checkColorMap,
                    colorScaleDefined,
                    xaxisName,
                    yaxisName,
                    sizeName,
                    colorMap,
                    colorMapKeyName,
                    fill,
                    stroke,
                    strokeWidth,
                    opacity,
                    sizeScale,
                    colorName
                })
            })
                : null}
        </g>
    )
}



function areEqual(prevProps, nextProps) {
    /*
    return true if passing nextProps to render would return
    the same result as passing prevProps to render,
    otherwise return false
    */
    if (!_.isArray(prevProps.rerenderDependency)) return false
    if (prevProps.rerenderDependency.length !== nextProps.rerenderDependency.length) return false 
    if (_.some(prevProps.rerenderDependency, (value,idx) => nextProps.rerenderDependency[idx] !== value)) return false 
    return true
  }
  export default React.memo(ScatterPoints, areEqual);